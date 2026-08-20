import { getLeaderboard, getLearnerLeaderboard, isLeaderboardParticipant, learnerFromRequest, weekKey } from "@/lib/store";

export async function GET(request: Request) {
  try {
    const learner = await learnerFromRequest(request);
    const inLeague = Boolean(learner && await isLeaderboardParticipant(learner.id));
    const entries = inLeague && learner ? await getLearnerLeaderboard(learner.id) : await getLeaderboard(30);
    return Response.json({ week: weekKey(), scope: inLeague ? "your-league" : "public", entries }, { headers: { "Cache-Control": learner ? "private, no-store" : "public, max-age=60" } });
  } catch {
    return Response.json({ week: weekKey(), entries: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
