#!/usr/bin/env python3
"""② 來源 ingest（MVP）：讀 feeds.json → 抓 RSS/Atom → 偵測新項目（cursor）→ 落地 provenance manifest（＋盡力存 raw 快照）。

「live」＝持續監控來源＋落地不可變快照；快照＝真相源（原網頁 404 也可重現）。落地項目 extraction_status=pending，待 ③ 抽取。
純 stdlib（urllib＋xml.etree）。用法：python3 pipeline/ingest.py [每源上限，預設 2]
"""
import json, urllib.request, pathlib, hashlib, sys, re
from datetime import datetime, timezone
import xml.etree.ElementTree as ET

def clean(s, cap=1500):                                       # feed 摘要常含 HTML；去標籤、壓白、截斷（供 ③ 前 relevance 比對）
    return re.sub(r"\s+", " ", re.sub(r"(?s)<[^>]+>", " ", s or "")).strip()[:cap]

_here = pathlib.Path(__file__).resolve().parent
FEEDS = json.loads((_here / "feeds.json").read_text(encoding="utf-8"))["sources"]
RAW = _here / "raw"; STATE = _here / "ingest_state.json"
LIMIT = int(sys.argv[1]) if len(sys.argv) > 1 else 2          # 每源本次最多落地幾個新項目（MVP 節流）
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0 Safari/537.36"

def fetch(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/rss+xml, application/xml, text/html;q=0.8"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()

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

def main():
    state = json.loads(STATE.read_text(encoding="utf-8")) if STATE.exists() else {}
    now = datetime.now(timezone.utc).isoformat()
    total = 0
    print(f"② ingest（每源上限 {LIMIT}）")
    for s in FEEDS:
        seen = set(state.get(s["id"], []))
        try:
            items = parse_feed(fetch(s["feed_url"]))
        except Exception as e:
            print(f"  ⚠ {s['id']}: feed 取用失敗（{type(e).__name__}）"); continue
        new = [it for it in items if it["guid"] and it["guid"] not in seen][:LIMIT]
        for it in new:
            h = hashlib.sha256((s["id"] + "|" + it["guid"]).encode()).hexdigest()[:16]
            d = RAW / s["id"]; d.mkdir(parents=True, exist_ok=True)
            manifest = {"raw_id": h, "source_id": s["id"], "org": s["org"], "tier": s.get("tier"),
                        "license": s.get("license"), "title": it["title"], "summary": clean(it.get("summary")),
                        "url": it["link"], "guid": it["guid"], "published": it["published"], "discovered_at": now,
                        "content_hash": None, "extraction_status": "pending"}
            try:                                             # 盡力抓內文快照（真相源）
                html = fetch(it["link"])
                (d / (h + ".html")).write_bytes(html)
                manifest["content_hash"] = "sha256:" + hashlib.sha256(html).hexdigest()
            except Exception:
                manifest["snapshot"] = "fetch-failed（保留 metadata，可重試）"
            (d / (h + ".json")).write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
            seen.add(it["guid"])
        state[s["id"]] = list(seen)
        print(f"  ✓ {s['id']}: feed {len(items)} 項 → 本次新落地 {len(new)}")
        total += len(new)
    STATE.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"→ 共新落地 {total} 項到 pipeline/raw/<source>/；每項含 provenance manifest（source/tier/license/hash/discovered_at），extraction_status=pending，待 ③ 抽取。再跑一次只會抓「更新的」項目（cursor）。")

if __name__ == "__main__":
    main()
