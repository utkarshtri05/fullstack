import { describe, expect, it } from "vitest";
import { AppError } from "../shared/errors";
import { assertPayoutTransition, assertProofTransition } from "./service";

describe("winner and payout flow", () => {
  it("allows pending proof approval or rejection", () => {
    expect(() => assertProofTransition("pending", "approved")).not.toThrow();
    expect(() => assertProofTransition("pending", "rejected")).not.toThrow();
  });

  it("rejects proof review after terminal state", () => {
    expect(() => assertProofTransition("approved", "rejected")).toThrow(AppError);
  });

  it("allows pending payouts to become paid only once", () => {
    expect(() => assertPayoutTransition("pending", "paid")).not.toThrow();
    expect(() => assertPayoutTransition("paid", "paid")).toThrow(AppError);
  });
});
