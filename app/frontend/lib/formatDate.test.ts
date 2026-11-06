import { describe, expect, it } from "vitest";
import { formatTimestamp } from "./formatDate";

describe("formatTimestamp", () => {
  it("formats date and time in the given locale", () => {
    const out = formatTimestamp("2026-03-02T18:47:44.123Z", "en-US");
    expect(out).toMatch(/Mar (2|3), 2026/);
    expect(out).toMatch(/\d{1,2}:\d{2}/);
  });

  it("works without an explicit locale", () => {
    expect(formatTimestamp("2026-03-02T18:47:44.123Z")).not.toBe("");
  });
});
