import { describe, expect, it } from "vitest";
import {
  calculatePrizeDistribution,
  classifyWinners,
  countMatches,
  generateHybridNumbers,
  generateRandomNumbers,
  generateWeightedNumbers
} from "./engine";

function fixedRng(values: number[]) {
  let index = 0;
  return () => values[index++ % values.length] ?? 0.1;
}

describe("draw engine", () => {
  it("generates five unique random numbers in range", () => {
    const numbers = generateRandomNumbers(fixedRng([0, 0.02, 0.04, 0.06, 0.08, 0.1]));
    expect(numbers).toHaveLength(5);
    expect(new Set(numbers).size).toBe(5);
    expect(numbers.every((number) => number >= 1 && number <= 45)).toBe(true);
  });

  it("generates weighted numbers from frequency-biased scores", () => {
    const numbers = generateWeightedNumbers([7, 7, 7, 7, 8, 9], fixedRng([0.01, 0.2, 0.4, 0.6, 0.8]));
    expect(numbers).toHaveLength(5);
    expect(new Set(numbers).size).toBe(5);
  });

  it("generates hybrid numbers with weighted and random components", () => {
    const numbers = generateHybridNumbers([11, 11, 12, 13], fixedRng([0.01, 0.2, 0.4, 0.6, 0.8]));
    expect(numbers).toHaveLength(5);
  });

  it("counts matches and classifies winners", () => {
    expect(countMatches([1, 2, 3, 9, 10], [1, 2, 3, 4, 5])).toBe(3);
    const winners = classifyWinners(
      [
        { userId: "a", numbers: [1, 2, 3, 9, 10] },
        { userId: "b", numbers: [1, 2, 3, 4, 5] }
      ],
      [1, 2, 3, 4, 5]
    );
    expect(winners[3].map((winner) => winner.userId)).toEqual(["a"]);
    expect(winners[5].map((winner) => winner.userId)).toEqual(["b"]);
  });

  it("splits prize pools and rolls over the five-match pool when empty", () => {
    const distribution = calculatePrizeDistribution(10000, { 3: 5, 4: 2, 5: 0 });
    expect(distribution.tiers[3].perWinnerAmount).toBe(500);
    expect(distribution.tiers[4].perWinnerAmount).toBe(1750);
    expect(distribution.tiers[5].perWinnerAmount).toBe(0);
    expect(distribution.rolloverCents).toBe(4000);
  });
});
