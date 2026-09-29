# Telnora N-ATLAS Kit

Open-source toolkit for building with **N-ATLAS**, Nigeria's open multilingual LLM.

- `@telnora/natlas` – typed SDK: chat, streaming, speech-to-text, retries, timeouts
- `@telnora/natlas-react` – drop-in `<NatlasChat />` and `<VoiceRecorder />`
- Playground and docs (Next.js app in this repo)

Status: early build for the National AI Innovation Challenge 2026.

## Quickstart
```ts
import { Natlas } from "./natlas"; // copy packages/sdk/src/index.ts as natlas.ts
const natlas = new Natlas({ baseUrl: "https://YOUR-HOST/v1", apiKey: "..." });
const { text } = await natlas.chat([{ role: "user", content: "Hello" }]);
```
N-ATLaS weights are on [Hugging Face](https://huggingface.co/NCAIR1/N-ATLaS). Serve them behind an
OpenAI-compatible API (e.g. vLLM) or use the official endpoint if you have credentials.

The playground's "Demo mode" uses a mock server and returns simulated text, not model output.

Python (no dependencies): `pip install "git+https://github.com/cutewizzy11/telnora-natlas-kit#subdirectory=packages/python"`

Serving the model and ASR yourself: see [deploy/README.md](deploy/README.md).

## Develop
```
npm install
npm run dev
```

## Licence and attribution
This toolkit is MIT licensed. N-ATLaS is released under the Open-Source Research and Innovation License
(organisations under 1,000 active end-users; larger use needs a separate licence). Credit: Awarri
Technologies and the Federal Ministry of Communications, Innovation and Digital Economy.
See [CONTRIBUTING.md](CONTRIBUTING.md).
