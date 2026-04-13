# Location Intelligence MVP

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Claude AI](https://img.shields.io/badge/Claude_AI-Sonnet_4-orange?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

**Nen tang phan tich dia diem kinh doanh thong minh tai TP.HCM**

[Demo truc tuyen](https://location-intelligence-mvp.vercel.app/) &bull; [Bao loi](https://github.com/Thanhnhat1211/location-intelligence-mvp/issues)

</div>

---

## Gioi thieu

**Location Intelligence MVP** la ung dung phan tich dia diem kinh doanh danh rieng cho thi truong TP. Ho Chi Minh. Ung dung giup nha dau tu, chu doanh nghiep nho va startup danh gia nhanh mot dia diem co phu hop de mo quan an, Airbnb, hay cua hang ban le hay khong — truoc khi bo tien thue mat bang.

### App nay giup gi?

| Van de thuong gap | Location Intelligence giup ban |
|---|---|
| Khong biet khu vuc nao dang co nhieu doi thu | Phan tich so luong doi thu canh tranh trong ban kinh gan nhat |
| Khong ro gia thue mat bang co hop ly khong | Uoc tinh gia thue trung binh khu vuc va so sanh |
| Khong biet khu vuc do co tiem nang khong | Cham diem da chieu: vi tri, nhan khau hoc, canh tranh, ha tang |
| Can nguoi tu van nhung chua co ngan sach | AI Claude tu dong tao bao cao chien luoc (SWOT, khuyen nghi) |
| Muon so sanh nhieu dia diem | Luu lich su phan tich, xem lai va so sanh bat ky luc nao |

---

## Tinh nang chinh

### 1. Ban do tuong tac (Interactive Map)
- Ban do OpenStreetMap toan bo Viet Nam, tap trung TP.HCM
- **Click vao ban do** de chon chinh xac vi tri can phan tich
- Tu dong lay dia chi tu toa do (reverse geocoding)
- Nut "Vi tri cua toi" de dinh vi nhanh bang GPS
- Hien thi cac doanh nghiep lan can sau khi phan tich (ma mau theo loai)

### 2. Phan tich dia diem thong minh
- **3 mo hinh kinh doanh**: F&B / Nha hang, Airbnb / Homestay, Ban le / Cua hang
- Cham diem 4 chieu: Vi tri, Nhan khau hoc, Canh tranh, Ha tang
- Diem tong hop tren thang 100 diem
- Phat hien va canh bao rui ro tu dong (flood zone, giay phep, v.v.)

### 3. AI Strategy Memo (Claude Sonnet 4)
- Tu dong tao bao cao chien luoc bang tieng Viet
- Phan tich SWOT: Diem manh, Diem yeu, Co hoi, Thach thuc
- Khuyen nghi hanh dong cu the voi muc do uu tien (cao/trung binh/thap)
- Du bao ROI (Return on Investment)
- **Fallback thong minh**: Neu khong co API key, app van hoat dong voi bao cao tu dong deterministic

### 4. Thong tin khu vuc
- Mat do dan so, thu nhap trung binh
- Gia thue mat bang trung binh
- Ti le trong (vacancy rate) va bao hoa thi truong
- So luong doi thu canh tranh gan do

### 5. Uoc tinh gia
- Gia thue thang, gia/m2, tien dat coc du kien
- Xu huong gia (+/- %) trong khu vuc

### 6. Lich su phan tich
- Luu moi ket qua phan tich tu dong
- Tim kiem, loc theo thoi gian
- Danh dau "Da luu" de truy cap nhanh
- Xem lai bao cao day du bat ky luc nao

### 7. Quan ly du lieu
- Upload file CSV du lieu comparable (comps)
- Xem thong ke dataset
- Preview bang du lieu truc tiep

---

## Cong nghe su dung

| Thanh phan | Cong nghe |
|---|---|
| Framework | Next.js 14 (App Router) |
| Ngon ngu | TypeScript |
| Giao dien | Tailwind CSS + shadcn/ui |
| Ban do | Leaflet + OpenStreetMap (mien phi, khong can API key) |
| Geocoding | Nominatim (OpenStreetMap, mien phi) |
| AI | Anthropic Claude Sonnet 4 |
| Luu tru | File JSON tren server (co the cau hinh DATA_DIR) |
| Icons | Lucide React |
| Deploy | Vercel (mien phi) |

---

## Cai dat va chay thu

### Yeu cau

- Node.js 20 tro len
- npm

### Cac buoc cai dat

```bash
# 1. Clone du an
git clone https://github.com/Thanhnhat1211/location-intelligence-mvp.git
cd location-intelligence-mvp

# 2. Cai dat dependencies
npm install --legacy-peer-deps

# 3. Tao file cau hinh
cp .env.example .env.local

# 4. Chay server development
npm run dev
```

Mo trinh duyet tai **http://localhost:3000**

### Build production

```bash
npm run build
npm run start
```

---

## Cau hinh Environment Variables

Tao file `.env.local` voi noi dung:

```env
# (Tuy chon) API key cua Anthropic Claude - app van chay khong can key
ANTHROPIC_API_KEY=sk-ant-...

# (Tuy chon) Thu muc luu du lieu - mac dinh la ./data
# DATA_DIR=/path/to/data

# Thong tin app
NEXT_PUBLIC_APP_NAME="Location Intelligence MVP"
NEXT_PUBLIC_APP_VERSION="0.1.0"
```

### Lay Anthropic API Key

1. Truy cap [console.anthropic.com](https://console.anthropic.com/)
2. Dang ky tai khoan (co free credits cho lan dau)
3. Vao **Settings > API Keys** > tao key moi
4. Copy key va dan vao `.env.local`

> **Luu y**: Tai khoan Claude Pro (claude.ai) va Claude API (console.anthropic.com) la rieng biet. Ban can dang ky API rieng.

> **Khong co API key?** Khong sao! App van hoat dong day du voi bao cao tu dong (deterministic). Chi co phan "AI Strategy Memo" se dung ban tao san thay vi AI.

---

## Huong dan su dung

### Buoc 1: Chon vi tri tren ban do

1. Mo trang **Phan tich** tu menu ben trai
2. Ban do se hien thi — click vao vi tri ban muon phan tich
3. Marker se xuat hien va dia chi tu dong duoc dien
4. Hoac nhan nut **"Vi tri cua toi"** de dung GPS

### Buoc 2: Chon mo hinh kinh doanh

- **F&B / Nha hang**: Quan an, quan ca phe, tra sua, nha hang
- **Airbnb / Homestay**: Cho thue ngan han, homestay, khach san mini
- **Ban le / Cua hang**: Cua hang tien loi, shop thoi trang, tap hoa

### Buoc 3: Tuy chinh bo loc (tuy chon)

- Doanh thu muc tieu
- Gia thue toi da
- Dien tich mong muon
- Quan/Huyen cu the

### Buoc 4: Nhan "Phan tich dia diem"

App se tra ve:
- **Diem phu hop kinh doanh** (tren 100 diem, chia theo 4 chieu)
- **Tong quan khu vuc** (dan so, thu nhap, gia thue, ti le trong)
- **Doanh nghiep lan can** (doi thu, bo sung, dich vu)
- **Uoc tinh gia thue** mat bang
- **Canh bao rui ro** (neu co)
- **Bao cao chien luoc AI** (SWOT + khuyen nghi)

### Buoc 5: Luu va so sanh

- Nhan **"Luu phan tich"** de danh dau
- Vao trang **Lich su** de xem lai tat ca bao cao truoc do
- So sanh nhieu dia diem de chon noi tot nhat

---

## Cau truc API

| Method | Endpoint | Mo ta |
|---|---|---|
| POST | `/api/analyze` | Phan tich dia diem moi |
| GET | `/api/history` | Lay danh sach lich su phan tich |
| GET | `/api/history/[id]` | Xem chi tiet 1 phan tich |
| PATCH | `/api/history/[id]` | Cap nhat trang thai luu |
| DELETE | `/api/history/[id]` | Xoa phan tich |
| GET | `/api/dataset/stats` | Thong ke dataset |
| GET | `/api/dataset/comps` | Lay danh sach comps |
| POST | `/api/upload-comps` | Upload CSV comps |
| GET | `/api/health` | Health check |

---

## Cau truc thu muc

```
location-intelligence-mvp/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (fonts, theme)
│   ├── page.tsx            # Trang chu / Dashboard
│   ├── analyze/            # Trang phan tich dia diem
│   ├── history/            # Lich su phan tich
│   ├── data/               # Quan ly dataset
│   ├── settings/           # Cau hinh he thong
│   └── api/                # API routes (server-side)
│
├── components/
│   ├── ui/                 # shadcn/ui components (button, card, input, ...)
│   ├── layout/             # AppShell, Sidebar, Topbar
│   ├── analyze/            # Map, filters, score cards, strategy memo
│   ├── history/            # History cards, list
│   ├── data/               # Upload, stats, table preview
│   ├── settings/           # API status, model config, weights
│   └── shared/             # Loading, empty state, error state
│
├── lib/
│   ├── ai-client.ts        # Anthropic Claude integration
│   ├── analysis-engine.ts  # Deterministic analysis engine
│   ├── scoring.ts          # Scoring algorithms
│   ├── mock-data.ts        # Mock data (districts, demographics)
│   ├── file-store.ts       # JSON file storage
│   └── csv-parser.ts       # CSV parser
│
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── styles/globals.css      # Tailwind + color theme
├── render.yaml             # Render deployment config
└── .env.example            # Environment variables template
```

---

## Deploy len Vercel

1. Push code len GitHub
2. Truy cap [vercel.com](https://vercel.com/) > dang nhap bang GitHub
3. **Add New Project** > chon repo `location-intelligence-mvp`
4. Them Environment Variable: `ANTHROPIC_API_KEY` = key cua ban
5. Nhan **Deploy**

App se co tai dia chi: `https://location-intelligence-mvp.vercel.app`

> **Luu y**: Vercel serverless nen lich su phan tich se bi reset khi re-deploy. Voi MVP demo thi day la chap nhan duoc.

---

## Cac quan/huyen duoc ho tro

App hien tai ho tro 17 quan/huyen tai TP.HCM:

Quan 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, Thu Duc, Binh Thanh, Phu Nhuan, Tan Binh, Tan Phu, Go Vap, Binh Tan

Moi quan co du lieu: toa do trung tam, mat do dan so, thu nhap trung binh, gia thue, ti le trong, va chi so bao hoa thi truong.

---

## Cau hoi thuong gap

**Q: App co mien phi khong?**
A: Co. App hoan toan mien phi. Chi co tinh nang AI memo can API key cua Anthropic (co free credits).

**Q: Du lieu co chinh xac khong?**
A: Day la phien ban MVP su dung du lieu mo phong (mock data) dua tren thong ke thuc te. Phien ban production se tich hop du lieu real-time.

**Q: Tai sao toi khong thay AI memo?**
A: Kiem tra xem ban da cau hinh `ANTHROPIC_API_KEY` trong Vercel chua. Neu chua co key, app van hoat dong nhung dung bao cao deterministic.

**Q: Co the dung cho thanh pho khac khong?**
A: Hien tai chi ho tro TP.HCM. Mo rong cho cac thanh pho khac la ke hoach tuong lai.

**Q: Du lieu cua toi co bi chia se khong?**
A: Khong. Moi du lieu phan tich chi luu tren server cua ban (hoac Vercel instance). Khong co database chung.

---

## Tac gia

- **Thanh Nhat** - [GitHub](https://github.com/Thanhnhat1211)

## Cong nghe va thu vien

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/) - Ban do
- [Anthropic Claude](https://www.anthropic.com/) - AI analysis
- [Lucide](https://lucide.dev/) - Icons
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

## License

MIT License - Xem file [LICENSE](LICENSE) de biet them chi tiet.
