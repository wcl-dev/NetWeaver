#!/usr/bin/env python3
"""文件 budget 只計 cold calls，耗盡時保留 partial result；不呼叫模型。"""
import os
import tempfile

import extract

TEXT = "Red Group operated fake accounts targeting Taiwan."
original_uncached = extract._call_messages_uncached
original_cache_dir = os.environ.get("NW_LLM_CACHE_DIR")
calls = 0

def fake_uncached(messages, fmt, timeout=None, telemetry=None):
    global calls
    calls += 1
    if telemetry is not None:
        telemetry.update({"prompt_tokens": 10, "completion_tokens": 5, "model_total_seconds": 0.1})
    if "mentions" in fmt.get("properties", {}):
        if "actor/agent" in messages[0]["content"]:
            return {"mentions": [{"tmp_id": "m1", "surface": "Red Group", "coarse_type": "org",
                                   "quote": "Red Group operated fake accounts"}]}
        return {"mentions": [{"tmp_id": "m2", "surface": "fake accounts", "coarse_type": "network",
                               "quote": "operated fake accounts targeting Taiwan"}]}
    return {"assertions": []}

extract._call_messages_uncached = fake_uncached
try:
    os.environ.pop("NW_LLM_CACHE_DIR", None)
    run = extract.ExtractionRun(doc_timeout=60, max_cold_calls=2)
    trace = []
    pred = extract.call_llm_two_stage(TEXT, trace, run=run)
    assert run.budget_reason == "max-cold-calls" and run.cold_calls == 2
    assert len(pred["mentions"]) == 2 and pred["assertions"] == []
    assert run.summary()["prompt_tokens"] == 20 and run.summary()["completion_tokens"] == 10
    assert any(stage.get("budget_exhausted") == "max-cold-calls" for stage in trace)

    with tempfile.TemporaryDirectory() as cache_dir:
        os.environ["NW_LLM_CACHE_DIR"] = cache_dir
        extract.reset_cache_stats()
        cache_run = extract.ExtractionRun(doc_timeout=60, max_cold_calls=1)
        messages = [{"role": "user", "content": "same"}]
        schema = {"type": "object"}
        first = extract._call_messages(messages, schema, run=cache_run, stage="first")
        second = extract._call_messages(messages, schema, run=cache_run, stage="cached")
        assert first == second and cache_run.cold_calls == 1 and cache_run.cache_hits == 1
        try:
            extract._call_messages([{"role": "user", "content": "new"}], schema,
                                   run=cache_run, stage="over-budget")
            raise AssertionError("應觸發 max-cold-calls")
        except extract.ExtractionBudgetExceeded:
            pass
        assert cache_run.cold_calls == 1 and cache_run.budget_reason == "max-cold-calls"

    expired = extract.ExtractionRun(doc_timeout=1)
    expired.started -= 2
    try:
        expired.begin_cold_request("expired", 60)
        raise AssertionError("應觸發 doc-timeout")
    except extract.ExtractionBudgetExceeded:
        pass
    assert expired.cold_calls == 0 and expired.budget_reason == "doc-timeout"

    quota = extract.ExtractionRun(max_assertion_windows=6)
    quota.total_chunks, quota.chunk = 4, 1
    assert quota.assertion_window_quota(10) == 2
    quota.reserve_assertion_windows(2)
    quota.chunk = 2
    assert quota.assertion_window_quota(10) == 2
    quota.reserve_assertion_windows(2)
    quota.chunk = 4
    assert quota.assertion_window_quota(10) == 2
finally:
    extract._call_messages_uncached = original_uncached
    if original_cache_dir is None:
        os.environ.pop("NW_LLM_CACHE_DIR", None)
    else:
        os.environ["NW_LLM_CACHE_DIR"] = original_cache_dir

telemetry = extract._response_telemetry({"prompt_eval_count": 12, "eval_count": 7,
                                         "total_duration": 2_500_000_000,
                                         "eval_duration": 1_250_000_000}, "ollama")
assert telemetry["prompt_tokens"] == 12 and telemetry["completion_tokens"] == 7
assert telemetry["model_total_seconds"] == 2.5 and telemetry["generation_seconds"] == 1.25
print("extract budget：通過（cold-only 額度、partial 保留、cache resume、跨 chunk window 配額、telemetry）")
