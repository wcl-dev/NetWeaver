#!/usr/bin/env python3
"""引用量體檢（本機發布前閘）——三件事，都是「碼判斷」：

  1. 逐字完整性：已發布的每則 claim.text 是否仍是其來源原文的「逐字子字串」
     （比照 extract.py:span_check 的精確比對；fail-closed 的事後複查）。
     抓得到「繞過 span_check 混進 db.js 的改寫」（例如手寫樣本經已退役的 compile_to_db.py 併入）。
     只用精確比對；空白／全半形正規化只用在下面的覆蓋率估算，不得放寬這一關。

  2. 單篇覆蓋率：同一份原文，被我們發布成 claim 的「唯一逐字」聯集佔原文多少比例（重疊與重複句不灌水）。
     這是**內部風險門檻**（預設 25%），用來提早發現疑似過量引用；**不是法律安全線**——
     著作權法 §52 引用須「在合理範圍內」，§65 要求依個案審酌一切情狀（利用目的、著作性質、
     所利用之質量與占比、對市場的影響），沒有任何固定百分比可以保證合法。
     註：發布的 claim 是模型 quote 經 project() 擴張到「整句」後的文字，量體以發布後為準。

  3. 查不到的要明講：沒有本機原文的來源（或 claim 指向未登錄的來源）**無法驗證**，
     一律列為「未驗證」，不當作通過；加 --strict 則視為失敗。

為何只在本機跑、不進 CI：claim 的佐證原文在 pipeline/raw/（.gitignore，不進 repo），
GitHub runner 上沒有原文可比對。curate.py compile 發布後會自動呼叫 audit() 對本次寫入的來源出警告。

用法：
  python3 pipeline/check_quote_coverage.py                 # 體檢報告
  python3 pipeline/check_quote_coverage.py --check          # 超標／非逐字／來源未登錄就 exit 1（發布前把關）
  python3 pipeline/check_quote_coverage.py --strict         # 另把「未驗證（無本機原文）」也視為失敗
  python3 pipeline/check_quote_coverage.py --max-coverage 0.3
  python3 pipeline/check_quote_coverage.py --json           # 機器可讀
"""
import argparse
import importlib.util
import json
import pathlib
import sys
import unicodedata
from collections import defaultdict

_here = pathlib.Path(__file__).resolve().parent


def _sibling(name):
    spec = importlib.util.spec_from_file_location(name, str(_here / (name + ".py")))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


_urlnorm = _sibling("urlnorm")            # 來源比對鍵：追蹤參數／scheme／www／尾斜線不算不同來源

ROOT = _here.parent
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
    """正規化 url -> 原文正文（讀 pipeline/raw/*/*.json 的 manifest，配同名 .txt）。"""
    out = {}
    for mani in RAW.glob("*/*.json"):
        try:
            m = json.loads(mani.read_text(encoding="utf-8"))
        except Exception:
            continue
        txt = mani.with_suffix(".txt")
        if m.get("url") and txt.exists():
            out[_urlnorm.source_key(m["url"])] = txt.read_text(encoding="utf-8")
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

    url2raw 的 key 是來源網址（任何寫法，內部會正規化）。回傳 dict：
      rows          可比對來源 (覆蓋率, source_id, 命中數, claim 數, 原文字數)
      over          rows 中超過 cap 者
      nonverbatim   (source_id, 非逐字數, claim 數, 前 3 例)
      no_raw        登記了、但本機沒有原文的來源 id（**未驗證**）；no_raw_claims＝各來源的 claim 數
      unknown_source  claim 指向 db.sources 裡不存在的來源 id（資料不一致）
    """
    key = _urlnorm.source_key
    srcmeta = {s["id"]: s for s in db["sources"]}
    raw_map = raw_text_by_url() if url2raw is None else {key(k): v for k, v in url2raw.items()}
    by_src = defaultdict(list)
    for e in db["entities"]:
        for c in e.get("claims", []) or []:
            if only_sids is None or c["source_id"] in only_sids:
                by_src[c["source_id"]].append(c.get("text", ""))
    rows, over, nonverbatim, no_raw, unknown = [], [], [], [], []
    no_raw_claims = {}
    for sid, texts in by_src.items():
        meta = srcmeta.get(sid)
        if meta is None:
            unknown.append(sid)
            continue
        raw = raw_map.get(key(meta.get("url")))
        if raw is None:
            no_raw.append(sid)
            no_raw_claims[sid] = len(texts)
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
    return {"rows": rows, "over": over, "nonverbatim": nonverbatim, "no_raw": no_raw,
            "no_raw_claims": no_raw_claims, "unknown_source": unknown}


def exit_code(r, strict=False):
    """--check 的判定，回傳 (exit code, 失敗理由清單)。

    超標、非逐字、claim 指向未登錄來源 → 失敗。「未驗證」（無本機原文）預設只明講、不擋——
    舊來源的原文可能已無法取得；--strict 才視為失敗。"""
    reasons = []
    if r["over"]:
        reasons.append(f"{len(r['over'])} 來源超覆蓋率上限")
    if r["nonverbatim"]:
        reasons.append(f"{len(r['nonverbatim'])} 來源有非逐字 claim")
    if r["unknown_source"]:
        reasons.append(f"{len(r['unknown_source'])} 個 claim 來源未登錄於 db.sources")
    if strict and r["no_raw"]:
        reasons.append(f"{len(r['no_raw'])} 來源（{sum(r['no_raw_claims'].values())} 則 claim）"
                       f"無本機原文、無法驗證")
    return (1 if reasons else 0), reasons


def main(argv=None):
    ap = argparse.ArgumentParser(description="引用量體檢（本機發布前閘）")
    ap.add_argument("--max-coverage", type=float, default=DEFAULT_CAP,
                    help=f"單篇 union 覆蓋率上限（預設 {DEFAULT_CAP}）")
    ap.add_argument("--check", action="store_true",
                    help="有超標、非逐字或來源未登錄就 exit 1")
    ap.add_argument("--strict", action="store_true",
                    help="同 --check，另把「未驗證（無本機原文）」也視為失敗")
    ap.add_argument("--json", action="store_true", help="輸出 JSON")
    args = ap.parse_args(argv)
    args.check = args.check or args.strict

    cap = args.max_coverage
    r = audit(load_db(), cap)
    rows, over, nonverbatim = r["rows"], r["over"], r["nonverbatim"]
    no_raw, unknown = r["no_raw"], r["unknown_source"]
    unverified = sum(r["no_raw_claims"].values())
    code, reasons = exit_code(r, args.strict)

    if args.json:
        print(json.dumps({
            "max_coverage": cap,
            "over_threshold": [{"source_id": s, "coverage": round(c, 4),
                                "matched": h, "claims": t, "raw_chars": n}
                               for c, s, h, t, n in over],
            "nonverbatim": [{"source_id": s, "bad": b, "claims": t}
                            for s, b, t, _ in nonverbatim],
            "unverified_no_local_raw": [{"source_id": s, "claims": r["no_raw_claims"][s]} for s in no_raw],
            "unknown_source": unknown,
            "verdict": {"exit_code": code, "reasons": reasons, "strict": args.strict},
        }, ensure_ascii=False, indent=2))
    else:
        print(f"== 引用量體檢（內部風險門檻：單篇 union 覆蓋率 {cap:.0%}；非法律安全線）==\n")
        print(f"已驗證來源：{len(rows)}；未驗證（無本機原文）：{len(no_raw)} 來源／{unverified} 則 claim；"
              f"claim 指向未登錄來源：{len(unknown)}\n")
        print("逐字完整性（claim.text 是否仍為原文精確子字串）：")
        if nonverbatim:
            for sid, b, t, ex in nonverbatim:
                print(f"  ✗ {sid}: {b}/{t} 則對不上原文（非逐字）")
                for e in ex:
                    print(f"       ·「{e[:60]}{'…' if len(e) > 60 else ''}」")
        else:
            print("  ✓ 已驗證的來源全部逐字")
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
        print("\n未驗證（無本機原文——逐字性與引用量都查不到，不等於通過）：")
        if no_raw:
            for sid in no_raw:
                print(f"  ⚠ {sid}（{r['no_raw_claims'][sid]} 則 claim）")
        else:
            print("  ✓ 無")
        if unknown:
            print("\nclaim 指向未登錄來源（資料不一致）：")
            for sid in unknown:
                print(f"  ✗ {sid}")

    if args.check:
        if code:
            print("\n❌ 未通過：" + "；".join(reasons) + "。", file=sys.stderr)
        elif no_raw:
            print(f"\n✅ 已驗證範圍通過；⚠ 另有 {len(no_raw)} 來源／{unverified} 則 claim "
                  f"無本機原文、未驗證（--strict 會視為失敗）", file=sys.stderr)
        else:
            print("\n✅ 通過", file=sys.stderr)
        return code
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
