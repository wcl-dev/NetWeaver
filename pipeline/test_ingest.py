#!/usr/bin/env python3
"""ingest.py 的 _land / _manual 回歸測試（mock fetch、temp raw，不碰網路/真 raw）。
用法：python3 pipeline/test_ingest.py"""
import importlib.util, json, pathlib, tempfile, types

_h = pathlib.Path(__file__).resolve().parent
_s = importlib.util.spec_from_file_location("ingest", str(_h / "ingest.py"))
ing = importlib.util.module_from_spec(_s); _s.loader.exec_module(ing)

_REAL_FETCH = ing.fetch                                       # 真 fetch（其他測試會 monkeypatch ing.fetch）
CASES = []
def case(fn): CASES.append(fn); return fn

def _tmp(): ing.RAW = pathlib.Path(tempfile.mkdtemp()); return ing.RAW

def _set_fetch(b): ing.fetch = lambda url, timeout=25: b

@case
def test_land_html_saves_snapshot_and_txt_sidecar():
    _tmp()
    _set_fetch(b"<html><body><nav><a href=/>Home</a></nav><article><p>"
               + b"Substantive report body about a network operator targeting Taiwan. " * 6
               + b"</p></article><footer>copyright</footer></body></html>")
    d = ing.RAW / "s"; d.mkdir(parents=True)
    m = {"url": "http://x/report"}
    ing._land(d, "h1", m)
    assert m["snapshot"] == "h1.html" and m["content_hash"].startswith("sha256:")
    assert (d / "h1.html").exists() and (d / "h1.txt").exists()
    t = (d / "h1.txt").read_text()
    assert "Substantive report body" in t and "Home" not in t, "側車須為 readability 主文（去 nav）"

@case
def test_land_detects_pdf_by_magic():
    _tmp()
    _set_fetch(b"%PDF-1.4\n...binary...")
    d = ing.RAW / "s"; d.mkdir(parents=True)
    m = {"url": "http://x/doc"}                              # url 無 .pdf，靠 magic bytes 偵測
    ing._land(d, "h2", m)
    assert m["snapshot"] == "h2.pdf" and (d / "h2.pdf").exists(), "應以 magic bytes 偵測為 PDF"

@case
def test_land_fetch_failure_is_fail_closed():
    _tmp()
    def boom(url, timeout=25): raise OSError("down")
    ing.fetch = boom
    d = ing.RAW / "s"; d.mkdir(parents=True)
    m = {"url": "http://x"}
    ing._land(d, "h3", m)
    assert "fetch-failed" in m.get("snapshot", "") and m.get("content_hash") is None

@case
def test_manual_lands_ready_manifest():
    _tmp()
    _set_fetch(b"<article><p>" + b"body text here " * 40 + b"</p></article>")
    args = types.SimpleNamespace(source_id="man", org="Org", tier="A", license="cc-by",
                                 title="T", published="2025-07-20")
    ing._manual("http://x/r", args, "2026-07-20T00:00:00Z")
    man = json.loads(next((ing.RAW / "man").glob("*.json")).read_text())
    assert man["extraction_status"] == "ready" and man["mode"] == "manual" and man["url"] == "http://x/r"

@case
def test_manual_requires_source_id():
    _tmp()
    args = types.SimpleNamespace(source_id=None, org=None, tier=None, license="x", title=None, published=None)
    try:
        ing._manual("http://x", args, "2026-07-20T00:00:00Z"); assert False
    except SystemExit:
        pass

@case
def test_manual_rejects_bad_source_id():
    # 嚴格 kebab-case，防路徑逸出／格式亂
    _tmp()
    for bad in ("a--b", "-a", "a-", "../x", "A_b", "a/b"):
        args = types.SimpleNamespace(source_id=bad, org=None, tier=None, license="x", title=None, published=None)
        try:
            ing._manual("http://x", args, "t"); assert False, f"應拒：{bad}"
        except SystemExit:
            pass

@case
def test_fetch_retries_transient_not_4xx():
    import urllib.error
    orig_open, orig_sleep = ing.urllib.request.urlopen, ing.time.sleep
    ing.time.sleep = lambda s: None                          # 免等 backoff
    calls = {"n": 0}
    class _R:
        def read(self, n=None): return b"ok body"
        def __enter__(self): return self
        def __exit__(self, *a): return False
    def flaky(req, timeout=25):
        calls["n"] += 1
        if calls["n"] < 2: raise urllib.error.URLError("transient")
        return _R()
    def http403(req, timeout=25):
        calls["n"] += 1; raise urllib.error.HTTPError("http://x", 403, "Forbidden", {}, None)
    try:
        ing.urllib.request.urlopen = flaky
        assert _REAL_FETCH("http://x", retries=2) == b"ok body" and calls["n"] == 2, "transient 應重試成功"
        calls["n"] = 0; ing.urllib.request.urlopen = http403
        try:
            _REAL_FETCH("http://x", retries=2); assert False
        except urllib.error.HTTPError:
            pass
        assert calls["n"] == 1, "4xx（如 Medium 403）不該重試"
        # 5xx：重試；第 3 次成功
        calls["n"] = 0
        def http503_then_ok(req, timeout=25):
            calls["n"] += 1
            if calls["n"] < 3: raise urllib.error.HTTPError("http://x", 503, "Unavailable", {}, None)
            return _R()
        ing.urllib.request.urlopen = http503_then_ok
        assert _REAL_FETCH("http://x", retries=2) == b"ok body" and calls["n"] == 3, "5xx 應重試"
        # 5xx 耗盡 → 重拋
        calls["n"] = 0
        def http503(req, timeout=25):
            calls["n"] += 1; raise urllib.error.HTTPError("http://x", 503, "Unavailable", {}, None)
        ing.urllib.request.urlopen = http503
        try:
            _REAL_FETCH("http://x", retries=2); assert False
        except urllib.error.HTTPError:
            pass
        assert calls["n"] == 3, "retries=2 → 共 3 次嘗試"
    finally:
        ing.urllib.request.urlopen, ing.time.sleep = orig_open, orig_sleep

def main():
    for fn in CASES:
        try:
            fn(); print(f"  ✓ {fn.__name__}")
        except AssertionError as e:
            print(f"  ✗ {fn.__name__}：{e}"); return 1
    print(f"\n全部 {len(CASES)}/{len(CASES)} 綠 ✓（_land 快照＋.txt 側車／PDF magic 偵測／fetch fail-closed／manual ready）")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
