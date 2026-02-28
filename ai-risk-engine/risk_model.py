from __future__ import annotations

from typing import Dict, List, Tuple


LOW_RISK_THRESHOLD = 35
HIGH_RISK_THRESHOLD = 70


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _norm(value: float, min_value: float, max_value: float) -> float:
    if max_value <= min_value:
        return 0.0
    return _clamp((value - min_value) / (max_value - min_value), 0.0, 1.0)


def _category_base_risk(category: str) -> Tuple[float, str]:
    mapping = {
        "new": (24.0, "New organizer category carries higher base onboarding risk."),
        "existing": (10.0, "Existing business category reduces base risk due to operating history."),
        "migrating": (16.0, "Migrating platform category receives moderate base risk pending migration checks."),
    }
    return mapping.get(category, (20.0, "Unknown category; conservative base risk applied."))


def _risk_level(score: float) -> str:
    if score >= HIGH_RISK_THRESHOLD:
        return "HIGH"
    if score >= LOW_RISK_THRESHOLD:
        return "MEDIUM"
    return "LOW"


def calculate_weighted_risk(payload: Dict) -> Dict:
    category = str(payload.get("organiserCategory", "new")).strip().lower()
    years = float(payload.get("yearsOfOperation", 0) or 0)
    has_license = bool(payload.get("hasValidLicense", False))
    group_size = float(payload.get("groupSize", 0) or 0)
    monthly_contribution = float(payload.get("monthlyContribution", 0) or 0)
    location_risk = float(payload.get("locationRiskScore", 50) or 50)
    default_rate = float(payload.get("pastDefaultRate", 0) or 0)
    complaints = float(payload.get("complaintCount", 0) or 0)
    verification_status = str(payload.get("verificationStatus", "pending")).strip().lower()

    score = 0.0
    explanation_points: List[str] = []

    base_score, base_reason = _category_base_risk(category)
    score += base_score
    explanation_points.append(base_reason)

    if not has_license:
        score += 20.0
        explanation_points.append("Valid license missing: +20 risk.")
    else:
        score -= 8.0
        explanation_points.append("Valid license provided: risk reduced.")

    years_risk = (1.0 - _norm(years, 0, 15)) * 18.0
    score += years_risk
    if years >= 5:
        explanation_points.append("Longer operating history lowers risk.")
    else:
        explanation_points.append("Limited operating history increases risk.")

    size_risk = _norm(group_size, 0, 500) * 10.0
    score += size_risk
    if group_size > 100:
        explanation_points.append("Larger member base increases operational exposure.")

    contribution_risk = _norm(monthly_contribution, 0, 100000) * 8.0
    score += contribution_risk
    if monthly_contribution > 25000:
        explanation_points.append("Higher monthly contribution raises financial impact risk.")

    score += _norm(location_risk, 0, 100) * 12.0
    if location_risk >= 60:
        explanation_points.append("Region shows elevated location risk profile.")

    score += _norm(default_rate, 0, 50) * 16.0
    if default_rate > 0:
        explanation_points.append("Historical default rate contributes additional risk.")

    score += _norm(complaints, 0, 50) * 10.0
    if complaints > 0:
        explanation_points.append("User complaints increase trust risk.")

    if verification_status != "verified":
        score += 9.0
        explanation_points.append("Verification pending: conservative risk uplift applied.")
    else:
        score -= 5.0
        explanation_points.append("Verified profile lowers onboarding risk.")

    score = round(_clamp(score, 0.0, 100.0), 2)
    level = _risk_level(score)

    explanation = " ".join(explanation_points[:6])
    return {
        "riskScore": score,
        "riskLevel": level,
        "explanation": explanation,
        "factors": explanation_points,
        "modelVersion": "weighted_v1",
    }


def calculate_group_risk(payload: Dict) -> Dict:
    """Basic weighted group-level risk score for chit groups."""
    group_size = float(payload.get("groupSize", 0) or 0)
    monthly_amount = float(payload.get("monthlyContribution", 0) or 0)
    organizer_risk = float(payload.get("organizerRiskScore", 50) or 50)
    default_rate = float(payload.get("defaultRate", 0) or 0)
    complaint_count = float(payload.get("complaintCount", 0) or 0)
    location_risk = float(payload.get("locationRiskScore", 50) or 50)
    escrow_enabled = bool(payload.get("escrowEnabled", True))
    verified_members_pct = float(payload.get("verifiedMembersPct", 0) or 0)

    score = 0.0
    factors: List[str] = []

    score += _norm(group_size, 0, 500) * 14.0
    score += _norm(monthly_amount, 0, 100000) * 14.0
    score += _norm(organizer_risk, 0, 100) * 24.0
    score += _norm(default_rate, 0, 50) * 18.0
    score += _norm(complaint_count, 0, 50) * 10.0
    score += _norm(location_risk, 0, 100) * 10.0

    if not escrow_enabled:
        score += 10.0
        factors.append("Escrow not enabled increases payout risk.")
    else:
        score -= 6.0
        factors.append("Escrow enabled lowers fund handling risk.")

    verified_factor = (1.0 - _norm(verified_members_pct, 0, 100)) * 8.0
    score += verified_factor
    if verified_members_pct < 50:
        factors.append("Low verified member ratio increases trust risk.")
    else:
        factors.append("Strong verified member ratio reduces trust risk.")

    score = round(_clamp(score, 0.0, 100.0), 2)
    level = _risk_level(score)

    return {
        "riskScore": score,
        "riskLevel": level,
        "explanation": "Group risk combines organizer profile, defaults, complaints, location, and escrow controls.",
        "factors": factors,
        "modelVersion": "group_weighted_v1",
    }
