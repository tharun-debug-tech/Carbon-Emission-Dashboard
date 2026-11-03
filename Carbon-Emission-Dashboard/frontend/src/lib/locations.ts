// src/lib/locations.ts

export type LocationOption = {
  country: string
  countryCode: string
  flag: string
  state: string
  stateCode: string
  city: string
  lat: number
  lon: number
  timezone: string
}

export type CountrySummary = {
  name: string
  code: string
  flag: string
}

export const LOCATIONS: LocationOption[] = [
  // ==========================================
  // INDIA (IN) 🇮🇳
  // ==========================================
  // Karnataka
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Karnataka', stateCode: 'KA', city: 'Bengaluru', lat: 12.9716, lon: 77.5946, timezone: 'Asia/Kolkata' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Karnataka', stateCode: 'KA', city: 'Mysuru', lat: 12.2958, lon: 76.6394, timezone: 'Asia/Kolkata' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Karnataka', stateCode: 'KA', city: 'Mangaluru', lat: 12.9141, lon: 74.856, timezone: 'Asia/Kolkata' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Karnataka', stateCode: 'KA', city: 'Hubballi', lat: 15.3647, lon: 75.124, timezone: 'Asia/Kolkata' },

  // Maharashtra
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Maharashtra', stateCode: 'MH', city: 'Mumbai', lat: 19.076, lon: 72.8777, timezone: 'Asia/Kolkata' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Maharashtra', stateCode: 'MH', city: 'Pune', lat: 18.5204, lon: 73.8567, timezone: 'Asia/Kolkata' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Maharashtra', stateCode: 'MH', city: 'Nagpur', lat: 21.1458, lon: 79.0882, timezone: 'Asia/Kolkata' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Maharashtra', stateCode: 'MH', city: 'Nashik', lat: 19.9975, lon: 73.7898, timezone: 'Asia/Kolkata' },

  // Delhi
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Delhi', stateCode: 'DL', city: 'New Delhi', lat: 28.6139, lon: 77.209, timezone: 'Asia/Kolkata' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Delhi', stateCode: 'DL', city: 'Dwarka', lat: 28.5921, lon: 77.046, timezone: 'Asia/Kolkata' },

  // Tamil Nadu
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Tamil Nadu', stateCode: 'TN', city: 'Chennai', lat: 13.0827, lon: 80.2707, timezone: 'Asia/Kolkata' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Tamil Nadu', stateCode: 'TN', city: 'Coimbatore', lat: 11.0168, lon: 76.9558, timezone: 'Asia/Kolkata' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Tamil Nadu', stateCode: 'TN', city: 'Madurai', lat: 9.9252, lon: 78.1198, timezone: 'Asia/Kolkata' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Tamil Nadu', stateCode: 'TN', city: 'Tiruchirappalli', lat: 10.7905, lon: 78.7047, timezone: 'Asia/Kolkata' },

  // Telangana
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Telangana', stateCode: 'TG', city: 'Hyderabad', lat: 17.385, lon: 78.4867, timezone: 'Asia/Kolkata' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Telangana', stateCode: 'TG', city: 'Warangal', lat: 17.9689, lon: 79.5941, timezone: 'Asia/Kolkata' },

  // West Bengal
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'West Bengal', stateCode: 'WB', city: 'Kolkata', lat: 22.5726, lon: 88.3639, timezone: 'Asia/Kolkata' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'West Bengal', stateCode: 'WB', city: 'Howrah', lat: 22.5958, lon: 88.2636, timezone: 'Asia/Kolkata' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'West Bengal', stateCode: 'WB', city: 'Siliguri', lat: 26.7271, lon: 88.3953, timezone: 'Asia/Kolkata' },

  // Gujarat
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Gujarat', stateCode: 'GJ', city: 'Ahmedabad', lat: 23.0225, lon: 72.5714, timezone: 'Asia/Kolkata' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Gujarat', stateCode: 'GJ', city: 'Surat', lat: 21.1702, lon: 72.8311, timezone: 'Asia/Kolkata' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Gujarat', stateCode: 'GJ', city: 'Vadodara', lat: 22.3072, lon: 73.1812, timezone: 'Asia/Kolkata' },

  // Rajasthan
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Rajasthan', stateCode: 'RJ', city: 'Jaipur', lat: 26.9124, lon: 75.7873, timezone: 'Asia/Kolkata' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Rajasthan', stateCode: 'RJ', city: 'Udaipur', lat: 24.5854, lon: 73.7125, timezone: 'Asia/Kolkata' },

  // Uttar Pradesh
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttar Pradesh', stateCode: 'UP', city: 'Lucknow', lat: 26.8467, lon: 80.9462, timezone: 'Asia/Kolkata' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Uttar Pradesh', stateCode: 'UP', city: 'Varanasi', lat: 25.3176, lon: 82.9739, timezone: 'Asia/Kolkata' },

  // Kerala
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Kerala', stateCode: 'KL', city: 'Thiruvananthapuram', lat: 8.5241, lon: 76.9366, timezone: 'Asia/Kolkata' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', state: 'Kerala', stateCode: 'KL', city: 'Kochi', lat: 9.9312, lon: 76.2673, timezone: 'Asia/Kolkata' },

  // ==========================================
  // UNITED STATES (US) 🇺🇸
  // ==========================================
  // California
  { country: 'United States', countryCode: 'US', flag: '🇺🇸', state: 'California', stateCode: 'CA', city: 'Los Angeles', lat: 34.0522, lon: -118.2437, timezone: 'America/Los_Angeles' },
  { country: 'United States', countryCode: 'US', flag: '🇺🇸', state: 'California', stateCode: 'CA', city: 'San Francisco', lat: 37.7749, lon: -122.4194, timezone: 'America/Los_Angeles' },
  { country: 'United States', countryCode: 'US', flag: '🇺🇸', state: 'California', stateCode: 'CA', city: 'San Diego', lat: 32.7157, lon: -117.1611, timezone: 'America/Los_Angeles' },
  { country: 'United States', countryCode: 'US', flag: '🇺🇸', state: 'California', stateCode: 'CA', city: 'San Jose', lat: 37.3382, lon: -121.8863, timezone: 'America/Los_Angeles' },

  // New York
  { country: 'United States', countryCode: 'US', flag: '🇺🇸', state: 'New York', stateCode: 'NY', city: 'New York City', lat: 40.7128, lon: -74.006, timezone: 'America/New_York' },
  { country: 'United States', countryCode: 'US', flag: '🇺🇸', state: 'New York', stateCode: 'NY', city: 'Buffalo', lat: 42.8864, lon: -78.8784, timezone: 'America/New_York' },

  // Texas
  { country: 'United States', countryCode: 'US', flag: '🇺🇸', state: 'Texas', stateCode: 'TX', city: 'Houston', lat: 29.7604, lon: -95.3698, timezone: 'America/Chicago' },
  { country: 'United States', countryCode: 'US', flag: '🇺🇸', state: 'Texas', stateCode: 'TX', city: 'Austin', lat: 30.2672, lon: -97.7431, timezone: 'America/Chicago' },
  { country: 'United States', countryCode: 'US', flag: '🇺🇸', state: 'Texas', stateCode: 'TX', city: 'Dallas', lat: 32.7767, lon: -96.797, timezone: 'America/Chicago' },

  // Florida
  { country: 'United States', countryCode: 'US', flag: '🇺🇸', state: 'Florida', stateCode: 'FL', city: 'Miami', lat: 25.7617, lon: -80.1918, timezone: 'America/New_York' },
  { country: 'United States', countryCode: 'US', flag: '🇺🇸', state: 'Florida', stateCode: 'FL', city: 'Orlando', lat: 28.5383, lon: -81.3792, timezone: 'America/New_York' },

  // Washington
  { country: 'United States', countryCode: 'US', flag: '🇺🇸', state: 'Washington', stateCode: 'WA', city: 'Seattle', lat: 47.6062, lon: -122.3321, timezone: 'America/Los_Angeles' },

  // Illinois
  { country: 'United States', countryCode: 'US', flag: '🇺🇸', state: 'Illinois', stateCode: 'IL', city: 'Chicago', lat: 41.8781, lon: -87.6298, timezone: 'America/Chicago' },

  // ==========================================
  // UNITED KINGDOM (GB) 🇬🇧
  // ==========================================
  // England
  { country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', state: 'England', stateCode: 'ENG', city: 'London', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London' },
  { country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', state: 'England', stateCode: 'ENG', city: 'Manchester', lat: 53.4808, lon: -2.2426, timezone: 'Europe/London' },
  { country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', state: 'England', stateCode: 'ENG', city: 'Birmingham', lat: 52.4862, lon: -1.8904, timezone: 'Europe/London' },

  // Scotland
  { country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', state: 'Scotland', stateCode: 'SCT', city: 'Edinburgh', lat: 55.9533, lon: -3.1883, timezone: 'Europe/London' },
  { country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', state: 'Scotland', stateCode: 'SCT', city: 'Glasgow', lat: 55.8642, lon: -4.2518, timezone: 'Europe/London' },

  // Wales
  { country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', state: 'Wales', stateCode: 'WLS', city: 'Cardiff', lat: 51.4816, lon: -3.1791, timezone: 'Europe/London' },

  // ==========================================
  // GERMANY (DE) 🇩🇪
  // ==========================================
  // Bavaria
  { country: 'Germany', countryCode: 'DE', flag: '🇩🇪', state: 'Bavaria', stateCode: 'BY', city: 'Munich', lat: 48.1351, lon: 11.582, timezone: 'Europe/Berlin' },
  { country: 'Germany', countryCode: 'DE', flag: '🇩🇪', state: 'Bavaria', stateCode: 'BY', city: 'Nuremberg', lat: 49.4521, lon: 11.0767, timezone: 'Europe/Berlin' },

  // Berlin
  { country: 'Germany', countryCode: 'DE', flag: '🇩🇪', state: 'Berlin', stateCode: 'BE', city: 'Berlin', lat: 52.52, lon: 13.405, timezone: 'Europe/Berlin' },

  // North Rhine-Westphalia
  { country: 'Germany', countryCode: 'DE', flag: '🇩🇪', state: 'North Rhine-Westphalia', stateCode: 'NW', city: 'Cologne', lat: 50.9375, lon: 6.9603, timezone: 'Europe/Berlin' },
  { country: 'Germany', countryCode: 'DE', flag: '🇩🇪', state: 'North Rhine-Westphalia', stateCode: 'NW', city: 'Düsseldorf', lat: 51.2277, lon: 6.7735, timezone: 'Europe/Berlin' },

  // Hesse
  { country: 'Germany', countryCode: 'DE', flag: '🇩🇪', state: 'Hesse', stateCode: 'HE', city: 'Frankfurt', lat: 50.1109, lon: 8.6821, timezone: 'Europe/Berlin' },

  // ==========================================
  // FRANCE (FR) 🇫🇷
  // ==========================================
  // Île-de-France
  { country: 'France', countryCode: 'FR', flag: '🇫🇷', state: 'Île-de-France', stateCode: 'IDF', city: 'Paris', lat: 48.8566, lon: 2.3522, timezone: 'Europe/Paris' },
  { country: 'France', countryCode: 'FR', flag: '🇫🇷', state: 'Île-de-France', stateCode: 'IDF', city: 'Versailles', lat: 48.8049, lon: 2.1204, timezone: 'Europe/Paris' },

  // Provence-Alpes-Côte d'Azur
  { country: 'France', countryCode: 'FR', flag: '🇫🇷', state: 'Provence-Alpes-Côte dAzur', stateCode: 'PAC', city: 'Marseille', lat: 43.2965, lon: 5.3698, timezone: 'Europe/Paris' },
  { country: 'France', countryCode: 'FR', flag: '🇫🇷', state: 'Provence-Alpes-Côte dAzur', stateCode: 'PAC', city: 'Nice', lat: 43.7102, lon: 7.262, timezone: 'Europe/Paris' },

  // Auvergne-Rhône-Alpes
  { country: 'France', countryCode: 'FR', flag: '🇫🇷', state: 'Auvergne-Rhône-Alpes', stateCode: 'ARA', city: 'Lyon', lat: 45.764, lon: 4.8357, timezone: 'Europe/Paris' },

  // ==========================================
  // JAPAN (JP) 🇯🇵
  // ==========================================
  // Tokyo
  { country: 'Japan', countryCode: 'JP', flag: '🇯🇵', state: 'Tokyo', stateCode: '13', city: 'Tokyo', lat: 35.6762, lon: 139.6503, timezone: 'Asia/Tokyo' },
  { country: 'Japan', countryCode: 'JP', flag: '🇯🇵', state: 'Tokyo', stateCode: '13', city: 'Hachioji', lat: 35.6554, lon: 139.3389, timezone: 'Asia/Tokyo' },

  // Osaka
  { country: 'Japan', countryCode: 'JP', flag: '🇯🇵', state: 'Osaka', stateCode: '27', city: 'Osaka', lat: 34.6937, lon: 135.5023, timezone: 'Asia/Tokyo' },

  // Kyoto
  { country: 'Japan', countryCode: 'JP', flag: '🇯🇵', state: 'Kyoto', stateCode: '26', city: 'Kyoto', lat: 35.0116, lon: 135.7681, timezone: 'Asia/Tokyo' },

  // Kanagawa
  { country: 'Japan', countryCode: 'JP', flag: '🇯🇵', state: 'Kanagawa', stateCode: '14', city: 'Yokohama', lat: 35.4437, lon: 139.638, timezone: 'Asia/Tokyo' },

  // ==========================================
  // SINGAPORE (SG) 🇸🇬
  // ==========================================
  { country: 'Singapore', countryCode: 'SG', flag: '🇸🇬', state: 'Central Region', stateCode: 'CR', city: 'Singapore City', lat: 1.3521, lon: 103.8198, timezone: 'Asia/Singapore' },
  { country: 'Singapore', countryCode: 'SG', flag: '🇸🇬', state: 'Central Region', stateCode: 'CR', city: 'Marina Bay', lat: 1.284, lon: 103.8607, timezone: 'Asia/Singapore' },

  // ==========================================
  // AUSTRALIA (AU) 🇦🇺
  // ==========================================
  // New South Wales
  { country: 'Australia', countryCode: 'AU', flag: '🇦🇺', state: 'New South Wales', stateCode: 'NSW', city: 'Sydney', lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney' },
  { country: 'Australia', countryCode: 'AU', flag: '🇦🇺', state: 'New South Wales', stateCode: 'NSW', city: 'Newcastle', lat: -32.9283, lon: 151.7817, timezone: 'Australia/Sydney' },

  // Victoria
  { country: 'Australia', countryCode: 'AU', flag: '🇦🇺', state: 'Victoria', stateCode: 'VIC', city: 'Melbourne', lat: -37.8136, lon: 144.9631, timezone: 'Australia/Melbourne' },

  // Queensland
  { country: 'Australia', countryCode: 'AU', flag: '🇦🇺', state: 'Queensland', stateCode: 'QLD', city: 'Brisbane', lat: -27.4705, lon: 153.026, timezone: 'Australia/Brisbane' },

  // Western Australia
  { country: 'Australia', countryCode: 'AU', flag: '🇦🇺', state: 'Western Australia', stateCode: 'WA', city: 'Perth', lat: -31.9505, lon: 115.8605, timezone: 'Australia/Perth' },

  // ==========================================
  // CANADA (CA) 🇨🇦
  // ==========================================
  // Ontario
  { country: 'Canada', countryCode: 'CA', flag: '🇨🇦', state: 'Ontario', stateCode: 'ON', city: 'Toronto', lat: 43.6532, lon: -79.3832, timezone: 'America/Toronto' },
  { country: 'Canada', countryCode: 'CA', flag: '🇨🇦', state: 'Ontario', stateCode: 'ON', city: 'Ottawa', lat: 45.4215, lon: -75.6972, timezone: 'America/Toronto' },

  // Quebec
  { country: 'Canada', countryCode: 'CA', flag: '🇨🇦', state: 'Quebec', stateCode: 'QC', city: 'Montreal', lat: 45.5017, lon: -73.5673, timezone: 'America/Toronto' },

  // British Columbia
  { country: 'Canada', countryCode: 'CA', flag: '🇨🇦', state: 'British Columbia', stateCode: 'BC', city: 'Vancouver', lat: 49.2827, lon: -123.1207, timezone: 'America/Vancouver' },

  // ==========================================
  // BRAZIL (BR) 🇧🇷
  // ==========================================
  // São Paulo
  { country: 'Brazil', countryCode: 'BR', flag: '🇧🇷', state: 'São Paulo', stateCode: 'SP', city: 'São Paulo', lat: -23.5505, lon: -46.6333, timezone: 'America/Sao_Paulo' },
  { country: 'Brazil', countryCode: 'BR', flag: '🇧🇷', state: 'São Paulo', stateCode: 'SP', city: 'Campinas', lat: -22.9099, lon: -47.0626, timezone: 'America/Sao_Paulo' },

  // Rio de Janeiro
  { country: 'Brazil', countryCode: 'BR', flag: '🇧🇷', state: 'Rio de Janeiro', stateCode: 'RJ', city: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, timezone: 'America/Sao_Paulo' },

  // ==========================================
  // UNITED ARAB EMIRATES (AE) 🇦🇪
  // ==========================================
  { country: 'United Arab Emirates', countryCode: 'AE', flag: '🇦🇪', state: 'Dubai', stateCode: 'DU', city: 'Dubai', lat: 25.2048, lon: 55.2708, timezone: 'Asia/Dubai' },
  { country: 'United Arab Emirates', countryCode: 'AE', flag: '🇦🇪', state: 'Abu Dhabi', stateCode: 'AZ', city: 'Abu Dhabi', lat: 24.4539, lon: 54.3773, timezone: 'Asia/Dubai' },
  { country: 'United Arab Emirates', countryCode: 'AE', flag: '🇦🇪', state: 'Sharjah', stateCode: 'SH', city: 'Sharjah', lat: 25.3463, lon: 55.4209, timezone: 'Asia/Dubai' },

  // ==========================================
  // SOUTH AFRICA (ZA) 🇿🇦
  // ==========================================
  { country: 'South Africa', countryCode: 'ZA', flag: '🇿🇦', state: 'Gauteng', stateCode: 'GP', city: 'Johannesburg', lat: -26.2041, lon: 28.0473, timezone: 'Africa/Johannesburg' },
  { country: 'South Africa', countryCode: 'ZA', flag: '🇿🇦', state: 'Gauteng', stateCode: 'GP', city: 'Pretoria', lat: -25.7479, lon: 28.2293, timezone: 'Africa/Johannesburg' },
  { country: 'South Africa', countryCode: 'ZA', flag: '🇿🇦', state: 'Western Cape', stateCode: 'WC', city: 'Cape Town', lat: -33.9249, lon: 18.4241, timezone: 'Africa/Johannesburg' }
]

export const DEFAULT_LOCATION = LOCATIONS[0] // Bengaluru, KA, India

export function getCountries(): CountrySummary[] {
  const map = new Map<string, CountrySummary>()
  for (const loc of LOCATIONS) {
    if (!map.has(loc.country)) {
      map.set(loc.country, { name: loc.country, code: loc.countryCode, flag: loc.flag })
    }
  }
  return Array.from(map.values())
}

export function getStates(): string[] {
  return Array.from(new Set(LOCATIONS.map((loc) => loc.state)))
}

export function getStatesForCountry(countryName?: string): string[] {
  if (!countryName) return getStates()
  const filtered = LOCATIONS.filter((loc) => loc.country.toLowerCase() === countryName.toLowerCase())
  return Array.from(new Set(filtered.map((loc) => loc.state)))
}

export function getCitiesForState(stateName: string, countryName?: string): LocationOption[] {
  if (countryName) {
    return LOCATIONS.filter(
      (loc) => loc.country.toLowerCase() === countryName.toLowerCase() && loc.state.toLowerCase() === stateName.toLowerCase()
    )
  }
  return LOCATIONS.filter((loc) => loc.state.toLowerCase() === stateName.toLowerCase())
}

export function getLocationByCity(city: string): LocationOption | undefined {
  return LOCATIONS.find((loc) => loc.city.toLowerCase() === city.toLowerCase())
}

export function getLocation(state: string, city: string): LocationOption {
  return (
    LOCATIONS.find((loc) => loc.state.toLowerCase() === state.toLowerCase() && loc.city.toLowerCase() === city.toLowerCase()) ||
    getLocationByCity(city) ||
    DEFAULT_LOCATION
  )
}

export function getLocationByCoords(lat: number, lon: number): LocationOption | undefined {
  // Find nearest location by Haversine approximation
  let closest: LocationOption | undefined = undefined
  let minDist = Infinity
  for (const loc of LOCATIONS) {
    const dist = Math.hypot(loc.lat - lat, loc.lon - lon)
    if (dist < minDist) {
      minDist = dist
      closest = loc
    }
  }
  return closest
}

export function searchLocations(query: string): LocationOption[] {
  const q = query.trim().toLowerCase()
  if (!q) return LOCATIONS.slice(0, 10)
  return LOCATIONS.filter(
    (loc) =>
      loc.city.toLowerCase().includes(q) ||
      loc.state.toLowerCase().includes(q) ||
      loc.country.toLowerCase().includes(q)
  )
}
