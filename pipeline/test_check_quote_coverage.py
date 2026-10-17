#!/usr/bin/env python3
"""引用量體檢：逐字完整性（精確子字串）＋單篇逐字聯集覆蓋率＋「查不到要明講」＋「不認錯文件」；
curate.compile 發布後的自動警告只警告、不擋，且整段（取結果／組訊息／印出）都在保護範圍內。
純離線（原文以參數注入，不讀 pipeline/raw）。用法：python3 pipeline/test_check_quote_coverage.py"""
import contextlib, importlib.util, io, json, pathlib
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


def audit(db, cap=0.25, raw=None, **kw):
    return Q.audit(db, cap, url2raw={URL: RAW} if raw is None else raw, **kw)


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

# ⑦ 沒有本機原文的來源：列入 no_raw（連 claim 數），不當作通過也不當作超標（誠實標「查不到」）
r = audit(db2)
assert r["no_raw"] == ["s2"] and "s2" not in [x[1] for x in r["rows"]]
assert r["no_raw_claims"] == {"s2": 1}, r["no_raw_claims"]

# ⑧ claim 指向 db.sources 沒有的來源 → 單獨列為 unknown_source（資料不一致），不混進 no_raw
r = audit(mkdb([("ghost", "anything"), ("s1", S[0])]))
assert r["unknown_source"] == ["ghost"] and r["no_raw"] == [], r
assert [x[1] for x in r["rows"]] == ["s1"]

# ⑨ --check 判定 exit_code：乾淨→0；超標／非逐字／來源未登錄→1；未驗證預設不擋、--strict 才擋
clean = audit(mkdb([("s1", S[0])]))
assert Q.exit_code(clean) == (0, []) and Q.exit_code(clean, strict=True) == (0, [])
code, why = Q.exit_code(audit(three, 0.5)); assert code == 1 and "超覆蓋率" in why[0], why
code, why = Q.exit_code(audit(mkdb([("s1", "Alpha sentence one there.")]))); assert code == 1 and "非逐字" in why[0], why
code, why = Q.exit_code(audit(mkdb([("ghost", "x")]))); assert code == 1 and "未登錄" in why[0], why
unv = audit(db2)
assert Q.exit_code(unv) == (0, []), "未驗證預設只明講、不擋"
code, why = Q.exit_code(unv, strict=True); assert code == 1 and "無本機原文" in why[0], why

# ⑩ 彎引號 vs 直引號：精確比對不容混淆（原文是 ’，claim 用 ' 就不是逐字）
RAW_Q = "The state said China’s position is firm.\nSecond line here."
r = audit(mkdb([("s1", "The state said China's position is firm.")]), raw={URL: RAW_Q})
assert r["nonverbatim"], "直引號 ' 與原文的彎引號 ’ 不同，不得當成逐字"
assert audit(mkdb([("s1", "The state said China’s position is firm.")]), raw={URL: RAW_Q})["nonverbatim"] == []

# ⑪ 換行 vs 空白、全形 vs 半形：逐字檢查只認精確子字串；正規化「只」用在覆蓋率估算，不得放寬逐字關
RAW_N = "line one\nline two ABC end"
for variant in ("line one line two ABC end", "line one\nline two ＡＢＣ end"):
    r = audit(mkdb([("s1", variant)]), raw={URL: RAW_N})
    assert r["nonverbatim"], f"正規化後相同也不是逐字：{variant!r}"
    assert Q.union_coverage([variant], RAW_N)[1] == 1, "覆蓋率估算則吸收空白／全半形差異（僅供估算）"
assert audit(mkdb([("s1", "line one\nline two")]), raw={URL: RAW_N})["nonverbatim"] == [], "含換行的逐字子字串合法"

# ⑫ 原文對應可用正規化網址：尾斜線／www／追蹤參數不得讓原文「找不到」而變成未驗證
db_u = {"sources": [{"id": "s1", "url": "https://www.example.org/r/?utm_source=x"}],
        "entities": [{"id": "e0", "claims": [{"text": S[0], "source_id": "s1", "about": "x"}]}]}
r = Q.audit(db_u, 0.25, url2raw={"http://example.org/r": RAW})
assert [x[1] for x in r["rows"]] == ["s1"] and r["no_raw"] == [], r

# ⑬ 不認錯文件：正規化後對到多份「不同」原文＝歧義，不得任選一份去「驗證」；明講並視為失敗
URL_A, URL_B = URL + "?source=alpha", URL + "?source=beta"          # urlnorm 視為同一來源
one = mkdb([("s1", S[0])])
r = audit(one, raw={URL_A: RAW, URL_B: "totally different document"})
assert r["ambiguous_raw"] == ["s1"] and r["rows"] == [] and r["no_raw"] == [], r
assert r["ambiguous_claims"] == {"s1": 1}
code, why = Q.exit_code(r); assert code == 1 and "多份不同原文" in why[0], why
r = audit(one, raw={URL_A: RAW, URL_B: RAW})                         # 兩份「相同」原文（重複落地）不算歧義
assert r["ambiguous_raw"] == [] and [x[1] for x in r["rows"]] == ["s1"], r
db_exact = {"sources": [{"id": "s1", "url": URL_A}],                 # 精確網址優先：與其中一份完全相同 → 用那一份
            "entities": [{"id": "e0", "claims": [{"text": S[0], "source_id": "s1", "about": "x"}]}]}
r = Q.audit(db_exact, 0.25, url2raw={URL_A: RAW, URL_B: "totally different document"})
assert r["ambiguous_raw"] == [] and [x[1] for x in r["rows"]] == ["s1"] and r["nonverbatim"] == [], r
r = audit(one, raw={URL: "  \n "})                                   # 空白原文（抓取失敗的殘檔）視同沒有
assert r["no_raw"] == ["s1"] and r["rows"] == [], r

# ⑭ 空白／缺 text 的 claim 不合格（空字串是任何文字的子字串，不得被當成「命中」）；text=None 不得讓檢查當機
for bad_text in ("", "   ", None):
    r = audit(mkdb([("s1", bad_text), ("s1", S[0])]))
    assert r["nonverbatim"] and r["nonverbatim"][0][:3] == ("s1", 1, 2), (bad_text, r["nonverbatim"])
    assert Q.EMPTY_MARK in r["nonverbatim"][0][3] and Q.exit_code(r)[0] == 1

# ⑮ 門檻必須是 0～1 的有限數字（nan 會讓「cov > cap」恆為 False＝把閘整個關掉）
for bad_cap in (float("nan"), -0.1, 1.5):
    try:
        audit(one, bad_cap); raise AssertionError(f"cap={bad_cap!r} 應被拒絕")
    except ValueError:
        pass


def run_main(argv, db, raw=None):
    out, err = io.StringIO(), io.StringIO()
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
        code = Q.main(argv, db=db, url2raw={URL: RAW} if raw is None else raw)
    return code, out.getvalue(), err.getvalue()

for bad_cap in ("nan", "0", "-0.1", "1.5", "abc"):
    try:
        run_main(["--max-coverage", bad_cap], one); raise AssertionError(f"--max-coverage {bad_cap} 應被拒絕")
    except SystemExit as e:
        assert e.code == 2, (bad_cap, e.code)

# ⑯ main() 的選項組合（不只測 exit_code()）：--check／--strict／report 模式／--json 的結束碼語意
assert run_main(["--check"], one)[0] == 0
code, _, err = run_main(["--check", "--max-coverage", "0.5"], three)
assert code == 1 and "超覆蓋率" in err, (code, err)
assert run_main(["--max-coverage", "0.5"], three)[0] == 0, "沒加 --check 只出報告，不影響結束碼"
code, _, err = run_main(["--check"], db2); assert code == 0 and "未驗證" in err, (code, err)   # 預設：明講但不擋
assert run_main(["--strict"], db2)[0] == 1, "--strict 隱含 --check，且把未驗證視為失敗"
code, out, _ = run_main(["--json", "--max-coverage", "0.5"], three)
v = json.loads(out)["verdict"]
assert code == 0 and v["would_fail"] is True and v["exit_code"] == 0 and v["check"] is False, v   # 會失敗，但沒要求 --check
code, out, _ = run_main(["--json", "--check", "--max-coverage", "0.5"], three)
v = json.loads(out)["verdict"]
assert code == 1 and v["would_fail"] is True and v["exit_code"] == 1, v                          # JSON 與實際結束碼一致

# ⑰ 覆蓋率的出現處歸屬：每則「不同」文字各佔一個出現處——正規化後相同的不同文字取不同區域（不互相遮蓋）；
#    同一則文字重複發布只算一次，原文裡重複出現的短句也不灌水（否則 "In the case of X" 這類短句會把覆蓋率灌爆）
cov, hit, tot = Q.union_coverage(["Ａ\nＢ", "A B"], "Ａ\nＢ........A B")     # 兩段不同原文區域，正規化後都是 "A B"
assert (hit, tot) == (2, 2) and abs(cov - 6 / 14) < 1e-9, (cov, hit, tot)
cov, hit, tot = Q.union_coverage(["x y z"], "x y z. x y z.")               # 一則 claim、原文出現兩處 → 只算一處
assert abs(cov - 5 / 13) < 1e-9, cov
cov, hit, tot = Q.union_coverage(["x y z", "x y z", "x y z"], "x y z. x y z.")   # 同一則掛三個實體 → 仍只算一次
assert abs(cov - 5 / 13) < 1e-9 and hit == 1, (cov, hit)
cov, hit, tot = Q.union_coverage(["A B", "Ａ Ｂ"], "A B end")               # 兩則不同文字、原文只有一處 → 同一區域，不重複計
assert abs(cov - 3 / 7) < 1e-9 and hit == 2, (cov, hit)


# ⑱ curate 發布後警告：超標／非逐字／未驗證／來源未登錄／原文歧義都出聲；乾淨不出聲；任何環節出狀況都不得外洩例外
def warn(db, sids, raw=None, audit_fn=None):
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        cur._quote_gate_warn(db, sids, url2raw={URL: RAW} if raw is None else raw, _audit=audit_fn)
    return buf.getvalue()

out = warn(mkdb([("s1", S[0])], [("s1", S[1])]), {"s1"})                 # 2 句 ≈ 49% > 25%
assert "⚠ 引用量" in out and "s1" in out and "內部門檻" in out, out
out = warn(mkdb([("s1", "Alpha sentence one there.")]), {"s1"})
assert "⚠ 逐字" in out, out
out = warn(mkdb([("s2", "whatever")]), {"s2"})                           # s2 沒有本機原文
assert "⚠ 未驗證" in out and "s2" in out and "不等於通過" in out, out
out = warn(mkdb([("ghost", "x")]), {"ghost"})
assert "⚠ 來源未登錄" in out and "ghost" in out, out
out = warn(one, {"s1"}, raw={URL_A: RAW, URL_B: "totally different document"})
assert "⚠ 原文不明確" in out and "s1" in out, out
assert warn(mkdb([("s1", S[0])]), {"s1"}) == "", "乾淨且未超標不該有輸出"   # 1 句 ≈ 22%
warn(None, {"s1"})                                                       # 壞輸入：吞掉，不 raise

def boom(*a, **k): raise RuntimeError("audit 本身壞了")
assert warn(mkdb([("s1", S[0])]), {"s1"}, audit_fn=boom) == ""           # 取結果階段出狀況
bad_shape = lambda *a, **k: {"over": [(1,)], "nonverbatim": [], "no_raw": [], "unknown_source": []}
assert warn(mkdb([("s1", S[0])]), {"s1"}, audit_fn=bad_shape) == "", "組訊息階段出狀況：吞掉，且不留半截輸出"

print("引用量體檢：通過（覆蓋率／重複不灌水／重疊聯集／超標／逐字精確／only_sids／未驗證／來源未登錄／"
      "exit_code＋--strict／引號與空白不放寬／網址正規化＋歧義＋精確優先／空白 claim／門檻驗證／"
      "main() 選項組合與 JSON 結束碼／出現處歸屬／curate 警告與整段保護）")
