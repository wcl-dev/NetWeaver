#!/usr/bin/env python3
"""紅線回歸測試（Codex v0.2.1 要求）：amplified-voice 情境的逐字述詞 `放大`/`呼應`
經 derive 只落非控制關係（amplifies/related-to），**不建 attributed-to、不升 threat-actor**——
即使模型沒有 context_role 概念，「記錄，不指控」的紅線仍由述詞 ladder 在執行時守住。
用法：python3 pipeline/test_derive_redline.py（exit 0＝過）
"""
import importlib.util, pathlib

_here = pathlib.Path(__file__).resolve().parent
def _load(name):
    spec = importlib.util.spec_from_file_location(name, str(_here / (name + ".py")))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

D = _load("derive")
reg = D.load_registry()

extr = {
    "report": {"name": "t", "url": "u", "org": "o", "published": "2026", "type": "ngo-report"},
    "mentions": [
        {"tmp_id": "m1", "surface": "中共官媒", "coarse_type": "media", "quote": "中共官媒", "source_url": "u"},
        {"tmp_id": "m2", "surface": "鄭麗文", "coarse_type": "person", "quote": "鄭麗文", "source_url": "u"},
        {"tmp_id": "m3", "surface": "多数国家奉行一中政策", "coarse_type": "narrative", "quote": "多数国家奉行一中政策", "source_url": "u"},
    ],
    "assertions": [
        {"subject": "m1", "predicate": "放大", "object": "m2", "quote": "獲中共官媒放大", "source_url": "u"},
        {"subject": "m2", "predicate": "呼應", "object": "m3", "quote": "鄭麗文呼應中共官方立場", "source_url": "u"},
    ],
}

sl, log = D.derive(extr, reg)
rels = sl["relationships"]
by = {(r["source"], r["target"]): r["type"] for r in rels}
objs = {o["tmp_id"]: o for o in sl["objects"]}
fails = []

if by.get(("m1", "m2")) != "amplifies": fails.append(f"放大 應→amplifies，得 {by.get(('m1','m2'))}")
if by.get(("m2", "m3")) != "related-to": fails.append(f"呼應 應→related-to，得 {by.get(('m2','m3'))}")
if any(r["type"] == "attributed-to" for r in rels): fails.append("不應出現 attributed-to（紅線）")
if objs.get("m2", {}).get("kind") == "threat-actor": fails.append("鄭麗文（amplified-voice）不應升 threat-actor")

for l in log:
    if "attributed-to" in l: fails.append(f"log 出現歸因：{l}")

print("紅線回歸（amplified-voice：放大／呼應 不歸因）")
print(f"  放大 → {by.get(('m1','m2'))}｜呼應 → {by.get(('m2','m3'))}｜attributed-to 數 = {sum(1 for r in rels if r['type']=='attributed-to')}")
if fails:
    for f in fails: print(f"  ✗ {f}")
    print("→ 失敗")
    raise SystemExit(1)
print("→ 通過：逐字記『放大/呼應』不會被碼升級為歸因（documented, not accused）")
