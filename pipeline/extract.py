#!/usr/bin/env python3
"""地端 LLM 抽取：報告文字 → 本機 Ollama 模型（forced JSON schema）→ mentions＋逐字述詞。

模型只做忠實抽取；碼端 span-check（引文對不上原文即丟）擋幻覺。
純 stdlib（urllib）。用法：python3 pipeline/extract.py [model]  （預設 gemma4:12b-it-qat）
"""
import json, urllib.request, pathlib, re, sys

OLLAMA = "http://localhost:11434/api/chat"
_here = pathlib.Path(__file__).resolve().parent
SCHEMA = json.loads((_here / "extraction.schema.json").read_text(encoding="utf-8"))
FORMAT = {                                            # 只約束 mentions/assertions（report meta 由呼叫端補）
    "type": "object", "required": ["mentions", "assertions"],
    "properties": {"mentions": SCHEMA["properties"]["mentions"],
                   "assertions": SCHEMA["properties"]["assertions"]},
}
INSTR = (
    "You extract the FIMI structure from a threat report. Output ONLY JSON per the schema.\n"
    "Extract the OPERATION and the ACTOR behind it. Do NOT extract the researcher/publisher who wrote the report, "
    "and do NOT treat the hosting platform (Threads/X/Facebook) as the actor.\n"
    "mentions (surface verbatim, coarse_type, verbatim quote):\n"
    "- the operation/campaign -> 'operation'\n"
    "- the actor: a cluster of fake accounts -> 'network'; a company/agency -> 'org'; an individual -> 'person'\n"
    "- narratives/slogans pushed -> 'narrative'\n"
    "- fake accounts/sites/pages used -> 'account'/'website'/'media'\n"
    "- target country -> 'place'; target political party -> 'org'\n"
    "assertions: subject/object are mention tmp_ids; predicate is the verbatim verb phrase "
    "(e.g. 'operated by', 'run by', 'linked to', 'targeting', 'used'); plus a verbatim quote.\n"
    "Copy every quote verbatim from the text. Do NOT classify, score, or attribute."
)

def call_ollama(text, model):
    body = {"model": model, "stream": False, "options": {"temperature": 0}, "format": FORMAT,
            "messages": [{"role": "user", "content": INSTR + "\n\nREPORT TEXT:\n" + text}]}
    req = urllib.request.Request(OLLAMA, data=json.dumps(body).encode("utf-8"),
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r:
        content = json.loads(r.read())["message"]["content"]
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", content, re.S)      # 模型偶爾包 ```json 或多餘文字 → 取第一個平衡物件
        if m: return json.loads(m.group(0))
        raise SystemExit("✗ 模型回應非 JSON：\n" + content[:800])

def _n(s): return re.sub(r"\s+", "", (s or ""))

def span_check(extr, text):                           # 碼端硬閘：引文對不上原文即丟
    t = _n(text); dropped = []
    keep_m, ids = [], set()
    for m in extr.get("mentions", []):
        if m.get("quote") and _n(m["quote"]) not in t: dropped.append(("mention", m.get("surface"))); continue
        keep_m.append(m); ids.add(m.get("tmp_id"))
    keep_a = []
    for a in extr.get("assertions", []):
        if a.get("quote") and _n(a["quote"]) not in t: dropped.append(("assertion", a.get("predicate"))); continue
        if a.get("subject") in ids and a.get("object") in ids: keep_a.append(a)
        else: dropped.append(("dangling", a.get("predicate")))
    return {"mentions": keep_m, "assertions": keep_a}, dropped

def extract(report_meta, text, model="gemma4:12b-it-qat"):
    raw = call_ollama(text, model)
    for m in raw.get("mentions", []): m.setdefault("source_url", report_meta["url"])
    for a in raw.get("assertions", []): a.setdefault("source_url", report_meta["url"])
    checked, dropped = span_check(raw, text)
    return {"report": report_meta, **checked}, dropped

# ---------- 地端端到端測試 ----------
if __name__ == "__main__":
    model = sys.argv[1] if len(sys.argv) > 1 else "gemma4:12b-it-qat"
    import importlib.util
    def _load(name):
        spec = importlib.util.spec_from_file_location(name, str(_here / (name + ".py")))
        m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
    pipe, D = _load("pipeline"), _load("derive")

    report = {"name": "Inauthentic Accounts Impersonate Taiwanese to Attack Political Party",
              "org": "Doublethink Lab",
              "url": "https://medium.com/doublethinklab/inauthentic-accounts-impersonate-taiwanese-to-attack-political-party-c7d04d5e1e13",
              "published": "2025-07", "type": "ngo-report"}
    text = (
        "Doublethink Lab identified 51 inauthentic accounts on Threads impersonating Taiwanese users to attack "
        "the Democratic Progressive Party (DPP). Between June 2024 and April 2025 the accounts posted 7,032 times, "
        "including 275 near-identical posts of the type 'I am Taiwanese and I oppose the greens'. 44 of the 51 accounts "
        "reused photos of Taiwanese influencers. Some posts showed simplified-Chinese characters and one account was "
        "linked to a Hong Kong phone number. Doublethink Lab assesses that the network can likely be linked to the PRC."
    )
    print(f"=== 地端模型：{model}（Ollama）===")
    extr, dropped = extract(report, text, model)
    print(f"抽取：{len(extr['mentions'])} mentions、{len(extr['assertions'])} assertions；span-check 丟棄 {len(dropped)}"
          + (f" → {dropped}" if dropped else "（引文全部對得上原文）"))
    print(json.dumps(extr, ensure_ascii=False, indent=2))
    print("\n=== 碼判斷（derive）===")
    reg = D.load_registry(); sl, log = D.derive(extr, reg)
    for l in log: print("  · " + l)
    bundle = pipe.serialize(sl); fails, att = pipe.validate(bundle)
    print("\n=== 驗證 + 投影 ===")
    print("  " + ("✓ profile 不變量 OK" if not fails else "⚠ " + " | ".join(fails)) + f"；attributed-to={len(att)}")
    p = pipe.project(bundle)
    print(json.dumps({"L1_operator": p["operator"], "claims": p["claims"], "targets": p["targets"]}, ensure_ascii=False, indent=2))
