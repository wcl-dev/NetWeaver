#!/usr/bin/env python3
"""共用文字抽取：把落地的快照（HTML／PDF）轉成餵給抽取器的正文。純 Python stdlib。

· html_to_text：readability 級（html.parser＋標籤堆疊，容錯錯配/未閉合）——跳過 script/style/nav/header/footer/
  aside/form 等 boilerplate；有 <article>/<main> 就只取其內；main 外再丟連結密度高的塊（nav/related）。
· pdf_to_text：shell out `pdftotext`（poppler CLI，非 Python 依賴）；return code 非零/掃描版/失敗→空（fail-closed）。
· extract_text：依副檔名分派 .txt/.pdf/.html。charset 偵測 BOM／meta／utf-8→big5/cp950/gb18030。
不追 lxml 級完美；決定性。掃描 PDF 不 OCR。
"""
import os, pathlib, re, shutil, subprocess, tempfile
from html.parser import HTMLParser

_SKIP_TAGS = {"script", "style", "noscript", "template", "svg", "nav", "header", "footer",
              "aside", "form", "button", "select", "figure", "iframe", "map", "head"}
_BLOCK_TAGS = {"p", "div", "section", "article", "li", "ul", "ol", "table", "tr", "td", "th",
               "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "main"}
_VOID = {"br", "img", "hr", "input", "meta", "link", "source", "track", "wbr", "area", "base", "col", "embed", "param"}
_MIN_TEXT = 200                                            # 品質閘：低於此視為抽不到有效正文
_MAX_PDF_OUT = 8_000_000                                   # pdftotext 輸出上限（防 DoS）

class _Reader(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []                                    # 開啟中的標籤（容錯錯配/未閉合）
        self.blocks = []                                   # [(text, link_chars, in_main)]
        self._buf, self._link = [], 0

    def _skipping(self): return any(t in _SKIP_TAGS for t in self.stack)
    def _in_main(self): return any(t in ("article", "main") for t in self.stack)

    def _flush(self):
        t = "".join(self._buf).strip()
        if t: self.blocks.append((t, self._link, self._in_main()))
        self._buf, self._link = [], 0

    def handle_starttag(self, tag, attrs):
        if tag in _VOID:
            if tag == "br" and not self._skipping(): self._buf.append(" ")
            return
        if not self._skipping() and tag in _BLOCK_TAGS: self._flush()
        self.stack.append(tag)

    def handle_startendtag(self, tag, attrs):
        if tag == "br" and not self._skipping(): self._buf.append(" ")

    def handle_endtag(self, tag):
        if tag in _VOID or tag not in self.stack:
            return                                         # 未知/錯配 close → 忽略
        was_skip = self._skipping()
        if not was_skip and tag in _BLOCK_TAGS: self._flush()   # 先 flush（歸屬正確 in_main），再 pop
        while self.stack:                                  # pop 到匹配（強制關閉未閉合的中間標籤）
            if self.stack.pop() == tag: break

    def handle_data(self, data):
        if self._skipping(): return
        self._buf.append(data)
        if "a" in self.stack: self._link += len(data.strip())

    def text(self):
        self._flush()
        has_main = any(m for _, _, m in self.blocks)
        out = []
        for t, link, in_main in self.blocks:
            if has_main and not in_main: continue          # 有 main → 只取 main 內
            plain = re.sub(r"[ \t]+", " ", t).strip()
            if len(plain) < 2: continue
            if not in_main and len(plain) >= 20 and link / max(1, len(t)) > 0.5:
                continue                                   # main 外才套連結密度閘（nav/related）
            out.append(plain)
        return "\n".join(out).strip()

def _decode(raw):
    if isinstance(raw, str): return raw
    if raw[:3] == b"\xef\xbb\xbf": return raw[3:].decode("utf-8", "ignore")   # UTF-8 BOM
    if raw[:2] in (b"\xff\xfe", b"\xfe\xff"): return raw.decode("utf-16", "ignore")  # UTF-16 BOM
    m = re.search(rb'charset=["\']?\s*([a-z0-9_\-]+)', raw[:2048].lower())    # <meta charset>
    if m:
        try: return raw.decode(m.group(1).decode("ascii", "ignore"))
        except (LookupError, UnicodeDecodeError): pass
    for enc in ("utf-8", "big5", "cp950", "gb18030"):      # strict：命中正確編碼（含繁中 Big5）
        try: return raw.decode(enc)
        except (UnicodeDecodeError, LookupError): continue
    return raw.decode("utf-8", "ignore")

def html_to_text(raw):
    """HTML bytes/str → 正文。失敗回去標籤最小清理。"""
    s = _decode(raw)
    try:
        r = _Reader(); r.feed(s); r.close(); return r.text()
    except Exception:
        import html as _h
        s = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", s)
        return re.sub(r"[ \t]+", " ", _h.unescape(re.sub(r"(?s)<[^>]+>", " ", s))).strip()

def pdf_to_text(path):
    """PDF → 正文（shell out pdftotext，argv list 無 injection）。輸出寫暫存檔，**讀前先查大小**（真封頂）；
    return code 非零/掃描版/超大/失敗→空（fail-closed）。"""
    exe = shutil.which("pdftotext")
    if not exe: return ""
    fd, tmp = tempfile.mkstemp(suffix=".txt"); os.close(fd)
    try:
        r = subprocess.run([exe, "-nopgbrk", "-q", str(path), tmp], capture_output=True, timeout=120)
        if r.returncode != 0: return ""                    # 非零 → 不採部分輸出
        if os.path.getsize(tmp) > _MAX_PDF_OUT: return ""  # 讀前先查大小 → 真封頂（不先載入記憶體）
        out = pathlib.Path(tmp).read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""
    finally:
        try: os.unlink(tmp)
        except OSError: pass
    return re.sub(r"\n{3,}", "\n\n", out).strip()

def extract_text(path):
    """依副檔名分派：.txt 原樣、.pdf→pdftotext、.html/.htm→readability。回 (text, kind)。"""
    p = pathlib.Path(path); ext = p.suffix.lower()
    if ext == ".txt":
        return p.read_text(encoding="utf-8", errors="ignore").strip(), "txt"
    if ext == ".pdf":
        return pdf_to_text(p), "pdf"
    if ext in (".html", ".htm"):
        return html_to_text(p.read_bytes()), "html"
    return "", "unknown"

def is_quality(text):
    """品質閘：太短視為抽不到有效正文（避免把 nav-only／失敗結果餵給模型）。"""
    return bool(text) and len(text.strip()) >= _MIN_TEXT
