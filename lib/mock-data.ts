import type { Location } from "@/types/location";

// Mock district data for HCMC
export interface DistrictData {
  id: string;
  name: string;
  nameEn: string;
  coordinates: { lat: number; lng: number };
  demographics: {
    population: number;
    medianAge: number;
    medianIncome: number;
    households: number;
    avgHouseholdSize: number;
  };
  realEstate: {
    avgRentPrice: number;
    avgSalePrice: number;
    occupancyRate: number;
    avgPropertySize: number;
  };
  business: {
    totalBusinesses: number;
    cafes: number;
    restaurants: number;
    retail: number;
    services: number;
  };
  infrastructure: {
    transitScore: number;
    walkScore: number;
    parkingAvailability: "low" | "medium" | "high";
  };
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

const DISTRICTS: Record<string, DistrictData> = {
  "district-1": {
    id: "district-1",
    name: "Quận 1",
    nameEn: "District 1",
    coordinates: { lat: 10.7756, lng: 106.7019 },
    demographics: {
      population: 204899,
      medianAge: 35,
      medianIncome: 18_000_000,
      households: 68300,
      avgHouseholdSize: 3,
    },
    realEstate: {
      avgRentPrice: 25_000_000,
      avgSalePrice: 120_000_000,
      occupancyRate: 92,
      avgPropertySize: 65,
    },
    business: {
      totalBusinesses: 12500,
      cafes: 850,
      restaurants: 1200,
      retail: 3200,
      services: 2100,
    },
    infrastructure: {
      transitScore: 95,
      walkScore: 90,
      parkingAvailability: "low",
    },
  },
  "district-3": {
    id: "district-3",
    name: "Quận 3",
    nameEn: "District 3",
    coordinates: { lat: 10.7866, lng: 106.6839 },
    demographics: {
      population: 188945,
      medianAge: 36,
      medianIncome: 16_500_000,
      households: 62982,
      avgHouseholdSize: 3,
    },
    realEstate: {
      avgRentPrice: 20_000_000,
      avgSalePrice: 95_000_000,
      occupancyRate: 88,
      avgPropertySize: 60,
    },
    business: {
      totalBusinesses: 9800,
      cafes: 620,
      restaurants: 890,
      retail: 2800,
      services: 1850,
    },
    infrastructure: {
      transitScore: 85,
      walkScore: 85,
      parkingAvailability: "medium",
    },
  },
  "binh-thanh": {
    id: "binh-thanh",
    name: "Quận Bình Thạnh",
    nameEn: "Binh Thanh District",
    coordinates: { lat: 10.8050, lng: 106.7138 },
    demographics: {
      population: 498943,
      medianAge: 32,
      medianIncome: 14_000_000,
      households: 166314,
      avgHouseholdSize: 3,
    },
    realEstate: {
      avgRentPrice: 15_000_000,
      avgSalePrice: 70_000_000,
      occupancyRate: 85,
      avgPropertySize: 55,
    },
    business: {
      totalBusinesses: 11200,
      cafes: 720,
      restaurants: 980,
      retail: 3100,
      services: 2200,
    },
    infrastructure: {
      transitScore: 75,
      walkScore: 70,
      parkingAvailability: "medium",
    },
  },
  "phu-nhuan": {
    id: "phu-nhuan",
    name: "Quận Phú Nhuận",
    nameEn: "Phu Nhuan District",
    coordinates: { lat: 10.7990, lng: 106.6825 },
    demographics: {
      population: 181522,
      medianAge: 34,
      medianIncome: 15_500_000,
      households: 60507,
      avgHouseholdSize: 3,
    },
    realEstate: {
      avgRentPrice: 18_000_000,
      avgSalePrice: 85_000_000,
      occupancyRate: 87,
      avgPropertySize: 58,
    },
    business: {
      totalBusinesses: 8500,
      cafes: 580,
      restaurants: 750,
      retail: 2400,
      services: 1650,
    },
    infrastructure: {
      transitScore: 80,
      walkScore: 78,
      parkingAvailability: "medium",
    },
  },
  "go-vap": {
    id: "go-vap",
    name: "Quận Gò Vấp",
    nameEn: "Go Vap District",
    coordinates: { lat: 10.8376, lng: 106.6717 },
    demographics: {
      population: 682946,
      medianAge: 30,
      medianIncome: 12_000_000,
      households: 227649,
      avgHouseholdSize: 3,
    },
    realEstate: {
      avgRentPrice: 12_000_000,
      avgSalePrice: 55_000_000,
      occupancyRate: 82,
      avgPropertySize: 50,
    },
    business: {
      totalBusinesses: 10800,
      cafes: 650,
      restaurants: 920,
      retail: 3500,
      services: 2100,
    },
    infrastructure: {
      transitScore: 70,
      walkScore: 65,
      parkingAvailability: "high",
    },
  },
  "thu-duc": {
    id: "thu-duc",
    name: "Thành phố Thủ Đức",
    nameEn: "Thu Duc City",
    coordinates: { lat: 10.8509, lng: 106.7623 },
    demographics: {
      population: 1200000,
      medianAge: 29,
      medianIncome: 13_500_000,
      households: 400000,
      avgHouseholdSize: 3,
    },
    realEstate: {
      avgRentPrice: 13_000_000,
      avgSalePrice: 60_000_000,
      occupancyRate: 80,
      avgPropertySize: 52,
    },
    business: {
      totalBusinesses: 15600,
      cafes: 980,
      restaurants: 1350,
      retail: 4800,
      services: 3200,
    },
    infrastructure: {
      transitScore: 68,
      walkScore: 60,
      parkingAvailability: "high",
    },
  },
};

const BUSINESS_NAMES = {
  cafe: [
    "The Coffee House",
    "Highlands Coffee",
    "Phúc Long Coffee & Tea",
    "Trung Nguyên Legend",
    "Cộng Cà Phê",
    "L'amant Cafe",
    "Urban Station",
    "Kafe Collective",
    "Saigon Coffee Roastery",
    "Tranquil Books & Coffee",
    "Aha Cafe",
    "The Workshop Coffee",
    "Maison Marou",
    "Nest by AIA",
    "Elephant Café",
  ],
  restaurant: [
    "Nhà Hàng Ngọc Sương",
    "Quán Bụi Authentic Vietnamese",
    "Cơm Tấm Mộc",
    "Phở Hòa Pasteur",
    "Hoa Tục Vietnamese Restaurant",
    "Pizza 4P's",
    "Món Huế",
    "Bún Bò Huế 3A3",
    "Secret Garden Restaurant",
    "Propaganda Bistro",
    "Bánh Xèo 46A",
    "Hum Vegetarian",
    "Võ Tòng Tân Định",
    "Cục Gạch Quán",
    "Ăn Vặt Sài Gòn",
  ],
  retail: [
    "Vinmart",
    "Circle K",
    "Family Mart",
    "Bách Hóa Xanh",
    "Guardian",
    "Watsons",
    "Điện Máy Xanh",
    "Thế Giới Di Động",
    "FPT Shop",
    "Thời Trang Canifa",
    "Uniqlo",
    "Decathlon",
    "Muji",
    "Miniso",
    "Daiso",
  ],
  service: [
    "30Shine Barber Shop",
    "Spa Trẻ",
    "Venus Beauty Spa",
    "California Fitness & Yoga",
    "Nails Tina",
    "Pet Mart",
    "Cửa Hàng Hoa Tươi Dalat Hasfarm",
    "Laundry Express",
    "Bệnh Viện Đa Khoa Tâm Anh",
    "Nha Khoa Paris",
    "Thẩm Mỹ Viện Lavender",
  ],
  hotel: [
    "Caravelle Saigon",
    "Liberty Central Saigon Riverside",
    "Fusion Suites Saigon",
    "The Reverie Saigon",
    "Alagon Saigon Hotel",
    "M Hotel Saigon",
    "Silverland Jolie Hotel",
    "Grand Saigon Hotel",
    "Boss Legend Hotel",
    "Sanouva Saigon Hotel",
  ],
};

export function getMockAreaInfo(location: {
  lat: number;
  lng: number;
  address?: string;
}): DistrictData | null {
  // Simple distance-based matching to nearest district
  let closestDistrict: DistrictData | null = null;
  let minDistance = Infinity;

  Object.values(DISTRICTS).forEach((district) => {
    const distance = Math.sqrt(
      Math.pow(district.coordinates.lat - location.lat, 2) +
        Math.pow(district.coordinates.lng - location.lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestDistrict = district;
    }
  });

  return closestDistrict;
}

export function getMockNearbyBusinesses(
  location: { lat: number; lng: number },
  radius: number = 500,
  types?: string[]
): NearbyBusiness[] {
  const businesses: NearbyBusiness[] = [];
  const count = Math.floor(Math.random() * 15) + 10; // 10-25 businesses

  const businessTypes: Array<NearbyBusiness["type"]> = types
    ? (types as NearbyBusiness["type"][])
    : ["cafe", "restaurant", "retail", "service", "hotel"];

  for (let i = 0; i < count; i++) {
    const type = businessTypes[Math.floor(Math.random() * businessTypes.length)];
    const names = BUSINESS_NAMES[type];
    const name = names[Math.floor(Math.random() * names.length)];

    // Generate random position within radius
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
    const latOffset = (distance * Math.cos(angle)) / 111320; // Convert meters to degrees
    const lngOffset = (distance * Math.sin(angle)) / (111320 * Math.cos(location.lat * (Math.PI / 180)));

    businesses.push({
      id: `business-${i}`,
      name,
      type,
      category: getCategoryForType(type),
      distance: Math.round(distance),
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
      priceRange: Math.floor(Math.random() * 4) + 1, // 1-4
      coordinates: {
        lat: location.lat + latOffset,
        lng: location.lng + lngOffset,
      },
    });
  }

  return businesses.sort((a, b) => a.distance - b.distance);
}

function getCategoryForType(type: string): string {
  const categories: Record<string, string[]> = {
    cafe: ["Cà phê", "Trà sữa", "Quán cà phê"],
    restaurant: ["Nhà hàng", "Quán ăn", "Món Việt", "Món Âu", "Món Á"],
    retail: ["Siêu thị", "Cửa hàng tiện lợi", "Thời trang", "Điện tử"],
    service: ["Dịch vụ", "Thẩm mỹ", "Spa", "Gym", "Y tế"],
    hotel: ["Khách sạn", "Căn hộ dịch vụ"],
  };

  const options = categories[type] || ["Khác"];
  return options[Math.floor(Math.random() * options.length)];
}

export function getMockPriceEstimate(
  location: { lat: number; lng: number },
  propertyType: "residential" | "commercial" = "residential"
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
      confidence: 0.6,
      range: { min: 40_000_000, max: 60_000_000 },
      comparables: 12,
    };
  }

  const basePrice = district.realEstate.avgSalePrice;
  const variation = basePrice * 0.15;
  const estimatedPrice = basePrice + (Math.random() - 0.5) * variation;

  return {
    estimatedPrice: Math.round(estimatedPrice),
    pricePerSqm: Math.round(estimatedPrice),
    confidence: Math.round((Math.random() * 0.2 + 0.75) * 100) / 100,
    range: {
      min: Math.round(estimatedPrice * 0.85),
      max: Math.round(estimatedPrice * 1.15),
    },
    comparables: Math.floor(Math.random() * 20) + 8,
  };
}

export function getMockTrafficData(location: { lat: number; lng: number }): {
  footTraffic: number;
  vehicleTraffic: number;
  peakHours: string[];
  weekdayAvg: number;
  weekendAvg: number;
} {
  return {
    footTraffic: Math.floor(Math.random() * 5000) + 1000,
    vehicleTraffic: Math.floor(Math.random() * 10000) + 2000,
    peakHours: ["7:00-9:00", "11:30-13:30", "17:00-19:00"],
    weekdayAvg: Math.floor(Math.random() * 4000) + 2000,
    weekendAvg: Math.floor(Math.random() * 6000) + 3000,
  };
}

export function getAllDistricts(): DistrictData[] {
  return Object.values(DISTRICTS);
}

export function getDistrictById(id: string): DistrictData | undefined {
  return DISTRICTS[id];
}
