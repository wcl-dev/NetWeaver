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
| qwen2.5:7b／v4 adaptive few-shot＋chunks | 7 | **0.23** | **0.26** | **0.01** | 0.00 | **1.00** | 目前最佳；7/7 完成，主要瓶頸為 assertion 端點／述詞 |

qwen v4 分篇 strict edge F1：doc03 = 0.10，其餘 = 0。長文已能以 chunk 完成（doc01 157.3s、doc03 199.2s、doc07 289.8s），但 chunk 間關係仍未做 document-level linking。

## 下一個實驗

1. 把 assertion 拆成兩階段：先抽 grounded mentions，再只允許從已抽 mention tmp_id 間選邊。
2. assertion prompt 加「predicate 必須可用 Python `predicate in quote` 驗證」的反例，禁止輸出關係標籤。
3. 對 chunk overlap、跨 chunk entity merge 與 document-level linking 加獨立評測。
4. v4 dev 調整穩定後才建立 20–30 篇 locked test set；不得拿 dev prompt gains 當泛化結論。
