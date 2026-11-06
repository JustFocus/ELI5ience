import { describe, expect, it } from "vitest";
import { splitBody } from "./bodySegments";

const ann = (id: number, selection_start: number, selection_length: number) => ({ id, selection_start, selection_length });
const kinds = (body: string, anns: ReturnType<typeof ann>[]) => splitBody(body, anns).map((s) => [s.kind, s.text]);

describe("splitBody", () => {
  it("returns a single text segment without annotations", () => {
    expect(splitBody("hello", [])).toEqual([{ kind: "text", text: "hello", start: 0 }]);
  });

  it("returns nothing for an empty body", () => {
    expect(splitBody("", [])).toEqual([]);
  });

  it("splits into text, annotation, text", () => {
    const a = ann(1, 6, 5);
    expect(splitBody("hello world again", [a])).toEqual([
      { kind: "text", text: "hello ", start: 0 },
      { kind: "annotation", text: "world", start: 6, annotation: a },
      { kind: "text", text: " again", start: 11 },
    ]);
  });

  it("handles annotations at the very start and the very end, given out of order", () => {
    expect(kinds("abcdef", [ann(2, 4, 2), ann(1, 0, 2)])).toEqual([
      ["annotation", "ab"],
      ["text", "cd"],
      ["annotation", "ef"],
    ]);
  });

  it("covers the whole body with one annotation", () => {
    expect(kinds("abc", [ann(1, 0, 3)])).toEqual([["annotation", "abc"]]);
  });

  it("emits no empty text between touching annotations", () => {
    expect(kinds("abcd", [ann(1, 0, 2), ann(2, 2, 2)])).toEqual([
      ["annotation", "ab"],
      ["annotation", "cd"],
    ]);
  });

  it("does not mutate its input", () => {
    const input = [ann(2, 4, 1), ann(1, 0, 1)];
    splitBody("abcde", input);
    expect(input.map((a) => a.id)).toEqual([2, 1]);
  });

  it("uses UTF-16 units, so astral characters count as two", () => {
    expect(kinds("a😀b", [ann(1, 1, 2)])).toEqual([
      ["text", "a"],
      ["annotation", "😀"],
      ["text", "b"],
    ]);
  });

  it("skips overlapping, empty and out of bounds annotations without losing text", () => {
    const body = "abcdefgh";
    expect(kinds(body, [ann(1, 0, 4), ann(2, 2, 4)])).toEqual([
      ["annotation", "abcd"],
      ["text", "efgh"],
    ]);
    expect(kinds(body, [ann(1, 2, 0)])).toEqual([["text", body]]);
    expect(kinds(body, [ann(1, 6, 5)])).toEqual([["text", body]]);
  });
});
