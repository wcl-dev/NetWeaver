#!/usr/bin/env python3
"""gold 驗證器＋offset 衍生（GOLD.md v0.2）。標註者只填逐字 quote/surface；這裡定位 offset 並查完整性。
也是未來 eval harness 的 gold 載入器。offset＝Unicode code point、end-exclusive、載入時衍生（非 gold 真相）。
用法：python3 pipeline/gold/validate_gold.py [gold檔...]（任一錯誤→exit 1）。多檔時另查跨檔 gid→entity_type 一致。
"""
import json, re, sys, hashlib, pathlib

_here = pathlib.Path(__file__).resolve().parent
_norm = lambda s: re.sub(r"\s+", " ", s or "").strip()
CTX_ROLES = {"actor", "target", "narrative", "suspected-affiliate", "amplifier"}
ETYPES = {"person", "org", "network", "account", "website", "media", "narrative",
          "tool", "infrastructure", "place", "url", "domain"}
REL = {"related-to", "attributed-to", "operated-by", "runs", "targets", "uses",
       "part-of", "located-at", "linked-to"}

def db_ids():
    src = (_here.parent.parent / "data" / "db.js").read_text(encoding="utf-8")
    i = src.index("{", src.index("window.NETWEAVER_DB")); j = src.rindex("}")
    return {e["id"] for e in json.loads(src[i:j + 1])["entities"]}

def registry():
    p = _here / "registry.gold.json"
    return json.loads(p.read_text(encoding="utf-8")).get("entities", {}) if p.exists() else {}

def find_all(quote, text):
    idxs, i = [], text.find(quote)
    while i != -1: idxs.append(i); i = text.find(quote, i + 1)   # +1：含重疊出現
    return idxs

def locate(quote, text, occ, tag, errs):
    idxs = find_all(quote, text)
    if not idxs:
        if _norm(quote) and _norm(quote) in _norm(text): errs.append(f"{tag} quote 非 exact（需正規化才中）：{quote[:44]!r}")
        else: errs.append(f"{tag} quote 不在 cleaned_text：{quote[:44]!r}")
        return None
    if len(idxs) == 1: return (idxs[0], idxs[0] + len(quote))
    if occ and 1 <= occ <= len(idxs): return (idxs[occ - 1], idxs[occ - 1] + len(quote))
    errs.append(f"{tag} quote 在文中出現 {len(idxs)} 次，須加 quote_occurrence 消歧"); return None

def req(obj, key, tag, errs):
    v = obj.get(key)
    if v in (None, "", [], {}): errs.append(f"{tag} 缺必填欄位 {key}"); return None
    return v

def check(path):
    g = json.loads(pathlib.Path(path).read_text(encoding="utf-8"))
    errs, warns, roles, gid_type = [], [], {}, {}
    if "cleaned_text" not in g: return g, [f"{pathlib.Path(path).name} 缺 cleaned_text"], [], {}, {}
    text = g["cleaned_text"]; reg = registry(); known = db_ids() | set(reg)

    if not g.get("cleaner_version"): errs.append("缺 cleaner_version")
    h = "sha256:" + hashlib.sha256(text.encode("utf-8")).hexdigest()   # 文本雜湊 fail-closed
    stored = g.get("text_sha256")
    if stored in (None, "sha256:PENDING"): errs.append(f"text_sha256 未填（正確值＝{h}）")
    elif stored != h: errs.append(f"text_sha256 不符：檔存 {stored}，實算 {h}")

    ids, file_gids = set(), set()
    mset = {m.get("mid"): m for m in g.get("mentions", [])}
    for m in g.get("mentions", []):
        mid = req(m, "mid", "mention", errs) or "?"
        if mid in ids: errs.append(f"id 重複：{mid}")
        ids.add(mid)
        gid = req(m, "gid", f"mention[{mid}]", errs); file_gids.add(gid)
        et, cr = m.get("entity_type"), m.get("context_role")
        roles[cr] = roles.get(cr, 0) + 1
        if et not in ETYPES: errs.append(f"mention[{mid}] entity_type 非法：{et!r}")
        if cr not in CTX_ROLES: errs.append(f"mention[{mid}] context_role 非法：{cr!r}")
        if gid and et:
            if gid in gid_type and gid_type[gid] != et: errs.append(f"gid {gid} 跨 occurrence entity_type 不一致：{gid_type[gid]} vs {et}")
            gid_type.setdefault(gid, et)
            rt = reg.get(gid, {}).get("type")
            if rt and rt != et: errs.append(f"mention[{mid}] entity_type={et} 與 registry[{gid}].type={rt} 不一致")   # fail-closed
        sf = req(m, "surface", f"mention[{mid}]", errs)
        q = req(m, "quote", f"mention[{mid}]", errs)
        if not q: continue
        loc = locate(q, text, m.get("quote_occurrence"), f"mention[{mid}]", errs)
        if not loc: continue
        m["quote_start"], m["quote_end"] = loc
        if sf and sf not in q: errs.append(f"mention[{mid}] surface 不在自身 quote 內：{sf[:32]!r}")
        elif sf and q.count(sf) > 1: errs.append(f"mention[{mid}] surface 在自身 quote 內出現 {q.count(sf)} 次（歧義，請縮短 quote）：{sf[:24]!r}")
        elif sf: off = q.index(sf); m["surface_start"], m["surface_end"] = loc[0] + off, loc[0] + off + len(sf)

    for a in g.get("assertions", []):
        aid = req(a, "aid", "assertion", errs) or "?"
        if aid in ids: errs.append(f"id 重複：{aid}")
        ids.add(aid)
        subj, obj = req(a, "subject", f"assertion[{aid}]", errs), req(a, "object", f"assertion[{aid}]", errs)
        for role, gid in (("subject", subj), ("object", obj)):
            if gid and gid not in file_gids: errs.append(f"assertion[{aid}] {role} gid {gid!r} 不在本檔 mentions")
        q = req(a, "quote", f"assertion[{aid}]", errs)
        loc = locate(q, text, a.get("quote_occurrence"), f"assertion[{aid}]", errs) if q else None
        if loc: a["quote_start"], a["quote_end"] = loc
        pred = req(a, "predicate", f"assertion[{aid}]", errs)
        if pred and q:
            if pred not in q: errs.append(f"assertion[{aid}] predicate 不在自身 quote 內：{pred!r}")
            elif q.count(pred) > 1: errs.append(f"assertion[{aid}] predicate 在 quote 內出現 {q.count(pred)} 次（歧義，請縮短 quote）：{pred!r}")
            elif loc: off = q.index(pred); a["predicate_start"], a["predicate_end"] = loc[0] + off, loc[0] + off + len(pred)
        for endk, endgid in (("subject_mid", subj), ("object_mid", obj)):
            mid = req(a, endk, f"assertion[{aid}]", errs)          # 必填：否則會繞過 occurrence containment
            if not mid: continue
            if mid not in mset: errs.append(f"assertion[{aid}] {endk}={mid!r} 無對應 mention"); continue
            mm = mset[mid]
            if endgid and mm.get("gid") != endgid: errs.append(f"assertion[{aid}] {endk}={mid} 的 gid {mm.get('gid')!r}≠端點 {endgid!r}")
            if loc and "surface_start" in mm:                       # 真 span containment：occurrence 絕對 span ⊂ assertion quote span
                if not (loc[0] <= mm["surface_start"] and mm["surface_end"] <= loc[1]):
                    errs.append(f"assertion[{aid}] {endk} occurrence span [{mm['surface_start']},{mm['surface_end']}) 不在 quote span [{loc[0]},{loc[1]}) 內")

    for op in g.get("operation_expected", []):
        nm = req(op, "name", "operation", errs) or "?"
        for k in ("actors", "narratives", "targets", "derive_expected"):
            if k not in op: errs.append(f"operation[{nm}] 缺 {k}")
            elif not isinstance(op[k], list): errs.append(f"operation[{nm}] {k} 須為 list（得 {type(op[k]).__name__}）")
        if not op.get("actors"): errs.append(f"operation[{nm}] actors 不可為空")
        for k in ("actors", "narratives", "targets"):
            for gid in (op.get(k) or []) if isinstance(op.get(k), list) else []:
                if gid not in file_gids: errs.append(f"operation[{nm}] {k} 成員 {gid!r} 不在本檔 mentions")
        for de in (op.get("derive_expected") or []) if isinstance(op.get("derive_expected"), list) else []:
            if not isinstance(de, dict): errs.append(f"operation[{nm}] derive_expected 條目須為 object"); continue
            for k in ("source", "relationship_type", "target"):
                if not de.get(k): errs.append(f"operation[{nm}] derive_expected 缺 {k}")
            if de.get("relationship_type") and de["relationship_type"] not in REL:
                errs.append(f"operation[{nm}] relationship_type 非法：{de['relationship_type']!r}")
            if not isinstance(de.get("attributed_to_expected"), bool):
                errs.append(f"operation[{nm}] attributed_to_expected 須為 boolean")
            for gid in (de.get("source"), de.get("target")):
                if gid and gid not in known: errs.append(f"operation[{nm}] derive gid 無法解析：{gid!r}")

    for gid in sorted(x for x in file_gids if x):
        if gid not in known: errs.append(f"gid 無法解析（不在 db.js 或 registry）：{gid!r}")
    return g, errs, warns, roles, gid_type

def main(paths):
    total_e, global_gt = 0, {}
    for p in paths:
        g, errs, warns, roles, gt = check(p)
        for gid, t in gt.items():                                   # 跨檔 gid→entity_type 一致
            if gid in global_gt and global_gt[gid] != t:
                errs.append(f"跨檔 gid {gid} entity_type 不一致：{global_gt[gid]} vs {t}（{pathlib.Path(p).name}）")
            global_gt.setdefault(gid, t)
        st = g.get("strata", {})
        print(f"── {pathlib.Path(p).name}｜{g.get('kind','?')}｜{st.get('lang','?')}/{st.get('source','?')}/{st.get('attribution','?')}"
              f"｜mentions {len(g.get('mentions',[]))}（{roles}）assertions {len(g.get('assertions',[]))}")
        for w in warns: print(f"   ⚠ {w}")
        for e in errs: print(f"   ✗ {e}")
        if not errs and not warns: print("   ✓ 全部檢查通過、offset 已算")
        total_e += len(errs)
    print(f"→ {len(paths)} 檔；錯誤 {total_e}。" + ("gold 合法。" if not total_e else "有錯，須修正。"))
    return 1 if total_e else 0

if __name__ == "__main__":
    args = sys.argv[1:] or [str(p) for p in sorted(_here.glob("*.gold.json")) if p.name != "registry.gold.json"]
    raise SystemExit(main(args))
