#!/usr/bin/env python3
"""來源 URL 的比對鍵正規化。

來源「是否已登錄」原本靠 exact URL match，但 Medium 等發布平台會在連結後掛追蹤參數
（`?source=---xxx`），同一篇報告因此被判成新來源。人工路徑下這只是「誤判新來源→進人工佇列」的
保守失敗；**自動發布時同一個失敗會變成自動建立重複的 source 條目**，污染 db.sources。

`source_key()` 只作**比對**用——db 裡存的 URL 一律保持原樣，不改寫使用者登錄的內容。
"""
import hashlib
from urllib.parse import urlsplit, parse_qsl, urlencode

# 已知的追蹤／分享參數（denylist；未列出的參數一律保留，避免剝掉語意參數如 ?id=、?p=）
TRACKING_PARAMS = {
    "source", "ref", "referrer", "referral",                   # Medium／一般轉介
    "fbclid", "gclid", "dclid", "msclkid", "yclid", "twclid",   # 廣告點擊 id
    "mc_cid", "mc_eid", "_hsenc", "_hsmi", "vero_id",           # 電子報
    "igshid", "si", "sh", "spm", "scm", "share_source",         # 社群／分享
    "at_medium", "at_campaign", "cmpid", "ncid", "smid",        # 媒體站慣用
}

def source_key(url):
    """回傳用於比對的正規化鍵；非 http(s) 或空值則原樣回傳（去頭尾空白）。

    正規化：scheme（http/https 視為同一資源）、host 小寫去 `www.` 與預設埠、去 fragment、
    去追蹤參數並排序其餘 query、去路徑尾斜線。**path 不改大小寫**（路徑是大小寫敏感的）。
    """
    u = (url or "").strip()
    if not u: return ""
    parts = urlsplit(u)
    if parts.scheme.lower() not in ("http", "https"): return u
    host = parts.hostname or ""
    if host.startswith("www."): host = host[4:]
    port = parts.port
    if port and port not in (80, 443): host = f"{host}:{port}"
    path = parts.path.rstrip("/")
    kept = [(k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True)
            if k.lower() not in TRACKING_PARAMS and not k.lower().startswith("utm_")]
    kept.sort()
    return host + path + (("?" + urlencode(kept)) if kept else "")

def url_hash(url, n=6):
    """由正規化鍵導出的短雜湊（給 source id 用）——同一篇報告不因追蹤參數而產生不同 id。"""
    return hashlib.sha256(source_key(url).encode("utf-8")).hexdigest()[:n]

def index_by_url(sources, value=lambda s: s.get("id")):
    """把 db.sources 建成 {正規化鍵: value} 的索引；先登錄者優先（不被後者覆蓋）。"""
    out = {}
    for s in sources or []:
        k = source_key(s.get("url"))
        if k: out.setdefault(k, value(s))
    return out
