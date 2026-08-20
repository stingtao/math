import { rejectCrossOriginMutation } from "@/lib/http";
import { createFeedback, listFeedback } from "@/lib/store";

export async function GET() {
  try {
    return Response.json({ messages: await listFeedback() }, { headers: { "Cache-Control": "public, max-age=20" } });
  } catch {
    return Response.json({ messages: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOriginMutation(request);
  if (crossOrigin) return crossOrigin;
  try {
    const body = await request.json() as { message?: string; website?: string };
    if (body.website) return Response.json({ ok: true });
    if (typeof body.message !== "string") return Response.json({ error: "Write a short message first." }, { status: 400 });
    await createFeedback(request.headers.get("Idempotency-Key"), body.message);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Feedback could not be posted." }, { status: 400 });
  }
}
