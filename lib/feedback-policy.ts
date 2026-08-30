export const FEEDBACK_NOTICE_VERSION = "parent-feedback-v1";
export const feedbackCategories = ["correction", "content", "feature", "other"] as const;
export type FeedbackCategory = (typeof feedbackCategories)[number];

export type FeedbackThreadView = {
  id: string;
  category: FeedbackCategory;
  body: string;
  status: "pending" | "published" | "hidden";
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
  replies: Array<{ id: string; body: string; createdAt: string }>;
};
