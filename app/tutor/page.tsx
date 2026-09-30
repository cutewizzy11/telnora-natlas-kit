"use client";
import { useRef, useState } from "react";
import { VoiceRecorder } from "@telnora/natlas-react";
import { useNatlas } from "../lib/useNatlas";

const SUBJECTS = ["Mathematics", "English Language", "Basic Science", "Civic Education", "Computer Studies"];
const LEVELS = ["Primary 4-6", "JSS 1-3", "SSS 1-3"];
type Mode = "explain" | "quiz" | "check";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "explain", label: "Explain a topic", hint: "e.g. how photosynthesis works" },
  { id: "quiz", label: "Quiz me", hint: "e.g. fractions" },
  { id: "check", label: "Check my answer", hint: "e.g. Q: 3/4 + 1/8  My answer: 7/8" },
];

function systemPrompt(subject: string, level: string, mode: Mode) {
  const base = `You are a patient, encouraging tutor for Nigerian students. Subject: ${subject}. Level: ${level} (Nigerian curriculum). Use simple English and local examples (naira, markets, football, familiar foods). Keep answers short and clear. If you are not sure of a fact, say so instead of guessing.`;
  if (mode === "explain") return `${base} Explain the topic step by step with one worked example, then ask one short question to check understanding.`;
  if (mode === "quiz") return `${base} Write 3 multiple-choice questions (A-D) on the topic, without answers. End with: "Reply with your answers and I will mark them."`;
  return `${base} The student gives a question and their answer. Say whether it is correct, show the correct working, and explain any mistake kindly.`;
}

export default function Tutor() {
  const n = useNatlas();
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [level, setLevel] = useState(LEVELS[1]);
  const [mode, setMode] = useState<Mode>("explain");
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ctrl = useRef<AbortController | null>(null);

  async function ask() {
    if (!n.client || !input.trim() || busy) return;
    setBusy(true);
    setError("");
    setOut("");
    ctrl.current = new AbortController();
    try {
      let acc = "";
      for await (const d of n.client.stream(
        [
          { role: "system", content: systemPrompt(subject, level, mode) },
          { role: "user", content: input },
        ],
        { signal: ctrl.current.signal, maxTokens: 600 }
      )) {
        acc += d;
        setOut(acc);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const current = MODES.find((m) => m.id === mode)!;

  return (
    <div className="wrap">
      <h1>Ask the tutor</h1>
      <p className="lead">A sample EdTech app built with the Telnora N-ATLAS Kit: about 100 lines using the SDK and voice component.</p>

      <details className="card" open={!n.client || (n.mode === "custom" && !n.baseUrl)}>
        <summary>Model connection ({n.mode === "demo" ? "demo mode" : "my endpoint"})</summary>
        <div className="row">
          <label><input type="radio" checked={n.mode === "demo"} onChange={() => n.setMode("demo")} /> Demo mode (mock)</label>
          <label><input type="radio" checked={n.mode === "custom"} onChange={() => n.setMode("custom")} /> My N-ATLAS endpoint</label>
        </div>
        {n.mode === "demo" ? (
          <p className="notice">Demo mode returns simulated text, not N-ATLAS output. Connect an endpoint for real answers.</p>
        ) : (
          <div className="form">
            <label>Base URL<input value={n.baseUrl} onChange={(e) => n.setBaseUrl(e.target.value)} placeholder="https://your-host/v1" /></label>
            <label>ASR base URL (optional, for voice)<input value={n.asrUrl} onChange={(e) => n.setAsrUrl(e.target.value)} placeholder="same as above if one server" /></label>
            <label>API key (kept only in this tab)<input type="password" value={n.apiKey} onChange={(e) => n.setApiKey(e.target.value)} /></label>
          </div>
        )}
      </details>

      <div className="row" style={{ marginTop: 16 }}>
        <select className="btn" value={subject} onChange={(e) => setSubject(e.target.value)}>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select>
        <select className="btn" value={level} onChange={(e) => setLevel(e.target.value)}>{LEVELS.map((s) => <option key={s}>{s}</option>)}</select>
        {MODES.map((m) => (
          <button key={m.id} className={`btn ${mode === m.id ? "btn-primary" : ""}`} onClick={() => setMode(m.id)}>{m.label}</button>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder={current.hint}
        />
        {n.client && (
          <VoiceRecorder client={n.asrClient ?? n.client} language="en" onTranscript={setInput} onError={(e) => setError(e.message)} />
        )}
        {busy ? (
          <button className="btn" onClick={() => ctrl.current?.abort()}>Stop</button>
        ) : (
          <button className="btn btn-primary" onClick={ask} disabled={!n.client || !input.trim()}>Ask</button>
        )}
      </div>

      {error && <p className="error">{error}</p>}
      <div className="chat" style={{ marginTop: 12 }}>
        <div className="bubble assistant" style={{ maxWidth: "100%", minHeight: 80 }}>{out || (busy ? "…" : "The tutor's answer appears here.")}</div>
      </div>
      <p className="muted">AI tutors can make mistakes. Check important answers with your teacher or textbook.</p>
    </div>
  );
}
