# 🌱 EcoTrack Analytics — Real-Time Carbon Footprint & Environmental Intelligence SaaS Platform

[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/3D%20Graphics-Three.js%20%7C%20R3F-black?logo=three.js&logoColor=white)](https://threejs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL%20%7C%20RLS-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Pandas](https://img.shields.io/badge/Data%20Science-Pandas%20%7C%20NumPy-150458?logo=pandas&logoColor=white)](https://pandas.pydata.org/)
[![License](https://img.shields.io/badge/License-MIT%20%2F%20Academic-blue.svg)](#license)
[![Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](#)

> **EcoTrack Analytics** (FODS Capstone Project) is a commercial-grade, full-stack climate-tech SaaS application that empowers individuals, organizations, and researchers to measure, analyze, and mitigate their environmental footprint. Combining high-frequency real-time atmospheric telemetry, GHG Protocol-compliant carbon accounting, geospatial analytics, and predictive data science modeling, EcoTrack delivers actionable climate intelligence through an ultra-responsive, modern user interface.

---

## 📑 Table of Contents

- [Executive Summary](#-executive-summary)
- [System Architecture](#-system-architecture)
- [Key Features & Modules](#-key-features--modules)
  - [1. 3D Hero Landing & Sustainable Narrative](#1-3d-hero-landing--sustainable-narrative)
  - [2. Split-Layout Auth & Security](#2-split-layout-auth--security)
  - [3. Interactive Analytics & Executive KPIs](#3-interactive-analytics--executive-kpis)
  - [4. Multi-Vector Carbon Footprint Calculator](#4-multi-vector-carbon-footprint-calculator)
  - [5. Unified Activity Tracking & Management](#5-unified-activity-tracking--management)
  - [6. Real-Time Atmospheric & Weather Telemetry](#6-real-time-atmospheric--weather-telemetry)
  - [7. Macro Data Science & Energy Analytics](#7-macro-data-science--energy-analytics)
  - [8. Geospatial World Map & Global Intelligence](#8-geospatial-world-map--global-intelligence)
  - [9. Automated Audit Reporting & PDF Generation](#9-automated-audit-reporting--pdf-generation)
- [Scientific Methodology & Calculation Engine](#-scientific-methodology--calculation-engine)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Database Schema & Data Governance](#-database-schema--data-governance)
- [REST API Reference (FastAPI)](#-rest-api-reference-fastapi)
- [Quick Start & Installation Guide](#-quick-start--installation-guide)
  - [Prerequisites](#prerequisites)
  - [Step 1: Database Setup (Supabase)](#step-1-database-setup-supabase)
  - [Step 2: Backend Setup (Python / FastAPI)](#step-2-backend-setup-python--fastapi)
  - [Step 3: Frontend Setup (React / Vite)](#step-3-frontend-setup-react--vite)
- [Environment Variables Configuration](#-environment-variables-configuration)
- [Offline & Graceful Fallback Architecture](#-offline--graceful-fallback-architecture)
- [Roadmap & Contributing](#-roadmap--contributing)
- [License & Acknowledgments](#-license--acknowledgments)

---

## 🌍 Executive Summary

Climate change mitigation demands rigorous data accounting at both the micro (individual and enterprise activity) and macro (national energy mixes and atmospheric pollutant concentrations) scales. **EcoTrack Analytics** bridges this gap:

1. **Micro-Level Tracking**: Users track electricity consumption, multimodal transit (fuel-differentiated vehicles, flights, public transit), and municipal solid waste. Activity is calculated against international emission benchmarks (**IPCC**, **EPA**, **DEFRA**, **CEA**), producing instant sustainability scores (0–100) and letter grades (A–F).
2. **Macro-Level Intelligence**: Integrates **Our World in Data (OWID)** energy systems and historical datasets alongside live atmospheric APIs (**OpenWeather** and **AQICN/WAQI**), enabling users to benchmark localized performance against global emission trends and renewable transitions.
3. **Engineering Rigor**: Production-ready monorepo combining React 19, Three.js shaders, Tailwind CSS v4, Zustand state management, Python FastAPI vector services, and a 12-table Supabase PostgreSQL database governed by Row-Level Security (RLS).

---

## 🏛 System Architecture

The EcoTrack architecture separates concerns cleanly across presentation, client-side caching, vector calculation microservices, relational persistence, and third-party sensory ingestion.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CLIENT TIER: REACT 19 + VITE                          │
│                                                                             │
│   Landing Page (3D Earth / Lenis / GSAP)  ◄──►  Split-Layout Supabase Auth  │
│                                    │                                        │
│   ┌────────────────────────────────┴──────────────────────────────────┐     │
│   │               PROTECTED DASHBOARD SHELL (React Router v7)         │     │
│   │  • Command Palette (Ctrl+K)       • Dark / Light Theme Tokens     │     │
│   │  • Global City / Geo Selector     • Zustand Global State Store    │     │
│   ├───────────────────────────────────────────────────────────────────┤     │
│   │  [DashboardHome]  [Activities]  [Calculator]  [LiveEnvironment]   │     │
│   │  [Analytics]      [WorldMap]    [Reports]     [Profile/Settings]  │     │
│   └────────────────────────┬─────────────────────────┬────────────────┘     │
└────────────────────────────┼─────────────────────────┼──────────────────────┘
                             │ REST API                │ Supabase JS SDK
                             ▼                         ▼
┌──────────────────────────────────────────────┐  ┌───────────────────────────┐
│          APPLICATION TIER: FASTAPI           │  │   DATABASE & AUTH TIER    │
│                                              │  │    (Supabase Postgres)    │
│  • Pydantic v2 Schemas & Request Validation  │  │                           │
│  • High-Performance Pandas / NumPy Engine    │  │  • 12 Relational Tables   │
│  • In-Memory Dataset Services (AQI + Energy) │  │  • Row Level Security     │
│  • GHG Protocol Carbon Factor Resolver       │  │  • User Profiles & Auth   │
│  • Statistical Modeling (Mean, Std, Trends)  │  │  • Activity Logs & Audits │
└──────────────────────┬───────────────────────┘  │  • Weather & AQI Cache    │
                       │                          └───────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   DATA INGESTION & EXTERNAL API INTEGRATIONS                │
│                                                                             │
│  • OpenWeatherMap API (Real-Time Weather, Pressure, Wind, Humidity)         │
│  • AQICN / WAQI API (Live AQI, PM2.5, PM10, CO, NO₂, O₃, SO₂)              │
│  • OpenStreetMap & Leaflet (Geospatial Tiles & Layer Visualizations)        │
│  • OWID Energy Dataset (8,000+ records: Renewables, Carbon Intensity, Mix) │
│  • Global Air Pollution Dataset (23,000+ cities global historical metrics)  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features & Modules

### 1. 3D Hero Landing & Sustainable Narrative
- **Interactive 3D Earth Canvas**: Powered by Three.js and `@react-three/fiber` with custom shaders, atmospheric glow, particle field, and smooth orbital rotation.
- **Scroll-Driven Storytelling**: Lenis smooth scrolling synchronized with GSAP ScrollTrigger and Framer Motion stagger animations.
- **UN SDG Alignment**: Dedicated highlights demonstrating platform contributions toward **UN SDG 7** (Affordable & Clean Energy), **SDG 11** (Sustainable Cities), **SDG 12** (Responsible Consumption), and **SDG 13** (Climate Action).
- **Interactive Impact Simulator & FAQ**: Real-time counter widgets and dynamic accordions explaining calculation transparency.

### 2. Split-Layout Auth & Security
- **Dual-Pane Experience**: Responsive authentication interface pairing form handling with live regional weather and AQI telemetry widgets.
- **Multi-Method Auth**: Supports Supabase Email/Password authentication as well as one-click Google OAuth with automatic user profile creation via PostgreSQL triggers.
- **Session Protection**: Client-side Zustand authentication state synchronized with Supabase JWT tokens and route guards.

### 3. Interactive Analytics & Executive KPIs
- **Core KPI Bar**: Instant readouts of Total CO₂e Footprint (kg), Daily Average Emissions, Sustainability Score (0–100), Efficiency Grade (A–F), and Active Reduction Targets.
- **28-Day Heatmap Calendar**: Interactive calendar visualizing daily emission variations and tracking sustainable habit formation.
- **Multi-Format Visualizations**: High-resolution Chart.js integrations spanning Doughnut breakdowns, Area trend charts, Multi-metric Radar graphs, and comparative Bar distributions.

### 4. Multi-Vector Carbon Footprint Calculator
- **GHG Protocol Compliance**: Granular inputs across electricity (kWh), passenger transport (kilometers, vehicle type, fuel mode), aviation (domestic vs. international flight legs), and municipal solid waste (by material: plastic, organic, paper, metal, glass, e-waste).
- **Grid-Specific Emission Factors**: Automatically adapts electricity factors based on selected countries (e.g., India CEA: `0.82 kg CO₂/kWh`, US EPA: `0.42 kg CO₂/kWh`, EU EEA: `0.27 kg CO₂/kWh`).
- **Dynamic Scoring Engine**: Normalizes user impact against international per-capita sustainability targets (13.7 kg CO₂e/day benchmark) to calculate scores and letter grades.

### 5. Unified Activity Tracking & Management
- **Full CRUD Lifecycle**: Add, update, view, and delete activities directly persisted to Supabase with real-time recalculation of aggregate metrics.
- **Category Filtering & Search**: Instant client-side filtering across categories (Electricity, Transport, Waste, Food, Lifestyle) with search and pagination.
- **Pre-Submission Impact Preview**: Live calculation preview informs users of exact kilogram emissions before an activity is recorded.

### 6. Real-Time Atmospheric & Weather Telemetry
- **OpenWeatherMap Integration**: Live temperature, "feels like" metrics, relative humidity, barometric pressure, wind velocity, and visibility parameters.
- **WAQI / AQICN Integration**: Real-time Air Quality Index with deep pollutant spectrum inspection: PM2.5, PM10, Carbon Monoxide (CO), Nitrogen Dioxide (NO₂), Ozone (O₃), and Sulfur Dioxide (SO₂).
- **Interactive OpenStreetMap (Leaflet)**: Pan-and-zoom global GIS interface displaying station markers, localized air quality badges, and pollutant dispersion.

### 7. Macro Data Science & Energy Analytics
- **FastAPI + Pandas Pipeline**: Fast dataset service parsing over 23,000 cities and 12-year national energy trajectories without disk-read lag.
- **Energy Mix Evaluation**: Historical trajectories of renewable electricity shares, low-carbon shares, fossil reliance, and overall electricity demand.
- **Country Comparison Matrix**: Side-by-side benchmarking of national sustainability metrics (e.g., India vs. Germany vs. United States).

### 8. Geospatial World Map & Global Intelligence
- **Geographic Hotspots**: Custom interactive map pins highlighting global metropolitan air pollution indices and carbon intensity metrics.
- **Dynamic City Search**: Instant lookup across 23,000+ cities with detailed historical pollutant categories and AQI status.

### 9. Automated Audit Reporting & PDF Generation
- **Executive Summaries**: Period-based aggregation (Daily, Weekly, Monthly, Annual) distilling total emissions, category breakdowns, and trajectory shifts.
- **Client-Side PDF Generator**: One-click download of audit-ready sustainability reports with formatted statistical tables and AI-driven reduction recommendations.

---

## 🔬 Scientific Methodology & Calculation Engine

EcoTrack calculates Greenhouse Gas (GHG) emissions using internationally recognized emission factors derived from the **IPCC 6th Assessment Report**, **US EPA GHG Emission Factors Hub**, **UK DEFRA/DESNZ 2023**, and the **Central Electricity Authority (CEA) of India**:

$$\text{Total Carbon Footprint (kg CO}_2\text{e)} = E_{\text{electricity}} + E_{\text{transport}} + E_{\text{waste}}$$

### 1. Electricity Emissions ($E_{\text{electricity}}$)
$$E_{\text{electricity}} = \text{Consumption (kWh)} \times \text{Grid Emission Factor } (\text{kg CO}_2/\text{kWh})$$
- **India (CEA)**: $0.82 \text{ kg CO}_2/\text{kWh}$
- **United States (EPA)**: $0.42 \text{ kg CO}_2/\text{kWh}$
- **European Union (EEA)**: $0.27 \text{ kg CO}_2/\text{kWh}$
- **Global Weighted Average (IEA)**: $0.50 \text{ kg CO}_2/\text{kWh}$
- **Solar / Renewable Microgrid**: $0.04 \text{ kg CO}_2/\text{kWh}$

### 2. Transportation Emissions ($E_{\text{transport}}$)
$$E_{\text{transport}} = \sum (\text{Distance}_{i} \times \text{Emission Factor}_{i})$$
- **Petrol Passenger Car**: $0.21 \text{ kg CO}_2/\text{km}$
- **Diesel Passenger Car**: $0.17 \text{ kg CO}_2/\text{km}$
- **Hybrid Vehicle**: $0.12 \text{ kg CO}_2/\text{km}$
- **CNG Vehicle**: $0.16 \text{ kg CO}_2/\text{km}$
- **Electric Vehicle (Grid Average)**: $0.05 \text{ kg CO}_2/\text{km}$
- **Municipal Bus Transit**: $0.089 \text{ kg CO}_2/\text{passenger-km}$
- **Passenger Rail / Train**: $0.041 \text{ kg CO}_2/\text{passenger-km}$
- **Domestic Aviation**: $0.255 \text{ kg CO}_2/\text{passenger-km}$
- **Bicycle / Walking**: $0.00 \text{ kg CO}_2/\text{km}$

### 3. Waste Disposal Emissions ($E_{\text{waste}}$)
$$E_{\text{waste}} = \sum (\text{Weight}_{j} \times \text{Material Factor}_{j} \times \text{Disposal Modifier})$$
- **Municipal Solid Waste (Landfill)**: $0.58 \text{ kg CO}_2/\text{kg}$
- **Recycled Waste**: $0.02 \text{ kg CO}_2/\text{kg}$
- **Composted Organics**: $0.01 \text{ kg CO}_2/\text{kg}$
- **Incinerated Waste**: $0.49 \text{ kg CO}_2/\text{kg}$
- **Plastic Waste**: $2.40 \text{ kg CO}_2/\text{kg}$
- **Electronic Waste (E-waste)**: $20.0 \text{ kg CO}_2/\text{kg}$

### 4. Sustainability Score & Efficiency Grading
The platform benchmarks a user's daily emission average against the global sustainable threshold ($13.70 \text{ kg CO}_2\text{e/day}$):

$$\text{Daily Average} = \frac{\text{Total Month Footprint}}{30}$$

$$\text{Sustainability Score} = \max\left(0, \min\left(100, 100 - \left(\frac{\text{Daily Average}}{13.70}\right) \times 50\right)\right)$$

| Score Range | Grade | Classification | Action Strategy |
| :---: | :---: | :---: | :--- |
| **80 – 100** | **A** | **Eco Champion** | Maintain exemplary low-impact lifestyle; mentor peers. |
| **65 – 79** | **B** | **Sustainable** | High efficiency; target transport optimization. |
| **50 – 64** | **C** | **Moderate** | Typical footprint; shift to renewable energy and public transit. |
| **35 – 49** | **D** | **High Impact** | Elevated footprint; comprehensive reduction audit needed. |
| **0 – 34** | **F** | **Critical Action Needed** | Severe emissions intensity; immediate lifestyle interventions required. |

---

## 💻 Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React.js** | `^19.2.7` | High-performance reactive UI rendering |
| **Language** | **TypeScript** | `~6.0.2` | Strict type safety across client interfaces |
| **Build Tool** | **Vite** | `^8.1.1` | Ultra-fast HMR and optimized production bundling |
| **Styling & Design** | **Tailwind CSS** | `^4.3.3` | Modern utility-first styling with custom tokens |
| **3D Graphics** | **Three.js & @react-three/fiber** | `^0.185.1` / `^9.6.1` | WebGL 3D Earth canvas & atmospheric effects |
| **Animation Systems** | **GSAP & Framer Motion** | `^3.15.0` / `^12.43.0` | Scroll-driven timeline triggers & component transitions |
| **Smooth Scroll** | **Lenis** | `^1.3.25` | Fluid momentum scrolling |
| **State Management** | **Zustand** | `^5.0.14` | Lightweight, scalable global application store |
| **Data Visualization** | **Chart.js & React-Chartjs-2** | `^4.5.1` / `^5.3.1` | Doughnut, line, bar, radar, and area charts |
| **Geospatial Maps** | **Leaflet & React-Leaflet** | `^1.9.4` / `^5.0.0` | Interactive map tiles and custom geographic overlays |
| **UI Primitives** | **Radix UI** | Latest | Accessible dialogs, sliders, tabs, and dropdowns |
| **Icons** | **Lucide React** | `^1.27.0` | Crisp modern vector iconography |
| **Backend Framework** | **FastAPI** | `0.115.0` | Async Python web framework for data computation |
| **Web Server** | **Uvicorn (Standard)** | `0.30.6` | Lightning-fast ASGI web server |
| **Data Analytics** | **Pandas & NumPy** | `2.2.3` / `2.1.1` | High-performance CSV parsing and matrix computation |
| **Machine Learning** | **Scikit-Learn** | `1.5.2` | Statistical distributions and future predictive models |
| **Document Export** | **ReportLab & Pillow** | `4.2.2` / `10.4.0` | Server-side PDF generation and image manipulation |
| **Database & Auth** | **Supabase PostgreSQL** | `2.9.0` (Client) | Hosted relational PostgreSQL, JWT Auth, and RLS |

---

## 📁 Project Directory Structure

```text
Carbon Emission project/
│
├── README.md                             # Root Project Documentation (This File)
│
└── Carbon-Emission-Dashboard/            # Main Application Workspace
    │
    ├── frontend/                         # React 19 + TypeScript + Vite Frontend
    │   ├── public/                       # Static public assets (SVGs, icons)
    │   ├── src/
    │   │   ├── assets/                   # Vector assets and images
    │   │   ├── components/               # Reusable UI component library
    │   │   │   ├── earth/                # Three.js 3D Earth Canvas & Shaders
    │   │   │   │   └── GlobalEarthBackground.tsx
    │   │   │   ├── layout/               # Shell layout, Navbar, Sidebar
    │   │   │   │   ├── CommandPalette.tsx
    │   │   │   │   ├── DashboardLayout.tsx
    │   │   │   │   ├── Navbar.tsx
    │   │   │   │   └── Sidebar.tsx
    │   │   │   └── ui/                   # Glassmorphism cards & Location Selectors
    │   │   │       ├── glass.tsx
    │   │   │       └── GlobalLocationSelector.tsx
    │   │   ├── hooks/                    # Custom React hooks
    │   │   │   ├── useAQI.ts             # WAQI/AQICN atmospheric data hook
    │   │   │   ├── useGeolocation.ts     # Browser navigator geolocation hook
    │   │   │   └── useWeather.ts         # OpenWeatherMap live weather hook
    │   │   ├── lib/                      # Core utility libraries
    │   │   │   ├── locations.ts          # 30+ Global city coordinates & metadata
    │   │   │   ├── reportDownload.ts     # Client-side PDF report generator
    │   │   │   ├── supabase.ts           # Supabase client instantiation
    │   │   │   └── utils.ts              # Class merging & formatters
    │   │   ├── pages/                    # Route pages
    │   │   │   ├── Landing.tsx           # 3D Hero landing page
    │   │   │   ├── Login.tsx             # Split-screen auth login page
    │   │   │   ├── Register.tsx          # Account registration page
    │   │   │   └── dashboard/            # Protected dashboard sub-views
    │   │   │       ├── Activities.tsx    # Activity logger & CRUD table
    │   │   │       ├── Analytics.tsx     # Macro charts & trends
    │   │   │       ├── CarbonCalculator.tsx # Multi-vector GHG calculator
    │   │   │       ├── DashboardHome.tsx # Core KPIs & 28-day heatmap
    │   │   │       ├── LiveEnvironment.tsx# Real-time weather, AQI & Leaflet
    │   │   │       ├── Profile.tsx       # User profile & credentials
    │   │   │       ├── Reports.tsx       # Report generator & audits
    │   │   │       ├── Settings.tsx      # System preferences & themes
    │   │   │       └── WorldMap.tsx      # Global sustainability map
    │   │   ├── services/                 # External API client & fallback services
    │   │   │   └── api.ts
    │   │   ├── store/                    # Zustand state management
    │   │   │   └── useAppStore.ts
    │   │   ├── types/                    # TypeScript interfaces & domain models
    │   │   │   └── index.ts
    │   │   ├── App.tsx                   # Master routing & theme provider
    │   │   ├── main.tsx                  # React DOM root entry point
    │   │   └── index.css                 # Global CSS tokens & Tailwind v4 imports
    │   ├── .env.example                  # Frontend environment variables template
    │   ├── package.json                  # NPM dependencies and scripts
    │   ├── tsconfig.json                 # TypeScript compiler configuration
    │   └── vite.config.ts                # Vite build and plugin configurations
    │
    ├── backend/                          # FastAPI Python 3.11+ Backend
    │   ├── app/
    │   │   ├── main.py                   # FastAPI routing, middleware & endpoints
    │   │   └── dataset_services.py       # In-memory Pandas loaders & services
    │   ├── Dataset/                      # Curated Global Environmental Datasets
    │   │   ├── global air pollution dataset.csv  # 23,000+ cities AQI metrics (1.6 MB)
    │   │   ├── owid-energy-data.csv      # OWID world energy transition mix (9.2 MB)
    │   │   └── owid-co2-data.csv         # OWID historical greenhouse data (14.4 MB)
    │   └── requirements.txt              # Python package dependencies
    │
    └── database/                         # Relational Database Scripts
        ├── schema.sql                    # 12 PostgreSQL tables, triggers & constraints
        ├── rls_policies.sql              # Supabase Row Level Security definitions
        └── seed.sql                      # IPCC & EPA baseline emission factors
```

---

## 🗄 Database Schema & Data Governance

The database is built on **Supabase PostgreSQL** and contains 12 production-ready tables enforcing relational constraints, automatic timestamps, and strict Row-Level Security:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE POSTGRESQL SCHEMA                      │
├────────────────────────────┬───────────────────────────────────────────┤
│ TABLE                      │ DESCRIPTION                               │
├────────────────────────────┼───────────────────────────────────────────┤
│ profiles                   │ Extends auth.users: name, city, country,  │
│                            │ avatar, theme preferences, and goals      │
│ emission_factors           │ Reference factors: electricity, transport,│
│                            │ waste, fuel types (IPCC/EPA/DEFRA/CEA)    │
│ electricity_usage          │ Consumption logs (kWh), bill amount, grid │
│                            │ source, and auto-generated carbon kg      │
│ transportation_logs        │ Trips by vehicle type, distance (km), fuel│
│                            │ type, passenger count, and calculated kg  │
│ waste_records              │ Waste weights (kg) by material, disposal  │
│                            │ method (landfill, recycled, composted)    │
│ activities                 │ Unified activity log tracking every event │
│                            │ for aggregate dashboard queries           │
│ carbon_reports             │ Periodic generated reports with score,    │
│                            │ letter grade, and recommendation JSONB    │
│ sustainability_scores      │ Weekly & monthly longitudinal score logs  │
│ reports                    │ Generated user report metadata & files    │
│ notifications              │ In-app alerts, milestones & tips          │
│ weather_cache              │ Spatial weather cache with 10-min TTL     │
│ aqi_cache                  │ Atmospheric AQI cache with 15-min TTL     │
└────────────────────────────┴───────────────────────────────────────────┘
```

### Row Level Security (RLS) Guarantee
- Every user table (`profiles`, `electricity_usage`, `transportation_logs`, `waste_records`, `activities`, `carbon_reports`, `sustainability_scores`, `notifications`, `reports`) strictly enforces `auth.uid() = user_id`.
- Users cannot access, modify, or delete records belonging to any other user.
- The `emission_factors` table is configured for public read access (`USING (true)`).

---

## 🔌 REST API Reference (FastAPI)

When running the backend server (`uvicorn app.main:app`), interactive OpenAPI documentation is automatically served at `http://localhost:8000/docs`.

| Method | Endpoint | Query / Body Parameters | Response Summary |
| :---: | :--- | :--- | :--- |
| `GET` | `/` | None | API identity, operational status, version |
| `GET` | `/api/health` | None | Health check of database and dataset loaders |
| `GET` | `/api/datasets/status` | None | Row counts and memory status of loaded CSVs |
| `GET` | `/api/datasets/aqi/summary` | None | Global AQI aggregate (cities, average AQI, clean/polluted) |
| `GET` | `/api/datasets/aqi/city` | `?city=Mumbai&country=India` | Detailed AQI, PM2.5, PM10, CO, NO₂, O₃ for specific city |
| `GET` | `/api/datasets/aqi/country/{country}`| `limit: int = 50` | Average AQI and city listings for a given country |
| `GET` | `/api/datasets/aqi/rankings` | `limit: int = 10` | Top cleanest and highest AQI cities worldwide |
| `GET` | `/api/datasets/energy/summary` | None | OWID summary (renewable share, carbon intensity, demand) |
| `GET` | `/api/datasets/energy/country/{country}` | Path parameter | Latest energy mix and 12-year longitudinal trend |
| `GET` | `/api/datasets/energy/rankings` | `limit: int = 10` | Top countries by renewable adoption and clean intensity |
| `GET` | `/api/datasets/energy/comparison` | `?countries=India,Germany,US` | Matrix comparison across multiple countries |
| `GET` | `/api/datasets/carbon/factors` | `?country=India` | Dynamic electricity and transport emission factors |
| `POST` | `/api/carbon/calculate` | JSON payload (kWh, km, waste) | Total kg CO₂e, category splits, daily average, score, grade |
| `GET` | `/api/analytics/summary` | `?country=India` | Statistical distribution (mean, std dev, trend) |

---

## 🚀 Quick Start & Installation Guide

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm** or **pnpm**
- **Python**: v3.11 or later
- **Git**
- A free **Supabase** account ([supabase.com](https://supabase.com))

---

### Step 1: Database Setup (Supabase)

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Navigate to the **SQL Editor** tab from the left sidebar.
3. Open and execute the three SQL files located in `Carbon-Emission-Dashboard/database/` in this exact order:
   1. `schema.sql` — Initializes extensions, 12 tables, indexes, and user triggers.
   2. `rls_policies.sql` — Configures Row Level Security policies.
   3. `seed.sql` — Seeds default IPCC/EPA emission factor reference records.
4. Go to **Project Settings** -> **API** and copy your **Project URL** and **anon public key**.

---

### Step 2: Backend Setup (Python / FastAPI)

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd "Carbon-Emission-Dashboard/backend"
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *The backend will load and index the datasets into memory. Verify at `http://127.0.0.1:8000/docs`.*

---

### Step 3: Frontend Setup (React / Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd "Carbon-Emission-Dashboard/frontend"
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Create your local environment configuration file by copying `.env.example`:
   ```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env

   # Linux / macOS
   cp .env.example .env
   ```

4. Populate `.env` with your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_OPENWEATHER_KEY=your-openweather-api-key
   VITE_AQICN_TOKEN=your-aqicn-token
   VITE_API_URL=http://localhost:8000
   ```

5. Launch the Vite development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🔐 Environment Variables Configuration

| Variable | Location | Required? | Description |
| :--- | :--- | :---: | :--- |
| `VITE_SUPABASE_URL` | `frontend/.env` | **Yes** | Your Supabase project URL (`https://xyz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | `frontend/.env` | **Yes** | Supabase anonymous public API key |
| `VITE_OPENWEATHER_KEY` | `frontend/.env` | *Optional* | OpenWeatherMap API key (enables real-time weather) |
| `VITE_AQICN_TOKEN` | `frontend/.env` | *Optional* | WAQI/AQICN token (enables real-time AQI) |
| `VITE_API_URL` | `frontend/.env` | **Yes** | URL pointing to the FastAPI backend (`http://localhost:8000`) |

> **Note**: Free API keys can be obtained instantly:
> - **OpenWeatherMap**: [openweathermap.org/api](https://openweathermap.org/api)
> - **AQICN / WAQI**: [aqicn.org/data-platform/token](https://aqicn.org/data-platform/token/)

---

## 🛡 Offline & Graceful Fallback Architecture

EcoTrack is engineered to be **resilient to network faults and absent API keys**:

1. **Weather Fallback**: If `VITE_OPENWEATHER_KEY` is not provided or the third-party endpoint encounters rate limits, the frontend automatically switches to localized climate heuristics without breaking the UI.
2. **AQI Fallback**: If `VITE_AQICN_TOKEN` is unavailable, the application queries the local FastAPI backend, which instantly returns verified historical AQI metrics for the city from `global air pollution dataset.csv`.
3. **Demo Mode for Authentication**: If database connectivity is momentarily offline during preview, the Zustand store provides a mock session workflow so the entire dashboard can be explored and tested.

---

## 🗺 Roadmap & Contributing

- [x] 3D Earth WebGL Canvas & Landing experience
- [x] Multi-vector GHG Protocol footprint calculator
- [x] Real-time OpenWeather and AQICN telemetry
- [x] Supabase PostgreSQL 12-table relational schema with RLS
- [x] FastAPI data science microservice with OWID energy integration
- [x] Leaflet GIS maps and country comparison matrices
- [x] Client-side audit report PDF generation
- [ ] Automated OCR receipt & utility bill scanner (Electricity & Gas)
- [ ] Corporate Multi-Tenant ESG Reporting module (Scope 1, Scope 2, Scope 3)
- [ ] Machine Learning predictive emission forecasting using Scikit-Learn

Contributions, bug reports, and feature proposals are welcome! Please open an issue or submit a structured pull request.

---

## 📜 License & Acknowledgments

- **License**: Released under the [MIT License](https://opensource.org/licenses/MIT).
- **Academic Context**: Developed for the **FODS Capstone Project (Foundations of Data Science)**.
- **Data Providers**: Atmospheric datasets courtesy of **Our World in Data (OWID)**, **OpenWeatherMap**, **AQICN / WAQI**, and the **World Air Quality Index Project**.
