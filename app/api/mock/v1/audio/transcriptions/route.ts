// Mock transcription endpoint for demo mode. Does NOT transcribe audio.
export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST() {
  return Response.json({ text: "[demo mode: audio was not transcribed] Hello from a mock transcript." }, { headers: CORS });
}
