# NetWeaver 資料管線

把公開 FIMI 報告，經固定中介格式（STIX）穩定地變成 NetWeaver 前端讀的 operator 視圖資料。
核心原則：**模型抽取・碼判斷**——模型只忠實抽取，所有分類/關係/信心/歸因由碼決定，**換模型也穩**。規格見 [../docs/STIX-PROFILE.md](../docs/STIX-PROFILE.md)。

## 流程

```
② ingest ─▶ filter(碼) ─▶ ① extract(LLM) ─▶ derive(碼) ─▶ serialize ─▶ validate ─▶ project ─▶ compile→db.js
 RSS/快照    相關性閘        mention＋逐字述詞    判斷層        合法STIX      不變量       operator三層   前端真B
```

- **ingest**（`ingest.py`＋`feeds.json`）：讀 feed → 抓 RSS/Atom → 偵測新項目（cursor）→ 落地不可變快照＋provenance manifest（tier/license/hash/discovered_at，title/summary，`extraction_status=pending`）到 `raw/`。
- **filter**（`filter.py`）：抽取前的**碼**相關性閘。比對 feed 標題＋摘要（非整頁，避開新聞網站 chrome 誤收）。規則：`強名命中 OR (弱名命中 AND 佐證詞) OR (FIMI詞 AND 中國詞)`。相關 → `extraction_status=ready`，否則 `filtered-out`。**模型不參與**——這是版本化、可 diff、可回歸測試的 **policy table**（詞表＋db 實體表），改規則須讓 `test_filter.py` 全過。
  - **行為者三層分級**：讀入 `name_en/name_zh/aliases`；長名（CJK≥4 或拉丁長詞）＝strong 獨立命中；短名/縮寫/歧義名（CJK 2-3、TAO/MSS…）＝weak，需 China/FIMI 詞**佐證**才算——擋掉「虎牙」（撞遊戲平台）、州媒常名 op-ed 等誤收，同時接住中文 actor。
  - **防自我佐證**：佐證詞不得是命中行為者自身或同實體別名（如單一「公安部」不因自己在中國詞表就過關）。
  - **資料層覆寫**：db.js 實體可選加 `match_tokens:{strong,weak,disabled}`，有就用資料、無則落回自動規則——fork 團隊在**資料層**調判準，不動 pipeline 碼。
  - **異體字**：NFKC＋casefold＋高頻繁簡對照（非完整簡繁，完整靠別名維護，不引 OpenCC）。
- **extract**（`extract.py`）：landed 報告文字 → LLM（forced JSON schema）→ `mentions＋逐字 predicate＋引文`。**碼端 span-check**：引文對不上原文即丟（擋幻覺）。**provider-agnostic**（見下）。
- **derive**（`derive.py`）：碼的判斷層——`coarse_type→kind`（詞庫＋registry 查表）、`predicate→relation`（反升級 ladder）、`confidence`（rubric）、`歸因`（控制述詞＋信心→attributed-to，人工閘）、`role`。
- **serialize / validate / project**（`pipeline.py`）：STIX-lite → 合法 STIX 2.1（UUIDv5、`x-dad-*` 擴充、marking）→ 驗證 profile 不變量 → 投影成 operator 三層。
- **compile**（`compile_to_db.py`）：把投影 claims 併入 `../data/db.js`（B-lite→真 B 逐筆升級）。

## 跑

```bash
# ② 抓來源、落地快照（再跑只抓更新）
python3 pipeline/ingest.py

# 相關性閘（碼）：標記 ready / filtered-out，只讓相關項目進 ③
python3 pipeline/filter.py
python3 pipeline/test_filter.py     # filter 規則的 golden 回歸測試（改清單前後都要綠）

# 端到端測試（extract→derive→serialize→project）；provider 由環境變數決定（預設地端 Ollama）
python3 pipeline/extract.py

# 單一 extraction 樣本 → STIX＋投影（看碼的決策記錄）
python3 pipeline/pipeline.py pipeline/samples/spamouflage.extraction.json

# 把樣本投影 claims 併入 db.js
python3 pipeline/compile_to_db.py pipeline/samples/*.extraction.json
```

純 Python stdlib、決定性（同輸入→同 UUID／同輸出）。

## extract 的開放規格（provider-agnostic）

不寫死地端。以環境變數切換——地端零設定即跑，雲端/相容端點設 env 即可：

| 變數 | 預設 | 說明 |
|---|---|---|
| `NW_LLM_PROVIDER` | `ollama` | `ollama`（地端原生，grammar-forced）｜`openai`（OpenAI 相容） |
| `NW_LLM_BASE_URL` | `http://localhost:11434` | 端點基底 |
| `NW_LLM_MODEL` | `gemma4:12b-it-qat` | 模型名 |
| `NW_LLM_API_KEY` | — | 雲端/相容端點金鑰 |

```bash
# 雲端範例
NW_LLM_PROVIDER=openai NW_LLM_BASE_URL=https://api.openai.com NW_LLM_MODEL=gpt-... NW_LLM_API_KEY=sk-... \
  python3 pipeline/extract.py
```

## 示範重點

- **保守歸因（紅線）**：述詞「likely linked」→ 碼判 related-to、停在 IMS；述詞「僱用/operated by」→ 碼判 operated-by＋信心≥中 → 建 attributed-to（人工閘）。**同一套碼、跨模型一致。**
- **claims＝真 B**：投影 L3 就是逐來源、附引文的 claim 卡。
- **地端可行**：`extract.py` 已用地端 gemma4 端到端驗證（forced JSON＋span-check 生效）；資料不出網。

## 檔案

```
pipeline/
├── feeds.json               # ② ingest feed 設定（RSS 子集）
├── ingest.py                # ② 抓 feed→落地快照＋manifest（cursor）
├── filter.py                # 相關性閘（碼）：三層分級＋防自我佐證＋異體字＋資料層覆寫
├── test_filter.py           # filter 的 golden 回歸測試（policy table 驗收）
├── extraction.schema.json   # 模型抽取契約（mentions＋assertions）
├── extract.py               # ① LLM 抽取 client（provider-agnostic）＋span-check
├── derive.py                # 碼的判斷層（ladder/rubric/registry）
├── stixlite.schema.json     # derive 產出的中介 schema
├── pipeline.py              # serialize / validate / project（＋stix_from_extraction）
├── compile_to_db.py         # 投影 claims → data/db.js
├── samples/*.extraction.json# 3 份 extraction 樣本（歸因梯度對照）
└── out/                     # 產出的合法 STIX bundle（範例）
# raw/、ingest_state.json 為執行期產物（.gitignore）
```

## 下一步

- **串成迴圈**：`ingest → 挑 ready → extract → derive → compile` 一鍵／排程自動跑。
- **filter 精修**：詞表／`match_tokens` 擴充（附測試案例）；terse 中文標題的 recall 可加正文（非 chrome）抽取或高信任來源 override。
- **抽取品質**：few-shot／換模型（如台灣微調 Llama-Breeze）／輕量微調——碼層不動。
- **serializer 補完**：官方 DISARM bundle 引用、對照 STIX 官方 schema、實體解析與 `modified` 版本化。
