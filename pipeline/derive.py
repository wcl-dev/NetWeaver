"""碼的判斷層：extraction（模型只抽 mention＋逐字述詞＋引文）→ STIX-lite（kind/relation/confidence/歸因/role 全由碼決定）。

模型不做分類、評分、歸因、去重——這些都在這裡用固定規則（詞庫 ladder＋信心 rubric＋registry 查表）做，
所以換模型只影響「抽到哪些句子」，不影響下游結構。規則見 docs/STIX-PROFILE.md。
"""
import re, json, pathlib

# 逐字述詞 → 關係（反升級 ladder；由上而下取先命中；預設最弱 related-to）
LADDER = [
    (r"operated by|run by|directed by|controlled by|hired|僱用|運用|操控|指揮|經營", "operated-by"),
    (r"subsidiary|owned by|旗下|隸屬|子公司", "subsidiary-of"),
    (r"supplied|built for|provided .*to|developed for|承包|供應|開發給|提供給", "supplies-tech-to"),
    (r"amplified|echoed|boosted|reposted|cited by|放大|轉發|轉載|引用", "amplifies"),
    (r"target|against|針對|鎖定|攻擊", "targets"),
    (r"\buse[ds]?\b|\bvia\b|使用|透過", "uses"),
    (r"linked to|associated|tied to|connected|連結|相關|關聯|有往來|呼應|呼应|附和|唱和", "related-to"),
]
CONTROL = {"operated-by", "runs"}
KIND = {"operation": "campaign", "network": "intrusion-set", "org": "identity", "person": "identity",
        "account": "x-dad-channel", "website": "x-dad-channel", "media": "x-dad-channel",
        "narrative": "x-dad-narrative", "tool": "tool", "infrastructure": "infrastructure",
        "place": "location", "url": "url", "domain": "domain-name"}
HEDGE = ["likely", "possibly", "probably", "alleged", "assessed", "appears", "suspected", "疑似", "可能", "研判", "評估"]
TIER = {"gov-report": 3, "platform-report": 3, "academic": 3, "ngo-report": 2, "news": 1}

def norm(s): return re.sub(r"[\s\W]+", "", (s or "").lower())
def hedged(q): return any(h in (q or "").lower() for h in HEDGE)

def load_registry(db="/Users/wclim/NetWeaver/data/db.js"):
    src = pathlib.Path(db).read_text(encoding="utf-8")
    i = src.index("{", src.index("window.NETWEAVER_DB")); j = src.rindex("}")
    d = json.loads(src[i:j + 1]); reg = {}
    for e in d["entities"]:
        for nm in [e["name_zh"], e.get("name_en")] + (e.get("aliases") or []):
            if nm: reg.setdefault(norm(nm), e)
    return reg

def rel_of(pred):
    p = (pred or "").lower()
    for pat, r in LADDER:
        if re.search(pat, p): return r
    return "related-to"

def derive(extr, reg):
    rep = extr["report"]; tier = TIER.get(rep.get("type"), 1); log = []
    objs, out = {}, []
    # 1) mention → object（kind 由 coarse_type 詞庫決定；已知實體查 registry 沿用登錄分類/origin/role）
    for m in extr["mentions"]:
        surf = m["surface"]; kind = KIND.get(m["coarse_type"], "identity")
        known = reg.get(norm(surf)) or next((reg.get(norm(x)) for x in re.split(r"[／/、,]", surf) if reg.get(norm(x))), None)
        o = {"tmp_id": m["tmp_id"], "kind": kind}
        if kind == "location": o["country"] = m.get("country", "TW")
        else: o["name"] = re.split(r"[／/]", surf)[0].strip()
        if m.get("quote"): o["evidence"] = [{"quote": m["quote"], "source_url": m["source_url"]}]
        o["_known"] = known
        objs[m["tmp_id"]] = o; out.append(o)
        log.append(f"mention「{surf}」→ kind={kind}" + (f"｜已知實體 {known['id']}（沿用登錄）" if known else "（詞庫規則）"))
    # 2) assertion → relation（逐字述詞 → ladder；碼決定，未升級）
    rels = []
    for a in extr["assertions"]:
        r = rel_of(a["predicate"])
        log.append(f"述詞「{a['predicate']}」→ 關係 {r}（ladder；取最弱一致）")
        rr = {"source": a["subject"], "type": r, "target": a["object"]}
        if a.get("quote"): rr["evidence"] = [{"quote": a["quote"], "source_url": a["source_url"]}]
        rels.append(rr)
    # 3) confidence（規則：來源層級 tier ＋ 佐證 ＋ hedge）
    def conf(evs):
        if not evs: return None
        s = tier + 1 - (1 if any(hedged(e["quote"]) for e in evs) else 0)
        return "high" if s >= 4 else "medium" if s >= 2 else "low"
    for o in out:
        c = conf(o.get("evidence"))
        if c and o["kind"] != "location": o["confidence"] = c
    for r in rels:
        c = conf(r.get("evidence"))
        if c: r["confidence"] = c
    # 4) 歸因（碼規則）：控制述詞 ＋ 信心≥中 → 建 attributed-to（需人工閘）＋控制方升 threat-actor；否則停在 IMS
    extra = []
    for r in rels:
        if r["type"] in CONTROL and r.get("confidence") in ("medium", "high"):
            ctrl, sub = objs.get(r["target"]), objs.get(r["source"])
            if ctrl and ctrl["kind"] == "identity": ctrl["kind"] = "threat-actor"
            log.append(f"控制述詞＋信心{r['confidence']} → 建 attributed-to（{sub['name']}→{ctrl.get('name')}，需人工閘）；{ctrl.get('name')} 升 threat-actor")
            extra.append({"source": r["source"], "type": "attributed-to", "target": r["target"],
                          "confidence": r["confidence"], "evidence": r.get("evidence")})
            r["type"] = "related-to"       # 原控制關係降為結構分組；正式歸因走 attributed-to（保守）
        elif r["type"] == "related-to" and r.get("evidence") and any(hedged(e["quote"]) for e in r["evidence"]):
            log.append("弱述詞／hedge → 不歸因，停在 IMS（related-to）")
    rels += extra
    # 5) role（由關係推導或沿用登錄）
    def role(tid):
        rs = [r["type"] for r in rels if r["source"] == tid]
        return "amplifier" if "amplifies" in rs else "collaborator" if "supplies-tech-to" in rs else "attacker"
    for o in out:
        if o["kind"] in ("intrusion-set", "identity", "threat-actor", "x-dad-channel"):
            o["_role"] = (o.get("_known") or {}).get("role") or role(o["tmp_id"])
    # 輸出 STIX-lite（清內部 _ 欄，帶 nw_ref）
    sl = {"report": rep, "objects": [], "relationships": [{k: v for k, v in r.items() if not k.startswith("_")} for r in rels]}
    for o in out:
        oo = {k: v for k, v in o.items() if not k.startswith("_")}
        if o.get("_known"): oo["nw_ref"] = o["_known"]["id"]
        sl["objects"].append(oo)
    return sl, log
