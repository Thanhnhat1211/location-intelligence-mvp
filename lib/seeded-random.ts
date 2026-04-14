/**
 * Seeded pseudo-random number generator.
 *
 * Given the same seed, always produces the same sequence of numbers.
 * Used throughout the analysis engine so that analyzing the same
 * coordinates twice always returns identical results.
 *
 * Algorithm: Mulberry32 — fast, 32-bit, good distribution.
 */

export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed | 0;
  }

  /** Returns a float in [0, 1). */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns an integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Returns a float in [min, max). */
  float(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /** Pick a random element from an array. */
  pick<T>(arr: readonly T[]): T {
    return arr[this.int(0, arr.length - 1)];
  }

  /** Shuffle an array (returns new array). */
  shuffle<T>(arr: readonly T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

/**
 * Create a deterministic seed from lat/lng coordinates.
 * Small coordinate changes (< ~10m) produce the same seed
 * by rounding to 4 decimal places (~11m precision).
 */
export function coordSeed(lat: number, lng: number): number {
  const latRound = Math.round(lat * 10000);
  const lngRound = Math.round(lng * 10000);
  // Combine with bit mixing to avoid collisions
  let h = latRound * 374761393 + lngRound * 668265263;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return h;
}
