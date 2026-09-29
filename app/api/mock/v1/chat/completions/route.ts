// Mock OpenAI-compatible endpoint for demo mode. Returns SIMULATED text, not model output.
export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const last = [...(body.messages ?? [])].reverse().find((m: { role: string }) => m.role === "user");
  const reply = `[demo mode: simulated reply, not N-ATLAS] You said: "${String(last?.content ?? "").slice(0, 200)}". Connect your own N-ATLAS endpoint to get real answers.`;

  if (!body.stream) {
    return Response.json(
      { choices: [{ message: { role: "assistant", content: reply } }] },
      { headers: CORS }
    );
  }

  const enc = new TextEncoder();
  const words = reply.split(" ");
  const stream = new ReadableStream({
    async start(controller) {
      for (const w of words) {
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: w + " " } }] })}\n\n`));
        await new Promise((r) => setTimeout(r, 40));
      }
      controller.enqueue(enc.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { ...CORS, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
