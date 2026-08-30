#!/usr/bin/env python3
"""claim 引文：擴張成完整句、保持原文 exact、標題／提問不成為宣稱，且不得回頭影響 derive。"""
import copy, extract, pipeline, run_loop

TEXT = ("軍演概述。東部戰區融媒體中心被外界稱為「中央廚房」，本研究拆解其宣傳工作。\n"
        "東部戰區融媒體中心扮演的角色\n"
        "央視亦發布相關新聞。其後續影響仍待觀察。\n")

# ① 子句 → 擴張回整句，且仍是原文 exact 子字串
snapped = extract.snap_quote(TEXT, "東部戰區融媒體中心被外界稱為「中央廚房」，")
assert snapped == "東部戰區融媒體中心被外界稱為「中央廚房」，本研究拆解其宣傳工作。", snapped
assert snapped in TEXT
assert extract.snap_quote(TEXT, "央視亦發布相關新聞。") == "央視亦發布相關新聞。"   # 已完整 → 原樣
assert extract.snap_quote(TEXT, snapped) == snapped                                       # 冪等

# ② 英文：句點是合法句界，正常陳述句不得被當成標題
EN = "Meta removed 51 accounts. The network amplified DPP-attacking content. Details follow."
assert extract.snap_quote(EN, "amplified DPP-attacking content") == \
       "The network amplified DPP-attacking content."
assert extract.is_claim_span("The network amplified DPP-attacking content.")
# 縮寫（U.S.）造成的假句界：quote 跨越它時兩窗會被接回同一句
ABBR = "Meta removed U.S. based accounts. Next section."
assert extract.snap_quote(ABBR, "U.S. based accounts") == "Meta removed U.S. based accounts."

# ③ 定位不唯一 → 不猜，回原引文（模型未必附 quote_occurrence）
DUP = "甲說法。國防大學新聞系教授傅文成觀察，情況嚴峻。國防大學新聞系教授傅文成觀察，另有他解。"
assert extract.snap_quote(DUP, "國防大學新聞系教授傅文成觀察，") == "國防大學新聞系教授傅文成觀察"
# 對不上原文（樣本／人工 extraction）→ 保守回原引文，只去頭尾分隔標點，絕不臆造
assert extract.snap_quote(TEXT, "GoLaxy built profiles，") == "GoLaxy built profiles"
assert extract.snap_quote("", "任意引文。") == "任意引文。"

# ④ 整句過長 → 不硬塞整段進 claim 卡，退回原引文
assert extract.snap_quote("前言。" + "甲" * 300 + "乙，丙。", "乙，") == "乙"

# ⑤ 宣稱閘看**句尾**：終止符在句中不算數，句尾引號／括號先剝掉
assert extract.is_claim_span("央視亦發布相關新聞。")
assert extract.is_claim_span("他說：「央視發布消息。」")                    # 句尾為 」 → 剝掉後看 。
assert not extract.is_claim_span("東部戰區融媒體中心扮演的角色")            # 標題
assert not extract.is_claim_span("研究團隊得到幾點觀察：")                  # 欄位標籤
assert not extract.is_claim_span("重要發現！四種手法")                      # 標點在句中，句尾仍無終止符
assert not extract.is_claim_span("東部戰區融媒體中心到底是什麼樣的單位？")  # 提問（已知取捨：反問句一併損失）
assert not extract.is_claim_span("他們否認。真是如此嗎")                    # 句中有 。但句尾無終止符

# ⑥ project 去重含物件：同一句可同時佐證多個實體，不被先到的實體吃掉
ev = [{"quote": "央視與環球時報同為官媒。", "source_url": "https://example.org/r"}]
bundle = {"objects": [
    {"id": "identity--a", "type": "identity", "name": "央視", "x_netweaver_evidence": ev},
    {"id": "identity--b", "type": "identity", "name": "環球時報", "x_netweaver_evidence": ev},
]}
assert [c["about"] for c in pipeline.project(bundle)["claims"]] == ["央視", "環球時報"]
dup = {"objects": [{"id": "identity--a", "type": "identity", "name": "央視",
                    "x_netweaver_evidence": ev + ev}]}
assert len(pipeline.project(dup)["claims"]) == 1                       # 同物件同引文 → 仍去重

# ⑦ 無正文（樣本／人工 extraction）→ 行為不變；有正文才擴張＋濾非宣稱
head = {"objects": [{"id": "identity--a", "type": "identity", "name": "東部戰區融媒體中心",
                     "x_netweaver_evidence": [{"quote": "東部戰區融媒體中心扮演的角色",
                                               "source_url": "https://example.org/r"}]}]}
assert len(pipeline.project(head)["claims"]) == 1
assert len(pipeline.project(head, text=TEXT)["claims"]) == 0
frag = {"objects": [{"id": "identity--a", "type": "identity", "name": "東部戰區融媒體中心",
                     "x_netweaver_evidence": [{"quote": "東部戰區融媒體中心被外界稱為「中央廚房」，",
                                               "source_url": "https://example.org/r"}]}]}
assert pipeline.project(frag, text=TEXT)["claims"][0]["quote"] == snapped

# ⑧ 紅線：呈現層擴張不得回頭改 derive 的 confidence／歸因。
#    project 只讀 bundle 產出視圖，對 bundle 本身（含 confidence、evidence 原始 span）不得有副作用。
graded = {"objects": [{"id": "intrusion-set--x", "type": "intrusion-set", "name": "某網絡",
                       "confidence": 60,
                       "x_netweaver_evidence": [{"quote": "某網絡發動宣傳，",
                                                 "source_url": "https://example.org/r"}]}]}
before = copy.deepcopy(graded)
HEDGE = "背景說明。某網絡發動宣傳，但研究團隊認為可能與官方有關。後續待查。"
_ = pipeline.project(graded, text=HEDGE)
assert graded == before, "project 不得改動 bundle（evidence 原始 span／confidence 是 derive 的結果）"

# ⑨ claim 的 about 必須是可辨識的實體名——型別名／關係名不得洩漏成 about
ev1 = [{"quote": "央視發布相關新聞。", "source_url": "https://example.org/r"}]
leak = {"objects": [
    {"id": "identity--a", "type": "identity", "name": "央視", "x_netweaver_evidence": ev1},
    {"id": "location--tw", "type": "location", "country": "TW", "x_netweaver_evidence": ev1},   # 無 name
    {"id": "url--x", "type": "url", "value": "https://x", "x_netweaver_evidence": ev1},         # SCO 無 name
    {"id": "relationship--r", "type": "relationship", "relationship_type": "related-to",
     "source_ref": "identity--a", "target_ref": "location--tw", "x_netweaver_evidence": ev1},
]}
abouts = [c["about"] for c in pipeline.project(leak)["claims"]]
assert "location" not in abouts and "related-to" not in abouts and "url" not in abouts, abouts
assert abouts == ["央視", "央視"], abouts     # 關係的引文掛到主詞，不是掛到關係型別

# 主詞也沒有名字的關係 → 不產生 claim（不能退回型別字串）
orphan = {"objects": [
    {"id": "location--tw", "type": "location", "country": "TW"},
    {"id": "relationship--r", "type": "relationship", "relationship_type": "targets",
     "source_ref": "location--tw", "target_ref": "location--tw", "x_netweaver_evidence": ev1},
]}
assert pipeline.project(orphan)["claims"] == []

# ⑩ 用量統計要含 total_tokens（思考 tokens 藏在 total 裡，是實際計費量）
run = extract.ExtractionRun()
run.events.append({"event": "request_done", "prompt_tokens": 100, "completion_tokens": 50, "total_tokens": 400})
sm = run.summary()
assert sm["total_tokens"] == 400 and sm["prompt_tokens"] == 100, sm
assert sm["total_tokens"] > sm["prompt_tokens"] + sm["completion_tokens"], "思考 tokens 必須看得見"

# ⑪ publication_digest 鎖的是「會發布的內容」：碼層改動使投影 claim 變了 → digest 必變 → 需重審
extr_x = {"mentions": [{"tmp_id": "m1", "surface": "央視", "quote": "央視亦發布相關新聞。"}]}
d_old = run_loop.publication_digest(extr_x, [{"about": "央視", "quote": "央視亦發布相關新聞，"}])
d_new = run_loop.publication_digest(extr_x, [{"about": "央視", "quote": "央視亦發布相關新聞。"}])
assert d_old != d_new
assert d_new == run_loop.publication_digest(extr_x, [{"about": "央視", "quote": "央視亦發布相關新聞。"}])

# ── 句號落在引號裡面：收尾引號要算進前一句 ──────────────────────
# 實測 IORG〈延續麥卡錫和裴洛西兩任美國議長的疑美論〉：
#   …很可能再度引爆台海危機。」（01:12）隔日，聯合新聞網（8:52）直接引用報導內容。
# 原本在「。」就切，下一句以孤兒「」」開頭，單篇產生 7 條這種碎片。
_T = "中共官媒「香港中評網」報導認為「麥卡錫如果竄台，很可能再度引爆台海危機。」（01:12）隔日，聯合新聞網（8:52）直接引用報導內容。"
_w = extract.sentence_windows(_T)
assert not any(w.lstrip().startswith(("」", "』", "）")) for w in _w), \
    f"句窗不得以收尾引號開頭：{[w[:14] for w in _w]}"
assert _w[0].rstrip().endswith("」"), f"收尾引號應留在前一句：{_w[0][-8:]!r}"
# 擴張後的 claim 同樣不得以收尾引號開頭
_snapped = extract.snap_quote(_T, "隔日，聯合新聞網")
assert not _snapped.lstrip().startswith("」"), f"snap_quote 不得以「」」開頭：{_snapped[:20]!r}"

print("claim 引文：通過（句界擴張＋中英句尾＋定位歧義保守＋宣稱閘＋逐物件去重＋不回頭動 derive）")
