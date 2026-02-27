import React from "react";
import { Shield, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { T } from "@/context/LanguageContext";

export function GroupRiskCard({ report }) {
  if (!report) return null;
  const { riskLevel, confidence, warningFlags, positiveSignals, summary, recommendation } = report;

  let bgColor = "";
  let borderColor = "";
  let badgeColor = "";
  let icon = null;
  
  if (riskLevel === "LOW") {
    bgColor = "bg-emerald-50";
    borderColor = "border-emerald-200";
    badgeColor = "bg-emerald-100 text-emerald-700";
    icon = <CheckCircle className="w-5 h-5 text-emerald-600" />;
  } else if (riskLevel === "MEDIUM") {
    bgColor = "bg-amber-50";
    borderColor = "border-amber-200";
    badgeColor = "bg-amber-100 text-amber-700";
    icon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
  } else if (riskLevel === "HIGH") {
    bgColor = "bg-red-50";
    borderColor = "border-red-200";
    badgeColor = "bg-red-100 text-red-700";
    icon = <AlertTriangle className="w-5 h-5 text-red-600" />;
  }

  return (
    <div className={`border-2 ${borderColor} ${bgColor} rounded-2xl p-6 mt-6 shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b ${borderColor}">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${bgColor} border ${borderColor} flex items-center justify-center`}>
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-foreground"><T>AI Risk Analysis</T></h3>
            <p className="text-xs text-muted-foreground">{confidence}% <T>confidence</T></p>
          </div>
        </div>
        <span className={`px-4 py-1.5 rounded-xl text-sm font-bold ${badgeColor} border ${borderColor}`}>
          {riskLevel}
        </span>
      </div>

      {/* Summary */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground"><T>Summary</T></span>
        </div>
        <p className="text-sm text-muted-foreground pl-6"><T>{summary}</T></p>
      </div>

      {/* Warning Flags */}
      {warningFlags && warningFlags.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="font-semibold text-sm text-foreground"><T>Warning Flags</T></span>
          </div>
          <ul className="space-y-1 pl-6">
            {warningFlags.map((f, i) => (
              <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span><T>{f}</T></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Positive Signals */}
      {positiveSignals && positiveSignals.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-sm text-foreground"><T>Positive Signals</T></span>
          </div>
          <ul className="space-y-1 pl-6">
            {positiveSignals.map((f, i) => (
              <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span><T>{f}</T></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendation */}
      <div className="pt-4 border-t ${borderColor}">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="font-semibold text-sm text-foreground"><T>Recommendation</T></span>
        </div>
        <p className="text-sm text-foreground font-medium pl-6"><T>{recommendation}</T></p>
      </div>
    </div>
  );
}
