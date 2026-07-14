# 抽取品質評測

## 決策指標

依 [GOLD.md](GOLD.md)，主指標是逐篇 macro、grounding 後的 strict assertion edge F1；同時看 mention F1、entity recall、predicate exact、JSON 合規與延遲。模型 raw prediction 與執行 metadata 存在 `pipeline/eval_runs/`（不進 Git）。

## 重跑

```bash
# scorer 自測
python3 pipeline/eval_extract.py

# 真實模型；可中斷續跑，預設 2400 字 chunk＋240 字 overlap
NW_LLM_MODEL=qwen2.5:7b NW_LLM_TIMEOUT=180 \
  python3 pipeline/eval_model.py
```

`eval_model.py` 依模型與 `PROMPT_VERSION` 隔離輸出；單篇錯誤會寫空 prediction（scorer 計 `json_ok=false`）與 `.error.txt`，不會中止整批。每篇 `.meta.json` 記錄模型、prompt、chunk 設定、耗時與狀態。

## 2026-07-14 dev baseline

| 模型／prompt | 範圍 | mention macro-F1 | entity-R | strict edge macro-F1 | predicate exact | JSON 合規 | 結論 |
|---|---:|---:|---:|---:|---:|---:|---|
| gemma4:12b-it-qat／v2 前 | 部分 | doc01 0.22 | doc01 0.42 | doc01 0.19 | doc01 0.50 | 後兩篇空回應 | forced-schema 路徑不穩，未續跑 |
| Llama-Breeze2-8B／v1 | 7 | 0.01 | 0.01 | 0.00 | N/A | 0.71 | 快但大量未逐字 grounding，2 篇 timeout |
| qwen2.5:7b／v4 adaptive few-shot＋chunks | 7 | 0.23 | 0.26 | 0.01 | 0.00 | 1.00 | 舊基線；主要瓶頸為 assertion 端點／述詞 |
| qwen2.5:7b／v14 staged passes＋occurrence grounding＋windowwise assertions | 7 | **0.39** | **0.49** | **0.09** | **0.88** | **1.00** | 新基線；edge 顯著改善，但長文延遲高 |

qwen v4 分篇 strict edge F1：doc03 = 0.10，其餘 = 0。qwen v14 分篇 edge F1：doc02 0.06、doc04 0.14、doc05 0.30、doc07 0.11，其餘 0；micro edge F1 = 0.11。v14 的逐字 occurrence 展開消除了 duplicate tmp_id／ambiguity drop，mention pass 與 assertion window 各自 fail-closed；單一 mention pass timeout 會保留其餘成功 pass。

## 下一個實驗

v5–v14 已把 assertion 拆成多階段：actor／entity／narrative mentions 分別抽取並 exact-ground，合併後以動態 tmp_id enum 抽 assertion；assertion 只看 compact exact claim windows，predicate 仍須通過 `predicate in quote`。離線回歸已覆蓋端點 enum、partial failure、claim window、chunk namespace／dedupe 與 dangling 防護。

目前完整基線重跑：

```bash
NW_LLM_MODEL=qwen2.5:7b NW_LLM_TIMEOUT=180 \
  python3 pipeline/eval_model.py
```

後續仍須：

1. 降低 windowwise assertion 的請求數／長文延遲，同時守住 predicate exact 與 edge precision。
2. 對 chunk overlap、跨 chunk entity merge 與 document-level linking 加評測。
3. 改善 coarse type（v14 typed mention F1 僅 0.21）與尚未命中的 doc01/doc03/doc06。
4. dev 調整穩定後建立 20–30 篇 locked test set；不得拿 dev prompt gains 當泛化結論。
