/**
 * Price estimation from real property comparables.
 *
 * Strategy: given a target location, find comps within a sensible radius,
 * apply distance + recency weighting, then compute the weighted median
 * price/m². We intentionally use median (not mean) because real-estate
 * listings have long-tail outliers.
 *
 * Confidence reflects both sample size and data recency. Few/stale comps
 * => low confidence => caller should prefer the district-level fallback.
 */

import type { PropertyComp } from "@/types/dataset";
import { readComps } from "./file-store";

export interface CompsPriceEstimate {
  estimatedPrice: number;
  pricePerSqm: number;
  confidence: number;
  range: { min: number; max: number };
  comparables: number;
  /** Number of comps actually used in the estimate (before filtering). */
  candidatesFound: number;
  /** Median age of the comps used (in days). */
  medianAgeDays: number;
  source: "comps";
}

export interface RentEstimate {
  monthlyRent: number;
  rentPerSqm: number;
  range: { min: number; max: number };
  comparables: number;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Search radius for comps, in meters. 2km covers a reasonable micro-market. */
const SEARCH_RADIUS_M = 2_000;

/** Comps older than this contribute almost nothing to the estimate. */
const MAX_AGE_DAYS = 720; // 2 years

/** Minimum comps required to produce a useful estimate. */
const MIN_COMPS_FOR_ESTIMATE = 3;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Estimate sale price from real comps. Returns null when there aren't enough
 * nearby comps — callers should then fall back to district-level stats.
 */
export async function estimatePriceFromComps(
  location: { lat: number; lng: number },
  area: number,
  propertyType?: PropertyComp["propertyType"]
): Promise<CompsPriceEstimate | null> {
  const comps = await readComps();
  if (comps.length === 0) return null;

  // Filter: sale comps with a price per sqm, optionally matching property type
  const candidates = comps.filter((c) => {
    if (c.transactionType === "rent") return false;
    if (!c.pricePerSqm || c.pricePerSqm <= 0) return false;
    if (propertyType && c.propertyType !== propertyType) return false;
    if (!c.coordinates) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  // Compute distance and age for each
  const enriched = candidates
    .map((c) => {
      const distance = distanceMeters(
        location.lat,
        location.lng,
        c.coordinates.lat,
        c.coordinates.lng
      );
      const age = daysSince(c.transactionDate || c.listingDate);
      return { comp: c, distance, age };
    })
    .filter((e) => e.distance <= SEARCH_RADIUS_M && e.age <= MAX_AGE_DAYS);

  if (enriched.length < MIN_COMPS_FOR_ESTIMATE) return null;

  // Weight each comp by proximity and recency.
  // Distance weight: linear falloff from 1.0 at 0m to 0.1 at 2000m
  // Recency weight: linear falloff from 1.0 today to 0.2 at 2 years
  const weighted = enriched.map((e) => ({
    value: e.comp.pricePerSqm,
    weight:
      Math.max(0.1, 1 - e.distance / SEARCH_RADIUS_M) *
      Math.max(0.2, 1 - e.age / MAX_AGE_DAYS),
    age: e.age,
  }));

  const pricePerSqm = weightedMedian(weighted);
  const estimatedPrice = Math.round(pricePerSqm * area);
  const medianAgeDays = Math.round(
    median(weighted.map((w) => w.age))
  );

  // Spread from the weighted p25/p75 for honest range reporting
  const values = weighted.map((w) => w.value).sort((a, b) => a - b);
  const p25 = values[Math.floor(values.length * 0.25)];
  const p75 = values[Math.floor(values.length * 0.75)];

  // Confidence from sample size + recency
  const sampleConfidence = Math.min(1, enriched.length / 15);
  const recencyConfidence = Math.max(0.2, 1 - medianAgeDays / MAX_AGE_DAYS);
  const confidence =
    Math.round((0.60 + sampleConfidence * 0.25 + recencyConfidence * 0.10) * 100) /
    100;

  return {
    estimatedPrice,
    pricePerSqm: Math.round(pricePerSqm),
    confidence: Math.min(0.97, confidence),
    range: {
      min: Math.round(p25 * area),
      max: Math.round(p75 * area),
    },
    comparables: enriched.length,
    candidatesFound: candidates.length,
    medianAgeDays,
    source: "comps",
  };
}

/**
 * Estimate monthly rent from rent comps. Returns null if insufficient data.
 */
export async function estimateRentFromComps(
  location: { lat: number; lng: number },
  area: number,
  propertyType?: PropertyComp["propertyType"]
): Promise<RentEstimate | null> {
  const comps = await readComps();
  if (comps.length === 0) return null;

  const candidates = comps.filter((c) => {
    if (c.transactionType === "sale") return false;
    if (!c.rentPerSqm || c.rentPerSqm <= 0) return false;
    if (propertyType && c.propertyType !== propertyType) return false;
    if (!c.coordinates) return false;
    return true;
  });

  const enriched = candidates
    .map((c) => ({
      comp: c,
      distance: distanceMeters(
        location.lat,
        location.lng,
        c.coordinates.lat,
        c.coordinates.lng
      ),
      age: daysSince(c.transactionDate || c.listingDate),
    }))
    .filter((e) => e.distance <= SEARCH_RADIUS_M && e.age <= MAX_AGE_DAYS);

  if (enriched.length < MIN_COMPS_FOR_ESTIMATE) return null;

  const weighted = enriched.map((e) => ({
    value: e.comp.rentPerSqm!,
    weight:
      Math.max(0.1, 1 - e.distance / SEARCH_RADIUS_M) *
      Math.max(0.2, 1 - e.age / MAX_AGE_DAYS),
    age: e.age,
  }));

  const rentPerSqm = weightedMedian(weighted);
  const monthlyRent = Math.round(rentPerSqm * area);
  const values = weighted.map((w) => w.value).sort((a, b) => a - b);
  const p25 = values[Math.floor(values.length * 0.25)];
  const p75 = values[Math.floor(values.length * 0.75)];

  return {
    monthlyRent,
    rentPerSqm: Math.round(rentPerSqm),
    range: {
      min: Math.round(p25 * area),
      max: Math.round(p75 * area),
    },
    comparables: enriched.length,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const cosLat = Math.cos(lat1 * (Math.PI / 180));
  const dLat = (lat2 - lat1) * 111_320;
  const dLng = (lng2 - lng1) * 111_320 * cosLat;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

function daysSince(isoDate: string): number {
  if (!isoDate) return MAX_AGE_DAYS;
  const then = new Date(isoDate).getTime();
  if (isNaN(then)) return MAX_AGE_DAYS;
  const diffMs = Date.now() - then;
  return Math.max(0, diffMs / (1000 * 60 * 60 * 24));
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Weighted median: the smallest value v such that the cumulative weight of
 * values ≤ v covers at least half of the total weight.
 */
function weightedMedian(
  items: Array<{ value: number; weight: number }>
): number {
  if (items.length === 0) return 0;
  const sorted = [...items].sort((a, b) => a.value - b.value);
  const totalWeight = sorted.reduce((sum, it) => sum + it.weight, 0);
  let cumulative = 0;
  for (const item of sorted) {
    cumulative += item.weight;
    if (cumulative >= totalWeight / 2) {
      return item.value;
    }
  }
  return sorted[sorted.length - 1].value;
}
