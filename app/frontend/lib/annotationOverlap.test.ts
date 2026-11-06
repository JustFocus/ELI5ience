import { describe, expect, it } from "vitest";
import vectorFile from "../../../docs/annotation_vectors.json";
import { checkSelection, rejectionMessage, type SelectionRejection } from "./annotationOverlap";

interface Vector {
  name: string;
  body_length: number;
  body?: string;
  existing: [number, number][];
  proposed: [number, number];
  valid: boolean;
  error_field?: string;
  reason?: SelectionRejection;
}

const vectors = vectorFile.vectors as Vector[];

describe("checkSelection against docs/annotation_vectors.json", () => {
  it("loads vectors covering every reason", () => {
    const reasons = new Set(vectors.map((v) => v.reason));
    expect(vectors.length).toBeGreaterThan(10);
    for (const reason of ["invalid_start", "invalid_length", "out_of_bounds", "overlap"]) {
      expect(reasons).toContain(reason);
    }
  });

  it.each(vectors.map((v) => [v.name, v] as const))("%s", (_name, v) => {
    if (v.body !== undefined) expect(v.body.length).toBe(v.body_length);
    const existing = v.existing.map(([selection_start, selection_length]) => ({ selection_start, selection_length }));
    const result = checkSelection(v.body_length, existing, v.proposed[0], v.proposed[1]);
    expect(result.valid).toBe(v.valid);
    if (!result.valid) expect(result.reason).toBe(v.reason);
  });
});

describe("checkSelection extras", () => {
  it("reports the first failing rule", () => {
    expect(checkSelection(10, [], -1, 0)).toEqual({ valid: false, reason: "invalid_start" });
    expect(checkSelection(10, [], 20, 0)).toEqual({ valid: false, reason: "invalid_length" });
    expect(checkSelection(10, [{ selection_start: 0, selection_length: 10 }], 5, 20)).toEqual({
      valid: false,
      reason: "out_of_bounds",
    });
  });
});

describe("rejectionMessage", () => {
  it("explains every reason", () => {
    expect(rejectionMessage("overlap")).toMatch(/overlaps an existing annotation/);
    expect(rejectionMessage("out_of_bounds")).toMatch(/past the end/);
    expect(rejectionMessage("invalid_start")).toMatch(/not valid/);
    expect(rejectionMessage("invalid_length")).toMatch(/not valid/);
  });
});
