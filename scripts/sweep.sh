#!/bin/bash
# NetWeaver 每日來源巡查：ingest（抓 feed 來源的新項目）+ filter（標相關性 ready）。
# 刻意只做這兩步——不抽取、不發布、不 commit/push。新文件在本機備妥後，由人用
# Opus session 抽取（見 docs/ENGINEERING.md）。安全：不碰模型、不碰 git、不對外發布。
# 注意：只巡 pipeline/feeds.json 列出的 feed 來源；registry 的 manual/special 來源要人工匯入。
set -u
cd "$(cd "$(dirname "$0")/.." && pwd)" || exit 1   # repo 根（由腳本位置推導，fork 也可用）
# launchd 是極簡環境：補 PATH 讓 textextract 找得到 pdftotext / textutil / python3
# （/opt/homebrew=Apple Silicon、/usr/local=Intel Homebrew）
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
echo "──────── sweep 開始 $(ts) ────────"
rc=0

echo "② ingest（每源上限 5）"
python3 pipeline/ingest.py --limit 5   # 每源本次最多落地 5 筆新項目
ig=$?
[ "$ig" -ne 0 ] && { rc=1; echo "  ✗ ingest 失敗（exit=$ig）"; }

echo "③ filter（相關性篩選、標 ready / filtered-out，不碰模型）"
python3 pipeline/filter.py
fi=$?
[ "$fi" -ne 0 ] && { rc=1; echo "  ✗ filter 失敗（exit=$fi）"; }

if [ "$rc" -eq 0 ]; then
  echo "──────── sweep 成功 $(ts) ────────"
else
  echo "──────── sweep 失敗 $(ts)（見上方 ✗；非零退出，便於事後/監控辨識）────────"
fi
echo
exit "$rc"
