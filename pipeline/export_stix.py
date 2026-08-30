#!/usr/bin/env python3
"""整本記錄簿 → 單一合法 STIX 2.1 bundle。

抽取管線只把「逐來源宣稱」這一層 STIX 化；記錄簿的骨幹（行為者檔案、事件、敘事、來源）
是人策展、直接寫進 data/db.js 的，從不經過 serializer——所以先前能匯出的只有宣稱那一層。
本模組補上另一半，讓整本記錄簿可以交換給吃 STIX 2.1 的工具（OpenCTI 等）。

對照依 docs/STIX-PROFILE.md §2；id 沿用 pipeline.sid() 的 UUIDv5 規則，**與逐篇 bundle 相同**
——同一個行為者在兩種 bundle 裡是同一個 STIX id，下游合併不會產生分身。

用法：python3 pipeline/export_stix.py [-o out.json]
"""
import argparse, importlib.util, json, pathlib, sys

_here = pathlib.Path(__file__).resolve().parent
def _load(n):
    s = importlib.util.spec_from_file_location(n, str(_here / (n + ".py")))
    m = importlib.util.module_from_spec(s); s.loader.exec_module(m); return m
pipe = _load("pipeline")
DBP = _here.parent / "data" / "db.js"

# category → STIX 型別：與 derive 共用同一張表，確保逐篇 bundle 與整本匯出的 id 一致
KIND = _load("derive").CATEGORY_KIND
CHANNEL_TYPE = {"state-media": "state-media", "domestic-amplifier": "domestic-amplifier"}

def load_db(path=None):
    src = (path or DBP).read_text(encoding="utf-8")
    i = src.index("{", src.index("window.NETWEAVER_DB")); j = src.rindex("}")
    return json.loads(src[i:j + 1])

def _sid_for(e):
    """實體的 STIX id：型別 ＋ name_zh 當 key，與逐篇 bundle 的 sid() 慣例一致。"""
    return pipe.sid(KIND.get(e.get("category"), "identity"), e.get("name_zh") or e["id"])

def build(db, ts="2026-01-01T00:00:00.000Z"):
    objs, used = [], set()
    mark_id = f"marking-definition--{pipe.uuid.uuid5(pipe.NS, 'mark:statement')}"
    tlp_used = False
    ent_sid, ev_sid, na_sid = {}, {}, {}

    for e in db.get("entities", []):                 # ---- 行為者 ----
        k = KIND.get(e.get("category"), "identity"); i = _sid_for(e); ent_sid[e["id"]] = i
        o = {"type": k, "spec_version": "2.1", "id": i, "created": ts, "modified": ts,
             "name": e.get("name_zh") or e["id"], "object_marking_refs": [mark_id]}
        aka = [a for a in ([e.get("name_en")] + (e.get("aliases") or [])) if a]
        if aka: o["aliases"] = aka
        if e.get("summary_zh"): o["description"] = e["summary_zh"]
        if e.get("confidence") in pipe.CONF: o["confidence"] = pipe.CONF[e["confidence"]]
        if k == "identity":
            o["identity_class"] = "individual" if e.get("category") == "commentator" else "organization"
        if k == "x-dad-channel":
            o["channel_type"] = CHANNEL_TYPE.get(e.get("category"), "media")
        if e.get("sensitivity") in pipe.SENSITIVE:
            o["x_netweaver_sensitivity"] = e["sensitivity"]
            o["object_marking_refs"].append(pipe.TLP_AMBER_ID); tlp_used = True
        ev = [{"quote": c["text"], "source_url": _src_url(db, c.get("source_id"))}
              for c in (e.get("claims") or []) if c.get("text")]
        if ev: o["x_netweaver_evidence"] = ev
        if k in pipe.XDAD_SDO:
            used.add(k); o["extensions"] = {pipe.extdef_id(k): {"extension_type": "new-sdo"}}
        objs.append(o)

    for n in db.get("narratives", []):               # ---- 敘事 ----
        i = pipe.sid("x-dad-narrative", n.get("name_zh") or n["id"]); na_sid[n["id"]] = i
        used.add("x-dad-narrative")
        o = {"type": "x-dad-narrative", "spec_version": "2.1", "id": i, "created": ts, "modified": ts,
             "name": n.get("name_zh") or n["id"], "object_marking_refs": [mark_id],
             "extensions": {pipe.extdef_id("x-dad-narrative"): {"extension_type": "new-sdo"}}}
        if n.get("name_en"): o["aliases"] = [n["name_en"]]
        if n.get("summary_zh"): o["description"] = n["summary_zh"]
        objs.append(o)
    for n in db.get("narratives", []):                # parent 需全部 id 就位後再掛
        if n.get("parent") and n["parent"] in na_sid:
            next(o for o in objs if o["id"] == na_sid[n["id"]])["parent"] = na_sid[n["parent"]]

    for v in db.get("events", []):                    # ---- 行動（§3：操作＝campaign）----
        i = pipe.sid("campaign", v.get("name_zh") or v["id"]); ev_sid[v["id"]] = i
        o = {"type": "campaign", "spec_version": "2.1", "id": i, "created": ts, "modified": ts,
             "name": v.get("name_zh") or v["id"], "object_marking_refs": [mark_id]}
        if v.get("name_en"): o["aliases"] = [v["name_en"]]
        if v.get("summary_zh"): o["description"] = v["summary_zh"]
        if v.get("date"): o["first_seen"] = pipe.iso(v["date"])
        if v.get("confidence") in pipe.CONF: o["confidence"] = pipe.CONF[v["confidence"]]
        objs.append(o)

    rels = []
    def rel(rt, s, t):
        if not s or not t: return
        i = pipe.sid("relationship", f"{rt}:{s}:{t}")
        if any(r["id"] == i for r in rels): return
        rels.append({"type": "relationship", "spec_version": "2.1", "id": i, "created": ts,
                     "modified": ts, "relationship_type": rt, "source_ref": s, "target_ref": t,
                     "object_marking_refs": [mark_id]})
    for e in db.get("entities", []):                  # 實體↔實體：關係皆人工登錄（add-relation／歸因核可）
        for r in (e.get("related") or []):
            if isinstance(r, str):                    # 舊形態：純 id 字串 → 中性邊
                rel("related-to", ent_sid.get(e["id"]), ent_sid.get(r)); continue
            # 實際 schema 是 {"target_id","relation",...}。原本讀 r.get("id") 永遠是 None，
            # 全書匯出把人工關係**整批靜默丟掉**；且型別被壓成 related-to，丟失
            # runs／operated-by／subsidiary-of／attributed-to 的語意。兩者都不可接受：
            # db.js 裡的關係全是人工決定（attributed-to 更是逐則核可），匯出必須忠實。
            rel(r.get("relation") or "related-to", ent_sid.get(e["id"]), ent_sid.get(r.get("target_id")))
    for v in db.get("events", []):                    # 行動→參與者：§6 中性邊，不用 attributed-to
        for pid in (v.get("participant_ids") or []): rel("related-to", ev_sid.get(v["id"]), ent_sid.get(pid))
        for nid in (v.get("narratives") or []):       # 行動→敘事：uses
            rel("uses", ev_sid.get(v["id"]), na_sid.get(nid))
    objs.extend(rels)

    for s in db.get("sources", []):                   # ---- 來源＝report ----
        cited = [ent_sid[e["id"]] for e in db.get("entities", []) if s["id"] in (e.get("source_ids") or [])]
        cited += [ev_sid[v["id"]] for v in db.get("events", []) if s["id"] in (v.get("source_ids") or [])]
        cited += [na_sid[n["id"]] for n in db.get("narratives", []) if s["id"] in (n.get("source_ids") or [])]
        if not cited: continue                        # 沒有任何物件引用 → 不建空 report
        objs.append({"type": "report", "spec_version": "2.1", "id": pipe.sid("report", s.get("url") or s["id"]),
                     "created": ts, "modified": ts, "name": s.get("title") or s["id"],
                     "published": pipe.iso(s.get("date")), "object_refs": sorted(set(cited)),
                     "external_references": [{"source_name": s.get("org") or "source", "url": s.get("url", "")}],
                     "object_marking_refs": [mark_id]})

    for k in sorted(used):
        objs.append({"type": "extension-definition", "spec_version": "2.1", "id": pipe.extdef_id(k),
                     "created": ts, "modified": ts, "name": f"NetWeaver {k}",
                     "schema": "local; pending OASIS DAD-CDM", "version": "0.1",
                     "extension_types": ["new-sdo" if k in pipe.XDAD_SDO else "new-sro"]})
    if tlp_used: objs.append(dict(pipe.TLP_AMBER))
    objs.append({"type": "marking-definition", "spec_version": "2.1", "id": mark_id, "created": ts,
                 "definition_type": "statement",
                 "definition": {"statement": "記錄公開研究中被點名者，非法律指控。"
                                             "Documents public research; not a legal accusation."}})
    return {"type": "bundle", "id": f"bundle--{pipe.uuid.uuid5(pipe.NS, 'bundle:netweaver-db')}", "objects": objs}

def _src_url(db, sid):
    for s in db.get("sources", []):
        if s["id"] == sid: return s.get("url", "")
    return ""

def _uncited(bundle):
    """骨幹版的 grounding：每個實體／行動／敘事都必須至少被一個 report 引用。

    人策展的物件不掛逐字引文，它的憑據是 `source_ids`——序列化成 report.object_refs。
    沒有任何來源引用的物件＝記錄簿裡查無出處的條目，該被擋下。
    """
    cited = set()
    for o in bundle["objects"]:
        if o["type"] == "report": cited.update(o.get("object_refs") or [])
    skip = {"report", "extension-definition", "marking-definition", "relationship"}
    return [f"無來源引用: {o['id']}（{o.get('name','')}）"
            for o in bundle["objects"] if o["type"] not in skip and o["id"] not in cited]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("-o", "--out", default=str(_here / "out" / "netweaver-db.stix.json"))
    a = ap.parse_args()
    db = load_db(); bundle = build(db)
    fails, att = pipe.validate(bundle, require_evidence=False)
    fails += _uncited(bundle)                        # 骨幹的憑據＝被 report 引用，非逐字引文
    p = pathlib.Path(a.out); p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(bundle, ensure_ascii=False, indent=2), encoding="utf-8")
    from collections import Counter
    c = Counter(o["type"] for o in bundle["objects"])
    print(f"整本記錄簿 → {p}（{p.stat().st_size/1024:.0f}KB）")
    for t, n in sorted(c.items()): print(f"  {t:<22}{n:>4}")
    print(f"  ── 合計 {len(bundle['objects'])} 物件｜attributed-to {att and len(att) or 0}")
    if fails:
        print(f"⚠ profile 不變量未過 {len(fails)} 項："); [print("   ·", f) for f in fails[:8]]
        return 1
    print("✓ 通過 profile 不變量")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
