#!/usr/bin/env python3
"""textextract.py 回歸測試（純 stdlib；pdf 走 mock，不需真檔）。
用法：python3 pipeline/test_textextract.py"""
import importlib.util, pathlib, tempfile, types

_h = pathlib.Path(__file__).resolve().parent
_s = importlib.util.spec_from_file_location("tx", str(_h / "textextract.py"))
tx = importlib.util.module_from_spec(_s); _s.loader.exec_module(tx)

CASES = []
def case(fn): CASES.append(fn); return fn

@case
def test_html_article_strips_boilerplate():
    doc = (b"<html><head><style>x{}</style><script>bad()</script></head><body>"
           b"<nav><a href=/>Home</a><a href=/x>X</a><a href=/y>Y</a></nav>"
           b"<header>SiteName</header>"
           b"<article><h1>Title</h1><p>This is the real report body about a network operator.</p>"
           b"<p>Second paragraph with substantive analysis content that should be kept.</p></article>"
           b"<footer><a href=/p>Privacy</a><a href=/t>Terms</a></footer></body></html>")
    t = tx.html_to_text(doc)
    assert "real report body" in t and "substantive analysis" in t, "主文（article）須保留"
    for junk in ("bad()", "SiteName", "Privacy", "Home"):
        assert junk not in t, f"boilerplate 應去除：{junk}"

@case
def test_html_drops_link_heavy_blocks():
    # 無 article：連結密度高的塊（nav 遺跡）丟、實文留
    doc = (b"<body>"
           b"<div><a href=1>link one two</a><a href=2>link three four</a><a href=3>link five six</a></div>"
           b"<div>Substantive paragraph of actual article text with enough length to be real content.</div>"
           b"</body>")
    t = tx.html_to_text(doc)
    assert "Substantive paragraph" in t and "link one" not in t

@case
def test_html_malformed_fallback():
    t = tx.html_to_text(b"<p>hello <b>world</p> unclosed <script>x</script>")
    assert "hello" in t and "world" in t and "x" not in t

@case
def test_html_mismatched_skip_recovers():
    # 錯配/未閉合 skip 標籤（<header> 沒閉合就 </nav>）不該把後面正文吞掉（stack pop-until-match）
    doc = b"<nav><header>Menu Bar</nav><article><p>The real article body about network operations.</p></article>"
    t = tx.html_to_text(doc)
    assert "real article body" in t and "Menu" not in t

@case
def test_html_class_skip_sidebar_inside_article():
    # Jamestown 的形狀：熱門文章側欄是普通 div，且**包在 <article> 裡面**——標籤跳過與 main 外連結密度閘都管不到，
    # 它的標題（別篇文章的）進了正文，會讓相關性過濾器誤判。只認 class，且前後正文都要保留（含巢狀 div）。
    doc = (b"<article><p>First paragraph of the real article body about trade policy.</p>"
           b"<div class=\"popular_posts\"><h4>Top Stories</h4><ul><li><a href=/a>PRC Influence Operations in the Philippines</a></li></ul>"
           b"<div class=\"inner\">nested sidebar text</div>text still inside the sidebar block</div>"
           b"<p>Second paragraph of the real article body after the sidebar block.</p></article>")
    t = tx.html_to_text(doc)
    assert "First paragraph" in t and "Second paragraph" in t, "側欄前後的正文都須保留"
    for junk in ("Top Stories", "PRC Influence Operations", "nested sidebar", "still inside the sidebar"):
        assert junk not in t, f"側欄應整塊去除（含巢狀子孫）：{junk}"

@case
def test_html_class_skip_matches_whole_token_only():
    # class 是以空白分隔的 token：只認完整相等；前綴／後綴相似的名字不得誤殺正文
    for cls, kept in (("popular_posts_extra other", True), ("my-popular_posts", True), ("a popular_posts b", False)):
        doc = (b"<article><p>Lead paragraph of the real article for this class test.</p><div class=\"" + cls.encode() +
               b"\"><p>marker content inside the div</p></div></article>")
        t = tx.html_to_text(doc)
        assert ("marker content" in t) == kept, f"class={cls!r}：預期 {'保留' if kept else '去除'}"
        assert "Lead paragraph" in t

@case
def test_html_class_skip_unclosed_and_valueless_class():
    # 跳過區塊沒閉合：外層 </section> 強制關閉它之後，後面的正文要恢復，不能被一路吞到文件結尾
    doc = (b"<body><section><p>Real paragraph one with sufficient length to keep.</p>"
           b"<div class=\"popular_posts\"><p>Junk sidebar text</section><p>After section real text long enough to keep.</p></body>")
    t = tx.html_to_text(doc)
    assert "Real paragraph one" in t and "After section real text" in t and "Junk sidebar" not in t
    # class 屬性沒有值（HTMLParser 給 None）不得讓解析器丟例外。直接用 _Reader：html_to_text 會在例外時退回
    # 「去標籤」的簡易清理，文字照樣出得來，用它測會漏掉崩潰。
    r = tx._Reader(); r.feed("<div class><p>Valueless class attribute should not crash the parser.</p></div>"); r.close()
    assert "Valueless class attribute" in r.text()

@case
def test_html_big5_decode():
    body = "中共網軍散播不實訊息影響台灣輿論這是一段夠長的正文內容供品質閘通過"
    doc = ("<html><head><meta charset=big5></head><body><article><p>" + body * 4 +
           "</p></article></body></html>").encode("big5")
    out = tx.html_to_text(doc)
    assert "網軍" in out and "台灣輿論" in out, "Big5 應正確解碼（非 utf-8 亂碼）"

@case
def test_extract_dispatch_and_quality():
    d = pathlib.Path(tempfile.mkdtemp())
    (d / "a.txt").write_text("plain text content " * 20, encoding="utf-8")
    t, k = tx.extract_text(d / "a.txt"); assert k == "txt" and "plain text" in t
    (d / "a.html").write_bytes(b"<article><p>" + b"body words " * 40 + b"</p></article>")
    t, k = tx.extract_text(d / "a.html"); assert k == "html" and "body words" in t
    assert tx.is_quality("x" * 200) and not tx.is_quality("too short")

@case
def test_html_article_direct_text_kept():
    # <article> 直接文字（無 <p>）也須歸屬 main、保留（flush-before-pop）
    doc = b"<nav><a href=/>Home</a></nav><article>Direct article text without a paragraph tag but long enough.</article>"
    t = tx.html_to_text(doc)
    assert "Direct article text" in t and "Home" not in t

@case
def test_pdf_shells_out_and_failclosed():
    import pathlib as _p
    def _run(rc, content):
        def run(argv, **k):
            _p.Path(argv[-1]).write_text(content, encoding="utf-8")  # pdftotext 寫到暫存檔 argv[-1]
            return types.SimpleNamespace(returncode=rc)
        return run
    orig_which, orig_run, orig_max = tx.shutil.which, tx.subprocess.run, tx._MAX_PDF_OUT
    try:
        tx.shutil.which = lambda x: "/usr/bin/pdftotext"
        tx.subprocess.run = _run(0, "PDF body text\n\n\n\nmore")
        out = tx.pdf_to_text("x.pdf"); assert "PDF body text" in out and "\n\n\n" not in out, "輸出清理"
        tx.subprocess.run = _run(1, "partial garbage")
        assert tx.pdf_to_text("x.pdf") == "", "return code 非零 → 空"
        tx._MAX_PDF_OUT = 10; tx.subprocess.run = _run(0, "x" * 50)
        assert tx.pdf_to_text("x.pdf") == "", "超大輸出 → 空（讀前查大小，真封頂）"
        tx._MAX_PDF_OUT = orig_max; tx.shutil.which = lambda x: None
        assert tx.pdf_to_text("x.pdf") == "", "無工具 → 空"
    finally:
        tx.shutil.which, tx.subprocess.run, tx._MAX_PDF_OUT = orig_which, orig_run, orig_max

def main():
    for fn in CASES:
        try:
            fn(); print(f"  ✓ {fn.__name__}")
        except AssertionError as e:
            print(f"  ✗ {fn.__name__}：{e}"); return 1
    print(f"\n全部 {len(CASES)}/{len(CASES)} 綠 ✓（readability 去 boilerplate／連結塊、dispatch、品質閘、pdf fail-closed）")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
