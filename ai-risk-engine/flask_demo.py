from __future__ import annotations

from flask import Flask, jsonify, render_template, request

from risk_model import calculate_group_risk, calculate_weighted_risk

app = Flask(__name__)

DUMMY_ORGANIZER = {
    "organiserCategory": "existing",
    "yearsOfOperation": 7,
    "hasValidLicense": True,
    "groupSize": 120,
    "monthlyContribution": 6000,
    "locationRiskScore": 40,
    "pastDefaultRate": 3.5,
    "complaintCount": 2,
    "verificationStatus": "verified",
}

DUMMY_GROUP = {
    "groupName": "Mahalaxmi Prime Circle",
    "city": "Pune",
    "state": "Maharashtra",
    "groupSize": 80,
    "monthlyContribution": 5000,
    "organizerRiskScore": 38,
    "defaultRate": 4.0,
    "complaintCount": 1,
    "locationRiskScore": 42,
    "escrowEnabled": True,
    "verifiedMembersPct": 78,
}


@app.get("/")
def demo_home():
    organizer_result = calculate_weighted_risk(DUMMY_ORGANIZER)
    group_result = calculate_group_risk(DUMMY_GROUP)
    return render_template(
        "demo.html",
        organizer=DUMMY_ORGANIZER,
        organizer_result=organizer_result,
        group=DUMMY_GROUP,
        group_result=group_result,
    )


@app.get("/health")
def health():
    return jsonify({"ok": True, "service": "flask-risk-demo"})


@app.post("/api/organizer-risk")
def organizer_risk():
    payload = request.get_json(silent=True) or DUMMY_ORGANIZER
    result = calculate_weighted_risk(payload)
    return jsonify({"input": payload, "output": result})


@app.post("/api/group-risk")
def group_risk():
    payload = request.get_json(silent=True) or DUMMY_GROUP
    result = calculate_group_risk(payload)
    return jsonify({"input": payload, "output": result})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)
