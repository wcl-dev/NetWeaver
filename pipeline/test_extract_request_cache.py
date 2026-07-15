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
calls = 0


def fake(messages, fmt):
    global calls
    calls += 1
    return {"sequence": calls, "messages": len(messages), "schema": sorted(fmt)}


with tempfile.TemporaryDirectory() as cache_dir:
    os.environ["NW_LLM_CACHE_DIR"] = cache_dir
    os.environ.pop("NW_LLM_CACHE_SALT", None)
    os.environ["NW_LLM_OUTPUT_MODE"] = "schema"
    os.environ["NW_LLM_THINK"] = "false"
    extract._call_messages_uncached = fake
    extract.reset_cache_stats()
    try:
        messages = [{"role": "user", "content": "same"}]
        first = extract._call_messages(messages, {"type": "object"})
        second = extract._call_messages(messages, {"type": "object"})
        changed = extract._call_messages(messages, {"type": "array"})
        os.environ["NW_LLM_OUTPUT_MODE"] = "json"
        json_mode = extract._call_messages(messages, {"type": "object"})
        os.environ["NW_LLM_THINK"] = "true"
        thinking = extract._call_messages(messages, {"type": "object"})
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

assert first == second and all(value != first for value in (changed, json_mode, thinking, salted)) and calls == 5
assert extract.cache_stats() == {"request_cache_hits": 1, "request_cache_misses": 5}
print("extract request cache：通過（schema／output mode／thinking／revision 皆隔離）")
