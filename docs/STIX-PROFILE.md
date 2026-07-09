# NetWeaver STIX Profile — 抽取的固定靶（中介格式規格）

> **這份文件是什麼**：報告格式不一，若讓 LLM 直接萃取進自訂 schema 會不穩。我們插入一個**固定的中介格式當靶**：STIX 2.1（採 VIGINUM OpenCTI doctrine + OASIS DAD-CDM 方向 + DISARM）。
> 本文＝那個靶的規格。抽取管線（③）照它打，claim-level 呈現（④）是它的投影。
> 依據：使用者的 STIX/OpenCTI 建模圖 + VIGINUM/SGDSN《Doctrine OpenCTI》+ DAD-CDM。搭配 [ARCHITECTURE.md](ARCHITECTURE.md)、[SCHEMA.md](SCHEMA.md)。
> **v0.2**：依 Codex 技術複審修正（歸因語義、擴充物件、event/incident、欄位表、grounding、DISARM 正規值、threat-actor 保守、ID 規則）。

---

## 1. 核心建模原則

1. **Campaign 為中心節點**，向外連 Narrative／Channel／Attack Pattern(DISARM)／Tool／Infrastructure／Target。
2. **IMS（Information Manipulation Set）＝ STIX `intrusion-set`**：協調行為/帳號/工具之群組，**依定義即未歸因**。
3. **DISARM 以 `attack-pattern` 表現**（掛官方 DISARM STIX bundle 的正規 external_id 與 kill_chain）。
4. **操作網站/帳號/頁面＝ Channel（擴充 SDO）**；技術指標（URL/IP/Email/Domain）＝ Observable(SCO)。
5. **Media Content（貼文/影片/圖片/文章）＝ 擴充 SDO，內連 Observable**。
6. **歸因保守（紅線）**：預設**不**用 `attributed-to`；Campaign 以中性邊 `related-to` 分組到 IMS。`attributed-to` 只在來源**明確歸因**時、且經人工閘才建立（見 §7）。
7. **（NetWeaver 追加）Grounding 必備**：每個物件/關係都掛 `x_netweaver_evidence`（來源＋逐字引文），抽不出引文→不建立（見 §5）。
8. **（NetWeaver 追加）敏感標記**：具名在世在地個人/媒體 → `x_netweaver_sensitivity="local-named"`＋TLP:AMBER，且機器**永不自動建立**（紅線，見 §8）。
9. **（NetWeaver 追加）operator 視圖是投影**：STIX 是 Campaign 中心，前端 operator 三層由其投影而來（見 §9）。

---

## 2. 物件集（抽取目標）

**N**=STIX 2.1 原生；**X**=擴充（暫用 `x-dad-*` 自訂命名，待 OASIS DAD-CDM 定案再換正式 `extension-definition--…` ID，見 §2.1）。
必填欄分兩欄：**STIX 必填**（規範）與 **NW 必備**（NetWeaver 額外硬規則，主要是 grounding）。

| 物件 | STIX 型別 | N/X | STIX 必填 | NW 必備 |
|---|---|---|---|---|
| **Campaign** | `campaign` | N | `name` | evidence, description |
| **IMS** | `intrusion-set` | N | `name` | evidence |
| **Threat Actor** | `threat-actor` | N | `name` | evidence；**僅證據支持惡意操作意圖時才建**（見 §7.4） |
| **Identity** | `identity` | N | `name` | evidence；`identity_class` 建議填 |
| **Narrative** | `x-dad-narrative` | X | (自訂：`name`) | description, evidence；`parent` 可巢狀 |
| **Channel** | `x-dad-channel` | X | (自訂：`name`,`channel_type`) | url, evidence, exposure_tier? |
| **Attack Pattern** | `attack-pattern` | N | `name` | `external_references`(DISARM), evidence |
| **Media Content** | `x-dad-media-content` | X | (自訂：`content_type`) | url, evidence |
| **Observable** | `url`/`ipv4-addr`/`email-addr`/`domain-name`/`file` (SCO) | N | `value` | — |
| **Location** | `location` | N | 至少 `country`／`region`／經緯之一 | — |
| **Tool** | `tool` | N | `name` | — |
| **Infrastructure** | `infrastructure` | N | `name` | — |
| **Report（＝來源）** | `report` | N | `name`,`published`,`object_refs` | `external_references[]:{source_name,url}`（NW 強制 url） |
| **Event（被利用的真實事件）** | `x-dad-event` | X | (自訂：`name`) | evidence；以 `uses`/`x-dad-leverages` 連，**非** `targets`（見 §3、§2.2） |

> **Phone 不是原生 STIX SCO**：電話以 `identity.contact_information` 或自訂 `x-netweaver-phone-number` 記，不列為原生 Observable。

### 2.1 擴充物件（x-dad-*）
`x-dad-narrative`／`x-dad-channel`／`x-dad-media-content`／`x-dad-event` 為 NetWeaver 本地自訂 SDO（STIX custom object），每個帶一個 `extension-definition`（本地產生的 `extension-definition--<uuid>`，pin 在 serializer）。待 OASIS DAD-CDM 定案，改指向官方 extension ID 與 schema；屆時只換 type 名與 ext-def 參照，語義不變。
自訂關係 `x-dad-publishes`（Channel→Media Content）、`x-dad-amplifies`（Channel→Channel）同理（非原生 `relationship_type`）。

**序列化契約**（serializer 產出的合法形狀）：bundle 內含對應的 `extension-definition` 物件；自訂 SDO 形如
`{ "type":"x-dad-channel", "spec_version":"2.1", "id":"x-dad-channel--…", "name":"…", "channel_type":"…", "extensions": { "extension-definition--<uuid>": { "extension_type":"new-sdo" } } }`；自訂 SRO 同理，`"extension_type":"new-sro"`。

### 2.2 術語切清（避免與原生 `incident` 撞名）
- **行動／操作 → `campaign`**（不是 event）。
- **被行動利用的真實世界事件（選舉/災害/時事）→ `x-dad-event`**，以 `uses`/`x-dad-leverages` 連，非 `targets`。
- **資安事件 → 原生 `incident`**（v1 不用，保留）。

---

## 3. 關係（Relationship SRO）

| 來源 | 關係 | 目標 | 意義 | 附註 |
|---|---|---|---|---|
| Campaign | `related-to` | **IMS** | **預設中性分組（非歸因）** | 見 §7.1 |
| Campaign | `uses` | Narrative / Channel / Attack Pattern / Tool / Infrastructure | 行動使用 | |
| Campaign | `uses`／`x-dad-leverages` | x-dad-event | 利用真實事件 | 非 targets |
| Campaign | `targets` | Identity / Location | 鎖定目標 | |
| Campaign | `related-to` | Observable | 與技術指標相關 | 弱關係 |
| Channel | `x-dad-publishes` | Media Content | 頻道發布內容 | 自訂關係 |
| Channel | `x-dad-amplifies` | Channel | 頻道放大 | 自訂關係 |
| IMS ／ Campaign | `attributed-to` | **Threat Actor** | **僅來源明確歸因＋人工閘** | 見 §7.2；預設不建 |
| Report | `object_refs`（欄，非 SRO） | 上述物件 | 報告涵蓋（**索引，非 grounding**） | grounding 見 §5 |

> **弱關係優先**：來源說「linked/associated」→ `related-to`，不得升級為 `attributed-to`。

---

## 4. DISARM 掛法

- **釘版本並引用官方 bundle**：pin DISARM 產生的 STIX bundle（如 v1.6.1），`attack-pattern` 依其 **id / external_id** 引用，不自建。
- 欄位用官方正規值：`external_references = [{source_name:"DISARM", external_id:"T0097"}]`；`kill_chain_phases = [{kill_chain_name:<官方值>, phase_name:<官方 phase>}]`。
- **不自編顯示用階段名**（如 Plan/Prepare/Execute/Assess）除非與官方 kill_chain phase 完全相符。
- 儲存 DISARM 版本號於 bundle meta。
- **v1 抽取不自動判 TTP**（prose 難穩定）→ 輔助後期（LLM 提議、人確認）。

---

## 5. Grounding（NetWeaver 硬規則）

真正的 grounding 靠每個物件/關係上的 **`x_netweaver_evidence` 陣列**（可多條）：
```
x_netweaver_evidence: [
  { "report_ref":"…", "source_url":"…", "quote":"…", "span":null, "hedge":"…", "extracted_at":"…" }
]
```
- `report.object_refs` 僅作**報告索引**（報告涵蓋哪些物件），**不**代表哪句話支持哪個屬性/關係——後者由 evidence 陣列負責。
- **不變量**：**被抽取的**物件/關係不得無 evidence → 保證「沒有無來源的行為者/宣稱」。逐字 `quote` 即 claim 卡原料。
- **例外**：匯入的參照物件（官方 DISARM `attack-pattern`、決定性 SCO）本身免 evidence，但「Campaign `uses` 該 Attack Pattern」的**關係**要掛 evidence。

---

## 6. STIX-lite 中介 vs 合法 STIX（分工）

| 段 | 誰做 | 產物 |
|---|---|---|
| **STIX-lite** | LLM（forced schema） | 概念物件＋關係＋每項 `x_netweaver_evidence`；用暫時 slug ref，不含 UUID |
| **合法 STIX 2.1** | deterministic serializer（碼） | 補 ID（§10）、接 SRO、填必填欄、DISARM 正規值、x-dad ext-def、markings、confidence |

**LLM 做語意、程式做語法。**

---

## 7. 保守歸因規則（紅線的機器版）

1. **Campaign 預設 `related-to` IMS**（中性分組，無歸因語義）——不用 `attributed-to`，與 [ARCHITECTURE.md](ARCHITECTURE.md) 一致。
2. **建立 `attributed-to`（IMS/Campaign → Threat Actor）僅當**：來源用語明確支持控制/官方歸因（run by / operated by / directed by / 官方指認）**且** confidence ≥ medium **且** 經人工核可。否則停在 IMS。
3. 關係取**最弱一致**：「linked/associated」→ `related-to`；逐字用語存 `x_netweaver_evidence.quote`。
4. **`threat-actor` 只在證據支持惡意操作意圖時建立**；機關/技術商/公關/媒體/個人**預設 `identity`**，需要時再 `identity` ↔ `threat-actor` 連結。
5. **confidence 對映**：`low=30`／`medium=60`／`high=85`（STIX `confidence` 整數）；原文措辭保留於 evidence。
6. **`operated-by`/`runs`（NetWeaver 邊）永不自動映成 STIX `attributed-to`**（見 ARCHITECTURE）。

---

## 8. 敏感標記 / local-named 紅線

- 具名在世在地個人/媒體 → `identity`（class=individual/organization）＋ `x_netweaver_sensitivity="local-named"`。
- **標記語義分清**：`object_marking_refs` 掛 **TLP:AMBER 僅控分享**；「local-named／禁自動建立」由 `x_netweaver_sensitivity` ＋ 一個自訂 `statement` marking（記編采限制「documented, not accused」）＋ **CI/pipeline 強制**表達，不靠 TLP。
- 框架鎖：`description` 僅能是「在〔Report〕中被列為〔Narrative〕的放大者」，不得 agentive/指控語氣。
- **紅線**：自動管線**無權**建立/修改 `local-named` 物件；只能人刻意新增、發佈前掃一眼（見 [ARCHITECTURE.md §5](ARCHITECTURE.md)）。

---

## 9. STIX → NetWeaver operator 視圖（投影對照）

STIX 是 Campaign 中心；前端 operator 三層是它的投影。**因預設無 `attributed-to`，L1 不能只靠歸因鏈**：

| operator 視圖 | 來自 STIX（優先序） |
|---|---|
| **L1 Operator** | ① IMS（Campaign `related-to` 的分組）／② 策展指派的 operator／③ 有 `attributed-to` 時才上捲到具名 Threat Actor |
| **L2 行動** | Campaign |
| **L3 逐來源宣稱(claim)** | 每物件/關係的 `x_netweaver_evidence`（引文）＋ `external_reference`（url）← Report |
| 頻道／敘事／TTP | Channel / Narrative / Attack Pattern（Campaign `uses` …） |
| roll-up 上溯 | Campaign → IMS →（僅在有 `attributed-to` 時）→ Threat Actor |
| B-lite 來源 chips | 物件的 `external_references` |

**現有 NetWeaver category → STIX 物件**（既有 57 筆對映）：

| db.js `category` | STIX 物件（預設） |
|---|---|
| `cib-network` | `intrusion-set` (IMS) |
| `state-organ`／`tech-vendor`／`pr-firm` | **`identity`（預設）**；`threat-actor` 僅證據支持惡意操作意圖時 |
| `state-media`／`content-farm`／`domestic-amplifier` | `x-dad-channel` |
| `commentator` | `identity`(individual) ＋ `local-named` gate |
| Event（行動） | `campaign` |
| Narrative | `x-dad-narrative` |
| Source | `report` ＋ external_reference |
| `related` 邊 | relationship SRO（依 §3／§7 對映） |

> `data/db.js` 因此降為**投影產物**：projector 把 STIX bundle 檔＋策展編譯成靜態 db.js 給前端讀（static-first，不必架 OpenCTI；要時隨時可餵）。

---

## 10. 決定性 ID（依物件類別）

`<type>:<slug>` 不足以穩定，分類別定規則；`NS` = NetWeaver 命名空間 UUID：

| 類別 | ID 規則 |
|---|---|
| 具名實體（identity/threat-actor/intrusion-set/x-dad-channel/x-dad-narrative/tool/infrastructure） | `UUIDv5(NS, "<type>:<curated-canonical-slug>")`；**slug 為策展 canonical**，改名走 `aliases` 不改 id；拆／併走人工遷移 |
| Report（來源） | `UUIDv5(NS, 正規化 source_url)`；無 url 用 `sha256(內容)+date` |
| SCO（url/ipv4/email/domain…） | STIX 2.1 **決定性 observable UUIDv5**（依 spec 的 contributing properties，如 `url.value`） |
| SRO（關係） | `UUIDv5(NS, "<relationship_type>:<source_id>:<target_id>")`；**證據更新走 `modified`，不新增 id**；關係 `confidence` 取保守值（min confirmed），逐來源 confidence/hedge 存於 `x_netweaver_evidence[]` |

- `created` 固定；`modified` 於重抽有實質變更時更新（STIX 版本化）。
- 同一實體重抽 → 同 id → OpenCTI upsert 而非 duplicate。

---

## 11. Worked example（照使用者的圖，已修正）

**Report**：Threats-to-LINE Romance Scam Operation Report (2026-07-09) → `report`，`object_refs` 指向下列，`external_references[0].url` = 報告連結。

**Campaign**：「Unattributed campaign using fake personas on Threads targeting Taiwan (2026-01~)」
- `related-to` → **IMS**（**無** `attributed-to`、**無** Threat Actor——證據不足，符合原則 6）
- `uses` → Narrative（`x-dad-narrative`：Romance/emotional scam；Investment scam）
- `uses` → Channel（`x-dad-channel`：Threads `@account_a`／Website `example-site.work`／Facebook `page_x`）→ 各 `x-dad-publishes` → Media Content
- `uses` → Attack Pattern（DISARM T0097／T0049.001／T0002，引官方 bundle）
- `uses` → Tool（LINE）、Infrastructure（VPS/Hosting/Domain/CDN）
- `targets` → Location（Taiwan）
- `related-to` → Observable（url/ipv4/email/domain；電話改記 `identity.contact_information`）

**投影**：因無歸因，此 Campaign 掛在其 **IMS** 下呈現為一則「行動」；每條宣稱附該 Report 引文（L3）。若日後有明確歸因（人工閘），才建 `IMS attributed-to Threat Actor`，operator 層上捲到具名行為者。

---

## 12. v1 範圍（採用 now vs later）

| 現在（v1 profile） | 後期 |
|---|---|
| Campaign／IMS／Identity／`x-dad-narrative`／`x-dad-channel`／Report／Observable／Location／Tool／Infra | Threat Actor（僅證據足）、`x-dad-event`、`incident` |
| grounding(evidence 陣列)、保守歸因(related-to 預設)、local-named 標記、分類別 UUIDv5、confidence 對映 | DISARM TTP 標記（輔助）、Media Content 完整化、官方 DAD-CDM extension ID |
| STIX-lite → 合法 STIX serializer（pin DISARM 版本、x-dad ext-def） | 完整擴充驗證、TAXII/OpenCTI 遞送 |

---

*本 profile 定案後，抽取管線（③）以此為靶、claims（④）為其投影。修改 profile ＝ 修改抽取合約，需同步 serializer 與 projector。*
