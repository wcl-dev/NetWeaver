#!/usr/bin/env python3
"""data/db.js 的參照完整性不變量（純離線，直接讀 data/db.js；CI 會跑）。

  ① claim.source_id 必在 sources[]
  ② claim.source_id 必在該實體的 source_ids ——compile 只寫 claim、不補來源清單；漏了會讓全書 STIX 的
     「來源報告→實體」連結少一條（2026-10 Codex 抓過 Spamouflage 漏 DFRLab）
  ③ entity／event／narrative 的 source_ids 每個都在 sources[]
  ④ claim.text 非空
  ⑤ related.target_id、event.participant_ids 必在 entities[]
另含負向自測：對刻意弄壞的合成 db，每一類違規都必須被抓到（避免檢查本身形同虛設）。
用法：python3 pipeline/test_db_invariants.py"""
import json, pathlib

DB = pathlib.Path(__file__).resolve().parent.parent / "data" / "db.js"


def load_db():
    src = DB.read_text(encoding="utf-8")
    return json.loads(src[src.index("{", src.index("window.NETWEAVER_DB")): src.rindex("}") + 1])


def violations(db):
    sids = {s["id"] for s in db["sources"]}
    eids = {e["id"] for e in db["entities"]}
    v = {k: [] for k in ("claim_source_unregistered", "claim_source_not_in_entity", "source_ids_unregistered",
                         "empty_claim", "dangling_ref")}
    for e in db["entities"]:
        have = set(e.get("source_ids") or [])
        for c in e.get("claims") or []:
            if c["source_id"] not in sids:
                v["claim_source_unregistered"].append((e["id"], c["source_id"]))
            if c["source_id"] not in have:
                v["claim_source_not_in_entity"].append((e["id"], c["source_id"]))
            if not (c.get("text") or "").strip():
                v["empty_claim"].append((e["id"], c["source_id"]))
        for s in have - sids:
            v["source_ids_unregistered"].append((e["id"], s))
        for r in e.get("related") or []:
            if r["target_id"] not in eids:
                v["dangling_ref"].append((e["id"], r["target_id"]))
    for kind in ("events", "narratives"):
        for o in db.get(kind) or []:
            for s in set(o.get("source_ids") or []) - sids:
                v["source_ids_unregistered"].append((o["id"], s))
    for ev in db.get("events") or []:
        for p in ev.get("participant_ids") or []:
            if p not in eids:
                v["dangling_ref"].append((ev["id"], p))
    return v


# ① 真實資料：全部不變量成立（失敗時列出違規項，方便定位）
real = violations(load_db())
for name, items in real.items():
    assert not items, f"db.js 不變量違規 [{name}] {len(items)} 項：{items[:5]}"

# ② 負向自測：刻意弄壞的合成 db，每一類都必須被抓到
broken = {
    "sources": [{"id": "s1"}],
    "entities": [{"id": "e1", "source_ids": ["s1", "ghost-ent"],
                  "claims": [{"text": "ok", "source_id": "s1", "about": "x"},
                             {"text": "來源沒登錄也不在實體清單", "source_id": "s-missing", "about": "x"},
                             {"text": "   ", "source_id": "s1", "about": "x"}],
                  "related": [{"target_id": "nobody", "relation": "linked-to", "note": ""}]}],
    "events": [{"id": "v1", "source_ids": ["ghost-ev"], "participant_ids": ["e1", "ghost-person"]}],
    "narratives": [{"id": "n1", "source_ids": ["ghost-nar"]}],
}
b = violations(broken)
assert ("e1", "s-missing") in b["claim_source_unregistered"], b
assert ("e1", "s-missing") in b["claim_source_not_in_entity"], b
assert ("e1", "s1") not in b["claim_source_not_in_entity"], "s1 在實體清單內，不該誤報"
assert {("e1", "ghost-ent"), ("v1", "ghost-ev"), ("n1", "ghost-nar")} <= set(b["source_ids_unregistered"]), b
assert b["empty_claim"] == [("e1", "s1")], b
assert {("e1", "nobody"), ("v1", "ghost-person")} <= set(b["dangling_ref"]), b

print("db.js 不變量：通過（claim 來源已登錄且在實體清單內／各 source_ids 皆登錄／claim 非空／參照不懸空；含負向自測）")
