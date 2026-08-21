#!/usr/bin/env python3
"""register.py 回歸測試（用 temp db.js，不碰真 data/db.js）。
用法：python3 pipeline/test_register.py"""
import argparse, importlib.util, json, pathlib, tempfile

_h = pathlib.Path(__file__).resolve().parent
_s = importlib.util.spec_from_file_location("register", str(_h / "register.py"))
reg = importlib.util.module_from_spec(_s); _s.loader.exec_module(reg)

CASES = []
def case(fn): CASES.append(fn); return fn

def _setup():
    d = pathlib.Path(tempfile.mkdtemp())
    dbp = d / "db.js"
    db = {"sources": [{"id": "src-x", "org": "Org X", "url": "http://x", "date": "2025-01-01",
                       "type": "news", "title": "X"}],
          "entities": [{"id": "actorx", "name_zh": "甲", "name_en": "Alpha", "aliases": ["AL"],
                        "category": "cib-network", "role": "amplifier", "origin": "PRC",
                        "summary_zh": "s", "source_ids": ["src-x"], "confidence": "medium"}]}
    dbp.write_text("window.NETWEAVER_DB = " + json.dumps(db, ensure_ascii=False) + ";\n", encoding="utf-8")
    (d / "registry.yaml").write_text("sources:\n  - org: Org X\n", encoding="utf-8")
    reg.DBP, reg.REGISTRY = dbp, d / "registry.yaml"
    reg.IGNORE_PATH = d / "roster_ignore.json"      # 不碰真的清單
    return dbp

def src_ns(**kw):
    base = {"id": None, "url": "http://new", "org": "Org X", "type": "news", "title": "N", "date": "2025-02-02"}
    base.update(kw); return argparse.Namespace(**base)

def actor_ns(**kw):
    base = {"id": "newa", "name_zh": "乙", "name_en": "Beta", "category": "cib-network", "role": "amplifier",
            "origin": "PRC", "summary_zh": "s", "aliases": None, "source_ids": "src-x",
            "sensitivity": None, "confidence": "medium"}
    base.update(kw); return argparse.Namespace(**base)

def _db(dbp):
    t = dbp.read_text(); i = t.index("{", t.index("window.NETWEAVER_DB"))
    return json.loads(t[i:json.JSONDecoder().raw_decode(t, i)[1]])

def _rejects(fn, a):
    try: fn(a); return False
    except SystemExit: return True

@case
def test_add_source_happy_suffix_and_id():
    dbp = _setup()
    reg.cmd_add_source(src_ns())
    d = _db(dbp)
    assert len(d["sources"]) == 2 and any(s["url"] == "http://new" for s in d["sources"])
    assert dbp.read_text().rstrip().endswith(";"), "db.js 後綴 ; 須保留"
    # 自動 id 帶 url hash，同 org 第二篇不撞
    reg.cmd_add_source(src_ns(url="http://new2"))
    ids = [s["id"] for s in _db(dbp)["sources"]]
    assert len(ids) == len(set(ids)), "同出版方多篇 source id 不得相撞"

@case
def test_add_source_rejections():
    _setup(); assert _rejects(reg.cmd_add_source, src_ns(url="http://x")), "dup url 應拒"
    _setup(); assert _rejects(reg.cmd_add_source, src_ns(type="blog")), "非法 type 應拒"
    _setup(); assert _rejects(reg.cmd_add_source, src_ns(url="javascript:alert(1)")), "非 http(s) url 應拒"
    _setup(); assert _rejects(reg.cmd_add_source, src_ns(org="  ")), "空白 org 應拒"
    _setup(); assert _rejects(reg.cmd_add_source, src_ns(date="2025-99-99")), "非法日期應拒"

@case
def test_add_actor_happy():
    dbp = _setup()
    reg.cmd_add_actor(actor_ns())
    e = next(x for x in _db(dbp)["entities"] if x["id"] == "newa")
    assert e["source_ids"] == ["src-x"] and e["category"] == "cib-network"

@case
def test_add_actor_rejections():
    _setup(); assert _rejects(reg.cmd_add_actor, actor_ns(id="actorx")), "dup id 應拒"
    _setup(); assert _rejects(reg.cmd_add_actor, actor_ns(name_en="alpha")), "撞既有名（normalize）應拒"
    _setup(); assert _rejects(reg.cmd_add_actor, actor_ns(aliases="AL")), "撞既有別名應拒"
    _setup(); assert _rejects(reg.cmd_add_actor, actor_ns(category="network")), "非法 category 應拒"
    _setup(); assert _rejects(reg.cmd_add_actor, actor_ns(role="boss")), "非法 role 應拒"
    _setup(); assert _rejects(reg.cmd_add_actor, actor_ns(origin="US")), "非法 origin 應拒"
    _setup(); assert _rejects(reg.cmd_add_actor, actor_ns(source_ids="src-none")), "source_id FK 不存在應拒"
    _setup(); assert _rejects(reg.cmd_add_actor, actor_ns(source_ids="")), "source_ids 空應拒"
    _setup(); assert _rejects(reg.cmd_add_actor, actor_ns(name_en="乙")), "新名/別名彼此重複應拒"

@case
def test_url_host_and_strict_kebab():
    _setup(); assert _rejects(reg.cmd_add_source, src_ns(url="http://:80")), "無 host 應拒"
    _setup(); assert _rejects(reg.cmd_add_source, src_ns(id="src-a--b")), "雙連字號 source id 應拒"
    _setup(); assert _rejects(reg.cmd_add_source, src_ns(id="src-")), "尾連字號 source id 應拒"
    _setup(); assert _rejects(reg.cmd_add_actor, actor_ns(id="a--b")), "雙連字號 actor id 應拒"

@case
def test_publisher_allowlist_warn():
    import io, contextlib
    def _out(a):
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf): reg.cmd_add_source(a)
        return buf.getvalue()
    _setup(); assert "⚠" not in _out(src_ns(org="Org X", url="http://k1")), "registry allowlist 的 org 不該 warn"
    # 只在 db.sources、不在 registry 的 org：加第一篇會 warn，第二篇同 org 就不該 warn（已進 db union）
    _setup()
    assert "⚠" in _out(src_ns(org="DB Only Pub", url="http://k2")), "全新 org 第一次應 warn"
    assert "⚠" not in _out(src_ns(org="DB Only Pub", url="http://k3")), "已進 db.sources 的 org 不該再 warn"

@case
def test_sensitivity_optional_and_warn():
    dbp = _setup()
    reg.cmd_add_actor(actor_ns(id="dom", category="commentator", sensitivity="domestic-named"))
    assert next(x for x in _db(dbp)["entities"] if x["id"] == "dom").get("sensitivity") == "domestic-named"
    # 在地具名類未帶 --sensitivity → warn
    import io, contextlib
    _setup(); buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        reg.cmd_add_actor(actor_ns(id="dom2", category="commentator", sensitivity=None))
    assert "⚠" in buf.getvalue(), "commentator 未帶 sensitivity 應 warn"

# ---- roster 忽略清單（沒有它，判斷過的雜訊每次都會重新冒出來）----

@case
def test_ignore_roundtrip_and_persistence():
    _setup()
    assert reg.load_ignore() == {}, "檔案不存在時應為空清單"
    reg.cmd_ignore(argparse.Namespace(name="習近平", reason="被提及的人物，非行為者"))
    ign = reg.load_ignore()
    assert reg._norm("習近平") in ign
    assert ign[reg._norm("習近平")]["reason"] == "被提及的人物，非行為者"
    assert ign[reg._norm("習近平")]["added"], "要記下判斷日期"
    reg.cmd_unignore(argparse.Namespace(name="習近平"))
    assert reg.load_ignore() == {}, "移除後應回到空清單"

@case
def test_ignore_rejects_duplicate_and_missing():
    _setup()
    reg.cmd_ignore(argparse.Namespace(name="中國", reason=None))
    assert _rejects(reg.cmd_ignore, argparse.Namespace(name="中國", reason=None)), "重複加入應被擋"
    assert _rejects(reg.cmd_unignore, argparse.Namespace(name="不存在的名字")), "移除不存在的應被擋"
    assert _rejects(reg.cmd_ignore, argparse.Namespace(name="  ", reason=None)), "空名稱應被擋"

@case
def test_ignore_refuses_registered_entity():
    # 已登錄的實體不該被「忽略」——那是矛盾狀態，要拿掉應該改名冊
    _setup()
    for nm in ("甲", "Alpha", "AL"):                      # 中文名／英文名／別名都要擋
        assert _rejects(reg.cmd_ignore, argparse.Namespace(name=nm, reason=None)), f"{nm} 應被擋"

@case
def test_ignore_matches_across_name_variants():
    # 用與 derive 相同的 normalizer：大小寫／空白差異視為同一個名字
    _setup()
    reg.cmd_ignore(argparse.Namespace(name="Global Times", reason=None))
    assert reg._norm("global  times") in reg.load_ignore(), "正規化後應視為同一名字"

# ---- 觀察者（主動追蹤的機構）不該出現在名冊候選 ----

@case
def test_tracked_publishers_reads_feeds_and_registry():
    d = pathlib.Path(tempfile.mkdtemp())
    (d / "feeds.json").write_text(json.dumps(
        {"sources": [{"org": "Doublethink Lab", "tier": "A"}, {"org": "Citizen Lab", "tier": "A"}]}),
        encoding="utf-8")
    (d / "registry.yaml").write_text(
        'sources:\n  - id: openai\n    org: "OpenAI — Threat Intelligence"\n    tier: A\n', encoding="utf-8")
    reg.FEEDS_PATH, reg.REGISTRY = d / "feeds.json", d / "registry.yaml"
    obs = reg.tracked_publishers()
    assert reg._norm("Doublethink Lab") in obs and reg._norm("Citizen Lab") in obs, obs
    assert reg._norm("OpenAI — Threat Intelligence") in obs, "registry 結構化條目也要算"

@case
def test_tracked_publishers_excludes_tier_c():
    # 關鍵：環球時報是 tier C（對手方原始素材）——它是行為者，其社評是物證。
    # 把它算成觀察者會讓它永遠無法登錄進名冊。
    d = pathlib.Path(tempfile.mkdtemp())
    (d / "feeds.json").write_text(json.dumps({"sources": []}), encoding="utf-8")
    (d / "registry.yaml").write_text(
        'existing:\n  sources:\n'
        '    - id: dtl\n      org: "Doublethink Lab"\n      tier: A\n      aliases: "台灣民主實驗室"\n'
        '    - id: globaltimes\n      org: "環球時報 Global Times"\n      tier: C\n'
        '      aliases: "環球時報, Global Times"\n', encoding="utf-8")
    reg.FEEDS_PATH, reg.REGISTRY = d / "feeds.json", d / "registry.yaml"
    obs = reg.tracked_publishers()
    assert reg._norm("Doublethink Lab") in obs and reg._norm("台灣民主實驗室") in obs, "別名也要算觀察者"
    assert reg._norm("環球時報") not in obs and reg._norm("Global Times") not in obs, "tier C 不是觀察者"

@case
def test_parse_registry_shape():
    d = pathlib.Path(tempfile.mkdtemp())
    (d / "registry.yaml").write_text(
        'sources:\n  - id: a\n    org: "Org A"\n    tier: A\n    aliases: "AA, 甲"\n'
        '  - id: b\n    org: "Org B"\n    tier: C\n', encoding="utf-8")
    reg.REGISTRY = d / "registry.yaml"
    ents = {e["id"]: e for e in reg.parse_registry()}
    assert set(ents) == {"a", "b"}, ents
    assert ents["a"]["aliases"] == ["AA", "甲"] and ents["b"]["aliases"] == []
    assert ents["b"]["tier"] == "C"

@case
def test_parse_registry_survives_garbage():
    d = pathlib.Path(tempfile.mkdtemp())
    (d / "registry.yaml").write_text("這不是 YAML\n  隨便: 東西\n", encoding="utf-8")
    reg.REGISTRY = d / "registry.yaml"
    assert reg.parse_registry() == [], "解析不了要回空清單，不能炸掉 roster"

@case
def test_tracked_publishers_survives_missing_files():
    d = pathlib.Path(tempfile.mkdtemp())
    reg.FEEDS_PATH, reg.REGISTRY = d / "nope.json", d / "nope.yaml"
    assert reg.tracked_publishers() == set(), "檔案缺失不得炸，回空集合即可"

def main():
    for fn in CASES:
        try:
            fn(); print(f"  ✓ {fn.__name__}")
        except AssertionError as e:
            print(f"  ✗ {fn.__name__}：{e}"); return 1
    print(f"\n全部 {len(CASES)}/{len(CASES)} 綠 ✓（enum/URL/date/FK 驗證、去重、防撞名、保後綴、逐文件 source id）")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
