#!/bin/bash
# NetWeaver 每日來源巡查：ingest（抓 feed 來源的新項目）+ filter（標相關性 ready）。
# 刻意只做這兩步——不抽取、不發布、不 commit/push。新文件在本機備妥後，由人用
# Opus session 抽取（見 docs/ENGINEERING.md）。安全：不碰模型、不碰 git、不對外發布。
# 注意：只巡 pipeline/feeds.json 列出的 feed 來源；registry 的 manual/special 來源要人工匯入。
# 跑完發一則 macOS 通知（有新 ready 才發／失敗才發；用系統內建 osascript，不裝第三方工具）。
set -u
cd "$(cd "$(dirname "$0")/.." && pwd)" || exit 1   # repo 根（由腳本位置推導，fork 也可用）
# launchd 是極簡環境：補 PATH 讓 textextract 找得到 pdftotext / textutil / python3
# （/opt/homebrew=Apple Silicon、/usr/local=Intel Homebrew）
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

ts() { date '+%Y-%m-%d %H:%M:%S'; }

# 掃 manifest 數「待抽取（extraction_status=ready）」的篇數——權威來源，不靠 stdout
count_ready() {
  python3 - <<'PY' 2>/dev/null || echo 0
import pathlib, json
n = 0
for p in pathlib.Path("pipeline/raw").glob("*/*.json"):
    try:
        if json.loads(p.read_text(encoding="utf-8")).get("extraction_status") == "ready":
            n += 1
    except Exception:
        pass
print(n)
PY
}

# 發 macOS 桌面通知（失敗不影響 sweep；launchd 下偶爾受通知權限影響）
notify() { osascript -e "display notification \"$2\" with title \"NetWeaver\" subtitle \"$1\"" >/dev/null 2>&1 || true; }

echo "──────── sweep 開始 $(ts) ────────"
rc=0
ready_before=$(count_ready)

echo "② ingest（每源上限 5）"
python3 pipeline/ingest.py --limit 5   # 每源本次最多落地 5 筆新項目
ig=$?
[ "$ig" -ne 0 ] && { rc=1; echo "  ✗ ingest 失敗（exit=$ig）"; }

echo "③ filter（相關性篩選、標 ready / filtered-out，不碰模型）"
python3 pipeline/filter.py
fi=$?
[ "$fi" -ne 0 ] && { rc=1; echo "  ✗ filter 失敗（exit=$fi）"; }

ready_after=$(count_ready)
new=$(( ready_after - ready_before ))
[ "$new" -lt 0 ] && new=0          # 保險：抽取可能在兩次掃之間消化掉 ready

if [ "$rc" -eq 0 ]; then
  echo "──────── sweep 成功 $(ts)｜今日新增 ready ${new}，共 ${ready_after} 篇待抽取 ────────"
  [ "$new" -gt 0 ] && notify "今日來源巡查" "新增 ${new} 篇相關文件，共 ${ready_after} 篇待抽取"
else
  echo "──────── sweep 失敗 $(ts)（見上方 ✗；非零退出，便於事後/監控辨識）────────"
  notify "巡查失敗" "見 ~/Library/Logs/netweaver-sweep.log"
fi
echo
exit "$rc"
