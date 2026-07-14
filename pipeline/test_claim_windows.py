#!/usr/bin/env python3
"""assertion claim windows 必須保持原文 exact 並縮小候選範圍。"""
import extract

text = "Red Group operated fake accounts. They targeted Taiwan。Other background."
mentions = [
    {"tmp_id": "m1", "surface": "Red Group", "coarse_type": "org", "quote": "Red Group operated fake accounts"},
    {"tmp_id": "m2", "surface": "fake accounts", "coarse_type": "network", "quote": "operated fake accounts"},
    {"tmp_id": "m3", "surface": "They", "coarse_type": "network", "quote": "They targeted Taiwan"},
    {"tmp_id": "m4", "surface": "Taiwan", "coarse_type": "place", "quote": "targeted Taiwan"},
]
windows = extract.claim_windows(text, mentions)
assert len(windows) == 2
assert all(w["text"] in text for w in windows)
assert [[m["tmp_id"] for m in w["candidates"]] for w in windows] == [["m1", "m2"], ["m3", "m4"]]
print("claim windows：通過（exact 句窗＋局部候選）")
