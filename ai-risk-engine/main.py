from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from risk_model import calculate_weighted_risk


class RiskInput(BaseModel):
    organiserCategory: str = Field(pattern="^(new|existing|migrating)$")
    yearsOfOperation: int = Field(ge=0, le=100)
    hasValidLicense: bool
    groupSize: int = Field(ge=0, le=100000)
    monthlyContribution: float = Field(ge=0)
    locationRiskScore: float = Field(ge=0, le=100)
    pastDefaultRate: float = Field(ge=0, le=100)
    complaintCount: int = Field(ge=0)
    verificationStatus: str = Field(pattern="^(pending|verified)$")

    @field_validator("organiserCategory", "verificationStatus", mode="before")
    @classmethod
    def normalize_text(cls, value: str) -> str:
        return str(value).strip().lower()


app = FastAPI(title="Nivesh Nidhi AI Risk Engine", version="1.0.0")

# Backend-to-backend usage. Keep origins explicit per environment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://127.0.0.1:5000"],
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/calculate-risk")
def calculate_risk(payload: RiskInput) -> dict:
    result = calculate_weighted_risk(payload.model_dump())
    return result


# Run with:
# uvicorn main:app --host 127.0.0.1 --port 8000 --reload
