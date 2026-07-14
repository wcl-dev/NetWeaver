# 抽取品質評測

## 決策指標

依 [GOLD.md](GOLD.md)，主指標是逐篇 macro、grounding 後的 strict assertion edge F1；同時看 mention F1、entity recall、predicate exact、JSON 合規與延遲。模型 raw prediction 與執行 metadata 存在 `pipeline/eval_runs/`（不進 Git）。

## 重跑

```bash
# scorer 自測
python3 pipeline/eval_extract.py

# 真實模型；可中斷續跑，預設 2400 字 chunk＋240 字 overlap
# eval 預設將逐 request 成功 JSON 快取至 ignored 的 eval_runs/.request_cache
NW_LLM_MODEL=qwen2.5:7b NW_LLM_TIMEOUT=180 \
  python3 pipeline/eval_model.py

# 驗證 cold run／不將 report text 落入 request cache
NW_LLM_MODEL=qwen2.5:7b python3 pipeline/eval_model.py --no-request-cache
```

`eval_model.py` 依模型與 `PROMPT_VERSION` 隔離輸出；單篇錯誤會寫空 prediction（scorer 計 `json_ok=false`）與 `.error.txt`，不會中止整批。每篇 `.meta.json` 記錄模型、prompt、chunk 設定、耗時、logical LLM calls、cache hits/misses 與 partial-error 狀態。快取 key 含 provider、base URL、model、credential fingerprint、messages 與 forced schema；任一 request 內容改變即 miss，只寫成功解析的 JSON。模型 alias／server revision 變更時應更新 `NW_LLM_CACHE_SALT`。快取含 report text，敏感資料應用 `--no-request-cache`。

## 2026-07-14 dev baseline

| 模型／prompt | 範圍 | mention macro-F1 | entity-R | strict edge macro-F1 | predicate exact | JSON 合規 | 結論 |
|---|---:|---:|---:|---:|---:|---:|---|
| gemma4:12b-it-qat／v2 前 | 部分 | doc01 0.22 | doc01 0.42 | doc01 0.19 | doc01 0.50 | 後兩篇空回應 | forced-schema 路徑不穩，未續跑 |
| Llama-Breeze2-8B／v1 | 7 | 0.01 | 0.01 | 0.00 | N/A | 0.71 | 快但大量未逐字 grounding，2 篇 timeout |
| qwen2.5:7b／v4 adaptive few-shot＋chunks | 7 | 0.23 | 0.26 | 0.01 | 0.00 | 1.00 | 舊基線；主要瓶頸為 assertion 端點／述詞 |
| qwen2.5:7b／v14 staged passes＋occurrence grounding＋windowwise assertions | 7 | **0.39** | **0.49** | **0.09** | **0.88** | **1.00** | 新基線；edge 顯著改善，但長文延遲高 |

qwen v4 分篇 strict edge F1：doc03 = 0.10，其餘 = 0。qwen v14 分篇 edge F1：doc02 0.06、doc04 0.14、doc05 0.30、doc07 0.11，其餘 0；micro edge F1 = 0.11。v14 的逐字 occurrence 展開消除了 duplicate tmp_id／ambiguity drop，mention pass 與 assertion window 各自 fail-closed；單一 mention pass timeout 會保留其餘成功 pass。

### 延遲實驗

| 版本 | 策略 | 結果 | 決定 |
|---|---|---|---|
| v15 b4 | 4 assertion windows／request | doc02 105.9s，calls 13→6，但 edge F1 0.06→0 | 否決；多窗候選 ID 混用 |
| v16 b2 | 2 assertion windows／request＋window_id | doc02 119.7s，calls 13→8，但 edge F1 仍為 0 | 否決；模型行為仍改變 |
| v17 | mention／單窗 requests 並行 | doc02 prediction byte-identical、136.9→129.4s；doc01 byte-identical 但 324.1→467.0s | 否決預設；長文資源競爭 |
| v18 | 安全句界不 overlap | doc01 chunks 4→3，但 430.1s，mentions 55→31，assertions 2→1 | 否決；chunk context 會影響模型 |
| v19 | 內容雜湊的逐 request 成功 JSON 快取 | doc02 cold 13 misses；warm 13/13 hits、0.005s，prediction 與 v14 byte-identical | 採用於 eval rerun；cold latency 仍待解 |

## 下一個實驗

v5–v14 已把 assertion 拆成多階段：actor／entity／narrative mentions 分別抽取並 exact-ground，合併後以動態 tmp_id enum 抽 assertion；assertion 只看 compact exact claim windows，predicate 仍須通過 `predicate in quote`。v19 不改模型輸入或抽取語意，只對完全相同的 request 做決定性快取。離線回歸已覆蓋端點 enum、partial failure、claim window、chunk namespace／dedupe、dangling 防護與 cache hit/miss。

目前完整基線重跑：

```bash
NW_LLM_MODEL=qwen2.5:7b NW_LLM_TIMEOUT=180 \
  python3 pipeline/eval_model.py
```

後續仍須：

1. 降低 cold-run windowwise assertion 成本／長文延遲；已知 naive batching、本機並行、去 overlap 都會傷品質或吞吐。
2. 對 chunk overlap、跨 chunk entity merge 與 document-level linking 加評測。
3. 改善 coarse type（v14 typed mention F1 僅 0.21）與尚未命中的 doc01/doc03/doc06。
4. dev 調整穩定後建立 20–30 篇 locked test set；不得拿 dev prompt gains 當泛化結論。
