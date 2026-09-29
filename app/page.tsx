import Link from "next/link";

export default function Home() {
  return (
    <div className="wrap">
      <h1>Build with N-ATLAS in minutes.</h1>
      <p className="lead">
        An open-source TypeScript SDK, drop-in React components and a playground for developers building on
        N-ATLAS, Nigeria&apos;s open multilingual language model.
      </p>
      <div className="row">
        <Link className="btn btn-primary" href="/playground">Open the playground</Link>
        <Link className="btn" href="/docs">Read the quickstart</Link>
      </div>
      <div className="grid">
        <div className="card"><h3>SDK</h3><p>Typed chat, streaming and speech-to-text with retries, timeouts and clear errors.</p></div>
        <div className="card"><h3>React components</h3><p>A chat widget and a voice-note recorder you can drop into any web app.</p></div>
        <div className="card"><h3>Playground</h3><p>Try prompts against any N-ATLAS endpoint and copy the working code.</p></div>
      </div>
      <p className="muted">Status: early build for the National AI Innovation Challenge 2026.</p>
    </div>
  );
}
