import type { DistrictData, NearbyBusiness } from "./mock-data";
import { getMockAreaInfo, getMockNearbyBusinesses } from "./mock-data";
import type { BusinessModel } from "@/types/analysis";

export interface ScoringWeights {
  location: number;
  demographics: number;
  competition: number;
  infrastructure: number;
}

export interface LocationScore {
  overall: number;
  breakdown: {
    location: number;
    demographics: number;
    competition: number;
    infrastructure: number;
  };
  rating: "excellent" | "good" | "fair" | "poor";
  strengths: string[];
  weaknesses: string[];
}

const DEFAULT_WEIGHTS: Record<BusinessModel, ScoringWeights> = {
  fnb: {
    location: 0.35,
    demographics: 0.25,
    competition: 0.25,
    infrastructure: 0.15,
  },
  airbnb: {
    location: 0.3,
    demographics: 0.2,
    competition: 0.3,
    infrastructure: 0.2,
  },
  retail: {
    location: 0.3,
    demographics: 0.3,
    competition: 0.25,
    infrastructure: 0.15,
  },
};

/**
 * Main scoring function - calculates business fit score for a location
 */
export function calculateBusinessFitScore(
  location: { lat: number; lng: number; address?: string },
  businessModel: BusinessModel,
  customWeights?: Partial<ScoringWeights>
): LocationScore {
  const weights = { ...DEFAULT_WEIGHTS[businessModel], ...customWeights };
  const areaInfo = getMockAreaInfo(location);
  const nearbyBusinesses = getMockNearbyBusinesses(location, 500);

  if (!areaInfo) {
    return {
      overall: 50,
      breakdown: { location: 50, demographics: 50, competition: 50, infrastructure: 50 },
      rating: "fair",
      strengths: [],
      weaknesses: ["Thiếu dữ liệu khu vực"],
    };
  }

  const locationScore = calculateLocationScore(areaInfo, businessModel);
  const demographicScore = calculateDemographicScore(areaInfo, businessModel);
  const competitionScore = calculateCompetitionScore(nearbyBusinesses, businessModel);
  const infrastructureScore = calculateInfrastructureScore(areaInfo, businessModel);

  const overall = Math.round(
    locationScore * weights.location +
      demographicScore * weights.demographics +
      competitionScore * weights.competition +
      infrastructureScore * weights.infrastructure
  );

  const breakdown = {
    location: Math.round(locationScore),
    demographics: Math.round(demographicScore),
    competition: Math.round(competitionScore),
    infrastructure: Math.round(infrastructureScore),
  };

  return {
    overall,
    breakdown,
    rating: getRating(overall),
    strengths: identifyStrengths(breakdown, businessModel),
    weaknesses: identifyWeaknesses(breakdown, businessModel),
  };
}

/**
 * Calculate location-specific score
 */
export function calculateLocationScore(
  areaInfo: DistrictData,
  businessModel: BusinessModel
): number {
  let score = 50; // Base score

  // Transit accessibility is key for all business models
  score += (areaInfo.infrastructure.transitScore - 50) * 0.4;

  // Walk score important for F&B and Retail
  if (businessModel === "fnb" || businessModel === "retail") {
    score += (areaInfo.infrastructure.walkScore - 50) * 0.3;
  }

  // High business density indicates good commercial area
  const businessDensity = areaInfo.business.totalBusinesses / (areaInfo.demographics.population / 1000);
  if (businessDensity > 5) score += 15;
  else if (businessDensity > 3) score += 10;
  else if (businessDensity > 1) score += 5;

  // Central districts (1, 3) get bonus
  if (areaInfo.id === "district-1" || areaInfo.id === "district-3") {
    score += 10;
  }

  return Math.min(Math.max(score, 0), 100);
}

/**
 * Calculate demographic fit score
 */
export function calculateDemographicScore(
  areaInfo: DistrictData,
  businessModel: BusinessModel
): number {
  let score = 50;

  const income = areaInfo.demographics.medianIncome;
  const age = areaInfo.demographics.medianAge;
  const population = areaInfo.demographics.population;

  switch (businessModel) {
    case "fnb":
      // F&B prefers younger demographics with medium-high income
      if (age >= 25 && age <= 40) score += 15;
      else if (age >= 20 && age <= 45) score += 10;
      else score += 5;

      if (income >= 15_000_000) score += 20;
      else if (income >= 12_000_000) score += 15;
      else if (income >= 10_000_000) score += 10;
      else score += 5;

      if (population > 300000) score += 10;
      else if (population > 150000) score += 5;
      break;

    case "airbnb":
      // Airbnb prefers affluent areas near business/tourist districts
      if (income >= 16_000_000) score += 25;
      else if (income >= 13_000_000) score += 15;
      else score += 5;

      // Age less important for Airbnb
      score += 10;

      // High occupancy rate is crucial
      if (areaInfo.realEstate.occupancyRate >= 90) score += 15;
      else if (areaInfo.realEstate.occupancyRate >= 85) score += 10;
      else score += 5;
      break;

    case "retail":
      // Retail prefers high population density with medium+ income
      if (population > 400000) score += 15;
      else if (population > 200000) score += 10;
      else score += 5;

      if (income >= 14_000_000) score += 20;
      else if (income >= 11_000_000) score += 15;
      else if (income >= 9_000_000) score += 10;
      else score += 5;

      // Younger and middle-aged are key retail demographics
      if (age >= 25 && age <= 40) score += 10;
      else score += 5;
      break;
  }

  return Math.min(Math.max(score, 0), 100);
}

/**
 * Calculate competition score (lower competition = higher score)
 */
export function calculateCompetitionScore(
  nearbyBusinesses: NearbyBusiness[],
  businessModel: BusinessModel
): number {
  let score = 75; // Start optimistic

  const relevantTypes: Record<BusinessModel, NearbyBusiness["type"][]> = {
    fnb: ["cafe", "restaurant"],
    airbnb: ["hotel"],
    retail: ["retail"],
  };

  const competitors = nearbyBusinesses.filter((b) =>
    relevantTypes[businessModel].includes(b.type)
  );

  // Competition density analysis
  const veryClose = competitors.filter((b) => b.distance <= 200).length;
  const close = competitors.filter((b) => b.distance <= 350).length;
  const nearby = competitors.length;

  // Heavy competition penalty for very close competitors
  score -= veryClose * 8;
  score -= (close - veryClose) * 5;
  score -= (nearby - close) * 2;

  // Check average rating of competitors
  if (competitors.length > 0) {
    const avgRating = competitors.reduce((sum, b) => sum + b.rating, 0) / competitors.length;
    
    // High-rated competition is tougher
    if (avgRating >= 4.5) score -= 10;
    else if (avgRating >= 4.0) score -= 5;
    else score += 5; // Weak competition is opportunity
  }

  // Sweet spot: some competition but not oversaturated
  if (businessModel === "fnb" || businessModel === "retail") {
    if (nearby >= 3 && nearby <= 8) score += 10; // Proven demand
    else if (nearby < 2) score -= 5; // Maybe poor location
    else if (nearby > 15) score -= 15; // Oversaturated
  }

  return Math.min(Math.max(score, 0), 100);
}

/**
 * Calculate infrastructure score
 */
export function calculateInfrastructureScore(
  areaInfo: DistrictData,
  businessModel: BusinessModel
): number {
  let score = 50;

  // Transit score heavily weighted
  score += (areaInfo.infrastructure.transitScore - 50) * 0.5;

  // Walk score
  score += (areaInfo.infrastructure.walkScore - 50) * 0.3;

  // Parking availability
  const parkingScores = { low: -10, medium: 5, high: 15 };
  
  if (businessModel === "airbnb" || businessModel === "retail") {
    // These models benefit more from parking
    score += parkingScores[areaInfo.infrastructure.parkingAvailability] * 1.5;
  } else {
    score += parkingScores[areaInfo.infrastructure.parkingAvailability];
  }

  return Math.min(Math.max(score, 0), 100);
}

/**
 * Convert numeric score to rating
 */
function getRating(score: number): "excellent" | "good" | "fair" | "poor" {
  if (score >= 80) return "excellent";
  if (score >= 65) return "good";
  if (score >= 50) return "fair";
  return "poor";
}

/**
 * Identify key strengths based on breakdown
 */
function identifyStrengths(
  breakdown: Record<string, number>,
  businessModel: BusinessModel
): string[] {
  const strengths: string[] = [];

  if (breakdown.location >= 75) {
    strengths.push("Vị trí địa lý xuất sắc");
  }
  if (breakdown.demographics >= 75) {
    strengths.push("Nhân khẩu học phù hợp cao");
  }
  if (breakdown.competition >= 75) {
    strengths.push("Mức độ cạnh tranh thấp");
  }
  if (breakdown.infrastructure >= 75) {
    strengths.push("Hạ tầng giao thông tốt");
  }

  // Model-specific strengths
  if (businessModel === "fnb" && breakdown.location >= 70) {
    strengths.push("Lưu lượng khách bộ hành cao");
  }
  if (businessModel === "airbnb" && breakdown.demographics >= 70) {
    strengths.push("Khu vực thu nhập cao");
  }
  if (businessModel === "retail" && breakdown.competition >= 65) {
    strengths.push("Cơ hội thị trường tốt");
  }

  return strengths;
}

/**
 * Identify key weaknesses based on breakdown
 */
function identifyWeaknesses(
  breakdown: Record<string, number>,
  businessModel: BusinessModel
): string[] {
  const weaknesses: string[] = [];

  if (breakdown.location < 50) {
    weaknesses.push("Vị trí chưa thuận lợi");
  }
  if (breakdown.demographics < 50) {
    weaknesses.push("Nhân khẩu học chưa phù hợp");
  }
  if (breakdown.competition < 40) {
    weaknesses.push("Cạnh tranh cao");
  }
  if (breakdown.infrastructure < 50) {
    weaknesses.push("Hạ tầng cần cải thiện");
  }

  // Model-specific weaknesses
  if (businessModel === "fnb" && breakdown.location < 60) {
    weaknesses.push("Khả năng tiếp cận khách hàng hạn chế");
  }
  if (businessModel === "airbnb" && breakdown.competition < 50) {
    weaknesses.push("Nhiều khách sạn cạnh tranh");
  }
  if (businessModel === "retail" && breakdown.demographics < 55) {
    weaknesses.push("Sức mua chưa đủ mạnh");
  }

  return weaknesses;
}

/**
 * Get recommended business models for a location
 */
export function getRecommendedBusinessModels(location: {
  lat: number;
  lng: number;
  address?: string;
}): Array<{ model: BusinessModel; score: number; label: string }> {
  const models: BusinessModel[] = ["fnb", "airbnb", "retail"];
  const results = models.map((model) => {
    const score = calculateBusinessFitScore(location, model);
    const labels = {
      fnb: "F&B / Nhà hàng",
      airbnb: "Airbnb / Khách sạn",
      retail: "Bán lẻ / Cửa hàng",
    };
    return { model, score: score.overall, label: labels[model] };
  });

  return results.sort((a, b) => b.score - a.score);
}
