#!/usr/bin/env python3
"""宣稱可讀性的語意判斷——碼判不準時，模型只回答一個問題。

## 為什麼需要它

逐來源宣稱要回答的是「這份報告怎麼描述這個行為者」。所以判準不是「這段文字
是不是文法完整的句子」，而是「它有沒有說出關於某個行為者的事」。語法 proxy
兩邊都會判錯，實測：

  「龍橋（Dragonbridge）為公安部僱用的網路水軍」        沒有句號，但說清楚了 → 該留
  「the campaign was run using GoLaxy's AI-driven…」  小寫開頭，但說清楚了 → 該留
  「which is increasingly common across the network」  which 指誰？句子沒說  → 該刪
  「we were able to tie this activity together…」      this activity 是什麼？  → 該刪

「有沒有句號」「是不是小寫開頭」和「讀不讀得懂」根本不是同一件事。

## 紅線

模型**只**判斷呈現層的可讀性，不碰分類、關係、信心、歸因——那些仍然全部是
碼規則，改動須附測試。判斷結果寫進 data/claim_verdicts.json 供人稽核與覆寫，
不是藏在程式邏輯裡：模型說了什麼、什麼時候說的、用哪個模型，都留下紀錄。

## 用量

碼先把能確定的分掉（實測 804 條裡 778 條碼就能定案），只有邊界案例送模型。
結果按文字雜湊快取，重跑不再計費。
"""
import hashlib, json, os, pathlib, importlib.util
from datetime import date

_here = pathlib.Path(__file__).resolve().parent
# 測試可用 NW_CLAIM_VERDICTS 指向別處，避免動到真實裁決檔
def _verdicts_path():
    return pathlib.Path(os.environ.get("NW_CLAIM_VERDICTS")
                        or (_here.parent / "data" / "claim_verdicts.json"))
VERDICTS = _here.parent / "data" / "claim_verdicts.json"


def _extract():
    spec = importlib.util.spec_from_file_location("extract", str(_here / "extract.py"))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def key_of(text, about):
    return hashlib.sha256((about + " " + text).encode("utf-8")).hexdigest()[:16]


def load_verdicts():
    try:
        return json.loads(_verdicts_path().read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_verdicts(v):
    p = _verdicts_path()
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(v, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")


_SCHEMA = {"type": "object", "additionalProperties": False,
           "required": ["readable", "reason"],
           "properties": {"readable": {"type": "boolean"},
                          "reason": {"type": "string", "maxLength": 120}}}

_PROMPT = """你在檢查一段從研究報告抽出的文字，能不能單獨放進「{about}」的檔案頁，讓讀者看懂報告在說關於它的什麼事。

只判斷**這段文字本身讀不讀得懂**，不要判斷內容真假、也不要判斷它是不是完整句子：
- 沒有句號、用條列語氣寫的簡短陳述，只要說清楚了一件事，就算可讀。
- 開頭是 We／This／根據我們 等研究者口吻，只要句中點明了對象，就算可讀。
- 若開頭的代名詞（which／they／this activity／其／該）指向這段文字**以外**的東西，
  讀者無從得知在說什麼，就是不可讀。
- 若只是名稱加標點、章節標題、或半句被切斷的文字，就是不可讀。

文字：
{text}

回答 readable（true/false）與 reason（20 字內，中文）。"""


def judge(text, about, use_model=None):
    """回傳 (readable: bool, reason: str, source: 'cache'|'model'|'default')。

    use_model 預設看環境有沒有設 NW_LLM_API_KEY；沒有模型可用時回 default=True，
    也就是「碼判不準就先留著」——寧可留下一條可疑的，也不要靜靜刪掉一條有效的。
    """
    v = load_verdicts()
    k = key_of(text, about)
    if k in v:
        return bool(v[k]["readable"]), v[k].get("reason", ""), "cache"
    if use_model is None:
        use_model = bool(os.environ.get("NW_LLM_API_KEY"))
    if not use_model:
        return True, "無模型可用，保留待判", "default"
    ex = _extract()
    out = ex._call_messages(
        [{"role": "user", "content": _PROMPT.format(about=about, text=text)}],
        _SCHEMA, stage="claim-judge")
    readable = bool(out.get("readable"))
    reason = (out.get("reason") or "").strip()
    v[k] = {"text": text, "about": about, "readable": readable, "reason": reason,
            "model": os.environ.get("NW_LLM_MODEL", ""), "judged": date.today().isoformat()}
    save_verdicts(v)
    return readable, reason, "model"
