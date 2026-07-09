# NetWeaver 資料模型 (v1)

> 台灣 FIMI 行為者記錄簿 — 資料結構說明
> 對標歐盟 EEAS / DISARM / STIX 2.1，但 v1 刻意輕量化，停在「可瀏覽檔案 + 共現關聯」層級，不做深歸因。

## 設計原則

1. **以實體為中心（entity-centric）**：核心物件是「行為者/協力者」，每個實體一張「檔案頁」。
2. **事件作為連結軸**：實體透過「現身於某事件」彼此相連，形成共現網絡（bipartite：實體 ↔ 事件）。
3. **每筆都可查證**：實體、事件、關係的關鍵宣稱都掛 `source_ids`，前端必須顯示來源。
4. **不過度宣示**：`role` / `confidence` 誠實標記；境內個人/媒體只以「在某報告中被點名為某敘事放大者」的中性框架呈現。
5. **可對映國際標準**：欄位命名對齊 STIX/DISARM，日後可匯出（見文末對照表）。

## 物件型別

### 1. Entity（行為者／協力者）— 核心「檔案」

| 欄位 | 型別 | 說明 |
|---|---|---|
| `id` | string (kebab-case) | 唯一識別，如 `golaxy` |
| `name_zh` / `name_en` | string | 中／英名稱 |
| `aliases` | string[] | 別名、代號（如 Spamouflage / Dragonbridge） |
| `category` | enum | 見下方 category 列表 |
| `role` | enum | `attacker`（攻擊者）｜`collaborator`（協力者）｜`amplifier`（放大者） |
| `origin` | enum | `PRC`｜`TW`｜`other` |
| `summary_zh` | string | 一句話：這是什麼 |
| `description_zh` | string | 一段檔案描述（做了什麼、為何被記錄） |
| `indicators` | string[] | 可量化的證據（僅在有來源時填，如「追蹤到 315 個 X 帳號」） |
| `active_since` | string | 年份或期間 |
| `related` | Relation[] | 與其他實體的輕量關係（見下） |
| `event_ids` | string[] | 此實體現身的事件 |
| `source_ids` | string[] | 來源引用 |
| `confidence` | enum | `high`｜`medium`｜`low` — 證據強度與爭議程度 |
| `sensitivity` | enum? | 選填。`domestic-named` = 在地具名的個人／媒體放大者（依公開研究中性收錄）。前端會加標記並提供一鍵篩除；日後可作為公開/內部視圖的閘門。 |

**category 列表**（決定圖示與分類）
- `state-organ` — PRC 國家機關（CAC、MSS、PLA 政工、統戰部、公安部、國台辦…）
- `tech-vendor` — 提供技術的公司（AI 輿情、深偽、爬蟲，如 GoLaxy、科大訊飛）
- `pr-firm` — 公關／內容代理商（如 海訊社）
- `content-farm` — 內容農場
- `cib-network` — 具名的協同造假行為網絡／行動（如 Spamouflage）
- `state-media` — 官方／國家控制媒體（如 環球時報、玉淵譚天）
- `domestic-amplifier` — 在地放大者（媒體機構）
- `commentator` — 具名評論者（最敏感，從嚴）
- `other`

### 2. Event（事件／行動）— 連結軸

| 欄位 | 型別 | 說明 |
|---|---|---|
| `id` | string | 唯一識別 |
| `name_zh` / `name_en` | string | 事件名 |
| `date` | string | `YYYY` 或 `YYYY-MM` |
| `period` | string | 期間（可空） |
| `type` | enum | `election-op`｜`narrative-campaign`｜`platform-takedown`｜`exercise-linked`｜`exposure`｜`incident` |
| `summary_zh` | string | 發生什麼事 |
| `narratives` | string[] | 敘事標籤（對應 Narrative.id 或名稱） |
| `participant_ids` | string[] | 參與此事件的 entity id（須與 entity.event_ids 雙向一致） |
| `source_ids` | string[] | 來源 |
| `confidence` | enum | 同上 |

### 3. Relation（實體間輕量關係）— 內嵌於 entity.related

| 欄位 | 型別 | 說明 |
|---|---|---|
| `target_id` | string | 對象 entity id |
| `relation` | enum | `operated-by`｜`runs`｜`supplies-tech-to`｜`affiliated-with`｜`amplifies`｜`subsidiary-of`｜`linked-to` |
| `note` | string | 簡短說明 |

> 注意：v1 的關係是**描述性**的，不等同 STIX `attributed-to` 的正式歸因主張。

### 4. Source（來源引用）

| 欄位 | 型別 | 說明 |
|---|---|---|
| `id` | string | 如 `src-nsb-2025` |
| `title` | string | 來源標題 |
| `org` | string | 發布單位 |
| `url` | string | 真實可查的網址 |
| `date` | string | `YYYY` 或 `YYYY-MM` |
| `type` | enum | `gov-report`｜`ngo-report`｜`platform-report`｜`news`｜`academic` |

### 5. Narrative（敘事標籤）

| 欄位 | 型別 | 說明 |
|---|---|---|
| `id` | string | 如 `usa-skepticism` |
| `name_zh` / `name_en` | string | 如 疑美論 |
| `summary_zh` | string | 這個敘事在講什麼 |
| `source_ids` | string[] | 選填。敘事定義／溯源的出處（多為 IORG）。讓敘事成為「有來源的一等物件」。 |
| `parent` | string? | 選填。母敘事 id（如 `us-abandon` 的 parent 為 `us-skepticism`），支援巢狀敘事。 |

## 與國際標準的對照（未來匯出用）

| NetWeaver v1 | STIX 2.1 / DAD-CDM | DISARM |
|---|---|---|
| Entity (cib-network) | `intrusion-set` / Information Manipulation Set | — |
| Entity (state-organ, tech-vendor…) | `identity`（預設）／`threat-actor`（證據支持惡意操作意圖時） | — |
| Entity (state-media, content-farm) | Channel SDO (DAD-CDM 擴充) | — |
| Event（行動） | `campaign` | — |
| Narrative | Narrative SDO (DAD-CDM 擴充) | — |
| Relation | `relationship` (SRO) | — |
| （未來）TTP 標記 | `attack-pattern` | TA*/T* ID |
| Source | `report` / `external_reference` | — |

> v1 尚未納入 DISARM TTP 標記與 EEAS 四級曝光層級（official / state-controlled / state-linked / state-aligned）。這兩者是最自然的下一步擴充點。

## 資料檔位置

- `data/db.js` — 單一資料來源，定義全域 `window.NETWEAVER_DB = { entities, events, sources, narratives }`，以 `<script src>` 載入（避免 file:// 的 CORS 問題）。
- 若日後要 API 化，直接把同一物件序列化成 `db.json` 即可。
