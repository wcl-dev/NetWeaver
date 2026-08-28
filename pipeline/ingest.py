#!/usr/bin/env python3
"""② 來源 ingest（MVP）：讀 feeds.json → 抓 RSS/Atom → 偵測新項目（cursor）→ 落地 provenance manifest（＋盡力存 raw 快照）。

「live」＝持續監控來源＋落地不可變快照；快照＝真相源（原網頁 404 也可重現）。落地項目 extraction_status=pending，待 ③ 抽取。
純 stdlib（urllib＋xml.etree）。用法：
  python3 pipeline/ingest.py [--limit N]                          # RSS：抓 feeds.json（每源上限 N，預設 2）
  python3 pipeline/ingest.py --url URL --source-id ID [--org …]   # 非 RSS 手動觸發（PDF/HTML，status=ready）
"""
import argparse, json, ssl, time, urllib.request, urllib.parse, urllib.error, importlib.util, pathlib, hashlib, re
from datetime import datetime, timezone
import xml.etree.ElementTree as ET

def clean(s, cap=1500):                                       # feed 摘要常含 HTML；去標籤、壓白、截斷（供 ③ 前 relevance 比對）
    return re.sub(r"\s+", " ", re.sub(r"(?s)<[^>]+>", " ", s or "")).strip()[:cap]

_here = pathlib.Path(__file__).resolve().parent
def _load(n):
    s = importlib.util.spec_from_file_location(n, str(_here / (n + ".py")))
    m = importlib.util.module_from_spec(s); s.loader.exec_module(m); return m
tx = _load("textextract")                                    # 落地即抽正文（readability/pdf）→ .txt 側車
FEEDS = json.loads((_here / "feeds.json").read_text(encoding="utf-8"))["sources"]
RAW = _here / "raw"; STATE = _here / "ingest_state.json"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0 Safari/537.36"

_MAX_FETCH = 25_000_000                                       # 下載大小上限（防 DoS）

def fetch(url, timeout=25, retries=2, insecure=False):
    """抓 URL。`insecure=True` 會**關閉 TLS 憑證驗證**——只在呼叫端明示時使用。

    用途：部分政府網站的憑證鏈缺欄位（實測 nsb.gov.tw 缺 Subject Key Identifier），
    curl 接受但 Python 的 OpenSSL 拒絕。這是有意識的例外，必須逐次指定並記進 manifest，
    不可設為預設值。標頭補齊（Accept／語言／Referer）是為了降低其他站的 403，與此無關。
    """
    if urllib.parse.urlparse(url).scheme not in ("http", "https"):   # 只允許 http(s)（拒 file:/ 等）
        raise ValueError(f"只允許 http(s) URL：{url}")
    from urllib.parse import urlsplit as _us
    _o = _us(url)
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "application/rss+xml, application/xml, application/pdf, text/html;q=0.9, */*;q=0.8",
        "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
        "Referer": f"{_o.scheme}://{_o.netloc}/",
    })
    last = None
    for attempt in range(retries + 1):
        try:
            kw = {"context": ssl._create_unverified_context()} if insecure else {}
            with urllib.request.urlopen(req, timeout=timeout, **kw) as r:
                data = r.read(_MAX_FETCH + 1)                  # 讀 limit+1：超限即拒，不靜默截斷
                if len(data) > _MAX_FETCH:
                    raise ValueError(f"下載超過 {_MAX_FETCH} bytes 上限")
                return data
        except urllib.error.HTTPError as e:
            if not (500 <= e.code < 600): raise               # 只有 5xx 才重試；4xx（Medium 403）/3xx 直接 raise
            last = e
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            last = e                                          # 連線/超時 → 重試
        if attempt < retries:
            time.sleep(1.5 * (attempt + 1))                   # backoff
    raise last

def parse_feed(xml_bytes):
    items = []
    try: root = ET.fromstring(xml_bytes)
    except ET.ParseError: return items
    A = "{http://www.w3.org/2005/Atom}"
    for it in root.iter():
        tag = it.tag.split("}")[-1]
        if tag == "item":                                    # RSS
            g = lambda t: (it.findtext(t) or "").strip()
            desc = g("description") or g("{http://purl.org/rss/1.0/modules/content/}encoded")
            items.append({"title": g("title"), "link": g("link"), "guid": g("guid") or g("link"),
                          "published": g("pubDate"), "summary": desc})
        elif tag == "entry":                                 # Atom
            link = ""
            for l in it.findall(A + "link"):
                if l.get("rel", "alternate") == "alternate" or not link: link = l.get("href", "")
            items.append({"title": (it.findtext(A + "title") or "").strip(), "link": link.strip(),
                          "guid": (it.findtext(A + "id") or link).strip(),
                          "published": (it.findtext(A + "updated") or it.findtext(A + "published") or "").strip(),
                          "summary": (it.findtext(A + "summary") or it.findtext(A + "content") or "").strip()})
    return items

def _land(d, h, manifest, insecure=False):
    """抓 URL → 偵測 PDF/HTML → 存快照 → textextract 抽正文存 .txt 側車 → 回填 manifest（fail-closed，不擋全批）。"""
    for e in (".html", ".htm", ".pdf", ".txt"):               # 清舊快照/側車：型別改變或品質下降不留殘檔
        old = d / (h + e)
        if old.exists(): old.unlink()
    try:
        raw = fetch(manifest["url"], insecure=insecure)
    except Exception:
        manifest["snapshot"] = "fetch-failed（保留 metadata，可重試）"; return
    is_pdf = manifest["url"].lower().split("?")[0].endswith(".pdf") or raw[:5] == b"%PDF-"
    ext = ".pdf" if is_pdf else ".html"
    (d / (h + ext)).write_bytes(raw)
    manifest["content_hash"] = "sha256:" + hashlib.sha256(raw).hexdigest()
    manifest["snapshot"] = h + ext
    text, kind = tx.extract_text(d / (h + ext))               # 落地即抽正文
    if tx.is_quality(text):
        (d / (h + ".txt")).write_text(text, encoding="utf-8")
        manifest["text_chars"] = len(text)
    else:
        manifest["text_note"] = f"正文抽取不足（{kind}，{len(text)} chars）——可人工補 .txt 側車"

def _manual(url, args, now):
    """非 RSS 手動觸發（registry mode: manual）：抓單一 URL（HTML/PDF）落地，status=ready（人工觸發＝已判定相關）。"""
    if not args.source_id: raise SystemExit("--url 需搭配 --source-id")
    sid = args.source_id
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", sid):      # 嚴格 kebab-case：防路徑逸出（sid 會成為 raw/<sid>）
        raise SystemExit(f"--source-id 須嚴格 kebab-case（防路徑逸出）：{sid}")
    h = hashlib.sha256((sid + "|" + url).encode()).hexdigest()[:16]
    d = RAW / sid; d.mkdir(parents=True, exist_ok=True)
    manifest = {"raw_id": h, "source_id": sid, "org": args.org, "tier": args.tier, "license": args.license,
                "title": args.title or url, "summary": "", "url": url, "guid": url,
                "published": args.published, "discovered_at": now, "content_hash": None,
                "mode": "manual", "extraction_status": "ready",
                "relevance": {"relevant": True, "reason": "manual-trigger"}}
    if getattr(args, "insecure", False):                      # 憑證未驗證是資料的一部分，不是隱形的全域讓步
        manifest["tls_verified"] = False
        print(f"⚠ 已關閉此次抓取的 TLS 憑證驗證（--insecure）：{url}")
    _land(d, h, manifest, insecure=getattr(args, "insecure", False))
    (d / (h + ".json")).write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    tail = (f"正文 {manifest['text_chars']} chars" if manifest.get("text_chars") else manifest.get("text_note", "無正文"))
    print(f"✓ manual 落地 {sid}/{h}（{manifest.get('snapshot', 'fetch-failed')}）｜status=ready｜{tail}")
    print("→ 已 ready（人工觸發＝相關）；直接 run_loop 抽取。新來源記得 register.py add-source 對映。")
    return 0

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=2, help="RSS 每源本次最多落地新項目數")
    ap.add_argument("--url", help="非 RSS 手動觸發：抓單一 URL（HTML/PDF）落地為 ready")
    ap.add_argument("--source-id", dest="source_id"); ap.add_argument("--org"); ap.add_argument("--tier")
    ap.add_argument("--title"); ap.add_argument("--published")
    ap.add_argument("--license", default="cite-with-attribution")
    ap.add_argument("--insecure", action="store_true",
                    help="關閉此次抓取的 TLS 憑證驗證（憑證鏈有缺陷的站，如 nsb.gov.tw）；會記入 manifest")
    args = ap.parse_args()
    now = datetime.now(timezone.utc).isoformat()
    if args.url:
        return _manual(args.url, args, now)
    state = json.loads(STATE.read_text(encoding="utf-8")) if STATE.exists() else {}
    total = 0
    print(f"② ingest（每源上限 {args.limit}）")
    for s in FEEDS:
        seen = set(state.get(s["id"], []))
        try:
            items = parse_feed(fetch(s["feed_url"]))
        except Exception as e:
            print(f"  ⚠ {s['id']}: feed 取用失敗（{type(e).__name__}）"); continue
        new = [it for it in items if it["guid"] and it["guid"] not in seen][:args.limit]
        for it in new:
            h = hashlib.sha256((s["id"] + "|" + it["guid"]).encode()).hexdigest()[:16]
            d = RAW / s["id"]; d.mkdir(parents=True, exist_ok=True)
            manifest = {"raw_id": h, "source_id": s["id"], "org": s["org"], "tier": s.get("tier"),
                        "license": s.get("license"), "title": it["title"], "summary": clean(it.get("summary")),
                        "url": it["link"], "guid": it["guid"], "published": it["published"], "discovered_at": now,
                        "content_hash": None, "extraction_status": "pending"}
            _land(d, h, manifest, insecure=getattr(args, "insecure", False))                             # 抓快照＋抽 .txt 正文側車
            (d / (h + ".json")).write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
            seen.add(it["guid"])
        state[s["id"]] = list(seen)
        print(f"  ✓ {s['id']}: feed {len(items)} 項 → 本次新落地 {len(new)}")
        total += len(new)
    STATE.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"→ 共新落地 {total} 項到 pipeline/raw/<source>/（落地即抽 .txt 正文側車，供 ③ readability）；再跑只抓更新項（cursor）。")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
