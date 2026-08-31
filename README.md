# NetWeaver — 台灣 FIMI 行為者記錄簿

> 一個**概念驗證 (PoC)**：把台灣面對的境外資訊操弄與干預（FIMI, Foreign Information Manipulation and Interference）中、**已被公開研究記錄**的攻擊者與協力者，整理成一本可瀏覽的「記錄簿」。
> 靈感來自歐盟 EEAS 的 FIMI 威脅框架與 EUvsDisinfo 資料庫，但以**實體（行為者）為中心**、輕量呈現給大眾。

## 這是什麼

- **記錄簿（Gallery）**：每個行為者一張卡片，可依角色（攻擊者／協力者／放大者）、類別、來源地、關鍵字篩選。
- **檔案頁（Dossier）**：單一行為者的完整檔案——別名、說明、證據指標、**現身於哪些事件**、關聯實體、來源。
- **事件頁**：每個資訊操弄事件 / 行動，列出涉及的敘事與參與的行為者。
- **關聯網絡**：力導向圖。節點＝行為者（顏色＝角色），實線＝明確關係，虛線＝共同現身於同一事件。

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
├── data/
│   └── db.js         # 唯一資料來源：window.NETWEAVER_DB = { entities, events, sources, narratives }
├── docs/
│   └── SCHEMA.md      # 資料模型說明 + 與 STIX/DISARM 的對照
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

每筆行為者、事件、關係的關鍵宣稱都掛 `source_ids`，前端會顯示來源連結供查證（目前共 76 筆來源、877 條逐來源宣稱）。主要取自：

- **政府公開報告**：國家安全局 (NSB)、美國司法部 (DOJ)
- **台灣公民社會研究／數位調查**：
  - IORG 台灣資訊環境研究中心（敘事分類、月報具名放大者）
  - Doublethink Lab 台灣民主實驗室（CIB 網絡、GoLaxy、China Index）
  - **FactLink 數位素養實驗室**（數位調查／OSINT——東部戰區融媒體宣傳網絡、蝴蝶攻擊、中國對日敘事、暗網假文件 hack-and-leak 等案例）
- **國際平台威脅報告**：Meta、Google／Mandiant（GLASSBRIDGE / HaiEnergy / DRAGONBRIDGE）、Microsoft MTAC
- **國際研究機構**：Graphika、ASPI、Citizen Lab（PAPERWALL）、Recorded Future、Global Taiwan Institute、Vanderbilt（GoLaxy 文件）、Jamestown Foundation、Institute for Strategic Dialogue (ISD)、Lowy Institute、ChinaPower (CSIS)、CyberCX
- **新聞媒體佐證**：報導者、自由時報、中央社、CNBC、紐約時報、ProPublica 等

## 後續擴充方向（roadmap）

依「最自然的下一步」排序：

1. **擴充與深化資料**：更多行為者與事件，補齊在地放大者（從嚴、附強來源）。
2. **DISARM 戰技標記**：在事件上掛 DISARM TA*/T* TTP，對接國際 FIMI 通用語言。
3. **EEAS 曝光層級**：為頻道型實體加上 official / state-controlled / state-linked / state-aligned 四級分類。
4. **可吃的開放資料**：把 Cofacts（CC BY-SA，含共享 URL 圖）、Doublethink Lab China Index 納入。
5. **匯出 STIX 2.1**：把同一資料序列化為 STIX bundle（見 SCHEMA 對照表），與 OpenCTI / FIMI-ISAC 生態互通。
6. **時間軸視圖**與**敘事為中心**的瀏覽。

## 狀態

概念驗證階段。資料規模：**101 行為者 / 33 事件 / 76 來源 / 35 敘事 / 877 條逐來源宣稱**（含子敘事樹），整理自 NSB、IORG、Doublethink Lab、FactLink 數位素養實驗室、Mandiant/Google、Meta、Graphika、ASPI、Citizen Lab、Microsoft MTAC、Recorded Future、Jamestown、ISD、Vanderbilt、US DOJ 等公開報告與數位調查。

涵蓋層次（依 `category`）：
- **PRC 攻擊機關**（state-organ）：網信辦、國安部、政工部、網路空間部隊、信息支援部、統戰部、公安部、國台辦、外交部
- **技術／front 供應商**（tech-vendor）：GoLaxy、美亞柏科、科大訊飛、中科點擊、北京星光、一網互通、晴數智慧、沃民高新、長光衛星、硅基智能、歌爾股份、蜜度、出門問問等
- **PR 代理／新聞稿發布**（pr-firm）：海訊社、海賣、虎牙、Times Newswire、World Newswire
- **內容農場**（content-farm）：無邊界集團、密訊、兩岸頭條、觸極者、為你祈福、DURINBRIDGE、假捷克媒體《波希米亞日報》
- **CIB 網絡／行動**（cib-network）：Spamouflage(龍橋/Dragonbridge)、假冒台灣人反民進黨網絡、綠蟬網絡、假外交文件 hack-and-leak 網絡、和坛
- **官媒管道**（state-media，最大類）：央視/CMG、玉淵譚天、海峽之聲、環球時報、新華社、人民日報、中國日報、中國台灣網、觀察者網、東部戰區融媒體中心，及香港受控媒體（origin=HK：鳳凰網、大公文匯網、香港文匯報、中評社）
- **在地放大者（28 個標記 `domestic-named`、中性框架、可一鍵篩除）**：媒體與粉專（旺中、中天、TVBS、聯合報、亞洲衛視，及無色覺醒、大新聞大爆卦、頭條開講等旺中系粉專），及郭正亮、趙少康、蔡正元、館長、侯漢廷等被 IORG／FactLink 點名遭官媒引用放大的名嘴

同時新增記錄簿最早的 **3 則人工核可歸因（attributed-to）**：Spamouflage→公安部、Times Newswire→海賣、為你祈福→無邊界集團。

仍在擴充與校正中；對外發布前需抽查來源 URL 與授權。
