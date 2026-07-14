#!/usr/bin/env python3
"""LLM 抽取 client（provider-agnostic）：報告文字 → LLM（forced JSON schema）→ mentions＋逐字述詞。

模型只做忠實抽取；碼端 span-check（引文對不上原文即丟）擋幻覺。純 stdlib（urllib）。

設定（環境變數，皆可換 → 不寫死地端）：
  NW_LLM_PROVIDER   ollama | openai        （預設 ollama）
  NW_LLM_BASE_URL   端點基底               （預設 http://localhost:11434）
  NW_LLM_MODEL      模型名                 （預設 gemma4:12b-it-qat）
  NW_LLM_API_KEY    金鑰（雲端/相容端點用）
  NW_LLM_TIMEOUT    單次請求秒數           （預設 600）
  → 地端零設定即跑；雲端：NW_LLM_PROVIDER=openai NW_LLM_BASE_URL=https://api.openai.com NW_LLM_MODEL=… NW_LLM_API_KEY=…
用法：python3 pipeline/extract.py   （__main__ 為端到端測試）
"""
import json, urllib.request, pathlib, re, sys, os
import copy

_here = pathlib.Path(__file__).resolve().parent
SCHEMA = json.loads((_here / "extraction.schema.json").read_text(encoding="utf-8"))
FORMAT = {"type": "object", "additionalProperties": False, "required": ["mentions", "assertions"],
          "properties": {"mentions": copy.deepcopy(SCHEMA["properties"]["mentions"]),
                         "assertions": copy.deepcopy(SCHEMA["properties"]["assertions"])}}
for section in ("mentions", "assertions"):
    # source_url 是可信 metadata，由 extract() 依 report_meta 補；不讓模型生成或幻覺。
    FORMAT["properties"][section]["items"]["properties"].pop("source_url", None)
PROMPT_VERSION = "v10-actor-entity-narrative-passes"
FEWSHOT_EN_TEXT = "The Red Group operated fake accounts targeting Taiwan."
FEWSHOT_EN = {
    "mentions": [
        {"tmp_id": "m1", "surface": "Red Group", "coarse_type": "org", "quote": "The Red Group operated fake accounts"},
        {"tmp_id": "m2", "surface": "fake accounts", "coarse_type": "network", "quote": "Red Group operated fake accounts targeting Taiwan"},
        {"tmp_id": "m3", "surface": "Taiwan", "coarse_type": "place", "quote": "fake accounts targeting Taiwan"},
    ],
    "assertions": [
        {"subject": "m1", "predicate": "operated", "object": "m2", "quote": "The Red Group operated fake accounts"},
        {"subject": "m2", "predicate": "targeting", "object": "m3", "quote": "fake accounts targeting Taiwan"},
    ],
}
FEWSHOT_ZH_TEXT = "紅潮網絡放大「政府無能」敘事並鎖定台灣。"
FEWSHOT_ZH = {
    "mentions": [
        {"tmp_id": "m1", "surface": "紅潮網絡", "coarse_type": "network", "quote": "紅潮網絡放大「政府無能」敘事"},
        {"tmp_id": "m2", "surface": "政府無能", "coarse_type": "narrative", "quote": "放大「政府無能」敘事"},
        {"tmp_id": "m3", "surface": "台灣", "coarse_type": "place", "quote": "並鎖定台灣"},
    ],
    "assertions": [
        {"subject": "m1", "predicate": "放大", "object": "m2", "quote": "紅潮網絡放大「政府無能」敘事"},
        {"subject": "m1", "predicate": "鎖定", "object": "m3", "quote": "紅潮網絡放大「政府無能」敘事並鎖定台灣"},
    ],
}
INSTR = (
    "You extract the FIMI structure from a threat report. Output ONLY JSON per the schema.\n"
    "Extract actors, narratives, targets, and their explicit relationships. Do NOT invent or extract an "
    "operation/campaign node: operations are assembled later by deterministic code from explicit groups. "
    "Do NOT extract the researcher/publisher who wrote the report, "
    "and do NOT treat the hosting platform (Threads/X/Facebook) as the actor.\n"
    "mentions (surface verbatim, coarse_type, verbatim quote):\n"
    "- the actor: a cluster of fake accounts -> 'network'; a company/agency -> 'org'; an individual -> 'person'\n"
    "- narratives/slogans pushed -> 'narrative'\n"
    "- fake accounts/sites/pages used -> 'account'/'website'/'media'\n"
    "- target country -> 'place'; target political party -> 'org'\n"
    "assertions: subject/object are mention tmp_ids; predicate is the verbatim verb phrase "
    "(e.g. 'operated by', 'run by', 'linked to', 'targeting', 'used'); plus a verbatim quote.\n"
    "Every mention AND assertion MUST include a verbatim quote copied exactly from the text — "
    "no paraphrase; an item without a valid verbatim quote is dropped. Do NOT classify, score, or attribute. "
    "The report arrives in a separate user message. Never quote or extract any text from these instructions."
)
MENTION_INSTR = (
    "Extract every occurrence of relevant FIMI actors, account clusters, organizations, people, narratives, "
    "targets, sites, tools, infrastructure, places, URLs, and domains. Output ONLY JSON per the schema. "
    "Each surface and quote must be copied character-for-character from the report. The surface must occur "
    "inside its quote. Include repeated occurrences when they participate in different claims. Do not extract "
    "the report publisher/researcher or a hosting platform merely because it hosts content. Do not extract "
    "operations/campaign nodes. Never copy text from these instructions or examples."
)
ENTITY_MENTION_INSTR = (
    "Find every person, organization, government/political group, media actor, account/network, website, target, "
    "tool, infrastructure, place, URL, and domain occurrence in REPORT TEXT. Output ONLY JSON. Extract exact noun "
    "phrases that are grammatical actors or objects, including generic phrases such as state media or 中共官媒. "
    "Repeat occurrences used in different sentences. surface and quote must be exact REPORT TEXT substrings and "
    "surface must be inside quote. Exclude the report title, publisher/researcher, hosting platform, slogans, claims, "
    "issue labels, and campaign/operation concepts. Never copy instructions."
)
NARRATIVE_MENTION_INSTR = (
    "Extract every occurrence of a narrative, slogan, promoted claim, or quoted characterization in this FIMI "
    "report. Output ONLY JSON per the schema and set coarse_type='narrative'. Prefer the exact words being pushed "
    "such as quoted slogans or explicit propositions. Do not label a report title, forum/event name, technology, "
    "person, organization, country, or broad issue topic as a narrative. surface and quote must be exact report "
    "substrings, with surface inside quote. Repeat occurrences used in different claims. Never copy instructions "
    "or examples."
)
ACTOR_MENTION_INSTR = (
    "Extract every exact occurrence of the grammatical actor/agent that performs an action in REPORT TEXT. "
    "Actors may be proper names or common noun phrases for governments, political groups, state media, companies, "
    "networks, accounts, or people; include short recurring agents such as 中共 when they are the sentence subject. "
    "Output ONLY JSON. Use person/org/network/account/website/media as coarse_type. surface must be the exact actor "
    "noun phrase, and quote must be an exact REPORT TEXT substring containing that surface. Repeat each occurrence "
    "that acts in a different claim. Do not extract report titles, targets, narratives, issue topics, publishers, "
    "researchers, or hosting platforms. Never copy an instruction term unless it occurs in REPORT TEXT."
)
ASSERTION_INSTR = (
    "Extract directed assertions from the supplied CLAIM WINDOWS. Output ONLY JSON per the schema. Each window "
    "contains an exact REPORT TEXT substring and only candidate mentions grounded inside it. "
    "subject and object must be candidate tmp_ids. The quote must be copied character-for-character from the "
    "report and must contain both candidate surfaces in the claimed relation context. predicate must be the "
    "shortest verb phrase copied character-for-character from that same quote; never output a relation label, "
    "translation, tense change, or paraphrase. If no such exact assertion exists, output an empty assertions "
    "array. Never copy text from instructions, examples, or the candidate JSON into quote/predicate unless it "
    "also appears verbatim in REPORT TEXT."
)

def _cfg():
    return (os.environ.get("NW_LLM_PROVIDER", "ollama"),
            os.environ.get("NW_LLM_BASE_URL", "http://localhost:11434").rstrip("/"),
            os.environ.get("NW_LLM_MODEL", "gemma4:12b-it-qat"),
            os.environ.get("NW_LLM_API_KEY", ""))

def _call_messages(messages, fmt):
    provider, base, model, key = _cfg()
    if provider == "ollama":                                  # 地端原生（grammar-forced schema，最嚴）
        url = base + "/api/chat"
        body = {"model": model, "stream": False, "options": {"temperature": 0}, "format": fmt,
                "messages": messages}
        headers = {"Content-Type": "application/json"}; path = ("message", "content")
    else:                                                     # OpenAI 相容（OpenAI / vLLM / LM Studio / Together / Ollama /v1…）
        url = base + "/v1/chat/completions"
        body = {"model": model, "temperature": 0,
                "response_format": {"type": "json_schema", "json_schema": {"name": "extraction", "schema": fmt}},
                "messages": messages}
        headers = {"Content-Type": "application/json", "Authorization": "Bearer " + key}
        path = ("choices", 0, "message", "content")
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers=headers)
    timeout = float(os.environ.get("NW_LLM_TIMEOUT", "600"))
    with urllib.request.urlopen(req, timeout=timeout) as r:
        resp = json.loads(r.read())
    content = resp
    for k in path: content = content[k]
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", content, re.S)               # 模型偶爾包 ```json/多餘文字 → 取第一個平衡物件
        if m: return json.loads(m.group(0))
        raise SystemExit("✗ 模型回應非 JSON：\n" + (content or "")[:800])

def _fewshot(text):
    cjk = len(re.findall(r"[\u3400-\u9fff]", text))
    return (FEWSHOT_ZH_TEXT, FEWSHOT_ZH) if cjk > len(text) * 0.08 else (FEWSHOT_EN_TEXT, FEWSHOT_EN)

def call_llm(text):
    """相容用單階段抽取；正式評測與 extract() 使用 call_llm_two_stage。"""
    few_text, few = _fewshot(text)
    messages = [{"role": "system", "content": INSTR},
                {"role": "user", "content": "REPORT TEXT (extract only from this text):\n" + few_text},
                {"role": "assistant", "content": json.dumps(few, ensure_ascii=False)},
                {"role": "user", "content": "REPORT TEXT (extract only from this text):\n" + text}]
    return _call_messages(messages, FORMAT)

def call_llm_two_stage(text, diagnostics=None):
    """分別抽實體與敘事 mentions、grounding 合併，再以動態 tmp_id enum 抽 assertions。"""
    few_text, few = _fewshot(text)
    mention_format = {"type": "object", "additionalProperties": False, "required": ["mentions"],
                      "properties": {"mentions": copy.deepcopy(FORMAT["properties"]["mentions"])}}
    entity_few = [m for m in few["mentions"] if m["coarse_type"] != "narrative"]
    narrative_few = [m for m in few["mentions"] if m["coarse_type"] == "narrative"]
    mention_sets = []
    for prefix, instruction, examples in (("a", ACTOR_MENTION_INSTR, []),
                                           ("e", ENTITY_MENTION_INSTR, entity_few),
                                           ("n", NARRATIVE_MENTION_INSTR, narrative_few)):
        messages = [{"role": "system", "content": instruction}]
        if prefix == "n":
            messages.extend([
                {"role": "user", "content": "REPORT TEXT:\n" + few_text},
                {"role": "assistant", "content": json.dumps({"mentions": examples}, ensure_ascii=False)},
            ])
        messages.append({"role": "user", "content": "REPORT TEXT:\n" + text})
        raw = _call_messages(messages, mention_format)
        grounded, drops = span_check({"mentions": raw.get("mentions", []), "assertions": []}, text)
        if diagnostics is not None:
            diagnostics.append({"stage": f"mentions-{prefix}", "raw": raw, "drops": drops,
                                "kept": len(grounded["mentions"])})
        mention_sets.append((prefix, grounded["mentions"]))
    mentions, seen_m = [], set()
    for prefix, items in mention_sets:
        for m in items:
            key = (m.get("surface"), m.get("coarse_type"), m.get("quote"), m.get("quote_occurrence"))
            if key in seen_m: continue
            seen_m.add(key)
            mentions.append({**m, "tmp_id": f"{prefix}_{m.get('tmp_id') or len(mentions) + 1}"})
    ids = [m.get("tmp_id") for m in mentions if m.get("tmp_id")]
    if not ids: return {"mentions": [], "assertions": []}

    assertion_items = copy.deepcopy(FORMAT["properties"]["assertions"])
    assertion_items["items"]["properties"]["subject"] = {"enum": ids}
    assertion_items["items"]["properties"]["object"] = {"enum": ids}
    assertion_format = {"type": "object", "additionalProperties": False, "required": ["assertions"],
                        "properties": {"assertions": assertion_items}}
    windows = claim_windows(text, mentions)
    if not windows:
        return {"mentions": mentions, "assertions": []}
    few_windows = claim_windows(few_text, few["mentions"])
    assertion_messages = [
        {"role": "system", "content": ASSERTION_INSTR},
        {"role": "user", "content": "CLAIM WINDOWS:\n" + json.dumps(few_windows, ensure_ascii=False)},
        {"role": "assistant", "content": json.dumps({"assertions": few["assertions"]}, ensure_ascii=False)},
        {"role": "user", "content": "CLAIM WINDOWS:\n" + json.dumps(windows, ensure_ascii=False)},
    ]
    try:
        raw_a = _call_messages(assertion_messages, assertion_format)
    except (Exception, SystemExit) as exc:
        if diagnostics is not None:
            diagnostics.append({"stage": "assertions", "error": f"{type(exc).__name__}: {exc}",
                                "kept": 0, "windows": len(windows)})
        return {"mentions": mentions, "assertions": []}
    checked, drops = span_check({"mentions": mentions, "assertions": raw_a.get("assertions", [])}, text)
    if diagnostics is not None:
        diagnostics.append({"stage": "assertions", "raw": raw_a, "drops": drops,
                            "kept": len(checked["assertions"]), "windows": len(windows)})
    return checked

def split_text(text, max_chars=2400, overlap=240):
    """原文不正規化的決定性切塊；優先在換行/句尾斷開，保留少量 overlap。"""
    if max_chars <= 0 or overlap < 0 or overlap >= max_chars:
        raise ValueError("需滿足 max_chars>overlap>=0")
    if len(text) <= max_chars: return [text]
    chunks, start = [], 0
    while start < len(text):
        hard = min(len(text), start + max_chars)
        end = hard
        if hard < len(text):
            floor = start + max_chars // 2
            candidates = [text.rfind(sep, floor, hard) for sep in ("\n\n", "\n", "。", ". ", "；", "; ")]
            cut = max(candidates)
            if cut >= floor: end = cut + (2 if text[cut:cut + 2] in ("\n\n", ". ", "; ") else 1)
        chunks.append(text[start:end])
        if end >= len(text): break
        start = max(start + 1, end - overlap)
    return chunks

def claim_windows(text, mentions):
    """切成 exact 句／行，只保留含至少兩個 grounded mention quote 的 assertion 候選窗。"""
    ends, i = [], 0
    while i < len(text):
        ch = text[i]
        if ch in "。！？!?\n" or (ch == "." and (i + 1 == len(text) or text[i + 1].isspace())):
            j = i + 1
            while j < len(text) and text[j] == "\n": j += 1
            ends.append(j); i = j; continue
        i += 1
    if not ends or ends[-1] < len(text): ends.append(len(text))
    windows, start = [], 0
    for end in ends:
        window = text[start:end]
        by_surface = {}
        for m in mentions:
            q = m.get("quote", "")
            if q and q in window:
                sf = m.get("surface")
                candidate = {k: m.get(k) for k in ("tmp_id", "surface")}
                if sf not in by_surface or m.get("coarse_type") == "narrative":
                    by_surface[sf] = candidate
        candidates = list(by_surface.values())
        if len({m["tmp_id"] for m in candidates}) >= 2:
            windows.append({"text": window, "candidates": candidates})
        start = end
    return windows

def call_llm_chunked(text, max_chars=2400, overlap=240, diagnostics=None):
    """逐 chunk 抽取並合併；tmp_id 加 namespace，重疊區的完全相同項目去重。"""
    merged_m, merged_a, mention_key_to_id = [], [], {}
    seen_a = set()
    for ci, chunk in enumerate(split_text(text, max_chars, overlap), 1):
        chunk_diagnostics = [] if diagnostics is not None else None
        pred = call_llm_two_stage(chunk, chunk_diagnostics); local_to_global = {}
        if diagnostics is not None:
            diagnostics.append({"chunk": ci, "start": text.find(chunk), "length": len(chunk),
                                "stages": chunk_diagnostics})
        for m in pred.get("mentions", []):
            key = (m.get("surface"), m.get("coarse_type"), m.get("quote"), m.get("quote_occurrence"))
            gid = mention_key_to_id.get(key)
            if gid is None:
                gid = f"c{ci}_{m.get('tmp_id') or len(merged_m) + 1}"
                mm = {**m, "tmp_id": gid}; merged_m.append(mm); mention_key_to_id[key] = gid
            local_to_global[m.get("tmp_id")] = gid
        for a in pred.get("assertions", []):
            subject, obj = local_to_global.get(a.get("subject")), local_to_global.get(a.get("object"))
            if not subject or not obj: continue
            aa = {**a, "subject": subject, "object": obj}
            key = (subject, a.get("predicate"), obj, a.get("quote"), a.get("quote_occurrence"))
            if key not in seen_a: merged_a.append(aa); seen_a.add(key)
    return {"mentions": merged_m, "assertions": merged_a}

def span_check(extr, text):                                   # 碼端硬閘：引文缺或對不上原文即丟（fail-closed）
    dropped = []
    keep_m, ids = [], set()
    for m in extr.get("mentions", []):
        q, sf = m.get("quote", ""), m.get("surface", "")
        if not q: dropped.append(("mention", m.get("surface"), "missing-quote")); continue
        if q not in text: dropped.append(("mention", m.get("surface"), "bad-quote")); continue
        if not sf or sf not in q: dropped.append(("mention", m.get("surface"), "surface-not-in-quote")); continue
        keep_m.append(m); ids.add(m.get("tmp_id"))
    keep_a = []
    for a in extr.get("assertions", []):
        q, pred = a.get("quote", ""), a.get("predicate", "")
        if not q: dropped.append(("assertion", a.get("predicate"), "missing-quote")); continue
        if q not in text: dropped.append(("assertion", a.get("predicate"), "bad-quote")); continue
        if not pred or pred not in q: dropped.append(("assertion", a.get("predicate"), "predicate-not-in-quote")); continue
        if a.get("subject") in ids and a.get("object") in ids: keep_a.append(a)
        else: dropped.append(("assertion", a.get("predicate"), "dangling"))
    return {"mentions": keep_m, "assertions": keep_a}, dropped

def extract(report_meta, text):
    raw = call_llm_two_stage(text)
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
