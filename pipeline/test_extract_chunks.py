#!/usr/bin/env python3
"""切塊與合併回歸測試；不呼叫模型或網路。"""
import extract

text = "A" * 70 + ". " + "B" * 70 + "。" + "C" * 70
chunks = extract.split_text(text, max_chars=100, overlap=12)
assert len(chunks) >= 3
assert all(chunk in text for chunk in chunks)
assert chunks[0][-12:] == chunks[1][:12]

original = extract.call_llm
def fake(chunk):
    token = "A" if "A" in chunk else "B" if "B" in chunk else "C"
    return {"mentions": [
                {"tmp_id": "m1", "surface": token, "coarse_type": "org", "quote": token},
                {"tmp_id": "m2", "surface": token, "coarse_type": "org", "quote": token}],
            "assertions": [{"subject": "m1", "predicate": token, "object": "m2", "quote": token}]}
extract.call_llm = fake
try:
    pred = extract.call_llm_chunked(text, max_chars=100, overlap=12)
finally:
    extract.call_llm = original
ids = {m["tmp_id"] for m in pred["mentions"]}
assert len(ids) == len(pred["mentions"])
assert all(a["subject"] in ids and a["object"] in ids for a in pred["assertions"])
print(f"extract chunks：通過（{len(chunks)} chunks；namespace／dedupe／無 dangling）")
