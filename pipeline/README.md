# NetWeaver 資料管線

把公開 FIMI 報告，經固定中介格式（STIX）穩定地變成 NetWeaver 前端讀的 operator 視圖資料。
核心原則：**模型抽取・碼判斷**——模型只忠實抽取，所有分類/關係/信心/歸因由碼決定，**換模型也穩**。規格見 [../docs/STIX-PROFILE.md](../docs/STIX-PROFILE.md)。

> 這份是**指令參考**。系統級架構（模組邊界、資料流、三條紅線與不變量、測試紀律）看 [../docs/ENGINEERING.md](../docs/ENGINEERING.md)。

## 流程

```
② ingest ─▶ filter(碼) ─▶ ① extract(LLM) ─▶ derive(碼) ─▶ serialize ─▶ validate ─▶ project ─▶ compile→db.js
 RSS/快照    相關性閘        mention＋逐字述詞    判斷層        合法STIX      不變量       operator三層   前端真B
```

- **ingest**（`ingest.py`＋`feeds.json`）：讀 feed → 抓 RSS/Atom → 偵測新項目（cursor）→ 落地不可變快照＋provenance manifest 到 `raw/`（`extraction_status=pending`）。**落地即抽正文**存 `<hash>.txt` 側車（`textextract`：readability HTML／pdftotext PDF）。非 RSS 來源用 `--url --source-id`（registry `mode: manual`，status=ready）——支援 PDF（magic bytes 偵測）與需登入外的一次性報告。
- **filter**（`filter.py`）：抽取前的**碼**相關性閘。主政策比對 feed 標題＋摘要：`強名命中 OR (弱名命中 AND 佐證詞) OR (FIMI詞 AND 中國詞)`。**若標題摘要漏判、且有 readability 正文側車（`.txt`，已去 chrome），則以保守的 `FIMI詞 AND 中國詞` 共現補救**（正文不採 actor 單次命中，避免長文任意位置誤收；仍不吃原始整頁 chrome）。相關 → `extraction_status=ready`，否則 `filtered-out`。**模型不參與**——這是版本化、可 diff、可回歸測試的 **policy table**（詞表＋db 實體表），改規則須讓 `test_filter.py` 全過。
  - **行為者三層分級**：讀入 `name_en/name_zh/aliases`；長名（CJK≥4 或拉丁長詞）＝strong 獨立命中；短名/縮寫/歧義名（CJK 2-3、TAO/MSS…）＝weak，需 China/FIMI 詞**佐證**才算——擋掉「虎牙」（撞遊戲平台）、州媒常名 op-ed 等誤收，同時接住中文 actor。
  - **防自我佐證**：佐證詞不得是命中行為者自身或同實體別名（如單一「公安部」不因自己在中國詞表就過關）。
  - **資料層覆寫**：db.js 實體可選加 `match_tokens:{strong,weak,disabled}`，有就用資料、無則落回自動規則——fork 團隊在**資料層**調判準，不動 pipeline 碼。
  - **異體字**：NFKC＋casefold＋高頻繁簡對照（非完整簡繁，完整靠別名維護，不引 OpenCC）。
- **extract**（`extract.py`）：landed 報告文字 → LLM（JSON schema；可切 JSON fallback）→ `mentions＋逐字 predicate＋引文`。**碼端 schema validation＋span-check**：外層／JSON 錯誤仍整份 fail-closed；mention array 逐 item 驗證，非法 item 精確記錄／丟棄而保留合法 items；引文不合約同樣丟棄（擋格式漂移／幻覺）。**provider-agnostic**（見下）。
- **derive**（`derive.py`）：碼的判斷層——`coarse_type→kind`（詞庫＋registry 查表）、`predicate→relation`（反升級 ladder）、`confidence`（rubric）、`歸因`（控制述詞＋信心→attributed-to，人工閘）、`role`。
- **serialize / validate / project**（`pipeline.py`）：STIX-lite → 合法 STIX 2.1（UUIDv5、`x-dad-*` 擴充、marking）→ 驗證 profile 不變量 → 投影成 operator 三層。
- **compile**（`compile_to_db.py`）：把投影 claims 併入 `../data/db.js`（B-lite→真 B 逐筆升級）。**樣本用**；整包覆蓋。
- **loop / curate**（`run_loop.py` / `curate.py`）：`run_loop.py` 冪等編排 ingest→…→project，產出待人工審的 curation queue（預設不自動 compile）；`curate.py`（list/show/approve/compile）是**安全 compile 路徑**——source-scoped upsert（不覆蓋他來源）、狀態機、歸因閘、歸屬（`operator_ref`）重算比對。走迴圈時用 `curate.py`，勿用 `compile_to_db.py`。curate `defer`（新來源/新 actor）→ `register.py`（add-source/add-actor；有 `suggest` 印預填指令）補進骨幹 → 回 `curate approve/compile` 閉環。細節見 `../docs/LOOP_BACKLOG.md`。

## 跑

```bash
# ② 抓來源、落地快照（再跑只抓更新）
python3 pipeline/ingest.py

# 相關性閘（碼）：標記 ready / filtered-out，只讓相關項目進 ③
python3 pipeline/filter.py
python3 pipeline/test_filter.py     # filter 規則的 golden 回歸測試（改清單前後都要綠）

# 端到端測試（extract→derive→serialize→project）；provider 由環境變數決定（預設地端 Ollama）
python3 pipeline/extract.py

# 7 篇 gold dev 真實模型基線（chunked、可續跑、請求快取／輸出不進 Git）
NW_LLM_MODEL=qwen2.5:7b NW_LLM_TIMEOUT=180 python3 pipeline/eval_model.py

# Gemma 4 QAT：Ollama 明確關閉 thinking；JSON fallback 仍由碼端驗 schema
NW_LLM_MODEL=gemma4:12b-it-qat NW_LLM_OUTPUT_MODE=json NW_LLM_THINK=false \
  python3 pipeline/eval_model.py --match 02-iorg-monthly-2026-06 --max-assertion-windows 6

# scorer 完美／退化／對抗式自測
python3 pipeline/eval_extract.py

# 單一 extraction 樣本 → STIX＋投影（看碼的決策記錄）
python3 pipeline/pipeline.py pipeline/samples/spamouflage.extraction.json

# 把樣本投影 claims 併入 db.js
python3 pipeline/compile_to_db.py pipeline/samples/*.extraction.json

# 整本記錄簿匯出成單一 STIX 2.1 bundle（行為者／事件／敘事／來源，非只有宣稱那一層）
python3 pipeline/export_stix.py -o pipeline/out/netweaver-db.stix.json

# 生產迴圈（自動發布模式）：抽取 → 審名冊 → 自動發布
python3 pipeline/run_loop.py                     # ingest→…→project，入 curation queue
python3 pipeline/register.py roster              # 看哪些名字反覆出現卻沒登錄 → 決定要收哪些
python3 pipeline/curate.py auto --dry-run        # 看會發什麼／什麼留給人
python3 pipeline/curate.py auto                  # 實際發布
```

純 Python stdlib、決定性（同輸入→同 UUID／同輸出）。

## extract 的開放規格（provider-agnostic）

不寫死地端。以環境變數切換——地端零設定即跑，雲端/相容端點設 env 即可：

| 變數 | 預設 | 說明 |
|---|---|---|
| `NW_LLM_PROVIDER` | `ollama` | `ollama`（地端原生，grammar-forced）｜`openai`（OpenAI 相容） |
| `NW_LLM_BASE_URL` | `http://localhost:11434` | 端點基底；OpenAI 相容端可給 service root、`.../v1` 或 Google `.../v1beta/openai` |
| `NW_LLM_MODEL` | `gemma4:12b-it-qat` | 模型名 |
| `NW_LLM_API_KEY` | — | 雲端/相容端點金鑰 |
| `NW_LLM_TIMEOUT` | `600` | 單次 request timeout（秒） |
| `NW_LLM_OUTPUT_MODE` | `schema` | `schema`＝端點 constrained schema；`json`＝JSON mode＋prompt schema＋碼端驗證 |
| `NW_LLM_THINK` | `false` | Ollama thinking 控制：`false`／`true`／`low`／`medium`／`high` |
| `NW_LLM_CACHE_DIR` | — | 可選的成功 JSON request cache；含原文，敏感資料勿啟用 |
| `NW_LLM_CACHE_SALT` | — | 模型 alias／server revision 變更時設新值，強制舊 cache miss |
| `NW_EVAL_DOC_TIMEOUT` | `600` | 單篇 wall-clock budget（秒）；剩餘時間也會限制下一個 request timeout，`0` 停用 |
| `NW_EVAL_MAX_COLD_CALLS` | `0` | 單篇真正模型 calls 上限；cache hits 不計，`0` 停用 |
| `NW_EVAL_MAX_ASSERTION_WINDOWS` | `0` | 單篇 assertion windows 上限；跨 chunk 公平配額後依 relation-rich 訊號排序，`0` 停用 |

`eval_model.py` 預設將快取放在 ignored 的 `eval_runs/.request_cache`，使未改變的模型 requests 可在評測迭代間重用；加 `--no-request-cache` 可做 cold run 或避免原文落盤。輸出目錄與快取 key 都會區分 output mode／thinking。`json` fallback 只會把 schema 已知且非必填的 `null` 正規化成省略欄位，其餘缺欄、未知欄位、錯誤 enum／型別仍拒絕。

評測執行會逐 request 顯示 chunk／stage、cold call 編號、timeout、耗時與 token 數；每個 chunk 後原子寫入 `.checkpoint.json`。達到文件時間或 cold-call budget 時，partial prediction 留在 checkpoint、metadata 標成 `budget-exhausted`，不寫正式 `.pred.json`、不納入 aggregate。重跑時成功 requests 由 cache 命中且不扣 cold-call 額度，會自然繼續到後續 stages。逐 request 明細在 `.telemetry.json`。`--max-assertion-windows` 會另建 `-awN` variant，方便與完整 fan-out 並存 A/B；目前預設 `0`，不在尚未完成 locked test 前直接改變 production 行為。

```bash
# 雲端範例
NW_LLM_PROVIDER=openai NW_LLM_BASE_URL=https://api.openai.com NW_LLM_MODEL=gpt-... NW_LLM_API_KEY=sk-... \
  python3 pipeline/extract.py

# Gemini API 的 OpenAI 相容端點；model id 須以實際 production 設定為準
NW_LLM_PROVIDER=openai NW_LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai \
NW_LLM_MODEL=gemini-... NW_LLM_API_KEY=... python3 pipeline/eval_model.py
```

## 示範重點

- **保守歸因（紅線）**：述詞「likely linked」→ 碼判 related-to、停在 IMS；述詞「僱用/operated by」→ 碼判 operated-by＋信心≥中 → 建 attributed-to（人工閘）。**同一套碼、跨模型一致。**
- **claims＝真 B**：投影 L3 就是逐來源、附引文的 claim 卡。
- **地端可行但非效能等價**：Gemma 4 QAT v23 完整 7-doc cold baseline 為 mention F1 0.41、strict edge F1 0.17，但三輪累計 90.5 分鐘且有 2 篇 item-level partial errors；12B Ollama 不是 Gemini Flash 的 latency proxy。詳見 `../docs/EVAL.md`。

## 檔案

```
pipeline/
├── feeds.json               # ② ingest feed 設定（RSS 子集）
├── ingest.py                # ② 抓 feed／--url→落地快照＋.txt 正文側車＋manifest（cursor）
├── textextract.py           # 共用正文抽取：readability HTML＋pdftotext PDF＋charset 偵測
├── filter.py                # 相關性閘（碼）：三層分級＋防自我佐證＋異體字＋資料層覆寫
├── test_filter.py           # filter 的 golden 回歸測試（policy table 驗收）
├── extraction.schema.json   # 模型抽取契約（mentions＋assertions）
├── extract.py               # ① LLM 抽取 client（provider-agnostic）＋span-check
├── derive.py                # 碼的判斷層（ladder/rubric/registry）
├── stixlite.schema.json     # derive 產出的中介 schema
├── pipeline.py              # serialize / validate / project（＋stix_from_extraction）
├── compile_to_db.py         # 投影 claims → data/db.js（樣本用；整包覆蓋。迴圈請用 curate.py）
├── run_loop.py              # 冪等編排 ingest→…→project；產出待審 curation queue（預設不自動 compile）
├── urlnorm.py               # 來源 URL 比對鍵（追蹤參數／scheme／www 不算新來源；id 雜湊同源）
├── export_stix.py           # 整本記錄簿 → 單一 STIX 2.1 bundle（骨幹也可交換；id 與逐篇一致）
├── curate.py                # 審核 CLI：list/show/approve/compile/auto（安全 upsert／狀態機／歸因閘／歸屬重算）
├── register.py              # 補 source/actor：add-source/add-actor/suggest/roster/ignore（enum/URL/FK 驗證、防撞名）
├── ../data/roster_ignore.json # 「決定不收錄」清單（只影響 roster 候選；不隨 db.js 發布到前端）
├── samples/*.extraction.json# 3 份 extraction 樣本（歸因梯度對照）
└── out/                     # 產出的合法 STIX bundle（範例）
# raw/、extractions/、ingest_state.json 為執行期產物（.gitignore）
```

## 交接文件

給團隊看的白話說明（管線概況、人機分工、名冊為什麼是唯一閘門）：[../docs/HANDOVER.html](../docs/HANDOVER.html)。
直接用瀏覽器開即可；同一份內容也發布於 https://claude.ai/code/artifact/7d823944-5da9-4bda-906a-6b2111f13dec
（更新時兩邊要一起）。

## 下一步

- **迴圈已成形**（`run_loop.py`）：`ingest → filter → extract → derive → validate → project` 一鍵冪等跑，產出待審 curation queue；人審＋安全 compile 走 `curate.py`。待補見 `../docs/LOOP_BACKLOG.md`（排程、readability 正文等）。
- **審名冊（`register.py roster`）**：跨佇列彙總未登錄的行為者候選，分成**管道／機構／人名**三區。
  管道（媒體、帳號）是放大者層，該收的多半在這裡；人名是被提及的中性對象，幾乎都不收、可整批忽略。
  **不用「當過述詞主詞」排序**——12 篇實測反而更糟：assertion 稀少且模型傾向把國家當主詞，
  「中國」當過 6 次主詞、中國軍號與新華社是 0 次。型別才是乾淨的訊號。
  **觀察者自動濾除**：`feeds.json` ＋ registry.yaml 登錄為 **tier A／B** 的機構（含別名）＝寫報告的人。
  **tier C 刻意排除在觀察者之外**——對手方原始素材（環球時報的社評是物證）既是行為者、其產出又當佐證，
  算成觀察者會讓它永遠無法登錄。也不用 db.sources 的出版方集合（同樣混著物證來源）。
  被濾掉的名單用 `--show-ignored` 叫得出來：tier A/B 裡有台灣媒體（TVBS、中天）同時也是已登錄行為者。判斷過不是行為者的
  用 `register.py ignore <名字> --reason …` 標記，之後不再列出（`unignore` 可反悔、`--show-ignored` 可檢視）。
  沒有這份清單，同樣的雜訊每次都會重新冒出來，候選清單很快就沒人想看。
- **自動發布（`curate.py auto`）**：**人審名冊、模型填內容**。四道閘全過才自動落地——bundle 合法、無 attributed-to（歸因永遠人工）、出版方已信任、claims 掛得上已登錄實體且非 `sensitivity: domestic-named`。任一不過就留在佇列等人。走的是 `approve`／`compile` 同一條安全路徑，不另開捷徑。人的入口是 `register.py roster`（跨佇列彙總未登錄的行為者候選，依出現篇數排序）。
- **filter 精修**：詞表／`match_tokens` 擴充（附測試案例）；terse 中文標題的 recall 可加正文（非 chrome）抽取或高信任來源 override。
- **抽取品質**：few-shot／換模型（如台灣微調 Llama-Breeze）／輕量微調——碼層不動。
- **目前評測路徑**：actor／entity／narrative mention 分 pass → exact grounding → compact claim windows assertion；基線與重跑方式見 `../docs/EVAL.md`。
- **serializer 補完**：官方 DISARM bundle 引用、對照 STIX 官方 schema、實體解析與 `modified` 版本化。
