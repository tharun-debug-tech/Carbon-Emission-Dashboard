-- ============================================================
-- EcoTrack Analytics - Row Level Security Policies
-- ============================================================

-- Enable RLS on all user tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.electricity_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transportation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainability_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Public read-only tables (no RLS needed for cache tables)
-- weather_cache and aqi_cache are accessible by service role

-- ============================================================
-- PROFILES policies
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- ELECTRICITY_USAGE policies
-- ============================================================
CREATE POLICY "Users can manage own electricity records"
  ON public.electricity_usage FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TRANSPORTATION_LOGS policies
-- ============================================================
CREATE POLICY "Users can manage own transport records"
  ON public.transportation_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- WASTE_RECORDS policies
-- ============================================================
CREATE POLICY "Users can manage own waste records"
  ON public.waste_records FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- ACTIVITIES policies
-- ============================================================
CREATE POLICY "Users can manage own activities"
  ON public.activities FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- CARBON_REPORTS policies
-- ============================================================
CREATE POLICY "Users can view and manage own carbon reports"
  ON public.carbon_reports FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SUSTAINABILITY_SCORES policies
-- ============================================================
CREATE POLICY "Users can view own scores"
  ON public.sustainability_scores FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATIONS policies
-- ============================================================
CREATE POLICY "Users can view and update own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- REPORTS policies
-- ============================================================
CREATE POLICY "Users can manage own reports"
  ON public.reports FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- EMISSION FACTORS - public read
-- ============================================================
CREATE POLICY "Anyone can read emission factors"
  ON public.emission_factors FOR SELECT
  USING (true);
