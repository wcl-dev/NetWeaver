# 生產迴圈 backlog（run_loop.py 的 production 化）

`pipeline/run_loop.py` 目前是**保守版**：自動化 ingest→filter→extract→derive→validate→project，產出待人工審的
curation queue（`pipeline/extractions/curation_queue.json`），**預設不自動 compile 進 db.js**。compile 維持人工步驟
（`compile_to_db.py`，人審過的 extraction 才跑）。

以下是 Codex review（2026-07）指出、要「自動 compile 進 db.js」變 production-safe 才需處理的項目。
現階段抽取品質 edge F1 ~0.2、且 sources/registry 是人工策展骨幹，自動 compile 尚早，故列 backlog。
每項落地前逐項 Codex review。

## 必修（開啟自動 compile 前）

1. **claims 改 source-scoped upsert**（`compile_to_db.py`）
   現為 `ent[nw_ref]["claims"] = claims` **整包覆蓋**——同一 entity 多篇互蓋、蓋掉人工/其他來源 claims、重跑舊篇會倒退。
   應：以 `source_id` 為單位替換該來源的 claims、保留其他來源，再去重。需測試。

2. **operator 綁定**（run_loop 閘 ＋ compile）🚩 設計決定
   現以「第一個有 nw_ref 的 object」當歸屬（可能是 target/媒體/個人，非 operator），compile 又把全篇 claims 掛上去。
   應：用 `project()` 選定的 operator 對應 registry entity；多 actor / 對不上唯一 operator → 送 curation。
   **要定調**：多 actor 文件 claims 到底掛給誰。

3. **curation/compile 狀態持久化**
   現 queue 依 raw_id upsert 存檔，但無 `compile_status`（pending-curation/pending/compiled/failed）狀態機，
   人工補 source/actor 後不會自動重評。應加狀態欄＋掃 extracted-but-not-compiled 重評。

4. **attributed-to 人工核可閘** 🚩 政策
   profile 明定 attributed-to 需人工核可（STIX-PROFILE §）。自動 compile 前，含 attributed-to 的 bundle 一律送 curation。
   （run_loop 已在 queue 標 `attributed_to` 計數，但尚未強制擋自動 compile——因目前根本不自動 compile。）

5. **URL canonicalization**
   來源比對用 exact URL match；Medium 等帶 tracking query（`?source=…`），db.sources 無 query → 誤判新來源。
   應：以策展 source ID 對應，或剝除已知 tracking 參數後的 canonical URL 比對。
   （現況「誤判新來源→進 curation」是安全的偏保守失敗，故非阻斷。）

6. **local-named / 敏感 actor 閘** 🚩 政策
   registry 含台灣媒體/個人。自動 compile 前需界定「本地具名/敏感」不該自動長進記錄簿的規則（可依 entity origin/category）。

## 可選優化

- readability 級正文抽取（取代 `clean_html` 最小清理，去 nav/footer/related）；正文長度／品質閘（低品質→curation）。
- 避免 run_loop 與 compile 兩處重複 derive（讓 compile 接收已 derive/project 的產物）。
- `--limit` 改 discovery-time FIFO；no-text/error 前排項目的 backoff，避免餓死後項。
- 排程重疊時的單例鎖與原子寫檔（若上排程則升為必修）。
- 保存 extract 的 dropped/diagnostics；「全 mention passes 失敗＝空抽取」視為 error/retry 而非 extracted。
