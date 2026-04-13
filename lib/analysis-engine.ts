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
import { generateId } from "./utils";

/**
 * Input for location analysis
 */
export interface AnalyzeLocationInput {
  coordinates: Coordinates;
  addressText?: string;
}

/**
 * Main analysis function - orchestrates all analysis steps.
 * Returns a complete, strongly-typed AnalysisResult ready for UI consumption.
 */
export async function analyzeLocation(
  input: AnalyzeLocationInput,
  filters: AnalysisFilters
): Promise<AnalysisResult> {
  // Simulate API delay for realism
  await new Promise((resolve) => setTimeout(resolve, 800));

  const { coordinates, addressText } = input;
  const mockLoc = {
    lat: coordinates.lat,
    lng: coordinates.lng,
    address: addressText || "Địa điểm được chọn",
  };
  const radius = filters.radius || 500;

  // Gather raw data from mock sources
  const areaInfo = getMockAreaInfo(mockLoc);
  if (!areaInfo) {
    throw new Error("Không tìm thấy thông tin khu vực");
  }

  const mockBusinesses = getMockNearbyBusinesses(mockLoc, radius);
  const mockPrice = getMockPriceEstimate(mockLoc);
  const trafficData = getMockTrafficData(mockLoc);

  // Compute primary score for the selected business model
  const primaryScore = calculateBusinessFitScore(
    mockLoc,
    filters.businessModel
  );

  // Build all canonical shapes
  const now = new Date().toISOString();

  const location = buildLocation(
    coordinates,
    areaInfo,
    addressText,
    filters.minArea
  );
  const businessFitScores = buildBusinessFitScores(
    mockLoc,
    mockPrice.confidence
  );
  const nearbyBusinesses = buildNearbyBusinesses(
    mockBusinesses,
    filters.businessModel
  );
  const priceEstimate = buildPriceEstimate(areaInfo, mockPrice, now);
  const riskFlags = buildRiskFlags(
    primaryScore,
    areaInfo,
    mockBusinesses,
    filters.businessModel
  );
  const areaSummary = buildAreaSummary(areaInfo, primaryScore, trafficData);
  const strategyMemo = buildStrategyMemo(
    primaryScore,
    areaInfo,
    riskFlags,
    filters.businessModel,
    mockLoc.address,
    now
  );

  const recommendation = getRecommendation(primaryScore.overall);

  const result: AnalysisResult = {
    id: generateId(),
    location,
    filters,
    businessFitScores,
    nearbyBusinesses,
    priceEstimate,
    riskFlags,
    areaSummary,
    strategyMemo,
    recommendation,
    confidenceScore: primaryScore.overall,
    status: "completed",
    isSaved: false,
    createdAt: now,
    updatedAt: now,
    completedAt: now,
  };

  return result;
}

// ---------------------------------------------------------------------------
// Builder helpers — each produces one section of the canonical AnalysisResult
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
      full: addressText || `${areaInfo.name}, Hồ Chí Minh`,
      street: "",
      ward: "",
      district: areaInfo.name,
      city: "Hồ Chí Minh",
      country: "Việt Nam",
    },
    area: minArea || areaInfo.realEstate.avgPropertySize,
    type: "commercial",
  };
}

function buildBusinessFitScores(
  mockLoc: { lat: number; lng: number },
  priceConfidence: number
): BusinessFitScore[] {
  const models: BusinessModel[] = ["fnb", "airbnb", "retail"];

  return models
    .map((model) => {
      const score = calculateBusinessFitScore(mockLoc, model);

      // Derive foot-traffic score from location + infrastructure (the scoring
      // module doesn't expose a dedicated foot-traffic axis)
      const footTrafficScore = Math.min(
        100,
        Math.max(
          0,
          Math.round(
            score.breakdown.location * 0.6 +
              score.breakdown.infrastructure * 0.4
          )
        )
      );

      return {
        businessModel: model,
        overallScore: score.overall,
        locationScore: score.breakdown.location,
        demographicScore: score.breakdown.demographics,
        competitionScore: score.breakdown.competition,
        footTrafficScore,
        infrastructureScore: score.breakdown.infrastructure,
        breakdown: [
          {
            category: "Vị trí",
            score: score.breakdown.location,
            weight: 25,
            description: "Độ thuận lợi về vị trí địa lý",
          },
          {
            category: "Nhân khẩu học",
            score: score.breakdown.demographics,
            weight: 25,
            description: "Phù hợp với đối tượng khách hàng mục tiêu",
          },
          {
            category: "Cạnh tranh",
            score: score.breakdown.competition,
            weight: 20,
            description: "Mức độ cạnh tranh trong khu vực",
          },
          {
            category: "Lưu lượng khách",
            score: footTrafficScore,
            weight: 15,
            description: "Lưu lượng khách đi bộ và phương tiện",
          },
          {
            category: "Hạ tầng",
            score: score.breakdown.infrastructure,
            weight: 15,
            description: "Chất lượng hạ tầng giao thông và tiện ích",
          },
        ],
        confidence: priceConfidence,
      } satisfies BusinessFitScore;
    })
    .sort((a, b) => b.overallScore - a.overallScore);
}

function buildNearbyBusinesses(
  mockBusinesses: MockNearbyBusiness[],
  businessModel: BusinessModel
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

  return mockBusinesses.map((b) => {
    let type: NearbyBusiness["type"] = "neutral";
    if (competitorTypes[businessModel].includes(b.type)) type = "competitor";
    else if (complementaryTypes[businessModel].includes(b.type))
      type = "complementary";

    return {
      name: b.name,
      category: b.category,
      type,
      distance: Math.round(b.distance) / 1000, // meters → km
      rating: b.rating,
      reviewCount: Math.floor(Math.random() * 500) + 50,
      coordinates: b.coordinates,
    };
  });
}

function buildPriceEstimate(
  areaInfo: DistrictData,
  mockPrice: ReturnType<typeof getMockPriceEstimate>,
  now: string
): PriceEstimate {
  const avgRent = areaInfo.realEstate.avgRentPrice;
  const avgSize = areaInfo.realEstate.avgPropertySize || 50;

  return {
    monthlyRent: avgRent,
    rentMin: Math.round(avgRent * 0.85),
    rentMax: Math.round(avgRent * 1.15),
    averageRentPerSqm: Math.round(avgRent / avgSize),
    propertyPrice: mockPrice.estimatedPrice,
    propertyPriceMin: mockPrice.range.min,
    propertyPriceMax: mockPrice.range.max,
    comparableCount: mockPrice.comparables,
    priceTrend: Math.random() > 0.5 ? "increasing" : "stable",
    predictedChangePercent:
      Math.round((Math.random() * 10 - 2) * 10) / 10,
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

  if (score.overall < 50) {
    risks.push({
      id: "low-overall-score",
      severity: "high",
      category: "market",
      title: "Điểm tổng thể thấp",
      description: `Điểm phù hợp kinh doanh chỉ đạt ${score.overall}/100`,
      impact: "Khả năng thành công thấp, rủi ro thua lỗ cao",
      mitigation:
        "Cần có chiến lược khác biệt hóa mạnh mẽ hoặc xem xét địa điểm khác",
      probability: 0.7,
    });
  }

  if (score.breakdown.competition < 45) {
    const competitorCount = mockBusinesses.filter((b) => {
      if (businessModel === "fnb")
        return b.type === "cafe" || b.type === "restaurant";
      if (businessModel === "airbnb") return b.type === "hotel";
      if (businessModel === "retail") return b.type === "retail";
      return false;
    }).length;

    risks.push({
      id: "high-competition",
      severity: "high",
      category: "competition",
      title: "Mức độ cạnh tranh cao",
      description: `Có ${competitorCount} đối thủ cạnh tranh trong bán kính 500m`,
      impact: "Khó thu hút khách hàng, áp lực giảm giá",
      mitigation:
        "Tạo điểm khác biệt về sản phẩm/dịch vụ, chất lượng vượt trội",
      probability: 0.6,
    });
  }

  if (score.breakdown.infrastructure < 50) {
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

  if (score.breakdown.demographics < 50) {
    risks.push({
      id: "demographics-mismatch",
      severity: businessModel === "retail" ? "high" : "medium",
      category: "market",
      title: "Nhân khẩu học chưa phù hợp",
      description:
        "Đặc điểm dân số không match với mô hình kinh doanh",
      impact: "Sức mua yếu, khó đạt doanh thu mục tiêu",
      mitigation:
        "Điều chỉnh phân khúc sản phẩm phù hợp với thu nhập địa phương",
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
      description: `Walk score chỉ ${areaInfo.infrastructure.walkScore}/100`,
      impact: "Ít khách hàng tự nhiên, phụ thuộc marketing",
      mitigation:
        "Đầu tư vào biển hiệu nổi bật, chương trình khuyến mãi",
      probability: 0.4,
    });
  }

  if (
    businessModel === "airbnb" &&
    areaInfo.infrastructure.parkingAvailability === "low"
  ) {
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

  if (
    areaInfo.realEstate.avgRentPrice > 20_000_000 &&
    areaInfo.demographics.medianIncome < 14_000_000
  ) {
    risks.push({
      id: "high-rent-cost",
      severity: "high",
      category: "economic",
      title: "Chi phí thuê mặt bằng cao",
      description: `Giá thuê trung bình ${(areaInfo.realEstate.avgRentPrice / 1_000_000).toFixed(1)} triệu/tháng`,
      impact: "Áp lực hoà vốn cao, cần doanh thu lớn",
      mitigation:
        "Tối ưu hiệu quả vận hành, đàm phán giá thuê tốt hơn",
      probability: 0.6,
    });
  }

  return risks.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

function buildAreaSummary(
  areaInfo: DistrictData,
  score: LocationScore,
  trafficData: { footTraffic: number; peakHours: string[] }
): AreaSummary {
  const total = areaInfo.business.totalBusinesses;
  const fnbCount =
    areaInfo.business.cafes + areaInfo.business.restaurants;
  const retailCount = areaInfo.business.retail;
  const serviceCount = areaInfo.business.services;
  const otherCount = total - fnbCount - retailCount - serviceCount;

  return {
    totalBusinesses: total,
    businessesByCategory: [
      {
        category: "F&B",
        count: fnbCount,
        percentage: Math.round((fnbCount / total) * 100),
      },
      {
        category: "Retail",
        count: retailCount,
        percentage: Math.round((retailCount / total) * 100),
      },
      {
        category: "Dịch vụ",
        count: serviceCount,
        percentage: Math.round((serviceCount / total) * 100),
      },
      {
        category: "Khác",
        count: Math.max(0, otherCount),
        percentage: Math.max(
          0,
          Math.round((otherCount / total) * 100)
        ),
      },
    ],
    averageFootTraffic: trafficData.footTraffic,
    averageRent: areaInfo.realEstate.avgRentPrice,
    vacancyRate: 100 - areaInfo.realEstate.occupancyRate,
    marketSaturation: 100 - score.breakdown.competition,
    growthRate: Math.round((Math.random() * 10 + 5) * 10) / 10,
    peakHours: trafficData.peakHours,
    seasonalTrends: [
      { season: "spring", demandLevel: "high" },
      { season: "summer", demandLevel: "medium" },
      { season: "fall", demandLevel: "medium" },
      { season: "winter", demandLevel: "high" },
    ],
  };
}

function buildStrategyMemo(
  score: LocationScore,
  areaInfo: DistrictData,
  riskFlags: RiskFlag[],
  businessModel: BusinessModel,
  address: string,
  now: string
): StrategyMemo {
  const modelLabels: Record<BusinessModel, string> = {
    fnb: "F&B",
    airbnb: "Airbnb",
    retail: "Bán lẻ",
  };

  let summary: string;
  if (score.overall >= 75) {
    summary = `Địa điểm ${address} có tiềm năng rất cao cho mô hình ${modelLabels[businessModel]} với điểm tổng thể ${score.overall}/100.`;
  } else if (score.overall >= 60) {
    summary = `Địa điểm ${address} có tiềm năng tốt cho mô hình ${modelLabels[businessModel]}, cần cân nhắc kỹ một số yếu tố.`;
  } else if (score.overall >= 45) {
    summary = `Địa điểm ${address} có tiềm năng trung bình cho mô hình ${modelLabels[businessModel]}, cần chiến lược mạnh mẽ.`;
  } else {
    summary = `Địa điểm ${address} có nhiều thách thức cho mô hình ${modelLabels[businessModel]}, cần xem xét kỹ.`;
  }

  const opportunities: string[] = [
    "Tận dụng vị trí thuận lợi để thu hút khách hàng",
    "Mở rộng dịch vụ online và giao hàng",
    "Hợp tác với các doanh nghiệp lân cận",
  ];

  const threats = riskFlags.slice(0, 3).map((r) => r.description);

  const expectedRevenue = Math.round(
    areaInfo.demographics.medianIncome * 0.7 * 100
  );
  const expectedCosts = Math.round(
    areaInfo.realEstate.avgRentPrice + 15_000_000
  );

  return {
    summary,
    strengths: score.strengths,
    weaknesses: score.weaknesses,
    opportunities,
    threats,
    recommendations: [
      {
        priority: "high",
        action: "Nghiên cứu kỹ đối thủ cạnh tranh trong khu vực",
        expectedImpact:
          "Tạo lợi thế khác biệt hóa và thu hút khách hàng",
      },
      {
        priority: "high",
        action: "Tối ưu giá thuê và chi phí vận hành",
        expectedImpact: "Rút ngắn thời gian hoàn vốn",
      },
      {
        priority: "medium",
        action: "Đầu tư vào marketing địa phương",
        expectedImpact: "Tăng nhận diện thương hiệu trong khu vực",
      },
    ],
    roiProjection: {
      expectedRevenue,
      expectedCosts,
      expectedProfit: expectedRevenue - expectedCosts,
      breakEvenMonths: Math.ceil(Math.random() * 12 + 6),
      annualROI: Math.round((Math.random() * 30 + 15) * 10) / 10,
    },
    generatedBy: "Location Intelligence AI Engine v1.0",
    generatedAt: now,
  };
}

function getRecommendation(
  overallScore: number
): AnalysisResult["recommendation"] {
  if (overallScore >= 80) return "highly-recommended";
  if (overallScore >= 65) return "recommended";
  if (overallScore >= 50) return "neutral";
  return "not-recommended";
}
