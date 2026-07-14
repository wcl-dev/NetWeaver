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

## 裁決紀錄（doc05 校準）
15. **role 依證據強度分級**：來源明示「設立/委託」（控制/任務指派證據）→ `actor`；僅「關係密切」（弱連結）→ `suspected-affiliate`；**被偽冒＝`target`**（身分被盜用≠言論被放大，勿誤用 amplified-voice）。
16. **被創建的傳散資產**（假媒體、查獲帳號叢集）＝`amplifier`（通道），非 actor；**連動句省略主詞時，邊的主詞＝語法主詞**（海賣創建…推播…炒作…批評 → 主詞都是海賣），不推斷到資產。
17. **surface 不含引號/書名號**（「」《》）；quote 可含。
18. 工具/技術（深偽、AI、自動排程）、泛用資產類（異常帳號、假帳號、官方帳號、自媒體、網紅）、內容類名詞（爭訊、官宣內容、影音圖文）→ **不標**（屬 TTP/behavior 擴充範疇）。
> db 歸併回報：《海峽導報》報社被列為 `haixia-daobao-accounts`（TikTok 帳號叢集）的 alias——會使「關係密切」邊自環；gold 另立 `g:haixia-daobao-paper`，待 db 拆分。
> derive ladder 待補：「委託」應映射至控制級（operated-by）——見 doc05 O4 derive_expected。

## 裁決紀錄（doc06 校準）
19. **locative 場域不標**（「In Myanmar,」的國名——targeted 邊已載）；「X-based」複合修飾內的地名不標。
20. **未具名 operators 與帳號資產拆兩實體**：operators＝person/`actor`、網絡資產＝network/`amplifier`——與規則 15/16 一致，且 operation 節點 actors 有著落；cluster 子集合不另立 gid。
21. **跨 campaign 連結**（links to two past operations）：collective mention（`suspected-affiliate`）保留、**不建邊**（語法主詞為撰報方）；document-level linking 屬 derive 層。
22. **role gap 備案**：beneficiary（被支持的受益方，如軍政府）暫不標，列擴充；勿以 amplified-voice 充數。
> IAA 發現（第二次）：B 把 exec summary 兩句**拼接成一句假引文** → exact-quote 擋下 5 筆。LLM 標註員有「順手改寫」傾向——引文必須複製，驗證器是最後防線。

## 裁決紀錄（doc01 校準）
23. **規則 16 例外**：來源明指網絡為「threat actor」→ 網絡＝`actor`（DTL 把網絡當行為者講；Meta 是人/資產分開講）。**hypothesized operators＝suspected-affiliate**（「hypothesize」＝未證實，不得 actor）；其 operated-by 邊帶 hedge → derive 期望**不歸因**。
24. **內容主詞折衷**：僅「已識別 narrative 的 occurrence」（含回指如「5 posts」）可作邊主詞（`narr—opposed→target`）；**泛內容名詞**（political narratives、divisive content）**不標**。攻擊關係其餘由 target role 承載。
25. **predicate 副詞細則**：修辭/程度副詞（directly、持續、搶著）去除；**認知 hedge（likely）保留在述詞內**（can likely be linked to／are likely part of）——derive 靠它判信心。
26. **不標**：反制言論（用戶指出盜圖）；被引用的第三方研究者（Street Corner Sociology＝視同撰報方）；被推銷的商業網站（受益方，規則 22）；bot 失誤軼事（indicator 層）。
> amplified-voice 誤用第三次（B 給 sex dating websites）——僅限「言論被放大的第三方」，受益方勿用。

## 裁決紀錄（doc03 校準）
27. **具名 FIMI 系統/基礎設施＝infrastructure/amplifier**（GoPro、涉T知识图谱）——非 rule18 泛工具（rule18 只排除泛用技法如 AI/自動排程）。
28. **母體/孵化機構＝suspected-affiliate**（ICT CAS）——「spun off from」是淵源非現行控制。
29. **db 收錄的生態成員維持 actor**：夥伴/客戶/供應商若已是 db actor（Meiya Pico/iFlytek/CAC/MSS/TAO）不降級為 suspected-affiliate（會與 db 矛盾、低估已證實成員）；新 g: 公司同理標 actor。**公司內部結構的逐字邊**（controlled-by/subsidiary-of/collaborations-with）照建。
30. **內部動機/自辯不標 narrative**（Xi「亮劍」號召、US-orchestrated IO、Xinjiang 人權）——archive 記「對外散播的 FIMI 敘事」，不記行為者的內部 justification。
> **關係型別缺口（role gap #4，重要）**：現有 context_role 無法表達「supplier/customer/collaborator/partner」等**商業/供應鏈關係**。暫以 actor role＋operation 成員承載、逐字邊補強；建議未來於資料模型另設 relation attribute（非 context_role）。
> **歸因梯度四級**（供 derive 評測）：originated-in→related-to（doc06）｜hypothesized operated-by→不歸因（doc01）｜委託 gov-tier→operated-by+attributed（doc05）｜**明確 operated by db-actor→attributed 最強**（doc03）。

## 交件前
跑 `python3 pipeline/gold/validate_gold.py your.gold.json`——quote 全 exact 命中、gid 都解析得到、surface/predicate 落在 quote 內、無重複 quote 歧義，才算合格。
