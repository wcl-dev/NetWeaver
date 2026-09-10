#!/usr/bin/env python3
"""從 data/registry.yaml 生成 README 的「完整來源清單」附錄。

目的：README 散文只列代表性來源，容易與實際 allowlist 漂移。此腳本把 registry.yaml
（唯一權威的來源 allowlist）渲染成分組表格，填入 README 的標記區塊之間：

    <!-- SOURCES:BEGIN ... -->   ...generated...   <!-- SOURCES:END -->

新增/調整來源後重跑即可刷新，README 不再需要手動同步。純讀 registry → 寫 README，
不碰資料、不連網。用法：python3 scripts/gen_source_appendix.py [--check]
  （--check：只檢查 README 是否為最新，不寫檔；CI 可用，漂移則非零退出）
"""
import sys, pathlib, yaml

ROOT = pathlib.Path(__file__).resolve().parent.parent
REG = ROOT / "data" / "registry.yaml"
README = ROOT / "README.md"
BEGIN = "<!-- SOURCES:BEGIN"
END = "<!-- SOURCES:END -->"

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


def main():
    import argparse
    ap = argparse.ArgumentParser(description="從 data/registry.yaml 生成 README 來源附錄")
    ap.add_argument("--check", action="store_true",
                    help="只檢查 README 是否為最新、不寫檔；漂移則非零退出（CI 用）")
    args = ap.parse_args()   # 未知參數會在此報錯，不會靜默進入寫入模式

    sources = load_sources()
    block = render(sources)
    txt = README.read_text(encoding="utf-8")
    # 防 clobber：兩個標記各需恰好一個、且順序正確，否則不寫檔
    nb, ne = txt.count(BEGIN), txt.count(END)
    if nb != 1 or ne != 1:
        print(f"✗ README 標記數異常（BEGIN={nb}, END={ne}，各需恰好 1）；不寫檔。", file=sys.stderr)
        return 2
    i, j = txt.index(BEGIN), txt.index(END)
    if i >= j:
        print("✗ README 標記順序顛倒（END 在 BEGIN 之前）；不寫檔。", file=sys.stderr)
        return 2
    new = txt[:i] + block + txt[j + len(END):]
    if new == txt:
        print("✓ README 來源附錄已是最新。")
        return 0
    if args.check:
        print("✗ README 來源附錄與 registry.yaml 不同步，請跑 scripts/gen_source_appendix.py 刷新。", file=sys.stderr)
        return 1
    README.write_text(new, encoding="utf-8")
    print(f"✓ 已刷新 README 來源附錄（{len(sources)} 個機構）。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
