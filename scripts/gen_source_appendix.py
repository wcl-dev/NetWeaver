#!/usr/bin/env python3
"""從 data/registry.yaml + data/db.js 生成 README 的來源附錄與統計數字。

目的：README 的來源清單與統計數字容易與實際資料漂移。此腳本維護 README 的三個標記區塊：
  - <!-- SOURCES:BEGIN … --> … <!-- SOURCES:END -->：完整機構清單（分組表，來自 registry.yaml）
  - <!-- STATS-A:BEGIN --> … <!-- STATS-A:END -->：「資料來源」引言行（機構/報告/宣稱數）
  - <!-- STATS-B:BEGIN --> … <!-- STATS-B:END -->：「狀態」規模行（行為者/事件/來源/敘事/宣稱數）

機構數來自 registry；行為者/事件/來源/敘事/宣稱數由 db.js 即時計算。改了資料重跑即同步，
README 不必手動維護。純讀 → 寫 README，不連網。用法：python3 scripts/gen_source_appendix.py [--check]
  （--check：只檢查 README 是否為最新、不寫檔；CI 用，漂移則非零退出）
"""
import sys, re, json, pathlib, yaml

ROOT = pathlib.Path(__file__).resolve().parent.parent
REG = ROOT / "data" / "registry.yaml"
DB = ROOT / "data" / "db.js"
README = ROOT / "README.md"
BEGIN = "<!-- SOURCES:BEGIN"
END = "<!-- SOURCES:END -->"
# 內嵌統計數字區塊（保留標記、只換標記之間）：引言行與狀態行，避免數字硬編碼漂移
STATS_A = ("<!-- STATS-A:BEGIN -->", "<!-- STATS-A:END -->")
STATS_B = ("<!-- STATS-B:BEGIN -->", "<!-- STATS-B:END -->")

# type → (顯示標題, 排序權重)
TYPE_META = {
    "gov-report":             ("政府／官方報告", 1),
    "platform-threat-report": ("平台威脅情資", 2),
    "research":               ("研究機構／智庫／NGO", 3),
    "factcheck":              ("事實查核", 4),
    "academic":               ("學術", 5),
    "takedown-dataset":       ("下架資料集（帳號證據層）", 6),
    "news":                   ("媒體／通訊社（事件佐證）", 7),
    "state-media":            ("對手方官媒（對照，不當事實）", 8),
    "reference":              ("背景查證", 9),
}
MODE_LABEL = {
    "feed": "自動輪詢 (RSS)", "manual": "人工觸發", "special": "存檔匯入", "scrape": "索引頁",
}


def load_sources():
    d = yaml.safe_load(REG.read_text(encoding="utf-8"))
    out = list(d.get("sources") or [])
    out += list((d.get("existing") or {}).get("sources") or [])
    return out


def load_db_stats():
    """剝掉 window.NETWEAVER_DB 外殼後 json.loads（db.js 由管線以 json.dumps 生成，鍵皆加引號）。"""
    raw = DB.read_text(encoding="utf-8")
    m = re.search(r"window\.NETWEAVER_DB\s*=\s*(\{.*\})\s*;?\s*$", raw, re.S)
    if not m:
        raise ValueError("db.js：抓不到 window.NETWEAVER_DB 賦值")
    db = json.loads(m.group(1))
    ents = db.get("entities", [])
    return {
        "entities": len(ents),
        "events": len(db.get("events", [])),
        "reports": len(db.get("sources", [])),
        "narratives": len(db.get("narratives", [])),
        "claims": sum(len(e.get("claims", [])) for e in ents if isinstance(e.get("claims"), list)),
    }


def compute_stats(sources):
    st = load_db_stats()
    st["orgs"] = len(sources)     # registry 機構數
    return st


def render_stats_a(st):   # 「資料來源」引言行
    return f"**{st['orgs']} 個來源機構**、**{st['reports']} 筆報告記錄**、**{st['claims']} 條逐來源宣稱**"


def render_stats_b(st):   # 「狀態」規模行
    return (f"**{st['entities']} 行為者 / {st['events']} 事件 / {st['reports']} 來源 / "
            f"{st['narratives']} 敘事 / {st['claims']} 條逐來源宣稱**")


def esc(s):
    return str(s or "").replace("\n", " ").replace("|", "\\|").strip()


def render(sources):
    from collections import Counter
    modes = Counter(s.get("mode", "?") for s in sources)
    mode_summary = "／".join(
        f"{MODE_LABEL.get(m, m)} {modes[m]}" for m in ("feed", "manual", "special", "scrape") if modes.get(m)
    )
    lines = []
    lines.append(f"{BEGIN}（此區塊由 scripts/gen_source_appendix.py 從 data/registry.yaml 生成，勿手改） -->")
    lines.append("<details>")
    lines.append(f"<summary><b>完整來源清單</b>（{len(sources)} 個機構；{mode_summary}）——點開</summary>")
    lines.append("")
    lines.append("> 這是全部**機構**層級的 allowlist（`data/registry.yaml`）。實際掛上宣稱的是**報告記錄**"
                 "（`data/db.js` 的 `sources[]`）——一個機構可產出多份報告，故報告數多於機構數。"
                 "逐源授權見 `db.js` 的 `sources[].license` 與 STIX 的 `x_netweaver_license`。")
    lines.append("")
    # 依 type 權重分組
    groups = {}
    for s in sources:
        groups.setdefault(s.get("type", "reference"), []).append(s)
    for typ in sorted(groups, key=lambda t: TYPE_META.get(t, (t, 99))[1]):
        title = TYPE_META.get(typ, (typ, 99))[0]
        rows = sorted(groups[typ], key=lambda s: (s.get("tier", "Z"), s.get("id", "")))
        lines.append(f"**{title}**（{len(rows)}）")
        lines.append("")
        lines.append("| 機構 | 層級 | 取得 |")
        lines.append("|---|:--:|---|")
        for s in rows:
            org, url = esc(s.get("org", s.get("id"))), (s.get("url") or "").strip()
            name = f"[{org}](<{url}>)" if url else org   # <url> 形式容許網址含特殊字元
            tier = esc(s.get("tier", "—"))
            mode = esc(MODE_LABEL.get(s.get("mode"), s.get("mode", "—")))
            lines.append(f"| {name} | {tier} | {mode} |")
        lines.append("")
    lines.append("</details>")
    lines.append(END)
    return "\n".join(lines)


def _check_markers(txt, begin, end):
    """驗證標記各恰好一個且順序正確，回傳 (begin_idx, end_idx)；否則 raise。防 clobber。"""
    nb, ne = txt.count(begin), txt.count(end)
    if nb != 1 or ne != 1:
        raise ValueError(f"標記數異常（{begin}={nb}, {end}={ne}，各需恰好 1）")
    i, j = txt.index(begin), txt.index(end)
    if i >= j:
        raise ValueError(f"標記順序顛倒（{end} 在 {begin} 之前）")
    return i, j


def _splice_inclusive(txt, begin_prefix, end, block):
    """把 begin_prefix…end（含標記）整段換成 block（block 自帶頭尾標記）。"""
    i, j = _check_markers(txt, begin_prefix, end)
    return txt[:i] + block + txt[j + len(end):]


def _splice_between(txt, markers, content):
    """保留標記，只替換兩標記之間的內容。"""
    begin, end = markers
    i, j = _check_markers(txt, begin, end)
    return txt[:i + len(begin)] + content + txt[j:]


def main():
    import argparse
    ap = argparse.ArgumentParser(description="從 data/registry.yaml + data/db.js 生成 README 來源附錄與統計數字")
    ap.add_argument("--check", action="store_true",
                    help="只檢查 README 是否為最新、不寫檔；漂移則非零退出（CI 用）")
    args = ap.parse_args()   # 未知參數會在此報錯，不會靜默進入寫入模式

    sources = load_sources()
    st = compute_stats(sources)
    txt = README.read_text(encoding="utf-8")
    try:
        new = _splice_inclusive(txt, BEGIN, END, render(sources))   # 完整來源附錄
        new = _splice_between(new, STATS_A, render_stats_a(st))      # 引言數字
        new = _splice_between(new, STATS_B, render_stats_b(st))      # 狀態數字
    except ValueError as e:
        print(f"✗ README 標記問題：{e}；不寫檔。", file=sys.stderr)
        return 2
    if new == txt:
        print("✓ README 來源附錄與統計數字已是最新。")
        return 0
    if args.check:
        print("✗ README 與 registry.yaml／db.js 不同步，請跑 scripts/gen_source_appendix.py 刷新。", file=sys.stderr)
        return 1
    README.write_text(new, encoding="utf-8")
    print(f"✓ 已刷新 README（{st['orgs']} 機構；行為者/事件/來源/敘事/宣稱 = "
          f"{st['entities']}/{st['events']}/{st['reports']}/{st['narratives']}/{st['claims']}）。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
