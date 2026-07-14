#!/usr/bin/env python3
"""extract.span_check 的 fail-closed 回歸測試；不呼叫模型或網路。"""
from extract import span_check

TEXT = "GoLaxy operated fake accounts targeting Taiwan."

VALID = {
    "mentions": [
        {"tmp_id": "m1", "surface": "GoLaxy", "coarse_type": "org", "quote": "GoLaxy operated fake accounts"},
        {"tmp_id": "m2", "surface": "Taiwan", "coarse_type": "place", "quote": "targeting Taiwan"},
    ],
    "assertions": [
        {"subject": "m1", "predicate": "targeting", "object": "m2", "quote": TEXT},
    ],
}

checked, dropped = span_check(VALID, TEXT)
assert len(checked["mentions"]) == 2 and len(checked["assertions"]) == 1 and not dropped

INVALID = {
    "mentions": [
        {"tmp_id": "bad-space", "surface": "GoLaxy", "coarse_type": "org", "quote": "GoLaxy  operated fake accounts"},
        {"tmp_id": "bad-surface", "surface": "Beijing", "coarse_type": "place", "quote": "targeting Taiwan"},
        {"tmp_id": "ok", "surface": "Taiwan", "coarse_type": "place", "quote": "targeting Taiwan"},
    ],
    "assertions": [
        {"subject": "ok", "predicate": "attacked", "object": "ok", "quote": "targeting Taiwan"},
        {"subject": "missing", "predicate": "targeting", "object": "ok", "quote": TEXT},
    ],
}

checked, dropped = span_check(INVALID, TEXT)
assert [m["tmp_id"] for m in checked["mentions"]] == ["ok"]
assert checked["assertions"] == []
assert {reason for _, _, reason in dropped} == {
    "bad-quote", "surface-not-in-quote", "predicate-not-in-quote", "dangling"
}
print("extract span-check：通過（exact quote/surface/predicate＋dangling fail-closed）")
