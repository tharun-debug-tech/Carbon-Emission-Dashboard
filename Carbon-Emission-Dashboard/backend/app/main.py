# backend/app/main.py
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import pandas as pd

try:
    from .dataset_services import AQIService, CarbonFactorService, EnergyConsumptionService
except ImportError:
    from dataset_services import AQIService, CarbonFactorService, EnergyConsumptionService

app = FastAPI(
    title="EcoTrack Analytics API",
    description="Python & FastAPI Backend for EcoTrack Carbon Footprint & Sustainability Platform",
    version="1.0.0",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cached dataset services. They load once at startup and are reused by every request.
aqi_service = AQIService()
energy_service = EnergyConsumptionService()
carbon_factor_service = CarbonFactorService(energy_service)


@app.on_event("startup")
def load_datasets() -> None:
    if aqi_service.df.empty:
        aqi_service.load()
    if energy_service.df.empty:
        energy_service.load()


load_datasets()


# Schemas
class CarbonCalculationRequest(BaseModel):
    electricity_kwh: float = 0.0
    car_km: float = 0.0
    bus_km: float = 0.0
    flight_km: float = 0.0
    waste_kg: float = 0.0
    fuel_type: str = "petrol"
    country: Optional[str] = None


class ActivityItem(BaseModel):
    activity_type: str
    title: str
    carbon_kg: float
    activity_date: str


@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "EcoTrack Analytics Backend API",
        "version": "1.0.0",
        "docs_url": "/docs",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "datasets": {
            "aqi": aqi_service.status(),
            "energy": energy_service.status(),
            "carbon_factors": carbon_factor_service.status(),
        },
    }


@app.get("/api/datasets/status")
def dataset_status():
    return {
        "aqi": aqi_service.status(),
        "energy": energy_service.status(),
        "carbon_factors": carbon_factor_service.status(),
        "excluded": ["owid-co2-data.csv"],
    }


@app.get("/api/datasets/aqi/summary")
def aqi_summary():
    return aqi_service.summary()


@app.get("/api/datasets/aqi/city")
def aqi_city(city: str = Query(...), country: Optional[str] = None):
    result = aqi_service.city(city, country)
    return result or {"city": city, "country": country, "found": False}


@app.get("/api/datasets/aqi/country/{country}")
def aqi_country(country: str, limit: int = 50):
    return aqi_service.country(country, limit)


@app.get("/api/datasets/aqi/rankings")
def aqi_rankings(limit: int = 10):
    return aqi_service.rankings(limit)


@app.get("/api/datasets/energy/summary")
def energy_summary():
    return energy_service.summary()


@app.get("/api/datasets/energy/country/{country}")
def energy_country(country: str):
    result = energy_service.country(country)
    return result or {"country": country, "found": False}


@app.get("/api/datasets/energy/rankings")
def energy_rankings(limit: int = 10):
    return energy_service.rankings(limit)


@app.get("/api/datasets/energy/comparison")
def energy_comparison(countries: str = Query(..., description="Comma-separated country names")):
    requested = [country.strip() for country in countries.split(",") if country.strip()]
    return {"countries": energy_service.comparison(requested)}


@app.get("/api/datasets/carbon/factors")
def carbon_factors(country: Optional[str] = None):
    return {
        "factors": carbon_factor_service.factors(country),
        "status": carbon_factor_service.status(),
    }


@app.post("/api/carbon/calculate")
def calculate_carbon(req: CarbonCalculationRequest):
    return carbon_factor_service.calculate(req)


@app.get("/api/analytics/summary")
def get_analytics_summary(country: str = "India"):
    energy_payload = energy_service.country(country) or energy_service.country("India")
    aqi_payload = aqi_service.country(country, limit=20)

    if energy_payload and energy_payload.get("trend"):
        trend_df = pd.DataFrame(energy_payload["trend"])
        trend = []
        for _, row in trend_df.iterrows():
            electricity = float(row.get("electricity_demand") or 0)
            carbon_intensity = float(row.get("carbon_intensity_elec") or 0)
            renewable = float(row.get("renewables_share_elec") or 0)
            trend.append({
                "Date": str(int(row.get("year"))) if row.get("year") else "Unknown",
                "Electricity": round(electricity, 2),
                "Transport": round(carbon_intensity, 2),
                "Waste": round(max(0, 100 - renewable), 2),
                "Total": round(electricity + carbon_intensity + max(0, 100 - renewable), 2),
            })
    else:
        trend = []

    totals = [item["Total"] for item in trend]
    return {
        "trend": trend,
        "mean_total": float(pd.Series(totals).mean()) if totals else 0.0,
        "std_total": float(pd.Series(totals).std()) if len(totals) > 1 else 0.0,
        "energy": energy_payload,
        "aqi": aqi_payload,
        "rankings": {
            "aqi": aqi_service.rankings(10),
            "energy": energy_service.rankings(10),
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


