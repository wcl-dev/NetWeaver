# 生產迴圈 backlog（run_loop.py 的 production 化）

`pipeline/run_loop.py` 目前是**保守版**：自動化 ingest→filter→extract→derive→validate→project，產出待人工審的
curation queue（`pipeline/extractions/curation_queue.json`），**預設不自動 compile 進 db.js**。人審與 compile 走
`pipeline/curate.py`（list/show/approve/compile）——**安全 source-scoped upsert、狀態機、歸因閘、歸屬重算比對**；
**勿用** `compile_to_db.py`（那會整包覆蓋，僅供樣本）。

以下是 Codex review（2026-07）指出、要「**自動** compile 進 db.js」變 production-safe 才需處理的項目。
現階段抽取品質 edge F1 ~0.2、且 sources/registry 是人工策展骨幹，自動 compile 尚早，故列 backlog。
每項落地前逐項 Codex review。

> ✅ **已由 curate.py 落實於人工 compile 路徑**：source-scoped upsert（#1）、狀態機 pending→approved/rejected/deferred→compiled（#3）、
> attributed-to 需 `--yes`（#4）、歸屬改用 `operator_ref`（行動方已登錄 entity、fail-closed）＋approve 時重算鎖定＋compile 時重算比對（#2）。
> 下列項目是把這些延伸到**自動** compile 時仍需補的。

## 必修（開啟自動 compile 前）

1. **source-scoped upsert 沿用到自動路徑**（✅ 人工路徑已於 `curate._upsert` 完成）
   若日後開自動 compile，需沿用同一 upsert（勿回到 `compile_to_db.py` 的整包覆蓋）。

2. **operator 綁定的邊界**（✅ 人工路徑已用 `operator_ref`＋人工把關）🚩 設計決定
   `operator_ref` 取「行動方＋已登錄」，找不到 → None → curation。自動路徑要定調：多 actor / operator 不唯一時的策略
   （目前 fail-closed 交人工）。

3. **curation/compile 狀態機**（✅ 人工路徑已完成）
   queue 依 raw_id upsert 存檔，`compile_status` pending→approved/rejected/deferred→compiled；重抽 digest 變自動重置；
   `approve` 以當下 registry 重投影、鎖定歸屬（defer→補 registry→approve 即重評重綁）。自動路徑若要「掃 extracted-but-not-compiled
   自動重評」再另議。

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

## register.py backlog（補 source/actor 工具）

`register.py`（add-source／add-actor／suggest）目前是**單人 CLI**。已做：enum/URL/date/FK 驗證、逐文件 source id、
撞名（共用 `derive.norm`）、safe upsert-free 寫檔（唯一 temp、保後綴、寫前自驗）、suggest 現算 operator_ref＋threaded id＋
`shlex` quoting、governance warn（registry∪db 已信任出版方）。待補：

- **register↔curate 並行寫入的 CAS/lock**（目前唯一 temp 只防半檔、不防 lost update；單人 CLI 暫可，若多人/排程須加讀取-hash CAS 或檔鎖）。
- **撞名升級**：`derive.norm` 共用，但漏繁簡／全半形／Unicode casefold／同形異碼、且 `A-B` vs `AB` 可能誤擋 → 升 `NFKC+casefold`、繁簡/fuzzy 僅 warn-only（不硬擋）。
- **db.js loader 一致性**：`derive`/`run_loop`/`curate.load_db` 讀取仍用 `rindex("}")` 找結尾（`curate.save_db` 僅寫入端用 `raw_decode` 定位；`register` load＋save 全用 `raw_decode`）。若 db.js footer 日後含 `{}`，上述用 `rindex` 的 loader 都須改 `raw_decode`。
- `fsync` 檔案與目錄、寫失敗清 temp、保留 mode/備份。
