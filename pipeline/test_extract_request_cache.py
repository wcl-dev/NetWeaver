#!/usr/bin/env python3
"""逐 request 快取只重用同模型／messages／schema 的成功 JSON，改變請求即 miss。"""
import os
import tempfile

import extract

original = extract._call_messages_uncached
original_cache_dir = os.environ.get("NW_LLM_CACHE_DIR")
original_cache_salt = os.environ.get("NW_LLM_CACHE_SALT")
original_output_mode = os.environ.get("NW_LLM_OUTPUT_MODE")
original_think = os.environ.get("NW_LLM_THINK")
original_extra = os.environ.get("NW_LLM_EXTRA_BODY")
calls = 0


def fake(messages, fmt, item_error_field=None):
    global calls
    calls += 1
    response = {"sequence": calls, "messages": len(messages), "schema": sorted(fmt)}
    if item_error_field:
        return extract.LLMResponse(response, [{"index": 2, "error": "fixture invalid item"}])
    return response


with tempfile.TemporaryDirectory() as cache_dir:
    os.environ["NW_LLM_CACHE_DIR"] = cache_dir
    os.environ.pop("NW_LLM_CACHE_SALT", None)
    os.environ["NW_LLM_OUTPUT_MODE"] = "schema"
    os.environ["NW_LLM_THINK"] = "false"
    os.environ.pop("NW_LLM_EXTRA_BODY", None)
    extract._call_messages_uncached = fake
    extract.reset_cache_stats()
    try:
        messages = [{"role": "user", "content": "same"}]
        first = extract._call_messages(messages, {"type": "object"})
        second = extract._call_messages(messages, {"type": "object"})
        tolerant_first = extract._call_messages([{"role": "user", "content": "tolerant"}],
                                                {"type": "object"}, item_error_field="items")
        tolerant_second = extract._call_messages([{"role": "user", "content": "tolerant"}],
                                                 {"type": "object"}, item_error_field="items")
        legacy = extract._call_messages([{"role": "user", "content": "legacy-strict"}],
                                        {"type": "object"})
        legacy_fallback = extract._call_messages([{"role": "user", "content": "legacy-strict"}],
                                                 {"type": "object"}, item_error_field="items")
        changed = extract._call_messages(messages, {"type": "array"})
        os.environ["NW_LLM_OUTPUT_MODE"] = "json"
        json_mode = extract._call_messages(messages, {"type": "object"})
        os.environ["NW_LLM_THINK"] = "true"
        thinking = extract._call_messages(messages, {"type": "object"})
        # extra body（OpenAI 相容端點的思考控制，如 Gemini reasoning_effort）必須參與 cache key，
        # 否則改設定重跑會命中前一次的結果，A/B 會靜默得出「兩種設定沒有差別」的假結論。
        os.environ["NW_LLM_EXTRA_BODY"] = '{"reasoning_effort": "low"}'
        extra_low = extract._call_messages(messages, {"type": "object"})
        os.environ["NW_LLM_EXTRA_BODY"] = '{"reasoning_effort": "high"}'
        extra_high = extract._call_messages(messages, {"type": "object"})
        os.environ.pop("NW_LLM_EXTRA_BODY", None)
        os.environ["NW_LLM_CACHE_SALT"] = "new-model-revision"
        salted = extract._call_messages(messages, {"type": "object"})
    finally:
        extract._call_messages_uncached = original
        if original_cache_dir is None:
            os.environ.pop("NW_LLM_CACHE_DIR", None)
        else:
            os.environ["NW_LLM_CACHE_DIR"] = original_cache_dir
        if original_cache_salt is None:
            os.environ.pop("NW_LLM_CACHE_SALT", None)
        else:
            os.environ["NW_LLM_CACHE_SALT"] = original_cache_salt
        if original_output_mode is None:
            os.environ.pop("NW_LLM_OUTPUT_MODE", None)
        else:
            os.environ["NW_LLM_OUTPUT_MODE"] = original_output_mode
        if original_think is None:
            os.environ.pop("NW_LLM_THINK", None)
        else:
            os.environ["NW_LLM_THINK"] = original_think
        if original_extra is None:
            os.environ.pop("NW_LLM_EXTRA_BODY", None)
        else:
            os.environ["NW_LLM_EXTRA_BODY"] = original_extra

assert first == second and tolerant_first == tolerant_second
assert tolerant_second.schema_item_drops == [{"index": 2, "error": "fixture invalid item"}]
assert legacy == legacy_fallback
assert all(value != first for value in (changed, json_mode, thinking, extra_low, extra_high, salted)) and calls == 9
assert extra_low != extra_high, "不同 reasoning_effort 必須是不同 request（否則 A/B 會互相命中快取）"
assert extract.cache_stats() == {"request_cache_hits": 3, "request_cache_misses": 9}

# variant 也必須分家，否則兩種設定會寫進同一個 eval_runs 目錄互相覆蓋
os.environ["NW_LLM_EXTRA_BODY"] = '{"reasoning_effort": "low"}'
low_variant = extract.extraction_variant()
os.environ["NW_LLM_EXTRA_BODY"] = '{"reasoning_effort": "high"}'
assert low_variant != extract.extraction_variant() and "re-low" in low_variant
os.environ.pop("NW_LLM_EXTRA_BODY", None)
assert "re-" not in extract.extraction_variant(), "無 extra body 時應維持舊 variant 名（既有 run/cache 不失效）"
if original_extra is not None: os.environ["NW_LLM_EXTRA_BODY"] = original_extra

print("extract request cache：通過（schema／mode／thinking／extra-body／revision／item diagnostics 皆隔離）")
