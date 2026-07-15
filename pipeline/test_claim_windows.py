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

rank_mentions = mentions + [
    {"tmp_id": "m5", "surface": "claim", "coarse_type": "narrative", "quote": "claim"},
]
rank_windows = [
    {"text": "Red Group and Taiwan background.", "candidates": [{"tmp_id": "m1"}, {"tmp_id": "m4"}]},
    {"text": "Red Group amplified claim.", "candidates": [{"tmp_id": "m1"}, {"tmp_id": "m5"}]},
    {"text": "fake accounts appeared.", "candidates": [{"tmp_id": "m2"}, {"tmp_id": "m3"}]},
]
selected = extract.select_claim_windows(rank_windows, rank_mentions, limit=1)
assert selected[0][0] == 2
assert [item[0] for item in extract.select_claim_windows(rank_windows, rank_mentions)] == [1, 2, 3]

reporting_relation_windows = [
    {"text": "Accounts discussed the claim.", "candidates": [{"tmp_id": "m2"}, {"tmp_id": "m5"}]},
    {"text": "We believe accounts can be connected to Taiwan.",
     "candidates": [{"tmp_id": "m2"}, {"tmp_id": "m4"}]},
]
assert extract.select_claim_windows(reporting_relation_windows, rank_mentions, limit=1)[0][0] == 2
print("claim windows：通過（exact 句窗＋局部候選＋relation-rich 穩定排序）")
