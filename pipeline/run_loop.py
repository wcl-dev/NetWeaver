#!/usr/bin/env python3
"""生產迴圈 runner：把 ingest→filter→extract→derive→validate→project 冪等編排起來。

只『編排』既有各段、不重寫其邏輯。設計上骨幹（db.sources 逐篇來源、registry actor）是人工策展的，
且目前抽取品質仍低（edge F1 ~0.2），因此**預設不自動 compile 進 db.js**：
  · 自動段：ingest → filter → 對每個 ready doc extract＋derive＋validate＋project。
  · 產出：每篇 extraction 落到 extractions/，並寫一份 **curation queue**（附 operator/claims/來源已策展?/
          actor 已登錄?/是否含 attributed-to/是否通過 validate），交人工審。
  · compile 進 db.js 維持人工步驟（`curate.py`：list/show/approve/compile，安全 upsert；人審過才寫）——守 documented-not-accused
    與「新增來源＝人的決策」。自動 compile 的安全化（source-scoped upsert、operator 綁定、歸因閘…）見
    docs/LOOP_BACKLOG.md。

冪等：只處理 extraction_status=='ready'；抽完轉 'extracted'（不重做）；curation queue 依 raw_id upsert 持久化。
失敗不擋全批。文字來源：raw/<src>/<hash>.txt（優先，非空）> textextract 現抽快照 .html/.pdf（readability/pdftotext）> 無則跳過。
用法：
  python3 pipeline/run_loop.py --no-ingest --dry-run    # 只列會做什麼，不呼叫 LLM、不改檔
  python3 pipeline/run_loop.py --no-ingest --limit 1    # 跳過抓取，最多抽 1 篇（冷跑控管）
  python3 pipeline/run_loop.py                          # 全跑（含抓網路 feeds）
"""
import argparse, hashlib, importlib.util, json, pathlib, re, sys
from datetime import date, datetime
from email.utils import parsedate_to_datetime

_here = pathlib.Path(__file__).resolve().parent
RAW = _here / "raw"
EXTRACTIONS = _here / "extractions"                          # 抽取產出隔離於 raw/，避免污染 filter 的 manifest glob
QUEUE = EXTRACTIONS / "curation_queue.json"
DBP = _here.parent / "data" / "db.js"
TIER_TYPE = {"A": "ngo-report", "B": "news"}                 # feeds tier→derive report type（影響 confidence tier；非結構）

def _load(name):
    spec = importlib.util.spec_from_file_location(name, str(_here / (name + ".py")))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

def _norm_published(s):
    """RFC822（RSS）／ISO datetime（Atom）／bare YYYY[-MM[-DD]] → 正規化；無法解析或非法日期回 None
    （serialize 端處理缺值），避免非法 STIX timestamp。"""
    if not s: return None
    s = s.strip()
    m = re.match(r"^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$", s)   # bare date：驗證真實日期後原樣保留（iso() 吃 YYYY[-MM[-DD]]）
    if m:
        try:
            date(int(m.group(1)), int(m.group(2) or 1), int(m.group(3) or 1)); return s
        except ValueError:
            return None
    try:                                                     # Atom ISO datetime（含 Z／offset）
        return datetime.fromisoformat(s.replace("Z", "+00:00")).date().isoformat()
    except Exception:
        pass
    try:                                                     # RFC822（RSS）
        return parsedate_to_datetime(s).date().isoformat()
    except Exception:
        return None

_tx = _load("textextract")                                   # readability/pdf 正文抽取（ingest 落地時已抽 .txt；此為 fallback）

def resolve_text(mp, m):
    """依序取正文：非空 .txt 側車（ingest 落地或人工提供）> manifest 記錄的快照現抽（textextract readability/pdftotext）> 無。
    自動抽取品質不足（太短/nav-only）視同 no-text → 送 curation/skip，不餵雜訊。回 (text, kind)。"""
    stem = mp.with_suffix("")
    txt = stem.with_suffix(".txt")
    if txt.exists():
        t = txt.read_text(encoding="utf-8", errors="ignore").strip()
        if t: return t, "txt-sidecar"                        # 人工/ingest 明示提供，非空即用（不套品質閘）
    def _from(snap):
        t, kind = _tx.extract_text(snap)
        return (t, f"extract-{kind}") if _tx.is_quality(t) else ("", f"low-quality-{kind}")
    if "snapshot" in m:                                      # 有 snapshot 欄位（含明確 null）→ 只信它，不回退猜測
        snap_name = m["snapshot"]
        if snap_name and not str(snap_name).startswith("fetch"):
            snap = mp.parent / pathlib.Path(str(snap_name)).name   # 限 basename → 防 ../ 逸出
            if snap.exists(): return _from(snap)
        return "", "no-text"                                 # 欄位存在但 null/缺檔/fetch-failed → no-text（不讀殘檔）
    for e in (".html", ".htm", ".pdf"):                      # 舊 manifest（無 snapshot 欄位）才回退副檔名猜測
        snap = stem.with_suffix(e)
        if snap.exists(): return _from(snap)
    return "", "no-text"

def report_meta(m):
    return {"name": m.get("title"), "org": m.get("org"), "url": m.get("url"),
            "published": _norm_published(m.get("published")), "type": TIER_TYPE.get(m.get("tier"), "news")}

def load_db():
    src = DBP.read_text(encoding="utf-8")
    i = src.index("{", src.index("window.NETWEAVER_DB")); j = src.rindex("}")
    db = json.loads(src[i:j + 1])
    return {s["url"] for s in db.get("sources", [])}, {e["id"] for e in db.get("entities", [])}

_ACTOR_KINDS = {"threat-actor", "intrusion-set", "identity"}

def operator_ref(sl, ent_ids):
    """行動方已登錄 entity 的 nw_ref：只取「是關係 source、且已登錄」者（優先 actor kind）。
    找不到可信行動方 → None（fail-closed，交 curation）；**不**落回「任一已登錄」，以免把 target/媒體誤當歸屬。"""
    by_tmp = {o.get("tmp_id"): o for o in sl["objects"]}
    src_tmps = [r.get("source") for r in sl["relationships"]]
    acting = [by_tmp[t] for t in src_tmps if t in by_tmp and by_tmp[t].get("nw_ref") in ent_ids]
    for o in acting:                                         # 1) 行動方＋actor kind
        if o.get("kind") in _ACTOR_KINDS: return o["nw_ref"]
    return acting[0]["nw_ref"] if acting else None           # 2) 任一行動方；否則 None（不綁 target）

def publication_digest(extr, claims):
    """審核鎖定的是「**會被發布的內容**」＝模型抽取 ＋ 碼投影出的 claim 引文。

    只鎖 extraction 的話，碼層一改（例如引文擴張成完整句），已核准／已 compiled 的項目會悄悄
    停在舊內容且無路可回；把投影結果納入 digest，內容一變就會被 compile 的比對擋下要求重審。
    """
    payload = {"extraction": extr,
               "claims": [[c.get("about"), c.get("quote")] for c in (claims or [])]}
    return hashlib.sha256(json.dumps(payload, ensure_ascii=False, sort_keys=True)
                          .encode("utf-8")).hexdigest()[:16]

def load_queue():
    if not QUEUE.exists():
        return {}
    try:                                                     # 損毀時不靜默回 {}（會覆寫清空舊 queue）→ 明確中止待人工
        return {e["raw_id"]: e for e in json.loads(QUEUE.read_text(encoding="utf-8"))}
    except Exception as e:
        raise SystemExit(f"curation queue 損毀（{QUEUE}）：{e}；請人工檢查，勿讓 runner 覆寫")

def _write_queue(queue):
    EXTRACTIONS.mkdir(parents=True, exist_ok=True)
    tmp = QUEUE.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(list(queue.values()), ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(QUEUE)                                       # 原子寫檔

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-ingest", action="store_true", help="跳過 ② 抓取，只處理現有 raw/")
    ap.add_argument("--dry-run", action="store_true", help="只列會做什麼；不呼叫 LLM、不改檔")
    ap.add_argument("--limit", type=int, help="本次最多抽 N 篇（冷跑控管；需 >=0）")
    args = ap.parse_args()
    if args.limit is not None and args.limit < 0:
        raise SystemExit("--limit 需 >= 0")

    ex, pipe = _load("extract"), _load("pipeline")
    reg = pipe._derive_mod().load_registry()
    src_urls, ent_ids = load_db()

    if not args.no_ingest and not args.dry_run:
        print("═══ ② ingest ═══")
        saved = sys.argv[:]                                  # ingest.main 用 argparse 讀 sys.argv；隔離掉本腳本的 flag
        try: sys.argv = ["ingest"]; _load("ingest").main()
        finally: sys.argv = saved
    if not args.dry_run:
        print("\n═══ filter（相關性閘，碼）═══"); _load("filter").main()

    manifests = sorted(RAW.glob("*/*.json")) if RAW.exists() else []
    ready = [(mp, json.loads(mp.read_text(encoding="utf-8"))) for mp in manifests]
    ready = [(mp, m) for mp, m in ready if m.get("extraction_status") == "ready"]
    if args.limit is not None:
        ready = ready[:args.limit]

    print(f"\n═══ ③–⑤ 抽取→derive→validate→投影（{len(ready)} 篇 ready）═══")
    queue = load_queue()
    summary = {"ready": len(ready), "extracted": 0, "no_text": 0, "errors": 0, "queued": 0}
    for mp, m in ready:
        tag = f"[{m.get('source_id')}] {(m.get('title') or '')[:44]}"
        try:
            text, kind = resolve_text(mp, m)
            if not text:
                summary["no_text"] += 1; print(f"  · 跳過（{kind}）{tag}"); continue
            if args.dry_run:
                print(f"  → 會抽取（{kind}，{len(text)} chars）{tag}"); continue
            extr, _dropped = ex.extract(report_meta(m), text)
            bundle, sl, _log = pipe.stix_from_extraction(extr, reg)   # derive 只看模型原始 span
            fails, att = pipe.validate(bundle)
            rec = pipe.project(bundle, text=text)                      # 引文擴張／宣稱閘只在呈現層
            outdir = EXTRACTIONS / m.get("source_id", "_"); outdir.mkdir(parents=True, exist_ok=True)
            outp = outdir / (m["raw_id"] + ".extraction.json")
            outp.write_text(json.dumps(extr, ensure_ascii=False, indent=2), encoding="utf-8")
            # 預設不自動 compile：一律入 curation queue，附人工判斷所需的 readiness 旗標
            digest = publication_digest(extr, rec.get("claims"))
            prev = queue.get(m["raw_id"], {})                # 內容變了（重抽）→ 重置審核；沒變→保留既有決定/note/歸屬
            same = prev.get("extraction_digest") == digest
            # 同內容→沿用核准時的歸屬（避免 registry 變動後把舊核准悄悄綁到新 actor；compile 再重算比對）
            nw_ref = prev.get("actor_registered") if same else operator_ref(sl, ent_ids)
            entry = {"raw_id": m["raw_id"], "source_id": m.get("source_id"), "title": m.get("title"),
                     "url": m.get("url"), "extraction": str(outp.relative_to(_here.parent)),
                     "operator": rec["operator"].get("name"), "extraction_digest": digest,
                     "claims": len(rec.get("claims", [])), "assertions": len(extr.get("assertions", [])),
                     "source_curated": m.get("url") in src_urls, "actor_registered": nw_ref,
                     "attributed_to": len(att), "valid": not fails,
                     # 審核狀態機（curate.py 用）：pending→approved/rejected/deferred→compiled
                     "compile_status": prev.get("compile_status", "pending") if same else "pending"}
            if same and prev.get("note"): entry["note"] = prev["note"]
            queue[m["raw_id"]] = entry
            _write_queue(queue)                              # 先落盤 queue，再標 extracted → crash 時不會「extracted 卻不在 queue」
            m["extraction_status"] = "extracted"
            mp.write_text(json.dumps(m, ensure_ascii=False, indent=2), encoding="utf-8")
        except (Exception, SystemExit) as e:
            summary["errors"] += 1; print(f"  ✗ 失敗（{type(e).__name__}: {e}）{tag}"); continue
        summary["extracted"] += 1; summary["queued"] += 1
        flags = (("src✓" if entry["source_curated"] else "src✗") + " "
                 + (f"actor:{nw_ref}" if nw_ref else "actor✗")
                 + (" ⚠attributed" if att else "") + ("" if not fails else " ⚠invalid"))
        print(f"  ⟳ 抽取 {len(extr.get('mentions',[]))}m/{entry['assertions']}a → curation queue（{flags}）{tag}")
        # queue 於每篇 _write_queue 落盤（crash-safe）；此處不再整批重寫，避免 0 篇時覆寫既有 queue

    print("\n═══ summary ═══")
    print(f"  ready {summary['ready']}｜抽取 {summary['extracted']}｜無正文 {summary['no_text']}｜失敗 {summary['errors']}")
    if not args.dry_run:
        ready_to_compile = sum(1 for e in queue.values()
                               if e.get("compile_status") in ("pending", "approved")
                               and e["source_curated"] and e["actor_registered"]
                               and not e["attributed_to"] and e["valid"])
        print(f"  curation queue 共 {len(queue)} 篇（{QUEUE.relative_to(_here.parent)}）；"
              f"其中 source＋actor 皆已策展、無歸因、valid 者 {ready_to_compile} 篇可人工 compile")
        print(f"  審核 compile：python3 pipeline/curate.py list ｜ show <id> ｜ approve <id> ｜ compile"
              f"（安全 upsert；勿用 compile_to_db.py，那會整包覆蓋）")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
