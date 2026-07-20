#!/usr/bin/env python3
"""relevance 過濾閘（碼，非模型）：抽取前，對 ingest 落地的 pending 項目判「中國認知作戰／FIMI 相關」。
LLM 不決定 relevance——由版本化、可審查、可回歸測試的「詞表＋實體表」決定（policy table）。改規則須讓 test_filter.py 全過。
主政策比對 feed 標題＋摘要（strict）；若有 readability 正文側車（.txt，已去 chrome），僅在標題摘要漏判時、
以**保守的 fimi∧china 共現**補救（不採正文單次 actor 命中，避免長文誤判）。用法：python3 pipeline/filter.py
"""
import json, re, pathlib, unicodedata

_here = pathlib.Path(__file__).resolve().parent
RAW = _here / "raw"
DB = _here.parent / "data" / "db.js"

# ── policy table（人工策展；改動＝加測試案例）─────────────────────────────
FIMI = ["disinformation", "influence operation", "coordinated inauthentic", "inauthentic account",
        "information manipulation", "propaganda", "fake account", "content farm", "troll farm",
        "trolls", "deepfake", "spamouflage", "fimi", "認知作戰", "資訊操作", "資訊戰", "假訊息",
        "不實訊息", "內容農場", "網軍", "水軍", "假帳號", "深偽", "造謠", "帶風向", "協同造假"]
CHINA = ["china", "chinese", "prc", "ccp", "beijing", "中共", "中國", "北京", "解放軍",
         "統戰", "网信", "公安部", "國安部"]
TARGET = ["taiwan", "taiwanese", "japan", "indo-pacific", "台灣", "日本", "印太"]   # 僅記錄，不參與判定

# 歧義／高頻良性 token：強制 weak（需佐證才算），避免短商標撞名、州級媒體常名獨立命中。人可維護。
AMBIGUOUS = ["虎牙", "看台海", "無界", "无界", "海訊", "海讯", "央視", "央视", "環球時報",
             "环球时报", "環球網", "环球网", "看看新聞", "看看新闻", "央廣", "央广",
             "央視網", "央视网", "Global Times"]
DISABLED = []                                            # 太泛用、不進比對；保留維護 hook

# 高頻異體字正規化（繁→簡 canonical）。非完整簡繁轉換——完整覆蓋靠 db.js 別名維護，不引 OpenCC。
_VAR = {"臺": "台", "灣": "湾", "網": "网", "國": "国", "戰": "战", "無": "无", "軍": "军",
        "認": "认", "謠": "谣", "統": "统", "訊": "讯", "導": "导", "報": "报", "環": "环",
        "時": "时", "淵": "渊", "譚": "谭", "邊": "边", "團": "团", "峽": "峡", "聲": "声",
        "廣": "广", "電": "电", "視": "视", "說": "说", "諜": "谍", "帳": "帐", "號": "号",
        "實": "实", "圖": "图", "訪": "访"}
VARIANT = str.maketrans(_VAR)

def canon(s):
    return unicodedata.normalize("NFKC", s or "").casefold().translate(VARIANT).strip()

AMB_N = {canon(x) for x in AMBIGUOUS}
DIS_N = {canon(x) for x in DISABLED}
CJK = lambda s: sum(1 for ch in s if "一" <= ch <= "鿿")

def classify(raw):
    """自動分級：strong=獨立命中即算；weak=需佐證；None=不收。長度只當預設，AMBIGUOUS/DISABLED 永遠優先。"""
    c = canon(raw)
    if not c or c in DIS_N: return None, c
    if c in AMB_N: return "weak", c
    if re.search(r"[a-z]", c):                           # 含拉丁字母
        if raw.isalpha() and raw.isupper() and len(raw) <= 5:
            return "weak", c                             # 短縮寫（TAO/MSS/CAC…）易撞常用詞
        return "strong", c
    n = CJK(c)                                           # 純中文：字數門檻（非位元組）
    if n >= 4: return "strong", c
    if n >= 2: return "weak", c
    return None, c

def load(db=DB):
    src = db.read_text(encoding="utf-8"); i = src.index("{", src.index("window.NETWEAVER_DB")); j = src.rindex("}")
    d = json.loads(src[i:j + 1]); ents = []
    for e in d["entities"]:
        if e.get("origin") != "PRC": continue
        mt = e.get("match_tokens")                       # 資料層覆寫：有 match_tokens 就照它，否則自動分級
        strong, weak = set(), set()
        if isinstance(mt, dict):
            strong = {canon(x) for x in mt.get("strong", []) if canon(x)}
            weak = {canon(x) for x in mt.get("weak", []) if canon(x)}
        else:
            for raw in [e.get("name_en"), e.get("name_zh"), *(e.get("aliases") or [])]:
                if not raw: continue
                tier, c = classify(raw)
                if tier == "strong": strong.add(c)
                elif tier == "weak": weak.add(c)
        ents.append({"id": e["id"], "strong": strong, "weak": weak, "all": strong | weak})
    return {"ents": ents, "fimi": {canon(x) for x in FIMI},
            "china": {canon(x) for x in CHINA}, "target": {canon(x) for x in TARGET}}

def decide(text, M):
    """→ (relevant, reason, detail)。規則：強名 OR (弱名 AND 佐證) OR (FIMI AND 中國)。"""
    T = canon(text)
    strong_hit, weak_hit, matched = set(), set(), []
    for e in M["ents"]:
        s = {t for t in e["strong"] if t and t in T}
        w = {t for t in e["weak"] if t and t in T}
        if s or w: matched.append(e)
        strong_hit |= s; weak_hit |= w
    fimi = {t for t in M["fimi"] if t and t in T}
    china = {t for t in M["china"] if t and t in T}
    if strong_hit:
        return True, "strong-actor", {"actors": sorted(strong_hit)[:4]}
    if weak_hit:
        excl = set().union(*[e["all"] for e in matched]) if matched else set()
        ctx = (fimi | china) - excl                      # 防自我佐證：佐證詞不得是命中行為者自身/同實體別名
        if ctx:
            return True, "weak-actor+context", {"actors": sorted(weak_hit)[:4], "context": sorted(ctx)[:4]}
    if fimi and china:
        return True, "fimi+china", {"fimi": sorted(fimi)[:4], "china": sorted(china)[:4]}
    return False, "no-match", {"fimi": sorted(fimi)[:3], "china": sorted(china)[:3], "weak": sorted(weak_hit)[:3]}

def relevance(ts, body, M):
    """主政策＝title+summary（strict，含 strong/weak actor）；不相關時，正文**只認 fimi∧china 共現**補救
    （不採正文單次 actor 命中，避免長文任意位置共現的誤判）。回 (relevant, reason, detail, on)。"""
    rel, reason, det = decide(ts, M)
    if rel:
        return rel, reason, det, "title+summary"
    if body:                                                 # 正文只認 fimi∧china 共現——直接判詞類，不吃 decide() 的 actor 優先序
        Tb = canon(body)
        fimi_b = sorted(t for t in M["fimi"] if t and t in Tb)
        china_b = sorted(t for t in M["china"] if t and t in Tb)
        if fimi_b and china_b:                               # strong/weak actor 單次命中仍不放行；需 FIMI∧China 同在正文
            return True, "fimi+china(body)", {"fimi": fimi_b[:4], "china": china_b[:4]}, "title+summary+body(fimi∧china)"
    return rel, reason, det, "title+summary"

def main():
    M = load()
    manifests = sorted(RAW.glob("*/*.json"))
    ready = filt = 0
    print(f"relevance 過濾（碼；掃 {len(manifests)} 個項目）")
    for mp in manifests:
        m = json.loads(mp.read_text(encoding="utf-8"))
        if m.get("extraction_status") not in ("pending", None): continue
        ts = ((m.get("title") or "") + " " + (m.get("summary") or "")).strip()
        txt = mp.with_suffix("").with_suffix(".txt")          # ingest 落地的 readability 正文（已去 chrome）
        body = txt.read_text(encoding="utf-8", errors="ignore") if txt.exists() else ""
        rel, reason, det, on = relevance(ts, body, M)
        det["on"] = on
        m["relevance"] = {"relevant": rel, "reason": reason, **det}
        m["extraction_status"] = "ready" if rel else "filtered-out"
        mp.write_text(json.dumps(m, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"  {'✓ 相關' if rel else '·  略過'}  [{m['source_id']}] {(m.get('title') or '')[:44]}  （{reason}）")
        ready += rel; filt += (not rel)
    print(f"→ ready（送 ③）{ready}｜filtered-out {filt}。模型不參與；規則＝版本化 policy table（詞表＋db 實體表），改動須附 golden 測試。")

if __name__ == "__main__":
    main()
