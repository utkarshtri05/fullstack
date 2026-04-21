import { randomInt } from "node:crypto";
import type { DrawMode } from "./schemas";

export type ParticipantEntry = {
  userId: string;
  numbers: number[];
};

export type PrizeDistribution = {
  tiers: Record<3 | 4 | 5, { totalPool: number; perWinnerAmount: number; winnerCount: number }>;
  rolloverCents: number;
};

type Rng = () => number;

export const DRAW_NUMBER_MIN = 1;
export const DRAW_NUMBER_MAX = 45;
export const DRAW_NUMBER_COUNT = 5;

function defaultRng() {
  return randomInt(0, 1_000_000) / 1_000_000;
}

function allNumbers() {
  return Array.from({ length: DRAW_NUMBER_MAX }, (_, index) => index + DRAW_NUMBER_MIN);
}

function normalizeNumbers(numbers: number[]) {
  return [...new Set(numbers)].sort((a, b) => a - b);
}

function weightedPick(candidates: number[], frequencies: Map<number, number>, rng: Rng) {
  const weighted = candidates.map((number) => ({
    number,
    weight: (frequencies.get(number) ?? 0) + 1
  }));
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  let threshold = rng() * totalWeight;

  for (const item of weighted) {
    threshold -= item.weight;
    if (threshold <= 0) {
      return item.number;
    }
  }

  return weighted[weighted.length - 1]?.number ?? DRAW_NUMBER_MIN;
}

export function createFrequencyMap(scoreNumbers: number[]) {
  const frequencies = new Map<number, number>();

  for (const number of scoreNumbers) {
    if (number >= DRAW_NUMBER_MIN && number <= DRAW_NUMBER_MAX) {
      frequencies.set(number, (frequencies.get(number) ?? 0) + 1);
    }
  }

  return frequencies;
}

export function generateRandomNumbers(rng: Rng = defaultRng) {
  const selected = new Set<number>();

  while (selected.size < DRAW_NUMBER_COUNT) {
    selected.add(Math.floor(rng() * DRAW_NUMBER_MAX) + DRAW_NUMBER_MIN);
  }

  return normalizeNumbers([...selected]);
}

export function generateWeightedNumbers(scoreNumbers: number[], rng: Rng = defaultRng) {
  const frequencies = createFrequencyMap(scoreNumbers);
  const selected = new Set<number>();

  while (selected.size < DRAW_NUMBER_COUNT) {
    const candidates = allNumbers().filter((number) => !selected.has(number));
    selected.add(weightedPick(candidates, frequencies, rng));
  }

  return normalizeNumbers([...selected]);
}

export function generateHybridNumbers(scoreNumbers: number[], rng: Rng = defaultRng) {
  const frequencies = createFrequencyMap(scoreNumbers);
  const selected = new Set<number>();

  while (selected.size < 3) {
    const candidates = allNumbers().filter((number) => !selected.has(number));
    selected.add(weightedPick(candidates, frequencies, rng));
  }

  while (selected.size < DRAW_NUMBER_COUNT) {
    selected.add(Math.floor(rng() * DRAW_NUMBER_MAX) + DRAW_NUMBER_MIN);
  }

  return normalizeNumbers([...selected]);
}

export function generateWinningNumbers(mode: DrawMode, scoreNumbers: number[], rng: Rng = defaultRng) {
  if (mode === "weighted") {
    return generateWeightedNumbers(scoreNumbers, rng);
  }

  if (mode === "hybrid") {
    return generateHybridNumbers(scoreNumbers, rng);
  }

  return generateRandomNumbers(rng);
}

export function countMatches(userNumbers: number[], winningNumbers: number[]) {
  const winning = new Set(winningNumbers);
  return new Set(userNumbers.filter((number) => winning.has(number))).size;
}

export function calculatePrizeDistribution(totalPoolCents: number, winnersByTier: Record<3 | 4 | 5, number>) {
  const tierPercentages: Record<3 | 4 | 5, number> = {
    5: 0.4,
    4: 0.35,
    3: 0.25
  };

  const tiers = {
    5: {
      totalPool: Math.floor(totalPoolCents * tierPercentages[5]),
      perWinnerAmount: 0,
      winnerCount: winnersByTier[5]
    },
    4: {
      totalPool: Math.floor(totalPoolCents * tierPercentages[4]),
      perWinnerAmount: 0,
      winnerCount: winnersByTier[4]
    },
    3: {
      totalPool: Math.floor(totalPoolCents * tierPercentages[3]),
      perWinnerAmount: 0,
      winnerCount: winnersByTier[3]
    }
  } satisfies PrizeDistribution["tiers"];

  let rolloverCents = 0;

  for (const tier of [5, 4, 3] as const) {
    if (tiers[tier].winnerCount > 0) {
      tiers[tier].perWinnerAmount = Math.floor(tiers[tier].totalPool / tiers[tier].winnerCount);
    } else if (tier === 5) {
      rolloverCents = tiers[tier].totalPool;
    }
  }

  return {
    tiers,
    rolloverCents
  };
}

export function classifyWinners(participants: ParticipantEntry[], winningNumbers: number[]) {
  return participants.reduce<Record<3 | 4 | 5, ParticipantEntry[]>>(
    (acc, participant) => {
      const matches = countMatches(participant.numbers, winningNumbers);

      if (matches >= 3) {
        acc[matches as 3 | 4 | 5].push(participant);
      }

      return acc;
    },
    {
      3: [],
      4: [],
      5: []
    }
  );
}
