
/**
 * File-based storage system for Location Intelligence MVP
 * Sử dụng file system để lưu trữ dữ liệu phân tích và comps
 */

import fs from "fs/promises";
import path from "path";
import { AnalysisResult } from "@/types/analysis";
import { PropertyComp, DatasetStats } from "@/types/dataset";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const ANALYSES_FILE = path.join(DATA_DIR, "analyses.json");
const COMPS_FILE = path.join(DATA_DIR, "comps.json");

/**
 * Ensure data directory and files exist
 */
async function ensureDataFiles(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    try {
      await fs.access(ANALYSES_FILE);
    } catch {
      await fs.writeFile(ANALYSES_FILE, JSON.stringify([], null, 2));
    }

    try {
      await fs.access(COMPS_FILE);
    } catch {
      await fs.writeFile(COMPS_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error("Error ensuring data files:", error);
    throw error;
  }
}

/**
 * Read all analyses from file
 */
export async function readAnalyses(): Promise<AnalysisResult[]> {
  await ensureDataFiles();
  try {
    const data = await fs.readFile(ANALYSES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading analyses:", error);
    return [];
  }
}

/**
 * Save a new analysis
 */
export async function saveAnalysis(analysis: AnalysisResult): Promise<AnalysisResult> {
  await ensureDataFiles();
  const analyses = await readAnalyses();
  analyses.unshift(analysis); // Add to beginning
  await fs.writeFile(ANALYSES_FILE, JSON.stringify(analyses, null, 2));
  return analysis;
}

/**
 * Get analysis by ID
 */
export async function getAnalysisById(id: string): Promise<AnalysisResult | null> {
  const analyses = await readAnalyses();
  return analyses.find((a) => a.id === id) || null;
}

/**
 * Update an analysis
 */
export async function updateAnalysis(
  id: string,
  updates: Partial<AnalysisResult>
): Promise<AnalysisResult | null> {
  await ensureDataFiles();
  const analyses = await readAnalyses();
  const index = analyses.findIndex((a) => a.id === id);

  if (index === -1) {
    return null;
  }

  analyses[index] = {
    ...analyses[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(ANALYSES_FILE, JSON.stringify(analyses, null, 2));
  return analyses[index];
}

/**
 * Delete an analysis
 */
export async function deleteAnalysis(id: string): Promise<boolean> {
  await ensureDataFiles();
  const analyses = await readAnalyses();
  const filteredAnalyses = analyses.filter((a) => a.id !== id);

  if (filteredAnalyses.length === analyses.length) {
    return false; // Not found
  }

  await fs.writeFile(ANALYSES_FILE, JSON.stringify(filteredAnalyses, null, 2));
  return true;
}

/**
 * Clear all analyses
 */
export async function clearAnalyses(): Promise<void> {
  await ensureDataFiles();
  await fs.writeFile(ANALYSES_FILE, JSON.stringify([], null, 2));
}

/**
 * Read all comps from file
 */
export async function readComps(): Promise<PropertyComp[]> {
  await ensureDataFiles();
  try {
    const data = await fs.readFile(COMPS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading comps:", error);
    return [];
  }
}

/**
 * Add new comps (merge with existing)
 */
export async function addComps(newComps: PropertyComp[]): Promise<PropertyComp[]> {
  await ensureDataFiles();
  const existingComps = await readComps();

  // Check for duplicates by address
  const existingAddresses = new Set(existingComps.map((c) => c.address.full));
  const uniqueNewComps = newComps.filter(
    (comp) => !existingAddresses.has(comp.address.full)
  );

  const allComps = [...existingComps, ...uniqueNewComps];
  await fs.writeFile(COMPS_FILE, JSON.stringify(allComps, null, 2));

  return uniqueNewComps;
}

/**
 * Clear all comps
 */
export async function clearComps(): Promise<void> {
  await ensureDataFiles();
  await fs.writeFile(COMPS_FILE, JSON.stringify([], null, 2));
}

/**
 * Calculate dataset statistics
 */
export async function calculateDatasetStats(): Promise<DatasetStats> {
  const comps = await readComps();

  if (comps.length === 0) {
    return getEmptyStats();
  }

  // Group by property type
  const typeGroups = comps.reduce((acc, comp) => {
    acc[comp.propertyType] = (acc[comp.propertyType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const compsByType = Object.entries(typeGroups).map(([type, count]) => ({
    type,
    count,
    percentage: Math.round((count / comps.length) * 100),
  }));

  // Group by district
  const districtGroups = comps.reduce((acc, comp) => {
    const district = comp.address.district || "Unknown";
    acc[district] = (acc[district] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const compsByDistrict = Object.entries(districtGroups).map(([district, count]) => ({
    district,
    count,
    percentage: Math.round((count / comps.length) * 100),
  }));

  // Group by transaction type
  const transactionGroups = comps.reduce((acc, comp) => {
    acc[comp.transactionType] = (acc[comp.transactionType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const compsByTransactionType = Object.entries(transactionGroups).map(
    ([transactionType, count]) => ({
      transactionType,
      count,
      percentage: Math.round((count / comps.length) * 100),
    })
  );

  // Price statistics (for sale transactions)
  const salesComps = comps.filter((c) => c.soldPrice || c.listingPrice);
  const prices = salesComps
    .map((c) => c.soldPrice || c.listingPrice || 0)
    .filter((p) => p > 0)
    .sort((a, b) => a - b);

  const priceStats = {
    averagePrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
    medianPrice: prices.length > 0 ? prices[Math.floor(prices.length / 2)] : 0,
    minPrice: prices.length > 0 ? prices[0] : 0,
    maxPrice: prices.length > 0 ? prices[prices.length - 1] : 0,
    averagePricePerSqm: Math.round(
      salesComps.reduce((sum, c) => sum + c.pricePerSqm, 0) / (salesComps.length || 1)
    ),
  };

  // Rent statistics
  const rentComps = comps.filter((c) => c.monthlyRent && c.monthlyRent > 0);
  const rents = rentComps.map((c) => c.monthlyRent!).sort((a, b) => a - b);

  const rentStats = {
    averageRent: rents.length > 0 ? Math.round(rents.reduce((a, b) => a + b, 0) / rents.length) : 0,
    medianRent: rents.length > 0 ? rents[Math.floor(rents.length / 2)] : 0,
    minRent: rents.length > 0 ? rents[0] : 0,
    maxRent: rents.length > 0 ? rents[rents.length - 1] : 0,
    averageRentPerSqm: Math.round(
      rentComps.reduce((sum, c) => sum + (c.rentPerSqm || 0), 0) / (rentComps.length || 1)
    ),
  };

  // Area statistics
  const areas = comps.map((c) => c.area).sort((a, b) => a - b);
  const areaStats = {
    averageArea: Math.round(areas.reduce((a, b) => a + b, 0) / areas.length),
    medianArea: areas[Math.floor(areas.length / 2)],
    minArea: areas[0],
    maxArea: areas[areas.length - 1],
  };

  // Data quality metrics
  const verifiedCount = comps.filter((c) => c.verified).length;
  const withCoordinatesCount = comps.filter(
    (c) => c.coordinates.lat !== 0 && c.coordinates.lng !== 0
  ).length;

  const dataQuality = {
    verifiedPercentage: Math.round((verifiedCount / comps.length) * 100),
    withCoordinatesPercentage: Math.round((withCoordinatesCount / comps.length) * 100),
    completeDataPercentage: Math.round(
      (comps.filter((c) => isCompleteComp(c)).length / comps.length) * 100
    ),
    completenessScore: calculateCompletenessScore(comps),
  };

  // Date range
  const dates = comps
    .map((c) => new Date(c.listingDate))
    .sort((a, b) => a.getTime() - b.getTime());

  const dateRange = {
    earliestDate: dates[0]?.toISOString() || new Date().toISOString(),
    latestDate: dates[dates.length - 1]?.toISOString() || new Date().toISOString(),
    recencyDays: Math.floor(
      (Date.now() - dates[dates.length - 1]?.getTime() || Date.now()) / (1000 * 60 * 60 * 24)
    ),
  };

  return {
    totalComps: comps.length,
    compsByType,
    compsByDistrict,
    compsByTransactionType,
    priceStats,
    rentStats,
    areaStats,
    dataQuality,
    dateRange,
    lastUpdated: new Date().toISOString(),
  };
}

function isCompleteComp(comp: PropertyComp): boolean {
  return !!(
    comp.address.full &&
    comp.coordinates.lat &&
    comp.coordinates.lng &&
    comp.area &&
    (comp.soldPrice || comp.listingPrice || comp.monthlyRent) &&
    comp.propertyType
  );
}

function calculateCompletenessScore(comps: PropertyComp[]): number {
  if (comps.length === 0) return 0;

  const fields = [
    "address",
    "coordinates",
    "area",
    "propertyType",
    "price",
    "bedrooms",
    "bathrooms",
    "yearBuilt",
  ];

  let totalScore = 0;
  comps.forEach((comp) => {
    let fieldScore = 0;
    if (comp.address.full) fieldScore++;
    if (comp.coordinates.lat && comp.coordinates.lng) fieldScore++;
    if (comp.area) fieldScore++;
    if (comp.propertyType) fieldScore++;
    if (comp.soldPrice || comp.listingPrice || comp.monthlyRent) fieldScore++;
    if (comp.bedrooms) fieldScore++;
    if (comp.bathrooms) fieldScore++;
    if (comp.yearBuilt) fieldScore++;

    totalScore += (fieldScore / fields.length) * 100;
  });

  return Math.round(totalScore / comps.length);
}

function getEmptyStats(): DatasetStats {
  return {
    totalComps: 0,
    compsByType: [],
    compsByDistrict: [],
    compsByTransactionType: [],
    priceStats: {
      averagePrice: 0,
      medianPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      averagePricePerSqm: 0,
    },
    rentStats: {
      averageRent: 0,
      medianRent: 0,
      minRent: 0,
      maxRent: 0,
      averageRentPerSqm: 0,
    },
    areaStats: {
      averageArea: 0,
      medianArea: 0,
      minArea: 0,
      maxArea: 0,
    },
    dataQuality: {
      verifiedPercentage: 0,
      withCoordinatesPercentage: 0,
      completeDataPercentage: 0,
      completenessScore: 0,
    },
    dateRange: {
      earliestDate: new Date().toISOString(),
      latestDate: new Date().toISOString(),
      recencyDays: 0,
    },
    lastUpdated: new Date().toISOString(),
  };
}
