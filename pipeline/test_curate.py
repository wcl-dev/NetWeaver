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

def main():
    for fn in CASES:
        try:
            fn(); print(f"  ✓ {fn.__name__}")
        except AssertionError as e:
            print(f"  ✗ {fn.__name__}：{e}"); return 1
    print(f"\n全部 {len(CASES)}/{len(CASES)} 綠 ✓（source-scoped upsert：保留其他來源／取代同來源／去重）")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
