# Gold 標註指引（一頁）

給人看的操作規則，降低 inter-annotator variance。正式定義見 [../../docs/GOLD.md](../../docs/GOLD.md)。**校準**：每篇先由兩人獨立標、再 adjudicate 一次分歧。

## 你只做「逐字抽取」
標你能在文中**逐字圈出**的東西；分類/關係/信心/歸因/去重/operation 分群都交給碼。填字串即可，**不要手數字元 offset**（validator 會算）。

## mention 怎麼標
- 一個實體**每次出現**都標一筆（各自 `mid`），同一實體共用 `gid`。
- `entity_type`＝「是什麼」（network/org/narrative/place…）；`context_role`＝「在本文扮演什麼」（actor/target/narrative/suspected-affiliate/amplifier）。**兩者分開**。
- `surface` 逐字照抄；`quote` 取一段能支持這個 mention 的原句，且 surface 要落在 quote 內。

### 標 / 不標（正反例）
| 標 | 不標 |
|---|---|
| 假帳號叢集、假粉專、公司/機關、個人 | 撰報單位（Doublethink Lab、Citizen Lab）|
| 被推的敘事/口號逐字 | 宿主平台當 actor（Threads/X/FB 是宿主，不是行為者）|
| 目標國、目標政黨 | 泛用背景詞（「社群媒體」「近期」）|
| 弱歸因指向的贊助方（PRC）→ `suspected-affiliate` | 記者對事件的評論、方法段落 |

## assertion 怎麼標
- 兩端都要是你已標的 gold 實體（用 `gid`）；**方向要對**（誰對誰做）。
- `predicate` 必須是原句**真正的動詞片語**：用 `posted` 不是名詞 `posts`；用 `linked to`、`operated by`、`targeting`。
- `quote` 要**同時涵蓋兩端**能連起來的語境，predicate 要落在 quote 內。
- **hedge 照標**：`can likely be linked to` 仍是一條 assertion（碼會判成 related-to、不歸因）——**不要因為不確定就不標**。

## 最容易不一致的地方（先講好）
1. **回指**（`the accounts`／`the network`／代名詞）：只在它**明確**回指某已標實體時，才當同一實體的又一 occurrence；模糊就不標。
2. **actor vs suspected-affiliate**：直接執行者＝actor；被「likely linked / possibly tied」弱連結的（常是 PRC 機關）＝suspected-affiliate。**不要**把弱連結寫成 sponsor。
3. **narrative vs 一般內容**：只有被當成「被散播的主張/口號」才標 narrative；純敘述事實不是。
4. **quote 取多長**：夠支持該 mention/兩端即可，別整段複製、也別短到撐不起。
5. **同一還是兩個實體**：名稱不同但明確同指 → 同一 `gid`（去 registry 查/補）；不確定 → 標新 `g:` 並留 note，adjudication 再併。
6. **operation 粒度**：一報一 campaign→一個 operation；同報明確分兩個 campaign→兩個。behavior（手法）v0.2 **不標**。

## gid 命名
- 能對到 [../../data/db.js](../../data/db.js) 既有行為者 → 直接用 db id（如 `anti-dpp-impersonation`）。
- 否則到 [registry.gold.json](registry.gold.json) 查有沒有現成 `g:`（DPP=`g:dpp`、PRC=`g:prc`…）；沒有才新增，**全 gold set 共用同一個**。

## 交件前
跑 `python3 pipeline/gold/validate_gold.py your.gold.json`——quote 全 exact 命中、gid 都解析得到、surface/predicate 落在 quote 內、無重複 quote 歧義，才算合格。
