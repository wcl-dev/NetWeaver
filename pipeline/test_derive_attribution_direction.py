#!/usr/bin/env python3
"""紅線回歸：控制述詞的**語態**決定歸因方向，主動與被動不可混為一談。

英文「A is operated by B」是被動——A 是被操作的一方。
中文「A 運用 B」是主動——A 是操作方。

原本兩者都對到 operated-by 且不翻方向，於是中文主動句的歸因整個反過來。實測
NSB〈2025 年中共對臺認知作戰操作手法分析〉逐字證據「中共公安部運用「龍橋」」
產生了 attributed-to(中共公安部 → 龍橋)，讀起來是「公安部歸屬於網軍集團」。
歸因是這個專案最敏感的一條路徑，方向錯了比不做還糟。

本測試鎖住：
  ① 被動：A is operated by B → attributed-to(A → B)，B 升 threat-actor
  ② 主動：A 運用 B         → attributed-to(B → A)，A 升 threat-actor
  ③ 述詞分桶正確（被動樣式須排在主動之前，否則 "hired by" 會被 "hired" 吃掉）
用法：python3 pipeline/test_derive_attribution_direction.py（exit 0＝過）
"""
import importlib.util, pathlib

_here = pathlib.Path(__file__).resolve().parent
def _load(name):
    spec = importlib.util.spec_from_file_location(name, str(_here / (name + ".py")))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

D = _load("derive")
reg = D.load_registry()
fails = []

def run(pred, quote):
    men = lambda t, s, c: {"tmp_id": t, "surface": s, "coarse_type": c,
                           "quote": quote, "source_url": "u"}
    extr = {"report": {"name": "t", "url": "u", "org": "o", "published": "2026", "type": "gov-report"},
            "mentions": [men("m1", "甲機關", "org"), men("m2", "乙網絡", "network")],
            "assertions": [{"subject": "m1", "predicate": pred, "object": "m2",
                            "quote": quote, "source_url": "u"}]}
    sl, _log = D.derive(extr, reg)
    att = [r for r in sl["relationships"] if r["type"] == "attributed-to"]
    objs = {o["tmp_id"]: o for o in sl["objects"]}
    return att, objs

# ① 被動：甲 is operated by 乙 → 甲 歸因於 乙
att, objs = run("is operated by", "甲機關 is operated by 乙網絡。")
if len(att) != 1: fails.append(f"① 應產生 1 條 attributed-to，得 {len(att)}")
elif (att[0]["source"], att[0]["target"]) != ("m1", "m2"):
    fails.append(f"① 被動應為 m1→m2（甲歸因於乙），得 {att[0]['source']}→{att[0]['target']}")

# ② 主動：甲 運用 乙 → **乙** 歸因於 **甲**（方向與被動相反）
att, objs = run("運用", "甲機關運用「乙網絡」散布訊息。")
if len(att) != 1: fails.append(f"② 應產生 1 條 attributed-to，得 {len(att)}")
elif (att[0]["source"], att[0]["target"]) != ("m2", "m1"):
    fails.append(f"② 主動應為 m2→m1（乙歸因於甲），得 {att[0]['source']}→{att[0]['target']}")

# ③ 述詞分桶：被動樣式必須先比對到
for pred, want in (("operated by", "operated-by"), ("run by", "operated-by"),
                   ("hired by", "operated-by"), ("受僱於", "operated-by"),
                   ("hired", "runs"), ("運用", "runs"), ("操控", "runs"),
                   ("經營", "runs"), ("僱用", "runs")):
    got = D.rel_of(pred)
    if got != want: fails.append(f"③ 述詞「{pred}」應為 {want}，得 {got}")

# ④ 官媒子品牌（被動）：甲 是 乙 打造的自媒體品牌 → 甲 歸因於 乙（與 ① 同向）
att, objs = run("打造的自媒體品牌", "甲機關是乙網絡打造的自媒體品牌。")
if len(att) != 1: fails.append(f"④ 子品牌應產生 1 條 attributed-to，得 {len(att)}")
elif (att[0]["source"], att[0]["target"]) != ("m1", "m2"):
    fails.append(f"④ 子品牌被動應為 m1→m2，得 {att[0]['source']}→{att[0]['target']}")

# ④b 分桶：被動子品牌樣式 → operated-by；但主動「打造」（無『的…品牌』）不得誤吃
for pred, want in (("是該台打造的自媒體品牌", "operated-by"), ("為央視融媒體品牌", "operated-by"),
                   ("打造的自媒體品牌", "operated-by"), ("打造了一個網絡", "related-to")):
    got = D.rel_of(pred)
    if got != want: fails.append(f"④b 述詞「{pred}」應為 {want}，得 {got}")

print("紅線回歸（控制述詞的語態決定歸因方向）")
print(f"  ① 被動 A→B｜② 主動 B→A｜③ 述詞分桶｜④ 官媒子品牌被動歸因 → {'全數符合' if not fails else '有問題'}")
if fails:
    print("✗ 失敗："); [print("   -", f) for f in fails]; raise SystemExit(1)
print("✓ 通過")
