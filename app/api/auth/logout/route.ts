import { rejectCrossOriginMutation } from "@/lib/http";
import { clearSessionCookie } from "@/lib/security";
import { deleteSessionFromRequest } from "@/lib/store";

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOriginMutation(request);
  if (crossOrigin) return crossOrigin;
  await deleteSessionFromRequest(request);
  return Response.json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookie(), "Cache-Control": "no-store" } });
}
