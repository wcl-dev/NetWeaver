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
import argparse, hashlib, importlib.util, json, pathlib, re

_here = pathlib.Path(__file__).resolve().parent
def _load(n):
    s = importlib.util.spec_from_file_location(n, str(_here / (n + ".py")))
    m = importlib.util.module_from_spec(s); s.loader.exec_module(m); return m
rl = _load("run_loop")
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

def project_extraction(relpath):
    """一次讀取 → (sl, project, extr, attributed-to 數, digest, validate fails)。digest／att／validity 都由同一份
    載入內容現算（不吃 queue cache、無 TOCTOU）。"""
    extr = json.loads((_here.parent / relpath).read_text(encoding="utf-8"))
    digest = hashlib.sha256(json.dumps(extr, ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest()[:16]
    bundle, sl, _ = pipe.stix_from_extraction(extr, REG)
    fails, att = pipe.validate(bundle)
    return sl, pipe.project(bundle), extr, len(att), digest, list(fails)

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
        raise SystemExit(f"{args.raw_id} 已 compiled；如需重審請重跑 loop（內容變動會自動重置為 pending）")
    if args.status == "approved":
        # approve＝以「當下 registry」重新投影，鎖定歸屬與 digest（compile 據此比對）。
        # 這也是 defer→補 registry→approve 的重綁入口：重審時會抓到新登錄的 actor。
        try:
            _su, ent_ids = rl.load_db()
            sl, _rec, _extr, att, digest, fails = project_extraction(e["extraction"])
        except Exception as ex:
            raise SystemExit(f"無法投影 extraction：{type(ex).__name__}: {ex}")
        op_ref = rl.operator_ref(sl, ent_ids)
        if op_ref is None:
            raise SystemExit(f"{args.raw_id} 無可信歸屬（operator 未登錄或非行動方）→ 請 defer、先補 registry 再 approve")
        e.update({"actor_registered": op_ref, "extraction_digest": digest,
                  "attributed_to": att, "valid": not fails})
    e["compile_status"] = args.status
    if args.note: e["note"] = args.note
    rl._write_queue(q)
    print(f"✓ {args.raw_id} → {args.status}"
          + (f"｜歸屬 {e.get('actor_registered')}" if args.status == "approved" else "")
          + (f"（{args.note}）" if args.note else ""))
    return 0

def cmd_compile(args):
    q = rl.load_queue()
    approved = [e for e in q.values() if e.get("compile_status") == "approved"]
    if not approved:
        print("（無 approved 項目可 compile；先 `curate.py approve <raw_id>`）"); return 0
    src, i, _j, db = load_db()
    url2sid = {s["url"]: s["id"] for s in db["sources"]}
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
            skipped.append((rid, f"含 attributed-to×{att}，需 --yes（歸因需人工核可）")); continue
        op_ref = rl.operator_ref(sl, ent_ids)                # 重算歸屬並與核准時比對，避免誤綁/骨幹變動
        if op_ref != e.get("actor_registered"):
            skipped.append((rid, f"歸屬與核准時不一致（現 {op_ref}／核准 {e.get('actor_registered')}），需重審")); continue
        target = ent_by_id.get(op_ref)
        if not target:
            skipped.append((rid, f"歸屬 {op_ref} 不在 db.entities（改 defer、先補 registry）")); continue
        new_claims, miss, sids = [], 0, set()
        for c in rec["claims"]:
            if not _norm(c.get("quote")): continue           # 空文字 claim 跳過（不算 miss，也不讓 _upsert 誤刪舊 claims）
            sid = url2sid.get(c["source"])
            if not sid: miss += 1; continue
            sids.add(sid); new_claims.append({"text": c["quote"], "source_id": sid, "about": c["about"]})
        if miss:                                             # 不做 partial：任一 claim 來源未策展 → 整篇跳過
            skipped.append((rid, f"{miss} 條 claim 來源未在 db.sources → 整篇跳過（先補 source 再審）")); continue
        if not new_claims:
            skipped.append((rid, "無可寫 claims（空文字或無有效引文）")); continue
        if args.dry_run:
            done.append((rid, target["id"], len(new_claims), "dry-run")); continue
        total = _upsert(target, new_claims, sids)
        e["compile_status"] = "compiled"
        done.append((rid, target["id"], len(new_claims), f"→entity now {total} claims"))
    if not args.dry_run and done:
        save_db(src, i, db); rl._write_queue(q)
    print("=== compile（安全 upsert；以 source_id 為單位；重算比對，不做 partial）===")
    for rid, eid, n, note in done:
        print(f"  ✓ {rid} → {eid}: +{n} claims｜{note}")
    for rid, why in skipped:
        print(f"  ⟳ {rid} 跳過：{why}")
    if args.dry_run: print("（dry-run：未寫 db.js/queue）")
    return 0

def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("list"); p.add_argument("--all", action="store_true"); p.set_defaults(fn=cmd_list)
    p = sub.add_parser("show"); p.add_argument("raw_id"); p.set_defaults(fn=cmd_show)
    for st in ("approve", "reject", "defer"):
        p = sub.add_parser(st); p.add_argument("raw_id"); p.add_argument("--note")
        p.set_defaults(fn=cmd_set, status={"approve": "approved", "reject": "rejected", "defer": "deferred"}[st])
    p = sub.add_parser("compile"); p.add_argument("--yes", action="store_true"); p.add_argument("--dry-run", action="store_true")
    p.set_defaults(fn=cmd_compile)
    args = ap.parse_args()
    return args.fn(args)

if __name__ == "__main__":
    raise SystemExit(main())
