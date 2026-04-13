import { NextRequest, NextResponse } from "next/server";
import { parseCompsCSV } from "@/lib/csv-parser";
import { addComps } from "@/lib/file-store";
import { generateId } from "@/lib/utils";
import type { PropertyComp, UploadResult } from "@/types/dataset";

export const runtime = "nodejs";

/**
 * POST /api/upload-comps
 * Upload CSV file chứa comparable properties
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const uploadId = generateId();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Không tìm thấy file upload" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Chỉ chấp nhận file CSV" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File quá lớn. Kích thước tối đa: 10MB" },
        { status: 400 }
      );
    }

    // Parse CSV
    const parseResult = await parseCompsCSV(file);

    if (!parseResult.success && parseResult.validCount === 0) {
      return NextResponse.json(
        {
          error: "Không thể parse file CSV",
          details: parseResult.errors,
        },
        { status: 400 }
      );
    }

    // Transform parsed data to PropertyComp type
    const now = new Date().toISOString();
    const propertyComps: PropertyComp[] = parseResult.data.map((comp) => ({
      id: comp.id,
      address: {
        full: comp.address,
        street: "",
        ward: "",
        district: comp.district,
        city: "Hồ Chí Minh",
        country: "Việt Nam",
      },
      coordinates: {
        lat: comp.latitude || 0,
        lng: comp.longitude || 0,
      },
      propertyType: mapPropertyType(comp.propertyType),
      area: comp.area,
      landArea: undefined,
      bedrooms: comp.bedrooms,
      bathrooms: comp.bathrooms,
      floors: undefined,
      listingPrice: comp.price,
      soldPrice: comp.price,
      monthlyRent: undefined,
      pricePerSqm: comp.pricePerSqm,
      rentPerSqm: undefined,
      transactionType: "sale",
      status: "sold",
      yearBuilt: undefined,
      condition: undefined,
      furnishing: undefined,
      frontWidth: undefined,
      alleyWidth: undefined,
      distanceToMainRoad: undefined,
      amenities: undefined,
      listingDate: comp.saleDate,
      transactionDate: comp.saleDate,
      source: "CSV Upload",
      sourceUrl: undefined,
      verified: false,
      notes: undefined,
      createdAt: now,
      updatedAt: now,
    }));

    // Save to file storage
    const savedComps = await addComps(propertyComps);

    const processingTime = Date.now() - startTime;
    const uploadResult: UploadResult = {
      uploadId,
      status: parseResult.errors.length > 0 ? "partial" : "completed",
      totalRows: parseResult.rowCount,
      successCount: parseResult.validCount,
      failedCount: parseResult.rowCount - parseResult.validCount,
      skippedCount: propertyComps.length - savedComps.length,
      errors: parseResult.errors.map((err, idx) => ({
        row: idx + 2,
        message: err,
      })),
      warnings: [],
      summary: {
        newComps: savedComps.length,
        updatedComps: 0,
        duplicates: propertyComps.length - savedComps.length,
      },
      importedIds: savedComps.map((c) => c.id),
      fileMetadata: {
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      },
      processingTime,
      uploadedAt: now,
      completedAt: new Date().toISOString(),
    };

    return NextResponse.json(uploadResult, { status: 201 });
  } catch (error) {
    console.error("Error uploading comps:", error);

    const errorResult: UploadResult = {
      uploadId,
      status: "failed",
      totalRows: 0,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      errors: [
        {
          row: 0,
          message: error instanceof Error ? error.message : "Unknown error",
        },
      ],
      warnings: [],
      summary: {
        newComps: 0,
        updatedComps: 0,
        duplicates: 0,
      },
      importedIds: [],
      fileMetadata: {
        filename: "",
        size: 0,
        mimeType: "",
      },
      processingTime: Date.now() - startTime,
      uploadedAt: new Date().toISOString(),
    };

    return NextResponse.json(errorResult, { status: 500 });
  }
}

/**
 * Map property type from CSV to standard types
 */
function mapPropertyType(type: string): PropertyComp["propertyType"] {
  const normalized = type.toLowerCase().trim();

  if (normalized.includes("chung cư") || normalized.includes("apartment")) {
    return "apartment";
  }
  if (normalized.includes("nhà") || normalized.includes("house")) {
    return "house";
  }
  if (normalized.includes("shophouse") || normalized.includes("nhà phố")) {
    return "shophouse";
  }
  if (normalized.includes("villa") || normalized.includes("biệt thự")) {
    return "villa";
  }
  if (normalized.includes("đất") || normalized.includes("land")) {
    return "land";
  }
  if (normalized.includes("thương mại") || normalized.includes("commercial")) {
    return "commercial";
  }

  return "apartment";
}
