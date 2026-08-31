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
資料以 `<script src>` 載入，避免 `file://` 的 CORS 問題；若偏好用伺服器：

```bash
cd NetWeaver && python3 -m http.server 8000
# 開 http://localhost:8000
```

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

每筆行為者、事件、關係的關鍵宣稱都掛 `source_ids`，前端會顯示來源連結供查證（目前共 74 筆來源）。主要取自：

- **政府公開報告**：國家安全局 (NSB)、美國司法部 (DOJ)
- **台灣公民社會研究／數位調查**：
  - IORG 台灣資訊環境研究中心（敘事分類、月報具名放大者）
  - Doublethink Lab 台灣民主實驗室（CIB 網絡、GoLaxy、China Index）
  - **FactLink 數位素養實驗室**（數位調查／OSINT——東部戰區融媒體宣傳網絡、蝴蝶攻擊、中國對日敘事、暗網假文件 hack-and-leak 等案例）
- **國際平台威脅報告**：Meta、Google／Mandiant（GLASSBRIDGE / HaiEnergy / DRAGONBRIDGE）、Microsoft MTAC
- **國際研究機構**：Graphika、ASPI、Citizen Lab（PAPERWALL）、Recorded Future、Global Taiwan Institute、Vanderbilt（GoLaxy 文件）、CyberCX
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

概念驗證階段。資料規模：**57 行為者 / 33 事件 / 74 來源 / 35 敘事**（含子敘事樹），整理自 NSB、IORG、Doublethink Lab、FactLink 數位素養實驗室、Mandiant/Google、Meta、Graphika、ASPI、Citizen Lab、Microsoft MTAC、Recorded Future、US DOJ 等公開報告與數位調查。

涵蓋層次：
- **PRC 攻擊機關**：網信辦、國安部、政工部、網路空間部隊、統戰部、公安部、國台辦
- **技術／front 供應商**：GoLaxy、美亞柏科、科大訊飛、中科點擊、北京星光、一網互通、晴數智慧、沃民高新等
- **PR／內容農場**：海訊、海脈、虎牙、DURINBRIDGE、無邊界集團、密訊、兩岸頭條
- **CIB 網絡／行動**：Spamouflage(龍橋/Dragonbridge)、PAPERWALL、HaiEnergy、GLASSBRIDGE、Green Cicada、假冒台灣人反民進黨網絡
- **官媒管道**：央視/CMG、玉淵譚天、海峽之聲、海峽導報、環球時報、中國台灣網
- **在地放大者（17，標記 `domestic-named`、中性框架、可一鍵篩除）**：旺中、中天、TVBS、聯合報、亞洲衛視，及郭正亮、趙少康、蔡正元等 12 位被 IORG 點名遭官媒引用放大的名嘴

仍在擴充與校正中；對外發布前需抽查來源 URL 與授權。
