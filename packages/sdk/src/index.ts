export type Role = "system" | "user" | "assistant";

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface NatlasOptions {
  /** Base URL of an OpenAI-compatible N-ATLAS endpoint, e.g. https://my-host/v1 */
  baseUrl: string;
  apiKey?: string;
  /** Default model name sent with each request. */
  model?: string;
  /** Per-request timeout in ms (default 60000). */
  timeoutMs?: number;
  /** Retries on network errors, 429 and 5xx (default 2). */
  maxRetries?: number;
  /** Custom fetch implementation (tests, older runtimes). */
  fetch?: typeof fetch;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  repetitionPenalty?: number;
  signal?: AbortSignal;
}

export interface ChatResult {
  text: string;
  raw: unknown;
}

export interface TranscribeOptions {
  model?: string;
  /** Language hint, e.g. "en". */
  language?: string;
  signal?: AbortSignal;
}

export class NatlasError extends Error {
  status?: number;
  body?: string;
  constructor(message: string, status?: number, body?: string) {
    super(message);
    this.name = "NatlasError";
    this.status = status;
    this.body = body;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class Natlas {
  private baseUrl: string;
  private apiKey?: string;
  private model: string;
  private timeoutMs: number;
  private maxRetries: number;
  private fetchImpl: typeof fetch;

  constructor(opts: NatlasOptions) {
    if (!opts.baseUrl) throw new NatlasError("baseUrl is required");
    this.baseUrl = opts.baseUrl.replace(/\/+$/, "");
    this.apiKey = opts.apiKey;
    this.model = opts.model ?? "NCAIR1/N-ATLaS";
    this.timeoutMs = opts.timeoutMs ?? 60_000;
    this.maxRetries = opts.maxRetries ?? 2;
    this.fetchImpl = opts.fetch ?? ((...a) => fetch(...a));
  }

  private headers(json = true): Record<string, string> {
    const h: Record<string, string> = {};
    if (json) h["Content-Type"] = "application/json";
    if (this.apiKey) h.Authorization = `Bearer ${this.apiKey}`;
    return h;
  }

  private async request(
    path: string,
    init: RequestInit,
    signal?: AbortSignal
  ): Promise<Response> {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
      const onAbort = () => ctrl.abort();
      signal?.addEventListener("abort", onAbort);
      try {
        const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
          ...init,
          signal: ctrl.signal,
        });
        if (res.ok) return res;
        const body = await res.text().catch(() => "");
        const retryable = res.status === 429 || res.status >= 500;
        lastErr = new NatlasError(
          `N-ATLAS request failed (${res.status})`,
          res.status,
          body
        );
        if (!retryable || attempt === this.maxRetries) throw lastErr;
      } catch (e) {
        if (signal?.aborted) throw new NatlasError("Request aborted");
        if (e instanceof NatlasError) throw e;
        lastErr = new NatlasError(
          `Network error: ${e instanceof Error ? e.message : String(e)}`
        );
        if (attempt === this.maxRetries) throw lastErr;
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener("abort", onAbort);
      }
      await sleep(300 * 2 ** attempt);
    }
    throw lastErr;
  }

  private chatBody(messages: ChatMessage[], o: ChatOptions, stream: boolean) {
    return JSON.stringify({
      model: o.model ?? this.model,
      messages,
      stream,
      temperature: o.temperature,
      max_tokens: o.maxTokens,
      repetition_penalty: o.repetitionPenalty,
    });
  }

  /** Single-shot chat completion. */
  async chat(messages: ChatMessage[], o: ChatOptions = {}): Promise<ChatResult> {
    const res = await this.request(
      "/chat/completions",
      { method: "POST", headers: this.headers(), body: this.chatBody(messages, o, false) },
      o.signal
    );
    const raw = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return { text: raw.choices?.[0]?.message?.content ?? "", raw };
  }

  /** Streaming chat completion; yields text deltas as they arrive. */
  async *stream(
    messages: ChatMessage[],
    o: ChatOptions = {}
  ): AsyncGenerator<string, void, void> {
    const res = await this.request(
      "/chat/completions",
      { method: "POST", headers: this.headers(), body: this.chatBody(messages, o, true) },
      o.signal
    );
    if (!res.body) throw new NatlasError("Response has no body to stream");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;
        const data = t.slice(5).trim();
        if (data === "[DONE]") return;
        try {
          const delta = JSON.parse(data).choices?.[0]?.delta?.content;
          if (delta) yield delta as string;
        } catch {
          /* ignore malformed keep-alive lines */
        }
      }
    }
  }

  /** Speech-to-text via an OpenAI-compatible /audio/transcriptions endpoint. */
  async transcribe(audio: Blob, o: TranscribeOptions = {}): Promise<{ text: string }> {
    const form = new FormData();
    form.append("file", audio, "audio.webm");
    form.append("model", o.model ?? "N-ATLaS-ASR");
    if (o.language) form.append("language", o.language);
    const res = await this.request(
      "/audio/transcriptions",
      { method: "POST", headers: this.headers(false), body: form },
      o.signal
    );
    const json = (await res.json()) as { text?: string };
    return { text: json.text ?? "" };
  }
}
