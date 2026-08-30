#!/usr/bin/env python3
"""紅線出口回歸：核可的歸因必須落地，未核可的必須帶著狀態走。

先前的缺口：`curate.py compile --yes` 這道閘擋得住不該發布的，但通過之後沒有
寫入路徑——歸因進不了 db.js 也進不了全書匯出，人工核可等於空轉。更糟的是
逐篇 bundle 在抽取完成（人工核可**之前**）就落盤、標榜「可直接交換」，裡面的
attributed-to 沒有任何狀態標記，接手的人看不出這則歸因還沒過紅線。

本測試鎖住三件事：
  ① serialize 預設給 attributed-to 蓋 pending-human-approval；傳入核可日期
     則蓋 approved＋日期。其他關係不蓋章。
  ② _resolve_actor：精確比對優先；片語型 surface 取括號內片段，全部命中須
     指向同一實體，否則回 None（寧可 held 讓人補別名，不猜）。
  ③ apply_attributions：兩端都解析到已登錄實體才寫入 related（附來源機構＋
     核可日期）、重跑不重複寫；解析不到的進 held 清單回報，不落地。
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

print("歸因出口（狀態章＋端點解析＋db.js 寫入）")
print("  ① serialize 蓋章｜② 保守解析｜③ 寫入與 held → %s" % ("全數符合" if not fails else "有問題"))
if fails:
    print("✗ 失敗："); [print("   -", f) for f in fails]; raise SystemExit(1)
print("✓ 通過")
