# Gold 標註指引（一頁）

給人看的操作規則，降低 inter-annotator variance。正式定義見 [../../docs/GOLD.md](../../docs/GOLD.md)。**校準**：每篇先由兩人獨立標、再 adjudicate 一次分歧。

## 你只做「逐字抽取」
標你能在文中**逐字圈出**的東西；分類/關係/信心/歸因/去重/operation 分群都交給碼。填字串即可，**不要手數字元 offset**（validator 會算）。

## mention 怎麼標
- 一個實體**每次出現**都標一筆（各自 `mid`），同一實體共用 `gid`。
- `entity_type`＝「是什麼」（network/org/narrative/place…）；`context_role`＝「在本文扮演什麼」（actor/target/narrative/suspected-affiliate/amplifier/**amplified-voice**）。**兩者分開**。
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
2. **actor vs suspected-affiliate vs amplified-voice**：直接執行者＝actor；被「likely linked / possibly tied」弱連結的（常是 PRC 機關）＝suspected-affiliate；**言論被行為者放大的第三方（本地政治人物、名嘴）＝`amplified-voice`**——中性、**不含通敵指控**（紅線！絕不可標成 actor/suspected-affiliate）。可記逐字述詞如「呼應」，碼會判成弱關係。**不要**把弱連結寫成 sponsor。
3. **narrative vs 一般內容**：只有被當成「被散播的主張/口號」才標 narrative；純敘述事實不是。
4. **quote 取多長**：夠支持該 mention/兩端即可，別整段複製、也別短到撐不起。
5. **同一還是兩個實體**：名稱不同但明確同指 → 同一 `gid`（去 registry 查/補）；不確定 → 標新 `g:` 並留 note，adjudication 再併。
6. **operation 粒度**：一報一 campaign→一個 operation；同報明確分兩個 campaign→兩個。behavior（手法）v0.2 **不標**。

## gid 命名
- 能對到 [../../data/db.js](../../data/db.js) 既有行為者 → 直接用 db id（如 `anti-dpp-impersonation`）。
- 否則到 [registry.gold.json](registry.gold.json) 查有沒有現成 `g:`（DPP=`g:dpp`、PRC=`g:prc`…）；沒有才新增，**全 gold set 共用同一個**。

## 裁決紀錄（doc02 三方校準：A=Claude、B=Codex、裁決=維運者）——一體適用後續各篇
1. **並列簡稱**（「弱化日、菲」的日/菲）＝獨立 occurrence，共用該國 gid；**口號內部**的片段仍不拆（「跪了日菲」不拆）。
2. **載具不標**：被「借」的事件/文本/場合（日菲聯合聲明、電影、雙城/海峽論壇）不是 actor/target/narrative。
3. **未具名集體**（特定台灣名嘴、少數台灣觀眾）**標** amplified-voice；gid 用 `-unnamed` 後綴，registry 註明「claim-scoped，跨文不必同指」。
4. **分類學標籤**（國防失敗論、疑美論九類）：**定義處不標**；行為者「發起/放大/延續」的**使用處**標為 narrative（家族）——doc04 大量適用。
5. **「放大」的受詞**：有具體引語→指向該 narrative（較精準）；無具體引語→指向人（amplified-voice）。
6. **被引述的貶稱（台当局）、框架詞（正當行為）、情緒引語（看哭/暴哭）都標 narrative**——寧完整勿遺漏（維運者裁定）。
7. **目的子句不建邊**（「以達成…併吞台灣之政治目的」）；**既遂行為**的逐字動詞片語（實施經濟脅迫）建邊。
8. **narrative surface 內部的實體字串不另標**（「執政黨不顧民眾利益」裡的執政黨、「賣台護台」裡的解放军）。
9. 主詞省略的後續子句要建邊：quote 往前延伸到含主詞；若 predicate 因此在 quote 內重複（歧義）→ 不建邊、記 notes。

## 裁決紀錄（doc04 校準）
10. **未具名行為者類**：僅標「有專屬使用句＋邊」的具體類（台灣名嘴）；泛列舉（台灣內部行為者、名嘴/媒體/政治人物並列）與循環定義（疑美論發起者）不標。**role 依凍結 GOLD**：來源未明示任務指派/付費/控制/協調證據 → `amplified-voice`，不得 actor——「發起/放大」逐字記在邊上、由碼判（紅線在述詞 ladder）。
11. **標題／小節標題不標**（正文會重複，避免雙重計數）。
12. **抽象關係體不標**（台美關係、民主同盟——非 entity_type 語意；network＝帳號網絡）。**宣稱/稱/指控後的主張子句**（美國將拋棄盟友…）標 narrative；**情勢名詞**（美國內混亂）不標。
13. **「指控X霸道」型**：標受攻擊實體為 target（邊 `指控→X`）；主張內容由既標的敘事家族（反世界、壓迫者印象）覆蓋，不另建薄 narrative。
14. **複合述詞拆邊**（「發起、放大」→ 發起、放大兩條邊）；**predicate 不含副詞**（持續/仍傾向/搶著）。
> IAA 發現：B 曾把原文繁體「美國大搞」轉錄成簡體「美国大搞」→ 被 exact-quote 驗證擋下。**引文必須複製貼上，不可手打**——人也需要 span-check。

## 交件前
跑 `python3 pipeline/gold/validate_gold.py your.gold.json`——quote 全 exact 命中、gid 都解析得到、surface/predicate 落在 quote 內、無重複 quote 歧義，才算合格。
