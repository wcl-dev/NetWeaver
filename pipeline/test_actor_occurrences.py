#!/usr/bin/env python3
"""模型辨識 actor surface 後，碼端展開原文 occurrence 且不注入新名稱。"""
import extract

text = "官媒提到中共，中共放大敘事。背景句。中共批評台灣。"
seed = [{"tmp_id": "same", "surface": "中共", "coarse_type": "org", "quote": "中共放大敘事"}]
out = extract.expand_surface_occurrences(seed, text)
assert len(out) == 3
assert [m["quote"] for m in out] == ["官媒提到中共，", "中共放大敘事。", "中共批評台灣。"]
assert {m["surface"] for m in out} == {"中共"}
print("actor occurrences：通過（已辨識 surface exact 展開、不注入名稱）")
