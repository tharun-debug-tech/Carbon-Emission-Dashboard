-- ============================================================
-- EcoTrack Analytics - Supabase PostgreSQL Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  country TEXT DEFAULT 'India',
  city TEXT,
  bio TEXT,
  theme_preference TEXT DEFAULT 'dark' CHECK (theme_preference IN ('dark', 'light', 'system')),
  receive_reports BOOLEAN DEFAULT TRUE,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: emission_factors (reference data)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.emission_factors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('electricity', 'transport', 'waste', 'food', 'other')),
  sub_category TEXT,
  factor NUMERIC NOT NULL,        -- kg CO2e per unit
  unit TEXT NOT NULL,             -- e.g., 'kWh', 'km', 'kg'
  region TEXT DEFAULT 'global',
  source TEXT DEFAULT 'IPCC',
  year INTEGER DEFAULT 2024,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: electricity_usage
-- ============================================================
CREATE TABLE IF NOT EXISTS public.electricity_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  units_kwh NUMERIC NOT NULL CHECK (units_kwh >= 0),
  bill_amount NUMERIC,            -- in local currency
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  source TEXT DEFAULT 'grid',     -- grid, solar, wind, mixed
  notes TEXT,
  carbon_kg NUMERIC GENERATED ALWAYS AS (units_kwh * 0.82) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: transportation_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transportation_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  transport_type TEXT NOT NULL CHECK (transport_type IN ('car', 'bus', 'train', 'flight', 'bike', 'walk', 'motorcycle', 'electric_vehicle')),
  distance_km NUMERIC NOT NULL CHECK (distance_km >= 0),
  fuel_type TEXT DEFAULT 'petrol' CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid', 'cng', 'none')),
  passengers INTEGER DEFAULT 1 CHECK (passengers >= 1),
  trip_date DATE NOT NULL,
  purpose TEXT,                   -- commute, leisure, work
  carbon_kg NUMERIC,              -- calculated by backend
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: waste_records
-- ============================================================
CREATE TABLE IF NOT EXISTS public.waste_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  waste_type TEXT NOT NULL CHECK (waste_type IN ('plastic', 'paper', 'glass', 'metal', 'organic', 'electronic', 'hazardous', 'mixed')),
  weight_kg NUMERIC NOT NULL CHECK (weight_kg >= 0),
  disposal_method TEXT DEFAULT 'landfill' CHECK (disposal_method IN ('landfill', 'recycled', 'composted', 'incinerated', 'donated')),
  record_date DATE NOT NULL,
  carbon_kg NUMERIC,              -- calculated
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: activities (unified activity log)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('electricity', 'transport', 'waste', 'food', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  carbon_kg NUMERIC DEFAULT 0,
  source_id UUID,                 -- reference to specific table record
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: carbon_reports
-- ============================================================
CREATE TABLE IF NOT EXISTS public.carbon_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_type TEXT DEFAULT 'monthly' CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  electricity_kg NUMERIC DEFAULT 0,
  transport_kg NUMERIC DEFAULT 0,
  waste_kg NUMERIC DEFAULT 0,
  total_kg NUMERIC DEFAULT 0,
  sustainability_score NUMERIC DEFAULT 0 CHECK (sustainability_score BETWEEN 0 AND 100),
  grade TEXT,                     -- A, B, C, D, F
  recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: sustainability_scores
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sustainability_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score NUMERIC NOT NULL CHECK (score BETWEEN 0 AND 100),
  grade TEXT NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  electricity_kg NUMERIC DEFAULT 0,
  transport_kg NUMERIC DEFAULT 0,
  waste_kg NUMERIC DEFAULT 0,
  total_kg NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: weather_cache
-- ============================================================
CREATE TABLE IF NOT EXISTS public.weather_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  city TEXT NOT NULL,
  country TEXT,
  lat NUMERIC,
  lon NUMERIC,
  data JSONB NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 minutes')
);

-- ============================================================
-- TABLE: aqi_cache
-- ============================================================
CREATE TABLE IF NOT EXISTS public.aqi_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  city TEXT NOT NULL,
  lat NUMERIC,
  lon NUMERIC,
  aqi INTEGER,
  pm25 NUMERIC,
  pm10 NUMERIC,
  co NUMERIC,
  no2 NUMERIC,
  o3 NUMERIC,
  so2 NUMERIC,
  data JSONB NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 minutes')
);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'alert', 'milestone')),
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: reports
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  report_type TEXT DEFAULT 'monthly' CHECK (report_type IN ('weekly', 'monthly', 'yearly', 'custom')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'ready', 'error')),
  file_url TEXT,
  summary JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_electricity_user_date ON public.electricity_usage(user_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_transport_user_date ON public.transportation_logs(user_id, trip_date DESC);
CREATE INDEX IF NOT EXISTS idx_waste_user_date ON public.waste_records(user_id, record_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON public.activities(user_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_carbon_reports_user ON public.carbon_reports(user_id, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_scores_user ON public.sustainability_scores(user_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_city ON public.weather_cache(city, expires_at);
CREATE INDEX IF NOT EXISTS idx_aqi_city ON public.aqi_cache(city, expires_at);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_electricity_updated_at
  BEFORE UPDATE ON public.electricity_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Calculate carbon score function
CREATE OR REPLACE FUNCTION calculate_sustainability_score(
  electricity_kg NUMERIC,
  transport_kg NUMERIC,
  waste_kg NUMERIC,
  period_days INTEGER DEFAULT 30
)
RETURNS TABLE(score NUMERIC, grade TEXT) AS $$
DECLARE
  total_kg NUMERIC;
  daily_avg NUMERIC;
  base_score NUMERIC;
BEGIN
  total_kg := COALESCE(electricity_kg, 0) + COALESCE(transport_kg, 0) + COALESCE(waste_kg, 0);
  daily_avg := total_kg / GREATEST(period_days, 1);
  
  -- World average daily carbon is ~13.7 kg CO2e/person
  -- Score: 100 = zero, 50 = world average, 0 = 3x world average
  base_score := GREATEST(0, LEAST(100, 100 - (daily_avg / 13.7 * 50)));
  
  score := ROUND(base_score, 1);
  
  grade := CASE
    WHEN base_score >= 80 THEN 'A'
    WHEN base_score >= 65 THEN 'B'
    WHEN base_score >= 50 THEN 'C'
    WHEN base_score >= 35 THEN 'D'
    ELSE 'F'
  END;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
