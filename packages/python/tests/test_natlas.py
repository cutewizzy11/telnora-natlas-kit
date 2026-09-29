import json
import threading
import unittest
from http.server import BaseHTTPRequestHandler, HTTPServer

from natlas import Natlas, NatlasError


class Handler(BaseHTTPRequestHandler):
    fail_first = 0
    seen = {}

    def log_message(self, *a):
        pass

    def do_POST(self):
        n = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(n)
        Handler.seen = {"path": self.path, "auth": self.headers.get("Authorization"), "body": body}
        if "/bad/" in self.path:
            self.send_response(400); self.end_headers(); self.wfile.write(b"nope"); return
        if Handler.fail_first > 0:
            Handler.fail_first -= 1
            self.send_response(500); self.end_headers(); return
        if self.path.endswith("/audio/transcriptions"):
            out = json.dumps({"text": "transcript"}).encode()
            self.send_response(200); self.end_headers(); self.wfile.write(out); return
        payload = json.loads(body)
        if payload.get("stream"):
            self.send_response(200); self.send_header("Content-Type", "text/event-stream"); self.end_headers()
            for w in ["He", "llo"]:
                self.wfile.write(f'data: {json.dumps({"choices":[{"delta":{"content":w}}]})}\n\n'.encode())
            self.wfile.write(b"data: [DONE]\n\n"); return
        out = json.dumps({"choices": [{"message": {"content": "hello"}}]}).encode()
        self.send_response(200); self.end_headers(); self.wfile.write(out)


class Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.srv = HTTPServer(("127.0.0.1", 0), Handler)
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()
        cls.url = f"http://127.0.0.1:{cls.srv.server_port}/v1"

    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown()

    def test_chat_and_auth(self):
        c = Natlas(self.url, api_key="k")
        self.assertEqual(c.chat([{"role": "user", "content": "hi"}]), "hello")
        self.assertEqual(Handler.seen["auth"], "Bearer k")

    def test_retry_on_500(self):
        Handler.fail_first = 1
        c = Natlas(self.url)
        self.assertEqual(c.chat([{"role": "user", "content": "hi"}]), "hello")

    def test_400_raises_without_retry(self):
        c = Natlas(self.url + "/bad")
        with self.assertRaises(NatlasError) as cm:
            c.chat([{"role": "user", "content": "hi"}])
        self.assertEqual(cm.exception.status, 400)

    def test_stream(self):
        c = Natlas(self.url)
        self.assertEqual("".join(c.stream([{"role": "user", "content": "hi"}])), "Hello")

    def test_transcribe(self):
        c = Natlas(self.url)
        self.assertEqual(c.transcribe(b"abc", language="en"), "transcript")

    def test_requires_base_url(self):
        with self.assertRaises(NatlasError):
            Natlas("")


if __name__ == "__main__":
    unittest.main()
