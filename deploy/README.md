# Deploying N-ATLAS for the kit

The kit talks to any OpenAI-compatible endpoint. N-ATLaS ships as open weights, so you host it yourself.

| Service | Model | Hardware | Endpoint |
|---|---|---|---|
| LLM | `NCAIR1/N-ATLaS` (8B, bf16) | GPU with ~24 GB VRAM recommended | `http://HOST:8000/v1/chat/completions` |
| ASR (Nigerian English) | `NCAIR1/NigerianAccentedEnglish` (Whisper Small) | CPU works; GPU faster | `http://HOST:8001/v1/audio/transcriptions` |

Other ASR checkpoints from the same org (`NCAIR1/Yoruba-ASR`, `Hausa-ASR`, `Igbo-ASR`) work with the same gateway via `ASR_MODEL`.

**Gated models:** `NCAIR1/N-ATLaS` (and possibly the ASR checkpoints) require you to request access on Hugging Face and authenticate with a Read token (`HF_TOKEN`).

## Option 0: Free Google Colab (T4, 4-bit)
Open [`N-ATLAS_Colab.ipynb`](https://colab.research.google.com/github/cutewizzy11/telnora-natlas-kit/blob/main/deploy/N-ATLAS_Colab.ipynb),
choose a T4 GPU runtime and run all cells. It serves the LLM (4-bit) and the ASR model from one server
(`colab_server.py`) behind a Cloudflare tunnel and prints a Base URL and API key for the playground.
Sessions end after a few hours; rerun for a new URL. 4-bit quantisation slightly changes output quality.

## Option 1: Docker Compose (GPU machine)
```
docker compose up --build
```

## Option 2: Run pieces by hand
```
pip install vllm
vllm serve NCAIR1/N-ATLaS --dtype bfloat16 --port 8000

pip install torch torchaudio transformers librosa fastapi "uvicorn[standard]" python-multipart
uvicorn asr_server:app --port 8001      # needs ffmpeg installed
```

## Using it from the kit
The SDK takes one base URL per client. Use two clients if LLM and ASR run on different ports:
```ts
const llm = new Natlas({ baseUrl: "http://HOST:8000/v1" });
const asr = new Natlas({ baseUrl: "http://HOST:8001/v1" });
```
For browser use, put HTTPS in front (Caddy, Cloudflare Tunnel, or your cloud load balancer) and allow CORS.

## Status
Option 0 (Colab, 4-bit) has been run end to end by the Telnora team on a free T4 (chat and streaming verified through
the tunnel and the hosted playground). Options 1 and 2 follow the model cards and vLLM's documented usage and have
not yet been run by the team; report problems via GitHub issues.

Licence reminder: N-ATLaS models use the Open-Source Research and Innovation License (1,000 active end-user
cap without a separate licence). Credit Awarri Technologies and the Federal Ministry of Communications,
Innovation and Digital Economy.
