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

# ---- 抽取溯源（換模型後才追得出品質變化的來源）----

@case
def test_extraction_provenance_records_model_not_key():
    import os, importlib.util
    def _fresh():
        sp = importlib.util.spec_from_file_location("extract", str(_h / "extract.py"))
        m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m
    saved = {k: os.environ.get(k) for k in
             ("NW_LLM_PROVIDER", "NW_LLM_MODEL", "NW_LLM_API_KEY", "NW_LLM_EXTRA_BODY")}
    try:
        os.environ.update({"NW_LLM_PROVIDER": "openai", "NW_LLM_MODEL": "gemini-3.7-flash",
                           "NW_LLM_API_KEY": "SUPER-SECRET-KEY",
                           "NW_LLM_EXTRA_BODY": '{"reasoning_effort": "low"}'})
        prov = rl.extraction_provenance(_fresh())
        assert prov["extraction_provider"] == "openai"
        assert prov["extraction_model"] == "gemini-3.7-flash"
        assert "re-low" in prov["extraction_variant"], prov          # 設定變體也要留痕
        assert "SUPER-SECRET-KEY" not in json.dumps(prov), "溯源不得記錄金鑰"
    finally:
        for k, v in saved.items():
            os.environ.pop(k, None) if v is None else os.environ.__setitem__(k, v)

@case
def test_span_drop_stats():
    # 模型有回應卻 0 mention 時，這份統計是唯一線索——原本 dropped 收下就丟掉了
    dropped = [("mention", "央視", "bad-quote"), ("mention", "新華社", "bad-quote"),
               ("mention", "X", "missing-quote"), ("assertion", "轉發", "dangling")]
    assert rl.span_drop_stats(dropped) == {
        "mention:bad-quote": 2, "mention:missing-quote": 1, "assertion:dangling": 1}
    assert rl.span_drop_stats([]) == {} and rl.span_drop_stats(None) == {}
    # 只記類別與次數，不得把引文內容寫進 queue
    assert all("央視" not in k for k in rl.span_drop_stats(dropped))

def main():
    for fn in CASES:
        try:
            fn(); print(f"  ✓ {fn.__name__}")
        except AssertionError as e:
            print(f"  ✗ {fn.__name__}：{e}"); return 1
    print(f"\n全部 {len(CASES)}/{len(CASES)} 綠 ✓（快照優先序：.txt > manifest.snapshot > 無回退；缺檔/fetch-failed→no-text；抽取溯源不含金鑰）")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
