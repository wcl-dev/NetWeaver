#!/usr/bin/env python3
"""Trace metrics 可計算實際 logical call 數，並遞迴收集局部錯誤。"""
import eval_model

trace = [{"chunk": 1, "stages": [
    {"stage": "mentions-a", "kept": 1},
    {"stage": "mentions-e", "error": "TimeoutError: entity"},
    {"stage": "mentions-n", "kept": 0,
     "schema_item_drops": [{"index": 2, "error": "ValueError: invalid mention item"}]},
    {"stage": "assertions", "windows": 5, "calls": 5,
     "window_results": [{"window": 1, "kept": 1},
                        {"window": 2, "kept": 0},
                        {"window": 3, "error": "TimeoutError: assertion", "kept": 0}]},
]}]

assert eval_model.trace_stats(trace) == {
    "llm_calls": 8,
    "mention_calls": 3,
    "assertion_windows": 5,
    "assertion_windows_selected": 5,
    "assertion_windows_skipped": 0,
    "assertion_calls": 5,
}
assert eval_model.diagnostic_errors(trace) == ["TimeoutError: entity", "ValueError: invalid mention item",
                                               "TimeoutError: assertion"]
print("eval model stats：通過（call/window metrics／item drops／遞迴 partial errors）")
