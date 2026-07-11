#!/usr/bin/env python3
"""golden 回歸測試：改 filter 規則/清單須讓這些案例全過（policy table 的驗收）。
用法：python3 pipeline/test_filter.py（exit 0＝全過）
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import importlib
F = importlib.import_module("filter")

CASES = [
    # (說明, 標題＋摘要, 期望 relevant)
    ("英文 fimi+china", "Coordinated inauthentic Facebook accounts linked to China spread disinformation before Taiwan election", True),
    ("強名英文 Borderless", "Assessing the Borderless Group's influence activity targeting Taiwan", True),
    ("勒索軟體·非FIMI", "Latvian forestry company still restoring systems after ransomware attack", False),
    ("NSA TAO·資安非FIMI", "NSA revives Tailored Access Operations name for its cyber espionage unit", False),
    ("中文強名 name_zh·玉淵譚天", "玉淵譚天再推涉台影片 分析指為協同操作", True),
    ("虎牙遊戲誘餌（歧義短名）", "虎牙直播上線新版本 遊戲主播湧入平台", False),
    ("公安部·防自我佐證", "公安部召開記者會說明社會治安情況", False),
    ("弱名+佐證·無界+假帳號", "無界集團經營假帳號網絡鎖定台灣選舉", True),
    ("州媒常名·環球時報 op-ed（需佐證）", "环球時报發表社論 批评美国贸易政策", False),
    ("州媒+FIMI", "央視玉淵譚天被控散布假訊息進行認知作戰", True),
    ("簡體 generic·fimi+china", "中共透过网军协同散布假讯息干预台湾选举", True),
]

def run():
    M = F.load()
    bad = []
    for desc, text, exp in CASES:
        rel, reason, _ = F.decide(text, M)
        ok = (rel == exp)
        print(f"  {'PASS' if ok else 'FAIL'}  期望{'相關' if exp else '略過'}／得{'相關' if rel else '略過'}（{reason}）  {desc}")
        if not ok: bad.append(desc)
    print(f"→ {len(CASES) - len(bad)}/{len(CASES)} 通過。" + ("" if not bad else f"  失敗：{bad}"))
    return 1 if bad else 0

if __name__ == "__main__":
    raise SystemExit(run())
