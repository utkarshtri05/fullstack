import { describe, expect, it } from "vitest";
import { AppError } from "../shared/errors";
import { assertNoDuplicateScoreDate, selectScoresToPrune, sortScoresLatestFirst } from "./service";

const scores = [
  { id: "1", date: "2026-04-01", createdAt: new Date("2026-04-01T10:00:00Z") },
  { id: "2", date: "2026-04-05", createdAt: new Date("2026-04-05T10:00:00Z") },
  { id: "3", date: "2026-04-03", createdAt: new Date("2026-04-03T10:00:00Z") },
  { id: "4", date: "2026-04-04", createdAt: new Date("2026-04-04T10:00:00Z") },
  { id: "5", date: "2026-04-02", createdAt: new Date("2026-04-02T10:00:00Z") },
  { id: "6", date: "2026-04-06", createdAt: new Date("2026-04-06T10:00:00Z") }
];

describe("score logic", () => {
  it("sorts scores latest first", () => {
    expect(sortScoresLatestFirst(scores).map((score) => score.id)).toEqual(["6", "2", "4", "3", "5", "1"]);
  });

  it("selects scores beyond the five-score window for pruning", () => {
    expect(selectScoresToPrune(scores).map((score) => score.id)).toEqual(["1"]);
  });

  it("rejects duplicate score dates", () => {
    expect(() => assertNoDuplicateScoreDate([{ date: "2026-04-20" }], "2026-04-20")).toThrow(AppError);
  });
});
