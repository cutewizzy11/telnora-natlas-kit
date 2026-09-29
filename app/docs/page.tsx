const install = `# JavaScript / TypeScript: one dependency-free file, copy it into your project
curl -o natlas.ts https://raw.githubusercontent.com/cutewizzy11/telnora-natlas-kit/main/packages/sdk/src/index.ts
# (npm package coming; install name will be @telnora/natlas)

# Python (zero dependencies)
pip install "git+https://github.com/cutewizzy11/telnora-natlas-kit#subdirectory=packages/python"`;
const chat = `import { Natlas } from "./natlas";

const natlas = new Natlas({ baseUrl: "https://YOUR-HOST/v1", apiKey: "..." });

// one-shot
const { text } = await natlas.chat([{ role: "user", content: "Hello" }]);

// streaming
for await (const chunk of natlas.stream([{ role: "user", content: "Hello" }])) {
  process.stdout.write(chunk);
}

// speech-to-text
const { text: transcript } = await natlas.transcribe(audioBlob, { language: "en" });`;
const react = `// copy packages/react/src/index.tsx into your project as natlas-react.tsx
import { Natlas } from "./natlas";
import { NatlasChat } from "./natlas-react";

const client = new Natlas({ baseUrl: "https://YOUR-HOST/v1" });

export default function Assistant() {
  return <NatlasChat client={client} system="You are a helpful tutor." />;
}`;
const serve = `pip install vllm
vllm serve NCAIR1/N-ATLaS --dtype bfloat16 --port 8000
# then use baseUrl: "http://localhost:8000/v1"`;

export default function Docs() {
  return (
    <div className="wrap">
      <h1>Quickstart</h1>
      <p className="lead">From zero to a working N-ATLAS call in four steps.</p>

      <h2>1. Get an N-ATLAS endpoint</h2>
      <p>
        N-ATLaS is distributed as open weights on{" "}
        <a href="https://huggingface.co/NCAIR1/N-ATLaS">Hugging Face</a>. Serve it behind an OpenAI-compatible
        API, for example with vLLM on a GPU machine (or use the official endpoint if you have credentials).
        For voice notes, the repo&apos;s <code>deploy/</code> folder includes a gateway for the
        <code>NCAIR1/NigerianAccentedEnglish</code> ASR model and a Docker Compose file for both services:
      </p>
      <pre className="code">{serve}</pre>

      <h2>2. Install the SDK</h2>
      <pre className="code">{install}</pre>

      <h2>3. Call the model</h2>
      <pre className="code">{chat}</pre>

      <h2>4. Add a chat + voice UI (React)</h2>
      <pre className="code">{react}</pre>

      <h2>Notes</h2>
      <ul>
        <li>Your endpoint must allow CORS if you call it from the browser, or call it from your server.</li>
        <li>Speech-to-text expects an OpenAI-compatible <code>/audio/transcriptions</code> route.</li>
        <li>
          Licence: N-ATLaS uses the Open-Source Research and Innovation License (under 1,000 active end-users
          without a separate licence). Credit &quot;Awarri Technologies and the Federal Ministry of
          Communications, Innovation and Digital Economy&quot;.
        </li>
      </ul>
    </div>
  );
}
