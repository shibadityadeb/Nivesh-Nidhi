import React, { useState, useEffect } from "react";
import { T } from "@/context/LanguageContext";

export default function ChitPayoutCalculator({
  totalMembers,
  monthlyContribution,
  durationMonths,
  foremanCommissionPercent,
  minDiscount,
  maxDiscount,
  onCalculate
}) {
  const [discount, setDiscount] = useState(minDiscount || 0);
  const [month, setMonth] = useState(1);
  const [results, setResults] = useState({});

  useEffect(() => {
    if (discount < minDiscount) setDiscount(minDiscount);
    if (discount > maxDiscount) setDiscount(maxDiscount);
  }, [minDiscount, maxDiscount]);

  useEffect(() => {
    calculate();
  }, [discount, month, totalMembers, monthlyContribution, durationMonths, foremanCommissionPercent]);

  const calculate = () => {
    const pool = totalMembers * monthlyContribution;
    const commission = pool * (foremanCommissionPercent / 100);
    const discountAmount = pool * (discount / 100);
    const estimatedWinning = pool - commission - discountAmount;
    const totalPayable = monthlyContribution * durationMonths;
    const profitLoss = estimatedWinning - totalPayable / durationMonths;
    const monthPayout = pool - commission - (pool * (discount / 100)) * (month / durationMonths);
    const out = {
      monthlyPool: pool,
      commission,
      discountAmount,
      estimatedWinning,
      totalPayable,
      profitLoss,
      monthPayout,
      discountPercent: discount,
      monthPosition: month
    };
    setResults(out);
    if (onCalculate) onCalculate(out);
  };

  if (!totalMembers || !monthlyContribution || !durationMonths) {
    return <div className="text-muted-foreground"><T>Please select a group to view calculator.</T></div>;
  }

  return (
    <div className="space-y-6">
      {/* Input Parameters */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-secondary/5 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1"><T>Monthly Contribution</T></p>
          <p className="text-lg font-bold text-foreground">₹{monthlyContribution.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-secondary/5 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1"><T>Total Members</T></p>
          <p className="text-lg font-bold text-foreground">{totalMembers}</p>
        </div>
        <div className="bg-secondary/5 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1"><T>Duration</T></p>
          <p className="text-lg font-bold text-foreground">{durationMonths} months</p>
        </div>
        <div className="bg-secondary/5 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1"><T>Commission</T></p>
          <p className="text-lg font-bold text-foreground">{foremanCommissionPercent}%</p>
        </div>
      </div>

      {/* Discount Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-foreground"><T>Discount Percentage</T></label>
          <span className="text-lg font-bold text-secondary">{discount}%</span>
        </div>
        <input
          type="range"
          min={minDiscount}
          max={maxDiscount}
          step="0.1"
          value={discount}
          onChange={(e) => setDiscount(parseFloat(e.target.value))}
          className="w-full h-2 bg-secondary/20 rounded-lg appearance-none cursor-pointer accent-secondary"
          style={{
            background: `linear-gradient(to right, #f97316 0%, #f97316 ${((discount - minDiscount) / (maxDiscount - minDiscount)) * 100}%, #e5e7eb ${((discount - minDiscount) / (maxDiscount - minDiscount)) * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{minDiscount}%</span>
          <span>{maxDiscount}%</span>
        </div>
      </div>

      {/* Month Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-foreground"><T>Simulate Month</T></label>
          <span className="text-lg font-bold text-primary">{month}</span>
        </div>
        <input
          type="range"
          min={1}
          max={durationMonths}
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
          style={{
            background: `linear-gradient(to right, #1e3a8a 0%, #1e3a8a ${((month - 1) / (durationMonths - 1)) * 100}%, #e5e7eb ${((month - 1) / (durationMonths - 1)) * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Month 1</span>
          <span>Month {durationMonths}</span>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-primary/5 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-foreground mb-3"><T>Estimated Results</T></h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground"><T>Monthly Pool</T></p>
              <p className="font-semibold text-foreground">₹{results.monthlyPool?.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-muted-foreground"><T>Commission</T></p>
              <p className="font-semibold text-foreground">₹{results.commission?.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-muted-foreground"><T>Discount Amount</T></p>
              <p className="font-semibold text-foreground">₹{results.discountAmount?.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-muted-foreground"><T>Winning Amount</T></p>
              <p className="font-semibold text-secondary">₹{results.estimatedWinning?.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-muted-foreground"><T>Total Payable</T></p>
              <p className="font-semibold text-foreground">₹{results.totalPayable?.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-muted-foreground"><T>Profit/Loss</T></p>
              <p className={`font-semibold ${results.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{results.profitLoss?.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="pt-3 border-t border-border">
            <p className="text-muted-foreground text-sm">Payout if win in month {month}</p>
            <p className="font-bold text-xl text-secondary">₹{results.monthPayout?.toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
