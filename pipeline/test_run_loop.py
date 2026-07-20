#!/usr/bin/env python3
"""run_loop.resolve_text 的快照優先序回歸（temp raw，不需 LLM）。
用法：python3 pipeline/test_run_loop.py"""
import importlib.util, json, pathlib, tempfile

_h = pathlib.Path(__file__).resolve().parent
_s = importlib.util.spec_from_file_location("rl", str(_h / "run_loop.py"))
rl = importlib.util.module_from_spec(_s); _s.loader.exec_module(rl)

CASES = []
def case(fn): CASES.append(fn); return fn
ART = b"<article><p>" + b"substantive report body content here " * 20 + b"</p></article>"

def _mk(snap=..., txt=None, html=None):
    d = pathlib.Path(tempfile.mkdtemp())
    if txt is not None: (d / "a.txt").write_text(txt, encoding="utf-8")
    if html is not None: (d / "a.html").write_bytes(html)
    m = {"raw_id": "a"}
    if snap is not ...: m["snapshot"] = snap
    mp = d / "a.json"; mp.write_text(json.dumps(m), encoding="utf-8")
    return mp, m

@case
def test_txt_sidecar_wins():
    mp, m = _mk(snap="a.html", txt="human provided report text " * 15, html=ART)
    t, k = rl.resolve_text(mp, m)
    assert k == "txt-sidecar" and "human provided" in t

@case
def test_snapshot_field_missing_file_is_no_text():
    # snapshot 欄位指向不存在的檔 → no-text（不得回退讀殘留 .html）
    mp, m = _mk(snap="a.pdf", html=ART)
    t, k = rl.resolve_text(mp, m)
    assert t == "" and k == "no-text", "snapshot 缺檔不該讀殘留 .html"

@case
def test_snapshot_present_and_exists():
    mp, m = _mk(snap="a.html", html=ART)
    t, k = rl.resolve_text(mp, m)
    assert k == "extract-html" and "substantive report body" in t

@case
def test_snapshot_path_restricted_to_basename():
    mp, m = _mk(snap="../../etc/passwd")                     # 逸出路徑被限成 basename → 不存在 → no-text
    t, k = rl.resolve_text(mp, m)
    assert t == "" and k == "no-text"

@case
def test_snapshot_explicit_null_is_no_text():
    # manifest 明確 "snapshot": null → no-text（不得回退猜測殘留 .html）
    mp, m = _mk(snap=None, html=ART)
    t, k = rl.resolve_text(mp, m)
    assert t == "" and k == "no-text", "snapshot=null 不該讀殘留 .html"

@case
def test_no_snapshot_field_falls_back():
    # 舊 manifest（無 snapshot 欄位）→ 回退副檔名猜測
    mp, m = _mk(snap=..., html=ART)
    t, k = rl.resolve_text(mp, m)
    assert k == "extract-html" and "substantive report body" in t

@case
def test_fetch_failed_snapshot_is_no_text():
    mp, m = _mk(snap="fetch-failed（保留 metadata）", html=ART)
    t, k = rl.resolve_text(mp, m)
    assert t == "" and k == "no-text"

def main():
    for fn in CASES:
        try:
            fn(); print(f"  ✓ {fn.__name__}")
        except AssertionError as e:
            print(f"  ✗ {fn.__name__}：{e}"); return 1
    print(f"\n全部 {len(CASES)}/{len(CASES)} 綠 ✓（快照優先序：.txt > manifest.snapshot（basename）> 無回退；缺檔/fetch-failed→no-text）")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
