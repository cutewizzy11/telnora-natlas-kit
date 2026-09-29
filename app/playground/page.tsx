"use client";
import { useEffect, useMemo, useState } from "react";
import { Natlas } from "@telnora/natlas";
import { NatlasChat } from "@telnora/natlas-react";

const DEMO = "demo";

export default function Playground() {
  const [mode, setMode] = useState<"demo" | "custom">("demo");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [asrUrl, setAsrUrl] = useState("");
  const [model, setModel] = useState("NCAIR1/N-ATLaS");
  const [system, setSystem] = useState("You are a helpful assistant for Nigerian users. Keep answers short and clear.");
  const [origin, setOrigin] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  const effectiveUrl = mode === "demo" ? `${origin}/api/mock/v1` : baseUrl;
  const client = useMemo(
    () => (effectiveUrl ? new Natlas({ baseUrl: effectiveUrl, apiKey: apiKey || undefined, model }) : null),
    [effectiveUrl, apiKey, model]
  );

  const asrClient = useMemo(
    () => (mode === "custom" && asrUrl ? new Natlas({ baseUrl: asrUrl, apiKey: apiKey || undefined }) : undefined),
    [mode, asrUrl, apiKey]
  );

  const snippet = `import { Natlas } from "@telnora/natlas";

const natlas = new Natlas({
  baseUrl: "${mode === "demo" ? "https://YOUR-N-ATLAS-HOST/v1" : baseUrl || "https://YOUR-N-ATLAS-HOST/v1"}",
  apiKey: process.env.NATLAS_API_KEY,
  model: "${model}",
});

const { text } = await natlas.chat([
  { role: "system", content: ${JSON.stringify(system)} },
  { role: "user", content: "Hello!" },
]);
console.log(text);`;

  return (
    <div className="wrap">
      <h1>Playground</h1>
      <div className="row">
        <label><input type="radio" checked={mode === "demo"} onChange={() => setMode("demo")} /> Demo mode (mock responses)</label>
        <label><input type="radio" checked={mode === "custom"} onChange={() => setMode("custom")} /> My N-ATLAS endpoint</label>
      </div>
      {mode === "demo" ? (
        <p className="notice">
          Demo mode returns <b>simulated</b> replies from a mock server so you can try the SDK and UI without a GPU.
          These are not N-ATLAS model outputs. Switch to your own endpoint for real responses.
        </p>
      ) : (
        <div className="form">
          <label>Base URL (OpenAI-compatible, must allow CORS)
            <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://your-host/v1" />
          </label>
          <label>ASR base URL (optional, for voice notes; falls back to the URL above)
            <input value={asrUrl} onChange={(e) => setAsrUrl(e.target.value)} placeholder="https://your-host:8001/v1" />
          </label>
          <label>API key (optional; stays in your browser)
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          </label>
          <label>Model
            <input value={model} onChange={(e) => setModel(e.target.value)} />
          </label>
        </div>
      )}
      <label className="form">System prompt
        <textarea rows={2} value={system} onChange={(e) => setSystem(e.target.value)} />
      </label>
      {client ? <NatlasChat client={client} asrClient={asrClient} system={system} language="en" /> : <p className="muted">Enter an endpoint URL to start.</p>}
      <h2>Copy the code</h2>
      <pre className="code">{snippet}</pre>
    </div>
  );
}
