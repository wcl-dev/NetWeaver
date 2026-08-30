#!/usr/bin/env python3
"""敘述角色標記：清單列名不得被標成「描述其行為」。

記錄簿的框架是「FIMI 行為者」，所以「描述其行為」這個標籤帶有份量。IORG 的
報告裡常出現「某某媒體跟進報導」的清單，那是在說明資訊如何擴散，不是在指
該媒體做了什麼——標錯會讓一般新聞報導讀起來像參與。

實測（IORG〈蔡麥會後中共軍演相關8項可疑論述〉）：
  「當日，聯合新聞網（12:40）、自由時報（16:44）亦跟進報導此動畫影片。」
名字後面卡了時間戳才接頓號，原規則要求緊接，於是漏判成 desc。

同時鎖住反向：真正描述行為的句子（粉專群聚發文）仍須是 desc，不可因為
放寬而被誤標成列名。
用法：python3 pipeline/test_claim_kind.py（exit 0＝過）
"""
import re, json, pathlib, subprocess

root = pathlib.Path(__file__).resolve().parent.parent
body = max(re.findall(r"<script>(.*?)</script>", (root / "index.html").read_text(encoding="utf-8"), re.S), key=len)
lines = body.split("\n")
try:
    a = next(i for i, l in enumerate(lines) if l.startswith("  function reEsc("))
    b = next(i for i, l in enumerate(lines) if l.startswith("  function claimKind("))
    c = next(i for i in range(b, len(lines)) if lines[i] == "  }")
except StopIteration:
    print("✗ 在 index.html 找不到 reEsc／claimKind"); raise SystemExit(1)
SRC = "\n".join(lines[a:c + 1])

CASES = [
    ("member", "聯合新聞網", "當日，聯合新聞網（12:40）、自由時報（16:44）亦跟進報導此動畫影片。",
     "名字後卡時間戳再接頓號 → 仍是清單列名"),
    ("member", "聯合新聞網", "台灣新聞媒體跟進報導，包含自由時報、中央社、民視新聞網、聯合新聞網、中廣新聞網。",
     "標準清單"),
    ("member", "TVBS", "提及軍演的 YouTube 影片主要來自台灣新聞媒體頻道，依序為 TVBS、旺中集團、三立。",
     "名字後直接接頓號"),
    ("desc", "無色覺醒", "當日 12:15 旺中集團粉專「無色覺醒」「正常發揮」「大新聞大爆卦」「頭條開講」亦群聚發表訊息內容完全相同的貼文。",
     "真正描述行為者作為 → 不可被誤標成列名"),
    ("desc", "郭正亮", "郭正亮在節目中認為美國是在「引誘你（中國）來打（台灣）」。",
     "描述發言 → desc"),
    ("cite", "環球時報", "根據環球時報的報導，該演習已於當日結束。", "被引為消息來源"),
]
js = SRC + "\nconsole.log(JSON.stringify(%s.map(([a, t]) => claimKind(t, a))));" % json.dumps(
    [[a, t] for _, a, t, _ in CASES], ensure_ascii=False)
p = pathlib.Path("/tmp/_kind_test.js"); p.write_text(js, encoding="utf-8")
out = subprocess.run(["node", str(p)], capture_output=True, text=True)
if out.returncode != 0:
    print("✗ node 執行失敗：", out.stderr[:400]); raise SystemExit(1)
got = json.loads(out.stdout)
fails = [f"{why}｜want={w} got={g}｜{t[:34]}" for (w, _a, t, why), g in zip(CASES, got) if w != g]

print("敘述角色標記（清單列名 vs 描述行為）")
for (w, _a, _t, why), g in zip(CASES, got):
    print(f"  {'✓' if w == g else '✗'} {g:<7} {why}")
if fails:
    print("✗ 失敗："); [print("   -", f) for f in fails]; raise SystemExit(1)
print("✓ 通過")
