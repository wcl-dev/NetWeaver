#!/usr/bin/env python3
"""引用量體檢（本機發布前閘）——四件事，都是「碼判斷」：

  1. 逐字完整性：已發布的每則 claim.text 是否仍是其來源原文的「逐字子字串」
     （比照 extract.py:span_check 的精確比對；fail-closed 的事後複查）。
     抓得到「繞過 span_check 混進 db.js 的改寫」（例如手寫樣本經已退役的 compile_to_db.py 併入）。
     只用精確比對；空白／全半形正規化只用在下面的覆蓋率估算，不得放寬這一關。空白或缺 text 的 claim 一律不合格。

  2. 單篇覆蓋率：同一份原文，被我們發布成 claim 的「唯一逐字」聯集佔原文多少比例（重疊與重複句不灌水；
     每則不同的 claim 文字各佔一個出現處，正規化後相同的不同文字取不同區域）。這是**內部風險門檻**（預設 25%），用來提早發現疑似過量引用；
     **不是法律安全線**——著作權法 §52 引用須「在合理範圍內」，§65 要求依個案審酌一切情狀（利用目的、
     著作性質、所利用之質量與占比、對市場的影響），沒有任何固定百分比可以保證合法。
     註：發布的 claim 是模型 quote 經 project() 擴張到「整句」後的文字，量體以發布後為準。

  3. 查不到的要明講：沒有本機原文的來源（或 claim 指向未登錄的來源）**無法驗證**，
     一律列為「未驗證」，不當作通過；加 --strict 則視為失敗。

  4. 不認錯文件：來源網址→原文先用「精確網址」比對；找不到才用正規化網址（追蹤參數／scheme／www／尾斜線
     不算不同來源），且正規化後必須**只有一份原文**。對到多份「不同」原文＝歧義，明講並視為失敗，
     不任選一份去「驗證」（否則通用句可能被拿去對錯誤的原文過關）。

為何只在本機跑、不進 CI：claim 的佐證原文在 pipeline/raw/（.gitignore，不進 repo），
GitHub runner 上沒有原文可比對。curate.py compile 發布後會自動呼叫 audit() 對本次寫入的來源出警告。

用法：
  python3 pipeline/check_quote_coverage.py                 # 體檢報告（不影響結束碼）
  python3 pipeline/check_quote_coverage.py --check          # 超標／非逐字／來源未登錄／原文歧義就 exit 1（發布前把關）
  python3 pipeline/check_quote_coverage.py --strict         # 另把「未驗證（無本機原文）」也視為失敗
  python3 pipeline/check_quote_coverage.py --max-coverage 0.3
  python3 pipeline/check_quote_coverage.py --json           # 機器可讀；verdict.would_fail＝會不會失敗，exit_code＝實際結束碼
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
EMPTY_MARK = "（空白或缺少 text）"


def load_db():
    src = DB.read_text(encoding="utf-8")
    i = src.index("{", src.index("window.NETWEAVER_DB"))
    return json.loads(src[i:src.rindex("}") + 1])


def _norm(s):
    # 覆蓋率估算用的寬鬆正規化（吸收空白/全半形差異）；逐字完整性另用精確比對。
    return unicodedata.normalize("NFKC", " ".join(s.split()))


def _index_raw(pairs):
    """(url, 原文) 序列 → (exact, norm)。exact[url]＝該網址下「不同」原文的清單；norm[鍵]＝正規化鍵下「不同」
    原文的清單。同一網址／同一鍵可能對到多份不同原文——這裡不任選一份，交給 _resolve_raw 判歧義。
    空白原文（例如抓取失敗的殘檔）視同沒有。"""
    exact, norm = defaultdict(list), defaultdict(list)
    for url, text in pairs:
        if not url or not isinstance(text, str) or not text.strip():
            continue
        if text not in exact[url]:
            exact[url].append(text)
        k = _urlnorm.source_key(url)
        if text not in norm[k]:
            norm[k].append(text)
    return exact, norm


def raw_index():
    """讀 pipeline/raw/*/*.json 的 manifest，配同名 .txt，建立原文索引。"""
    pairs = []
    for mani in RAW.glob("*/*.json"):
        try:
            m = json.loads(mani.read_text(encoding="utf-8"))
        except Exception:
            continue
        txt = mani.with_suffix(".txt")
        if m.get("url") and txt.exists():
            pairs.append((m["url"], txt.read_text(encoding="utf-8")))
    return _index_raw(pairs)


def _resolve_raw(index, url):
    """來源網址 → (原文 | None, 狀態)。狀態：ok／missing（沒有本機原文）／ambiguous（對到多份不同原文）。
    精確網址優先；其次正規化鍵，且必須只有一份不同的原文才採用。"""
    exact, norm = index
    if not url:
        return None, "missing"
    cands = exact.get(url) or norm.get(_urlnorm.source_key(url)) or []
    if not cands:
        return None, "missing"
    if len(cands) > 1:
        return None, "ambiguous"
    return cands[0], "ok"


def union_coverage(texts, raw):
    """把每則 text 在原文中的位置取聯集，回傳 (覆蓋率, 命中數, 總數)。

    每則「不同」的 text 各佔一個出現處：正規化後相同、卻是不同文字的兩則（例如全形／半形版本落在原文不同處），
    會各取不同的出現處，不互相遮蓋；同一則文字重複發布（掛在多個實體）只算一次，原文裡重複出現的短句
    也不因此灌水。空白 text 不計。"""
    R = _norm(raw)
    if not R:
        return (0.0, 0, len(texts))
    spans, hit, seen, nxt = [], 0, set(), {}
    for t in texts:
        if not isinstance(t, str) or t in seen:
            continue
        seen.add(t)
        nt = _norm(t)
        if not nt:
            continue
        p = R.find(nt, nxt.get(nt, 0))
        if p < 0:
            p = R.find(nt)                 # 該正規化文字的後續出現處用完了 → 退回第一處（同一區域）
        if p < 0:
            continue
        hit += 1
        nxt[nt] = p + 1                    # 下一則「不同文字、同正規化」的 claim 取下一個出現處
        spans.append((p, p + len(nt)))
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

    url2raw＝{來源網址: 原文}（測試注入；None 則讀 pipeline/raw）。回傳 dict：
      rows            可比對來源 (覆蓋率, source_id, 命中數, claim 數, 原文字數)
      over            rows 中超過 cap 者
      nonverbatim     (source_id, 不合格數, claim 數, 前 3 例)；空白／缺 text 的 claim 也算不合格
      no_raw          登記了、但本機沒有原文的來源 id（**未驗證**）；no_raw_claims＝各來源的 claim 數
      ambiguous_raw   來源網址對到多份「不同」原文（無法確定該驗證哪一份）；ambiguous_claims＝各來源 claim 數
      unknown_source  claim 指向 db.sources 裡不存在的來源 id（資料不一致）
    """
    if not (0 <= cap <= 1):               # nan 的比較皆為 False，也會落到這裡
        raise ValueError(f"cap 須為 0～1 之間的數字：{cap!r}")
    srcmeta = {s["id"]: s for s in db["sources"]}
    index = raw_index() if url2raw is None else _index_raw(url2raw.items())
    by_src = defaultdict(list)
    for e in db["entities"]:
        for c in e.get("claims", []) or []:
            if only_sids is None or c["source_id"] in only_sids:
                by_src[c["source_id"]].append(c.get("text"))
    rows, over, nonverbatim, no_raw, unknown, ambiguous = [], [], [], [], [], []
    no_raw_claims, ambiguous_claims = {}, {}
    for sid, texts in by_src.items():
        meta = srcmeta.get(sid)
        if meta is None:
            unknown.append(sid)
            continue
        raw, status = _resolve_raw(index, meta.get("url"))
        if status == "ambiguous":
            ambiguous.append(sid)
            ambiguous_claims[sid] = len(texts)
            continue
        if status == "missing":
            no_raw.append(sid)
            no_raw_claims[sid] = len(texts)
            continue
        valid = [t for t in texts if isinstance(t, str) and t.strip()]
        empty = len(texts) - len(valid)
        # 逐字完整性：精確子字串（比照 span_check 的 `q not in text`）
        bad = [t for t in valid if t not in raw]
        if empty or bad:
            examples = ([EMPTY_MARK] if empty else []) + bad
            nonverbatim.append((sid, len(bad) + empty, len(texts), examples[:3]))
        cov, hit, _ = union_coverage(valid, raw)
        rows.append((cov, sid, hit, len(texts), len(raw)))
        if cov > cap:
            over.append((cov, sid, hit, len(texts), len(raw)))
    rows.sort(reverse=True)
    over.sort(reverse=True)
    return {"rows": rows, "over": over, "nonverbatim": nonverbatim, "no_raw": no_raw,
            "no_raw_claims": no_raw_claims, "ambiguous_raw": ambiguous,
            "ambiguous_claims": ambiguous_claims, "unknown_source": unknown}


def exit_code(r, strict=False):
    """--check 的判定，回傳 (exit code, 失敗理由清單)。

    超標、非逐字、claim 指向未登錄來源、來源網址對到多份不同原文 → 失敗。
    「未驗證」（無本機原文）預設只明講、不擋——舊來源的原文可能已無法取得；--strict 才視為失敗。"""
    reasons = []
    if r["over"]:
        reasons.append(f"{len(r['over'])} 來源超覆蓋率上限")
    if r["nonverbatim"]:
        reasons.append(f"{len(r['nonverbatim'])} 來源有非逐字（或空白）claim")
    if r["unknown_source"]:
        reasons.append(f"{len(r['unknown_source'])} 個 claim 來源未登錄於 db.sources")
    if r.get("ambiguous_raw"):
        reasons.append(f"{len(r['ambiguous_raw'])} 個來源的網址對到多份不同原文，無法確定該驗證哪一份")
    if strict and r["no_raw"]:
        reasons.append(f"{len(r['no_raw'])} 來源（{sum(r['no_raw_claims'].values())} 則 claim）"
                       f"無本機原文、無法驗證")
    return (1 if reasons else 0), reasons


def _cap_arg(s):
    try:
        v = float(s)
    except ValueError:
        raise argparse.ArgumentTypeError(f"不是數字：{s!r}")
    if not (0 < v <= 1):                  # nan 也會落到這裡
        raise argparse.ArgumentTypeError(f"須為 0～1 之間的數字（不含 0），例如 0.25；收到 {s!r}")
    return v


def main(argv=None, db=None, url2raw=None):
    """db／url2raw 僅供測試注入（預設讀 data/db.js 與 pipeline/raw）。"""
    ap = argparse.ArgumentParser(description="引用量體檢（本機發布前閘）")
    ap.add_argument("--max-coverage", type=_cap_arg, default=DEFAULT_CAP,
                    help=f"單篇 union 覆蓋率上限，0～1（預設 {DEFAULT_CAP}）")
    ap.add_argument("--check", action="store_true",
                    help="有超標、非逐字、來源未登錄或原文歧義就 exit 1")
    ap.add_argument("--strict", action="store_true",
                    help="同 --check，另把「未驗證（無本機原文）」也視為失敗")
    ap.add_argument("--json", action="store_true", help="輸出 JSON")
    args = ap.parse_args(argv)
    args.check = args.check or args.strict

    cap = args.max_coverage
    r = audit(load_db() if db is None else db, cap, url2raw=url2raw)
    rows, over, nonverbatim = r["rows"], r["over"], r["nonverbatim"]
    no_raw, unknown, ambiguous = r["no_raw"], r["unknown_source"], r["ambiguous_raw"]
    unverified = sum(r["no_raw_claims"].values())
    code, reasons = exit_code(r, args.strict)
    actual = code if args.check else 0                  # 沒加 --check 只出報告，不影響結束碼

    if args.json:
        print(json.dumps({
            "max_coverage": cap,
            "over_threshold": [{"source_id": s, "coverage": round(c, 4),
                                "matched": h, "claims": t, "raw_chars": n}
                               for c, s, h, t, n in over],
            "nonverbatim": [{"source_id": s, "bad": b, "claims": t}
                            for s, b, t, _ in nonverbatim],
            "unverified_no_local_raw": [{"source_id": s, "claims": r["no_raw_claims"][s]} for s in no_raw],
            "ambiguous_raw": ambiguous,
            "unknown_source": unknown,
            "verdict": {"would_fail": bool(code), "exit_code": actual,
                        "reasons": reasons, "strict": args.strict, "check": args.check},
        }, ensure_ascii=False, indent=2))
    else:
        print(f"== 引用量體檢（內部風險門檻：單篇 union 覆蓋率 {cap:.0%}；非法律安全線）==\n")
        print(f"已驗證來源：{len(rows)}；未驗證（無本機原文）：{len(no_raw)} 來源／{unverified} 則 claim；"
              f"原文歧義：{len(ambiguous)}；claim 指向未登錄來源：{len(unknown)}\n")
        print("逐字完整性（claim.text 是否仍為原文精確子字串）：")
        if nonverbatim:
            for sid, b, t, ex in nonverbatim:
                print(f"  ✗ {sid}: {b}/{t} 則對不上原文（非逐字或空白）")
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
        if ambiguous:
            print("\n原文歧義（來源網址對到多份不同原文，無法確定該驗證哪一份）：")
            for sid in ambiguous:
                print(f"  ✗ {sid}（{r['ambiguous_claims'][sid]} 則 claim）")
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
    return actual


if __name__ == "__main__":
    raise SystemExit(main())
