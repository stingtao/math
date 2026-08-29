import { getLearnerState, learnerFromRequest } from "@/lib/store";
import { privateJson } from "@/lib/http";

export async function GET(request: Request) {
  const learner = await learnerFromRequest(request);
  if (!learner) return privateJson({ error: "Sign in to continue." }, { status: 401 });
  return privateJson(await getLearnerState(learner.id));
}
