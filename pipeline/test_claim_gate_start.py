#!/usr/bin/env python3
"""宣稱閘的三分：碼只判它能確定的，讀不讀得懂交給語意判斷。

## 為什麼是三分

逐來源宣稱要回答「這份報告怎麼描述這個行為者」，所以判準是「有沒有說出關於
某個行為者的事」。語法不是這件事的 proxy——實測兩邊都會判錯：

  「龍橋（Dragonbridge）為公安部僱用的網路水軍」        沒句號，但說清楚了 → 該留
  「the campaign was run using GoLaxy's AI…」        小寫開頭，但說清楚了 → 該留
  「which is increasingly common across the network」  which 指誰？句子沒說 → 該刪

所以「沒有終止符」與「小寫英文開頭」只降級為 review，由 claim_judge 判語意；
碼只 reject 它能百分之百確定的切斷跡象。

## 碼能確定的（reject）

句首接續標點、去標點後內容少於 8 字、收尾引號先於開引號、以問號收尾。
這四種都是形式上就能斷定不是「關於某行為者的陳述」。

用法：python3 pipeline/test_claim_gate_start.py（exit 0＝過）
"""
import importlib.util, pathlib

_here = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("extract", str(_here / "extract.py"))
ex = importlib.util.module_from_spec(spec); spec.loader.exec_module(ex)

REJECT = [
    ("，並獲得「今日海峽」、「兩岸頭條」粉專分享。", "句首頓號＝從句中切出"),
    ("。此外，中共官媒亦協力傳播。", "句首句號"),
    ("” —-《環球時報》引述《參考消息》。", "句首收尾引號"),
    ("」（01:12）隔日，聯合新聞網直接引用報導內容。", "句首收尾引號（中文）"),
    ("TVBS).", "只有名字加標點，內容過短"),
    ("Xinhua.", "只有名字加標點"),
    ("2023 年台海愈安全」（6 日 19:55 中時）。", "收尾引號沒有對應的開引號"),
    ("這到底是什麼樣的單位？", "提問不是宣稱"),
    ("研究團隊得到幾點觀察：", "以冒號收尾＝欄位標籤"),
]
# 碼判不準：形式上像斷句，但也可能是完整的簡潔陳述。不在碼層刪，送語意判斷。
REVIEW = [
    ("and The Reacher.", "英文小寫開頭：可能是句中切點"),
    ("which was later amplified by state media.", "英文關係子句"),
    ("東部戰區融媒體中心扮演的角色", "無終止符：可能是章節標題"),
    ("龍橋（Dragonbridge）為公安部僱用的網路水軍", "無終止符：但這是完整陳述"),
    ("the campaign was run using GoLaxy's AI-driven system", "小寫開頭：但說明了對象"),
]
ACCEPT = [
    ("針對台灣議題散布不實訊息。", "正常短句"),
    ("東部戰區融媒體中心發布「台島上空的聲音」影片。", "引號完整配對"),
    ("他說「台海很安全」，但實際情況並非如此。", "句中引號配對"),
    ("Dragonbridge operated across more than 180 platforms.", "英文正常句"),
    ("Meta 於 2023 年下架 7,704 個帳號。", "含數字與外文的中文句"),
]
fails = []
for group, want in ((REJECT, "reject"), (REVIEW, "review"), (ACCEPT, "accept")):
    for t, why in group:
        got = ex.claim_verdict(t)
        if got != want:
            fails.append("%s：want=%s got=%s｜%s" % (why, want, got, t[:36]))

# is_claim_span 是薄包裝：只有 reject 才是 False（review 先留著，等語意裁決）
for t, _why in REJECT:
    if ex.is_claim_span(t): fails.append("is_claim_span 應為 False：%s" % t[:36])
for t, _why in REVIEW + ACCEPT:
    if not ex.is_claim_span(t): fails.append("is_claim_span 應為 True：%s" % t[:36])

print("宣稱閘三分（碼確定的 vs 交語意判斷的）")
print("  reject %d 例｜review %d 例｜accept %d 例 → %s"
      % (len(REJECT), len(REVIEW), len(ACCEPT), "全數符合" if not fails else "有問題"))
if fails:
    print("✗ 失敗："); [print("   -", f) for f in fails]; raise SystemExit(1)
print("✓ 通過")
