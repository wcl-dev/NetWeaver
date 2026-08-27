#!/usr/bin/env python3
"""整本記錄簿匯出：型別依人工分類、id 與逐篇 bundle 一致、骨幹用 report 引用當 grounding。"""
import export_stix as X, pipeline, derive

DB = {
 "entities": [
   {"id": "gt", "name_zh": "環球時報", "name_en": "Global Times", "aliases": ["环球时报"],
    "category": "state-media", "role": "amplifier", "origin": "PRC", "confidence": "high",
    "summary_zh": "官媒。", "source_ids": ["s1"],
    "claims": [{"text": "環球時報轉發相關內容。", "source_id": "s1", "about": "環球時報"}]},
   {"id": "cti", "name_zh": "中天電視", "category": "domestic-amplifier", "role": "amplifier",
    "origin": "TW", "sensitivity": "domestic-named", "source_ids": ["s1"]},
   {"id": "cac", "name_zh": "中央網信辦", "category": "state-organ", "role": "attacker",
    "origin": "PRC", "source_ids": ["s1"]},
   {"id": "kol", "name_zh": "某評論者", "category": "commentator", "role": "amplifier",
    "origin": "TW", "source_ids": ["s1"]},
   {"id": "net", "name_zh": "某網絡", "category": "cib-network", "role": "attacker",
    "origin": "PRC", "source_ids": ["s1"], "related": ["gt"]},
   {"id": "orphan", "name_zh": "無來源實體", "category": "state-organ", "role": "attacker",
    "origin": "PRC", "source_ids": []},
 ],
 "events": [{"id": "e1", "name_zh": "某行動", "date": "2025-01", "type": "narrative-campaign",
             "participant_ids": ["gt"], "narratives": ["n1"], "source_ids": ["s1"]}],
 "narratives": [{"id": "n1", "name_zh": "某敘事", "source_ids": ["s1"]},
                {"id": "n2", "name_zh": "子敘事", "parent": "n1", "source_ids": ["s1"]}],
 "sources": [{"id": "s1", "org": "研究機構", "url": "https://example.org/r",
              "title": "某報告", "date": "2026-01", "type": "ngo-report"}],
}
b = X.build(DB)
byname = {o.get("name"): o for o in b["objects"] if o.get("name")}

# ① 型別依**人工登錄的 category**，不是模型的粗分類
assert byname["環球時報"]["type"] == "x-dad-channel"
assert byname["中央網信辦"]["type"] == "identity" and byname["中央網信辦"]["identity_class"] == "organization"
assert byname["某評論者"]["identity_class"] == "individual", "commentator 應為 individual（§8）"
assert byname["某網絡"]["type"] == "intrusion-set"
assert byname["某行動"]["type"] == "campaign" and byname["某敘事"]["type"] == "x-dad-narrative"

# ② id 與逐篇 bundle 同一套 UUIDv5 規則——否則下游合併會出現同一實體的分身
assert byname["環球時報"]["id"] == pipeline.sid("x-dad-channel", "環球時報")
assert derive.CATEGORY_KIND["state-media"] == "x-dad-channel", "兩邊必須共用同一張對照表"

# ③ 敏感實體帶 x_netweaver_sensitivity ＋ TLP:AMBER，且定義物件隨 bundle 附上
cti = byname["中天電視"]
assert cti["x_netweaver_sensitivity"] == "domestic-named"
assert pipeline.TLP_AMBER_ID in cti["object_marking_refs"]
assert any(o["id"] == pipeline.TLP_AMBER_ID for o in b["objects"])
assert "x_netweaver_sensitivity" not in byname["環球時報"], "非敏感實體不得被誤標"

# ④ claims → x_netweaver_evidence（宣稱那一層仍是 grounding 的來源）
assert byname["環球時報"]["x_netweaver_evidence"][0]["source_url"] == "https://example.org/r"

# ⑤ 關係：參與者用中性邊（§6 保守歸因），敘事用 uses，且不得產生 attributed-to
rels = [o for o in b["objects"] if o["type"] == "relationship"]
kinds = {r["relationship_type"] for r in rels}
assert "attributed-to" not in kinds, "匯出不得自行建立歸因"
assert ("related-to" in kinds) and ("uses" in kinds), kinds

# ⑥ 巢狀敘事以 parent 屬性表達
assert byname["子敘事"]["parent"] == byname["某敘事"]["id"]

# ⑦ 骨幹的 grounding＝被 report 引用；沒有來源的實體要被擋下
rep = [o for o in b["objects"] if o["type"] == "report"]
assert len(rep) == 1 and byname["環球時報"]["id"] in rep[0]["object_refs"]
uncited = X._uncited(b)
assert len(uncited) == 1 and "無來源實體" in uncited[0], uncited

# ⑧ 抽取路徑的 grounding 規則不得被放寬（否則模型可無中生有）
fails_strict, _ = pipeline.validate(b, require_evidence=True)
fails_loose, _ = pipeline.validate(b, require_evidence=False)
assert len(fails_strict) > len(fails_loose), "require_evidence 預設必須仍是嚴格的"

print("整本匯出：通過（人工分類決定型別＋id 一致＋敏感標記＋中性邊＋來源引用當 grounding）")
