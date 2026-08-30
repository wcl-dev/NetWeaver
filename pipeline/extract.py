#!/usr/bin/env python3
"""LLM 抽取 client（provider-agnostic）：報告文字 → LLM（結構化 JSON）→ mentions＋逐字述詞。

模型只做忠實抽取；碼端 span-check（引文對不上原文即丟）擋幻覺。純 stdlib（urllib）。

設定（環境變數，皆可換 → 不寫死地端）：
  NW_LLM_PROVIDER   ollama | openai        （預設 ollama）
  NW_LLM_BASE_URL   端點基底               （預設 http://localhost:11434）
  NW_LLM_MODEL      模型名                 （預設 gemma4:12b-it-qat）
  NW_LLM_API_KEY    金鑰（雲端/相容端點用）
  NW_LLM_TIMEOUT    單次請求秒數           （預設 600）
  NW_LLM_OUTPUT_MODE schema | json          （預設 schema；json 為相容 fallback）
  NW_LLM_THINK      false | true | low | medium | high（預設 false；Ollama 用）
  NW_LLM_CACHE_DIR  成功回應的內容雜湊快取目錄（未設即停用）
  NW_LLM_CACHE_SALT 模型 alias／server revision 變更時用來強制 miss
  → 地端零設定即跑；雲端：NW_LLM_PROVIDER=openai NW_LLM_BASE_URL=https://api.openai.com NW_LLM_MODEL=… NW_LLM_API_KEY=…
用法：python3 pipeline/extract.py   （__main__ 為端到端測試）
"""
import hashlib, json, urllib.request, urllib.error, pathlib, re, sys, os, time
import copy

_here = pathlib.Path(__file__).resolve().parent
SCHEMA = json.loads((_here / "extraction.schema.json").read_text(encoding="utf-8"))
FORMAT = {"type": "object", "additionalProperties": False, "required": ["mentions", "assertions"],
          "properties": {"mentions": copy.deepcopy(SCHEMA["properties"]["mentions"]),
                         "assertions": copy.deepcopy(SCHEMA["properties"]["assertions"])}}
for section in ("mentions", "assertions"):
    # source_url 是可信 metadata，由 extract() 依 report_meta 補；不讓模型生成或幻覺。
    FORMAT["properties"][section]["items"]["properties"].pop("source_url", None)
PROMPT_VERSION = "v24-item-tolerant-mentions"
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

def _output_mode():
    mode = os.environ.get("NW_LLM_OUTPUT_MODE", "schema").strip().lower()
    if mode not in {"schema", "json"}:
        raise ValueError("NW_LLM_OUTPUT_MODE 必須是 schema 或 json")
    return mode

def _think_setting():
    raw = os.environ.get("NW_LLM_THINK", "false").strip().lower()
    if raw in {"false", "0", "no", "off", "none"}: return False
    if raw in {"true", "1", "yes", "on"}: return True
    if raw in {"low", "medium", "high"}: return raw
    raise ValueError("NW_LLM_THINK 必須是 false、true、low、medium 或 high")

def _extra_body():
    """`NW_LLM_EXTRA_BODY` 解析後的 dict（OpenAI 相容端點的逃生口，如 Gemini 的 reasoning_effort）。

    注意：`NW_LLM_THINK` 只作用於 ollama 分支；OpenAI 相容端點的思考控制走這裡。
    """
    raw = os.environ.get("NW_LLM_EXTRA_BODY", "").strip()
    if not raw: return {}
    v = json.loads(raw)
    if not isinstance(v, dict): raise ValueError("NW_LLM_EXTRA_BODY 必須是 JSON object")
    return v

def _extra_body_tag():
    """extra body 的變體標籤——**必須進 variant 與 cache key**。

    否則只改 reasoning_effort 重跑，會寫進同一個輸出目錄（覆蓋前一次 prediction）並命中同一份
    request cache（回傳前一次的結果），A/B 會靜默得出「沒有差別」的假結論。
    """
    xb = _extra_body()
    if not xb: return ""                                       # 空＝維持既有 variant 名，舊 run/cache 不失效
    eff = xb.get("reasoning_effort")
    rest = {k: v for k, v in xb.items() if k != "reasoning_effort"}
    tag = f"-re-{eff}" if eff else ""
    if rest:
        tag += "-xb" + hashlib.sha256(json.dumps(rest, sort_keys=True).encode("utf-8")).hexdigest()[:6]
    return tag

def extraction_variant():
    think = _think_setting()
    think_name = str(think).lower()
    return f"{PROMPT_VERSION}-{_output_mode()}-think-{think_name}{_extra_body_tag()}"

class ExtractionBudgetExceeded(RuntimeError):
    """文件級時間／cold-call 額度已用完；呼叫端應保存 partial checkpoint。"""

class ExtractionRun:
    """單篇抽取的 budget、進度事件與 request telemetry。"""
    def __init__(self, doc_timeout=None, max_cold_calls=None, max_assertion_windows=None, progress=None):
        self.started = time.monotonic()
        self.doc_timeout = float(doc_timeout) if doc_timeout and float(doc_timeout) > 0 else None
        self.max_cold_calls = int(max_cold_calls) if max_cold_calls and int(max_cold_calls) > 0 else None
        self.max_assertion_windows = (int(max_assertion_windows)
                                      if max_assertion_windows and int(max_assertion_windows) > 0 else None)
        self.progress = progress
        self.cold_calls = 0
        self.cache_hits = 0
        self.events = []
        self.budget_reason = None
        self.assertion_windows_used = 0
        self.chunk = None
        self.total_chunks = None

    def elapsed(self):
        return time.monotonic() - self.started

    def emit(self, event, **details):
        item = {"event": event, "elapsed_seconds": round(self.elapsed(), 3), **details}
        self.events.append(item)
        if self.progress:
            self.progress(item)
        return item

    def _exhaust(self, reason):
        if not self.budget_reason:
            self.budget_reason = reason
        if not any(event["event"] == "budget_exhausted" for event in self.events):
            self.emit("budget_exhausted", reason=reason, cold_calls=self.cold_calls)
        raise ExtractionBudgetExceeded(reason)

    def begin_cold_request(self, stage, default_timeout):
        if self.doc_timeout is not None:
            remaining = self.doc_timeout - self.elapsed()
            if remaining <= 0:
                self._exhaust("doc-timeout")
        else:
            remaining = None
        if self.max_cold_calls is not None and self.cold_calls >= self.max_cold_calls:
            self._exhaust("max-cold-calls")
        self.cold_calls += 1
        timeout = min(default_timeout, remaining) if remaining is not None else default_timeout
        self.emit("request_start", stage=stage, chunk=self.chunk, total_chunks=self.total_chunks,
                  cold_call=self.cold_calls, timeout_seconds=round(timeout, 3))
        return max(timeout, 0.001)

    def cache_hit(self, stage, schema_item_drops=0, schema_repaired=False):
        self.cache_hits += 1
        self.emit("request_cache_hit", stage=stage, chunk=self.chunk, total_chunks=self.total_chunks,
                  cache_hit=self.cache_hits, schema_item_drops=schema_item_drops, schema_repaired=schema_repaired)

    def request_done(self, stage, elapsed, telemetry):
        self.emit("request_done", stage=stage, chunk=self.chunk, total_chunks=self.total_chunks,
                  cold_call=self.cold_calls, request_seconds=round(elapsed, 3), **telemetry)

    def request_error(self, stage, elapsed, exc, telemetry=None):
        if self.doc_timeout is not None and self.elapsed() >= self.doc_timeout:
            self.budget_reason = self.budget_reason or "doc-timeout"
        self.emit("request_error", stage=stage, chunk=self.chunk, total_chunks=self.total_chunks,
                  cold_call=self.cold_calls, request_seconds=round(elapsed, 3),
                  error=f"{type(exc).__name__}: {exc}", **(telemetry or {}))
        if self.budget_reason:
            self._exhaust(self.budget_reason)

    def assertion_window_quota(self, available):
        if self.max_assertion_windows is None:
            return available
        remaining = max(0, self.max_assertion_windows - self.assertion_windows_used)
        chunks_left = max(1, (self.total_chunks or 1) - (self.chunk or 1) + 1)
        fair_share = (remaining + chunks_left - 1) // chunks_left
        return min(available, fair_share)

    def reserve_assertion_windows(self, count):
        self.assertion_windows_used += count

    def summary(self):
        completed = [event for event in self.events if event["event"] in {"request_done", "request_error"}]
        return {"elapsed_seconds": round(self.elapsed(), 3), "cold_calls": self.cold_calls,
                "cache_hits": self.cache_hits, "budget_reason": self.budget_reason,
                "assertion_windows_used": self.assertion_windows_used,
                "prompt_tokens": sum(event.get("prompt_tokens", 0) for event in completed),
                "completion_tokens": sum(event.get("completion_tokens", 0) for event in completed),
                # total 含端點未逐項列出的思考 tokens——實際計費看這個，不是 prompt+completion
                "total_tokens": sum(event.get("total_tokens", 0) for event in completed),
                "model_total_seconds": round(sum(event.get("model_total_seconds", 0) for event in completed), 3)}

def _messages_with_schema(messages, fmt):
    """JSON mode 無 grammar constraint，將同一份 schema 明示在 prompt；不改動呼叫端資料。"""
    prepared = copy.deepcopy(messages)
    instruction = ("Return exactly one JSON object matching this JSON Schema. Do not add markdown or commentary:\n"
                   + json.dumps(fmt, ensure_ascii=False, separators=(",", ":")))
    if prepared and prepared[0].get("role") == "system":
        prepared[0]["content"] = prepared[0].get("content", "") + "\n\n" + instruction
    else:
        prepared.insert(0, {"role": "system", "content": instruction})
    return prepared

def _openai_chat_url(base):
    """Accept both service roots and OpenAI-compatible versioned base URLs."""
    if base.endswith(("/v1", "/openai")):
        return base + "/chat/completions"
    return base + "/v1/chat/completions"

def _request_spec(messages, fmt):
    provider, base, model, key = _cfg()
    mode = _output_mode()
    prepared = messages if mode == "schema" else _messages_with_schema(messages, fmt)
    if provider == "ollama":
        url = base + "/api/chat"
        body = {"model": model, "stream": False, "think": _think_setting(),
                "options": {"temperature": 0}, "format": fmt if mode == "schema" else "json",
                "messages": prepared}
        headers = {"Content-Type": "application/json"}; path = ("message", "content")
    else:                                                     # OpenAI 相容（OpenAI / vLLM / LM Studio / Together / Ollama /v1…）
        url = _openai_chat_url(base)
        body = {"model": model, "temperature": 0,
                "response_format": ({"type": "json_schema",
                                     "json_schema": {"name": "extraction", "schema": fmt}}
                                    if mode == "schema" else {"type": "json_object"}),
                "messages": prepared}
        body.update(_extra_body())                               # 逃生口：Gemini reasoning_effort、mlx 的
                                                                 # chat_template_kwargs 等端點專屬欄位
        headers = {"Content-Type": "application/json", "Authorization": "Bearer " + key}
        path = ("choices", 0, "message", "content")
    return url, body, headers, path

def _json_type_matches(value, expected):
    checks = {"object": lambda v: isinstance(v, dict),
              "array": lambda v: isinstance(v, list),
              "string": lambda v: isinstance(v, str),
              "integer": lambda v: isinstance(v, int) and not isinstance(v, bool),
              "number": lambda v: isinstance(v, (int, float)) and not isinstance(v, bool),
              "boolean": lambda v: isinstance(v, bool),
              "null": lambda v: v is None}
    return checks.get(expected, lambda _v: True)(value)

def validate_json_schema(value, schema, path="$"):
    """驗證抽取契約會用到的 JSON Schema 子集，回傳可診斷的錯誤清單。"""
    errors = []
    if "enum" in schema and value not in schema["enum"]:
        errors.append(f"{path}: {value!r} 不在 enum")
    expected = schema.get("type")
    if expected and not _json_type_matches(value, expected):
        return errors + [f"{path}: 預期 {expected}，得到 {type(value).__name__}"]
    if isinstance(value, dict):
        properties = schema.get("properties", {})
        for name in schema.get("required", []):
            if name not in value: errors.append(f"{path}.{name}: 缺少必填欄位")
        if schema.get("additionalProperties") is False:
            for name in value.keys() - properties.keys():
                errors.append(f"{path}.{name}: 不允許的欄位")
        for name, child in value.items():
            if name in properties:
                errors.extend(validate_json_schema(child, properties[name], f"{path}.{name}"))
    elif isinstance(value, list) and "items" in schema:
        for index, child in enumerate(value):
            errors.extend(validate_json_schema(child, schema["items"], f"{path}[{index}]"))
    elif isinstance(value, str) and len(value) < schema.get("minLength", 0):
        errors.append(f"{path}: 長度小於 {schema['minLength']}")
    return errors

def _drop_optional_nulls(value, schema):
    """JSON fallback 常把未填 optional field 寫成 null；等價正規化為省略欄位。"""
    if isinstance(value, dict):
        properties, required = schema.get("properties", {}), set(schema.get("required", []))
        normalized = {}
        for name, child in value.items():
            child_schema = properties.get(name)
            if child is None and child_schema is not None and name not in required:
                continue
            normalized[name] = _drop_optional_nulls(child, child_schema or {})
        return normalized
    if isinstance(value, list) and "items" in schema:
        return [_drop_optional_nulls(child, schema["items"]) for child in value]
    return value

class LLMResponse(dict):
    """Schema-valid response plus item-level validation diagnostics kept outside model JSON."""
    def __init__(self, value, schema_item_drops=None, schema_repaired=False):
        super().__init__(value)
        self.schema_item_drops = list(schema_item_drops or [])
        self.schema_repaired = schema_repaired

def _parse_and_validate(content, fmt, normalize_optional_nulls=False, item_error_field=None):
    if not isinstance(content, str) or not content.strip():
        raise ValueError("模型回應 content 為空")
    try:
        result = json.loads(content)
    except json.JSONDecodeError as initial:
        result = None
        decoder = json.JSONDecoder()
        for match in re.finditer(r"\{", content):
            try:
                result, _ = decoder.raw_decode(content[match.start():])
                break
            except json.JSONDecodeError:
                continue
        if result is None:
            raise ValueError("模型回應非 JSON：\n" + content[:800]) from initial
    if normalize_optional_nulls:
        result = _drop_optional_nulls(result, fmt)
    if item_error_field is None:
        errors = validate_json_schema(result, fmt)
        if errors:
            raise ValueError("模型 JSON 不符合 schema：" + "；".join(errors[:8]))
        return result

    array_schema = fmt.get("properties", {}).get(item_error_field)
    if not isinstance(array_schema, dict) or array_schema.get("type") != "array" or "items" not in array_schema:
        raise ValueError(f"item_error_field={item_error_field!r} 不是 schema array")
    # 窄版 unwrap：模型偶爾回「裸單一 item 物件」而非 {field:[...]}（json mode 常見 schema 漂移）。
    # 僅當該裸物件（依 item schema 正規化 optional null 後）本身通過 item schema 時包成陣列——
    # 不猜欄位、不吞未知結構（Codex review）。注意 line 340 的 normalize 用的是 outer fmt，對裸物件無效，
    # 故此處以 item schema 再正規化一次候選。
    schema_repaired = False
    if isinstance(result, dict) and item_error_field not in result:
        candidate = _drop_optional_nulls(result, array_schema["items"]) if normalize_optional_nulls else result
        if not validate_json_schema(candidate, array_schema["items"]):
            result = {item_error_field: [candidate]}
            schema_repaired = True
    outer_schema = copy.deepcopy(fmt)
    outer_schema["properties"][item_error_field]["items"] = {}
    errors = validate_json_schema(result, outer_schema)
    if errors:
        raise ValueError("模型 JSON 不符合 schema：" + "；".join(errors[:8]))
    kept, drops = [], []
    for index, item in enumerate(result[item_error_field]):
        item_errors = validate_json_schema(item, array_schema["items"],
                                           f"$.{item_error_field}[{index}]")
        if item_errors:
            drops.append({"index": index, "error": "；".join(item_errors[:8])})
        else:
            kept.append(item)
    result[item_error_field] = kept
    return LLMResponse(result, schema_item_drops=drops, schema_repaired=schema_repaired)

def _response_telemetry(resp, provider):
    if provider == "ollama":
        nanos = lambda key: round(resp.get(key, 0) / 1_000_000_000, 3)
        return {"prompt_tokens": resp.get("prompt_eval_count", 0),
                "completion_tokens": resp.get("eval_count", 0),
                "model_total_seconds": nanos("total_duration"),
                "load_seconds": nanos("load_duration"),
                "prompt_eval_seconds": nanos("prompt_eval_duration"),
                "generation_seconds": nanos("eval_duration")}
    usage = resp.get("usage", {})
    return {"prompt_tokens": usage.get("prompt_tokens", 0),
            "completion_tokens": usage.get("completion_tokens", 0),
            "total_tokens": usage.get("total_tokens", 0)}

def _retry_delay(exc, attempt):
    """退避秒數：優先聽端點的 `Retry-After`，否則指數退避。

    免費層的 429 常要求等遠久於 1/2/4 秒的指數退避——照自己的節奏重試只會再被打回，
    整批評測會被限流洗成無效資料（先前 gemini preview 那跑就是這樣報廢的）。
    上限預設 60 秒，避免端點給出離譜的值把單篇 budget 卡死。
    """
    cap = float(os.environ.get("NW_LLM_RETRY_MAX_SLEEP", "60"))
    hdr = None
    try: hdr = (exc.headers or {}).get("Retry-After")
    except Exception: hdr = None
    if hdr:
        hdr = hdr.strip()
        try: return min(max(float(hdr), 0.0), cap)                # delta-seconds
        except ValueError: pass
        try:                                                       # HTTP-date
            from email.utils import parsedate_to_datetime
            from datetime import datetime, timezone
            dt = parsedate_to_datetime(hdr)
            now = datetime.now(dt.tzinfo) if dt.tzinfo else datetime.now(timezone.utc).replace(tzinfo=None)
            return min(max((dt - now).total_seconds(), 0.0), cap)
        except Exception: pass
    return min(float(2 ** attempt), cap)

def _call_messages_uncached(messages, fmt, timeout=None, telemetry=None, item_error_field=None):
    provider, _, _, _ = _cfg()
    url, body, headers, path = _request_spec(messages, fmt)
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers=headers)
    timeout = timeout if timeout is not None else float(os.environ.get("NW_LLM_TIMEOUT", "600"))
    retries = int(os.environ.get("NW_LLM_RETRIES", "3"))       # 暫時性錯誤（5xx/429/timeout）重試，指數退避
    for attempt in range(retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                resp = json.loads(r.read())
            break
        except urllib.error.HTTPError as exc:
            if exc.code in (429, 500, 502, 503, 504) and attempt < retries:
                time.sleep(_retry_delay(exc, attempt)); continue
            raise
        except (urllib.error.URLError, TimeoutError):
            if attempt < retries:
                time.sleep(2 ** attempt); continue
            raise
    if telemetry is not None:
        telemetry.update(_response_telemetry(resp, provider))
    content = resp
    for k in path: content = content[k]
    result = _parse_and_validate(content, fmt, normalize_optional_nulls=_output_mode() == "json",
                                 item_error_field=item_error_field)
    if telemetry is not None:
        telemetry["schema_item_drops"] = len(getattr(result, "schema_item_drops", []))
        telemetry["schema_repaired"] = getattr(result, "schema_repaired", False)
    return result

_CACHE_STATS = {"request_cache_hits": 0, "request_cache_misses": 0}

def reset_cache_stats():
    for key in _CACHE_STATS:
        _CACHE_STATS[key] = 0

def cache_stats():
    return dict(_CACHE_STATS)

def _cold_call(messages, fmt, run=None, stage="llm", item_error_field=None):
    default_timeout = float(os.environ.get("NW_LLM_TIMEOUT", "600"))
    timeout = run.begin_cold_request(stage, default_timeout) if run else default_timeout
    telemetry, started = {}, time.monotonic()
    try:
        if run is None:
            response = (_call_messages_uncached(messages, fmt) if item_error_field is None else
                        _call_messages_uncached(messages, fmt, item_error_field=item_error_field))
        else:
            response = _call_messages_uncached(messages, fmt, timeout=timeout, telemetry=telemetry,
                                               item_error_field=item_error_field)
    except (Exception, SystemExit) as exc:
        if run:
            run.request_error(stage, time.monotonic() - started, exc, telemetry)
        raise
    if run:
        run.request_done(stage, time.monotonic() - started, telemetry)
    return response

_CACHE_ENTRY_MARKER = "netweaver-validated-response-v1"

def _cache_path(directory, request):
    digest = hashlib.sha256(json.dumps(request, ensure_ascii=False, sort_keys=True,
                                       separators=(",", ":")).encode("utf-8")).hexdigest()
    return directory / digest[:2] / (digest + ".json")

def _cache_decode(value):
    if isinstance(value, dict) and value.get("cache_entry") == _CACHE_ENTRY_MARKER:
        return LLMResponse(value["response"], schema_item_drops=value.get("schema_item_drops", []),
                           schema_repaired=value.get("schema_repaired", False))
    return value

def _cache_encode(value):
    drops = getattr(value, "schema_item_drops", [])
    repaired = getattr(value, "schema_repaired", False)
    if drops or repaired:
        return {"cache_entry": _CACHE_ENTRY_MARKER, "response": dict(value),
                "schema_item_drops": drops, "schema_repaired": repaired}
    return value

def _call_messages(messages, fmt, run=None, stage="llm", item_error_field=None):
    cache_dir = os.environ.get("NW_LLM_CACHE_DIR")
    if not cache_dir:
        _CACHE_STATS["request_cache_misses"] += 1
        return _cold_call(messages, fmt, run, stage, item_error_field=item_error_field)
    provider, base, model, key = _cfg()
    request = {"cache_version": 2, "provider": provider, "base_url": base, "model": model,
               "credential_fingerprint": hashlib.sha256(key.encode("utf-8")).hexdigest() if key else "",
               "cache_salt": os.environ.get("NW_LLM_CACHE_SALT", ""),
               "output_mode": _output_mode(), "think": _think_setting(),
               "extra_body": _extra_body(),                     # 端點專屬設定改變＝不同 request，必須 miss
               "messages": messages, "format": fmt}
    directory = pathlib.Path(cache_dir)
    requests = []
    if item_error_field is not None:
        request = {**request, "item_error_field": item_error_field}
    requests.append(request)
    if item_error_field is not None:
        # v23 以前的 cache entry 是整份 strict-schema 驗證成功後才寫入，可安全沿用。
        requests.append({key: value for key, value in request.items() if key != "item_error_field"})
    path = _cache_path(directory, requests[0])
    for candidate_index, candidate in enumerate(requests):
        try:
            cached = _cache_decode(json.loads(_cache_path(directory, candidate).read_text(encoding="utf-8")))
        except (FileNotFoundError, OSError, json.JSONDecodeError, KeyError, TypeError):
            continue
        if candidate_index > 0 and validate_json_schema(cached, fmt):
            continue
        _CACHE_STATS["request_cache_hits"] += 1
        if run:
            run.cache_hit(stage, schema_item_drops=len(getattr(cached, "schema_item_drops", [])),
                          schema_repaired=getattr(cached, "schema_repaired", False))
        return cached
    _CACHE_STATS["request_cache_misses"] += 1
    response = _cold_call(messages, fmt, run, stage, item_error_field=item_error_field)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f"{path.name}.{os.getpid()}.tmp")
    temporary.write_text(json.dumps(_cache_encode(response), ensure_ascii=False), encoding="utf-8")
    os.replace(temporary, path)
    return response

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

def _run_call(messages, fmt, run, stage, item_error_field=None):
    if run is None:
        return (_call_messages(messages, fmt) if item_error_field is None else
                _call_messages(messages, fmt, item_error_field=item_error_field))
    return _call_messages(messages, fmt, run=run, stage=stage, item_error_field=item_error_field)

def call_llm_two_stage(text, diagnostics=None, run=None):
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
        try:
            raw = _run_call(messages, mention_format, run, f"mentions-{prefix}",
                            item_error_field="mentions")
        except ExtractionBudgetExceeded as exc:
            if diagnostics is not None:
                diagnostics.append({"stage": f"mentions-{prefix}", "budget_exhausted": str(exc), "kept": 0})
            mention_sets.append((prefix, []))
            break
        except (Exception, SystemExit) as exc:
            if diagnostics is not None:
                diagnostics.append({"stage": f"mentions-{prefix}",
                                    "error": f"{type(exc).__name__}: {exc}", "kept": 0})
            mention_sets.append((prefix, []))
            continue
        schema_item_drops = getattr(raw, "schema_item_drops", [])
        grounded, drops = span_check({"mentions": raw.get("mentions", []), "assertions": []}, text)
        if diagnostics is not None:
            diagnostics.append({"stage": f"mentions-{prefix}", "raw": raw,
                                "schema_item_drops": schema_item_drops, "drops": drops,
                                "kept": len(grounded["mentions"])})
        grounded["mentions"] = expand_surface_occurrences(grounded["mentions"], text)
        mention_sets.append((prefix, grounded["mentions"]))
    mentions, seen_m = [], set()
    serial = {"a": 0, "e": 0, "n": 0}
    for prefix, items in mention_sets:
        for m in items:
            key = (m.get("surface"), m.get("coarse_type"), m.get("quote"), m.get("quote_occurrence"))
            if key in seen_m: continue
            seen_m.add(key)
            serial[prefix] += 1
            mentions.append({**m, "tmp_id": f"{prefix}{serial[prefix]}"})
    ids = [m.get("tmp_id") for m in mentions if m.get("tmp_id")]
    if not ids: return {"mentions": [], "assertions": []}
    if run is not None and run.budget_reason:
        return {"mentions": mentions, "assertions": []}

    windows = claim_windows(text, mentions)
    if not windows:
        return {"mentions": mentions, "assertions": []}
    few_windows = claim_windows(few_text, few["mentions"])
    assertions, seen_a, window_diags = [], set(), []
    limit = run.assertion_window_quota(len(windows)) if run is not None else len(windows)
    selected_windows = select_claim_windows(windows, mentions, limit)
    if run is not None:
        run.reserve_assertion_windows(len(selected_windows))
    if run is not None:
        run.emit("assertion_plan", chunk=run.chunk, total_chunks=run.total_chunks, windows=len(windows),
                 selected=len(selected_windows), skipped=len(windows) - len(selected_windows))
    calls = 0
    for selected_order, (wi, window, priority) in enumerate(selected_windows, 1):
        window_ids = [m["tmp_id"] for m in window["candidates"]]
        assertion_items = copy.deepcopy(FORMAT["properties"]["assertions"])
        assertion_items["items"]["properties"]["subject"] = {"enum": window_ids}
        assertion_items["items"]["properties"]["object"] = {"enum": window_ids}
        assertion_format = {"type": "object", "additionalProperties": False, "required": ["assertions"],
                            "properties": {"assertions": assertion_items}}
        messages = [
            {"role": "system", "content": ASSERTION_INSTR},
            {"role": "user", "content": "CLAIM WINDOWS:\n" + json.dumps(few_windows, ensure_ascii=False)},
            {"role": "assistant", "content": json.dumps({"assertions": few["assertions"]}, ensure_ascii=False)},
            {"role": "user", "content": "CLAIM WINDOWS:\n" + json.dumps([window], ensure_ascii=False)},
        ]
        try:
            raw = _run_call(messages, assertion_format, run,
                            f"assertion-{selected_order}/{len(selected_windows)}[window-{wi}]")
            calls += 1
        except ExtractionBudgetExceeded as exc:
            window_diags.append({"window": wi, "selected_order": selected_order, "priority": priority,
                                 "budget_exhausted": str(exc), "kept": 0})
            break
        except (Exception, SystemExit) as exc:
            calls += 1
            window_diags.append({"window": wi, "selected_order": selected_order, "priority": priority,
                                 "error": f"{type(exc).__name__}: {exc}", "kept": 0})
            continue
        checked, drops = span_check({"mentions": mentions, "assertions": raw.get("assertions", [])}, text)
        window_diags.append({"window": wi, "selected_order": selected_order, "priority": priority,
                             "raw": raw, "drops": drops,
                             "kept": len(checked["assertions"])})
        for a in checked["assertions"]:
            key = (a.get("subject"), a.get("predicate"), a.get("object"), a.get("quote"))
            if key not in seen_a: assertions.append(a); seen_a.add(key)
    if diagnostics is not None:
        diagnostics.append({"stage": "assertions", "kept": len(assertions), "windows": len(windows),
                            "selected_windows": len(selected_windows),
                            "skipped_windows": len(windows) - len(selected_windows),
                            "selected_indices": [index for index, _, _ in selected_windows],
                            "calls": calls, "budget_exhausted": run.budget_reason if run else None,
                            "window_results": window_diags})
    return {"mentions": mentions, "assertions": assertions}

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

_CLOSERS = "」』）〕】》”’\"')]"                                # 句尾引號／括號先剝掉再看終止符

def sentence_windows(text):
    """回傳覆蓋原文的 exact 句／行窗。"""
    ends, i = [], 0
    while i < len(text):
        ch = text[i]
        if ch in "。！？!?\n" or (ch == "." and (i + 1 == len(text) or text[i + 1].isspace())):
            j = i + 1
            # 句號常落在引號**裡面**（…台海危機。」（01:12）隔日…）。收尾引號／括號要算進前一句，
            # 否則下一句會以孤兒「」」開頭——實測 IORG 單篇就產生 7 條這種碎片。
            while j < len(text) and text[j] in _CLOSERS: j += 1
            while j < len(text) and text[j] == "\n": j += 1
            ends.append(j); i = j; continue
        i += 1
    if not ends or ends[-1] < len(text): ends.append(len(text))
    windows, start = [], 0
    for end in ends:
        windows.append(text[start:end]); start = end
    return windows

CLAIM_TERMINATORS = "。！？!?.…"                              # 含英文句點：英文來源的正常陳述句不得被閘掉
_EDGE_PUNCT = " \t\n、，,；;：:"                            # 只去分隔標點；句尾「。！？」是內容，不剝

def snap_quote(text, quote, max_chars=200):
    """把模型給的 exact span 沿原文擴張成完整句（**只供呈現**）。

    模型常只回子句（切在「，」「、」上），直接當 claim 卡會是斷句。這裡用與 assertion 切窗
    同一套 `sentence_windows` 句界，把 span 補回它所在的整句。

    保守處（寧可留斷句，不可擴到錯句）：
      · 原文找不到，或**出現多次無法定位**（模型未必附 quote_occurrence）→ 回原引文，不猜。
      · 擴張後超過 max_chars → 回原引文，不把整段塞進 claim 卡。
    絕不用於 derive 之前：derive 會從引文找 hedge 詞算 confidence／歸因，擴張過的句子會動到紅線。
    """
    q = (quote or "").strip()
    if not q or not text: return q.strip(_EDGE_PUNCT)
    if text.count(q) != 1: return q.strip(_EDGE_PUNCT)         # 0＝非本文（樣本/人工）；>1＝定位有歧義
    i = text.index(q); j, out, pos = i + len(q), [], 0
    for w in sentence_windows(text):
        a, b = pos, pos + len(w); pos = b
        if a < j and b > i: out.append(w)
        elif out: break                                        # 句窗有序，已越過 span → 收工
    s = "".join(out).strip()
    if not s or len(s) > max_chars: return q.strip(_EDGE_PUNCT)
    return s

_OPENERS = "、，,；;：:。．.！!？?…」』）〕】》”’\"')]"   # 句首若是這些，代表是從句中被切出來的
_MIN_CONTENT = 8                                        # 去標點後的最少字數
_QUOTE_PAIRS = (("「", "」"), ("『", "』"), ("《", "》"))    # 引號配對；只擋「先出現收尾」這種明確切斷

def is_claim_span(span):
    """碼端的宣稱閘：**句首與句尾**都要像一個完整句（只在有正文可對照、引文已擴張時才套）。

    句尾：剝掉引號／括號後無終止符 → 章節標題／表格列（「東部戰區融媒體中心扮演的角色」）；
    以問號收尾 → 提問。兩者都不是對世界的宣稱。看句尾而非「任一位置有標點」，
    才不會讓「重要發現！四種手法」這種標題矇混過關。

    句首同樣要檢查，否則從句子中間切出來的片段只要結尾剛好碰到句號就會過關。實測落地的：
      「，並獲得「今日海峽」、「兩岸頭條」粉專分享。」   ← 以頓號開頭
      「” —-《環球時報》引述《參考消息》。」           ← 以收尾引號開頭
      「and The Reacher.」                        ← 英文以小寫字開頭＝句中
      「TVBS).」                                  ← 只有名字加標點，沒有內容
    三條規則分別對應：句首接續標點、句首小寫拉丁字母、去標點後內容過短。
    """
    s = (span or "").strip()
    if not s: return False
    if s[0] in _OPENERS: return False                    # 句首是接續標點 → 從句中切出來的
    if s[0].islower() and s[0].isascii(): return False    # 英文句中切點（and／which／who…）
    if len(re.sub(r"[\s\W_]+", "", s, flags=re.UNICODE)) < _MIN_CONTENT: return False
    for _op, _cl in _QUOTE_PAIRS:                        # 收尾引號出現在對應開引號之前 → 從引文中間切開
        d = 0
        for ch in s:
            if ch == _op: d += 1
            elif ch == _cl:
                d -= 1
                if d < 0: return False
    t = s.rstrip().rstrip(_CLOSERS).rstrip()
    if not t or t[-1] in "？?": return False
    return t[-1] in CLAIM_TERMINATORS

def expand_surface_occurrences(seed_mentions, text):
    """只展開模型已辨識 surface 的原文 occurrence；不注入新名稱。"""
    surface_types = {}
    for m in seed_mentions:
        if m.get("surface"): surface_types.setdefault((m["surface"], m.get("coarse_type")), None)
    expanded = []
    for surface, coarse_type in surface_types:
        for window in sentence_windows(text):
            start = 0
            for match in re.finditer(r"[，,；;]", window):
                clause = window[start:match.end()].strip(); start = match.end()
                if clause and clause.count(surface) == 1:
                    expanded.append({"tmp_id": "pending", "surface": surface, "coarse_type": coarse_type,
                                     "quote": clause})
            clause = window[start:].strip()
            if clause and clause.count(surface) == 1:
                expanded.append({"tmp_id": "pending", "surface": surface, "coarse_type": coarse_type,
                                 "quote": clause})
    return expanded or seed_mentions

def expand_actor_occurrences(actor_mentions, text):
    """向後相容名稱。"""
    return expand_surface_occurrences(actor_mentions, text)

def claim_windows(text, mentions):
    """切成 exact 句／行，只保留含至少兩個 grounded mention quote 的 assertion 候選窗。"""
    windows = []
    for window in sentence_windows(text):
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
    return windows

_RELATION_CUE = re.compile(
    r"operat|run by|direct|control|hire|use[ds]?|amplif|echo|boost|repost|target|attack|link|"
    r"connect|steal|stole|"
    r"運用|操控|指揮|經營|放大|轉發|轉載|引用|針對|鎖定|攻擊|偽冒|營造|渲染|擴散|"
    r"推宣|散播|傳散|設立|創建|委託|推播|炒作|批評|引導|關係密切",
    re.I,
)
_ACTOR_TYPES = {"person", "org", "network", "account", "website", "media"}

def select_claim_windows(windows, mentions, limit=None):
    """在有上限時穩定排序 relation-rich windows；無上限時保持原順序與既有行為。"""
    indexed = list(enumerate(windows, 1))
    if limit is None or limit >= len(indexed):
        return [(index, window, None) for index, window in indexed]
    if limit <= 0:
        return []
    types = {mention.get("tmp_id"): mention.get("coarse_type") for mention in mentions}
    ranked = []
    for index, window in indexed:
        text = window["text"]
        candidate_types = {types.get(candidate.get("tmp_id")) for candidate in window["candidates"]}
        has_actor = bool(candidate_types & _ACTOR_TYPES)
        has_narrative = "narrative" in candidate_types
        has_place = "place" in candidate_types
        tier = 4 if has_actor and has_narrative else 3 if has_actor and has_place else 2 if has_actor else 1 if has_narrative else 0
        cue = bool(_RELATION_CUE.search(text))
        candidates = len(window["candidates"])
        compact = 2 <= candidates <= 5
        stripped = text.strip()
        title_like = index == 1 and not re.search(r"[。.!?！？]", stripped)
        reporting_context = bool(re.search(r"\bwe\b|我們|本局|本研究|研究團隊", text, re.I))
        forensic_context = bool(re.search(r"phone number|電話號碼|手機號碼|login|登入", text, re.I))
        priority = (int(not title_like), int(not forensic_context), int(cue),
                    int(not reporting_context), tier, int(compact), -abs(candidates - 3), -len(text))
        ranked.append((index, window, priority))
    return sorted(ranked, key=lambda item: tuple(-value for value in item[2]) + (item[0],))[:limit]

def call_llm_chunked(text, max_chars=2400, overlap=240, diagnostics=None, run=None, on_chunk=None):
    """逐 chunk 抽取並合併；tmp_id 加 namespace，重疊區的完全相同項目去重。"""
    merged_m, merged_a, mention_key_to_id = [], [], {}
    seen_a = set()
    chunks = split_text(text, max_chars, overlap)
    if run is not None:
        run.total_chunks = len(chunks)
    for ci, chunk in enumerate(chunks, 1):
        if run is not None:
            run.chunk = ci
            run.emit("chunk_start", chunk=ci, total_chunks=len(chunks), length=len(chunk))
        chunk_diagnostics = [] if diagnostics is not None else None
        pred = (call_llm_two_stage(chunk, chunk_diagnostics) if run is None else
                call_llm_two_stage(chunk, chunk_diagnostics, run=run))
        local_to_global = {}
        if diagnostics is not None:
            diagnostics.append({"chunk": ci, "start": text.find(chunk), "length": len(chunk),
                                "complete": not bool(run and run.budget_reason),
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
        snapshot = {"mentions": copy.deepcopy(merged_m), "assertions": copy.deepcopy(merged_a)}
        if run is not None:
            run.emit("chunk_done", chunk=ci, total_chunks=len(chunks),
                     mentions=len(merged_m), assertions=len(merged_a),
                     complete=not bool(run.budget_reason))
        if on_chunk is not None:
            on_chunk(snapshot, diagnostics, ci, len(chunks), run)
        if run is not None and run.budget_reason:
            break
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

def extract(report_meta, text, run=None, diagnostics=None):
    """run＝可選的 ExtractionRun（時間／呼叫數上限）；diagnostics＝可選的 list，收各 stage 的結果。

    diagnostics 是抽出 0 個 mention 時唯一能分辨「模型回空」與「呼叫失敗」的線索——
    兩階段抽取內部本來就會記，但先前沒有往上傳，資訊到這裡就斷了。
    """
    raw = call_llm_two_stage(text, run=run, diagnostics=diagnostics)
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
