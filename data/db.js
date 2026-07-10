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
        "PLA Political Work Department (PWD)"
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
      "confidence": "high"
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
      "confidence": "high"
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
        "Taiwan Affairs Office (TAO)"
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
      "confidence": "high"
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
      "confidence": "high"
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
      "confidence": "medium"
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
      "confidence": "high"
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
      "confidence": "medium"
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
        "Yuyuantantian / Chaoyang Shaoxia / Buyidao"
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
      "confidence": "medium"
    },
    {
      "id": "voice-of-strait",
      "name_zh": "海峽之聲",
      "name_en": "Voice of the Strait",
      "aliases": [
        "海峽之聲廣播電台",
        "Voice of the Taiwan Strait",
        "前身：解放軍福建前線廣播電台"
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
      "confidence": "high"
    },
    {
      "id": "global-times",
      "name_zh": "環球時報",
      "name_en": "Global Times",
      "aliases": [
        "环球时报",
        "globaltimes.cn",
        "環球網/Huanqiu"
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
      "confidence": "high"
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
      "confidence": "medium"
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
        "Haixia Daobao (Strait Herald)"
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
      "confidence": "low"
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
        "Want Want China Times Media Group"
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
      "confidence": "high"
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
      "confidence": "high"
    },
    {
      "id": "tvbs",
      "name_zh": "TVBS",
      "name_en": "TVBS",
      "aliases": [
        "TVBS新聞台",
        "新聞大白話",
        "TVBS選新聞"
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
      "confidence": "high"
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
      "confidence": "medium"
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
      "confidence": "high"
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
      "confidence": "high"
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
      "confidence": "high"
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
      "confidence": "high"
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
      "confidence": "high"
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
      "confidence": "high"
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
      "confidence": "high"
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
        "China Media Group (CCTV/CMG)"
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
      "confidence": "high"
    },
    {
      "id": "kankan-news",
      "name_zh": "看看新聞",
      "name_en": "Kankan News (Knews)",
      "aliases": [
        "看看新聞Knews",
        "Knews",
        "上海文化廣播影視集團",
        "Kankan News (Knews)"
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
      "confidence": "medium"
    },
    {
      "id": "china-taiwan-net",
      "name_zh": "中國台灣網",
      "name_en": "China Taiwan Net",
      "aliases": [
        "taiwan.cn",
        "China Taiwan Net"
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
      "confidence": "high"
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
        "Eastern Theater Command Fusion-Media Center"
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
      "confidence": "high"
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
      "confidence": "medium"
    },
    {
      "id": "guancha",
      "name_zh": "觀察者網",
      "name_en": "Guancha (Observer Network)",
      "aliases": [
        "Guancha",
        "Observer Network",
        "guancha.cn",
        "Guancha (Observer Network)"
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
      "confidence": "medium"
    },
    {
      "id": "hu-xijin",
      "name_zh": "胡錫進",
      "name_en": "Hu Xijin",
      "aliases": [
        "Hu Xijin",
        "老胡"
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
      "confidence": "high"
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
