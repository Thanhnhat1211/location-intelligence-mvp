/**
 * Main analysis orchestrator.
 *
 * Design principles:
 * - Deterministic: same coordinates always produce same results (via seeded random)
 * - Realistic formulas: ROI/revenue/costs derived from industry benchmarks,
 *   not arbitrary multipliers
 * - Dynamic SWOT: strengths/weaknesses/opportunities/threats generated from
 *   actual score breakdowns and district characteristics
 * - Honest confidence: reflects data quality, not random
 */

import type {
  AnalysisFilters,
  AnalysisResult,
  BusinessModel,
  BusinessFitScore,
  NearbyBusiness,
  PriceEstimate,
  RiskFlag,
  AreaSummary,
  StrategyMemo,
} from "@/types/analysis";
import type { Location, Coordinates } from "@/types/location";
import type { LocationScore } from "./scoring";
import { calculateBusinessFitScore } from "./scoring";
import {
  getMockAreaInfo,
  getMockNearbyBusinesses,
  getMockPriceEstimate,
  getMockTrafficData,
} from "./mock-data";
import type {
  DistrictData,
  NearbyBusiness as MockNearbyBusiness,
} from "./mock-data";
import { SeededRandom, coordSeed } from "./seeded-random";
import { generateId } from "./utils";

export interface AnalyzeLocationInput {
  coordinates: Coordinates;
  addressText?: string;
}

/**
 * Industry benchmarks for Vietnamese business models (based on 2023-2024
 * market reports). These drive realistic revenue/cost/ROI estimates.
 */
const INDUSTRY_BENCHMARKS: Record<BusinessModel, {
  /** Average customer spend per visit (VND) */
  avgTicket: number;
  /** Daily customers for an "average" 50m² location */
  baseDailyCustomers: number;
  /** Operating cost ratio (excluding rent) as % of revenue */
  opexRatio: number;
  /** Typical initial investment (VND) for 50m² setup */
  initialInvestment: number;
  /** Gross margin % */
  grossMargin: number;
}> = {
  fnb: {
    avgTicket: 80_000,
    baseDailyCustomers: 120,
    opexRatio: 0.35,
    initialInvestment: 400_000_000,
    grossMargin: 0.65,
  },
  airbnb: {
    avgTicket: 800_000, // per night
    baseDailyCustomers: 0.75, // occupancy rate × 1 unit
    opexRatio: 0.25,
    initialInvestment: 300_000_000,
    grossMargin: 0.80,
  },
  retail: {
    avgTicket: 250_000,
    baseDailyCustomers: 50,
    opexRatio: 0.30,
    initialInvestment: 250_000_000,
    grossMargin: 0.35,
  },
};

export async function analyzeLocation(
  input: AnalyzeLocationInput,
  filters: AnalysisFilters
): Promise<AnalysisResult> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const { coordinates, addressText } = input;
  const mockLoc = {
    lat: coordinates.lat,
    lng: coordinates.lng,
    address: addressText || "Địa điểm được chọn",
  };
  const radius = filters.radius || 500;

  const areaInfo = getMockAreaInfo(mockLoc);
  if (!areaInfo) {
    throw new Error("Không tìm thấy thông tin khu vực");
  }

  const mockBusinesses = getMockNearbyBusinesses(mockLoc, radius);
  const mockPrice = getMockPriceEstimate(mockLoc);
  const trafficData = getMockTrafficData(mockLoc);

  const primaryScore = calculateBusinessFitScore(
    mockLoc,
    filters.businessModel
  );

  const now = new Date().toISOString();
  const dataConfidence = calculateDataConfidence(mockLoc, areaInfo, mockBusinesses.length);

  const location = buildLocation(coordinates, areaInfo, addressText, filters.minArea);
  const businessFitScores = buildBusinessFitScores(mockLoc, dataConfidence);
  const nearbyBusinesses = buildNearbyBusinesses(mockBusinesses, filters.businessModel, mockLoc);
  const priceEstimate = buildPriceEstimate(mockLoc, areaInfo, mockPrice, now);
  const riskFlags = buildRiskFlags(primaryScore, areaInfo, mockBusinesses, filters.businessModel);
  const areaSummary = buildAreaSummary(mockLoc, areaInfo, primaryScore, trafficData);
  const strategyMemo = buildStrategyMemo(
    primaryScore,
    areaInfo,
    trafficData,
    riskFlags,
    filters.businessModel,
    mockLoc,
    filters.minArea || areaInfo.realEstate.avgPropertySize,
    now
  );

  return {
    id: generateId(),
    location,
    filters,
    businessFitScores,
    nearbyBusinesses,
    priceEstimate,
    riskFlags,
    areaSummary,
    strategyMemo,
    recommendation: getRecommendation(primaryScore.overall),
    confidenceScore: Math.round(dataConfidence * 100),
    status: "completed",
    isSaved: false,
    createdAt: now,
    updatedAt: now,
    completedAt: now,
  };
}

// ---------------------------------------------------------------------------
// Confidence calculation — honest, based on data quality
// ---------------------------------------------------------------------------

function calculateDataConfidence(
  loc: { lat: number; lng: number },
  district: DistrictData,
  businessCount: number
): number {
  // Distance from district center (closer = more confident)
  const cosLat = Math.cos(loc.lat * (Math.PI / 180));
  const dLat = (district.coordinates.lat - loc.lat) * 111_320;
  const dLng = (district.coordinates.lng - loc.lng) * 111_320 * cosLat;
  const distFromCenter = Math.sqrt(dLat * dLat + dLng * dLng);

  // < 1km: full confidence; > 5km: reduced confidence
  const proximityScore = Math.max(0, Math.min(1, 1 - (distFromCenter - 1000) / 4000));

  // Data richness based on businesses found and district size
  const dataScore = Math.min(1, businessCount / 15);

  // Combined confidence: 0.55 floor + up to 0.40 from quality signals
  const combined = 0.55 + proximityScore * 0.25 + dataScore * 0.15;
  return Math.round(combined * 100) / 100;
}

// ---------------------------------------------------------------------------
// Builder helpers
// ---------------------------------------------------------------------------

function buildLocation(
  coordinates: Coordinates,
  areaInfo: DistrictData,
  addressText?: string,
  minArea?: number
): Location {
  return {
    coordinates,
    address: {
      full: addressText || `${areaInfo.name}, TP. Hồ Chí Minh`,
      street: "",
      ward: "",
      district: areaInfo.name,
      city: "TP. Hồ Chí Minh",
      country: "Việt Nam",
    },
    area: minArea || areaInfo.realEstate.avgPropertySize,
    type: "commercial",
  };
}

function buildBusinessFitScores(
  mockLoc: { lat: number; lng: number },
  dataConfidence: number
): BusinessFitScore[] {
  const models: BusinessModel[] = ["fnb", "airbnb", "retail"];

  return models
    .map((model) => {
      const score = calculateBusinessFitScore(mockLoc, model);

      const footTrafficScore = Math.min(100, Math.max(0, Math.round(
        score.breakdown.location * 0.6 + score.breakdown.infrastructure * 0.4
      )));

      return {
        businessModel: model,
        overallScore: score.overall,
        locationScore: score.breakdown.location,
        demographicScore: score.breakdown.demographics,
        competitionScore: score.breakdown.competition,
        footTrafficScore,
        infrastructureScore: score.breakdown.infrastructure,
        breakdown: [
          { category: "Vị trí", score: score.breakdown.location, weight: 25,
            description: "Độ thuận lợi về vị trí địa lý" },
          { category: "Nhân khẩu học", score: score.breakdown.demographics, weight: 25,
            description: "Phù hợp với đối tượng khách hàng mục tiêu" },
          { category: "Cạnh tranh", score: score.breakdown.competition, weight: 20,
            description: "Mức độ cạnh tranh trong khu vực" },
          { category: "Lưu lượng khách", score: footTrafficScore, weight: 15,
            description: "Lưu lượng khách đi bộ và phương tiện" },
          { category: "Hạ tầng", score: score.breakdown.infrastructure, weight: 15,
            description: "Chất lượng hạ tầng giao thông và tiện ích" },
        ],
        confidence: dataConfidence,
      } satisfies BusinessFitScore;
    })
    .sort((a, b) => b.overallScore - a.overallScore);
}

function buildNearbyBusinesses(
  mockBusinesses: MockNearbyBusiness[],
  businessModel: BusinessModel,
  loc: { lat: number; lng: number }
): NearbyBusiness[] {
  const competitorTypes: Record<BusinessModel, string[]> = {
    fnb: ["cafe", "restaurant"],
    airbnb: ["hotel"],
    retail: ["retail"],
  };
  const complementaryTypes: Record<BusinessModel, string[]> = {
    fnb: ["retail", "service", "hotel"],
    airbnb: ["cafe", "restaurant", "service"],
    retail: ["cafe", "restaurant", "service"],
  };

  const rng = new SeededRandom(coordSeed(loc.lat, loc.lng) + 3);

  return mockBusinesses.map((b) => {
    let type: NearbyBusiness["type"] = "neutral";
    if (competitorTypes[businessModel].includes(b.type)) type = "competitor";
    else if (complementaryTypes[businessModel].includes(b.type)) type = "complementary";

    // Review count correlates with rating and brand recognition (deterministic)
    const ratingBonus = (b.rating - 3.0) * 100;
    const reviewCount = Math.max(30, Math.round(80 + ratingBonus + rng.int(-20, 100)));

    return {
      name: b.name,
      category: b.category,
      type,
      distance: Math.round(b.distance) / 1000, // meters → km
      rating: b.rating,
      reviewCount,
      coordinates: b.coordinates,
    };
  });
}

function buildPriceEstimate(
  loc: { lat: number; lng: number },
  areaInfo: DistrictData,
  mockPrice: ReturnType<typeof getMockPriceEstimate>,
  now: string
): PriceEstimate {
  const avgRent = areaInfo.realEstate.avgRentPrice;
  const avgSize = areaInfo.realEstate.avgPropertySize || 50;

  // Price trend deterministically derived from district growth trend
  const trendMap: Record<DistrictData["growthTrend"], {
    trend: PriceEstimate["priceTrend"];
    changePercent: number;
  }> = {
    rapid: { trend: "increasing", changePercent: 8.5 },
    steady: { trend: "increasing", changePercent: 3.5 },
    slow: { trend: "stable", changePercent: 1.0 },
  };
  const { trend, changePercent } = trendMap[areaInfo.growthTrend];

  // Small micro-variation per location
  const rng = new SeededRandom(coordSeed(loc.lat, loc.lng) + 4);
  const predictedChangePercent = Math.round((changePercent + rng.float(-1, 1)) * 10) / 10;

  return {
    monthlyRent: avgRent,
    rentMin: Math.round(avgRent * 0.85),
    rentMax: Math.round(avgRent * 1.15),
    averageRentPerSqm: Math.round(avgRent / avgSize),
    propertyPrice: mockPrice.estimatedPrice,
    propertyPriceMin: mockPrice.range.min,
    propertyPriceMax: mockPrice.range.max,
    comparableCount: mockPrice.comparables,
    priceTrend: trend,
    predictedChangePercent,
    lastUpdated: now,
  };
}

function buildRiskFlags(
  score: LocationScore,
  areaInfo: DistrictData,
  mockBusinesses: MockNearbyBusiness[],
  businessModel: BusinessModel
): RiskFlag[] {
  const risks: RiskFlag[] = [];
  const competitorCount = mockBusinesses.filter((b) => {
    if (businessModel === "fnb") return b.type === "cafe" || b.type === "restaurant";
    if (businessModel === "airbnb") return b.type === "hotel";
    return b.type === "retail";
  }).length;

  if (score.overall < 50) {
    risks.push({
      id: "low-overall-score",
      severity: "high",
      category: "market",
      title: "Điểm tổng thể thấp",
      description: `Điểm phù hợp kinh doanh chỉ đạt ${score.overall}/100`,
      impact: "Khả năng thành công thấp, rủi ro thua lỗ cao",
      mitigation: "Cần có chiến lược khác biệt hóa mạnh mẽ hoặc xem xét địa điểm khác",
      probability: 0.7,
    });
  }

  if (competitorCount >= 8) {
    risks.push({
      id: "high-competition",
      severity: "high",
      category: "competition",
      title: "Mức độ cạnh tranh cao",
      description: `Có ${competitorCount} đối thủ cạnh tranh trong bán kính 500m`,
      impact: "Khó thu hút khách hàng, áp lực giảm giá",
      mitigation: "Tạo điểm khác biệt về sản phẩm/dịch vụ, chất lượng vượt trội",
      probability: 0.65,
    });
  }

  if (score.breakdown.infrastructure < 55) {
    risks.push({
      id: "poor-infrastructure",
      severity: "medium",
      category: "infrastructure",
      title: "Hạ tầng giao thông hạn chế",
      description: `Điểm hạ tầng: ${score.breakdown.infrastructure}/100`,
      impact: "Khó tiếp cận, ảnh hưởng lưu lượng khách hàng",
      mitigation: "Tăng cường marketing online, dịch vụ giao hàng",
      probability: 0.5,
    });
  }

  if (score.breakdown.demographics < 55) {
    risks.push({
      id: "demographics-mismatch",
      severity: businessModel === "retail" ? "high" : "medium",
      category: "market",
      title: "Nhân khẩu học chưa phù hợp",
      description: "Đặc điểm dân số không khớp với mô hình kinh doanh",
      impact: "Sức mua yếu, khó đạt doanh thu mục tiêu",
      mitigation: "Điều chỉnh phân khúc sản phẩm phù hợp với thu nhập địa phương",
      probability: 0.5,
    });
  }

  if (
    (businessModel === "fnb" || businessModel === "retail") &&
    areaInfo.infrastructure.walkScore < 60
  ) {
    risks.push({
      id: "low-foot-traffic",
      severity: "medium",
      category: "market",
      title: "Lưu lượng khách đi bộ thấp",
      description: `Walk Score chỉ ${areaInfo.infrastructure.walkScore}/100`,
      impact: "Ít khách hàng tự nhiên, phụ thuộc marketing",
      mitigation: "Đầu tư vào biển hiệu nổi bật, chương trình khuyến mãi",
      probability: 0.45,
    });
  }

  if (businessModel === "airbnb" && areaInfo.infrastructure.parkingAvailability === "low") {
    risks.push({
      id: "parking-issues",
      severity: "medium",
      category: "infrastructure",
      title: "Thiếu chỗ đậu xe",
      description: "Khu vực có rất ít chỗ đậu xe",
      impact: "Khó thu hút khách có xe, trải nghiệm kém",
      mitigation: "Cung cấp thông tin bãi xe gần, dịch vụ đưa đón",
      probability: 0.4,
    });
  }

  // Rent-to-income ratio risk
  const rentIncomeRatio = areaInfo.realEstate.avgRentPrice / areaInfo.demographics.medianIncome;
  if (rentIncomeRatio > 1.5) {
    risks.push({
      id: "high-rent-cost",
      severity: "high",
      category: "economic",
      title: "Chi phí thuê mặt bằng cao",
      description: `Giá thuê ${(areaInfo.realEstate.avgRentPrice / 1_000_000).toFixed(1)} triệu/tháng, cao so với thu nhập khu vực`,
      impact: "Áp lực hoà vốn cao, cần doanh thu lớn",
      mitigation: "Tối ưu hiệu quả vận hành, đàm phán giá thuê tốt hơn",
      probability: 0.6,
    });
  }

  // Market saturation risk (high business density)
  const businessDensity = areaInfo.business.totalBusinesses / (areaInfo.demographics.population / 1000);
  if (businessDensity > 25) {
    risks.push({
      id: "market-saturation",
      severity: "medium",
      category: "market",
      title: "Thị trường bão hòa",
      description: `Mật độ kinh doanh cao: ${businessDensity.toFixed(1)} doanh nghiệp/1000 dân`,
      impact: "Cạnh tranh gay gắt trên nhiều ngành hàng",
      mitigation: "Tập trung vào ngách thị trường chưa được phục vụ",
      probability: 0.4,
    });
  }

  return risks.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

function buildAreaSummary(
  loc: { lat: number; lng: number },
  areaInfo: DistrictData,
  score: LocationScore,
  trafficData: { footTraffic: number; peakHours: string[] }
): AreaSummary {
  const total = areaInfo.business.totalBusinesses;
  const fnbCount = areaInfo.business.cafes + areaInfo.business.restaurants;
  const retailCount = areaInfo.business.retail;
  const serviceCount = areaInfo.business.services;
  const otherCount = Math.max(0, total - fnbCount - retailCount - serviceCount);

  // Growth rate deterministically derived from district trend
  const growthByTrend: Record<DistrictData["growthTrend"], number> = {
    rapid: 12.5,
    steady: 6.5,
    slow: 2.5,
  };
  const rng = new SeededRandom(coordSeed(loc.lat, loc.lng) + 5);
  const growthRate = Math.round((growthByTrend[areaInfo.growthTrend] + rng.float(-1, 1)) * 10) / 10;

  // Seasonal trends vary by district type (tourist vs residential)
  const seasonalTrends: AreaSummary["seasonalTrends"] = areaInfo.isCBD
    ? [
        { season: "spring", demandLevel: "high" },
        { season: "summer", demandLevel: "medium" },
        { season: "fall", demandLevel: "high" },
        { season: "winter", demandLevel: "high" },
      ]
    : [
        { season: "spring", demandLevel: "medium" },
        { season: "summer", demandLevel: "medium" },
        { season: "fall", demandLevel: "medium" },
        { season: "winter", demandLevel: "high" },
      ];

  return {
    totalBusinesses: total,
    businessesByCategory: [
      { category: "F&B", count: fnbCount, percentage: Math.round((fnbCount / total) * 100) },
      { category: "Retail", count: retailCount, percentage: Math.round((retailCount / total) * 100) },
      { category: "Dịch vụ", count: serviceCount, percentage: Math.round((serviceCount / total) * 100) },
      { category: "Khác", count: otherCount, percentage: Math.round((otherCount / total) * 100) },
    ],
    averageFootTraffic: trafficData.footTraffic,
    averageRent: areaInfo.realEstate.avgRentPrice,
    vacancyRate: 100 - areaInfo.realEstate.occupancyRate,
    marketSaturation: 100 - score.breakdown.competition,
    growthRate,
    peakHours: trafficData.peakHours,
    seasonalTrends,
  };
}

// ---------------------------------------------------------------------------
// Strategy memo with realistic ROI formulas
// ---------------------------------------------------------------------------

function buildStrategyMemo(
  score: LocationScore,
  areaInfo: DistrictData,
  trafficData: { footTraffic: number; weekdayAvg: number; weekendAvg: number },
  riskFlags: RiskFlag[],
  businessModel: BusinessModel,
  loc: { lat: number; lng: number; address: string },
  area: number,
  now: string
): StrategyMemo {
  const modelLabels: Record<BusinessModel, string> = {
    fnb: "F&B",
    airbnb: "Airbnb",
    retail: "Bán lẻ",
  };

  // Summary: dynamic, based on actual scores
  let summary: string;
  const modelLabel = modelLabels[businessModel];
  if (score.overall >= 75) {
    summary = `Địa điểm này có tiềm năng rất cao cho mô hình ${modelLabel} với điểm tổng thể ${score.overall}/100. Khu vực ${areaInfo.name} có ${score.breakdown.location >= 70 ? "vị trí đắc địa" : "vị trí tốt"} và ${score.breakdown.demographics >= 70 ? "nhân khẩu học thuận lợi" : "phân khúc khách hàng phù hợp"}.`;
  } else if (score.overall >= 60) {
    summary = `Địa điểm có tiềm năng tốt (${score.overall}/100) cho ${modelLabel}. Điểm mạnh chính là ${getTopStrength(score)}, cần chú ý ${getTopWeakness(score)}.`;
  } else if (score.overall >= 45) {
    summary = `Địa điểm có tiềm năng trung bình (${score.overall}/100) cho ${modelLabel}. Cần chiến lược khác biệt rõ rệt để khắc phục ${getTopWeakness(score)}.`;
  } else {
    summary = `Địa điểm có nhiều thách thức cho ${modelLabel} (${score.overall}/100). Khuyến nghị cân nhắc địa điểm thay thế hoặc mô hình kinh doanh khác phù hợp hơn.`;
  }

  // Dynamic SWOT — generated from actual data, not hardcoded
  const opportunities = buildOpportunities(score, areaInfo, businessModel);
  const threats = buildThreats(score, areaInfo, riskFlags, businessModel);

  // Recommendations tailored to weaknesses and business model
  const recommendations = buildRecommendations(score, areaInfo, businessModel);

  // Realistic ROI projection based on industry benchmarks
  const roiProjection = calculateROIProjection(
    businessModel,
    score,
    areaInfo,
    trafficData,
    area
  );

  return {
    summary,
    strengths: score.strengths,
    weaknesses: score.weaknesses,
    opportunities,
    threats,
    recommendations,
    roiProjection,
    generatedBy: "Location Intelligence AI Engine v1.0",
    generatedAt: now,
  };
}

function getTopStrength(score: LocationScore): string {
  const parts: Array<[string, number]> = [
    ["vị trí thuận lợi", score.breakdown.location],
    ["nhân khẩu học phù hợp", score.breakdown.demographics],
    ["ít cạnh tranh", score.breakdown.competition],
    ["hạ tầng tốt", score.breakdown.infrastructure],
  ];
  return parts.sort((a, b) => b[1] - a[1])[0][0];
}

function getTopWeakness(score: LocationScore): string {
  const parts: Array<[string, number]> = [
    ["điểm vị trí", score.breakdown.location],
    ["điểm nhân khẩu học", score.breakdown.demographics],
    ["điểm cạnh tranh", score.breakdown.competition],
    ["điểm hạ tầng", score.breakdown.infrastructure],
  ];
  return parts.sort((a, b) => a[1] - b[1])[0][0];
}

function buildOpportunities(
  score: LocationScore,
  areaInfo: DistrictData,
  businessModel: BusinessModel
): string[] {
  const opps: string[] = [];

  if (areaInfo.growthTrend === "rapid") {
    opps.push(`Khu vực ${areaInfo.name} đang phát triển nhanh, có thể hưởng lợi từ tăng trưởng dân số và thương mại`);
  }

  if (score.breakdown.location >= 70) {
    opps.push("Vị trí đắc địa tạo lợi thế marketing tự nhiên, giảm chi phí quảng cáo");
  }

  if (score.breakdown.competition >= 70) {
    opps.push("Mức cạnh tranh thấp, có không gian để xây dựng vị thế dẫn đầu thị trường");
  }

  if (businessModel === "fnb" && areaInfo.demographics.medianAge <= 32) {
    opps.push("Dân số trẻ, phù hợp với các xu hướng F&B mới: specialty coffee, healthy food, food delivery");
  }

  if (businessModel === "airbnb" && areaInfo.isCBD) {
    opps.push("Vị trí trung tâm thu hút khách du lịch quốc tế với mức giá cao hơn");
  }

  if (businessModel === "retail" && areaInfo.demographics.population > 400_000) {
    opps.push(`Dân số lớn (${(areaInfo.demographics.population / 1000).toFixed(0)}k người) tạo nền khách hàng tiềm năng ổn định`);
  }

  if (areaInfo.infrastructure.walkScore >= 75) {
    opps.push("Walk Score cao, thuận lợi cho mô hình kinh doanh phụ thuộc khách đi bộ");
  }

  // Ensure 2-4 items
  if (opps.length < 2) {
    opps.push("Tối ưu hóa kênh online/giao hàng để mở rộng tệp khách hàng");
    opps.push("Hợp tác với doanh nghiệp lân cận để chia sẻ khách hàng");
  }

  return opps.slice(0, 4);
}

function buildThreats(
  score: LocationScore,
  areaInfo: DistrictData,
  riskFlags: RiskFlag[],
  businessModel: BusinessModel
): string[] {
  const threats: string[] = [];

  // Pull highest-severity risks
  const highRisks = riskFlags.filter((r) => r.severity === "high").slice(0, 2);
  threats.push(...highRisks.map((r) => r.title + ": " + r.impact));

  if (areaInfo.realEstate.occupancyRate >= 90) {
    threats.push(`Tỉ lệ thuê lấp đầy ${areaInfo.realEstate.occupancyRate}% — khó tìm mặt bằng tốt, chi phí thuê có thể tăng`);
  }

  if (businessModel === "fnb" && areaInfo.business.cafes + areaInfo.business.restaurants > 1500) {
    threats.push(`Có ${areaInfo.business.cafes + areaInfo.business.restaurants} cơ sở F&B trong khu vực, cạnh tranh rất cao`);
  }

  if (areaInfo.growthTrend === "slow") {
    threats.push(`Khu vực phát triển chậm, khó kỳ vọng tăng trưởng doanh thu nhanh`);
  }

  // Pull remaining risks as threats if slots available
  const mediumRisks = riskFlags.filter((r) => r.severity === "medium");
  for (const r of mediumRisks) {
    if (threats.length >= 4) break;
    threats.push(r.title + ": " + r.impact);
  }

  if (threats.length < 2) {
    threats.push("Biến động giá thuê và chi phí vận hành theo thị trường");
    threats.push("Thay đổi quy hoạch đô thị có thể ảnh hưởng khu vực");
  }

  return threats.slice(0, 4);
}

function buildRecommendations(
  score: LocationScore,
  areaInfo: DistrictData,
  businessModel: BusinessModel
): StrategyMemo["recommendations"] {
  const recs: StrategyMemo["recommendations"] = [];

  // Always: research competitors if they exist
  if (score.breakdown.competition < 75) {
    recs.push({
      priority: score.breakdown.competition < 50 ? "high" : "medium",
      action: "Nghiên cứu kỹ 3-5 đối thủ lớn nhất trong bán kính 500m về giá, menu, dịch vụ",
      expectedImpact: "Xác định khoảng trống thị trường và cơ hội khác biệt hóa",
    });
  }

  // Rent negotiation when high
  if (areaInfo.realEstate.avgRentPrice >= 18_000_000) {
    recs.push({
      priority: "high",
      action: `Đàm phán giá thuê (tham chiếu: ${(areaInfo.realEstate.avgRentPrice / 1_000_000).toFixed(1)}M/tháng trung bình khu vực), yêu cầu thời hạn hợp đồng dài hơn để giảm rủi ro tăng giá`,
      expectedImpact: "Giảm 10-15% chi phí cố định, tăng biên lợi nhuận",
    });
  }

  // Demographics-specific
  if (businessModel === "fnb" && areaInfo.demographics.medianIncome < 13_000_000) {
    recs.push({
      priority: "high",
      action: "Xây dựng menu với combo bình dân (50-120k) song song với các món premium để phủ phân khúc",
      expectedImpact: "Mở rộng tệp khách hàng, tăng tần suất ghé thăm",
    });
  } else if (businessModel === "airbnb" && areaInfo.isCBD) {
    recs.push({
      priority: "high",
      action: "Tối ưu cho khách quốc tế: Booking.com/Agoda listing, mô tả tiếng Anh, tiện nghi đạt chuẩn 4 sao",
      expectedImpact: "Tăng 30-40% giá phòng so với listing tiếng Việt",
    });
  } else if (businessModel === "retail") {
    recs.push({
      priority: "medium",
      action: "Kết hợp O2O: cửa hàng offline + Shopee/Lazada/TikTok Shop để tăng doanh thu mỗi m²",
      expectedImpact: "Tăng 20-30% doanh thu tổng, giảm phụ thuộc vị trí",
    });
  }

  // Infrastructure gap
  if (score.breakdown.infrastructure < 60) {
    recs.push({
      priority: "medium",
      action: `Đầu tư vào ${businessModel === "fnb" ? "Grab/Baemin/Shopee Food" : businessModel === "airbnb" ? "Booking.com và Airbnb Plus" : "Shopee/TikTok Shop"} để bù đắp hạn chế về lưu lượng tự nhiên`,
      expectedImpact: "Tăng 25-40% lượng khách không phụ thuộc vị trí vật lý",
    });
  }

  // Marketing (always applicable)
  recs.push({
    priority: "medium",
    action: "Xây dựng thương hiệu local: Google Maps SEO, Facebook/Instagram local ads, khuyến mãi khai trương",
    expectedImpact: "Tăng nhận diện 30% trong 3 tháng đầu, nền khách hàng trung thành",
  });

  return recs.slice(0, 4);
}

function calculateROIProjection(
  businessModel: BusinessModel,
  score: LocationScore,
  areaInfo: DistrictData,
  trafficData: { footTraffic: number; weekdayAvg: number; weekendAvg: number },
  area: number
): StrategyMemo["roiProjection"] {
  const benchmark = INDUSTRY_BENCHMARKS[businessModel];

  // Scale customers based on: location score, foot traffic, area size
  // Location score modifier: 0.5 at score=30, 1.0 at score=70, 1.3 at score=90
  const locationMultiplier = 0.5 + (score.overall / 100) * 0.9;

  // Area multiplier: linear from 50m² baseline
  const areaMultiplier = Math.max(0.5, Math.min(2.5, area / 50));

  // Foot traffic boost (only applies to fnb/retail, not airbnb)
  const trafficBoost = businessModel === "airbnb"
    ? 1.0
    : Math.max(0.6, Math.min(1.6, trafficData.footTraffic / 3000));

  // Daily customers
  let dailyCustomers: number;
  if (businessModel === "airbnb") {
    // For Airbnb: occupancy rate * 30 nights
    const occupancy = Math.min(0.85, 0.55 + (score.overall / 100) * 0.35);
    dailyCustomers = occupancy; // 0-1 represents occupancy per day
  } else {
    dailyCustomers = benchmark.baseDailyCustomers * locationMultiplier * trafficBoost * Math.sqrt(areaMultiplier);
  }

  // Monthly revenue
  const daysPerMonth = 30;
  const monthlyRevenue = Math.round(dailyCustomers * benchmark.avgTicket * daysPerMonth);

  // Monthly costs: rent + opex
  const rentForArea = Math.round(areaInfo.realEstate.avgRentPrice * (area / areaInfo.realEstate.avgPropertySize));
  const opex = Math.round(monthlyRevenue * benchmark.opexRatio);
  const cogs = Math.round(monthlyRevenue * (1 - benchmark.grossMargin));
  const monthlyCosts = rentForArea + opex + cogs;

  const monthlyProfit = monthlyRevenue - monthlyCosts;

  // Initial investment scales with area
  const initialInvestment = Math.round(benchmark.initialInvestment * areaMultiplier);

  // Break-even: initial investment / monthly profit (cap at 60 months)
  let breakEvenMonths: number;
  if (monthlyProfit <= 0) {
    breakEvenMonths = 60; // "not profitable at current projections"
  } else {
    breakEvenMonths = Math.min(60, Math.ceil(initialInvestment / monthlyProfit));
  }

  // Annual ROI: (monthly profit × 12) / initial investment × 100
  const annualROI = monthlyProfit > 0
    ? Math.round((monthlyProfit * 12 / initialInvestment) * 1000) / 10
    : 0;

  return {
    expectedRevenue: monthlyRevenue,
    expectedCosts: monthlyCosts,
    expectedProfit: monthlyProfit,
    breakEvenMonths,
    annualROI,
  };
}

function getRecommendation(overallScore: number): AnalysisResult["recommendation"] {
  if (overallScore >= 80) return "highly-recommended";
  if (overallScore >= 65) return "recommended";
  if (overallScore >= 50) return "neutral";
  return "not-recommended";
}
