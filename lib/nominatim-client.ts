/**
 * Nominatim (OpenStreetMap) reverse-geocoding client.
 *
 * Resolves coordinates to real administrative divisions (ward, district, city).
 * Completely FREE — no API key. Rate limit: 1 request/second per IP.
 *
 * We cache aggressively (24h TTL) since admin boundaries don't change.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NominatimAddress {
  road?: string;
  suburb?: string;
  quarter?: string;
  neighbourhood?: string;
  city_district?: string;
  district?: string;
  county?: string;
  city?: string;
  state?: string;
  country?: string;
  country_code?: string;
  postcode?: string;
}

interface NominatimResponse {
  display_name?: string;
  address?: NominatimAddress;
  lat?: string;
  lon?: string;
}

export interface ResolvedAddress {
  /** Full display address from Nominatim */
  fullAddress: string;
  /** Street/road name if available */
  street: string;
  /** Ward (phường) if available */
  ward: string;
  /** District (quận/huyện) — normalized */
  district: string;
  /** City */
  city: string;
  /** Country */
  country: string;
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_ENTRIES = 500;

interface CacheEntry {
  data: ResolvedAddress;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function getCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)}_${lng.toFixed(4)}`;
}

// ---------------------------------------------------------------------------
// District normalization (Nominatim returns various formats)
// ---------------------------------------------------------------------------

function normalizeDistrict(raw: string): string {
  if (!raw) return "";
  // Strip common prefixes/suffixes
  const trimmed = raw.trim();

  // "District 1" → "Quận 1"
  const districtMatch = trimmed.match(/^District\s+(\d+)$/i);
  if (districtMatch) return `Quận ${districtMatch[1]}`;

  // "Quận 1" stays
  if (/^Quận\s+\d+/i.test(trimmed)) return trimmed;

  // Named districts
  const nameMap: Record<string, string> = {
    "Binh Thanh District": "Bình Thạnh",
    "Phu Nhuan District": "Phú Nhuận",
    "Tan Binh District": "Tân Bình",
    "Tan Phu District": "Tân Phú",
    "Go Vap District": "Gò Vấp",
    "Binh Tan District": "Bình Tân",
    "Thu Duc City": "TP. Thủ Đức",
    "Thu Duc District": "TP. Thủ Đức",
  };
  for (const [en, vi] of Object.entries(nameMap)) {
    if (trimmed.toLowerCase() === en.toLowerCase()) return vi;
  }

  return trimmed;
}

function normalizeWard(raw: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  const match = trimmed.match(/^Ward\s+(\w+)$/i);
  if (match) return `Phường ${match[1]}`;
  return trimmed;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Reverse-geocode coordinates to a structured address.
 * Returns null on failure so callers can fall back gracefully.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ResolvedAddress | null> {
  const cacheKey = getCacheKey(lat, lng);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=vi,en`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "LocationIntelligenceMVP/1.0 (location-intel@example.com)",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = (await response.json()) as NominatimResponse;
    if (!data.address) return null;

    const addr = data.address;
    const district = normalizeDistrict(
      addr.city_district || addr.district || addr.county || ""
    );
    const ward = normalizeWard(
      addr.suburb || addr.quarter || addr.neighbourhood || ""
    );

    const resolved: ResolvedAddress = {
      fullAddress: data.display_name || "",
      street: addr.road || "",
      ward,
      district,
      city: addr.city || addr.state || "TP. Hồ Chí Minh",
      country: addr.country || "Việt Nam",
    };

    // Cache
    if (cache.size >= MAX_CACHE_ENTRIES) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }
    cache.set(cacheKey, { data: resolved, timestamp: Date.now() });

    return resolved;
  } catch (err) {
    console.warn(
      "[nominatim] Reverse geocode failed:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
