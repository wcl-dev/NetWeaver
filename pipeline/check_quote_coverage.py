#!/usr/bin/env python3
"""引用量體檢（本機發布前閘）——兩個維度，都是「碼判斷」：

  1. 逐字完整性：已發布的每則 claim.text 是否仍是其來源原文的「逐字子字串」
     （比照 extract.py:span_check 的精確比對；fail-closed 的事後複查）。
     抓得到「繞過 span_check 混進 db.js 的改寫」（例如手寫樣本經已退役的 compile_to_db.py 併入）。

  2. 單篇覆蓋率：同一份原文，被我們發布成 claim 的「唯一逐字」聯集佔原文多少比例。
     著作權法 §52（合理引用須在必要範圍）／§65 合理使用四因素裡的「質與量」，看的是占原作多少；
     很多短引用會累加成實質比例。這裡把那條線變成碼能判的數字，預設 25%（union，已對重疊去重）。
     註：發布的 claim 是模型 quote 經 project() 擴張到「整句」後的文字，量體以發布後為準。

為何只在本機跑、不進 CI：claim 的佐證原文在 pipeline/raw/（.gitignore，不進 repo），
GitHub runner 上沒有原文可比對。curate.py compile 發布後會自動呼叫 audit() 對本次寫入的來源出警告。

用法：
  python3 pipeline/check_quote_coverage.py                 # 體檢報告
  python3 pipeline/check_quote_coverage.py --check          # 超標／非逐字就 exit 1（發布前把關）
  python3 pipeline/check_quote_coverage.py --max-coverage 0.3
  python3 pipeline/check_quote_coverage.py --json           # 機器可讀
"""
import argparse
import json
import pathlib
import sys
import unicodedata
from collections import defaultdict

ROOT = pathlib.Path(__file__).resolve().parent.parent
DB = ROOT / "data" / "db.js"
RAW = ROOT / "pipeline" / "raw"
DEFAULT_CAP = 0.25


def load_db():
    src = DB.read_text(encoding="utf-8")
    i = src.index("{", src.index("window.NETWEAVER_DB"))
    return json.loads(src[i:src.rindex("}") + 1])


def _norm(s):
    # 覆蓋率估算用的寬鬆正規化（吸收空白/全半形差異）；逐字完整性另用精確比對。
    return unicodedata.normalize("NFKC", " ".join(s.split()))


def raw_text_by_url():
    """url -> 原文正文（讀 pipeline/raw/*/*.json 的 manifest，配同名 .txt）。"""
    out = {}
    for mani in RAW.glob("*/*.json"):
        try:
            m = json.loads(mani.read_text(encoding="utf-8"))
        except Exception:
            continue
        txt = mani.with_suffix(".txt")
        if m.get("url") and txt.exists():
            out[m["url"]] = txt.read_text(encoding="utf-8")
    return out


def union_coverage(texts, raw):
    """把每則 text 在原文中的位置取聯集，回傳 (覆蓋率, 命中數, 總數)。"""
    R = _norm(raw)
    if not R:
        return (0.0, 0, len(texts))
    spans, hit = [], 0
    for t in texts:
        p = R.find(_norm(t))
        if p >= 0:
            spans.append((p, p + len(_norm(t))))
            hit += 1
    if not spans:
        return (0.0, 0, len(texts))
    spans.sort()
    merged = [list(spans[0])]
    for a, b in spans[1:]:
        if a <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], b)
        else:
            merged.append([a, b])
    cov = sum(b - a for a, b in merged) / len(R)
    return (cov, hit, len(texts))


def audit(db, cap=DEFAULT_CAP, only_sids=None, url2raw=None):
    """對 db 的 claims 做體檢。only_sids＝只看這些 source_id（compile 後只查本次寫入的來源）。

    回傳 dict：rows（所有可比對來源）、over（超 cap）、nonverbatim、no_raw。
    """
    srcmeta = {s["id"]: s for s in db["sources"]}
    url2raw = raw_text_by_url() if url2raw is None else url2raw
    by_src = defaultdict(list)
    for e in db["entities"]:
        for c in e.get("claims", []) or []:
            if only_sids is None or c["source_id"] in only_sids:
                by_src[c["source_id"]].append(c.get("text", ""))
    rows, over, nonverbatim, no_raw = [], [], [], []
    for sid, texts in by_src.items():
        raw = url2raw.get((srcmeta.get(sid) or {}).get("url"))
        if raw is None:
            no_raw.append(sid)
            continue
        # 逐字完整性：精確子字串（比照 span_check 的 `q not in text`）
        bad = [t for t in texts if t not in raw]
        if bad:
            nonverbatim.append((sid, len(bad), len(texts), bad[:3]))
        cov, hit, tot = union_coverage(texts, raw)
        rows.append((cov, sid, hit, tot, len(raw)))
        if cov > cap:
            over.append((cov, sid, hit, tot, len(raw)))
    rows.sort(reverse=True)
    over.sort(reverse=True)
    return {"rows": rows, "over": over, "nonverbatim": nonverbatim, "no_raw": no_raw}


def main(argv=None):
    ap = argparse.ArgumentParser(description="引用量體檢（本機發布前閘）")
    ap.add_argument("--max-coverage", type=float, default=DEFAULT_CAP,
                    help=f"單篇 union 覆蓋率上限（預設 {DEFAULT_CAP}）")
    ap.add_argument("--check", action="store_true",
                    help="有超標或逐字對不上就 exit 1")
    ap.add_argument("--json", action="store_true", help="輸出 JSON")
    args = ap.parse_args(argv)

    cap = args.max_coverage
    r = audit(load_db(), cap)
    rows, over, nonverbatim, no_raw = r["rows"], r["over"], r["nonverbatim"], r["no_raw"]

    if args.json:
        print(json.dumps({
            "max_coverage": cap,
            "over_threshold": [{"source_id": s, "coverage": round(c, 4),
                                "matched": h, "claims": t, "raw_chars": n}
                               for c, s, h, t, n in over],
            "nonverbatim": [{"source_id": s, "bad": b, "claims": t}
                            for s, b, t, _ in nonverbatim],
            "no_local_raw": no_raw,
        }, ensure_ascii=False, indent=2))
    else:
        print(f"== 引用量體檢（上限 {cap:.0%} union 覆蓋率）==\n")
        print(f"可本機比對的來源：{len(rows)}；無本機原文（跳過）：{len(no_raw)}\n")
        print("逐字完整性（claim.text 是否仍為原文精確子字串）：")
        if nonverbatim:
            for sid, b, t, ex in nonverbatim:
                print(f"  ✗ {sid}: {b}/{t} 則對不上原文（非逐字）")
                for e in ex:
                    print(f"       ·「{e[:60]}{'…' if len(e) > 60 else ''}」")
        else:
            print("  ✓ 全部逐字")
        print(f"\n單篇覆蓋率（超過 {cap:.0%} 者）：")
        if over:
            for c, sid, h, t, n in over:
                print(f"  ⚠ {c*100:5.1f}%  {sid}  （{h}/{t} 句命中 / 原文 {n} 字）")
        else:
            print("  ✓ 無來源超標")
        hi = [x for x in rows if cap - 0.05 <= x[0] <= cap]
        if hi:
            print(f"\n觀察區（{cap - 0.05:.0%}～{cap:.0%}，未超標但接近上限）：")
            for c, sid, h, t, n in hi:
                print(f"  · {c*100:5.1f}%  {sid}")

    if args.check and (over or nonverbatim):
        print(f"\n❌ 未通過：{len(over)} 來源超覆蓋率上限、{len(nonverbatim)} 來源有非逐字 claim。",
              file=sys.stderr)
        return 1
    if args.check:
        print("\n✅ 通過", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
