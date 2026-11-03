# EcoTrack Analytics — Implementation Plan

A complete, production-quality sustainability analytics SaaS platform combining real-time environmental data, personal carbon footprint tracking, interactive analytics dashboards, and global sustainability visualization.

---

## User Review Required

> [!IMPORTANT]
> **API Keys Required**: The following external API keys are needed and must be provided in `.env` files:
> - **OpenWeather API Key** (free at openweathermap.org) — for weather + air pollution
> - **AQICN/WAQI Token** (free at aqicn.org/data-platform/token) — for real-time AQI data
> - **Supabase Project URL + Anon Key + Service Role Key** — for database & auth
>
> The app will still run without keys (with graceful fallbacks/demo data), but real-time data requires them.

> [!IMPORTANT]
> **Supabase Setup Required**: You'll need to create a Supabase project at supabase.com and run the provided `schema.sql` in the SQL editor. I'll include full setup instructions in the README.

> [!WARNING]
> **Google OAuth**: The login page shows a "Sign in with Google" button. Setting it up requires configuring a Google OAuth app in the Supabase Auth providers panel. I'll include instructions, but it's optional — email/password auth works without it.

---

## Open Questions

> [!IMPORTANT]
> 1. Do you have existing Supabase credentials, or should I generate placeholder `.env.example` files with instructions to fill in?
> 2. Do you have OpenWeather and AQICN API keys, or should I use demo/mock data as fallback?
> 3. Should the FastAPI backend be run separately (recommended for full functionality) or should I make the frontend work standalone with Supabase client SDK directly?

*I'll proceed with the recommended architecture: frontend connects to both FastAPI (analytics) and Supabase (auth/data), with graceful fallback to mock data when API keys are absent.*

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│             Browser (React + Vite)           │
│  Landing → Login → Register → Dashboard     │
│  Framer Motion + GSAP + Lenis animations    │
└────────────┬────────────────────┬───────────┘
             │ REST API           │ Supabase SDK
             ▼                    ▼
┌────────────────────┐  ┌────────────────────┐
│   FastAPI Backend   │  │  Supabase Platform  │
│  - Analytics API    │  │  - PostgreSQL DB    │
│  - Carbon Calc      │  │  - Auth (JWT)       │
│  - Recommendations  │  │  - Row Level Sec    │
│  - Pandas/NumPy     │  │  - Storage          │
│  - Plotly charts    │  └────────────────────┘
└────────────────────┘
          │
          ▼
┌────────────────────────────────────────────┐
│              External APIs                  │
│  OpenWeather | AQICN | OpenStreetMap       │
└────────────────────────────────────────────┘
```

---

## Project Structure

```
FODS Capstone Project/
├── frontend/                     # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui base components
│   │   │   ├── animations/       # Reusable animation wrappers
│   │   │   ├── charts/           # Chart.js chart components
│   │   │   ├── maps/             # Leaflet map components
│   │   │   ├── layout/           # Sidebar, Navbar, Footer
│   │   │   └── dashboard/        # Dashboard-specific widgets
│   │   ├── pages/
│   │   │   ├── Landing.tsx       # Premium landing page
│   │   │   ├── Login.tsx         # Split-layout auth page
│   │   │   ├── Register.tsx      # Registration page
│   │   │   └── dashboard/
│   │   │       ├── DashboardHome.tsx
│   │   │       ├── Activities.tsx
│   │   │       ├── CarbonCalculator.tsx
│   │   │       ├── LiveEnvironment.tsx
│   │   │       ├── Analytics.tsx
│   │   │       ├── WorldMap.tsx
│   │   │       ├── Reports.tsx
│   │   │       └── Settings.tsx
│   │   ├── hooks/                # Custom React hooks
│   │   ├── services/             # API service layer
│   │   ├── store/                # Zustand state management
│   │   ├── types/                # TypeScript interfaces
│   │   ├── lib/                  # Utilities, Supabase client
│   │   └── assets/               # Images, SVGs
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                      # FastAPI + Python
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── auth.py
│   │   │   │   ├── activities.py
│   │   │   │   ├── carbon.py
│   │   │   │   ├── analytics.py
│   │   │   │   ├── environment.py
│   │   │   │   └── reports.py
│   │   ├── core/
│   │   │   ├── config.py         # pydantic-settings
│   │   │   ├── database.py       # Supabase client
│   │   │   └── security.py       # JWT validation
│   │   ├── models/               # SQLAlchemy models
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── analytics/
│   │   │   ├── carbon_calculator.py
│   │   │   ├── trend_analysis.py
│   │   │   └── recommendations.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
│
└── database/
    ├── schema.sql                # Full Supabase schema
    ├── seed.sql                  # Sample data
    └── rls_policies.sql          # Row Level Security
```

---

## Phase 1: Project Scaffolding & Setup

### Frontend Initialization
- `npm create vite@latest frontend -- --template react-ts`
- Install all dependencies (Tailwind v4, shadcn/ui, Framer Motion, GSAP, Lenis, React Router, React Query, Chart.js, Leaflet, Lucide)
- Configure `vite.config.ts` with path aliases
- Configure `tailwind.config.ts` with custom design tokens
- Setup `tsconfig.json` strict mode

### Backend Initialization
- Create Python virtual environment
- Install FastAPI, Uvicorn, Pandas, NumPy, Pydantic, supabase-py, etc.
- Configure project structure

---

## Phase 2: Database Schema

### Tables to Create

| Table | Description |
|-------|-------------|
| `profiles` | User profiles linked to auth.users |
| `electricity_usage` | Daily/monthly electricity consumption records |
| `transportation_logs` | Vehicle type, distance, fuel type |
| `waste_records` | Waste categories and quantities |
| `activities` | Unified activity log |
| `carbon_reports` | Calculated carbon footprint reports |
| `sustainability_scores` | Weekly sustainability score history |
| `weather_cache` | Cached weather API responses |
| `aqi_cache` | Cached AQI responses |
| `notifications` | User notifications |
| `reports` | Generated PDF/data reports |
| `emission_factors` | Carbon intensity reference data |

### Row Level Security
- Users can only read/write their own records
- Service role bypasses RLS for analytics aggregation

---

## Phase 3: Backend (FastAPI)

### Endpoints

```
GET  /api/health
POST /api/auth/verify
GET  /api/activities/           — list user activities
POST /api/activities/           — log new activity
GET  /api/carbon/calculate      — calculate carbon footprint
GET  /api/carbon/score          — sustainability score
POST /api/analytics/trends      — generate trend charts data
GET  /api/environment/weather   — proxied weather data
GET  /api/environment/aqi       — proxied AQI data
POST /api/reports/generate      — generate analytics report
GET  /api/recommendations/      — personalized recommendations
```

### Analytics Engine
- Pandas DataFrames for trend analysis
- Numpy for statistical calculations
- Scikit-learn for basic linear regression trend prediction
- Emission factors: electricity (0.82 kgCO2/kWh), car (0.21 kg/km), flight (0.255 kg/km per passenger)

---

## Phase 4: Frontend — Landing Page

### Hero Section
- Full-screen animated Earth (CSS + canvas animation)
- Floating particle system (GSAP)
- Glass cards with environmental metrics
- Gradient aurora background

### Features Section
- 8 animated feature cards with icons
- Staggered entrance animations (Framer Motion)
- Hover effects (scale + glow)

### Dashboard Preview Section
- Animated mockup of the dashboard
- Charts that animate into view with GSAP ScrollTrigger

### SDG Section
- 4 SDG goal cards with icons
- Color-coded per SDG branding

### Workflow Timeline
- Vertical animated timeline with GSAP
- Icons that light up as you scroll

### Statistics Counter
- Count-up animation with Intersection Observer
- Numbers: 12,000+ users, 2.5M kg carbon saved, 45 countries, 85,000 reports

### FAQ Accordion
- Animated accordion using Framer Motion

### Footer
- Liquid SVG wave animation
- Glass effect background
- Floating bubbles
- Social icons + newsletter

---

## Phase 5: Frontend — Auth Pages

### Login Page
- Split layout (50/50)
- Left: animated Earth, live AQI/weather mini-cards
- Right: glassmorphism login card
- Google OAuth button
- Email/password form with validation

### Register Page
- Glassmorphism card
- Multi-step or single-page form
- Country/city dropdowns
- Theme preference toggle
- Newsletter checkbox

---

## Phase 6: Frontend — Dashboard

### Layout
- Collapsible left sidebar with icons + labels
- Top navbar with search, weather widget, AQI badge, notifications, profile
- Main content area with smooth transitions

### Dashboard Home (Module 1)
- Welcome card with user name
- Carbon footprint overview gauge
- Activity summary cards
- Quick stats (electricity, transport, waste this month)
- Recent activities table
- Sustainability score trend line

### Carbon Calculator (Module 2)
- Input forms: electricity kWh, km driven, km flown, waste kg
- Real-time calculation as user types
- Gauge chart showing total CO2e
- Pie chart breakdown by category
- Color-coded sustainability score (A-F)
- Recommendations section with icons

### Live Environment (Module 3)
- Current weather with animated icon
- AQI gauge/meter
- PM2.5, PM10, CO, NO2 readings
- Leaflet map with pollution overlay
- Weather forecast cards
- Location-based (uses browser geolocation)

### Analytics (Module 4)
- Time period selector (week/month/year)
- Carbon trend line chart
- Electricity area chart
- Transportation bar chart
- Waste pie chart
- CO2 heatmap calendar
- Radar chart (multi-category comparison)

### World Map (Module 5)
- Full Leaflet world map
- Country AQI data overlay
- Country comparison table
- Click country for details panel

### Reports
- List of past reports
- Generate new report button
- Report cards with download options

### Settings
- Profile editing
- Theme toggle (dark/light)
- Notification preferences
- Connected accounts

---

## Phase 7: Design System

### Color Palette (Dark Mode Primary)
```css
--background: #0A0F1E        /* Deep navy */
--card: #111827               /* Dark card */
--card-glass: rgba(17,24,39,0.7) /* Glassmorphism */
--primary: #10B981            /* Emerald green */
--primary-glow: #34D399       /* Bright green */
--accent: #3B82F6             /* Blue accent */
--warning: #F59E0B            /* Amber */
--danger: #EF4444             /* Red */
--text-primary: #F9FAFB
--text-muted: #6B7280
--border: rgba(255,255,255,0.08)
```

### Typography
- Display: "Plus Jakarta Sans" (headings)
- Body: "Inter" (text)
- Mono: "JetBrains Mono" (data/code)

### Animation Principles
- Enter: fade + slide up, 0.6s, easeOut
- Hover: scale(1.02), glow shadow
- Count-up: 2s ease
- Page transitions: 0.4s fade

---

## Proposed Changes

### [NEW] frontend/ — Complete Vite React app
#### [NEW] frontend/package.json
#### [NEW] frontend/vite.config.ts
#### [NEW] frontend/tailwind.config.ts
#### [NEW] frontend/tsconfig.json
#### [NEW] frontend/src/main.tsx
#### [NEW] frontend/src/App.tsx
#### [NEW] frontend/src/index.css
#### [NEW] frontend/src/lib/supabase.ts
#### [NEW] frontend/src/lib/utils.ts
#### [NEW] frontend/src/types/index.ts
#### [NEW] frontend/src/pages/Landing.tsx
#### [NEW] frontend/src/pages/Login.tsx
#### [NEW] frontend/src/pages/Register.tsx
#### [NEW] frontend/src/pages/dashboard/DashboardHome.tsx
#### [NEW] frontend/src/pages/dashboard/CarbonCalculator.tsx
#### [NEW] frontend/src/pages/dashboard/LiveEnvironment.tsx
#### [NEW] frontend/src/pages/dashboard/Analytics.tsx
#### [NEW] frontend/src/pages/dashboard/WorldMap.tsx
#### [NEW] frontend/src/pages/dashboard/Activities.tsx
#### [NEW] frontend/src/pages/dashboard/Reports.tsx
#### [NEW] frontend/src/pages/dashboard/Settings.tsx
#### [NEW] frontend/src/components/layout/Sidebar.tsx
#### [NEW] frontend/src/components/layout/Navbar.tsx
#### [NEW] frontend/src/components/layout/DashboardLayout.tsx
#### [NEW] frontend/src/components/charts/ (7 chart components)
#### [NEW] frontend/src/components/animations/ (animation wrappers)
#### [NEW] frontend/src/services/api.ts
#### [NEW] frontend/src/hooks/ (6 custom hooks)

### [NEW] backend/ — FastAPI Python backend
#### [NEW] backend/requirements.txt
#### [NEW] backend/app/main.py
#### [NEW] backend/app/core/config.py
#### [NEW] backend/app/core/database.py
#### [NEW] backend/app/api/routes/ (6 route files)
#### [NEW] backend/app/analytics/carbon_calculator.py
#### [NEW] backend/app/analytics/recommendations.py

### [NEW] database/ — SQL files
#### [NEW] database/schema.sql
#### [NEW] database/seed.sql
#### [NEW] database/rls_policies.sql

### [NEW] Root files
#### [NEW] README.md
#### [NEW] .env.example files for both frontend and backend

---

## Verification Plan

### Automated Tests
- `cd frontend && npm run build` — verify TypeScript compiles with no errors
- `cd backend && python -m pytest` — verify backend health routes
- `npm run dev` — verify dev server starts

### Manual Verification
- Open browser at `http://localhost:5173` — landing page renders with animations
- Navigate to `/login` — split layout renders correctly
- Navigate to `/register` — form validates correctly
- Navigate to `/dashboard` — all sidebar links work
- Carbon Calculator — inputs trigger real-time calculation
- Live Environment — weather/AQI loads (or shows graceful fallback)
- Analytics — all 6 chart types render
- World Map — Leaflet map loads with markers
- Dark/Light mode toggle — theme switches correctly
- Responsive — mobile layout collapses sidebar correctly

---

## Execution Order

1. ✅ Scaffold frontend project (Vite + React + TypeScript)
2. ✅ Install all dependencies
3. ✅ Configure Tailwind + shadcn/ui
4. ✅ Create design system tokens
5. ✅ Database schema (SQL files)
6. ✅ Backend (FastAPI)
7. ✅ Landing page (all 8 sections)
8. ✅ Auth pages (Login + Register)
9. ✅ Dashboard layout (Sidebar + Navbar)
10. ✅ All dashboard modules
11. ✅ Charts and visualizations
12. ✅ Map integrations
13. ✅ API service layer
14. ✅ README with setup instructions
15. ✅ Build verification
