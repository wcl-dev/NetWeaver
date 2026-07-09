# NetWeaver 架構文件（ARCHITECTURE）

> 本文件記錄 NetWeaver 從概念驗證（PoC）演進為「可接取的 live-archive 模組」的**已定案架構決策、理由與分階段路線**，作為團隊接手的單一依據。
> 狀態：設計定案（尚未實作）。搭配 [`SCHEMA.md`](SCHEMA.md)（資料結構）與 [`README.md`](../README.md)（現況）閱讀。

---

## 0. 一句話定位

NetWeaver 是**中國認知作戰公開研究的即時、可搜尋、以 operator（責任行為者）為中心的二級索引**——台灣錨、印太幅。它把散落於各家公開報告中「被點名的攻擊者與協力者」聚合、歸納、附源呈現，讓調查者能讀、能查、能追。

**核心身分：聚合者／二級索引，不是原創分析者。** NetWeaver 從不主張任何事；它只如實轉述「某份可信報告說了 X」並連回原文。這個定位是整套自動化與治理設計的樞紐——因為指控的主體是來源，不是 NetWeaver。

---

## 1. 消費者與非目標

- **主要消費者**：讀自然語言敘述的**台灣調查者**（研究者、記者、分析人員）。因此產品價值在「好讀、可搜、附源的敘述」，不在機器情資 feed。
- **非目標（明確排除）**：
  - ❌ 不做原創歸因／分析（只轉述公開報告）。
  - ❌ 不做自然語言問答／RAG（查詢期零 LLM，避免幻覺）——改用布林搜尋。
  - ❌ v1 不主打關聯圖（force graph 保留但降級）。
  - ❌ v1 不做 STIX/TAXII feed（延後至互通階段）。
  - ❌ 不做對外申訴佇列／SLA（但保留便宜的修正能力，見 §6）。

---

## 2. 整體架構：生產線 ＋ 四層

```
 SOURCES ─▶ ①INGEST ─▶ ②EXTRACT ─▶ RESOLVE/MERGE ─▶ ②REVIEW(例外) ─▶ PUBLISH ─▶ ③SERVE
 (feed維護) (不可變快照庫)(附引文原子宣稱)(去重·接關係·完整性)(僅 local-named)  (版本化db)(編譯成靜態產物)
    │                                                                                  │
    └──── ④橫貫：標準對映(STIX/DAD-CDM/IMS/Exposure tier) ＋ 治理(記錄非指控·敏感gating·授權) ────┘
```

| 層 | 職責 | 關鍵設計 |
|---|---|---|
| **① Ingest** | 把公開來源維持成活的監控 feed、落地不可變快照 | 來源登錄檔（`registry.yaml`，逐源 tier/license/mode）；~60% 有 RSS 可自動化、IORG 用序號探測 `/da/{N+1}`、NSB 抓 PDF、Graphika/Meta 低頻用「人工觸發＋自動存證」。**快照＋hash＋manifest ＝ 真相源**（原網頁 404 也可重現）。 |
| **② Extract** | 把一份原始文件轉成 schema 內的驗證過記錄 | **先抽「附逐字引文＋span 的原子宣稱」再組實體**（無引文→進不了圖）；**反升級階梯**（來源說 linked→永不能抬成 runs）；實體解析＝id＋別名＋模糊＋語意；風險分級 diff。 |
| **③ Serve** | 把一份真相源編譯成多種交付面 | **static-first**：一份 `db` 編譯出所有產物（資料包、API、之後的 STIX）。近零維運。 |
| **④ Standards / Gov** | 讓模組可信到別人敢嵌入 | 「記錄非指控」編采準則＋敏感分級 gating＋標準對映＋授權。 |

**設計原則**：「Live」≠ 即時發明，而是**持續監控來源 ＋ 收進來即時自動呈現**。安全來自自動閘門，不是逐筆人審。

---

## 3. 資料模型：operator 三層條列 ＋ roll-up

主結構不是網絡圖，而是一條清楚的三層條列（對應 EEAS 的 IMS 把事件歸到推定 operator 之下）：

```
Operator（責任行為者）
  └─ Operation / Event（它涉入的行動）
       └─ 逐來源宣稱（〔某報告〕指出…＋原文連結）
```

**規則：**
1. **operator ≈ 現有 `role="attacker"` 的參與者。** 事件的 operator 就是其 attacker 角色參與者；collaborator/amplifier/channel 列為配角。多攻擊者時，事件上輕標哪些參與者是 operator。
2. **關聯圖降級，但 `operated-by`／`runs` 邊要留著**——它們不是拿來畫圖，而是 **roll-up 的上溯骨架**：讓「某帳號群／front 商的行動」往上歸到背後的國家機關（例：Spamouflage 的行動 → 上溯公安部）。
3. **operator 檔案頁**同時呈現「**它主導的行動**」與「**它被點名參與的事件**」，並可沿 operated-by 鏈**上溯 roll-up** 下游行為者的行動。

**為此需要的 schema 增修**（皆可加性、向後相容，細節見 SCHEMA.md）：
- `Entity.claims: [{text, source_id, quote, relation?}]`（選填）——見 §4。
- `Event`：輕標 operator 參與者（可用既有 `role` 推導，必要時加 `operator_ids`）。
- `Event.targets: [TW, JP, …]`——印太範圍需要的目標地理維度。
- `Source.license`——授權自動化所需（見 §9）。
- `exposure_tier`（衍生，非手填）——EEAS 曝光矩陣四級，由 `category`＋`confidence`＋邊型計算（見 §8）。

---

## 4. 呈現方式：B（逐來源歸屬）＋ B-lite→claim 級演進

**定案採 B**：檔案以「逐來源歸屬的可讀宣稱」為主體，每句明示出處；散文降為一句明標「NetWeaver 彙整概述」的輕導言。對「只轉述公開報告」的聚合者，這比合成散文更誠實、更好防守。

演進分三態，靠**一個選填欄位 ＋ 雙模式渲染 ＋ 碰到才升級**無痛接起：

| 狀態 | 資料 | 呈現 | 何時 |
|---|---|---|---|
| **A（今天）** | `description_zh` 一段 blob ＋ 實體層 `source_ids` | 散文＋底部來源清單（無法逐句對應） | 現況 |
| **B-lite** | **不動資料** | 把來源**上提內嵌**成「本檔依據：〔NSB〕〔DTL〕…」可點 chips；指標逐條標出處 | 零成本，現在就能上 |
| **B（claim 級）** | 新增 `claims[]`（每條＝一宣稱×一來源×一原文） | 逐句宣稱卡＋「彙整概述」輕導言 | 抽取管線②的自然產物 |

**演進機制：**
- **渲染器雙模式**：`entity.claims?.length ? 畫B : 畫B-lite`——一份程式碼吃兩種，過渡期語料一半 B、一半 B-lite，讀者體感一致。
- **碰到才升級（lazy/touch-based）**：新進資料天生 claim 級；舊 57 筆維持 B-lite，直到被重跑時由管線生出 `claims[]` 自動升級。一次性 backfill 是選項、非前提。
- **風險單調下降且降在對的地方**：A→B-lite→claim 綁定越來越緊；而**新內容（自動即時發佈、風險較高）天生 claim 級（綁定最緊）**，B-lite 只落在已人工細審的舊料上。
- **claim 也餵 roll-up**：關係型 claim（`relation` 有值）同時替一條 `related` 邊掛上出處＋原文，讓 operator 上溯鏈逐跳可查證。

---

## 5. 自動化與紅線

**原則**：收進來即時自動呈現。人力逼近零，安全靠自動閘門與架構紅線。

**按風險分級的自主權：**

| 風險層 | 內容 | 自動化 |
|---|---|---|
| 低 | PRC 機構（網信辦/國安部/政工部…）、具名境外行動（Spamouflage/GLASSBRIDGE） | **全自動即時發佈** |
| 中 | 技術商/front 公司、官媒、內容農場 | 自動＋高信心閘＋忠實用語才發 |
| 高（紅線） | **具名在世個人／在地媒體**（`local-named`，泛化自 `domestic-named`，含各目標國）、人↔機構新歸因、低信心、attributive 邊 | **機器永不自動建立或修改**；只能人刻意新增，且**發佈前掃一眼**（唯一保留的人環，約 5%） |

**紅線的架構形式**：自動管線在權限上**根本無法** auto-建立/改動 `local-named` 記錄——靠架構守住最鋒利的法律面，而非靠自律。

**真正的人力落點**：不是審記錄，是審**來源名單**（`registry.yaml`）。系統可信度 ＝ 來源名單可信度。這是小、穩定、高槓桿的人類決策。

---

## 6. 安全閘（因即時發佈，這是唯一安全網）

即時自動發佈＝錯誤會直接上線，所以自動閘門是整套安全系統：

1. **Grounding-first**：每個宣稱都錨定到來源逐字 span，抽不出→不上（杜絕幻覺攻擊者）。
2. **框架鎖**：一律渲染成「〔某報告〕指出 X」，永不是 NetWeaver 自己說 X；生成後 critic 打回 agentive/指控語氣。
3. **反升級**：用語不得強過來源；STIX **預設不輸出 `attributed-to`**（僅來源明確歸因＋人工閘時輸出，見 [STIX-PROFILE.md §7](STIX-PROFILE.md)）。
4. **來源信任閘**：只收 allowlist 上的可信發布者。
5. **信心規則**：`high` 需多來源或一級來源；規則化、可解釋，非憑感覺。
6. **完整性 CI 閘**：參照完整、雙向一致、無孤兒、連結健康（沿用現有腳本）。

**修正路徑（保留，非申訴佇列）**：能「改來源名單／重跑抽取／把壞記錄 tombstone 並重編譯」即可。錯誤要能快速收回，記錄用 tombstone 不用刪除。

---

## 7. 搜尋

- **前端 client-side 全文索引**（在編譯好的 `db` 上建倒排索引）＋現有結構化篩選（角色/類別/來源地/信心/目標國）＋ **AND/OR/NOT 布林**。
- **查詢期完全無 LLM**：零幻覺、零後端、瞬時。與 static-first 完美契合。
- 不做問答；布林是上限。

---

## 8. 標準對齊（延後至互通階段）

現在只需保持「可對映」，不急著實作：

- **IMS 框架**：把 `cib-network` 品牌化為 NetWeaver 的 Information Manipulation Set（＝我們「歸類不定罪」姿態，正好對上 EEAS/VIGINUM 共識）。
- **Exposure Matrix 四級 tier**（低成本高價值，可先做）：官方/國家控制/國家連結/國家對齊，由 `category`＋`confidence`＋邊型衍生；**tier 4「不可歸因」正好給 `local-named` 一個標準化理由**。
- **STIX 2.1 ＋ DAD-CDM 匯出**（互通階段）：唯讀 export adapter，UUIDv5 穩定 id。**護欄：預設用中性邊 `related-to` 分組（Campaign→IMS）；`attributed-to` 僅用於來源明確歸因＋人工閘；`operated-by`/`runs` 永不自動映成 STIX `attributed-to`**（詳見 [STIX-PROFILE.md §7](STIX-PROFILE.md)），否則「記錄非指控」在匯出邊界崩潰。
- **DISARM TTP**（最後）：掛在 Campaign／行動（STIX `campaign`）上，不硬塞給實體。

---

## 9. 授權

- **資料層**：**CC BY 4.0**（避開 BY-SA copyleft，讓整合者能嵌入閉源產品）。
- **程式碼**：**Apache-2.0**。
- **redistribution 原則**：只給「**結構化事實 ＋ 引文 ＋ NetWeaver 自寫分析**」，**連出去看原文，絕不轉載來源逐字內容**。
- **CC BY-SA 傳染管理**：對 BY-SA 來源只取「事實＋引用」（copyleft 不及於事實）；若要轉載其內容，隔離成獨立 BY-SA 子包。
- **`Source.license` 欄位**：`gov-open`／`cc-by`／`cc-by-sa`／`ngo-restricted`／`all-rights-reserved`——讓編譯器自動分層、讓消費者可過濾。
- **署名隨資料流動**：每筆 API/嵌入產物都帶來源與署名字串；嵌入 widget 免費層**署名不可移除**。

---

## 10. 與既有工具的互文（保留／精進）

現有單檔 app 已約是三層模型的 70%——**演進，不是重寫**。

| 三層目標 | 現況對應 | 狀態 |
|---|---|---|
| L1 Operator 索引 | Gallery 卡片＋篩選 | **保留** |
| L1 Operator 檔案頭 | Dossier 表頭 badges | **保留** |
| L2 該 operator 的行動 | Dossier「現身事件」清單 | **精進**：分「主導 vs 被點名」＋沿 operated-by 上溯 roll-up |
| L3 逐來源宣稱（B） | Dossier「檔案說明」合成 blob＋底部來源 | **精進（樞紐）**：A→B 需 claim 級掛源（見 §4） |
| 證據指標 | indicators 純字串 | 精進：每條綁 `source_id` |
| 事件內 operator | Event 頁「參與行為者」平鋪 | 精進：依角色分組、標出 operator |
| 關係（roll-up 骨架） | `related` 邊 | **保留**（不畫圖，改當上溯骨架） |
| 搜尋 | 名稱/別名子字串＋篩選 | 精進：布林全文 |
| 關聯圖 | Network 分頁 force graph | **保留但降級**（從主導覽移下） |

`role`（attacker/collaborator/amplifier）與 `related`（operated-by/runs）**既有資料已預示 operator 模型**——多為重排視圖，唯一動到顆粒度的是 claim 級掛源。

---

## 11. 分階段路線

| 階段 | 內容 | 產出 |
|---|---|---|
| **P0 定調＋基座**（最划算） | 編采政策/方法論/信任聲明（文件）＋ 編譯器 `db.js→db.json`＋JSON Schema＋`Source.license`＋SemVer ＋ 來源登錄檔＋快照庫 ＋ **B-lite 呈現** ＋ 完整性 CI 閘 | 可用資料包＋溯源＋治理成文＋來源前置的閱讀體驗 |
| **P1 活起來＋達信任門檻** | MVP feeds（RSS/Substack/Medium/NSB PDF）＋ grounded 抽取管線＋框架鎖/反升級閘 ＋ `local-named` 發佈前掃一眼 ＋ Exposure tier ＋ **claim 級 B（新料）** ＋ 布林全文搜尋 ＋ operator roll-up 視圖 ＋ REST/資料包 | 自更新、即時、可接取、達 v1 信任門檻 |
| **P2 互通** | STIX 2.1＋DAD-CDM 匯出＋（選）TAXII/OpenCTI ＋ 抽取 critic/迴歸測試 ＋ scrape/discovery 擴充 ＋ 印太多語來源 | 與 CTI/ISAC 生態互通 |
| **P3 豐富化** | DISARM 標記＋claim-level span ＋ 跨文佐證 ＋ 嵌入式 Web Component ＋ gated 頁 Playwright | 行為層 TTP、一行嵌入 |

**v1 最低信任門檻**：每筆有活來源、完整性 100%、`local-named` 框架鎖＋預設 gating、已發佈方法論＋信心規則、修正能力可用、來源快照存證、明確授權。

---

## 12. 已定案決策摘要

- 定位：中國認知作戰公開研究的即時二級索引；聚合者非分析者；台灣錨、印太幅。
- 消費者：讀敘述的台灣調查者。呈現走 **B**（B-lite 起步、claim 級演進）。
- 自動化：收進來即時自動發佈；**紅線**＝機器永不自動點名在世在地個人；`local-named` 保留發佈前掃一眼。
- 人力落點：審來源名單，不審記錄。
- 搜尋：client-side 布林全文，查詢期無 LLM。
- 主結構：operator 三層條列＋沿 operated-by 上溯 roll-up；關聯圖降級。
- 授權：資料 CC BY 4.0、程式 Apache-2.0；只散布事實＋引文＋自寫分析。
- 標準：STIX/DAD-CDM/Exposure tier/DISARM 保持可對映，延後實作。

## 13. 待深化／未定

- operator 定義的邊角：多攻擊者事件如何標主 operator。
- 中風險自動點名的容忍界線（公司型實體是否也要人過目）。
- backfill 舊 57 筆到 claim 級的時機（可延後，靠 lazy 升級）。
- 印太擴張的來源優先序與多語抽取細節。
- 誰維運基礎設施與編采責任的長期歸屬。
