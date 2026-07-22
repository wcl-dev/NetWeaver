#!/usr/bin/env python3
"""allowlist 過濾回歸測試（documented not accused 的碼閘）：derive 只把「主詞已登錄，且受詞已登錄
或為敘事/地點類非當事方」的關係標 publishable；主詞未登錄、或受詞是未登錄當事方 → held（不進記錄簿，
留作待登錄佇列）。這是「模型 liberal 抽取 → 碼 allowlist 過濾」閉環的 edge 環。
用法：python3 pipeline/test_derive_allowlist.py（exit 0＝過）
"""
import importlib.util, pathlib

_here = pathlib.Path(__file__).resolve().parent
def _load(name):
    spec = importlib.util.spec_from_file_location(name, str(_here / (name + ".py")))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

D = _load("derive")
reg = D.load_registry()

# 網信辦→cac、環球時報→global-times 皆為 db.js 已登錄實體；未登錄媒體、台灣則否
extr = {
    "report": {"name": "t", "url": "u", "org": "o", "published": "2026", "type": "ngo-report"},
    "mentions": [
        {"tmp_id": "m1", "surface": "網信辦", "coarse_type": "org", "quote": "網信辦指揮", "source_url": "u"},
        {"tmp_id": "m2", "surface": "環球時報", "coarse_type": "media", "quote": "環球時報轉發", "source_url": "u"},
        {"tmp_id": "m3", "surface": "台灣終將回歸", "coarse_type": "narrative", "quote": "台灣終將回歸", "source_url": "u"},
        {"tmp_id": "m4", "surface": "某不知名自媒體", "coarse_type": "media", "quote": "某不知名自媒體", "source_url": "u"},
        {"tmp_id": "m5", "surface": "台灣", "coarse_type": "place", "quote": "針對台灣", "source_url": "u"},
    ],
    "assertions": [
        {"subject": "m1", "predicate": "轉發", "object": "m2", "quote": "網信辦轉發環球時報", "source_url": "u"},   # 登錄→登錄
        {"subject": "m1", "predicate": "散布", "object": "m3", "quote": "網信辦散布台灣終將回歸", "source_url": "u"}, # 登錄→敘事
        {"subject": "m4", "predicate": "轉發", "object": "m2", "quote": "某不知名自媒體轉發環球時報", "source_url": "u"}, # 未登錄主詞
        {"subject": "m1", "predicate": "轉發", "object": "m4", "quote": "網信辦轉發某不知名自媒體", "source_url": "u"}, # 受詞為未登錄當事方
        {"subject": "m1", "predicate": "針對", "object": "m5", "quote": "網信辦針對台灣", "source_url": "u"},        # 登錄→地點(target)
    ],
}

sl, log = D.derive(extr, reg)
pub = {(r["source"], r["target"]): (r.get("publishable"), r.get("hold_reason")) for r in sl["relationships"]}
fails = []

def check(k, want_pub, want_reason=None):
    got_pub, got_reason = pub.get(k, (None, None))
    if got_pub != want_pub: fails.append(f"{k} publishable 應={want_pub}，得 {got_pub}")
    if want_reason and got_reason != want_reason: fails.append(f"{k} hold_reason 應={want_reason}，得 {got_reason}")

check(("m1", "m2"), True)                                   # 登錄→登錄：發布
check(("m1", "m3"), True)                                   # 登錄→敘事：發布（非當事方）
check(("m4", "m2"), False, "subject-not-documented")        # 主詞未登錄：held
check(("m1", "m4"), False, "object-undocumented-party")     # 受詞是未登錄當事方：held（不指控未策展對象）
check(("m1", "m5"), True)                                   # 登錄→地點(target)：發布

print("allowlist 過濾（documented not accused 的 edge 環）")
for k in [("m1","m2"),("m1","m3"),("m4","m2"),("m1","m4"),("m1","m5")]:
    p, rsn = pub.get(k, (None, None))
    print(f"  {k}: publishable={p}" + (f"（{rsn}）" if rsn else ""))
if fails:
    for f in fails: print(f"  ✗ {f}")
    print("→ 失敗"); raise SystemExit(1)
print("→ 通過：liberal 抽取的邊，只有『主詞已登錄＋受詞登錄或非當事方』進記錄簿，其餘 held 待登錄")
