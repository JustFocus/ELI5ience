/** A half-open range of UTF-16 code units: [start, start + length). */
export interface OffsetRange {
  selection_start: number;
  selection_length: number;
}

export type SelectionRejection = "invalid_start" | "invalid_length" | "out_of_bounds" | "overlap";

export type SelectionCheck = { valid: true } | { valid: false; reason: SelectionRejection };

/**
 * Client side twin of the server rule in docs/api.md "Annotation offsets (normative)".
 * Checks run in the documented order and the first failure is reported. Touching
 * ranges (one ends exactly where the other starts) are allowed. The shared vectors
 * in docs/annotation_vectors.json prove both sides agree.
 */
export function checkSelection(
  bodyLength: number,
  existing: readonly OffsetRange[],
  start: number,
  length: number,
): SelectionCheck {
  if (start < 0) return { valid: false, reason: "invalid_start" };
  if (length < 1) return { valid: false, reason: "invalid_length" };
  const end = start + length;
  if (end > bodyLength) return { valid: false, reason: "out_of_bounds" };
  const overlaps = existing.some((a) => !(end <= a.selection_start || a.selection_start + a.selection_length <= start));
  return overlaps ? { valid: false, reason: "overlap" } : { valid: true };
}

/** Human readable explanation of a rejection, for the inline message. */
export function rejectionMessage(reason: SelectionRejection): string {
  switch (reason) {
    case "overlap":
      return "That selection overlaps an existing annotation. Select text that is not already highlighted.";
    case "out_of_bounds":
      return "That selection extends past the end of the article.";
    case "invalid_start":
    case "invalid_length":
      return "That selection is not valid. Select some text in the article body.";
  }
}
