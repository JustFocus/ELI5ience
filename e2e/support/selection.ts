import type { Locator } from '@playwright/test';

/**
 * Select the Nth occurrence of `text` inside `container` using a real DOM
 * selection, then finish the gesture with a real mouseup at the end of the
 * selected range (the app reads window.getSelection() on mouseup).
 *
 * Occurrences are counted over the container's concatenated text nodes, so the
 * helper does not depend on how the app splits the body into highlighted and
 * plain segments. `occurrence` is zero-based.
 */
export async function selectText(
  container: Locator,
  text: string,
  occurrence = 0,
): Promise<void> {
  const point = await container.evaluate(
    (root, args) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      let full = '';
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        nodes.push(n as Text);
        full += (n as Text).data;
      }
      let from = -1;
      for (let i = 0; i <= args.occurrence; i++) {
        from = full.indexOf(args.text, from + 1);
        if (from < 0) {
          throw new Error(
            `selectText: occurrence ${args.occurrence} of ${JSON.stringify(args.text)} not found`,
          );
        }
      }
      const to = from + args.text.length;

      const locate = (offset: number, isEnd: boolean): { node: Text; offset: number } => {
        let pos = 0;
        for (const node of nodes) {
          const len = node.data.length;
          if (isEnd ? offset <= pos + len : offset < pos + len) {
            return { node, offset: offset - pos };
          }
          pos += len;
        }
        throw new Error('selectText: offset out of range');
      };

      const s = locate(from, false);
      const e = locate(to, true);
      const range = document.createRange();
      range.setStart(s.node, s.offset);
      range.setEnd(e.node, e.offset);
      e.node.parentElement?.scrollIntoView({ block: 'center' });
      const sel = window.getSelection()!;
      sel.removeAllRanges();
      sel.addRange(range);

      const rects = range.getClientRects();
      const last = rects[rects.length - 1] ?? range.getBoundingClientRect();
      return { x: Math.max(last.right - 1, last.left), y: last.top + last.height / 2 };
    },
    { text, occurrence },
  );

  const page = container.page();
  await page.mouse.move(point.x, point.y);
  await page.mouse.up();
}
