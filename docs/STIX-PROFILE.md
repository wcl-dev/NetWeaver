# NetWeaver STIX Profile — 抽取的固定靶（中介格式規格）

> **這份文件是什麼**：報告格式不一，若讓 LLM 直接萃取進自訂 schema 會不穩。我們插入一個**固定的中介格式當靶**：STIX 2.1（採 VIGINUM OpenCTI doctrine + OASIS DAD-CDM profile）。
> 本文＝那個靶的規格。抽取管線（③）照它打，claim-level 呈現（④）是它的投影。
> 依據：使用者提供的 STIX/OpenCTI 建模圖 + VIGINUM/SGDSN《Doctrine OpenCTI》+ DAD-CDM 擴充。搭配 [ARCHITECTURE.md](ARCHITECTURE.md)、[SCHEMA.md](SCHEMA.md) 閱讀。

---

## 1. 核心建模原則

1. **Campaign 為中心節點**，向外連 Narrative／Channel／Attack Pattern(DISARM)／Tool／Infrastructure／Target。
2. **IMS（Information Manipulation Set）＝ STIX `intrusion-set`**：協調行為／個人／頻道與工具之群組，**未歸因時停在此**。
3. **DISARM 以 `attack-pattern` 表現**（TA*/T* 掛 external_references）。
4. **操作網站/帳號/頁面＝ Channel（DAD-CDM SDO）**；技術指標（URL/IP/Email/Phone/Domain）＝ Observable(SCO)。
5. **Media Content（貼文/影片/圖片/文章）＝ DAD-CDM SDO，內含 Observable**。
6. **歸因保守（紅線）**：證據不足時**不要**建立 `attributed-to` 到 Threat Actor；Campaign 預設停在 IMS。
7. **（NetWeaver 追加）Grounding 必備**：每個物件都掛來源 Report＋逐字引文，抽不出引文→不建立。
8. **（NetWeaver 追加）敏感標記**：具名在世在地個人/媒體 → TLP:AMBER＋機器**永不自動建立**（紅線，見 §7）。
9. **（NetWeaver 追加）operator 視圖是投影**：STIX 是 Campaign 中心，NetWeaver 前端是 operator 中心——後者由前者投影而來（見 §9）。

---

## 2. 物件集（抽取目標）

**N**=STIX 原生 SDO／SCO；**X**=DAD-CDM 擴充。

| 物件 | STIX 型別 | N/X | 用途 | 必填 | 選填 |
|---|---|---|---|---|---|
| **Campaign** | `campaign` | N | 中心分析單位＝一次行動 | name, description, first_seen | last_seen, objective |
| **IMS** | `intrusion-set` | N | 未歸因的操作集群（行為/帳號/工具） | name | aliases, first_seen |
| **Threat Actor** | `threat-actor` | N | 具名行為者（**僅證據充分時**） | name | threat_actor_types, roles |
| **Identity** | `identity` | N | 機關/公司/個人/目標實體 | name, identity_class | sectors, contact |
| **Narrative** | `narrative` | X | 資訊操作敘事（可巢狀） | name, description | narrative_types, parent |
| **Channel** | `channel` | X | 社群帳號/網站/粉專/官媒 | name, channel_type | platform, url, exposure_tier |
| **Attack Pattern** | `attack-pattern` | N | DISARM 技術 | name, external_references(DISARM) | kill_chain_phases |
| **Media Content** | `media-content` | X | 貼文/影片/圖片/文章 | content_type | url, publication_date |
| **Observable** | `url`/`ipv4-addr`/`email-addr`/`domain-name`/`file` | N(SCO) | 技術指標 | value | — |
| **Location** | `location` | N | 目標/來源地理 | country | region |
| **Tool** | `tool` | N | 通訊/散布工具（如 LINE） | name | — |
| **Infrastructure** | `infrastructure` | N | VPS/託管/域名/CDN | name, infrastructure_types | — |
| **Report** | `report` | N | **來源**（報告/新聞/情資） | name, published, object_refs, external_references(url) | report_types |
| **Event** | `event` | X | 被利用的真實事件（選填/後期） | name | timestamp |

---

## 3. 關係（Relationship SRO）

| 來源 | 關係 (`relationship_type`) | 目標 | 意義 | 附註 |
|---|---|---|---|---|
| Campaign | `uses` | Narrative / Channel / Attack Pattern / Tool / Infrastructure | 行動使用 | |
| Campaign | `targets` | Identity / Location / Event | 鎖定目標 | |
| Campaign | `attributed-to` | **IMS** | 行動歸屬於操作集群 | 預設層級 |
| IMS | `attributed-to` | **Threat Actor** | **僅證據充分/官方歸因時** | **保守，見 §7** |
| Channel | `publishes` | Media Content | 頻道發布內容 | DAD-CDM 關係 |
| Channel | `amplifies` | Channel | 頻道放大另一頻道 | DAD-CDM 關係 |
| Campaign | `related-to` | Observable | 行動與技術指標相關 | 弱關係 |
| Report | (`object_refs`) | 上述任一物件 | **來源/證據**：報告涵蓋這些物件 | grounding 核心 |

> **弱關係優先**：來源說「linked to / associated with」→ `related-to`，**不是** `attributed-to`。見 §7。

---

## 4. DISARM 掛法

- DISARM 技術 → `attack-pattern`；`name` = 技術名；`external_references = [{source_name:"DISARM", external_id:"T0097"}]`；`kill_chain_phases` 標 DISARM 階段（Plan/Prepare/Execute/Assess）。
- 例：`T0097 Creation of Personas`、`T0049.001 Amplification by Trolls`、`T0002 Facilitate State Propaganda`。
- **v1 抽取不自動判 TTP**（prose 難穩定抽）——DISARM 標記列為**輔助後期**（LLM 提議、人確認），見 [ARCHITECTURE.md §8](ARCHITECTURE.md)。

---

## 5. Grounding 要求（NetWeaver 硬規則）

每個 SDO/SRO 都必須可回溯到來源：
- 掛在某個 `report`（`report.object_refs` 含此物件）。
- `external_references` 至少一個含來源 `url`。
- 自訂欄 `x_netweaver_evidence = { source_ref, quote(逐字), span?, hedge }`——逐字引文是 claim 卡的原料。

**不變量**：無 grounding 的物件不得建立。→ 保證「沒有無來源的行為者/宣稱」。

---

## 6. STIX-lite 中介 vs 合法 STIX（分工）

LLM 不直接吐合法 STIX（UUID/必填/SRO 易錯）。分兩段：

| 段 | 誰做 | 產物 |
|---|---|---|
| **STIX-lite** | LLM（forced schema） | 上述物件的**概念形**＋關係＋每項 `x_netweaver_evidence`（引文）。用暫時 slug 當 ref，不含 UUID。 |
| **合法 STIX 2.1** | deterministic serializer（碼） | 補 UUIDv5、接 SRO、填必填欄、掛 DISARM external_ref、DAD-CDM SDO、markings。 |

**LLM 做語意、程式做語法。**

---

## 7. 保守歸因規則（紅線的機器版）

1. Campaign 預設 `attributed-to` **IMS**；**不自動**上攀 Threat Actor。
2. `IMS → attributed-to → Threat Actor` **僅當**：來源用語支持控制關係（run by/operated by/directed by/官方歸因）**且** confidence ≥ medium。否則停在 IMS。
3. 關係取**最弱一致**：來源「linked/associated」→ `related-to`；不得升級。逐字用語存 `x_netweaver_evidence.quote`。
4. STIX 匯出**永不**把 NetWeaver 的 `operated-by/runs` 自動映成 STIX `attributed-to`——否則「記錄非指控」在匯出邊界崩潰。

---

## 8. 敏感標記 / local-named 紅線

- 具名在世在地個人/媒體（任何目標國）→ `identity`（class=individual/organization）＋ `x_netweaver_sensitivity="local-named"` ＋ `marking-definition = TLP:AMBER`。
- 框架鎖：`description` 僅能是「在〔Report〕中被列為〔Narrative〕的放大者」，不得 agentive/指控語氣。
- **紅線**：自動管線**無權**建立/修改 `local-named` 物件——只能人刻意新增，發佈前掃一眼（見 [ARCHITECTURE.md §5](ARCHITECTURE.md)）。

---

## 9. STIX → NetWeaver operator 視圖（投影對照）

STIX 是 Campaign 中心；前端 operator 三層是它的投影：

| operator 視圖 | 來自 STIX |
|---|---|
| **L1 Operator** | Threat Actor / IMS（Campaign 沿 `attributed-to` 上捲；operator＝attacker 角色者） |
| **L2 行動** | Campaign（或 `incident`） |
| **L3 逐來源宣稱(claim)** | 每物件的 `x_netweaver_evidence`（引文）＋ `external_reference`（url）← Report |
| 頻道／敘事／TTP | Channel / Narrative / Attack Pattern（Campaign `uses` …） |
| roll-up 上溯 | Campaign → `attributed-to` → IMS → (`attributed-to`) → Threat Actor（保守） |
| B-lite 來源 chips | 物件的 `external_references` |

> `data/db.js` 因此降為**投影產物**：projector 把 STIX bundle 檔＋策展編譯成靜態 db.js 給前端讀（static-first，不必架 OpenCTI；要時隨時可餵）。

**現有 NetWeaver category → STIX 物件**（既有 57 筆的對映）：

| db.js `category` | STIX 物件 |
|---|---|
| `cib-network` | intrusion-set (IMS) |
| `state-organ`／`tech-vendor`／`pr-firm` | threat-actor ＋ identity |
| `state-media`／`content-farm`／`domestic-amplifier` | channel (DAD-CDM) |
| `commentator` | identity(individual)＋`local-named` gate |
| Event | campaign／incident |
| Narrative | narrative (DAD-CDM) |
| Source | report ＋ external_reference |
| `related` 邊 | relationship SRO |

---

## 10. 決定性 ID

STIX `id` = UUIDv5(NETWEAVER_NAMESPACE, `<type>:<slug>`)。同一實體重抽產生同一 id → bundle idempotent，OpenCTI 是 update 不是 duplicate。

---

## 11. Worked example（照使用者的圖）

**Report**：Threats-to-LINE Romance Scam Operation Report (2026-07-09)
→ `report` object，`object_refs` 指向下列全部，`external_references[0].url` = 報告連結。

**Campaign**：「Unattributed campaign using fake personas on Threads targeting Taiwan (2026-01~)」
- `uses` → Narrative（Romance/emotional scam；Investment scam）
- `uses` → Channel（Threads `@account_a`／Website `example-site.work`／Facebook `page_x`）→ 各 `publishes` → Media Content
- `uses` → Attack Pattern（T0097／T0049.001／T0002）
- `uses` → Tool（LINE）、Infrastructure（VPS/Hosting/Domain/CDN）
- `targets` → Location（Taiwan）
- `attributed-to` → IMS（**無 Threat Actor**——證據不足，符合原則 6）
- `related-to` → Observable（URL/IP/Email/Phone/Domain）

**投影到 operator 視圖**：因無歸因，此 Campaign 掛在其 **IMS** 下呈現為一則「行動」；每條宣稱附該 Report 引文（L3）；Channel/Narrative/TTP 列為 uses。若日後有證據把 IMS `attributed-to` 某 Threat Actor，operator 層才上捲到具名行為者。

---

## 12. v1 範圍（採用 now vs later）

| 現在（v1 profile） | 後期 |
|---|---|
| Campaign／IMS／Identity／Narrative／Channel／Report／Observable／Location／Tool／Infra | Threat Actor（僅證據足）、Event SDO |
| grounding、保守歸因、local-named 標記、UUIDv5 | DISARM TTP 標記（輔助）、Media Content 完整化 |
| STIX-lite → 合法 STIX serializer | 完整 DAD-CDM 擴充驗證、TAXII/OpenCTI 遞送 |

---

*本 profile 定案後，抽取管線（③）以此為靶、claims（④）為其投影。修改 profile ＝ 修改抽取合約，需同步 serializer 與 projector。*
