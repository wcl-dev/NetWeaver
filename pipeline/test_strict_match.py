#!/usr/bin/env python3
"""strict_match：短又通用的中文名，前後緊接中日韓字時不得算命中。

前端的引文共現用子字串比對找「同一句裡還點名了誰」。多數名稱夠長不成問題，
但官媒粉專「知行」只有兩個字——不設限的話「知行合一」會被算成點名該粉專。

本測試直接對 index.html 裡的 nameIndex／nameHits 跑（用 node），確保：
  ① 標了 strict_match 的名字，前後是中文時不命中
  ② 同一個名字被引號、書名號、標點包住時仍要命中（報告裡就是這樣寫的）
  ③ 沒標 strict_match 的名字維持原本的子字串行為（如「中天」在「中天新聞台」中）
用法：python3 pipeline/test_strict_match.py（exit 0＝過）
"""
import re, json, pathlib, subprocess, sys

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text(encoding="utf-8")
body = max(re.findall(r"<script>(.*?)</script>", html, re.S), key=len)

# 取出 nameIndex／nameHits 兩個函式，接上假的 DB 後在 node 執行
m = re.search(r"(  let _NAMEIDX = null;.*?\n  \}\n)(?=\s*//|\s*function)", body, re.S)
if not m:
    print("✗ 在 index.html 找不到 nameIndex／nameHits"); raise SystemExit(1)
src = m.group(1)
if "nameHits" not in src:
    m2 = re.search(r"(  let _NAMEIDX = null;.*?function nameHits\(text\) \{.*?\n  \}\n)", body, re.S)
    src = m2.group(1) if m2 else src

DB = {"entities": [
    {"id": "zhixing", "name_zh": "知行", "name_en": "Zhixing", "aliases": [], "strict_match": True},
    {"id": "cti", "name_zh": "中天", "name_en": "CTi", "aliases": []},
]}
CASES = [
    ("中共官媒粉專「知行」還在繼續傳播該論述。", ["zhixing"], "引號包住 → 應命中"),
    ("包括《今日海峽》、《知行》、《香港大公報》等粉專", ["zhixing"], "書名號 → 應命中"),
    ("他主張知行合一，強調實踐的重要。", [], "知行合一 → 不得命中"),
    ("該理論源自王陽明的知行學說。", [], "知行學說 → 不得命中"),
    ("中天新聞台的報導指出", ["cti"], "未標 strict 的維持子字串行為"),
]
js = f"""
const DB = {json.dumps(DB, ensure_ascii=False)};
{src}
const cases = {json.dumps([[t, e] for t, e, _ in CASES], ensure_ascii=False)};
console.log(JSON.stringify(cases.map(([t]) => [...nameHits(t)].sort())));
"""
p = pathlib.Path("/tmp/_strict_test.js"); p.write_text(js, encoding="utf-8")
out = subprocess.run(["node", str(p)], capture_output=True, text=True)
if out.returncode != 0:
    print("✗ node 執行失敗：", out.stderr[:400]); raise SystemExit(1)
got = json.loads(out.stdout)
fails = []
for (text, want, why), g in zip(CASES, got):
    if sorted(want) != g: fails.append(f"{why}｜「{text[:22]}」want={want} got={g}")

print("strict_match（短名不得被長詞誤中）")
for (text, want, why), g in zip(CASES, got):
    print(f"  {'✓' if sorted(want)==g else '✗'} {why}")
if fails:
    print("✗ 失敗："); [print("   -", f) for f in fails]; raise SystemExit(1)
print("✓ 通過")
