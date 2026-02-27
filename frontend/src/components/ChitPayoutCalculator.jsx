import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { chitGroups as chitGroupsApi } from "@/lib/api";
import { T } from "@/context/LanguageContext";

const toNumber = (value) => {
  if (value === "" || value === null || typeof value === "undefined") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function ChitPayoutCalculator({ groupId, onCalculate }) {
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState("");
  const [config, setConfig] = useState(null);

  const [form, setForm] = useState({
    totalChitAmount: "",
    durationMonths: "",
    numberOfMembers: "",
    commissionRate: "",
    interestRate: "",
  });

  const [result, setResult] = useState(null);
  const [calculateLoading, setCalculateLoading] = useState(false);
  const [calculateError, setCalculateError] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      if (!groupId) return;

      setConfigLoading(true);
      setConfigError("");
      setConfig(null);
      setResult(null);
      setCalculateError("");

      try {
        const res = await chitGroupsApi.getCalculatorConfig(groupId);
        const cfg = res.data?.data;
        if (!cfg) {
          setConfigError("Calculator configuration is missing for this group.");
          return;
        }

        setConfig(cfg);
        setForm({
          totalChitAmount: String(cfg.minAmount ?? ""),
          durationMonths: String(cfg.allowedTimePeriod?.min ?? ""),
          numberOfMembers: String(cfg.maxMembers ?? ""),
          commissionRate: String(cfg.defaultCommissionRate ?? ""),
          interestRate: String(cfg.defaultRate ?? ""),
        });
      } catch (error) {
        setConfigError(error.response?.data?.message || "Failed to fetch calculator configuration.");
      } finally {
        setConfigLoading(false);
      }
    };

    fetchConfig();
  }, [groupId]);

  const inlineErrors = useMemo(() => {
    const errors = {};
    if (!config) return errors;

    const totalChitAmount = toNumber(form.totalChitAmount);
    const durationMonths = toNumber(form.durationMonths);
    const numberOfMembers = toNumber(form.numberOfMembers);
    const commissionRate = toNumber(form.commissionRate);
    const interestRate = toNumber(form.interestRate);

    if (totalChitAmount === null) {
      errors.totalChitAmount = "Total chit amount is required.";
    } else if (totalChitAmount <= 0) {
      errors.totalChitAmount = "Total chit amount must be greater than 0.";
    } else if (totalChitAmount < Number(config.minAmount) || totalChitAmount > Number(config.maxAmount)) {
      errors.totalChitAmount = `Total chit amount must be between ${config.minAmount} and ${config.maxAmount}.`;
    }

    if (durationMonths === null) {
      errors.durationMonths = "Duration (months) is required.";
    } else if (durationMonths <= 0) {
      errors.durationMonths = "Duration (months) must be greater than 0.";
    } else if (durationMonths < config.allowedTimePeriod.min || durationMonths > config.allowedTimePeriod.max) {
      errors.durationMonths = `Duration (months) must be between ${config.allowedTimePeriod.min} and ${config.allowedTimePeriod.max}.`;
    }

    if (numberOfMembers === null) {
      errors.numberOfMembers = "Number of members is required.";
    } else if (numberOfMembers <= 0) {
      errors.numberOfMembers = "Number of members must be greater than 0.";
    } else if (!Number.isInteger(numberOfMembers)) {
      errors.numberOfMembers = "Number of members must be an integer.";
    } else if (numberOfMembers > Number(config.maxMembers || 1)) {
      errors.numberOfMembers = `Number of members cannot exceed ${config.maxMembers}.`;
    }

    if (commissionRate === null) {
      errors.commissionRate = "Commission rate is required.";
    } else if (commissionRate < 0) {
      errors.commissionRate = "Commission rate cannot be negative.";
    }

    if (interestRate === null) {
      errors.interestRate = "Interest rate is required.";
    } else if (interestRate < 0) {
      errors.interestRate = "Interest rate cannot be negative.";
    }

    return errors;
  }, [form, config]);

  const isValid = config && Object.keys(inlineErrors).length === 0;

  const triggerCalculation = async () => {
    if (!config || !isValid) return;

    setCalculateLoading(true);
    setCalculateError("");
    try {
      const payload = {
        totalChitAmount: Number(form.totalChitAmount),
        durationMonths: Number(form.durationMonths),
        numberOfMembers: Number(form.numberOfMembers),
        commissionRate: Number(form.commissionRate),
        interestRate: Number(form.interestRate),
      };

      const res = await chitGroupsApi.calculate(groupId, payload);
      const output = res.data?.data?.result;
      setResult(output || null);
      if (output && onCalculate) {
        onCalculate(output);
      }
    } catch (error) {
      const backendErrors = error.response?.data?.errors;
      if (backendErrors && typeof backendErrors === "object") {
        const firstError = Object.values(backendErrors)[0];
        setCalculateError(firstError || "Calculation failed.");
      } else {
        setCalculateError(error.response?.data?.message || "Calculation failed.");
      }
      setResult(null);
    } finally {
      setCalculateLoading(false);
    }
  };

  useEffect(() => {
    if (!isValid) {
      setResult(null);
      return;
    }

    const timer = setTimeout(() => {
      triggerCalculation();
    }, 250);

    return () => clearTimeout(timer);
  }, [form, isValid]);

  if (!groupId) {
    return <div className="text-muted-foreground"><T>Please select a group to view calculator.</T></div>;
  }

  if (configLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <T>Loading calculator configuration...</T>
      </div>
    );
  }

  if (configError) {
    return <div className="text-red-600 text-sm">{configError}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground"><T>Total Chit Amount (₹)</T></label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g., 100000"
              value={form.totalChitAmount}
              onChange={(e) => setForm((prev) => ({ ...prev, totalChitAmount: e.target.value }))}
              className="w-full mt-1 border border-border rounded-lg px-3 py-2"
            />
            {inlineErrors.totalChitAmount && <p className="text-xs text-red-600 mt-1">{inlineErrors.totalChitAmount}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground"><T>Duration (Months)</T></label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="e.g., 12"
              value={form.durationMonths}
              onChange={(e) => setForm((prev) => ({ ...prev, durationMonths: e.target.value }))}
              className="w-full mt-1 border border-border rounded-lg px-3 py-2"
            />
            {inlineErrors.durationMonths && <p className="text-xs text-red-600 mt-1">{inlineErrors.durationMonths}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground"><T>Number of Members</T></label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="e.g., 10"
              value={form.numberOfMembers}
              onChange={(e) => setForm((prev) => ({ ...prev, numberOfMembers: e.target.value }))}
              className="w-full mt-1 border border-border rounded-lg px-3 py-2"
            />
            {inlineErrors.numberOfMembers && <p className="text-xs text-red-600 mt-1">{inlineErrors.numberOfMembers}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground"><T>Commission Rate (%)</T></label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g., 5"
              value={form.commissionRate}
              onChange={(e) => setForm((prev) => ({ ...prev, commissionRate: e.target.value }))}
              className="w-full mt-1 border border-border rounded-lg px-3 py-2"
            />
            {inlineErrors.commissionRate && <p className="text-xs text-red-600 mt-1">{inlineErrors.commissionRate}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground"><T>Interest Rate (%)</T></label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g., 12"
              value={form.interestRate}
              onChange={(e) => setForm((prev) => ({ ...prev, interestRate: e.target.value }))}
              className="w-full mt-1 border border-border rounded-lg px-3 py-2"
            />
            {inlineErrors.interestRate && <p className="text-xs text-red-600 mt-1">{inlineErrors.interestRate}</p>}
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            <p><T>Calculation Type:</T> <span className="font-semibold text-foreground uppercase">{config?.calculationType}</span></p>
            <p><T>Amount Limits:</T> ₹{Number(config?.minAmount || 0).toLocaleString("en-IN")} - ₹{Number(config?.maxAmount || 0).toLocaleString("en-IN")}</p>
            <p><T>Allowed Time:</T> {config?.allowedTimePeriod?.min} - {config?.allowedTimePeriod?.max}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={triggerCalculation}
          disabled={!isValid || calculateLoading}
          className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-semibold disabled:bg-muted disabled:text-muted-foreground"
        >
          {calculateLoading ? <T>Calculating...</T> : <T>Calculate</T>}
        </button>

        {calculateError && <p className="text-sm text-red-600">{calculateError}</p>}

        {result && (
          <div className="bg-primary/5 rounded-lg p-4 space-y-3 mt-4">
            <h4 className="font-semibold text-foreground"><T>Calculation Breakdown</T></h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground"><T>Total Investment</T></p>
                <p className="font-semibold text-foreground">₹{Number(result.totalInvestment || 0).toLocaleString("en-IN")}</p>
              </div>
              <div className="bg-white rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground"><T>Commission Deducted</T></p>
                <p className="font-semibold text-foreground">₹{Number(result.commissionAmount || 0).toLocaleString("en-IN")}</p>
              </div>
              <div className="bg-white rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground"><T>Per Member Contribution</T></p>
                <p className="font-semibold text-foreground">₹{Number(result.contributionPerMember || 0).toLocaleString("en-IN")}</p>
              </div>
              <div className="bg-white rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground"><T>Interest Earned</T></p>
                <p className="font-semibold text-green-700">₹{Number(result.interestEarned || 0).toLocaleString("en-IN")}</p>
              </div>
              <div className="bg-white rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground"><T>Final Amount</T></p>
                <p className="font-semibold text-secondary">₹{Number(result.finalAmount || 0).toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
