/**
 * Location Intelligence - Dataset Types
 * Định nghĩa các kiểu dữ liệu cho quản lý dataset và comparable properties
 */

import { Address, Coordinates } from "./location";

/**
 * Property comparable (comp) data point
 */
export interface PropertyComp {
  /** Unique identifier */
  id: string;
  /** Property address */
  address: Address;
  /** Property coordinates */
  coordinates: Coordinates;
  /** Property type */
  propertyType: "apartment" | "house" | "commercial" | "land" | "villa" | "shophouse";
  /** Floor area (m²) */
  area: number;
  /** Land area (m²) - if applicable */
  landArea?: number;
  /** Number of bedrooms */
  bedrooms?: number;
  /** Number of bathrooms */
  bathrooms?: number;
  /** Number of floors */
  floors?: number;
  /** Listing price (VND) */
  listingPrice?: number;
  /** Sold price (VND) */
  soldPrice?: number;
  /** Monthly rent (VND) */
  monthlyRent?: number;
  /** Price per m² (VND) */
  pricePerSqm: number;
  /** Rent per m² per month (VND) */
  rentPerSqm?: number;
  /** Transaction type */
  transactionType: "sale" | "rent" | "both";
  /** Listing status */
  status: "active" | "sold" | "rented" | "expired";
  /** Year built */
  yearBuilt?: number;
  /** Condition */
  condition?: "new" | "good" | "average" | "needs-renovation";
  /** Furnishing status */
  furnishing?: "fully-furnished" | "semi-furnished" | "unfurnished";
  /** Front width (m) - important for Vietnamese shophouses */
  frontWidth?: number;
  /** Alley width (m) - access width */
  alleyWidth?: number;
  /** Distance to main road (m) */
  distanceToMainRoad?: number;
  /** Amenities */
  amenities?: string[];
  /** Listing/transaction date */
  listingDate: string;
  /** Sale/rent date */
  transactionDate?: string;
  /** Data source */
  source: string;
  /** Source URL */
  sourceUrl?: string;
  /** Verification status */
  verified: boolean;
  /** Notes */
  notes?: string;
  /** Created timestamp */
  createdAt: string;
  /** Updated timestamp */
  updatedAt: string;
}

/**
 * Dataset statistics and metadata
 */
export interface DatasetStats {
  /** Total number of comps */
  totalComps: number;
  /** Comps by property type */
  compsByType: {
    type: string;
    count: number;
    percentage: number;
  }[];
  /** Comps by district */
  compsByDistrict: {
    district: string;
    count: number;
    percentage: number;
  }[];
  /** Comps by transaction type */
  compsByTransactionType: {
    transactionType: string;
    count: number;
    percentage: number;
  }[];
  /** Price statistics */
  priceStats: {
    /** Average price (VND) */
    averagePrice: number;
    /** Median price (VND) */
    medianPrice: number;
    /** Minimum price (VND) */
    minPrice: number;
    /** Maximum price (VND) */
    maxPrice: number;
    /** Average price per m² (VND) */
    averagePricePerSqm: number;
  };
  /** Rent statistics */
  rentStats: {
    /** Average monthly rent (VND) */
    averageRent: number;
    /** Median monthly rent (VND) */
    medianRent: number;
    /** Minimum monthly rent (VND) */
    minRent: number;
    /** Maximum monthly rent (VND) */
    maxRent: number;
    /** Average rent per m² (VND) */
    averageRentPerSqm: number;
  };
  /** Area statistics */
  areaStats: {
    /** Average area (m²) */
    averageArea: number;
    /** Median area (m²) */
    medianArea: number;
    /** Minimum area (m²) */
    minArea: number;
    /** Maximum area (m²) */
    maxArea: number;
  };
  /** Data quality metrics */
  dataQuality: {
    /** Percentage of verified comps */
    verifiedPercentage: number;
    /** Percentage with coordinates */
    withCoordinatesPercentage: number;
    /** Percentage with complete data */
    completeDataPercentage: number;
    /** Average data completeness score (0-100) */
    completenessScore: number;
  };
  /** Date range of data */
  dateRange: {
    /** Earliest listing date */
    earliestDate: string;
    /** Latest listing date */
    latestDate: string;
    /** Data recency (days since last update) */
    recencyDays: number;
  };
  /** Last update timestamp */
  lastUpdated: string;
}

/**
 * Result of a dataset upload operation
 */
export interface UploadResult {
  /** Upload operation ID */
  uploadId: string;
  /** Upload status */
  status: "processing" | "completed" | "failed" | "partial";
  /** Total rows in uploaded file */
  totalRows: number;
  /** Successfully imported rows */
  successCount: number;
  /** Failed rows */
  failedCount: number;
  /** Skipped/duplicate rows */
  skippedCount: number;
  /** Validation errors */
  errors: {
    row: number;
    field?: string;
    message: string;
    value?: string;
  }[];
  /** Warnings */
  warnings: {
    row: number;
    field?: string;
    message: string;
    value?: string;
  }[];
  /** Import summary */
  summary: {
    newComps: number;
    updatedComps: number;
    duplicates: number;
  };
  /** Imported comp IDs */
  importedIds: string[];
  /** File metadata */
  fileMetadata: {
    filename: string;
    size: number;
    mimeType: string;
    uploadedBy?: string;
  };
  /** Processing time (ms) */
  processingTime: number;
  /** Upload timestamp */
  uploadedAt: string;
  /** Completion timestamp */
  completedAt?: string;
}
