import { afterEach, describe, expect, it } from "vitest";
import { rangeToOffsets } from "./selectionOffsets";

let host: HTMLElement | null = null;

/** Build a page with a body container from html; returns the container. Cleaned up after each test. */
function mount(html: string): HTMLElement {
  host = document.createElement("div");
  host.innerHTML = `<h1>Title</h1><div id="body">${html}</div><p id="after">after text</p>`;
  document.body.appendChild(host);
  const body = host.querySelector<HTMLElement>("#body");
  if (!body) throw new Error("missing body");
  return body;
}

afterEach(() => {
  host?.remove();
  host = null;
});

/** Range over the Nth occurrence of `text` in the container's concatenated text nodes. */
function rangeOf(container: HTMLElement, text: string, occurrence = 0): Range {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let full = "";
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    nodes.push(n as Text);
    full += (n as Text).data;
  }
  let from = -1;
  for (let i = 0; i <= occurrence; i++) from = full.indexOf(text, from + 1);
  const to = from + text.length;
  const locate = (offset: number, isEnd: boolean) => {
    let pos = 0;
    for (const node of nodes) {
      if (isEnd ? offset <= pos + node.data.length : offset < pos + node.data.length) {
        return { node, offset: offset - pos };
      }
      pos += node.data.length;
    }
    throw new Error("offset out of range");
  };
  const s = locate(from, false);
  const e = locate(to, true);
  const range = document.createRange();
  range.setStart(s.node, s.offset);
  range.setEnd(e.node, e.offset);
  return range;
}

const HIGHLIGHTED = 'one <a href="#">two</a> three <a href="#">four</a> five';

describe("rangeToOffsets", () => {
  it("measures a selection inside plain text", () => {
    const body = mount("Alpha beta gamma");
    expect(rangeToOffsets(body, rangeOf(body, "beta"))).toEqual({ status: "ok", start: 6, length: 4, text: "beta" });
  });

  it("anchors a repeated phrase to the occurrence actually selected", () => {
    const body = mount("Since they fly. Since they swim.");
    expect(rangeToOffsets(body, rangeOf(body, "Since they", 0))).toMatchObject({ status: "ok", start: 0 });
    expect(rangeToOffsets(body, rangeOf(body, "Since they", 1))).toMatchObject({ status: "ok", start: 16, length: 10 });
  });

  it("counts text inside earlier highlight elements and across several text nodes", () => {
    const body = mount(HIGHLIGHTED);
    expect(rangeToOffsets(body, rangeOf(body, "five"))).toMatchObject({ status: "ok", start: 19, length: 4 });
    expect(rangeToOffsets(body, rangeOf(body, "three"))).toMatchObject({ status: "ok", start: 8, length: 5 });
  });

  it("is correct when the selection spans highlight boundaries", () => {
    const body = mount(HIGHLIGHTED);
    expect(rangeToOffsets(body, rangeOf(body, "e two th"))).toEqual({ status: "ok", start: 2, length: 8, text: "e two th" });
    expect(rangeToOffsets(body, rangeOf(body, "two three four"))).toMatchObject({ start: 4, length: 14 });
  });

  it("supports a range that starts and ends on the container itself", () => {
    const body = mount("abc<b>def</b>");
    const range = document.createRange();
    range.setStart(body, 0);
    range.setEnd(body, body.childNodes.length);
    expect(rangeToOffsets(body, range)).toEqual({ status: "ok", start: 0, length: 6, text: "abcdef" });
  });

  it("counts UTF-16 code units for astral characters", () => {
    const body = mount('a😀b <a href="#">c😀d</a>');
    expect(rangeToOffsets(body, rangeOf(body, "c😀d"))).toMatchObject({ start: 5, length: 4 });
  });

  it("counts newlines", () => {
    const body = mount("line one\nline two");
    expect(rangeToOffsets(body, rangeOf(body, "line two"))).toMatchObject({ start: 9, length: 8 });
  });

  it("reports collapsed selections as empty", () => {
    const body = mount("Alpha beta");
    const range = document.createRange();
    range.setStart(body.firstChild as Text, 3);
    range.collapse(true);
    expect(rangeToOffsets(body, range)).toEqual({ status: "empty" });
  });

  it("reports whitespace-only selections as empty", () => {
    const body = mount("Alpha  \n beta");
    expect(rangeToOffsets(body, rangeOf(body, "  \n "))).toEqual({ status: "empty" });
  });

  it("keeps surrounding whitespace in the offsets of a non-blank selection", () => {
    const body = mount("Alpha beta gamma");
    expect(rangeToOffsets(body, rangeOf(body, " beta "))).toMatchObject({ start: 5, length: 6 });
  });

  it("reports selections entirely outside the container", () => {
    const body = mount("Alpha beta");
    const outside = document.createRange();
    outside.selectNodeContents(document.querySelector("#after") as Node);
    expect(rangeToOffsets(body, outside)).toEqual({ status: "outside" });
  });

  it("reports selections that cross the container boundary in either direction", () => {
    const body = mount("Alpha beta");
    const after = (document.querySelector("#after") as Node).firstChild as Text;
    const title = (document.querySelector("h1") as Node).firstChild as Text;
    const a = document.createRange();
    a.setStart(body.firstChild as Text, 2);
    a.setEnd(after, 3);
    expect(rangeToOffsets(body, a)).toEqual({ status: "outside" });
    const b = document.createRange();
    b.setStart(title, 1);
    b.setEnd(body.firstChild as Text, 4);
    expect(rangeToOffsets(body, b)).toEqual({ status: "outside" });
  });
});
