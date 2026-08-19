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

# 單篇最多 10 分鐘；可再限制真正模型 calls（cache hits 不計）
NW_EVAL_DOC_TIMEOUT=600 NW_EVAL_MAX_COLD_CALLS=24 \
  python3 pipeline/eval_model.py --match 03-dtl-golaxy

# 實驗性 fan-out 上限；跨 chunk 分配後優先保留 relation-rich windows
NW_EVAL_MAX_ASSERTION_WINDOWS=12 \
  python3 pipeline/eval_model.py --match 01-dtl-anti-dpp
```

`eval_model.py` 依模型、`PROMPT_VERSION`、output mode 與 thinking 隔離輸出；單篇錯誤會寫空 prediction（scorer 計 `json_ok=false`）與 `.error.txt`，不會中止整批。每篇 `.meta.json` 記錄完整 variant、chunk 設定、耗時、logical LLM calls、cache hits/misses 與 partial-error 狀態。快取 key 含 provider、base URL、model、credential fingerprint、messages、schema、output mode 與 thinking；任一 request 內容改變即 miss，只寫成功解析的 JSON。模型 alias／server revision 變更時應更新 `NW_LLM_CACHE_SALT`。快取含 report text，敏感資料應用 `--no-request-cache`。

v22 起預設單篇 wall-clock budget 為 600 秒；CLI `--doc-timeout`／`--max-cold-calls`（或 `NW_EVAL_DOC_TIMEOUT`／`NW_EVAL_MAX_COLD_CALLS`）可覆寫，`0` 表示停用。每個 request 都即時寫 `.telemetry.json`（stage、耗時、prompt/completion tokens、Ollama load/prompt/generation duration），每個 chunk 完成即寫 `.checkpoint.json`。budget 用完時保留 partial checkpoint、`.meta.json` 標記 `budget-exhausted`，但不產生正式 prediction，也不進 scorer aggregate；重跑會利用 request cache 續向後執行。

v23 加入 `--max-assertion-windows`／`NW_EVAL_MAX_ASSERTION_WINDOWS`。上限是單篇總額，會依剩餘 chunk 公平分配，再用明示關係詞、actor/narrative/place 組合、候選密度及 title/reporting/forensic context 做決定性排序。輸出使用獨立 `-awN` variant，trace/meta 記錄 total／selected／skipped；`0` 表示停用，目前仍是預設，避免 3 篇 dev A/B 被誤當泛化證據。

Gemma v22 真實單-call telemetry smoke（doc02 actor pass）：總耗時 62.1s，prompt 1,126 tokens、completion 789 tokens；Ollama 分解為 load 4.9s、prompt eval 3.1s、generation 54.1s。約 87% 模型時間花在生成長 JSON，確認主要成本不是載入或 prompt ingestion；`max-cold-calls=1` 隨後正確停止並保存 23 mentions checkpoint，未啟動 assertion fan-out、未進 scorer。

## dev baselines（2026-07-14～15）

| 模型／prompt | 範圍 | mention macro-F1 | entity-R | strict edge macro-F1 | predicate exact | JSON 合規 | 結論 |
|---|---:|---:|---:|---:|---:|---:|---|
| gemma4:12b-it-qat／v2 前 | 部分 | doc01 0.22 | doc01 0.42 | doc01 0.19 | doc01 0.50 | 後兩篇空回應 | forced-schema 路徑不穩，未續跑 |
| Llama-Breeze2-8B／v1 | 7 | 0.01 | 0.01 | 0.00 | N/A | 0.71 | 快但大量未逐字 grounding，2 篇 timeout |
| qwen2.5:7b／v4 adaptive few-shot＋chunks | 7 | 0.23 | 0.26 | 0.01 | 0.00 | 1.00 | 舊基線；主要瓶頸為 assertion 端點／述詞 |
| qwen2.5:7b／v14 staged passes＋occurrence grounding＋windowwise assertions | 7 | **0.39** | **0.49** | **0.09** | **0.88** | **1.00** | 新基線；edge 顯著改善，但長文延遲高 |
| gemma4:12b-it-qat／v20 JSON、think=false | 3（01/02/05） | 0.36 | 0.42 | **0.21** | 0.65 | 1.00 | 初步語意較強但三篇皆 partial-error；doc01 被 optional null 大幅傷害 |
| gemma4:12b-it-qat／v21 JSON optional-null normalize | doc01 | 0.29 | **0.75** | **0.15** | **1.00** | 1.00 | null 修復有效；但 526s、precision/type 仍差 |
| gemma4:12b-it-qat／v23 ranked fan-out、aw12 | 7 | **0.41** | **0.81** | **0.17** | 0.82 | **1.00** | 完整 cold baseline；三輪／累計 90.5m，2 篇 partial-error |
| gemma4:12b-it-qat／v24 item-tolerant、aw12 | 7 replay | **0.41** | **0.83** | **0.17** | 0.82 | **1.00** | 合法 v23 cache replay＋只 cold 補 invalid passes；整 pass failure 已隔離 |
| **gemini-3.7-flash**／v24 JSON、aw12 | **1（doc05）** | 0.50 | **0.96** | **0.65** | **1.00** | **1.00** | 雲端首測；15 cold calls／29,926 計費 tokens（思考佔 32%）／55.7s。**僅 1 篇短中文單-chunk 文件，不可外推** |

qwen v4 分篇 strict edge F1：doc03 = 0.10，其餘 = 0。qwen v14 分篇 edge F1：doc02 0.06、doc04 0.14、doc05 0.30、doc07 0.11，其餘 0；micro edge F1 = 0.11。v14 的逐字 occurrence 展開消除了 duplicate tmp_id／ambiguity drop，mention pass 與 assertion window 各自 fail-closed；單一 mention pass timeout 會保留其餘成功 pass。

### 2026-08-19 gemini-3.7-flash 單篇測試（共用額度，僅測試用）

同一篇 dev 文件（`05-nsb-cognitive-2024`：中文、1,644 字、單 chunk）、同一評分器、同 aw12 設定下的對照：

| 模型 | mention F1 | entity-R | strict edge F1 | predicate-exact |
|---|---:|---:|---:|---:|
| gemini-3.7-flash | 0.50 | **0.96** | **0.65** | **1.00** |
| gemma4:12b-it-qat v24 | 0.57 | 0.87 | 0.42 | 0.77 |
| gemma4:12b-it-qat v23 | 0.55 | 0.87 | 0.33 | 0.78 |
| qwen2.5:7b v14 | 0.44 | 0.22 | 0.00 | — |
| Mistral-Small-24B | 0.43 | 0.26 | 0.00 | — |

**edge F1 0.65 是本專案歷來最高**（先前 dev 最佳 0.21、locked test 最佳 0.17），且 grounding 零丟棄、
predicate 逐字全對。mention F1 略低於 gemma 是因為 precision 較低（0.34 vs 0.41）而 recall 較高
（0.97 vs 0.91）——在本管線這個取捨是划算的：多抽出來的名字會被名冊 allowlist 擋掉（實測約 61% 被丟），
但漏掉的實體無法補救。

**這一筆不可外推**：單篇、dev、短的中文單-chunk 文件——正是最容易的形狀。長的多-chunk 英文文件
（doc01／03／07）才是歷來模型退化的地方。locked test 未動（保留留存集）。

**設定發現**：`NW_LLM_THINK` 只作用於 ollama 分支，OpenAI 相容端點的思考控制需經 `NW_LLM_EXTRA_BODY`
傳 `reasoning_effort`（實測有效）。先前 Gemini run 標記的 `think-false` 皆為無效標籤，實際思考一直開著。
`NW_LLM_EXTRA_BODY` 現已納入 request cache key 與 variant 名，否則設定 A/B 會互相命中快取而得出假結論。

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

v23 warm-cache fan-out A/B 固定沿用相同 cached mention/window responses，因此只驗證選窗品質與呼叫數，不是 cold latency 測量：

| 文件 | 完整 windows → selected | assertions | gold edge hits | strict edge F1 | 結果 |
|---|---:|---:|---:|---:|---|
| doc01 | 27 → 12 | 14 → 8 | 2 → 2 | 0.15 → **0.20** | 保住兩個 hits、移除 FP |
| doc02 | 8 → 6 | 13 → 13 | 2 → 2 | 0.10 → **0.10** | 無退化 |
| doc05 | 11 → 6 | 15 → 13 | 10 → 10 | 0.54 → **0.57** | 保住 hits、移除 2 FP |

三篇合計 assertion windows 46 → 24（少 48%），既有 gold hits 全保留；其後的完整 7-doc cold baseline 如下，仍須 locked test 才能決定預設上限。

### v23 完整 7-doc cold baseline

以 fresh `NW_LLM_CACHE_SALT=gemma-v23-cold-20260715`、`doc-timeout=600`、`max-cold-calls=24`、`max-assertion-windows=12` 執行。首次 request 全為 cold；逾時篇以相同 salt 重跑，成功 request cache hit 後只補未完成部分。整批三輪收斂，累計 wall time 約 5,430 秒（90.5 分鐘）：

| 文件 | windows → selected | 累計完成時間 | status | strict edge F1 |
|---|---:|---:|---|---:|
| doc01 | 27 → 12 | 409s | partial-error | 0.20 |
| doc02 | 9 → 9 | 619s／2 輪 | ok | 0.12 |
| doc03 | 42 → 12 | 1,208s／3 輪 | window-limited | 0.22 |
| doc04 | 16 → 12 | 569s | window-limited | 0.19 |
| doc05 | 12 → 12 | 598s | ok | 0.29 |
| doc06 | 18 → 10 | 408s | window-limited | 0.12 |
| doc07 | 36 → 12 | 1,620s／3 輪 | partial-error | 0.07 |

最終 macro mention F1 0.41、entity recall 0.81、strict edge F1 0.17、predicate exact 0.82、JSON 合規 1.00。相較 qwen v14，edge F1 0.09 → 0.17、entity recall 0.49 → 0.81，但 predicate exact 0.88 → 0.82，且 latency 遠高於可直接對標 production 的程度。doc05 fresh cold response 產生 26 assertions、edge F1 0.29，明顯不同於舊 cache 的 13 assertions／0.57，顯示單次 dev A/B 仍受模型輸出變異影響。

可恢復執行解決了「10 分鐘後整篇白跑」：doc02 第 2 輪只補 1 個 request（18.6s），doc03 第 3 輪也只補 1 個 request（8.1s）。但 invalid response 不進 cache；doc07 chunk 3 actor pass 兩輪都穩定產生同一個缺 `surface`／多 `source` 的壞 item，各浪費約 2 分鐘。另見 doc01 的 `platform` enum、doc07 的 `country` enum。下一個最高優先不是再調 window cap，而是讓 mention array 能逐 item 驗證：保留合法 items、精確記錄並丟棄非法 items，仍維持 required／unknown／enum fail-closed 的 item 級契約。

### v24 mention item 隔離

v24 已實作上述修正。JSON parse、top-level required／additional properties、`mentions` 必須為 array 等外層契約仍整份 fail-closed；只有 array 內的 mention objects 個別驗證。單一 item 的 required／unknown field／enum／type 錯誤會把該 item 丟棄並寫入 trace、telemetry、meta `partial_errors`，其餘合法 items 繼續 grounding。assertion response 維持整窗 strict schema，未放寬端點或 predicate 契約。

request cache key 會區分 item policy；舊 cache 只有整份 strict validation 成功才會寫入，因此 v24 可安全 fallback 重用。含 item drops 的新 cache entry 另存 diagnostics envelope，cache hit 仍會重現 `partial-error`，不會把降級結果偽裝成 clean run。

真實 doc07 smoke 重現兩個原 failure：chunk 3 actor 現在 `drop 1` 並保留 19 grounded mentions；chunk 4 narrative 同樣 `drop 1` 並保留 9。完整 7-doc cache-backed replay 只 cold 補先前 invalid passes：macro mention F1 0.41 持平、entity recall 0.81 → 0.83、strict edge F1 0.17 持平、predicate exact 0.82 持平。分篇變化：doc01 mention F1 0.29 → 0.32、entity recall 0.75 → 0.92、edge 0.20 持平；doc07 mention F1 0.27 → 0.25、entity recall 0.93 持平、edge 0.07 → 0.08。可靠性改善且總體主指標無退化，但多保留的合法 mentions 仍會暴露既有 over-extraction，不能把 replay 當新的 cold latency baseline。

結論：Gemma 4 12B QAT 是比 qwen 更值得保留的**語意 proxy**，但目前不是 prod Gemini Flash 的效能 proxy，也還不能設為 pipeline 預設。完整 7-doc baseline 證明 edge 品質高於 qwen v14；v24 也已隔離 item-level schema failure，但 12B 本機 latency 與 over-extraction 仍不適合 production。下一輪應用同一 gold 跑 prod Gemini Flash；不能以 Ollama latency 外推 production。

## 下一個實驗

v5–v14 已把 assertion 拆成多階段：actor／entity／narrative mentions 分別抽取並 exact-ground，合併後以動態 tmp_id enum 抽 assertion；assertion 只看 compact exact claim windows，predicate 仍須通過 `predicate in quote`。v19 對完全相同的 request 做決定性快取；v20–v21 補 output mode／thinking 控制、回應 schema validator 與窄幅 optional-null 正規化；v22 加入 request telemetry、文件 budget 與 chunk checkpoint；v23 加入跨 chunk 配額與 relation-rich window 排序；v24 將 mention response 改為 outer strict、invalid item 隔離。離線回歸已覆蓋端點 enum、partial failure、claim window、chunk namespace／dedupe、dangling 防護、schema/json body、thinking、cold-only budget、window quota、item diagnostics 與 cache 隔離。

目前 Gemma 完整基線重跑（`NW_LLM_CACHE_SALT` 應換成新的 server revision／run id）：

```bash
NW_LLM_MODEL=gemma4:12b-it-qat NW_LLM_OUTPUT_MODE=json NW_LLM_THINK=false \
NW_LLM_CACHE_SALT=gemma-v24-cold-YYYYMMDD \
  python3 pipeline/eval_model.py --doc-timeout 600 --max-cold-calls 24 \
    --max-assertion-windows 12
```

後續仍須：

1. 用 prod Gemini Flash 跑同一份 7-doc gold，對比品質、request/token latency 與 schema item drops；模型／版本必須明確記錄，不以「Flash」泛稱。
2. 對 chunk overlap、跨 chunk entity merge 與 document-level linking 加評測。
3. 改善 coarse type（v14 typed mention F1 僅 0.21）與尚未命中的 doc01/doc03/doc06。
4. dev 調整穩定後建立 20–30 篇 locked test set；不得拿 dev prompt gains 當泛化結論。
5. 對 doc05 等高變異文件做至少 3 次 fresh-salt cold repetition，報告分數／輸出量分布，不以單次 temperature=0 結果冒充決定性。
