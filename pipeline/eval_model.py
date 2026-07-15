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

def write_json_atomic(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f"{path.name}.{os.getpid()}.tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")
    os.replace(temporary, path)

def progress_message(event):
    chunk = f"chunk {event.get('chunk')}/{event.get('total_chunks')}" if event.get("chunk") else "document"
    kind = event["event"]
    if kind == "chunk_start":
        return f"          [{chunk}] 開始（{event['length']} chars）"
    if kind == "request_start":
        return (f"          [{chunk}] {event['stage']} → cold #{event['cold_call']} "
                f"(timeout≤{event['timeout_seconds']:.1f}s)")
    if kind == "request_cache_hit":
        drops = event.get("schema_item_drops", 0)
        return f"          [{chunk}] {event['stage']} → cache hit" + (f"，drop {drops} invalid item(s)" if drops else "")
    if kind == "request_done":
        tokens = f"，tokens {event.get('prompt_tokens', 0)}+{event.get('completion_tokens', 0)}"
        drops = event.get("schema_item_drops", 0)
        return (f"          [{chunk}] {event['stage']} ✓ {event['request_seconds']:.1f}s{tokens}"
                + (f"，drop {drops} invalid item(s)" if drops else ""))
    if kind == "request_error":
        return f"          [{chunk}] {event['stage']} ✗ {event['error']}（{event['request_seconds']:.1f}s）"
    if kind == "assertion_plan":
        return (f"          [{chunk}] assertion windows={event['selected']}/{event['windows']} selected"
                + (f"，skip={event['skipped']}" if event["skipped"] else ""))
    if kind == "chunk_done":
        suffix = "（partial）" if not event.get("complete", True) else ""
        return f"          [{chunk}] checkpoint {event['mentions']} mentions / {event['assertions']} assertions{suffix}"
    if kind == "budget_exhausted":
        return f"          [budget] {event['reason']}（cold calls={event['cold_calls']}）"
    return None


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
    mention_calls = sum(str(stage.get("stage", "")).startswith("mentions-") and
                        not stage.get("budget_exhausted") for stage in stages)
    assertion_windows = sum(stage.get("windows", 0) for stage in stages if stage.get("stage") == "assertions")
    assertion_selected = sum(stage.get("selected_windows", stage.get("windows", 0))
                             for stage in stages if stage.get("stage") == "assertions")
    assertion_skipped = sum(stage.get("skipped_windows", 0)
                            for stage in stages if stage.get("stage") == "assertions")
    assertion_calls = sum(stage.get("calls", 0) for stage in stages if stage.get("stage") == "assertions")
    return {"llm_calls": mention_calls + assertion_calls,
            "mention_calls": mention_calls,
            "assertion_windows": assertion_windows,
            "assertion_windows_selected": assertion_selected,
            "assertion_windows_skipped": assertion_skipped,
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
    ap.add_argument("--doc-timeout", type=float, default=float(os.environ.get("NW_EVAL_DOC_TIMEOUT", "600")),
                    help="單篇 wall-clock budget 秒數；0 表示停用（預設 600）")
    ap.add_argument("--max-cold-calls", type=int, default=int(os.environ.get("NW_EVAL_MAX_COLD_CALLS", "0")),
                    help="單篇真正模型 calls 上限；cache hits 不計，0 表示停用")
    ap.add_argument("--max-assertion-windows", type=int,
                    default=int(os.environ.get("NW_EVAL_MAX_ASSERTION_WINDOWS", "0")),
                    help="單篇 assertion windows 上限；跨 chunk 配額＋relation-rich 排序，0 表示停用")
    args = ap.parse_args()

    if not args.no_request_cache and not os.environ.get("NW_LLM_CACHE_DIR"):
        os.environ["NW_LLM_CACHE_DIR"] = str(HERE / "eval_runs" / ".request_cache")

    provider, base, model, _ = extract._cfg()
    variant = extract.extraction_variant()
    if args.max_assertion_windows > 0:
        variant += f"-aw{args.max_assertion_windows}"
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
        had_final = pred_path.exists()
        if pred_path.exists() and not args.force:
            print(f"[{i}/{len(golds)}] 已存在，續用 {pred_path.name}", flush=True)
            pairs.append((gold_path, pred_path))
            continue
        gold = json.loads(gold_path.read_text(encoding="utf-8"))
        started = time.monotonic()
        meta_path = pred_path.with_suffix(".meta.json")
        trace_path = pred_path.with_suffix(".trace.json")
        telemetry_path = pred_path.with_suffix(".telemetry.json")
        checkpoint_path = pred_path.with_suffix(".checkpoint.json")
        checkpoint_meta_path = checkpoint_path.with_suffix(".meta.json")
        print(f"[{i}/{len(golds)}] 抽取 {gold_path.name}（{len(gold['cleaned_text'])} chars）…", flush=True)
        events = []
        def progress(event):
            events.append(event)
            write_json_atomic(telemetry_path, {"status": "running", "events": events})
            message = progress_message(event)
            if message:
                print(message, flush=True)

        run = extract.ExtractionRun(doc_timeout=args.doc_timeout, max_cold_calls=args.max_cold_calls,
                                    max_assertion_windows=args.max_assertion_windows, progress=progress)
        diagnostics = []
        def checkpoint(prediction, trace, completed_chunk, total_chunks, context):
            write_json_atomic(checkpoint_path, {
                "status": "budget-exhausted" if context and context.budget_reason else "in-progress",
                "last_chunk": completed_chunk,
                "completed_chunks": sum(bool(item.get("complete")) for item in trace),
                "total_chunks": total_chunks,
                "prediction": prediction, "diagnostics": trace,
                "run": context.summary() if context else {},
            })
        try:
            extract.reset_cache_stats()
            pred = extract.call_llm_chunked(gold["cleaned_text"], args.chunk_chars, args.chunk_overlap,
                                            diagnostics, run=run, on_chunk=checkpoint)
        except KeyboardInterrupt:
            elapsed = time.monotonic() - started
            summary = run.summary()
            write_json_atomic(telemetry_path, {"status": "interrupted", "summary": summary, "events": events})
            write_json_atomic(checkpoint_meta_path if had_final else meta_path,
                              {"provider": provider, "model": model,
                               "prompt_version": extract.PROMPT_VERSION, "variant": variant,
                               "output_mode": output_mode, "think": think, "status": "interrupted",
                               "elapsed_seconds": round(elapsed, 3), "run": summary,
                               "checkpoint": str(checkpoint_path) if checkpoint_path.exists() else None})
            print(f"          中止（{elapsed:.1f}s）；已保留 request cache"
                  + (f" 與 {checkpoint_path.name}" if checkpoint_path.exists() else ""), flush=True)
            return 130
        except (Exception, SystemExit) as exc:
            # 留下非 JSON prediction，讓 scorer 將 json_ok 計為 false；sidecar 保存診斷。
            failure_base = checkpoint_path if had_final else pred_path
            if not had_final:
                pred_path.write_text("", encoding="utf-8")
            failure_base.with_suffix(".error.txt").write_text(
                f"{type(exc).__name__}: {exc}\n", encoding="utf-8"
            )
            elapsed = time.monotonic() - started
            summary = run.summary()
            write_json_atomic(telemetry_path, {"status": "error", "summary": summary, "events": events})
            write_json_atomic(checkpoint_meta_path if had_final else meta_path,
                              {"provider": provider, "model": model,
                               "prompt_version": extract.PROMPT_VERSION, "variant": variant,
                               "output_mode": output_mode, "think": think,
                               "status": "error", "error_type": type(exc).__name__,
                               "elapsed_seconds": round(elapsed, 3), "chunk_chars": args.chunk_chars,
                               "chunk_overlap": args.chunk_overlap, "run": summary})
            print(f"          失敗 {type(exc).__name__}: {exc}（{elapsed:.1f}s）；繼續下一篇", flush=True)
            continue
        elapsed = time.monotonic() - started
        partial_errors = diagnostic_errors(diagnostics)
        stats = {**trace_stats(diagnostics), **extract.cache_stats()}
        summary = run.summary()
        if run.budget_reason:
            write_json_atomic(telemetry_path, {"status": "budget-exhausted", "summary": summary, "events": events})
            write_json_atomic(checkpoint_meta_path if had_final else meta_path,
                              {"provider": provider, "model": model,
                               "prompt_version": extract.PROMPT_VERSION, "variant": variant,
                               "output_mode": output_mode, "think": think,
                               "status": "budget-exhausted", "budget_reason": run.budget_reason,
                               "partial_errors": partial_errors,
                               "elapsed_seconds": round(elapsed, 3), "doc_timeout": args.doc_timeout,
                               "max_cold_calls": args.max_cold_calls,
                               "max_assertion_windows": args.max_assertion_windows,
                               "chunk_chars": args.chunk_chars, "chunk_overlap": args.chunk_overlap,
                               "checkpoint": str(checkpoint_path), "run": summary, **stats})
            print(f"          額度用完：{run.budget_reason}，partial {len(pred.get('mentions', []))} mentions / "
                  f"{len(pred.get('assertions', []))} assertions，保存 checkpoint；不納入評分", flush=True)
            continue
        write_json_atomic(pred_path, pred)
        write_json_atomic(trace_path, diagnostics)
        write_json_atomic(telemetry_path, {"status": "complete", "summary": summary, "events": events})
        window_limited = stats["assertion_windows_skipped"] > 0
        status = "partial-error" if partial_errors else "window-limited" if window_limited else "ok"
        write_json_atomic(meta_path, {"provider": provider, "model": model,
                                      "prompt_version": extract.PROMPT_VERSION, "variant": variant,
                                      "output_mode": output_mode, "think": think,
                                      "status": status, "window_limited": window_limited,
                                      "partial_errors": partial_errors,
                                      "elapsed_seconds": round(elapsed, 3), "doc_timeout": args.doc_timeout,
                                      "max_cold_calls": args.max_cold_calls,
                                      "max_assertion_windows": args.max_assertion_windows,
                                      "chunk_chars": args.chunk_chars, "chunk_overlap": args.chunk_overlap,
                                      "mentions": len(pred.get("mentions", [])),
                                      "assertions": len(pred.get("assertions", [])),
                                      "run": summary, **stats})
        checkpoint_path.unlink(missing_ok=True)
        checkpoint_meta_path.unlink(missing_ok=True)
        pairs.append((gold_path, pred_path))
        print(f"          完成 {len(pred.get('mentions', []))} mentions / {len(pred.get('assertions', []))} assertions，{elapsed:.1f}s", flush=True)

    if not pairs:
        print("\n沒有完整 prediction；略過評分。", flush=True)
        return 0
    cmd = [sys.executable, str(HERE / "eval_extract.py")]
    for gold_path, pred_path in pairs:
        cmd.extend((str(gold_path), str(pred_path)))
    print("\n開始評分…", flush=True)
    return subprocess.run(cmd, env=os.environ.copy()).returncode


if __name__ == "__main__":
    raise SystemExit(main())
