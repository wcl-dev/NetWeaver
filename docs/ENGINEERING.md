# NetWeaver 工程指引（ENGINEERING）

> 給要動這份程式碼的人。從模組邊界、資料流、到不變量講清楚「為什麼這樣寫」。
> 產品面與免責見根 [README.md](../README.md)；設計決策與路線見 [ARCHITECTURE.md](ARCHITECTURE.md)；
> 對外交接敘事見 [HANDOVER.html](HANDOVER.html)；資料模型見 [SCHEMA.md](SCHEMA.md)；
> 中介格式規格見 [STIX-PROFILE.md](STIX-PROFILE.md)。

---

## 0. 一句話架構

一條**單向管線**把「一份報告的原文」變成「合法 STIX 2.1 bundle」，再投影成前端吃的 `data/db.js`。
每一段的職責是**硬邊界**：LLM 只在 extract 那一段、且只做逐字抽取；其餘全是可測試的純函式。
三條紅線（span-check、名冊閘、歸因人工核可）都實作成**不變量**，不是慣例。

核心心法一句話：**模型抽取、碼判斷、人決定。** 換模型不該改變任何判斷；判斷改了必須附測試。

---

## 1. 資料流與模組邊界

一篇文件的生命週期，主幹在 `pipeline/run_loop.py:244`：

```
ingest → filter → ex.extract() → pipe.stix_from_extraction() → pipe.validate() → pipe.project() → write_bundle() + queue
(抓存證) (詞表閘)  (LLM，唯一)     (derive 碼判斷 → STIX-lite → serialize)  (不變量)   (呈現層擴張＋宣稱閘)  (STIX檔＋策展佇列)
```

發布是**另一條**、由人觸發的路徑：`curate.py`（審核佇列 → upsert 進 db.js）。

| 模組 | 行數 | 職責 | 可否碰模型 |
|---|---|---|---|
| `pipeline/ingest.py` | 169 | 抓 URL、存快照、`textextract` 抽正文、fail-closed 落地 manifest | 否 |
| `pipeline/filter.py` | 134 | 詞表相關性閘（版本化 policy table，改動須附 golden） | 否 |
| `pipeline/extract.py` | 991 | **對 LLM 的所有交涉**：兩階段抽取、schema 強制、span-check、快取、重試、budget | **是（唯一）** |
| `pipeline/derive.py` | 157 | **所有判斷**：述詞→關係、信心、歸因方向、category→kind。純函式、無 I/O | 否 |
| `pipeline/pipeline.py` | 258 | `serialize`／`validate`／`project`／`stix_from_extraction` | 否 |
| `pipeline/claim_judge.py` | 106 | 宣稱**可讀性**的語意裁決（碼判不準時）。第二個、唯一另一個模型用途 | 是（僅呈現層） |
| `pipeline/curate.py` | 464 | 策展狀態機：approve/reject/defer/compile/auto/judge；upsert 進 db.js | 否 |
| `pipeline/register.py` | 536 | 名冊那一側：roster、忽略清單、簡繁對應、add-actor/alias/relation | 否 |
| `pipeline/export_stix.py` | 171 | 整本 db.js → 單一 STIX bundle | 否 |
| `pipeline/urlnorm.py` | 52 | URL 正規化比對鍵（去追蹤參數）——來源去重的權威 | 否 |
| `index.html` | 單檔 | 前端 app（渲染、名稱比對、force graph）；讀 db.js | 否 |

---

## 2. 資料模型：單一真相 + 三個策展來源

- **`data/db.js`** — **唯一真相**。一個 `window.NETWEAVER_DB = {entities, events, sources, narratives, meta}` 的 JS 賦值，前端與管線都直接讀寫。**沒有資料庫**，就是一個檔案。schema 見 [SCHEMA.md](SCHEMA.md)。
- **`data/registry.yaml`** — 人工核可的**來源 allowlist**（信任落點）。tier A（一級：政府/平台/主力研究）/ B（佐證）/ C（對手方原始素材，僅存證）；mode = feed/manual/special。
- **`pipeline/feeds.json`** — 有 RSS 的來源子集（機器可讀的抓取設定），對應 registry 的一部分。
- **`data/roster_ignore.json`** — 「這個名字不是行為者」的忽略清單（平台、政黨、標的人物）。**刻意不進 db.js**——它是策展工具的狀態，不是記錄簿內容。
- **`data/claim_verdicts.json`** — 宣稱可讀性的語意裁決（見 §6），可人工覆寫。

`entity` 核心欄位：`id`（kebab-case）、`category`（8 種，決定 STIX 型別）、`role`（attacker/collaborator/amplifier）、`origin`（PRC/TW/HK/other）、`claims[]`（`{text, source_id, about}`）、`related[]`（`{target_id, relation, note}`）、`sensitivity`（選填 `domestic-named` ＝紅線）。

8 種 category：`state-organ`｜`tech-vendor`｜`pr-firm`｜`content-farm`｜`cib-network`｜`state-media`｜`domestic-amplifier`｜`commentator`。

---

## 3. Extract：LLM 的契約與 fail-closed 閘

`extract(report_meta, text)` 在 `extract.py:949`。這是**唯一**讓 LLM 做主的地方。

1. **兩階段抽取**。先 mentions pass（抽名字＋粗類型 `coarse_type`），再對切窗文本跑 assertions pass（抽「主詞—述詞—受詞」三元組）。OpenAI-compatible endpoint，`response_format: json_schema` 強制結構化輸出（`extract.py:288`）。
2. **span-check（紅線一，fail-closed）** — `span_check(raw, text)`：模型回的每個 `quote` **必須是原文的精確子字串**，對不上就整筆丟進 `dropped`。擋掉幻覺。
3. **成本控制** — `NW_LLM_CACHE_DIR` 開啟後，request 按內容雜湊快取（`extract.py:525`）；`ExtractionRun` 記 cold-call 數與 token；`--doc-timeout`／`--max-cold-calls`／`--max-assertion-windows` 壓 fan-out。快取命中＝0 token，重跑免費。
4. **輸出**：`({report, mentions, assertions}, dropped)`。模型到此為止——**不分類、不判關係、不決定歸因**。

> provider-agnostic：`NW_LLM_PROVIDER`（`ollama` 地端 / `openai` 相容）＋ `NW_LLM_BASE_URL` ＋ `NW_LLM_MODEL` 切換。完整變數表見 [pipeline/README.md](../pipeline/README.md)。

---

## 4. Derive：所有判斷、且與模型無關

`derive(extr, reg)` 在 `derive.py:61`。這層是「碼判斷」的全部。

- **述詞階梯 `LADDER`**（`derive.py:9`）— 一組 regex，把逐字述詞映到關係型別，取「最弱一致」。
  - **主動與被動方向相反**（曾是 bug）：`operated by`（被動）→ `operated-by`，控制方是 target；`運用`（主動）→ `runs`，控制方是 source。同桶會讓中文歸因整個反過來。
- **信心評分** — `conf = TIER(來源型別) + 1 − (有 hedge 詞 ? 1 : 0)`，`≥4 → high`、`≥2 → medium`、否則 `low`。
  - `TIER`：gov-report/platform-report/academic = 3、ngo-report = 2、news = 1。
  - `HEDGE = [疑似, 可能, 研判, 評估, likely, alleged, appears, suspected…]` 降一級。
- **歸因（紅線三）** — 只有 `CONTROL = {operated-by, runs}` 且信心 ≥medium 才建 `attributed-to`，方向依語態決定，控制方升 `threat-actor`。其餘一律停在 IMS，不升級。端點必須是「叫得出名字的行為者」——地點（只有 country）或指向不存在 tmp_id 的一端，一律降為 related-to。
- **category → STIX kind 覆蓋** — 已登錄實體用**人的 category**（`CATEGORY_KIND`, `derive.py:35`）決定 STIX 型別，不用模型每次猜的 coarse_type。這是為了 **id 穩定**（見 §5）。

> **核心保證**：換模型，derive 的輸出不變——它只吃模型的 verbatim span，判斷全在這層規則，每條規則有 golden test。

---

## 5. serialize → validate → project

- **`serialize(lite, attribution_approved=None)`**（`pipeline.py:37`）— STIX-lite → 合法 STIX 2.1。
  - id 走 `sid(typ, key) = f"{typ}--{uuid5(NS, typ+':'+key)}"`（`pipeline.py:30`），**決定性**：同一名字永遠同 id，跨「逐篇」與「整本」兩種 bundle 不產生分身。這是下游合併（OpenCTI）不重複的前提。
  - `attributed-to` 蓋 `x_netweaver_review` 狀態章：預設 `pending-human-approval`，`compile --yes` 通過後重寫成 `approved` ＋日期。未核可的歸因即使流出去也帶著狀態。
- **`validate(bundle, require_evidence=True)`**（`pipeline.py:112`）— profile 不變量：id 必須 UUIDv5、SRO 無懸空 ref、抽取物件必須掛 evidence（grounding）。回傳 `(fails, attributed_to_list)`。
- **`project(bundle, text)`**（`pipeline.py:154`）— STIX → operator 三層視圖，**只在呈現層**：`snap_quote` 把模型的子句沿句界擴張成完整句、宣稱閘濾非宣稱、`_claim_about` 決定 claim 掛誰。
  - 刻意排在 derive **之後**，才不會讓句子擴張回頭改動 hedge 判斷 → 信心 → 歸因。

---

## 6. 宣稱閘：三分 + 語意裁決

判準是「這段文字有沒有說出關於某行為者的事」，**不是**「它文法完整嗎」。語法 proxy 兩邊都會判錯。

`claim_verdict(span)`（`extract.py:780`）回傳 `reject / accept / review`：

- **reject**（碼百分百確定不是宣稱）：句首接續標點、去標點後 <8 字、引號未配對、以 `？`/`：` 收尾。
- **accept**：句首正常、句尾有終止符。
- **review**（碼判不準）：無終止符、或英文小寫開頭——可能是斷句，也可能是「龍橋為公安部僱用的網路水軍」這種無句號但完整的陳述。

review 丟給 `claim_judge.judge()`（`claim_judge.py:83`）——**第二個、也是唯一另一個模型用途**：

- 只判「這段文字能不能獨立讀懂它在說關於 X 的什麼事」，schema 就 `{readable, reason}`。
- **不碰**分類/關係/信心/歸因。
- 裁決連理由、模型、日期寫進 `data/claim_verdicts.json`（可人工覆寫，稽核用）。
- `project()` 只**讀**裁決檔、**不打網路**（它會被測試與離線流程大量呼叫）；補判走 `curate.py judge`。
- 未裁決預設**保留**——寧留可疑，不靜靜刪有效的。

實測：某次全庫約 800 條宣稱中，逾九成由碼直接定案，只有少數邊界案例送模型。

---

## 7. Curation：狀態機 + digest 鎖 + source-scoped upsert

佇列 `pipeline/extractions/curation_queue.json`，狀態 `pending → approved / rejected / deferred → compiled`。

- **`publication_digest(extr, claims)`**（`run_loop.py:167`）— 鎖住「已核可的內容」。重抽後 digest 變了 → 核可作廢、重審；沒變 → 沿用決定。防 TOCTOU。
- **`auto` 的四道閘**（`curate.py` `auto_gate`）：`valid` / 無 `attributed-to` / 出版方已核可 / 掛得上名冊且非 `domestic-named`。全過才自動發布。
- **`compile` 的 upsert 以 source_id 為單位**：同來源舊 claims 整批清掉再寫入，其他來源與人工 claims 原樣保留。不做 partial（任一 claim 來源未策展 → 整篇跳過）。→ **發布可逆、以來源為粒度**。
- **歸因出口**：`compile --yes` 通過後 `apply_attributions()` 把核可的 `attributed-to` 寫進 source 實體的 `related`（附來源機構＋核可日期），並重寫 bundle 蓋 `approved` 章。端點用 `_resolve_actor()` 解析：精確比對優先，片語型 surface（`the company named "WUBIANJIE" [無邊界公司]`）取括號片段，全部命中須指向同一實體，歧義寧可 held。

---

## 8. 名冊那一側（register.py）

名冊是**自動發布模式下唯一的人工閘**（紅線二）：模型只能在已登錄實體上填內容。

- **`roster`** — 掃佇列彙總「未登錄的行為者候選」，分三組（管道/機構/人名）依出現篇數排序，limit 按組計。
- **`tracked_publishers()`** — 觀察者集合 = feeds.json ＋ registry tier **A/B**（刻意排除 tier C，否則環球時報這種「既是行為者又是佐證來源」的會永遠進不了名冊）。
- **`st-suggest`** — 簡繁對應。`fold_st()` 用保守 1:1 字表把簡體折成正體再比對；**刻意不放進 `norm()`**（那是 derive 查名冊的比對鍵，`后→後` 會毀「皇后」）。只產生建議，人核可後 `--apply` 才寫別名。
- **`strict_match`** — 短又通用的名（官媒粉專「知行」）標記後，前端比對要求前後非 CJK，否則「知行合一」誤中。
- **`add-relation`** — 人工登錄實體間關係，詞彙限六種（linked-to/affiliated-with/supplies-tech-to/runs/operated-by/subsidiary-of），`attributed-to` **不在其中**（那只能走歸因核可）。
- **`add-actor` / `add-alias`** — 登錄新實體 / 補既有實體的別名。中英同名（品牌無中文名）是合法的；別名之間重複才擋。

---

## 9. 前端（index.html，單檔、無 build）

- 動態載入 `data/db.js?t=<timestamp>` **破快取**——`http.server` 只送 Last-Modified，瀏覽器啟發式快取會顯示舊資料（發布後畫面對不上，最難查）。載不到就顯示錯誤，不靜靜渲染空記錄簿。
- `nameIndex()/nameHits()` — CJK 子字串、純 ASCII 詞界（`TAO` 不誤中 `TAOYUAN`）、`strict_match` 前後非 CJK。結果快取。
- `claimKind()` — regex 分類 claim 的敘述角色（引為消息來源/列為網絡成員/描述其行為/研究說明）。
- 引文共現、force graph 都在這檔算。**共同被提及 ≠ 有關係**：圖說與檔案頁都明講。

---

## 10. STIX 匯出（export_stix.py）

整本 db.js → 單一 bundle。

- id 走**同一個 `pipe.sid`**（逐篇與整本 id parity）。
- 關係型別**通透**：`runs / operated-by / subsidiary-of / attributed-to` 各自保留語意，不壓成泛用邊。（曾因讀錯 `target_id` 導致人工關係整批靜默丟失。）
- `_uncited()` 檢查每個物件都被某 report 引用（骨幹的 grounding ＝被引用，不是逐字引文）。
- `attributed-to` **只能來自 db**（即人工核可），匯出不自行建立。

---

## 11. 不變量與紅線（總表）

這些是專案的憲法。碰到判斷邏輯要改，先確認沒有踩到，且**改動必附 golden test**。

| 紅線 | 實作位置 | 保護什麼 |
|---|---|---|
| **span-check** | `extract.py` `span_check` | 模型講不出原文出處的 → 一律丟。擋幻覺。 |
| **名冊閘** | `pipeline.py` `project` 宣稱閘 ＋ curate `auto_gate` | 沒登錄的名字不出現。約 60% 模型產出在此丟棄。 |
| **歸因人工核可** | derive 只建候選；curate `compile --yes` 才落地 | `attributed-to` 是最強主張，永不自動發布。 |
| **模型無關** | derive 只吃 verbatim span | 換模型不改判斷。 |
| **id 決定性** | `pipeline.py` `sid` | 同實體跨 bundle 同 id，下游不產生分身。 |
| **domestic-named 從嚴** | `sensitivity` 欄位 ＋ auto_gate | 在地具名個人/媒體一律人工。 |
| **發布可逆** | curate source-scoped upsert | 撤下/重編一個來源不影響其他來源。 |

---

## 12. 測試紀律

30 個 `pipeline/test_*.py`，**每條紅線都鎖成回歸測試**：

- `test_extract_span` — span-check fail-closed
- `test_derive_redline` — 放大/呼應不歸因、不升 threat-actor
- `test_derive_attribution_direction` — 主動/被動歸因方向
- `test_derive_attribution_endpoints` — 端點必須具名
- `test_attribution_publish` — 歸因出口與狀態章
- `test_claim_gate_start` / `test_claim_snap` — 宣稱閘三分
- `test_register_st` / `test_strict_match` — 簡繁只提建議、短名保護
- `test_export_stix` — 型別通透、id parity、grounding

一鍵跑：

```bash
for f in pipeline/test_*.py; do python3 "$f" >/dev/null 2>&1 && echo "✅ $(basename $f)" || echo "❌ $(basename $f)"; done
```

---

## 13. Quickstart

**看記錄簿**（no-store 本機伺服器，避免瀏覽器快取舊 db.js）：

```bash
python3 serve.py 8062      # 開 http://localhost:8062/index.html
```

**跑生產迴圈**（抽取 → 佇列）。金鑰是團隊共用、額度有限——跑真實用量前先估算並取得授權：

```bash
NW_LLM_PROVIDER=openai \
NW_LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai \
NW_LLM_MODEL=gemini-3.7-flash \
NW_LLM_OUTPUT_MODE=json \
NW_LLM_TIMEOUT=180 \
NW_LLM_CACHE_DIR=pipeline/.request_cache \
NW_LLM_API_KEY="$(security find-generic-password -a netweaver -s gemini-api-key -w)" \
  python3 pipeline/run_loop.py --no-ingest --doc-timeout 600 --max-assertion-windows 12 --match <raw_id>
```

**審核與發布**：

```bash
python3 pipeline/register.py roster              # 看未登錄的行為者候選
python3 pipeline/register.py add-actor --id ... # 登錄（詳見 register.py -h）
python3 pipeline/curate.py auto --dry-run       # 看哪些能自動發布
python3 pipeline/curate.py auto                 # 執行自動發布
python3 pipeline/curate.py approve <raw_id>     # 人工核可一篇
python3 pipeline/curate.py compile <raw_id>          # 發布（含歸因要加 --yes）
python3 pipeline/curate.py judge                # 補判碼判不準的宣稱可讀性
python3 pipeline/export_stix.py                 # 整本匯出 STIX bundle
```

`run_loop.py`：`--no-ingest`（只處理現有 raw/）｜`--dry-run`（不呼叫 LLM）｜`--limit N`｜`--match <raw_id>`（可重複）｜`--doc-timeout`／`--max-cold-calls`／`--max-assertion-windows`（壓 fan-out）。

---

## 14. 文件地圖

| 想知道 | 看這份 |
|---|---|
| 產品是什麼、免責、怎麼看 | 根 [README.md](../README.md) |
| **程式怎麼運作（本檔）** | `docs/ENGINEERING.md` |
| 設計決策、路線、已定案摘要 | [ARCHITECTURE.md](ARCHITECTURE.md) |
| 資料模型欄位 | [SCHEMA.md](SCHEMA.md) |
| STIX 中介格式規格（抽取的靶） | [STIX-PROFILE.md](STIX-PROFILE.md) |
| 抽取品質評測方法與基線 | [EVAL.md](EVAL.md) ／ gold 契約 [GOLD.md](GOLD.md) |
| 管線指令參考、provider 切換 | [pipeline/README.md](../pipeline/README.md) |
| 對外交接敘事（人機分工） | [HANDOVER.html](HANDOVER.html) |
| production 化待辦 | [LOOP_BACKLOG.md](LOOP_BACKLOG.md) |
