#!/usr/bin/env python3
"""NetWeaver ③ 最小可跑抽取管線。

  STIX-lite（LLM 語意產出） → serialize（碼→合法 STIX 2.1） → validate（profile 不變量） → project（operator 視圖）

用法: python3 pipeline/pipeline.py pipeline/samples/anti-dpp.stixlite.json
規格見 docs/STIX-PROFILE.md。純 stdlib、決定性（UUIDv5、固定時戳）。
"""
import json, sys, uuid, re, pathlib

NS = uuid.uuid5(uuid.NAMESPACE_URL, "https://github.com/wcl-dev/NetWeaver")
CONF = {"low": 30, "medium": 60, "high": 85}
XDAD_SDO = {"x-dad-narrative", "x-dad-channel", "x-dad-media-content", "x-dad-event"}
XDAD_REL = {"x-dad-publishes", "x-dad-amplifies", "x-dad-leverages"}
SCO = {"url", "ipv4-addr", "email-addr", "domain-name"}
COPY_FIELDS = ("description", "aliases", "identity_class", "country", "channel_type", "content_type")

def iso(d):
    d = d or "1970-01-01"
    if len(d) == 4: d += "-01-01"
    elif len(d) == 7: d += "-01"
    return d + "T00:00:00.000Z"

def sid(typ, key):      # 決定性 STIX id（§10）
    return f"{typ}--{uuid.uuid5(NS, typ + ':' + key)}"

def extdef_id(typ):
    return f"extension-definition--{uuid.uuid5(NS, 'extdef:' + typ)}"

# ---------- serialize: STIX-lite → 合法 STIX 2.1 ----------
def serialize(lite):
    rep = lite["report"]; ts = iso(rep.get("published"))
    mark_id = f"marking-definition--{uuid.uuid5(NS, 'mark:statement')}"
    idmap, objs, used = {}, [], set()

    for o in lite["objects"]:                    # 先配 id
        k = o["kind"]
        key = o.get("value") if k in SCO else (o.get("country") if k == "location" else o.get("name") or o["tmp_id"])
        idmap[o["tmp_id"]] = sid(k, key or o["tmp_id"])

    for o in lite["objects"]:                    # 建物件
        k = o["kind"]; i = idmap[o["tmp_id"]]
        if k in SCO:
            objs.append({"type": k, "spec_version": "2.1", "id": i, "value": o.get("value") or o.get("name")})
            continue
        so = {"type": k, "spec_version": "2.1", "id": i, "created": ts, "modified": ts}
        if o.get("name"): so["name"] = o["name"]
        if o.get("first_seen"): so["first_seen"] = iso(o["first_seen"])
        for f in COPY_FIELDS:
            if o.get(f) is not None: so[f] = o[f]
        if o.get("confidence"): so["confidence"] = CONF[o["confidence"]]
        so["object_marking_refs"] = [mark_id]
        if k in XDAD_SDO:
            used.add(k); so["extensions"] = {extdef_id(k): {"extension_type": "new-sdo"}}
        if o.get("evidence"): so["x_netweaver_evidence"] = o["evidence"]
        objs.append(so)

    rel_ids = []
    for r in lite["relationships"]:              # 建關係 SRO
        rt = r["type"]; s = idmap[r["source"]]; t = idmap[r["target"]]
        i = sid("relationship", f"{rt}:{s}:{t}")
        so = {"type": "relationship", "spec_version": "2.1", "id": i, "created": ts, "modified": ts,
              "relationship_type": rt, "source_ref": s, "target_ref": t, "object_marking_refs": [mark_id]}
        if r.get("confidence"): so["confidence"] = CONF[r["confidence"]]
        if r.get("evidence"): so["x_netweaver_evidence"] = r["evidence"]
        if rt in XDAD_REL:
            used.add(rt); so["extensions"] = {extdef_id(rt): {"extension_type": "new-sro"}}
        objs.append(so); rel_ids.append(i)

    for k in sorted(used):                        # 擴充定義
        objs.append({"type": "extension-definition", "spec_version": "2.1", "id": extdef_id(k),
                     "created": ts, "modified": ts, "name": f"NetWeaver {k}",
                     "schema": "local; pending OASIS DAD-CDM", "version": "0.1",
                     "extension_types": ["new-sdo" if k in XDAD_SDO else "new-sro"]})
    objs.append({"type": "marking-definition", "spec_version": "2.1", "id": mark_id, "created": ts,
                 "definition_type": "statement",
                 "definition": {"statement": "記錄公開研究中被點名者，非法律指控。Documents public research; not a legal accusation."}})

    ref_ids = [idmap[o["tmp_id"]] for o in lite["objects"]] + rel_ids
    objs.insert(0, {"type": "report", "spec_version": "2.1", "id": sid("report", rep["url"]),
                    "created": ts, "modified": ts, "name": rep["name"], "published": ts,
                    "report_types": ["fimi"], "object_refs": ref_ids,
                    "external_references": [{"source_name": rep["org"], "url": rep["url"]}]})
    return {"type": "bundle", "id": f"bundle--{uuid.uuid5(NS, 'bundle:' + rep['url'])}", "objects": objs}

# ---------- validate: profile 不變量 ----------
def validate(bundle):
    objs = bundle["objects"]; byid = {o["id"]: o for o in objs}; fails = []
    for o in objs:
        if not re.match(r"^[a-z0-9-]+--[0-9a-f]{8}-[0-9a-f-]{27}$", o["id"]):
            fails.append("非 UUIDv5 id: " + o["id"])
    for o in objs:
        if o["type"] == "relationship":
            for ref in (o["source_ref"], o["target_ref"]):
                if ref not in byid: fails.append("懸空 SRO ref: " + ref)
    touched = set()                               # 有 evidence 的關係碰到的物件
    for o in objs:
        if o["type"] == "relationship" and o.get("x_netweaver_evidence"):
            touched.update((o["source_ref"], o["target_ref"]))
    for o in objs:                                # grounding：被抽取物件需 evidence（或有 evidence 關係碰到）；SCO/參照免
        if o["type"] in ("report", "extension-definition", "marking-definition", "relationship") or o["type"] in SCO:
            continue
        if not o.get("x_netweaver_evidence") and o["id"] not in touched:
            fails.append("無 grounding: " + o["id"])
    att = [o for o in objs if o.get("relationship_type") == "attributed-to"]
    return fails, att

# ---------- project: STIX → operator 三層視圖 ----------
def project(bundle, text=None):
    """text＝該報告正文時，claim 引文沿原文擴張成完整句並濾掉標題／提問（**純呈現層**）。

    刻意放在 derive 之後：derive 會從引文找 hedge 詞算 confidence／歸因，若在它之前擴張，
    擴出來的字會反過來動到歸因紅線。STIX bundle 的 evidence 一律保留模型原始 span（忠實記錄），
    擴張只作用在投影出的 claim 卡。無正文（樣本／人工 extraction）→ 維持原行為。
    """
    objs = bundle["objects"]; byid = {o["id"]: o for o in objs}
    ta = [o for o in objs if o["type"] == "threat-actor"]
    ims = [o for o in objs if o["type"] == "intrusion-set"]
    camp = [o for o in objs if o["type"] == "campaign"]
    rels = [o for o in objs if o["type"] == "relationship"]
    op = ta[0] if ta else (ims[0] if ims else None)
    if op is None:                                # 供應商/公司型：取 campaign related-to 的 identity 當 operator
        for r in rels:
            if r["relationship_type"] in ("related-to", "attributed-to"):
                t = byid.get(r["target_ref"])
                if t and t["type"] == "identity": op = t; break
    attributed = any(r["relationship_type"] == "attributed-to" for r in rels)
    claims, seen = [], set()                      # 去重：同一（物件 × 來源 × 正規化引文）只留一次
    for o in objs:                                # 含物件：同一句可同時佐證多個實體，不該被別的實體先搶走
        for e in (o.get("x_netweaver_evidence") or []):
            quote = _extract_mod().snap_quote(text, e["quote"]) if text else e["quote"]
            if text and not _extract_mod().is_claim_span(quote): continue
            key = o["id"] + "|" + e["source_url"] + "|" + re.sub(r"[\s\W]+", "", quote.lower())
            if key in seen: continue
            seen.add(key)
            claims.append({"about": o.get("name") or o.get("relationship_type") or o["type"],
                           "quote": quote, "source": e["source_url"]})
    uses = [byid[r["target_ref"]] for r in rels if r["relationship_type"] == "uses"]
    tgts = [byid[r["target_ref"]] for r in rels if r["relationship_type"] == "targets"]
    return {
        "operator": {"id": op["id"] if op else None, "name": op.get("name") if op else None,
                     "stix_type": op["type"] if op else None,
                     "attribution": "具名（attributed-to，需人工確認）" if attributed else "未歸因（停在 IMS/identity）",
                     "confidence": op.get("confidence") if op else None},
        "operations": [{"id": c["id"], "name": c.get("name"), "first_seen": c.get("first_seen")} for c in camp],
        "claims": claims,
        "channels": [u.get("name") for u in uses if u["type"] == "x-dad-channel"],
        "narratives": [u.get("name") for u in uses if u["type"] == "x-dad-narrative"],
        "targets": [t.get("name") or t.get("country") for t in tgts],
    }

_EXTRACT_MOD = None
def _extract_mod():                                 # 句界／宣稱閘與 assertion 切窗共用同一套規則
    global _EXTRACT_MOD
    if _EXTRACT_MOD is None:
        import importlib.util
        p = pathlib.Path(__file__).resolve().parent / "extract.py"
        spec = importlib.util.spec_from_file_location("extract", str(p))
        m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); _EXTRACT_MOD = m
    return _EXTRACT_MOD

def _derive_mod():                                  # 以路徑載入 derive.py（免 sys.path 問題）
    import importlib.util
    p = pathlib.Path(__file__).resolve().parent / "derive.py"
    spec = importlib.util.spec_from_file_location("derive", str(p))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

def stix_from_extraction(extr, reg=None):           # extraction → derive（碼判斷）→ 合法 STIX
    D = _derive_mod(); reg = reg if reg is not None else D.load_registry()
    sl, log = D.derive(extr, reg)
    return serialize(sl), sl, log

def main():
    src = pathlib.Path(sys.argv[1])
    extr = json.loads(src.read_text(encoding="utf-8"))
    bundle, sl, log = stix_from_extraction(extr)
    fails, att = validate(bundle)
    outdir = src.parent.parent / "out"; outdir.mkdir(exist_ok=True)
    outp = outdir / (src.stem.split(".")[0] + ".stix.json")
    outp.write_text(json.dumps(bundle, ensure_ascii=False, indent=2), encoding="utf-8")
    print("=== ① 模型抽取 → ② 碼判斷（derive；模型不做分類/評分/歸因，換模型也穩）===")
    for l in log: print("  · " + l)
    print("=== ③ serialize → 合法 STIX 2.1 ===")
    print(f"  bundle 物件數: {len(bundle['objects'])}  →  {outp}")
    print("=== ④ 驗證（profile 不變量）===")
    print("  " + ("✓ id 皆 UUIDv5 · 無懸空 SRO · grounding 完整" if not fails else "⚠ " + " | ".join(fails)))
    print(f"  歸因閘（碼判）：attributed-to = {len(att)}" + ("（停在 IMS）" if not att else "（明確歸因 → 需人工確認）"))
    p = project(bundle)
    print("=== ⑤ 投影 → operator 三層（逐來源 claim ＝ 真 B）===")
    print(json.dumps({"L1_operator": p["operator"], "L2_operation": p["operations"],
                      "L3_claims": p["claims"], "channels": p["channels"],
                      "narratives": p["narratives"], "targets": p["targets"]}, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
