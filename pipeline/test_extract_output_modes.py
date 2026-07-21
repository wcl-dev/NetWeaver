#!/usr/bin/env python3
"""Ollama structured-output 模式、thinking 控制與碼端 schema 驗證；不呼叫模型。"""
import copy
import json
import os

import extract

original_mode = os.environ.get("NW_LLM_OUTPUT_MODE")
original_think = os.environ.get("NW_LLM_THINK")
original_provider = os.environ.get("NW_LLM_PROVIDER")
original_base_url = os.environ.get("NW_LLM_BASE_URL")

SCHEMA = {"type": "object", "additionalProperties": False, "required": ["items"],
          "properties": {"items": {"type": "array", "items": {
              "type": "object", "additionalProperties": False, "required": ["kind", "text"],
              "properties": {"kind": {"enum": ["actor", "target"]},
                             "text": {"type": "string", "minLength": 1}}}}}}
MESSAGES = [{"role": "system", "content": "Extract."}, {"role": "user", "content": "Report."}]

try:
    os.environ["NW_LLM_PROVIDER"] = "ollama"
    os.environ["NW_LLM_OUTPUT_MODE"] = "schema"
    os.environ["NW_LLM_THINK"] = "false"
    _, schema_body, _, _ = extract._request_spec(MESSAGES, SCHEMA)
    assert schema_body["format"] == SCHEMA and schema_body["think"] is False
    assert schema_body["messages"] == MESSAGES

    os.environ["NW_LLM_OUTPUT_MODE"] = "json"
    _, json_body, _, _ = extract._request_spec(MESSAGES, SCHEMA)
    assert json_body["format"] == "json" and json_body["think"] is False
    assert "JSON Schema" in json_body["messages"][0]["content"]
    assert MESSAGES[0]["content"] == "Extract."

    valid = {"items": [{"kind": "actor", "text": "Red Group"}]}
    assert extract._parse_and_validate("```json\n" + json.dumps(valid) + "\n```", SCHEMA) == valid
    nullable = {"items": [{"kind": "actor", "text": "Red Group", "optional": None}]}
    nullable_schema = copy.deepcopy(SCHEMA)
    nullable_schema["properties"]["items"]["items"]["properties"]["optional"] = {"type": "string"}
    assert extract._parse_and_validate(json.dumps(nullable), nullable_schema,
                                       normalize_optional_nulls=True) == valid
    assert extract.validate_json_schema(nullable, nullable_schema)
    assert extract.validate_json_schema({"items": [{"kind": "invented", "text": ""}]}, SCHEMA)
    assert extract.validate_json_schema({"items": [], "extra": True}, SCHEMA)
    assert extract.validate_json_schema({}, SCHEMA)

    mixed = {"items": [valid["items"][0],
                       {"kind": "invented", "text": "bad enum"},
                       {"kind": "target", "text": "Taiwan", "extra": True}]}
    tolerant = extract._parse_and_validate(json.dumps(mixed), SCHEMA, item_error_field="items")
    assert tolerant == valid and len(tolerant.schema_item_drops) == 2
    assert "不在 enum" in tolerant.schema_item_drops[0]["error"]
    assert "不允許的欄位" in tolerant.schema_item_drops[1]["error"]
    try:
        extract._parse_and_validate(json.dumps({**mixed, "extra": True}), SCHEMA,
                                    item_error_field="items")
        raise AssertionError("outer schema error 不可被 item tolerance 吞掉")
    except ValueError as exc:
        assert "$.extra" in str(exc)

    # 窄版 unwrap：裸單一 item 物件（非 {items:[...]}）→ 包成陣列、標 schema_repaired
    bare = extract._parse_and_validate(json.dumps({"kind": "actor", "text": "Red Group"}), SCHEMA,
                                       item_error_field="items")
    assert bare == valid and bare.schema_repaired is True
    normal = extract._parse_and_validate(json.dumps(valid), SCHEMA, item_error_field="items")
    assert normal.schema_repaired is False                       # 正常陣列不誤標
    try:                                                          # 裸物件但非合法 item → 仍 raise（不亂包）
        extract._parse_and_validate(json.dumps({"foo": "bar"}), SCHEMA, item_error_field="items")
        raise AssertionError("非合法 item 的裸物件不可被 unwrap 吞掉")
    except ValueError as exc:
        assert "缺少必填欄位" in str(exc)
    # 裸 item 帶 optional null（json mode 常見）：須先依 item schema 正規化再 unwrap（Codex review #3）
    bare_null = extract._parse_and_validate(json.dumps({"kind": "actor", "text": "Red Group", "optional": None}),
                                            nullable_schema, normalize_optional_nulls=True, item_error_field="items")
    assert bare_null == valid and bare_null.schema_repaired is True

    os.environ["NW_LLM_PROVIDER"] = "openai"
    os.environ["NW_LLM_BASE_URL"] = "https://generativelanguage.googleapis.com/v1beta/openai/"
    gemini_url, _, _, _ = extract._request_spec(MESSAGES, SCHEMA)
    assert gemini_url == "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
    os.environ["NW_LLM_BASE_URL"] = "https://api.openai.com"
    openai_url, _, _, _ = extract._request_spec(MESSAGES, SCHEMA)
    assert openai_url == "https://api.openai.com/v1/chat/completions"
    os.environ["NW_LLM_BASE_URL"] = "http://localhost:8000/v1"
    versioned_url, _, _, _ = extract._request_spec(MESSAGES, SCHEMA)
    assert versioned_url == "http://localhost:8000/v1/chat/completions"

    # NW_LLM_EXTRA_BODY 逃生口：合併進 openai body（如 mlx chat_template_kwargs 關思考）
    os.environ["NW_LLM_EXTRA_BODY"] = '{"chat_template_kwargs":{"enable_thinking":false}}'
    _, extra_body, _, _ = extract._request_spec(MESSAGES, SCHEMA)
    assert extra_body["chat_template_kwargs"] == {"enable_thinking": False}
    assert extra_body["model"] and extra_body["temperature"] == 0     # 原欄位仍在
    os.environ.pop("NW_LLM_EXTRA_BODY", None)

    schema_variant = extract.extraction_variant()
    os.environ["NW_LLM_OUTPUT_MODE"] = "schema"
    assert schema_variant != extract.extraction_variant()
finally:
    for name, value in (("NW_LLM_OUTPUT_MODE", original_mode), ("NW_LLM_THINK", original_think),
                        ("NW_LLM_PROVIDER", original_provider), ("NW_LLM_BASE_URL", original_base_url)):
        if value is None:
            os.environ.pop(name, None)
        else:
            os.environ[name] = value

print("extract output modes：通過（schema/json、think:false、versioned base、outer strict＋item 隔離）")
