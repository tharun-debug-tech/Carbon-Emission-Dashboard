-- ============================================================
-- EcoTrack Analytics - Seed Data
-- ============================================================

-- Emission Factors reference data
INSERT INTO public.emission_factors (category, sub_category, factor, unit, region, source) VALUES
  -- Electricity
  ('electricity', 'grid_india', 0.82, 'kWh', 'India', 'CEA 2023'),
  ('electricity', 'grid_us', 0.42, 'kWh', 'US', 'EPA 2023'),
  ('electricity', 'grid_eu', 0.27, 'kWh', 'EU', 'EEA 2023'),
  ('electricity', 'grid_global', 0.50, 'kWh', 'global', 'IEA 2023'),
  ('electricity', 'solar', 0.04, 'kWh', 'global', 'IPCC 2023'),
  -- Transportation
  ('transport', 'car_petrol', 0.21, 'km', 'global', 'DEFRA 2023'),
  ('transport', 'car_diesel', 0.17, 'km', 'global', 'DEFRA 2023'),
  ('transport', 'car_electric', 0.05, 'km', 'global', 'DEFRA 2023'),
  ('transport', 'bus', 0.089, 'km', 'global', 'DEFRA 2023'),
  ('transport', 'train', 0.041, 'km', 'global', 'DEFRA 2023'),
  ('transport', 'motorcycle', 0.114, 'km', 'global', 'DEFRA 2023'),
  ('transport', 'flight_domestic', 0.255, 'km', 'global', 'DEFRA 2023'),
  ('transport', 'flight_international', 0.195, 'km', 'global', 'DEFRA 2023'),
  ('transport', 'bike', 0.0, 'km', 'global', 'IPCC 2023'),
  ('transport', 'walk', 0.0, 'km', 'global', 'IPCC 2023'),
  -- Waste
  ('waste', 'landfill', 0.58, 'kg', 'global', 'EPA 2023'),
  ('waste', 'recycled', 0.02, 'kg', 'global', 'EPA 2023'),
  ('waste', 'composted', 0.01, 'kg', 'global', 'EPA 2023'),
  ('waste', 'incinerated', 0.49, 'kg', 'global', 'EPA 2023'),
  ('waste', 'plastic', 2.4, 'kg', 'global', 'IPCC 2023'),
  ('waste', 'paper', 1.07, 'kg', 'global', 'IPCC 2023'),
  ('waste', 'glass', 0.86, 'kg', 'global', 'IPCC 2023'),
  ('waste', 'metal', 2.5, 'kg', 'global', 'IPCC 2023'),
  ('waste', 'organic', 0.44, 'kg', 'global', 'IPCC 2023'),
  ('waste', 'electronic', 20.0, 'kg', 'global', 'EPA 2023');
