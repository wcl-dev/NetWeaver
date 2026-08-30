#!/usr/bin/env python3
"""宣稱閘：句首與句尾都要像完整句，不接受從句中切出來的片段。

原本的閘只看句尾——只要結尾碰到句號就過。實測落地了這些：
  「，並獲得「今日海峽」、「兩岸頭條」粉專分享。」   以頓號開頭
  「” —-《環球時報》引述《參考消息》。」           以收尾引號開頭
  「and The Reacher.」                        英文以小寫字開頭＝句中
  「TVBS).」                                  只有名字加標點，沒有內容
  「2023 年台海愈安全」（6 日 19:55 中時）。」      收尾引號沒有對應的開引號

碎片化在這個專案不可接受：claim 卡是記錄簿呈現給人看的最小單位，斷句會讓
「報告怎麼描述這個行為者」失去意義，也讓整本記錄簿看起來不可信。

四條規則：句首接續標點、句首小寫拉丁字母、去標點後內容過短、引號未配對。
反向也要鎖住：正常的短句、含完整引號的句子、英文句子都必須通過。
用法：python3 pipeline/test_claim_gate_start.py（exit 0＝過）
"""
import importlib.util, pathlib

_here = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("extract", str(_here / "extract.py"))
ex = importlib.util.module_from_spec(spec); spec.loader.exec_module(ex)

REJECT = [
    ("，並獲得「今日海峽」、「兩岸頭條」粉專分享。", "句首頓號"),
    ("。此外，中共官媒亦協力傳播。", "句首句號"),
    ("” —-《環球時報》引述《參考消息》。", "句首收尾引號"),
    ("」（01:12）隔日，聯合新聞網直接引用報導內容。", "句首收尾引號（中文）"),
    ("and The Reacher.", "英文小寫開頭"),
    ("which was later amplified by state media.", "英文關係子句"),
    ("TVBS).", "只有名字加標點"),
    ("2023 年台海愈安全」（6 日 19:55 中時）。", "收尾引號無對應開引號"),
    ("東部戰區融媒體中心扮演的角色", "無句尾終止符＝標題"),
    ("這到底是什麼樣的單位？", "提問不是宣稱"),
]
ACCEPT = [
    ("針對台灣議題散布不實訊息。", "正常短句"),
    ("東部戰區融媒體中心發布「台島上空的聲音」影片。", "引號完整配對"),
    ("他說「台海很安全」，但實際情況並非如此。", "句中引號配對"),
    ("Dragonbridge operated across more than 180 platforms.", "英文正常句"),
    ("Meta 於 2023 年下架 7,704 個帳號。", "含數字與外文的中文句"),
]
fails = []
for t, why in REJECT:
    if ex.is_claim_span(t): fails.append(f"應拒卻通過（{why}）：{t[:34]}")
for t, why in ACCEPT:
    if not ex.is_claim_span(t): fails.append(f"應通過卻被拒（{why}）：{t[:34]}")

print("宣稱閘（句首與句尾都要像完整句）")
print(f"  應拒 {len(REJECT)} 例｜應通過 {len(ACCEPT)} 例 → {'全數符合' if not fails else '有問題'}")
if fails:
    print("✗ 失敗："); [print("   -", f) for f in fails]; raise SystemExit(1)
print("✓ 通過")
