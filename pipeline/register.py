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
from datetime import date
from urllib.parse import urlparse

_here = pathlib.Path(__file__).resolve().parent
DBP = _here.parent / "data" / "db.js"
REGISTRY = _here.parent / "data" / "registry.yaml"

def _load(n):
    s = importlib.util.spec_from_file_location(n, str(_here / (n + ".py")))
    m = importlib.util.module_from_spec(s); s.loader.exec_module(m); return m
_RL = _load("run_loop")
_norm = _load("derive").norm                                # 與 derive 共用同一 normalizer（避免撞名判斷漂移）
_urlnorm = _load("urlnorm")                                 # 與 curate/run_loop 共用同一來源比對鍵

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
    """已信任出版方＝registry 登錄的機構（**含別名**、含 tier C）∪ feeds.json ∪ db.sources 現有 org。

    與 `tracked_publishers()`（觀察者，只取 tier A／B）刻意不同：這裡問的是「這家發布者經過
    governance 了嗎」，對手方原始素材（tier C）同樣是合法的來源出處——環球時報自己的社評可以
    被登錄成來源。別名必須算數：報告的 org 欄位常寫別名（「ASPI The Strategist」對登錄的「ASPI」），
    不吃別名會讓已核可的來源被誤判成全新出版方而擋下發布。
    """
    orgs = set()
    for e in parse_registry():
        if e.get("org"): orgs.add(e["org"])
        orgs.update(e.get("aliases") or [])
    try:
        for src in json.loads(FEEDS_PATH.read_text(encoding="utf-8")).get("sources", []):
            if src.get("org"): orgs.add(src["org"])
    except Exception: pass
    orgs |= {s.get("org", "").strip() for s in db.get("sources", [])}
    return {o.strip() for o in orgs if o and o.strip()}

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

IGNORE_PATH = _here.parent / "data" / "roster_ignore.json"

def load_ignore():
    """讀「決定不收錄」清單 → {正規化名: entry}；檔案不存在＝空清單。

    roster 每次都重新列出所有未登錄的名字。沒有這份清單，判斷過的雜訊（國家、被提及的人物、
    研究單位）會永遠反覆出現，候選清單很快就沒人想看。
    刻意不放 `data/db.js`——那份會發布到前端，策展決策不該對外。
    """
    if not IGNORE_PATH.exists(): return {}
    d = json.loads(IGNORE_PATH.read_text(encoding="utf-8"))
    return {_norm(e["name"]): e for e in d.get("ignored", []) if e.get("name")}

def save_ignore(entries):
    """原子寫檔；依名稱排序輸出，讓 diff 穩定可讀。"""
    doc = {"_note": "roster 的「決定不收錄」清單——判斷過不是行為者的名字。"
                    "只影響 register.py roster 的候選列表，不影響抽取、判斷與發布。",
           "ignored": sorted(entries.values(), key=lambda e: e["name"])}
    IGNORE_PATH.parent.mkdir(parents=True, exist_ok=True)
    tmp = IGNORE_PATH.with_name(f"{IGNORE_PATH.name}.{os.getpid()}.tmp")
    tmp.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(IGNORE_PATH)

def _registered(db, name):
    """回傳與 name 同名的已登錄實體（比對中英名與別名），沒有則 None。"""
    for e in db["entities"]:
        for nm in [e.get("name_zh"), e.get("name_en")] + (e.get("aliases") or []):
            if nm and _norm(nm) == _norm(name): return e
    return None

def cmd_ignore(args):
    """標記某個名字「不是行為者」，之後 roster 不再列出。"""
    name = (args.name or "").strip()
    if not name: raise SystemExit("需要名稱")
    _src, _i, _end, db = load_db()
    hit = _registered(db, name)
    if hit:
        raise SystemExit(f"「{name}」已是登錄實體（{hit['id']}）——要拿掉請改名冊，不是加忽略清單")
    ent = load_ignore(); key = _norm(name)
    if key in ent:
        raise SystemExit(f"「{name}」已在忽略清單（{ent[key].get('reason') or '未註明理由'}）")
    ent[key] = {"name": name, "reason": (args.reason or "").strip(), "added": date.today().isoformat()}
    save_ignore(ent)
    print(f"✓ 已忽略「{name}」" + (f"：{args.reason}" if args.reason else "") + f"｜清單共 {len(ent)} 筆")
    return 0

def cmd_unignore(args):
    """從忽略清單移除（重新評估時用）。"""
    name = (args.name or "").strip()
    ent = load_ignore(); key = _norm(name)
    if key not in ent: raise SystemExit(f"「{name}」不在忽略清單")
    removed = ent.pop(key); save_ignore(ent)
    print(f"✓ 已移除「{removed['name']}」，roster 會再次列出｜清單剩 {len(ent)} 筆")
    return 0

def _cand_source_id(org_or_src, url, given=None):
    """穩定的逐文件 source id：src-<org slug>-<url hash6>（同出版方多篇不撞）。"""
    return (given or f"src-{_slug(org_or_src)}-{_urlnorm.url_hash(url)}").strip()

# ---------- add-source ----------

def cmd_add_source(args):
    url = _valid_url(_req(args.url, "url")); org = _req(args.org, "org"); title = _req(args.title, "title")
    typ = _req(args.type, "type")
    if typ not in SOURCE_TYPES: raise SystemExit(f"--type ∈ {sorted(SOURCE_TYPES)}")
    date = _RL._norm_published(_req(args.date, "date"))
    if not date: raise SystemExit("--date 非合法日期（YYYY[-MM[-DD]]）")
    src, i, end, db = load_db()
    _key = _urlnorm.source_key(url)                      # 正規化後比對：同篇報告帶追蹤參數不得重複登錄
    _dup = next((s for s in db["sources"] if _urlnorm.source_key(s.get("url")) == _key), None)
    if _dup:
        raise SystemExit(f"url 已存在於 db.sources：{_dup.get('id')}（{_dup.get('url')}）")
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
    src_by_url = _urlnorm.index_by_url(db["sources"]); ent_ids = {x["id"] for x in db["entities"]}
    extr = json.loads((_here.parent / e["extraction"]).read_text(encoding="utf-8"))
    rep = extr.get("report", {}); url = e.get("url")
    print(f"# {args.raw_id}：{e.get('title')}  status={e.get('compile_status')}")
    existing_sid = src_by_url.get(_urlnorm.source_key(url))
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

FEEDS_PATH = _here / "feeds.json"

def parse_registry():
    """讀 registry.yaml 的結構化條目 → [{id, org, tier, aliases:[...], ...}]。

    純 stdlib（專案不引 YAML 套件），只解析本檔已知的形狀：`- id:` 起一筆，後續縮排更深的
    `key: value` 屬於該筆。解析失敗回空清單——寧可少濾，不要炸掉整個 roster。
    """
    if not REGISTRY.exists(): return []
    out, cur = [], None
    for raw in REGISTRY.read_text(encoding="utf-8").splitlines():
        line = raw.split("#")[0].rstrip() if not raw.strip().startswith("#") else ""
        if not line.strip(): continue
        m = re.match(r"^(\s*)-\s*id:\s*(\S+)", line)
        if m:
            cur = {"id": m.group(2), "_indent": len(m.group(1))}; out.append(cur); continue
        if cur is None: continue
        m = re.match(r"^(\s*)([A-Za-z_]+):\s*(.*)$", line)
        if not m: continue
        indent, key, val = len(m.group(1)), m.group(2), m.group(3).strip().strip('"')
        if indent <= cur["_indent"]: cur = None; continue      # 已離開這筆
        cur[key] = val
    for e in out:
        e.pop("_indent", None)
        e["aliases"] = [a.strip() for a in (e.get("aliases") or "").split(",") if a.strip()]
    return out

OBSERVER_TIERS = {"A", "B"}          # C＝對手方原始素材，是佐證也是行為者，不算觀察者

def tracked_publishers():
    """**觀察者**（寫報告的機構）→ 正規化名集合：訂閱其 feed，或 registry 登錄為 tier A／B。

    刻意排除 tier C：環球時報這類「對手方原始素材」既是行為者、其產出又當佐證，
    把它算成觀察者會讓它永遠無法登錄進名冊。也刻意不用 `db.sources` 的出版方集合——
    那份混著物證來源，同樣會誤殺行為者。
    """
    orgs = set()
    try:
        for src in json.loads(FEEDS_PATH.read_text(encoding="utf-8")).get("sources", []):
            if src.get("org") and src.get("tier", "A") in OBSERVER_TIERS: orgs.add(src["org"])
    except Exception: pass
    for e in parse_registry():
        if e.get("tier") in OBSERVER_TIERS:
            orgs.add(e.get("org", "")); orgs.update(e["aliases"])
    return {_norm(o) for o in orgs if o}

_ROSTER_KINDS = _RL._ACTOR_KINDS | {"x-dad-channel"}   # 媒體／帳號＝放大者層，最常需要新登錄

def cmd_roster(args):
    """跨佇列彙總「尚未登錄的行為者候選」，依出現篇數排序——**審名冊的入口**。

    自動發布模式下，名冊是唯一的人工閘：模型只能在已登錄實體上填內容。所以人要看的不是逐篇 claim，
    而是「哪些名字反覆出現卻還沒登錄」——出現在越多篇，越可能是真的該收的行為者。
    統計行為者類物件與**傳播管道**（x-dad-channel——媒體／帳號正是這個專案的放大者層，
    也是最常需要新登錄的一類）；敘事、地點、工具、報告本身不列入。
    """
    pipe = _load("pipeline"); reg = pipe._derive_mod().load_registry()
    _src, _i, _end, db = load_db()
    src_by_url = _urlnorm.index_by_url(db["sources"])
    q = _RL.load_queue()
    entries = [e for e in q.values()
               if not args.status or e.get("compile_status") == args.status]
    agg = {}
    for e in entries:
        try:
            extr = json.loads((_here.parent / e["extraction"]).read_text(encoding="utf-8"))
            bundle, _sl, _log = pipe.stix_from_extraction(extr, reg)
        except Exception:
            continue
        seen_here = set()
        for o in bundle["objects"]:
            name = (o.get("name") or "").strip()
            if o["type"] not in _ROSTER_KINDS or not name: continue
            if _norm(name) in reg: continue                      # 已登錄 → 不用審
            key = _norm(name)
            a = agg.setdefault(key, {"names": set(), "docs": set(), "ev": 0, "src": set(), "kinds": set()})
            a["names"].add(name); a["docs"].add(e["raw_id"]); seen_here.add(key)
            a["kinds"].add("管道" if o["type"] == "x-dad-channel"
                           else "人名" if o.get("identity_class") == "individual" else "機構")
            a["ev"] += len(o.get("x_netweaver_evidence") or [])
            sid = src_by_url.get(_urlnorm.source_key(e.get("url")))
            if sid: a["src"].add(sid)
    ign, hidden = load_ignore(), 0
    obs, obs_names = tracked_publishers(), []
    for k in [k for k in agg if k in obs]:                    # 觀察者不列（寫報告的機構不是行為者）
        obs_names.append(sorted(agg[k]["names"])[0])
        if not args.show_ignored: del agg[k]                  # 但要叫得出來：tier A/B 的機構仍可能
    obs_hidden = len(obs_names)                               # 需要被記錄（TVBS／中天都是台灣媒體又是行為者）
    if not args.show_ignored:
        for k in [k for k in agg if k in ign]:
            del agg[k]; hidden += 1
    if not agg:
        print("（佇列裡沒有未登錄的行為者候選）"
              + (f"；另有 {hidden} 個已標記為不收錄" if hidden else "")); return 0
    # 分三組：管道（媒體／帳號＝放大者層，這本記錄簿的主體）→ 機構 → 人名。
    # 刻意不用「當過述詞主詞」當排序訊號——實測反而更糟：assertion 稀少且模型傾向把國家當主詞，
    # 「中國」當過 6 次主詞而中國軍號、新華社是 0 次。型別才是乾淨的訊號。
    _ORDER = {"管道": 0, "機構": 1, "人名": 2}
    def _grp(a):
        return "人名" if a["kinds"] == {"人名"} else "管道" if "管道" in a["kinds"] else "機構"
    ranked = sorted(agg.values(), key=lambda a: (_ORDER[_grp(a)], -len(a["docs"]), -a["ev"]))
    print(f"# 未登錄行為者候選（掃 {len(entries)} 篇）"
          + (f"\n# 已濾除：{obs_hidden} 個主動追蹤的機構（寫報告的觀察者）"
             + (f"　→ {'、'.join(obs_names)}" if args.show_ignored else "（--show-ignored 可看）")
             if obs_hidden else "")
          + (f"\n# 已濾除：{hidden} 個標記為不收錄（--show-ignored 可看）" if hidden else ""))
    # limit 按組計，不是全域切片：管道候選一多（實測 572 個）就會把機構與人名整組蓋掉，
    # 而那兩組正是需要逐個判斷的。三組都要看得到。
    by_group = {}
    for a in ranked: by_group.setdefault(_grp(a), []).append(a)
    for g in ("管道", "機構", "人名"):
        rows = by_group.get(g)
        if not rows: continue
        hint = {"管道": "（媒體／帳號＝放大者層，該收的多半在這裡）",
                "機構": "（混著國家、政府與泛稱，逐個判斷）",
                "人名": "（幾乎都不收——被提及的人物，可整批忽略）"}[g]
        more = f"，列出前 {args.limit}" if len(rows) > args.limit else ""
        print(f"\n【{g}】{hint}  共 {len(rows)} 個{more}")
        print(f"{'篇數':>4} {'引文':>4}  名稱")
        for a in rows[:args.limit]:
            print(f"{len(a['docs']):>5} {a['ev']:>5}  " + "／".join(sorted(a["names"])))
    print("\n# 決定要收的，逐一執行（欄位務必人工確認）：")
    for a in ranked[:args.top]:
        nm = sorted(a["names"])[0]
        print("python3 pipeline/register.py add-actor " + shlex.join(
            ["--id", "<slug>", "--name-zh", nm, "--name-en", "<English>", "--category", "<state-media|cib-network|...>",
             "--role", "<attacker|collaborator|amplifier>", "--origin", "<PRC|TW|...>",
             "--summary-zh", "<一句話>", "--source-ids", ",".join(sorted(a["src"])) or "<src-id>",
             "--confidence", "medium"]))
    print("\n# 收完後：python3 pipeline/curate.py auto --dry-run  → 確認無誤再 python3 pipeline/curate.py auto")
    return 0

def main():
    ap = argparse.ArgumentParser(); sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("add-source")
    p.add_argument("--url", required=True); p.add_argument("--id"); p.add_argument("--org", required=True)
    p.add_argument("--type", required=True); p.add_argument("--title", required=True); p.add_argument("--date", required=True)
    p.set_defaults(fn=cmd_add_source)
    p = sub.add_parser("ignore", help="標記某名字不是行為者，roster 不再列出")
    p.add_argument("name"); p.add_argument("--reason"); p.set_defaults(fn=cmd_ignore)
    p = sub.add_parser("unignore", help="從忽略清單移除，roster 會再次列出")
    p.add_argument("name"); p.set_defaults(fn=cmd_unignore)
    p = sub.add_parser("roster", help="跨佇列彙總未登錄的行為者候選（審名冊入口）")
    p.add_argument("--show-ignored", action="store_true", help="連已標記不收錄的一併列出")
    p.add_argument("--limit", type=int, default=25, help="表格列出前 N 名")
    p.add_argument("--top", type=int, default=5, help="印出前 N 名的預填 add-actor 指令")
    p.add_argument("--status", help="只看某個 compile_status（例：pending）")
    p.set_defaults(fn=cmd_roster)
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
