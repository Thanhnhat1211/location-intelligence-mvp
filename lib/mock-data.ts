/**
 * District data and deterministic data generation for HCMC.
 *
 * IMPORTANT — admin units context (2025+):
 * Vietnam restructured its administrative units in mid-2025. The old "Quận X"
 * level was reorganized and many wards were merged. The 17 entries below
 * intentionally remain keyed to the legacy district names because they
 * represent stable *demographic / commercial zones* — the macro patterns
 * (population, income tier, business density) carry over even after admin
 * boundaries shifted. For the legally-current ward/district name shown to
 * users, we always defer to Nominatim's reverse-geocode output (see
 * `buildLocation` in analysis-engine.ts).
 *
 * Data lineage:
 * - Demographics & infrastructure: 2024 estimates from GSO + various market
 *   reports (Savills, CBRE, JLL Q4 2024). Not officially audited.
 * - Real-estate prices (rent/sale): 2024 averages. For *current-state* prices
 *   the system prefers user-uploaded comps via /api/upload-comps, falling
 *   back to these averages only when no nearby comps exist.
 *
 * Determinism:
 * - All "random" generation uses SeededRandom keyed to coordinates so the
 *   same location always produces the same output.
 */

import { SeededRandom, coordSeed } from "./seeded-random";

/** When the bundled district statistics were compiled. */
export const DISTRICT_DATA_AS_OF = "2024-Q4";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DistrictData {
  id: string;
  name: string;
  nameEn: string;
  coordinates: { lat: number; lng: number };
  demographics: {
    population: number;
    medianAge: number;
    medianIncome: number; // VND/month
    households: number;
    avgHouseholdSize: number;
  };
  realEstate: {
    avgRentPrice: number; // VND/month for commercial space
    avgSalePrice: number; // VND/m2
    occupancyRate: number; // %
    avgPropertySize: number; // m2
  };
  business: {
    totalBusinesses: number;
    cafes: number;
    restaurants: number;
    retail: number;
    services: number;
  };
  infrastructure: {
    transitScore: number; // 0-100
    walkScore: number; // 0-100
    parkingAvailability: "low" | "medium" | "high";
  };
  /** District development trend: how fast the area is growing commercially */
  growthTrend: "rapid" | "steady" | "slow";
  /** Whether the district is considered a central business district */
  isCBD: boolean;
}

export interface NearbyBusiness {
  id: string;
  name: string;
  type: "cafe" | "restaurant" | "retail" | "service" | "hotel";
  category: string;
  distance: number;
  rating: number;
  priceRange: number;
  coordinates: { lat: number; lng: number };
}

// ---------------------------------------------------------------------------
// All 17 HCMC districts — realistic data based on census & market reports
// ---------------------------------------------------------------------------

const DISTRICTS: Record<string, DistrictData> = {
  "district-1": {
    id: "district-1",
    name: "Quận 1",
    nameEn: "District 1",
    coordinates: { lat: 10.7756, lng: 106.7019 },
    demographics: {
      population: 204_899,
      medianAge: 36,
      medianIncome: 18_000_000,
      households: 68_300,
      avgHouseholdSize: 3.0,
    },
    realEstate: {
      avgRentPrice: 35_000_000,
      avgSalePrice: 150_000_000,
      occupancyRate: 93,
      avgPropertySize: 60,
    },
    business: {
      totalBusinesses: 14_500,
      cafes: 950,
      restaurants: 1_400,
      retail: 3_800,
      services: 2_500,
    },
    infrastructure: { transitScore: 95, walkScore: 92, parkingAvailability: "low" },
    growthTrend: "steady",
    isCBD: true,
  },
  "district-2": {
    id: "district-2",
    name: "Quận 2",
    nameEn: "District 2 (Thu Duc City - An Phu/Thao Dien)",
    coordinates: { lat: 10.7870, lng: 106.7400 },
    demographics: {
      population: 171_480,
      medianAge: 31,
      medianIncome: 16_000_000,
      households: 57_160,
      avgHouseholdSize: 3.0,
    },
    realEstate: {
      avgRentPrice: 22_000_000,
      avgSalePrice: 90_000_000,
      occupancyRate: 86,
      avgPropertySize: 70,
    },
    business: {
      totalBusinesses: 5_200,
      cafes: 380,
      restaurants: 520,
      retail: 1_400,
      services: 900,
    },
    infrastructure: { transitScore: 65, walkScore: 60, parkingAvailability: "high" },
    growthTrend: "rapid",
    isCBD: false,
  },
  "district-3": {
    id: "district-3",
    name: "Quận 3",
    nameEn: "District 3",
    coordinates: { lat: 10.7866, lng: 106.6839 },
    demographics: {
      population: 188_945,
      medianAge: 35,
      medianIncome: 16_500_000,
      households: 62_982,
      avgHouseholdSize: 3.0,
    },
    realEstate: {
      avgRentPrice: 28_000_000,
      avgSalePrice: 110_000_000,
      occupancyRate: 90,
      avgPropertySize: 55,
    },
    business: {
      totalBusinesses: 10_800,
      cafes: 720,
      restaurants: 980,
      retail: 2_800,
      services: 1_900,
    },
    infrastructure: { transitScore: 88, walkScore: 86, parkingAvailability: "low" },
    growthTrend: "steady",
    isCBD: true,
  },
  "district-4": {
    id: "district-4",
    name: "Quận 4",
    nameEn: "District 4",
    coordinates: { lat: 10.7579, lng: 106.7065 },
    demographics: {
      population: 183_261,
      medianAge: 33,
      medianIncome: 11_500_000,
      households: 61_087,
      avgHouseholdSize: 3.0,
    },
    realEstate: {
      avgRentPrice: 12_000_000,
      avgSalePrice: 55_000_000,
      occupancyRate: 80,
      avgPropertySize: 45,
    },
    business: {
      totalBusinesses: 4_500,
      cafes: 280,
      restaurants: 450,
      retail: 1_200,
      services: 700,
    },
    infrastructure: { transitScore: 60, walkScore: 62, parkingAvailability: "medium" },
    growthTrend: "rapid",
    isCBD: false,
  },
  "district-5": {
    id: "district-5",
    name: "Quận 5",
    nameEn: "District 5 (Cho Lon)",
    coordinates: { lat: 10.7540, lng: 106.6633 },
    demographics: {
      population: 159_876,
      medianAge: 38,
      medianIncome: 14_500_000,
      households: 53_292,
      avgHouseholdSize: 3.0,
    },
    realEstate: {
      avgRentPrice: 18_000_000,
      avgSalePrice: 75_000_000,
      occupancyRate: 87,
      avgPropertySize: 50,
    },
    business: {
      totalBusinesses: 8_900,
      cafes: 420,
      restaurants: 780,
      retail: 3_200,
      services: 1_400,
    },
    infrastructure: { transitScore: 78, walkScore: 75, parkingAvailability: "medium" },
    growthTrend: "slow",
    isCBD: false,
  },
  "district-6": {
    id: "district-6",
    name: "Quận 6",
    nameEn: "District 6",
    coordinates: { lat: 10.7480, lng: 106.6350 },
    demographics: {
      population: 252_817,
      medianAge: 34,
      medianIncome: 11_000_000,
      households: 84_272,
      avgHouseholdSize: 3.0,
    },
    realEstate: {
      avgRentPrice: 10_000_000,
      avgSalePrice: 45_000_000,
      occupancyRate: 78,
      avgPropertySize: 48,
    },
    business: {
      totalBusinesses: 5_800,
      cafes: 310,
      restaurants: 520,
      retail: 2_100,
      services: 850,
    },
    infrastructure: { transitScore: 58, walkScore: 55, parkingAvailability: "medium" },
    growthTrend: "slow",
    isCBD: false,
  },
  "district-7": {
    id: "district-7",
    name: "Quận 7",
    nameEn: "District 7 (Phu My Hung)",
    coordinates: { lat: 10.7340, lng: 106.7220 },
    demographics: {
      population: 353_640,
      medianAge: 32,
      medianIncome: 16_000_000,
      households: 117_880,
      avgHouseholdSize: 3.0,
    },
    realEstate: {
      avgRentPrice: 20_000_000,
      avgSalePrice: 85_000_000,
      occupancyRate: 88,
      avgPropertySize: 65,
    },
    business: {
      totalBusinesses: 7_600,
      cafes: 520,
      restaurants: 680,
      retail: 2_200,
      services: 1_300,
    },
    infrastructure: { transitScore: 72, walkScore: 68, parkingAvailability: "high" },
    growthTrend: "rapid",
    isCBD: false,
  },
  "district-8": {
    id: "district-8",
    name: "Quận 8",
    nameEn: "District 8",
    coordinates: { lat: 10.7240, lng: 106.6530 },
    demographics: {
      population: 440_283,
      medianAge: 31,
      medianIncome: 10_500_000,
      households: 146_761,
      avgHouseholdSize: 3.0,
    },
    realEstate: {
      avgRentPrice: 8_000_000,
      avgSalePrice: 38_000_000,
      occupancyRate: 75,
      avgPropertySize: 45,
    },
    business: {
      totalBusinesses: 5_200,
      cafes: 260,
      restaurants: 420,
      retail: 1_800,
      services: 680,
    },
    infrastructure: { transitScore: 50, walkScore: 48, parkingAvailability: "high" },
    growthTrend: "steady",
    isCBD: false,
  },
  "district-9": {
    id: "district-9",
    name: "Quận 9",
    nameEn: "District 9 (Thu Duc City - East)",
    coordinates: { lat: 10.8420, lng: 106.8200 },
    demographics: {
      population: 358_504,
      medianAge: 28,
      medianIncome: 12_500_000,
      households: 119_501,
      avgHouseholdSize: 3.0,
    },
    realEstate: {
      avgRentPrice: 10_000_000,
      avgSalePrice: 42_000_000,
      occupancyRate: 77,
      avgPropertySize: 55,
    },
    business: {
      totalBusinesses: 4_800,
      cafes: 280,
      restaurants: 380,
      retail: 1_500,
      services: 720,
    },
    infrastructure: { transitScore: 48, walkScore: 42, parkingAvailability: "high" },
    growthTrend: "rapid",
    isCBD: false,
  },
  "district-10": {
    id: "district-10",
    name: "Quận 10",
    nameEn: "District 10",
    coordinates: { lat: 10.7720, lng: 106.6670 },
    demographics: {
      population: 233_554,
      medianAge: 34,
      medianIncome: 14_000_000,
      households: 77_851,
      avgHouseholdSize: 3.0,
    },
    realEstate: {
      avgRentPrice: 16_000_000,
      avgSalePrice: 70_000_000,
      occupancyRate: 86,
      avgPropertySize: 50,
    },
    business: {
      totalBusinesses: 8_200,
      cafes: 520,
      restaurants: 720,
      retail: 2_600,
      services: 1_500,
    },
    infrastructure: { transitScore: 80, walkScore: 78, parkingAvailability: "medium" },
    growthTrend: "steady",
    isCBD: false,
  },
  "district-11": {
    id: "district-11",
    name: "Quận 11",
    nameEn: "District 11",
    coordinates: { lat: 10.7620, lng: 106.6500 },
    demographics: {
      population: 224_548,
      medianAge: 35,
      medianIncome: 13_000_000,
      households: 74_849,
      avgHouseholdSize: 3.0,
    },
    realEstate: {
      avgRentPrice: 13_000_000,
      avgSalePrice: 58_000_000,
      occupancyRate: 83,
      avgPropertySize: 48,
    },
    business: {
      totalBusinesses: 6_500,
      cafes: 350,
      restaurants: 580,
      retail: 2_300,
      services: 1_000,
    },
    infrastructure: { transitScore: 68, walkScore: 65, parkingAvailability: "medium" },
    growthTrend: "slow",
    isCBD: false,
  },
  "district-12": {
    id: "district-12",
    name: "Quận 12",
    nameEn: "District 12",
    coordinates: { lat: 10.8670, lng: 106.6550 },
    demographics: {
      population: 620_580,
      medianAge: 29,
      medianIncome: 11_000_000,
      households: 206_860,
      avgHouseholdSize: 3.0,
    },
    realEstate: {
      avgRentPrice: 8_000_000,
      avgSalePrice: 35_000_000,
      occupancyRate: 76,
      avgPropertySize: 50,
    },
    business: {
      totalBusinesses: 6_800,
      cafes: 380,
      restaurants: 520,
      retail: 2_400,
      services: 900,
    },
    infrastructure: { transitScore: 52, walkScore: 45, parkingAvailability: "high" },
    growthTrend: "rapid",
    isCBD: false,
  },
  "thu-duc": {
    id: "thu-duc",
    name: "TP. Thủ Đức",
    nameEn: "Thu Duc City",
    coordinates: { lat: 10.8509, lng: 106.7623 },
    demographics: {
      population: 1_200_000,
      medianAge: 29,
      medianIncome: 13_500_000,
      households: 400_000,
      avgHouseholdSize: 3.0,
    },
    realEstate: {
      avgRentPrice: 14_000_000,
      avgSalePrice: 62_000_000,
      occupancyRate: 81,
      avgPropertySize: 55,
    },
    business: {
      totalBusinesses: 15_600,
      cafes: 980,
      restaurants: 1_350,
      retail: 4_800,
      services: 3_200,
    },
    infrastructure: { transitScore: 62, walkScore: 55, parkingAvailability: "high" },
    growthTrend: "rapid",
    isCBD: false,
  },
  "binh-thanh": {
    id: "binh-thanh",
    name: "Bình Thạnh",
    nameEn: "Binh Thanh District",
    coordinates: { lat: 10.8050, lng: 106.7138 },
    demographics: {
      population: 498_943,
      medianAge: 32,
      medianIncome: 14_500_000,
      households: 166_314,
      avgHouseholdSize: 3.0,
    },
    realEstate: {
      avgRentPrice: 18_000_000,
      avgSalePrice: 75_000_000,
      occupancyRate: 85,
      avgPropertySize: 52,
    },
    business: {
      totalBusinesses: 12_200,
      cafes: 780,
      restaurants: 1_050,
      retail: 3_400,
      services: 2_400,
    },
    infrastructure: { transitScore: 78, walkScore: 72, parkingAvailability: "medium" },
    growthTrend: "steady",
    isCBD: false,
  },
  "phu-nhuan": {
    id: "phu-nhuan",
    name: "Phú Nhuận",
    nameEn: "Phu Nhuan District",
    coordinates: { lat: 10.7990, lng: 106.6825 },
    demographics: {
      population: 181_522,
      medianAge: 34,
      medianIncome: 15_500_000,
      households: 60_507,
      avgHouseholdSize: 3.0,
    },
    realEstate: {
      avgRentPrice: 20_000_000,
      avgSalePrice: 88_000_000,
      occupancyRate: 88,
      avgPropertySize: 55,
    },
    business: {
      totalBusinesses: 8_500,
      cafes: 580,
      restaurants: 750,
      retail: 2_400,
      services: 1_650,
    },
    infrastructure: { transitScore: 82, walkScore: 80, parkingAvailability: "medium" },
    growthTrend: "steady",
    isCBD: false,
  },
  "tan-binh": {
    id: "tan-binh",
    name: "Tân Bình",
    nameEn: "Tan Binh District",
    coordinates: { lat: 10.8020, lng: 106.6520 },
    demographics: {
      population: 468_516,
      medianAge: 33,
      medianIncome: 13_500_000,
      households: 156_172,
      avgHouseholdSize: 3.0,
    },
    realEstate: {
      avgRentPrice: 15_000_000,
      avgSalePrice: 65_000_000,
      occupancyRate: 84,
      avgPropertySize: 50,
    },
    business: {
      totalBusinesses: 9_800,
      cafes: 580,
      restaurants: 820,
      retail: 3_200,
      services: 1_800,
    },
    infrastructure: { transitScore: 75, walkScore: 68, parkingAvailability: "medium" },
    growthTrend: "steady",
    isCBD: false,
  },
  "tan-phu": {
    id: "tan-phu",
    name: "Tân Phú",
    nameEn: "Tan Phu District",
    coordinates: { lat: 10.7920, lng: 106.6280 },
    demographics: {
      population: 471_562,
      medianAge: 31,
      medianIncome: 12_000_000,
      households: 157_187,
      avgHouseholdSize: 3.0,
    },
    realEstate: {
      avgRentPrice: 11_000_000,
      avgSalePrice: 48_000_000,
      occupancyRate: 81,
      avgPropertySize: 48,
    },
    business: {
      totalBusinesses: 7_200,
      cafes: 420,
      restaurants: 580,
      retail: 2_800,
      services: 1_100,
    },
    infrastructure: { transitScore: 62, walkScore: 58, parkingAvailability: "high" },
    growthTrend: "steady",
    isCBD: false,
  },
  "go-vap": {
    id: "go-vap",
    name: "Gò Vấp",
    nameEn: "Go Vap District",
    coordinates: { lat: 10.8376, lng: 106.6717 },
    demographics: {
      population: 682_946,
      medianAge: 30,
      medianIncome: 12_500_000,
      households: 227_649,
      avgHouseholdSize: 3.0,
    },
    realEstate: {
      avgRentPrice: 12_000_000,
      avgSalePrice: 52_000_000,
      occupancyRate: 82,
      avgPropertySize: 48,
    },
    business: {
      totalBusinesses: 10_800,
      cafes: 650,
      restaurants: 920,
      retail: 3_500,
      services: 2_100,
    },
    infrastructure: { transitScore: 68, walkScore: 62, parkingAvailability: "high" },
    growthTrend: "steady",
    isCBD: false,
  },
  "binh-tan": {
    id: "binh-tan",
    name: "Bình Tân",
    nameEn: "Binh Tan District",
    coordinates: { lat: 10.7650, lng: 106.6030 },
    demographics: {
      population: 784_173,
      medianAge: 29,
      medianIncome: 10_500_000,
      households: 261_391,
      avgHouseholdSize: 3.0,
    },
    realEstate: {
      avgRentPrice: 8_000_000,
      avgSalePrice: 35_000_000,
      occupancyRate: 76,
      avgPropertySize: 50,
    },
    business: {
      totalBusinesses: 8_500,
      cafes: 420,
      restaurants: 620,
      retail: 3_200,
      services: 1_200,
    },
    infrastructure: { transitScore: 48, walkScore: 42, parkingAvailability: "high" },
    growthTrend: "rapid",
    isCBD: false,
  },
};

// ---------------------------------------------------------------------------
// Business name pools (real Vietnamese brands & common names)
// ---------------------------------------------------------------------------

const BUSINESS_NAMES = {
  cafe: [
    "The Coffee House", "Highlands Coffee", "Phúc Long Coffee & Tea",
    "Trung Nguyên Legend", "Cộng Cà Phê", "L'amant Cafe", "Urban Station",
    "Kafe Collective", "Saigon Coffee Roastery", "Aha Cafe",
    "The Workshop Coffee", "Maison Marou", "Nest by AIA", "Passio Coffee",
    "King Coffee", "Milano Coffee", "Café Amazon", "Starbucks",
  ],
  restaurant: [
    "Nhà Hàng Ngọc Sương", "Quán Bụi", "Cơm Tấm Mộc", "Phở Hòa Pasteur",
    "Pizza 4P's", "Món Huế", "Bún Bò Huế 3A3", "Secret Garden Restaurant",
    "Propaganda Bistro", "Bánh Xèo 46A", "Hum Vegetarian", "Cục Gạch Quán",
    "Golden Gate Restaurant", "Wrap & Roll", "Lotteria", "Jollibee",
    "McDonald's", "KFC Vietnam",
  ],
  retail: [
    "WinMart", "Circle K", "Family Mart", "Bách Hóa Xanh", "Guardian",
    "Watsons", "Điện Máy Xanh", "Thế Giới Di Động", "FPT Shop",
    "Canifa", "Uniqlo", "Decathlon", "Muji", "Miniso", "GS25",
    "7-Eleven", "Co.op Food", "Lotte Mart",
  ],
  service: [
    "30Shine", "California Fitness & Yoga", "Dalat Hasfarm", "Laundry Express",
    "Nha Khoa Paris", "Thẩm Mỹ Viện Kangnam", "GoldGym", "Elite Fitness",
    "Pet Mart", "Bảo Tín Minh Châu", "Điện Lạnh Thiên Hòa",
  ],
  hotel: [
    "Caravelle Saigon", "Liberty Central", "Fusion Suites", "The Reverie Saigon",
    "Alagon Saigon Hotel", "Silverland Jolie", "Grand Saigon Hotel",
    "Boss Legend Hotel", "Sanouva Saigon", "A&EM Hotel",
  ],
};

const CATEGORIES: Record<string, string[]> = {
  cafe: ["Cà phê", "Trà sữa", "Quán cà phê"],
  restaurant: ["Nhà hàng", "Quán ăn", "Món Việt", "Món Âu", "Fast food"],
  retail: ["Siêu thị mini", "Cửa hàng tiện lợi", "Thời trang", "Điện tử", "Tạp hóa"],
  service: ["Làm đẹp", "Spa & Gym", "Y tế", "Dịch vụ", "Giặt ủi"],
  hotel: ["Khách sạn", "Căn hộ dịch vụ"],
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Find the nearest district to the given coordinates.
 * Uses Haversine-like distance (scaled for HCMC latitude).
 */
export function getMockAreaInfo(location: {
  lat: number;
  lng: number;
  address?: string;
}): DistrictData | null {
  let closestDistrict: DistrictData | null = null;
  let minDistance = Infinity;

  const cosLat = Math.cos(location.lat * (Math.PI / 180));

  Object.values(DISTRICTS).forEach((district) => {
    const dLat = (district.coordinates.lat - location.lat) * 111_320; // meters
    const dLng = (district.coordinates.lng - location.lng) * 111_320 * cosLat;
    const distance = Math.sqrt(dLat * dLat + dLng * dLng);
    if (distance < minDistance) {
      minDistance = distance;
      closestDistrict = district;
    }
  });

  return closestDistrict;
}

/**
 * Generate nearby businesses deterministically based on coordinates.
 * Same location always returns same businesses.
 */
export function getMockNearbyBusinesses(
  location: { lat: number; lng: number },
  radius: number = 500,
  _types?: string[]
): NearbyBusiness[] {
  const rng = new SeededRandom(coordSeed(location.lat, location.lng));
  const district = getMockAreaInfo(location);
  if (!district) return [];

  // Business count based on district density, not random
  const densityFactor = district.business.totalBusinesses / 10_000;
  const baseCount = Math.round(12 * densityFactor);
  const count = Math.max(8, Math.min(22, baseCount + rng.int(-2, 2)));

  // Weight types by district composition
  const total = district.business.cafes + district.business.restaurants +
    district.business.retail + district.business.services;
  const weights = {
    cafe: district.business.cafes / total,
    restaurant: district.business.restaurants / total,
    retail: district.business.retail / total,
    service: district.business.services / total,
    hotel: district.isCBD ? 0.05 : 0.02,
  };

  const businesses: NearbyBusiness[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    // Pick type based on district weights
    const roll = rng.next();
    let cumulative = 0;
    let type: NearbyBusiness["type"] = "cafe";
    for (const [t, w] of Object.entries(weights)) {
      cumulative += w;
      if (roll < cumulative) {
        type = t as NearbyBusiness["type"];
        break;
      }
    }

    // Pick a unique name
    const names = BUSINESS_NAMES[type];
    let name = rng.pick(names);
    if (usedNames.has(name)) {
      name = name + " " + rng.pick(["Express", "Plus", "Mini", "2", "3"]);
    }
    usedNames.add(name);

    // Deterministic position within radius
    const angle = rng.float(0, 2 * Math.PI);
    // Bias toward closer distances (more realistic — most POIs are clustered)
    const distFraction = rng.next() * rng.next(); // squared distribution: more near, fewer far
    const distance = Math.max(20, Math.round(distFraction * radius));
    const latOffset = (distance * Math.cos(angle)) / 111_320;
    const lngOffset = (distance * Math.sin(angle)) /
      (111_320 * Math.cos(location.lat * (Math.PI / 180)));

    // Rating based on district affluence (higher income → higher average ratings)
    const incomeBonus = (district.demographics.medianIncome - 10_000_000) / 20_000_000;
    const baseRating = 3.2 + incomeBonus * 0.8; // 3.2–4.0 base
    const rating = Math.round(Math.min(5.0, Math.max(3.0,
      baseRating + rng.float(-0.5, 0.8))) * 10) / 10;

    const categoryOptions = CATEGORIES[type] || ["Khác"];
    const category = categoryOptions[rng.int(0, categoryOptions.length - 1)];

    // Price range correlates with district rent levels
    const rentLevel = district.realEstate.avgRentPrice / 35_000_000; // normalize to Q1
    const priceRange = Math.max(1, Math.min(4,
      Math.round(rentLevel * 2.5 + rng.float(-0.5, 0.5))));

    businesses.push({
      id: `biz-${i}-${coordSeed(location.lat, location.lng) & 0xffff}`,
      name,
      type,
      category,
      distance,
      rating,
      priceRange,
      coordinates: {
        lat: location.lat + latOffset,
        lng: location.lng + lngOffset,
      },
    });
  }

  return businesses.sort((a, b) => a.distance - b.distance);
}

/**
 * Deterministic price estimate based on district + micro-location.
 */
export function getMockPriceEstimate(
  location: { lat: number; lng: number },
  _propertyType: "residential" | "commercial" = "commercial"
): {
  estimatedPrice: number;
  pricePerSqm: number;
  confidence: number;
  range: { min: number; max: number };
  comparables: number;
} {
  const district = getMockAreaInfo(location);
  if (!district) {
    return {
      estimatedPrice: 50_000_000,
      pricePerSqm: 50_000_000,
      confidence: 0.5,
      range: { min: 40_000_000, max: 60_000_000 },
      comparables: 5,
    };
  }

  const rng = new SeededRandom(coordSeed(location.lat, location.lng) + 1);

  // Micro-variation: distance from district center affects price
  const cosLat = Math.cos(location.lat * (Math.PI / 180));
  const dLat = (district.coordinates.lat - location.lat) * 111_320;
  const dLng = (district.coordinates.lng - location.lng) * 111_320 * cosLat;
  const distFromCenter = Math.sqrt(dLat * dLat + dLng * dLng);

  // Closer to center = slightly higher price (up to +10%)
  const centerPremium = Math.max(0, 1 - distFromCenter / 3000) * 0.10;

  // Small deterministic variation (±5%)
  const microVar = rng.float(-0.05, 0.05);

  const basePrice = district.realEstate.avgSalePrice;
  const estimatedPrice = Math.round(basePrice * (1 + centerPremium + microVar));

  // Confidence based on district data richness (more businesses = more comps)
  const dataRichness = Math.min(1, district.business.totalBusinesses / 12_000);
  const confidence = Math.round((0.70 + dataRichness * 0.20) * 100) / 100;

  // Comparables based on density
  const comparables = Math.round(8 + dataRichness * 18);

  return {
    estimatedPrice,
    pricePerSqm: estimatedPrice,
    confidence,
    range: {
      min: Math.round(estimatedPrice * 0.88),
      max: Math.round(estimatedPrice * 1.12),
    },
    comparables,
  };
}

/**
 * Deterministic traffic estimate based on district characteristics.
 */
export function getMockTrafficData(location: { lat: number; lng: number }): {
  footTraffic: number;
  vehicleTraffic: number;
  peakHours: string[];
  weekdayAvg: number;
  weekendAvg: number;
} {
  const district = getMockAreaInfo(location);
  if (!district) {
    return {
      footTraffic: 2000,
      vehicleTraffic: 4000,
      peakHours: ["7:00-9:00", "11:30-13:30", "17:00-19:00"],
      weekdayAvg: 2000,
      weekendAvg: 2500,
    };
  }

  const rng = new SeededRandom(coordSeed(location.lat, location.lng) + 2);

  // Traffic correlates with: population density, walk score, transit score
  const popDensity = district.demographics.population / 10; // rough area estimate
  const walkFactor = district.infrastructure.walkScore / 100;
  const transitFactor = district.infrastructure.transitScore / 100;

  // Base foot traffic from density + walkability
  const baseFootTraffic = Math.round(
    popDensity * 0.05 * walkFactor * (1 + transitFactor * 0.5)
  );
  const footTraffic = Math.max(800, Math.min(8000,
    baseFootTraffic + rng.int(-200, 200)));

  // Vehicle traffic inversely related to walk score (car-dependent areas have more)
  const vehicleTraffic = Math.round(
    footTraffic * (2.5 - walkFactor * 1.2) + rng.int(-300, 300)
  );

  // Peak hours vary by district type
  const peakHours = district.isCBD
    ? ["7:30-9:00", "11:30-13:00", "17:30-19:30"]
    : ["7:00-8:30", "11:00-13:00", "17:00-19:00"];

  const weekdayAvg = Math.round(footTraffic * (0.9 + rng.float(0, 0.1)));
  const weekendMultiplier = district.isCBD ? 0.7 : 1.3; // CBD quieter on weekends
  const weekendAvg = Math.round(footTraffic * weekendMultiplier * (0.9 + rng.float(0, 0.1)));

  return { footTraffic, vehicleTraffic, peakHours, weekdayAvg, weekendAvg };
}

export function getAllDistricts(): DistrictData[] {
  return Object.values(DISTRICTS);
}

export function getDistrictById(id: string): DistrictData | undefined {
  return DISTRICTS[id];
}
