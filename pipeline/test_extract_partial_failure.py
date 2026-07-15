#!/usr/bin/env python3
"""單一 mention pass 失敗時仍保留其他 pass；不呼叫模型。"""
import extract

TEXT = "Red Group operated fake accounts targeting Taiwan."
original = extract._call_messages
calls = 0

def fake(messages, fmt, **_kwargs):
    global calls
    calls += 1
    if "mentions" in fmt["properties"]:
        if "grammatical actor/agent" in messages[0]["content"]:
            raise TimeoutError("fixture")
        if "set coarse_type='narrative'" in messages[0]["content"]:
            return {"mentions": []}
        return extract.LLMResponse({"mentions": [
            {"tmp_id": "x", "surface": "Red Group", "coarse_type": "org", "quote": "Red Group operated fake accounts"},
            {"tmp_id": "y", "surface": "fake accounts", "coarse_type": "network", "quote": "operated fake accounts targeting Taiwan"},
        ]}, [{"index": 2, "error": "$.mentions[2].coarse_type: 'platform' 不在 enum"}])
    return {"assertions": [
        {"subject": "e1", "predicate": "operated", "object": "e2", "quote": "Red Group operated fake accounts"}
    ]}

trace = []
extract._call_messages = fake
try:
    pred = extract.call_llm_two_stage(TEXT, trace)
finally:
    extract._call_messages = original

assert len(pred["mentions"]) == 2 and len(pred["assertions"]) == 1
assert trace[0]["stage"] == "mentions-a" and "TimeoutError" in trace[0]["error"]
assert trace[1]["schema_item_drops"][0]["index"] == 2
print("extract partial failure：通過（pass timeout＋invalid item 都保留其餘結果）")
