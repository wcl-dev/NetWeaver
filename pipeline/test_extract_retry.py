#!/usr/bin/env python3
"""暫時性錯誤的退避：必須聽端點的 Retry-After，否則免費層 429 會把整批評測洗成無效資料。"""
import os, extract
from email.utils import format_datetime
from datetime import datetime, timedelta, timezone

class _Exc:                                                  # 模擬 HTTPError（只需要 .headers）
    def __init__(self, headers): self.headers = headers

# ① 沒有 Retry-After → 指數退避（維持既有行為）
assert extract._retry_delay(_Exc({}), 0) == 1.0
assert extract._retry_delay(_Exc({}), 2) == 4.0
assert extract._retry_delay(_Exc(None), 1) == 2.0            # headers 為 None 也不能炸

# ② delta-seconds 格式 → 照端點要求等（這正是免費層 429 的常見形式）
assert extract._retry_delay(_Exc({"Retry-After": "30"}), 0) == 30.0
assert extract._retry_delay(_Exc({"Retry-After": " 12 "}), 3) == 12.0   # 覆寫指數退避（含比它小的情形）

# ③ HTTP-date 格式 → 換算成秒
future = datetime.now(timezone.utc) + timedelta(seconds=20)
d = extract._retry_delay(_Exc({"Retry-After": format_datetime(future)}), 0)
assert 15 <= d <= 25, d
past = datetime.now(timezone.utc) - timedelta(seconds=60)
assert extract._retry_delay(_Exc({"Retry-After": format_datetime(past)}), 0) == 0.0   # 過去時間 → 立即重試

# ④ 亂值 → 退回指數退避，不得讓一個壞標頭中斷重試
assert extract._retry_delay(_Exc({"Retry-After": "soon"}), 1) == 2.0

# ⑤ 上限：端點給離譜的值不得卡死單篇 budget
assert extract._retry_delay(_Exc({"Retry-After": "99999"}), 0) == 60.0
os.environ["NW_LLM_RETRY_MAX_SLEEP"] = "5"
try:
    assert extract._retry_delay(_Exc({"Retry-After": "99999"}), 0) == 5.0
    assert extract._retry_delay(_Exc({}), 10) == 5.0         # 指數退避同樣受上限約束
finally:
    del os.environ["NW_LLM_RETRY_MAX_SLEEP"]

print("extract retry：通過（Retry-After 秒數／HTTP-date／亂值退回／上限／指數退避）")
