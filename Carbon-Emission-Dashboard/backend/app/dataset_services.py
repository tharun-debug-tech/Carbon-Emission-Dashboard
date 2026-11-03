from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd


DATASET_DIR = Path(__file__).resolve().parents[1] / "Dataset"
AQI_FILE = DATASET_DIR / "global air pollution dataset.csv"
ENERGY_FILE = DATASET_DIR / "owid-energy-data.csv"


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [
        str(col).strip().lower().replace("%", "pct").replace(".", "_").replace("/", "_").replace(" ", "_")
        for col in df.columns
    ]
    return df


def _clean_frame(df: pd.DataFrame) -> pd.DataFrame:
    df = _normalize_columns(df)
    df = df.drop_duplicates()
    for col in df.columns:
        if df[col].dtype == "object":
            converted = pd.to_numeric(df[col], errors="coerce")
            original_non_null = df[col].notna().sum()
            if original_non_null and converted.notna().sum() >= original_non_null * 0.5:
                df[col] = converted
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    text_cols = [col for col in df.columns if col not in numeric_cols]
    if len(numeric_cols):
        df[numeric_cols] = df[numeric_cols].replace([np.inf, -np.inf], np.nan)
    for col in text_cols:
        df[col] = df[col].fillna("").astype(str).str.strip()
    return df


def _json_value(value: Any) -> Any:
    try:
        if pd.isna(value):
            return None
    except (TypeError, ValueError):
        pass
    if isinstance(value, np.generic):
        return value.item()
    return value


def _records(df: pd.DataFrame, limit: int | None = None) -> list[dict[str, Any]]:
    if limit is not None:
        df = df.head(limit)
    clean = df.replace({np.nan: None})
    return [{key: _json_value(value) for key, value in row.items()} for row in clean.to_dict(orient="records")]


def _safe_mean(series: pd.Series) -> float:
    return float(pd.to_numeric(series, errors="coerce").dropna().mean()) if len(series) else 0.0


class AQIService:
    def __init__(self, path: Path = AQI_FILE) -> None:
        self.path = path
        self.df = pd.DataFrame()

    def load(self) -> None:
        df = pd.read_csv(self.path)
        df = _clean_frame(df)
        numeric_cols = [
            "aqi_value", "co_aqi_value", "ozone_aqi_value", "no2_aqi_value", "pm2_5_aqi_value"
        ]
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype("float32")
        df = df[(df.get("country", "") != "") & (df.get("city", "") != "")]
        self.df = df.reset_index(drop=True)

    def status(self) -> dict[str, Any]:
        return {"loaded": not self.df.empty, "rows": int(len(self.df)), "source": self.path.name}

    def summary(self) -> dict[str, Any]:
        df = self.df
        if df.empty:
            return {"countries": 0, "cities": 0, "average_aqi": 0, "pollutants": {}}
        highest = df.sort_values("aqi_value", ascending=False).iloc[0]
        lowest = df.sort_values("aqi_value", ascending=True).iloc[0]
        return {
            "countries": int(df["country"].nunique()),
            "cities": int(df["city"].nunique()),
            "average_aqi": round(_safe_mean(df["aqi_value"]), 2),
            "highest_aqi": self._row_payload(highest),
            "lowest_aqi": self._row_payload(lowest),
            "pollutants": {
                "co": round(_safe_mean(df.get("co_aqi_value", pd.Series(dtype=float))), 2),
                "ozone": round(_safe_mean(df.get("ozone_aqi_value", pd.Series(dtype=float))), 2),
                "no2": round(_safe_mean(df.get("no2_aqi_value", pd.Series(dtype=float))), 2),
                "pm25": round(_safe_mean(df.get("pm2_5_aqi_value", pd.Series(dtype=float))), 2),
            },
        }

    def city(self, city: str, country: str | None = None) -> dict[str, Any] | None:
        q = self.df[self.df["city"].str.lower() == city.lower()]
        if country:
            q = q[q["country"].str.lower().isin([country.lower(), self._country_alias(country).lower()])]
        if q.empty:
            q = self.df[self.df["city"].str.lower().str.contains(city.lower(), na=False)]
        if q.empty:
            return None
        return self._row_payload(q.iloc[0])

    def country(self, country: str, limit: int = 50) -> dict[str, Any]:
        aliases = {country.lower(), self._country_alias(country).lower()}
        q = self.df[self.df["country"].str.lower().isin(aliases)]
        return {
            "country": country,
            "average_aqi": round(_safe_mean(q["aqi_value"]), 2) if not q.empty else 0,
            "cities": _records(q.sort_values("aqi_value", ascending=False), limit),
        }

    def rankings(self, limit: int = 10) -> dict[str, Any]:
        return {
            "cleanest_cities": _records(self.df.sort_values("aqi_value", ascending=True), limit),
            "highest_aqi_cities": _records(self.df.sort_values("aqi_value", ascending=False), limit),
            "country_average_aqi": _records(
                self.df.groupby("country", as_index=False)["aqi_value"].mean().sort_values("aqi_value", ascending=False),
                limit,
            ),
        }

    def _row_payload(self, row: pd.Series) -> dict[str, Any]:
        return {
            "country": row.get("country", ""),
            "city": row.get("city", ""),
            "aqi": int(row.get("aqi_value", 0) or 0),
            "aqi_category": row.get("aqi_category", ""),
            "co": float(row.get("co_aqi_value", 0) or 0),
            "ozone": float(row.get("ozone_aqi_value", 0) or 0),
            "no2": float(row.get("no2_aqi_value", 0) or 0),
            "pm25": float(row.get("pm2_5_aqi_value", 0) or 0),
            "pm25_category": row.get("pm2_5_aqi_category", ""),
        }

    @staticmethod
    def _country_alias(country: str) -> str:
        aliases = {"United States": "United States of America", "Russia": "Russian Federation"}
        return aliases.get(country, country)


class EnergyConsumptionService:
    def __init__(self, path: Path = ENERGY_FILE) -> None:
        self.path = path
        self.df = pd.DataFrame()
        self.latest = pd.DataFrame()

    def load(self) -> None:
        df = pd.read_csv(self.path)
        df = _clean_frame(df)
        if "year" in df.columns:
            df["year"] = pd.to_numeric(df["year"], errors="coerce").astype("Int64")
        if "iso_code" in df.columns:
            df = df[df["iso_code"].astype(str).str.len() == 3]
        numeric_cols = df.columns.difference(["country", "iso_code"])
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors="coerce")
        self.df = df.reset_index(drop=True)
        self.latest = self.df.dropna(subset=["year"]).sort_values("year").groupby("country", as_index=False).tail(1)

    def status(self) -> dict[str, Any]:
        return {"loaded": not self.df.empty, "rows": int(len(self.df)), "latest_rows": int(len(self.latest)), "source": self.path.name}

    def summary(self) -> dict[str, Any]:
        latest = self.latest
        return {
            "countries": int(latest["country"].nunique()) if not latest.empty else 0,
            "latest_year": int(latest["year"].max()) if not latest.empty else None,
            "average_renewables_share_elec": round(_safe_mean(latest.get("renewables_share_elec", pd.Series(dtype=float))), 2),
            "average_carbon_intensity_elec": round(_safe_mean(latest.get("carbon_intensity_elec", pd.Series(dtype=float))), 2),
            "average_electricity_demand": round(_safe_mean(latest.get("electricity_demand", pd.Series(dtype=float))), 2),
        }

    def country(self, country: str) -> dict[str, Any] | None:
        q = self.df[self.df["country"].str.lower() == country.lower()]
        if q.empty:
            q = self.df[self.df["country"].str.lower().str.contains(country.lower(), na=False)]
        if q.empty:
            return None
        latest = q.sort_values("year").iloc[-1]
        trend_cols = ["year", "electricity_demand", "renewables_share_elec", "carbon_intensity_elec", "primary_energy_consumption"]
        trend = q[[col for col in trend_cols if col in q.columns]].sort_values("year").tail(12)
        return {"latest": self._row_payload(latest), "trend": _records(trend)}

    def rankings(self, limit: int = 10) -> dict[str, Any]:
        latest = self.latest
        return {
            "highest_renewable_share": _records(latest.sort_values("renewables_share_elec", ascending=False), limit),
            "lowest_carbon_intensity": _records(latest.sort_values("carbon_intensity_elec", ascending=True), limit),
            "highest_electricity_demand": _records(latest.sort_values("electricity_demand", ascending=False), limit),
        }

    def comparison(self, countries: list[str]) -> list[dict[str, Any]]:
        rows = []
        for country in countries:
            payload = self.country(country)
            if payload:
                rows.append(payload["latest"])
        return rows

    def electricity_factor(self, country: str | None = None) -> float | None:
        q = self.latest
        if q.empty or "country" not in q.columns:
            return None
        if country:
            country_q = q[q["country"].str.lower() == country.lower()]
            if not country_q.empty and pd.notna(country_q.iloc[0].get("carbon_intensity_elec")):
                return float(country_q.iloc[0]["carbon_intensity_elec"]) / 1000.0
        value = _safe_mean(q.get("carbon_intensity_elec", pd.Series(dtype=float)))
        return value / 1000.0 if value else None

    def _row_payload(self, row: pd.Series) -> dict[str, Any]:
        fields = [
            "country", "year", "iso_code", "population", "electricity_demand", "electricity_generation",
            "renewables_share_elec", "renewables_share_energy", "carbon_intensity_elec",
            "primary_energy_consumption", "energy_per_capita", "fossil_share_elec", "low_carbon_share_elec",
        ]
        return {field: _json_value(row.get(field)) for field in fields if field in row.index}


class CarbonFactorService:
    def __init__(self, energy_service: EnergyConsumptionService) -> None:
        self.energy_service = energy_service
        self.factor_dataset_available = False
        self.fallback_factors = {
            "petrol_car_km": 0.21,
            "diesel_car_km": 0.17,
            "electric_car_km": 0.05,
            "hybrid_car_km": 0.12,
            "cng_car_km": 0.16,
            "bus_km": 0.089,
            "flight_km": 0.255,
            "waste_kg": 0.58,
        }

    def status(self) -> dict[str, Any]:
        return {
            "loaded": True,
            "factor_dataset_available": self.factor_dataset_available,
            "source": "owid-energy-data.csv for electricity carbon intensity; existing calculator factors for missing transport/waste factor dataset",
        }

    def factors(self, country: str | None = None) -> dict[str, float]:
        electricity = self.energy_service.electricity_factor(country) or 0.82
        return {"electricity_kwh": round(electricity, 4), **self.fallback_factors}

    def calculate(self, payload: Any) -> dict[str, Any]:
        factors = self.factors(getattr(payload, "country", None))
        fuel_type = getattr(payload, "fuel_type", "petrol").lower()
        car_factor = factors.get(f"{fuel_type}_car_km", factors["petrol_car_km"])
        elec_kg = float(getattr(payload, "electricity_kwh", 0.0)) * factors["electricity_kwh"]
        car_kg = float(getattr(payload, "car_km", 0.0)) * car_factor
        bus_kg = float(getattr(payload, "bus_km", 0.0)) * factors["bus_km"]
        flight_kg = float(getattr(payload, "flight_km", 0.0)) * factors["flight_km"]
        waste_kg = float(getattr(payload, "waste_kg", 0.0)) * factors["waste_kg"]
        transport_kg = car_kg + bus_kg + flight_kg
        total_kg = elec_kg + transport_kg + waste_kg
        daily_avg = total_kg / 30.0
        score = max(0, min(100, int(100 - (daily_avg / 13.7) * 50)))
        grade = "A" if score >= 80 else "B" if score >= 65 else "C" if score >= 50 else "D" if score >= 35 else "F"
        return {
            "electricity_kg": round(elec_kg, 2),
            "transport_kg": round(transport_kg, 2),
            "waste_kg": round(waste_kg, 2),
            "total_kg": round(total_kg, 2),
            "score": score,
            "grade": grade,
            "daily_avg_kg": round(daily_avg, 2),
            "factors": factors,
            "source": self.status()["source"],
        }


