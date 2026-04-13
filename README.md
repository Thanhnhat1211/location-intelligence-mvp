# 🗺️ Location Intelligence MVP

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Nền tảng phân tích địa điểm kinh doanh thông minh cho thị trường Việt Nam**

**AI-Powered Business Location Intelligence Platform for Vietnam Market**

[Demo](#) • [Documentation](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 📋 Mục lục / Table of Contents

- [Giới thiệu / Overview](#-giới-thiệu--overview)
- [Tính năng / Features](#-tính-năng--features)
- [Tech Stack](#-tech-stack)
- [Cấu trúc dự án / Project Structure](#-cấu-trúc-dự-án--project-structure)
- [Bắt đầu / Getting Started](#-bắt-đầu--getting-started)
- [Biến môi trường / Environment Variables](#-biến-môi-trường--environment-variables)
- [API Routes](#-api-routes)
- [Components Documentation](#-components-documentation)
- [Development Roadmap](#-development-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Giới thiệu / Overview

### Tiếng Việt

**Location Intelligence MVP** là nền tảng phân tích địa điểm kinh doanh được xây dựng đặc biệt cho thị trường Việt Nam. Ứng dụng giúp các nhà đầu tư, chủ doanh nghiệp đưa ra quyết định sáng suốt khi chọn địa điểm kinh doanh thông qua:

- 🤖 **Phân tích AI-powered**: Sử dụng GPT-4 để đánh giá và đưa ra khuyến nghị
- 📊 **Scoring đa chiều**: Đánh giá vị trí, nhân khẩu học, cạnh tranh, lưu lượng người, cơ sở hạ tầng
- 🗺️ **Tích hợp bản đồ**: Hiển thị trực quan trên Google Maps
- 💰 **Định giá tự động**: Ước tính giá thuê/mua dựa trên comparable data
- ⚠️ **Phát hiện rủi ro**: Cảnh báo các risk flags tiềm ẩn
- 📈 **Quản lý dataset**: Upload và quản lý dữ liệu comps từ CSV

### English

**Location Intelligence MVP** is a business location analysis platform specifically built for the Vietnamese market. The application helps investors and business owners make informed decisions when choosing business locations through:

- 🤖 **AI-powered Analysis**: Leveraging GPT-4 for evaluation and recommendations
- 📊 **Multi-dimensional Scoring**: Evaluates location, demographics, competition, foot traffic, infrastructure
- 🗺️ **Map Integration**: Visual display on Google Maps
- 💰 **Automated Pricing**: Rent/purchase price estimation based on comparable data
- ⚠️ **Risk Detection**: Alert potential risk flags
- 📈 **Dataset Management**: Upload and manage comps data from CSV

---

## ✨ Tính năng / Features

### ✅ Đã triển khai / Implemented

#### 1. **Hệ thống Type Definitions**
- ✅ Location types (Coordinates, Address, District, AreaInfo, Location)
- ✅ Analysis types (BusinessModel, Filters, Scores, RiskFlags, StrategyMemo)
- ✅ Dataset types (PropertyComp, DatasetStats, UploadResult)

#### 2. **UI Components (40+ components)**
- ✅ **shadcn/ui Base Components**: Button, Card, Input, Label, Badge, Select, Tabs, Dialog, Toast, Progress, Slider, Separator
- ✅ **Layout Components**: AppShell, Sidebar Navigation, Topbar
- ✅ **Shared Components**: LoadingSkeleton, EmptyState, ErrorState, SectionHeader, StatChip

#### 3. **Analyze Module (10 components)**
- ✅ AnalyzeFiltersPanel - Bộ lọc tìm kiếm địa điểm
- ✅ MapPreviewCard - Hiển thị bản đồ
- ✅ BusinessFitScoreCard - Điểm phù hợp kinh doanh
- ✅ BusinessFitGrid - Lưới so sánh các business models
- ✅ AreaSummaryCard - Tổng quan khu vực
- ✅ NearbyBusinessBreakdown - Phân tích doanh nghiệp lân cận
- ✅ PriceEstimateCard - Ước tính giá
- ✅ RiskFlagsCard - Cảnh báo rủi ro
- ✅ StrategyMemoCard - AI strategy memo
- ✅ SaveAnalysisButton - Lưu phân tích

#### 4. **History Module**
- ✅ HistoryCard - Card hiển thị lịch sử phân tích
- ✅ HistoryList - Danh sách lịch sử với filter và search

#### 5. **Data Management Module**
- ✅ UploadCompsCard - Upload CSV comps data
- ✅ DatasetStatsCard - Thống kê dataset
- ✅ CompTablePreview - Preview bảng comps

#### 6. **Settings Module**
- ✅ ApiStatusCard - Quản lý và kiểm tra API keys (OpenAI, Google Maps)
- ✅ ModelConfigCard - Cấu hình AI model parameters
- ✅ WeightConfigCard - Tùy chỉnh trọng số scoring với presets

#### 7. **Custom Hooks**
- ✅ use-analysis - Hook quản lý analysis state và operations
- ✅ use-history - Hook quản lý lịch sử phân tích
- ✅ use-dataset - Hook quản lý dataset và comps

#### 8. **Pages Implementation**
- ✅ Home (/) - Dashboard tổng quan
- ✅ Analyze (/analyze) - Trang phân tích địa điểm
- ✅ History (/history) - Lịch sử phân tích
- ✅ Data (/data) - Quản lý dataset
- ✅ Settings (/settings) - Cấu hình hệ thống

#### 9. **Core Libraries**
- ✅ mock-data.ts - Dữ liệu mẫu cho development
- ✅ scoring.ts - Hệ thống tính điểm
- ✅ analysis-engine.ts - Engine phân tích AI
- ✅ csv-parser.ts - Parser CSV files
- ✅ openai.ts - OpenAI integration wrapper

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5.0](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks + Context API

### Backend & Services
- **AI**: OpenAI GPT-4 API
- **Maps**: Google Maps API
- **Data Storage**: Local Storage / IndexedDB (MVP)
- **File Processing**: CSV parsing với PapaParse

### Development Tools
- **Package Manager**: npm/yarn/pnpm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Git**: Git + GitHub

---

## 📁 Cấu trúc dự án / Project Structure

```
location-intelligence-mvp/
├── 📁 app/                          # Next.js App Router
│   ├── layout.tsx                   # Root layout với AppShell
│   ├── page.tsx                     # Homepage / Dashboard
│   ├── analyze/
│   │   └── page.tsx                 # Trang phân tích địa điểm
│   ├── history/
│   │   └── page.tsx                 # Lịch sử phân tích
│   ├── data/
│   │   └── page.tsx                 # Quản lý dataset
│   └── settings/
│       └── page.tsx                 # Cấu hình hệ thống
│
├── 📁 components/                   # React Components
│   ├── ui/                          # shadcn/ui base components (13 components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── badge.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx
│   │   ├── progress.tsx
│   │   ├── slider.tsx
│   │   ├── separator.tsx
│   │   └── use-toast.ts
│   │
│   ├── layout/                      # Layout components
│   │   ├── app-shell.tsx            # Main app wrapper
│   │   ├── sidebar-nav.tsx          # Navigation sidebar
│   │   └── topbar.tsx               # Top navigation bar
│   │
│   ├── shared/                      # Shared/reusable components
│   │   ├── loading-skeleton.tsx     # Loading states
│   │   ├── empty-state.tsx          # Empty states
│   │   ├── error-state.tsx          # Error states
│   │   ├── section-header.tsx       # Section headers
│   │   └── stat-chip.tsx            # Statistic chips
│   │
│   ├── analyze/                     # Analyze module components (10)
│   │   ├── analyze-filters-panel.tsx
│   │   ├── map-preview-card.tsx
│   │   ├── business-fit-score-card.tsx
│   │   ├── business-fit-grid.tsx
│   │   ├── area-summary-card.tsx
│   │   ├── nearby-business-breakdown.tsx
│   │   ├── price-estimate-card.tsx
│   │   ├── risk-flags-card.tsx
│   │   ├── strategy-memo-card.tsx
│   │   └── save-analysis-button.tsx
│   │
│   ├── history/                     # History module components
│   │   ├── history-card.tsx
│   │   └── history-list.tsx
│   │
│   ├── data/                        # Data management components
│   │   ├── upload-comps-card.tsx
│   │   ├── dataset-stats-card.tsx
│   │   └── comp-table-preview.tsx
│   │
│   └── settings/                    # Settings components
│       ├── api-status-card.tsx
│       ├── model-config-card.tsx
│       └── weight-config-card.tsx
│
├── 📁 types/                        # TypeScript type definitions
│   ├── location.ts                  # Location-related types
│   ├── analysis.ts                  # Analysis-related types
│   └── dataset.ts                   # Dataset-related types
│
├── 📁 lib/                          # Utility libraries
│   ├── utils.ts                     # General utilities
│   ├── mock-data.ts                 # Mock data for development
│   ├── scoring.ts                   # Scoring calculation engine
│   ├── analysis-engine.ts           # AI analysis engine
│   ├── csv-parser.ts                # CSV file parser
│   └── openai.ts                    # OpenAI API wrapper
│
├── 📁 hooks/                        # Custom React hooks
│   ├── use-analysis.ts              # Analysis state management
│   ├── use-history.ts               # History management
│   └── use-dataset.ts               # Dataset management
│
├── 📁 styles/                       # Global styles
│   └── globals.css                  # Tailwind + custom CSS
│
├── 📁 public/                       # Static assets
│   └── ...
│
├── .env.local                       # Environment variables
├── next.config.mjs                  # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── components.json                  # shadcn/ui configuration
├── package.json                     # Dependencies
└── README.md                        # This file
```

---

## 🚀 Bắt đầu / Getting Started

### Prerequisites

- Node.js 18.0 trở lên
- npm, yarn, hoặc pnpm
- OpenAI API key
- Google Maps API key

### Installation

1. **Clone repository**
```bash
git clone https://github.com/yourusername/location-intelligence-mvp.git
cd location-intelligence-mvp
```

2. **Cài đặt dependencies**
```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

3. **Tạo file `.env.local`**
```bash
cp .env.example .env.local
```

4. **Cấu hình environment variables** (xem phần tiếp theo)

5. **Chạy development server**
```bash
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
```

6. **Mở trình duyệt**
```
http://localhost:3000
```

### Build cho Production

```bash
# Build
npm run build

# Start production server
npm run start
```

---

## 🔐 Biến môi trường / Environment Variables

Tạo file `.env.local` trong thư mục root:

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Google Maps API Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Location Intelligence

# Optional: Database (for future implementation)
# DATABASE_URL=postgresql://user:password@localhost:5432/location_intel
```

### Lấy API Keys

#### OpenAI API Key
1. Truy cập [OpenAI Platform](https://platform.openai.com/)
2. Đăng ký/Đăng nhập tài khoản
3. Vào **API Keys** section
4. Tạo new API key
5. Copy và paste vào `.env.local`

#### Google Maps API Key
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Enable các APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Tạo credentials (API Key)
5. Copy và paste vào `.env.local`

---

## 🌐 API Routes

> **Note**: MVP version sử dụng mock data. Các API routes thực sẽ được implement trong phiên bản production.

### Planned API Endpoints

```typescript
// Analysis APIs
POST   /api/analyze              // Phân tích địa điểm mới
GET    /api/analyze/:id          // Lấy kết quả phân tích
PUT    /api/analyze/:id          // Cập nhật phân tích
DELETE /api/analyze/:id          // Xóa phân tích

// History APIs
GET    /api/history              // Lấy danh sách lịch sử
GET    /api/history/:id          // Lấy chi tiết lịch sử
DELETE /api/history/:id          // Xóa lịch sử

// Dataset APIs
GET    /api/dataset              // Lấy thống kê dataset
POST   /api/dataset/upload       // Upload CSV comps
GET    /api/dataset/comps        // Lấy danh sách comps
GET    /api/dataset/comps/:id    // Lấy chi tiết comp
PUT    /api/dataset/comps/:id    // Cập nhật comp
DELETE /api/dataset/comps/:id    // Xóa comp

// Settings APIs
GET    /api/settings             // Lấy cấu hình
PUT    /api/settings/api-keys    // Cập nhật API keys
PUT    /api/settings/model       // Cập nhật model config
PUT    /api/settings/weights     // Cập nhật scoring weights

// AI APIs
POST   /api/ai/generate-memo     // Tạo strategy memo
POST   /api/ai/chat              // Chat với AI assistant
```

---

## 📚 Components Documentation

### Core Components

#### 1. **Layout Components**

**AppShell** - Main application wrapper
```tsx
<AppShell>
  {/* Content here */}
</AppShell>
```
- Provides sidebar navigation
- Top bar with search and user menu
- Responsive layout

**SidebarNav** - Navigation sidebar
- Active route highlighting
- Collapsible on mobile
- Badge support for notifications

**Topbar** - Top navigation bar
- Global search
- User profile menu
- Breadcrumb navigation

#### 2. **Analyze Components**

**AnalyzeFiltersPanel** - Search and filter panel
- Business model selection
- District filtering
- Budget range sliders
- Area size filters

**MapPreviewCard** - Interactive map display
- Google Maps integration
- Location markers
- Nearby businesses overlay

**BusinessFitScoreCard** - Score visualization
- Circular progress indicators
- Score breakdown
- Confidence level

**StrategyMemoCard** - AI-generated insights
- SWOT analysis
- Recommendations
- ROI projections

#### 3. **Settings Components**

**ApiStatusCard** - API management
- Connection status indicators
- API key input (masked)
- Test connection functionality

**ModelConfigCard** - AI model configuration
- Model selection (GPT-4, GPT-3.5)
- Temperature, tokens, penalties
- System prompt editing

**WeightConfigCard** - Scoring weight configuration
- 5 weight factors with sliders
- Weight presets (Balanced, F&B optimized, etc.)
- Auto-normalization
- Visual distribution chart

### Shared Components

**LoadingSkeleton** - Loading states
**EmptyState** - Empty state messages
**ErrorState** - Error handling UI
**StatChip** - Statistic display chips

---

## 🗺️ Development Roadmap

### Phase 1: MVP ✅ (Current)
- [x] Core UI components
- [x] Type definitions
- [x] Mock data integration
- [x] Basic scoring algorithm
- [x] Settings management

### Phase 2: Backend Integration 🚧
- [ ] Real API implementation
- [ ] Database integration (PostgreSQL)
- [ ] User authentication (NextAuth.js)
- [ ] File upload to cloud storage
- [ ] Real-time updates (WebSocket)

### Phase 3: Advanced Features 📋
- [ ] Multi-language support (EN/VI)
- [ ] Export reports (PDF/Excel)
- [ ] Collaboration features
- [ ] Advanced filtering
- [ ] Saved searches
- [ ] Email notifications

### Phase 4: AI Enhancements 🤖
- [ ] Custom AI training on Vietnam market data
- [ ] Predictive analytics
- [ ] Market trend analysis
- [ ] Competitor analysis
- [ ] Automated report generation

### Phase 5: Mobile App 📱
- [ ] React Native mobile app
- [ ] Offline mode
- [ ] Camera integration for site visits
- [ ] GPS-based search

### Phase 6: Enterprise Features 🏢
- [ ] Team management
- [ ] Role-based access control
- [ ] White-label options
- [ ] API for third-party integration
- [ ] Custom branding

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

---

## 📊 Performance Metrics

- **Lighthouse Score**: 95+ (target)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: < 200KB (gzipped)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Location Intelligence MVP

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGithub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for amazing UI components
- [Lucide](https://lucide.dev/) for beautiful icons
- [Next.js](https://nextjs.org/) team for the framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [OpenAI](https://openai.com/) for GPT-4 API
- [Google Maps Platform](https://mapsplatform.google.com/) for mapping services

---

## 📧 Contact

Project Link: [https://github.com/yourusername/location-intelligence-mvp](https://github.com/yourusername/location-intelligence-mvp)

For questions or support: [your.email@example.com](mailto:your.email@example.com)

---

<div align="center">

**Made with ❤️ for Vietnamese market**

**Được xây dựng với ❤️ cho thị trường Việt Nam**

⭐ Star this repo if you find it helpful!

</div>
