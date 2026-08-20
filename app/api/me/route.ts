import { getLearnerState, learnerFromRequest } from "@/lib/store";

export async function GET(request: Request) {
  const learner = await learnerFromRequest(request);
  if (!learner) return Response.json({ error: "Sign in to continue." }, { status: 401 });
  return Response.json(await getLearnerState(learner.id), { headers: { "Cache-Control": "no-store" } });
}
