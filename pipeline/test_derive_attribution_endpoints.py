#!/usr/bin/env python3
"""紅線回歸：控制述詞的兩端若不是「叫得出名字的行為者」，不得建 attributed-to。

實測案例（IORG a3053868cdcbcaf8）：模型把「美國運用台灣」的主詞標成 place，
derive 產生的 location 物件沒有 name 欄位。原本的 log 直接讀 sub["name"] 而
當掉，整篇 560 mentions / 22 assertions 被丟掉；就算不當掉，照建也會產出
一則「地點歸因給地點」的 attributed-to——正是紅線要擋的東西。

同時鎖住：端點不完整時控制述詞必須**降為 related-to**，不可原樣保留。
資訊更少的情況不該讓更強的主張通過。
用法：python3 pipeline/test_derive_attribution_endpoints.py（exit 0＝過）
"""
import importlib.util, pathlib

_here = pathlib.Path(__file__).resolve().parent
def _load(name):
    spec = importlib.util.spec_from_file_location(name, str(_here / (name + ".py")))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

D = _load("derive")
reg = D.load_registry()
fails = []

def run(mentions, assertions):
    return D.derive({"report": {"name": "t", "url": "u", "org": "o",
                                "published": "2026", "type": "ngo-report"},
                     "mentions": mentions, "assertions": assertions}, reg)

Q = "中共官媒運用環球時報擴散敘事。"                     # 「運用」→ operated-by（CONTROL）；無 hedge → 信心 medium
def men(tid, surf, ct): return {"tmp_id": tid, "surface": surf, "coarse_type": ct, "quote": Q, "source_url": "u"}
def ass(s, t, pred="運用"): return {"subject": s, "predicate": pred, "object": t, "quote": Q, "source_url": "u"}

# ① 主詞是地點（沒有 name）
sl, log = run([men("m1", "美國", "place"), men("m2", "台灣", "media")], [ass("m1", "m2")])
rels = sl["relationships"]
if any(r["type"] == "attributed-to" for r in rels):
    fails.append("① 地點當主詞不應建 attributed-to")
if [r["type"] for r in rels] != ["related-to"]:
    fails.append(f"① 應降為 related-to，得 {[r['type'] for r in rels]}")
if {o["tmp_id"]: o for o in sl["objects"]}.get("m2", {}).get("kind") == "threat-actor":
    fails.append("① 端點不完整時不應升 threat-actor")

# ② 受詞指向不存在的 tmp_id（span-check 丟掉該 mention 時會發生）
sl, _ = run([men("m1", "中共官媒", "media")], [ass("m1", "m404")])
rels = sl["relationships"]
if any(r["type"] == "attributed-to" for r in rels):
    fails.append("② 端點不存在不應建 attributed-to")
if [r["type"] for r in rels] != ["related-to"]:
    fails.append(f"② 應降為 related-to，得 {[r['type'] for r in rels]}")

# ③ 對照組：兩端都是具名行為者 → 仍應照常建 attributed-to（不可因修補而擋掉正常路徑）
sl, _ = run([men("m1", "中共官媒", "media"), men("m2", "環球時報", "media")], [ass("m1", "m2")])
if not any(r["type"] == "attributed-to" for r in sl["relationships"]):
    fails.append("③ 兩端具名時應照常建 attributed-to（修補不得擋住正常歸因）")

print("紅線回歸（歸因端點完整性）")
print(f"  ① 地點主詞｜② 端點不存在｜③ 正常具名 → {'全數符合' if not fails else '有問題'}")
if fails:
    print("✗ 失敗："); [print("   -", f) for f in fails]; raise SystemExit(1)
print("✓ 通過")
