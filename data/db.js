/*
 * NetWeaver — 台灣 FIMI 行為者記錄簿
 * 唯一資料來源 (single source of truth)。結構見 docs/SCHEMA.md
 *
 * ⚠️ 記錄的是「在公開 FIMI 研究中被點名的行為者」，非法律指控或定罪。
 *    關係屬描述性，未做正式歸因主張。每筆關鍵內容均附來源 (source_ids)。
 */
window.NETWEAVER_DB = {
  "meta": {
    "version": "0.3.1",
    "updated": "2026-06",
    "note": "57 行為者 / 33 事件 / 69 來源 / 35 敘事，整理自 NSB、IORG、Doublethink Lab、FactLink、Mandiant/Google、Meta、Graphika、ASPI、Citizen Lab 等公開報告與數位調查。"
  },
  "entities": [
    {
      "id": "cac",
      "name_zh": "中央網信辦",
      "name_en": "Cyberspace Administration of China",
      "aliases": [
        "CAC",
        "國家互聯網信息辦公室",
        "網信辦",
        "Cyberspace Administration of China",
        "Cyberspace Administration of China (CAC)"
      ],
      "category": "state-organ",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "中共統管中國網路內容與輿論治理的主管機關。",
      "description_zh": "中央網信辦是中共掌管網路內容、輿論與資訊治理的核心機關。台灣國安局2025年報告指出，網信辦與國安部、解放軍政工部等單位指揮中國科技企業（如GoLaxy、美亞柏科）以爬蟲技術蒐集台灣政治人物與意見領袖資料、建立側寫資料庫，並運用生成式AI操作大量機器人帳號散布不實訊息。2025年外洩的GoLaxy內部文件亦顯示該公司向網信辦尋求指導與資金。",
      "indicators": [
        "NSB 2026 報告稱網信辦等單位委託科技公司管理逾1萬個機器人帳號"
      ],
      "active_since": "2014–至今",
      "related": [
        {
          "target_id": "golaxy",
          "relation": "linked-to",
          "note": "GoLaxy 外洩文件顯示其向網信辦尋求指導與資金"
        },
        {
          "target_id": "mss",
          "relation": "affiliated-with",
          "note": "與國安部、政工部共同指揮科技企業蒐集台灣資料"
        },
        {
          "target_id": "golaxy",
          "relation": "supplies-tech-to",
          "note": "NSB 2025：網信辦指揮中科天璣（GoLaxy）以爬蟲技術蒐集臺灣社情數據建立人物資料庫"
        },
        {
          "target_id": "meiya-pico",
          "relation": "supplies-tech-to",
          "note": "NSB 2025：網信辦等指揮美亞柏科進行數據蒐集與分析"
        },
        {
          "target_id": "zhongkedianji",
          "relation": "runs",
          "note": "NSB 2025：網信辦／統戰部／網路空間部隊委託中科點擊以生成式 AI 運營逾萬組機器人帳號"
        },
        {
          "target_id": "beijing-xingguang",
          "relation": "runs",
          "note": "NSB 2025：委託北京星光建立網民資料庫並運營機器人帳號"
        },
        {
          "target_id": "onesight",
          "relation": "runs",
          "note": "NSB 2025：委託一網互通以自動化程式運營逾萬組機器人帳號傳散爭訊"
        }
      ],
      "event_ids": [
        "election-op-2024",
        "golaxy-leak-2025"
      ],
      "source_ids": [
        "src-nsb-2026",
        "src-vanderbilt-golaxy",
        "src-record-golaxy"
      ],
      "confidence": "high"
    },
    {
      "id": "mss",
      "name_zh": "國家安全部",
      "name_en": "Ministry of State Security",
      "aliases": [
        "MSS",
        "國安部",
        "Guoanbu",
        "Ministry of State Security (MSS)"
      ],
      "category": "state-organ",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "中國對外情報與反間諜的主管機關。",
      "description_zh": "國安部是中國對外情報與反間諜的主管機關。台灣國安局2025年報告將國安部列為指揮中國科技企業蒐集台灣政治人物資料、建立側寫資料庫的單位之一。2025年外洩的GoLaxy內部文件亦顯示該公司向國安部等機關尋求指導與資金，並在2024台灣大選前運用AI虛擬人物操作輿論。其被記錄的角色以情報蒐集與工具背後支持為主。",
      "indicators": [],
      "active_since": "1983–至今",
      "related": [
        {
          "target_id": "golaxy",
          "relation": "linked-to",
          "note": "GoLaxy 文件顯示其向國安部尋求指導與資金"
        },
        {
          "target_id": "cac",
          "relation": "affiliated-with",
          "note": "與網信辦共同指揮科技企業側寫台灣"
        },
        {
          "target_id": "golaxy",
          "relation": "supplies-tech-to",
          "note": "NSB 2025：國安部與網信辦等指揮中科天璣蒐集臺灣社情數據"
        },
        {
          "target_id": "meiya-pico",
          "relation": "supplies-tech-to",
          "note": "NSB 2025：國安部等指揮美亞柏科進行數據蒐集"
        }
      ],
      "event_ids": [
        "election-op-2024",
        "golaxy-leak-2025"
      ],
      "source_ids": [
        "src-nsb-2026",
        "src-vanderbilt-golaxy",
        "src-record-golaxy"
      ],
      "confidence": "high"
    },
    {
      "id": "pla-pwd",
      "name_zh": "解放軍政治工作部",
      "name_en": "PLA Political Work Department",
      "aliases": [
        "PWD",
        "總政治部 (前身)",
        "三戰 (輿論戰/心理戰/法律戰)",
        "311基地",
        "61716部隊",
        "政治工作部",
        "中央軍委政治工作部",
        "PLA Political Work Department (PWD)",
        "總政治部"
      ],
      "category": "state-organ",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "主導解放軍對台「三戰」（輿論戰、心理戰、法律戰）的政治工作機關。",
      "description_zh": "解放軍政治工作部負責解放軍政治工作，並主導對台「三戰」——輿論戰、心理戰、法律戰。其下設於福州的311基地（61716部隊）被研究界認定為專責對台心理與政治作戰的單位，並透過華藝廣播公司等外圍機構對台宣傳。台灣國安局2025年報告亦將政工部列為指揮科技企業蒐集台灣資料的單位之一。（註：解放軍另有「網路空間部隊」負責機器人帳號操作，與政工部為不同單位。）",
      "indicators": [
        "311基地下轄多個團級單位對台從事三戰 (GTI 2017)"
      ],
      "active_since": "2003 (三戰法規)–至今",
      "related": [
        {
          "target_id": "voice-of-strait",
          "relation": "runs",
          "note": "海峽之聲被連結至政工部/311基地心戰體系"
        },
        {
          "target_id": "golaxy",
          "relation": "linked-to",
          "note": "GoLaxy 文件列311基地/61716部隊為相關機關"
        },
        {
          "target_id": "golaxy",
          "relation": "supplies-tech-to",
          "note": "NSB 2025：政治工作部與網信辦等指揮中科天璣蒐集臺灣社情數據"
        }
      ],
      "event_ids": [
        "joint-sword-2024",
        "golaxy-leak-2025"
      ],
      "source_ids": [
        "src-gti-base311",
        "src-nsb-2026",
        "src-vanderbilt-golaxy"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "國防大學新聞系教授傅文成觀察，過去一般是由總政治部加上解放軍信息支援部執行宣傳，東部戰區融媒體中心主責宣傳，宣傳工作比過去更能貼近台灣脈絡，操作也更精密、細膩。",
          "source_id": "src-factlink-a7a795",
          "about": "總政治部"
        }
      ]
    },
    {
      "id": "ufwd",
      "name_zh": "中央統戰部",
      "name_en": "United Front Work Department",
      "aliases": [
        "UFWD",
        "中共中央統一戰線工作部",
        "統戰部",
        "United Front Work Department (UFWD)"
      ],
      "category": "state-organ",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "負責中共對黨外、海外及台灣統一戰線工作的機關。",
      "description_zh": "中央統戰部負責中共對黨外、海外及台灣的統一戰線工作，透過交流、組織滲透與認同塑造來影響目標社會。ASPI追蹤顯示，國台辦與統戰部是對台統戰活動的核心協調者。台灣國安局2025年報告亦指統戰部與網信辦、解放軍網路空間部隊共同委託科技公司操作機器人帳號散布不實訊息。其核心被記錄的角色在線下／僑界／認同統戰，並涉及上述機器人帳號委託。",
      "indicators": [
        "ASPI 追蹤2025年涉台統戰活動以中華認同／文化收編為最大類別"
      ],
      "active_since": "長期 (2015年後地位升高)",
      "related": [
        {
          "target_id": "tao",
          "relation": "affiliated-with",
          "note": "與國台辦同為涉台統戰核心協調者 (ASPI)"
        },
        {
          "target_id": "onesight",
          "relation": "linked-to",
          "note": "其下中新社曾委託 OneSight 增加海外社群粉絲"
        },
        {
          "target_id": "zhongkedianji",
          "relation": "runs",
          "note": "NSB 2025：統戰部與網信辦、網路空間部隊委託中科點擊運營機器人帳號"
        },
        {
          "target_id": "onesight",
          "relation": "runs",
          "note": "NSB 2025：委託一網互通運營逾萬組機器人帳號"
        }
      ],
      "event_ids": [
        "election-op-2024"
      ],
      "source_ids": [
        "src-aspi-strait",
        "src-nsb-2026",
        "src-propublica-onesight"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "Prior to the election, relevant Weibo hot searches mainly related to anti-Taiwan independence, (re)unification, Taiwan’s diplomatic relations, and other United Front Work Department (UFWD) mainstays.",
          "source_id": "src-dtl-2022election",
          "about": "United Front Work Department (UFWD)"
        },
        {
          "text": "The usage of the United Front Work Department (UFWD) is inconspicuous in South Asia.",
          "source_id": "src-doublethink-lab-96d2c0",
          "about": "United Front Work Department"
        }
      ]
    },
    {
      "id": "mps",
      "name_zh": "公安部",
      "name_en": "Ministry of Public Security",
      "aliases": [
        "MPS",
        "912專項工作小組",
        "Ministry of Public Security (MPS)"
      ],
      "category": "state-organ",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "中國警政與內部安全主管機關，被指為 Spamouflage／Dragonbridge 網軍的營運者。",
      "description_zh": "公安部是中國警政與內部安全主管機關。Meta於2023年8月將跨平台影響行動「Spamouflage」連結到「與中國執法機關相關的個人」；美國司法部2023年4月起訴34名公安部官員，指其「912專項工作小組」以數千個假帳號操作輿論。台灣國安局2025年報告直指「Dragonbridge是公安部運用的網軍」，跨逾180個平台、20多種語言操作，並針對台灣議題散布不實訊息。",
      "indicators": [
        "美國司法部起訴34名公安部官員 (DOJ 2023)",
        "NSB 稱 Dragonbridge 跨逾180個平台、20多種語言運作"
      ],
      "active_since": "2019 (Spamouflage 起追蹤)",
      "related": [
        {
          "target_id": "spamouflage",
          "relation": "runs",
          "note": "Meta/DOJ/NSB 將 Spamouflage/Dragonbridge 連結至公安部相關人員"
        },
        {
          "target_id": "haixun",
          "relation": "runs",
          "note": "NSB 2025：中宣部與公安部利用海訊社架設冒充國際媒體之假網站"
        },
        {
          "target_id": "haimai",
          "relation": "runs",
          "note": "NSB 2025：公安部利用海賣架設假外媒網站"
        },
        {
          "target_id": "huya-pr",
          "relation": "runs",
          "note": "NSB 2025：公安部利用虎牙架設假外媒網站"
        }
      ],
      "event_ids": [
        "spamouflage-takedown-2023",
        "election-op-2024",
        "takaichi-strait-2025",
        "doj-912-2023",
        "nsb-cognitive-2025"
      ],
      "source_ids": [
        "src-meta-2023",
        "src-doj-912",
        "src-nsb-2026",
        "src-record-spamouflage"
      ],
      "confidence": "high"
    },
    {
      "id": "tao",
      "name_zh": "國台辦",
      "name_en": "Taiwan Affairs Office",
      "aliases": [
        "TAO",
        "國務院台灣事務辦公室",
        "中共中央台灣工作辦公室",
        "Taiwan Affairs Office (TAO)",
        "国台办",
        "Taiwan Affairs Office of the State Council"
      ],
      "category": "state-organ",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "中共與中國國務院統管對台政策與官方論述的機關。",
      "description_zh": "國台辦是中共與中國國務院統管對台政策與宣傳的機關。IORG研究指出，國台辦及其發言人（如陳斌華）是「台灣民主失敗論」等對台宣傳論述的源頭之一；ASPI追蹤亦將國台辦與統戰部列為對台統戰活動的核心協調者。其被記錄的角色主要在官方論述定調與統戰協調，較少被歸為直接操作匿名假帳號者。",
      "indicators": [
        "IORG 指國台辦發言人陳斌華為民主失敗論敘事源頭之一"
      ],
      "active_since": "1988–至今",
      "related": [
        {
          "target_id": "ufwd",
          "relation": "affiliated-with",
          "note": "與統戰部同為涉台統戰核心協調者"
        }
      ],
      "event_ids": [
        "democracy-failure-campaign",
        "joint-sword-2024"
      ],
      "source_ids": [
        "src-iorg-118",
        "src-aspi-strait",
        "src-nsb-2026"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "This coincided with reporting on the allegation by the China Times, a Taiwan-based newspaper that reportedly takes instructions directly from the CCP’s Taiwan Affairs Office.",
          "source_id": "src-aspi-2024",
          "about": "Taiwan Affairs Office"
        },
        {
          "text": "The Taiwan Affairs Office in China has described united front work as “an important magic weapon for the Communist Party of China to unite people and gather strength”.",
          "source_id": "src-aspi-strait",
          "about": "Taiwan Affairs Office"
        },
        {
          "text": "The Taiwan Affairs Office of the State Council of China issued a major response on Nov.",
          "source_id": "src-dtl-2022election",
          "about": "Taiwan Affairs Office of the State Council"
        },
        {
          "text": "The Taiwan Affairs Office of the State Council also condemned the DPP on Nov.",
          "source_id": "src-dtl-2022election",
          "about": "Taiwan Affairs Office of the State Council"
        },
        {
          "text": "Taiwan Affairs Office of the State Council quoted the reports, saying that “the two sides of the Strait have the same root and their origin cannot be separated.”",
          "source_id": "src-dtl-2022election",
          "about": "Taiwan Affairs Office of the State Council"
        },
        {
          "text": "🇨🇳 2024 年 1 月 13 日台灣總統大選投票日， 🇨🇳 国台办「中国台湾网」發表署名「王杰」的「社会政治文化变迁与台湾选举」一文回顧台灣政治與選舉變遷。",
          "source_id": "src-iorg-118",
          "about": "国台办"
        },
        {
          "text": "🇨🇳 2024 年 8 月 7 日 🇨🇳 国台办「中国台湾网」評論賴清德資政、國正顧問名單的文章中，批評「赖清德吃相难看，想做民选皇帝」。",
          "source_id": "src-iorg-118",
          "about": "国台办"
        },
        {
          "text": "🇹🇼-🇨🇳 2024 年 12 月 31 日 🇨🇳 国台办「中国台湾网」報導引用國民黨「回顧賴清德2024執政十大亂象」，內容涵蓋內閣表現、罷免謝國樑、戒嚴發言爭議（TEAM 戒嚴）、房價、打詐、政治人物貪污等面向。",
          "source_id": "src-iorg-118",
          "about": "国台办"
        },
        {
          "text": "🇹🇼-🇨🇳 2024 年 12 月 31 日 🇨🇳 国台办「中国台湾网」抖音上傳影片，標題為「扭曲的台湾民主 “民主教”」。",
          "source_id": "src-iorg-118",
          "about": "国台办"
        },
        {
          "text": "🇹🇼-🇨🇳 2024 年 12 月 31 日 🇨🇳 国台办「中国台湾网」報導引用 國民黨 國民黨「回顧賴清德2024執政十大亂象」，並針對民進黨評論韓國宣布戒嚴的發文爭議，評論為「让台湾的“民主形象”沦为笑话」。",
          "source_id": "src-iorg-118",
          "about": "国台办"
        },
        {
          "text": "🇨🇳 2025 年 6 月 24 日 🇨🇳 国台办「中国台湾网」以「台独就是有害垃圾！",
          "source_id": "src-iorg-118",
          "about": "国台办"
        },
        {
          "text": "🇨🇳 2025 年 3 月 14 日 🇨🇳 国台办「中国台湾网」發表標題為「赖清德宣布全面紧缩两岸交流 岛内舆论批不如直接宣布戒严！」",
          "source_id": "src-iorg-118",
          "about": "国台办"
        },
        {
          "text": "🇨🇳 2025 年 6 月 24 日 🇨🇳 国台办「中国台湾网」發表評論文章，內容稱賴清德「将两岸商机扭曲为“台湾危机”」「将两岸正常交往交流活动以及台商台企经济合作项目通通划入所谓“统战威胁”」，並以「賴 17 條」「威胁参与两岸互动的台商、台企、台青、台生，给支持两岸和平发展的岛内政党、团体及各界人士扣上所谓“在地协力者”的“帽子”」。",
          "source_id": "src-iorg-118",
          "about": "国台办"
        },
        {
          "text": "實際案例包括：15 日中共官媒環球網、17 日中國外交部發言人華春瑩、18 日中國外交部發言人趙立堅、20 日中共官媒環球網總編胡锡进的發言、24 日中國外交部發言人汪文斌、28 日國台辦轄下「中國台灣網」針對美國艦隊通過台灣海峽的回應。",
          "source_id": "src-iorg-11",
          "about": "國台辦"
        },
        {
          "text": "8 月 28 日，國台辦轄下「中國台灣網」發文，譴責美國艦隊通過台灣海峽是挑釁中國。",
          "source_id": "src-iorg-11",
          "about": "國台辦"
        },
        {
          "text": "中共最關注台灣人物 top 5 之中，提出「兩岸和平框架」主張的 國民黨 主席鄭麗文名列第 2，民進黨 內政部長劉世芳、教育部長鄭英耀為国台办列為「“台独” 顽固分子」而位居 3、4，名嘴蔡正元首次進入前 5。",
          "source_id": "src-iorg-131",
          "about": "国台办"
        },
        {
          "text": "中共最關注時事為美軍抓捕委內瑞拉時任總統馬杜羅，中共官方譴責美國此舉「明显违反国际法和国际关系基本准则」，外交部、国台办等官方機構則借機複誦其錯誤立場「台湾问题纯属中国内政」，在此錯誤立場之上以此次事件 錯誤類比 兩岸關係，宣稱其跨境鎮壓為「抓捕、惩治 “台独” 顽固分子」，是「法理闭环」、「道义高地」，在譴責美國的同時又意圖正當化其對台威脅。",
          "source_id": "src-iorg-131",
          "about": "国台办"
        },
        {
          "text": "名列中共国台办「台独顽固份子」14 位台灣人列表，人物排序按宣布日期排列。",
          "source_id": "src-iorg-131",
          "about": "国台办"
        },
        {
          "text": "名列中共国台办「台独打手帮凶」12 位台灣人列表，人物排序按宣布日期排列。",
          "source_id": "src-iorg-131",
          "about": "国台办"
        },
        {
          "text": "1 月 8 日，🇨🇳 上海报业集团「澎湃新闻」發布來自「“日月谭天”微信公众号」的文本「日月谭天 | 大陆惩治“台独”分子绝不手软，推动两岸交融绝不止步」，內文包含「1 月 7 日，国台办举行 2026 年首场例行新闻发布会。",
          "source_id": "src-iorg-131",
          "about": "国台办"
        },
        {
          "text": "1 月 13 日，🇨🇳 国台办「中国台湾网」發布文本「郑丽文批民进党当局滥用司法：台湾之耻辱」，內文包含「据台媒报道，台湾民众党前主席柯文哲、中国国民党前台北市党部主委黄吕锦茹及前民代蔡正元均因涉案被强制佩戴电子脚镣，而民进党籍涉贪人士郑文灿却未受该“待遇”。",
          "source_id": "src-iorg-131",
          "about": "国台办"
        },
        {
          "text": "1 月 27 日，🇨🇳 国台办「中国台湾网」發布文本「从“台北101”到“台湾101”：民进党“地标碰瓷”背后尽显治理失能」，內文包含「美国攀岩运动家艾力克斯·霍诺德（Alex Honnold）25 日挑战徒手攀登“台北 101”大楼并成功登顶，引发关注。",
          "source_id": "src-iorg-131",
          "about": "国台办"
        },
        {
          "text": "1 月 28 日，🇨🇳 北京日报「北京日报」發布微博，內文包含「【#民进党当局对微博微信抖音下手#】#民进党当局有多怕大陆APP#」、「正如国台办发言人所说，民进党当局此举背后，是 “台独” 势力的恐惧和忌惮。",
          "source_id": "src-iorg-131",
          "about": "国台办"
        },
        {
          "text": "1 月 14 日，🇨🇳 国台办「中国台湾网」發布文本「“青提”风波背后：民进党“文字猎巫”的“抗中”意识形态困局」，內文包含「这一荒诞事件再次暴露绿营长期操弄“抗中反中”意识形态、将日常事务泛政治化的深层乱象，引发岛内舆论对“绿色恐怖”蔓延的担忧」、「实际上，随着两岸文化交流合作的深入，许多大陆用语早已成为台湾民众沟通中的日常。",
          "source_id": "src-iorg-131",
          "about": "国台办"
        },
        {
          "text": "This was most clearly on show in an exchange between a CCTV journalist and Director of the Information Bureau of the Taiwan Affairs Office (TAO) of the State Council Chen Binhua (陈斌华).",
          "source_id": "src-jamestown-js2024b",
          "about": "TAO"
        },
        {
          "text": "Chen Binhua, the TAO spokesman, used the same phrase in his press conference several days later (TAO, October 16).",
          "source_id": "src-jamestown-js2024b",
          "about": "TAO"
        },
        {
          "text": "中国海警在中国海域开展执法巡查，是为了维护相关海域作业秩序，维护包括台湾渔民在内的中国渔民生命财产安全和合法正当权益)” (TAO, October 16).",
          "source_id": "src-jamestown-js2024b",
          "about": "TAO"
        }
      ]
    },
    {
      "id": "golaxy",
      "name_zh": "中科天璣",
      "name_en": "GoLaxy",
      "aliases": [
        "GoLaxy",
        "中科天玑数据科技股份有限公司",
        "Zhongke Tianji",
        "The GoLaxy Documents",
        "Beijing Golaxy",
        "北京中科天璣科技",
        "中科天玑",
        "中科天玑数据科技",
        "GoPro 智能宣傳系統"
      ],
      "category": "tech-vendor",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "中國科學院衍生的數據智能企業，2025年外洩文件揭露其以AI驅動影響行動鎖定台灣。",
      "description_zh": "中科天璣（GoLaxy）成立於2010年，是由中國科學院計算技術研究所衍生的數據智能企業。2025年外洩的內部文件顯示，該公司開發以AI驅動的「智慧宣傳系統」，可大規模蒐集社群資料、建立心理側寫，並以擬真的虛擬人物進行影響行動；文件指其鎖定台灣（含2024大選）、香港與美國的政治人物與意見領袖。GoLaxy在《紐約時報》求證時否認所有指控。",
      "indicators": [
        "儀表板列出 3,692 個虛擬人物 (DTL)",
        "逾 170 名台灣政治人物檔案；約 5,000 筆台灣人個資",
        "選舉期間追蹤 634,448 則台灣相關內容 (DTL)",
        "對美建立逾2,000名政治人物及至少117名國會議員檔案 (Vanderbilt/NYT)",
        "跨 X/Facebook/LinkedIn/Instagram/Line/WhatsApp/Telegram/Pinterest/TikTok/YouTube/Reddit/Medium 運作",
        "2024 大選每週監測逾 60 萬筆互動"
      ],
      "active_since": "2010–至今",
      "related": [
        {
          "target_id": "cac",
          "relation": "linked-to",
          "note": "文件顯示向網信辦尋求指導與資金"
        },
        {
          "target_id": "mss",
          "relation": "linked-to",
          "note": "文件顯示向國安部尋求指導與資金"
        },
        {
          "target_id": "pla-pwd",
          "relation": "linked-to",
          "note": "文件列311基地/61716部隊為相關機關"
        },
        {
          "target_id": "cac",
          "relation": "operated-by",
          "note": "NSB 2025：受網信辦、國安部、政治工作部指揮蒐集臺灣社情數據"
        },
        {
          "target_id": "cac",
          "relation": "affiliated-with",
          "note": "DTL：與中央網信辦（CAC）有合作往來"
        },
        {
          "target_id": "pla-pwd",
          "relation": "affiliated-with",
          "note": "DTL：與中央軍委科技委（CMC STC）、解放軍 311 基地／61716 部隊（福州心理戰）合作；投資方曙光（Sugon）據美國國防部與解放軍有連結"
        },
        {
          "target_id": "tao",
          "relation": "affiliated-with",
          "note": "DTL：與國務院台灣事務辦公室合作往來"
        },
        {
          "target_id": "mss",
          "relation": "affiliated-with",
          "note": "DTL 文件提及與國家安全部的合作"
        }
      ],
      "event_ids": [
        "golaxy-leak-2025",
        "election-op-2024"
      ],
      "source_ids": [
        "src-vanderbilt-golaxy",
        "src-record-golaxy",
        "src-dtl-golaxy",
        "src-nsb-2026",
        "src-vanderbilt-golaxy-2025",
        "src-nyt-golaxy"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "A Vanderbilt Institute of National Security archive detailing how state-aligned firm GoLaxy harvests data, builds precision profiles, and deploys AI-driven propaganda at scale.",
          "source_id": "src-vanderbilt-golaxy",
          "about": "GoLaxy"
        },
        {
          "text": "The Vanderbilt Institute of National Security has released The GoLaxy Documents—an archive describing how one Chinese company uses artificial intelligence to drive large-scale influence operations.",
          "source_id": "src-vanderbilt-golaxy",
          "about": "GoLaxy"
        },
        {
          "text": "台灣民主實驗室的〈AI 在中國影響力作戰中的崛起：從中科天璣文件中得出的九大要點〉，整理從中國外洩的一份科技公司內部文件，分析中國情報資訊公司「中科天璣」(該公司有中國科學院計算技術研究所的背景)對台灣、美國、一帶一路國家、香港新疆西藏等資訊監控、分析及宣傳策略系統。",
          "source_id": "src-factlink-ff3dee",
          "about": "中科天璣"
        },
        {
          "text": "3,692 virtual personas operable across 12 platforms",
          "source_id": "src-dtl-golaxy",
          "about": "GoLaxy AI 影響力作業（2024 大選）"
        },
        {
          "text": "GoLaxy built detailed profiles of 170+ Taiwanese political figures",
          "source_id": "src-dtl-golaxy",
          "about": "GoLaxy"
        },
        {
          "text": "the campaign was run using GoLaxy's AI-driven smart propaganda system",
          "source_id": "src-dtl-golaxy",
          "about": "related-to"
        },
        {
          "text": "weekly monitoring of 600,000+ Taiwan-related items during the 2024 election",
          "source_id": "src-dtl-golaxy",
          "about": "targets"
        }
      ]
    },
    {
      "id": "meiya-pico",
      "name_zh": "美亞柏科",
      "name_en": "Meiya Pico",
      "aliases": [
        "國投智能",
        "SDIC Intelligence",
        "厦门市美亚柏科信息股份有限公司",
        "Meiya Pico",
        "Xiamen Meiya Pico",
        "廈門美亞柏科信息股份",
        "Xiamen Meiya Pico Information"
      ],
      "category": "tech-vendor",
      "role": "collaborator",
      "origin": "PRC",
      "summary_zh": "中國數位鑑識與公共安全大數據廠商，被列為GoLaxy合作夥伴。",
      "description_zh": "美亞柏科（2023年底更名「國投智能」）成立於1999年，是中國數位鑑識與公共安全大數據龍頭，由國有的國家開發投資集團控股，產品包括手機與電腦取證工具。2019年10月遭美國商務部列入實體清單、2021年12月遭美國財政部依第13959號行政命令制裁，均與新疆監控有關。在GoLaxy外洩文件中被列為合作夥伴之一，但文件未說明其具體供應內容，且該合作被描述為一般性而非針對台灣。",
      "indicators": [
        "2019-10 列入美國商務部實體清單 (涉新疆監控)",
        "2021-12 遭美財政部依 EO 13959 制裁",
        "2019/10 列入美國商務部實體清單",
        "國有控股（SDIC 系）"
      ],
      "active_since": "1999–至今",
      "related": [
        {
          "target_id": "golaxy",
          "relation": "supplies-tech-to",
          "note": "GoLaxy 文件列為合作夥伴 (供應內容未明、非台灣專屬)"
        },
        {
          "target_id": "cac",
          "relation": "operated-by",
          "note": "NSB 2025：受網信辦、國安部、政治工作部指揮蒐集臺灣社情數據"
        },
        {
          "target_id": "golaxy",
          "relation": "affiliated-with",
          "note": "DTL GoLaxy 文件分析中與 GoLaxy 並列的技術供應商"
        }
      ],
      "event_ids": [
        "golaxy-leak-2025"
      ],
      "source_ids": [
        "src-dtl-golaxy",
        "src-record-meiya",
        "src-nsb-2026"
      ],
      "confidence": "low"
    },
    {
      "id": "iflytek",
      "name_zh": "科大訊飛",
      "name_en": "iFlytek",
      "aliases": [
        "iFLYTEK",
        "科大讯飞股份有限公司",
        "合肥訊飛數位",
        "iFlytek",
        "合肥科大訊飛",
        "Hefei iFlytek Digital Technology"
      ],
      "category": "tech-vendor",
      "role": "collaborator",
      "origin": "PRC",
      "summary_zh": "中國語音AI指標企業，其子公司被列為GoLaxy合作夥伴。",
      "description_zh": "科大訊飛1999年成立於合肥，由中國科學技術大學衍生，是中國語音AI（語音辨識、合成、聲紋）的指標企業。2019年10月被美國商務部列入實體清單，理由為涉及新疆對維吾爾族等少數民族的高科技監控。Doublethink Lab對GoLaxy文件的分析將其子公司列為合作夥伴，提供語音與語言處理能力，但未記載其具體投入台灣行動。",
      "indicators": [
        "2019-10 列入美國商務部實體清單 (涉新疆監控)",
        "AI 語音／自然語言處理"
      ],
      "active_since": "1999–至今",
      "related": [
        {
          "target_id": "golaxy",
          "relation": "supplies-tech-to",
          "note": "GoLaxy 文件列其子公司為合作夥伴 (一般性)"
        },
        {
          "target_id": "golaxy",
          "relation": "affiliated-with",
          "note": "DTL GoLaxy 文件分析中並列的 AI 技術供應商"
        }
      ],
      "event_ids": [
        "golaxy-leak-2025"
      ],
      "source_ids": [
        "src-dtl-golaxy",
        "src-hrw-iflytek",
        "src-nsb-2026"
      ],
      "confidence": "low"
    },
    {
      "id": "onesight",
      "name_zh": "一網互通",
      "name_en": "OneSight",
      "aliases": [
        "OneSight",
        "一网互通（北京）科技有限公司",
        "OneSight Marketing Cloud",
        "Beijing OneSight"
      ],
      "category": "tech-vendor",
      "role": "collaborator",
      "origin": "PRC",
      "summary_zh": "協助中國官媒在海外社群擴大影響力的行銷服務商。",
      "description_zh": "一網互通（OneSight）2017年成立於北京，主打海外社群媒體管理服務。2020年ProPublica調查揭露，該公司曾承接隸屬統戰部的中國新聞社合約以增加其Twitter粉絲，客戶含新華社、CGTN、China Daily等官媒；ASPI 2024年報告將其列為協助中共對外宣傳的資訊作戰承包商案例。目前無可信來源將其與針對台灣的特定影響行動直接連結，故角色界定為對外宣傳協力商。",
      "indicators": [
        "承接中新社約人民幣124萬餘元合約增加Twitter粉絲 (ProPublica)"
      ],
      "active_since": "2017–至今",
      "related": [
        {
          "target_id": "ufwd",
          "relation": "linked-to",
          "note": "其客戶中新社隸屬統戰部 (ProPublica)"
        },
        {
          "target_id": "cac",
          "relation": "operated-by",
          "note": "NSB 2025：受網信辦、統戰部、網路空間部隊委託運營機器人帳號"
        }
      ],
      "event_ids": [],
      "source_ids": [
        "src-propublica-onesight",
        "src-aspi-persuasive",
        "src-nsb-2026"
      ],
      "confidence": "low"
    },
    {
      "id": "haixun",
      "name_zh": "海訊社",
      "name_en": "Haixun",
      "aliases": [
        "上海海讯社科技有限公司",
        "Shanghai Haixun",
        "HaiEnergy",
        "GLASSBRIDGE",
        "Haixun",
        "Haixunshe",
        "海讯",
        "上海海讯科技有限公司",
        "Shanghai Haixun Technology"
      ],
      "category": "pr-firm",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "被Mandiant認定為「HaiEnergy」親中影響行動基礎設施提供者的中國公關公司。",
      "description_zh": "海訊社（上海海訊社科技有限公司）是一家中國公關公司，被Mandiant（Google）認定為「HaiEnergy」親中影響行動所用基礎設施的提供者。該行動經營至少72個偽裝成獨立新聞網站的不實網站，並透過通訊社服務將親中內容置入美國合法新聞網站的子網域；2023年的後續報告指海訊社已知情並積極支援該行動。Google於2024年將海訊社列為「GLASSBRIDGE」四家公司之一，並表示已下架逾600個相關網域。",
      "indicators": [
        "經營72個不實新聞網站 (59網域+13子網域，Mandiant 2022)",
        "Google 自2022年起下架逾600個海訊社相關網域 (GLASSBRIDGE 2024)",
        "HaiEnergy：至少 72 個偽新聞網站",
        "Google 2025 Q1 公告：封鎖 25 個與海訊相關域名"
      ],
      "active_since": "2022 (記錄起)–至今",
      "related": [
        {
          "target_id": "mps",
          "relation": "operated-by",
          "note": "NSB 2025：受中宣部與公安部利用架設冒充國際媒體之假網站"
        },
        {
          "target_id": "mps",
          "relation": "linked-to",
          "note": "台灣 NSB：中央宣傳部與公安部利用海訊社等行銷公司製作偽新聞網站"
        }
      ],
      "event_ids": [
        "haienergy-exposure",
        "glassbridge-takedown-2024",
        "nsb-cognitive-2025"
      ],
      "source_ids": [
        "src-mandiant-haienergy-2022",
        "src-mandiant-haienergy-2023",
        "src-google-glassbridge",
        "src-nsb-2026"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "Sites attributed to HaiEnergy all display images and videos that are hosted on the server 02100.vip, which is registered by Haixun (Figure 2).",
          "source_id": "src-mandiant-haienergy-2022",
          "about": "HaiEnergy"
        },
        {
          "text": "We observed multiple inauthentic news sites we attribute to “HaiEnergy” listed in a downloadable spreadsheet hosted at haixunpr.org.",
          "source_id": "src-mandiant-haienergy-2022",
          "about": "HaiEnergy"
        },
        {
          "text": "To date, HaiEnergy has exclusively leveraged Haixun infrastructure to host websites.",
          "source_id": "src-mandiant-haienergy-2022",
          "about": "HaiEnergy"
        },
        {
          "text": "We currently track HaiEnergy and DRAGONBRIDGE as separate campaigns due to differences in campaign TTPs.",
          "source_id": "src-mandiant-haienergy-2022",
          "about": "HaiEnergy"
        },
        {
          "text": "Specifically, known DRAGONBRIDGE assets have not promoted content from HaiEnergy's inauthentic news sites.",
          "source_id": "src-mandiant-haienergy-2022",
          "about": "HaiEnergy"
        },
        {
          "text": "We note that despite the capabilities and global reach advertised by Haixun, there is at least some evidence to suggest HaiEnergy failed to generate substantial engagement.",
          "source_id": "src-mandiant-haienergy-2022",
          "about": "HaiEnergy"
        },
        {
          "text": "Based on information from public descriptions of the company’s services, Haixun offers content creation and marketing services in at least 40 different languages in over 100 countries.",
          "source_id": "src-mandiant-haienergy-2022",
          "about": "Haixun"
        },
        {
          "text": "In total, we identified 72 websites (59 domains and 13 subdomains) hosted by Haixun, which were used to target audiences in North America, Europe, the Middle East, and Asia.",
          "source_id": "src-mandiant-haienergy-2022",
          "about": "Haixun"
        },
        {
          "text": "Pro-PRC HaiEnergy Campaign Exploits U.S.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "HaiEnergy"
        },
        {
          "text": "The campaign then used the protests as source material in HaiEnergy-linked operations that promoted narratives surrounding highly divisive U.S.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "HaiEnergy"
        },
        {
          "text": "Figure 3: A HaiEnergy site posts an article identical to one on Times Newswire and links directly to that Times Newswire article published on a subdomain of a U.S.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "HaiEnergy"
        },
        {
          "text": "In some cases, HaiEnergy-sourced content was promoted by social media accounts linked to paid promoters on the same days, further suggesting a notable degree of coordination (Figure 7).",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "HaiEnergy"
        },
        {
          "text": "Mandiant also identified two clusters of suspected inauthentic accounts operating on Twitter engaged in the concerted promotion of source material originating from HaiEnergy-linked sources.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "HaiEnergy"
        },
        {
          "text": "Evidence Suggests Operators Behind HaiEnergy May Have Commissioned Staged In-Person Protests in Washington, D.C.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "HaiEnergy"
        },
        {
          "text": "As previously alluded to, HaiEnergy subsequently leveraged these videos to bolster campaign messaging.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "HaiEnergy"
        },
        {
          "text": "Figure 13: Previously identified social media accounts leveraged as part of the HaiEnergy campaign promote identical text from Times Newswire article and video of protest in Washington, D.C.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "HaiEnergy"
        },
        {
          "text": "Attempts by the campaign to manufacture source material offline for subsequent use in HaiEnergy-linked operations may not be isolated to the aforementioned protests in Washington, D.C.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "HaiEnergy"
        },
        {
          "text": "Mandiant released a public report detailing an ongoing influence campaign leveraging infrastructure attributed to the Chinese public relations (PR) firm Shanghai Haixun Technology Co.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "Haixun"
        },
        {
          "text": "Ltd (上海海讯社科技有限公司) (referred to hereafter as “Haixun”).",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "Haixun"
        },
        {
          "text": "Additionally, we observed numerous reviews from the Haixun Fiverr account as a “buyer” placed on identified “seller” accounts.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "Haixun"
        },
        {
          "text": "In at least one instance, we observed Haixun, via its Fiverr account, commission an influencer to promote a video surrounding China’s “victory” over COVID-19.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "Haixun"
        },
        {
          "text": "On Fiverr, the Haixun account shared a screenshot of the video being posted by the influencer, presumably as proof of service delivery, alongside text stating “Great service, fast respond.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "Haixun"
        }
      ]
    },
    {
      "id": "borderless-group",
      "name_zh": "無邊界集團",
      "name_en": "Borderless Group",
      "aliases": [
        "无边界集团",
        "Borderless",
        "wuweikeji (舊稱)",
        "無界",
        "無邊界",
        "Wubianjie Group",
        "Borderless Group",
        "Wubianjie Group (Borderless Group)",
        "無為科技",
        "wuweikeji"
      ],
      "category": "content-farm",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "Doublethink Lab記錄、位於秦皇島、與中共政府有往來的內容農場。",
      "description_zh": "無邊界集團（无边界集团，舊稱 wuweikeji）是台灣民主實驗室記錄的一個位於秦皇島的內容農場，與中共政府有往來、曾與國有的秦皇島廣播電視台簽署合作。其經營逾千個偽裝新聞網域，並以數百個不實Threads帳號（多由香港操作）導流，污染台灣與日本的資訊環境，選舉期間轉向政治與不實內容。",
      "indicators": [
        "549 個 Threads 假帳號（2023/07–2026/02 建立）",
        "至少 467,547 則貼文／回覆，83% 為導流",
        "1,217個網域、475個仍運作 (DTL)",
        "鎖定台灣、日本、英語與葡語受眾",
        "繁中 352 帳號、日文約 134、葡文約 27–70",
        "具名帳號 @lihaiwei2904（政治內容明顯偏多）",
        "經營『pray for you』FB 粉專等，以颱風救災假訊息與『蝴蝶攻擊』假冒在地、嫁禍越南志工／在野，製造社會分化 (FactLink 2025)"
      ],
      "active_since": "2023-07 至 2026 (帳號建立期)",
      "related": [
        {
          "target_id": "cac",
          "relation": "linked-to",
          "note": "DTL：『documented ties to the CCP government』，曾與國有秦皇島廣播電視台簽署合作並共同經營公司（2020–2022）"
        }
      ],
      "event_ids": [
        "borderless-exposure",
        "nsb-cognitive-2025",
        "butterfly-flood-2025"
      ],
      "source_ids": [
        "src-dtl-borderless",
        "src-nsb-2026",
        "src-factlink-butterfly"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "This paper contributes to research on the Borderless Group (无边界集团), a PRC content farm with documented ties to the CCP government, and exposes its operations on Threads.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "We identified 1,217 domains containing inauthentic news pages operated by the Borderless Group.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "Roughly 566 authentic Threads users have shared Borderless Group domains, indicating the operation extends beyond its own inauthentic ecosystem.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "The Borderless Group uses large-scale coordinated inauthentic behavior to pollute the Taiwanese and Japanese information environments.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "Previous research indicates that the Borderless Group has close collaborations with the CCP government.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "Subsequently, the Borderless Group and said state-owned outlet jointly operated a company between 2020 and 2022.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "The Borderless Group runs large numbers of inauthentic accounts on several social media platforms to share links and generate traffic for their domains.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "Based on domain registration records, previous research, and social media analysis, we have identified 1,217 domains that are operated by the Borderless Group.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "Despite these different layouts, the underlying source code does contain the Borderless Group’s forensic indicators.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "We are almost certain that these accounts are operated by the Borderless Group, as they post large numbers of links to the Borderless Group’s domains (83% of the observed posts/replies).",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "The Borderless Group also employs an unconventional domain setup: in some cases, the apex domain and its ‘www.’ subdomain serve entirely different websites.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "We are not sure why the Borderless Group uses this setup, but it could be related to cost-reduction or abuse evasion.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "Conceal Infrastructure T0130: The Borderless Group uses GoDaddy and other proxy services to register its domains.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "All three domains are operated by the Borderless Group.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "Bots Amplify via Automated Forwarding and Reposting T0049.003: The Borderless Group maintains large numbers of inauthentic accounts on social media platforms to promote traffic to their domains through coordinated inauthentic behavior.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "The Borderless Group’s domains are shared by inauthentic accounts on a wide range of platforms, including Facebook, Threads, X, TikTok, Dcard, and Instagram.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "The Borderless Group domains have also been picked up by authentic Threads users.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "This shows that the Borderless Group is able to reach authentic Threads users beyond its bubble of inauthentic accounts.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "For this reason the Borderless Group’s operation scores a 3 out of 6 on the breakout scale; there are multiple breakouts on multiple platforms.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "Our research shows that the Borderless Group’s activities on Threads are in a mature state.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "For the Borderless Group, Threads is just another platform to promote their domains.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "In essence, the Borderless Group uses large-scale coordinated inauthentic behavior to pollute the Taiwanese and Japanese information environments.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "We searched the internet and social media for additional Borderless Group websites.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "We automatically determined whether suspected links fit the Borderless Group pattern by scraping their HTML codes and looking for several forensic indicators.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "PublicWWW shows there are 423 websites that contain this specific file path and virtually all of them are connected to the Borderless Group.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "We are certain the email address is connected to the Borderless Group.",
          "source_id": "src-dtl-borderless",
          "about": "Borderless Group"
        },
        {
          "text": "[website]/about/about-zh.html#for_advertisers contains “無邊界集團”: In many cases, the “對於廣告商” section of the website specifically mentions that the website’s content is generated by 無邊界集團.",
          "source_id": "src-dtl-borderless",
          "about": "無邊界集團"
        }
      ]
    },
    {
      "id": "mission-content-farm",
      "name_zh": "密訊",
      "name_en": "Mission",
      "aliases": [
        "Mission",
        "密訊",
        "mission-tw.com",
        "missiback.com"
      ],
      "category": "content-farm",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "在台高影響力內容農場，轉載中國福建官媒內容、多次換域復活。",
      "description_zh": "密訊（Mission）是台灣高影響力內容農場，2019年4月曾為單週Facebook最多被分享的網域。據《報導者》調查，密訊多次遭Facebook下架後換網域復活，轉載中國福建官媒《海峽導報》內容，顧問林正國具新黨背景，被視為跨海峽爭議與不實資訊傳播節點。",
      "indicators": [
        "2019-04 單週Facebook最多被分享網域，分享數為自由時報5倍 (報導者)"
      ],
      "active_since": "2019 (顯著)",
      "related": [],
      "event_ids": [],
      "source_ids": [
        "src-reporter-mission",
        "src-gazette-mission"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "群聚發文 同日，內容農場「密訊」發布和中時文章標題及內容一致的文章，並獲得粉專「反民進黨粉絲團」「民間大小事」「空心菜政府」群聚分享（23:00-01）。",
          "source_id": "src-iorg-38",
          "about": "密訊"
        }
      ]
    },
    {
      "id": "taiwan-headlines",
      "name_zh": "兩岸頭條",
      "name_en": "Taiwan Headlines",
      "aliases": [
        "Taiwan Headlines",
        "@taiwanheadlines",
        "中華微視 (China VTV) 相關粉專"
      ],
      "category": "content-farm",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "與「中華微視」相關的Facebook粉專，2022年遭調查局偵辦涉散布不實訊息。",
      "description_zh": "兩岸頭條（Taiwan Headlines）是與「中華微視」(China VTV) 相關的Facebook粉專。2022年11月法務部調查局偵辦中華微視負責人涉嫌受陸方指示、未經許可接受陸資（約定人民幣300萬元取得67%股權），透過該粉專散布如「日本為台海突發狀況預作撤僑」等不實訊息；台灣民主實驗室記錄該粉專由中國與香港管理者經營。",
      "indicators": [
        "調查局指中華微視約定接受陸資人民幣300萬元換67%股權 (自由時報)",
        "DTL 指該粉專由中國與香港管理者經營"
      ],
      "active_since": "2022",
      "related": [],
      "event_ids": [
        "china-vtv-prosecution",
        "hack-leak-takaichi-2025"
      ],
      "source_ids": [
        "src-ltn-chinavtv",
        "src-gti-provincial",
        "src-dtl-2022election",
        "src-factlink-hackleak"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "此外，與中國高度相關的臉書粉專「兩岸頭條」、具有中國官方性質的香港《文匯報》也接連散播相同訊息。",
          "source_id": "src-factlink-hackleak",
          "about": "兩岸頭條"
        },
        {
          "text": "但在台灣查證此傳言為不實訊息之後，兩岸頭條和香港文匯報皆快速下架刪文。",
          "source_id": "src-factlink-hackleak",
          "about": "兩岸頭條"
        },
        {
          "text": "「兩岸頭條」過去多次傳播親中不實訊息。",
          "source_id": "src-factlink-hackleak",
          "about": "兩岸頭條"
        },
        {
          "text": "14 日，中國時報發表社論「阿富汗悲慘結局，台灣的震撼彈」，該社論在 16 日被「兩岸頭條」引用。",
          "source_id": "src-iorg-11",
          "about": "兩岸頭條"
        },
        {
          "text": "同日，「兩岸頭條」、「中華微視」引用《日經亞洲評論》報導內容，表示阿富汗的狀況打亂了拜登集中精力對抗中國的佈局。",
          "source_id": "src-iorg-11",
          "about": "兩岸頭條"
        },
        {
          "text": "蔡正元的意見於當日獲得中資粉專「兩岸頭條」（9:12）及中共官媒「僑報網」（16:47）分享及引用。",
          "source_id": "src-iorg-38",
          "about": "兩岸頭條"
        },
        {
          "text": "2 月 3 日 05:29 中資粉專「兩岸頭條」發布影片，標題為「美徹底犧牲台灣！",
          "source_id": "src-iorg-38",
          "about": "兩岸頭條"
        }
      ]
    },
    {
      "id": "spamouflage",
      "name_zh": "Spamouflage",
      "name_en": "Spamouflage",
      "aliases": [
        "Spamouflage Dragon",
        "DRAGONBRIDGE",
        "Taizi Flood",
        "龍橋",
        "龍橋集團",
        "Dragonbridge",
        "Dragonbridge (Spamouflage)",
        "Storm-1376",
        "Empire Dragon"
      ],
      "category": "cib-network",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "長期運作、跨數十平台的親中協同造假行為網路，曾鎖定台灣。",
      "description_zh": "Spamouflage（又稱 Spamouflage Dragon／DRAGONBRIDGE）是一個長期運作、跨平台的親中協同造假行為網路，最早由Graphika於2019年9月命名揭露。該網路使用大量假帳號與被劫持帳號，在數十個社群平台散布支持中國政府、攻擊其批評者的內容，鎖定對象包括台灣、美國、澳洲、英國與日本等。Meta稱其為「全球已知最大規模的跨平台隱蔽影響行動」，但內容多半互動低、流量有限。",
      "indicators": [
        "Meta 2023/08/29 下架 7,704 個 FB 帳號、954 粉專、15 社團、15 IG 帳號，史上最大（Meta）",
        "活躍於全球逾 180 個平台、逾 20 種語言（Meta／NSB）",
        "Google：2022 瓦解逾 50,000 次、停用 53,177 個 YouTube 頻道；2024 Q1 逾 10,000 次（Google TAG）",
        "2024 大選散布 318 頁《蔡英文秘史》偽文件",
        "常用 #taiwan #america 等通用標籤"
      ],
      "active_since": "2019–至今",
      "related": [
        {
          "target_id": "mps",
          "relation": "operated-by",
          "note": "Meta/DOJ/NSB 連結至公安部相關人員"
        },
        {
          "target_id": "magaflage",
          "relation": "affiliated-with",
          "note": "冒充美國人之子群屬同一網路"
        },
        {
          "target_id": "mps",
          "relation": "linked-to",
          "note": "Meta Q2 2023 措辭：『links to individuals associated with Chinese law enforcement』；DOJ 2023/04 起訴 MPS『912 專項工作組』troll farm（DOJ 文件未使用 Spamouflage 或 Taiwan 字眼，連結為 Meta/CNN/研究者所做）"
        },
        {
          "target_id": "durinbridge",
          "relation": "affiliated-with",
          "note": "Google GLASSBRIDGE：DURINBRIDGE 網站代為發布 DRAGONBRIDGE 推廣的《蔡英文秘史》與賴清德敘事"
        }
      ],
      "event_ids": [
        "spamouflage-takedown-2023",
        "election-op-2024",
        "meta-china-q3-2023",
        "dragonbridge-q1-2024-takedown",
        "mtac-taiwan-ai-2024",
        "golaxy-leak-2025",
        "aspi-taiwan-2024",
        "spamouflage-deepfake-2023",
        "doj-912-2023",
        "meta-taiwan-2025",
        "joint-sword-2024",
        "takaichi-strait-2025",
        "glassbridge-takedown-2024"
      ],
      "source_ids": [
        "src-graphika-spamouflage",
        "src-meta-2023",
        "src-record-spamouflage",
        "src-google-dragonbridge-2024",
        "src-nsb-2026",
        "src-graphika-americans",
        "src-meta-q3-2023",
        "src-mtac-2024",
        "src-rf-empire-dragon",
        "src-aspi-2024",
        "src-graphika-deepfake",
        "src-doj-912",
        "src-meta-q1-2025",
        "src-dtl-multiverse"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "在11月更發現極為相似的另一個Hashtag「右翼の共生者」，第二波標籤以日語用法更道地，且該波攻擊與高市提出的「台灣有事」有關，不過這些帳號多數屬於典型「Spamouflage（垃圾變色龍）」網路，點閱互動低，影響力有限。",
          "source_id": "src-factlink-takaichi",
          "about": "Spamouflage"
        },
        {
          "text": "We believe one is likely linked to the CCP’s largest network of inauthentic social media accounts known as Spamouflage or Dragonbridge.",
          "source_id": "src-aspi-2024",
          "about": "Spamouflage"
        },
        {
          "text": "Accounts targeting Lai and Hsiao were involved in previous Spamouflage campaigns targeting Chinese virologist Yan Limeng, Chinese businessman Guo Wengui, and Chinese dissidents.",
          "source_id": "src-aspi-2024",
          "about": "Spamouflage"
        },
        {
          "text": "Spamouflage-affiliated accounts sought to harass DPP legislative candidates too, calling the DPP’s Lin Ching-yi, a ‘shameless’ politician.",
          "source_id": "src-aspi-2024",
          "about": "Spamouflage"
        },
        {
          "text": "The document was originally uploaded on Zenodo, an open-source data repository previously used by Spamouflage-linked operators to upload a document claiming Covid-19 originated from the US.",
          "source_id": "src-aspi-2024",
          "about": "Spamouflage"
        },
        {
          "text": "On YouTube, Spamouflage-linked channels posted at least 490 videos referencing the ‘secret history’ document between 4 January and 10 January before YouTube suspended all the channels.",
          "source_id": "src-aspi-2024",
          "about": "Spamouflage"
        },
        {
          "text": "ASPI is not suggesting that D-ID knowingly cooperated with Spamouflage-linked operators.",
          "source_id": "src-aspi-2024",
          "about": "Spamouflage"
        },
        {
          "text": "Today we are sharing updated insights about DRAGONBRIDGE, the most prolific IO actor Google’s Threat Analysis Group (TAG) tracks.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "Despite producing a high amount of content, DRAGONBRIDGE still does not get high engagement from users on YouTube or Blogger.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "As described in our previous blog, the majority of DRAGONBRIDGE activity remains low quality content without a political message.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "A small fraction of DRAGONBRIDGE accounts also post about current events with messaging that supports pro-PRC views.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "In the first quarter of 2024, Google disrupted over 10,000 instances of DRAGONBRIDGE activity across YouTube and Blogger.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "In the network's lifetime, this brings the number of instances of DRAGONBRIDGE activity we have disrupted to over 175,000.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "Despite their continued profuse content production and the scale of their operations, DRAGONBRIDGE achieves practically no organic engagement from real viewers.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "Despite experimenting with content and producing large amounts of content, DRAGONBRIDGE still does not receive high engagement.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "In the cases where DRAGONBRIDGE content did receive engagement, it was almost entirely inauthentic, coming from other DRAGONBRIDGE accounts and not from authentic users.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "Comment activity was also mostly from other DRAGONBRIDGE accounts.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "The majority of DRAGONBRIDGE activity is low quality content without a political message, populated across many channels and blogs.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "However, a small fraction of DRAGONBRIDGE accounts also post about current events with messaging that pushes pro-PRC views.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "DRAGONBRIDGE accounts create content reacting to breaking news, especially wedge social issues, usually within a few weeks of the event.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "For anticipated events, DRAGONBRIDGE creates content in advance, allowing them to quickly disseminate large volumes in a short timeframe around the event.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "DRAGONBRIDGE content has targeted Taiwan for years, including pro-unification narratives and surges of activity in response to news events.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "As is typical with DRAGONBRIDGE, the volume of content was large but unsuccessful in gaining traction with authentic viewers.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "The videos were typical of DRAGONBRIDGE’s style featuring robotic voiceovers, stock footage and publicly available images.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "DRAGONBRIDGE posted thousands of videos and comments on YouTube using synthetic audio and avatars promoting a false “secret history” document critical of the outgoing President Tsai Ing-wen.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "DRAGONBRIDGE also posted comments to videos belonging to legitimate users, likely an attempt to spread their narrative.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "The comments shared links to DRAGONBRIDGE videos and the “secret history” document, which was hosted elsewhere online.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "DRAGONBRIDGE also pushed the same narrative on multiple, non-Google platforms, including X (formerly Twitter), Reddit, Instagram, Facebook, Medium, and smaller online forums and bulletin boards.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "DRAGONBRIDGE has experimented with generative AI tools to create content for several years.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "As early as 2022, Graphika reported that DRAGONBRIDGE was using AI-generated footage.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "DRAGONBRIDGE used an AI-generated \"news presenter\" in a short news segment-style video.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "For example, in May 2024 DRAGONBRIDGE began uploading videos and commenting on the student protests over the Israel-Hamas war on US university campuses.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "The DRAGONBRIDGE content appeared in English, was generally pro-Palestine in its narrative themes, and used the student protests to frame the US and Western media as hypocritical.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "This fits in a larger context of DRAGONBRIDGE portraying the US government and society as hypocritical.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "We have seen DRAGONBRIDGE respond to significant events with pre-produced content and consider it highly likely that they will continue to do so, including with the 2024 US general election.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "DRAGONBRIDGE content has regularly included US political issues and political figures, particularly in the leadup to elections and generally presented in the format of short news clips.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "In previous US elections, DRAGONBRIDGE content has not explicitly advocated for specific candidates or any specific political outcome in the US.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "In 2020 DRAGONBRIDGE content was critical of both presidential candidates.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "The activity extended cross-platform, with DRAGONBRIDGE posting similar messages via tweets and identical video content on X, formerly known as Twitter.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "So far in 2024 DRAGONBRIDGE continues to spread narratives highlighting US political divisions, including content in January discussing political leaders.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "TAG is actively monitoring DRAGONBRIDGE activity for any shifts in tone or focus related to the US presidential election.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "In 2023, Mandiant also observed DRAGONBRIDGE accounts operating across multiple, non-Google platforms promoting narratives similar to those observed by TAG.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "That is why Google has scaled our efforts in recent years to disrupt DRAGONBRIDGE coordinated inauthentic activity on our platforms.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "We encourage others in the community to continue tracking this actor and shedding light on their operations and would like to thank Mandiant and other researchers for their partnership in countering DRAGONBRIDGE activity.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "DRAGONBRIDGE, also known as “Spamouflage Dragon,” is a spammy influence network linked to the People’s Republic of China (PRC) that has a presence across multiple platforms.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "Spamouflage Dragon"
        },
        {
          "text": "The videos used the branding of a likely fictitious media company called “Wolf News” mirroring past Spamouflage efforts to pass as legitimate news outlets.",
          "source_id": "src-graphika-deepfake",
          "about": "Spamouflage"
        },
        {
          "text": "Chinese State-Linked Influence Operation Spamouflage Masquerades as U.S.",
          "source_id": "src-graphika-americans",
          "about": "Spamouflage"
        },
        {
          "text": "Chinese state-linked influence operation (IO) Spamouflage has become more aggressive in its efforts to influence U.S.",
          "source_id": "src-graphika-americans",
          "about": "Spamouflage"
        },
        {
          "text": "Through Graphika’s intelligence reporting, we identified 15 Spamouflage accounts on X and one account on TikTok claiming to be U.S.",
          "source_id": "src-graphika-americans",
          "about": "Spamouflage"
        },
        {
          "text": "We also identified a cross-platform Spamouflage persona operating as an inauthentic U.S.-focused media outlet.",
          "source_id": "src-graphika-americans",
          "about": "Spamouflage"
        },
        {
          "text": "In conjunction with ISD’s analysis, our findings suggest that Spamouflage’s attempts to pose as U.S.",
          "source_id": "src-graphika-americans",
          "about": "Spamouflage"
        },
        {
          "text": "We assess that Spamouflage and other Chinese IO actors will almost certainly continue their efforts to influence U.S.",
          "source_id": "src-graphika-americans",
          "about": "Spamouflage"
        },
        {
          "text": "The Spamouflage network is a long-running and widespread but largely ineffective operation, traditionally pushing pro-CCP narratives.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "Although this strategy appears to be nascent, it has the potential to make Spamouflage significantly more effective.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "The Spamouflage campaign has become infamous amongst researchers for both its dogged persistence and its lack of significant innovation, despite the apparent futility of its operations.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "For the first time we have also found Spamouflage accounts posing convincingly as Americans.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "The three examples below illustrate the incremental changes in Spamouflage’s content since 2017.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "One of the accounts, @WubbaLubbaDub18 began in 2020 as a standard Spamouflage account.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "During this period the account frequently posted Spamouflage’s AI-generated ‘movie posters’, as discussed above, as well as posting anti-Biden and pro-Trump texts in English.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "A second MAGAflage account, @ktwsports, has been identified as part of the network because it has posted multiple word-for-word posts and images from known Spamouflage accounts.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "At least two other accounts have also made the switch from standard Spamouflage activity to this more tailored and convincing pro-MAGA content.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "It posted predominately in Mandarin sharing Spamouflage content until 16 April 2023.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "It then posted Spamouflage ‘movie posters’ alongside food and travel content, usually Chinese dishes or regions of China.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "Some of the content is original, but some is copied from viral tweets by large non-Spamouflage accounts.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "The case of the Huawei Mate 60 Pro phone is an example of how this approach has the potential to be more effective at spreading pro-CCP narratives among real Trump supporters than the usual Spamouflage tactics.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "As with almost all of Spamouflage’s content, this appeared to generate little if any engagement from accounts outside the Spamouflage network.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "But it is also possible that this is not the case, especially given Spamouflage’s usual pattern of operating at enormous scale.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "Newly created or repurposed accounts without a history of previous Spamouflage activity engaging in this behaviour would be very difficult for external researchers to detect.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "Most of the non-Spamouflage content originates from three accounts, with one in particular being the most prolific.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "While some posts are original, others are copied from viral posts by larger non-Spamouflage accounts.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "Unlike MAGAflage, as of early February 2024, the ‘fo’ accounts do not appear to be succeeding in breaking out of the Spamouflage bubble.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "Despite a small number of seemingly organic comments on some posts, engagement is overwhelmingly from what appear to be other Spamouflage accounts.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "The accounts examined in this Dispatch represent two small-scale but evolving strategies for the Spamouflage campaign.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "A particular concern is the possibility that there either already are – or that in the future there will be – many more ‘MAGAflage’ style accounts (or similar accounts supporting the Biden campaign) which evade the usual methods for detecting Spamouflage activity and are successful in generating real engagement.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "There is a long history of Spamouflage using hacked and stolen accounts, in some cases potentially purchased from account brokers.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "The account behaved like a standard Spamouflage account in both English and Mandarin until May 2022 when it began posting entirely in English.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "We currently track HaiEnergy and DRAGONBRIDGE as separate campaigns due to differences in campaign TTPs.",
          "source_id": "src-mandiant-haienergy-2022",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "DRAGONBRIDGE has typically leveraged thousands of social media and forum accounts across various authentic platforms to post comments, videos, and photos.",
          "source_id": "src-mandiant-haienergy-2022",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "Specifically, known DRAGONBRIDGE assets have not promoted content from HaiEnergy's inauthentic news sites.",
          "source_id": "src-mandiant-haienergy-2022",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "This lack of amplification from external sources, not unlike what we typically observed with DRAGONBRIDGE, limited the campaigns’ ability to breakout, essentially forming an echo chamber.",
          "source_id": "src-mandiant-haienergy-2022",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "Storm-1376 tried to cast doubt on the International Atomic Energy Agency’s (IAEA) scientific assessment that the disposal was safe.",
          "source_id": "src-mtac-2024",
          "about": "Storm-1376"
        },
        {
          "text": "The group we call Storm-1376, also known as Spamouflage and Dragonbridge, was the most prolific.",
          "source_id": "src-mtac-2024",
          "about": "Storm-1376"
        },
        {
          "text": "These have included an increasing use of AI-generated TV news anchors that Storm-1376 has deployed since at least February 2023.",
          "source_id": "src-mtac-2024",
          "about": "Storm-1376"
        },
        {
          "text": "Insikt Group has identified and analyzed a network named \"Empire Dragon,\" which is believed to be a coordinated and inauthentic operation likely aligned with the Chinese government and based in China.",
          "source_id": "src-rf-empire-dragon",
          "about": "Empire Dragon"
        },
        {
          "text": "Over time, Empire Dragon has evolved its tactics and focus.",
          "source_id": "src-rf-empire-dragon",
          "about": "Empire Dragon"
        },
        {
          "text": "Notably, there is a growing convergence between Empire Dragon's narratives and those propagated by Russian disinformation campaigns.",
          "source_id": "src-rf-empire-dragon",
          "about": "Empire Dragon"
        },
        {
          "text": "Empire Dragon's use of tactics like employing \"useful idiots,\" fringe political groups, and account impersonation further reflects this convergence.",
          "source_id": "src-rf-empire-dragon",
          "about": "Empire Dragon"
        },
        {
          "text": "於全球逾180個社群平臺、以逾20種語言進行影響力操作",
          "source_id": "src-nsb-2026",
          "about": "Dragonbridge 對台認知作戰"
        },
        {
          "text": "龍橋（Dragonbridge）為公安部僱用的網路水軍",
          "source_id": "src-nsb-2026",
          "about": "Spamouflage"
        },
        {
          "text": "針對台灣議題散布不實訊息",
          "source_id": "src-nsb-2026",
          "about": "targets"
        },
        {
          "text": "Dragonbridge 跨逾180個平台的對台行動",
          "source_id": "src-nsb-2026",
          "about": "related-to"
        },
        {
          "text": "the content consisted of DRAGONBRIDGE’s usual compilation of stock images and news footage from online sources accompanied by robotic English-language voiceovers.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "this small subset of DRAGONBRIDGE operations garnered higher levels of engagement from seemingly authentic users compared to the limited-to-no authentic engagement typically received by campaign activity.",
          "source_id": "src-google-dragonbridge-2024",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "which documented a set of four Spamouflage accounts on X posing as supporters of Trump and the Make America Great Again (MAGA) movement.",
          "source_id": "src-graphika-americans",
          "about": "Spamouflage"
        },
        {
          "text": "they are not being artificially boosted by the rest of the Spamouflage network.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "which is increasingly common across the network (for more on this see this previous Dispatch on Spamouflage and the US 2024 elections).",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "this is one of the first documented efforts by Spamouflage to create a consistent multi-platform American persona.",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "the same account posted a video comparing Biden and the Democrats to Hitler and the Nazis and shared a meme (which does not appear to have been created by Spamouflage) about how America will be “Zio free.”",
          "source_id": "src-isd-magaflage",
          "about": "Spamouflage"
        },
        {
          "text": "there is at least some evidence to suggest that HaiEnergy failed to generate substantial engagement outside of the inauthentic amplification that we have identified—a limitation we also noted in our recent public reporting on DRAGONBRIDGE.",
          "source_id": "src-mandiant-haienergy-2022",
          "about": "DRAGONBRIDGE"
        },
        {
          "text": "we were able to tie this activity together to confirm it was part of one operation known in the security community as Spamouflage and link it to individuals associated with Chinese law enforcement.",
          "source_id": "src-meta-2023",
          "about": "Spamouflage"
        },
        {
          "text": "who Spamouflage accounts accused of sexually harassing female colleagues and having affairs.",
          "source_id": "src-aspi-2024",
          "about": "Spamouflage"
        }
      ]
    },
    {
      "id": "anti-dpp-impersonation",
      "name_zh": "假冒台灣人反民進黨帳號網絡",
      "name_en": "Anti-DPP Impersonation Network",
      "aliases": [
        "「我是台灣人我反綠」帳號群",
        "Inauthentic Accounts Impersonating Taiwanese (DTL)",
        "我是台灣人我反綠",
        "Inauthentic Accounts Impersonating Taiwanese",
        "Anti-DPP Taiwanese-Impersonation Network"
      ],
      "category": "cib-network",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "Doublethink Lab記錄的Threads假冒台灣人、攻擊民進黨帳號網絡。",
      "description_zh": "Doublethink Lab於2025年7月記錄了一組在Threads平台上假冒台灣人的造假帳號網絡，共51個帳號，多數盜用台灣（部分泰、馬）網紅照片偽裝身分，反覆張貼「我是台灣人我反綠」等攻擊民進黨的內容。基於簡體字使用、帳號回復用香港電話號碼及「影響力外包」模式等鑑識線索，DTL評估這些帳號很可能與中國有關。",
      "indicators": [
        "51個Threads假帳號 (DTL)",
        "44/51帳號盜用網紅照片 (DTL)",
        "275則「我是台灣人我反綠」相同貼文 (DTL)",
        "23個帳號71則貼文含簡體字、1帳號回復連結香港電話號碼 (DTL)",
        "51 個假冒台灣人帳號（平台：Threads）",
        "7,032 則貼文（2024/06/05–2025/04/30）",
        "23 個帳號出現簡體字；一帳號連結香港電話號碼",
        "1,122 則貼文導流色情/約會網站"
      ],
      "active_since": "2024-06 至 2025-04",
      "related": [
        {
          "target_id": "spamouflage",
          "relation": "affiliated-with",
          "note": "DTL 指其『influence-for-hire』模式與美國大選中所見網絡相似；歸因措辭為『can likely be linked to the PRC』"
        }
      ],
      "event_ids": [
        "election-op-2024",
        "anti-dpp-threads-2025"
      ],
      "source_ids": [
        "src-dtl-impersonation"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "51 inauthentic accounts impersonating Taiwanese posted content attacking the DPP",
          "source_id": "src-dtl-impersonation",
          "about": "假冒台灣人反民進黨 Threads 行動"
        },
        {
          "text": "DTL assesses the network can likely be linked to the PRC",
          "source_id": "src-dtl-impersonation",
          "about": "假冒台灣人反民進黨帳號網絡"
        },
        {
          "text": "275 near-identical posts of the 我是台灣人我反綠 type",
          "source_id": "src-dtl-impersonation",
          "about": "我是台灣人我反綠"
        },
        {
          "text": "44 of 51 accounts reused photos of Taiwanese influencers",
          "source_id": "src-dtl-impersonation",
          "about": "Threads 假冒帳號群"
        },
        {
          "text": "posts pushed the 我是台灣人我反綠 narrative",
          "source_id": "src-dtl-impersonation",
          "about": "uses"
        },
        {
          "text": "operated via 51 inauthentic Threads accounts",
          "source_id": "src-dtl-impersonation",
          "about": "uses"
        },
        {
          "text": "attacking the Democratic Progressive Party (DPP)",
          "source_id": "src-dtl-impersonation",
          "about": "targets"
        },
        {
          "text": "the operation was run by the network of 51 accounts",
          "source_id": "src-dtl-impersonation",
          "about": "related-to"
        }
      ]
    },
    {
      "id": "magaflage",
      "name_zh": "Spamouflage 冒充美國人子網絡",
      "name_en": "Spamouflage US-persona sub-network (\"MAGAflage\")",
      "aliases": [
        "MAGAflage (媒體俗稱)",
        "The #Americans (Graphika)",
        "The #Americans",
        "MAGAflage",
        "Spamouflage US-persona cluster",
        "The #Americans / MAGAflage"
      ],
      "category": "cib-network",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "Spamouflage網路中冒充美國公民／川普支持者的子群，顯示其鎖定範圍擴及美國本土。",
      "description_zh": "Graphika於2024年9月的《The #Americans》報告記錄了Spamouflage網路冒充美國人的子群：在X上有15個、TikTok上有1個帳號自稱美國公民或美國議題倡議者。此前ISD於2024年4月已揭露其中冒充川普與MAGA支持者的四個帳號（媒體俗稱「MAGAflage」，此名非Graphika報告用語）。此子群顯示同一親中網路的鎖定範圍已擴及美國本土受眾。",
      "indicators": [
        "X上15個、TikTok上1個冒充美國人帳號 (Graphika)",
        "ISD 先前揭露4個冒充川普/MAGA支持者帳號",
        "Graphika：X 上 15 個 + TikTok 上 1 個假冒美國人 Spamouflage 帳號",
        "ISD：最初記錄 4 個冒充川普/MAGA 支持者的 X 帳號",
        "冒充美國焦點媒體的跨平台人物"
      ],
      "active_since": "2024 (圍繞美國大選)",
      "related": [
        {
          "target_id": "spamouflage",
          "relation": "subsidiary-of",
          "note": "屬 Spamouflage/DRAGONBRIDGE 同一網路之子群"
        }
      ],
      "event_ids": [
        "spamouflage-takedown-2023"
      ],
      "source_ids": [
        "src-graphika-americans",
        "src-isd-magaflage"
      ],
      "confidence": "medium"
    },
    {
      "id": "yuyuantantian",
      "name_zh": "玉淵譚天",
      "name_en": "Yuyuantantian",
      "aliases": [
        "玉渊谭天",
        "Yuyuan Tantian",
        "朝陽少俠",
        "補壹刀",
        "Chaoyang Shaoxia",
        "Buyidao",
        "Yuyuantantian / Chaoyang Shaoxia / Buyidao",
        "玉淵潭天"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "中央電視台／中央廣播電視總台(CMG)旗下的官媒「自媒體」品牌帳號。",
      "description_zh": "玉淵譚天是中國中央電視台（隸屬中央廣播電視總台／CMG）於2019年4月在中美貿易戰背景下成立的「自媒體」品牌帳號，由官方證實為總台所打造。其以半官方口吻發布涉外與兩岸議題評論，包括為解放軍對台軍演（如聯合利劍）與「劍指台獨」的論述背書。中央社報導指出，這類官媒「小號」的功能之一，是在訊息被證明不準確時讓官方「及時擺脫關聯」。屬公開的國家媒體外宣管道，而非隱蔽協同帳號網絡。",
      "indicators": [
        "官方證實為中央廣播電視總台打造的自媒體品牌 (CNA 2019)"
      ],
      "active_since": "2019–至今",
      "related": [
        {
          "target_id": "global-times",
          "relation": "affiliated-with",
          "note": "NSB 2024：朝陽少俠、補壹刀為《環球時報》設立之分身帳號"
        }
      ],
      "event_ids": [
        "joint-sword-2024",
        "satellite-retrocession-2025",
        "japan-narrative-2025"
      ],
      "source_ids": [
        "src-cna-yuyuan",
        "src-wiki-yuyuan",
        "src-nsb-2025",
        "src-factlink-satellite",
        "src-factlink-japan"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "玉淵潭天為央視融媒體品牌，在網絡圖中與央視沒有指向關係，顯示兩個品牌之間分工明確，刻意不轉傳，各自扮演不同角色；《觀察者網》除了作為發布者外，也擴散轉發來自玉淵潭天這類被視為與中國官媒關係緊密的大V的內容。",
          "source_id": "src-factlink-a7a795",
          "about": "玉淵潭天"
        },
        {
          "text": "14如「玉淵譚天」等帳號，早在2019年時已自行證實是中央廣播電視台的自媒體品牌。",
          "source_id": "src-factlink-japan",
          "about": "玉淵譚天"
        },
        {
          "text": "在這次中國針對高市早苗發言的攻擊中，玉淵譚天再度扮演提供另類詮釋的角色，帶動愛國情緒。",
          "source_id": "src-factlink-japan",
          "about": "玉淵譚天"
        },
        {
          "text": "但央視則由自媒體品牌「玉淵譚天」在微博發表，製作影片，以更辛辣的詞彙宣傳，號稱中方穿著的五四青年服，正與百年前五四青年抗議日本，要求「還我青島」時的穿著相同。",
          "source_id": "src-factlink-japan",
          "about": "玉淵譚天"
        },
        {
          "text": "有些帳號已經公開其官媒身分，例如央視的「玉淵譚天」。",
          "source_id": "src-factlink-japan",
          "about": "玉淵譚天"
        },
        {
          "text": "關於裴洛西訪台，中共官媒發起並參與多項論述傳播，央視更公開報導宣揚其旗下品牌「玉渊谭天」「協同」中央廣電總台「影響中國國內海外輿論」 DA.28；關於麥卡錫訪台的 10 項論述則多出自台灣，中共官媒多引用台灣新聞媒體社論、特定名嘴（如郭正亮、蔡正元、介文汲）、政治人物（如楊永明）及其他可信度不一的評論，擴大傳播。",
          "source_id": "src-iorg-38",
          "about": "玉渊谭天"
        }
      ]
    },
    {
      "id": "voice-of-strait",
      "name_zh": "海峽之聲",
      "name_en": "Voice of the Strait",
      "aliases": [
        "海峽之聲廣播電台",
        "Voice of the Taiwan Strait",
        "前身：解放軍福建前線廣播電台",
        "海峡之声"
      ],
      "category": "state-media",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "解放軍設立、長期對台廣播、嵌於對台心理／政治作戰體系的電台。",
      "description_zh": "海峽之聲廣播電台創建於1958年八二三砲戰期間，前身為「解放軍福建前線廣播電台」，是解放軍設立、長期對台灣廣播的電台。中文資料指其隸屬中央軍委政治工作部；英文研究（如Global Taiwan Institute）則將其運作單位連結至專責對台「輿論戰、心理戰、法律戰」的解放軍311基地（61716部隊）及其商業外殼華藝廣播公司。屬解放軍對台心理與政治作戰體系下的公開廣播宣傳管道。（各來源對其確切隸屬單位有出入。）",
      "indicators": [
        "1958-08-24 起對金門廣播",
        "以普通話、閩南話、客家話、英語對台播音"
      ],
      "active_since": "1958–至今",
      "related": [
        {
          "target_id": "pla-pwd",
          "relation": "operated-by",
          "note": "被連結至政工部/311基地心戰體系"
        }
      ],
      "event_ids": [
        "democracy-failure-report-118",
        "satellite-retrocession-2025"
      ],
      "source_ids": [
        "src-gti-base311",
        "src-wiki-vos",
        "src-factlink-satellite"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "FactLink觀察到，此事件有兩波訊息傳播高峰，第一波是10月26日至10月29日，中國官方相關媒體如《觀察者網》、《環球網》、《環球時報》、《人民日報》、《央視軍事》、《海峽之聲》、《看台海》報導與其微博官方帳號，引用長光衛星公司衛星影像，「慶祝台灣回歸為中國一部分」的光復節。",
          "source_id": "src-factlink-satellite",
          "about": "《海峽之聲》"
        },
        {
          "text": "出現傳播熱度高峰的事件多與台灣內部時事有關，唯一例外的是 2024 年 12 月 31 日 🇨🇳 中共中央军委「海峡之声」發布評論文章回顧台灣「民主退步的 2024」。",
          "source_id": "src-iorg-118",
          "about": "海峡之声"
        },
        {
          "text": "自賴清德當選後，中共宣傳持續以台灣國內政治事件製造台灣民主失敗的「證據」（「赖清德希特勒化」「民进党法西斯化」「民进党独裁」「绿色恐怖」），持續放大「戒嚴論」論述，使中共「越来越多证据」的說法得以自圓其說（海峡之声），甚至主動發表年度總結評論台灣民主退步，突顯中共宣傳策略為優先形塑「民進黨破壞台灣民主」印象。",
          "source_id": "src-iorg-118",
          "about": "海峡之声"
        },
        {
          "text": "當日，🇨🇳 中共中央军委「海峡之声」發布作者為「大力」的評論文章回顧台灣「民主退步的 2024」。",
          "source_id": "src-iorg-118",
          "about": "海峡之声"
        },
        {
          "text": "🇨🇳 2024 年 5 月 27 日 🇨🇳 中共中央军委「海峡之声」發表文章認為賴清德在就職演說中多次提及民主，是民進黨為迷惑民眾的包裝，且以此「乞求外部势力为其谋独挑衅撑腰打气」。",
          "source_id": "src-iorg-118",
          "about": "海峡之声"
        },
        {
          "text": "🇨🇳 2024 年 5 月 31 日 🇨🇳 中共中央军委「海峡之声」發表評論稱民進黨執政多年「民主这块包装纸不仅用来包裹一党一己私利，也成为谋“独”分裂的装饰工具」，針對賴清德就職演說強調民主價值，則認為目的是「乞求外部势力为其谋独挑衅撑腰打气，充当外部势力遏制中国发展的马前卒」。",
          "source_id": "src-iorg-118",
          "about": "海峡之声"
        },
        {
          "text": "🇨🇳 2024 年 10 月 12 日 🇨🇳 中共中央军委「海峡之声」發表評論稱賴清德「编造台独谬论的手法」之一就「披上民主的外衣进行伪装」。",
          "source_id": "src-iorg-118",
          "about": "海峡之声"
        },
        {
          "text": "🇨🇳 2025 年 2 月 25 日 🇨🇳 中共中央军委「海峡之声」批評賴清德於國安會議後談話中稱要和「友盟國家合力打造全球民主供應鏈」的觀點，是因為明知無法達成川普希望台灣提高國防預算的標準，想以「民主同盟」價值討好美國，「让美国充当保护伞」。",
          "source_id": "src-iorg-118",
          "about": "海峡之声"
        },
        {
          "text": "🇨🇳 2024 年 10 月 12 日 🇨🇳 中共中央军委 「海峡之声」評論賴清德雙十演講的文章中，稱賴清德高調宣揚民主，但上台以來「只要多数尊重少数，不要少数服从多数」。",
          "source_id": "src-iorg-118",
          "about": "海峡之声"
        },
        {
          "text": "🇨🇳 2024 年 12 月 27 日 🇨🇳 中共中央军委 「海峡之声」發表作者為「言未央」的評論文章「“青鸟”扑来 民进党上演“更大的民主”闹剧！」",
          "source_id": "src-iorg-118",
          "about": "海峡之声"
        },
        {
          "text": "🇨🇳 2024 年 12 月 31 日 🇨🇳 中共中央军委「海峡之声」作者為「大力」的文章，總結台灣 2024 年的政治發展，以「民主退步的2024：“斗鸡”搭草台，“台独”变独裁！」",
          "source_id": "src-iorg-118",
          "about": "海峡之声"
        },
        {
          "text": "🇨🇳 2024 年 12 月 31 日 🇨🇳 中共中央军委「海峡之声」評論稱賴清德對於如何找回失去的年輕選票「采取了更为简单粗暴的方式，即利用司法工具打残柯文哲」。",
          "source_id": "src-iorg-118",
          "about": "海峡之声"
        },
        {
          "text": "🇨🇳 2024 年 9 月 18 日 🇨🇳 中共中央军委「海峡之声」發布評論文章，內文針對台灣「轉型正義」工作評論，稱賴清德「以“民主自由”为幌子，推进“转型正义”，大搞“去中国化”和“软性台独”」，將「闽南语方言更名为“台湾台语”，相继抛出“中华民族论述是一个陷阱”“炎黄子孙只是中国古代传说”“两岸关系的实质是两国”等离谱言论」，其意在「洗涤人心」。",
          "source_id": "src-iorg-118",
          "about": "海峡之声"
        },
        {
          "text": "🇨🇳 2024 年 12 月 27 日 🇨🇳 中共中央军委「海峡之声」發表評論，針對韓國總統尹錫悅宣布戒嚴事件，文章認為「民进党第一时间公开表示支持」「充分暴露出民进党一干人企图通过暴力手段解决问题的险恶用心」，且稱民進黨「大搞“绿色恐怖”，制造“寒蝉效应”，其实就是“戒严”的变种」。",
          "source_id": "src-iorg-118",
          "about": "海峡之声"
        },
        {
          "text": "🇨🇳 2024 年 9 月 9 日 🇨🇳 中共中央军委「海峡之声」發表標題為「抗中变为美尽忠，民主成赖清德做主」的評論文章，內文稱賴清德上台以來「对除了自己以外的其他派系、其他政党全力围攻、意图剿灭，让民主变成“赖清德做主”」。",
          "source_id": "src-iorg-118",
          "about": "海峡之声"
        },
        {
          "text": "🇨🇳 2024 年 12 月 27 日 🇨🇳 中共中央军委「海峡之声」藉台灣立法院修訂選罷法、憲訴法、財劃法三大法案的爭議，認為賴清德煽動反修法的群眾（青鳥）對抗政敵。",
          "source_id": "src-iorg-118",
          "about": "海峡之声"
        },
        {
          "text": "🇨🇳 2024 年 9 月 18 日 🇨🇳 中共中央军委「海峡之声」發表評論，內文針對台灣政府增加「媒體政策及業務宣導經費」，認為這表明「赖当局将进一步推动实施“台独”文化工程、培养绿色网军大肆洗脑，建构信息茧房，确保其政治、选举利益和“抗中保台”策略的实现」。",
          "source_id": "src-iorg-118",
          "about": "海峡之声"
        },
        {
          "text": "🇹🇼-🇨🇳 2024 年 6 月 12 日 🇨🇳 中共中央军委「海峡之声」發表作者為「大力」的評論，標題「越来越多证据表明，赖清德正在向希特勒靠拢！」",
          "source_id": "src-iorg-118",
          "about": "海峡之声"
        },
        {
          "text": "🇹🇼-🇨🇳 2025 年 6 月 11-12 日間「中国台湾网」、「海峡飞虹」、「海峡之声」先後引述 6 月 11 日「黨外在野大聯盟」成立大會上召集人 國民黨 鄭麗文的發言：「当下岛内的执政党逐渐走向法西斯化、沙文主义化，大家忧心不已，因此希望联结、团结所有“在野”力量」。",
          "source_id": "src-iorg-118",
          "about": "海峡之声"
        },
        {
          "text": "🇨🇳 4 月 10 日 07:12 至 4 月 11 日 08:11 間，中共官媒「大公文匯網」「大公文匯網」「僑報網」「海峽之聲」「鳳凰網」「鳳凰網」「鳳凰網」發布報導，持續傳播此動畫影片。",
          "source_id": "src-iorg-41",
          "about": "海峽之聲"
        },
        {
          "text": "當日 09:47 至 14:44，中共官媒「海峽之聲」「中國台灣網」「央視網」持續發布報導傳播該影片。",
          "source_id": "src-iorg-41",
          "about": "海峽之聲"
        },
        {
          "text": "8 日，中共官媒「台海網」（8:59）及「海峽之聲」（9:12）協力傳播 2 則社論內容，宣稱「不少岛内媒体和民众已经看清了麦卡锡访台的真相，喊话麦卡锡不要来台湾。」",
          "source_id": "src-iorg-38",
          "about": "海峽之聲"
        },
        {
          "text": "隔日，中共官媒「中國台灣網」「鳳凰網」「台海網」「海峽飛虹」及「海峽之聲」以「根据岛内公布的一份最新民调」協力傳播相同內容，以網路投票結果代表台灣民眾全體意見。",
          "source_id": "src-iorg-38",
          "about": "海峽之聲"
        }
      ]
    },
    {
      "id": "global-times",
      "name_zh": "環球時報",
      "name_en": "Global Times",
      "aliases": [
        "环球时报",
        "globaltimes.cn",
        "環球網/Huanqiu",
        "環球網",
        "Huanqiu",
        "环球网"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "人民日報旗下民族主義小報，持續放大親中、反美、反台獨敘事。",
      "description_zh": "環球時報創刊於1993年，為中共中央機關報《人民日報》旗下的小報，以民族主義、鷹派立場評論國際與兩岸議題，因善於煽動而被稱為「中國的福斯新聞」。在涉台議題上，它持續放大「美國是台海和平最大破壞者」「裴洛西訪台是挑釁」等敘事，2022年裴洛西訪台期間發表多篇社評抨擊美方與台獨。評論者指出，其激烈言論放大官方民族主義情緒，但未必等同中國政府的正式政策。屬公開的黨／國家媒體民族主義敘事放大管道。",
      "indicators": [
        "2022-08 裴洛西訪台期間多篇社評稱「美國是台海和平最大破壞者」"
      ],
      "active_since": "1993–至今",
      "related": [],
      "event_ids": [
        "pelosi-2022",
        "us-skepticism-report-2023",
        "satellite-retrocession-2025",
        "japan-narrative-2025"
      ],
      "source_ids": [
        "src-wiki-globaltimes",
        "src-lowy-globaltimes",
        "src-globaltimes-pelosi",
        "src-factlink-japan"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "內容被其他帳號使用次數較高的行動者：一是東部戰區，二是中國官媒如央視新聞、環球時報、環球網、央廣軍事，三是與官方有關的帳號 (State-Linked)，如新浪軍事、觀察者網。",
          "source_id": "src-factlink-a7a795",
          "about": "環球時報"
        },
        {
          "text": "透過網絡分析可大致看出宣傳管道順序，第一層由東部戰區發動，並由第二層央視新聞、環球時報、央廣軍事等官媒宣傳，再由第三或第四層的地方公安、地方融媒體、媒體新媒體品牌、高影響力帳號接續放大官方敘事。",
          "source_id": "src-factlink-a7a795",
          "about": "環球時報"
        },
        {
          "text": "檢視392組文本資料所顯示的指向網絡時可發現，東部戰區發布的貼文，有13個媒體和大V共同轉分享，包括央視新聞、央廣軍事、鎮江民生頻道、央廣軍事、環球時報、浙江日報、澎湃新聞、宣漢融媒、新浪軍事、動静新聞、南湖發布、看看新聞Knews和星話大白等。",
          "source_id": "src-factlink-a7a795",
          "about": "環球時報"
        },
        {
          "text": "央視新聞發布的13則報導文本，有26個帳號轉發，官方單位有屏山公安、銅陵經開公安在線、山東高法、沐川公安、青春龍泉驛和平安金陽；媒體有動靜新聞、新浪軍事、南寧晚報、錢江晚報、南方週末、頭條新聞、第一現場、馬上資訊、看台海、福建日報、環球時報和新京報；大V有星話大白、包容萬物恆河水、台灣那點事兒、扎西德勒·天珠收藏、椒哥微記錄、航天面面觀、長春-小風、白鶴-老鄧。",
          "source_id": "src-factlink-a7a795",
          "about": "環球時報"
        },
        {
          "text": "除了東部戰區發言人的官宣之外，央視、環球時報、新華社等特定官媒採訪中共特定軍事專家來點評演習，是演習畫面尚未製播之前的關鍵宣傳素材。",
          "source_id": "src-factlink-a7a795",
          "about": "環球時報"
        },
        {
          "text": "環球時報，另引述中共外交部，並從國際關係角度提供評論、新聞和圖卡。",
          "source_id": "src-factlink-a7a795",
          "about": "環球時報"
        },
        {
          "text": "A final category of political content disseminated by PAPERWALL often takes the form of verbatim reposts of content from Chinese state media, such as CGTN or the Global Times.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Global Times"
        },
        {
          "text": "10, the Global Times reported on “A bloody kidnapping that shocked Taiwan,” criticizing Tsai for ‘ignoring’ a major violent crime case in Taoyuan.",
          "source_id": "src-dtl-2022election",
          "about": "Global Times"
        },
        {
          "text": "Global Times, local PRC state media Southeast Media, and the Taiwan Affairs Office of the State Council quoted the reports, saying that “the two sides of the Strait have the same root and their origin cannot be separated.”",
          "source_id": "src-dtl-2022election",
          "about": "Global Times"
        },
        {
          "text": "In 2025, during the regular press briefing of the foreign ministry spokesperson of the PRC, Lin Jian, Global Times posed a question on Pakistan and mining.",
          "source_id": "src-doublethink-lab-96d2c0",
          "about": "Global Times"
        },
        {
          "text": "Notably, #YESWPS documented a post from Global Times even before the incident happened.",
          "source_id": "src-doublethink-lab-aaba8c",
          "about": "Global Times"
        },
        {
          "text": "The first post appeared on Global Times at UTC+00:00 24:39 on September 15 and 1:15 on September 16, 2025, despite the event occurring at 2:00 a.m.",
          "source_id": "src-doublethink-lab-aaba8c",
          "about": "Global Times"
        },
        {
          "text": "State-controlled media Global Times has, in several articles, highlighted how retired generals accused the Philippine government of being a U.S.",
          "source_id": "src-doublethink-lab-aaba8c",
          "about": "Global Times"
        },
        {
          "text": "FactLink觀察到，此事件有兩波訊息傳播高峰，第一波是10月26日至10月29日，中國官方相關媒體如《觀察者網》、《環球網》、《環球時報》、《人民日報》、《央視軍事》、《海峽之聲》、《看台海》報導與其微博官方帳號，引用長光衛星公司衛星影像，「慶祝台灣回歸為中國一部分」的光復節。",
          "source_id": "src-factlink-satellite",
          "about": "《環球網》"
        },
        {
          "text": "檢視「島內輿論」這波主題，中國官方媒體家數雖多，但內容來源單一，不同媒體之間交互引用，內容主要來自新華社旗下的微博帳號《參考消息》報導〈島內網友熱議衛星視角下瞰中國台灣省〉，此報導除了引述台灣媒體，更取材特定媒體報導的網友留言，製造「島內輿論」高度熱議、高度讚嘆中國科技進步的風向，獲得《央廣軍事》和《環球時報》等媒體轉分享。",
          "source_id": "src-factlink-satellite",
          "about": "《環球時報》"
        },
        {
          "text": "“表示有能力精准打击目标，释放出这些信息，是在警告‘台独’势力。” —-《環球時報》引述《參考消息》。",
          "source_id": "src-factlink-satellite",
          "about": "《環球時報》"
        },
        {
          "text": "至於2025年11月1日至12月6日期間，微博上對於高市早苗個人或其發言的討論，以官媒發文最多，包括北京晚報、中國新聞網與環球時報。",
          "source_id": "src-factlink-japan",
          "about": "環球時報"
        },
        {
          "text": "在中國外交部定調之前，微博網民對於中國駐日外交官的極端發言，並未有大量關注討論，雖有時政大V如前環球時報總編輯胡錫進或小粉紅立場鮮明的「小凡好攝」在當日快速轉述高市早苗發言並出言批評，但中國官媒卻相對沉默。",
          "source_id": "src-factlink-japan",
          "about": "環球時報"
        },
        {
          "text": "在2025年11月至12月初攻擊高市早苗與其言行的貼文中，官媒帳號如北京晚報、環球時報、中國新聞網、央視網，以及作為中國官方喉舌的民營媒體觀察者網及時政評論大V，以「日本軍國主義意圖對外擴張」為宣傳主旋律。",
          "source_id": "src-factlink-japan",
          "about": "環球時報"
        },
        {
          "text": "比如前環球時報的總編輯胡錫進在11月1日高市與林信義在APEC場合見面時，25便從高市早苗的性別做文章，將她與日本形容為美國的「東亞妾室」，與台灣「私通」，比擬日本與台灣及美國之間的關係。",
          "source_id": "src-factlink-japan",
          "about": "環球時報"
        },
        {
          "text": "🇹🇼-🇨🇳 2024 年 5 月 23 日 🇨🇳 人民日报「环球网」針對立法院「國會改革」修法爭議發表文章，內文引用 國民黨 葉元之、 國民黨 趙少康、聯合 聯合新聞網說法，認為立院外抗議的民眾是受到民進黨煽動或組織，評論賴政府「意图操控民众」。",
          "source_id": "src-iorg-118",
          "about": "环球网"
        },
        {
          "text": "🇨🇳 2024 年 5 月 25 日 🇨🇳 人民日报「环球网」再發表評論，稱立法院內肢體衝突事件的根源是因賴政府不能接受在國會不佔多數，因此訴諸暴力「输了人头就出拳头」。",
          "source_id": "src-iorg-118",
          "about": "环球网"
        },
        {
          "text": "🇨🇳 2025 年 3 月 15 日 🇨🇳 人民日报「环球网」發表作者為「北平锋」的評論文章，內文宣稱民進黨借國安之名打壓反對派，並「把司法工具化，滥用所谓反渗透法擅权专用、罗织罪名」。",
          "source_id": "src-iorg-118",
          "about": "环球网"
        },
        {
          "text": "🇹🇼-🇨🇳 2025 年 6 月 25 日 🇨🇳 人民日报「环球网」報導台灣移除蔣介石銅像，引用 國民黨 羅智強稱「赖清德的权力越大，就越往独裁迈进」；區桂之稱「民进党推动拆除所谓“威权”象征物，实则是企图建立自身的“威权”」；蔡正元稱民進黨為「打着“消除威权象征”的幌子，实则是为了打击反对力量」。",
          "source_id": "src-iorg-118",
          "about": "环球网"
        },
        {
          "text": "🇨🇳 2025 年 3 月 16 日 🇨🇳 人民日报「环球网」再發布「北平锋」的評論「赖清德绿色恐怖暴政让台湾回到戒严白色恐怖时期」，稱民進黨以反滲透之名「行思想禁锢人身控制之实，将台湾社会推向绿色恐怖深渊」。",
          "source_id": "src-iorg-118",
          "about": "环球网"
        },
        {
          "text": "🇨🇳 2024 年 6 月 14 日 🇨🇳 人民日报「环球网」發表作者為「程东」的評論文章，針對台灣網紅鍾明軒赴中，稱這是「“信息茧房”被现实击碎」。",
          "source_id": "src-iorg-118",
          "about": "环球网"
        },
        {
          "text": "🇨🇳 2025 年 6 月 5 日 🇨🇳 人民日报「环球网」再度發表作者為「程东」的文章，針對網紅館長陳之漢赴中，開頭引用未知來源的「岛内舆论」稱綠營批評館長代表「绿营其实是害怕了，担忧他们构筑的认知围墙被陈之汉突破」。",
          "source_id": "src-iorg-118",
          "about": "环球网"
        },
        {
          "text": "🇹🇼-🇨🇳 2025 年 6 月 30 日 🇨🇳 人民日报「环球网」發表評論「赖清德“法理”外衣难掩“台独”祸心」，開頭即批評賴團結十講「直接目的是为推动“大罢免”政治斗争谋取政治私利进行文宣造势，不惜将台湾推向分裂对抗的深渊」。",
          "source_id": "src-iorg-118",
          "about": "环球网"
        },
        {
          "text": "🇨🇳 2025 年 4 月 28 日 🇨🇳 人民日报「环球时报」抖音發布影片，標題「绿恐又出新花样，民进党拿台民众户籍开刀」，內容稱陸委會指出台灣民眾持有中國身分證與定居證將喪失戶籍的政策是「绿色恐怖」，將「严重损害台湾的民主自由和社会和谐」。",
          "source_id": "src-iorg-118",
          "about": "环球时报"
        },
        {
          "text": "🇨🇳 2025 年 3 月 27 日 🇨🇳 人民日报「环球时报」抖音發布影片評論中配遭台灣政府驅逐事件，內容引用「厦门大学台湾研究院副院长」张文生觀點，稱「岛内台独势力已然在纳粹化的政治道路上一去不复返，打压陆配很可能仅仅是一个开始」。",
          "source_id": "src-iorg-118",
          "about": "环球时报"
        },
        {
          "text": "🇨🇳 2025 年 3 月 28 日 🇨🇳 人民日报「环球时报」發表作者為「中国社会科学院台湾研究所副研究员」陈桂清的評論文章，內文列舉民進黨政治人物（如劉世芳、黃捷、沈伯洋等）、台派人士（如曹興誠、網紅「八炯」）等「配合」「赖当局」「大搞“台独”一言堂，大搞“绿色独裁”“绿色恐怖”」「阻挠两岸交流、打压政治异己、迫害台湾同胞」，認為他們「充当“台独”政权的“纳粹冲锋队员”」。",
          "source_id": "src-iorg-118",
          "about": "环球时报"
        },
        {
          "text": "例如，聯合新聞網刊出社論「阿富汗震撼」後，中共官媒環球網微博帳號、通說 2.0 引用其內容；而中共官媒環球網刊出社評「为什么说美国一定会最终抛弃台湾」，聯合新聞網即在隔日改寫，刊出「環球時報列六大理由，指美國終將拋棄台灣」報導。",
          "source_id": "src-iorg-11",
          "about": "環球網"
        },
        {
          "text": "環球網：美国从阿富汗撤军后，很可能跑到西太平洋地区再继续制造新的危机和混乱。",
          "source_id": "src-iorg-11",
          "about": "環球網"
        },
        {
          "text": "環球網總編胡锡进：拜登是「老糊塗」，會讓台灣變成東亞火藥桶。",
          "source_id": "src-iorg-11",
          "about": "環球網"
        },
        {
          "text": "8 月 18 日，中共官媒環球網發表社評「为什么说美国一定会最终抛弃台湾」。",
          "source_id": "src-iorg-11",
          "about": "環球網"
        },
        {
          "text": "8 月 16 日，中共官媒環球網微博帳號貼文，提到「岛内不少网友表示同意：“今日阿富汗，明日台湾。”」",
          "source_id": "src-iorg-11",
          "about": "環球網"
        },
        {
          "text": "在美國國安顧問蘇利文強調對台承諾堅實後，中共官媒環球網藉由台灣網友言論反擊美國「不管他承諾什麼，我們台灣一定是焦土」，並以「美國在阿富汗是賠錢，在台灣是賺錢」說法與美國對台軍售案連結，製造美國藉由賣軍火發戰爭財的形象。",
          "source_id": "src-iorg-11",
          "about": "環球網"
        },
        {
          "text": "有 5 個粉專分享中共官媒環球網評論的內容，包含多次在心慌週報中出現的 qiqi 內容農場相關粉專。",
          "source_id": "src-iorg-11",
          "about": "環球網"
        },
        {
          "text": "15 日，中共官媒環球網：「美国从阿富汗撤军后，很可能跑到西太平洋地区再继续制造新的危机和混乱。」",
          "source_id": "src-iorg-11",
          "about": "環球網"
        },
        {
          "text": "隔日，聯合新聞網將該社評改寫，刊出題為「環球時報列六大理由 指美國終將拋棄台灣」的報導。",
          "source_id": "src-iorg-11",
          "about": "環球時報"
        },
        {
          "text": "8 月 20 日，中共官媒環球時報總編輯胡锡进貼文，認為拜登將台灣類比為北約盟友的是「老糊塗」，會讓台灣變成「東亞火藥桶」。",
          "source_id": "src-iorg-11",
          "about": "環球時報"
        },
        {
          "text": "當日 10:19 至 14:06 間，中共官媒「環球網」「台海網」「鳳凰網」「澎湃新聞」「央視網」及官媒微博帳號「环球时报」「海外网」「环球网」「小央视频」「香港中通社」「中国新闻网」「厦门广电」「海峡导报」「中国新闻社」多使用相同「天氣晴朗」圖片，協力傳播中時報導內容。",
          "source_id": "src-iorg-41",
          "about": "环球时报"
        },
        {
          "text": "當日 14:56 至隔日 9:18 之間，中共官媒「澎湃新聞」「環球網」「台海網」「香港新聞網」協力傳播此則中時新聞網的報導內容。",
          "source_id": "src-iorg-41",
          "about": "環球網"
        },
        {
          "text": "🇹🇼-🇨🇳 4 月 12 日 08:55 至 10:19 間，中共官媒「鳳凰網」「環球網」「香港新聞網」「大公文匯網」協力傳播介文汲在「中天新聞」節目影片中的說法。",
          "source_id": "src-iorg-41",
          "about": "環球網"
        },
        {
          "text": "中共官媒 🇨🇳 人民日报「环球网」主筆室「北平锋」宣稱霍諾德徒手登頂台北 101 是「照见 “台独” 的穷途末路」，宣稱世界透過此次活動直播看見「“台独” 制造的危机、“绿色恐怖” 笼罩的阴霾」，全文言不及義，胡言亂語，充分展現其無論如何必須批評台灣政府、台灣民主的窘境與無奈。",
          "source_id": "src-iorg-131",
          "about": "环球网"
        },
        {
          "text": "1 月份共有 329 則文本提及劉世芳，主要內容為国台办在 1 月 7 日召開記者會宣布將劉世芳「列为 “台独” 顽固分子」（国台办）、宣稱原因是「解职驱逐多名陆配」（环球网），並強調其「两次上清单」（环球网）。",
          "source_id": "src-iorg-131",
          "about": "环球网"
        },
        {
          "text": "1 月份共有 329 則文本提及劉世芳，主要內容為国台办在 1 月 7 日召開記者會宣布將鄭英耀「列为 “台独” 顽固分子」（国台办）、宣稱原因是「制造校园 “绿色恐怖”」（环球网），並強調其「劣迹斑斑，反对两岸教育交流第一人」（中国新闻网）。",
          "source_id": "src-iorg-131",
          "about": "环球网"
        },
        {
          "text": "1 月 10 日，🇨🇳 人民日报「环球网」發布作者「北平锋」的文章「在反“独”促统的民族大义面前并肩而行」，內文包含「近日，台湾“高等法院”对“三中案”作出二审判决，台湾前民意代表蔡正元被判三年六个月，中国国民党前主席马英九无罪。",
          "source_id": "src-iorg-131",
          "about": "环球网"
        },
        {
          "text": "1 月 26 日，🇨🇳 人民日报「环球网」發布作者「北平锋」的文章「台北 101，照见“台独”的穷途末路」，內文包含「台北 101 大楼的玻璃幕墙外，美国极限攀岩者亚历克斯·霍诺德的身影向上移动，赖清德对此高调宣称，“让世界看到了台湾的活力与风貌”。",
          "source_id": "src-iorg-131",
          "about": "环球网"
        },
        {
          "text": "1 月 31 日，🇨🇳 人民日报「环球网」發布作者「北平锋」的文章「再聊聊“台北 101”背后的那把“假钥匙”」，內文包含「民进党当局却执意要将“台北 101”改名为 “台湾 101”，居心叵测篡改其文化内涵及其被寄托的民族情感。",
          "source_id": "src-iorg-131",
          "about": "环球网"
        },
        {
          "text": "As many foreign readers of the Global Times are already aware, it is a subsidiary of the People’s Daily, the principal propaganda publication of the Chinese Communist Party.",
          "source_id": "src-lowy-globaltimes",
          "about": "Global Times"
        },
        {
          "text": "While this implies a degree of official sanction, it is difficult to measure the extent to which Global Times represents the official position of the Chinese government.",
          "source_id": "src-lowy-globaltimes",
          "about": "Global Times"
        },
        {
          "text": "It does appear, however, that the Global Times has a special license to push positions and voice sentiments that other state media operations are reluctant to air openly.",
          "source_id": "src-lowy-globaltimes",
          "about": "Global Times"
        },
        {
          "text": "And it was noteworthy that when the Chinese president Xi Jinping visited the People’s Daily in February, he said his office subscribes to the Global Times.",
          "source_id": "src-lowy-globaltimes",
          "about": "Global Times"
        },
        {
          "text": "In 1997, it became the Global Times that started publishing daily in 2011.",
          "source_id": "src-lowy-globaltimes",
          "about": "Global Times"
        },
        {
          "text": "The Global Times specialises in provoking and agitating and its tone and use of language is in marked contrast to the rather stolid People's Daily.",
          "source_id": "src-lowy-globaltimes",
          "about": "Global Times"
        },
        {
          "text": "The Interpreter spoke to several senior Chinese editors and reporters about the influence of Global Times.",
          "source_id": "src-lowy-globaltimes",
          "about": "Global Times"
        },
        {
          "text": "The reporter says one of the KPIs for Global Times is how many times it gets cited in foreign press, so editors often use colourful and outrageous language to attract foreign media’s attention.",
          "source_id": "src-lowy-globaltimes",
          "about": "Global Times"
        },
        {
          "text": "In contrast, while Global Times is in line with more hawkish elements within the party, its boisterous editorials don’t necessarily represent Beijing’s official line.",
          "source_id": "src-lowy-globaltimes",
          "about": "Global Times"
        },
        {
          "text": "It is understood that the Chinese Foreign Ministry representatives made a similar point to their Korean counterparts in Seoul after the Global Times launched a series of tirade against South Koreans.",
          "source_id": "src-lowy-globaltimes",
          "about": "Global Times"
        },
        {
          "text": "A foreign editor from one the popular current affairs magazines said simply: 'Global Times is rubbish and its editors are a bunch of opportunists'.",
          "source_id": "src-lowy-globaltimes",
          "about": "Global Times"
        },
        {
          "text": "It is clear that Global Times’ editorials don’t carry the same weight as those of the People’s Daily or Xinhua.",
          "source_id": "src-lowy-globaltimes",
          "about": "Global Times"
        },
        {
          "text": "We should object to insulting editorials from the Global Times.",
          "source_id": "src-lowy-globaltimes",
          "about": "Global Times"
        }
      ]
    },
    {
      "id": "pla-csf",
      "name_zh": "中國人民解放軍網路空間部隊",
      "name_en": "PLA Cyberspace Force (CSF)",
      "aliases": [
        "網路空間部隊",
        "解放軍網路空間部隊",
        "CSF",
        "Cyberspace Force",
        "PLA Cyberspace Force (CSF)"
      ],
      "category": "state-organ",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "2024 年成立的解放軍獨立兵種，NSB 指其與網信辦、統戰部共同委託科技公司運營機器人帳號、以生成式 AI 傳散爭訊。",
      "description_zh": "解放軍網路空間部隊（CSF）為 2024 年解放軍改制後新設的獨立兵種，與政治工作部係分立單位。NSB 2025 報告指出，網路空間部隊與網信辦（CAC）、統戰部（UFWD）共同委託中科點擊、北京星光、一網互通等中國科技公司建立網民資料庫，並運用生成式 AI 技術透過自動化程式管理逾 1 萬組機器人帳號傳散爭訊，藉以影響目標受眾與操控輿論。",
      "indicators": [],
      "active_since": "2024",
      "related": [
        {
          "target_id": "zhongkedianji",
          "relation": "runs",
          "note": "NSB 2025：網路空間部隊與網信辦、統戰部委託中科點擊運營逾萬組機器人帳號"
        },
        {
          "target_id": "beijing-xingguang",
          "relation": "runs",
          "note": "NSB 2025：委託北京星光建立網民資料庫並運營機器人帳號"
        },
        {
          "target_id": "onesight",
          "relation": "runs",
          "note": "NSB 2025：委託一網互通以生成式 AI 運營逾萬組機器人帳號"
        }
      ],
      "event_ids": [
        "april-2025-exercise-ptt-hijack"
      ],
      "source_ids": [
        "src-nsb-2026"
      ],
      "confidence": "high"
    },
    {
      "id": "womin",
      "name_zh": "沃民高新科技",
      "name_en": "Womin High-Tech (Warming High-Tech)",
      "aliases": [
        "沃民高新",
        "Womin",
        "Warming High-Tech",
        "Womin High-Tech (Warming High-Tech)"
      ],
      "category": "tech-vendor",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "中國輿情／大數據廠商，NSB 指其於臺灣選舉期間受命彙整候選人言論、活動、民調與社群聲量以評估選情。",
      "description_zh": "NSB 2025 報告指出，在臺灣選舉期間，沃民高新（NSB 英文版譯名 Warming High-Tech）等中國企業受命彙整候選人言論、活動、民調數據與社群媒體聲量以評估選情，並蒐集臺灣網民之社群貼文、留言與按讚數，分析其對特定內政、兩岸與國際議題的看法，藉以掌握臺灣社會輿論動向。",
      "indicators": [],
      "active_since": "",
      "related": [
        {
          "target_id": "cac",
          "relation": "linked-to",
          "note": "NSB 2025 列為中共認知作戰協力之數據蒐集／輿情分析廠商"
        }
      ],
      "event_ids": [
        "election-op-2024"
      ],
      "source_ids": [
        "src-nsb-2026"
      ],
      "confidence": "medium"
    },
    {
      "id": "zhongkedianji",
      "name_zh": "中科點擊",
      "name_en": "Zhongkedianji",
      "aliases": [
        "Zhongkedianji"
      ],
      "category": "tech-vendor",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "中國科技公司（與中科天璣／GoLaxy 為不同實體），NSB 指其受網信辦、統戰部、網路空間部隊委託，以生成式 AI 運營逾萬組機器人帳號傳散爭訊。",
      "description_zh": "NSB 2025 報告（英文版作 Zhongkedianji）指出，網信辦、統戰部與解放軍網路空間部隊委託中科點擊、北京星光、一網互通等科技公司建立網民資料庫，並運用生成式 AI 技術透過自動化程式管理逾 1 萬組機器人帳號傳散爭訊。注意：中科點擊與同樣以「中科」起首的中科天璣（GoLaxy）為不同公司，前者列於機器人帳號運營脈絡、後者列於社情數據蒐集脈絡。",
      "indicators": [
        "受託運營機器人帳號數：逾 1 萬組（與北京星光、一網互通合計）（2025）"
      ],
      "active_since": "",
      "related": [
        {
          "target_id": "cac",
          "relation": "operated-by",
          "note": "NSB 2025：受網信辦、統戰部、網路空間部隊委託運營機器人帳號"
        }
      ],
      "event_ids": [],
      "source_ids": [
        "src-nsb-2026"
      ],
      "confidence": "medium"
    },
    {
      "id": "beijing-xingguang",
      "name_zh": "北京星光",
      "name_en": "Beijing Xingguang",
      "aliases": [
        "Beijing Xingguang"
      ],
      "category": "tech-vendor",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "中國科技公司，NSB 指其受網信辦、統戰部、網路空間部隊委託建立網民資料庫並以生成式 AI 運營機器人帳號。",
      "description_zh": "NSB 2025 報告指出，北京星光與中科點擊、一網互通同受網信辦（CAC）、統戰部（UFWD）、解放軍網路空間部隊（CSF）委託，建立網民資料庫並運用生成式 AI 技術透過自動化程式管理逾 1 萬組機器人帳號傳散爭訊、操控輿論。",
      "indicators": [],
      "active_since": "",
      "related": [
        {
          "target_id": "cac",
          "relation": "operated-by",
          "note": "NSB 2025：受網信辦、統戰部、網路空間部隊委託運營機器人帳號"
        }
      ],
      "event_ids": [],
      "source_ids": [
        "src-nsb-2026"
      ],
      "confidence": "medium"
    },
    {
      "id": "haimai",
      "name_zh": "海賣",
      "name_en": "Haimai",
      "aliases": [
        "Haimai",
        "深圳海賣雲享",
        "深圳海脉云翔传媒",
        "Shenzhen Haimaiyunxiang Media",
        "Times Newswire 營運商",
        "Shenzhen Haimai Yunxiang Media"
      ],
      "category": "pr-firm",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "中國公關公司，NSB 指其受中宣部與公安部利用架設冒充國際媒體的多語種假網站。",
      "description_zh": "NSB 2025 報告將海賣（Haimai）與海訊社、虎牙並列，指其受中宣部與公安部利用架設偽裝成中立國際媒體的假網站。NSB 2024 報告（src-nsb-2025）另點名公關公司「深圳海賣雲享」，受中共委託創建假捷克媒體《波希米亞日報》（Bohemia Daily）、假西班牙媒體《奎爾先鋒報》（Guell Herald），推播海外官媒《CGTN》報導、炒作「一中」為國際主流觀點並批評我政府升高臺海緊張。",
      "indicators": [
        "PAPERWALL：123 個偽在地新聞網站、約 30 國（首域名 2019/07 註冊）",
        "GLASSBRIDGE：Times Newswire 逾 100 個網站、30 多國",
        "偽媒體名如 Aisa Korea、Austria Weekly"
      ],
      "active_since": "2019",
      "related": [
        {
          "target_id": "mps",
          "relation": "operated-by",
          "note": "NSB 2025：受中宣部與公安部利用架設假外媒網站"
        },
        {
          "target_id": "mps",
          "relation": "linked-to",
          "note": "台灣 NSB：中央宣傳部與公安部利用海脈等行銷公司製作偽新聞網站"
        }
      ],
      "event_ids": [
        "glassbridge-takedown-2024",
        "paperwall-exposure-2024",
        "nsb-cognitive-2025"
      ],
      "source_ids": [
        "src-nsb-2026",
        "src-nsb-2025",
        "src-citizenlab-paperwall",
        "src-google-glassbridge"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "We attribute the PAPERWALL campaign to Shenzhen Haimaiyunxiang Media Co.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Haimai"
        },
        {
          "text": "The report attributed these sites to a Chinese PR firm called Haimai, based on the firm itself advertising the opportunity for its clients to publish press releases on these same sites.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Haimai"
        },
        {
          "text": "Shenzhen Haimaiyunxiang Media Co.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Haimai"
        },
        {
          "text": "We attribute PAPERWALL to a PR firm based in China, Shenzhen Haimaiyunxiang Media Co., Ltd., or “Haimai.”",
          "source_id": "src-citizenlab-paperwall",
          "about": "Haimai"
        },
        {
          "text": "Haimai was first exposed by the Korean NCSC in their investigation on 18 Korean-focused PAPERWALL websites as being responsible for operating them.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Haimai"
        },
        {
          "text": "However, we could identify digital infrastructure linkages between Haimai and PAPERWALL.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Haimai"
        },
        {
          "text": "This is therefore an incriminating finding, proving that both PAPERWALL domains had been set up by the same operators as the Haimai assets.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Haimai"
        },
        {
          "text": "Haimai, short for Shenzhen Haimaiyunxiang Media Co., Ltd.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Haimai"
        }
      ]
    },
    {
      "id": "huya-pr",
      "name_zh": "虎牙（行銷公司）",
      "name_en": "Huya (marketing firm)",
      "aliases": [
        "虎牙",
        "Huya",
        "Huya (marketing firm)"
      ],
      "category": "pr-firm",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "NSB 點名之中國行銷公司，受中宣部與公安部利用架設冒充國際媒體的假網站。",
      "description_zh": "NSB 2025 報告將虎牙（Huya）與海訊社、海賣並列為受中宣部與公安部利用、架設偽裝成中立國際媒體假網站的行銷公司之一，協同傳散親中敘事。（NSB 報告所指此「虎牙」係作為公關行銷主體被點名，宜與同名直播平臺區辨。）",
      "indicators": [
        "製作偽國際媒體偽新聞網站"
      ],
      "active_since": "",
      "related": [
        {
          "target_id": "mps",
          "relation": "operated-by",
          "note": "NSB 2025：受中宣部與公安部利用架設假外媒網站"
        },
        {
          "target_id": "mps",
          "relation": "linked-to",
          "note": "NSB：中央宣傳部與公安部利用虎牙等行銷公司製作偽新聞網站"
        }
      ],
      "event_ids": [
        "nsb-cognitive-2025"
      ],
      "source_ids": [
        "src-nsb-2026"
      ],
      "confidence": "low"
    },
    {
      "id": "magic-data",
      "name_zh": "晴數智慧科技",
      "name_en": "Magic Data",
      "aliases": [
        "Magic Data",
        "晴數智慧"
      ],
      "category": "tech-vendor",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "中國 AI 語音／數據廠商，NSB 指其與科大訊飛受委託開發智慧語音系統、誘騙臺灣民眾提交國、台、客語錄音以建立臺灣口音語音資料庫。",
      "description_zh": "NSB 2025 報告指出，中共委託晴數智慧科技（Magic Data）與科大訊飛（iFlytek）開發智慧語音系統，並在求職網站刊登廣告，誘騙不知情的臺灣使用者提交以華語（國語）、台語及客語錄製的線上錄音；中共意圖以這些語音資料建立臺灣口音語音資料庫，NSB 並不排除該系統可用於複製模仿臺灣口音的聲線，以提升 AI 生成影音內容的擬真度。",
      "indicators": [],
      "active_since": "",
      "related": [],
      "event_ids": [],
      "source_ids": [
        "src-nsb-2026"
      ],
      "confidence": "medium"
    },
    {
      "id": "norinco-group",
      "name_zh": "中國兵器工業集團",
      "name_en": "China North Industries Group Corporation (Norinco Group)",
      "aliases": [
        "China North Industries Group",
        "Norinco",
        "Norinco Group",
        "CNGC",
        "China North Industries Group Corporation (Norinco Group)"
      ],
      "category": "tech-vendor",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "中國國有軍工集團，NSB 指其開發 AI 模型與智能導控系統，同步進行輿情數據蒐集、自動化生成影音與精準投放。",
      "description_zh": "NSB 2025 報告指出，中國兵器工業集團（China North Industries Group / Norinco）等企業已開發 AI 模型與智能導控系統，能同步進行輿情數據蒐集、自動化影音生成與對目標受眾的精準投放，可快速產製並傳散各類文字、語音與影音爭訊（NSB 列於「運用 AI 生成高度擬真影音」手法）。",
      "indicators": [],
      "active_since": "",
      "related": [],
      "event_ids": [],
      "source_ids": [
        "src-nsb-2026"
      ],
      "confidence": "medium"
    },
    {
      "id": "bohemia-daily-fake",
      "name_zh": "《波希米亞日報》（假捷克媒體）",
      "name_en": "Bohemia Daily (fake Czech outlet)",
      "aliases": [
        "波希米亞日報",
        "Bohemia Daily",
        "Bohemia Daily (fake Czech outlet)"
      ],
      "category": "content-farm",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "中共委託公關公司「深圳海賣雲享」創建的假捷克媒體，用以引導國際「利中」「貶臺」輿論。",
      "description_zh": "NSB 2024 報告（src-nsb-2025）指出，中共為隱匿官方痕跡，委託公關公司「深圳海賣雲享」創建多語種假網站，其中假捷克媒體《波希米亞日報》（Bohemia Daily）與假西班牙媒體《奎爾先鋒報》（Guell Herald）推播中共海外官媒《CGTN》報導，炒作「一中」原則為國際主流觀點、批評我政府升高臺海緊張。NSB 2025 報告續以「Aisa Korea」「Austria Weekly」等假外媒延續此手法。",
      "indicators": [],
      "active_since": "",
      "related": [
        {
          "target_id": "haimai",
          "relation": "operated-by",
          "note": "NSB 2024：由公關公司深圳海賣雲享創建"
        }
      ],
      "event_ids": [],
      "source_ids": [
        "src-nsb-2025"
      ],
      "confidence": "medium"
    },
    {
      "id": "haixia-daobao-accounts",
      "name_zh": "海峽導報關聯帳號（臺灣蝦米貢／灣灣發電姬）",
      "name_en": "Haixia Daobao-linked TikTok accounts",
      "aliases": [
        "海峽導報",
        "臺灣蝦米貢",
        "灣灣發電姬",
        "Haixia Daobao",
        "Haixia Daobao-linked TikTok accounts",
        "台海網",
        "海峽導報社",
        "Haixia Daobao (Strait Herald)",
        "台海网",
        "海峡导报",
        "海峡导报社"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "NSB 指與中共官媒《海峽導報》關係密切的 TikTok 代理帳號，擴大轉發中共官方涉臺言論。",
      "description_zh": "NSB 2024 報告（src-nsb-2025）指出，「臺灣蝦米貢」「灣灣發電姬」等 TikTok 帳號與中共官媒《海峽導報》關係密切，擴大轉發中共官方涉臺言論，係中共於 TikTok、微博、Instagram 創設代理帳號掩飾官方關聯、協力傳散對臺官宣手法的具體案例。",
      "indicators": [
        "福建涉台官媒",
        "頻繁引用台灣名嘴『以台批台』",
        "與台海網同一體系"
      ],
      "active_since": "1949",
      "related": [
        {
          "target_id": "tao",
          "relation": "affiliated-with",
          "note": "涉台官媒體系，與國台辦宣傳口徑一致"
        }
      ],
      "event_ids": [
        "joint-sword-2024",
        "defense-futility-report-2025",
        "democracy-failure-report-118"
      ],
      "source_ids": [
        "src-nsb-2025",
        "src-iorg-101",
        "src-iorg-118",
        "src-iorg-136"
      ],
      "confidence": "low",
      "claims": [
        {
          "text": "然而，也有台灣的挺中網紅名嘴，冠以「媽媽桑」外交形容高市的外交風格，進而被專門對台宣傳的網站，例如「台海網」截用，剪輯高市與其他元首見面的影片，26再成為微博的熱搜關鍵詞。",
          "source_id": "src-factlink-japan",
          "about": "台海網"
        },
        {
          "text": "🇨🇳 2025 年 2 月 22 日 🇨🇳 福建日报「台海网」發表評論稱民進黨「把制度和民主作为抗拒统一、分裂国家的借口」，且配合西方「民主对抗威权」敘事，但川普「亲手撕碎了美西方虚伪民主叙事的包装纸」。",
          "source_id": "src-iorg-118",
          "about": "台海网"
        },
        {
          "text": "🇹🇼-🇨🇳 2024 年 1 月 13 日 🇨🇳 福建日报「海峡导报」針對美方於選前舉行媒體電話簡報會一事發表評論，認為美國此舉「罕见」「反常」「甘冒“介选”质疑」。",
          "source_id": "src-iorg-118",
          "about": "海峡导报"
        },
        {
          "text": "🇨🇳 2024 年 12 月 31 日 🇨🇳 福建日报「海峡导报社」以「民主退步的2024：斗鸡搭草台，台独变独裁」為標題發表評論，內文預言「只要2028年蓝白能够完成整合，“双少数”的赖清德将毫无一战之力，或将成为台湾地区领导人直选以来首个未能连任的领导人」。",
          "source_id": "src-iorg-118",
          "about": "海峡导报"
        },
        {
          "text": "🇹🇼-🇨🇳 2024 年 4 月 22 日 🇨🇳 福建日报「海峡导报社」報導，針對國民黨智庫傳出裁員，引用 國民黨 國民黨批評「民进党透过“党产会”抄家式的追杀在野党，眼中只有政治追杀，早就把所谓公平正义抛诸脑后」。",
          "source_id": "src-iorg-118",
          "about": "海峡导报"
        },
        {
          "text": "🇹🇼-🇨🇳 2025 年 2 月 18 日 🇨🇳 福建广播影视 TikTok 帳號「大咖開麥」及 🇨🇳 福建日报 抖音帳號「海峡导报」都發布影片，內容為呂禮詩於政論節目上稱中國電影「哪吒 2」在台灣可惜沒有排上上映抽籤（即無法在台灣上映），認為「台灣的言論自由，台灣的各種自由，會不會慢慢的讓大家覺得越來越只是一場笑話」。",
          "source_id": "src-iorg-118",
          "about": "海峡导报"
        },
        {
          "text": "🇨🇳 2024 年 12 月 31 日 🇨🇳 福建日报「海峡导报社」發表文章回顧 2024 年台灣政治發展，內文稱賴清德司法迫害柯文哲「接连突破民主底线，将绿色独裁推进至戒严边缘」，又動員「青鳥」施壓在野黨，讓 2024 年成為「民主退步的2024」。",
          "source_id": "src-iorg-118",
          "about": "海峡导报"
        },
        {
          "text": "當日 10:19 至 14:06 間，中共官媒「環球網」「台海網」「鳳凰網」「澎湃新聞」「央視網」及官媒微博帳號「环球时报」「海外网」「环球网」「小央视频」「香港中通社」「中国新闻网」「厦门广电」「海峡导报」「中国新闻社」多使用相同「天氣晴朗」圖片，協力傳播中時報導內容。",
          "source_id": "src-iorg-41",
          "about": "台海網"
        },
        {
          "text": "當日 14:56 至隔日 9:18 之間，中共官媒「澎湃新聞」「環球網」「台海網」「香港新聞網」協力傳播此則中時新聞網的報導內容。",
          "source_id": "src-iorg-41",
          "about": "台海網"
        },
        {
          "text": "1 月份共有 437 則文本提及鄭麗文，主要內容包含前總統馬英九建議鄭麗文訪中「别穿高跟鞋，赶快练毛笔字」（凤凰网），並放大鄭麗文宣稱台灣主流民意期待兩岸交流的說法（海峡导报）以及「兩岸和平框架」主張（凤凰网）。",
          "source_id": "src-iorg-131",
          "about": "海峡导报"
        },
        {
          "text": "1 月 30 日，🇨🇳 鳳凰衛視「凤凰网」發布來自 🇨🇳 福建日报「海峡导报」的文章「郑丽文抛“两岸和平框架”，岛内蓝白认可：和平是人民的殷切期盼」，內文包含「国民党主席郑丽文在专访透露今年上半年会先访问大陆、2028年执政后推“两岸和平框架”。",
          "source_id": "src-iorg-131",
          "about": "海峡导报"
        },
        {
          "text": "1 月 17 日，🇨🇳 福建日报「海峡导报」發布抖音，標題為「中天知名记者林宸佑被羁押，或因得罪民进党引祸上身」。",
          "source_id": "src-iorg-131",
          "about": "海峡导报"
        },
        {
          "text": "8 日，中共官媒「台海網」（8:59）及「海峽之聲」（9:12）協力傳播 2 則社論內容，宣稱「不少岛内媒体和民众已经看清了麦卡锡访台的真相，喊话麦卡锡不要来台湾。」",
          "source_id": "src-iorg-38",
          "about": "台海網"
        },
        {
          "text": "2 月 27 日 8:36 中共官媒「台海網」發布報導，內容引用政治大學國際關係研究中心研究員嚴震生教授受訪時的意見，認為「麦卡锡 [...] 窜台在所谓“美台关系”上的政治象征意义非常明显」「中国大陆在被逼迫的情况下“不得不”作出反制」。",
          "source_id": "src-iorg-38",
          "about": "台海網"
        },
        {
          "text": "隔日，中共官媒「中國台灣網」「鳳凰網」「台海網」「海峽飛虹」及「海峽之聲」以「根据岛内公布的一份最新民调」協力傳播相同內容，以網路投票結果代表台灣民眾全體意見。",
          "source_id": "src-iorg-38",
          "about": "台海網"
        },
        {
          "text": "其中，「台海網」的文章使用中共官媒「新華網」發布於 2022 年 8 月 5 日的合成照片 DA.28。",
          "source_id": "src-iorg-38",
          "about": "台海網"
        }
      ]
    },
    {
      "id": "wangwang-china-times-group",
      "name_zh": "旺旺中時媒體集團",
      "name_en": "Want Want China Times Media Group",
      "aliases": [
        "旺中集團",
        "旺中媒體",
        "中時集團",
        "Want Want China Times",
        "Want Want China Times Media Group",
        "中時",
        "中時新聞網",
        "中時電子報",
        "China Times"
      ],
      "category": "domestic-amplifier",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣媒體集團，旗下含中國時報、中時電子報、中天、中視等。",
      "description_zh": "在 IORG「疑美論與它們的產地」(2023) 報告中，旺旺中時集團旗下媒體及網路節目被點名為「共謀論」等疑美論論述的發起與放大者；在 IORG 週報第 101 期（2024 三次對台軍演期間 23 項國防失敗論，2025.2.14）中，集團旗下中天新聞、中天電視、中視新聞被列為國防失敗論相關內容的傳播管道之一。框架為中性引用，IORG 並未指其受境外指使。",
      "indicators": [
        "旗下中天/中視/中時電子報節目在 IORG 報告期間被列為相關敘事傳播管道"
      ],
      "active_since": "1993",
      "sensitivity": "domestic-named",
      "related": [],
      "event_ids": [
        "joint-sword-2024",
        "election-op-2024",
        "us-skepticism-report-2023"
      ],
      "source_ids": [
        "src-iorg-usskep1",
        "src-iorg-101"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "This coincided with reporting on the allegation by the China Times, a Taiwan-based newspaper that reportedly takes instructions directly from the CCP’s Taiwan Affairs Office.",
          "source_id": "src-aspi-2024",
          "about": "China Times"
        },
        {
          "text": "Traditional media, such as: United Daily News, China Times, ETtoday, TVBS, CTITV.",
          "source_id": "src-dtl-2022election",
          "about": "China Times"
        },
        {
          "text": "文末引用 旺中 中時電子報評論的觀點「台湾民主自由出现越来越被美国利益所掌控的趋势」。",
          "source_id": "src-iorg-118",
          "about": "中時電子報"
        },
        {
          "text": "文末也引用 旺中 中時電子報評論稱「绿营担心他会和钟明轩一样，带回的第一手信息冲击绿粉尤其是年轻世代，让大家走出绿营长期建构的“信息茧房”，对大陆有全新的认知，这样就不利于民进党继续“认知作战”洗脑了」。",
          "source_id": "src-iorg-118",
          "about": "中時電子報"
        },
        {
          "text": "蔡總統會見麥卡錫後，提及軍演的 YouTube 影片主要來自台灣新聞媒體頻道，依序為 TVBS、旺中集團、三立。",
          "source_id": "src-iorg-41",
          "about": "旺中集團"
        },
        {
          "text": "觀點 旺中集團多個 Facebook 粉專群聚發文協力傳播這項論述，時間點在國防部發布新聞稿後，並使用容易引起情緒的說法「攏是假」「軍方認定 [...] 究辦」。",
          "source_id": "src-iorg-41",
          "about": "旺中集團"
        },
        {
          "text": "當日 12:15 旺中集團粉專「無色覺醒」「正常發揮」「大新聞大爆卦」「頭條開講」亦群聚發表訊息內容完全相同的貼文，留言內容亦同。",
          "source_id": "src-iorg-41",
          "about": "旺中集團"
        },
        {
          "text": "觀點 旺中集團對這次事件的說法反覆，引用無法證實來源的「知情人士」宣稱「巨響」「純粹是 F-16 例行測試」，未提供證據，說法亦與國防部澄清內容不符。",
          "source_id": "src-iorg-41",
          "about": "旺中集團"
        },
        {
          "text": "觀點 根據 IORG 資料庫，包括旺中集團在內，在 Facebook 有多起關於這項論述的群聚發文現象。",
          "source_id": "src-iorg-41",
          "about": "旺中集團"
        },
        {
          "text": "隨後在當日 19:02 至 21:26 間，台灣新聞媒體跟進報導，包含自由時報、中央社、民視新聞網、聯合新聞網、中廣新聞網、上報、中時新聞網、芋傳媒。",
          "source_id": "src-iorg-41",
          "about": "中時新聞網"
        },
        {
          "text": "🇨🇳-🇹🇼 4 月 10 日 11:09 中時新聞網報導〈宣傳戰持續 東部戰區發布「台島上空的聲音」〉，為 IORG 資料庫中首則提及這支影片的台灣新聞報導。",
          "source_id": "src-iorg-41",
          "about": "中時新聞網"
        },
        {
          "text": "🇹🇼-🇨🇳 4 月 10 日 9:20 中時新聞網發布標題〈花蓮上空連傳 4 聲爆炸巨響 網友：該不會要打仗了〉的報導，提及「花蓮北區今天早上 8 點多，連續傳出 4 次不明爆炸巨響」「也有人擔心該不會要打仗，更有人猜測應是空軍戰鬥機的超音速音爆聲」。",
          "source_id": "src-iorg-41",
          "about": "中時新聞網"
        },
        {
          "text": "🇹🇼-🇨🇳 4 月 10 日 11:32 中時新聞網發布標題〈花蓮連 4 次爆炸巨響原因曝光 知情人士 5 字掛保證〉的報導，宣稱「有知情人士保證跟軍演無關，純粹是我軍方針對 F-16 的例行測試」「每架 F-16 整修完後，軍方都一定會進行超音速測試，而這正是今日花蓮發生巨響的原因，跟解放軍環台軍演無關」。",
          "source_id": "src-iorg-41",
          "about": "中時新聞網"
        },
        {
          "text": "當日 14:56 至隔日 9:18 之間，中共官媒「澎湃新聞」「環球網」「台海網」「香港新聞網」協力傳播此則中時新聞網的報導內容。",
          "source_id": "src-iorg-41",
          "about": "中時新聞網"
        },
        {
          "text": "觀點 中時新聞網將中共官媒發起的論述簡化為「澳大利亞新聞網報導」內容，然而實際上該澳媒報導內容並未包含「尼米茲號跑了」，因此這樣的報導方式屬於變造來源，可判定為資訊操弄。",
          "source_id": "src-iorg-41",
          "about": "中時新聞網"
        },
        {
          "text": "此外，中共官媒亦多次協力傳播中時集團關於這項論述的報導。",
          "source_id": "src-iorg-41",
          "about": "中時"
        },
        {
          "text": "當日 10:19 至 14:06 間，中共官媒「環球網」「台海網」「鳳凰網」「澎湃新聞」「央視網」及官媒微博帳號「环球时报」「海外网」「环球网」「小央视频」「香港中通社」「中国新闻网」「厦门广电」「海峡导报」「中国新闻社」多使用相同「天氣晴朗」圖片，協力傳播中時報導內容。",
          "source_id": "src-iorg-41",
          "about": "中時"
        },
        {
          "text": "影片中也持續使用中時 10 日首則報導「天氣晴朗」圖片。",
          "source_id": "src-iorg-41",
          "about": "中時"
        },
        {
          "text": "貼文皆使用中時「天氣晴朗」圖片，發文帳號包括「逐浪新闻」（14 日 23:25）「垄上频道」（15 日 0:07）「长江云官方微博」（9:06）「湖北卫视」（9:07）「湖北电视教育频道」（9:10）「湖北电视台官方微博」（9:20）。",
          "source_id": "src-iorg-41",
          "about": "中時"
        },
        {
          "text": "（聽片 42:00 起）隔日 18:03，此則中時報導內容，被以可疑訊息回報至 Cofacts。",
          "source_id": "src-iorg-41",
          "about": "中時"
        },
        {
          "text": "🇹🇼 2022 年 11 月 20-21 日 3 則由李路、郁慕明、旺報社評為作者的評論刊登於中時電子報，認為裴洛西訪台已造成「台海危機」，麥卡錫訪台將會是下一次的「台海危機」。",
          "source_id": "src-iorg-38",
          "about": "中時"
        },
        {
          "text": "（01:12）隔日，聯合新聞網（8:52）、中時新聞網（22:38）直接引用報導內容。",
          "source_id": "src-iorg-38",
          "about": "中時"
        },
        {
          "text": "貼文內容在當日獲得聯合新聞網（10:21）、中時新聞網（14:45）、中共官媒「台灣中評網」（16:44）報導引用，隔日也刊載在風傳媒（4 日 7:00）。",
          "source_id": "src-iorg-38",
          "about": "中時"
        },
        {
          "text": "2022 年 11 月 22 日 16:12 中時新聞網刊載作者陳朝平的評論，宣稱「萬一，此種外交操作失控時，美國必須也必要壯士斷腕，犧牲台灣 [...] 台灣也該做好為星條旗犧牲的準備了」。",
          "source_id": "src-iorg-38",
          "about": "中時"
        },
        {
          "text": "2023 年 1 月 24 日 YouTube 頻道「中天新聞」及中時電子報報導（16:04）引用郭正亮的意見，認為美國「就是要誘打」，「因為這符合美國的戰略利益，戰爭越早發生越好，就是美國要營造的局面 [...] 他可以在外交軍事上做出無限加碼不等於挑釁作戰的動作，就是要逼你動手」。",
          "source_id": "src-iorg-38",
          "about": "中時"
        },
        {
          "text": "群聚發文 同日，內容農場「密訊」發布和中時文章標題及內容一致的文章，並獲得粉專「反民進黨粉絲團」「民間大小事」「空心菜政府」群聚分享（23:00-01）。",
          "source_id": "src-iorg-38",
          "about": "中時"
        },
        {
          "text": "2 月 5 日 13:47 中時新聞網刊出作者為周忠菲的評論，標題為〈若麥卡錫訪台，「和平統一」將成為台灣民意主流〉，認為「麥卡錫若訪台 [...] 目的就是通過逼中國大陸對台動武，達到延緩中國發展的目的」。",
          "source_id": "src-iorg-38",
          "about": "中時"
        },
        {
          "text": "2023 年 1 月 10 日 0:01 中時新聞網報導引用 9 日「新聞大白話」節目中郭正亮的意見，認為共和黨下屆總統候選人「也有機率同行」、「幫共和黨造勢」。",
          "source_id": "src-iorg-38",
          "about": "中時"
        },
        {
          "text": "🇹🇼-🇨🇳 1 月 24 日 17:13 中時新聞網以標題〈二原因斷言麥卡錫必來 專家爆內幕：台灣已成美國「提款機」〉發布報導，引用介文汲的意見，認為「台灣已成美國提款機」。",
          "source_id": "src-iorg-38",
          "about": "中時"
        },
        {
          "text": "中時報導標題後更改為〈斷言麥卡錫必來！",
          "source_id": "src-iorg-38",
          "about": "中時"
        },
        {
          "text": "1 月 28 日 17:49 中時新聞網發表作者為趙興鵬的評論，質疑民進黨「勾連美國，敢於冒著犧牲台灣危險，來削弱中國大陸」認為這是「對台灣 2300 萬人民 [...] 不仁、不義、不負責任」。",
          "source_id": "src-iorg-38",
          "about": "中時"
        },
        {
          "text": "1 月 31 日 00:00 中時新聞網發表作者為周忠菲的評論，以「牽頭」稱呼台美關係，並認為「美民勾連本是常態，但他們試圖在台海燃起戰火的「欲望與能力」始終受到節制，也正在成為常態」。",
          "source_id": "src-iorg-38",
          "about": "中時"
        },
        {
          "text": "1 月 9 日 8:00 中時電子報刊出作者為中国劳动关系学院副教授郭振家的評論，認為 「美國對台灣的軍事化動作，正在高度拷貝當初對烏克蘭的政策」，宣稱「一些美國政客」曾經表態，美國在烏克蘭「賺到了」，呼籲台灣人如「不想陷入衝突，變成今天的烏克蘭戰場」，就應該反對美國「干涉兩岸事務」。",
          "source_id": "src-iorg-38",
          "about": "中時"
        },
        {
          "text": "1 月 25 日 18:32 中時新聞網刊出作者為佛光大學公共事務學系副教授柳金財的評論，標題為〈警惕美「以烏制俄」戰略 炮製「以台制中」釀險境〉，認為「從國際戰略選擇及地緣政治權力平衡角度檢視，俄烏戰爭爆發，美國是破壞國際秩序及區域穩定的罪魁禍首」，如果麥卡錫訪台，中國將會「祭出更大規模及力度圍台軍演及封鎖」，美國「試圖將北約拉攏烏克蘭版劇本應用在亞太區域」「聯台制中」「以台耗中」。",
          "source_id": "src-iorg-38",
          "about": "中時"
        },
        {
          "text": "2 月 22 日 23:48 中時新聞網刊出黃智賢的評論，認為美國「用俄烏戰爭」「破壞俄羅斯跟歐盟和解和平之勢」「取得戰略利益」「搶奪巨大經濟利益」「威攝中國」「組建圍中聯盟」，更要「用俄烏戰爭做模型」「在東亞要複製另一場俄烏戰爭」。",
          "source_id": "src-iorg-38",
          "about": "中時"
        },
        {
          "text": "另外，中天新聞網引用蔡正元的報導（12:43），也獲得旺中集團旗下節目「大新聞大爆卦」「無色覺醒」「頭條開講」「正常發揮」 的群聚分享（17:30）。",
          "source_id": "src-iorg-38",
          "about": "旺中集團"
        }
      ]
    },
    {
      "id": "cti-tv",
      "name_zh": "中天電視",
      "name_en": "CTi TV",
      "aliases": [
        "中天新聞",
        "中天",
        "CTi News",
        "中天電視台",
        "CTi TV"
      ],
      "category": "domestic-amplifier",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣電視媒體，旺旺中時集團旗下，2020 年新聞台執照未獲換發後轉以 YouTube 經營。",
      "description_zh": "在 IORG 週報第 101 期（2025.2.14）中，中天新聞、中天電視被列為 2024 三次對台軍演期間「國防失敗論」相關內容的傳播管道之一；在多期 IORG 中共月報中，中天電視/中天新聞被列為相關政論內容的台灣媒體。框架為中性，IORG 並未指其受境外指使。",
      "indicators": [
        "在 IORG 報告期間相關政論節目被列為敘事傳播管道"
      ],
      "active_since": "1994",
      "sensitivity": "domestic-named",
      "related": [
        {
          "target_id": "wangwang-china-times-group",
          "relation": "subsidiary-of",
          "note": "旺中集團旗下"
        }
      ],
      "event_ids": [
        "joint-sword-2024",
        "defense-futility-report-2025"
      ],
      "source_ids": [
        "src-iorg-101",
        "src-iorg-131"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "Traditional media, such as: United Daily News, China Times, ETtoday, TVBS, CTITV.",
          "source_id": "src-dtl-2022election",
          "about": "CTITV"
        },
        {
          "text": "The channel’s location is in Taiwan and the website for CTi News is linked in the About pop-up of the channel.",
          "source_id": "src-doublethink-lab-aaba8c",
          "about": "CTi News"
        },
        {
          "text": "CTi News is owned by Tsai Eng-meng, who supports Taiwan’s unification with the PRC.",
          "source_id": "src-doublethink-lab-aaba8c",
          "about": "CTi News"
        },
        {
          "text": "Zhongtian Daily Commentary is also the Bilibili presence of CTi News.",
          "source_id": "src-doublethink-lab-aaba8c",
          "about": "CTi News"
        },
        {
          "text": "除中共官媒外，台灣新聞媒體聯合、中天亦有相關內容，擴大「亂源論」傳播。",
          "source_id": "src-iorg-11",
          "about": "中天"
        },
        {
          "text": "值得注意的是，此一論述亦有台灣新聞媒體加入傳播，實際案例為 8 月 23 日聯合社論、8 月 29 日中天貼文。",
          "source_id": "src-iorg-11",
          "about": "中天"
        },
        {
          "text": "🇹🇼-🇨🇳 4 月 12 日 08:55 至 10:19 間，中共官媒「鳳凰網」「環球網」「香港新聞網」「大公文匯網」協力傳播介文汲在「中天新聞」節目影片中的說法。",
          "source_id": "src-iorg-41",
          "about": "中天新聞"
        },
        {
          "text": "1 月 12 日，🇨🇳 广电总台「看台海」發布微博，影片內容為 1 月 11 日 旺中「中天新聞」政論節目「辣晚報」中名嘴郭正亮的發言「2 個人（指蔡正元、柯文哲）都受到監控之中，都是被司法迫害的人士」，文字內容包含「柯文哲、蔡正元同框，一起秀出“电子脚镣” 尽显#台湾司法迫害黑暗#」。",
          "source_id": "src-iorg-131",
          "about": "中天新聞"
        },
        {
          "text": "1 月 18 日，🇨🇳 中共中央统战部「香港新聞網」發布文本「台灣中天新聞記者涉“安全”問題 遭羈押禁見」，內文包含「民眾黨立委張啟楷17日表示，林宸佑在採訪或者當主播的過程中，深入去追蹤了非常多的事情，是一位受廣大民眾支持的名主播、名記者。",
          "source_id": "src-iorg-131",
          "about": "中天新聞"
        },
        {
          "text": "1 月 21 日，🇨🇳 中共中央统战部「香港新聞網」發布文本「台記者涉“安全”問題遭羈押引島內輿論撻伐」，內文包含「台灣中天新聞記者林宸佑近日被指涉以金錢利誘軍人拍攝“投敵”影片，並刺探軍事機密，遭依涉犯所謂“國安法”等罪嫌羈押禁見。",
          "source_id": "src-iorg-131",
          "about": "中天新聞"
        },
        {
          "text": "另外，中天新聞網引用蔡正元的報導（12:43），也獲得旺中集團旗下節目「大新聞大爆卦」「無色覺醒」「頭條開講」「正常發揮」 的群聚分享（17:30）。",
          "source_id": "src-iorg-38",
          "about": "中天"
        },
        {
          "text": "2023 年 1 月 24 日 YouTube 頻道「中天新聞」及中時電子報報導（16:04）引用郭正亮的意見，認為美國「就是要誘打」，「因為這符合美國的戰略利益，戰爭越早發生越好，就是美國要營造的局面 [...] 他可以在外交軍事上做出無限加碼不等於挑釁作戰的動作，就是要逼你動手」。",
          "source_id": "src-iorg-38",
          "about": "中天"
        },
        {
          "text": "1 月 25 日 15:30 中天新聞以〈王定宇自爆邀請麥卡錫訪台 網友罵翻：爽了民進黨，苦了台灣百姓〉發布報導，提及「民進黨立委王定宇昨說，去年 9 月他飛到華府送邀請函，邀請麥卡錫訪台」，形容「網友對此罵聲一片」，引用網友留言認為「血汗錢又要填坑了」並將留言詮釋為「遊說公關費」，另引用網友留言認為王定宇委員的邀請是「勾結美國」，認為美國政要訪台「都是有目的」「都是來收保護費」。",
          "source_id": "src-iorg-38",
          "about": "中天"
        }
      ]
    },
    {
      "id": "tvbs",
      "name_zh": "TVBS",
      "name_en": "TVBS",
      "aliases": [
        "TVBS新聞台",
        "新聞大白話",
        "TVBS選新聞",
        "TVBS 新聞網"
      ],
      "category": "domestic-amplifier",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣電視媒體集團。",
      "description_zh": "在 IORG 週報第 101 期（2025.2.14）中，TVBS 節目「新聞大白話」「TVBS選新聞」被列為 2024 對台軍演期間國防失敗論相關內容的傳播管道之一；在 IORG「疑美論」相關分析中，TVBS 政論節目被列為部分名嘴發表相關言論的場域。框架為中性引用，IORG 並未指其受境外指使。",
      "indicators": [
        "政論節目在 IORG 報告期間被列為相關敘事傳播管道"
      ],
      "active_since": "1993",
      "sensitivity": "domestic-named",
      "related": [],
      "event_ids": [
        "joint-sword-2024",
        "defense-futility-report-2025"
      ],
      "source_ids": [
        "src-iorg-101"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "Traditional media, such as: United Daily News, China Times, ETtoday, TVBS, CTITV.",
          "source_id": "src-dtl-2022election",
          "about": "TVBS"
        },
        {
          "text": "4 月 10 日 14:35 TVBS 新聞網報導提及「對岸社群媒體繪聲繪影」「PTT 也出現 Dcard 轉貼文，標題寫下共軍飛門口，海軍還扯 [...] 上報假航跡」，描述 Dcard 貼文作者「自稱是海偵部一中隊雷達一兵，已向國防部信箱反映但根本沒人理」「被砲轟是假訊息後隨即刪文」。",
          "source_id": "src-iorg-41",
          "about": "TVBS 新聞網"
        },
        {
          "text": "蔡總統會見麥卡錫後，提及軍演的 YouTube 影片主要來自台灣新聞媒體頻道，依序為 TVBS、旺中集團、三立。",
          "source_id": "src-iorg-41",
          "about": "TVBS"
        },
        {
          "text": "2023 年 1 月 10 日 0:01 中時新聞網報導引用 9 日「新聞大白話」節目中郭正亮的意見，認為共和黨下屆總統候選人「也有機率同行」、「幫共和黨造勢」。",
          "source_id": "src-iorg-38",
          "about": "新聞大白話"
        },
        {
          "text": "最新民調嚇壞人〉發布報導，提及 TVBS 新聞網於 1 月 31 日至 2 月 5 日間舉行的網路投票，宣稱台灣「有將近 8 成 5 的網友，對於麥卡錫來台相當不支持」「更是有 9 成的網友，憂慮台灣成為兩國之間的棋子」，無視 TVBS 報導原文的聲明：「投票結果並不能夠直接推論全台灣民眾意見」。",
          "source_id": "src-iorg-38",
          "about": "TVBS 新聞網"
        }
      ]
    },
    {
      "id": "united-daily-news",
      "name_zh": "聯合報",
      "name_en": "United Daily News (UDN)",
      "aliases": [
        "聯合新聞網",
        "UDN",
        "聯合報系",
        "United Daily News (UDN)"
      ],
      "category": "domestic-amplifier",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣主要報業集團。",
      "description_zh": "在 IORG「疑美論與它們的產地」(2023) 報告中，聯合報 2023 年 7 月「南海會議」相關報導被列入疑美論論述脈絡；在多期 IORG 中共月報中，聯合報/聯合新聞網被列為相關敘事的台灣媒體。框架為中性引用，IORG 並未指其受境外指使。",
      "indicators": [
        "相關報導在 IORG 報告中被列入疑美論/相關敘事脈絡"
      ],
      "active_since": "1951",
      "sensitivity": "domestic-named",
      "related": [],
      "event_ids": [
        "us-skepticism-report-2023"
      ],
      "source_ids": [
        "src-iorg-usskep1"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "7 月 12 日，聯合報刊登所謂台灣政府會議記錄的照片，宣稱美國曾「要求台灣設立 P4 實驗室」「研發生物戰劑」，台灣政府已駁斥這項說法。",
          "source_id": "src-iorg-usskep1",
          "about": "聯合報"
        },
        {
          "text": "例如，聯合新聞網刊出社論「阿富汗震撼」後，中共官媒環球網微博帳號、通說 2.0 引用其內容；而中共官媒環球網刊出社評「为什么说美国一定会最终抛弃台湾」，聯合新聞網即在隔日改寫，刊出「環球時報列六大理由，指美國終將拋棄台灣」報導。",
          "source_id": "src-iorg-11",
          "about": "聯合新聞網"
        },
        {
          "text": "隔日，聯合新聞網將該社評改寫，刊出題為「環球時報列六大理由 指美國終將拋棄台灣」的報導。",
          "source_id": "src-iorg-11",
          "about": "聯合新聞網"
        },
        {
          "text": "21 日，內容農場怒吼，抄襲聯合報導內容，「反蔡英文粉絲團」轉發怒吼文章。",
          "source_id": "src-iorg-11",
          "about": "聯合報"
        },
        {
          "text": "經 IORG 比對內容，此貼文部分內容來自當日聯合報社論黑白集「阿富汗震撼」，及前一天 TVBS 新聞網的報導內容。",
          "source_id": "src-iorg-11",
          "about": "聯合報"
        },
        {
          "text": "另，中共官媒通說 2.0，直接分享聯合報社論。",
          "source_id": "src-iorg-11",
          "about": "聯合報"
        },
        {
          "text": "🇨🇳-🇹🇼 4 月 10 日 9:06 台灣新聞媒體鏡傳媒發布報導，內容包含 4 月 9 日 17:41 解放軍東部戰區的微博官方帳號「东部战区」發布相同的動畫影片，當日，聯合新聞網（12:40）、自由時報（16:44）亦跟進報導此動畫影片。",
          "source_id": "src-iorg-41",
          "about": "聯合新聞網"
        },
        {
          "text": "隨後在當日 19:02 至 21:26 間，台灣新聞媒體跟進報導，包含自由時報、中央社、民視新聞網、聯合新聞網、中廣新聞網、上報、中時新聞網、芋傳媒。",
          "source_id": "src-iorg-41",
          "about": "聯合新聞網"
        },
        {
          "text": "當日，台灣新聞媒體跟進報導，包含民視新聞網、聯合新聞網、華視新聞網、上報。",
          "source_id": "src-iorg-41",
          "about": "聯合新聞網"
        },
        {
          "text": "4 月 10 日 12:46 聯合新聞網報導「海巡署澄清海上射擊訓練已取消」「空軍花蓮五聯隊否認有易產生音爆的超音速飛行演訓」「亞泥回應上午沒有採礦炸山作業」，為 IORG 資料庫首則包含官方機構澄清的文本。",
          "source_id": "src-iorg-41",
          "about": "聯合新聞網"
        },
        {
          "text": "（01:12）隔日，聯合新聞網（8:52）、中時新聞網（22:38）直接引用報導內容。",
          "source_id": "src-iorg-38",
          "about": "聯合新聞網"
        },
        {
          "text": "貼文內容在當日獲得聯合新聞網（10:21）、中時新聞網（14:45）、中共官媒「台灣中評網」（16:44）報導引用，隔日也刊載在風傳媒（4 日 7:00）。",
          "source_id": "src-iorg-38",
          "about": "聯合新聞網"
        },
        {
          "text": "🇹🇼-🇨🇳-🇹🇼 1 月 27 日中共官媒「香港中評網」引用郭正亮的意見（1:12），隔日，台灣新聞媒體聯合新聞網則引用「香港中評網」引用郭正亮意見的報導內容（8:52）。",
          "source_id": "src-iorg-38",
          "about": "聯合新聞網"
        },
        {
          "text": "2 月 5 日 4:51 聯合報發布社論，認為「麥卡錫有意訪台，並成立中國事務特別委員會，該會還以加強對台軍售為由，有意來台舉行聽證會 [...] 這些主張看似大力挺台，其實是拿台灣當小刀戳痛中共並讓拜登難堪，不僅無助台灣提升戰力，並且是升高台海危機作為選票提款機」。",
          "source_id": "src-iorg-38",
          "about": "聯合報"
        }
      ]
    },
    {
      "id": "asia-vision-tv",
      "name_zh": "亞洲衛視",
      "name_en": "Asia Vision TV",
      "aliases": [
        "寰宇全視界",
        "寰宇新聞",
        "亞洲衛視寰宇新聞台",
        "Asia Vision TV"
      ],
      "category": "domestic-amplifier",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣衛星電視媒體。",
      "description_zh": "在 IORG 週報第 101 期（2025.2.14）中，亞洲衛視旗下「寰宇全視界」「寰宇新聞」被列為 2024 對台軍演期間國防失敗論相關內容的傳播管道之一。框架為中性引用，IORG 並未指其受境外指使。",
      "indicators": [
        "旗下節目在 IORG 報告期間被列為相關敘事傳播管道"
      ],
      "active_since": "2014",
      "sensitivity": "domestic-named",
      "related": [],
      "event_ids": [
        "joint-sword-2024",
        "defense-futility-report-2025"
      ],
      "source_ids": [
        "src-iorg-101"
      ],
      "confidence": "medium"
    },
    {
      "id": "kuo-cheng-liang",
      "name_zh": "郭正亮",
      "name_en": "Kuo Cheng-liang",
      "aliases": [
        "Kuo Cheng-liang"
      ],
      "category": "commentator",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣政論名嘴、前民進黨籍立法委員。",
      "description_zh": "在 IORG 週報第 101 期（國防失敗論，2025.2.14）及週報第 136 期（2025 年中共官宣影片裡的「台灣代表」，2026.4.17，排名第 4）等多份 IORG 報告中，郭正亮被列為其言論遭中共官媒抖音頻道引用、放大（「以台批台」）的台灣政論人物之一，亦在多期中共月報中被列名。框架為中性引用，IORG 並未指其受境外指使或受酬。",
      "indicators": [
        "言論遭中共官媒抖音頻道引用放大",
        "IORG 週報136「台灣代表」排名第4"
      ],
      "active_since": "1990s",
      "sensitivity": "domestic-named",
      "related": [
        {
          "target_id": "tvbs",
          "relation": "linked-to",
          "note": "常見於 TVBS/旺中政論節目"
        }
      ],
      "event_ids": [
        "joint-sword-2024",
        "election-op-2024",
        "defense-futility-report-2025",
        "ccp-taiwan-reps-2025"
      ],
      "source_ids": [
        "src-iorg-101",
        "src-iorg-136"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "1 月 12 日，🇨🇳 广电总台「看台海」發布微博，影片內容為 1 月 11 日 旺中「中天新聞」政論節目「辣晚報」中名嘴郭正亮的發言「2 個人（指蔡正元、柯文哲）都受到監控之中，都是被司法迫害的人士」，文字內容包含「柯文哲、蔡正元同框，一起秀出“电子脚镣” 尽显#台湾司法迫害黑暗#」。",
          "source_id": "src-iorg-131",
          "about": "郭正亮"
        },
        {
          "text": "關於裴洛西訪台，中共官媒發起並參與多項論述傳播，央視更公開報導宣揚其旗下品牌「玉渊谭天」「協同」中央廣電總台「影響中國國內海外輿論」 DA.28；關於麥卡錫訪台的 10 項論述則多出自台灣，中共官媒多引用台灣新聞媒體社論、特定名嘴（如郭正亮、蔡正元、介文汲）、政治人物（如楊永明）及其他可信度不一的評論，擴大傳播。",
          "source_id": "src-iorg-38",
          "about": "郭正亮"
        },
        {
          "text": "2022 年 11 月 25 日 YouTube 頻道「Yahoo TV 風向龍鳳配」發布節目影片，郭正亮在節目中認為美國是在「引誘你（中國）來打（台灣）」（57:35），並認為「新的議長一定會來台灣」（57:48）。",
          "source_id": "src-iorg-38",
          "about": "郭正亮"
        },
        {
          "text": "節目內容及郭正亮的意見在隔日獲得風傳媒報導（8:10）。",
          "source_id": "src-iorg-38",
          "about": "郭正亮"
        },
        {
          "text": "2023 年 1 月 24 日 YouTube 頻道「中天新聞」及中時電子報報導（16:04）引用郭正亮的意見，認為美國「就是要誘打」，「因為這符合美國的戰略利益，戰爭越早發生越好，就是美國要營造的局面 [...] 他可以在外交軍事上做出無限加碼不等於挑釁作戰的動作，就是要逼你動手」。",
          "source_id": "src-iorg-38",
          "about": "郭正亮"
        },
        {
          "text": "🇹🇼-🇨🇳-🇹🇼 1 月 27 日中共官媒「香港中評網」引用郭正亮的意見（1:12），隔日，台灣新聞媒體聯合新聞網則引用「香港中評網」引用郭正亮意見的報導內容（8:52）。",
          "source_id": "src-iorg-38",
          "about": "郭正亮"
        },
        {
          "text": "2022 年 11 月 26 日 8:10 風傳媒報導引用 25 日「Yahoo TV 風向龍鳳配」節目中郭正亮的意見（57:35），認為「麥卡錫訪台並不是最大的衝擊」、「川普一定會想來」「佛州州長德桑提斯也可能會想來台灣」，因為「台灣是最容易造勢的地方」。",
          "source_id": "src-iorg-38",
          "about": "郭正亮"
        },
        {
          "text": "2023 年 1 月 10 日 0:01 中時新聞網報導引用 9 日「新聞大白話」節目中郭正亮的意見，認為共和黨下屆總統候選人「也有機率同行」、「幫共和黨造勢」。",
          "source_id": "src-iorg-38",
          "about": "郭正亮"
        },
        {
          "text": "2 月 23 日 08:20 風傳媒報導引用 22 日「觀點：明亮看世界」節目中郭正亮的意見（57:30），認為「麥卡錫勢必會在今年訪台，因為麥卡錫明年也要選舉，且又不能搶總統候選人的風頭，說不定共和黨的總統候選人有意訪台」。",
          "source_id": "src-iorg-38",
          "about": "郭正亮"
        }
      ]
    },
    {
      "id": "jaw-shaw-kong",
      "name_zh": "趙少康",
      "name_en": "Jaw Shaw-kong",
      "aliases": [
        "Jaw Shaw-kong"
      ],
      "category": "commentator",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣媒體人、中廣董事長，2024 國民黨副總統候選人。",
      "description_zh": "在 IORG 早期疑美論/阿富汗撤軍分析（中共月報第 11 期，2021）及週報第 118 期（台灣民主失敗論，2025.8.14）等 IORG 報告中，趙少康被列為其言論遭中共官媒引用、或其論述與相關敘事呼應的台灣媒體人。框架為中性引用，IORG 並未指其受境外指使或受酬。",
      "indicators": [
        "言論遭中共官媒引用",
        "於 IORG 民主失敗論週報被列名"
      ],
      "active_since": "1990s",
      "sensitivity": "domestic-named",
      "related": [],
      "event_ids": [
        "election-op-2024",
        "democracy-failure-report-118"
      ],
      "source_ids": [
        "src-iorg-11",
        "src-iorg-118"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "🇹🇼-🇨🇳 2024 年 5 月 23 日 🇨🇳 人民日报「环球网」針對立法院「國會改革」修法爭議發表文章，內文引用 國民黨 葉元之、 國民黨 趙少康、聯合 聯合新聞網說法，認為立院外抗議的民眾是受到民進黨煽動或組織，評論賴政府「意图操控民众」。",
          "source_id": "src-iorg-118",
          "about": "趙少康"
        },
        {
          "text": "第 2 是「阿富汗是台灣的前車之鑑」，至少 127 則貼文，佔 14.6 %，此論述來自台灣媒體人趙少康。",
          "source_id": "src-iorg-11",
          "about": "趙少康"
        },
        {
          "text": "這句話，是 8 月 15 日台灣政論節目名嘴趙少康在 Facebook 粉專表示「小心，阿富汗是台灣的前車之鑑」、「老共不可測，老美不可靠，要靠還是要靠自己」。",
          "source_id": "src-iorg-11",
          "about": "趙少康"
        },
        {
          "text": "美軍撤離阿富汗首都，趙少康：小心！",
          "source_id": "src-iorg-11",
          "about": "趙少康"
        },
        {
          "text": "國民黨的趙少康直言，小心阿富汗是台灣的前車之鑑，民進黨灌輸台灣人「打了美國會來救」的一廂情願想法，台灣如果不想成為第二個阿富汗，就要在「和」「戰」之間想清楚。",
          "source_id": "src-iorg-11",
          "about": "趙少康"
        },
        {
          "text": "阿富汗是台灣的前車之鑑 趙少康：靠美國太愚蠢了！",
          "source_id": "src-iorg-11",
          "about": "趙少康"
        }
      ]
    },
    {
      "id": "tsai-cheng-yuan",
      "name_zh": "蔡正元",
      "name_en": "Tsai Cheng-yuan",
      "aliases": [
        "Tsai Cheng-yuan"
      ],
      "category": "commentator",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣政論名嘴、前國民黨籍立法委員。",
      "description_zh": "在 IORG 週報第 136 期（2025 年中共官宣影片裡的「台灣代表」，2026.4.17，排名第 3）及多期中共月報中，蔡正元被列為其言論遭中共官媒抖音頻道引用、放大的台灣政論人物之一。框架為中性引用，IORG 並未指其受境外指使或受酬。",
      "indicators": [
        "言論遭中共官媒抖音頻道引用放大",
        "IORG 週報136「台灣代表」排名第3"
      ],
      "active_since": "2000s",
      "sensitivity": "domestic-named",
      "related": [],
      "event_ids": [
        "joint-sword-2024",
        "democracy-failure-report-118",
        "ccp-taiwan-reps-2025"
      ],
      "source_ids": [
        "src-iorg-136",
        "src-iorg-131"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "🇹🇼-🇨🇳 4 月 13 日 10:49，中共官媒「香港新聞網」發布報導，宣稱尼米茲號在共軍演一開始「馬上就掉頭跑了」，並引述蔡正元的說法「美國是渣男」「幫助台灣，只剩下一張嘴」。",
          "source_id": "src-iorg-41",
          "about": "蔡正元"
        },
        {
          "text": "中共最關注台灣人物 top 5 之中，提出「兩岸和平框架」主張的 國民黨 主席鄭麗文名列第 2，民進黨 內政部長劉世芳、教育部長鄭英耀為国台办列為「“台独” 顽固分子」而位居 3、4，名嘴蔡正元首次進入前 5。",
          "source_id": "src-iorg-131",
          "about": "蔡正元"
        },
        {
          "text": "中共借司法案件（柯文哲「京華城案」、名嘴蔡正元「三中案」、中天記者林宸佑涉犯國安法案）、政府發布資安風險警告（數發部公布資安高風險 App 清單）宣稱「民进党当局」「司法迫害」、「製造寒蝉效应」、「剥夺台湾民众、青年知情权」，形塑民進黨政府濫用司法、迫害野黨、箝制人民思想自由，遭多數民意反對的獨裁形象，意圖損害台灣民眾對司法機關、政府機關、執政黨的信任。",
          "source_id": "src-iorg-131",
          "about": "蔡正元"
        },
        {
          "text": "1 月份共有 293 則文本提及蔡正元，主要內容為借蔡正元介入「三中案」批評民進黨政府「编织罪名」（中国新闻社）、「政治追杀异己」（中国东南卫视官方频道）、讓唐湘龍「当场抹泪」（中国东南卫视官方频道），並放大蔡正元對此事件觀點「哪怕深陷狱中，反“台独” 立场永不改变」（中国新闻社）、「我们要在每一个角落作战，推翻民进党」（中国东南卫视官方频道）。",
          "source_id": "src-iorg-131",
          "about": "蔡正元"
        },
        {
          "text": "1 月 10 日，🇨🇳 人民日报「环球网」發布作者「北平锋」的文章「在反“独”促统的民族大义面前并肩而行」，內文包含「近日，台湾“高等法院”对“三中案”作出二审判决，台湾前民意代表蔡正元被判三年六个月，中国国民党前主席马英九无罪。",
          "source_id": "src-iorg-131",
          "about": "蔡正元"
        },
        {
          "text": "1 月 11 日，🇨🇳 鳳凰衛視「凤凰网」發布來自「台湾日月谈」文本「蔡正元和柯文哲同框翘脚，一起秀出“电子脚镣”」，引用名嘴蔡正元 1 月 10 日在其個人 Facebook 貼文使用的照片，文字內容包含「蔡正元 1 月 10 日晚间再度成为话题焦点。",
          "source_id": "src-iorg-131",
          "about": "蔡正元"
        },
        {
          "text": "蔡正元在贴文中以“当电子脚镣遇到电子脚镣”形容这场会面，指出此次是应柯文哲之邀，参与“土城十讲”第九讲的录影。",
          "source_id": "src-iorg-131",
          "about": "蔡正元"
        },
        {
          "text": "1 月 12 日，🇨🇳 广电总台「看台海」發布微博，影片內容為 1 月 11 日 旺中「中天新聞」政論節目「辣晚報」中名嘴郭正亮的發言「2 個人（指蔡正元、柯文哲）都受到監控之中，都是被司法迫害的人士」，文字內容包含「柯文哲、蔡正元同框，一起秀出“电子脚镣” 尽显#台湾司法迫害黑暗#」。",
          "source_id": "src-iorg-131",
          "about": "蔡正元"
        },
        {
          "text": "1 月 13 日，🇨🇳 国台办「中国台湾网」發布文本「郑丽文批民进党当局滥用司法：台湾之耻辱」，內文包含「据台媒报道，台湾民众党前主席柯文哲、中国国民党前台北市党部主委黄吕锦茹及前民代蔡正元均因涉案被强制佩戴电子脚镣，而民进党籍涉贪人士郑文灿却未受该“待遇”。",
          "source_id": "src-iorg-131",
          "about": "蔡正元"
        },
        {
          "text": "關於裴洛西訪台，中共官媒發起並參與多項論述傳播，央視更公開報導宣揚其旗下品牌「玉渊谭天」「協同」中央廣電總台「影響中國國內海外輿論」 DA.28；關於麥卡錫訪台的 10 項論述則多出自台灣，中共官媒多引用台灣新聞媒體社論、特定名嘴（如郭正亮、蔡正元、介文汲）、政治人物（如楊永明）及其他可信度不一的評論，擴大傳播。",
          "source_id": "src-iorg-38",
          "about": "蔡正元"
        },
        {
          "text": "🇹🇼-🇨🇳 群聚發文 2023 年 1 月 24 日 6:50 粉專「蔡正元」貼文，認為「美國透過麥卡錫訪台 [...] 利用台海戰爭徹底犧牲台灣，可以換得圍堵及削弱中國的機會，甚或利用麥卡錫訪台作為談判酬碼，從中台雙方取得重大退讓的利益」。",
          "source_id": "src-iorg-38",
          "about": "蔡正元"
        },
        {
          "text": "蔡正元的意見於當日獲得中資粉專「兩岸頭條」（9:12）及中共官媒「僑報網」（16:47）分享及引用。",
          "source_id": "src-iorg-38",
          "about": "蔡正元"
        },
        {
          "text": "另外，中天新聞網引用蔡正元的報導（12:43），也獲得旺中集團旗下節目「大新聞大爆卦」「無色覺醒」「頭條開講」「正常發揮」 的群聚分享（17:30）。",
          "source_id": "src-iorg-38",
          "about": "蔡正元"
        },
        {
          "text": "1 月 26 日 19:00 粉專「Speak Out HK 港人講地」發布貼文，認為麥卡錫「忽然要匆匆訪台」，是美國「採取主動態勢打台灣牌及台獨牌」「測試觸碰中方紅線的後果」，並認為「徹底犧牲台灣」「可以換來圍堵和削弱中國的機會」，文句和蔡正元 24 日貼文吻合。",
          "source_id": "src-iorg-38",
          "about": "蔡正元"
        },
        {
          "text": "24 日蔡正元的貼文及 26 日「港人講地」的貼文，都連結了麥卡錫訪台及俄烏戰爭，認為是美國挑釁，犧牲台灣（烏克蘭）人民。",
          "source_id": "src-iorg-38",
          "about": "蔡正元"
        },
        {
          "text": "1 月 24 日蔡正元的粉專貼文及 26 日「港人講地」的貼文，都連結了麥卡錫訪台及俄烏戰爭，認為是美國挑釁，犧牲台灣及烏克蘭人民。",
          "source_id": "src-iorg-38",
          "about": "蔡正元"
        }
      ]
    },
    {
      "id": "lai-yueh-chien",
      "name_zh": "賴岳謙",
      "name_en": "Lai Yueh-chien",
      "aliases": [
        "Lai Yueh-chien"
      ],
      "category": "commentator",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣政論名嘴、陸軍退役上校。",
      "description_zh": "在 IORG 週報第 136 期（2025 年中共官宣影片裡的「台灣代表」，2026.4.17，排名第 7，陸軍退役上校）及週報第 101 期（國防失敗論名嘴名單）中，賴岳謙被列為其言論遭中共官媒抖音頻道引用、放大（「以台批台」）的台灣退役軍官／政論人物之一，並橫跨多期中共月報。框架為中性引用，IORG 並未指其受境外指使或受酬。",
      "indicators": [
        "退役軍官言論遭中共官媒引用放大",
        "IORG 週報136「台灣代表」排名第7"
      ],
      "active_since": "2010s",
      "sensitivity": "domestic-named",
      "related": [],
      "event_ids": [
        "joint-sword-2024",
        "defense-futility-report-2025",
        "ccp-taiwan-reps-2025"
      ],
      "source_ids": [
        "src-iorg-101",
        "src-iorg-136"
      ],
      "confidence": "high"
    },
    {
      "id": "li-cheng-chieh",
      "name_zh": "栗正傑",
      "name_en": "Li Cheng-chieh",
      "aliases": [
        "Li Cheng-chieh"
      ],
      "category": "commentator",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣政論名嘴、陸軍退役少將。",
      "description_zh": "在 IORG 週報第 136 期（2025 年中共官宣影片裡的「台灣代表」，2026.4.17，排名第 8，陸軍退役少將）及週報第 101 期（國防失敗論）中，栗正傑被列為其言論遭中共官媒抖音頻道引用、放大的台灣退役軍官／政論人物之一。框架為中性引用，IORG 並未指其受境外指使或受酬。",
      "indicators": [
        "退役將領言論遭中共官媒引用放大",
        "IORG 週報136「台灣代表」排名第8"
      ],
      "active_since": "2010s",
      "sensitivity": "domestic-named",
      "related": [],
      "event_ids": [
        "joint-sword-2024",
        "defense-futility-report-2025",
        "ccp-taiwan-reps-2025"
      ],
      "source_ids": [
        "src-iorg-101",
        "src-iorg-136"
      ],
      "confidence": "high"
    },
    {
      "id": "shuai-hua-min",
      "name_zh": "帥化民",
      "name_en": "Shuai Hua-min",
      "aliases": [
        "Shuai Hua-min"
      ],
      "category": "commentator",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣政論名嘴、陸軍退役中將、前立法委員。",
      "description_zh": "在 IORG 週報第 136 期（2025 年中共官宣影片裡的「台灣代表」，2026.4.17，排名第 10，陸軍退役中將）及週報第 101 期（國防失敗論）中，帥化民被列為其言論遭中共官媒抖音頻道引用、放大的台灣退役軍官／政論人物之一。框架為中性引用，IORG 並未指其受境外指使或受酬。",
      "indicators": [
        "退役將領言論遭中共官媒引用放大",
        "IORG 週報136「台灣代表」排名第10"
      ],
      "active_since": "2000s",
      "sensitivity": "domestic-named",
      "related": [],
      "event_ids": [
        "joint-sword-2024",
        "defense-futility-report-2025",
        "ccp-taiwan-reps-2025"
      ],
      "source_ids": [
        "src-iorg-101",
        "src-iorg-136"
      ],
      "confidence": "high"
    },
    {
      "id": "lu-li-shih",
      "name_zh": "呂禮詩",
      "name_en": "Lu Li-shih",
      "aliases": [
        "Lu Li-shih"
      ],
      "category": "commentator",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣政論名嘴、海軍退役少校。",
      "description_zh": "在 IORG 週報第 136 期（2025 年中共官宣影片裡的「台灣代表」，2026.4.17，海軍退役少校）及週報第 101 期（國防失敗論）中，呂禮詩被列為其言論遭中共官媒抖音頻道引用、放大的台灣退役軍官／政論人物之一；亦在多期中共月報中被列名。框架為中性引用，IORG 並未指其受境外指使或受酬。",
      "indicators": [
        "退役軍官言論遭中共官媒引用放大"
      ],
      "active_since": "2010s",
      "sensitivity": "domestic-named",
      "related": [],
      "event_ids": [
        "joint-sword-2024",
        "defense-futility-report-2025",
        "ccp-taiwan-reps-2025"
      ],
      "source_ids": [
        "src-iorg-101",
        "src-iorg-136"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "🇹🇼-🇨🇳 2025 年 2 月 18 日 🇨🇳 福建广播影视 TikTok 帳號「大咖開麥」及 🇨🇳 福建日报 抖音帳號「海峡导报」都發布影片，內容為呂禮詩於政論節目上稱中國電影「哪吒 2」在台灣可惜沒有排上上映抽籤（即無法在台灣上映），認為「台灣的言論自由，台灣的各種自由，會不會慢慢的讓大家覺得越來越只是一場笑話」。",
          "source_id": "src-iorg-118",
          "about": "呂禮詩"
        }
      ]
    },
    {
      "id": "chieh-wen-chi",
      "name_zh": "介文汲",
      "name_en": "Chieh Wen-chi",
      "aliases": [
        "Chieh Wen-chi"
      ],
      "category": "commentator",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣政論名嘴、前外交官。",
      "description_zh": "在 IORG 週報第 136 期（2025 年中共官宣影片裡的「台灣代表」，2026.4.17，排名第 9，前外交官）及週報第 101 期（國防失敗論名嘴名單）中，介文汲被列為其言論遭中共官媒抖音頻道引用、放大的台灣政論人物之一。框架為中性引用，IORG 並未指其受境外指使或受酬。",
      "indicators": [
        "言論遭中共官媒抖音頻道引用放大",
        "IORG 週報136「台灣代表」排名第9"
      ],
      "active_since": "2010s",
      "sensitivity": "domestic-named",
      "related": [],
      "event_ids": [
        "joint-sword-2024",
        "ccp-taiwan-reps-2025"
      ],
      "source_ids": [
        "src-iorg-101",
        "src-iorg-136"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "前大使：5 千美軍比台人重要〉發布報導，認為「《澳大利亞新聞網》報導，尼米茲號航母 7 日靠近台灣，一度與山東號僅距離 200 海浬，但 8 日軍演一開始就果斷轉頭北上，與去年 8 月一樣」，報導同時引述介文汲在中天網路節目「盧秀芳辣晚報」的說法「美軍並不想干涉中共軍演，轉頭離開就是向中國發出訊息，表達與我無關，不希望局勢被誤判」「一艘航空母艦上 5 千名官兵的性命，絕對高於台灣人怎麼想」。",
          "source_id": "src-iorg-41",
          "about": "介文汲"
        },
        {
          "text": "🇹🇼-🇨🇳 4 月 12 日 08:55 至 10:19 間，中共官媒「鳳凰網」「環球網」「香港新聞網」「大公文匯網」協力傳播介文汲在「中天新聞」節目影片中的說法。",
          "source_id": "src-iorg-41",
          "about": "介文汲"
        },
        {
          "text": "關於裴洛西訪台，中共官媒發起並參與多項論述傳播，央視更公開報導宣揚其旗下品牌「玉渊谭天」「協同」中央廣電總台「影響中國國內海外輿論」 DA.28；關於麥卡錫訪台的 10 項論述則多出自台灣，中共官媒多引用台灣新聞媒體社論、特定名嘴（如郭正亮、蔡正元、介文汲）、政治人物（如楊永明）及其他可信度不一的評論，擴大傳播。",
          "source_id": "src-iorg-38",
          "about": "介文汲"
        },
        {
          "text": "🇹🇼-🇨🇳 1 月 24 日 17:13 中時新聞網以標題〈二原因斷言麥卡錫必來 專家爆內幕：台灣已成美國「提款機」〉發布報導，引用介文汲的意見，認為「台灣已成美國提款機」。",
          "source_id": "src-iorg-38",
          "about": "介文汲"
        },
        {
          "text": "隔日（25），介文汲的意見獲得中共官媒「僑報網」引用。",
          "source_id": "src-iorg-38",
          "about": "介文汲"
        },
        {
          "text": "2022 年 11 月 18 日 1:18 中共官媒「台灣中評網」發布報導，引用介文汲受訪時的意見，認為「把台灣烏克蘭化從各種角度來看，非常符合美國利益」。",
          "source_id": "src-iorg-38",
          "about": "介文汲"
        }
      ]
    },
    {
      "id": "hsieh-han-ping",
      "name_zh": "謝寒冰",
      "name_en": "Hsieh Han-ping",
      "aliases": [
        "Hsieh Han-ping"
      ],
      "category": "commentator",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣政論名嘴、前媒體編輯。",
      "description_zh": "在 IORG 週報第 136 期（2025 年中共官宣影片裡的「台灣代表」，2026.4.17，排名第 6）及週報第 101 期（國防失敗論）與多期中共月報中，謝寒冰被列為其言論遭中共官媒抖音頻道引用、放大的台灣政論人物之一。框架為中性引用，IORG 並未指其受境外指使或受酬。",
      "indicators": [
        "言論遭中共官媒抖音頻道引用放大",
        "IORG 週報136「台灣代表」排名第6"
      ],
      "active_since": "2000s",
      "sensitivity": "domestic-named",
      "related": [],
      "event_ids": [
        "joint-sword-2024",
        "ccp-taiwan-reps-2025"
      ],
      "source_ids": [
        "src-iorg-101",
        "src-iorg-136"
      ],
      "confidence": "high"
    },
    {
      "id": "tang-hsiang-lung",
      "name_zh": "唐湘龍",
      "name_en": "Tang Hsiang-lung",
      "aliases": [
        "Tang Hsiang-lung"
      ],
      "category": "commentator",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣媒體人、政論名嘴、電台主持人。",
      "description_zh": "在 IORG 週報第 136 期（2025 年中共官宣影片裡的「台灣代表」，2026.4.17）及週報第 101 期（國防失敗論名嘴名單）與多期中共月報中，唐湘龍被列為其言論遭中共官媒抖音頻道引用、放大的台灣政論人物之一。框架為中性引用，IORG 並未指其受境外指使或受酬。",
      "indicators": [
        "言論遭中共官媒抖音頻道引用放大"
      ],
      "active_since": "1990s",
      "sensitivity": "domestic-named",
      "related": [],
      "event_ids": [
        "joint-sword-2024",
        "ccp-taiwan-reps-2025"
      ],
      "source_ids": [
        "src-iorg-101",
        "src-iorg-136"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "🇨🇳 🇹🇼-🇨🇳 YT 4 月 15 日 21:09 微博帳號「紫金山上听风吟」發文，宣稱「我东部战区视频公开那是解放军隐形战机飞过台湾上空，那是 J20 音爆声音」，文章同時包含 4 月 13 日唐湘龍在 YouTube 頻道「飛碟聯播網」節目影片的剪輯片段。",
          "source_id": "src-iorg-41",
          "about": "唐湘龍"
        },
        {
          "text": "1 月份共有 293 則文本提及蔡正元，主要內容為借蔡正元介入「三中案」批評民進黨政府「编织罪名」（中国新闻社）、「政治追杀异己」（中国东南卫视官方频道）、讓唐湘龍「当场抹泪」（中国东南卫视官方频道），並放大蔡正元對此事件觀點「哪怕深陷狱中，反“台独” 立场永不改变」（中国新闻社）、「我们要在每一个角落作战，推翻民进党」（中国东南卫视官方频道）。",
          "source_id": "src-iorg-131",
          "about": "唐湘龍"
        }
      ]
    },
    {
      "id": "chiu-yi",
      "name_zh": "邱毅",
      "name_en": "Chiu Yi",
      "aliases": [
        "Chiu Yi"
      ],
      "category": "commentator",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣政論名嘴、前立法委員，現多在中國大陸活動。",
      "description_zh": "在 IORG 週報第 136 期（2025 年中共官宣影片裡的「台灣代表」，2026.4.17，排名第 14）及週報第 101 期（國防失敗論名嘴名單）與多期中共月報中，邱毅被列為其言論遭中共官媒抖音頻道引用、放大的台灣政論人物之一。框架為中性引用，IORG 並未指其受境外指使或受酬。",
      "indicators": [
        "言論遭中共官媒抖音頻道引用放大",
        "IORG 週報136「台灣代表」排名第14"
      ],
      "active_since": "2000s",
      "sensitivity": "domestic-named",
      "related": [],
      "event_ids": [
        "joint-sword-2024",
        "ccp-taiwan-reps-2025"
      ],
      "source_ids": [
        "src-iorg-101",
        "src-iorg-136"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "In October 2023, Chiu Yi mentioned the alleged illegitimate child again during a live broadcast with Taiwanese influencer Bit King.",
          "source_id": "src-dtl-multiverse",
          "about": "Chiu Yi"
        },
        {
          "text": "On January 3, Hong Kong’s Wen Wei Po quoted Chiu Yi’s remarks, mentioning Lai Ching-te’s mistress and illegitimate child.",
          "source_id": "src-dtl-multiverse",
          "about": "Chiu Yi"
        },
        {
          "text": "1 月 20 日，🇨🇳 福建广播影视「中国东南卫视官方频道」發布 YouTube，標題為「台湾中天记者林宸佑遭民进党当局羁押，邱毅：杀鸡儆猴，赖清德要对台湾媒体动屠刀了」。",
          "source_id": "src-iorg-131",
          "about": "邱毅"
        }
      ]
    },
    {
      "id": "yuan-chu-cheng",
      "name_zh": "苑舉正",
      "name_en": "Yuan Chu-cheng",
      "aliases": [
        "Yuan Chu-cheng"
      ],
      "category": "commentator",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣國立臺灣大學哲學系教授、政論評論者。",
      "description_zh": "在 IORG 週報第 136 期（2025 年中共官宣影片裡的「台灣代表」，2026.4.17，排名第 12）及中共月報中，苑舉正被列為其言論遭中共官媒（含央視）引用、放大的台灣評論人物之一。框架為中性引用，IORG 並未指其受境外指使或受酬。",
      "indicators": [
        "言論遭中共官媒引用放大",
        "IORG 週報136「台灣代表」排名第12"
      ],
      "active_since": "2010s",
      "sensitivity": "domestic-named",
      "related": [],
      "event_ids": [
        "ccp-taiwan-reps-2025"
      ],
      "source_ids": [
        "src-iorg-136",
        "src-iorg-139"
      ],
      "confidence": "high"
    },
    {
      "id": "cmg-cctv",
      "name_zh": "中央廣播電視總台",
      "name_en": "China Media Group (CCTV/CMG)",
      "aliases": [
        "央視",
        "央視網",
        "央視新聞",
        "CCTV",
        "CGTN",
        "央廣軍事",
        "看台海",
        "日月譚天",
        "China Media Group (CCTV/CMG)",
        "China Media Group",
        "CMG",
        "央广军事",
        "央视新闻",
        "央视网",
        "CCTV News",
        "海峽飛虹",
        "海峡飞虹"
      ],
      "category": "state-media",
      "role": "collaborator",
      "origin": "PRC",
      "summary_zh": "中國國家級廣電機構，旗下含央視（CCTV）、CGTN、玉淵譚天、看台海、日月譚天等品牌。",
      "description_zh": "IORG 在 2023 年度報告、週報第 101 期、第 118 期、第 136 期及多期中共月報中，將中央廣播電視總台旗下品牌（央視、CGTN、玉淵譚天、看台海、日月譚天、央廣軍事等）列為對台散布疑美論、國防失敗論、台灣民主失敗論等敘事，並引用台灣政論人物言論的核心官媒平台。",
      "indicators": [
        "旗下抖音頻道引用台灣名嘴『以台批台』",
        "玉淵譚天/看台海/日月譚天為涉台子品牌"
      ],
      "active_since": "2018",
      "related": [
        {
          "target_id": "yuyuantantian",
          "relation": "runs",
          "note": "玉淵譚天為總台/央視旗下涉台品牌"
        },
        {
          "target_id": "cac",
          "relation": "affiliated-with",
          "note": "黨管媒體體系"
        }
      ],
      "event_ids": [
        "joint-sword-2024",
        "election-op-2024",
        "defense-futility-report-2025",
        "democracy-failure-report-118",
        "ccp-taiwan-reps-2025",
        "tw-defeatism-report-2025",
        "satellite-retrocession-2025",
        "butterfly-flood-2025",
        "japan-narrative-2025"
      ],
      "source_ids": [
        "src-iorg-101",
        "src-iorg-118",
        "src-iorg-136",
        "src-factlink-satellite",
        "src-factlink-japan"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "從網絡關係圖可見，東部戰區融媒體中心發動，央視等行動者會運用既有網絡來發動宣傳。",
          "source_id": "src-factlink-a7a795",
          "about": "央視"
        },
        {
          "text": "正義使命軍演是由中共解放軍東部戰區發言人施毅在2025年12月29日早上7點30分宣布開始，由東部戰區、新華社受權發布演訓公告和示意圖，央視亦發布相關新聞。",
          "source_id": "src-factlink-a7a795",
          "about": "央視"
        },
        {
          "text": "內容被其他帳號使用次數較高的行動者：一是東部戰區，二是中國官媒如央視新聞、環球時報、環球網、央廣軍事，三是與官方有關的帳號 (State-Linked)，如新浪軍事、觀察者網。",
          "source_id": "src-factlink-a7a795",
          "about": "央視"
        },
        {
          "text": "透過網絡分析可大致看出宣傳管道順序，第一層由東部戰區發動，並由第二層央視新聞、環球時報、央廣軍事等官媒宣傳，再由第三或第四層的地方公安、地方融媒體、媒體新媒體品牌、高影響力帳號接續放大官方敘事。",
          "source_id": "src-factlink-a7a795",
          "about": "央視"
        },
        {
          "text": "檢視392組文本資料所顯示的指向網絡時可發現，東部戰區發布的貼文，有13個媒體和大V共同轉分享，包括央視新聞、央廣軍事、鎮江民生頻道、央廣軍事、環球時報、浙江日報、澎湃新聞、宣漢融媒、新浪軍事、動静新聞、南湖發布、看看新聞Knews和星話大白等。",
          "source_id": "src-factlink-a7a795",
          "about": "央視"
        },
        {
          "text": "央視新聞發布的13則報導文本，有26個帳號轉發，官方單位有屏山公安、銅陵經開公安在線、山東高法、沐川公安、青春龍泉驛和平安金陽；媒體有動靜新聞、新浪軍事、南寧晚報、錢江晚報、南方週末、頭條新聞、第一現場、馬上資訊、看台海、福建日報、環球時報和新京報；大V有星話大白、包容萬物恆河水、台灣那點事兒、扎西德勒·天珠收藏、椒哥微記錄、航天面面觀、長春-小風、白鶴-老鄧。",
          "source_id": "src-factlink-a7a795",
          "about": "央視"
        },
        {
          "text": "玉淵潭天為央視融媒體品牌，在網絡圖中與央視沒有指向關係，顯示兩個品牌之間分工明確，刻意不轉傳，各自扮演不同角色；《觀察者網》除了作為發布者外，也擴散轉發來自玉淵潭天這類被視為與中國官媒關係緊密的大V的內容。",
          "source_id": "src-factlink-a7a795",
          "about": "央視"
        },
        {
          "text": "在網絡圖雖可見到俄羅斯官媒《今日俄羅斯》微博帳號，但沒有看到固定的轉發群組，在對台軍演未見扮演凸顯的特定角色，發文主要是轉分享央視新聞、綜整中共官方訊息。",
          "source_id": "src-factlink-a7a795",
          "about": "央視"
        },
        {
          "text": "除了東部戰區發言人的官宣之外，央視、環球時報、新華社等特定官媒採訪中共特定軍事專家來點評演習，是演習畫面尚未製播之前的關鍵宣傳素材。",
          "source_id": "src-factlink-a7a795",
          "about": "央視"
        },
        {
          "text": "央視在2025年12月29日晚間7點新聞聯播時，於新聞播報中穿插「無人機拍攝到台北101」畫面。",
          "source_id": "src-factlink-a7a795",
          "about": "央視"
        },
        {
          "text": "當晚7-9點之間，中國軍號、央視新聞、東部戰區、多社群平台眾多帳號等也共同發動此主題。",
          "source_id": "src-factlink-a7a795",
          "about": "央視"
        },
        {
          "text": "資安院分析師戴毓辰協助比對上述文本的「台北101」影像，這四種文本影像疊合後完全相符，觀測到文本畫面左下的時間秒數，不同文本顯示的秒數略有不同，可推測東部戰區、央視、中國軍號等三個主要行動者，透過早已炮製的「共同素材」，自行加工與發揮為宣傳影像。",
          "source_id": "src-factlink-a7a795",
          "about": "央視"
        },
        {
          "text": "東部戰區融媒體所製作的「演習畫面」素材，提供給央視、人民日報、中國軍號、環球日報等媒體使用，素材會同步打上「東部戰區」藍白符號。",
          "source_id": "src-factlink-a7a795",
          "about": "央視"
        },
        {
          "text": "央視除了發布東部戰區融媒體的素材，另外以專家專訪點評、新聞聯播等節目，提供宣傳支援，成為被轉發次數最高的引用者。",
          "source_id": "src-factlink-a7a795",
          "about": "央視"
        },
        {
          "text": "央視當晚的新聞聯播則為習近平新年賀詞，軍事新聞關注的是慶賀解放軍報70週年、香港部隊人事訊息、火箭軍建軍十週年等無關對台軍演訊息，翌日為元旦，並沒有對台軍演的相關訊息。",
          "source_id": "src-factlink-a7a795",
          "about": "央視"
        },
        {
          "text": "依據文本相似性資料、關係網絡分析來確認主要行動者，包括：東部戰區；軍方媒體如中國軍號、解放軍報；中央官媒如新華社、央視、央視軍事、人民日報、央廣軍事；以及與對台議題高度相關的福建媒體，如看台海、台海時刻，另亦納入引用次數較高的觀察者網。",
          "source_id": "src-factlink-a7a795",
          "about": "央廣軍事"
        },
        {
          "text": "Chinese mainland urges DPP authorities not to jeopardize Taiwan’s economy CGTN The U.S.",
          "source_id": "src-aspi-strait",
          "about": "CGTN"
        },
        {
          "text": "A final category of political content disseminated by PAPERWALL often takes the form of verbatim reposts of content from Chinese state media, such as CGTN or the Global Times.",
          "source_id": "src-citizenlab-paperwall",
          "about": "CGTN"
        },
        {
          "text": "15, the topic #統一有好處台獨是絕路# (Unification has benefits and Taiwan independence is a dead end) appeared, primarily hosted by state media CCTV News.",
          "source_id": "src-dtl-2022election",
          "about": "CCTV News"
        },
        {
          "text": "FactLink觀察到，此事件有兩波訊息傳播高峰，第一波是10月26日至10月29日，中國官方相關媒體如《觀察者網》、《環球網》、《環球時報》、《人民日報》、《央視軍事》、《海峽之聲》、《看台海》報導與其微博官方帳號，引用長光衛星公司衛星影像，「慶祝台灣回歸為中國一部分」的光復節。",
          "source_id": "src-factlink-satellite",
          "about": "《看台海》"
        },
        {
          "text": "檢視「島內輿論」這波主題，中國官方媒體家數雖多，但內容來源單一，不同媒體之間交互引用，內容主要來自新華社旗下的微博帳號《參考消息》報導〈島內網友熱議衛星視角下瞰中國台灣省〉，此報導除了引述台灣媒體，更取材特定媒體報導的網友留言，製造「島內輿論」高度熱議、高度讚嘆中國科技進步的風向，獲得《央廣軍事》和《環球時報》等媒體轉分享。",
          "source_id": "src-factlink-satellite",
          "about": "《央廣軍事》"
        },
        {
          "text": "11月1日高市早苗與林信義在APEC會議見面後，中國外交部首先極快提出抗議，北京日報、央視、中國新聞網等官媒也迅速轉發外交部意見。",
          "source_id": "src-factlink-japan",
          "about": "央視"
        },
        {
          "text": "中央官媒如央視、新華社等，呼應官方敘事，例如「高市早苗讓日本承擔代價」，「高市早苗要明白中國人民惹不得」；而地方官媒如北京日報、以及常與官媒呼應的香港媒體如鳳凰網，以及時政大V帳號則在既有敘事基礎上進一步加油添醋、強化情緒性語言與陰謀論式解讀，使訊息更具戲劇性與傳播力。",
          "source_id": "src-factlink-japan",
          "about": "央視"
        },
        {
          "text": "但央視則由自媒體品牌「玉淵譚天」在微博發表，製作影片，以更辛辣的詞彙宣傳，號稱中方穿著的五四青年服，正與百年前五四青年抗議日本，要求「還我青島」時的穿著相同。",
          "source_id": "src-factlink-japan",
          "about": "央視"
        },
        {
          "text": "換言之，對於央視官方不便言說的激烈言詞，就由小號代言。",
          "source_id": "src-factlink-japan",
          "about": "央視"
        },
        {
          "text": "在2025年11月至12月初攻擊高市早苗與其言行的貼文中，官媒帳號如北京晚報、環球時報、中國新聞網、央視網，以及作為中國官方喉舌的民營媒體觀察者網及時政評論大V，以「日本軍國主義意圖對外擴張」為宣傳主旋律。",
          "source_id": "src-factlink-japan",
          "about": "央視"
        },
        {
          "text": "比如央視網評論日本自衛隊往西南轉移，是「右翼勢力妄圖以新型軍國主義介入台海事務」。",
          "source_id": "src-factlink-japan",
          "about": "央視"
        },
        {
          "text": "像是央視網發文聲稱，「既然高市拿台灣”搞事”，#是時候談談琉球問題了#」。",
          "source_id": "src-factlink-japan",
          "about": "央視"
        },
        {
          "text": "有些帳號已經公開其官媒身分，例如央視的「玉淵譚天」。",
          "source_id": "src-factlink-japan",
          "about": "央視"
        },
        {
          "text": "此外，央視網以及央視的對台融媒體平台「看台海」的發文數量也在發文帳號前十名之列。",
          "source_id": "src-factlink-japan",
          "about": "央視網"
        },
        {
          "text": "🇹🇼-🇨🇳 2025 年 6 月 11-12 日間「中国台湾网」、「海峡飞虹」、「海峡之声」先後引述 6 月 11 日「黨外在野大聯盟」成立大會上召集人 國民黨 鄭麗文的發言：「当下岛内的执政党逐渐走向法西斯化、沙文主义化，大家忧心不已，因此希望联结、团结所有“在野”力量」。",
          "source_id": "src-iorg-118",
          "about": "海峡飞虹"
        },
        {
          "text": "同時，影片數量前 20 的頻道，有 6 個內容親近中國的頻道，包括中共官媒內容、中國網路節目、中共官媒，其中，「中国人民解放军」、「军迷天下」、「看看新闻」3 個頻道未能確認為中共官媒，但直接協助傳播央視影片及其他中共官媒內容，請讀者特別注意。",
          "source_id": "src-iorg-41",
          "about": "央視"
        },
        {
          "text": "「中国东南卫视」是中共官媒，曾出現在 IORG 報告之中 DA.39 ，「中国人民解放军」、「军迷天下」、「看看新闻」是以非官方狀態直接協助傳播央視影片及其他中共官媒內容，而「兵鉴堂」、「军武侦察兵」則是中國網路節目，內容亦親近中國。",
          "source_id": "src-iorg-41",
          "about": "央視"
        },
        {
          "text": "4 月 14 日 「亞洲事實查核實驗室」發布查核報告，研究發現「軍演期間不實消息充斥媒體和社交平台 [...] 似乎意圖放大恐懼，使台灣民眾相信中國的軍演意味著侵台迫在眉睫」，並認為由央視主動發布的影片「恐嚇意味濃」。",
          "source_id": "src-iorg-41",
          "about": "央視"
        },
        {
          "text": "當日 09:47 至 14:44，中共官媒「海峽之聲」「中國台灣網」「央視網」持續發布報導傳播該影片。",
          "source_id": "src-iorg-41",
          "about": "央視"
        },
        {
          "text": "當日 10:19 至 14:06 間，中共官媒「環球網」「台海網」「鳳凰網」「澎湃新聞」「央視網」及官媒微博帳號「环球时报」「海外网」「环球网」「小央视频」「香港中通社」「中国新闻网」「厦门广电」「海峡导报」「中国新闻社」多使用相同「天氣晴朗」圖片，協力傳播中時報導內容。",
          "source_id": "src-iorg-41",
          "about": "央視"
        },
        {
          "text": "🇨🇳 4 月 9 日 14:03 中共官媒微博帳號「央广军事」發布由「东部战区融媒体中心」製作的「东部战区多军兵种模拟联合精确打击演示动画」影片，內容為解放軍透過陸、海、空部隊使用飛彈攻擊台灣周遭海域及臺北、高雄的模擬畫面，是 IORG 資料庫中首則相關文本。",
          "source_id": "src-iorg-41",
          "about": "央广军事"
        },
        {
          "text": "借台美關稅談判批評其「舔美卖台」（海峡飞虹）、「“巨款换关税”遭岛内痛批」（中国台湾网）同時放大 民眾黨 立院黨團批評民進黨政府「挟洋自重」說法（凤凰网）。",
          "source_id": "src-iorg-131",
          "about": "海峡飞虹"
        },
        {
          "text": "1 月 30 日，🇨🇳 广电总台「海峡飞虹」發布來自 🇨🇳 中国新闻社「中新社」的文章「国共机制化交流重启 台专家指“符合多数人的期盼”」，內文包含「“国共两党智库论坛”2 月 3 日将在北京举行。",
          "source_id": "src-iorg-131",
          "about": "海峡飞虹"
        },
        {
          "text": "5-6 日，有 6 個中共官媒微博帳號發布含有相同內容文本，包含 🇨🇳 广电总台「看台海」、🇨🇳 福建日报「福建东南网」。",
          "source_id": "src-iorg-131",
          "about": "看台海"
        },
        {
          "text": "1 月 12 日，🇨🇳 广电总台「看台海」發布微博，影片內容為 1 月 11 日 旺中「中天新聞」政論節目「辣晚報」中名嘴郭正亮的發言「2 個人（指蔡正元、柯文哲）都受到監控之中，都是被司法迫害的人士」，文字內容包含「柯文哲、蔡正元同框，一起秀出“电子脚镣” 尽显#台湾司法迫害黑暗#」。",
          "source_id": "src-iorg-131",
          "about": "看台海"
        },
        {
          "text": "28 日，有 35 個中共官媒微博帳號發布含有相同內容文本，包含 🇨🇳 国务院「新华社」、🇨🇳 广电总台「央视新闻」。",
          "source_id": "src-iorg-131",
          "about": "央视新闻"
        },
        {
          "text": "This was most clearly on show in an exchange between a CCTV journalist and Director of the Information Bureau of the Taiwan Affairs Office (TAO) of the State Council Chen Binhua (陈斌华).",
          "source_id": "src-jamestown-js2024b",
          "about": "CCTV"
        },
        {
          "text": "The latter phrase, for instance, likely first appeared in a 2019 speech by Xi Jinping (VOA, January 3, 2019; Mainland Affairs Council, May 29, 2019; CCTV News, May 28).",
          "source_id": "src-jamestown-js2024b",
          "about": "CCTV"
        },
        {
          "text": "關於裴洛西訪台，中共官媒發起並參與多項論述傳播，央視更公開報導宣揚其旗下品牌「玉渊谭天」「協同」中央廣電總台「影響中國國內海外輿論」 DA.28；關於麥卡錫訪台的 10 項論述則多出自台灣，中共官媒多引用台灣新聞媒體社論、特定名嘴（如郭正亮、蔡正元、介文汲）、政治人物（如楊永明）及其他可信度不一的評論，擴大傳播。",
          "source_id": "src-iorg-38",
          "about": "央視"
        },
        {
          "text": "隔日，中共官媒「中國台灣網」「鳳凰網」「台海網」「海峽飛虹」及「海峽之聲」以「根据岛内公布的一份最新民调」協力傳播相同內容，以網路投票結果代表台灣民眾全體意見。",
          "source_id": "src-iorg-38",
          "about": "海峽飛虹"
        }
      ]
    },
    {
      "id": "kankan-news",
      "name_zh": "看看新聞",
      "name_en": "Kankan News (Knews)",
      "aliases": [
        "看看新聞Knews",
        "Knews",
        "上海文化廣播影視集團",
        "Kankan News (Knews)",
        "看看新闻",
        "看看新闻 Knews"
      ],
      "category": "state-media",
      "role": "collaborator",
      "origin": "PRC",
      "summary_zh": "上海文化廣播影視集團（SMG）旗下新媒體品牌。",
      "description_zh": "IORG 在週報第 136 期（2026.4.17）及中共月報第 131 期中，將看看新聞（Knews）列為引用台灣政論人物言論、散布相關涉台敘事的中國地方官媒之一。",
      "indicators": [
        "上海地方官媒",
        "引用台灣名嘴相關言論"
      ],
      "active_since": "2014",
      "related": [],
      "event_ids": [
        "ccp-taiwan-reps-2025"
      ],
      "source_ids": [
        "src-iorg-136",
        "src-iorg-131"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "同時，影片數量前 20 的頻道，有 6 個內容親近中國的頻道，包括中共官媒內容、中國網路節目、中共官媒，其中，「中国人民解放军」、「军迷天下」、「看看新闻」3 個頻道未能確認為中共官媒，但直接協助傳播央視影片及其他中共官媒內容，請讀者特別注意。",
          "source_id": "src-iorg-41",
          "about": "看看新闻"
        },
        {
          "text": "「中国东南卫视」是中共官媒，曾出現在 IORG 報告之中 DA.39 ，「中国人民解放军」、「军迷天下」、「看看新闻」是以非官方狀態直接協助傳播央視影片及其他中共官媒內容，而「兵鉴堂」、「军武侦察兵」則是中國網路節目，內容亦親近中國。",
          "source_id": "src-iorg-41",
          "about": "看看新闻"
        },
        {
          "text": "IORG 暫時無法確認 YouTube 頻道「看看新闻」是否為中共官媒。",
          "source_id": "src-iorg-41",
          "about": "看看新闻"
        },
        {
          "text": "中共官媒上海廣播電視台旗下有名稱和帳號大頭照相同的節目「看看新闻」，同時，YouTube 頻道「看看新闻」的頻道介紹之中亦連結至中共陝西省委及陜西省政府官媒「西部決策」，由於身分衝突，IORG 暫時無法確認「看看新闻」的分類。",
          "source_id": "src-iorg-41",
          "about": "看看新闻"
        }
      ]
    },
    {
      "id": "china-taiwan-net",
      "name_zh": "中國台灣網",
      "name_en": "China Taiwan Net",
      "aliases": [
        "taiwan.cn",
        "China Taiwan Net",
        "中国台湾网"
      ],
      "category": "state-media",
      "role": "collaborator",
      "origin": "PRC",
      "summary_zh": "國台辦主管的涉台官方網站。",
      "description_zh": "IORG 在週報第 101 期、第 118 期、第 136 期及幾乎每期中共月報中，將中國台灣網列為國台辦口徑對台宣傳、散布疑美論／國防失敗論／民主失敗論等敘事的主要官方平台。",
      "indicators": [
        "國台辦主管官方網站",
        "對台宣傳主要平台"
      ],
      "active_since": "1999",
      "related": [
        {
          "target_id": "tao",
          "relation": "operated-by",
          "note": "國台辦主管"
        }
      ],
      "event_ids": [
        "joint-sword-2024",
        "election-op-2024",
        "democracy-failure-report-118",
        "tw-defeatism-report-2025"
      ],
      "source_ids": [
        "src-iorg-101",
        "src-iorg-118",
        "src-iorg-136"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "🇨🇳 2024 年 1 月 13 日台灣總統大選投票日， 🇨🇳 国台办「中国台湾网」發表署名「王杰」的「社会政治文化变迁与台湾选举」一文回顧台灣政治與選舉變遷。",
          "source_id": "src-iorg-118",
          "about": "中国台湾网"
        },
        {
          "text": "🇨🇳 2024 年 8 月 7 日 🇨🇳 国台办「中国台湾网」評論賴清德資政、國正顧問名單的文章中，批評「赖清德吃相难看，想做民选皇帝」。",
          "source_id": "src-iorg-118",
          "about": "中国台湾网"
        },
        {
          "text": "🇹🇼-🇨🇳 2024 年 12 月 31 日 🇨🇳 国台办「中国台湾网」報導引用國民黨「回顧賴清德2024執政十大亂象」，內容涵蓋內閣表現、罷免謝國樑、戒嚴發言爭議（TEAM 戒嚴）、房價、打詐、政治人物貪污等面向。",
          "source_id": "src-iorg-118",
          "about": "中国台湾网"
        },
        {
          "text": "🇹🇼-🇨🇳 2024 年 12 月 31 日 🇨🇳 国台办「中国台湾网」抖音上傳影片，標題為「扭曲的台湾民主 “民主教”」。",
          "source_id": "src-iorg-118",
          "about": "中国台湾网"
        },
        {
          "text": "🇹🇼-🇨🇳 2024 年 12 月 31 日 🇨🇳 国台办「中国台湾网」報導引用 國民黨 國民黨「回顧賴清德2024執政十大亂象」，並針對民進黨評論韓國宣布戒嚴的發文爭議，評論為「让台湾的“民主形象”沦为笑话」。",
          "source_id": "src-iorg-118",
          "about": "中国台湾网"
        },
        {
          "text": "🇨🇳 2025 年 6 月 24 日 🇨🇳 国台办「中国台湾网」以「台独就是有害垃圾！",
          "source_id": "src-iorg-118",
          "about": "中国台湾网"
        },
        {
          "text": "🇨🇳 2025 年 3 月 14 日 🇨🇳 国台办「中国台湾网」發表標題為「赖清德宣布全面紧缩两岸交流 岛内舆论批不如直接宣布戒严！」",
          "source_id": "src-iorg-118",
          "about": "中国台湾网"
        },
        {
          "text": "🇨🇳 2025 年 6 月 24 日 🇨🇳 国台办「中国台湾网」發表評論文章，內容稱賴清德「将两岸商机扭曲为“台湾危机”」「将两岸正常交往交流活动以及台商台企经济合作项目通通划入所谓“统战威胁”」，並以「賴 17 條」「威胁参与两岸互动的台商、台企、台青、台生，给支持两岸和平发展的岛内政党、团体及各界人士扣上所谓“在地协力者”的“帽子”」。",
          "source_id": "src-iorg-118",
          "about": "中国台湾网"
        },
        {
          "text": "🇹🇼-🇨🇳 2025 年 6 月 11-12 日間「中国台湾网」、「海峡飞虹」、「海峡之声」先後引述 6 月 11 日「黨外在野大聯盟」成立大會上召集人 國民黨 鄭麗文的發言：「当下岛内的执政党逐渐走向法西斯化、沙文主义化，大家忧心不已，因此希望联结、团结所有“在野”力量」。",
          "source_id": "src-iorg-118",
          "about": "中国台湾网"
        },
        {
          "text": "實際案例包括：15 日中共官媒環球網、17 日中國外交部發言人華春瑩、18 日中國外交部發言人趙立堅、20 日中共官媒環球網總編胡锡进的發言、24 日中國外交部發言人汪文斌、28 日國台辦轄下「中國台灣網」針對美國艦隊通過台灣海峽的回應。",
          "source_id": "src-iorg-11",
          "about": "中國台灣網"
        },
        {
          "text": "8 月 28 日，國台辦轄下「中國台灣網」發文，譴責美國艦隊通過台灣海峽是挑釁中國。",
          "source_id": "src-iorg-11",
          "about": "中國台灣網"
        },
        {
          "text": "當日 09:47 至 14:44，中共官媒「海峽之聲」「中國台灣網」「央視網」持續發布報導傳播該影片。",
          "source_id": "src-iorg-41",
          "about": "中國台灣網"
        },
        {
          "text": "借台美關稅談判批評其「舔美卖台」（海峡飞虹）、「“巨款换关税”遭岛内痛批」（中国台湾网）同時放大 民眾黨 立院黨團批評民進黨政府「挟洋自重」說法（凤凰网）。",
          "source_id": "src-iorg-131",
          "about": "中国台湾网"
        },
        {
          "text": "1 月 13 日，🇨🇳 国台办「中国台湾网」發布文本「郑丽文批民进党当局滥用司法：台湾之耻辱」，內文包含「据台媒报道，台湾民众党前主席柯文哲、中国国民党前台北市党部主委黄吕锦茹及前民代蔡正元均因涉案被强制佩戴电子脚镣，而民进党籍涉贪人士郑文灿却未受该“待遇”。",
          "source_id": "src-iorg-131",
          "about": "中国台湾网"
        },
        {
          "text": "1 月 27 日，🇨🇳 国台办「中国台湾网」發布文本「从“台北101”到“台湾101”：民进党“地标碰瓷”背后尽显治理失能」，內文包含「美国攀岩运动家艾力克斯·霍诺德（Alex Honnold）25 日挑战徒手攀登“台北 101”大楼并成功登顶，引发关注。",
          "source_id": "src-iorg-131",
          "about": "中国台湾网"
        },
        {
          "text": "1 月 14 日，🇨🇳 国台办「中国台湾网」發布文本「“青提”风波背后：民进党“文字猎巫”的“抗中”意识形态困局」，內文包含「这一荒诞事件再次暴露绿营长期操弄“抗中反中”意识形态、将日常事务泛政治化的深层乱象，引发岛内舆论对“绿色恐怖”蔓延的担忧」、「实际上，随着两岸文化交流合作的深入，许多大陆用语早已成为台湾民众沟通中的日常。",
          "source_id": "src-iorg-131",
          "about": "中国台湾网"
        },
        {
          "text": "島內網民 2 月 3 日中共官媒「中國台灣網」以標題「打脸！",
          "source_id": "src-iorg-38",
          "about": "中國台灣網"
        },
        {
          "text": "島內網民 2 月 3 日 17:26 中共官媒「中國台灣網」以標題〈“疑美”才是真民意，“倚美”只能沦为真棋子！",
          "source_id": "src-iorg-38",
          "about": "中國台灣網"
        },
        {
          "text": "隔日，中共官媒「中國台灣網」「鳳凰網」「台海網」「海峽飛虹」及「海峽之聲」以「根据岛内公布的一份最新民调」協力傳播相同內容，以網路投票結果代表台灣民眾全體意見。",
          "source_id": "src-iorg-38",
          "about": "中國台灣網"
        }
      ]
    },
    {
      "id": "durinbridge",
      "name_zh": "DURINBRIDGE",
      "name_en": "DURINBRIDGE",
      "aliases": [],
      "category": "content-farm",
      "role": "collaborator",
      "origin": "PRC",
      "summary_zh": "Google GLASSBRIDGE 命名的科技與行銷公司（旗下有多個子公司），經營逾 200 個網站。Google 明確指其『本身不是 IO 行為者』，而是代客戶／夥伴發布 IO 內容。",
      "description_zh": "Google GLASSBRIDGE（2024/11/23）指 DURINBRIDGE 託管了《蔡英文秘史》文章，以及『DRAGONBRIDGE 在台灣總統大選前推廣的賴清德相關敘事』。Google 評估其為商業內容散布商而非 IO 主使者。",
      "indicators": [
        "逾 200 個網站",
        "託管《蔡英文秘史》與賴清德敘事文章"
      ],
      "active_since": "",
      "related": [
        {
          "target_id": "spamouflage",
          "relation": "affiliated-with",
          "note": "GLASSBRIDGE：發布 DRAGONBRIDGE 推廣的台灣選舉敘事；Google 指 DURINBRIDGE 本身非 IO 主使者"
        }
      ],
      "event_ids": [
        "glassbridge-takedown-2024"
      ],
      "source_ids": [
        "src-google-glassbridge"
      ],
      "confidence": "high"
    },
    {
      "id": "green-cicada",
      "name_zh": "綠蟬網絡",
      "name_en": "Green Cicada Network",
      "aliases": [
        "Green Cicada",
        "Green Cicada Network"
      ],
      "category": "cib-network",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "由 CyberCX 情報於 2024 年 8 月揭露的 AI／大型語言模型驅動 X 機器人網絡，至少 5,000 個假帳號『幾乎確定由一套 AI LLM 系統協同操控』。",
      "description_zh": "CyberCX 指該網絡『與中國高度相關，包括很可能使用中文 LLM 系統，並連結至一名清華大學暨智譜 AI（Zhipu AI）相關的 AI 研究者』。歸因為強關聯而非確認的國家歸因。主攻美國政治議題，並及澳、英、西歐、印度、日本；未明確發現針對台灣，故以低信心、PRC 來源 cib 網絡收錄供脈絡。",
      "indicators": [
        "至少 5,000 個假 X 帳號（AI LLM 協同操控）",
        "2024/07 起活動激增",
        "連結清華大學暨智譜 AI 相關研究者"
      ],
      "active_since": "2024",
      "related": [],
      "event_ids": [],
      "source_ids": [
        "src-cybercx-cicada"
      ],
      "confidence": "low"
    },
    {
      "id": "etc-fusion-media",
      "name_zh": "東部戰區融媒體中心",
      "name_en": "Eastern Theater Command Fusion-Media Center",
      "aliases": [
        "東部戰區",
        "Eastern Theater Command",
        "東部戰區融媒體",
        "Eastern Theater Command Fusion-Media Center",
        "東部戰區融媒體中心帳號",
        "东部战区",
        "东部战区融媒体中心"
      ],
      "category": "state-media",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "解放軍東部戰區的融媒體宣傳中樞，以「中央廚房」模式統一供稿給官媒、自媒體與網路帳號，放大對台軍演威懾敘事。",
      "description_zh": "FactLink 與台灣民主實驗室分析「正義使命-2025」軍演（2025/12/29–31）期間逾 6,700 筆微博資料，揭露東部戰區融媒體中心作為對台宣傳網絡的核心節點，以「中央廚房」模式統一產製與分發素材，跨微博、Threads 等平台協同放大，核心敘事包含偽稱無人機俯拍台北101大樓的恫嚇影像。",
      "indicators": [
        "FactLink/DTL 分析逾 6,700 筆軍演微博資料（2025/12/29–31）",
        "以『中央廚房』模式統一供稿官媒／自媒體／網路帳號",
        "核心敘事：無人機俯拍台北101恫嚇影像"
      ],
      "active_since": "2025",
      "related": [
        {
          "target_id": "pla-pwd",
          "relation": "affiliated-with",
          "note": "同屬解放軍對台政治／心理作戰體系"
        },
        {
          "target_id": "cmg-cctv",
          "relation": "linked-to",
          "note": "『中央廚房』供稿予官媒體系分發"
        }
      ],
      "event_ids": [
        "just-mission-2025"
      ],
      "source_ids": [
        "src-factlink-pla"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "在軍演中，除了軍事作戰單位發動演練外，東部戰區融媒體中心更發動「資訊宣傳戰」。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "FactLink和Doublethink Lab研究團隊（以下稱研究團隊），透過「正義使命」軍演，掌握解放軍如何發動軍演中的資訊宣傳戰，並試圖解析被外界稱為「中央廚房」素材的東部戰區融媒體中心機制。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "觀察1：軍演的宣傳，是東部戰區融媒體中心是透過官媒、地方媒體、社群帳號等不同行動者組成的宣傳網絡發動。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "從網絡關係圖可見，東部戰區融媒體中心發動，央視等行動者會運用既有網絡來發動宣傳。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "觀察3：東部戰區融媒體中心在正義使命軍演，以「無人機拍攝到台北101」影像為宣傳攻擊主力，以「易懂」話題恫嚇民心，而對軍事專家來說，這段影像不具威懾力，更缺乏情資價值。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "進入2023年，時任總統蔡英文、副總統賴清德外訪期間時，中共皆發動軍演施壓；2024年後，東部戰區融媒體中心開始主責軍演宣傳工作，並為演習命名，除有一次未命名軍演外，另發動聯合利劍A、聯合利劍B軍演，2025年則有海峽雷霆2025-A以及正義使命。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "東部戰區融媒體中心是政治工作單位，任務是結合傳統媒體、自媒體和新媒體來發動宣傳。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "東部戰區融媒體中心從2024年聯合利劍A、B軍演以來，明顯主導軍演期間的宣傳與輿論工作。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "國防大學新聞系教授傅文成觀察，過去一般是由總政治部加上解放軍信息支援部執行宣傳，東部戰區融媒體中心主責宣傳，宣傳工作比過去更能貼近台灣脈絡，操作也更精密、細膩。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "東部戰區融媒體中心被外界稱為「中央廚房」，本研究透過「正義使命」軍演的宣傳網絡分析與敘事時序分析，以拆解「東部戰區融媒體中心」如何發動正義使命宣傳工作，讓我們來看這個所謂「中央廚房」的上菜機制。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "為了解析東部戰區融媒體中心的「中央廚房」宣傳網絡，研究團隊觀察到軍演期間的宣傳文本和主題有高度相似性，首先將收集來的貼文或影片說明資料共6,747筆，做相似性比對，方法是 將文字轉為向量，再設定以相似性0.8為閾值，高於0.8者 便分類成同一組，並排除與軍演無關內容，最後可得到392組文本，再進一步檢視傳播同一組文本的帳號。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "東部戰區融媒體中心扮演「中央廚房」，推出正義之箭、正義之盾、正義之錘、正義之馬等主題海報，推出AI短影片、搭配海報主題的歷次演習畫面，在當日演習畫面尚未傳回之前，用以遞補宣傳檔期。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "國防大學新聞系教授傅文成觀察，東部戰區融媒體中心發動軍演宣傳時，會挑選特定敘事主題作為宣傳的主力攻擊，主力攻擊敘事可見從中央官媒、地方媒體到社群的不同行動者齊力發動。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "從過去經驗也可推測，東部戰區融媒體中心在軍演前已透過協調會議，做好設定攻擊敘事主題來做協同發動。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "然而，並非東部戰區融媒體中心的每則素材或發文都被全力推播。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "研究團隊採訪國防安全研究院研究員沈明室、關注解放軍公開情報圖資的溫約瑟均指出，這段影像不具有軍事情資威脅，但卻顯示出東部戰區融媒體中心在決定「宣傳攻擊」敘事時，看中的是恫嚇威脅民眾的政治宣傳效果。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "東部戰區融媒體中心在第三日發布的是前兩日演習畫面和「沙場風雨兩岸燈」MV，解放軍報刊登的是12月30日於福州平潭拍攝的遠程火箭砲實彈射擊照片集與文字報導。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "東部戰區融媒體中心作為政治工作的宣傳單位，亦在當中操練宣傳戰、輿論戰，以發揮對台的威懾作用，企圖弱化台灣民眾抵抗意志，並宣示軍事威脅行動的合法性。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "本研究以正義使命軍演為案例，嘗試拆解東部戰區融媒體中心的軍演敘事劇本，掌握融媒體中心如何透過與中央官媒、地方媒體、新媒體、社群帳號協力，以及挑選特定的敘事，對台灣民眾發動恫嚇，並對大陸民眾操弄民族情緒，以支持解放軍的演習動員。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "東部戰區融媒體中心的「宣傳」敘事觀點，有其政治宣傳目的。",
          "source_id": "src-factlink-a7a795",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "研究團隊發現，此次軍演宣傳由「東部戰區融媒體中心」擔任「中央廚房」角色，提供素材，再由傳統官媒、自媒體、網路新媒體依照素材發揮，帶動網路輿論。",
          "source_id": "src-factlink-pla",
          "about": "東部戰區融媒體中心"
        },
        {
          "text": "第一篇 6700筆軍演資料揭露 東部戰區融媒體的宣傳網絡全貌，拆解2025年底軍演中的政治宣傳協作機制。",
          "source_id": "src-factlink-pla",
          "about": "東部戰區"
        },
        {
          "text": "研究團隊發現，該段影像是此次軍演的東部戰區的宣傳攻擊主軸。",
          "source_id": "src-factlink-pla",
          "about": "東部戰區"
        },
        {
          "text": "🇨🇳 4 月 9 日 14:03 中共官媒微博帳號「央广军事」發布由「东部战区融媒体中心」製作的「东部战区多军兵种模拟联合精确打击演示动画」影片，內容為解放軍透過陸、海、空部隊使用飛彈攻擊台灣周遭海域及臺北、高雄的模擬畫面，是 IORG 資料庫中首則相關文本。",
          "source_id": "src-iorg-41",
          "about": "东部战区融媒体中心"
        },
        {
          "text": "🇨🇳 4 月 10 日 7:30 微博帳號「东部战区」及 bilibili 帳號「东部战区」 發布一則宣稱由「东部战区融媒体中心」製作的影片「台岛上空的声音」，影片中「轟-6K」的飛行員口述「我已抵達台島北部附近空域」並模擬發射飛彈。",
          "source_id": "src-iorg-41",
          "about": "东部战区融媒体中心"
        },
        {
          "text": "🇨🇳-🇹🇼 4 月 10 日 9:06 台灣新聞媒體鏡傳媒發布報導，內容包含 4 月 9 日 17:41 解放軍東部戰區的微博官方帳號「东部战区」發布相同的動畫影片，當日，聯合新聞網（12:40）、自由時報（16:44）亦跟進報導此動畫影片。",
          "source_id": "src-iorg-41",
          "about": "东部战区"
        },
        {
          "text": "經查在 4 月 6 日至 4 月 10 日解放軍軍演期間，國防部以及 IORG 資料庫中的中共官媒以及微博帳號「东部战区」，並沒有發布任何關於中共在此次軍演期間發射飛彈進入台灣領空的訊息。",
          "source_id": "src-iorg-41",
          "about": "东部战区"
        },
        {
          "text": "🇨🇳 4 月 10 日 22:34 bilibili 帳號「东部战区」發布影片「利剑出鞘！",
          "source_id": "src-iorg-41",
          "about": "东部战区"
        },
        {
          "text": "🇨🇳 🇹🇼-🇨🇳 YT 4 月 15 日 21:09 微博帳號「紫金山上听风吟」發文，宣稱「我东部战区视频公开那是解放军隐形战机飞过台湾上空，那是 J20 音爆声音」，文章同時包含 4 月 13 日唐湘龍在 YouTube 頻道「飛碟聯播網」節目影片的剪輯片段。",
          "source_id": "src-iorg-41",
          "about": "东部战区"
        }
      ]
    },
    {
      "id": "chang-guang-satellite",
      "name_zh": "長光衛星",
      "name_en": "Chang Guang Satellite Technology",
      "aliases": [
        "長光衛星技術",
        "Chang Guang",
        "吉林一號",
        "Chang Guang Satellite Technology"
      ],
      "category": "tech-vendor",
      "role": "collaborator",
      "origin": "PRC",
      "summary_zh": "中國商業遙測衛星公司（吉林一號星系營運者），其拍攝的台灣地標衛星影像被官媒用於光復節對台監控恫嚇宣傳。",
      "description_zh": "FactLink 調查指出，2025/10/25 光復節期間，長光衛星釋出台灣知名地標的衛星影像，經央視、環球、海峽之聲、日月譚天等官媒與駐美使館 X 帳號放大，營造『中國有能力全程監控台灣』的『侵門踏戶』恫嚇敘事。",
      "indicators": [
        "釋出台灣地標衛星影像供官媒對台恫嚇宣傳 (FactLink 2025)"
      ],
      "active_since": "",
      "related": [
        {
          "target_id": "cmg-cctv",
          "relation": "linked-to",
          "note": "影像由央視等官媒分發放大"
        }
      ],
      "event_ids": [
        "satellite-retrocession-2025"
      ],
      "source_ids": [
        "src-factlink-satellite"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "配合著中共對「光復節」的詮釋權定調，帶有中國軍方色彩的中國商業衛星遙測公司「長光衛星」在光復節當公布旗下「吉林一號」衛星拍攝到的台灣衛星影像，以「慶祝」台灣終結日本殖民，回歸中國版圖。",
          "source_id": "src-factlink-satellite",
          "about": "長光衛星"
        },
        {
          "text": "不過，檢視長光衛星公布的衛星影像：阿里山、日月潭、鵝鑾鼻、台北市、台北港、中正紀念堂、基隆河、新竹科學園區，景點遍及全台知名景點，均為非機密的景點。",
          "source_id": "src-factlink-satellite",
          "about": "長光衛星"
        },
        {
          "text": "根據長光衛星公司資料，該公司成立於2014年，由吉林省、中國科學院長春光學精密機械與物理研究所與民間資本合資成立。",
          "source_id": "src-factlink-satellite",
          "about": "長光衛星"
        },
        {
          "text": "中國媒體近期對長光衛星的關注，並非其技術突破，恰好是該公司遲遲未能打開商業市場，虧損擴大，原申請於上海證交所科創板上市，2024年底宣布停止上市，今年的話題之一就是市場揣測長光衛星擬借中國某家上市公司的殼來上市。",
          "source_id": "src-factlink-satellite",
          "about": "長光衛星"
        },
        {
          "text": "此外，根據《金融時報》報導，美國國務院4月指控長光衛星協助葉門胡塞武裝份子，把它列為具中共軍方色彩的制裁清單。",
          "source_id": "src-factlink-satellite",
          "about": "長光衛星"
        },
        {
          "text": "國防安全院中共政軍與作戰概念研究所副研究員舒孝煌說，中共過去在軍演、擾台期間，多半以Google Maps照片等亂湊影像或錯誤資訊，來宣稱解放軍掌握台灣的地理圖資和情報，不過，這次不一樣，是透過民間公司釋出台灣的地理衛星實景照，「長光衛星除了與官方政治宣傳同步應和，當然也有商業行銷目的。」",
          "source_id": "src-factlink-satellite",
          "about": "長光衛星"
        },
        {
          "text": "他指出，長光衛星是趕在台灣首個自主遙測衛星福八衛星發射前夕公布台灣地理圖資，以營造「中國商業民間公司都做得到，解放軍軍方也做得到的宣示」，以長光衛星的圖資來證明解放軍掌握衛星拍攝技術的能力。",
          "source_id": "src-factlink-satellite",
          "about": "長光衛星"
        },
        {
          "text": "長光衛星的動作，自然不單是商業行銷行為，更是代表中共試圖恫嚇台灣的政治宣傳行動，讓台灣民眾和國際社會理解「中國老大哥」正在看著你。",
          "source_id": "src-factlink-satellite",
          "about": "長光衛星"
        },
        {
          "text": "不過，長光衛星此次發布的衛星圖資並非機敏資料，舒孝煌說，長光衛星釋出的衛星圖資，全球商業衛星公司也都能拍攝得到；擅長運用衛星、地理開源工具來研究解放軍的溫約瑟說：「長光衛星公布的是照片，實際上Google Earth就能看得到，沒有什麼好驚奇，甚至引不起我的注意。",
          "source_id": "src-factlink-satellite",
          "about": "長光衛星"
        },
        {
          "text": "FactLink觀察「長光衛星」敘事的傳播路徑和敘事內容，發現此次「長光衛星釋放台灣衛星圖資」的政治宣傳，除了對台在光復節做政治宣示和恫嚇，同時也面向中國內部進行「大內宣」。",
          "source_id": "src-factlink-satellite",
          "about": "長光衛星"
        },
        {
          "text": "更有甚者，中國駐美大使館X帳號刻意貼出長光衛星衛星實景圖，並以「英文」註記「中國台灣」，進一步對國際社會宣示「台灣是中國一部分」。",
          "source_id": "src-factlink-satellite",
          "about": "長光衛星"
        },
        {
          "text": "長光衛星釋出台灣衛星圖資的新聞，除了引發台灣媒體報導，中國在此事件更是對內加大「大內宣」的力度。",
          "source_id": "src-factlink-satellite",
          "about": "長光衛星"
        },
        {
          "text": "FactLink觀察到，此事件有兩波訊息傳播高峰，第一波是10月26日至10月29日，中國官方相關媒體如《觀察者網》、《環球網》、《環球時報》、《人民日報》、《央視軍事》、《海峽之聲》、《看台海》報導與其微博官方帳號，引用長光衛星公司衛星影像，「慶祝台灣回歸為中國一部分」的光復節。",
          "source_id": "src-factlink-satellite",
          "about": "長光衛星"
        },
        {
          "text": "同一時間，中國媒體用以面向台灣讀者的臉書粉絲專頁，包括《今日海峽》、《CCTV中文》、《知行》、《香港大公報》、香港中國通訊社的《通傳媒》等臉書粉專，同步發動長光衛星照慶祝台灣光復節的傳言，並發布台灣光復節歷史照片、紀錄片、台灣青年回顧光復節的內容素材。",
          "source_id": "src-factlink-satellite",
          "about": "長光衛星"
        },
        {
          "text": "台灣媒體針對長光衛星釋放台灣實景衛星照均有報導。",
          "source_id": "src-factlink-satellite",
          "about": "長光衛星"
        },
        {
          "text": "這些台灣媒體對長光衛星的「解讀」，反而成為中國官方的另一波宣傳素材。",
          "source_id": "src-factlink-satellite",
          "about": "長光衛星"
        },
        {
          "text": "由上述的傳播路徑可見，中國官媒在「長光衛星發布台灣衛星實景照」，較少著墨在「長光衛星」的技術，更不曾揭露解放軍掌握衛星技術與情資的情資能力。",
          "source_id": "src-factlink-satellite",
          "about": "長光衛星"
        },
        {
          "text": "長光衛星的衛星圖資，在11月1日由中國駐美大使館（Chinese Embassy in Us）X帳號轉載，每張照片在寫英文圖說時，將每個台灣景點註記為中國的一部分，呼應同樣敘事，將資訊戰線上升至中美台。",
          "source_id": "src-factlink-satellite",
          "about": "長光衛星"
        },
        {
          "text": "經過多輪募資投入研發，是中國最大的民間商業衛星遙測公司，投資的「吉林一號」衛星對外宣稱有117顆衛星，致力開發運用於救災、農業、氣候變遷等商業遙測市場。",
          "source_id": "src-factlink-satellite",
          "about": "吉林一號"
        },
        {
          "text": "FactLink運用台灣民主實驗室（Doublethink Lab）微博熱搜分析平台資料庫，顯示從10月26日至10月27日的熱搜主題是「吉林一號放出台灣島高清衛星圖」，從中國官媒的微博帳號到特定軍事微博帳號均轉傳此訊息。",
          "source_id": "src-factlink-satellite",
          "about": "吉林一號"
        },
        {
          "text": "媒體的報導角度各不同，部分媒體以陳述事實角度報導「吉林一號」公布台灣多張衛星照，部分媒體分析中國進行政治恫嚇，但也有特定媒體和政論節目引述名嘴指出衛星照「看光光」台灣、中國航太科技進步。",
          "source_id": "src-factlink-satellite",
          "about": "吉林一號"
        }
      ]
    },
    {
      "id": "guancha",
      "name_zh": "觀察者網",
      "name_en": "Guancha (Observer Network)",
      "aliases": [
        "Guancha",
        "Observer Network",
        "guancha.cn",
        "Guancha (Observer Network)",
        "观察者网"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "中國民族主義傾向的新聞與評論網站，頻繁參與對台、對日敘事的設定與放大。",
      "description_zh": "FactLink 在光復節台灣衛星照、以及中國對日敘事攻擊等多份數位調查中，將觀察者網列為放大相關恫嚇與民族主義敘事的中國網路媒體之一。",
      "indicators": [],
      "active_since": "",
      "related": [],
      "event_ids": [
        "satellite-retrocession-2025",
        "japan-narrative-2025"
      ],
      "source_ids": [
        "src-factlink-satellite",
        "src-factlink-japan"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "內容被其他帳號使用次數較高的行動者：一是東部戰區，二是中國官媒如央視新聞、環球時報、環球網、央廣軍事，三是與官方有關的帳號 (State-Linked)，如新浪軍事、觀察者網。",
          "source_id": "src-factlink-a7a795",
          "about": "觀察者網"
        },
        {
          "text": "玉淵潭天為央視融媒體品牌，在網絡圖中與央視沒有指向關係，顯示兩個品牌之間分工明確，刻意不轉傳，各自扮演不同角色；《觀察者網》除了作為發布者外，也擴散轉發來自玉淵潭天這類被視為與中國官媒關係緊密的大V的內容。",
          "source_id": "src-factlink-a7a795",
          "about": "觀察者網"
        },
        {
          "text": "依據文本相似性資料、關係網絡分析來確認主要行動者，包括：東部戰區；軍方媒體如中國軍號、解放軍報；中央官媒如新華社、央視、央視軍事、人民日報、央廣軍事；以及與對台議題高度相關的福建媒體，如看台海、台海時刻，另亦納入引用次數較高的觀察者網。",
          "source_id": "src-factlink-a7a795",
          "about": "觀察者網"
        },
        {
          "text": "FactLink觀察到，此事件有兩波訊息傳播高峰，第一波是10月26日至10月29日，中國官方相關媒體如《觀察者網》、《環球網》、《環球時報》、《人民日報》、《央視軍事》、《海峽之聲》、《看台海》報導與其微博官方帳號，引用長光衛星公司衛星影像，「慶祝台灣回歸為中國一部分」的光復節。",
          "source_id": "src-factlink-satellite",
          "about": "《觀察者網》"
        },
        {
          "text": "至於與中國官方關係特殊，但全力宣傳中國官方意識的「觀察者網」也名列前茅。",
          "source_id": "src-factlink-japan",
          "about": "觀察者網"
        },
        {
          "text": "在2025年11月至12月初攻擊高市早苗與其言行的貼文中，官媒帳號如北京晚報、環球時報、中國新聞網、央視網，以及作為中國官方喉舌的民營媒體觀察者網及時政評論大V，以「日本軍國主義意圖對外擴張」為宣傳主旋律。",
          "source_id": "src-factlink-japan",
          "about": "觀察者網"
        },
        {
          "text": "至於與中國在過去幾年在海上發生數次衝突的菲律賓，雖然在高市早苗的「台灣有事」發言之初並未受到矚目，但自從11月30日共同社報導日本政府正在考慮對菲律賓出口導彈之後，中國官媒、關係媒體帳號如「觀察者網」，以及網路大V也開始以「菲律賓勾結高市早苗反華」、「日本擴武野心正通過菲律賓落地」等敘事，對菲律賓及日本的關係展開攻勢，並且作為日本試圖破壞二戰秩序的證明。",
          "source_id": "src-factlink-japan",
          "about": "觀察者網"
        },
        {
          "text": "🇨🇳 2024 年 2 月 4 日「观察者网」發布张维为於 🇨🇳 上海广电 「东方卫视」節目發言逐字稿，张维为在節目中批評台灣「以选票为中心」的西方政治模式存在缺陷，導致政黨「竞相争夺选票 [...] 对基本盘以外其他群体的利益，要么是视而不见，要么是开一些空头支票」。",
          "source_id": "src-iorg-118",
          "about": "观察者网"
        },
        {
          "text": "1 月 28 日 7:58 中國媒體「观察者网」刊出「台灣自由撰稿人」雁默的評論，認為「“被逼还手”是大陆解决台湾问题的最佳途径，其能在道义上站得住脚，也能最大程度降低周边国家与欧洲的反弹」，而中國應「主动创造“被逼还手”的环境」。",
          "source_id": "src-iorg-38",
          "about": "观察者网"
        }
      ]
    },
    {
      "id": "hu-xijin",
      "name_zh": "胡錫進",
      "name_en": "Hu Xijin",
      "aliases": [
        "Hu Xijin",
        "老胡",
        "胡锡进"
      ],
      "category": "commentator",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "中國知名評論者、《環球時報》前總編輯，常以強硬民族主義言論放大官方涉外、涉台敘事。",
      "description_zh": "FactLink 調查指出，在中國對日本（高市早苗台灣有事言論）的敘事攻擊中，胡錫進等大V以厭女框架（稱日本為美國『東亞妾室』）放大攻擊，是官方敘事的網路放大節點之一。",
      "indicators": [],
      "active_since": "",
      "related": [
        {
          "target_id": "global-times",
          "relation": "affiliated-with",
          "note": "《環球時報》前總編輯"
        }
      ],
      "event_ids": [
        "japan-narrative-2025"
      ],
      "source_ids": [
        "src-factlink-japan"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "在中國外交部定調之前，微博網民對於中國駐日外交官的極端發言，並未有大量關注討論，雖有時政大V如前環球時報總編輯胡錫進或小粉紅立場鮮明的「小凡好攝」在當日快速轉述高市早苗發言並出言批評，但中國官媒卻相對沉默。",
          "source_id": "src-factlink-japan",
          "about": "胡錫進"
        },
        {
          "text": "比如前環球時報的總編輯胡錫進在11月1日高市與林信義在APEC場合見面時，25便從高市早苗的性別做文章，將她與日本形容為美國的「東亞妾室」，與台灣「私通」，比擬日本與台灣及美國之間的關係。",
          "source_id": "src-factlink-japan",
          "about": "胡錫進"
        },
        {
          "text": "實際案例包括：15 日中共官媒環球網、17 日中國外交部發言人華春瑩、18 日中國外交部發言人趙立堅、20 日中共官媒環球網總編胡锡进的發言、24 日中國外交部發言人汪文斌、28 日國台辦轄下「中國台灣網」針對美國艦隊通過台灣海峽的回應。",
          "source_id": "src-iorg-11",
          "about": "胡锡进"
        },
        {
          "text": "環球網總編胡锡进：拜登是「老糊塗」，會讓台灣變成東亞火藥桶。",
          "source_id": "src-iorg-11",
          "about": "胡锡进"
        },
        {
          "text": "8 月 20 日，中共官媒環球時報總編輯胡锡进貼文，認為拜登將台灣類比為北約盟友的是「老糊塗」，會讓台灣變成「東亞火藥桶」。",
          "source_id": "src-iorg-11",
          "about": "胡锡进"
        }
      ]
    },
    {
      "id": "hack-leak-network",
      "name_zh": "假外交文件 hack-and-leak 操作網絡",
      "name_en": "Diplomatic Hack-and-Leak Disinformation Network",
      "aliases": [
        "暗網假爆料帳號群",
        "DarkForums 假文件操作",
        "Diplomatic Hack-and-Leak Disinformation Network"
      ],
      "category": "cib-network",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "以偽造文件在偽暗網論壇『假爆料』、再由親中帳號協同放大，抹黑台日外交的資訊操弄網絡。",
      "description_zh": "FactLink 調查記錄，2025/11–12 一組與中國直接或間接相關的帳號偽造『高市早苗收受台灣駐日代表謝長廷數百萬賄賂』假文件，分兩波（11/24–25、12/2）先於偽暗網論壇 DarkForums 假爆料，再由 X、Facebook 與港陸媒體放大；台灣事實查核中心於 24 小時內以日文文法錯誤等證據闢謠。",
      "indicators": [
        "DarkForums 假爆料帳號：Samurai、tatakai（新註冊）",
        "X 放大帳號：豫章信使、孤烟暮蟬、平沙落雁",
        "兩波操作：2025/11/24–25、2025/12/2",
        "TFC 24 小時內闢謠（偽造日文書信文法錯誤）"
      ],
      "active_since": "2025",
      "related": [
        {
          "target_id": "taiwan-headlines",
          "relation": "affiliated-with",
          "note": "FB『兩岸頭條』參與轉傳放大"
        }
      ],
      "event_ids": [
        "hack-leak-takaichi-2025"
      ],
      "source_ids": [
        "src-factlink-hackleak"
      ],
      "confidence": "medium"
    },
    {
      "id": "china-military-bugle",
      "name_zh": "中國軍號",
      "name_en": "China Military Bugle",
      "aliases": [
        "中国军号"
      ],
      "category": "state-media",
      "role": "collaborator",
      "origin": "PRC",
      "summary_zh": "解放軍官方新媒體帳號品牌。在 FactLink 對 2025「正義使命」軍演的宣傳網絡分析中，被列為釋出無人機影像素材、並與東部戰區、央視共同發動宣傳主題的行動者。",
      "source_ids": [
        "src-factlink-a7a795"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "研究團隊觀察到，解放軍新聞傳播中心轄下微博帳號「中國軍號」的貼文經常被其他官媒與社群帳號採用，但未反映於本次網絡圖中。",
          "source_id": "src-factlink-a7a795",
          "about": "中國軍號"
        },
        {
          "text": "主要是中國軍號內容多以短影音與影像形式被轉用，且其發文文字較為獨特。",
          "source_id": "src-factlink-a7a795",
          "about": "中國軍號"
        },
        {
          "text": "因此，研究團隊將透過接下來的敘事分析，補充中國軍號在資訊宣傳中的角色。",
          "source_id": "src-factlink-a7a795",
          "about": "中國軍號"
        },
        {
          "text": "依據文本相似性資料、關係網絡分析來確認主要行動者，包括：東部戰區；軍方媒體如中國軍號、解放軍報；中央官媒如新華社、央視、央視軍事、人民日報、央廣軍事；以及與對台議題高度相關的福建媒體，如看台海、台海時刻，另亦納入引用次數較高的觀察者網。",
          "source_id": "src-factlink-a7a795",
          "about": "中國軍號"
        },
        {
          "text": "當晚7-9點之間，中國軍號、央視新聞、東部戰區、多社群平台眾多帳號等也共同發動此主題。",
          "source_id": "src-factlink-a7a795",
          "about": "中國軍號"
        },
        {
          "text": "此影像敘事包含四種文本：央視和央視軍事採用手機直立畫面；中國軍號以無人機起飛影像作為開頭；東部戰區在「這麼近那麼美，隨時到台北」影像中穿插一張台北101照；此外，網路論壇和社群平台流傳所謂「無人機拍攝到的台北地形全景圖」。",
          "source_id": "src-factlink-a7a795",
          "about": "中國軍號"
        },
        {
          "text": "資安院分析師戴毓辰協助比對上述文本的「台北101」影像，這四種文本影像疊合後完全相符，觀測到文本畫面左下的時間秒數，不同文本顯示的秒數略有不同，可推測東部戰區、央視、中國軍號等三個主要行動者，透過早已炮製的「共同素材」，自行加工與發揮為宣傳影像。",
          "source_id": "src-factlink-a7a795",
          "about": "中國軍號"
        },
        {
          "text": "東部戰區融媒體所製作的「演習畫面」素材，提供給央視、人民日報、中國軍號、環球日報等媒體使用，素材會同步打上「東部戰區」藍白符號。",
          "source_id": "src-factlink-a7a795",
          "about": "中國軍號"
        },
        {
          "text": "中國軍號和解放軍報，會有起床號、熄燈號，提供解放軍觀點的宣傳素材。",
          "source_id": "src-factlink-a7a795",
          "about": "中國軍號"
        },
        {
          "text": "以「無人機」敘事為例，官方未曾提及「雙尾蠍」，但媒體和民間軍事博主透過中國軍號畫面，反搜認定為雙尾蠍，文章延伸介紹「雙尾蠍」功能，甚至虛擬出無人機斬首計畫、繞台路線。",
          "source_id": "src-factlink-a7a795",
          "about": "中國軍號"
        }
      ]
    },
    {
      "id": "xinhua",
      "name_zh": "新華社",
      "name_en": "Xinhua News Agency",
      "aliases": [
        "新华社",
        "Xinhua",
        "新華網",
        "新华网"
      ],
      "category": "state-media",
      "role": "collaborator",
      "origin": "PRC",
      "summary_zh": "中國國家通訊社。FactLink 對 2025「正義使命」軍演的宣傳網絡分析中，將其列為受權發布演訓公告與示意圖的中央官媒。",
      "source_ids": [
        "src-factlink-a7a795"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "正義使命軍演是由中共解放軍東部戰區發言人施毅在2025年12月29日早上7點30分宣布開始，由東部戰區、新華社受權發布演訓公告和示意圖，央視亦發布相關新聞。",
          "source_id": "src-factlink-a7a795",
          "about": "新華社"
        },
        {
          "text": "關鍵字包含：正义使命、解放军、东部战区、演习、无人机、正義使命、解放軍、東部戰區、演習和無人機，共收集6,924筆資料，再排除新華社宣佈軍演開始之前的不相關貼文，共得到6,747筆資料，以此資料進行後續分析。",
          "source_id": "src-factlink-a7a795",
          "about": "新華社"
        },
        {
          "text": "依據文本相似性資料、關係網絡分析來確認主要行動者，包括：東部戰區；軍方媒體如中國軍號、解放軍報；中央官媒如新華社、央視、央視軍事、人民日報、央廣軍事；以及與對台議題高度相關的福建媒體，如看台海、台海時刻，另亦納入引用次數較高的觀察者網。",
          "source_id": "src-factlink-a7a795",
          "about": "新華社"
        },
        {
          "text": "除了東部戰區發言人的官宣之外，央視、環球時報、新華社等特定官媒採訪中共特定軍事專家來點評演習，是演習畫面尚未製播之前的關鍵宣傳素材。",
          "source_id": "src-factlink-a7a795",
          "about": "新華社"
        },
        {
          "text": "According to Xinhua News Agency, the ceremony was held on 3 July in Beijing.",
          "source_id": "src-aspi-the-strategist-934197",
          "about": "Xinhua News Agency"
        },
        {
          "text": "5, PRC state media Xinhua News Agency and the People’s Daily both released a series of pictures and texts suggesting that the People’s Liberation Army (PLA) were operating on Taiwan’s coastline.",
          "source_id": "src-dtl-2022election",
          "about": "Xinhua News Agency"
        },
        {
          "text": "PM Oli had held a meeting with Xi Jinping in the course of his visit to the PRC for attending the Shanghai Cooperation Organization (SCO) Plus Summit in Tianjin on 30 August 2025 (Xinhua, 2025).",
          "source_id": "src-doublethink-lab-96d2c0",
          "about": "Xinhua"
        },
        {
          "text": "Additionally, China Radio International broadcasts in Urdu, and Xinhua offers services in multiple languages, including Urdu.",
          "source_id": "src-doublethink-lab-96d2c0",
          "about": "Xinhua"
        },
        {
          "text": "Leading Pakistani media outlets, such as Jang Group, Daily Pakistan, Nawa-i-Waqt, Associated Press of Pakistan, Daily Times, Hum News, and Pakistan Today, have subscribed to Xinhua’s services.",
          "source_id": "src-doublethink-lab-96d2c0",
          "about": "Xinhua"
        },
        {
          "text": "Xinhua News.",
          "source_id": "src-doublethink-lab-96d2c0",
          "about": "Xinhua"
        },
        {
          "text": "檢視「島內輿論」這波主題，中國官方媒體家數雖多，但內容來源單一，不同媒體之間交互引用，內容主要來自新華社旗下的微博帳號《參考消息》報導〈島內網友熱議衛星視角下瞰中國台灣省〉，此報導除了引述台灣媒體，更取材特定媒體報導的網友留言，製造「島內輿論」高度熱議、高度讚嘆中國科技進步的風向，獲得《央廣軍事》和《環球時報》等媒體轉分享。",
          "source_id": "src-factlink-satellite",
          "about": "新華社"
        },
        {
          "text": "中央官媒如央視、新華社等，呼應官方敘事，例如「高市早苗讓日本承擔代價」，「高市早苗要明白中國人民惹不得」；而地方官媒如北京日報、以及常與官媒呼應的香港媒體如鳳凰網，以及時政大V帳號則在既有敘事基礎上進一步加油添醋、強化情緒性語言與陰謀論式解讀，使訊息更具戲劇性與傳播力。",
          "source_id": "src-factlink-japan",
          "about": "新華社"
        },
        {
          "text": "例如北京日報引述新華社，稱賴清德和民進黨「附和高市早苗言論，甘當日本反華勢力的“應聲蟲”，藉機污衊攻擊大陸，為了“倚外謀獨”已經失心瘋」，恐將台灣推向戰火；其他官媒與時政大V帳號發文強調台灣問題屬於中國內政，日本不應以「存亡危機」為藉口介入。",
          "source_id": "src-factlink-japan",
          "about": "新華社"
        },
        {
          "text": "🇨🇳 2025 年 3 月 30 日 🇨🇳 国务院「新华网」評論內文稱，「賴 17 條」中「意图恢复“军事审判制度”，通过渲染战争恐慌强化“台独”意识形态控制」，並讓不明來源的「台湾民众」驚呼「“‘白色恐怖 ’还魂重现”“已进入准‘戒严 ’状态”」。",
          "source_id": "src-iorg-118",
          "about": "新华网"
        },
        {
          "text": "🇨🇳 2025 年 3 月 30 日 🇨🇳 国务院「新华网」發表標題為「赖清德大搞绿色威权 包藏祸心」的評論文章，內文稱賴清德「大开民主倒车，使台湾滑向绿色恐怖执政的黑暗深渊」，認為賴政府以「国安和统战威胁等借口」限制人民言論自由，而民進黨當前的作法與「过去抨击的戒严体制已无二致」「从批判威权到成为绿色威权」。",
          "source_id": "src-iorg-118",
          "about": "新华网"
        },
        {
          "text": "16 日，新華網發布報導：「喀布爾陷落標誌著美國無功而返、國際形象和信譽崩塌，美國霸權走向衰落。」",
          "source_id": "src-iorg-11",
          "about": "新華網"
        },
        {
          "text": "🇨🇳 4 月 10 日 08:31中共官媒「新華網」發布報導傳播「台岛上空的声音」影片。",
          "source_id": "src-iorg-41",
          "about": "新華網"
        },
        {
          "text": "28 日，有 35 個中共官媒微博帳號發布含有相同內容文本，包含 🇨🇳 国务院「新华社」、🇨🇳 广电总台「央视新闻」。",
          "source_id": "src-iorg-131",
          "about": "新华社"
        },
        {
          "text": "Another reporter from one of the three major state-owned media outlets says editorials from The People’s Daily and Xinhua more or less represent the Chinese government’s official position.",
          "source_id": "src-lowy-globaltimes",
          "about": "Xinhua"
        },
        {
          "text": "It is clear that Global Times’ editorials don’t carry the same weight as those of the People’s Daily or Xinhua.",
          "source_id": "src-lowy-globaltimes",
          "about": "Xinhua"
        },
        {
          "text": "其中，「台海網」的文章使用中共官媒「新華網」發布於 2022 年 8 月 5 日的合成照片 DA.28。",
          "source_id": "src-iorg-38",
          "about": "新華網"
        }
      ]
    },
    {
      "id": "pla-daily",
      "name_zh": "解放軍報",
      "name_en": "PLA Daily",
      "aliases": [
        "解放军报"
      ],
      "category": "state-media",
      "role": "collaborator",
      "origin": "PRC",
      "summary_zh": "解放軍機關報。FactLink 對 2025「正義使命」軍演的宣傳網絡分析中，將其列為刊登軍演實彈射擊照片集與文字報導的軍方媒體。",
      "source_ids": [
        "src-factlink-a7a795"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "依據文本相似性資料、關係網絡分析來確認主要行動者，包括：東部戰區；軍方媒體如中國軍號、解放軍報；中央官媒如新華社、央視、央視軍事、人民日報、央廣軍事；以及與對台議題高度相關的福建媒體，如看台海、台海時刻，另亦納入引用次數較高的觀察者網。",
          "source_id": "src-factlink-a7a795",
          "about": "解放軍報"
        },
        {
          "text": "中國軍號和解放軍報，會有起床號、熄燈號，提供解放軍觀點的宣傳素材。",
          "source_id": "src-factlink-a7a795",
          "about": "解放軍報"
        },
        {
          "text": "東部戰區融媒體中心在第三日發布的是前兩日演習畫面和「沙場風雨兩岸燈」MV，解放軍報刊登的是12月30日於福州平潭拍攝的遠程火箭砲實彈射擊照片集與文字報導。",
          "source_id": "src-factlink-a7a795",
          "about": "解放軍報"
        },
        {
          "text": "央視當晚的新聞聯播則為習近平新年賀詞，軍事新聞關注的是慶賀解放軍報70週年、香港部隊人事訊息、火箭軍建軍十週年等無關對台軍演訊息，翌日為元旦，並沒有對台軍演的相關訊息。",
          "source_id": "src-factlink-a7a795",
          "about": "解放軍報"
        }
      ]
    },
    {
      "id": "sina-military",
      "name_zh": "新浪軍事",
      "name_en": "Sina Military",
      "aliases": [
        "新浪军事"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "中國商業入口網站新浪的軍事頻道。在 FactLink 對 2025「正義使命」軍演的宣傳網絡分析中，被列為轉分享東部戰區與中央官媒素材的媒體之一。",
      "source_ids": [
        "src-factlink-a7a795"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "內容被其他帳號使用次數較高的行動者：一是東部戰區，二是中國官媒如央視新聞、環球時報、環球網、央廣軍事，三是與官方有關的帳號 (State-Linked)，如新浪軍事、觀察者網。",
          "source_id": "src-factlink-a7a795",
          "about": "新浪軍事"
        },
        {
          "text": "檢視392組文本資料所顯示的指向網絡時可發現，東部戰區發布的貼文，有13個媒體和大V共同轉分享，包括央視新聞、央廣軍事、鎮江民生頻道、央廣軍事、環球時報、浙江日報、澎湃新聞、宣漢融媒、新浪軍事、動静新聞、南湖發布、看看新聞Knews和星話大白等。",
          "source_id": "src-factlink-a7a795",
          "about": "新浪軍事"
        },
        {
          "text": "央視新聞發布的13則報導文本，有26個帳號轉發，官方單位有屏山公安、銅陵經開公安在線、山東高法、沐川公安、青春龍泉驛和平安金陽；媒體有動靜新聞、新浪軍事、南寧晚報、錢江晚報、南方週末、頭條新聞、第一現場、馬上資訊、看台海、福建日報、環球時報和新京報；大V有星話大白、包容萬物恆河水、台灣那點事兒、扎西德勒·天珠收藏、椒哥微記錄、航天面面觀、長春-小風、白鶴-老鄧。",
          "source_id": "src-factlink-a7a795",
          "about": "新浪軍事"
        }
      ]
    },
    {
      "id": "zhejiang-daily",
      "name_zh": "浙江日報",
      "name_en": "Zhejiang Daily",
      "aliases": [
        "浙江日报"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "浙江省委機關報。FactLink 對 2025「正義使命」軍演的宣傳網絡分析中，將其列為轉分享軍演宣傳素材的媒體之一。",
      "source_ids": [
        "src-factlink-a7a795"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "檢視392組文本資料所顯示的指向網絡時可發現，東部戰區發布的貼文，有13個媒體和大V共同轉分享，包括央視新聞、央廣軍事、鎮江民生頻道、央廣軍事、環球時報、浙江日報、澎湃新聞、宣漢融媒、新浪軍事、動静新聞、南湖發布、看看新聞Knews和星話大白等。",
          "source_id": "src-factlink-a7a795",
          "about": "浙江日報"
        }
      ]
    },
    {
      "id": "the-paper",
      "name_zh": "澎湃新聞",
      "name_en": "The Paper",
      "aliases": [
        "澎湃新闻"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "上海報業集團旗下新聞網站。FactLink 對 2025「正義使命」軍演的宣傳網絡分析中，將其列為轉分享軍演宣傳素材的媒體之一。",
      "source_ids": [
        "src-factlink-a7a795"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "檢視392組文本資料所顯示的指向網絡時可發現，東部戰區發布的貼文，有13個媒體和大V共同轉分享，包括央視新聞、央廣軍事、鎮江民生頻道、央廣軍事、環球時報、浙江日報、澎湃新聞、宣漢融媒、新浪軍事、動静新聞、南湖發布、看看新聞Knews和星話大白等。",
          "source_id": "src-factlink-a7a795",
          "about": "澎湃新聞"
        },
        {
          "text": "〉影片，由《澎湃新聞》、《大象新聞》、香港《文匯報》等多家媒體、論壇帳號、多個抖音帳號轉分享。",
          "source_id": "src-factlink-satellite",
          "about": "《澎湃新聞》"
        },
        {
          "text": "當日 10:19 至 14:06 間，中共官媒「環球網」「台海網」「鳳凰網」「澎湃新聞」「央視網」及官媒微博帳號「环球时报」「海外网」「环球网」「小央视频」「香港中通社」「中国新闻网」「厦门广电」「海峡导报」「中国新闻社」多使用相同「天氣晴朗」圖片，協力傳播中時報導內容。",
          "source_id": "src-iorg-41",
          "about": "澎湃新聞"
        },
        {
          "text": "當日 14:56 至隔日 9:18 之間，中共官媒「澎湃新聞」「環球網」「台海網」「香港新聞網」協力傳播此則中時新聞網的報導內容。",
          "source_id": "src-iorg-41",
          "about": "澎湃新聞"
        },
        {
          "text": "1 月 8 日，🇨🇳 上海报业集团「澎湃新闻」發布來自「“日月谭天”微信公众号」的文本「日月谭天 | 大陆惩治“台独”分子绝不手软，推动两岸交融绝不止步」，內文包含「1 月 7 日，国台办举行 2026 年首场例行新闻发布会。",
          "source_id": "src-iorg-131",
          "about": "澎湃新闻"
        }
      ]
    },
    {
      "id": "pla-isf",
      "name_zh": "解放軍信息支援部",
      "name_en": "PLA Information Support Force",
      "aliases": [
        "解放军信息支援部",
        "信息支援部隊"
      ],
      "category": "state-organ",
      "role": "attacker",
      "origin": "PRC",
      "summary_zh": "解放軍資訊支援部隊。FactLink 對 2025「正義使命」軍演的宣傳網絡分析中，受訪的國防大學研究者將其列為過去與總政治部共同執行宣傳工作的單位。",
      "source_ids": [
        "src-factlink-a7a795"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "國防大學新聞系教授傅文成觀察，過去一般是由總政治部加上解放軍信息支援部執行宣傳，東部戰區融媒體中心主責宣傳，宣傳工作比過去更能貼近台灣脈絡，操作也更精密、細膩。",
          "source_id": "src-factlink-a7a795",
          "about": "解放軍信息支援部"
        }
      ]
    },
    {
      "id": "prc-mfa",
      "name_zh": "中共外交部",
      "name_en": "PRC Ministry of Foreign Affairs",
      "aliases": [
        "中华人民共和国外交部",
        "中國外交部",
        "Chinese Ministry of Foreign Affairs"
      ],
      "category": "state-organ",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "中華人民共和國外交部。FactLink 對 2025「正義使命」軍演的宣傳網絡分析中，將其列為官媒評論所引述的官方消息來源。",
      "source_ids": [
        "src-factlink-a7a795"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "環球時報，另引述中共外交部，並從國際關係角度提供評論、新聞和圖卡。",
          "source_id": "src-factlink-a7a795",
          "about": "中共外交部"
        },
        {
          "text": "一、中國外交部、官媒和社群大V帳號，針對高市政權發動厭女的性別歧視攻擊、二戰歷史深仇、琉球主權論。",
          "source_id": "src-factlink-takaichi",
          "about": "中國外交部"
        },
        {
          "text": "In April 2023, the Chinese Ministry of Foreign Affairs froze the visas of two prominent Indian journalists — The Hindu’s Ananth Krishnan and Prasar Bharati’s Anshuman Mishra.",
          "source_id": "src-doublethink-lab-96d2c0",
          "about": "Chinese Ministry of Foreign Affairs"
        },
        {
          "text": "中國外交部採取連串抗議與反制措施，除了約見日本駐華大使之外，更祭出赴日旅遊治安提醒、暫停日本水產品進口等經濟制裁。",
          "source_id": "src-factlink-japan",
          "about": "中國外交部"
        },
        {
          "text": "11月7日高市早苗在日本國會「台灣有事論」發言後幾天，網路上並未馬上引起大量討論，而是直待11月10日中國外交部記者會回應高市早苗的發言後，官媒才開始陸續發文，由時政評論大V帳號轉發中國官媒貼文。",
          "source_id": "src-factlink-japan",
          "about": "中國外交部"
        },
        {
          "text": "11月1日高市早苗與林信義在APEC會議見面後，中國外交部首先極快提出抗議，北京日報、央視、中國新聞網等官媒也迅速轉發外交部意見。",
          "source_id": "src-factlink-japan",
          "about": "中國外交部"
        },
        {
          "text": "11月7日高市早苗在國會發表「台灣有事論」後，則是由中國駐日外交官率先在X平台發動輿論攻勢，接著中國外交部定調、中國官媒跟進宣傳，然後由微博上具有眾多粉絲追隨者的「官媒小號」13或是「網路大V」表態，引動輿論風潮。",
          "source_id": "src-factlink-japan",
          "about": "中國外交部"
        },
        {
          "text": "然而中國官媒和微博社群對高市早苗「台灣有事」說的反應，在中國駐日大使發言後，卻有幾天空窗期 - 直到中國外交部於11月10日的記者會定調後，中國官媒以及微博社群才展開熱議譴責及轉帖。",
          "source_id": "src-factlink-japan",
          "about": "中國外交部"
        },
        {
          "text": "在中國外交部定調之前，微博網民對於中國駐日外交官的極端發言，並未有大量關注討論，雖有時政大V如前環球時報總編輯胡錫進或小粉紅立場鮮明的「小凡好攝」在當日快速轉述高市早苗發言並出言批評，但中國官媒卻相對沉默。",
          "source_id": "src-factlink-japan",
          "about": "中國外交部"
        },
        {
          "text": "在中國外交部定調後，中央與地方官媒以及微博時政大V帳號在專攻的主題上，也有不同層次。",
          "source_id": "src-factlink-japan",
          "about": "中國外交部"
        },
        {
          "text": "例如11月18日日本外務省亞洲大洋洲局局長金井正彰與中國外交部亞洲司司長劉勁松會面，中方在未與日方協調的情況下，拍攝劉勁松插著口袋與金井正彰談話的畫面。",
          "source_id": "src-factlink-japan",
          "about": "中國外交部"
        },
        {
          "text": "官宣也呼應中國外交部所推出的旅遊警告等措施，大力喧染宣傳高市早苗發言所造成的日本經濟損失，像是不只大量機票以及旅館訂單被取消，連股市債市匯市也大幅震盪，甚至可能能會拖累日本的GDP下降，造成重大經濟風險。",
          "source_id": "src-factlink-japan",
          "about": "中國外交部"
        },
        {
          "text": "從研究資料可以看出，當高市早苗提出「台灣有事」發言時，是由中國駐日外交官在X平台首先發動發動攻擊，中國大V在微博上零散回應，等待中國外交部定調之後，再由官媒與大V再掀輿論浪潮，並在各主題敘事中，分別擔任各自的角色。",
          "source_id": "src-factlink-japan",
          "about": "中國外交部"
        },
        {
          "text": "中國外交部汪文斌：美国可以肆意对一个主权国家进行军事干涉，而不必为这个国家的人民所遭受的苦难负责。",
          "source_id": "src-iorg-11",
          "about": "中國外交部"
        },
        {
          "text": "17 日，中國外交部發言人華春瑩：「美军所到之处，留下的都是动荡分裂、家破人亡，留下千疮百孔的烂摊子。」",
          "source_id": "src-iorg-11",
          "about": "中國外交部"
        },
        {
          "text": "18 日，中國外交部發言人趙立堅：「​​一些国家打着民主、人权旗号对主权国家实施军事干涉，严重破坏有关国家主权和领土完整，导致其经济和社会发展遭受重创，导致大量无辜平民伤亡或被迫颠沛流离。」",
          "source_id": "src-iorg-11",
          "about": "中國外交部"
        },
        {
          "text": "24 日，中國外交部汪文斌：「美国可以肆意对一个主权国家进行军事干涉，而不必为这个国家的人民所遭受的苦难负责。」",
          "source_id": "src-iorg-11",
          "about": "中國外交部"
        }
      ]
    },
    {
      "id": "beijing-media-network",
      "name_zh": "北京廣播電視台",
      "name_en": "Beijing Media Network",
      "aliases": [
        "北京时间",
        "北京時間"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "北京市屬廣電機構，旗下品牌「北京時間」。FactLink 對 2025「正義使命」軍演的宣傳網絡分析中，將其列為以博主型記者主播講述軍演新聞、介紹主題海報意義的媒體。",
      "source_ids": [
        "src-factlink-a7a795"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "中共地方媒體的新媒體品牌，比如北京時間（北京廣播電視台）、直新聞（深圳廣電集團）透過博主型記者主播講述軍演新聞與介紹主題海報意義。",
          "source_id": "src-factlink-a7a795",
          "about": "北京廣播電視台"
        }
      ]
    },
    {
      "id": "shenzhen-media-group",
      "name_zh": "深圳廣電集團",
      "name_en": "Shenzhen Media Group",
      "aliases": [
        "直新闻",
        "直新聞"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "深圳市屬廣電機構，旗下品牌「直新聞」。FactLink 對 2025「正義使命」軍演的宣傳網絡分析中，將其列為以博主型記者主播講述軍演新聞的媒體。",
      "source_ids": [
        "src-factlink-a7a795"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "中共地方媒體的新媒體品牌，比如北京時間（北京廣播電視台）、直新聞（深圳廣電集團）透過博主型記者主播講述軍演新聞與介紹主題海報意義。",
          "source_id": "src-factlink-a7a795",
          "about": "深圳廣電集團"
        }
      ]
    },
    {
      "id": "china-daily",
      "name_zh": "中國日報",
      "name_en": "China Daily",
      "aliases": [
        "中国日报",
        "chinadaily.com.cn"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "中國官方英文日報。多份研究報告記錄其新聞流被置入海外新聞網站首頁，作為內容洗白的來源之一。",
      "source_ids": [
        "src-aspi-strait",
        "src-doublethink-lab-96d2c0",
        "src-jamestown-js2024b",
        "src-mandiant-haienergy-2022"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "China Daily’s newsfeed is prominently featured on Dawn’s homepage, indicating strong content-sharing relationships.",
          "source_id": "src-doublethink-lab-96d2c0",
          "about": "China Daily"
        },
        {
          "text": "China Daily.",
          "source_id": "src-doublethink-lab-96d2c0",
          "about": "China Daily"
        }
      ]
    },
    {
      "id": "peoples-daily",
      "name_zh": "人民日報",
      "name_en": "People's Daily",
      "aliases": [
        "人民日报"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "中共中央機關報。Doublethink Lab 與 Jamestown 記錄其與新華社同步發布圖文配合解放軍軍演敘事；IORG 記錄其發言被台灣在野政治人物與媒體引用。",
      "source_ids": [
        "src-doublethink-lab-96d2c0",
        "src-dtl-2022election",
        "src-jamestown-js2024b",
        "src-lowy-globaltimes",
        "src-iorg-118",
        "src-iorg-131"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "5, PRC state media Xinhua News Agency and the People’s Daily both released a series of pictures and texts suggesting that the People’s Liberation Army (PLA) were operating on Taiwan’s coastline.",
          "source_id": "src-dtl-2022election",
          "about": "People’s Daily"
        },
        {
          "text": "20, towards the end of the 20th National Congress, the People’s Daily hosted the topic #連續拿下台灣當局9個所謂的邦交國# (PRC MOFA won over 9 so-called diplomatic allies from Taiwan).",
          "source_id": "src-dtl-2022election",
          "about": "People’s Daily"
        },
        {
          "text": "FactLink觀察到，此事件有兩波訊息傳播高峰，第一波是10月26日至10月29日，中國官方相關媒體如《觀察者網》、《環球網》、《環球時報》、《人民日報》、《央視軍事》、《海峽之聲》、《看台海》報導與其微博官方帳號，引用長光衛星公司衛星影像，「慶祝台灣回歸為中國一部分」的光復節。",
          "source_id": "src-factlink-satellite",
          "about": "《人民日報》"
        },
        {
          "text": "🇹🇼-🇨🇳 2024 年 5 月 23 日 🇨🇳 人民日报「环球网」針對立法院「國會改革」修法爭議發表文章，內文引用 國民黨 葉元之、 國民黨 趙少康、聯合 聯合新聞網說法，認為立院外抗議的民眾是受到民進黨煽動或組織，評論賴政府「意图操控民众」。",
          "source_id": "src-iorg-118",
          "about": "人民日报"
        },
        {
          "text": "🇨🇳 2024 年 5 月 25 日 🇨🇳 人民日报「环球网」再發表評論，稱立法院內肢體衝突事件的根源是因賴政府不能接受在國會不佔多數，因此訴諸暴力「输了人头就出拳头」。",
          "source_id": "src-iorg-118",
          "about": "人民日报"
        },
        {
          "text": "🇨🇳 2025 年 3 月 15 日 🇨🇳 人民日报「环球网」發表作者為「北平锋」的評論文章，內文宣稱民進黨借國安之名打壓反對派，並「把司法工具化，滥用所谓反渗透法擅权专用、罗织罪名」。",
          "source_id": "src-iorg-118",
          "about": "人民日报"
        },
        {
          "text": "🇹🇼-🇨🇳 2025 年 6 月 25 日 🇨🇳 人民日报「环球网」報導台灣移除蔣介石銅像，引用 國民黨 羅智強稱「赖清德的权力越大，就越往独裁迈进」；區桂之稱「民进党推动拆除所谓“威权”象征物，实则是企图建立自身的“威权”」；蔡正元稱民進黨為「打着“消除威权象征”的幌子，实则是为了打击反对力量」。",
          "source_id": "src-iorg-118",
          "about": "人民日报"
        },
        {
          "text": "🇨🇳 2025 年 3 月 16 日 🇨🇳 人民日报「环球网」再發布「北平锋」的評論「赖清德绿色恐怖暴政让台湾回到戒严白色恐怖时期」，稱民進黨以反滲透之名「行思想禁锢人身控制之实，将台湾社会推向绿色恐怖深渊」。",
          "source_id": "src-iorg-118",
          "about": "人民日报"
        },
        {
          "text": "🇨🇳 2025 年 4 月 28 日 🇨🇳 人民日报「环球时报」抖音發布影片，標題「绿恐又出新花样，民进党拿台民众户籍开刀」，內容稱陸委會指出台灣民眾持有中國身分證與定居證將喪失戶籍的政策是「绿色恐怖」，將「严重损害台湾的民主自由和社会和谐」。",
          "source_id": "src-iorg-118",
          "about": "人民日报"
        },
        {
          "text": "🇨🇳 2024 年 6 月 14 日 🇨🇳 人民日报「环球网」發表作者為「程东」的評論文章，針對台灣網紅鍾明軒赴中，稱這是「“信息茧房”被现实击碎」。",
          "source_id": "src-iorg-118",
          "about": "人民日报"
        },
        {
          "text": "🇨🇳 2025 年 6 月 5 日 🇨🇳 人民日报「环球网」再度發表作者為「程东」的文章，針對網紅館長陳之漢赴中，開頭引用未知來源的「岛内舆论」稱綠營批評館長代表「绿营其实是害怕了，担忧他们构筑的认知围墙被陈之汉突破」。",
          "source_id": "src-iorg-118",
          "about": "人民日报"
        },
        {
          "text": "🇹🇼-🇨🇳 2025 年 6 月 30 日 🇨🇳 人民日报「环球网」發表評論「赖清德“法理”外衣难掩“台独”祸心」，開頭即批評賴團結十講「直接目的是为推动“大罢免”政治斗争谋取政治私利进行文宣造势，不惜将台湾推向分裂对抗的深渊」。",
          "source_id": "src-iorg-118",
          "about": "人民日报"
        },
        {
          "text": "🇨🇳 2025 年 3 月 27 日 🇨🇳 人民日报「环球时报」抖音發布影片評論中配遭台灣政府驅逐事件，內容引用「厦门大学台湾研究院副院长」张文生觀點，稱「岛内台独势力已然在纳粹化的政治道路上一去不复返，打压陆配很可能仅仅是一个开始」。",
          "source_id": "src-iorg-118",
          "about": "人民日报"
        },
        {
          "text": "🇨🇳 2025 年 3 月 28 日 🇨🇳 人民日报「环球时报」發表作者為「中国社会科学院台湾研究所副研究员」陈桂清的評論文章，內文列舉民進黨政治人物（如劉世芳、黃捷、沈伯洋等）、台派人士（如曹興誠、網紅「八炯」）等「配合」「赖当局」「大搞“台独”一言堂，大搞“绿色独裁”“绿色恐怖”」「阻挠两岸交流、打压政治异己、迫害台湾同胞」，認為他們「充当“台独”政权的“纳粹冲锋队员”」。",
          "source_id": "src-iorg-118",
          "about": "人民日报"
        },
        {
          "text": "中共官媒 🇨🇳 人民日报「环球网」主筆室「北平锋」宣稱霍諾德徒手登頂台北 101 是「照见 “台独” 的穷途末路」，宣稱世界透過此次活動直播看見「“台独” 制造的危机、“绿色恐怖” 笼罩的阴霾」，全文言不及義，胡言亂語，充分展現其無論如何必須批評台灣政府、台灣民主的窘境與無奈。",
          "source_id": "src-iorg-131",
          "about": "人民日报"
        },
        {
          "text": "1 月 10 日，🇨🇳 人民日报「环球网」發布作者「北平锋」的文章「在反“独”促统的民族大义面前并肩而行」，內文包含「近日，台湾“高等法院”对“三中案”作出二审判决，台湾前民意代表蔡正元被判三年六个月，中国国民党前主席马英九无罪。",
          "source_id": "src-iorg-131",
          "about": "人民日报"
        },
        {
          "text": "1 月 26 日，🇨🇳 人民日报「环球网」發布作者「北平锋」的文章「台北 101，照见“台独”的穷途末路」，內文包含「台北 101 大楼的玻璃幕墙外，美国极限攀岩者亚历克斯·霍诺德的身影向上移动，赖清德对此高调宣称，“让世界看到了台湾的活力与风貌”。",
          "source_id": "src-iorg-131",
          "about": "人民日报"
        },
        {
          "text": "1 月 31 日，🇨🇳 人民日报「环球网」發布作者「北平锋」的文章「再聊聊“台北 101”背后的那把“假钥匙”」，內文包含「民进党当局却执意要将“台北 101”改名为 “台湾 101”，居心叵测篡改其文化内涵及其被寄托的民族情感。",
          "source_id": "src-iorg-131",
          "about": "人民日报"
        },
        {
          "text": "As many foreign readers of the Global Times are already aware, it is a subsidiary of the People’s Daily, the principal propaganda publication of the Chinese Communist Party.",
          "source_id": "src-lowy-globaltimes",
          "about": "People’s Daily"
        },
        {
          "text": "And it was noteworthy that when the Chinese president Xi Jinping visited the People’s Daily in February, he said his office subscribes to the Global Times.",
          "source_id": "src-lowy-globaltimes",
          "about": "People’s Daily"
        },
        {
          "text": "The publication started as a weekly international supplement to the People’s Daily.",
          "source_id": "src-lowy-globaltimes",
          "about": "People’s Daily"
        },
        {
          "text": "Another reporter from one of the three major state-owned media outlets says editorials from The People’s Daily and Xinhua more or less represent the Chinese government’s official position.",
          "source_id": "src-lowy-globaltimes",
          "about": "People’s Daily"
        },
        {
          "text": "It is clear that Global Times’ editorials don’t carry the same weight as those of the People’s Daily or Xinhua.",
          "source_id": "src-lowy-globaltimes",
          "about": "People’s Daily"
        },
        {
          "text": "The Global Times specialises in provoking and agitating and its tone and use of language is in marked contrast to the rather stolid People's Daily.",
          "source_id": "src-lowy-globaltimes",
          "about": "People's Daily"
        }
      ]
    },
    {
      "id": "jinri-haixia",
      "name_zh": "今日海峽",
      "name_en": "Strait News",
      "aliases": [
        "今日海峡"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "對台宣傳臉書粉專。IORG 與 FactLink 均將其與《CCTV中文》《知行》《香港大公報》等並列為中共官媒粉專群的一員。",
      "source_ids": [
        "src-dtl-multiverse",
        "src-factlink-satellite",
        "src-iorg-11",
        "src-iorg-131"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "同一時間，中國媒體用以面向台灣讀者的臉書粉絲專頁，包括《今日海峽》、《CCTV中文》、《知行》、《香港大公報》、香港中國通訊社的《通傳媒》等臉書粉專，同步發動長光衛星照慶祝台灣光復節的傳言，並發布台灣光復節歷史照片、紀錄片、台灣青年回顧光復節的內容素材。",
          "source_id": "src-factlink-satellite",
          "about": "《今日海峽》"
        },
        {
          "text": "8 月 16 日，中共官媒粉專「今日海峽」加入傳播此論述：「（美國）帝國為了維護自己的利益，抓著廉價的“台灣牌”與北京周旋，本小利厚。",
          "source_id": "src-iorg-11",
          "about": "今日海峽"
        },
        {
          "text": "1 月 13 日，🇨🇳 福建广播影视「今日海峽」發布 Facebook 動態，內文包含「命名『青提』挨轟『使用大陸用語』，基隆一甜品店被灌爆一星負評，網批：青鳥患上簡體字恐懼症」、「對此，有島內網民評論稱，一些人『自卑感是要多重』『青鳥患上簡體字恐懼症』」。",
          "source_id": "src-iorg-131",
          "about": "今日海峽"
        }
      ]
    },
    {
      "id": "times-newswire",
      "name_zh": "Times Newswire",
      "name_en": "Times Newswire",
      "aliases": [],
      "category": "pr-firm",
      "role": "collaborator",
      "origin": "PRC",
      "summary_zh": "新聞稿發布服務。Citizen Lab 的 PAPERWALL 調查與 Mandiant 的 HaiEnergy 行動追蹤均指出，其內容被大量取用以把親北京政治內容送上正規新聞網站。",
      "source_ids": [
        "src-citizenlab-paperwall",
        "src-google-glassbridge",
        "src-mandiant-haienergy-2023"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "PAPERWALL draws significant portions of its content from Times Newswire, a newswire service that was previously linked to HaiEnergy.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Times Newswire"
        },
        {
          "text": "We found evidence that Times Newswire regularly seeds pro-Beijing political content, including ad hominem attacks, by concealing it within large amounts of seemingly benign commercial content.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Times Newswire"
        },
        {
          "text": "This is consistent with the sourcing of press releases from Times Newswire – which we will analyze in the next section – where cryptocurrency topics are among the most common.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Times Newswire"
        },
        {
          "text": "Finally, but crucially, approximately 100 domains backlinked to Times Newswire, a supposed newswire service.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Times Newswire"
        },
        {
          "text": "The consistent connection between PAPERWALL and Times Newswire is one of the most peculiar traits of the campaign.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Times Newswire"
        },
        {
          "text": "We assess that the vast majority of the backlinks in question consist of content directly hosted on the Times Newswire website, and reposted by the PAPERWALL network, as seen in a previous example.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Times Newswire"
        },
        {
          "text": "Times Newswire is a known entity in the context of influence operations: it was first reported about in 2023 by Mandiant, a Google-owned cybersecurity company.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Times Newswire"
        },
        {
          "text": "Mandiant observed Times Newswire’s hosted content disseminated through a network of subdomains for legitimate US-based news outlets in the context of an influence campaign that the company dubbed as HaiEnergy.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Times Newswire"
        },
        {
          "text": "Similarly to what was stated by Mandiant for the HaiEnergy campaign, we cannot currently attribute Times Newswire to the same operators as PAPERWALL.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Times Newswire"
        },
        {
          "text": "Times Newswire also uses a simple WordPress template as its main structure.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Times Newswire"
        },
        {
          "text": "Being central to at least two distinct operations – PAPERWALL and HaiEnergy – Times Newswire could however be an independent asset, simultaneously exploited by multiple influence operations.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Times Newswire"
        },
        {
          "text": "We were able to identify examples of politically-themed articles that were routinely deleted from Times Newswire.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Times Newswire"
        },
        {
          "text": "This behavior suggests that ephemeral seeding is the intention for most content of that type which is deleted from the source website (Times Newswire) at an unspecified time after its initial publication.",
          "source_id": "src-citizenlab-paperwall",
          "about": "Times Newswire"
        },
        {
          "text": "Notably, the article on this subdomain in turn credited Times Newswire as the original source (see Figure 3).",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "Times Newswire"
        },
        {
          "text": "Looking forward to the next collaboration [sic].” The link to the influencer-hosted video was then embedded in a Times Newswire article that was distributed to subdomains associated with genuine U.S.-based news outlets.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "Times Newswire"
        },
        {
          "text": "Times Newswire.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "Times Newswire"
        },
        {
          "text": "Figure 9: Times Newswire promotes article on IRF Summit protest (left); subdomain of U.S.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "Times Newswire"
        },
        {
          "text": "Figure 10: Times Newswire (left) posts article concerning \"September 24\" protest in Washington, D.C.; one of the 32 subdomains (right) of U.S.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "Times Newswire"
        },
        {
          "text": "Figure 13: Previously identified social media accounts leveraged as part of the HaiEnergy campaign promote identical text from Times Newswire article and video of protest in Washington, D.C.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "Times Newswire"
        },
        {
          "text": "Specifically, we observed an article published to Times Newswire claiming that protests occurred in response to Taiwanese President Tsai Ing-wen’s recent transit through the U.S.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "Times Newswire"
        },
        {
          "text": "9, we observed an article titled “The Frequent Shootings in the United States are the Greatest Contempt for Human Rights” published via the press release service Times Newswire.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "Times Newswire"
        },
        {
          "text": "Subdomains Leveraged to Promote Pro-PRC Content from Times Newswire and World Newswire Intended to Masquerade as Content from Second-Level Domains of U.S.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "Times Newswire"
        }
      ]
    },
    {
      "id": "world-newswire",
      "name_zh": "World Newswire",
      "name_en": "World Newswire",
      "aliases": [],
      "category": "pr-firm",
      "role": "collaborator",
      "origin": "PRC",
      "summary_zh": "海賣（Shenzhen Haimai）經營的新聞稿發布服務。Mandiant 指出海訊社同時使用 Times Newswire 與 World Newswire，將親北京內容置入正規新聞網站的子網域。",
      "source_ids": [
        "src-google-glassbridge",
        "src-mandiant-haienergy-2023"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "4, 2022, we observed an article titled “US CIA: The Manifest of the Unholy Saint in Africa'' published via the press release service World Newswire.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "World Newswire"
        },
        {
          "text": "Figure 16: Original article posted to Online Nigeria (top left); article altered and posted to World Newswire (top right); article distributed to FinancialContent, Inc.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "World Newswire"
        },
        {
          "text": "Subdomains Leveraged to Promote Pro-PRC Content from Times Newswire and World Newswire Intended to Masquerade as Content from Second-Level Domains of U.S.",
          "source_id": "src-mandiant-haienergy-2023",
          "about": "World Newswire"
        }
      ]
    },
    {
      "id": "ifeng",
      "name_zh": "鳳凰網",
      "name_en": "Phoenix New Media (ifeng)",
      "aliases": [
        "凤凰网",
        "ifeng.com"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "HK",
      "summary_zh": "香港鳳凰傳媒旗下網站。IORG 記錄其與地方官媒協力傳播對台敘事；FactLink 記錄其參與衛星照與對日敘事的放大。",
      "source_ids": [
        "src-factlink-japan",
        "src-factlink-satellite",
        "src-iorg-38",
        "src-iorg-41"
      ],
      "confidence": "high",
      "claims": [
        {
          "text": "館長在10月27日訪北京時，接受香港媒體《大公報》、《鳳凰網》群訪時回答：「衛星系統根本無所遁形」、「認清兩岸差距愈來愈大」。",
          "source_id": "src-factlink-satellite",
          "about": "鳳凰網"
        },
        {
          "text": "中央官媒如央視、新華社等，呼應官方敘事，例如「高市早苗讓日本承擔代價」，「高市早苗要明白中國人民惹不得」；而地方官媒如北京日報、以及常與官媒呼應的香港媒體如鳳凰網，以及時政大V帳號則在既有敘事基礎上進一步加油添醋、強化情緒性語言與陰謀論式解讀，使訊息更具戲劇性與傳播力。",
          "source_id": "src-factlink-japan",
          "about": "鳳凰網"
        },
        {
          "text": "當日 10:19 至 14:06 間，中共官媒「環球網」「台海網」「鳳凰網」「澎湃新聞」「央視網」及官媒微博帳號「环球时报」「海外网」「环球网」「小央视频」「香港中通社」「中国新闻网」「厦门广电」「海峡导报」「中国新闻社」多使用相同「天氣晴朗」圖片，協力傳播中時報導內容。",
          "source_id": "src-iorg-41",
          "about": "鳳凰網"
        },
        {
          "text": "🇹🇼-🇨🇳 4 月 12 日 08:55 至 10:19 間，中共官媒「鳳凰網」「環球網」「香港新聞網」「大公文匯網」協力傳播介文汲在「中天新聞」節目影片中的說法。",
          "source_id": "src-iorg-41",
          "about": "鳳凰網"
        },
        {
          "text": "借台美關稅談判批評其「舔美卖台」（海峡飞虹）、「“巨款换关税”遭岛内痛批」（中国台湾网）同時放大 民眾黨 立院黨團批評民進黨政府「挟洋自重」說法（凤凰网）。",
          "source_id": "src-iorg-131",
          "about": "凤凰网"
        },
        {
          "text": "1 月份共有 437 則文本提及鄭麗文，主要內容包含前總統馬英九建議鄭麗文訪中「别穿高跟鞋，赶快练毛笔字」（凤凰网），並放大鄭麗文宣稱台灣主流民意期待兩岸交流的說法（海峡导报）以及「兩岸和平框架」主張（凤凰网）。",
          "source_id": "src-iorg-131",
          "about": "凤凰网"
        },
        {
          "text": "1 月 16 日，🇨🇳 鳳凰衛視「凤凰网」發布文本「国防部：我们对付“台独”武装就像瓮中捉鳖」，內文包含「问：岛内有舆论担忧大陆仿照美国对委内瑞拉做法来合理化对台采取行动。",
          "source_id": "src-iorg-131",
          "about": "凤凰网"
        },
        {
          "text": "1 月 30 日，🇨🇳 鳳凰衛視「凤凰网」發布來自 🇨🇳 福建日报「海峡导报」的文章「郑丽文抛“两岸和平框架”，岛内蓝白认可：和平是人民的殷切期盼」，內文包含「国民党主席郑丽文在专访透露今年上半年会先访问大陆、2028年执政后推“两岸和平框架”。",
          "source_id": "src-iorg-131",
          "about": "凤凰网"
        },
        {
          "text": "1 月 11 日，🇨🇳 鳳凰衛視「凤凰网」發布來自「台湾日月谈」文本「蔡正元和柯文哲同框翘脚，一起秀出“电子脚镣”」，引用名嘴蔡正元 1 月 10 日在其個人 Facebook 貼文使用的照片，文字內容包含「蔡正元 1 月 10 日晚间再度成为话题焦点。",
          "source_id": "src-iorg-131",
          "about": "凤凰网"
        },
        {
          "text": "評論同時獲得中共類官媒「鳳凰網」的轉發（7:58）。",
          "source_id": "src-iorg-38",
          "about": "鳳凰網"
        },
        {
          "text": "同日 14:26 ，中共類官媒「鳳凰網」發布內容完全相同的報導。",
          "source_id": "src-iorg-38",
          "about": "鳳凰網"
        },
        {
          "text": "隔日，中共官媒「中國台灣網」「鳳凰網」「台海網」「海峽飛虹」及「海峽之聲」以「根据岛内公布的一份最新民调」協力傳播相同內容，以網路投票結果代表台灣民眾全體意見。",
          "source_id": "src-iorg-38",
          "about": "鳳凰網"
        },
        {
          "text": "1 月 10 日中共類官媒「鳳凰網」刊出作者「明叔杂谈」（微信公眾號）於 9 日發布的評論，認為「在俄乌冲突爆发后，美国在俄罗斯身上尝到了甜头，正在稳步地将台湾“乌克兰化”」，並認為美國要把台灣變成「刺蝟」、「棋子」、「炮灰」。",
          "source_id": "src-iorg-38",
          "about": "鳳凰網"
        }
      ]
    },
    {
      "id": "hk-china-news",
      "name_zh": "香港新聞網",
      "name_en": "HK China News",
      "aliases": [
        "香港新闻网",
        "hkcna"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "IORG 標記為中共中央統戰部口徑的新聞網站，多次報導台灣立法院修法爭議並引用國民黨、民眾黨政治人物發言。",
      "source_ids": [
        "src-iorg-118",
        "src-iorg-131",
        "src-iorg-38",
        "src-iorg-41"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "🇹🇼-🇨🇳 2024 年 12 月 20 日 🇨🇳 中共中央统战部「香港新聞網」報導立法院修法爭議，內文引用 民眾黨 黃國昌對民進黨的批評稱「民進黨一手握著行政權，另一手則要求綠委癱瘓立法機構，在立法機構里搞戒嚴，賴清德已經跨越紅線」。",
          "source_id": "src-iorg-118",
          "about": "香港新聞網"
        },
        {
          "text": "🇹🇼-🇨🇳 2025 年 3 月 14 日 🇨🇳 中共中央统战部 「香港新聞網」引用 國民黨 朱立倫發言，針對賴清德包括恢復軍事審判制度在內的「賴 17 條」策略，宣稱這是「嚴重限制民眾言論自由、思想自由、行動自由，是台灣民主的麻煩製造者」，且「公然成為國際的麻煩製造者，成為兩岸的麻煩製造者，成為台灣民主的麻煩製造者」。",
          "source_id": "src-iorg-118",
          "about": "香港新聞網"
        },
        {
          "text": "當日 14:56 至隔日 9:18 之間，中共官媒「澎湃新聞」「環球網」「台海網」「香港新聞網」協力傳播此則中時新聞網的報導內容。",
          "source_id": "src-iorg-41",
          "about": "香港新聞網"
        },
        {
          "text": "🇹🇼-🇨🇳 4 月 12 日 08:55 至 10:19 間，中共官媒「鳳凰網」「環球網」「香港新聞網」「大公文匯網」協力傳播介文汲在「中天新聞」節目影片中的說法。",
          "source_id": "src-iorg-41",
          "about": "香港新聞網"
        },
        {
          "text": "🇹🇼-🇨🇳 4 月 13 日 10:49，中共官媒「香港新聞網」發布報導，宣稱尼米茲號在共軍演一開始「馬上就掉頭跑了」，並引述蔡正元的說法「美國是渣男」「幫助台灣，只剩下一張嘴」。",
          "source_id": "src-iorg-41",
          "about": "香港新聞網"
        },
        {
          "text": "1 月 9 日，🇨🇳 中共中央统战部「香港新聞網」發布文本「國共論壇據報有望本月底重啟」，內文包含「停辦多年的國共論壇有望在本月底舉行，中國國民黨副主席蕭旭岑將率團赴大陸參加。",
          "source_id": "src-iorg-131",
          "about": "香港新聞網"
        },
        {
          "text": "1 月 18 日，🇨🇳 中共中央统战部「香港新聞網」發布文本「台灣中天新聞記者涉“安全”問題 遭羈押禁見」，內文包含「民眾黨立委張啟楷17日表示，林宸佑在採訪或者當主播的過程中，深入去追蹤了非常多的事情，是一位受廣大民眾支持的名主播、名記者。",
          "source_id": "src-iorg-131",
          "about": "香港新聞網"
        },
        {
          "text": "1 月 21 日，🇨🇳 中共中央统战部「香港新聞網」發布文本「台記者涉“安全”問題遭羈押引島內輿論撻伐」，內文包含「台灣中天新聞記者林宸佑近日被指涉以金錢利誘軍人拍攝“投敵”影片，並刺探軍事機密，遭依涉犯所謂“國安法”等罪嫌羈押禁見。",
          "source_id": "src-iorg-131",
          "about": "香港新聞網"
        },
        {
          "text": "這則貼文在當日獲得中共官媒「香港新聞網」引用（18:01）。",
          "source_id": "src-iorg-38",
          "about": "香港新聞網"
        }
      ]
    },
    {
      "id": "china-news-service",
      "name_zh": "中國新聞社",
      "name_en": "China News Service",
      "aliases": [
        "中新社",
        "中国新闻社",
        "中国新闻网",
        "中國新聞網",
        "chinanews.com"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "IORG 標記為中共中央統戰部口徑的通訊社。其網站中國新聞網針對賴清德演講發表文章，YouTube 頻道亦發布對台影片。",
      "source_ids": [
        "src-iorg-118",
        "src-iorg-131",
        "src-iorg-41"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "至於2025年11月1日至12月6日期間，微博上對於高市早苗個人或其發言的討論，以官媒發文最多，包括北京晚報、中國新聞網與環球時報。",
          "source_id": "src-factlink-japan",
          "about": "中國新聞網"
        },
        {
          "text": "11月1日高市早苗與林信義在APEC會議見面後，中國外交部首先極快提出抗議，北京日報、央視、中國新聞網等官媒也迅速轉發外交部意見。",
          "source_id": "src-factlink-japan",
          "about": "中國新聞網"
        },
        {
          "text": "在2025年11月至12月初攻擊高市早苗與其言行的貼文中，官媒帳號如北京晚報、環球時報、中國新聞網、央視網，以及作為中國官方喉舌的民營媒體觀察者網及時政評論大V，以「日本軍國主義意圖對外擴張」為宣傳主旋律。",
          "source_id": "src-factlink-japan",
          "about": "中國新聞網"
        },
        {
          "text": "🇨🇳 2025 年 1 月 6 日 🇨🇳 中共中央统战部「中国新闻网」針對賴清德元旦演講發表文章，內文引述多位中國學者批評賴清德是「披着民主外衣，意在倚外谋独」。",
          "source_id": "src-iorg-118",
          "about": "中国新闻网"
        },
        {
          "text": "同日，多個中共官媒跨平台社交媒體帳號皆發布了相同的動畫影片，包括「中新社」的 Twitter 帳號「中國新聞社」（15:45）、bilibili 帳號「东部战区」（17:37）、微博帳號「东部战区」（17:41）。",
          "source_id": "src-iorg-41",
          "about": "中新社"
        },
        {
          "text": "YT 同日，中共官媒「中新社」的 YouTube 頻道「中国新闻社」亦發布影片，將原片編輯為直式，並加上說明文字及中新社頻道名稱。",
          "source_id": "src-iorg-41",
          "about": "中新社"
        },
        {
          "text": "當日 10:19 至 14:06 間，中共官媒「環球網」「台海網」「鳳凰網」「澎湃新聞」「央視網」及官媒微博帳號「环球时报」「海外网」「环球网」「小央视频」「香港中通社」「中国新闻网」「厦门广电」「海峡导报」「中国新闻社」多使用相同「天氣晴朗」圖片，協力傳播中時報導內容。",
          "source_id": "src-iorg-41",
          "about": "中国新闻社"
        },
        {
          "text": "1 月份共有 329 則文本提及劉世芳，主要內容為国台办在 1 月 7 日召開記者會宣布將鄭英耀「列为 “台独” 顽固分子」（国台办）、宣稱原因是「制造校园 “绿色恐怖”」（环球网），並強調其「劣迹斑斑，反对两岸教育交流第一人」（中国新闻网）。",
          "source_id": "src-iorg-131",
          "about": "中国新闻网"
        },
        {
          "text": "1 月份共有 293 則文本提及蔡正元，主要內容為借蔡正元介入「三中案」批評民進黨政府「编织罪名」（中国新闻社）、「政治追杀异己」（中国东南卫视官方频道）、讓唐湘龍「当场抹泪」（中国东南卫视官方频道），並放大蔡正元對此事件觀點「哪怕深陷狱中，反“台独” 立场永不改变」（中国新闻社）、「我们要在每一个角落作战，推翻民进党」（中国东南卫视官方频道）。",
          "source_id": "src-iorg-131",
          "about": "中国新闻社"
        },
        {
          "text": "1 月 30 日，🇨🇳 广电总台「海峡飞虹」發布來自 🇨🇳 中国新闻社「中新社」的文章「国共机制化交流重启 台专家指“符合多数人的期盼”」，內文包含「“国共两党智库论坛”2 月 3 日将在北京举行。",
          "source_id": "src-iorg-131",
          "about": "中国新闻社"
        }
      ]
    },
    {
      "id": "fujian-daily",
      "name_zh": "福建日報",
      "name_en": "Fujian Daily",
      "aliases": [
        "福建日报"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "福建省委機關報，海峽導報與台海網的上級單位。IORG 在中共月報中多次記錄其對台傳播鏈。",
      "source_ids": [
        "src-iorg-118",
        "src-iorg-131"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "🇨🇳 2025 年 2 月 22 日 🇨🇳 福建日报「台海网」發表評論稱民進黨「把制度和民主作为抗拒统一、分裂国家的借口」，且配合西方「民主对抗威权」敘事，但川普「亲手撕碎了美西方虚伪民主叙事的包装纸」。",
          "source_id": "src-iorg-118",
          "about": "福建日报"
        },
        {
          "text": "🇹🇼-🇨🇳 2024 年 1 月 13 日 🇨🇳 福建日报「海峡导报」針對美方於選前舉行媒體電話簡報會一事發表評論，認為美國此舉「罕见」「反常」「甘冒“介选”质疑」。",
          "source_id": "src-iorg-118",
          "about": "福建日报"
        },
        {
          "text": "🇨🇳 2024 年 12 月 31 日 🇨🇳 福建日报「海峡导报社」以「民主退步的2024：斗鸡搭草台，台独变独裁」為標題發表評論，內文預言「只要2028年蓝白能够完成整合，“双少数”的赖清德将毫无一战之力，或将成为台湾地区领导人直选以来首个未能连任的领导人」。",
          "source_id": "src-iorg-118",
          "about": "福建日报"
        },
        {
          "text": "🇹🇼-🇨🇳 2024 年 4 月 22 日 🇨🇳 福建日报「海峡导报社」報導，針對國民黨智庫傳出裁員，引用 國民黨 國民黨批評「民进党透过“党产会”抄家式的追杀在野党，眼中只有政治追杀，早就把所谓公平正义抛诸脑后」。",
          "source_id": "src-iorg-118",
          "about": "福建日报"
        },
        {
          "text": "🇹🇼-🇨🇳 2025 年 2 月 18 日 🇨🇳 福建广播影视 TikTok 帳號「大咖開麥」及 🇨🇳 福建日报 抖音帳號「海峡导报」都發布影片，內容為呂禮詩於政論節目上稱中國電影「哪吒 2」在台灣可惜沒有排上上映抽籤（即無法在台灣上映），認為「台灣的言論自由，台灣的各種自由，會不會慢慢的讓大家覺得越來越只是一場笑話」。",
          "source_id": "src-iorg-118",
          "about": "福建日报"
        },
        {
          "text": "🇨🇳 2024 年 12 月 31 日 🇨🇳 福建日报「海峡导报社」發表文章回顧 2024 年台灣政治發展，內文稱賴清德司法迫害柯文哲「接连突破民主底线，将绿色独裁推进至戒严边缘」，又動員「青鳥」施壓在野黨，讓 2024 年成為「民主退步的2024」。",
          "source_id": "src-iorg-118",
          "about": "福建日报"
        },
        {
          "text": "5-6 日，有 6 個中共官媒微博帳號發布含有相同內容文本，包含 🇨🇳 广电总台「看台海」、🇨🇳 福建日报「福建东南网」。",
          "source_id": "src-iorg-131",
          "about": "福建日报"
        },
        {
          "text": "1 月 30 日，🇨🇳 鳳凰衛視「凤凰网」發布來自 🇨🇳 福建日报「海峡导报」的文章「郑丽文抛“两岸和平框架”，岛内蓝白认可：和平是人民的殷切期盼」，內文包含「国民党主席郑丽文在专访透露今年上半年会先访问大陆、2028年执政后推“两岸和平框架”。",
          "source_id": "src-iorg-131",
          "about": "福建日报"
        },
        {
          "text": "1 月 17 日，🇨🇳 福建日报「海峡导报」發布抖音，標題為「中天知名记者林宸佑被羁押，或因得罪民进党引祸上身」。",
          "source_id": "src-iorg-131",
          "about": "福建日报"
        }
      ]
    },
    {
      "id": "takungpao-wenweipo-net",
      "name_zh": "大公文匯網",
      "name_en": "Ta Kung Wen Wei Media (TKWW)",
      "aliases": [
        "大公文汇网",
        "TKWW"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "HK",
      "summary_zh": "香港大公報與文匯報的合併網站。IORG 記錄其與鳳凰網、環球網、香港新聞網協力傳播台灣名嘴在中天新聞節目中的說法。",
      "source_ids": [
        "src-iorg-38",
        "src-iorg-41"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "🇨🇳 4 月 12 日 08:37 中共官媒「大公文匯網」發布報導，宣稱「據外媒報道，原本山東艦抵達台灣東部海域之際，尼米茲號航母遠遠地保持跟蹤監視狀態，但解放軍東部戰區的演習 8 日一開始，美國航母就重演去年 8 月的那一幕─離台島遠遠的」。",
          "source_id": "src-iorg-41",
          "about": "大公文匯網"
        },
        {
          "text": "🇹🇼-🇨🇳 4 月 12 日 08:55 至 10:19 間，中共官媒「鳳凰網」「環球網」「香港新聞網」「大公文匯網」協力傳播介文汲在「中天新聞」節目影片中的說法。",
          "source_id": "src-iorg-41",
          "about": "大公文匯網"
        },
        {
          "text": "26 日 8:42，中共官媒「大公文匯網」的發表作者為朱穗怡的評論，認為「美國政客不僅把台灣當作刺激和牽制中國大陸的棋子，還把台灣當作為自己累積政治利益的提款機」，麥卡錫「搞風搞雨」「台灣是最大受害者」。",
          "source_id": "src-iorg-38",
          "about": "大公文匯網"
        },
        {
          "text": "1 月 31 日 10:07 中共官媒「大公文匯網」刊出輔仁大學兩岸關係學暨國際關係學教授、海峽兩岸學術文化交流協會副理事長潘錫堂的評論，標題為〈台美勾連是台海不安的根源〉，內容並以「竄台」形容麥卡錫訪台，引用「不少大陸軍事專家分析」，，認為如果麥卡錫訪台，中國將採取「更全面震撼的行動方式」、「更常態化方式」「讓美台都知道台海問題絕對不容挑釁」。",
          "source_id": "src-iorg-38",
          "about": "大公文匯網"
        }
      ]
    },
    {
      "id": "hk-wenweipo",
      "name_zh": "香港文匯報",
      "name_en": "Wen Wei Po",
      "aliases": [
        "文匯報",
        "文汇报",
        "香港文汇报"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "HK",
      "summary_zh": "FactLink 描述為具中國官方性質的香港報紙，記錄其散播與中國高度相關的不實訊息後快速下架刪文。",
      "source_ids": [
        "src-factlink-hackleak",
        "src-factlink-satellite"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "On January 3, Hong Kong’s Wen Wei Po quoted Chiu Yi’s remarks, mentioning Lai Ching-te’s mistress and illegitimate child.",
          "source_id": "src-dtl-multiverse",
          "about": "Wen Wei Po"
        },
        {
          "text": "〉影片，由《澎湃新聞》、《大象新聞》、香港《文匯報》等多家媒體、論壇帳號、多個抖音帳號轉分享。",
          "source_id": "src-factlink-satellite",
          "about": "香港《文匯報》"
        },
        {
          "text": "此外，與中國高度相關的臉書粉專「兩岸頭條」、具有中國官方性質的香港《文匯報》也接連散播相同訊息。",
          "source_id": "src-factlink-hackleak",
          "about": "文匯報"
        },
        {
          "text": "但在台灣查證此傳言為不實訊息之後，兩岸頭條和香港文匯報皆快速下架刪文。",
          "source_id": "src-factlink-hackleak",
          "about": "文匯報"
        }
      ]
    },
    {
      "id": "qiaobao",
      "name_zh": "僑報網",
      "name_en": "China Press (Qiaobao)",
      "aliases": [
        "侨报网",
        "僑報"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "面向海外華人的官媒網站。IORG 記錄其發布報導並引用台灣名嘴蔡正元的意見。",
      "source_ids": [
        "src-iorg-38",
        "src-iorg-41"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "🇨🇳 4 月 10 日 07:12 至 4 月 11 日 08:11 間，中共官媒「大公文匯網」「大公文匯網」「僑報網」「海峽之聲」「鳳凰網」「鳳凰網」「鳳凰網」發布報導，持續傳播此動畫影片。",
          "source_id": "src-iorg-41",
          "about": "僑報網"
        },
        {
          "text": "蔡正元的意見於當日獲得中資粉專「兩岸頭條」（9:12）及中共官媒「僑報網」（16:47）分享及引用。",
          "source_id": "src-iorg-38",
          "about": "僑報網"
        },
        {
          "text": "隔日（25），介文汲的意見獲得中共官媒「僑報網」引用。",
          "source_id": "src-iorg-38",
          "about": "僑報網"
        }
      ]
    },
    {
      "id": "dongnan-tv",
      "name_zh": "東南衛視",
      "name_en": "Southeast TV",
      "aliases": [
        "中国东南卫视官方频道",
        "中國東南衛視",
        "东南卫视",
        "中国东南卫视"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "福建廣播影視集團旗下衛視。IORG 記錄其 YouTube 官方頻道發布「推翻民進黨」等對台政治宣傳影片。",
      "source_ids": [
        "src-iorg-131",
        "src-iorg-41"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "🇨🇳 2024 年 1 月 14 日 🇨🇳 福建广播影视「东南卫视」評論台灣大選結果。",
          "source_id": "src-iorg-118",
          "about": "东南卫视"
        },
        {
          "text": "「中国东南卫视」是中共官媒，曾出現在 IORG 報告之中 DA.39 ，「中国人民解放军」、「军迷天下」、「看看新闻」是以非官方狀態直接協助傳播央視影片及其他中共官媒內容，而「兵鉴堂」、「军武侦察兵」則是中國網路節目，內容亦親近中國。",
          "source_id": "src-iorg-41",
          "about": "中国东南卫视"
        },
        {
          "text": "1 月份共有 293 則文本提及蔡正元，主要內容為借蔡正元介入「三中案」批評民進黨政府「编织罪名」（中国新闻社）、「政治追杀异己」（中国东南卫视官方频道）、讓唐湘龍「当场抹泪」（中国东南卫视官方频道），並放大蔡正元對此事件觀點「哪怕深陷狱中，反“台独” 立场永不改变」（中国新闻社）、「我们要在每一个角落作战，推翻民进党」（中国东南卫视官方频道）。",
          "source_id": "src-iorg-131",
          "about": "中国东南卫视官方频道"
        }
      ]
    },
    {
      "id": "guangming-daily",
      "name_zh": "光明日報",
      "name_en": "Guangming Daily",
      "aliases": [
        "光明日报"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "中共中央機關報之一。Doublethink Lab 的 GoLaxy 文件分析記錄其與出門問問（Mobvoi）深度合作，2020 年起共同推出 AI 虛擬主播「小明」等產品。",
      "source_ids": [
        "src-dtl-golaxy"
      ],
      "confidence": "low",
      "claims": [
        {
          "text": "173 Liu Wenxuan, ‘Mobvoi joined Guangming Daily to launch AI virtual anchor’ [出门问问携手光明日报发布推出AI虚拟主播].",
          "source_id": "src-aspi-00c2db",
          "about": "Guangming Daily"
        }
      ]
    },
    {
      "id": "xiamen-media",
      "name_zh": "廈門廣電",
      "name_en": "Xiamen Media Group",
      "aliases": [
        "厦门广电",
        "廈門廣播電視集團"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "廈門市廣播電視集團。IORG 記錄其微博帳號與環球網、台海網、鳳凰網等官媒帳號同步使用相同素材發布對台內容。",
      "source_ids": [
        "src-dtl-multiverse",
        "src-iorg-41"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "當日 10:19 至 14:06 間，中共官媒「環球網」「台海網」「鳳凰網」「澎湃新聞」「央視網」及官媒微博帳號「环球时报」「海外网」「环球网」「小央视频」「香港中通社」「中国新闻网」「厦门广电」「海峡导报」「中国新闻社」多使用相同「天氣晴朗」圖片，協力傳播中時報導內容。",
          "source_id": "src-iorg-41",
          "about": "厦门广电"
        }
      ]
    },
    {
      "id": "china-review-news",
      "name_zh": "中評社",
      "name_en": "China Review News",
      "aliases": [
        "中評網",
        "中评社",
        "中评网",
        "中國評論通訊社"
      ],
      "category": "state-media",
      "role": "amplifier",
      "origin": "HK",
      "summary_zh": "香港中國評論通訊社。IORG 記錄其中評網發布涉台評論文章，如上海交通大學台灣研究中心主任盛九元的「虛構民主對抗專制敘事可休矣」。",
      "source_ids": [
        "src-iorg-11",
        "src-iorg-118"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "🇨🇳 2025 年 6 月 11 日 🇨🇳 中評社「中評網」發布作者為「上海交通大學台灣研究中心主任盛九元」的評論文章「虛構民主對抗專制敘事可休矣」，內文扭曲台灣民主，同時頌揚中共「全過程民主」，將雙方制度比擬為「假民主 VS 真民主」。",
          "source_id": "src-iorg-118",
          "about": "中評網"
        },
        {
          "text": "1 月 14 日，🇨🇳 国台办「国台办」發布文本「国务院台办新闻发布会辑录（2026-01-14）」，內文包含「香港中评社记者：美国日前派兵强行控制委内瑞拉总统马杜罗夫妇并移送出境引发岛内高度关注。",
          "source_id": "src-iorg-131",
          "about": "中评社"
        }
      ]
    },
    {
      "id": "silicon-intelligence",
      "name_zh": "硅基智能",
      "name_en": "Silicon Intelligence",
      "aliases": [
        "Silicon Intelligence Technology"
      ],
      "category": "tech-vendor",
      "role": "collaborator",
      "origin": "PRC",
      "summary_zh": "南京數位人技術公司。ASPI 與 Midu 並列為說服性技術的兩大要角；與華為簽署「數字人＋盤古大模型」合作協議，並獲騰訊與紅杉資本中國投資。",
      "source_ids": [
        "src-aspi-00c2db"
      ],
      "confidence": "low",
      "claims": [
        {
          "text": "70 Silicon Intelligence [硅基智能], online.",
          "source_id": "src-aspi-00c2db",
          "about": "硅基智能"
        },
        {
          "text": "71 ‘Silicon Intelligence’ [硅基智能], PGYER, online; Silicon Intelligence [硅基智能], online.",
          "source_id": "src-aspi-00c2db",
          "about": "硅基智能"
        },
        {
          "text": "Silicon Intelligence and 360 Group reached a strategic cooperation in China (Nanjing) Software Valley!’ [硅基智能：战略签约！",
          "source_id": "src-aspi-00c2db",
          "about": "硅基智能"
        },
        {
          "text": "Silicon Intelligence’ [南京雨花台公安分局“警企党风廉政建设互动”在硅基智能顺利开展].",
          "source_id": "src-aspi-00c2db",
          "about": "硅基智能"
        }
      ]
    },
    {
      "id": "goertek",
      "name_zh": "歌爾股份",
      "name_en": "Goertek",
      "aliases": [
        "歌尔股份有限公司",
        "歌爾聲學"
      ],
      "category": "tech-vendor",
      "role": "collaborator",
      "origin": "PRC",
      "summary_zh": "山東電子製造商，智慧穿戴與 VR 產品的全球供應商。ASPI 記錄其參與軍民融合項目，並指出這顯示其與中國戰略目標的連結。",
      "source_ids": [
        "src-aspi-00c2db"
      ],
      "confidence": "low",
      "claims": [
        {
          "text": "Goertek’s involvement in military–civil fusion projects highlights its connection to China’s strategic goals.",
          "source_id": "src-aspi-00c2db",
          "about": "Goertek"
        },
        {
          "text": "US Entity List in March 2023.148 Goertek has long been investing in Beihang University.",
          "source_id": "src-aspi-00c2db",
          "about": "Goertek"
        },
        {
          "text": "Source: ‘Goertek party committee held a series of activities to celebrate July 1st’, Goertek, 30 June 2023, online.",
          "source_id": "src-aspi-00c2db",
          "about": "Goertek"
        },
        {
          "text": "128 ‘Goertek: Prominent player in global VR Industry’, China Daily, 10 September 2022, online.",
          "source_id": "src-aspi-00c2db",
          "about": "Goertek"
        },
        {
          "text": "129 Goertek, online.",
          "source_id": "src-aspi-00c2db",
          "about": "Goertek"
        },
        {
          "text": "‘Goertek Inc.",
          "source_id": "src-aspi-00c2db",
          "about": "Goertek"
        },
        {
          "text": "132 ‘Goertek by the numbers’, Goertek, online.",
          "source_id": "src-aspi-00c2db",
          "about": "Goertek"
        },
        {
          "text": "133 According to Importinfo.com, for example, Goertek provides goods for companies such as Amazon, Sony and Google.",
          "source_id": "src-aspi-00c2db",
          "about": "Goertek"
        },
        {
          "text": "135 Goertek manufactures VR products for ByteDance subsidiary, Pico.",
          "source_id": "src-aspi-00c2db",
          "about": "Goertek"
        },
        {
          "text": "See ‘Eifeh Strom, ‘Pico, Goertek bullish on VR’, DigiTimes Asia, 23 March 2022, online.",
          "source_id": "src-aspi-00c2db",
          "about": "Goertek"
        },
        {
          "text": "140 ‘Goertek wins Microsoft’s 2017 “CTE Partner” award’ [歌尔股份荣膺微软2017 “CTE Partner”奖项], Goertek, 4 August 2017, online.",
          "source_id": "src-aspi-00c2db",
          "about": "Goertek"
        },
        {
          "text": "142 ‘About Goertek’s Design Center’ [关于歌尔设计中心], Goertek, online.",
          "source_id": "src-aspi-00c2db",
          "about": "Goertek"
        },
        {
          "text": "At the time of writing, Goertek still listed Cisco as a client.",
          "source_id": "src-aspi-00c2db",
          "about": "Goertek"
        },
        {
          "text": "Innovation Center’ in Qingdao; see ‘Qualcomm, Goertek join hands for microelectronics advances in Laoshan’, China Daily, 16 April 2019, online.",
          "source_id": "src-aspi-00c2db",
          "about": "Goertek"
        },
        {
          "text": "144 ‘Goertek Inc.",
          "source_id": "src-aspi-00c2db",
          "about": "Goertek"
        },
        {
          "text": "149 ‘Beihang University receives Ұ200 million donation from Goertek’, Goertek, 3 May 2016, online.",
          "source_id": "src-aspi-00c2db",
          "about": "Goertek"
        },
        {
          "text": "152 ‘Your advanced UAV manufacturing partner’, Goertek Robotics, online.",
          "source_id": "src-aspi-00c2db",
          "about": "Goertek"
        },
        {
          "text": "Report (6)｜Goertek: Investing in Qingdao to build a global R&D center].",
          "source_id": "src-aspi-00c2db",
          "about": "Goertek"
        },
        {
          "text": "159 Goertek Inc., 2023 annual report summary, announcement no.",
          "source_id": "src-aspi-00c2db",
          "about": "Goertek"
        }
      ]
    },
    {
      "id": "mobvoi",
      "name_zh": "出門問問",
      "name_en": "Mobvoi",
      "aliases": [
        "出门问问",
        "Weta365"
      ],
      "category": "tech-vendor",
      "role": "collaborator",
      "origin": "PRC",
      "summary_zh": "中國生成式 AI 公司。ASPI 記錄 Spamouflage 帳號張貼的影片疑似以其 Weta365 應用生成，並推測其與中國安全或情報機構可能存在更深合作（原文為推測語氣）；Doublethink Lab 另記錄其與光明日報合作推出 AI 虛擬主播。",
      "source_ids": [
        "src-aspi-2024",
        "src-dtl-golaxy"
      ],
      "confidence": "low",
      "claims": [
        {
          "text": "174 Weta365 [奇妙元], online.",
          "source_id": "src-aspi-00c2db",
          "about": "Weta365"
        }
      ]
    },
    {
      "id": "midu",
      "name_zh": "蜜度",
      "name_en": "Midu",
      "aliases": [
        "蜜度科技",
        "Midu Technology"
      ],
      "category": "tech-vendor",
      "role": "collaborator",
      "origin": "PRC",
      "summary_zh": "南京語言智能公司。ASPI 專章記錄其提供生成式 AI 工具供中國政府用於輿論管理，客戶以其產品強化監控與管制中國國內輿論的能力。",
      "source_ids": [
        "src-aspi-00c2db"
      ],
      "confidence": "low",
      "claims": [
        {
          "text": "Founded in 2009, Midu Technology Co.",
          "source_id": "src-aspi-00c2db",
          "about": "Midu"
        },
        {
          "text": "Midu’s Sina Public Opinion (新浪舆情通) offers real-time alerts on social-media trends.",
          "source_id": "src-aspi-00c2db",
          "about": "Midu"
        },
        {
          "text": "Midu has a number of joint ventures with both Chinese and international partners.",
          "source_id": "src-aspi-00c2db",
          "about": "Midu"
        },
        {
          "text": "China’s public-security system is also using Midu’s products.",
          "source_id": "src-aspi-00c2db",
          "about": "Midu"
        },
        {
          "text": "Midu Language Intelligence and Vertical Large Model Enterprise.",
          "source_id": "src-aspi-00c2db",
          "about": "Midu"
        },
        {
          "text": "43 ‘Release of Midu’s intelligent Yuqing V Assistant’ [蜜度发布智能舆情V助手], People.cn, 5 July 2024, online.",
          "source_id": "src-aspi-00c2db",
          "about": "Midu"
        },
        {
          "text": "广告学院携手蜜度信息成立’品牌大数据实验室’], China News Network, 26 April 2019, online; ‘Shanghai Midu Information Technology Co.",
          "source_id": "src-aspi-00c2db",
          "about": "Midu"
        }
      ]
    },
    {
      "id": "chen-chih-han",
      "name_zh": "陳之漢",
      "name_en": "Chen Chih-han (Kuan Chang)",
      "aliases": [
        "館長",
        "舘長"
      ],
      "category": "commentator",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣網紅。FactLink 記錄其影片與發言被中共官媒抓取為「島內輿論」的來源之一；IORG 記錄人民日報引用其批評民進黨的發言，並報導其赴中行程。",
      "source_ids": [
        "src-factlink-satellite",
        "src-factlink-japan",
        "src-iorg-131"
      ],
      "confidence": "medium",
      "sensitivity": "domestic-named",
      "claims": [
        {
          "text": "FactLink研究團隊觀察到，第二波宣傳高峰是10月27日後，中國官媒營造「島內輿論」，報導切入點為「島內如何看大陸發布台高清衛星圖」、「衛星視角瞰中國台灣省，島內反應來了」、「館長談大陸發布台灣省衛星圖」，截取特定台灣媒體、政治網紅、台灣政治名嘴（中國稱為台灣時事評論員）的分析與評論，甚至取材網友留言，營造「島內輿論」，創造話題熱度。",
          "source_id": "src-factlink-satellite",
          "about": "館長"
        },
        {
          "text": "「島內輿論」的另一個來源是台灣網紅館長。",
          "source_id": "src-factlink-satellite",
          "about": "館長"
        },
        {
          "text": "館長在10月27日訪北京時，接受香港媒體《大公報》、《鳳凰網》群訪時回答：「衛星系統根本無所遁形」、「認清兩岸差距愈來愈大」。",
          "source_id": "src-factlink-satellite",
          "about": "館長"
        },
        {
          "text": "可知館長影片成為「島內輿論」，打造塑造中國衛星科技進步的內外宣傳素材。",
          "source_id": "src-factlink-satellite",
          "about": "館長"
        },
        {
          "text": "比如多篇官媒及大V帳號貼文轉述日本前首相鳩山由紀夫「怒斥」高市早苗「愈小的狗越會叫」、或者引述台灣網紅館長「我們中國人的事情日本閉嘴」等發言。",
          "source_id": "src-factlink-japan",
          "about": "館長"
        },
        {
          "text": "🇨🇳 2025 年 6 月 5 日 🇨🇳 人民日报「环球网」再度發表作者為「程东」的文章，針對網紅館長陳之漢赴中，開頭引用未知來源的「岛内舆论」稱綠營批評館長代表「绿营其实是害怕了，担忧他们构筑的认知围墙被陈之汉突破」。",
          "source_id": "src-iorg-118",
          "about": "陳之漢"
        },
        {
          "text": "內容評論館長陳之漢赴中行程，引用陳之漢批評民進黨「用谎言欺骗人民」，宣稱這是「要用不带滤镜的真实镜头，戳破台湾绿营长期散布的谣言，撕开民进党当局精心编织的“信息茧房”」。",
          "source_id": "src-iorg-118",
          "about": "陳之漢"
        }
      ]
    },
    {
      "id": "hou-han-ting",
      "name_zh": "侯漢廷",
      "name_en": "Hou Han-ting",
      "aliases": [],
      "category": "commentator",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "新黨台北市議員。IORG 記錄其指控 USAID 補助台灣民主實驗室、檢舉沈伯洋接受境外資金，相關說法經香港大公文匯發表評論並引述。",
      "source_ids": [
        "src-iorg-118",
        "src-iorg-131"
      ],
      "confidence": "medium",
      "sensitivity": "domestic-named",
      "claims": [
        {
          "text": "🇹🇼-🇨🇳 2025 年 5 月 25 日 🇨🇳 香港大公文匯「大公文匯」針對 新黨 侯漢廷檢舉沈伯洋接受境外資金一事發表評論，內文引述侯漢廷觀點，認為「沈柏洋接受境外勢力贊助，成立並發展組織、假民主介入台灣政治，抨擊政黨、製造敵人，近期更公然呼籲推動大罷免，干擾政治運行」。",
          "source_id": "src-iorg-118",
          "about": "侯漢廷"
        }
      ]
    },
    {
      "id": "wuse-juexing",
      "name_zh": "無色覺醒",
      "name_en": "Wuse Juexing",
      "aliases": [],
      "category": "domestic-amplifier",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "旺中集團旗下粉專／節目。IORG 記錄其與「無色覺醒」「正常發揮」「大新聞大爆卦」「頭條開講」在同一時間點群聚發表內容完全相同的貼文。",
      "source_ids": [
        "src-iorg-38",
        "src-iorg-41"
      ],
      "confidence": "medium",
      "sensitivity": "domestic-named",
      "related": [
        {
          "target_id": "wangwang-china-times-group",
          "relation": "subsidiary-of",
          "note": "旺中集團旗下粉專／節目"
        }
      ],
      "claims": [
        {
          "text": "當日 12:15 旺中集團粉專「無色覺醒」「正常發揮」「大新聞大爆卦」「頭條開講」亦群聚發表訊息內容完全相同的貼文，留言內容亦同。",
          "source_id": "src-iorg-41",
          "about": "無色覺醒"
        },
        {
          "text": "另外，中天新聞網引用蔡正元的報導（12:43），也獲得旺中集團旗下節目「大新聞大爆卦」「無色覺醒」「頭條開講」「正常發揮」 的群聚分享（17:30）。",
          "source_id": "src-iorg-38",
          "about": "無色覺醒"
        }
      ]
    },
    {
      "id": "zhengchang-fahui",
      "name_zh": "正常發揮",
      "name_en": "Zhengchang Fahui",
      "aliases": [],
      "category": "domestic-amplifier",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "旺中集團旗下粉專／節目。IORG 記錄其與「無色覺醒」「正常發揮」「大新聞大爆卦」「頭條開講」在同一時間點群聚發表內容完全相同的貼文。",
      "source_ids": [
        "src-iorg-38",
        "src-iorg-41"
      ],
      "confidence": "medium",
      "sensitivity": "domestic-named",
      "related": [
        {
          "target_id": "wangwang-china-times-group",
          "relation": "subsidiary-of",
          "note": "旺中集團旗下粉專／節目"
        }
      ],
      "claims": [
        {
          "text": "當日 12:15 旺中集團粉專「無色覺醒」「正常發揮」「大新聞大爆卦」「頭條開講」亦群聚發表訊息內容完全相同的貼文，留言內容亦同。",
          "source_id": "src-iorg-41",
          "about": "正常發揮"
        },
        {
          "text": "另外，中天新聞網引用蔡正元的報導（12:43），也獲得旺中集團旗下節目「大新聞大爆卦」「無色覺醒」「頭條開講」「正常發揮」 的群聚分享（17:30）。",
          "source_id": "src-iorg-38",
          "about": "正常發揮"
        }
      ]
    },
    {
      "id": "daxinwen-dabaogua",
      "name_zh": "大新聞大爆卦",
      "name_en": "Daxinwen Dabaogua",
      "aliases": [],
      "category": "domestic-amplifier",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "旺中集團旗下粉專／節目。IORG 記錄其與「無色覺醒」「正常發揮」「大新聞大爆卦」「頭條開講」在同一時間點群聚發表內容完全相同的貼文。",
      "source_ids": [
        "src-iorg-38",
        "src-iorg-41"
      ],
      "confidence": "medium",
      "sensitivity": "domestic-named",
      "related": [
        {
          "target_id": "wangwang-china-times-group",
          "relation": "subsidiary-of",
          "note": "旺中集團旗下粉專／節目"
        }
      ],
      "claims": [
        {
          "text": "當日 12:15 旺中集團粉專「無色覺醒」「正常發揮」「大新聞大爆卦」「頭條開講」亦群聚發表訊息內容完全相同的貼文，留言內容亦同。",
          "source_id": "src-iorg-41",
          "about": "大新聞大爆卦"
        },
        {
          "text": "另外，中天新聞網引用蔡正元的報導（12:43），也獲得旺中集團旗下節目「大新聞大爆卦」「無色覺醒」「頭條開講」「正常發揮」 的群聚分享（17:30）。",
          "source_id": "src-iorg-38",
          "about": "大新聞大爆卦"
        }
      ]
    },
    {
      "id": "toutiao-kaijiang",
      "name_zh": "頭條開講",
      "name_en": "Toutiao Kaijiang",
      "aliases": [],
      "category": "domestic-amplifier",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "旺中集團旗下粉專／節目。IORG 記錄其與「無色覺醒」「正常發揮」「大新聞大爆卦」「頭條開講」在同一時間點群聚發表內容完全相同的貼文。",
      "source_ids": [
        "src-iorg-38",
        "src-iorg-41"
      ],
      "confidence": "medium",
      "sensitivity": "domestic-named",
      "related": [
        {
          "target_id": "wangwang-china-times-group",
          "relation": "subsidiary-of",
          "note": "旺中集團旗下粉專／節目"
        }
      ],
      "claims": [
        {
          "text": "當日 12:15 旺中集團粉專「無色覺醒」「正常發揮」「大新聞大爆卦」「頭條開講」亦群聚發表訊息內容完全相同的貼文，留言內容亦同。",
          "source_id": "src-iorg-41",
          "about": "頭條開講"
        },
        {
          "text": "另外，中天新聞網引用蔡正元的報導（12:43），也獲得旺中集團旗下節目「大新聞大爆卦」「無色覺醒」「頭條開講」「正常發揮」 的群聚分享（17:30）。",
          "source_id": "src-iorg-38",
          "about": "頭條開講"
        }
      ]
    },
    {
      "id": "anti-dpp-fanzhuantuan",
      "name_zh": "反民進黨粉絲團",
      "name_en": "Anti-DPP Fan Page",
      "aliases": [],
      "category": "domestic-amplifier",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣臉書粉專。IORG 記錄其與「反民進黨粉絲團」「民間大小事」「空心菜政府」在同一時間點群聚發文並群聚分享。",
      "source_ids": [
        "src-iorg-38",
        "src-iorg-41"
      ],
      "confidence": "medium",
      "sensitivity": "domestic-named",
      "claims": [
        {
          "text": "群聚發文 同日，內容農場「密訊」發布和中時文章標題及內容一致的文章，並獲得粉專「反民進黨粉絲團」「民間大小事」「空心菜政府」群聚分享（23:00-01）。",
          "source_id": "src-iorg-38",
          "about": "反民進黨粉絲團"
        }
      ]
    },
    {
      "id": "minjian-daxiaoshi",
      "name_zh": "民間大小事",
      "name_en": "Minjian Daxiaoshi",
      "aliases": [],
      "category": "domestic-amplifier",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣臉書粉專。IORG 記錄其與「反民進黨粉絲團」「民間大小事」「空心菜政府」在同一時間點群聚發文並群聚分享。",
      "source_ids": [
        "src-iorg-38",
        "src-iorg-41"
      ],
      "confidence": "medium",
      "sensitivity": "domestic-named",
      "claims": [
        {
          "text": "群聚發文 同日，內容農場「密訊」發布和中時文章標題及內容一致的文章，並獲得粉專「反民進黨粉絲團」「民間大小事」「空心菜政府」群聚分享（23:00-01）。",
          "source_id": "src-iorg-38",
          "about": "民間大小事"
        }
      ]
    },
    {
      "id": "kongxincai-zhengfu",
      "name_zh": "空心菜政府",
      "name_en": "Kongxincai Zhengfu",
      "aliases": [],
      "category": "domestic-amplifier",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "台灣臉書粉專。IORG 記錄其與「反民進黨粉絲團」「民間大小事」「空心菜政府」在同一時間點群聚發文並群聚分享。",
      "source_ids": [
        "src-iorg-38",
        "src-iorg-41"
      ],
      "confidence": "medium",
      "sensitivity": "domestic-named",
      "claims": [
        {
          "text": "群聚發文 同日，內容農場「密訊」發布和中時文章標題及內容一致的文章，並獲得粉專「反民進黨粉絲團」「民間大小事」「空心菜政府」群聚分享（23:00-01）。",
          "source_id": "src-iorg-38",
          "about": "空心菜政府"
        }
      ]
    },
    {
      "id": "chunghua-microvision",
      "name_zh": "中華微視",
      "name_en": "Chunghua Microvision",
      "aliases": [],
      "category": "state-media",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "FactLink 描述為香港親中媒體，IORG 記錄其臉書粉專與「兩岸頭條」共同引用《日經亞洲評論》報導。已登錄的「兩岸頭條」記載其相關粉專於 2022 年遭調查局偵辦。",
      "source_ids": [
        "src-factlink-satellite",
        "src-iorg-38",
        "src-iorg-41"
      ],
      "confidence": "medium",
      "sensitivity": "domestic-named",
      "claims": [
        {
          "text": "「和坛」由香港華文媒體「中華微視」控制，俄羅斯官媒和中共官媒有官方合作協議，而「全球華人軍事聯盟」則是馬來西亞內容農場集團旗下的匿名粉專。",
          "source_id": "src-iorg-usskep1",
          "about": "中華微視"
        },
        {
          "text": "查詢其聯絡方式、信箱，其於香港親中媒體「中華微視」旗下的臉書粉絲專頁帳號，且該粉專多次改名、管理者散布於台灣、中國。",
          "source_id": "src-factlink-hackleak",
          "about": "中華微視"
        },
        {
          "text": "同日，「兩岸頭條」、「中華微視」引用《日經亞洲評論》報導內容，表示阿富汗的狀況打亂了拜登集中精力對抗中國的佈局。",
          "source_id": "src-iorg-11",
          "about": "中華微視"
        }
      ]
    },
    {
      "id": "hetan",
      "name_zh": "和坛",
      "name_en": "Hetan",
      "aliases": [
        "和壇"
      ],
      "category": "cib-network",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "IORG 標記為中國的臉書粉專，記錄其貼文傳播疑美論述，如「常規戰美國的總體實力肯定是勝過中國的」。",
      "source_ids": [
        "src-iorg-38",
        "src-iorg-41"
      ],
      "confidence": "medium",
      "claims": [
        {
          "text": "其中，2 項（26 40）由「和坛」發起，2 項（35 37）由俄羅斯官媒「俄羅斯衛星通訊社」及「今日俄羅斯」發起，1 項（34）由「全球華人軍事聯盟」發起。",
          "source_id": "src-iorg-usskep1",
          "about": "和坛"
        },
        {
          "text": "「和坛」由香港華文媒體「中華微視」控制，俄羅斯官媒和中共官媒有官方合作協議，而「全球華人軍事聯盟」則是馬來西亞內容農場集團旗下的匿名粉專。",
          "source_id": "src-iorg-usskep1",
          "about": "和坛"
        },
        {
          "text": "直到 8 月 31 日，還可以在「和坛」的貼文看到 A.1 論述。",
          "source_id": "src-iorg-11",
          "about": "和坛"
        },
        {
          "text": "同日，「和坛」：「常規戰美國的總體實力肯定是勝過中國的，但是西太平洋的局部戰爭就未必如此」。",
          "source_id": "src-iorg-11",
          "about": "和坛"
        }
      ]
    },
    {
      "id": "chuji-zhe",
      "name_zh": "觸極者",
      "name_en": "The Reacher",
      "aliases": [],
      "category": "content-farm",
      "role": "amplifier",
      "origin": "TW",
      "summary_zh": "IORG 記錄為新黨人士林正國經營的內容農場，貼文傳播疑美論述，如「自以為世界警察的美國」。",
      "source_ids": [
        "src-iorg-38",
        "src-iorg-41"
      ],
      "confidence": "medium",
      "sensitivity": "domestic-named",
      "claims": [
        {
          "text": "Anonymous fan pages/accounts, such as: Kaohsiung.NewTide, The Reacher, and fake accounts regularly sharing content in LINE groups.",
          "source_id": "src-dtl-2022election",
          "about": "The Reacher"
        },
        {
          "text": "此論述的主要內容，如新黨人士林正國經營的內容農場「觸極者」：「自以為世界警察的美國，根本是超級破壞者。」",
          "source_id": "src-iorg-11",
          "about": "觸極者"
        },
        {
          "text": "1 月 26 日 10:00 粉專「觸極者」發布貼文，認為「世界警察」美國「從一戰、二戰，至冷戰背景下的韓戰、越戰，再到找各國極端分子，到處點燃 “顏色革命”，而最終該地區都陷入絕望深淵」，貼文也認為埃及、烏克蘭都是案例。",
          "source_id": "src-iorg-38",
          "about": "觸極者"
        },
        {
          "text": "1 月 29 日 23:00 粉專「觸極者」發布貼文，認為「事實上半個多世紀以來越南、伊拉克、阿富汗克蘭等國，只要有親美國政權，就是戰爭及人民流離失所」。",
          "source_id": "src-iorg-38",
          "about": "觸極者"
        }
      ]
    },
    {
      "id": "zhixing",
      "name_zh": "知行",
      "name_en": "Zhixing",
      "aliases": [],
      "category": "state-media",
      "role": "amplifier",
      "origin": "PRC",
      "summary_zh": "中共官媒臉書粉專。FactLink 將其與《今日海峽》《CCTV中文》《香港大公報》並列為官媒粉專群；IORG 記錄其持續傳播疑美論述。",
      "source_ids": [
        "src-factlink-satellite",
        "src-iorg-11"
      ],
      "confidence": "medium",
      "strict_match": true,
      "claims": [
        {
          "text": "The song was boosted by ZhiXing on Facebook, who continuously invested advertising funds in posts that promoted the song to increase engagement.",
          "source_id": "src-dtl-multiverse",
          "about": "ZhiXing"
        },
        {
          "text": "同一時間，中國媒體用以面向台灣讀者的臉書粉絲專頁，包括《今日海峽》、《CCTV中文》、《知行》、《香港大公報》、香港中國通訊社的《通傳媒》等臉書粉專，同步發動長光衛星照慶祝台灣光復節的傳言，並發布台灣光復節歷史照片、紀錄片、台灣青年回顧光復節的內容素材。",
          "source_id": "src-factlink-satellite",
          "about": "《知行》"
        },
        {
          "text": "直到 8 月 30 日，中共官媒粉專「知行」還在繼續傳播 A.2 論述。",
          "source_id": "src-iorg-11",
          "about": "知行"
        }
      ]
    }
  ],
  "events": [
    {
      "id": "deafening-whispers-2020",
      "name_zh": "2020台灣大選資訊操作（震耳低語）",
      "name_en": "Deafening Whispers — China's Information Operation and Taiwan's 2020 Election",
      "date": "2020-10",
      "period": "2019 選戰期 至 2020-01",
      "type": "election-op",
      "summary_zh": "Doublethink Lab以2020總統大選為個案，提出描述中國對台資訊操作的「行為者與模式」框架，分為官方宣傳、小粉紅、內容農場、協作四種模式。核心敘事為「民主失敗論」，目標在削弱台灣社會對民主與政府的信任、宣傳中國治理模式並離間台美關係。報告強調單一假訊息影響有限，但累積的「低語」足以製造社會分裂。",
      "narratives": [
        "democracy-failure",
        "us-skepticism"
      ],
      "participant_ids": [],
      "source_ids": [
        "src-dtl-deafening"
      ],
      "confidence": "high"
    },
    {
      "id": "pelosi-2022",
      "name_zh": "2022裴洛西訪台後資訊與認知作戰",
      "name_en": "2022 Pelosi Visit Information & Cognitive Operations",
      "date": "2022-08",
      "period": "2022-07 至 2022-08",
      "type": "narrative-campaign",
      "summary_zh": "裴洛西訪台前後，台灣同時遭遇網路攻擊與資訊操弄。資安業者偵測到惡意活動暴增，多個政府網站遭DDoS攻擊，便利商店與車站數位看板被入侵顯示辱罵訊息。隨後中國發動環台軍演，並散布「美國拋棄台灣」「民進黨挑釁招致戰爭」等論述。",
      "narratives": [
        "us-skepticism",
        "us-abandon",
        "war-fear"
      ],
      "participant_ids": [
        "global-times"
      ],
      "source_ids": [
        "src-record-pelosi",
        "src-focustaiwan-pelosi",
        "src-iorg-38",
        "src-iorg-41"
      ],
      "confidence": "high"
    },
    {
      "id": "spamouflage-takedown-2023",
      "name_zh": "Spamouflage 全球網絡下架（Meta 2023）",
      "name_en": "Spamouflage Global Network Takedown (Meta 2023)",
      "date": "2023-08",
      "period": "2023",
      "type": "platform-takedown",
      "summary_zh": "Meta 在 2023 年第二季對抗式威脅報告中，下架史上最大規模的隱蔽影響力行動 Spamouflage：7,704 個 Facebook 帳號、954 個粉專、15 個社團與 15 個 Instagram 帳號，活躍於 50 多個平台。台灣為主要目標地區之一。",
      "narratives": [
        "nar-tsai-surrender"
      ],
      "participant_ids": [
        "spamouflage",
        "mps",
        "magaflage"
      ],
      "source_ids": [
        "src-meta-2023",
        "src-record-spamouflage"
      ],
      "confidence": "high"
    },
    {
      "id": "election-op-2024",
      "name_zh": "2024台灣總統大選境外資訊操弄",
      "name_en": "2024 Taiwan Presidential Election Foreign Information Manipulation",
      "date": "2024-01",
      "period": "2023-12 至 2024-01",
      "type": "election-op",
      "summary_zh": "2024大選前後多個研究機構記錄到疑似源自中國的資訊操弄，手法明顯轉向生成式AI與大量不實帳號。代表事件包括散布抹黑文件《蔡英文秘史》、捏造賴清德私生子的假DNA報告，以及選舉日疑似AI生成的郭台銘假音檔。Doublethink Lab全期共記錄約1萬餘則可疑訊息，各方對攻擊存在有高度共識，但對影響選舉結果程度看法保守。",
      "narratives": [
        "us-skepticism",
        "war-fear",
        "democracy-failure",
        "us-abandon"
      ],
      "participant_ids": [
        "spamouflage",
        "anti-dpp-impersonation",
        "golaxy",
        "cac",
        "mss",
        "ufwd",
        "mps",
        "womin",
        "wangwang-china-times-group",
        "kuo-cheng-liang",
        "jaw-shaw-kong",
        "cmg-cctv",
        "china-taiwan-net"
      ],
      "source_ids": [
        "src-dtl-multiverse",
        "src-mtac-2024",
        "src-aspi-2024",
        "src-iorg-usskep1",
        "src-nsb-2026",
        "src-nsb-2025",
        "src-vanderbilt-golaxy-2025"
      ],
      "confidence": "high"
    },
    {
      "id": "joint-sword-2024",
      "name_zh": "聯合利劍-2024軍演伴隨資訊作戰",
      "name_en": "Joint Sword-2024 Exercise-Linked Information Operations",
      "date": "2024",
      "period": "2024-05 與 2024-10",
      "type": "exercise-linked",
      "summary_zh": "2024年解放軍兩度環台軍演（聯合利劍-2024A、B）皆高度結合宣傳與認知作戰。東部戰區在社群平台釋出3D模擬動畫與圖卡，呈現「進、圍、鎖」與模擬攻擊台北、台中、高雄、花蓮，並以對台獨「強力震懾」框架歸責賴清德政府。台灣國安局報告指出，中國於軍演期間冒充國軍人員散布假訊息、放大「鎖台」威懾。",
      "narratives": [
        "defense-futility",
        "war-fear",
        "us-skepticism",
        "nar-doubt-military",
        "nar-deterrence-amplify"
      ],
      "participant_ids": [
        "yuyuantantian",
        "tao",
        "pla-pwd",
        "spamouflage",
        "haixia-daobao-accounts",
        "wangwang-china-times-group",
        "cti-tv",
        "tvbs",
        "asia-vision-tv",
        "kuo-cheng-liang",
        "tsai-cheng-yuan",
        "lai-yueh-chien",
        "li-cheng-chieh",
        "shuai-hua-min",
        "lu-li-shih",
        "chieh-wen-chi",
        "hsieh-han-ping",
        "tang-hsiang-lung",
        "chiu-yi",
        "cmg-cctv",
        "china-taiwan-net"
      ],
      "source_ids": [
        "src-nsb-2026",
        "src-chinapower-js2024a",
        "src-jamestown-js2024b",
        "src-tvbs-etc",
        "src-nsb-2025"
      ],
      "confidence": "high"
    },
    {
      "id": "golaxy-leak-2025",
      "name_zh": "GoLaxy外洩文件揭露（2025）",
      "name_en": "The GoLaxy Documents Exposure (2025)",
      "date": "2025-08",
      "period": "2025-08 至 2025-09",
      "type": "exposure",
      "summary_zh": "2025年8月，范德堡大學研究者Brett V. Benson與Brett J. Goldstein取得並分析約400頁GoLaxy內部外洩文件，於《紐約時報》投書揭露其以AI驅動的影響行動，並由范德堡Wicked Problems Lab陸續公開原始文件。文件顯示GoLaxy建立心理側寫、部署AI虛擬人物，鎖定台灣（含2024大選）、香港及美國政界與意見領袖。",
      "narratives": [],
      "participant_ids": [
        "golaxy",
        "cac",
        "mss",
        "pla-pwd",
        "meiya-pico",
        "iflytek",
        "spamouflage"
      ],
      "source_ids": [
        "src-vanderbilt-golaxy",
        "src-record-golaxy",
        "src-dtl-golaxy",
        "src-nyt-golaxy"
      ],
      "confidence": "high"
    },
    {
      "id": "haienergy-exposure",
      "name_zh": "海訊社/HaiEnergy揭露",
      "name_en": "Haixun / HaiEnergy Exposure",
      "date": "2022-08",
      "period": "2022-08 至 2024-11",
      "type": "exposure",
      "summary_zh": "Mandiant於2022年8月揭露「HaiEnergy」親中影響行動，認定其使用中國公關公司海訊社的基礎設施，經營至少72個偽裝新聞網站；2023年7月後續報告確認海訊社知情並積極支援，並將內容置入美國合法新聞網站子網域。Google於2024年11月將海訊社列入「GLASSBRIDGE」四家公司之一，並下架逾600個相關網域。",
      "narratives": [],
      "participant_ids": [
        "haixun"
      ],
      "source_ids": [
        "src-mandiant-haienergy-2022",
        "src-mandiant-haienergy-2023",
        "src-google-glassbridge"
      ],
      "confidence": "high"
    },
    {
      "id": "borderless-exposure",
      "name_zh": "無邊界集團內容農場揭露",
      "name_en": "Borderless Group Content-Farm Exposure",
      "date": "2026-04",
      "period": "",
      "type": "exposure",
      "summary_zh": "Doublethink Lab於2026年4月發布報告，揭露位於秦皇島、與中共政府有往來的內容農場「無邊界集團」，其經營逾千個偽裝新聞網域，並以數百個多由香港操作的不實Threads帳號導流，污染台灣與日本資訊環境，選舉期間轉向政治與不實內容。",
      "narratives": [],
      "participant_ids": [
        "borderless-group"
      ],
      "source_ids": [
        "src-dtl-borderless"
      ],
      "confidence": "medium"
    },
    {
      "id": "china-vtv-prosecution",
      "name_zh": "中華微視／兩岸頭條偵辦案（2022）",
      "name_en": "China VTV / Taiwan Headlines Prosecution (2022)",
      "date": "2022-11",
      "period": "",
      "type": "incident",
      "summary_zh": "2022年11月，台灣法務部調查局偵辦「中華微視」負責人涉嫌受陸方指示、未經許可接受陸資（約定人民幣300萬元取得67%股權），透過「中華微視」「兩岸頭條」等Facebook粉專散布不實訊息。Global Taiwan Institute與Doublethink Lab均分析此案，後者記錄該粉專由中國與香港管理者經營。",
      "narratives": [],
      "participant_ids": [
        "taiwan-headlines"
      ],
      "source_ids": [
        "src-ltn-chinavtv",
        "src-gti-provincial",
        "src-dtl-2022election"
      ],
      "confidence": "medium"
    },
    {
      "id": "democracy-failure-campaign",
      "name_zh": "台灣民主失敗論敘事戰役",
      "name_en": "Taiwan Democracy-Failure Narrative Campaign",
      "date": "2024",
      "period": "2024-01 至 2025-06",
      "type": "narrative-campaign",
      "summary_zh": "IORG記錄賴清德2024年當選後中共宣傳轉向「台灣民主失敗論」，以22項敘事跨7類，主張台灣民主無法保障人權、實現公平正義，並以「綠色恐怖／綠色獨裁」等框架攻擊執政黨。國台辦發言人陳斌華被指為此類敘事源頭之一。",
      "narratives": [
        "democracy-failure"
      ],
      "participant_ids": [
        "tao"
      ],
      "source_ids": [
        "src-iorg-118"
      ],
      "confidence": "high"
    },
    {
      "id": "takaichi-strait-2025",
      "name_zh": "高市早苗台海爭訊操作（2025）",
      "name_en": "Takaichi Taiwan Strait disinformation op (2025)",
      "date": "2025",
      "period": "2025",
      "type": "narrative-campaign",
      "summary_zh": "NSB 指龍橋（Dragonbridge）於 Pixiv、Facebook、Pixnet 等平臺炒作「高市早苗在臺海挑起衝突」爭訊，偽冒不同政治立場使用者灌貼假帖以激化對立。",
      "narratives": [],
      "participant_ids": [
        "spamouflage",
        "mps"
      ],
      "source_ids": [
        "src-nsb-2026",
        "src-factlink-takaichi"
      ],
      "confidence": "medium"
    },
    {
      "id": "april-2025-exercise-ptt-hijack",
      "name_zh": "2025 年 4 月對臺軍演 PTT 帳號劫持",
      "name_en": "April 2025 exercise-linked PTT account hijacking",
      "date": "2025-04",
      "period": "2025-04",
      "type": "exercise-linked",
      "summary_zh": "NSB 指中共網軍於 2025 年 4 月對臺軍演期間劫持十餘個 PTT 使用者帳號、駭入 IoT 裝置並租用海外伺服器作跳板，炒作封鎖天然氣與軍艦進入 24 浬等爭訊。",
      "narratives": [],
      "participant_ids": [
        "pla-csf"
      ],
      "source_ids": [
        "src-nsb-2026"
      ],
      "confidence": "high"
    },
    {
      "id": "us-skepticism-report-2023",
      "name_zh": "IORG 疑美論與它們的產地報告",
      "name_en": "IORG U.S.-Skepticism and Its Origins Report",
      "date": "2023-09-21",
      "period": "2021–2023.6",
      "type": "exposure",
      "summary_zh": "IORG 系統性盤點 84 項疑美論論述，其中 70 項由中共參與放大、28 項由中共發起、44 項源於台灣，歸納為 8 類（棄台論、衰弱論、亂源論、假朋友、共謀論、假民主、反世界、毀台論），並指出旺中集團旗下媒體發起共謀論、聯合報相關報導列入脈絡。涵蓋疫苗、阿富汗撤軍、裴洛西訪台、台積電赴美等 12 起重大事件。",
      "narratives": [
        "us-skepticism",
        "us-abandon",
        "us-weakness",
        "us-chaos",
        "us-false-friend",
        "us-collusion",
        "us-fake-democracy",
        "us-destroy-taiwan"
      ],
      "participant_ids": [
        "wangwang-china-times-group",
        "united-daily-news",
        "global-times"
      ],
      "source_ids": [
        "src-iorg-usskep1"
      ],
      "confidence": "high"
    },
    {
      "id": "defense-futility-report-2025",
      "name_zh": "IORG 2024 三次對台軍演期間 23 項國防失敗論分析",
      "name_en": "IORG Analysis of 23 Defense-Futility Narratives during 2024 PLA Exercises",
      "date": "2025-02-14",
      "period": "2024.5–2024.12",
      "type": "exposure",
      "summary_zh": "IORG 於 2024 三次對台軍演（聯合利劍 A／B、12 月大規模艦艇擾台）期間，從華語 YouTube 盤點 23 項國防失敗論，分為意願論、能力論、道德論、責任論、後果論 5 大類，其中 12 項由中共官方參與散布，並列出旺中（中天/中視）、TVBS、亞洲衛視等傳播管道與數十位退役軍官／名嘴。",
      "narratives": [
        "defense-futility",
        "defense-willingness",
        "defense-capability",
        "defense-morality",
        "defense-responsibility",
        "defense-consequence"
      ],
      "participant_ids": [
        "cti-tv",
        "tvbs",
        "asia-vision-tv",
        "lai-yueh-chien",
        "li-cheng-chieh",
        "shuai-hua-min",
        "lu-li-shih",
        "kuo-cheng-liang",
        "haixia-daobao-accounts",
        "cmg-cctv"
      ],
      "source_ids": [
        "src-iorg-101"
      ],
      "confidence": "high"
    },
    {
      "id": "democracy-failure-report-118",
      "name_zh": "IORG 賴清德當選後的中共宣傳：台灣民主失敗論（週報118）",
      "name_en": "IORG Weekly 118: Taiwan Democracy-Failure Narrative after Lai's Election",
      "date": "2025-08-14",
      "period": "2024.1.13–2025.6.30",
      "type": "narrative-campaign",
      "summary_zh": "IORG 盤點 22 項台灣民主失敗論，分為內戰論、私利論、外部治理論、少數暴力論、退步論、邪教論、戒嚴論 7 類；其中戒嚴論含綠色恐怖、綠色獨裁等口號。傳播高峰出現於 2025.4.26 國民黨「反綠共・戰獨裁」集會。IORG 2024 民調顯示 21.7% 台灣民眾對民主失敗論呈認同傾向。",
      "narratives": [
        "democracy-failure",
        "democracy-civilwar",
        "democracy-greenterror",
        "democracy-regression",
        "democracy-cult"
      ],
      "participant_ids": [
        "jaw-shaw-kong",
        "tsai-cheng-yuan",
        "cmg-cctv",
        "voice-of-strait",
        "haixia-daobao-accounts",
        "china-taiwan-net"
      ],
      "source_ids": [
        "src-iorg-118"
      ],
      "confidence": "high"
    },
    {
      "id": "ccp-taiwan-reps-2025",
      "name_zh": "IORG 2025 年中共官宣影片裡的「台灣代表」分析（週報136）",
      "name_en": "IORG Weekly 136: 'Taiwan Representatives' in 2025 CCP Propaganda Videos",
      "date": "2026-04-17",
      "period": "2025.10–2025.12",
      "type": "exposure",
      "summary_zh": "IORG 追蹤 1,076 個中共官媒抖音帳號於 2025 年第四季發布的 560,778 部影片，辨識出 57 位被引用的台灣人物、共 2,730 部影片，並排出「台灣代表」榜：第 1 鄭麗文、2 陳之漢、3 蔡正元、4 郭正亮、5 周錫瑋、6 謝寒冰、7 賴岳謙（退役上校）、8 栗正傑（退役少將）、9 介文汲、10 帥化民（退役中將）等。",
      "narratives": [
        "tw-defeatism",
        "us-skepticism",
        "defense-futility",
        "democracy-failure"
      ],
      "participant_ids": [
        "tsai-cheng-yuan",
        "kuo-cheng-liang",
        "hsieh-han-ping",
        "lai-yueh-chien",
        "li-cheng-chieh",
        "chieh-wen-chi",
        "shuai-hua-min",
        "chiu-yi",
        "yuan-chu-cheng",
        "lu-li-shih",
        "tang-hsiang-lung",
        "cmg-cctv",
        "kankan-news"
      ],
      "source_ids": [
        "src-iorg-136"
      ],
      "confidence": "high"
    },
    {
      "id": "tw-defeatism-report-2025",
      "name_zh": "IORG 台灣失敗論和民主的信心危機報告",
      "name_en": "IORG Taiwan-Defeatism and the Crisis of Democratic Confidence Report",
      "date": "2025-09-23",
      "period": "2024–2025",
      "type": "exposure",
      "summary_zh": "IORG 提出「台灣失敗論」總體框架，涵蓋外交（254 項/12 類）、國防（61 項/7 類）、民主（22 項/7 類）、內政（54 項/9 類）四面向逾 300 項論述，並以民調呈現整體失敗論認同傾向約 46.6%、民主失敗論 21.7%，TikTok 用戶認同比例顯著較高。",
      "narratives": [
        "tw-defeatism",
        "us-skepticism",
        "defense-futility",
        "democracy-failure"
      ],
      "participant_ids": [
        "cmg-cctv",
        "china-taiwan-net"
      ],
      "source_ids": [
        "src-iorg-tw-defeatism"
      ],
      "confidence": "high"
    },
    {
      "id": "meta-china-q3-2023",
      "name_zh": "Meta 2023 年第三季中國網絡下架",
      "name_en": "Meta Q3 2023 China Networks Takedown",
      "date": "2023-11-30",
      "period": "2023",
      "type": "platform-takedown",
      "summary_zh": "Meta 下架兩個源自中國的網絡：一個鎖定美國（移除 4,789 個 Facebook 帳號，複製貼上美國政治人物貼文），另一個鎖定印度與西藏地區（移除 13 個 Facebook 帳號與 7 個社團，假冒記者、律師與人權人士）。台灣非此兩叢集主要目標。",
      "narratives": [],
      "participant_ids": [
        "spamouflage"
      ],
      "source_ids": [
        "src-meta-q3-2023"
      ],
      "confidence": "high"
    },
    {
      "id": "dragonbridge-q1-2024-takedown",
      "name_zh": "Google 2024 Q1 DRAGONBRIDGE 瓦解（台灣選舉）",
      "name_en": "Google DRAGONBRIDGE Q1 2024 Disruption",
      "date": "2024-06-26",
      "period": "2024-Q1",
      "type": "platform-takedown",
      "summary_zh": "Google TAG 在 2024 年第一季瓦解逾 10,000 次 DRAGONBRIDGE 活動。台灣 1 月 13 日大選前數日，DRAGONBRIDGE 在 YouTube 以合成語音與 AI 頭像發布數千則影片與留言，推廣批評蔡英文的偽《秘史》文件，是迄今觀察到 DRAGONBRIDGE 運用生成式 AI 最大規模的活動。",
      "narratives": [
        "nar-tsai-secret-history"
      ],
      "participant_ids": [
        "spamouflage"
      ],
      "source_ids": [
        "src-google-dragonbridge-2024"
      ],
      "confidence": "high"
    },
    {
      "id": "mtac-taiwan-ai-2024",
      "name_zh": "微軟 MTAC 揭露台灣大選 AI 干預",
      "name_en": "Microsoft MTAC Taiwan Election AI Finding",
      "date": "2024-04-04",
      "period": "2024",
      "type": "election-op",
      "summary_zh": "微軟威脅分析中心（MTAC）指 Storm-1376（即 Spamouflage／Dragonbridge）在台灣 2024 年 1 月大選運用 AI 內容，是微軟首次見到民族國家行為者以 AI 內容試圖影響外國選舉。手法含偽造郭台銘背書他人的假音檔、指控賴清德／民進黨貪腐的 AI 迷因，以及 AI 新聞主播。",
      "narratives": [
        "nar-lai-corruption",
        "nar-tsai-secret-history"
      ],
      "participant_ids": [
        "spamouflage"
      ],
      "source_ids": [
        "src-mtac-2024"
      ],
      "confidence": "high"
    },
    {
      "id": "aspi-taiwan-2024",
      "name_zh": "ASPI 台灣大選 AI 干預分析",
      "name_en": "ASPI Taiwan 2024 Election Analysis",
      "date": "2024-01-18",
      "period": "2024",
      "type": "election-op",
      "summary_zh": "ASPI 記錄 2024 台灣大選期間，YouTube 上至少 490 則影片（1/4–1/10）引用偽《蔡英文秘史》；偽 DNA／親子鑑定假訊息被提及近 2 萬次，1/12 達單日逾 1.3 萬次提及高峰。Spamouflage『很可能連結』（業務時段發文），第二個網絡『可能連結』Meta 所辨識的中國網絡。",
      "narratives": [
        "nar-tsai-secret-history",
        "nar-lai-corruption"
      ],
      "participant_ids": [
        "spamouflage"
      ],
      "source_ids": [
        "src-aspi-2024"
      ],
      "confidence": "high"
    },
    {
      "id": "spamouflage-deepfake-2023",
      "name_zh": "Graphika 揭露 Spamouflage AI 主播",
      "name_en": "Graphika 'Deepfake It Till You Make It'",
      "date": "2023-02-07",
      "period": "2023",
      "type": "exposure",
      "summary_zh": "Graphika 揭露 Spamouflage 使用 AI 生成的虛構新聞主播（『Wolf News』，主播『Alex』等），是首見國家相關行動以 AI 生成虛構人物影片製作具欺騙性的政治內容。影片以英國 Synthesia 技術製作，83% 的 YouTube 影片觀看數低於 100。",
      "narratives": [],
      "participant_ids": [
        "spamouflage"
      ],
      "source_ids": [
        "src-graphika-deepfake"
      ],
      "confidence": "high"
    },
    {
      "id": "doj-912-2023",
      "name_zh": "美國司法部起訴 MPS『912 專項工作組』troll farm",
      "name_en": "DOJ '912 Special Project Working Group' Indictment",
      "date": "2023-04-17",
      "period": "2023",
      "type": "incident",
      "summary_zh": "美國司法部於 2023/04/17 起訴 34 名中國國家警察（公安部）官員，指其隸屬『912 專項工作組』菁英任務小組、於北京一處公安部設施運作，在 Twitter 等社群創建『數千個』假人物以攻擊海外異議人士、塑造對 PRC／中共的公眾觀感。司法部稱其為『troll farm』；司法部文件未使用 Spamouflage 或 Taiwan 字眼（與 Spamouflage／台灣的連結為 Meta、CNN 與研究者所做）。",
      "narratives": [],
      "participant_ids": [
        "mps",
        "spamouflage"
      ],
      "source_ids": [
        "src-doj-912"
      ],
      "confidence": "high"
    },
    {
      "id": "meta-taiwan-2025",
      "name_zh": "Meta 2025 年第一季中國對台網絡下架",
      "name_en": "Meta Q1 2025 China-Taiwan Network Takedown",
      "date": "2025-05-31",
      "period": "2025",
      "type": "platform-takedown",
      "summary_zh": "Meta 在 2025 年第一季報告中下架一個源自中國、鎖定緬甸、台灣與日本的網絡：157 個 Facebook 帳號、19 個粉專、1 個社團與 17 個 Instagram 帳號，部分帳號使用疑似 AI 生成的大頭照。在台灣，帳號發布『台灣政治人物與軍方領袖貪腐』的指控，並經營偽稱匿名投稿的粉專以營造真實討論的假象。Meta 連結至先前 2022/09 與 2024/02 已下架的中國網絡。",
      "narratives": [
        "nar-lai-corruption"
      ],
      "participant_ids": [
        "spamouflage"
      ],
      "source_ids": [
        "src-meta-q1-2025"
      ],
      "confidence": "high"
    },
    {
      "id": "glassbridge-takedown-2024",
      "name_zh": "Google GLASSBRIDGE 親中影響力網絡下架",
      "name_en": "Google GLASSBRIDGE Takedown",
      "date": "2024-11-23",
      "period": "2022-2024",
      "type": "platform-takedown",
      "summary_zh": "Google 揭露並封鎖 GLASSBRIDGE——由多家親 PRC 公關／行銷公司經營的偽新聞網站生態系。自 2022 年起，Google 封鎖逾一千個 GLASSBRIDGE 經營的網站，使其無法出現在 Google News 與 Discover。具名業者含上海海訊（移除逾 600 個域名）、深圳海脈／Times Newswire（逾 100 網站、30+ 國）、DURINBRIDGE（逾 200 網站）、深圳博文／World Newswire（逾 100 域名）。敘事涵蓋台灣、南海等，含《蔡英文秘史》與賴清德內容。",
      "narratives": [
        "nar-tsai-secret-history"
      ],
      "participant_ids": [
        "haixun",
        "haimai",
        "durinbridge",
        "spamouflage"
      ],
      "source_ids": [
        "src-google-glassbridge"
      ],
      "confidence": "high"
    },
    {
      "id": "paperwall-exposure-2024",
      "name_zh": "Citizen Lab 揭露 PAPERWALL 偽在地新聞網絡",
      "name_en": "Citizen Lab PAPERWALL Exposure",
      "date": "2024-02-07",
      "period": "2024",
      "type": "exposure",
      "summary_zh": "Citizen Lab 揭露 PAPERWALL：123 個偽裝成在地新聞媒體、橫跨約 30 國的網站，依數位基礎設施線索歸因於深圳海脈雲翔（Haimai）公關公司。台灣為其內容攻擊對象（攻擊蔡英文），惟不在 30 個地理目標之列。首個域名於 2019 年 7 月註冊。",
      "narratives": [],
      "participant_ids": [
        "haimai"
      ],
      "source_ids": [
        "src-citizenlab-paperwall"
      ],
      "confidence": "high"
    },
    {
      "id": "anti-dpp-threads-2025",
      "name_zh": "DTL 揭露假冒台灣人反民進黨 Threads 帳號",
      "name_en": "DTL Exposes Anti-DPP Threads Impersonation Network",
      "date": "2025-07-21",
      "period": "2025",
      "type": "exposure",
      "summary_zh": "台灣民主實驗室揭露 51 個假冒台灣人的 Threads 帳號，2024/06–2025/04 間發布 7,032 則貼文（含 275 則相同的『我是台灣人我反綠』型貼文）攻擊民進黨。盜用亞洲女性網紅照片，部分出現簡體字、一帳號連結香港電話號碼。DTL 評估『可能可連結至中國』。",
      "narratives": [
        "nar-anti-dpp"
      ],
      "participant_ids": [
        "anti-dpp-impersonation"
      ],
      "source_ids": [
        "src-dtl-impersonation"
      ],
      "confidence": "medium"
    },
    {
      "id": "nsb-cognitive-2025",
      "name_zh": "台灣 NSB 2025 年認知作戰年度回顧",
      "name_en": "Taiwan NSB 2025 Cognitive Warfare Review",
      "date": "2026-01-11",
      "period": "2025",
      "type": "exposure",
      "summary_zh": "台灣國家安全局 2026 年初公布 2025 年認知作戰回顧：辨識逾 45,000 個假社群帳號、散布 231.4 萬則假訊息。NSB 指由中央宣傳部與公安部指示中國 IT 公司建立帳號資料庫，利用海訊社、海脈、虎牙等行銷公司製作偽國際媒體偽新聞網站，並支持無邊界集團以 Facebook 粉專經營內容農場。",
      "narratives": [],
      "participant_ids": [
        "haixun",
        "haimai",
        "huya-pr",
        "borderless-group",
        "mps"
      ],
      "source_ids": [
        "src-nsb-2026",
        "src-taipei-times-nsb-2026",
        "src-storm-nsb-2026"
      ],
      "confidence": "high"
    },
    {
      "id": "just-mission-2025",
      "name_zh": "正義使命-2025 軍演融媒體宣傳",
      "name_en": "Operation Just Mission 2025 — fusion-media propaganda",
      "date": "2025-12",
      "period": "2025-12-29 至 2025-12-31",
      "type": "exercise-linked",
      "summary_zh": "解放軍「正義使命-2025」環台軍演期間，東部戰區融媒體中心以『中央廚房』模式跨微博、Threads 協同放大威懾敘事（含偽稱無人機俯拍台北101）。FactLink 與台灣民主實驗室分析逾 6,700 筆資料還原其宣傳網絡全貌。",
      "narratives": [
        "nar-deterrence-amplify",
        "war-fear"
      ],
      "participant_ids": [
        "etc-fusion-media"
      ],
      "source_ids": [
        "src-factlink-pla"
      ],
      "confidence": "high"
    },
    {
      "id": "satellite-retrocession-2025",
      "name_zh": "光復節台灣衛星照宣傳戰（2025）",
      "name_en": "Retrocession-Day Taiwan Satellite-Imagery Propaganda (2025)",
      "date": "2025-10",
      "period": "2025-10-25 起",
      "type": "narrative-campaign",
      "summary_zh": "2025 光復節，中國以長光衛星拍攝的台灣地標衛星影像，經央視、環球、海峽之聲、日月譚天、觀察者網及駐美使館 X 帳號跨平台放大，營造『侵門踏戶』全程監控恫嚇，並爭奪光復節歷史詮釋權；FB『今日海峽』等粉專對台投放。",
      "narratives": [
        "nar-deterrence-amplify",
        "war-fear"
      ],
      "participant_ids": [
        "chang-guang-satellite",
        "cmg-cctv",
        "guancha",
        "global-times",
        "voice-of-strait",
        "yuyuantantian"
      ],
      "source_ids": [
        "src-factlink-satellite"
      ],
      "confidence": "high"
    },
    {
      "id": "butterfly-flood-2025",
      "name_zh": "颱風救災假訊息與『蝴蝶攻擊』分化操作（2025）",
      "name_en": "Typhoon-Relief Disinformation & 'Butterfly Attacks' (2025)",
      "date": "2025-09",
      "period": "2025-09-23 至 2025-10-10",
      "type": "narrative-campaign",
      "summary_zh": "颱風救災期間，3 個 TikTok 帳號 17 天內發布 80 部救災假訊息影片，無邊界集團經營『pray for you』FB 粉專等以『蝴蝶攻擊』假冒台灣在地者，嫁禍越南志工、在野黨偷竊災民物資，並反控執政黨造謠，製造社會分化與內部不信任。",
      "narratives": [
        "nar-social-division"
      ],
      "participant_ids": [
        "borderless-group",
        "cmg-cctv"
      ],
      "source_ids": [
        "src-factlink-butterfly"
      ],
      "confidence": "medium"
    },
    {
      "id": "japan-narrative-2025",
      "name_zh": "中國對日敘事攻擊（高市早苗台灣有事言論後，2025）",
      "name_en": "PRC Narrative Attack on Japan after Takaichi's Taiwan Remarks (2025)",
      "date": "2025-11",
      "period": "2025-11-01 至 2025-12-06",
      "type": "narrative-campaign",
      "summary_zh": "高市早苗 2025/11/7『台灣有事即日本存立危機』言論後，中國官媒（北京日報、中新網、央視、新華社、環球時報）、大V（胡錫進）與外交官（薛劍、吳江浩）協同發動敘事攻擊，逾 15,241 則相關微博，主打日本軍國主義復辟、琉球地位未定論與厭女框架，並連結『日台美勾結』。",
      "narratives": [
        "nar-japan-militarism",
        "nar-ryukyu",
        "war-fear"
      ],
      "participant_ids": [
        "global-times",
        "guancha",
        "cmg-cctv",
        "yuyuantantian",
        "hu-xijin"
      ],
      "source_ids": [
        "src-factlink-japan"
      ],
      "confidence": "high"
    },
    {
      "id": "hack-leak-takaichi-2025",
      "name_zh": "假外交文件抹黑操作：高市早苗／謝長廷假賄賂（2025）",
      "name_en": "Fabricated Bribery Documents Smearing Takaichi & Hsieh Chang-ting (2025)",
      "date": "2025-11",
      "period": "2025-11-24 至 2025-12-02",
      "type": "incident",
      "summary_zh": "一組與中國相關的帳號偽造『高市早苗收受台灣駐日代表謝長廷數百萬賄賂』假文件，分兩波經偽暗網論壇 DarkForums 假爆料，再由 X（豫章信使、孤烟暮蟬、平沙落雁）、FB『兩岸頭條』與港陸媒體（文匯報、NetEase）放大，意在離間台日外交。台灣事實查核中心 24 小時內闢謠。",
      "narratives": [
        "nar-diplomatic-smear"
      ],
      "participant_ids": [
        "hack-leak-network",
        "taiwan-headlines"
      ],
      "source_ids": [
        "src-factlink-hackleak"
      ],
      "confidence": "medium"
    }
  ],
  "sources": [
    {
      "id": "src-nsb-2026",
      "title": "2025 年中共對臺認知作戰操作手法分析 / Analysis of China's Cognitive Warfare Tactics Against Taiwan in 2025",
      "org": "國家安全局 National Security Bureau (NSB), Taiwan",
      "url": "https://www.nsb.gov.tw/zh/assets/documents/%E6%96%B0%E8%81%9E%E7%A8%BF/023b202c-8bc9-4b19-a8eb-c0d0b5809f99.pdf",
      "date": "2026-01-10",
      "type": "gov-report"
    },
    {
      "id": "src-vanderbilt-golaxy",
      "title": "The GoLaxy Documents",
      "org": "Vanderbilt Institute of National Security (Wicked Problems Lab)",
      "url": "https://www.vanderbilt.edu/national-security/wicked-problems-lab/golaxy/",
      "date": "2025-08",
      "type": "academic"
    },
    {
      "id": "src-record-golaxy",
      "title": "The GoLaxy papers: Inside China's AI persona army",
      "org": "Recorded Future News (The Record)",
      "url": "https://therecord.media/golaxy-china-artificial-intelligence-papers",
      "date": "2025-09",
      "type": "news"
    },
    {
      "id": "src-dtl-golaxy",
      "title": "The Rise of AI in PRC Influence Operations: Nine Takeaways from the GoLaxy Documents",
      "org": "Doublethink Lab",
      "url": "https://medium.com/doublethinklab/the-rise-of-ai-in-prc-influence-operations-nine-takeaways-from-the-golaxy-documents-2d6617a753e5",
      "date": "2026-03",
      "type": "ngo-report"
    },
    {
      "id": "src-nyt-golaxy",
      "title": "The Era of A.I. Propaganda Has Arrived, and America Must Act",
      "org": "The New York Times (Opinion)",
      "url": "https://www.nytimes.com/2025/08/05/opinion/ai-propaganda-china-golaxy.html",
      "date": "2025-08",
      "type": "news"
    },
    {
      "id": "src-gti-base311",
      "title": "The Role of PLA Base 311 in Political Warfare against Taiwan (Part 3)",
      "org": "Global Taiwan Institute",
      "url": "https://globaltaiwan.org/2017/02/the-role-of-pla-base-311-in-political-warfare-against-taiwan-part-3/",
      "date": "2017-02",
      "type": "ngo-report"
    },
    {
      "id": "src-aspi-strait",
      "title": "State of the Strait (united front activity tracking)",
      "org": "ASPI",
      "url": "https://stateofthestrait.substack.com/p/was-2025-an-inflection-point-for",
      "date": "2025",
      "type": "ngo-report"
    },
    {
      "id": "src-meta-2023",
      "title": "Raising Online Defenses Through Transparency and Collaboration (Q2 2023 Adversarial Threat Report)",
      "org": "Meta",
      "url": "https://about.fb.com/news/2023/08/raising-online-defenses/",
      "date": "2023-08",
      "type": "platform-report"
    },
    {
      "id": "src-record-spamouflage",
      "title": "China accused of largest covert influence operation by Meta",
      "org": "Recorded Future News (The Record)",
      "url": "https://therecord.media/spamouflage-china-accused-largest-covert-influence-operation-meta",
      "date": "2023-08",
      "type": "news"
    },
    {
      "id": "src-iorg-118",
      "title": "賴清德當選後的中共宣傳：台灣民主失敗論 (週報第118期)",
      "org": "IORG",
      "url": "https://iorg.tw/_en/da/118",
      "date": "2025-08",
      "type": "ngo-report"
    },
    {
      "id": "src-record-meiya",
      "title": "Treasury blacklists eight Chinese tech firms for their role in Uyghur surveillance",
      "org": "Recorded Future News (The Record)",
      "url": "https://therecord.media/treasury-blacklists-eight-chinese-tech-firms-for-their-role-in-uyghur-surveillance",
      "date": "2021-12",
      "type": "news"
    },
    {
      "id": "src-hrw-iflytek",
      "title": "China: Voice Biometric Collection Threatens Privacy",
      "org": "Human Rights Watch",
      "url": "https://www.hrw.org/news/2017/10/22/china-voice-biometric-collection-threatens-privacy",
      "date": "2017-10",
      "type": "ngo-report"
    },
    {
      "id": "src-propublica-onesight",
      "title": "How China Built a Twitter Propaganda Machine Then Let It Loose on Coronavirus",
      "org": "ProPublica",
      "url": "https://www.propublica.org/article/how-china-built-a-twitter-propaganda-machine-then-let-it-loose-on-coronavirus",
      "date": "2020-03",
      "type": "news"
    },
    {
      "id": "src-aspi-persuasive",
      "title": "Persuasive technologies in China: implications for the future of national security",
      "org": "ASPI",
      "url": "https://www.aspi.org.au/report/persuasive-technologies-china-implications-future-national-security/",
      "date": "2024-11",
      "type": "ngo-report"
    },
    {
      "id": "src-mandiant-haienergy-2022",
      "title": "Pro-PRC 'HaiEnergy' Information Operations Campaign Leverages Infrastructure from Public Relations Firm",
      "org": "Mandiant / Google",
      "url": "https://cloud.google.com/blog/topics/threat-intelligence/pro-prc-information-operations-campaign-haienergy",
      "date": "2022-08",
      "type": "platform-report"
    },
    {
      "id": "src-mandiant-haienergy-2023",
      "title": "Pro-PRC HaiEnergy Campaign Exploits U.S. News Outlets via Newswire Services",
      "org": "Mandiant / Google",
      "url": "https://cloud.google.com/blog/topics/threat-intelligence/pro-prc-haienergy-us-news/",
      "date": "2023-07",
      "type": "platform-report"
    },
    {
      "id": "src-google-glassbridge",
      "title": "Seeing Through a GLASSBRIDGE: Understanding the Digital Marketing Ecosystem Spreading Pro-PRC Influence Operations",
      "org": "Google Threat Intelligence Group",
      "url": "https://cloud.google.com/blog/topics/threat-intelligence/glassbridge-pro-prc-influence-operations",
      "date": "2024-11",
      "type": "platform-report"
    },
    {
      "id": "src-dtl-borderless",
      "title": "Assessing the Borderless Group's Activity on Threads",
      "org": "Doublethink Lab",
      "url": "https://medium.com/doublethinklab/assessing-the-borderless-groups-activity-on-threads-69257a44ca82",
      "date": "2026-04",
      "type": "ngo-report"
    },
    {
      "id": "src-reporter-mission",
      "title": "打不死的內容農場──揭開「密訊」背後操盤手和中國因素",
      "org": "報導者 The Reporter",
      "url": "https://www.twreporter.org/a/information-warfare-business-content-farm-mission",
      "date": "2019-12",
      "type": "news"
    },
    {
      "id": "src-gazette-mission",
      "title": "Uncovering the Money and China Factor Behind Mission, Taiwan's Biggest Content Farm",
      "org": "Taiwan Gazette",
      "url": "https://www.taiwangazette.org/news/2020/7/22/uncovering-the-money-and-china-factor-behind-mission-taiwans-biggest-content-farm",
      "date": "2020-07",
      "type": "news"
    },
    {
      "id": "src-ltn-chinavtv",
      "title": "勾結中企在台投資、散布假訊息 「中華微視」負責人被約談9萬交保",
      "org": "自由時報 Liberty Times",
      "url": "https://news.ltn.com.tw/news/society/breakingnews/4127700",
      "date": "2022-11",
      "type": "news"
    },
    {
      "id": "src-gti-provincial",
      "title": "Political Warfare Alert: The PRC's Evolving Information Operations and Provincial Media",
      "org": "Global Taiwan Institute",
      "url": "https://globaltaiwan.org/2023/01/political-warfare-alert-the-prcs-evolving-information-operations-provincial-media/",
      "date": "2023-01",
      "type": "ngo-report"
    },
    {
      "id": "src-dtl-2022election",
      "title": "2022 Taiwan Election: Foreign Influence Observation Report",
      "org": "Doublethink Lab",
      "url": "https://medium.com/doublethinklab/2022-taiwan-election-foreign-influence-observation-report-89951af668f1",
      "date": "2023-06",
      "type": "ngo-report"
    },
    {
      "id": "src-graphika-spamouflage",
      "title": "Spamouflage Dragon",
      "org": "Graphika",
      "url": "https://graphika.com/reports/spamouflage/",
      "date": "2019-09",
      "type": "ngo-report"
    },
    {
      "id": "src-dtl-impersonation",
      "title": "Inauthentic Accounts Impersonate Taiwanese to Attack Political Party",
      "org": "Doublethink Lab",
      "url": "https://medium.com/doublethinklab/inauthentic-accounts-impersonate-taiwanese-to-attack-political-party-c7d04d5e1e13",
      "date": "2025-07",
      "type": "ngo-report"
    },
    {
      "id": "src-graphika-americans",
      "title": "The #Americans: Spamouflage Network Poses as U.S. Citizens",
      "org": "Graphika",
      "url": "https://graphika.com/reports/the-americans",
      "date": "2024-09",
      "type": "ngo-report"
    },
    {
      "id": "src-cna-yuyuan",
      "title": "中央廣播電視總台證實「玉淵譚天」為其自媒體品牌",
      "org": "中央社 CNA",
      "url": "https://www.cna.com.tw/news/firstnews/201908210225.aspx",
      "date": "2019-08",
      "type": "news"
    },
    {
      "id": "src-wiki-yuyuan",
      "title": "Yuyuan Tantian",
      "org": "Wikipedia (citing 中国记协网/BBC)",
      "url": "https://en.wikipedia.org/wiki/Yuyuan_Tantian",
      "date": "2024",
      "type": "academic"
    },
    {
      "id": "src-wiki-vos",
      "title": "Voice of the Strait",
      "org": "Wikipedia (citing Kania/GTI)",
      "url": "https://en.wikipedia.org/wiki/Voice_of_the_Strait",
      "date": "2024",
      "type": "academic"
    },
    {
      "id": "src-wiki-globaltimes",
      "title": "Global Times",
      "org": "Wikipedia",
      "url": "https://en.wikipedia.org/wiki/Global_Times",
      "date": "2024",
      "type": "academic"
    },
    {
      "id": "src-lowy-globaltimes",
      "title": "The Global Times and Beijing: A nuanced relationship",
      "org": "Lowy Institute (The Interpreter)",
      "url": "https://www.lowyinstitute.org/the-interpreter/global-times-beijing-nuanced-relationship",
      "date": "2016",
      "type": "ngo-report"
    },
    {
      "id": "src-globaltimes-pelosi",
      "title": "Pelosi's Taiwan visit will be torn up by history as waste paper",
      "org": "Global Times",
      "url": "https://www.globaltimes.cn/page/202208/1272161.shtml",
      "date": "2022-08",
      "type": "news"
    },
    {
      "id": "src-dtl-deafening",
      "title": "Deafening Whispers — China's Information Operation and Taiwan's 2020 Election",
      "org": "Doublethink Lab",
      "url": "https://medium.com/doublethinklab/deafening-whispers-f9b1d773f6cd",
      "date": "2020-10",
      "type": "ngo-report"
    },
    {
      "id": "src-record-pelosi",
      "title": "Cyberattacks on Taiwan started several days before Pelosi arrival: report",
      "org": "Recorded Future News (The Record)",
      "url": "https://therecord.media/cyberattacks-on-taiwan-started-several-days-before-pelosi-arrival-report",
      "date": "2022-08",
      "type": "news"
    },
    {
      "id": "src-focustaiwan-pelosi",
      "title": "Cyber attacks reported in stores, gov't facilities during Pelosi visit",
      "org": "Focus Taiwan (CNA)",
      "url": "https://focustaiwan.tw/society/202208030026",
      "date": "2022-08",
      "type": "news"
    },
    {
      "id": "src-iorg-38",
      "title": "延續麥卡錫和裴洛西兩任美國議長的疑美論",
      "org": "IORG",
      "url": "https://iorg.tw/_en/da/38",
      "date": "2023-03",
      "type": "ngo-report"
    },
    {
      "id": "src-iorg-41",
      "title": "蔡麥會後中共軍演相關8項可疑論述",
      "org": "IORG",
      "url": "https://iorg.tw/_en/da/41",
      "date": "2023-05",
      "type": "ngo-report"
    },
    {
      "id": "src-dtl-multiverse",
      "title": "Artificial Multiverse: Foreign Information Manipulation and Interference in Taiwan's 2024 National Elections",
      "org": "Doublethink Lab",
      "url": "https://medium.com/doublethinklab/artificial-multiverse-foreign-information-manipulation-and-interference-in-taiwans-2024-national-f3e22ac95fe7",
      "date": "2024-08",
      "type": "ngo-report"
    },
    {
      "id": "src-mtac-2024",
      "title": "China tests US voter fault lines and ramps AI content to boost its geopolitical interests",
      "org": "Microsoft Threat Analysis Center (MTAC)",
      "url": "https://blogs.microsoft.com/on-the-issues/2024/04/04/china-ai-influence-elections-mtac-cybersecurity/",
      "date": "2024-04",
      "type": "platform-report"
    },
    {
      "id": "src-iorg-usskep1",
      "title": "疑美論和它們的產地 / US Skepticism Narratives and Where They Come From",
      "org": "IORG",
      "url": "https://iorg.tw/_en/a/us-skepticism-1",
      "date": "2023-08",
      "type": "ngo-report"
    },
    {
      "id": "src-chinapower-js2024a",
      "title": "How Is China Responding to the Inauguration of Taiwan's President William Lai? (Joint Sword-2024A)",
      "org": "ChinaPower (CSIS)",
      "url": "https://chinapower.csis.org/china-respond-inauguration-taiwan-william-lai-joint-sword-2024a-military-exercise/",
      "date": "2024-05",
      "type": "ngo-report"
    },
    {
      "id": "src-jamestown-js2024b",
      "title": "Discourse Dimensions of the PLA's Joint Sword 2024-B Exercises",
      "org": "Jamestown Foundation",
      "url": "https://jamestown.org/program/discourse-dimensions-of-the-plas-joint-sword-2024-b-drills/",
      "date": "2024-11",
      "type": "ngo-report"
    },
    {
      "id": "src-tvbs-etc",
      "title": "陸解放軍釋出環台軍演最新3D動畫（進！圍！鎖！）",
      "org": "TVBS",
      "url": "https://news.tvbs.com.tw/world/2496210",
      "date": "2024",
      "type": "news"
    },
    {
      "id": "src-nsb-2025",
      "title": "2024 年中共爭訊傳散態樣分析（報告全文）",
      "org": "國家安全局 National Security Bureau (NSB), Taiwan",
      "url": "https://www.nsb.gov.tw/zh/assets/documents/%E6%96%B0%E8%81%9E%E7%A8%BF/2024%E5%B9%B4%E4%B8%AD%E5%85%B1%E7%88%AD%E8%A8%8A%E5%82%B3%E6%95%A3%E6%85%8B%E6%A8%A3%E5%88%86%E6%9E%90(%E5%A0%B1%E5%91%8A%E5%85%A8%E6%96%87)-%E4%B8%AD%E6%96%87.pdf",
      "date": "2025-01-03",
      "type": "gov-report"
    },
    {
      "id": "src-vanderbilt-golaxy-2025",
      "title": "范德堡智庫揭露 GoLaxy 對台 AI 資訊操作文件（中央社報導）",
      "org": "中央社 CNA",
      "url": "https://www.cna.com.tw/news/aopl/202508060159.aspx",
      "date": "2025-08-06",
      "type": "news"
    },
    {
      "id": "src-taipei-times-nsb-2026",
      "title": "Chinese online manipulation soars: NSB",
      "org": "Taipei Times",
      "url": "https://www.taipeitimes.com/News/front/archives/2026/01/12/2003850442",
      "date": "2026-01-12",
      "type": "news"
    },
    {
      "id": "src-storm-nsb-2026",
      "title": "分析2025年「中共對台認知作戰」！國安局拆解5手法：假帳號、AI造假輿論",
      "org": "風傳媒 Storm Media",
      "url": "https://www.storm.mg/article/11094106",
      "date": "2026-01-12",
      "type": "news"
    },
    {
      "id": "src-iorg-101",
      "title": "2024 年 3 次中共對台軍演期間 23 項台灣國防失敗論",
      "org": "IORG 台灣資訊環境研究中心",
      "url": "https://iorg.tw/da/101",
      "date": "2025-02-14",
      "type": "ngo-report"
    },
    {
      "id": "src-iorg-136",
      "title": "2025 年中共官宣影片裡的「台灣代表」",
      "org": "IORG 台灣資訊環境研究中心",
      "url": "https://iorg.tw/da/136",
      "date": "2026-04-17",
      "type": "ngo-report"
    },
    {
      "id": "src-iorg-tw-defeatism",
      "title": "台灣失敗論和民主的信心危機",
      "org": "IORG 台灣資訊環境研究中心",
      "url": "https://iorg.tw/a/tw-defeatism-259",
      "date": "2025-09-23",
      "type": "ngo-report"
    },
    {
      "id": "src-iorg-11",
      "title": "疑美論源於台灣、中共介入放大（美軍撤離阿富汗）",
      "org": "IORG 台灣資訊環境研究中心",
      "url": "https://iorg.tw/da/11",
      "date": "2021-09-16",
      "type": "ngo-report"
    },
    {
      "id": "src-iorg-131",
      "title": "中共月報：2026 年 1 月（IORG 週報第131期）",
      "org": "IORG 台灣資訊環境研究中心",
      "url": "https://iorg.tw/da/131",
      "date": "2026-02-11",
      "type": "ngo-report"
    },
    {
      "id": "src-iorg-139",
      "title": "中共月報：2026 年 5 月（IORG 週報第139期）",
      "org": "IORG 台灣資訊環境研究中心",
      "url": "https://iorg.tw/da/139",
      "date": "2026-06-19",
      "type": "ngo-report"
    },
    {
      "id": "src-isd-magaflage",
      "title": "Pro-CCP Spamouflage campaign experiments with new tactics targeting the US",
      "org": "Institute for Strategic Dialogue (ISD)",
      "url": "https://www.isdglobal.org/digital-dispatch/pro-ccp-spamouflage-campaign-experiments-with-new-tactics-targeting-the-us/",
      "date": "2024-04-01",
      "type": "ngo-report"
    },
    {
      "id": "src-meta-q3-2023",
      "title": "Meta Q3 2023 威脅報告：中國影響力網絡下架（CNBC 報導）",
      "org": "CNBC（引述 Meta Q3 2023 Adversarial Threat Report）",
      "url": "https://www.cnbc.com/2023/11/30/meta-q3-threats-report-shows-risk-of-china-influence-ahead-of-election.html",
      "date": "2023-11-30",
      "type": "news"
    },
    {
      "id": "src-google-dragonbridge-2024",
      "title": "Google disrupted over 10,000 instances of DRAGONBRIDGE activity in Q1 2024",
      "org": "Google Threat Analysis Group",
      "url": "https://blog.google/threat-analysis-group/google-disrupted-dragonbridge-activity-q1-2024/",
      "date": "2024-06-26",
      "type": "platform-report"
    },
    {
      "id": "src-rf-empire-dragon",
      "title": "Empire Dragon Accelerates Covert Information Operations and Converges with Russian Narratives",
      "org": "Recorded Future Insikt Group",
      "url": "https://www.recordedfuture.com/research/empire-dragon-accelerates-covert-information-operations-converges-russian-narratives",
      "date": "2023-08-30",
      "type": "ngo-report"
    },
    {
      "id": "src-aspi-2024",
      "title": "As Taiwan voted, Beijing spammed AI avatars, faked paternity tests and leaked fake documents",
      "org": "ASPI (The Strategist)",
      "url": "https://www.aspistrategist.org.au/as-taiwan-voted-beijing-spammed-ai-avatars-faked-paternity-tests-and-leaked-fake-documents/",
      "date": "2024-01-18",
      "type": "ngo-report"
    },
    {
      "id": "src-graphika-deepfake",
      "title": "Deepfake It Till You Make It",
      "org": "Graphika",
      "url": "https://public-assets.graphika.com/reports/graphika-report-deepfake-it-till-you-make-it.pdf",
      "date": "2023-02-07",
      "type": "ngo-report"
    },
    {
      "id": "src-doj-912",
      "title": "34 Officers of People's Republic of China National Police Charged with Perpetrating Transnational Repression Scheme Targeting U.S. Residents",
      "org": "US DOJ (EDNY)",
      "url": "https://www.justice.gov/usao-edny/pr/34-officers-peoples-republic-china-national-police-charged-perpetrating-transnational",
      "date": "2023-04-17",
      "type": "gov-report"
    },
    {
      "id": "src-meta-q1-2025",
      "title": "Meta Quarterly Adversarial Threat Report Q1 2025 (PDF)",
      "org": "Meta",
      "url": "https://nuari.org/hubfs/Meta%20Adversarial%20Threat%20Report%20May%202025.pdf",
      "date": "2025-05-31",
      "type": "platform-report"
    },
    {
      "id": "src-citizenlab-paperwall",
      "title": "PAPERWALL: Chinese Websites Posing as Local News Outlets with Pro-Beijing Content",
      "org": "Citizen Lab (University of Toronto)",
      "url": "https://citizenlab.ca/2024/02/paperwall-chinese-websites-posing-as-local-news-outlets-with-pro-beijing-content/",
      "date": "2024-02-07",
      "type": "academic"
    },
    {
      "id": "src-cybercx-cicada",
      "title": "CyberCX unmasks China-linked AI disinformation capability on X (Green Cicada)",
      "org": "CyberCX",
      "url": "https://cybercx.com/blog/cybercx-unmasks-china-linked-ai-disinformation-capability/",
      "date": "2024-08-18",
      "type": "ngo-report"
    },
    {
      "id": "src-factlink-pla",
      "title": "【正義使命-2025軍演系列分析】揭露東部戰區融媒體宣傳網絡",
      "org": "FactLink 數位素養實驗室（與台灣民主實驗室）",
      "url": "https://www.factlink.tw/p/pla-military-drills",
      "date": "2026-04",
      "type": "ngo-report"
    },
    {
      "id": "src-factlink-takaichi",
      "title": "中國「網路特戰」如何鎖定高市早苗？",
      "org": "FactLink 數位素養實驗室",
      "url": "https://www.factlink.tw/p/openai-factlink",
      "date": "2026-04",
      "type": "ngo-report"
    },
    {
      "id": "src-factlink-satellite",
      "title": "「侵門踏戶感」的宣傳戰：解析光復節中共公布台灣衛星照的背後意涵",
      "org": "FactLink 數位素養實驗室",
      "url": "https://www.factlink.tw/p/china-satellite",
      "date": "2025-11",
      "type": "ngo-report"
    },
    {
      "id": "src-factlink-butterfly",
      "title": "'Are They One of Us?': Butterfly Attacks and Conspiracy Theories Fueling Taiwan's Internal Divide",
      "org": "FactLink 數位素養實驗室",
      "url": "https://www.factlink.tw/p/are-they-one-of-us-butterfly-attacks",
      "date": "2025-11",
      "type": "ngo-report"
    },
    {
      "id": "src-factlink-japan",
      "title": "厭女、歷史深仇到地緣博弈：拆解中國對日本的敘事攻擊劇本",
      "org": "FactLink 數位素養實驗室",
      "url": "https://www.factlink.tw/p/china-japan-propaganda",
      "date": "2026-02",
      "type": "ngo-report"
    },
    {
      "id": "src-factlink-hackleak",
      "title": "「外交抹黑」經典資訊操弄套路：暗網假爆料、假文件",
      "org": "FactLink 數位素養實驗室",
      "url": "https://www.factlink.tw/p/hack-and-leak-taiwan",
      "date": "2026-02",
      "type": "ngo-report"
    },
    {
      "id": "src-factlink-2d1f0c",
      "title": "【FactNote｜數位素養誌】日本面臨的外國資訊操弄攻防戰",
      "org": "FactLink 數位素養實驗室",
      "url": "https://www.factlink.tw/p/factnote",
      "date": "2026-05-21",
      "type": "ngo-report"
    },
    {
      "id": "src-factlink-a7a795",
      "title": "6700筆軍演資料揭露 東部戰區融媒體的宣傳網絡全貌",
      "org": "FactLink 數位素養實驗室",
      "url": "https://www.factlink.tw/p/pla-weibo-analysis",
      "date": "2026-04-29",
      "type": "ngo-report"
    },
    {
      "id": "src-aspi-the-strategist-934197",
      "title": "With the promotion of new generals, Xi prioritises internal control",
      "org": "ASPI The Strategist",
      "url": "https://www.aspistrategist.org.au/with-the-promotion-of-new-generals-xi-prioritises-internal-control/",
      "date": "2026-07-16",
      "type": "news"
    },
    {
      "id": "src-factlink-ff3dee",
      "title": "【FactNote｜數位素養誌】伊朗戰火下的AI宣傳戰＋網攻近期鎖定記者和資安研究者",
      "org": "FactLink 數位素養實驗室",
      "url": "https://www.factlink.tw/p/factnoteai",
      "date": "2026-05-13",
      "type": "ngo-report"
    },
    {
      "id": "src-doublethink-lab-96d2c0",
      "title": "PRC Influence in South Asia: A Case Study of India, Nepal, Sri Lanka, and Pakistan",
      "org": "Doublethink Lab",
      "url": "https://medium.com/doublethinklab/prc-influence-in-south-asia-a-case-study-of-india-nepal-sri-lanka-and-pakistan-a405059731be?source=rss----9106617863e3---4",
      "date": "2026-02-03",
      "type": "ngo-report"
    },
    {
      "id": "src-aspi-00c2db",
      "title": "Persuasive technologies in China: implications for the future of national security",
      "org": "ASPI",
      "url": "https://aspi.s3.ap-southeast-2.amazonaws.com/wp-content/uploads/2025/03/11125258/Persuasive-technologies-in-China_0.pdf",
      "date": "2025-03-11",
      "type": "ngo-report"
    },
    {
      "id": "src-doublethink-lab-aaba8c",
      "title": "A #Bayanihan Initiative: Countering FIMI in the Philippines",
      "org": "Doublethink Lab",
      "url": "https://medium.com/doublethinklab/a-bayanihan-initiative-countering-fimi-in-the-philippines-15d14c4e2356?source=rss----9106617863e3---4",
      "date": "2026-03-20",
      "type": "ngo-report"
    }
  ],
  "narratives": [
    {
      "id": "us-skepticism",
      "name_zh": "疑美論",
      "name_en": "US-Skepticism / Doubt America",
      "summary_zh": "認為「台灣應遠離美國」或「台美應保持距離」的不合理或帶操弄特性論述集合。IORG「疑美論與它們的產地」(2023) 盤點 84 項論述、歸納為 8 類，70 項由中共參與放大。",
      "source_ids": [
        "src-nsb-2026",
        "src-nsb-2025",
        "src-iorg-usskep1",
        "src-iorg-11"
      ]
    },
    {
      "id": "us-abandon",
      "name_zh": "棄台論",
      "name_en": "US-Abandons-Taiwan",
      "summary_zh": "疑美論 A 類：主張美國把台灣當棋子，最終會拋棄台灣；常以越南、香港、阿富汗為例（「今日阿富汗、明日台灣」）。",
      "source_ids": [
        "src-iorg-usskep1",
        "src-iorg-11"
      ],
      "parent": "us-skepticism"
    },
    {
      "id": "defense-futility",
      "name_zh": "國防失敗論",
      "name_en": "Defense-Futility",
      "summary_zh": "認同台灣無法或不應透過自我防衛能力抵抗的論述集合，目的在削弱台灣民眾防衛決心。IORG 在 2024 對台軍演期間盤點 23 項，分 5 大類；總體框架下達 7 類/61 項。",
      "source_ids": [
        "src-iorg-101",
        "src-iorg-tw-defeatism"
      ]
    },
    {
      "id": "war-fear",
      "name_zh": "戰爭論／兵凶戰危",
      "name_en": "War-Fear",
      "summary_zh": "強調戰爭恐懼、以「戰爭與和平」對立框架施壓的論述集合。IORG 指出 2024 大選期間中共官媒抖音影片大量引用台灣人物言論，過半提及戰爭，並對比「戰爭（民進黨）vs 和平（在野）」框架。",
      "source_ids": [
        "src-iorg-101",
        "src-iorg-136"
      ]
    },
    {
      "id": "democracy-failure",
      "name_zh": "台灣民主失敗論",
      "name_en": "Taiwan Democracy-Failure",
      "summary_zh": "賴清德當選後中共宣傳主軸之一，主張台灣民主失靈、退步、淪為獨裁。IORG 週報118 盤點 22 項、分 7 類；IORG 2024 民調顯示 21.7% 民眾呈認同傾向。",
      "source_ids": [
        "src-iorg-118",
        "src-iorg-tw-defeatism"
      ]
    },
    {
      "id": "nar-doubt-military",
      "name_zh": "疑軍論",
      "name_en": "Military-skepticism narrative",
      "summary_zh": "NSB 指中共操作「疑軍」敘事，於軍演期間偽冒我海、空軍及海巡官兵不實爆料，營造對國軍的不信任氛圍以削弱抗敵意志。",
      "source_ids": [
        "src-nsb-2026",
        "src-nsb-2025"
      ]
    },
    {
      "id": "nar-doubt-lai",
      "name_zh": "疑賴論",
      "name_en": "Lai-skepticism narrative",
      "summary_zh": "NSB 指中共操作針對賴清德總統的「疑賴」敘事，削弱國人對政府信心、升高社會對立氛圍。",
      "source_ids": [
        "src-nsb-2026",
        "src-nsb-2025"
      ]
    },
    {
      "id": "nar-deterrence-amplify",
      "name_zh": "渲染共軍鎖臺與反制美日能力",
      "name_en": "Amplifying PLA blockade and counter-US/Japan capability",
      "summary_zh": "NSB 指中共藉對臺軍演結合官方帳號、自媒體、網紅渲染共軍具備鎖臺及反制美日介入能力，擴大威嚇效果。",
      "source_ids": [
        "src-nsb-2025",
        "src-nsb-2026"
      ],
      "parent": "nar-doubt-military"
    },
    {
      "id": "nar-one-china-mainstream",
      "name_zh": "「一中」為國際主流觀點",
      "name_en": "'One China' as international mainstream view",
      "summary_zh": "NSB 指中共委託公關公司創建多語種假外媒（波希米亞日報、奎爾先鋒報等），炒作「一中」原則為國際主流觀點、批評我政府升高臺海緊張。",
      "source_ids": [
        "src-nsb-2025",
        "src-nsb-2026"
      ]
    },
    {
      "id": "us-weakness",
      "name_zh": "衰弱論",
      "name_en": "U.S. Decline Theory",
      "summary_zh": "疑美論 B 類：主張美國實力衰弱、軍力不及中國，無法保護台灣。",
      "source_ids": [
        "src-iorg-usskep1",
        "src-iorg-11"
      ],
      "parent": "us-skepticism"
    },
    {
      "id": "us-chaos",
      "name_zh": "亂源論",
      "name_en": "U.S. Chaos Theory",
      "summary_zh": "疑美論 C 類：主張美國是世界戰亂的根源、挑釁中國以製造兩岸衝突。",
      "source_ids": [
        "src-iorg-usskep1",
        "src-iorg-11"
      ],
      "parent": "us-skepticism"
    },
    {
      "id": "us-false-friend",
      "name_zh": "假朋友論",
      "name_en": "False Friend Theory",
      "summary_zh": "疑美論 D 類：主張美國宣稱支持台灣卻無實質協助，反而壓迫、剝削台灣（如廢鐵軍購、毒豬、晶片換疫苗等不平等交換）。",
      "source_ids": [
        "src-iorg-usskep1"
      ],
      "parent": "us-skepticism"
    },
    {
      "id": "us-collusion",
      "name_zh": "共謀論",
      "name_en": "Collusion Theory",
      "summary_zh": "疑美論 E 類：主張美國與台灣菁英共謀剝削台灣人民。IORG 指旺中集團旗下媒體及網路節目發起此類論述。",
      "source_ids": [
        "src-iorg-usskep1"
      ],
      "parent": "us-skepticism"
    },
    {
      "id": "us-fake-democracy",
      "name_zh": "假民主論",
      "name_en": "Fake Democracy Theory",
      "summary_zh": "疑美論 F 類：主張美國內部腐敗、美式民主是假民主。",
      "source_ids": [
        "src-iorg-usskep1"
      ],
      "parent": "us-skepticism"
    },
    {
      "id": "us-anti-world",
      "name_zh": "反世界論",
      "name_en": "Against-the-World Theory",
      "summary_zh": "疑美論 G 類：主張美國各種行為受世界各國及美國人民反對。",
      "source_ids": [
        "src-iorg-usskep1"
      ],
      "parent": "us-skepticism"
    },
    {
      "id": "us-destroy-taiwan",
      "name_zh": "毀台論",
      "name_en": "Destroy-Taiwan Theory",
      "summary_zh": "疑美論 H 類：主張美國把台灣變成戰場、最終會毀滅台灣（含「留島不留人」「焦土化」等延伸）。",
      "source_ids": [
        "src-iorg-usskep1"
      ],
      "parent": "us-skepticism"
    },
    {
      "id": "defense-willingness",
      "name_zh": "意願論",
      "name_en": "Willingness (sub-narrative)",
      "summary_zh": "國防失敗論意願論類：主張台灣人（尤其年輕人）不願打仗、不願當兵，國軍缺兵。",
      "source_ids": [
        "src-iorg-101"
      ],
      "parent": "defense-futility"
    },
    {
      "id": "defense-capability",
      "name_zh": "能力論",
      "name_en": "Capability (sub-narrative)",
      "summary_zh": "國防失敗論能力論類：主張解放軍武器（東風飛彈、殲16/20、中華神盾）遠優於台灣，國軍武器老舊、軍購被當盤子，台灣抵抗如螳臂擋車。",
      "source_ids": [
        "src-iorg-101"
      ],
      "parent": "defense-futility"
    },
    {
      "id": "defense-morality",
      "name_zh": "道德論",
      "name_en": "Morality (sub-narrative)",
      "summary_zh": "國防失敗論道德論類：主張民進黨炒作軍演、喊台獨者自己不當兵、大內宣謊稱美軍會協防。",
      "source_ids": [
        "src-iorg-101"
      ],
      "parent": "defense-futility"
    },
    {
      "id": "defense-responsibility",
      "name_zh": "責任論",
      "name_en": "Responsibility (sub-narrative)",
      "summary_zh": "國防失敗論責任論類：主張中國愛好和平、軍演係民進黨挑釁所致；IORG 指其與俄羅斯入侵烏克蘭的「北約挑釁」論述結構相似（「今日烏克蘭」）。",
      "source_ids": [
        "src-iorg-101"
      ],
      "parent": "defense-futility"
    },
    {
      "id": "defense-consequence",
      "name_zh": "後果論",
      "name_en": "Consequence (sub-narrative)",
      "summary_zh": "國防失敗論後果論類：主張抵抗將招致經濟崩潰、股市重挫、能源封鎖，且美國不會真正出兵協防（連結疑美論）。",
      "source_ids": [
        "src-iorg-101"
      ],
      "parent": "defense-futility"
    },
    {
      "id": "democracy-civilwar",
      "name_zh": "內戰論",
      "name_en": "Civil-Strife (sub-narrative)",
      "summary_zh": "民主失敗論內戰論類：主張台灣社會充滿矛盾、自我內耗、政黨惡鬥。",
      "source_ids": [
        "src-iorg-118"
      ],
      "parent": "democracy-failure"
    },
    {
      "id": "democracy-greenterror",
      "name_zh": "戒嚴論（綠色恐怖／綠色獨裁）",
      "name_en": "Martial-Law / Green Terror (sub-narrative)",
      "summary_zh": "民主失敗論戒嚴論類：以「綠色恐怖」「綠色獨裁」「司法已死」「准戒嚴」「法西斯化／納粹化」「寒蟬效應」等口號，指控執政黨壓制言論與司法。傳播高峰為 2025.4.26 國民黨「反綠共・戰獨裁」集會。",
      "source_ids": [
        "src-iorg-118"
      ],
      "parent": "democracy-failure"
    },
    {
      "id": "democracy-regression",
      "name_zh": "退步論",
      "name_en": "Regression (sub-narrative)",
      "summary_zh": "民主失敗論退步論類：主張台灣民主退步、民主脫軌。",
      "source_ids": [
        "src-iorg-118"
      ],
      "parent": "democracy-failure"
    },
    {
      "id": "democracy-cult",
      "name_zh": "邪教論",
      "name_en": "Cult (sub-narrative)",
      "summary_zh": "民主失敗論邪教論類：主張民主如一神教信仰、信徒無法理性討論。",
      "source_ids": [
        "src-iorg-118"
      ],
      "parent": "democracy-failure"
    },
    {
      "id": "tw-defeatism",
      "name_zh": "台灣失敗論",
      "name_en": "Taiwan-Defeatism Narrative",
      "summary_zh": "IORG 提出的總體框架，整合外交、國防、民主、內政四面向逾 300 項失敗論述，主張台灣前景無望以削弱社會信心。整體認同傾向約 46.6%（IORG 2025 民調）。涵蓋疑美論、國防失敗論、民主失敗論等子敘事。",
      "source_ids": [
        "src-iorg-tw-defeatism"
      ]
    },
    {
      "id": "nar-prc-fimi-taiwan",
      "name_zh": "中國對台 FIMI 總體敘事",
      "name_en": "PRC FIMI against Taiwan",
      "summary_zh": "中國透過協同性不真實行為網絡、內容農場與 AI 工具，散布親北京、反民進黨敘事，目的在加深台灣內部分歧、削弱抵抗意志並影響國際支持。",
      "source_ids": [
        "src-nsb-2026",
        "src-dtl-multiverse"
      ]
    },
    {
      "id": "nar-tsai-secret-history",
      "name_zh": "《蔡英文秘史》偽文件",
      "name_en": "'Secret History of Tsai Ing-wen' forgery",
      "summary_zh": "2024 大選前散布的 318 頁偽造《蔡英文秘史》文件，透過 Spamouflage／DRAGONBRIDGE 在多平台以 AI 合成語音與頭像大量擴散，並由 GLASSBRIDGE 內容農場託管。",
      "source_ids": [
        "src-google-dragonbridge-2024",
        "src-google-glassbridge",
        "src-aspi-2024",
        "src-dtl-multiverse"
      ],
      "parent": "nar-prc-fimi-taiwan"
    },
    {
      "id": "nar-lai-corruption",
      "name_zh": "賴清德／民進黨貪腐與私生子假訊息",
      "name_en": "Lai Ching-te corruption & paternity disinformation",
      "summary_zh": "以 AI 迷因與偽造 DNA 親子鑑定指控賴清德貪腐、有私生子，攻擊民進黨；2024 大選期間在 X 等平台大量擴散。",
      "source_ids": [
        "src-mtac-2024",
        "src-aspi-2024",
        "src-meta-q1-2025",
        "src-dtl-multiverse"
      ],
      "parent": "nar-prc-fimi-taiwan"
    },
    {
      "id": "nar-tsai-surrender",
      "name_zh": "要求台灣『投降』軍事威懾敘事",
      "name_en": "Calls for Taiwan to 'surrender'",
      "summary_zh": "DRAGONBRIDGE 散布解放軍軍事影片並呼籲蔡英文及其盟友『投降』，營造軍事威懾與失敗主義氛圍。",
      "source_ids": [
        "src-google-dragonbridge-2024"
      ],
      "parent": "nar-prc-fimi-taiwan"
    },
    {
      "id": "nar-anti-dpp",
      "name_zh": "『我是台灣人我反綠』反民進黨敘事",
      "name_en": "'I'm Taiwanese and I oppose the DPP'",
      "summary_zh": "假冒台灣人帳號以『我是台灣人我反綠』型貼文，營造在地民眾自發反對民進黨的假象。",
      "source_ids": [
        "src-dtl-impersonation"
      ],
      "parent": "nar-prc-fimi-taiwan"
    },
    {
      "id": "nar-social-division",
      "name_zh": "社會分化操作（蝴蝶攻擊）",
      "name_en": "Social-Division / Butterfly-Attack",
      "summary_zh": "以假冒在地者（蝴蝶攻擊）散布嫁禍、互控的不實內容，挑動族群與政黨對立、製造內部不信任的分化操作。",
      "source_ids": [
        "src-factlink-butterfly"
      ],
      "parent": "nar-prc-fimi-taiwan"
    },
    {
      "id": "nar-japan-militarism",
      "name_zh": "日本軍國主義復辟論",
      "name_en": "Japan-Militarism-Revival",
      "summary_zh": "將日本對台海的關切框架為軍國主義復辟、鼓勵台獨、威脅區域和平的對日敘事。",
      "source_ids": [
        "src-factlink-japan"
      ]
    },
    {
      "id": "nar-ryukyu",
      "name_zh": "琉球地位未定論",
      "name_en": "Ryukyu-Status-Undetermined",
      "summary_zh": "強調琉球（沖繩）與中國歷史連結、戰後地位未定，藉以反制日本並擴張地緣主張的敘事。",
      "source_ids": [
        "src-factlink-japan"
      ]
    },
    {
      "id": "nar-diplomatic-smear",
      "name_zh": "外交抹黑（暗網假文件 hack-and-leak）",
      "name_en": "Diplomatic-Smear via Fabricated Leaks",
      "summary_zh": "以偽造文件在偽暗網『假爆料』、再由協同帳號放大，抹黑我方外交人員與台日關係的操弄套路。",
      "source_ids": [
        "src-factlink-hackleak"
      ],
      "parent": "nar-prc-fimi-taiwan"
    }
  ]
};
