"""Single-GPU (Colab free T4) OpenAI-compatible server for N-ATLAS.

Serves NCAIR1/N-ATLaS (4-bit) at /v1/chat/completions and NCAIR1/NigerianAccentedEnglish at
/v1/audio/transcriptions, with CORS and optional bearer auth (env NATLAS_API_KEY).

    uvicorn colab_server:app --host 0.0.0.0 --port 8000
"""
import json
import os
import tempfile
import threading
import time
import uuid
from typing import List, Optional

import torch
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TextIteratorStreamer,
    pipeline,
)

LLM_ID = os.getenv("LLM_MODEL", "NCAIR1/N-ATLaS")
ASR_ID = os.getenv("ASR_MODEL", "NCAIR1/NigerianAccentedEnglish")
API_KEY = os.getenv("NATLAS_API_KEY")

print(f"Loading {LLM_ID} in 4-bit ...", flush=True)
tokenizer = AutoTokenizer.from_pretrained(LLM_ID)
model = AutoModelForCausalLM.from_pretrained(
    LLM_ID,
    quantization_config=BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
    ),
    device_map="auto",
)
model.eval()

print(f"Loading {ASR_ID} ...", flush=True)
asr = pipeline(
    "automatic-speech-recognition",
    model=ASR_ID,
    chunk_length_s=30,
    device=0 if torch.cuda.is_available() else -1,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
)
print("Ready.", flush=True)

gpu_lock = threading.Lock()  # one generation at a time on a single T4


def check_auth(authorization: Optional[str] = Header(None)):
    if API_KEY and authorization != f"Bearer {API_KEY}":
        raise HTTPException(status_code=401, detail="invalid or missing API key")


app = FastAPI(title="N-ATLAS Colab server")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: Optional[str] = None
    messages: List[Message]
    stream: bool = False
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 512
    repetition_penalty: Optional[float] = 1.1


def build_inputs(req: ChatRequest):
    ids = tokenizer.apply_chat_template(
        [m.dict() for m in req.messages], add_generation_prompt=True, return_tensors="pt"
    ).to(model.device)
    kwargs = dict(
        input_ids=ids,
        attention_mask=torch.ones_like(ids),
        max_new_tokens=min(req.max_tokens or 512, 1024),
        repetition_penalty=req.repetition_penalty or 1.0,
        pad_token_id=tokenizer.eos_token_id,
    )
    t = req.temperature if req.temperature is not None else 0.7
    if t > 0:
        kwargs.update(do_sample=True, temperature=t)
    else:
        kwargs.update(do_sample=False)
    return ids, kwargs


@app.get("/health")
def health():
    return {"ok": True, "llm": LLM_ID, "asr": ASR_ID, "gpu": torch.cuda.is_available()}


@app.get("/v1/models", dependencies=[Depends(check_auth)])
def models():
    return {"data": [{"id": LLM_ID, "object": "model"}]}


@app.post("/v1/chat/completions", dependencies=[Depends(check_auth)])
def chat(req: ChatRequest):
    cid = f"chatcmpl-{uuid.uuid4().hex[:12]}"
    ids, kwargs = build_inputs(req)

    if not req.stream:
        with gpu_lock, torch.no_grad():
            out = model.generate(**kwargs)
        text = tokenizer.decode(out[0][ids.shape[1]:], skip_special_tokens=True)
        return {
            "id": cid,
            "object": "chat.completion",
            "created": int(time.time()),
            "model": LLM_ID,
            "choices": [{"index": 0, "message": {"role": "assistant", "content": text}, "finish_reason": "stop"}],
        }

    streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)

    def run():
        with gpu_lock, torch.no_grad():
            model.generate(streamer=streamer, **kwargs)

    threading.Thread(target=run, daemon=True).start()

    def sse():
        for piece in streamer:
            if piece:
                chunk = {"id": cid, "object": "chat.completion.chunk", "choices": [{"index": 0, "delta": {"content": piece}}]}
                yield f"data: {json.dumps(chunk)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(sse(), media_type="text/event-stream", headers={"Cache-Control": "no-cache"})


@app.post("/v1/audio/transcriptions", dependencies=[Depends(check_auth)])
async def transcribe(file: UploadFile = File(...), model: str = Form(None), language: str = Form(None)):
    suffix = os.path.splitext(file.filename or "audio.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await file.read())
        path = tmp.name
    try:
        with gpu_lock:
            text = asr(path)["text"].strip()
    finally:
        os.unlink(path)
    return {"text": text}
