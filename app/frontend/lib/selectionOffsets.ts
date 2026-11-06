export type SelectionOffsets =
  | { status: "ok"; start: number; length: number; text: string }
  /** Collapsed or whitespace-only selection. */
  | { status: "empty" }
  /** The range is not entirely inside the container. */
  | { status: "outside" };

/**
 * Convert a DOM Range into {start, length} in UTF-16 code units relative to the
 * start of `container`'s text. This requires the container's text content to be
 * exactly the article body (highlight elements only wrap text, nothing else is
 * rendered inside). Counting the text before the range start, rather than
 * searching for the selected string, anchors repeated phrases to the occurrence
 * actually selected, and works when the selection spans highlight elements.
 */
export function rangeToOffsets(container: Node, range: Range): SelectionOffsets {
  if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) {
    return { status: "outside" };
  }
  const text = range.toString();
  if (text.trim() === "") return { status: "empty" };
  const before = document.createRange();
  before.setStart(container, 0);
  before.setEnd(range.startContainer, range.startOffset);
  return { status: "ok", start: before.toString().length, length: text.length, text };
}
