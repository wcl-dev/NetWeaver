#!/usr/bin/env python3
"""策展後台（本機）：把 curate.py / register.py 的 CLI 安全邏輯包成瀏覽器操作介面。

不重寫任何判斷——所有動作都轉呼叫既有函式（curate.cmd_set/cmd_compile、register.cmd_add_actor），
因此紅線、source-scoped upsert、歸因閘、enum 驗證全都沿用。純本機、stdlib、無外部套件；寫的是真 db.js。

用法：python3 pipeline/curate_server.py [--port 8090]，然後瀏覽器開 http://127.0.0.1:8090
"""
import argparse, io, json, pathlib, importlib.util, contextlib, types, traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

_here = pathlib.Path(__file__).resolve().parent
def _load(n):
    s = importlib.util.spec_from_file_location(n, str(_here / (n + ".py")))
    m = importlib.util.module_from_spec(s); s.loader.exec_module(m); return m
rl = _load("run_loop"); curate = _load("curate"); register = _load("register")
DERIVE = _load("derive"); FILTER = _load("filter")

def find_similar(name):
    """找可能是同一個的既有單位：canon（繁簡/標點折疊）後相等或互為子字串（≥2字）。回既有單位供人選『補別名』而非新建。"""
    cn = FILTER.canon(name)
    if not cn: return []
    _s, _i, _j, db = curate.load_db(); out = []
    for e in db["entities"]:
        for nm in [e.get("name_zh"), e.get("name_en")] + (e.get("aliases") or []):
            c = FILTER.canon(nm) if nm else ""
            if c and (cn == c or (len(cn) >= 2 and len(c) >= 2 and (cn in c or c in cn))):
                out.append({"id": e["id"], "name_zh": e.get("name_zh"), "matched_on": nm}); break
    return out

def _capture(fn, args_ns):
    """呼叫 CLI 函式（吃 argparse-like namespace，會 print / 可能 SystemExit）→ 回 (ok, 輸出訊息)。"""
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            fn(args_ns)
        return True, buf.getvalue().strip()
    except SystemExit as e:                                    # 驗證/安全阻擋 → 訊息即 e
        return False, (buf.getvalue() + "\n" + str(e)).strip()
    except Exception as e:
        return False, buf.getvalue() + "\n" + f"{type(e).__name__}: {e}\n" + traceback.format_exc()

def queue_rows():
    q = rl.load_queue()
    return sorted(q.values(), key=lambda e: (e.get("compile_status") != "pending", e.get("raw_id", "")))

def item_detail(raw_id):
    e = rl.load_queue().get(raw_id)
    if not e: return {"error": f"queue 無此 raw_id：{raw_id}"}
    out = {k: e[k] for k in e}
    try:
        _su, ent_ids = rl.load_db()
        _s, _i, _j, _db = curate.load_db()                    # 即時重算來源狀態（db.sources 可能剛被登錄過）
        out["source_curated"] = e.get("url") in {s.get("url") for s in _db["sources"]}
        sl, rec, extr, att, digest, fails = curate.project_extraction(e["extraction"])
        reg = DERIVE.load_registry()
        id2s = {m["tmp_id"]: m["surface"] for m in extr.get("mentions", [])}
        # 每條 derive 關係的 publishable/held（allowlist 過濾的可視化）
        rels = []
        for r in sl.get("relationships", []):
            rels.append({"source": id2s.get(r["source"], r["source"]), "type": r["type"],
                         "target": id2s.get(r["target"], r["target"]),
                         "publishable": r.get("publishable"), "hold_reason": r.get("hold_reason")})
        # held 的主詞 = 待登錄 actor 候選；只留「像單位」的（org/media/network/account/person/website），
        # 濾掉敘事/地點類雜訊（天然氣貨輪、美國只要台積電…不該當單位登錄）
        ACTORLIKE = {"org", "network", "account", "media", "person", "website"}
        CAT = {"media": "state-media", "account": "cib-network", "network": "cib-network",
               "org": "state-organ", "website": "cib-network", "person": "cib-network"}
        ROLE = {"amplifies": "amplifier", "targets": "attacker", "operated-by": "attacker",
                "supplies-tech-to": "collaborator", "runs": "attacker"}
        surf2ct = {m["surface"]: m.get("coarse_type") for m in extr.get("mentions", [])}
        held_names = sorted({rr["source"] for rr in rels
                             if rr["publishable"] is False and rr["hold_reason"] == "subject-not-documented"
                             and surf2ct.get(rr["source"]) in ACTORLIKE})
        held_subjects = held_names                            # 相容舊欄位
        held = []                                             # 帶「電腦擬稿」：類別/角色先猜好，人只確認
        for name in held_names:
            ct = surf2ct.get(name)
            reltypes = [rr["type"] for rr in rels if rr["source"] == name]
            role = next((ROLE[t] for t in reltypes if t in ROLE), "amplifier")
            held.append({"name": name, "coarse_type": ct,
                         "suggest_category": CAT.get(ct, "cib-network"), "suggest_role": role})
        out["projected"] = {
            "operator": rec["operator"].get("name"),
            "operator_ref": rl.operator_ref(sl, ent_ids),
            "attributed_to": att, "valid": not fails,
            "claims": [{"about": c["about"], "quote": c["quote"], "source": c["source"]} for c in rec["claims"]],
            "relationships": rels, "held_subjects": held_subjects, "held": held,
        }
    except Exception as ex:
        out["projected"] = {"error": f"{type(ex).__name__}: {ex}"}
    return out

def registry_actors():
    _su, _ids = rl.load_db(); src, i, j, db = curate.load_db()
    return [{"id": e["id"], "name_zh": e.get("name_zh")} for e in db["entities"]], \
           [{"id": s["id"], "url": s.get("url")} for s in db["sources"]]

class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def _send(self, code, body, ctype="application/json"):
        b = body.encode("utf-8") if isinstance(body, str) else body
        self.send_response(code); self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b)

    def do_GET(self):
        u = urlparse(self.path); q = parse_qs(u.query)
        if u.path == "/": return self._send(200, HTML, "text/html; charset=utf-8")
        if u.path == "/api/queue": return self._send(200, json.dumps(queue_rows(), ensure_ascii=False))
        if u.path == "/api/item": return self._send(200, json.dumps(item_detail(q.get("raw_id", [""])[0]), ensure_ascii=False))
        if u.path == "/api/registry":
            acts, srcs = registry_actors()
            return self._send(200, json.dumps({"actors": acts, "sources": srcs}, ensure_ascii=False))
        if u.path == "/api/find-similar":
            return self._send(200, json.dumps(find_similar(q.get("name", [""])[0]), ensure_ascii=False))
        return self._send(404, json.dumps({"error": "not found"}))

    def do_POST(self):
        u = urlparse(self.path)
        n = int(self.headers.get("Content-Length", 0)); data = json.loads(self.rfile.read(n) or b"{}")
        if u.path == "/api/set":                               # approve/reject/defer
            ns = types.SimpleNamespace(raw_id=data["raw_id"], status=data["status"], note=data.get("note"))
            ok, msg = _capture(curate.cmd_set, ns); return self._send(200, json.dumps({"ok": ok, "msg": msg}, ensure_ascii=False))
        if u.path == "/api/compile":
            ns = types.SimpleNamespace(yes=bool(data.get("yes")), dry_run=bool(data.get("dry_run")))
            ok, msg = _capture(curate.cmd_compile, ns); return self._send(200, json.dumps({"ok": ok, "msg": msg}, ensure_ascii=False))
        if u.path == "/api/register-actor":
            ns = types.SimpleNamespace(id=data.get("id"), name_zh=data.get("name_zh"), name_en=data.get("name_en"),
                                       category=data.get("category"), role=data.get("role"), origin=data.get("origin"),
                                       summary_zh=data.get("summary_zh"), source_ids=data.get("source_ids"),
                                       aliases=data.get("aliases"), confidence=data.get("confidence"),
                                       sensitivity=data.get("sensitivity"))
            ok, msg = _capture(register.cmd_add_actor, ns); return self._send(200, json.dumps({"ok": ok, "msg": msg}, ensure_ascii=False))
        if u.path == "/api/register-source":
            ns = types.SimpleNamespace(url=data.get("url"), org=data.get("org"), title=data.get("title"),
                                       type=data.get("type"), date=data.get("date"), id=data.get("id"))
            ok, msg = _capture(register.cmd_add_source, ns); return self._send(200, json.dumps({"ok": ok, "msg": msg}, ensure_ascii=False))
        if u.path == "/api/add-alias":
            ns = types.SimpleNamespace(id=data.get("id"), alias=data.get("alias"))
            ok, msg = _capture(register.cmd_add_alias, ns); return self._send(200, json.dumps({"ok": ok, "msg": msg}, ensure_ascii=False))
        if u.path == "/api/publish-one":                       # 一鍵：自動補來源 → 核可 → 發布（少步驟）
            rid = data.get("raw_id"); e = rl.load_queue().get(rid); steps = []
            if not e: return self._send(200, json.dumps({"ok": False, "msg": "找不到此項"}, ensure_ascii=False))
            try:
                _sl, _rec, extr, _a, _d, _f = curate.project_extraction(e["extraction"]); rep = extr.get("report", {})
            except Exception as ex:
                return self._send(200, json.dumps({"ok": False, "msg": f"讀取失敗：{ex}"}, ensure_ascii=False))
            _s, _i, _j, db = curate.load_db()
            if e.get("url") not in {s.get("url") for s in db["sources"]}:   # 來源沒登錄 → 自動登錄（人按發布＝已認可此來源）
                ns = types.SimpleNamespace(url=rep.get("url") or e.get("url"), org=rep.get("org"),
                                           title=rep.get("name") or e.get("title"),
                                           type=rep.get("type") or "ngo-report", date=rep.get("published"), id=None)
                ok, m = _capture(register.cmd_add_source, ns); steps.append("① 登錄來源：" + (m or "已登錄"))
                if not ok: return self._send(200, json.dumps({"ok": False, "msg": "\n".join(steps)}, ensure_ascii=False))
            else:
                steps.append("① 來源已在清單")
            ok, m = _capture(curate.cmd_set, types.SimpleNamespace(raw_id=rid, status="approved", note=None))
            if not ok:
                if "歸屬" in m:                                # 白話化最常見的擋點：沒有已登錄的主要單位
                    steps.append("② 還不能發布 —— 這篇的「主要單位」還沒在名冊。\n"
                                 "   請在上面把「這篇主要在講的那個單位」加進名冊（雜訊不用理），再按一次即可。")
                else:
                    steps.append("② 核可未過：" + m)
                return self._send(200, json.dumps({"ok": False, "msg": "\n".join(steps)}, ensure_ascii=False))
            steps.append("② 核可 ✓")
            # 只發布這一篇（不指名會連帶發布佇列裡其他 approved）；yes=False：本介面沒有呈現歸因
            # 資訊，按下「發布」不等於操作者知情同意歸因，不能代按這道紅線的閘。
            ok, m = _capture(curate.cmd_compile, types.SimpleNamespace(raw_id=rid, yes=False, dry_run=False))
            if not ok and "attributed-to" in m:
                steps.append("③ 還不能發布 —— 這篇含「歸因」宣稱（指名某單位是幕後操作者）。\n"
                             "   依專案紅線需逐篇人工確認，請在終端機執行：\n"
                             f"   python3 pipeline/curate.py compile {rid} --yes")
            else:
                steps.append("③ 發布：" + m)
            return self._send(200, json.dumps({"ok": ok, "msg": "\n".join(steps)}, ensure_ascii=False))
        return self._send(404, json.dumps({"error": "not found"}))

HTML = (_here / "curate_admin.html").read_text(encoding="utf-8") if (_here / "curate_admin.html").exists() else "<h1>缺 curate_admin.html</h1>"

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--port", type=int, default=8090); a = ap.parse_args()
    srv = ThreadingHTTPServer(("127.0.0.1", a.port), H)
    print(f"策展後台 → http://127.0.0.1:{a.port}（Ctrl-C 停）")
    try: srv.serve_forever()
    except KeyboardInterrupt: print("\n停止")

if __name__ == "__main__":
    main()
