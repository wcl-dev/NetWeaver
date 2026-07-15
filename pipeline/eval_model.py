#!/usr/bin/env python3
"""對 gold dev set 跑真實模型抽取，保存 raw prediction，再呼叫 scorer。

輸出預設放 pipeline/eval_runs/<model>_<variant>/，可中斷續跑；加 --force 才覆寫。
模型/provider 沿用 extract.py 的 NW_LLM_* 環境變數。
"""
import argparse
import json
import os
import pathlib
import re
import subprocess
import sys
import time

import extract

HERE = pathlib.Path(__file__).resolve().parent


def safe_name(value):
    return re.sub(r"[^A-Za-z0-9._-]+", "_", value).strip("_") or "model"


def diagnostic_errors(value):
    """遞迴收集 mention／assertion window 的 partial errors。"""
    errors = []
    if isinstance(value, dict):
        if value.get("error"):
            errors.append(value["error"])
        for key, child in value.items():
            if key != "error":
                errors.extend(diagnostic_errors(child))
    elif isinstance(value, list):
        for child in value:
            errors.extend(diagnostic_errors(child))
    return errors


def trace_stats(diagnostics):
    stages = [stage for chunk in diagnostics for stage in chunk.get("stages", [])]
    mention_calls = sum(str(stage.get("stage", "")).startswith("mentions-") for stage in stages)
    assertion_windows = sum(stage.get("windows", 0) for stage in stages if stage.get("stage") == "assertions")
    assertion_calls = sum(stage.get("calls", 0) for stage in stages if stage.get("stage") == "assertions")
    return {"llm_calls": mention_calls + assertion_calls,
            "mention_calls": mention_calls,
            "assertion_windows": assertion_windows,
            "assertion_calls": assertion_calls}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--gold-dir", type=pathlib.Path, default=HERE / "gold" / "dev")
    ap.add_argument("--out-dir", type=pathlib.Path)
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--no-request-cache", action="store_true",
                    help="停用 eval_runs/.request_cache 的逐 request 成功回應快取")
    ap.add_argument("--limit", type=int, help="只跑前 N 篇（smoke test 用）")
    ap.add_argument("--match", action="append",
                    help="只跑檔名含此字串的 gold；可重複指定（smoke test 用）")
    ap.add_argument("--chunk-chars", type=int, default=int(os.environ.get("NW_EVAL_CHUNK_CHARS", "2400")))
    ap.add_argument("--chunk-overlap", type=int, default=int(os.environ.get("NW_EVAL_CHUNK_OVERLAP", "240")))
    args = ap.parse_args()

    if not args.no_request_cache and not os.environ.get("NW_LLM_CACHE_DIR"):
        os.environ["NW_LLM_CACHE_DIR"] = str(HERE / "eval_runs" / ".request_cache")

    provider, base, model, _ = extract._cfg()
    variant = extract.extraction_variant()
    output_mode, think = extract._output_mode(), extract._think_setting()
    out_dir = args.out_dir or HERE / "eval_runs" / f"{safe_name(model)}_{variant}"
    out_dir.mkdir(parents=True, exist_ok=True)
    golds = sorted(args.gold_dir.glob("*.gold.json"))
    if args.match:
        golds = [p for p in golds if any(match in p.name for match in args.match)]
    if args.limit is not None:
        golds = golds[:args.limit]
    if not golds:
        raise SystemExit(f"找不到 gold：{args.gold_dir}")

    pairs = []
    print(f"模型基線：provider={provider} model={model} variant={variant} docs={len(golds)} out={out_dir}", flush=True)
    for i, gold_path in enumerate(golds, 1):
        pred_path = out_dir / gold_path.name.replace(".gold.json", ".pred.json")
        pairs.append((gold_path, pred_path))
        if pred_path.exists() and not args.force:
            print(f"[{i}/{len(golds)}] 已存在，續用 {pred_path.name}", flush=True)
            continue
        gold = json.loads(gold_path.read_text(encoding="utf-8"))
        started = time.monotonic()
        meta_path = pred_path.with_suffix(".meta.json")
        print(f"[{i}/{len(golds)}] 抽取 {gold_path.name}（{len(gold['cleaned_text'])} chars）…", flush=True)
        try:
            diagnostics = []
            extract.reset_cache_stats()
            pred = extract.call_llm_chunked(gold["cleaned_text"], args.chunk_chars, args.chunk_overlap, diagnostics)
        except (Exception, SystemExit) as exc:
            # 留下非 JSON prediction，讓 scorer 將 json_ok 計為 false；sidecar 保存診斷。
            pred_path.write_text("", encoding="utf-8")
            pred_path.with_suffix(".error.txt").write_text(
                f"{type(exc).__name__}: {exc}\n", encoding="utf-8"
            )
            elapsed = time.monotonic() - started
            meta_path.write_text(json.dumps({"provider": provider, "model": model,
                                             "prompt_version": extract.PROMPT_VERSION, "variant": variant,
                                             "output_mode": output_mode, "think": think,
                                             "status": "error", "error_type": type(exc).__name__,
                                             "elapsed_seconds": round(elapsed, 3), "chunk_chars": args.chunk_chars,
                                             "chunk_overlap": args.chunk_overlap}, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"          失敗 {type(exc).__name__}: {exc}（{elapsed:.1f}s）；繼續下一篇", flush=True)
            continue
        pred_path.write_text(json.dumps(pred, ensure_ascii=False, indent=2), encoding="utf-8")
        pred_path.with_suffix(".trace.json").write_text(json.dumps(diagnostics, ensure_ascii=False, indent=2), encoding="utf-8")
        elapsed = time.monotonic() - started
        partial_errors = diagnostic_errors(diagnostics)
        stats = {**trace_stats(diagnostics), **extract.cache_stats()}
        meta_path.write_text(json.dumps({"provider": provider, "model": model,
                                         "prompt_version": extract.PROMPT_VERSION, "variant": variant,
                                         "output_mode": output_mode, "think": think,
                                         "status": "partial-error" if partial_errors else "ok",
                                         "partial_errors": partial_errors,
                                         "elapsed_seconds": round(elapsed, 3),
                                         "chunk_chars": args.chunk_chars, "chunk_overlap": args.chunk_overlap,
                                         "mentions": len(pred.get("mentions", [])),
                                         "assertions": len(pred.get("assertions", [])),
                                         **stats}, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"          完成 {len(pred.get('mentions', []))} mentions / {len(pred.get('assertions', []))} assertions，{elapsed:.1f}s", flush=True)

    cmd = [sys.executable, str(HERE / "eval_extract.py")]
    for gold_path, pred_path in pairs:
        cmd.extend((str(gold_path), str(pred_path)))
    print("\n開始評分…", flush=True)
    return subprocess.run(cmd, env=os.environ.copy()).returncode


if __name__ == "__main__":
    raise SystemExit(main())
