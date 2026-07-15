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

# Gemma 4 QAT 相容路徑；--match 可重複指定
NW_LLM_MODEL=gemma4:12b-it-qat NW_LLM_OUTPUT_MODE=json NW_LLM_THINK=false \
  python3 pipeline/eval_model.py --match 01-dtl-anti-dpp --match 05-nsb-cognitive-2024
```

`eval_model.py` 依模型、`PROMPT_VERSION`、output mode 與 thinking 隔離輸出；單篇錯誤會寫空 prediction（scorer 計 `json_ok=false`）與 `.error.txt`，不會中止整批。每篇 `.meta.json` 記錄完整 variant、chunk 設定、耗時、logical LLM calls、cache hits/misses 與 partial-error 狀態。快取 key 含 provider、base URL、model、credential fingerprint、messages、schema、output mode 與 thinking；任一 request 內容改變即 miss，只寫成功解析的 JSON。模型 alias／server revision 變更時應更新 `NW_LLM_CACHE_SALT`。快取含 report text，敏感資料應用 `--no-request-cache`。

## dev baselines（2026-07-14～15）

| 模型／prompt | 範圍 | mention macro-F1 | entity-R | strict edge macro-F1 | predicate exact | JSON 合規 | 結論 |
|---|---:|---:|---:|---:|---:|---:|---|
| gemma4:12b-it-qat／v2 前 | 部分 | doc01 0.22 | doc01 0.42 | doc01 0.19 | doc01 0.50 | 後兩篇空回應 | forced-schema 路徑不穩，未續跑 |
| Llama-Breeze2-8B／v1 | 7 | 0.01 | 0.01 | 0.00 | N/A | 0.71 | 快但大量未逐字 grounding，2 篇 timeout |
| qwen2.5:7b／v4 adaptive few-shot＋chunks | 7 | 0.23 | 0.26 | 0.01 | 0.00 | 1.00 | 舊基線；主要瓶頸為 assertion 端點／述詞 |
| qwen2.5:7b／v14 staged passes＋occurrence grounding＋windowwise assertions | 7 | **0.39** | **0.49** | **0.09** | **0.88** | **1.00** | 新基線；edge 顯著改善，但長文延遲高 |
| gemma4:12b-it-qat／v20 JSON、think=false | 3（01/02/05） | 0.36 | 0.42 | **0.21** | 0.65 | 1.00 | 初步語意較強但三篇皆 partial-error；doc01 被 optional null 大幅傷害 |
| gemma4:12b-it-qat／v21 JSON optional-null normalize | doc01 | 0.29 | **0.75** | **0.15** | **1.00** | 1.00 | null 修復有效；但 526s、precision/type 仍差 |

qwen v4 分篇 strict edge F1：doc03 = 0.10，其餘 = 0。qwen v14 分篇 edge F1：doc02 0.06、doc04 0.14、doc05 0.30、doc07 0.11，其餘 0；micro edge F1 = 0.11。v14 的逐字 occurrence 展開消除了 duplicate tmp_id／ambiguity drop，mention pass 與 assertion window 各自 fail-closed；單一 mention pass timeout 會保留其餘成功 pass。

### 延遲實驗

| 版本 | 策略 | 結果 | 決定 |
|---|---|---|---|
| v15 b4 | 4 assertion windows／request | doc02 105.9s，calls 13→6，但 edge F1 0.06→0 | 否決；多窗候選 ID 混用 |
| v16 b2 | 2 assertion windows／request＋window_id | doc02 119.7s，calls 13→8，但 edge F1 仍為 0 | 否決；模型行為仍改變 |
| v17 | mention／單窗 requests 並行 | doc02 prediction byte-identical、136.9→129.4s；doc01 byte-identical 但 324.1→467.0s | 否決預設；長文資源競爭 |
| v18 | 安全句界不 overlap | doc01 chunks 4→3，但 430.1s，mentions 55→31，assertions 2→1 | 否決；chunk context 會影響模型 |
| v19 | 內容雜湊的逐 request 成功 JSON 快取 | doc02 cold 13 misses；warm 13/13 hits、0.005s，prediction 與 v14 byte-identical | 採用於 eval rerun；cold latency 仍待解 |

### 2026-07-15 Gemma 4 QAT 相容性實驗

Ollama request 現在明確帶 `think:false`。這修復了早期 Gemma forced-schema 路徑的空 `message.content` 問題；`schema` 與 `json` 兩種模式會分開輸出／快取，JSON mode 仍在 prompt 帶完整 schema 並於回應後由 stdlib validator fail-closed。

doc02 A/B：

| 模式 | mention F1 | entity-R | edge F1 | predicate exact | 耗時 | partial error |
|---|---:|---:|---:|---:|---:|---|
| schema＋think=false | 0.47 | 0.28 | 0.06 | 1.00 | 370s | entity pass timeout |
| json＋think=false | **0.50** | **0.35** | **0.10** | 0.50 | **308s** | actor optional-null；narrative shape error |

JSON v20 完成的三篇 smoke 為 doc01／02／05；macro edge F1 0.21、micro edge F1 0.27，但不能視為完整 baseline：doc03 在 10 分鐘安全門檻仍卡於單一 mention response 而中止，三篇完成檔也都有 partial errors。分篇差異很大：doc01 edge F1 0、doc02 0.10、doc05 0.54；doc05 高於 qwen v14 的 0.30，但耗時 493s。

trace 顯示 JSON v20 最常見失敗是 optional `country:null` 使整個 mention pass 不合 schema。v21 只做窄幅、schema-guided 正規化：已知且非 required 的 null 欄位等價省略；required null、未知欄位、錯誤型別／enum 仍拒絕。doc01 因此由 7 mentions／0 assertions 回升至 94／14，edge F1 由 0 升至 0.15；同時暴露 over-extraction（mention precision 0.19、typed F1 0.08）與 39 calls／526s 的 fan-out 成本。

結論：Gemma 4 12B QAT 是比 qwen 更值得保留的**語意 proxy**，但目前不是 prod Gemini Flash 的效能 proxy，也還不能設為 pipeline 預設。下一輪應先限制輸出／候選 fan-out、處理單一 invalid item 不拖垮整個 pass 的診斷策略，再做 7-doc cold baseline；不得把這次 3-doc smoke 當泛化結果。

## 下一個實驗

v5–v14 已把 assertion 拆成多階段：actor／entity／narrative mentions 分別抽取並 exact-ground，合併後以動態 tmp_id enum 抽 assertion；assertion 只看 compact exact claim windows，predicate 仍須通過 `predicate in quote`。v19 對完全相同的 request 做決定性快取；v20–v21 補 output mode／thinking 控制、回應 schema validator 與窄幅 optional-null 正規化。離線回歸已覆蓋端點 enum、partial failure、claim window、chunk namespace／dedupe、dangling 防護、schema/json body、thinking 與 cache 隔離。

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
5. Gemma 路徑先降 assertion fan-out／設定輸出預算，再跑完整 cold baseline；prod Gemini Flash 另做同 gold 的雲端基線，不能以 Ollama latency 外推。
