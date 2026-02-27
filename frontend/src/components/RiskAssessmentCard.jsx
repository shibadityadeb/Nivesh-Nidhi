import React from "react";

export function RiskAssessmentCard({ riskProfile }) {
  if (!riskProfile) return null;
  const { level, score, concerns, positives, recommendation, generatedAt, fallback } = riskProfile;

  let color = "";
  let label = "";
  if (level === "LOW") {
    color = "bg-green-100 text-green-700 border-green-300";
    label = "🟢 LOW";
  } else if (level === "MEDIUM") {
    color = "bg-yellow-100 text-yellow-700 border-yellow-300";
    label = "🟡 MEDIUM";
  } else if (level === "HIGH") {
    color = "bg-red-100 text-red-700 border-red-300";
    label = "🔴 HIGH";
  }

  return (
    <div className={`border rounded-xl p-5 mt-6 shadow-sm ${color}`}> 
      <div className="flex items-center gap-3 mb-2">
        <span className="font-bold text-lg">Risk Assessment</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>{label}</span>
        <span className="ml-auto text-xs text-muted-foreground">{generatedAt ? new Date(generatedAt).toLocaleString() : ""}</span>
      </div>
      <div className="flex items-center gap-4 mb-2">
        <span className="text-2xl font-bold">{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
        {fallback && <span className="ml-2 text-xs text-amber-600">(Rule-based)</span>}
      </div>
      <div className="mb-2">
        <span className="font-semibold text-sm">Key Concerns:</span>
        <ul className="list-disc ml-6 text-sm text-red-700">
          {concerns && concerns.length > 0 ? concerns.map((c, i) => <li key={i}>{c}</li>) : <li>None</li>}
        </ul>
      </div>
      <div className="mb-2">
        <span className="font-semibold text-sm">Strengths:</span>
        <ul className="list-disc ml-6 text-sm text-green-700">
          {positives && positives.length > 0 ? positives.map((p, i) => <li key={i}>{p}</li>) : <li>None</li>}
        </ul>
      </div>
      <div className="mb-2">
        <span className="font-semibold text-sm">AI Recommendation:</span>
        <span className="ml-2 text-muted-foreground text-sm">{recommendation}</span>
      </div>
    </div>
  );
}
