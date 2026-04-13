/**
 * Location Intelligence - Location Types
 * Định nghĩa các kiểu dữ liệu cho địa điểm và tọa độ
 */

/**
 * Geographic coordinates
 */
export interface Coordinates {
  /** Latitude (vĩ độ) */
  lat: number;
  /** Longitude (kinh độ) */
  lng: number;
}

/**
 * Structured address
 */
export interface Address {
  /** Full address string */
  full: string;
  /** Street name and number */
  street: string;
  /** Ward (Phường/Xã) */
  ward: string;
  /** District (Quận/Huyện) */
  district: string;
  /** City (Thành phố) */
  city: string;
  /** Country */
  country: string;
}

/**
 * Location information
 */
export interface Location {
  /** Geographic coordinates */
  coordinates: Coordinates;
  /** Structured address */
  address: Address;
  /** Area size in m² */
  area: number;
  /** Location type */
  type: "residential" | "commercial" | "mixed";
}
