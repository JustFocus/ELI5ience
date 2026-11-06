import type { OffsetRange } from "./annotationOverlap";

export type Segment<A extends OffsetRange> =
  | { kind: "text"; text: string; start: number }
  | { kind: "annotation"; text: string; start: number; annotation: A };

/**
 * Split `body` into alternating plain and annotation segments, in order, from the
 * annotations' UTF-16 offsets (`body.slice` uses the same units). The concatenation
 * of all segment texts is exactly `body` for valid input. Annotations may arrive in
 * any order. A defensive pass skips annotations that are out of bounds, empty, or
 * overlap an earlier one (the server never stores those), so rendering cannot
 * duplicate or lose text.
 */
export function splitBody<A extends OffsetRange>(body: string, annotations: readonly A[]): Segment<A>[] {
  const sorted = [...annotations].sort((a, b) => a.selection_start - b.selection_start);
  const segments: Segment<A>[] = [];
  let cursor = 0;
  for (const annotation of sorted) {
    const start = annotation.selection_start;
    const end = start + annotation.selection_length;
    if (start < cursor || annotation.selection_length < 1 || end > body.length) continue;
    if (start > cursor) segments.push({ kind: "text", text: body.slice(cursor, start), start: cursor });
    segments.push({ kind: "annotation", text: body.slice(start, end), start, annotation });
    cursor = end;
  }
  if (cursor < body.length) segments.push({ kind: "text", text: body.slice(cursor), start: cursor });
  return segments;
}
