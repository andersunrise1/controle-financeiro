export const FEEDBACK_CATEGORIES = ["bug", "sugestao", "outro"] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export function isValidFeedbackCategory(
  value: unknown
): value is FeedbackCategory {
  return (
    typeof value === "string" &&
    (FEEDBACK_CATEGORIES as readonly string[]).includes(value)
  );
}
