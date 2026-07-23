#!/usr/bin/env python3
"""register.py — 把新 source / actor 補進 data/db.js，讓 curate 的 defer 能閉環。

「新增來源＝人的決策」：本工具只做「填欄位＋驗證＋安全寫檔」，**判斷仍是人**——不自動決定該不該收、
不碰 registry.yaml 的 governance 核可（出版方不在 allowlist 時 warn）、不自動抓 PDF 正文。
閉環：curate defer → `register suggest <raw_id>`（印預填指令）→ 人核對改 → `register add-source/add-actor`
      → curate approve（重投影抓到新 actor）→ curate compile。
用法：
  register.py add-source --url URL --org ORG --type TYPE --title T --date YYYY-MM-DD [--id ID]
  register.py add-actor  --id ID --name-zh ZH --name-en EN --category C --role R --origin O --summary-zh S
                         --source-ids s1[,s2] [--aliases a,b] [--confidence high|medium|low]
  register.py suggest RAW_ID
註：enum 以 docs/SCHEMA.md 為準（與 db.js 現有資料一致）。並行寫入鎖見 docs/LOOP_BACKLOG.md（單人 CLI 暫不擋）。
"""
import argparse, hashlib, importlib.util, json, os, pathlib, re, shlex
from urllib.parse import urlparse

_here = pathlib.Path(__file__).resolve().parent
DBP = _here.parent / "data" / "db.js"
REGISTRY = _here.parent / "data" / "registry.yaml"

def _load(n):
    s = importlib.util.spec_from_file_location(n, str(_here / (n + ".py")))
    m = importlib.util.module_from_spec(s); s.loader.exec_module(m); return m
_RL = _load("run_loop")
_norm = _load("derive").norm                                # 與 derive 共用同一 normalizer（避免撞名判斷漂移）

# enum 以 docs/SCHEMA.md ＋ db.js 現有資料為準
SOURCE_TYPES = {"gov-report", "ngo-report", "platform-report", "news", "academic"}
CATEGORIES = {"state-organ", "tech-vendor", "pr-firm", "content-farm", "cib-network",
              "state-media", "domestic-amplifier", "commentator", "other"}
ROLES = {"attacker", "collaborator", "amplifier"}
ORIGINS = {"PRC", "TW", "other"}
_KEBAB = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")            # 嚴格 kebab-case（拒 a-、a--b）

def _slug(s):
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", (s or "").lower())).strip("-")[:32] or "x"

def _split(csv): return [x.strip() for x in (csv or "").split(",") if x.strip()]

def _req(val, name):
    v = (val or "").strip()
    if not v: raise SystemExit(f"--{name} 必填且不可空白")
    return v

def _valid_url(u):
    p = urlparse(u)
    if p.scheme not in ("http", "https") or not p.hostname:  # 須有真實 host（拒 javascript:／http://:80／相對）
        raise SystemExit(f"--url 須為 http(s)://host…：{u}")
    return u

def _publishers(db):
    """已信任出版方＝registry.yaml `org:`（governance 明示核可）∪ db.sources 現有 org（已在記錄簿即已用過）。
    只有兩者皆無的『全新出版方』才 warn（提醒做 governance）。"""
    txt = REGISTRY.read_text(encoding="utf-8")
    reg = {o.strip().strip('"').strip() for o in re.findall(r"^\s*org:\s*(.+)$", txt, re.M)}
    return reg | {s.get("org", "").strip() for s in db.get("sources", [])}

def load_db():
    src = DBP.read_text(encoding="utf-8")
    i = src.index("{", src.index("window.NETWEAVER_DB"))
    end = json.JSONDecoder().raw_decode(src, i)[1]
    return src, i, end, json.loads(src[i:end])

def save_db(src, i, end, db):
    new = src[:i] + json.dumps(db, ensure_ascii=False, indent=2) + src[end:]
    json.JSONDecoder().raw_decode(new, i)                   # 寫前自驗：新內容仍可 parse
    tmp = DBP.with_name(f"{DBP.name}.{os.getpid()}.tmp")    # 唯一 temp，避免與 curate 共用踩檔
    tmp.write_text(new, encoding="utf-8"); tmp.replace(DBP) # 原子換檔、保後綴

def _cand_source_id(org_or_src, url, given=None):
    """穩定的逐文件 source id：src-<org slug>-<url hash6>（同出版方多篇不撞）。"""
    return (given or f"src-{_slug(org_or_src)}-{hashlib.sha256((url or '').encode()).hexdigest()[:6]}").strip()

# ---------- add-source ----------

def cmd_add_source(args):
    url = _valid_url(_req(args.url, "url")); org = _req(args.org, "org"); title = _req(args.title, "title")
    typ = _req(args.type, "type")
    if typ not in SOURCE_TYPES: raise SystemExit(f"--type ∈ {sorted(SOURCE_TYPES)}")
    date = _RL._norm_published(_req(args.date, "date"))
    if not date: raise SystemExit("--date 非合法日期（YYYY[-MM[-DD]]）")
    src, i, end, db = load_db()
    if any(s.get("url") == url for s in db["sources"]):
        raise SystemExit(f"url 已存在於 db.sources：{url}")
    sid = _cand_source_id(org, url, args.id)
    if not (sid.startswith("src-") and _KEBAB.match(sid)):
        raise SystemExit(f"source id 須嚴格 src-kebab-case：{sid}")
    if any(s.get("id") == sid for s in db["sources"]): raise SystemExit(f"source id 已存在：{sid}")
    if org not in _publishers(db):
        print(f"⚠ 出版方「{org}」不在已信任清單（registry.yaml∪db.sources）——記得另做 governance 核可（新增來源＝人的決策）")
    db["sources"].append({"id": sid, "title": title, "org": org, "url": url, "date": date, "type": typ})
    save_db(src, i, end, db)
    print(f"✓ 加入 source {sid}（{org}）→ db.js，共 {len(db['sources'])} 筆")
    return 0

# ---------- add-actor ----------

def cmd_add_actor(args):
    aid = _req(args.id, "id")
    if not _KEBAB.match(aid): raise SystemExit(f"--id 須嚴格 kebab-case：{aid}")
    name_zh = _req(args.name_zh, "name-zh"); name_en = _req(args.name_en, "name-en")
    summary = _req(args.summary_zh, "summary-zh")
    cat = _req(args.category, "category"); role = _req(args.role, "role"); origin = _req(args.origin, "origin")
    if cat not in CATEGORIES: raise SystemExit(f"--category ∈ {sorted(CATEGORIES)}")
    if role not in ROLES: raise SystemExit(f"--role ∈ {sorted(ROLES)}")
    if origin not in ORIGINS: raise SystemExit(f"--origin ∈ {sorted(ORIGINS)}")
    aliases = _split(args.aliases)
    source_ids = list(dict.fromkeys(_split(args.source_ids)))   # 去重、保序
    if not source_ids: raise SystemExit("--source-ids 至少一筆")
    src, i, end, db = load_db()
    if any(e.get("id") == aid for e in db["entities"]): raise SystemExit(f"entity id 已存在：{aid}")
    valid_sids = {s["id"] for s in db["sources"]}
    for sid in source_ids:
        if sid not in valid_sids: raise SystemExit(f"source_id 不在 db.sources：{sid}（先 add-source）")
    existing = {_norm(n) for e in db["entities"]
                for n in [e.get("name_zh"), e.get("name_en")] + (e.get("aliases") or []) if n}
    seen = set()
    for n in [name_zh, name_en] + aliases:
        k = _norm(n)
        if not k: raise SystemExit(f"名稱／別名 normalize 後為空：「{n}」")
        if k in existing: raise SystemExit(f"名稱／別名撞既有 actor：「{n}」（同一實體請用既有 entity）")
        if k in seen: raise SystemExit(f"新名稱／別名彼此重複：「{n}」")
        seen.add(k)
    entry = {"id": aid, "name_zh": name_zh, "name_en": name_en, "aliases": aliases,
             "category": cat, "role": role, "origin": origin, "summary_zh": summary,
             "source_ids": source_ids, "confidence": args.confidence}
    if args.sensitivity: entry["sensitivity"] = args.sensitivity
    elif cat in ("domestic-amplifier", "commentator"):       # 在地具名類：紅線，提醒標記（前端可篩除）
        print(f"⚠ 在地具名類 actor（{cat}）建議加 --sensitivity domestic-named（最敏感、從嚴；前端可一鍵篩除）")
    db["entities"].append(entry)
    save_db(src, i, end, db)
    print(f"✓ 加入 actor {aid}（{name_zh}／{name_en}）→ db.js，共 {len(db['entities'])} 筆")
    return 0

# ---------- add-alias（把新寫法補成既有單位的別名，避免重複建）----------
def _norm(s): return re.sub(r"[\s\W]+", "", (s or "").lower())

def cmd_add_alias(args):
    aid = _req(args.id, "id"); alias = _req(args.alias, "alias")
    src, i, end, db = load_db()
    ent = next((e for e in db["entities"] if e.get("id") == aid), None)
    if not ent: raise SystemExit(f"找不到單位 id：{aid}")
    names = [ent.get("name_zh"), ent.get("name_en")] + (ent.get("aliases") or [])
    if any(_norm(alias) == _norm(n) for n in names if n):
        print(f"「{alias}」已是 {aid} 的名稱/別名，不重複加"); return 0
    owner = {_norm(x): e["id"] for e in db["entities"]
             for x in [e.get("name_zh"), e.get("name_en")] + (e.get("aliases") or []) if x}
    other = owner.get(_norm(alias))
    if other and other != aid:
        raise SystemExit(f"「{alias}」已屬於別的單位 {other}，不可加到 {aid}（避免混淆）")
    ent.setdefault("aliases", []).append(alias)
    save_db(src, i, end, db)
    print(f"✓ 「{alias}」→ 補為 {aid}（{ent.get('name_zh')}）的別名，現有 {len(ent['aliases'])} 個別名")
    return 0

# ---------- suggest（讀 deferred queue 條目，印預填指令）----------

def cmd_suggest(args):
    q = _RL.load_queue(); e = q.get(args.raw_id)
    if not e: raise SystemExit(f"queue 無此 raw_id：{args.raw_id}")
    pipe = _load("pipeline")
    _src, _i, _end, db = load_db()
    src_by_url = {s["url"]: s["id"] for s in db["sources"]}; ent_ids = {x["id"] for x in db["entities"]}
    extr = json.loads((_here.parent / e["extraction"]).read_text(encoding="utf-8"))
    rep = extr.get("report", {}); url = e.get("url")
    print(f"# {args.raw_id}：{e.get('title')}  status={e.get('compile_status')}")
    existing_sid = src_by_url.get(url)
    cand_sid = _cand_source_id(rep.get("org") or e.get("source_id") or "src", url, existing_sid)
    if not existing_sid:
        print("\n# 缺 source（url 不在 db.sources）→ 核對後執行：")
        print("python3 pipeline/register.py add-source " + shlex.join(
            ["--id", cand_sid, "--url", url or "", "--org", rep.get("org") or "", "--type", "news",
             "--title", (e.get("title") or "").strip(), "--date", _RL._norm_published(rep.get("published")) or ""]))
    else:
        print(f"# source 已在 db.sources ✓（{existing_sid}）")
    bundle, sl, _ = pipe.stix_from_extraction(extr, pipe._derive_mod().load_registry())
    op_ref = _RL.operator_ref(sl, ent_ids)                  # 現算，不吃 stale queue 欄位
    if op_ref is None:
        op_name = pipe.project(bundle)["operator"].get("name") or "?"
        print("\n# 缺可信 actor（operator_ref=None）→ 核對後執行（欄位務必人工確認；--name-en 僅提示）：")
        print("python3 pipeline/register.py add-actor " + shlex.join(
            ["--id", "<slug>", "--name-zh", "<中文名>", "--name-en", op_name, "--category", "cib-network",
             "--role", "amplifier", "--origin", "PRC", "--summary-zh", "<一句話>",
             "--source-ids", cand_sid, "--confidence", "medium"]))
    else:
        print(f"# actor 已登錄 ✓（nw_ref={op_ref}）")
    print(f"\n# 補完後：python3 pipeline/curate.py approve {args.raw_id} → python3 pipeline/curate.py compile")
    return 0

def main():
    ap = argparse.ArgumentParser(); sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("add-source")
    p.add_argument("--url", required=True); p.add_argument("--id"); p.add_argument("--org", required=True)
    p.add_argument("--type", required=True); p.add_argument("--title", required=True); p.add_argument("--date", required=True)
    p.set_defaults(fn=cmd_add_source)
    p = sub.add_parser("add-actor")
    for f in ("id", "name-zh", "name-en", "category", "role", "origin", "summary-zh", "source-ids"):
        p.add_argument("--" + f, required=True, dest=f.replace("-", "_"))
    p.add_argument("--aliases")
    p.add_argument("--sensitivity", choices=["domestic-named"])
    p.add_argument("--confidence", default="medium", choices=["high", "medium", "low"])
    p.set_defaults(fn=cmd_add_actor)
    p = sub.add_parser("add-alias")
    p.add_argument("--id", required=True); p.add_argument("--alias", required=True); p.set_defaults(fn=cmd_add_alias)
    p = sub.add_parser("suggest"); p.add_argument("raw_id"); p.set_defaults(fn=cmd_suggest)
    args = ap.parse_args(); return args.fn(args)

if __name__ == "__main__":
    raise SystemExit(main())
