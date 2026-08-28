#!/usr/bin/env python3
"""本機預覽伺服器：和 `python -m http.server` 一樣，但一律送 no-store。

`http.server` 只送 Last-Modified、不送 Cache-Control，瀏覽器於是用啟發式
快取（依 Last-Modified 的年齡推算新鮮期）判定舊檔還新鮮而不回頭問伺服器。
data/db.js 每次 curate 發布都會變，但檔案本身「看起來很舊」，結果就是
發布完打開記錄簿看到的還是上一版——資料對、畫面錯，最難查的那種。

用法：python3 serve.py [port]（預設 8062）
"""
import functools, http.server, socketserver, sys, pathlib

class NoStore(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8062
    root = str(pathlib.Path(__file__).resolve().parent)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", port),
                                functools.partial(NoStore, directory=root)) as httpd:
        print(f"NetWeaver 記錄簿：http://localhost:{port}/index.html（no-store）")
        httpd.serve_forever()
