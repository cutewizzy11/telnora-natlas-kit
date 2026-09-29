"""OpenAI-compatible /v1/audio/transcriptions server for N-ATLAS ASR models.

Run:  uvicorn asr_server:app --host 0.0.0.0 --port 8001
Env:  ASR_MODEL (default NCAIR1/NigerianAccentedEnglish; also NCAIR1/Yoruba-ASR, Hausa-ASR, Igbo-ASR)
Needs ffmpeg on PATH to decode browser webm/opus recordings.
"""
import os
import tempfile

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline

MODEL = os.getenv("ASR_MODEL", "NCAIR1/NigerianAccentedEnglish")
asr = pipeline("automatic-speech-recognition", model=MODEL, chunk_length_s=30)

app = FastAPI(title="N-ATLAS ASR gateway")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.get("/health")
def health():
    return {"ok": True, "model": MODEL}


@app.post("/v1/audio/transcriptions")
async def transcribe(file: UploadFile = File(...), model: str = Form(None), language: str = Form(None)):
    suffix = os.path.splitext(file.filename or "audio.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await file.read())
        path = tmp.name
    try:
        text = asr(path)["text"].strip()
    finally:
        os.unlink(path)
    return {"text": text}
