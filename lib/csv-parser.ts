import Papa from "papaparse";

export interface PropertyComp {
  id: string;
  address: string;
  district: string;
  price: number;
  pricePerSqm: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType: string;
  saleDate: string;
  latitude?: number;
  longitude?: number;
}

export interface ParseResult {
  success: boolean;
  data: PropertyComp[];
  errors: string[];
  rowCount: number;
  validCount: number;
}

/**
 * Parse CSV file containing property comparables
 */
export async function parseCompsCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const errors: string[] = [];
    const validData: PropertyComp[] = [];
    let rowCount = 0;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Normalize headers
        const normalized = header.trim().toLowerCase();
        const mapping: Record<string, string> = {
          "địa chỉ": "address",
          "dia chi": "address",
          "quận": "district",
          "quan": "district",
          "giá": "price",
          "gia": "price",
          "giá/m²": "pricePerSqm",
          "gia/m2": "pricePerSqm",
          "price per sqm": "pricePerSqm",
          "diện tích": "area",
          "dien tich": "area",
          "phòng ngủ": "bedrooms",
          "phong ngu": "bedrooms",
          "phòng tắm": "bathrooms",
          "phong tam": "bathrooms",
          "loại": "propertyType",
          "loai": "propertyType",
          "type": "propertyType",
          "ngày bán": "saleDate",
          "ngay ban": "saleDate",
          "sale date": "saleDate",
          "date": "saleDate",
          "vĩ độ": "latitude",
          "vi do": "latitude",
          "lat": "latitude",
          "kinh độ": "longitude",
          "kinh do": "longitude",
          "lng": "longitude",
          "lon": "longitude",
        };
        return mapping[normalized] || normalized;
      },
      complete: (results) => {
        rowCount = results.data.length;

        results.data.forEach((row: any, index) => {
          try {
            const comp = parseRow(row, index + 1);
            if (comp) {
              validData.push(comp);
            }
          } catch (error) {
            errors.push(`Dòng ${index + 2}: ${error instanceof Error ? error.message : "Lỗi không xác định"}`);
          }
        });

        resolve({
          success: errors.length === 0,
          data: validData,
          errors,
          rowCount,
          validCount: validData.length,
        });
      },
      error: (error) => {
        resolve({
          success: false,
          data: [],
          errors: [`Lỗi parse CSV: ${error.message}`],
          rowCount: 0,
          validCount: 0,
        });
      },
    });
  });
}

/**
 * Parse a single CSV row into PropertyComp
 */
function parseRow(row: any, rowNumber: number): PropertyComp | null {
  // Validate required fields
  if (!row.address || !row.district) {
    throw new Error("Thiếu địa chỉ hoặc quận");
  }

  // Parse price
  let price: number;
  let pricePerSqm: number;
  let area: number;

  if (row.price) {
    price = parseNumber(row.price);
    if (isNaN(price) || price <= 0) {
      throw new Error("Giá không hợp lệ");
    }
  } else {
    throw new Error("Thiếu thông tin giá");
  }

  if (row.area) {
    area = parseNumber(row.area);
    if (isNaN(area) || area <= 0) {
      throw new Error("Diện tích không hợp lệ");
    }
  } else {
    throw new Error("Thiếu thông tin diện tích");
  }

  // Calculate price per sqm if not provided
  if (row.pricePerSqm) {
    pricePerSqm = parseNumber(row.pricePerSqm);
  } else {
    pricePerSqm = price / area;
  }

  // Optional fields
  const bedrooms = row.bedrooms ? parseNumber(row.bedrooms) : undefined;
  const bathrooms = row.bathrooms ? parseNumber(row.bathrooms) : undefined;
  const latitude = row.latitude ? parseNumber(row.latitude) : undefined;
  const longitude = row.longitude ? parseNumber(row.longitude) : undefined;

  // Validate coordinates if provided
  if (latitude !== undefined && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
    throw new Error("Vĩ độ không hợp lệ");
  }
  if (longitude !== undefined && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
    throw new Error("Kinh độ không hợp lệ");
  }

  // Parse date
  let saleDate = row.saleDate || new Date().toISOString().split("T")[0];
  saleDate = normalizeDate(saleDate);

  return {
    id: `comp-${rowNumber}-${Date.now()}`,
    address: row.address.trim(),
    district: row.district.trim(),
    price,
    pricePerSqm,
    area,
    bedrooms,
    bathrooms,
    propertyType: row.propertyType?.trim() || "Chung cư",
    saleDate,
    latitude,
    longitude,
  };
}

/**
 * Parse number from string (handles Vietnamese and English formats)
 */
function parseNumber(value: any): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return NaN;

  // Remove common currency symbols and thousand separators
  let cleaned = value
    .replace(/[₫$,.\s]/g, "")
    .replace(/triệu/gi, "000000")
    .replace(/tỷ/gi, "000000000")
    .replace(/million/gi, "000000")
    .replace(/billion/gi, "000000000");

  return parseFloat(cleaned);
}

/**
 * Normalize date to ISO format
 */
function normalizeDate(dateStr: string): string {
  // Try to parse various date formats
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
    /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[0]) {
        // Already ISO format
        return dateStr;
      } else {
        // Convert DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD
        const [, day, month, year] = match;
        return `${year}-${month}-${day}`;
      }
    }
  }

  // If no format matches, try native Date parsing
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split("T")[0];
  }

  // Fallback to current date
  return new Date().toISOString().split("T")[0];
}

/**
 * Validate CSV data structure
 */
export function validateCSVStructure(file: File): Promise<{
  valid: boolean;
  requiredFields: string[];
  missingFields: string[];
  optionalFields: string[];
}> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      preview: 1,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());

        const requiredFields = ["address", "địa chỉ", "district", "quận", "price", "giá", "area", "diện tích"];
        const optionalFields = ["bedrooms", "bathrooms", "propertyType", "saleDate", "latitude", "longitude"];

        const hasAddress = normalizedHeaders.some((h) =>
          ["address", "địa chỉ", "dia chi"].includes(h)
        );
        const hasDistrict = normalizedHeaders.some((h) =>
          ["district", "quận", "quan"].includes(h)
        );
        const hasPrice = normalizedHeaders.some((h) => ["price", "giá", "gia"].includes(h));
        const hasArea = normalizedHeaders.some((h) =>
          ["area", "diện tích", "dien tich"].includes(h)
        );

        const missingFields: string[] = [];
        if (!hasAddress) missingFields.push("Địa chỉ (address)");
        if (!hasDistrict) missingFields.push("Quận (district)");
        if (!hasPrice) missingFields.push("Giá (price)");
        if (!hasArea) missingFields.push("Diện tích (area)");

        resolve({
          valid: missingFields.length === 0,
          requiredFields: ["Địa chỉ", "Quận", "Giá", "Diện tích"],
          missingFields,
          optionalFields: ["Phòng ngủ", "Phòng tắm", "Loại BDS", "Ngày bán", "Tọa độ"],
        });
      },
      error: () => {
        resolve({
          valid: false,
          requiredFields: ["Địa chỉ", "Quận", "Giá", "Diện tích"],
          missingFields: ["Không thể đọc file"],
          optionalFields: [],
        });
      },
    });
  });
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: PropertyComp[], filename: string = "comps-export.csv"): void {
  const csv = Papa.unparse(data, {
    columns: [
      "address",
      "district",
      "price",
      "pricePerSqm",
      "area",
      "bedrooms",
      "bathrooms",
      "propertyType",
      "saleDate",
      "latitude",
      "longitude",
    ],
    header: true,
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
