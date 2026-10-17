#!/usr/bin/env python3
"""紅線出口回歸：核可的歸因必須落地，未核可的必須帶著狀態走。

先前的缺口：`curate.py compile --yes` 這道閘擋得住不該發布的，但通過之後沒有
寫入路徑——歸因進不了 db.js 也進不了全書匯出，人工核可等於空轉。更糟的是
逐篇 bundle 在抽取完成（人工核可**之前**）就落盤、標榜「可直接交換」，裡面的
attributed-to 沒有任何狀態標記，接手的人看不出這則歸因還沒過紅線。

本測試鎖住四件事（④ 為逐篇 bundle 只對真正核可過的歸因邊蓋章，見下）：
  ① serialize 預設給 attributed-to 蓋 pending-human-approval；傳入核可日期
     則蓋 approved＋日期。其他關係不蓋章。
  ② _resolve_actor：精確比對優先；片語型 surface 取括號內片段，全部命中須
     指向同一實體，否則回 None（寧可 held 讓人補別名，不猜）。
  ③ apply_attributions：兩端都解析到已登錄實體才寫入 related（附來源機構＋
     核可日期）、重跑不重複寫；解析不到的進 held 清單回報，不落地。
  ④ 逐篇 bundle 的核可章：serialize 可收逐邊 dict；curate.attribution_stamps 只對
     db.js 內確實存在的歸因給章、日期取自 note（早已核可的沿用原日期、新寫入的是今天）；
     held 的邊維持 pending。舊缺陷是把這篇每一條歸因都蓋成「今天核可」。
用法：python3 pipeline/test_attribution_publish.py（exit 0＝過）
"""
import importlib.util, pathlib

_here = pathlib.Path(__file__).resolve().parent
def _load(name):
    spec = importlib.util.spec_from_file_location(name, str(_here / (name + ".py")))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

pipe = _load("pipeline")
cur = _load("curate")
fails = []

# ── ① serialize 的狀態章 ─────────────────────────────────────────────
SL = {"report": {"name": "t", "url": "https://example.org/r", "org": "o",
                 "published": "2026", "type": "gov-report"},
      "objects": [
          {"tmp_id": "m1", "kind": "intrusion-set", "name": "龍橋",
           "evidence": [{"quote": "甲運用龍橋。", "source_url": "https://example.org/r"}]},
          {"tmp_id": "m2", "kind": "threat-actor", "name": "甲機關",
           "evidence": [{"quote": "甲運用龍橋。", "source_url": "https://example.org/r"}]}],
      "relationships": [
          {"source": "m1", "type": "attributed-to", "target": "m2", "confidence": "medium",
           "evidence": [{"quote": "甲運用龍橋。", "source_url": "https://example.org/r"}]},
          {"source": "m1", "type": "targets", "target": "m2",
           "evidence": [{"quote": "甲運用龍橋。", "source_url": "https://example.org/r"}]}]}

def _rels(bundle):
    return {o["relationship_type"]: o for o in bundle["objects"] if o["type"] == "relationship"}

r = _rels(pipe.serialize(SL))
if r["attributed-to"].get("x_netweaver_review") != "pending-human-approval":
    fails.append("① 預設必須蓋 pending-human-approval，得 %r" % r["attributed-to"].get("x_netweaver_review"))
if "x_netweaver_review" in r["targets"]:
    fails.append("① 非歸因關係不得蓋章")

r = _rels(pipe.serialize(SL, attribution_approved="2026-08-30"))
if r["attributed-to"].get("x_netweaver_review") != "approved":
    fails.append("① 核可後應蓋 approved")
if r["attributed-to"].get("x_netweaver_review_date") != "2026-08-30":
    fails.append("① 核可日期必須跟著物件走")

# ── ② 端點解析 ───────────────────────────────────────────────────────
ENTS = {"borderless-group": {"id": "borderless-group"}, "mps": {"id": "mps"},
        "spamouflage": {"id": "spamouflage"}, "other": {"id": "other"}}
n2e = {}
for nm, eid in (("無邊界公司", "borderless-group"), ("WUBIANJIE", "borderless-group"),
                ("龍橋", "spamouflage"), ("中共公安部", "mps"), ("乙方", "other")):
    n2e[cur._norm(nm)] = ENTS[eid]

if (cur._resolve_actor("龍橋", n2e) or {}).get("id") != "spamouflage":
    fails.append("② 精確比對失效")
got = cur._resolve_actor('the company named “WUBIANJIE” [無邊界公司]', n2e)
if (got or {}).get("id") != "borderless-group":
    fails.append("② 片語型 surface 應由括號片段解析到 borderless-group，得 %r" % (got and got["id"]))
if cur._resolve_actor("網路水軍集團", n2e) is not None:
    fails.append("② 未登錄名不得解析出實體")
if cur._resolve_actor("「龍橋」與「乙方」", n2e) is not None:
    fails.append("② 括號片段指向不同實體＝歧義，必須回 None（不猜）")

# ── ③ 寫入與 held ────────────────────────────────────────────────────
db_ents = {"spamouflage": {"id": "spamouflage", "name_zh": "Spamouflage"},
           "mps": {"id": "mps", "name_zh": "公安部"}}
sl = {"objects": [{"tmp_id": "a", "kind": "intrusion-set", "name": "龍橋"},
                  {"tmp_id": "b", "kind": "threat-actor", "name": "中共公安部"},
                  {"tmp_id": "c", "kind": "intrusion-set", "name": "網路水軍集團"}],
      "relationships": [
          {"source": "a", "type": "attributed-to", "target": "b"},
          {"source": "c", "type": "attributed-to", "target": "b"}]}
written, held = cur.apply_attributions(sl, n2e | {cur._norm("龍橋"): db_ents["spamouflage"],
                                                  cur._norm("中共公安部"): db_ents["mps"]},
                                       db_ents, "NSB", "2026-08-30")
if written != [("spamouflage", "mps")]:
    fails.append("③ 應只寫入 spamouflage→mps，得 %r" % written)
if held != [("網路水軍集團", "中共公安部")]:
    fails.append("③ 未登錄端點應 held 回報，得 %r" % held)
rel = (db_ents["spamouflage"].get("related") or [{}])[0]
if rel.get("relation") != "attributed-to" or rel.get("target_id") != "mps":
    fails.append("③ related 寫入形態錯誤：%r" % rel)
if "NSB" not in rel.get("note", "") or "2026-08-30" not in rel.get("note", ""):
    fails.append("③ note 必須記來源機構與核可日期：%r" % rel.get("note"))
w2, _h2 = cur.apply_attributions(sl, n2e | {cur._norm("龍橋"): db_ents["spamouflage"],
                                            cur._norm("中共公安部"): db_ents["mps"]},
                                 db_ents, "NSB", "2026-08-31")
if w2: fails.append("③ 重跑不得重複寫入，得 %r" % w2)
if len(db_ents["spamouflage"]["related"]) != 1:
    fails.append("③ related 出現重複條目")

# ── ④ 逐篇 bundle 只對「真正核可過」的歸因邊蓋章 ─────────────────────────
# 缺陷：compile 重寫 bundle 時只丟一個「今天」，把這篇**每一條**歸因都蓋成 approved——包括被 held
# （端點未登錄、從未落地）的邊，以及早已核可的邊（核可日期被改成今天）。逐篇 bundle 設計上可直接交換
# （OpenCTI），蓋錯章＝對外謊報核可狀態。修法：serialize 接受逐邊 dict；curate.attribution_stamps 只對
# db.js 內確實存在的核可歸因給章，日期取自 db 的 note。
SL4 = {"report": {"name": "t", "url": "https://example.org/r", "org": "NSB", "published": "2026", "type": "gov-report"},
       "objects": [{"tmp_id": "a", "kind": "intrusion-set", "name": "龍橋"},
                   {"tmp_id": "b", "kind": "threat-actor", "name": "中共公安部"},
                   {"tmp_id": "c", "kind": "intrusion-set", "name": "網路水軍集團"}],
       "relationships": [{"source": "a", "type": "attributed-to", "target": "b", "confidence": "medium"},
                         {"source": "c", "type": "attributed-to", "target": "b", "confidence": "medium"}]}

def _edge(bundle, src_name, dst_name):
    ids = {o["name"]: o["id"] for o in bundle["objects"] if o.get("name")}
    for o in bundle["objects"]:
        if (o["type"] == "relationship" and o["relationship_type"] == "attributed-to"
                and o["source_ref"] == ids.get(src_name) and o["target_ref"] == ids.get(dst_name)):
            return o
    return None

def _world(spam_related):
    ents = {"spamouflage": {"id": "spamouflage", "related": list(spam_related)}, "mps": {"id": "mps"}}
    return ents, {cur._norm("龍橋"): ents["spamouflage"], cur._norm("中共公安部"): ents["mps"]}

OLD_NOTE = "NSB 報告記錄；2026-08-30 人工核可"

# 4a 早已核可、今天重編：保留原核可日期（不被改成今天）；held 的邊不蓋章
ents, n2e = _world([{"target_id": "mps", "relation": "attributed-to", "note": OLD_NOTE}])
w, h = cur.apply_attributions(SL4, n2e, ents, "NSB", "2026-10-17")
if w or h != [("網路水軍集團", "中共公安部")]:
    fails.append("④a 前提：已存在的邊不重寫、未登錄端點 held，得 w=%r h=%r" % (w, h))
st = cur.attribution_stamps(SL4, n2e, ents)
if st != {("a", "b"): "2026-08-30"}:
    fails.append("④a 只有 db 內核可過的邊進表、日期沿用原日期，得 %r" % st)
bn = pipe.serialize(SL4, attribution_approved=st)
ok, hold = _edge(bn, "龍橋", "中共公安部"), _edge(bn, "網路水軍集團", "中共公安部")
if not ok or ok.get("x_netweaver_review") != "approved" or ok.get("x_netweaver_review_date") != "2026-08-30":
    fails.append("④a 已核可的邊應蓋 approved＋原日期 2026-08-30，得 %r" % (ok and (ok.get("x_netweaver_review"), ok.get("x_netweaver_review_date"))))
if not hold or hold.get("x_netweaver_review") != "pending-human-approval" or "x_netweaver_review_date" in hold:
    fails.append("④a held（端點未登錄、從未核可）的邊必須維持 pending、不帶日期，得 %r" % (hold and (hold.get("x_netweaver_review"), hold.get("x_netweaver_review_date"))))

# 4b 本次新寫入：日期＝今天
ents, n2e = _world([])
if cur.attribution_stamps(SL4, n2e, ents) != {}:
    fails.append("④b 尚未 apply_attributions（db 內沒有這條邊）不得蓋章")
w, h = cur.apply_attributions(SL4, n2e, ents, "NSB", "2026-10-17")
if w != [("spamouflage", "mps")]:
    fails.append("④b 前提：應寫入 spamouflage→mps，得 %r" % w)
if cur.attribution_stamps(SL4, n2e, ents) != {("a", "b"): "2026-10-17"}:
    fails.append("④b 新寫入的邊日期應為今天（取自 note），得 %r" % cur.attribution_stamps(SL4, n2e, ents))

# 4c note 抓不到日期：仍算核可（db 內存在），但不帶日期欄
ents, n2e = _world([{"target_id": "mps", "relation": "attributed-to", "note": "NSB 報告記錄；人工核可"}])
st = cur.attribution_stamps(SL4, n2e, ents)
if st != {("a", "b"): None}:
    fails.append("④c note 無日期：進表但日期為 None，得 %r" % st)
e = _edge(pipe.serialize(SL4, attribution_approved=st), "龍橋", "中共公安部")
if e.get("x_netweaver_review") != "approved" or "x_netweaver_review_date" in e:
    fails.append("④c 無日期的核可邊：approved 但不帶日期欄，得 %r" % e)

# 4d 不是核可過的歸因，不得混進來：db 內是別種關係、或指向別的目標
for related, why in (([{"target_id": "mps", "relation": "related-to", "note": OLD_NOTE}], "同目標但關係型別不是 attributed-to"),
                     ([{"target_id": "other", "relation": "attributed-to", "note": OLD_NOTE}], "歸因但指向別的目標")):
    ents, n2e = _world(related)
    if cur.attribution_stamps(SL4, n2e, ents) != {}:
        fails.append("④d %s，不得蓋章" % why)

# 4e serialize 的三種形態：沒有 --yes（None）／空 dict 全 pending；字串＝全蓋（舊行為，向下相容）
for arg, expect in ((None, "pending-human-approval"), ({}, "pending-human-approval"), ("2026-08-30", "approved")):
    b = pipe.serialize(SL4, attribution_approved=arg)
    got = {_edge(b, "龍橋", "中共公安部")["x_netweaver_review"], _edge(b, "網路水軍集團", "中共公安部")["x_netweaver_review"]}
    if got != {expect}:
        fails.append("④e attribution_approved=%r 應全蓋 %s，得 %r" % (arg, expect, got))

print("歸因出口（狀態章＋端點解析＋db.js 寫入＋逐篇 bundle 逐邊蓋章）")
print("  ① serialize 蓋章｜② 保守解析｜③ 寫入與 held｜④ 逐邊蓋章（held 不蓋、原日期、新寫入今天）→ %s" % ("全數符合" if not fails else "有問題"))
if fails:
    print("✗ 失敗："); [print("   -", f) for f in fails]; raise SystemExit(1)
print("✓ 通過")
