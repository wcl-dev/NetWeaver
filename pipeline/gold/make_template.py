#!/usr/bin/env python3
"""dev gold 模板產生器：吃 spec（report＋strata＋raw_text）→ 清理正文（cleaner v0）→ 算 text_sha256 →
產出空白標註模板（mentions/assertions/operation_expected 待人填）。契約見 ../../docs/GOLD.md、指引見 GUIDELINES.md。
用法：python3 pipeline/gold/make_template.py <spec.json> <out.gold.json>
spec.json = {"report":{name,url,org,published,type}, "strata":{lang,source,length,format,attribution}, "kind":"dev", "raw_text":"..."}
"""
import json, re, sys, hashlib, pathlib

CLEANER = "normalize-v0"          # v0：壓縮連續空白為單一、去頭尾。正式 cleaner（去 chrome/正文抽取）待接。

def clean(raw):
    return re.sub(r"[ \t]+", " ", re.sub(r"\n{3,}", "\n\n", (raw or "").replace("\r\n", "\n"))).strip()

def build(spec):
    text = clean(spec["raw_text"])
    return {
        "_annotate": "填 mentions/assertions/operation_expected（見 GUIDELINES.md）。只填逐字 quote/surface，offset 由 validate_gold.py 算。勿改 cleaned_text（改了 sha 不符）。",
        "kind": spec.get("kind", "dev"),
        "cleaner_version": CLEANER,
        "text_sha256": "sha256:" + hashlib.sha256(text.encode("utf-8")).hexdigest(),
        "report": spec["report"],
        "strata": spec["strata"],
        "cleaned_text": text,
        "mentions": [],
        "assertions": [],
        "operation_expected": []
    }

def main(spec_path, out_path):
    spec = json.loads(pathlib.Path(spec_path).read_text(encoding="utf-8"))
    tmpl = build(spec)
    pathlib.Path(out_path).write_text(json.dumps(tmpl, ensure_ascii=False, indent=2), encoding="utf-8")
    n = len(tmpl["cleaned_text"])
    print(f"✓ {out_path}｜{tmpl['strata']}｜cleaned_text {n} 字｜{tmpl['text_sha256'][:23]}…｜待標註")

def finalize(path):
    """就地重清 cleaned_text＋回填 text_sha256（供先 Write 模板、正文只轉錄一次的流程）。"""
    p = pathlib.Path(path); g = json.loads(p.read_text(encoding="utf-8"))
    g["cleaned_text"] = clean(g["cleaned_text"]); g["cleaner_version"] = CLEANER
    g["text_sha256"] = "sha256:" + hashlib.sha256(g["cleaned_text"].encode("utf-8")).hexdigest()
    for k in ("mentions", "assertions", "operation_expected"): g.setdefault(k, [])
    g.setdefault("_annotate", "填 mentions/assertions/operation_expected（見 GUIDELINES.md）。勿改 cleaned_text（改了 sha 不符）。")
    p.write_text(json.dumps(g, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✓ finalized {path}｜{g.get('strata')}｜cleaned_text {len(g['cleaned_text'])} 字｜{g['text_sha256'][:23]}…")

if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) == 2 and a[0] == "--finalize": finalize(a[1]); raise SystemExit
    if len(a) != 2: raise SystemExit(__doc__)
    main(a[0], a[1])
