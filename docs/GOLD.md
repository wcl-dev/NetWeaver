# 抽取 gold 標註契約 v0.2（已凍結）

> **狀態：FROZEN**。經 Codex（gpt-5.6-sol）五輪對抗式複審定案，validator 全綠。可開始標註 dev set；改契約須依 §10 變更控制。

**目的**：定義「一個正確的 mention／assertion 是什麼」，讓抽取品質**可量測**（gold set）且**標註者一致**。這是版本化 policy——改契約須同步改 gold 並重跑 harness（同 [filter 的 policy table](../pipeline/filter.py) 精神）。

背景見 [ARCHITECTURE.md](ARCHITECTURE.md)、[STIX-PROFILE.md](STIX-PROFILE.md)。標註實務見 [GUIDELINES](../pipeline/gold/GUIDELINES.md)。契約經 Codex（gpt-5.6-sol）兩輪審查定案（v0.1→v0.2 補齊 occurrence 評分、type/role 分離、結構化 derive 期望、全域 entity registry、offset 規格）。

---

## 0. 核心原則（決定 gold 怎麼標）

**模型抽取・碼判斷**。模型只做「忠實逐字抽取組件」；**分類、關係型別、信心、歸因、去重、operation 分群**全由碼（derive）做。gold 分兩個評分面，**互不混淆**：

| 面 | 標的 | 評誰 |
|---|---|---|
| **A. 模型抽取面** | 逐字 mention（組件，附 occurrence）＋ assertion（有向邊）| LLM 抽取品質 |
| **B. 碼組裝面** | operation／campaign 節點、關係型別、歸因 | derive 的碼，不評模型 |

> **operation 是 B 面（碼組裝），不是模型 mention。** operation 常是分析者概念、原文未必有可逐字複製的名字；強要模型逐字抽會結構矛盾。故模型只抽 actor／narrative／target 的**逐字組件**，operation 節點由碼依 `actor × narrative × target` 組裝、名稱可合成。
>
> **behavior（TTP／手法，如冒充、盜圖、協同貼文）v0.2 不納入 gold**，列為 planned extension——待要做 DISARM/TTP 標籤時再加 `entity_type=behavior`。operation 目前組成＝`actor × narrative × target`。

---

## 1. mention（模型抽取面）

**定義**：cleaned text 中，指涉一個「關注實體」的**一次出現（occurrence）**。同一實體多次出現＝多筆 mention，共用 `gid`。

**標註者填的欄位**（只填字串，**不手填 offset**）
| 欄 | 說明 |
|---|---|
| `mid` | 此 occurrence 的唯一 id（檔內唯一，如 `m1`）|
| `gid` | 跨檔 **entity id**：能對到 [db.js](../data/db.js) 既有實體 → 用其 id；否則用 [gold registry](../pipeline/gold/registry.gold.json) 的 `g:<slug>` |
| `entity_type` | **對齊模型 `coarse_type`**：`person`/`org`/`network`/`account`/`website`/`media`/`narrative`/`tool`/`infrastructure`/`place`/`url`/`domain` |
| `context_role` | 此實體在本文的角色：`actor`/`target`/`narrative`/`suspected-affiliate`/`amplifier` |
| `surface` | **逐字**如原文所寫（須落在此 mention 的 `quote` 內）|
| `quote` | 支持此 mention 的**逐字**原文（cleaned_text 的子字串）|

**offset 由 validator 衍生**（`surface_start/end`、`quote_start/end`），**不是 gold 真相**、不手填——避免 Unicode 單位分歧（見 §5）。

**算 mention 的**：假帳號叢集、公司/機關、個人、被推的敘事/口號、假網站/粉專、目標國/目標政黨、（弱）歸因指向的贊助方。
**不算 mention**：撰報的 researcher／publisher；當**宿主**的平台（Threads/X/FB）；泛用背景。
**entity_type vs context_role 為何要分**：同一 `org` 可能是 actor（施為者）或 target（受害政黨）或 suspected-affiliate（被弱連結的 PRC 機關）——type 描述「是什麼」、role 描述「在本文扮演什麼」，分開才評得公平。

**誰進模型評分**：`entity_type` **對齊模型 `coarse_type`、進模型抽取評分**（模型會輸出 type）。`context_role` 是 **gold 分析欄、模型不輸出、不進 recall 指標**——只供分層切片與 derive 評測。同一 `gid` 的所有 occurrence 應共用同一 `entity_type`（validator 檢查一致性）。

---

## 2. assertion（模型抽取面）

**定義**：兩個 gold 實體之間的**有向邊**。

| 欄 | 說明 |
|---|---|
| `aid` | 此邊的唯一 id（檔內唯一）|
| `subject` / `object` | 兩端的 **`gid`**（實體層）；兩端都須是 gold 實體 |
| `subject_mid` / `object_mid` | **必填**：兩端各指一個 occurrence（mention 的 `mid`），其 surface 絕對 span 須落在此 assertion 的 `quote` span 內 |
| `predicate` | 來源的**逐字動詞片語**（須落在 `quote` 內；必須是原句真正的動詞，`posted` 非 `posts`）|
| `quote` | 支持此邊的逐字原文（須同時涵蓋能連起兩端的語境）|

**方向有意義**：`A operated-by B` ≠ `B operated-by A`。**hedge 照標**：`can likely be linked to` 仍是一條 assertion，derive 預期停在 `related-to`（不 attributed-to）。**模型不選 STIX 關係型別**——那由 derive 的 ladder 依逐字 predicate 決定。

**occurrence grounding（硬性）**：`subject_mid`/`object_mid` **必填**，assertion 的 `quote` **必須同時涵蓋這兩個 occurrence 的 surface span**（validator 以絕對 offset 檢查，非字串包含）——否則延長 quote 或改指正確 occurrence。
**回指（anaphora）**：主詞若在文中以回指詞出現（如 `the accounts`、`the network`），**須為該回指新增一筆 occurrence mention**（自己的 `mid`、共用 `gid`），`subject_mid` 指它；**不得**跨句指向前文的另一 occurrence 而 quote 撐不起。`predicate` 必須是該 assertion `quote` 內的逐字動詞。

---

## 3. evidence / grounding（硬性）

**每個 mention 與 assertion 一律必填 `quote`**（cleaned_text 的**逐字子字串**）。缺 quote／非逐字 ＝ 不合法。這封死了舊 bug（`quote` 非必填、span_check 只在非空時檢查 → 省略即繞過硬閘）；現 schema `quote` required、span-check **fail-closed**。

validator 額外驗：`surface` 落在其 mention 的 `quote` 內、`predicate` 落在 assertion 的 `quote` 內（否則引文與標的對不上）。

---

## 4. operation／campaign（碼組裝面）

模型不抽 operation。gold 在 B 面記錄「這份報告預期組出的 operation 節點」，供 **derive 評測**：

```json
{
  "name": "Anti-DPP Taiwanese-Impersonation",     // 名稱可由碼合成
  "actors": ["anti-dpp-impersonation"],
  "narratives": ["g:narr-oppose-greens"],
  "targets": ["g:dpp"],
  "derive_expected": [                             // 結構化、機器可判——非自然語言
    {"source": "anti-dpp-impersonation", "relationship_type": "related-to",
     "target": "g:prc", "attributed_to_expected": false}
  ]
}
```

- **granularity**：一份報告記載一個 campaign → 一個 operation；同報告明確區分的多個 campaign → 多個。
- **成員為明確列舉、非笛卡兒積**：每個 operation 的 `actors`/`narratives`/`targets` 是**明文列出的成員集合**；多 campaign ＝ 多個 `operation_expected` 條目、各自成員集。**derive 必須依此明確分群，不得把全文所有 actor×narrative×target 交叉相乘**（否則多 campaign 會爆出錯誤組合）。評測即比對這些明確集合。
- **不放 sponsor 這種強欄位**：弱連結（likely linked）只能寫成 `related-to`＋`attributed_to_expected:false`，不得寫 `sponsor`。
- **評測**：operation 是否由碼從正確的 actor×narrative×target 組出、關係型別與歸因是否如 `derive_expected`——這是 derive 正確性，與 LLM recall 分開算。

---

## 5. offset 與文本規格

- **offset 是 validator 載入時衍生值**，不提交為 gold 真相；標註者只提供逐字字串。
- **單位＝Unicode code point、end-exclusive**（Python 字串索引原生如此；JS 端若用 UTF-16 slice，中文＋emoji 會分歧，載入時須換算）。
- **重複 quote 消歧**：若一段 `quote` 在 cleaned_text 出現多次，須加 `quote_occurrence`（1-based 第幾次）指定；validator 對非唯一且未指定者報 ambiguity。dev set 明訂含重複 quote 案例。
- gold 檔存 **`cleaner_version` ＋ `text_sha256`**（cleaned_text 的 SHA-256）。**gold 必須針對模型實際會收到的完全相同文本**；若只是摘錄，須標 `"kind": "excerpt-fixture"`，不得當 dev document。

---

## 6. 全域 entity registry（`g:` namespace）

跨報告重用的非 db.js 實體（如 DPP、PRC、具名 narrative）集中在 [pipeline/gold/registry.gold.json](../pipeline/gold/registry.gold.json)：

- `g:` 是**全 gold set 全域 namespace**，不是單檔臨時 id——同一 DPP 在多篇 gold 必須是同一個 `g:dpp`。
- 能對到 db.js 既有實體就用 **db id**（如 `anti-dpp-impersonation`），不另建 `g:`。
- registry 每筆：`name`、`aliases`（真正同指的名稱；**不得**放 narrative 字串或合成 display name）、可選 `type`、`note`。
- validator 檢查：gold 用到的每個 `gid` 都能在 db.js 或 registry 解析。

---

## 7. 評分單位（harness 依此實作）

**mention**：predicted↔gold 先以 span overlap／alias／evidence 做**文件內最大權重一對一配對**，再把 predicted `tmp_id` 映射成 `gid`（tmp_id 不進評分）。算兩層：
- **occurrence-level**：exact span、overlap span（用 `mid` 的衍生 offset）
- **entity-level**：同一 `gid` 任一合法別名被抽到

**assertion**：endpoint（`gid`）映射後，主指標＝**完整 edge precision/recall/F1（含方向）**；predicate exact/overlap 與 grounded rate 為輔。**不可**只在「已配對邊」上算 subject/object 正確率（selection bias）。

**必附護欄**：raw recall vs 過閘後 recall、drop 原因分類（bad-quote／missing-quote／dangling，**記在 prediction/harness、非 gold**）、**macro（逐篇平均）非只 micro**、跨 chunk 漏失、按 §strata 分層、2–3 次重跑變異。

> `predicate ladder 命中率`只當診斷（模型可只抽好對的述詞灌高它）。**決策主指標＝逐篇 macro-averaged、span-check 後的完整 assertion edge F1**；護欄＝過閘後 mention recall、JSON 合規率、成本、延遲。

---

## 8. dev / test 切分

- **dev set**：5–8 篇（開發 prompt、錯誤分類、抓 regression）。建議 7 篇分層：英短 hedged／繁短明確／英長多 chunk／繁中原生 PDF 長文／OCR PDF（斷行頁首錯字）／同篇兩 campaigns（測 grouping）／弱歸因邊界（防 derive 硬湊）。控制：≥3 來源機構、每源≤2 篇、≥1 篇有重複相同 quote、≥1 篇含跨檔已知 entity、≥1 篇多數為新 entity。
- **locked test set**：20–30 篇（才足以下「模型 A 優於 B」的結論；一篇內 20 條 assertion 不是 20 個獨立樣本）。模型比較用 paired per-document 差值。

現有 [`samples/*.extraction.json`](../pipeline/samples/) **不是合格 gold**（含合成名稱、意譯述詞、疑似拼接引文）→ 降級為 **integration fixtures**。

---

## 9. 待辦（凍結 harness 前必解）

- **extract.py／schema 仍要模型抽 operation**（[extract.py](../pipeline/extract.py) `INSTR`、schema `coarse_type` 含 `operation`）——與 §0「operation 碼組裝」衝突，跑 harness 前須同步（改 prompt 不抽 operation ＋ derive 補 operation 組裝）。
- chunk offset 以全文件為基準、保存 chunk boundaries；跨 chunk 關係需 document-level linking。

## 10. 變更控制

改本契約 → 同步改受影響 gold → 重跑 validator/harness。任何「放寬」（如允許 overlap 當命中）須在此明文並附理由。
