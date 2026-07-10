#!/usr/bin/env python3
"""把 ③ 管線的投影 claims 併入 data/db.js（B-lite → 真 B 的逐筆升級）。
用法: python3 pipeline/compile_to_db.py pipeline/samples/*.stixlite.json
對每個樣本：serialize→project 取 claims，依樣本的 nw_ref 對到既有 db.js 實體，
claim 的 source_url 對到 source_id，寫成 entity.claims[]（前端雙模式渲染 → 真 B）。
"""
import json, sys, pathlib, importlib.util

_here = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("pipe", str(_here / "pipeline.py"))
pipe = importlib.util.module_from_spec(spec); spec.loader.exec_module(pipe)
REG = pipe._derive_mod().load_registry()   # 判斷層查表用（載一次）

DBP = _here.parent / "data" / "db.js"
src = DBP.read_text(encoding="utf-8")
i = src.index("{", src.index("window.NETWEAVER_DB")); j = src.rindex("}")
db = json.loads(src[i:j + 1])
url2sid = {s["url"]: s["id"] for s in db["sources"]}
ent = {e["id"]: e for e in db["entities"]}

patched = []
for sp in sys.argv[1:]:
    extr = json.loads(pathlib.Path(sp).read_text(encoding="utf-8"))
    bundle, sl, _ = pipe.stix_from_extraction(extr, REG)
    nw_ref = next((o.get("nw_ref") for o in sl["objects"] if o.get("nw_ref")), None)
    if not nw_ref or nw_ref not in ent:
        print(f"  ⚠ {pathlib.Path(sp).name}: nw_ref={nw_ref} 不在 db.js，略過"); continue
    rec = pipe.project(bundle)
    claims, miss = [], 0
    for c in rec["claims"]:
        sid = url2sid.get(c["source"])
        if not sid: miss += 1; continue
        claims.append({"text": c["quote"], "source_id": sid, "about": c["about"]})
    ent[nw_ref]["claims"] = claims
    patched.append((nw_ref, len(claims), miss))

DBP.write_text(src[:i] + json.dumps(db, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")

print("=== 併入 claims（真 B，逐筆升級）===")
for nw, n, miss in patched:
    print(f"  ✓ {nw}: +{n} claims" + (f"（{miss} 條來源未對到 source_id）" if miss else ""))
sids = set(s["id"] for s in db["sources"])
bad = [(e["id"], c["source_id"]) for e in db["entities"] for c in (e.get("claims") or []) if c["source_id"] not in sids]
print("  " + ("✓ 所有 claim.source_id 皆存在" if not bad else "⚠ 懸空: " + str(bad)))
print(f"  帶 claims（真 B）的實體: {sum(1 for e in db['entities'] if e.get('claims'))} / {len(db['entities'])}")
