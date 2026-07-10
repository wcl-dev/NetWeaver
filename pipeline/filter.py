#!/usr/bin/env python3
"""relevance 過濾（碼，非模型）：對 ingest 落地的 pending 項目，用關鍵字＋已知 PRC 行為者比對，
篩「中國認知作戰／FIMI」相關者送 ③；其餘 filtered-out。模型不 gate——延續『碼判斷』。清單可調（見下）。
用法：python3 pipeline/filter.py
"""
import json, re, pathlib

_here = pathlib.Path(__file__).resolve().parent
RAW = _here / "raw"

FIMI = ["disinformation", "influence operation", "coordinated inauthentic", "inauthentic account",
        "information manipulation", "propaganda", "fake account", "content farm", "troll farm",
        " trolls", "deepfake", "spamouflage", "fimi", "認知作戰", "資訊操作", "資訊戰", "假訊息",
        "不實訊息", "內容農場", "網軍", "水軍", "假帳號", "深偽", "造謠", "帶風向", "協同造假"]
CHINA = ["china", "chinese", "prc", "ccp", "beijing", "pla ", "中共", "中國", "中国", "北京",
         "解放軍", "解放军", "統戰", "网信", "公安部", "國安部", "国安部"]
TARGET = ["taiwan", "taiwanese", "japan", "indo-pacific", "台灣", "台湾", "日本", "印太"]

def known_actors(db=_here.parent / "data" / "db.js"):
    src = db.read_text(encoding="utf-8"); i = src.index("{", src.index("window.NETWEAVER_DB")); j = src.rindex("}")
    d = json.loads(src[i:j + 1]); names = set()
    for e in d["entities"]:
        if e.get("origin") == "PRC":
            for nm in [e.get("name_en")] + (e.get("aliases") or []):
                if nm and len(nm) >= 4 and re.search(r"[A-Za-z]", nm): names.add(nm.lower())
    return names

def strip_html(b):
    t = b.decode("utf-8", "ignore")
    t = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", t)
    return re.sub(r"\s+", " ", re.sub(r"(?s)<[^>]+>", " ", t))

def hits(text, terms): return sorted({t.strip() for t in terms if t in text})

def main():
    actors = known_actors()
    manifests = sorted(RAW.glob("*/*.json"))
    ready = filt = 0
    print(f"relevance 過濾（碼；掃 {len(manifests)} 個項目）")
    for mp in manifests:
        m = json.loads(mp.read_text(encoding="utf-8"))
        if m.get("extraction_status") not in ("pending", None): continue
        # 優先比對 feed 標題＋摘要（切題、無網站 chrome）；無摘要才退回整頁快照
        html = mp.with_suffix(".html")
        title_sum = ((m.get("title") or "") + " " + (m.get("summary") or "")).strip()
        text = (title_sum or (strip_html(html.read_bytes()) if html.exists() else "")).lower()
        f, c, tg = hits(text, FIMI), hits(text, CHINA), hits(text, TARGET)
        a = sorted({x for x in actors if x in text})
        relevant = bool(a) or (bool(f) and bool(c))
        m["relevance"] = {"relevant": relevant, "fimi": f[:6], "china": c[:6], "actors": a[:6], "targets": tg[:6]}
        m["extraction_status"] = "ready" if relevant else "filtered-out"
        mp.write_text(json.dumps(m, ensure_ascii=False, indent=2), encoding="utf-8")
        why = ("actor:" + ",".join(a[:2])) if a else ("fimi+china" if relevant else "no-match")
        print(f"  {'✓ 相關' if relevant else '·  略過'}  [{m['source_id']}] {(m.get('title') or '')[:46]}  （{why}）")
        ready += relevant; filt += (not relevant)
    print(f"→ ready（送 ③）{ready}｜filtered-out {filt}。模型不參與此篩選；關鍵字／行為者清單可調（見碼頂）。")

if __name__ == "__main__":
    main()
