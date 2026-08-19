#!/usr/bin/env python3
"""來源 URL 比對鍵：追蹤參數不得讓同一篇報告被判成新來源，語意參數不得被剝掉。"""
import urlnorm as U

K = U.source_key
# ① Medium 追蹤參數（實際 feed 抓到的形狀）→ 與乾淨連結同鍵
base = "https://medium.com/doublethinklab/the-rise-of-ai-in-prc-influence-operations"
assert K(base + "?source=rss----abcdef123456---4") == K(base)
assert K(base + "?utm_source=rss&utm_medium=feed&utm_campaign=x") == K(base)
assert K(base) == "medium.com/doublethinklab/the-rise-of-ai-in-prc-influence-operations"

# ② scheme／www／尾斜線／fragment／預設埠 都不該造成分裂
assert K("http://www.factlink.tw/p/x/") == K("https://factlink.tw/p/x")
assert K("https://factlink.tw:443/p/x#section-2") == K("https://factlink.tw/p/x")
assert K("https://FactLink.TW/p/x") == K("https://factlink.tw/p/x")

# ③ 語意參數必須保留（否則會把不同文章併成同一筆）
assert K("https://example.org/read?id=12") != K("https://example.org/read?id=13")
assert K("https://example.org/read?p=1&utm_source=x") == K("https://example.org/read?p=1")
assert K("https://example.org/a?b=1&a=2") == K("https://example.org/a?a=2&b=1")   # query 順序無關

# ④ path 大小寫敏感（不同資源不可併）
assert K("https://example.org/Report") != K("https://example.org/report")

# ⑤ 邊界：空值、非 http(s) 原樣回傳，不得炸
assert K("") == "" and K(None) == ""
assert K("mailto:a@b.c") == "mailto:a@b.c"
assert K("  https://example.org/a/  ") == "example.org/a"

# ⑥ source id 的雜湊要跟著正規化，否則同篇報告會生出不同 id
assert U.url_hash(base + "?source=rss----x") == U.url_hash(base)
assert U.url_hash("https://example.org/a") != U.url_hash("https://example.org/b")

# ⑦ 索引：先登錄者優先，不被帶追蹤參數的後者覆蓋
idx = U.index_by_url([{"url": base, "id": "src-first"},
                      {"url": base + "?source=rss----y", "id": "src-dup"}])
assert idx[K(base)] == "src-first", idx

print("url 正規化：通過（追蹤參數／scheme／www／尾斜線／語意參數保留／id 雜湊一致）")
