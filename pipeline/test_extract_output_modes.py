#!/usr/bin/env python3
"""Ollama structured-output 模式、thinking 控制與碼端 schema 驗證；不呼叫模型。"""
import copy
import json
import os

import extract

original_mode = os.environ.get("NW_LLM_OUTPUT_MODE")
original_think = os.environ.get("NW_LLM_THINK")
original_provider = os.environ.get("NW_LLM_PROVIDER")

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

    schema_variant = extract.extraction_variant()
    os.environ["NW_LLM_OUTPUT_MODE"] = "schema"
    assert schema_variant != extract.extraction_variant()
finally:
    for name, value in (("NW_LLM_OUTPUT_MODE", original_mode), ("NW_LLM_THINK", original_think),
                        ("NW_LLM_PROVIDER", original_provider)):
        if value is None:
            os.environ.pop(name, None)
        else:
            os.environ[name] = value

print("extract output modes：通過（schema/json、think:false、outer strict＋item 級隔離）")
