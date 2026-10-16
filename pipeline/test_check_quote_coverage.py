#!/usr/bin/env python3
"""引用量體檢：逐字完整性（精確子字串）＋單篇逐字聯集覆蓋率；curate.compile 發布後的自動警告只警告、不擋。
純離線（原文以參數注入，不讀 pipeline/raw）。用法：python3 pipeline/test_check_quote_coverage.py"""
import contextlib, importlib.util, io, pathlib
import check_quote_coverage as Q

_h = pathlib.Path(__file__).resolve().parent
_s = importlib.util.spec_from_file_location("curate", str(_h / "curate.py"))
cur = importlib.util.module_from_spec(_s); _s.loader.exec_module(cur)

S = ["Alpha sentence one here.", "Beta sentence two there.",
     "Gamma sentence three everywhere.", "Delta sentence four nowhere."]
RAW = " ".join(S)
URL = "https://example.org/r"


def mkdb(*claim_lists):
    """claim_lists：每個元素是一個實體的 [(source_id, text), ...]。"""
    return {"sources": [{"id": "s1", "url": URL}, {"id": "s2", "url": "https://example.org/other"}],
            "entities": [{"id": f"e{i}", "claims": [{"text": t, "source_id": s, "about": "x"} for s, t in cl]}
                         for i, cl in enumerate(claim_lists)]}


def audit(db, cap=0.25, **kw):
    return Q.audit(db, cap, url2raw={URL: RAW}, **kw)


# ① 覆蓋率 = 引用字數 ÷ 原文字數
r = audit(mkdb([("s1", S[0])]))
assert abs(r["rows"][0][0] - len(S[0]) / len(RAW)) < 1e-9, r["rows"]

# ② 同一句掛在多個實體上，不得重複計入（掛幾個實體，量體不變）
r = audit(mkdb([("s1", S[0])], [("s1", S[0])], [("s1", S[0])]))
assert abs(r["rows"][0][0] - len(S[0]) / len(RAW)) < 1e-9, "重複句灌水了覆蓋率"

# ③ 彼此重疊的引文取聯集：A=第1句＋第2句開頭、B=第2句 → 聯集＝第1、2句連續一段（不是 A+B 相加）
A = S[0] + " " + S[1][:5]
r = audit(mkdb([("s1", A)], [("s1", S[1])]))
assert abs(r["rows"][0][0] - (len(S[0]) + 1 + len(S[1])) / len(RAW)) < 1e-9, r["rows"]

# ④ 超標判定：引 3 句 ≈ 75%；cap 0.5 超標、cap 0.9 不超標
three = mkdb([("s1", S[0])], [("s1", S[1])], [("s1", S[2])])
assert [x[1] for x in audit(three, 0.5)["over"]] == ["s1"]
assert audit(three, 0.9)["over"] == []

# ⑤ 逐字完整性：改寫不是子字串→抓出；多一個空白也算（比照 span_check 的精確 `in`）
r = audit(mkdb([("s1", "Alpha sentence one there.")]))
assert r["nonverbatim"] and r["nonverbatim"][0][:3] == ("s1", 1, 1), r["nonverbatim"]
r = audit(mkdb([("s1", "Alpha  sentence one here.")]))
assert r["nonverbatim"], "多餘空白不是逐字子字串，應被抓出"
assert audit(mkdb([("s1", S[1])]))["nonverbatim"] == [], "逐字句不該被誤報"

# ⑥ only_sids：只看指定來源（compile 後只查本次寫入的來源）
db2 = mkdb([("s1", S[0]), ("s2", "whatever")])
assert [x[1] for x in audit(db2, only_sids={"s1"})["rows"]] == ["s1"]

# ⑦ 沒有本機原文的來源：列入 no_raw，不當作通過也不當作超標（誠實標「查不到」）
r = audit(db2)
assert r["no_raw"] == ["s2"] and "s2" not in [x[1] for x in r["rows"]]

# ⑧ curate 發布後警告：超標與非逐字都出聲；乾淨不出聲；體檢出狀況不得外洩例外（不影響 compile）
def warn(db, sids, raw=None):
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        cur._quote_gate_warn(db, sids, url2raw={URL: RAW} if raw is None else raw)
    return buf.getvalue()

out = warn(mkdb([("s1", S[0])], [("s1", S[1])]), {"s1"})              # 2 句 ≈ 49% > 25%
assert "⚠ 引用量" in out and "s1" in out, out
out = warn(mkdb([("s1", "Alpha sentence one there.")]), {"s1"})
assert "⚠ 逐字" in out, out
assert warn(mkdb([("s1", S[0])]), {"s1"}) == "", "乾淨且未超標不該有輸出"   # 1 句 ≈ 22%
warn(None, {"s1"})                                                       # 壞輸入：吞掉，不 raise

print("引用量體檢：通過（覆蓋率／重複不灌水／重疊聯集／超標／逐字精確／only_sids／無原文／curate 警告）")
