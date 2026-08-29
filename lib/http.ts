export function rejectCrossOriginMutation(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  if (origin !== new URL(request.url).origin) return Response.json({ error: "Cross-origin request rejected." }, { status: 403 });
  return null;
}

export function privateJson(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("Pragma", "no-cache");
  return Response.json(body, { ...init, headers });
}
