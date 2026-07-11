#!/usr/bin/env python3
"""gold 驗證器＋offset 衍生（GOLD.md v0.2）。標註者只填逐字 quote/surface；這裡定位 offset 並查完整性。
也是未來 eval harness 的 gold 載入器。offset＝Unicode code point、end-exclusive、載入時衍生（非 gold 真相）。
用法：python3 pipeline/gold/validate_gold.py [gold檔...]（任一錯誤→exit 1）
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
    """→ (start,end) 或 None（並已 append 錯誤）。exact 且唯一/指定 occurrence 才過。"""
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
    errs, warns, roles = [], [], {}
    if "cleaned_text" not in g: return g, [f"{pathlib.Path(path).name} 缺 cleaned_text"], [], {}
    text = g["cleaned_text"]; reg = registry(); known = db_ids() | set(reg)

    # 文本雜湊 fail-closed
    h = "sha256:" + hashlib.sha256(text.encode("utf-8")).hexdigest()
    stored = g.get("text_sha256")
    if stored in (None, "sha256:PENDING"): errs.append(f"text_sha256 未填（正確值＝{h}）")
    elif stored != h: errs.append(f"text_sha256 不符：檔存 {stored}，實算 {h}")

    ids, gid_type, file_gids = set(), {}, set()          # 全域 id 唯一（mid∪aid）、gid→entity_type 一致、本檔 gid 集
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
            if rt and rt != et: warns.append(f"mention[{mid}] entity_type={et} 與 registry[{gid}].type={rt} 不一致")
        q = req(m, "quote", f"mention[{mid}]", errs)
        if not q: continue
        loc = locate(q, text, m.get("quote_occurrence"), f"mention[{mid}]", errs)
        if not loc: continue
        m["quote_start"], m["quote_end"] = loc
        sf = m.get("surface")
        if sf and sf not in q: errs.append(f"mention[{mid}] surface 不在自身 quote 內：{sf[:32]!r}")
        elif sf: off = q.index(sf); m["surface_start"], m["surface_end"] = loc[0] + off, loc[0] + off + len(sf)

    for a in g.get("assertions", []):
        aid = req(a, "aid", "assertion", errs) or "?"
        if aid in ids: errs.append(f"id 重複：{aid}")
        ids.add(aid)
        subj, obj = req(a, "subject", f"assertion[{aid}]", errs), req(a, "object", f"assertion[{aid}]", errs)
        for role, gid in (("subject", subj), ("object", obj)):        # 端點須是本檔實體
            if gid and gid not in file_gids: errs.append(f"assertion[{aid}] {role} gid {gid!r} 不在本檔 mentions")
        q = req(a, "quote", f"assertion[{aid}]", errs)
        loc = locate(q, text, a.get("quote_occurrence"), f"assertion[{aid}]", errs) if q else None
        if loc: a["quote_start"], a["quote_end"] = loc
        pred = a.get("predicate")
        if pred and q:
            if pred not in q: errs.append(f"assertion[{aid}] predicate 不在自身 quote 內：{pred!r}")
            elif q.count(pred) > 1: warns.append(f"assertion[{aid}] predicate 在 quote 內出現多次，offset 取第一個")
            elif loc: off = q.index(pred); a["predicate_start"], a["predicate_end"] = loc[0] + off, loc[0] + off + len(pred)
        for endk, endgid in (("subject_mid", subj), ("object_mid", obj)):   # mid↔gid 一致＋surface⊂quote
            mid = a.get(endk)
            if not mid: continue
            if mid not in mset: errs.append(f"assertion[{aid}] {endk}={mid!r} 無對應 mention"); continue
            if endgid and mset[mid].get("gid") != endgid: errs.append(f"assertion[{aid}] {endk}={mid} 的 gid {mset[mid].get('gid')!r}≠端點 {endgid!r}")
            sf = mset[mid].get("surface")
            if sf and q and sf not in q: errs.append(f"assertion[{aid}] {endk} occurrence surface {sf[:24]!r} 不在 assertion quote 內")

    for op in g.get("operation_expected", []):                    # operation_expected schema
        nm = req(op, "name", "operation", errs) or "?"
        for k in ("actors", "narratives", "targets"):
            for gid in op.get(k, []):
                if gid not in file_gids: errs.append(f"operation[{nm}] {k} 成員 {gid!r} 不在本檔 mentions")
        for de in op.get("derive_expected", []):
            for k in ("source", "relationship_type", "target"):
                if not de.get(k): errs.append(f"operation[{nm}] derive_expected 缺 {k}")
            if de.get("relationship_type") and de["relationship_type"] not in REL:
                errs.append(f"operation[{nm}] relationship_type 非法：{de['relationship_type']!r}")
            if not isinstance(de.get("attributed_to_expected"), bool):
                errs.append(f"operation[{nm}] attributed_to_expected 須為 boolean")
            for gid in (de.get("source"), de.get("target")):
                if gid and gid not in known: errs.append(f"operation[{nm}] derive gid 無法解析：{gid!r}")

    for gid in sorted(x for x in file_gids if x):                 # 每個 gid 可解析
        if gid not in known: errs.append(f"gid 無法解析（不在 db.js 或 registry）：{gid!r}")
    return g, errs, warns, roles

def main(paths):
    total_e = 0
    for p in paths:
        g, errs, warns, roles = check(p)
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
