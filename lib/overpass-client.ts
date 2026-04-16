/**
 * Overpass API client for OpenStreetMap data.
 *
 * Provides real POI (businesses, shops, hotels, etc.) data for any coordinates.
 * Completely FREE — no API key required, no billing.
 *
 * Usage limits (public instance):
 * - ~10,000 queries/day per IP
 * - Individual query timeout: 180 seconds
 * - We use short timeouts (10s) and fall back to mock data on failure
 *
 * Caching:
 * - In-memory LRU cache, keyed by rounded coordinates
 * - 1 hour TTL — businesses don't change often
 */

import type { NearbyBusiness as MockNearbyBusiness } from "./mock-data";
import { SeededRandom, coordSeed } from "./seeded-random";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_ENTRIES = 200;

interface CacheEntry {
  data: MockNearbyBusiness[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function getCacheKey(lat: number, lng: number, radius: number): string {
  // Round to 4 decimal places (~11m) for cache key stability
  return `${lat.toFixed(4)}_${lng.toFixed(4)}_${radius}`;
}

function getFromCache(key: string): MockNearbyBusiness[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: MockNearbyBusiness[]): void {
  // Simple LRU: delete oldest when full
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

// ---------------------------------------------------------------------------
// OSM tag to internal type mapping
// ---------------------------------------------------------------------------

function classifyElement(tags: Record<string, string>): {
  type: MockNearbyBusiness["type"];
  category: string;
} | null {
  const amenity = tags.amenity;
  const shop = tags.shop;
  const tourism = tags.tourism;

  // Cafes and coffee shops
  if (amenity === "cafe" || shop === "coffee") {
    return { type: "cafe", category: "Cà phê" };
  }
  if (amenity === "bubble_tea" || shop === "tea") {
    return { type: "cafe", category: "Trà sữa" };
  }

  // Restaurants and food
  if (amenity === "restaurant") {
    const cuisine = tags.cuisine || "";
    if (cuisine.includes("vietnamese")) return { type: "restaurant", category: "Món Việt" };
    if (cuisine.includes("japanese") || cuisine.includes("sushi")) return { type: "restaurant", category: "Món Nhật" };
    if (cuisine.includes("korean")) return { type: "restaurant", category: "Món Hàn" };
    if (cuisine.includes("chinese")) return { type: "restaurant", category: "Món Hoa" };
    if (cuisine.includes("pizza") || cuisine.includes("italian")) return { type: "restaurant", category: "Món Âu" };
    return { type: "restaurant", category: "Nhà hàng" };
  }
  if (amenity === "fast_food") {
    return { type: "restaurant", category: "Fast food" };
  }
  if (amenity === "bar" || amenity === "pub") {
    return { type: "restaurant", category: "Quán bar" };
  }

  // Hotels and accommodation
  if (tourism === "hotel") return { type: "hotel", category: "Khách sạn" };
  if (tourism === "hostel") return { type: "hotel", category: "Nhà nghỉ" };
  if (tourism === "guest_house") return { type: "hotel", category: "Guest house" };
  if (tourism === "apartment") return { type: "hotel", category: "Căn hộ dịch vụ" };

  // Retail shops
  if (shop === "convenience") return { type: "retail", category: "Cửa hàng tiện lợi" };
  if (shop === "supermarket") return { type: "retail", category: "Siêu thị" };
  if (shop === "mall") return { type: "retail", category: "Trung tâm thương mại" };
  if (shop === "clothes" || shop === "fashion") return { type: "retail", category: "Thời trang" };
  if (shop === "electronics" || shop === "mobile_phone") return { type: "retail", category: "Điện tử" };
  if (shop === "bakery") return { type: "retail", category: "Bánh mì" };
  if (shop === "jewelry") return { type: "retail", category: "Trang sức" };
  if (shop === "cosmetics" || shop === "beauty") return { type: "retail", category: "Mỹ phẩm" };
  if (shop === "books") return { type: "retail", category: "Sách" };
  if (shop === "shoes") return { type: "retail", category: "Giày dép" };
  if (shop === "pharmacy" || amenity === "pharmacy") return { type: "retail", category: "Nhà thuốc" };

  // Services
  if (amenity === "bank" || amenity === "atm") return { type: "service", category: "Ngân hàng" };
  if (amenity === "gym" || tags.leisure === "fitness_centre") return { type: "service", category: "Gym" };
  if (amenity === "hospital" || amenity === "clinic" || amenity === "doctors") {
    return { type: "service", category: "Y tế" };
  }
  if (amenity === "dentist") return { type: "service", category: "Nha khoa" };
  if (shop === "hairdresser" || shop === "beauty") return { type: "service", category: "Làm đẹp" };
  if (amenity === "car_repair") return { type: "service", category: "Sửa xe" };

  return null;
}

// ---------------------------------------------------------------------------
// Distance calculation (Haversine-adjusted for latitude)
// ---------------------------------------------------------------------------

function distanceMeters(
  lat1: number, lng1: number, lat2: number, lng2: number
): number {
  const cosLat = Math.cos(lat1 * (Math.PI / 180));
  const dLat = (lat2 - lat1) * 111_320;
  const dLng = (lng2 - lng1) * 111_320 * cosLat;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch real nearby businesses from OpenStreetMap Overpass API.
 *
 * Returns array of businesses sorted by distance. Returns null on any failure
 * so callers can fall back to mock data.
 *
 * Uses aggressive timeout (8s) to not block analysis when Overpass is slow.
 */
export async function fetchNearbyBusinessesOSM(
  location: { lat: number; lng: number },
  radius: number = 500
): Promise<MockNearbyBusiness[] | null> {
  const cacheKey = getCacheKey(location.lat, location.lng, radius);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const query = `
[out:json][timeout:8];
(
  node["amenity"~"^(cafe|restaurant|fast_food|bar|pub|pharmacy|bank|atm|gym|hospital|clinic|dentist|car_repair|bubble_tea)$"](around:${radius},${location.lat},${location.lng});
  node["shop"](around:${radius},${location.lat},${location.lng});
  node["tourism"~"^(hotel|hostel|guest_house|apartment)$"](around:${radius},${location.lat},${location.lng});
  node["leisure"="fitness_centre"](around:${radius},${location.lat},${location.lng});
);
out body 80;
`.trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "LocationIntelligenceMVP/1.0 (location-intel@example.com)",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[overpass] HTTP ${response.status}, falling back to mock`);
      return null;
    }

    const data = (await response.json()) as OverpassResponse;
    const businesses = transformElements(data.elements, location);

    // Only cache non-empty results (empty might mean API hiccup)
    if (businesses.length > 0) {
      setCache(cacheKey, businesses);
    }

    return businesses;
  } catch (err) {
    console.warn(
      "[overpass] Query failed, falling back to mock:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

function transformElements(
  elements: OverpassElement[],
  origin: { lat: number; lng: number }
): MockNearbyBusiness[] {
  const rng = new SeededRandom(coordSeed(origin.lat, origin.lng));
  const businesses: MockNearbyBusiness[] = [];

  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat === undefined || lng === undefined) continue;
    if (!el.tags) continue;

    const classified = classifyElement(el.tags);
    if (!classified) continue;

    const name = el.tags.name || el.tags["name:vi"] || el.tags["name:en"];
    if (!name) continue; // Skip unnamed POIs

    const distance = Math.round(distanceMeters(origin.lat, origin.lng, lat, lng));

    // OSM doesn't have ratings — estimate deterministically based on:
    // - Whether it has a brand tag (chain = higher avg rating)
    // - Whether it has a website (established business)
    // - Deterministic variation per business (same business always same rating)
    const hasBrand = !!el.tags.brand;
    const hasWebsite = !!el.tags.website || !!el.tags.phone;
    const bizRng = new SeededRandom(el.id);
    let baseRating = 3.5;
    if (hasBrand) baseRating += 0.3;
    if (hasWebsite) baseRating += 0.2;
    const rating = Math.round(Math.min(4.9, Math.max(3.0, baseRating + bizRng.float(-0.4, 0.6))) * 10) / 10;

    // Price range from OSM tag or estimate from brand/tags
    let priceRange = 2;
    if (el.tags["price:level"]) {
      const pl = el.tags["price:level"].length; // e.g., "$$$" = 3
      priceRange = Math.min(4, Math.max(1, pl));
    } else if (el.tags.fee === "yes" || hasBrand) {
      priceRange = 2 + bizRng.int(0, 1);
    }

    businesses.push({
      id: `osm-${el.id}`,
      name,
      type: classified.type,
      category: classified.category,
      distance,
      rating,
      priceRange,
      coordinates: { lat, lng },
    });
  }

  // Deterministic order: by distance, then by OSM id (stable)
  businesses.sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance;
    return a.id.localeCompare(b.id);
  });

  // Cap to reasonable number
  return businesses.slice(0, 40);
}

// Expose for testing/stats
export function _clearOSMCache(): void {
  cache.clear();
}
