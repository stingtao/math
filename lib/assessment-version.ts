export type DepthVersion = "depth-v1" | "depth-v2" | "depth-v3";

export const ASSESSMENT_VERSION: DepthVersion = "depth-v3";

export function isDepthVersion(value: string | undefined): value is DepthVersion {
  return value === "depth-v1" || value === "depth-v2" || value === "depth-v3";
}

export function assessmentVersionForId(id: string): DepthVersion | undefined {
  if (id.startsWith("d1-")) return "depth-v1";
  if (id.startsWith("d2-")) return "depth-v2";
  if (id.startsWith("d3-")) return "depth-v3";
  return undefined;
}

export const createAssessmentId = () => `d3-${crypto.randomUUID()}`;
export const isDepthAssessment = (id: string) => assessmentVersionForId(id) !== undefined;
