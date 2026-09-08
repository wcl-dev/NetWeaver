# NetWeaver — 台灣 FIMI 行為者記錄簿

> 一個**概念驗證 (PoC)**：把台灣面對的境外資訊操弄與干預（FIMI, Foreign Information Manipulation and Interference）中、**已被公開研究記錄**的攻擊者與協力者，整理成一本可瀏覽的「記錄簿」。
> 靈感來自歐盟 EEAS 的 FIMI 威脅框架與 EUvsDisinfo 資料庫，但以**實體（行為者）為中心**、輕量呈現給大眾。

## 這是什麼

- **記錄簿（Gallery）**：每個行為者一張卡片，可依角色（攻擊者／協力者／放大者）、類別、來源地、關鍵字篩選。
- **檔案頁（Dossier）**：單一行為者的完整檔案——別名、說明、證據指標、**現身於哪些事件**、關聯實體、來源。
- **事件頁**：每個資訊操弄事件 / 行動，列出涉及的敘事與參與的行為者。
- **關聯網絡**：力導向圖。預設只畫有明確關係的行為者（實線＝人工登錄的關係）；共現連結（同事件／同句被提及）收在開關後，預設關。

## ⚠️ 定位與免責

本專案記錄的是「**在公開 FIMI 研究中被點名的行為者**」，**不是法律上的指控或定罪**。
實體間關係屬**描述性**（如「共同現身」「供應技術」），**未做正式歸因（attribution）主張**。
每筆關鍵內容都附上來源，歡迎查證；如有錯誤或爭議，以原始來源為準。最敏感的在地個人／媒體採從嚴收錄、中性框架。

## 怎麼看

直接用瀏覽器打開 `index.html` 即可（純前端、無需後端、可離線）。
資料以動態注入的 `<script>` 標籤載入 `data/db.js`（帶時間戳破快取），避免 `file://` 的 CORS 問題；若偏好用伺服器：

```bash
cd NetWeaver && python3 serve.py 8062
# 開 http://localhost:8062/index.html
```

> 用 `serve.py`（送 `Cache-Control: no-store`）而不是 `python3 -m http.server`：後者只送
> `Last-Modified`，瀏覽器會啟發式快取舊的 `data/db.js`，發布後打開看到的是上一版、且畫面毫無徵兆。

## 檔案結構

```
NetWeaver/
├── index.html        # 單檔前端 app（含 CSS/JS、自寫力導向關聯圖）
├── serve.py          # 本機預覽伺服器（送 no-store，避免快取舊 db.js）
├── data/
│   ├── db.js            # 唯一資料來源：window.NETWEAVER_DB = { entities, events, sources, narratives, meta }
│   ├── registry.yaml    # 人工核可的來源 allowlist（信任落點）
│   ├── roster_ignore.json  # 「不是行為者」的忽略清單
│   └── claim_verdicts.json # 宣稱可讀性的語意裁決（可人工覆寫）
├── pipeline/         # 抓取→篩選→抽取→判斷→審核→發布→匯出 產線（見 docs/ENGINEERING.md、pipeline/README.md）
├── docs/
│   ├── ENGINEERING.md   # 工程指引（程式怎麼運作、模組邊界、紅線、quickstart）
│   ├── ARCHITECTURE.md  # 設計決策與路線
│   ├── SCHEMA.md        # 資料模型 + 與 STIX/DISARM 的對照
│   ├── STIX-PROFILE.md  # 中介格式規格（抽取的靶）
│   └── HANDOVER.html    # 對外交接敘事
└── README.md
```

## 給工程師

這份 README 是產品面。**程式怎麼運作，看 [`docs/ENGINEERING.md`](docs/ENGINEERING.md)**——模組邊界、資料流、三條紅線與不變量、測試紀律、quickstart 全在那。

一句話：一條單向管線把報告原文變成合法 STIX 2.1，再投影成 `data/db.js`；LLM 只在抽取那一段做逐字抽取，其餘全是可測試的純函式。心法是「模型抽取、碼判斷、人決定」。

> 下面「怎麼加資料」講的是**手動編輯 db.js**（PoC 早期的做法）。實際的資料現在多半經 `pipeline/`
> 的抽取→審核→發布流程進來，見 ENGINEERING.md 的 Quickstart 與 [`pipeline/README.md`](pipeline/README.md)。
> 手動編輯仍可用於人工策展的骨幹資料。

## 怎麼加資料（手動策展骨幹）

編輯 `data/db.js`，依 `docs/SCHEMA.md` 的結構新增 `entities` / `events` / `sources` / `narratives`。
要點：
- `entity.event_ids` 與 `event.participant_ids` 要**雙向一致**。
- 每筆關鍵宣稱掛 `source_ids`，且 `sources[].url` 必須真實可查。
- 誠實標記 `confidence`（high / medium / low）。

## 資料來源

每筆行為者、事件、關係的關鍵宣稱都掛 `source_ids`，前端會顯示來源連結供查證（目前共 78 筆來源、897 條逐來源宣稱）。主要取自：

- **政府公開報告**：國家安全局 (NSB)、美國司法部 (DOJ)
- **台灣公民社會研究／數位調查**：
  - IORG 台灣資訊環境研究中心（敘事分類、月報具名放大者）
  - Doublethink Lab 台灣民主實驗室（CIB 網絡、GoLaxy、China Index）
  - **FactLink 數位素養實驗室**（數位調查／OSINT——東部戰區融媒體宣傳網絡、蝴蝶攻擊、中國對日敘事、暗網假文件 hack-and-leak 等案例）
- **國際平台威脅報告**：Meta、Google／Mandiant（GLASSBRIDGE / HaiEnergy / DRAGONBRIDGE）、Microsoft MTAC
- **國際研究機構**：Graphika、ASPI、Citizen Lab（PAPERWALL）、Recorded Future、Global Taiwan Institute、Vanderbilt（GoLaxy 文件）、Jamestown Foundation、Institute for Strategic Dialogue (ISD)、Lowy Institute、ChinaPower (CSIS)、CyberCX
- **新聞媒體佐證**：報導者、自由時報、中央社、CNBC、紐約時報、ProPublica 等

## 已完成（相對於初版 PoC）

初版是「手動編輯 `db.js`」的靜態記錄簿；目前已長出一條**自動化產線與治理層**（機制詳見 [`docs/ENGINEERING.md`](docs/ENGINEERING.md)）：

- **抓取→篩選→抽取→判斷→審核→發布產線**：公開報告 RSS／PDF 落地、詞表相關性閘、LLM 逐字抽取（span-check fail-closed）、碼判關係與信心、名冊人工閘、以來源為單位安全 upsert。
- **歸因人工核可紅線**：`attributed-to` 只能逐則人工核可才落地；逐篇 STIX bundle 帶核可狀態章。
- **匯出 STIX 2.1**（原 roadmap 項目，已做）：整本 `db.js` → 單一 bundle（id 與逐篇一致、關係型別通透），與 OpenCTI／FIMI-ISAC 生態互通。見 `pipeline/export_stix.py`。

## STIX 下載／OpenCTI 接入

整本記錄簿匯出為單一 **STIX 2.1 bundle**，公開可直接取用，且每次 push 到 main 由 CI 自動重匯、與 `data/db.js` 同步：

```
# 原始檔（下游程式直接吃這個）
https://raw.githubusercontent.com/wcl-dev/NetWeaver/main/pipeline/out/netweaver-db.stix.json
# Pages 路徑（同一份）
https://wcl-dev.github.io/NetWeaver/pipeline/out/netweaver-db.stix.json
```

- **內容**：行為者（`identity` / `intrusion-set` / `x-dad-channel`）、行動（`campaign`）、敘事（`x-dad-narrative`）、來源（`report`）與其間關係。id 為決定性 UUIDv5，與逐篇 bundle 一致——下游合併不會產生同一實體的分身。
- **OpenCTI 接入**：以 connector／URL import 拉上面的 raw URL 即可；沒有 TAXII server，它就是一份靜態 bundle，也可在 Data → Import 手動上傳。
- **自訂型別**：頻道與敘事使用自訂 SDO `x-dad-channel`／`x-dad-narrative`（pending OASIS DAD-CDM），bundle 內含對應的 `extension-definition`；對方系統可能需要額外對應設定，第一次對接請預留除錯時間。
- **歸因標記**：`attributed-to` 關係帶 `x_netweaver_review`（`approved`＋日期／`pending-human-approval`），標明是否已過人工核可紅線；匯出只含 db 裡人工核可的歸因。
- **標記**：含 TLP:AMBER，及一則聲明式 marking「記錄公開研究中被點名者，非法律指控」。完整規格見 [`docs/STIX-PROFILE.md`](docs/STIX-PROFILE.md)。

## 後續擴充方向（roadmap）

尚未做，依「最自然的下一步」排序：

1. **DISARM 戰技標記**：在事件上掛 DISARM TA*/T* TTP，對接國際 FIMI 通用語言。
2. **EEAS 曝光層級**：為頻道型實體加上 official / state-controlled / state-linked / state-aligned 四級分類。
3. **可吃的開放資料**：Cofacts（CC BY-SA，含共享 URL 圖）、Doublethink Lab China Index。
4. **時間軸視圖**與**敘事為中心**的瀏覽。
5. **產線 production 化**：排程、以 production 金鑰承接固定抽取（見 [`docs/LOOP_BACKLOG.md`](docs/LOOP_BACKLOG.md)）。

（資料的擴充與深化為持續進行，不另列為待辦。）

## 狀態

概念驗證階段。資料規模：**113 行為者 / 33 事件 / 78 來源 / 35 敘事 / 897 條逐來源宣稱**（含子敘事樹），整理自 NSB、IORG、Doublethink Lab、FactLink 數位素養實驗室、Mandiant/Google、Meta、Graphika、ASPI、Citizen Lab、Microsoft MTAC、Recorded Future、Jamestown、ISD、Vanderbilt、OpenAI、US DOJ 等公開報告與數位調查。

涵蓋層次（依 `category`）：
- **PRC 攻擊機關**（state-organ）：網信辦、國安部、政工部、網路空間部隊、信息支援部、統戰部、公安部、國台辦、外交部
- **技術／front 供應商**（tech-vendor）：GoLaxy、美亞柏科、科大訊飛、中科點擊、北京星光、一網互通、晴數智慧、沃民高新、長光衛星、硅基智能、歌爾股份、蜜度、出門問問等
- **PR 代理／新聞稿發布**（pr-firm）：海訊社、海賣、虎牙、Times Newswire、World Newswire
- **內容農場**（content-farm）：無邊界集團、密訊、兩岸頭條、觸極者、為你祈福、DURINBRIDGE、假捷克媒體《波希米亞日報》
- **CIB 網絡／行動**（cib-network）：Spamouflage(龍橋/Dragonbridge)、假冒台灣人反民進黨網絡、綠蟬網絡、假外交文件 hack-and-leak 網絡、和坛，及 OpenAI June 2026 報告點名的資料中心跟風行動、科技與關稅行動、九段線行動
- **官媒管道**（state-media，最大類）：央視/CMG、玉淵譚天、海峽之聲、環球時報、新華社、人民日報、中國日報、中國台灣網、觀察者網、東部戰區融媒體中心，及香港受控媒體（origin=HK：鳳凰網、大公文匯網、香港文匯報、中評社）
- **在地放大者（28 個標記 `domestic-named`、中性框架、可一鍵篩除）**：媒體與粉專（旺中、中天、TVBS、聯合報、亞洲衛視，及無色覺醒、大新聞大爆卦、頭條開講等旺中系粉專），及郭正亮、趙少康、蔡正元、館長、侯漢廷等被 IORG／FactLink 點名遭官媒引用放大的名嘴

同時新增記錄簿最早的 **3 則人工核可歸因（attributed-to）**：Spamouflage→公安部、Times Newswire→海賣、為你祈福→無邊界集團。

近期並收錄 PRC 影響力在台灣以外的案例（Doublethink Lab 尚比亞大選報告、OpenAI 針對美國 AI 辯論的 PRC 行動），行為者範圍由台灣-中國擴及 PRC 全球影響。

仍在擴充與校正中；對外發布前需抽查來源 URL 與授權。
