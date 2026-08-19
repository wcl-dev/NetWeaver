#!/usr/bin/env python3
"""curate.py 回歸測試（不寫 db.js、不需 LLM）：核心是 source-scoped upsert 的安全性（不整包覆蓋）。
用法：python3 pipeline/test_curate.py"""
import importlib.util, pathlib

_h = pathlib.Path(__file__).resolve().parent
_s = importlib.util.spec_from_file_location("curate", str(_h / "curate.py"))
cur = importlib.util.module_from_spec(_s); _s.loader.exec_module(cur)

CASES = []
def case(fn): CASES.append(fn); return fn

@case
def test_upsert_preserves_other_sources():
    # 以 source_id 為單位替換：同來源舊 claim 換掉、其他來源保留（守住既有/人工資料）
    ent = {"claims": [{"text": "old A1", "source_id": "src-A", "about": "X"},
                      {"text": "old B1", "source_id": "src-B", "about": "X"}]}
    cur._upsert(ent, [{"text": "new A2", "source_id": "src-A", "about": "X"}], {"src-A"})
    srcs = [c["source_id"] for c in ent["claims"]]
    assert srcs.count("src-B") == 1, "其他來源 claim 必須保留"
    assert srcs.count("src-A") == 1 and any(c["text"] == "new A2" for c in ent["claims"]), "同來源舊 claim 應被取代"
    assert not any(c["text"] == "old A1" for c in ent["claims"]), "同來源舊 claim 不應殘留"
    assert len(ent["claims"]) == 2

@case
def test_upsert_dedupes_within_source():
    # 同來源、正規化後同文字 → 去重
    ent = {"claims": []}
    cur._upsert(ent, [{"text": "Same Quote.", "source_id": "s", "about": "X"},
                      {"text": "same  quote", "source_id": "s", "about": "Y"}], {"s"})
    assert len(ent["claims"]) == 1, "同來源正規化同文字應去重"

@case
def test_upsert_empty_existing_adds_all():
    ent = {}
    cur._upsert(ent, [{"text": "a", "source_id": "s", "about": "X"},
                      {"text": "b", "source_id": "s", "about": "Y"}], {"s"})
    assert len(ent["claims"]) == 2

@case
def test_upsert_multi_source_new_only_touches_named():
    # 一次帶入兩來源的新 claims，只有列在 source_ids 的來源會被替換語意涵蓋
    ent = {"claims": [{"text": "keep C1", "source_id": "src-C", "about": "X"}]}
    new = [{"text": "A", "source_id": "src-A", "about": "X"}, {"text": "B", "source_id": "src-B", "about": "X"}]
    cur._upsert(ent, new, {"src-A", "src-B"})
    srcs = sorted(c["source_id"] for c in ent["claims"])
    assert srcs == ["src-A", "src-B", "src-C"], "未涉及的 src-C 保留、新來源加入"

@case
def test_upsert_keeps_existing_duplicates_untouched():
    # 既有（含人工、無 source_id）claims 原樣保留，不因去重被刪
    ent = {"claims": [{"text": "dup", "about": "X"}, {"text": "dup", "about": "X"}]}
    cur._upsert(ent, [{"text": "new", "source_id": "src-A", "about": "X"}], {"src-A"})
    assert sum(1 for c in ent["claims"] if c["text"] == "dup") == 2, "既有重複 claim 必須原樣保留"
    assert len(ent["claims"]) == 3

@case
def test_upsert_rejects_foreign_and_empty():
    # 只寫屬於 source_ids 的 claim；空文字丟棄
    ent = {}
    cur._upsert(ent, [{"text": "ok", "source_id": "src-A", "about": "X"},
                      {"text": "x", "source_id": "src-Z", "about": "X"},   # 不在 source_ids → 拒
                      {"text": "  ", "source_id": "src-A", "about": "X"}],  # 空文字 → 拒
                {"src-A"})
    assert len(ent["claims"]) == 1 and ent["claims"][0]["text"] == "ok"

@case
def test_operator_ref_picks_acting_actor_not_target():
    # 行動方（關係 source、actor kind）優先；已登錄的 target（place）不被選
    sl = {"objects": [{"tmp_id": "a", "kind": "identity", "nw_ref": "regA"},
                      {"tmp_id": "b", "kind": "location", "nw_ref": "regB"}],
          "relationships": [{"source": "a", "target": "b", "type": "targets"}]}
    assert cur.rl.operator_ref(sl, {"regA", "regB"}) == "regA"

@case
def test_operator_ref_skips_unregistered_operator():
    # golaxy 型：未登錄的 intrusion-set 是 STIX operator，但歸屬要落在已登錄的 identity
    sl = {"objects": [{"tmp_id": "net", "kind": "intrusion-set", "nw_ref": None},
                      {"tmp_id": "go", "kind": "identity", "nw_ref": "golaxy"}],
          "relationships": [{"source": "go", "target": "net", "type": "related-to"}]}
    assert cur.rl.operator_ref(sl, {"golaxy"}) == "golaxy"

@case
def test_operator_ref_failclosed_not_target():
    # 無行動方 source（只被 mention）→ None（不落回任一已登錄）
    sl = {"objects": [{"tmp_id": "x", "kind": "location", "nw_ref": "regX"}], "relationships": []}
    assert cur.rl.operator_ref(sl, {"regX"}) is None
    # 未登錄 actor --targets--> 已登錄 target：不得回 target（fail-closed → None）
    sl2 = {"objects": [{"tmp_id": "act", "kind": "intrusion-set", "nw_ref": None},
                       {"tmp_id": "tgt", "kind": "location", "nw_ref": "regTW"}],
           "relationships": [{"source": "act", "target": "tgt", "type": "targets"}]}
    assert cur.rl.operator_ref(sl2, {"regTW"}) is None

@case
def test_upsert_empty_new_clears_source():
    # 重編時 claim 可能改掛別的實體、或被宣稱閘濾掉；compile 以空集合取代該來源，
    # 舊 claim 必須清乾淨（否則實體頁會留下上一版的殘影），其他來源不受影響。
    ent = {"claims": [{"text": "old A1", "source_id": "src-A", "about": "X"},
                      {"text": "old A2", "source_id": "src-A", "about": "X"},
                      {"text": "keep B1", "source_id": "src-B", "about": "X"}]}
    cur._upsert(ent, [], {"src-A"})
    assert [c["source_id"] for c in ent["claims"]] == ["src-B"], "同來源舊 claim 應被清空、他來源保留"

# ---- 自動發布閘（人審名冊、模型填內容）----

_ENT_OK   = {"id": "cmg-cctv", "name_zh": "央視"}
_ENT_SENS = {"id": "cti-tv", "name_zh": "中天", "sensitivity": "domestic-named"}
_DB = {"entities": [_ENT_OK, _ENT_SENS], "sources": []}
_N2E = {cur._norm("央視"): _ENT_OK, cur._norm("中天"): _ENT_SENS}
_PUB = {"FactLink"}

def _rec(*abouts):
    return {"claims": [{"about": a, "quote": f"{a}發布了內容。", "source": "https://x/y"} for a in abouts]}

def _gate(rec, att=0, fails=(), curated=True, org=None):
    return cur.auto_gate(rec, att, list(fails), curated, org, _N2E, _PUB)

@case
def test_auto_gate_publishes_registered_entities():
    ok, why, hits = _gate(_rec("央視"))
    assert ok, why
    assert [h["id"] for h in hits] == ["cmg-cctv"]

@case
def test_auto_gate_blocks_attribution_redline():
    # 歸因是專案紅線：不論其他條件多乾淨，含 attributed-to 一律不自動發布
    ok, why, _ = _gate(_rec("央視"), att=2)
    assert not ok and "attributed-to" in why, why

@case
def test_auto_gate_blocks_invalid_bundle():
    ok, why, _ = _gate(_rec("央視"), fails=["懸空 SRO ref"])
    assert not ok and "不合法" in why, why

@case
def test_auto_gate_blocks_when_nothing_hits_roster():
    # 名冊是唯一閘門：掛不上任何已登錄實體 → 不自動發，改請人審名冊
    ok, why, hits = _gate(_rec("新華社", "習近平"))
    assert not ok and "名冊" in why and hits == [], why

@case
def test_auto_gate_blocks_sensitive_entity():
    # 「曾同意收錄中天」≠「同意之後每篇報告自動往中天加內容」
    ok, why, _ = _gate(_rec("中天"))
    assert not ok and "敏感實體" in why and "cti-tv" in why, why

@case
def test_auto_gate_blocks_sensitive_even_when_mixed():
    ok, why, _ = _gate(_rec("央視", "中天"))
    assert not ok, "只要碰到一個敏感實體就整篇留給人"

@case
def test_auto_gate_blocks_untrusted_publisher():
    # 自動化不得引入新出版方——那是 governance 決定
    ok, why, _ = _gate(_rec("央視"), curated=False, org="某新部落格")
    assert not ok and "出版方" in why, why
    ok2, _w2, _ = _gate(_rec("央視"), curated=False, org="FactLink")
    assert ok2, "已信任出版方的新報告可自動發布（逐篇來源自動補登）"
    ok3, why3, _ = _gate(_rec("央視"), curated=False)
    assert not ok3 and "未知" in why3, "查不到出版方時必須留給人，不能因為欄位缺漏就放行"

@case
def test_auto_gate_allows_curated_source_regardless_of_org_list():
    # 來源本身已登錄 → 出版方是否在清單上就不再是問題（人早已核可過這筆）
    ok, why, _ = _gate(_rec("央視"), curated=True, org="某新部落格")
    assert ok, why

# ---- compile 的發布範圍（替身取代 queue/db IO，不落盤）----

import contextlib, types

@contextlib.contextmanager
def _compile_env(entries, att=0):
    """entries: [(raw_id, compile_status)]。每篇各有自己的 source，claim 都掛到同一個實體。"""
    queue = {rid: {"raw_id": rid, "extraction": f"x/{rid}.json", "extraction_digest": f"dig-{rid}",
                   "actor_registered": None, "compile_status": st} for rid, st in entries}
    db = {"sources": [{"url": f"https://example.org/{rid}", "id": f"src-{rid}"} for rid, _ in entries],
          "entities": [{"id": "cmg-cctv", "name_zh": "央視", "claims": []}]}
    saved = []
    def fake_project(relpath):
        rid = pathlib.Path(relpath).name.split(".")[0]
        rec = {"claims": [{"about": "央視", "quote": f"{rid} 的宣稱。",
                           "source": f"https://example.org/{rid}"}]}
        return None, rec, {}, att, f"dig-{rid}", []
    orig = (cur.rl.load_queue, cur.rl._write_queue, cur.rl.operator_ref,
            cur.load_db, cur.save_db, cur.project_extraction)
    cur.rl.load_queue = lambda: queue
    cur.rl._write_queue = lambda q: None
    cur.rl.operator_ref = lambda sl, ent_ids: None
    cur.load_db = lambda: ("", 0, 0, db)
    cur.save_db = lambda src, i, d: saved.append(d)
    cur.project_extraction = fake_project
    try: yield queue, db, saved
    finally:
        (cur.rl.load_queue, cur.rl._write_queue, cur.rl.operator_ref,
         cur.load_db, cur.save_db, cur.project_extraction) = orig

@case
def test_compile_scoped_to_raw_id():
    # 指名發布只能動到該篇：其他 approved 項目不得被順帶發布（後台單篇「發布」鈕走這條路）
    with _compile_env([("aaa", "approved"), ("bbb", "approved")]) as (queue, db, saved):
        cur.cmd_compile(types.SimpleNamespace(raw_id="aaa", yes=False, dry_run=False))
        assert queue["aaa"]["compile_status"] == "compiled", "指名的那篇要發布"
        assert queue["bbb"]["compile_status"] == "approved", "其他 approved 項目不得被順帶發布"
        sids = [c["source_id"] for c in db["entities"][0]["claims"]]
        assert sids == ["src-aaa"], f"db 只該寫入該篇來源的 claims，實得 {sids}"
        assert len(saved) == 1

@case
def test_compile_without_raw_id_still_does_all():
    # 不給 raw_id → 維持 CLI 既有行為（全部 approved）
    with _compile_env([("aaa", "approved"), ("bbb", "approved")]) as (queue, db, _s):
        cur.cmd_compile(types.SimpleNamespace(raw_id=None, yes=False, dry_run=False))
        assert all(queue[r]["compile_status"] == "compiled" for r in ("aaa", "bbb"))
        assert sorted(c["source_id"] for c in db["entities"][0]["claims"]) == ["src-aaa", "src-bbb"]

@case
def test_compile_scoped_attribution_gate_holds():
    # 歸因紅線：yes=False 時含 attributed-to 的項目不得發布，且要明確失敗（不能讓後台誤判成功）
    with _compile_env([("aaa", "approved")], att=2) as (queue, db, saved):
        try:
            cur.cmd_compile(types.SimpleNamespace(raw_id="aaa", yes=False, dry_run=False))
            assert False, "含 attributed-to 且未確認時，指名發布必須失敗"
        except SystemExit as e:
            assert "attributed-to" in str(e), str(e)
        assert queue["aaa"]["compile_status"] == "approved" and not saved

@case
def test_compile_scoped_rejects_unknown_and_unapproved():
    with _compile_env([("aaa", "pending")]) as (queue, _db, saved):
        for rid, want in (("zzz", "queue 無此"), ("aaa", "非 approved")):
            try:
                cur.cmd_compile(types.SimpleNamespace(raw_id=rid, yes=False, dry_run=False))
                assert False, f"{rid} 應被擋下"
            except SystemExit as e:
                assert want in str(e), str(e)
        assert not saved

def main():
    for fn in CASES:
        try:
            fn(); print(f"  ✓ {fn.__name__}")
        except AssertionError as e:
            print(f"  ✗ {fn.__name__}：{e}"); return 1
    print(f"\n全部 {len(CASES)}/{len(CASES)} 綠 ✓（source-scoped upsert＋發布範圍限定：指名只發該篇、歸因閘不外溢）")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
