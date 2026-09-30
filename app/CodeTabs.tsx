"use client";
import { useState } from "react";

const TABS = [
  {
    id: "ts",
    label: "TypeScript",
    code: `import { Natlas } from "./natlas";

const natlas = new Natlas({
  baseUrl: "https://YOUR-HOST/v1",
  apiKey: process.env.NATLAS_KEY,
});

const messages = [
  { role: "system", content: "You are a maths tutor." },
  { role: "user", content: "Explain fractions with suya." },
];

// stream the answer token by token
for await (const t of natlas.stream(messages))
  process.stdout.write(t);`,
  },
  {
    id: "py",
    label: "Python",
    code: `from natlas import Natlas

client = Natlas("https://YOUR-HOST/v1", api_key="...")

reply = client.chat([
    {"role": "system", "content": "You are a maths tutor."},
    {"role": "user", "content": "Explain fractions with suya."},
])
print(reply)`,
  },
  {
    id: "react",
    label: "React",
    code: `import { NatlasChat } from "./natlas-react";

export default function Tutor() {
  return (
    <NatlasChat
      client={client}
      asrClient={asr}   // hold to talk, get a transcript
      system="You are a maths tutor."
    />
  );
}`,
  },
];

export default function CodeTabs() {
  const [tab, setTab] = useState("ts");
  const [copied, setCopied] = useState(false);
  const cur = TABS.find((t) => t.id === tab)!;
  return (
    <div className="codewin">
      <div className="codebar">
        <i /><i /><i />
        <div className="codetabs">
          {TABS.map((t) => (
            <button key={t.id} className={t.id === tab ? "on" : ""} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
        <button
          className="copy"
          onClick={() => {
            navigator.clipboard?.writeText(cur.code).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
        >
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre>{cur.code}</pre>
    </div>
  );
}
