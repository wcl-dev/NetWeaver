# NetWeaver ③ 抽取管線（最小可跑）

把一份自然語言 FIMI 報告，經固定中介格式（STIX）穩定地變成 NetWeaver 的 operator 視圖資料。規格見 [../docs/STIX-PROFILE.md](../docs/STIX-PROFILE.md)。

## 四階段

```
① STIX-lite ──▶ ② serialize ──▶ ③ validate ──▶ ④ project
  (LLM 語意)     (碼→合法STIX)   (profile不變量)  (operator三層)
```

- **① STIX-lite**：抽取 LLM 照 `stixlite.schema.json`（forced schema）產出的**語意層**——概念物件＋關係＋每項逐字引文，無 UUID。（本 demo 由人手扮演 LLM，見 `samples/`。）
- **② serialize**（`pipeline.py`）：決定性補 UUIDv5、接 SRO、填必填欄、掛 `x-dad-*` 擴充與 marking → **合法 STIX 2.1 bundle**。
- **③ validate**：檢查 profile 不變量——id 皆 UUIDv5、無懸空 SRO、grounding 完整（每個被抽取物件都有引文或有 evidence 的關係碰到）、保守歸因（無 `attributed-to` 除非明確歸因）。
- **④ project**：把 Campaign 中心的 STIX 投影成 **operator 三層**（L1 operator／L2 行動／L3 逐來源 claim），即前端讀的形狀。

## 跑

```bash
python3 pipeline/pipeline.py pipeline/samples/anti-dpp.stixlite.json
# → 寫出 pipeline/out/anti-dpp.stix.json（合法 STIX bundle）＋印出驗證與投影
```

純 Python stdlib、決定性（同輸入→同 UUID／同輸出，OpenCTI upsert 不重複）。

## 這個 demo 示範什麼

範例是 Doublethink Lab「假冒台灣人反民進黨帳號網絡」報告，因為它剛好演示三件核心：

1. **保守歸因（紅線）**：DTL 只說「can likely be linked to the PRC」→ 管線**停在 IMS、不建 Threat Actor、`attributed-to = 0`**。若日後有明確歸因（人工閘）才上捲到具名。
2. **STIX-lite 一經 serializer 即正式**：canonical 永遠是合法 STIX，STIX-lite 不會「拖著」。
3. **claims 自動掉出＝真 B**：投影的 L3 就是逐來源、附引文的 claim 卡——B-lite 在此退場。

## 檔案

```
pipeline/
├── stixlite.schema.json         # ① 抽取契約（LLM 目標形狀）
├── samples/anti-dpp.stixlite.json  # 一份報告的 STIX-lite（LLM 產出）
├── pipeline.py                  # ②③④ serialize / validate / project
├── out/anti-dpp.stix.json       # 產出的合法 STIX bundle（範例）
└── README.md
```

## 下一步（把 demo 變生產）

- **接真 LLM**：把 `samples/*.stixlite.json` 換成「landed 報告 → LLM(forced schema) → STIX-lite」自動產出。
- **接 projector → db.js**：把 `project()` 併入 db.js 編譯，讓前端直接吃（新料天生真 B）。
- **serializer 補完**：更多物件型別、官方 DISARM bundle 引用、對照 STIX 官方 schema 驗證。
- **批次＋去重**：對既有 STIX 庫做實體解析（IMS/Channel/Actor），`modified` 版本化。
- **ingest（②工作項）並行**：把 `samples/` 的來源換成 RSS/快照自動落地。
