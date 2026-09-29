import { test } from "node:test";
import assert from "node:assert/strict";
import { Natlas, NatlasError } from "../src/index.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const ok = { choices: [{ message: { content: "hello" } }] };

test("chat returns text and sends auth + model", async () => {
  let seen: { url: string; init: RequestInit } | undefined;
  const client = new Natlas({
    baseUrl: "http://x/v1/",
    apiKey: "k",
    model: "m",
    fetch: (async (url: string, init: RequestInit) => {
      seen = { url, init };
      return json(ok);
    }) as unknown as typeof fetch,
  });
  const r = await client.chat([{ role: "user", content: "hi" }]);
  assert.equal(r.text, "hello");
  assert.equal(seen!.url, "http://x/v1/chat/completions");
  assert.equal((seen!.init.headers as Record<string, string>).Authorization, "Bearer k");
  assert.equal(JSON.parse(seen!.init.body as string).model, "m");
});

test("retries on 500 then succeeds", async () => {
  let calls = 0;
  const client = new Natlas({
    baseUrl: "http://x/v1",
    maxRetries: 2,
    fetch: (async () => (++calls < 2 ? json({}, 500) : json(ok))) as unknown as typeof fetch,
  });
  assert.equal((await client.chat([{ role: "user", content: "hi" }])).text, "hello");
  assert.equal(calls, 2);
});

test("does not retry on 400 and throws NatlasError with status", async () => {
  let calls = 0;
  const client = new Natlas({
    baseUrl: "http://x/v1",
    fetch: (async () => (calls++, json({ error: "bad" }, 400))) as unknown as typeof fetch,
  });
  await assert.rejects(
    () => client.chat([{ role: "user", content: "hi" }]),
    (e: unknown) => e instanceof NatlasError && e.status === 400
  );
  assert.equal(calls, 1);
});

test("stream yields deltas across chunk boundaries", async () => {
  const enc = new TextEncoder();
  const parts = [
    'data: {"choices":[{"delta":{"content":"He"}}]}\n\ndata: {"choi',
    'ces":[{"delta":{"content":"llo"}}]}\n\n',
    "data: [DONE]\n\n",
  ];
  const body = new ReadableStream({
    start(c) {
      parts.forEach((p) => c.enqueue(enc.encode(p)));
      c.close();
    },
  });
  const client = new Natlas({
    baseUrl: "http://x/v1",
    fetch: (async () => new Response(body)) as unknown as typeof fetch,
  });
  let out = "";
  for await (const d of client.stream([{ role: "user", content: "hi" }])) out += d;
  assert.equal(out, "Hello");
});

test("transcribe posts multipart and returns text", async () => {
  let isForm = false;
  const client = new Natlas({
    baseUrl: "http://x/v1",
    fetch: (async (_u: string, init: RequestInit) => {
      isForm = init.body instanceof FormData;
      return json({ text: "transcript" });
    }) as unknown as typeof fetch,
  });
  const r = await client.transcribe(new Blob(["a"]), { language: "en" });
  assert.equal(r.text, "transcript");
  assert.ok(isForm);
});

test("baseUrl is required", () => {
  assert.throws(() => new Natlas({ baseUrl: "" }), NatlasError);
});
