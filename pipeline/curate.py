#!/usr/bin/env python3
"""curation 審核 CLI：審 run_loop 產出的 curation queue，approve → 安全 compile 進 db.js。

狀態機（queue 條目 compile_status）：pending → approved / rejected / deferred →（compile）→ compiled。
人工 review 是 operator 綁定的把關（看 operator 標註＋claims 引文，不對就 reject）。compile 只處理 approved：
  · 以 **source_id 為單位 upsert** claims（保留其他來源/人工 claims），不整包覆蓋（守住既有資料）。
  · 含 attributed-to 者需 `--yes`（profile：歸因需人工核可）。
  · 只升級**已策展**的 source＋actor；deferred＝「先請人補 db.sources/registry 再回來審」。本工具不自動新增骨幹。
用法：
  python3 pipeline/curate.py list [--all]
  python3 pipeline/curate.py show <raw_id>
  python3 pipeline/curate.py approve|reject|defer <raw_id> [--note "…"]
  python3 pipeline/curate.py compile [--yes] [--dry-run]
"""
import argparse, hashlib, importlib.util, json, pathlib, re, types

_here = pathlib.Path(__file__).resolve().parent
def _load(n):
    s = importlib.util.spec_from_file_location(n, str(_here / (n + ".py")))
    m = importlib.util.module_from_spec(s); s.loader.exec_module(m); return m
rl = _load("run_loop")
_urlnorm = _load("urlnorm")
pipe = _load("pipeline")
REG = pipe._derive_mod().load_registry()
DBP = _here.parent / "data" / "db.js"

def _norm(s): return re.sub(r"[\s\W]+", "", (s or "").lower())

def load_db():
    src = DBP.read_text(encoding="utf-8")
    i = src.index("{", src.index("window.NETWEAVER_DB")); j = src.rindex("}")
    return src, i, j, json.loads(src[i:j + 1])

def save_db(src, i, db):
    end = json.JSONDecoder().raw_decode(src, i)[1]           # 原 DB 物件的精確結尾 → 保留其後內容（footer/;），不截斷
    new = src[:i] + json.dumps(db, ensure_ascii=False, indent=2) + src[end:]
    tmp = DBP.with_name(DBP.name + ".tmp")
    tmp.write_text(new, encoding="utf-8"); tmp.replace(DBP)  # 原子換檔，避免寫到一半毀檔

def doc_text(relpath):
    """由 extractions/<src>/<raw_id>.extraction.json ↔ raw/<src>/<raw_id>.json 的路徑對應取正文。
    取不到就回 ""——退回未擴張的舊行為，不讓 compile 因缺正文而失敗。"""
    rp = pathlib.Path(relpath)
    mp = rl.RAW / rp.parent.name / (rp.name.split(".")[0] + ".json")
    if not mp.exists(): return ""
    try: return rl.resolve_text(mp, json.loads(mp.read_text(encoding="utf-8")))[0]
    except Exception: return ""

def project_extraction(relpath):
    """一次讀取 → (sl, project, extr, attributed-to 數, digest, validate fails)。digest／att／validity 都由同一份
    載入內容現算（不吃 queue cache、無 TOCTOU）。"""
    extr = json.loads((_here.parent / relpath).read_text(encoding="utf-8"))
    text = doc_text(relpath)                                # 有正文才擴張句界／開宣稱閘（呈現層）
    bundle, sl, _ = pipe.stix_from_extraction(extr, REG)    # derive 只看模型原始 span
    fails, att = pipe.validate(bundle)
    rec = pipe.project(bundle, text=text)
    return sl, rec, extr, len(att), rl.publication_digest(extr, rec["claims"]), list(fails)

def _upsert(ent, new_claims, source_ids):
    """以 source_id 為單位替換該來源 claims；其他來源/人工 claims **原樣保留**（不去重、不動）。
    只對 new_claims 去空文字＋同來源同文字去重，且只寫屬於 source_ids 的 claim（防呆）。"""
    kept = [c for c in ent.get("claims", []) if c.get("source_id") not in source_ids]
    seen, fresh = set(), []
    for c in new_claims:
        t = _norm(c.get("text"))
        if c.get("source_id") not in source_ids or not t: continue
        key = (c.get("source_id"), t)
        if key in seen: continue
        seen.add(key); fresh.append(c)
    ent["claims"] = kept + fresh
    return len(ent["claims"])

def _flags(e):
    return ((" src✓" if e.get("source_curated") else " src✗")
            + (f" actor:{e['actor_registered']}" if e.get("actor_registered") else " actor✗")
            + (" ⚠attributed" if e.get("attributed_to") else "") + ("" if e.get("valid") else " ⚠invalid"))

# ---------- 指令 ----------

def cmd_list(args):
    q = rl.load_queue()
    rows = [e for e in q.values() if args.all or e.get("compile_status", "pending") == "pending"]
    if not rows:
        print("（無" + ("" if args.all else " pending") + "項目）"); return 0
    print(f"{'raw_id':<10}{'status':<11}{'claims':>7}  operator / title")
    for e in sorted(rows, key=lambda x: (x.get("compile_status", "pending"), x.get("source_id") or "")):
        print(f"{e['raw_id']:<10}{e.get('compile_status','pending'):<11}{e.get('claims',0):>7}  "
              f"{(e.get('operator') or '—')[:30]}｜[{e.get('source_id')}] {(e.get('title') or '')[:30]}"
              + _flags(e))
    return 0

def cmd_show(args):
    q = rl.load_queue(); e = q.get(args.raw_id)
    if not e: raise SystemExit(f"queue 無此 raw_id：{args.raw_id}")
    print(json.dumps({k: e[k] for k in e if k != "extraction"}, ensure_ascii=False, indent=2))
    print(f"\nextraction: {e['extraction']}")
    try:
        _su, ent_ids = rl.load_db()
        sl, rec, _extr, att, _dg, fails = project_extraction(e["extraction"])
        op_ref = rl.operator_ref(sl, ent_ids)
        print(f"projected operator: {rec['operator'].get('name')}｜歸屬 nw_ref: {op_ref}"
              f"｜attributed-to: {att}｜valid: {not fails}")
        print(f"claims（{len(rec['claims'])}）：")
        for c in rec["claims"]:
            print(f"  · [{c['about']}] 「{c['quote'][:80]}」\n    source: {c['source']}")
    except Exception as ex:
        print(f"⚠ 無法投影 extraction：{type(ex).__name__}: {ex}")
    return 0

def cmd_set(args):
    q = rl.load_queue()
    if args.raw_id not in q: raise SystemExit(f"queue 無此 raw_id：{args.raw_id}")
    e = q[args.raw_id]
    if e.get("compile_status") == "compiled":
        # 已發布的項目原則上凍結；唯一例外是「要發布的內容真的變了」（重抽或碼層更新），
        # 此時擋住反而讓 db.js 永遠停在舊內容——開放重審，且仍要人再按一次 approve。
        try: _s2, _r2, _e2, _a2, now_digest, _f2 = project_extraction(e["extraction"])
        except Exception: now_digest = e.get("extraction_digest")
        gap = {}
        try:
            _s3, _i3, _e3, _db3 = load_db(); gap = backfill_gap(_r2, _db3)
        except Exception: pass
        if now_digest == e.get("extraction_digest") and not gap:
            raise SystemExit(f"{args.raw_id} 已 compiled 且內容未變；如需重審請重跑 loop")
        why = (f"投影內容已變（{e.get('extraction_digest')} → {now_digest}）" if now_digest != e.get("extraction_digest")
               else f"名冊已擴充，可回填 {sum(gap.values())} 條到 {len(gap)} 個實體")
        print(f"⚠ {args.raw_id} 已 compiled，但{why} → 開放重審")
    if args.status == "approved":
        # approve＝以「當下 registry」重新投影，鎖定歸屬與 digest（compile 據此比對）。
        # 這也是 defer→補 registry→approve 的重綁入口：重審時會抓到新登錄的 actor。
        try:
            _su, ent_ids = rl.load_db()
            sl, _rec, _extr, att, digest, fails = project_extraction(e["extraction"])
        except Exception as ex:
            raise SystemExit(f"無法投影 extraction：{type(ex).__name__}: {ex}")
        op_ref = rl.operator_ref(sl, ent_ids)
        # 放寬：不再硬要 operator。claims 依 about 分掛各實體，只要有「已登錄的相關單位」可掛就能核可。
        _s, _i, _j, _db = load_db()
        name2ent = {}
        for ent in _db["entities"]:
            for nm in [ent.get("name_zh"), ent.get("name_en")] + (ent.get("aliases") or []):
                if nm: name2ent.setdefault(_norm(nm), ent)
        has_target = any(name2ent.get(_norm(c.get("about"))) for c in _rec["claims"])
        if op_ref is None and not has_target:
            raise SystemExit(f"{args.raw_id} 沒有任何已登錄的相關單位可掛內容 → 先登錄這篇主要在講的單位，再核可")
        e.update({"actor_registered": op_ref, "extraction_digest": digest,
                  "attributed_to": att, "valid": not fails})
    e["compile_status"] = args.status
    if args.note: e["note"] = args.note
    rl._write_queue(q)
    print(f"✓ {args.raw_id} → {args.status}"
          + (f"｜歸屬 {e.get('actor_registered')}" if args.status == "approved" else "")
          + (f"（{args.note}）" if args.note else ""))
    return 0

def _db_indices(db):
    url2sid = _urlnorm.index_by_url(db["sources"])
    name2ent = {}
    for ent in db["entities"]:
        for nm in [ent.get("name_zh"), ent.get("name_en")] + (ent.get("aliases") or []):
            if nm: name2ent.setdefault(_norm(nm), ent)
    return url2sid, name2ent

def backfill_gap(rec, db):
    """這篇若以**現在的名冊**重編，會新增哪些 claim → {entity_id: 條數}。

    登錄名冊的動機通常正是「在某篇報告裡看到這個行為者」——而那篇往往早已 compiled。
    抽取內容沒變，publication_digest 也就沒變，但該發布的內容確實變了（名冊擴充了）。
    沒有這個判斷，新登錄的實體會停在 0 條 claim，檔案頁看起來像空的。
    """
    url2sid, name2ent = _db_indices(db)
    have = {}
    for ent in db["entities"]:
        for c in ent.get("claims", []):
            have.setdefault(ent["id"], set()).add(_norm(c["text"]))
    gap = {}
    for c in rec["claims"]:
        sid = url2sid.get(_urlnorm.source_key(c["source"]))
        ent = name2ent.get(_norm(c.get("about")))
        if not sid or not ent: continue
        if _norm(c["quote"]) not in have.get(ent["id"], set()):
            gap[ent["id"]] = gap.get(ent["id"], 0) + 1
    return gap

AUTO_SENSITIVE = {"domestic-named"}                       # 這些實體不自動長內容（台灣具名媒體／個人）

def auto_gate(rec, att, fails, source_curated, org, name2ent, publishers):
    """自動發布的四道閘 → 回 (ok, reason, hits)。

    設計前提：**人審名冊、模型填內容**。名冊（db.entities）與出版方信任是人的決定，模型只能在那個
    範圍內產生內容；任何會擴張範圍或碰紅線的情形一律不自動化，留在佇列等人。
    """
    if fails: return False, f"bundle 不合法（{len(fails)} 項不變量）", []
    if att: return False, f"含 attributed-to×{att} → 歸因永遠人工核可", []
    org = (org or "").strip()
    if not source_curated and org not in publishers:
        return False, f"出版方「{org or '未知'}」未經 governance 核可 → 先登錄來源", []
    hits, sens = [], []
    for c in rec["claims"]:
        ent = name2ent.get(_norm(c.get("about")))
        if not ent: continue
        if ent["id"] not in [h["id"] for h in hits]: hits.append(ent)
    if not hits:
        return False, "沒有任何 claim 掛得上已登錄實體 → 先審名冊", []
    sens = [e["id"] for e in hits if e.get("sensitivity") in AUTO_SENSITIVE]
    if sens:
        return False, f"掛到敏感實體（{'、'.join(sens)}）→ 需人工確認", hits
    return True, f"掛 {len(hits)} 個已登錄實體", hits

def cmd_auto(args):
    """掃 pending 項目，過閘的自動核可＋發布；其餘留在佇列並記下原因。

    走的是 `cmd_set`／`cmd_compile` 同一條安全路徑（digest 鎖定、歸屬重算比對、source-scoped
    upsert），不另開捷徑——自動化只是省掉「人按下去」，不是省掉檢查。
    """
    reg_mod = _load("register")
    q = rl.load_queue()
    _s, _i, _e, db = load_db()
    pending = [e for e in q.values() if e.get("compile_status") == "pending"]
    backfill = []                                            # 已發布、但名冊擴充後可補內容的
    for e in q.values():
        if e.get("compile_status") != "compiled": continue
        try:
            _sl, rec, _x, _a, _d, _f = project_extraction(e["extraction"])
            if backfill_gap(rec, db): backfill.append(e)
        except Exception: pass
    if not pending and not backfill:
        print("（無 pending 項目，名冊也沒有可回填的）"); return 0
    pending = pending + backfill
    publishers = reg_mod._publishers(db)
    name2ent = {}
    for ent in db["entities"]:
        for nm in [ent.get("name_zh"), ent.get("name_en")] + (ent.get("aliases") or []):
            if nm: name2ent.setdefault(_norm(nm), ent)
    published, held = [], []
    print("=== auto（人審名冊、模型填內容；碰紅線或碰不到名冊者留給人）===")
    if backfill: print(f"  （{len(backfill)} 篇已發布項目因名冊擴充而可回填，一併處理）")
    for e in pending:
        rid = e["raw_id"]
        try:
            _sl, rec, extr, att, _digest, fails = project_extraction(e["extraction"])
        except Exception as ex:
            held.append((rid, f"投影失敗 {type(ex).__name__}")); continue
        rep = extr.get("report", {})
        # 現算來源是否已登錄：queue 的 source_curated 是抽取當下的快照，登錄過後就過期了
        curated = _urlnorm.source_key(e.get("url")) in _urlnorm.index_by_url(db["sources"])
        ok, why, _hits = auto_gate(rec, att, fails, curated, rep.get("org"), name2ent, publishers)
        if not ok:
            held.append((rid, why)); continue
        if args.dry_run:
            published.append((rid, f"dry-run｜{why}"
                                  + ("" if curated else "；會先自動登錄本篇來源"))); continue
        try:
            if not curated:                              # 出版方已經人工信任 → 逐篇來源是機械動作，自動補
                ns = types.SimpleNamespace(url=rep.get("url") or e.get("url"), org=rep.get("org"),
                                           title=rep.get("name") or e.get("title"),
                                           type=rep.get("type") or "ngo-report",
                                           date=rep.get("published"), id=None)
                reg_mod.cmd_add_source(ns)
            cmd_set(types.SimpleNamespace(raw_id=rid, status="approved", note="auto"))
            cmd_compile(types.SimpleNamespace(raw_id=rid, yes=False, dry_run=False))
            published.append((rid, why))
        except SystemExit as ex:
            held.append((rid, f"發布未過：{ex}"))
    for rid, why in published: print(f"  ✓ 自動發布 {rid}｜{why}")
    for rid, why in held:      print(f"  ⟳ 留給人  {rid}｜{why}")
    print(f"--- 自動發布 {len(published)}｜留給人 {len(held)} ---")
    if args.dry_run: print("（dry-run：未寫 db.js/queue）")
    return 0

def cmd_compile(args):
    """compile approved 項目。給 raw_id 就**只**處理該篇。

    單篇發布（後台一鍵）必須指名，否則會連帶把佇列裡其他 approved 一起發布；`--yes`（歸因人工閘）
    的效力也就跟著擴散到操作者沒在看的項目上。CLI 不給 raw_id 時維持處理全部 approved 的舊行為。
    """
    q = rl.load_queue()
    only = getattr(args, "raw_id", None)
    if only and only not in q: raise SystemExit(f"queue 無此 raw_id：{only}")
    approved = [e for e in q.values() if e.get("compile_status") == "approved"
                and (only is None or e["raw_id"] == only)]
    if not approved:
        if only:                                             # 指名卻不能發 → 明確失敗，不要讓呼叫端誤判成功
            raise SystemExit(f"{only} 目前是 {q[only].get('compile_status', 'pending')}，"
                             f"非 approved；先 `curate.py approve {only}`")
        print("（無 approved 項目可 compile；先 `curate.py approve <raw_id>`）"); return 0
    src, i, _j, db = load_db()
    url2sid = _urlnorm.index_by_url(db["sources"])       # 正規化鍵比對：追蹤參數不得被當成新來源
    ent_by_id = {e["id"]: e for e in db["entities"]}; ent_ids = set(ent_by_id)
    done, skipped = [], []
    for e in approved:
        rid = e["raw_id"]
        try:                                                 # 一次讀取重新 derive/validate/project（digest 同源，不 TOCTOU）
            sl, rec, _extr, att, digest, fails = project_extraction(e["extraction"])
        except Exception as ex:
            skipped.append((rid, f"投影失敗 {type(ex).__name__}")); continue
        if digest != e.get("extraction_digest"):             # 核准後 extraction 又變了 → 需重審
            skipped.append((rid, "extraction 內容已變（digest 不符），需重審")); continue
        if fails:                                            # bundle 不合法 → 不 compile
            skipped.append((rid, f"bundle 不合法（{len(fails)} 項不變量），不 compile")); continue
        if att and not args.yes:
            skipped.append((rid, f"含 attributed-to×{att}，需人工逐篇確認："
                                 f"`curate.py compile {rid} --yes`（歸因是紅線）")); continue
        op_ref = rl.operator_ref(sl, ent_ids)                # 重算歸屬並與核准時比對，避免誤綁/骨幹變動
        if op_ref != e.get("actor_registered"):
            skipped.append((rid, f"歸屬與核准時不一致（現 {op_ref}／核准 {e.get('actor_registered')}），需重審")); continue
        # 放寬：不再要求 operator 在 db.entities。claims 依 about 分掛各已登錄實體（下方 by_ent）；
        # 若無任何可掛實體，下方以「無可掛 claims」跳過。operator（若有）僅作歸屬參考、非發布門檻。
        name2ent = {}
        for ent in db["entities"]:
            for nm in [ent.get("name_zh"), ent.get("name_en")] + (ent.get("aliases") or []):
                if nm: name2ent.setdefault(_norm(nm), ent)
        by_ent, miss, sids, dropped = {}, 0, set(), 0
        for c in rec["claims"]:
            if not _norm(c.get("quote")): continue           # 空文字 claim 跳過（不算 miss）
            sid = url2sid.get(_urlnorm.source_key(c["source"]))
            if not sid: miss += 1; continue
            ae = name2ent.get(_norm(c.get("about")))
            if not ae: dropped += 1; continue                # about 非已登錄實體 → 不歸屬
            sids.add(sid)
            by_ent.setdefault(ae["id"], []).append({"text": c["quote"], "source_id": sid, "about": c["about"]})
        if miss:                                             # 不做 partial：任一 claim 來源未策展 → 整篇跳過
            skipped.append((rid, f"{miss} 條 claim 來源未在 db.sources → 整篇跳過（先補 source 再審）")); continue
        if not by_ent:
            skipped.append((rid, f"無可掛 claims（{dropped} 條 about 皆非已登錄實體 → 先登錄相關單位再審）")); continue
        nclaims, ents_str = sum(len(v) for v in by_ent.values()), "、".join(by_ent)
        # 重編時，claim 可能改掛別的實體或被宣稱閘濾掉；只 upsert 有新內容的實體會讓舊實體留下殘影。
        # 以 source_id 為權威的取代範圍：同來源的舊 claims 一律先清，再寫入本次結果。
        stale = [ent for ent in db["entities"] if ent["id"] not in by_ent
                 and any(c.get("source_id") in sids for c in ent.get("claims", []))]
        if args.dry_run:
            note = f"dry-run（分掛 {len(by_ent)} 個實體，另 {dropped} 條 about 未登錄略過"
            note += f"；清除 {len(stale)} 個實體的同來源舊 claims）" if stale else "）"
            done.append((rid, ents_str, nclaims, note)); continue
        for ent in stale:
            _upsert(ent, [], sids)
        for eid, claims in by_ent.items():
            _upsert(ent_by_id[eid], claims, sids)
        e["compile_status"] = "compiled"
        done.append((rid, ents_str, nclaims, f"分掛 {len(by_ent)} 個實體，{dropped} 條 about 未登錄略過"
                                             + (f"，清除 {len(stale)} 個實體的同來源舊 claims" if stale else "")))
    if not args.dry_run and done:
        save_db(src, i, db); rl._write_queue(q)
    print("=== compile（安全 upsert；以 source_id 為單位；重算比對，不做 partial）===")
    for rid, eid, n, note in done:
        print(f"  ✓ {rid} → {eid}: +{n} claims｜{note}")
    for rid, why in skipped:
        print(f"  ⟳ {rid} 跳過：{why}")
    if args.dry_run: print("（dry-run：未寫 db.js/queue）")
    if only and not done:                                    # 指名發布卻沒發成 → 呼叫端（後台）要看到失敗
        raise SystemExit(f"{only} 未發布：{skipped[0][1] if skipped else '未知原因'}")
    return 0

def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("list"); p.add_argument("--all", action="store_true"); p.set_defaults(fn=cmd_list)
    p = sub.add_parser("show"); p.add_argument("raw_id"); p.set_defaults(fn=cmd_show)
    for st in ("approve", "reject", "defer"):
        p = sub.add_parser(st); p.add_argument("raw_id"); p.add_argument("--note")
        p.set_defaults(fn=cmd_set, status={"approve": "approved", "reject": "rejected", "defer": "deferred"}[st])
    p = sub.add_parser("auto", help="掃 pending：過閘者自動發布，其餘留給人")
    p.add_argument("--dry-run", action="store_true"); p.set_defaults(fn=cmd_auto)
    p = sub.add_parser("compile"); p.add_argument("raw_id", nargs="?", help="只發布這一篇；省略＝全部 approved")
    p.add_argument("--yes", action="store_true"); p.add_argument("--dry-run", action="store_true")
    p.set_defaults(fn=cmd_compile)
    args = ap.parse_args()
    return args.fn(args)

if __name__ == "__main__":
    raise SystemExit(main())
