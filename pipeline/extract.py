#!/usr/bin/env python3
"""LLM 抽取 client（provider-agnostic）：報告文字 → LLM（forced JSON schema）→ mentions＋逐字述詞。

模型只做忠實抽取；碼端 span-check（引文對不上原文即丟）擋幻覺。純 stdlib（urllib）。

設定（環境變數，皆可換 → 不寫死地端）：
  NW_LLM_PROVIDER   ollama | openai        （預設 ollama）
  NW_LLM_BASE_URL   端點基底               （預設 http://localhost:11434）
  NW_LLM_MODEL      模型名                 （預設 gemma4:12b-it-qat）
  NW_LLM_API_KEY    金鑰（雲端/相容端點用）
  → 地端零設定即跑；雲端：NW_LLM_PROVIDER=openai NW_LLM_BASE_URL=https://api.openai.com NW_LLM_MODEL=… NW_LLM_API_KEY=…
用法：python3 pipeline/extract.py   （__main__ 為端到端測試）
"""
import json, urllib.request, pathlib, re, sys, os

_here = pathlib.Path(__file__).resolve().parent
SCHEMA = json.loads((_here / "extraction.schema.json").read_text(encoding="utf-8"))
FORMAT = {"type": "object", "required": ["mentions", "assertions"],
          "properties": {"mentions": SCHEMA["properties"]["mentions"],
                         "assertions": SCHEMA["properties"]["assertions"]}}
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
    "Every mention AND assertion MUST include a verbatim quote copied exactly from the text — "
    "no paraphrase; an item without a valid verbatim quote is dropped. Do NOT classify, score, or attribute."
)

def _cfg():
    return (os.environ.get("NW_LLM_PROVIDER", "ollama"),
            os.environ.get("NW_LLM_BASE_URL", "http://localhost:11434").rstrip("/"),
            os.environ.get("NW_LLM_MODEL", "gemma4:12b-it-qat"),
            os.environ.get("NW_LLM_API_KEY", ""))

def call_llm(text):
    provider, base, model, key = _cfg()
    prompt = INSTR + "\n\nREPORT TEXT:\n" + text
    if provider == "ollama":                                  # 地端原生（grammar-forced schema，最嚴）
        url = base + "/api/chat"
        body = {"model": model, "stream": False, "options": {"temperature": 0}, "format": FORMAT,
                "messages": [{"role": "user", "content": prompt}]}
        headers = {"Content-Type": "application/json"}; path = ("message", "content")
    else:                                                     # OpenAI 相容（OpenAI / vLLM / LM Studio / Together / Ollama /v1…）
        url = base + "/v1/chat/completions"
        body = {"model": model, "temperature": 0,
                "response_format": {"type": "json_schema", "json_schema": {"name": "extraction", "schema": FORMAT}},
                "messages": [{"role": "user", "content": prompt}]}
        headers = {"Content-Type": "application/json", "Authorization": "Bearer " + key}
        path = ("choices", 0, "message", "content")
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers=headers)
    with urllib.request.urlopen(req, timeout=600) as r:
        resp = json.loads(r.read())
    content = resp
    for k in path: content = content[k]
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", content, re.S)               # 模型偶爾包 ```json/多餘文字 → 取第一個平衡物件
        if m: return json.loads(m.group(0))
        raise SystemExit("✗ 模型回應非 JSON：\n" + (content or "")[:800])

def _n(s): return re.sub(r"\s+", "", (s or ""))

def span_check(extr, text):                                   # 碼端硬閘：引文缺或對不上原文即丟（fail-closed）
    t = _n(text); dropped = []
    keep_m, ids = [], set()
    for m in extr.get("mentions", []):
        q = _n(m.get("quote"))                                # evidence 必填：缺 quote 也丟（封死繞過 grounding 的 bug）
        if not q: dropped.append(("mention", m.get("surface"), "missing-quote")); continue
        if q not in t: dropped.append(("mention", m.get("surface"), "bad-quote")); continue
        keep_m.append(m); ids.add(m.get("tmp_id"))
    keep_a = []
    for a in extr.get("assertions", []):
        q = _n(a.get("quote"))
        if not q: dropped.append(("assertion", a.get("predicate"), "missing-quote")); continue
        if q not in t: dropped.append(("assertion", a.get("predicate"), "bad-quote")); continue
        if a.get("subject") in ids and a.get("object") in ids: keep_a.append(a)
        else: dropped.append(("assertion", a.get("predicate"), "dangling"))
    return {"mentions": keep_m, "assertions": keep_a}, dropped

def extract(report_meta, text):
    raw = call_llm(text)
    for m in raw.get("mentions", []): m.setdefault("source_url", report_meta["url"])
    for a in raw.get("assertions", []): a.setdefault("source_url", report_meta["url"])
    checked, dropped = span_check(raw, text)
    return {"report": report_meta, **checked}, dropped

# ---------- 端到端測試（provider 由環境變數決定；預設地端 Ollama）----------
if __name__ == "__main__":
    provider, base, model, _ = _cfg()
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
    print(f"=== LLM 抽取（provider={provider} · base={base} · model={model}）===")
    extr, dropped = extract(report, text)
    print(f"抽取：{len(extr['mentions'])} mentions、{len(extr['assertions'])} assertions；span-check 丟棄 {len(dropped)}"
          + (f" → {dropped}" if dropped else "（引文全部對得上原文）"))
    reg = D.load_registry(); sl, log = D.derive(extr, reg)
    print("=== 碼判斷（derive）===")
    for l in log: print("  · " + l)
    bundle = pipe.serialize(sl); fails, att = pipe.validate(bundle)
    print("=== 驗證 + 投影 ===")
    print("  " + ("✓ profile 不變量 OK" if not fails else "⚠ " + " | ".join(fails)) + f"；attributed-to={len(att)}")
    p = pipe.project(bundle)
    print(json.dumps({"L1_operator": p["operator"], "claims_count": len(p["claims"]), "targets": p["targets"]}, ensure_ascii=False, indent=2))
