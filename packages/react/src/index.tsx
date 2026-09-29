"use client";
import { useRef, useState } from "react";
import type { Natlas, ChatMessage } from "@telnora/natlas";

/** Records a voice note and returns the N-ATLAS transcript. */
export function VoiceRecorder({
  client,
  language,
  onTranscript,
  onError,
}: {
  client: Natlas;
  language?: string;
  onTranscript: (text: string) => void;
  onError?: (e: Error) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      chunks.current = [];
      r.ondataavailable = (e) => chunks.current.push(e.data);
      r.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setBusy(true);
        try {
          const { text } = await client.transcribe(
            new Blob(chunks.current, { type: "audio/webm" }),
            { language }
          );
          onTranscript(text);
        } catch (e) {
          onError?.(e as Error);
        } finally {
          setBusy(false);
        }
      };
      r.start();
      rec.current = r;
      setRecording(true);
    } catch (e) {
      onError?.(e as Error);
    }
  }

  function stop() {
    rec.current?.stop();
    setRecording(false);
  }

  return (
    <button
      type="button"
      className={`btn ${recording ? "btn-rec" : ""}`}
      disabled={busy}
      onClick={recording ? stop : start}
    >
      {busy ? "Transcribing…" : recording ? "■ Stop" : "🎙 Record"}
    </button>
  );
}

/** Minimal streaming chat box wired to an N-ATLAS client. */
export function NatlasChat({
  client,
  asrClient,
  system,
  placeholder = "Ask something…",
  voice = true,
  language,
}: {
  client: Natlas;
  /** Separate client for speech-to-text when ASR is hosted apart from the LLM. */
  asrClient?: Natlas;
  system?: string;
  placeholder?: string;
  voice?: boolean;
  language?: string;
}) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send(text: string) {
    if (!text.trim() || busy) return;
    setError("");
    const next: ChatMessage[] = [...msgs, { role: "user", content: text }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const payload = system ? [{ role: "system" as const, content: system }, ...next] : next;
      let acc = "";
      for await (const d of client.stream(payload)) {
        acc += d;
        setMsgs([...next, { role: "assistant", content: acc }]);
      }
    } catch (e) {
      setError((e as Error).message);
      setMsgs(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="chat">
      <div className="chat-log">
        {msgs.length === 0 && <p className="muted">No messages yet.</p>}
        {msgs.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.content || "…"}
          </div>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
        />
        {voice && (
          <VoiceRecorder
            client={asrClient ?? client}
            language={language}
            onTranscript={(t) => setInput(t)}
            onError={(e) => setError(e.message)}
          />
        )}
        <button className="btn btn-primary" disabled={busy}>
          Send
        </button>
      </form>
    </div>
  );
}
