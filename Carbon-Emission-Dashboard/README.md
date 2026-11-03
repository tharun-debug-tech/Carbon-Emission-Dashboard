# EcoTrack Analytics: Real-Time Carbon Emission & Sustainability Dashboard

**EcoTrack Analytics** is a commercial-grade, full-stack sustainability SaaS platform designed for monitoring personal and organizational carbon footprints, electricity consumption, transportation logs, waste generation, and real-time atmospheric environmental data.

---

## 🌟 Key Features

- **Hero Landing Page**: Animated Earth canvas, particle background, scroll-driven GSAP & Framer Motion animations, SDG alignment, workflow timeline, count-up statistics, and liquid wave UI footer.
- **Split-Layout Auth**: Email/password authentication and Google OAuth via Supabase Auth with live weather & AQI preview cards.
- **Interactive Analytics Dashboard**:
  - **Module 1: User & Activity Management** — Activity logging, category breakdown, filtering, and real-time database persistence.
  - **Module 2: Carbon Footprint Calculator** — GHG protocol-compliant calculations for electricity (0.82 kg/kWh), transport (fuel-specific factors), and waste. Real-time sustainability score (0-100) and grade (A-F).
  - **Module 3: Real-Time Environment Monitor** — OpenWeather API (temp, humidity, wind, pressure, visibility) & AQICN API (AQI, PM2.5, PM10, CO, NO₂) with interactive OpenStreetMap (Leaflet).
  - **Module 4: Analytics Dashboard** — Line charts, area charts, bar charts, radar charts, pie charts, and a 28-day carbon heatmap calendar.
  - **Module 5: Global Sustainability** — Leaflet world map with country markers, AQI/CO₂ per-capita metrics, country comparison matrix, and automated PDF report generator.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens (Glassmorphism, Dark/Light theme toggle)
- **Animations**: Framer Motion, GSAP + ScrollTrigger, Lenis Smooth Scroll
- **Routing & State**: React Router v7, React Query, Zustand
- **Visualization**: Chart.js, React ChartJS 2, Leaflet.js, React-Leaflet
- **Icons & Toast**: Lucide React Icons, React Hot Toast

### Backend
- **Framework**: Python 3.11+ / FastAPI
- **Data Analytics**: Pandas, NumPy, Scikit-learn
- **Server**: Uvicorn

### Database & Auth
- **Database**: Supabase PostgreSQL (12 tables with Row Level Security & Triggers)
- **Authentication**: Supabase Auth (JWT & RLS policies)

### External APIs
- **OpenWeather API** (Live weather metrics)
- **AQICN / WAQI API** (Real-time Air Quality Index)
- **OpenStreetMap** (Map tiling and geo-visualization)

---

## 📁 Directory Structure

```text
FODS Capstone Project/
├── frontend/                     # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/           # UI components, layout (Sidebar, Navbar), charts
│   │   ├── pages/                # Landing, Login, Register, Dashboard views
│   │   ├── hooks/                # useWeather, useAQI, useGeolocation
│   │   ├── services/             # API services & carbon calculation algorithms
│   │   ├── store/                # Zustand global state store
│   │   └── types/                # TypeScript interfaces
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/                      # FastAPI Python Backend
│   ├── app/
│   │   ├── main.py               # FastAPI entry point & calculation routes
│   └── requirements.txt
│
└── database/
    ├── schema.sql                # Complete 12-table PostgreSQL schema
    ├── rls_policies.sql          # Row Level Security policies
    └── seed.sql                  # IPCC & EPA emission factor seeds
```

---

## 🚀 Quick Start Guide

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 2. Backend Setup (Optional but Recommended)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
pip install -r requirements.txt
python app/main.py
```
Backend API docs available at `http://localhost:8000/docs`.

### 3. Database Setup (Supabase)
1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in Supabase.
3. Run `database/schema.sql`, `database/rls_policies.sql`, and `database/seed.sql` in order.
4. Copy your Supabase URL and Anon Key into `frontend/.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_OPENWEATHER_KEY=your-openweather-key
   VITE_AQICN_TOKEN=your-aqicn-token
   ```

---

## 📜 License
Built for FODS Capstone Project. All rights reserved.
