#!/usr/bin/env python3
"""兩階段抽取的 grounding 與動態端點 schema 回歸測試；不呼叫模型。"""
import extract

TEXT = "Red Group operated fake accounts targeting Taiwan."
calls = []
original = extract._call_messages

def fake(messages, fmt):
    calls.append((messages, fmt))
    if "mentions" in fmt["properties"]:
        if "set coarse_type='narrative'" in messages[0]["content"]:
            return {"mentions": []}
        if "grammatical actor/agent" in messages[0]["content"]:
            return {"mentions": []}
        return {"mentions": [
            {"tmp_id": "m1", "surface": "Red Group", "coarse_type": "org", "quote": "Red Group operated fake accounts"},
            {"tmp_id": "m2", "surface": "fake accounts", "coarse_type": "network", "quote": "operated fake accounts targeting Taiwan"},
            {"tmp_id": "m3", "surface": "Taiwan", "coarse_type": "place", "quote": "targeting Taiwan"},
            {"tmp_id": "bad", "surface": "Beijing", "coarse_type": "place", "quote": "targeting Taiwan"},
        ]}
    assert fmt["properties"]["assertions"]["items"]["properties"]["subject"]["enum"] == ["e_m1", "e_m2", "e_m3"]
    return {"assertions": [
        {"subject": "e_m1", "predicate": "operated", "object": "e_m2", "quote": "Red Group operated fake accounts"},
        {"subject": "e_m2", "predicate": "targets", "object": "e_m3", "quote": "fake accounts targeting Taiwan"},
    ]}

extract._call_messages = fake
try:
    pred = extract.call_llm_two_stage(TEXT)
finally:
    extract._call_messages = original

assert [m["tmp_id"] for m in pred["mentions"]] == ["e_m1", "e_m2", "e_m3"]
assert len(pred["assertions"]) == 1 and pred["assertions"][0]["predicate"] == "operated"
assert len(calls) == 4
print("extract two-stage：通過（mention 先 grounding、端點 enum、predicate exact）")
