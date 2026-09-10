"""碼的判斷層：extraction（模型只抽 mention＋逐字述詞＋引文）→ STIX-lite（kind/relation/confidence/歸因/role 全由碼決定）。

模型不做分類、評分、歸因、去重——這些都在這裡用固定規則（詞庫 ladder＋信心 rubric＋registry 查表）做，
所以換模型只影響「抽到哪些句子」，不影響下游結構。規則見 docs/STIX-PROFILE.md。
"""
import re, json, pathlib

# 逐字述詞 → 關係（反升級 ladder；由上而下取先命中；預設最弱 related-to）
LADDER = [
    # 控制述詞分主動／被動，**方向相反**，不可混在同一桶。
    # 「A is operated by B」＝被動，A 是被操作的一方 → operated-by(A, B)
    # 「A 運用 B」＝主動，A 是操作方        → runs(A, B)
    # 混在一起會讓中文主動句的歸因整個反過來：實測 NSB「中共公安部運用『龍橋』」
    # 產生 attributed-to(中共公安部 → 龍橋)，讀成「公安部歸屬於網軍集團」。
    # 被動樣式必須排在主動之前，否則 "hired by" 會先被 "hired" 吃掉。
    (r"operated by|run by|directed by|controlled by|hired by|employed by|"
     r"受[^，。]{0,6}(僱用|雇用|操作|指揮|操控|經營)|受僱於|由[^，。]{0,8}(經營|operated)|"
     # 官媒子品牌：「X 是 Y 打造／設立的自媒體品牌」＝被動（X 受 Y 經營）→ operated-by(X,Y)
     # 必須「創設動詞＋的＋自媒體/融媒體品牌」同時出現，窄到只抓這個構式：
     # 排除「打造的國際品牌」（非自媒體）、「不是自媒體品牌」（否定）、「為自媒體品牌提供技術」（非控制）等誤判
     r"(打造|設立|創設)的(自媒體|融媒體)品牌", "operated-by"),
    (r"\bhires?\b|\bhired\b|\boperates?\b|\bruns?\b|\bdirects?\b|\bcontrols?\b|"
     r"僱用|雇用|運用|操控|指揮|經營", "runs"),
    (r"subsidiary|owned by|旗下|隸屬|子公司", "subsidiary-of"),
    (r"supplied|built for|provided .*to|developed for|承包|供應|開發給|提供給", "supplies-tech-to"),
    (r"amplified|echoed|boosted|reposted|cited by|放大|轉發|轉載|引用", "amplifies"),
    (r"target|against|針對|鎖定|攻擊", "targets"),
    (r"\buse[ds]?\b|\bvia\b|使用|透過", "uses"),
    (r"linked to|associated|tied to|connected|連結|相關|關聯|有往來|呼應|呼应|附和|唱和", "related-to"),
]
CONTROL = {"operated-by", "runs"}
KIND = {"network": "intrusion-set", "org": "identity", "person": "identity",
        "account": "x-dad-channel", "website": "x-dad-channel", "media": "x-dad-channel",
        "narrative": "x-dad-narrative", "tool": "tool", "infrastructure": "infrastructure",
        "place": "location", "url": "url", "domain": "domain-name"}
# 已登錄實體的 category → STIX kind。**人的分類勝過模型的 coarse_type**：
# 同一個行為者若因模型每次猜的粗類不同而拿到不同 STIX 型別，UUIDv5 也會不同，
# 逐篇 bundle 與整本匯出就會出現同一實體的分身。對照依 STIX-PROFILE §2。
CATEGORY_KIND = {"cib-network": "intrusion-set", "content-farm": "intrusion-set",
                 "state-media": "x-dad-channel", "domestic-amplifier": "x-dad-channel",
                 "commentator": "identity", "state-organ": "identity",
                 "tech-vendor": "identity", "pr-firm": "identity", "other": "identity"}

HEDGE = ["likely", "possibly", "probably", "alleged", "assessed", "appears", "suspected", "疑似", "可能", "研判", "評估"]
TIER = {"gov-report": 3, "platform-report": 3, "academic": 3, "ngo-report": 2, "news": 1}

def norm(s): return re.sub(r"[\s\W]+", "", (s or "").lower())
def hedged(q): return any(h in (q or "").lower() for h in HEDGE)

def load_registry(db=None):
    # 預設相對路徑（repo 根 /data/db.js）——寫死絕對路徑會讓 CI／fork／別台機器全掛
    if db is None:
        db = pathlib.Path(__file__).resolve().parent.parent / "data" / "db.js"
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
        if known and known.get("category") in CATEGORY_KIND:   # 已登錄 → 用人的分類，不用模型猜的
            kind = CATEGORY_KIND[known["category"]]
        o = {"tmp_id": m["tmp_id"], "kind": kind}
        if kind == "location": o["country"] = m.get("country", "TW")
        else: o["name"] = re.split(r"[／/]", surf)[0].strip()
        if kind == "identity":                               # 模型已分辨人／組織，別把這個資訊丟掉：
            o["identity_class"] = ("individual"              # 人名是中性 observable（被提及的對象），
                                   if m["coarse_type"] == "person" else "organization")  # 不是行為者
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
            # 方向依述詞語態決定：operated-by(A,B) 是「A 受 B 操作」→ 控制方是 target；
            # runs(A,B) 是「A 操作 B」→ 控制方是 source，歸因要翻過來。
            if r["type"] == "runs": ctrl_ref, sub_ref = r["source"], r["target"]
            else:                   ctrl_ref, sub_ref = r["target"], r["source"]
            ctrl, sub = objs.get(ctrl_ref), objs.get(sub_ref)
            # 兩端都必須是「叫得出名字的行為者」才談得上歸因。地點（只有 country）或
            # 指向不存在 tmp_id 的一端，都不足以支撐 attributed-to——實測有模型把
            # 「美國運用台灣」的主詞標成 place，若照建就是地點歸因給地點。
            # 但也不保留較強的控制述詞：資訊更少時不該讓更強的主張通過，一律降為 related-to。
            if not (ctrl and sub and ctrl.get("name") and sub.get("name")):
                log.append(f"控制述詞「{r['type']}」端點不完整"
                           f"（source={r['source']}:{(sub or {}).get('name') or (sub or {}).get('kind') or '不存在'}／"
                           f"target={r['target']}:{(ctrl or {}).get('name') or (ctrl or {}).get('kind') or '不存在'}）"
                           f" → 不建 attributed-to，降為 related-to")
                r["type"] = "related-to"
                continue
            promoted = ctrl["kind"] == "identity"
            if promoted: ctrl["kind"] = "threat-actor"
            log.append(f"控制述詞＋信心{r['confidence']} → 建 attributed-to（{sub['name']}→{ctrl.get('name')}，需人工閘）"
                       + (f"；{ctrl.get('name')} 升 threat-actor" if promoted else "（控制方為頻道型，分類不變）"))
            extra.append({"source": sub_ref, "type": "attributed-to", "target": ctrl_ref,
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
    # 6) 可發布性（allowlist；documented not accused）：主詞須已登錄實體，且受詞須已登錄或為
    #    敘事/地點/URL 類「非當事方」；否則 held——主詞未登錄，或受詞是「未登錄的當事方」（會指控未策展對象）。
    #    held 的關係不進記錄簿，留作 curate/register 迴圈的待登錄佇列（liberal 抽取→人工閘登錄→關係成圖）。
    NONPARTY = {"x-dad-narrative", "location", "url", "domain-name"}
    for r in rels:
        so, to = objs.get(r["source"]), objs.get(r["target"])
        src_doc = bool(so and so.get("_known"))
        tgt_doc = bool(to and to.get("_known"))
        if src_doc and (tgt_doc or (to and to.get("kind") in NONPARTY)):
            r["publishable"] = True
        else:
            r["publishable"] = False
            r["hold_reason"] = "subject-not-documented" if not src_doc else "object-undocumented-party"
            log.append(f"held（不發布，待登錄）：{r['type']} — {r['hold_reason']}")
    # 輸出 STIX-lite（清內部 _ 欄，帶 nw_ref）
    sl = {"report": rep, "objects": [], "relationships": [{k: v for k, v in r.items() if not k.startswith("_")} for r in rels]}
    for o in out:
        oo = {k: v for k, v in o.items() if not k.startswith("_")}
        if o.get("_known"):
            oo["nw_ref"] = o["_known"]["id"]
            # 敏感標記沿用登錄值：紅線要跟著中介格式走，不能只存在於發布層
            if o["_known"].get("sensitivity"): oo["sensitivity"] = o["_known"]["sensitivity"]
        sl["objects"].append(oo)
    return sl, log
