# Location Intelligence MVP - API Implementation Summary

**Document Version:** 1.0  
**Last Updated:** 27 March 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Routes](#api-routes)
4. [Data Persistence](#data-persistence)
5. [File Structure](#file-structure)
6. [Usage Examples](#usage-examples)
7. [Data Models](#data-models)
8. [Error Handling](#error-handling)
9. [Response Formats](#response-formats)

---

## Overview

The Location Intelligence MVP implements a RESTful API layer built on Next.js 14+ App Router with API Routes. The API provides endpoints for:

- **Location Analysis**: Perform AI-powered business location analysis
- **History Management**: Store, retrieve, and manage analysis results
- **Dataset Operations**: Upload and manage comparable property (comp) data
- **Statistics**: Generate dataset insights and metrics

### Key Features

- File-based data persistence (JSON storage)
- Type-safe request/response handling with TypeScript
- Comprehensive error handling and validation
- Support for large CSV imports with progress tracking
- Metadata management and filtering capabilities

---

## Architecture

### Design Principles

The API follows a **file-based storage architecture** suitable for MVP development:

```
┌─────────────────────────────────────┐
│     Next.js API Routes (./app/api)  │
├─────────────────────────────────────┤
│  • analyze/route.ts                 │
│  • history/route.ts                 │
│  • history/[id]/route.ts            │
│  • upload-comps/route.ts            │
│  • dataset/stats/route.ts           │
│  • dataset/comps/route.ts           │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│    File System Storage              │
├─────────────────────────────────────┤
│  • /data/analyses/                  │
│  • /data/comps/                     │
│  • /data/datasets.json              │
└─────────────────────────────────────┘
```

### Data Persistence Strategy

- **Analysis Results**: Stored as individual JSON files in `/data/analyses/`
- **Comparable Properties**: Stored as individual JSON files in `/data/comps/`
- **Dataset Metadata**: Centralized `datasets.json` for statistics and indexing
- **User Preferences**: Stored via localStorage (client-side)

### Storage Layout

```
project-root/
├── data/
│   ├── analyses/
│   │   ├── {analysis-id}.json
│   │   ├── {analysis-id}.json
│   │   └── ...
│   ├── comps/
│   │   ├── {comp-id}.json
│   │   ├── {comp-id}.json
│   │   └── ...
│   └── datasets.json
└── ...
```

---

## API Routes

### 1. Analyze Location

**POST** `/api/analyze`

Creates a new location analysis with AI-powered scoring and insights.

#### Request Body

```json
{
  "businessModel": "fnb" | "airbnb" | "retail",
  "targetRevenue": 50000000,
  "maxRent": 20000000,
  "minArea": 30,
  "maxArea": 150,
  "districts": ["Quận 1", "Quận 3"],
  "radius": 500,
  "centerCoordinates": {
    "lat": 10.7756,
    "lng": 106.7019
  },
  "includeHighRisk": false
}
```

#### Response (201 Created)

```json
{
  "id": "analysis-1774487342-uuid",
  "location": {
    "address": "123 Nguyễn Huệ, Quận 1",
    "area": 65,
    "district": "Quận 1",
    "coordinates": {
      "lat": 10.7756,
      "lng": 106.7019
    }
  },
  "filters": {
    "businessModel": "fnb",
    "targetRevenue": 50000000,
    "maxRent": 20000000
  },
  "businessFitScores": [
    {
      "businessModel": "fnb",
      "overallScore": 78,
      "locationScore": 85,
      "demographicScore": 72,
      "competitionScore": 65,
      "footTrafficScore": 88,
      "infrastructureScore": 90,
      "confidence": 0.87,
      "breakdown": [
        {
          "category": "Vị trí",
          "score": 85,
          "weight": 25,
          "description": "Gần trục đường chính"
        }
      ]
    }
  ],
  "nearbyBusinesses": [
    {
      "name": "The Coffee House",
      "category": "Cà phê",
      "type": "competitor",
      "distance": 0.15,
      "estimatedRevenue": 180000000,
      "rating": 4.5,
      "reviewCount": 1250,
      "coordinates": { "lat": 10.776, "lng": 106.702 }
    }
  ],
  "priceEstimate": {
    "monthlyRent": 18500000,
    "rentMin": 17000000,
    "rentMax": 20000000,
    "averageRentPerSqm": 284615,
    "propertyPrice": 920000000,
    "propertyPriceMin": 782000000,
    "propertyPriceMax": 1058000000,
    "comparableCount": 24,
    "priceTrend": "increasing",
    "predictedChangePercent": 8.5,
    "lastUpdated": "2026-03-27T10:30:00Z"
  },
  "riskFlags": [
    {
      "id": "high-competition",
      "category": "competition",
      "severity": "medium",
      "title": "Cạnh tranh cao",
      "description": "Có 12 đối thủ cạnh tranh trong bán kính 500m",
      "impact": "Áp lực hạ giá, khó thu hút khách",
      "mitigation": "Tạo điểm khác biệt, chất lượng vượt trội",
      "probability": 0.75
    }
  ],
  "areaSummary": {
    "totalBusinesses": 2850,
    "businessesByCategory": [
      { "category": "F&B", "count": 420, "percentage": 14.7 },
      { "category": "Retail", "count": 680, "percentage": 23.8 }
    ],
    "averageFootTraffic": 78,
    "averageRent": 19500000,
    "vacancyRate": 8.2,
    "marketSaturation": 65,
    "growthRate": 3.2,
    "peakHours": ["7:00-9:00", "11:30-13:30", "17:00-19:00"]
  },
  "strategyMemo": {
    "summary": "Địa điểm này có tiềm năng rất cao cho F&B...",
    "strengths": ["Vị trí gần trục đường chính", "Lưu lượng khách cao"],
    "weaknesses": ["Cạnh tranh cao", "Giá thuê mặt bằng cao"],
    "opportunities": ["Phát triển dịch vụ giao hàng", "Marketing online"],
    "threats": ["Xu hướng thay đổi tiêu dùng", "Tăng giá thuê"],
    "recommendations": [
      {
        "priority": "high",
        "action": "Khác biệt hóa menu",
        "expectedImpact": "Tăng 15-20% lưu lượng khách"
      }
    ],
    "roiProjection": {
      "expectedRevenue": 250000000,
      "expectedCosts": 80000000,
      "expectedProfit": 170000000,
      "breakEvenMonths": 4.5,
      "annualROI": 127.5
    },
    "generatedBy": "GPT-4",
    "generatedAt": "2026-03-27T10:30:00Z"
  },
  "recommendation": "highly-recommended",
  "confidenceScore": 87,
  "status": "completed",
  "isSaved": false,
  "createdAt": "2026-03-27T10:30:00Z",
  "updatedAt": "2026-03-27T10:30:00Z",
  "completedAt": "2026-03-27T10:30:05Z"
}
```

#### Status Codes

- `201 Created`: Analysis completed successfully
- `400 Bad Request`: Invalid filters or missing required fields
- `422 Unprocessable Entity`: Validation failed (e.g., invalid coordinates)
- `500 Internal Server Error`: Analysis processing failed

---

### 2. List All Analyses

**GET** `/api/history`

Retrieve all stored analyses with optional filtering.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Maximum results to return |
| `offset` | number | 0 | Pagination offset |
| `businessModel` | string | - | Filter by business model (fnb, airbnb, retail) |
| `isSaved` | boolean | - | Filter by saved status |
| `dateFrom` | ISO8601 | - | Filter from date |
| `dateTo` | ISO8601 | - | Filter to date |
| `sortBy` | string | createdAt | Sort field (createdAt, confidenceScore) |
| `sortOrder` | string | desc | asc or desc |

#### Response (200 OK)

```json
{
  "analyses": [
    {
      "id": "analysis-1774487342-uuid",
      "location": { "address": "123 Nguyễn Huệ, Quận 1" },
      "filters": { "businessModel": "fnb" },
      "businessFitScores": [...],
      "confidenceScore": 87,
      "recommendation": "highly-recommended",
      "isSaved": true,
      "createdAt": "2026-03-27T10:30:00Z"
    }
  ],
  "total": 45,
  "limit": 50,
  "offset": 0,
  "hasMore": false
}
```

#### Status Codes

- `200 OK`: Success
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Failed to retrieve analyses

---

### 3. Clear All Analyses

**DELETE** `/api/history`

Remove all stored analyses (admin/maintenance operation).

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `confirm` | boolean | yes | Must be true to confirm deletion |

#### Response (200 OK)

```json
{
  "deleted": 45,
  "timestamp": "2026-03-27T10:35:00Z"
}
```

#### Status Codes

- `200 OK`: All analyses deleted
- `400 Bad Request`: Missing confirmation parameter
- `500 Internal Server Error`: Deletion failed

---

### 4. Get Single Analysis

**GET** `/api/history/{id}`

Retrieve detailed information for a specific analysis.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Analysis UUID |

#### Response (200 OK)

Same structure as POST /api/analyze response.

#### Status Codes

- `200 OK`: Analysis found
- `404 Not Found`: Analysis with given ID doesn't exist
- `500 Internal Server Error`: Failed to retrieve analysis

---

### 5. Update Analysis Metadata

**PATCH** `/api/history/{id}`

Update analysis metadata (bookmark, notes, etc.).

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Analysis UUID |

#### Request Body

```json
{
  "isSaved": true,
  "notes": "Excellent location, good traffic flow"
}
```

#### Response (200 OK)

```json
{
  "id": "analysis-1774487342-uuid",
  "isSaved": true,
  "notes": "Excellent location, good traffic flow",
  "updatedAt": "2026-03-27T10:40:00Z"
}
```

#### Status Codes

- `200 OK`: Analysis updated
- `404 Not Found`: Analysis not found
- `400 Bad Request`: Invalid update data
- `500 Internal Server Error`: Update failed

---

### 6. Delete Single Analysis

**DELETE** `/api/history/{id}`

Remove a specific analysis.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Analysis UUID |

#### Response (200 OK)

```json
{
  "deleted": true,
  "id": "analysis-1774487342-uuid",
  "timestamp": "2026-03-27T10:40:00Z"
}
```

#### Status Codes

- `200 OK`: Analysis deleted
- `404 Not Found`: Analysis not found
- `500 Internal Server Error`: Deletion failed

---

### 7. Upload Comparable Properties

**POST** `/api/upload-comps`

Upload CSV file containing comparable property data.

#### Request Format

- **Content-Type**: `multipart/form-data`
- **Field Name**: `file`
- **File Type**: CSV (.csv)

#### CSV Column Requirements

**Required Columns:**
- `địa chỉ` / `address` - Property address
- `quận` / `district` - District name
- `giá` / `price` - Property price (VND)
- `diện tích` / `area` - Floor area (m²)

**Optional Columns:**
- `phòng ngủ` / `bedrooms` - Number of bedrooms
- `phòng tắm` / `bathrooms` - Number of bathrooms
- `loại` / `propertyType` - Property type
- `ngày bán` / `saleDate` - Sale/rent date (YYYY-MM-DD)
- `vĩ độ` / `latitude` - Latitude coordinate
- `kinh độ` / `longitude` - Longitude coordinate

#### Response (200 OK)

```json
{
  "uploadId": "upload-1774487342-uuid",
  "status": "completed",
  "totalRows": 450,
  "successCount": 445,
  "failedCount": 5,
  "skippedCount": 0,
  "errors": [
    {
      "row": 12,
      "field": "price",
      "message": "Giá không hợp lệ",
      "value": "invalid-price"
    }
  ],
  "warnings": [
    {
      "row": 45,
      "field": "latitude",
      "message": "Tọa độ không được xác minh"
    }
  ],
  "summary": {
    "newComps": 420,
    "updatedComps": 25,
    "duplicates": 0
  },
  "importedIds": [
    "comp-uuid-1",
    "comp-uuid-2"
  ],
  "fileMetadata": {
    "filename": "comps-2026-03.csv",
    "size": 245680,
    "mimeType": "text/csv",
    "uploadedBy": "user@example.com"
  },
  "processingTime": 3420,
  "uploadedAt": "2026-03-27T10:45:00Z",
  "completedAt": "2026-03-27T10:45:03Z"
}
```

#### Status Codes

- `200 OK`: Upload processed (check status field for partial failures)
- `400 Bad Request`: Invalid file or missing file
- `413 Payload Too Large`: File exceeds size limit (default: 50MB)
- `415 Unsupported Media Type`: File is not CSV
- `422 Unprocessable Entity`: CSV structure invalid
- `500 Internal Server Error`: Processing failed

---

### 8. Get Dataset Statistics

**GET** `/api/dataset/stats`

Retrieve comprehensive dataset statistics and metadata.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `cached` | boolean | true | Return cached stats if available |

#### Response (200 OK)

```json
{
  "totalComps": 1450,
  "compsByType": [
    { "type": "commercial", "count": 520, "percentage": 35.9 },
    { "type": "apartment", "count": 380, "percentage": 26.2 }
  ],
  "compsByDistrict": [
    { "district": "Quận 1", "count": 285, "percentage": 19.7 },
    { "district": "Quận 3", "count": 220, "percentage": 15.2 }
  ],
  "compsByTransactionType": [
    { "transactionType": "sale", "count": 650, "percentage": 44.8 },
    { "transactionType": "rent", "count": 800, "percentage": 55.2 }
  ],
  "priceStats": {
    "averagePrice": 3500000000,
    "medianPrice": 2800000000,
    "minPrice": 200000000,
    "maxPrice": 25000000000,
    "averagePricePerSqm": 53846154
  },
  "rentStats": {
    "averageRent": 24500000,
    "medianRent": 18500000,
    "minRent": 5000000,
    "maxRent": 150000000,
    "averageRentPerSqm": 376923
  },
  "areaStats": {
    "averageArea": 65.2,
    "medianArea": 55,
    "minArea": 20,
    "maxArea": 500
  },
  "dataQuality": {
    "verifiedPercentage": 87.5,
    "withCoordinatesPercentage": 92.3,
    "completeDataPercentage": 78.6,
    "completenessScore": 86
  },
  "dateRange": {
    "earliestDate": "2024-01-15",
    "latestDate": "2026-03-27",
    "recencyDays": 0
  },
  "lastUpdated": "2026-03-27T10:50:00Z"
}
```

#### Status Codes

- `200 OK`: Statistics retrieved
- `500 Internal Server Error`: Failed to generate statistics

---

### 9. List Comparable Properties

**GET** `/api/dataset/comps`

Retrieve paginated list of comparable properties with optional filters.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 20 | Results per page |
| `offset` | number | 0 | Pagination offset |
| `district` | string | - | Filter by district |
| `propertyType` | string | - | Filter by property type |
| `priceMin` | number | - | Minimum price (VND) |
| `priceMax` | number | - | Maximum price (VND) |
| `areaMin` | number | - | Minimum area (m²) |
| `areaMax` | number | - | Maximum area (m²) |
| `verified` | boolean | - | Only verified properties |
| `sortBy` | string | createdAt | Sort field (price, area, distance) |
| `sortOrder` | string | desc | asc or desc |

#### Response (200 OK)

```json
{
  "comps": [
    {
      "id": "comp-uuid-1",
      "address": "234 Nguyễn Hữu Cảnh, Quận 1",
      "coordinates": { "lat": 10.7756, "lng": 106.7019 },
      "propertyType": "commercial",
      "area": 75,
      "bedrooms": 0,
      "bathrooms": 2,
      "listingPrice": 4200000000,
      "soldPrice": 4050000000,
      "monthlyRent": 28500000,
      "pricePerSqm": 54000000,
      "rentPerSqm": 380000,
      "transactionType": "sale",
      "status": "sold",
      "yearBuilt": 2015,
      "condition": "good",
      "furnishing": "semi-furnished",
      "frontWidth": 5.5,
      "alleyWidth": 3.2,
      "distanceToMainRoad": 25,
      "amenities": ["Điều hòa", "Thang máy", "Bảo vệ 24/7"],
      "listingDate": "2025-11-10",
      "transactionDate": "2026-02-15",
      "source": "Batdongsan.com",
      "verified": true,
      "notes": "Corner location, high foot traffic",
      "createdAt": "2026-02-16T09:30:00Z",
      "updatedAt": "2026-02-16T09:30:00Z"
    }
  ],
  "total": 1450,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

#### Status Codes

- `200 OK`: Success
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Failed to retrieve comps

---

## Data Persistence

### Storage Implementation

All data is persisted using a **file-system based approach** suitable for MVP development:

#### Analysis Storage

```typescript
// File: /data/analyses/{id}.json
{
  "id": "analysis-1774487342-uuid",
  "location": { /* ... */ },
  "filters": { /* ... */ },
  "businessFitScores": [ /* ... */ ],
  // ... full analysis data
  "createdAt": "ISO8601 timestamp",
  "updatedAt": "ISO8601 timestamp"
}
```

**Access Pattern:**
- Create: Write new file to `/data/analyses/{uuid}.json`
- Read: Load JSON from file
- Update: Merge new data and rewrite file
- Delete: Remove file
- List: Scan directory, read metadata from each file

#### Comparable Properties Storage

```typescript
// File: /data/comps/{id}.json
{
  "id": "comp-uuid-1",
  "address": "...",
  "coordinates": { /* ... */ },
  "pricePerSqm": 54000000,
  // ... full comp data
  "createdAt": "ISO8601 timestamp",
  "updatedAt": "ISO8601 timestamp"
}
```

#### Dataset Metadata

```typescript
// File: /data/datasets.json
{
  "totalComps": 1450,
  "compsByType": [ /* ... */ ],
  "priceStats": { /* ... */ },
  "lastUpdated": "ISO8601 timestamp",
  "index": {
    "byDistrict": { "Quận 1": [id1, id2, ...], ... },
    "byType": { "commercial": [id1, id2, ...], ... }
  }
}
```

### Indexing Strategy

- **District Index**: Map each district to comp IDs for fast filtering
- **Type Index**: Map property types to comp IDs
- **Price Index**: Maintain price range for quick range queries
- **Metadata Cache**: Store aggregated stats for performance

### Update Frequency

- **Analyses**: Updated immediately on creation, save toggle, or deletion
- **Comps**: Updated on each upload, verified status change
- **Dataset Stats**: Rebuilt after each CSV upload, cached for 1 hour
- **Indexes**: Rebuilt when dataset changes significantly

### Scalability Notes

Current file-based approach is suitable for:
- Up to 10,000 analyses
- Up to 50,000 comparable properties
- File I/O operations < 1 second

For larger scale, recommend migrating to:
- PostgreSQL/MongoDB for persistent storage
- Redis for caching and real-time stats
- Cloud storage (S3) for CSV archives

---

## File Structure

### API Routes

```
app/api/
├── analyze/
│   └── route.ts              # POST /api/analyze
├── history/
│   ├── route.ts              # GET /api/history, DELETE /api/history
│   └── [id]/
│       └── route.ts          # GET/PATCH/DELETE /api/history/[id]
├── upload-comps/
│   └── route.ts              # POST /api/upload-comps
└── dataset/
    ├── stats/
    │   └── route.ts          # GET /api/dataset/stats
    └── comps/
        └── route.ts          # GET /api/dataset/comps
```

### Supporting Libraries

```
lib/
├── analysis-engine.ts        # Core analysis logic
├── scoring.ts                # Business fit scoring algorithm
├── csv-parser.ts             # CSV parsing and validation
├── mock-data.ts              # Mock district and business data
├── utils.ts                  # Utility functions
└── file-storage.ts           # File I/O operations [to be created]
```

### Data Directory

```
data/
├── analyses/                 # Individual analysis JSON files
├── comps/                    # Individual comparable JSON files
└── datasets.json             # Dataset metadata and index
```

---

## Usage Examples

### Example 1: Analyze a Location

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "businessModel": "fnb",
    "targetRevenue": 50000000,
    "maxRent": 20000000,
    "minArea": 30,
    "maxArea": 150,
    "districts": ["Quận 1", "Quận 3"],
    "radius": 500,
    "centerCoordinates": {
      "lat": 10.7756,
      "lng": 106.7019
    }
  }'
```

**JavaScript/TypeScript:**

```typescript
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    businessModel: 'fnb',
    targetRevenue: 50000000,
    maxRent: 20000000,
    minArea: 30,
    maxArea: 150,
    districts: ['Quận 1', 'Quận 3'],
    radius: 500,
    centerCoordinates: {
      lat: 10.7756,
      lng: 106.7019
    }
  })
});

const analysis = await response.json();
console.log(`Analysis Score: ${analysis.confidenceScore}`);
```

### Example 2: Retrieve Analysis History

```bash
curl "http://localhost:3000/api/history?limit=10&businessModel=fnb&sortBy=createdAt&sortOrder=desc"
```

**JavaScript:**

```typescript
const response = await fetch('/api/history?limit=10&businessModel=fnb&isSaved=true');
const data = await response.json();

data.analyses.forEach(analysis => {
  console.log(`${analysis.location.address}: ${analysis.recommendation}`);
});
```

### Example 3: Upload Comparable Properties

```bash
curl -X POST http://localhost:3000/api/upload-comps \
  -F "file=@comps-data.csv"
```

**JavaScript/FormData:**

```typescript
const formData = new FormData();
formData.append('file', csvFile);

const response = await fetch('/api/upload-comps', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(`Imported: ${result.summary.newComps} new properties`);
console.log(`Failed: ${result.failedCount} rows`);
```

### Example 4: Get Dataset Statistics

```bash
curl http://localhost:3000/api/dataset/stats
```

**JavaScript:**

```typescript
const response = await fetch('/api/dataset/stats');
const stats = await response.json();

console.log(`Total Comps: ${stats.totalComps}`);
console.log(`Average Price: ${stats.priceStats.averagePrice}`);
console.log(`Data Quality: ${stats.dataQuality.completenessScore}%`);
```

### Example 5: Search Comparable Properties

```bash
curl "http://localhost:3000/api/dataset/comps?district=Quận%201&priceMin=2000000000&priceMax=5000000000&limit=25"
```

**JavaScript:**

```typescript
const params = new URLSearchParams({
  district: 'Quận 1',
  priceMin: '2000000000',
  priceMax: '5000000000',
  limit: '25'
});

const response = await fetch(`/api/dataset/comps?${params}`);
const data = await response.json();

console.log(`Found ${data.total} properties`);
data.comps.forEach(comp => {
  console.log(`${comp.address}: ${comp.pricePerSqm}/m²`);
});
```

### Example 6: Update Analysis Metadata

```bash
curl -X PATCH http://localhost:3000/api/history/analysis-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "isSaved": true,
    "notes": "Excellent location with high foot traffic"
  }'
```

**JavaScript:**

```typescript
const response = await fetch('/api/history/analysis-uuid', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    isSaved: true,
    notes: 'Excellent location with high foot traffic'
  })
});

const updated = await response.json();
console.log(`Saved: ${updated.isSaved}`);
```

---

## Data Models

### Analysis Result Type

```typescript
interface AnalysisResult {
  // Identifiers & metadata
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  
  // Location & filters
  location: Location;
  filters: AnalysisFilters;
  
  // Scoring results
  businessFitScores: BusinessFitScore[];
  confidenceScore: number;
  recommendation: 'highly-recommended' | 'recommended' | 'neutral' | 'not-recommended';
  
  // Analysis details
  nearbyBusinesses: NearbyBusiness[];
  priceEstimate: PriceEstimate;
  riskFlags: RiskFlag[];
  areaSummary: AreaSummary;
  strategyMemo: StrategyMemo;
  
  // User data
  userId?: string;
  isSaved: boolean;
  notes?: string;
  error?: string;
}
```

### Property Comparable Type

```typescript
interface PropertyComp {
  // Identifiers
  id: string;
  
  // Location
  address: Address;
  coordinates: Coordinates;
  
  // Property info
  propertyType: 'apartment' | 'house' | 'commercial' | 'land' | 'villa' | 'shophouse';
  area: number;
  landArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  
  // Pricing
  listingPrice?: number;
  soldPrice?: number;
  monthlyRent?: number;
  pricePerSqm: number;
  rentPerSqm?: number;
  
  // Transaction
  transactionType: 'sale' | 'rent' | 'both';
  status: 'active' | 'sold' | 'rented' | 'expired';
  listingDate: string;
  transactionDate?: string;
  
  // Physical attributes
  yearBuilt?: number;
  condition?: 'new' | 'good' | 'average' | 'needs-renovation';
  furnishing?: 'fully-furnished' | 'semi-furnished' | 'unfurnished';
  frontWidth?: number;
  alleyWidth?: number;
  distanceToMainRoad?: number;
  amenities?: string[];
  
  // Metadata
  source: string;
  sourceUrl?: string;
  verified: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Dataset Stats Type

```typescript
interface DatasetStats {
  totalComps: number;
  compsByType: { type: string; count: number; percentage: number }[];
  compsByDistrict: { district: string; count: number; percentage: number }[];
  compsByTransactionType: { transactionType: string; count: number; percentage: number }[];
  
  priceStats: {
    averagePrice: number;
    medianPrice: number;
    minPrice: number;
    maxPrice: number;
    averagePricePerSqm: number;
  };
  
  rentStats: {
    averageRent: number;
    medianRent: number;
    minRent: number;
    maxRent: number;
    averageRentPerSqm: number;
  };
  
  areaStats: {
    averageArea: number;
    medianArea: number;
    minArea: number;
    maxArea: number;
  };
  
  dataQuality: {
    verifiedPercentage: number;
    withCoordinatesPercentage: number;
    completeDataPercentage: number;
    completenessScore: number;
  };
  
  dateRange: {
    earliestDate: string;
    latestDate: string;
    recencyDays: number;
  };
  
  lastUpdated: string;
}
```

---

## Error Handling

### Standard Error Response

All errors follow a consistent format:

```json
{
  "error": "Descriptive error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "fieldName",
    "issue": "Specific validation issue"
  },
  "timestamp": "2026-03-27T10:30:00Z"
}
```

### HTTP Status Codes

| Status | Meaning | When Used |
|--------|---------|-----------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST (new resource) |
| 400 | Bad Request | Invalid input, missing required fields |
| 404 | Not Found | Resource doesn't exist |
| 413 | Payload Too Large | File exceeds size limit |
| 415 | Unsupported Media Type | Wrong file format |
| 422 | Unprocessable Entity | Validation error (semantically invalid) |
| 500 | Internal Server Error | Server-side failure |

### Common Error Scenarios

**Invalid Business Model:**
```json
{
  "error": "Invalid business model",
  "code": "INVALID_BUSINESS_MODEL",
  "details": {
    "field": "businessModel",
    "issue": "Must be one of: fnb, airbnb, retail"
  }
}
```

**CSV Validation Errors:**
```json
{
  "error": "CSV validation failed",
  "code": "CSV_VALIDATION_FAILED",
  "details": {
    "errors": [
      { "row": 5, "field": "price", "message": "Invalid price format" },
      { "row": 12, "field": "area", "message": "Area must be positive" }
    ]
  }
}
```

**File Not Found:**
```json
{
  "error": "Analysis not found",
  "code": "RESOURCE_NOT_FOUND",
  "details": {
    "resource": "analysis",
    "id": "invalid-uuid"
  }
}
```

---

## Response Formats

### Pagination

List endpoints return paginated responses:

```json
{
  "data": [ /* items */ ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true,
    "nextOffset": 20
  }
}
```

### Timestamps

All timestamps use ISO 8601 format with UTC timezone:

```
2026-03-27T10:30:00Z
```

### Currency

All monetary values in Vietnamese Dong (VND):

```json
{
  "monthlyRent": 18500000,
  "currency": "VND"
}
```

### Coordinates

Standard latitude/longitude format:

```json
{
  "coordinates": {
    "lat": 10.7756,
    "lng": 106.7019
  }
}
```

### Success Responses

Successful responses include data and metadata:

```json
{
  "success": true,
  "data": { /* ... */ },
  "timestamp": "2026-03-27T10:30:00Z"
}
```

---

## Future Enhancements

### Phase 2 (Database Integration)

- Migrate from file storage to PostgreSQL
- Implement real-time indexing
- Add full-text search capabilities
- Implement audit logging

### Phase 3 (Advanced Features)

- API authentication (JWT tokens)
- Rate limiting and quota management
- Webhook notifications
- Batch analysis operations
- Export/report generation

### Phase 4 (Optimization)

- Redis caching layer
- Elasticsearch for advanced search
- CDN for static assets
- Monitoring and analytics

---

## Related Documentation

- **Types & Interfaces**: See `/types/analysis.ts`, `/types/dataset.ts`
- **Analysis Engine**: See `/lib/analysis-engine.ts`
- **CSV Parser**: See `/lib/csv-parser.ts`
- **Frontend Pages**: See `/app/*.tsx` for consumer endpoints

---

**Document Maintained By:** Development Team  
**Last Review:** 27 March 2026  
**Next Review Date:** 27 April 2026
