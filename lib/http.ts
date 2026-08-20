export function rejectCrossOriginMutation(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  if (origin !== new URL(request.url).origin) return Response.json({ error: "Cross-origin request rejected." }, { status: 403 });
  return null;
}
