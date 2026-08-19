#!/usr/bin/env python3
"""敏感標記紅線（STIX-PROFILE §8）：具名在地個人／媒體必須在中介格式帶標記，不能只存在於發布層。"""
import derive, pipeline

REG = derive.load_registry()
SENSITIVE_NAME = "中天"          # db.js 登錄為 sensitivity: domestic-named
PLAIN_NAME = "環球時報"          # 已登錄但非敏感

# 前提：資料層確實有這兩種實體，否則本測試失去意義
assert (REG.get(derive.norm(SENSITIVE_NAME)) or {}).get("sensitivity") == "domestic-named"
assert not (REG.get(derive.norm(PLAIN_NAME)) or {}).get("sensitivity")

def build(name):
    extr = {"report": {"name": "t", "url": "https://example.org/r", "org": "o",
                       "published": "2026", "type": "ngo-report"},
            "mentions": [{"tmp_id": "m1", "surface": name, "coarse_type": "media",
                          "quote": f"{name}轉發相關內容。", "source_url": "https://example.org/r"}],
            "assertions": []}
    bundle, sl, _log = pipeline.stix_from_extraction(extr, REG)
    return sl, bundle

# ① STIX-lite 帶著登錄的 sensitivity（derive 沿用，不自行判斷）
sl, bundle = build(SENSITIVE_NAME)
assert sl["objects"][0].get("sensitivity") == "domestic-named", sl["objects"][0]

# ② 序列化後：x_netweaver_sensitivity ＋ TLP:AMBER 都要在
obj = next(o for o in bundle["objects"] if o.get("name") == SENSITIVE_NAME)
assert obj.get("x_netweaver_sensitivity") == "domestic-named", obj
assert pipeline.TLP_AMBER_ID in obj["object_marking_refs"], obj["object_marking_refs"]

# ③ bundle 自足：TLP:AMBER 的定義物件要在 bundle 裡，不能留懸空 ref
tlp = [o for o in bundle["objects"] if o["id"] == pipeline.TLP_AMBER_ID]
assert len(tlp) == 1 and tlp[0]["definition"] == {"tlp": "amber"}, tlp
all_ids = {o["id"] for o in bundle["objects"]}
for o in bundle["objects"]:
    for ref in o.get("object_marking_refs", []):
        assert ref in all_ids, f"懸空 marking ref：{ref}"

# ④ 非敏感實體不得被誤標，也不得夾帶 TLP:AMBER 定義
sl2, bundle2 = build(PLAIN_NAME)
obj2 = next(o for o in bundle2["objects"] if o.get("name") == PLAIN_NAME)
assert "x_netweaver_sensitivity" not in obj2
assert pipeline.TLP_AMBER_ID not in obj2["object_marking_refs"]
assert not any(o["id"] == pipeline.TLP_AMBER_ID for o in bundle2["objects"]), "沒用到就不該塞定義物件"

# ⑤ 標記不得破壞既有不變量
fails, _att = pipeline.validate(bundle)
assert not fails, fails

print("敏感標記：通過（derive 沿用登錄值→序列化出 x_netweaver_sensitivity＋TLP:AMBER，bundle 自足）")
