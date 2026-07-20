#!/usr/bin/env python3
"""抽取品質評測 harness（scorer v2）：模型抽取輸出對照 gold，算 P/R/F1。經 Codex 審查修正。
gold＝docs/GOLD.md 契約；prediction＝模型輸出（無 gid）。

修正重點（v1→v2）：① 全域最大基數 1-1 mention 配對（非貪婪），tie 決定性 ② assertion 逐筆計分不去重、
未映射端點的 grounded assertion 計 FP（不消失）③ grounding fail-closed（surface 須⊂quote、assertion 缺 quote/predicate 不⊂quote 皆丟）
④ typed P/R/F1（非只條件式 acc）⑤ exact-span 與 overlap-span 兩套 ⑥ raw vs 過閘後 ⑦ macro＋micro ⑧ empty-set 規則 ⑨ JSON/schema 合規。
決策主指標＝逐篇 macro 的 strict edge F1（過閘後）。用法：python3 pipeline/eval_extract.py（自測）｜ ... <gold> <pred> ...（評分）

extract.py 與本 scorer 共用 exact grounding 規則：quote/surface/predicate 都必須逐字落在 cleaned text。
"""
import json, re, sys, pathlib, importlib.util

_here = pathlib.Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location("validate_gold", str(_here / "gold" / "validate_gold.py"))
VG = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(VG)

def _find_all(q, text):
    idxs, i = [], text.find(q)
    while i != -1: idxs.append(i); i = text.find(q, i + 1)
    return idxs

def _surface_span(surface, quote, text, occ=None):
    """→ (start,end) 或 None。fail-closed：surface 須為 quote 子字串、quote 須在文中（占位 occ 消歧）。"""
    if not surface or not quote or surface not in quote: return None
    idxs = _find_all(quote, text)
    if not idxs: return None
    if occ is not None and not (isinstance(occ, int) and 1 <= occ <= len(idxs)): return None
    if len(idxs) > 1 and not occ: return None                 # 歧義未消 → 丟
    qs = idxs[(occ or 1) - 1] if (occ and 1 <= occ <= len(idxs)) else idxs[0]
    off = quote.index(surface); return (qs + off, qs + off + len(surface))

# ---- 最大基數二部圖配對（Kuhn；adj 依權重排序→傾向高權重；決定性）----
def _kuhn(adj, n_left):
    matchR = {}
    def aug(u, seen):
        for v in adj[u]:
            if v in seen: continue
            seen.add(v)
            if v not in matchR or aug(matchR[v], seen):
                matchR[v] = u; return True
        return False
    for u in range(n_left): aug(u, set())
    return {u: v for v, u in matchR.items()}                  # left→right

# ---- gold / prediction 載入 ----
def load_gold(path):
    g, errs, *_ = VG.check(path)
    if errs: raise SystemExit(f"gold 不合法（{path}）：{errs[:3]}")
    text = g["cleaned_text"]
    gm = [{"gid": m["gid"], "type": m["entity_type"], "s": m.get("surface_start"), "e": m.get("surface_end")}
          for m in g.get("mentions", [])]
    ga = [(a["subject"], a["object"], a["predicate"]) for a in g.get("assertions", [])]
    return {"text": text, "mentions": gm, "asserts": ga, "gids": {m["gid"] for m in gm}}

def load_pred(path, text):
    comp = {"json_ok": True, "n_m_raw": 0, "n_a_raw": 0, "dup_tmp_id": 0}
    try:
        p = json.loads(pathlib.Path(path).read_text(encoding="utf-8"))
    except Exception:
        comp["json_ok"] = False
        return {"mentions": [], "asserts": [], "id2span": {}, "drops": {}, "comp": comp,
                "n_m_raw": 0, "n_a_raw": 0, "n_m_ground": 0, "n_a_ground": 0}
    comp["n_m_raw"] = len(p.get("mentions", [])); comp["n_a_raw"] = len(p.get("assertions", []))
    pm, id2span, seen, drops = [], {}, set(), {"missing-quote": 0, "bad-quote": 0, "surface-not-in-quote": 0, "ambiguous": 0}
    for m in p.get("mentions", []):
        tid = m.get("tmp_id")
        if tid in seen: comp["dup_tmp_id"] += 1
        seen.add(tid)
        q, sf = m.get("quote", ""), m.get("surface", "")
        if not q: drops["missing-quote"] += 1; continue
        if q not in text: drops["bad-quote"] += 1; continue
        if sf and sf not in q: drops["surface-not-in-quote"] += 1; continue
        sp = _surface_span(sf, q, text, m.get("quote_occurrence"))
        if not sp: drops["ambiguous"] += 1; continue
        pm.append({"tmp_id": tid, "type": m.get("coarse_type"), "s": sp[0], "e": sp[1]})
        id2span[tid] = sp
    pa = []
    for a in p.get("assertions", []):
        q, pr = a.get("quote", ""), a.get("predicate", "")
        if not q or q not in text: drops.setdefault("assert-bad-quote", 0); drops["assert-bad-quote"] += 1; continue
        if not pr or pr not in q: drops.setdefault("assert-predicate-not-in-quote", 0); drops["assert-predicate-not-in-quote"] += 1; continue
        pa.append(a)
    return {"mentions": pm, "asserts": pa, "id2span": id2span, "drops": drops, "comp": comp,
            "n_m_raw": comp["n_m_raw"], "n_a_raw": comp["n_a_raw"], "n_m_ground": len(pm), "n_a_ground": len(pa)}

def _iou(a, b):
    if None in (a["s"], a["e"], b["s"], b["e"]): return 0.0
    inter = max(0, min(a["e"], b["e"]) - max(a["s"], b["s"]))
    if inter == 0: return 0.0
    union = (a["e"] - a["s"]) + (b["e"] - b["s"]) - inter
    return inter / union if union else 0.0

def _prf(tp, npred, ngold):
    p = tp / npred if npred else (1.0 if ngold == 0 else 0.0)
    r = tp / ngold if ngold else None                          # gold=0 → recall N/A
    f = (2 * p * r / (p + r)) if (r is not None and (p + r)) else (1.0 if ngold == 0 and npred == 0 else (0.0 if r is not None else None))
    return p, r, f

def score_doc(gold, pred):
    G, P = gold["mentions"], pred["mentions"]
    # overlap-span 配對（最大基數，adj 依 IoU desc 排序→傾向高權重、index tie 決定性）
    adj = []
    for pi, pm in enumerate(P):
        cand = sorted(((_iou(pm, gm), gi) for gi, gm in enumerate(G) if _iou(pm, gm) > 0), reverse=True)
        adj.append([gi for _, gi in cand])
    match = _kuhn(adj, len(P))                                  # pi→gi
    tp_ov = len(match)
    typed_tp = sum(1 for pi, gi in match.items() if P[pi]["type"] == G[gi]["type"])
    # exact-span 配對（(s,e) 相等，決定性）
    gexact = {}
    for gi, gm in enumerate(G): gexact.setdefault((gm["s"], gm["e"]), []).append(gi)
    used, tp_ex = set(), 0
    for pm in P:
        k = (pm["s"], pm["e"]); avail = [gi for gi in gexact.get(k, []) if gi not in used]
        if avail: used.add(avail[0]); tp_ex += 1
    covered = {G[gi]["gid"] for gi in match.values()}          # entity-R 仍用 overlap 1-1
    # ── 邊評分：assertion-to-assertion 最大匹配（取代原「沿用全域 mention 1-1」——那會讓較短 mention
    #    搶走 gold occurrence、使真命中的邊假陰性，如 doc1「東部戰區融媒體」被「東部戰區」搶走）──
    # tmp_id → gold gids：僅取**最高 IoU**的 gold（可並列），many-to-one（多個 pred 可映同一 gold、不搶佔），
    #   但不採「所有相交」以免端點候選過寬而虛假匹配（Codex review）
    tmp2gids = {}
    for pm in P:
        t = pm["tmp_id"]
        if t is None: continue
        best, gids = 0.0, set()
        for gm in G:
            iou = _iou(pm, gm)
            if iou > best: best, gids = iou, {gm["gid"]}
            elif iou == best and iou > 0: gids.add(gm["gid"])
        if gids: tmp2gids[t] = gids
    # pred 邊：端點 grounding fail-closed（兩端 mention span 須落在 assertion quote 的**同一**出現範圍內，
    #          即 quote 真的同時涵蓋兩端——契約同 gold 的 span-containment）→ 未支持者丟、不進 precision 分母；
    #          grounded 但端點映不到任何 gold gid 者留作 FP（如「研究團隊」主詞邊）
    id2span = pred["id2span"]
    pred_edges, edge_drop = [], 0
    for a in pred["asserts"]:
        ss, oss = id2span.get(a.get("subject")), id2span.get(a.get("object"))
        q = a.get("quote", "")
        grounded = ss and oss and any(
            qs <= ss[0] and ss[1] <= qs + len(q) and qs <= oss[0] and oss[1] <= qs + len(q)
            for qs in _find_all(q, gold["text"]))
        if not grounded: edge_drop += 1; continue                # dangling 端點 or quote 未涵蓋兩端
        pred_edges.append((tmp2gids.get(a.get("subject"), set()),
                           tmp2gids.get(a.get("object"), set()), a.get("predicate", "")))
    gold_edges = list(gold["asserts"])                          # (sg, og, pred) 逐筆、不去重
    n_pred_assert, n_gold_assert = len(pred_edges), len(gold_edges)
    def _edge_match(strict):                                    # pred→gold 最大基數（每條至多配一次）
        adj = [[gi for gi, (sg, og, gp) in enumerate(gold_edges)
                if sg in psg and og in pog and (not strict or gp == pp)]
               for (psg, pog, pp) in pred_edges]
        return len(_kuhn(adj, len(pred_edges)))
    tp_e = _edge_match(True)                                    # ★ 有向端點＋predicate exact
    tp_relaxed = _edge_match(False)                             # 僅端點（無 predicate）
    return {
        "mention_ov": _prf(tp_ov, len(P), len(G)) + (tp_ov, len(P), len(G)),
        "mention_ex": _prf(tp_ex, len(P), len(G)) + (tp_ex,),
        "typed": _prf(typed_tp, len(P), len(G)),
        "entity_R": (len(covered) / len(gold["gids"])) if gold["gids"] else None,
        "edge": _prf(tp_e, n_pred_assert, n_gold_assert) + (tp_e, n_pred_assert, n_gold_assert),
        "edge_relaxed": _prf(tp_relaxed, n_pred_assert, n_gold_assert),
        "pred_exact": (tp_e / tp_relaxed) if tp_relaxed else None,   # 端點命中中、predicate 也 exact 的比例
        "raw_mention_R": (tp_ov / len(G)) if G else None,       # 註：目前 raw≈post（未做 ungated），佔位
        "grounding": {"m_raw": pred["n_m_raw"], "m_kept": pred["n_m_ground"],
                      "a_raw": pred["n_a_raw"], "a_kept": pred["n_a_ground"],
                      "a_edge": len(pred_edges), "a_edge_drop": edge_drop, "drops": pred["drops"]},
        "comp": pred["comp"],
        "_micro": {"m_tp": tp_ov, "m_np": len(P), "m_ng": len(G),
                   "e_tp": tp_e, "e_np": n_pred_assert, "e_ng": n_gold_assert},
    }

def _avg(xs):
    xs = [x for x in xs if x is not None]
    return sum(xs) / len(xs) if xs else None

def run(pairs):
    rows = []
    for gp, pp in pairs:
        gold = load_gold(gp); pred = load_pred(pp, gold["text"]); r = score_doc(gold, pred); rows.append(r)
        mo, ex, ed = r["mention_ov"], r["mention_ex"], r["edge"]
        print(f"── {pathlib.Path(gp).name}")
        print(f"   mention overlap P={mo[0]:.2f} R={fmt(mo[1])} F1={fmt(mo[2])}｜exact F1={fmt(ex[2])}"
              f"｜typed F1={fmt(r['typed'][2])}｜entity-R={fmt(r['entity_R'])}  ({mo[3]}/{mo[5]} gold, {mo[4]} pred)")
        print(f"   edge strict P={ed[0]:.2f} R={fmt(ed[1])} F1={fmt(ed[2])}｜pred-exact={fmt(r['pred_exact'])}"
              f"｜relaxed(endpoint) F1={fmt(r['edge_relaxed'][2])}  ({ed[3]}/{ed[5]} gold, {ed[4]} pred)")
        g = r["grounding"]; c = r["comp"]
        print(f"   grounding m {g['m_kept']}/{g['m_raw']} a {g['a_kept']}/{g['a_raw']}→edge {g['a_edge']}(drop {g['a_edge_drop']})  drops={g['drops']}  json_ok={c['json_ok']} dup_tmp={c['dup_tmp_id']}")
    mac = {"mention_ov_F1": _avg([r["mention_ov"][2] for r in rows]),
           "mention_ex_F1": _avg([r["mention_ex"][2] for r in rows]),
           "typed_F1": _avg([r["typed"][2] for r in rows]),
           "entity_R": _avg([r["entity_R"] for r in rows]),
           "edge_F1": _avg([r["edge"][2] for r in rows]),
           "pred_exact": _avg([r["pred_exact"] for r in rows]),
           "json_ok_rate": _avg([1.0 if r["comp"]["json_ok"] else 0.0 for r in rows])}
    mt = {k: sum(r["_micro"][k] for r in rows) for k in ["m_tp", "m_np", "m_ng", "e_tp", "e_np", "e_ng"]}
    micro_m = _prf(mt["m_tp"], mt["m_np"], mt["m_ng"]); micro_e = _prf(mt["e_tp"], mt["e_np"], mt["e_ng"])
    print(f"\n=== {len(rows)} 篇 ===")
    print(f"  macro：mention F1={fmt(mac['mention_ov_F1'])}（exact {fmt(mac['mention_ex_F1'])}）｜typed F1={fmt(mac['typed_F1'])}｜entity-R={fmt(mac['entity_R'])}")
    print(f"  micro：mention F1={fmt(micro_m[2])}｜edge F1={fmt(micro_e[2])}")
    print(f"  ★ 決策主指標 strict edge F1（macro）={fmt(mac['edge_F1'])}｜predicate-exact={fmt(mac['pred_exact'])}｜JSON合規={fmt(mac['json_ok_rate'])}")
    return {"macro": mac, "micro_edge_F1": micro_e[2]}

def fmt(x): return "N/A" if x is None else f"{x:.2f}"

# ---- 自測（含對抗式）----
def gold_to_pred(gold_path, drop=0.0):
    g, *_ = VG.check(gold_path)
    ms = [{"tmp_id": m["mid"], "surface": m["surface"], "coarse_type": m["entity_type"], "quote": m["quote"],
           **({"quote_occurrence": m["quote_occurrence"]} if m.get("quote_occurrence") else {})} for m in g["mentions"]]
    asr = [{"subject": a["subject_mid"], "predicate": a["predicate"], "object": a["object_mid"], "quote": a["quote"],
            **({"quote_occurrence": a["quote_occurrence"]} if a.get("quote_occurrence") else {})} for a in g["assertions"]]
    if drop:
        ms = ms[:int(len(ms) * (1 - drop))]; kept = {m["tmp_id"] for m in ms}
        asr = [a for a in asr if a["subject"] in kept and a["object"] in kept]
    return {"mentions": ms, "assertions": asr}

def selftest():
    import tempfile
    devs = sorted((_here / "gold" / "dev").glob("*.gold.json"))
    tmp = pathlib.Path(tempfile.mkdtemp()); fails = []
    def W(o):
        p = tmp / f"t{len(list(tmp.iterdir()))}.json"; p.write_text(json.dumps(o, ensure_ascii=False)); return str(p)
    print("═══ 自測 1：完美預測（期望全 1.0）═══")
    m1 = run([(str(d), W(gold_to_pred(str(d)))) for d in devs])
    if (m1["macro"]["edge_F1"] or 0) < 0.999 or (m1["macro"]["mention_ov_F1"] or 0) < 0.999: fails.append("完美預測未達 1.0")
    print("\n═══ 自測 2：退化（丟 50% mentions，期望 mention R≈0.5、edge 連帶降）═══")
    m2 = run([(str(d), W(gold_to_pred(str(d), drop=0.5))) for d in devs])
    if not (0.4 < (m2["macro"]["entity_R"] or 0) < 0.65): fails.append("退化 entity-R 不在 0.4-0.65")

    print("\n═══ 自測 3：對抗式（Codex 指出的 bug 類）═══")
    text = "The GoLaxy team operated fake accounts to attack the DPP and boost Beijing narratives widely."
    # 造 gold：2 mentions（GoLaxy, DPP）＋ 2 assertions 同一 pair 不同述詞（測多重邊不去重）
    G = {"kind": "excerpt-fixture", "cleaner_version": "t", "text_sha256": "sha256:PENDING",
         "report": {"name": "t", "url": "u", "org": "o", "published": "2026", "type": "news"},
         "strata": {}, "cleaned_text": text,
         "mentions": [{"mid": "m1", "gid": "golaxy", "entity_type": "org", "context_role": "actor", "surface": "GoLaxy team", "quote": "The GoLaxy team operated fake accounts"},
                      {"mid": "m2", "gid": "g:dpp", "entity_type": "org", "context_role": "target", "surface": "DPP", "quote": "to attack the DPP"}],
         "assertions": [{"aid": "a1", "subject": "golaxy", "predicate": "operated", "object": "g:dpp", "subject_mid": "m1", "object_mid": "m2", "quote": "The GoLaxy team operated fake accounts to attack the DPP"},
                        {"aid": "a2", "subject": "golaxy", "predicate": "to attack", "object": "g:dpp", "subject_mid": "m1", "object_mid": "m2", "quote": "The GoLaxy team operated fake accounts to attack the DPP"}]}
    gp = tmp / "adv.gold.json"
    G["text_sha256"] = "sha256:" + __import__("hashlib").sha256(text.encode()).hexdigest()
    gp.write_text(json.dumps(G, ensure_ascii=False))
    # pred A：完美（2 assertions 同 pair）→ edge R 應=1.0（2/2，不因去重變 1/1）
    predA = {"mentions": [{"tmp_id": "p1", "surface": "GoLaxy team", "coarse_type": "org", "quote": "The GoLaxy team operated fake accounts"},
                          {"tmp_id": "p2", "surface": "DPP", "coarse_type": "org", "quote": "to attack the DPP"}],
             "assertions": [{"subject": "p1", "predicate": "operated", "object": "p2", "quote": "The GoLaxy team operated fake accounts to attack the DPP"},
                            {"subject": "p1", "predicate": "to attack", "object": "p2", "quote": "The GoLaxy team operated fake accounts to attack the DPP"}]}
    rA = score_doc(load_gold(str(gp)), load_pred(W(predA), text))
    if rA["edge"][3] != 2: fails.append(f"多重邊被去重（edge TP={rA['edge'][3]}，應=2）")
    # pred B：幻覺引文 mention（surface 不在文中）＋ assertion 缺 quote → 應全丟、不灌高
    predB = {"mentions": [{"tmp_id": "p1", "surface": "Ministry of Truth", "coarse_type": "org", "quote": "a fabricated sentence not in the text"},
                          {"tmp_id": "p2", "surface": "accounts", "coarse_type": "network", "quote": "attack"}],
             "assertions": [{"subject": "p1", "predicate": "runs", "object": "p2"}]}
    pB = load_pred(W(predB), text)
    if pB["n_m_ground"] != 0 or pB["drops"].get("bad-quote", 0) < 1 or pB["drops"].get("surface-not-in-quote", 0) < 1:
        fails.append(f"幻覺／未錨定 mention 未擋（kept={pB['n_m_ground']}）")
    if len(pB["asserts"]) != 0: fails.append("assertion 缺 quote 未擋")
    # pred C：dangling 端點（object p9 無對應 mention）→ grounding fail-closed 丟棄（不進分母，非 FP）
    predC = {"mentions": [{"tmp_id": "p1", "surface": "GoLaxy team", "coarse_type": "org", "quote": "The GoLaxy team operated fake accounts"}],
             "assertions": [{"subject": "p1", "predicate": "boost", "object": "p9", "quote": "boost Beijing narratives widely"}]}
    rC = score_doc(load_gold(str(gp)), load_pred(W(predC), text))
    if rC["edge"][4] != 0 or rC["grounding"]["a_edge_drop"] < 1:
        fails.append(f"dangling 端點未 fail-closed 丟（pred邊={rC['edge'][4]}、drop={rC['grounding']['a_edge_drop']}）")
    # pred D：端點皆存在且 grounded，但 object 映不到任何 gold gid → 應留成 FP（分母=1、TP=0、P=0）
    predD = {"mentions": [{"tmp_id": "p1", "surface": "GoLaxy team", "coarse_type": "org", "quote": "The GoLaxy team operated fake accounts"},
                          {"tmp_id": "p2", "surface": "fake accounts", "coarse_type": "network", "quote": "The GoLaxy team operated fake accounts"}],
             "assertions": [{"subject": "p1", "predicate": "operated", "object": "p2", "quote": "The GoLaxy team operated fake accounts"}]}
    rD = score_doc(load_gold(str(gp)), load_pred(W(predD), text))
    if not (rD["edge"][4] == 1 and rD["edge"][3] == 0 and rD["edge"][0] == 0.0):
        fails.append(f"grounded 但未映射端點未計 FP（pred邊={rD['edge'][4]}、TP={rD['edge'][3]}、P={rD['edge'][0]}）")
    print(f"   多重邊 TP={rA['edge'][3]}（應2）｜幻覺/未錨定擋後 kept={pB['n_m_ground']}（應0）、assert kept={len(pB['asserts'])}（應0）"
          f"｜dangling 丟={rC['edge'][4]==0}｜未映射 FP: 分母={rD['edge'][4]} TP={rD['edge'][3]} P={rD['edge'][0]}")

    print(f"\n{'✓ 全部自測通過' if not fails else '✗ 自測失敗：' + str(fails)}")
    return 0 if not fails else 1

if __name__ == "__main__":
    a = sys.argv[1:]
    if not a: raise SystemExit(selftest())
    if len(a) % 2: raise SystemExit("需成對 <gold> <pred> ...")
    run(list(zip(a[0::2], a[1::2]))); raise SystemExit(0)
