import Link from "next/link";
import CodeTabs from "./CodeTabs";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-in">
          <div>
            <p className="eyebrow">For developers building on N-ATLAS</p>
            <h1>
              Put Nigeria&apos;s own language model in your app <em>before lunch.</em>
            </h1>
            <p className="lead">
              A typed SDK in TypeScript and Python, drop-in React chat and voice components, and a playground to try it
              all. Open source, built by a Nigerian product agency that ships for startups every week.
            </p>
            <div className="row">
              <Link className="btn btn-primary" href="/tutor">Try the tutor demo</Link>
              <Link className="btn" href="/docs">Quickstart</Link>
              <Link className="btn" href="/playground">Playground</Link>
            </div>
            <div className="greet" aria-label="Greetings in the languages N-ATLaS supports">
              <span>Bawo ni <b>Yorùbá</b></span>
              <span>Sannu <b>Hausa</b></span>
              <span>Nnọọ <b>Igbo</b></span>
              <span>How far <b>English</b></span>
            </div>
          </div>
          <CodeTabs />
        </div>
      </section>

      <div className="wrap">
        <p className="eyebrow">What&apos;s in the box</p>
        <h2 style={{ marginTop: 0 }}>Everything between &ldquo;I have the weights&rdquo; and &ldquo;my users are chatting&rdquo;.</h2>
        <div className="grid">
          <div className="card"><span className="tag">01 · npm</span><h3>TypeScript SDK</h3><p>Chat, streaming, speech-to-text. Retries with backoff, timeouts, abort, typed errors. One file, zero dependencies.</p></div>
          <div className="card"><span className="tag">02 · pip</span><h3>Python SDK</h3><p>The same API for your data scripts and back ends. Standard library only, so it installs anywhere.</p></div>
          <div className="card"><span className="tag">03 · react</span><h3>Chat and voice</h3><p><code>&lt;NatlasChat /&gt;</code> and a voice-note recorder that returns a transcript from N-ATLAS ASR.</p></div>
          <div className="card"><span className="tag">04 · deploy</span><h3>Run it yourself</h3><p>A free Colab notebook and Docker recipes for the model and the speech gateway, with a secured public URL.</p></div>
        </div>
      </div>

      <div className="band">
        <div className="wrap">
          <p className="eyebrow">Zero to first call</p>
          <h2 style={{ marginTop: 0 }}>Four steps, no yak-shaving.</h2>
          <ol className="steps">
            <li><b>Serve the model</b><span>Open the Colab notebook, press run, get a URL and key.</span></li>
            <li><b>Add the SDK</b><span>Copy one file, or <code>pip install</code> from git.</span></li>
            <li><b>Make a call</b><span>Five lines to your first N-ATLAS reply.</span></li>
            <li><b>Drop in the UI</b><span>Chat box and microphone, styled your way.</span></li>
          </ol>
          <Link className="btn btn-primary" href="/docs">Read the quickstart</Link>
        </div>
      </div>

      <div className="wrap">
        <p className="eyebrow">Straight talk</p>
        <h2 style={{ marginTop: 0 }}>What is tested, and what is not yet.</h2>
        <ul className="check">
          <li><b>Tested:</b> 12 unit tests across both SDKs (retries, streaming, auth, transcription).</li>
          <li><b>Tested:</b> N-ATLaS 4-bit on a free Colab T4, streamed through a secured tunnel into the hosted playground.</li>
          <li className="todo"><b>In progress:</b> external developer beta tests, and voice validation with real recordings.</li>
          <li className="no"><b>Not yet:</b> npm and PyPI packages; Docker and vLLM recipes run on real hardware.</li>
          <li className="no"><b>Know this:</b> the model can state invented specifics with confidence. Demo mode here is a labelled mock, not model output.</li>
        </ul>
      </div>
    </>
  );
}
