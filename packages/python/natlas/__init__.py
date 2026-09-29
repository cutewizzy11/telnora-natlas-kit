"""Telnora N-ATLAS client: chat, streaming and speech-to-text. Standard library only."""
from __future__ import annotations

import json
import time
import urllib.error
import urllib.request
import uuid
from typing import Iterator, Optional

__all__ = ["Natlas", "NatlasError"]
__version__ = "0.1.0"


class NatlasError(Exception):
    def __init__(self, message: str, status: Optional[int] = None, body: str = ""):
        super().__init__(message)
        self.status = status
        self.body = body


class Natlas:
    """Client for an OpenAI-compatible N-ATLAS endpoint (e.g. vLLM serving NCAIR1/N-ATLaS)."""

    def __init__(self, base_url: str, api_key: Optional[str] = None,
                 model: str = "NCAIR1/N-ATLaS", timeout: float = 60.0, max_retries: int = 2):
        if not base_url:
            raise NatlasError("base_url is required")
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model = model
        self.timeout = timeout
        self.max_retries = max_retries

    def _headers(self, content_type: Optional[str] = "application/json") -> dict:
        h = {}
        if content_type:
            h["Content-Type"] = content_type
        if self.api_key:
            h["Authorization"] = f"Bearer {self.api_key}"
        return h

    def _open(self, path: str, data: bytes, headers: dict):
        last: Exception = NatlasError("request failed")
        for attempt in range(self.max_retries + 1):
            req = urllib.request.Request(self.base_url + path, data=data, headers=headers, method="POST")
            try:
                return urllib.request.urlopen(req, timeout=self.timeout)
            except urllib.error.HTTPError as e:
                body = e.read().decode("utf-8", "replace")
                last = NatlasError(f"N-ATLAS request failed ({e.code})", e.code, body)
                if not (e.code == 429 or e.code >= 500) or attempt == self.max_retries:
                    raise last
            except (urllib.error.URLError, TimeoutError) as e:
                last = NatlasError(f"Network error: {e}")
                if attempt == self.max_retries:
                    raise last
            time.sleep(0.3 * 2 ** attempt)
        raise last

    def _chat_payload(self, messages, stream: bool, **opts) -> bytes:
        payload = {"model": opts.get("model", self.model), "messages": messages, "stream": stream}
        if "temperature" in opts:
            payload["temperature"] = opts["temperature"]
        if "max_tokens" in opts:
            payload["max_tokens"] = opts["max_tokens"]
        if "repetition_penalty" in opts:
            payload["repetition_penalty"] = opts["repetition_penalty"]
        return json.dumps(payload).encode()

    def chat(self, messages: list, **opts) -> str:
        """One-shot chat completion; returns the reply text."""
        with self._open("/chat/completions", self._chat_payload(messages, False, **opts), self._headers()) as r:
            data = json.loads(r.read().decode())
        return (data.get("choices") or [{}])[0].get("message", {}).get("content", "")

    def stream(self, messages: list, **opts) -> Iterator[str]:
        """Streaming chat completion; yields text deltas."""
        with self._open("/chat/completions", self._chat_payload(messages, True, **opts), self._headers()) as r:
            for raw in r:
                line = raw.decode("utf-8", "replace").strip()
                if not line.startswith("data:"):
                    continue
                data = line[5:].strip()
                if data == "[DONE]":
                    return
                try:
                    delta = json.loads(data)["choices"][0]["delta"].get("content")
                except (ValueError, KeyError, IndexError):
                    continue
                if delta:
                    yield delta

    def transcribe(self, audio: bytes, filename: str = "audio.webm",
                   language: Optional[str] = None, model: str = "N-ATLaS-ASR") -> str:
        """Speech-to-text via an OpenAI-compatible /audio/transcriptions endpoint."""
        boundary = uuid.uuid4().hex
        parts = []

        def field(name: str, value: str):
            parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode())

        field("model", model)
        if language:
            field("language", language)
        parts.append(
            (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{filename}"\r\n'
             "Content-Type: application/octet-stream\r\n\r\n").encode() + audio + b"\r\n"
        )
        parts.append(f"--{boundary}--\r\n".encode())
        headers = self._headers(f"multipart/form-data; boundary={boundary}")
        with self._open("/audio/transcriptions", b"".join(parts), headers) as r:
            return json.loads(r.read().decode()).get("text", "")
