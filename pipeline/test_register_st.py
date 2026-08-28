#!/usr/bin/env python3
"""簡繁對應：折疊只用來「提出建議」，不得成為自動合併的捷徑。

PRC 原始素材是簡體、名冊登錄的是正體，對不上時同一個行為者會被拆成兩筆
（實測：海峡之声／看看新闻／环球网 都已登錄卻仍被列為新候選）。

本測試鎖住三件事：
  ① 折疊會把簡體字面轉成正體，且對本來就是正體的字串是恆等
  ② st_matches 只回「折疊後才對得上」的——已經對得上的、沒有簡體字的都不回
  ③ 折疊後仍對不上任何已登錄實體的，不得回傳（不可自己發明對應）
用法：python3 pipeline/test_register_st.py（exit 0＝過）
"""
import importlib.util, pathlib

_here = pathlib.Path(__file__).resolve().parent
def _load(name):
    spec = importlib.util.spec_from_file_location(name, str(_here / (name + ".py")))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

R = _load("register")
fails = []

# ① 折疊
if R.fold_st("环球网") != "環球網": fails.append(f"环球网 應折成 環球網，得 {R.fold_st('环球网')}")
if R.fold_st("環球網") != "環球網": fails.append("對正體應為恆等")
if R.fold_st("海峡之声") != "海峽之聲": fails.append(f"海峡之声 → {R.fold_st('海峡之声')}")
if R.fold_st("Facebook") != "Facebook": fails.append("非中文應原樣")

DB = {"entities": [
    {"id": "global-times", "name_zh": "環球時報", "name_en": "Global Times", "aliases": ["環球網"]},
    {"id": "kankan-news", "name_zh": "看看新聞", "aliases": []},
]}

# ② 只回折疊後才對得上的
got = {s: eid for s, _t, eid in R.st_matches(DB, ["环球网", "看看新闻"])}
if got.get("环球网") != "global-times": fails.append(f"环球网 應對到 global-times，得 {got.get('环球网')}")
if got.get("看看新闻") != "kankan-news": fails.append(f"看看新闻 應對到 kankan-news，得 {got.get('看看新闻')}")

if R.st_matches(DB, ["環球網"]):        fails.append("已經對得上的不該再回（不是簡繁問題）")
if R.st_matches(DB, ["Global Times"]): fails.append("沒有簡體字的不該回")

# ③ 折疊後仍對不上 → 不回。人民日报→人民日報 未登錄，不可硬湊到別的實體
if R.st_matches(DB, ["人民日报"]):
    fails.append("人民日報 未登錄，不該回傳任何對應（不可自己發明）")
if R.st_matches(DB, ["新华网"]):
    fails.append("新華網 與已登錄的環球網／看看新聞無關，不該回傳")

print("簡繁對應（折疊只提建議，不自動合併）")
print(f"  折疊 ✓｜只回折疊後才命中的 ✓｜無對應則不回 ✓ → {'全數符合' if not fails else '有問題'}")
if fails:
    print("✗ 失敗："); [print("   -", f) for f in fails]; raise SystemExit(1)
print("✓ 通過")
