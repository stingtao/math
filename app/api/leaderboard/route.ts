export async function GET() {
  return Response.json({ error: "Public rankings have been retired for private family learning.", entries: [] }, {
    status: 410,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}
