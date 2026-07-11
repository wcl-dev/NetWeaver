# 抽取 gold 標註契約 v0.1

**目的**：定義「一個正確的 mention／assertion 是什麼」，讓抽取品質**可量測**（gold set）且**標註者一致**。這是版本化 policy——改契約須同步改 gold 並重跑 harness（同 [filter 的 policy table](../pipeline/filter.py) 精神）。

背景與方法論見 [ARCHITECTURE.md](ARCHITECTURE.md)、[STIX-PROFILE.md](STIX-PROFILE.md)。契約由 Codex（gpt-5.6-sol）審查 [extract.py](../pipeline/extract.py) 現況後定案。

---

## 0. 核心原則（決定 gold 怎麼標）

**模型抽取・碼判斷**。模型只做「忠實逐字抽取組件」；**分類、關係型別、信心、歸因、去重、operation 分群**全由碼（derive）做。因此 gold 分兩個評分面，**互不混淆**：

| 面 | 標的 | 評誰 |
|---|---|---|
| **A. 模型抽取面** | 逐字 mention（組件）＋ assertion（有向邊）| LLM 抽取品質 |
| **B. 碼組裝面** | operation／campaign 節點、關係型別、歸因 | derive 的碼，不評模型 |

> **operation 是 B 面（碼組裝），不是模型 mention。** 這是本契約最關鍵的一條，來自「operation 常是分析者概念、原文未必有可逐字複製的名字」——強要模型逐字抽會結構性矛盾。故模型只抽 actor／narrative／target／behavior 的**逐字組件**，operation 節點由碼依 `actor × narrative × target` 組裝、名稱可合成。

---

## 1. mention（模型抽取面）

**定義**：cleaned text 中，指涉一個「關注實體」的一段文字。

**標註欄位**
| 欄 | 說明 |
|---|---|
| `gold_entity_id` | 能對到 [db.js](../data/db.js) 既有實體 → 用其 id；否則給臨時 `g:<slug>` |
| `surface` | **逐字**如原文所寫 |
| `evidence_start` / `evidence_end` | 在 **cleaned text** 的字元 offset（保留 raw→cleaned offset map，才能回指來源）|
| `role` | `actor` / `account` / `website` / `media` / `narrative` / `target-place` / `target-org` |
| `aliases` | 此實體的合法別名清單——**僅供 entity-level 評分**，不是額外 mention |

**算 mention 的**：假帳號叢集、公司/機關、個人、被推的敘事/口號、假網站/粉專、目標國/目標政黨。

**不算 mention（不標）**：撰報的 researcher／publisher 機構；當**宿主**的平台（Threads/X/Facebook）；泛用背景（「近期」「社群媒體」）。

**同一實體多種 surface**（PRC／中國／中華人民共和國）：都標為 occurrence，但共用同一 `gold_entity_id`。

---

## 2. assertion（模型抽取面）

**定義**：兩個 gold mention 之間的**有向邊**。

**標註欄位**
| 欄 | 說明 |
|---|---|
| `subject_id` / `object_id` | 兩端的 `gold_entity_id`；**兩端都須是 gold 實體** |
| `predicate` | 來源的**逐字**動詞片語（`operated by`／`targeting`／`linked to`…）|
| `evidence_start` / `evidence_end` | 支持此邊的逐字原文 span |

**方向有意義**：`A operated-by B` ≠ `B operated-by A`。

**模型不選 STIX 關係型別**——那由 derive 的 ladder 依逐字 predicate 決定。

---

## 3. evidence（硬性）

**每個 mention 與 assertion 一律必填 evidence**（cleaned text 的逐字子字串）。**缺 evidence ＝ 不合法**。

> 這一條同時封死一個已確認的 bug：舊 schema `quote` 非必填、`span_check` 只在 quote 非空時檢查 → 模型省略 quote 即繞過 grounding 硬閘。契約定 evidence 必填後，schema 設 `quote` required、span-check **缺 quote 即丟**（fail-closed）。

**offset map**：正文清理（去 HTML/chrome）後，須保留 raw↔cleaned 映射，否則 cleaned span 無法回指原始來源位置。

---

## 4. operation／campaign（碼組裝面）

**模型不抽 operation mention。** gold 在 B 面記錄「這份報告預期組出的 operation 節點」，供 **derive 評測**（非模型評測）：

- **granularity**：一份報告記載一個 campaign → 一個 operation 節點；同報告內明確區分的多個 campaign → 多個。
- **節點內容**：`{actors, narratives, targets, behaviors}` 的組合；名稱可由碼合成（如 `Anti-DPP Impersonation`）。
- **評測**：operation 節點是否由碼從正確的 actor×narrative×target 組出——這是 derive 正確性，與 LLM recall 分開算。

---

## 5. 評分單位（harness 依此實作）

**mention**：predicted↔gold 先以 span overlap／alias／evidence 做**文件內最大權重一對一配對**，再把 predicted `tmp_id` 映射成 `gold_entity_id`（tmp_id 不進評分）。算兩層：
- **occurrence-level**：exact span、overlap span
- **entity-level**：同一實體任一合法別名被抽到

**assertion**：endpoint 映射後，主指標＝**完整 edge precision/recall/F1（含方向）**；predicate exact/overlap 與 evidence grounded rate 為輔。**不可**只在「已配對邊」上算 subject/object 正確率（selection bias）。

**必附護欄**：raw recall vs 過閘後 recall、drop 原因分類（bad quote／dangling／missing quote）、**macro（逐篇平均）非只 micro**、跨 chunk 漏失、按語言/來源/OCR/長度分層、2–3 次重跑變異。

> `predicate ladder 命中率`**只當診斷**（模型可只抽好對的述詞灌高它）。決策主指標＝**逐篇 macro-averaged、span-check 後的完整 assertion edge F1**；護欄＝過閘後 mention recall、JSON 合規率、成本、延遲。

---

## 6. dev / test 切分

- **dev set**：5–8 篇（開發 prompt、錯誤分類、抓 regression）。
- **locked test set**：20–30 篇（才足以下「模型 A 優於 B」的結論；一篇內 20 條 assertion 不是 20 個獨立樣本）。
- **分層**：繁中／英文、OCR PDF／網頁、短文／長文、明確／模糊歸因、報告類型與來源機構。
- **模型比較**：用 paired per-document 差值，不是只看總 F1。

現有 [`samples/*.extraction.json`](../pipeline/samples/) **不是合格 gold**（含合成名稱、意譯述詞、疑似拼接引文，違反逐字契約）→ 降級為 **integration fixtures**（測管線接不接得起來），不當正解。

---

## 7. 變更控制

改本契約 → 同步改受影響 gold → 重跑 harness。任何「放寬」（例如允許 overlap 當命中）須在此明文並附理由。
