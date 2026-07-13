#!/usr/bin/env python3
"""IAA diff：對照兩位標註員（A/B）對同一 dev 文的獨立標註，產「一致／分歧」報告供裁決。
標註檔 schema（不含 mid/gid 定案——那是裁決者的事）：
  {"mentions":[{surface, entity_type, context_role, gid_hint?, quote}],
   "assertions":[{subject_surface, predicate, object_surface, quote}], "notes":[...]}
配對規則：mention 以「quote 定位出的 surface 絕對 span 重疊」配對（同實體不同寫法也抓得到）；
assertion 以（主詞surface正規化, 述詞, 受詞surface正規化）配對。quote 非逐字者列 INVALID。
用法：python3 pipeline/gold/diff_annotations.py <gold檔(取cleaned_text)> <A檔> <B檔>
"""
import json, re, sys, unicodedata, pathlib

canon = lambda s: unicodedata.normalize("NFKC", s or "").casefold().replace(" ", "")

def locate_all(q, text):
    idxs, i = [], text.find(q)
    while i != -1: idxs.append(i); i = text.find(q, i + 1)
    return idxs

def resolve(side, text, tag):
    """定位每筆 mention 的 surface 絕對 span；回 (resolved, invalid)。"""
    ok, bad = [], []
    for m in side.get("mentions", []):
        q, sf = m.get("quote", ""), m.get("surface", "")
        idxs = locate_all(q, text)
        if not idxs: bad.append((tag, "mention", sf, "quote 非逐字/不在文中")); continue
        if len(idxs) > 1 and not m.get("quote_occurrence"):
            bad.append((tag, "mention", sf, f"quote 出現 {len(idxs)} 次未消歧")); continue
        qs = idxs[(m.get("quote_occurrence", 1)) - 1]
        if sf not in q: bad.append((tag, "mention", sf, "surface 不在 quote 內")); continue
        off = q.index(sf)
        ok.append({**m, "_s": qs + off, "_e": qs + off + len(sf)})
    for a in side.get("assertions", []):
        if not locate_all(a.get("quote", ""), text):
            bad.append((tag, "assertion", f"{a.get('subject_surface')}-{a.get('predicate')}->{a.get('object_surface')}", "quote 非逐字"))
    return ok, bad

def overlap(a, b): return a["_s"] < b["_e"] and b["_s"] < a["_e"]

def diff(gold_path, a_path, b_path):
    text = json.loads(pathlib.Path(gold_path).read_text(encoding="utf-8"))["cleaned_text"]
    A = json.loads(pathlib.Path(a_path).read_text(encoding="utf-8"))
    B = json.loads(pathlib.Path(b_path).read_text(encoding="utf-8"))
    ra, bad_a = resolve(A, text, "A"); rb, bad_b = resolve(B, text, "B")

    used_b, m_agree, m_dispute, m_a_only = set(), [], [], []
    for ma in ra:
        hit = next((i for i, mb in enumerate(rb) if i not in used_b and overlap(ma, mb)), None)
        if hit is None: m_a_only.append(ma); continue
        mb = rb[hit]; used_b.add(hit)
        same_t = ma.get("entity_type") == mb.get("entity_type")
        same_r = ma.get("context_role") == mb.get("context_role")
        (m_agree if (same_t and same_r) else m_dispute).append((ma, mb))
    m_b_only = [mb for i, mb in enumerate(rb) if i not in used_b]

    key = lambda a: (canon(a.get("subject_surface")), canon(a.get("predicate")), canon(a.get("object_surface")))
    ka = {key(x): x for x in A.get("assertions", [])}
    kb = {key(x): x for x in B.get("assertions", [])}
    a_agree = [ka[k] for k in ka if k in kb]
    # 同主受詞、不同述詞 → 述詞分歧
    rest_a = {k: v for k, v in ka.items() if k not in kb}
    rest_b = {k: v for k, v in kb.items() if k not in ka}
    p_dispute, used = [], set()
    for k, v in list(rest_a.items()):
        m = next((k2 for k2 in rest_b if k2 not in used and k2[0] == k[0] and k2[2] == k[2]), None)
        if m: p_dispute.append((v, rest_b[m])); used.add(m); rest_a.pop(k)
    a_a_only = list(rest_a.values()); a_b_only = [v for k, v in rest_b.items() if k not in used]

    W = lambda s: print(s)
    W(f"══ IAA diff（{pathlib.Path(gold_path).name}）══")
    W(f"mention：A {len(ra)}｜B {len(rb)}｜span 配對且 type+role 一致 {len(m_agree)}｜配對但屬性分歧 {len(m_dispute)}｜A獨有 {len(m_a_only)}｜B獨有 {len(m_b_only)}")
    W(f"assertion：A {len(ka)}｜B {len(kb)}｜三元組一致 {len(a_agree)}｜述詞分歧 {len(p_dispute)}｜A獨有 {len(a_a_only)}｜B獨有 {len(a_b_only)}")
    if bad_a or bad_b:
        W("―― INVALID（quote 非逐字等，需該標註員修）――")
        for t in bad_a + bad_b: W(f"  ✗ [{t[0]}] {t[1]}「{str(t[2])[:40]}」：{t[3]}")
    if m_dispute:
        W("―― mention 屬性分歧（裁決）――")
        for ma, mb in m_dispute:
            W(f"  ⚖ 「{ma['surface'][:28]}」 A={ma.get('entity_type')}/{ma.get('context_role')} vs B={mb.get('entity_type')}/{mb.get('context_role')}")
    if m_a_only:
        W("―― 只有 A 標（B 漏或 A 過標？裁決）――")
        for m in m_a_only: W(f"  A+ {m.get('entity_type')}/{m.get('context_role')}「{m['surface'][:36]}」")
    if m_b_only:
        W("―― 只有 B 標（A 漏或 B 過標？裁決）――")
        for m in m_b_only: W(f"  B+ {m.get('entity_type')}/{m.get('context_role')}「{m['surface'][:36]}」")
    if p_dispute:
        W("―― 述詞分歧 ――")
        for va, vb in p_dispute: W(f"  ⚖ {va['subject_surface']}→{va['object_surface']}：A「{va['predicate']}」 vs B「{vb['predicate']}」")
    if a_a_only:
        W("―― 只有 A 的邊 ――")
        for v in a_a_only: W(f"  A+ {v['subject_surface']} —{v['predicate']}→ {v['object_surface'][:30]}")
    if a_b_only:
        W("―― 只有 B 的邊 ――")
        for v in a_b_only: W(f"  B+ {v['subject_surface']} —{v['predicate']}→ {v['object_surface'][:30]}")
    n_dis = len(m_dispute) + len(m_a_only) + len(m_b_only) + len(p_dispute) + len(a_a_only) + len(a_b_only)
    W(f"→ 待裁決 {n_dis} 項；一致項可自動收（{len(m_agree)} mentions＋{len(a_agree)} assertions）。")

if __name__ == "__main__":
    if len(sys.argv) != 4: raise SystemExit(__doc__)
    diff(*sys.argv[1:])
