import React, { useState } from 'react';
import { TrendingUp, Calculator, Check, Edit2 } from 'lucide-react';
import { Field } from '../lib/types';

interface FinancialROICardProps {
  field: Field;
}

export const FinancialROICard: React.FC<FinancialROICardProps> = ({ field }) => {
  const acreageNum = Number(field.acreage) || 1;

  // Expense baselines per acre (in INR ₹)
  const [seedsCost, setSeedsCost] = useState(3500 * acreageNum);
  const [fertilizerCost, setFertilizerCost] = useState(6500 * acreageNum);
  const [laborCost, setLaborCost] = useState(5000 * acreageNum);
  const [irrigationCost, setIrrigationCost] = useState(3000 * acreageNum);
  const [isEditing, setIsEditing] = useState(false);

  // Projections
  const estimatedQuintalsPerAcre = field.crop_type.toLowerCase().includes('chilli') ? 18 : 22;
  const estimatedMandiPricePerQuintal = field.crop_type.toLowerCase().includes('chilli') ? 18450 : 2500;

  const totalExpenses = seedsCost + fertilizerCost + laborCost + irrigationCost;
  const projectedYieldQuintals = estimatedQuintalsPerAcre * acreageNum;
  const projectedRevenue = projectedYieldQuintals * estimatedMandiPricePerQuintal;
  const projectedProfit = projectedRevenue - totalExpenses;
  const roiPercentage = totalExpenses > 0 ? ((projectedProfit / totalExpenses) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-md space-y-4 text-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-base">Crop Financial ROI &amp; Yield Projections</h4>
            <p className="text-xs text-slate-500 font-semibold">{field.acreage} Acres Plot Economics</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[40px] shadow-xs"
        >
          {isEditing ? <Check className="w-4 h-4 text-emerald-400" /> : <Edit2 className="w-4 h-4 text-slate-300" />}
          <span>{isEditing ? 'Save Input Costs' : 'Edit Expenses'}</span>
        </button>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-inner">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Investment</span>
          <span className="text-xl font-black text-white mt-1 block">₹{totalExpenses.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">₹{Math.round(totalExpenses / acreageNum).toLocaleString()} / Acre</span>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-inner">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Projected Yield</span>
          <span className="text-xl font-black text-emerald-400 mt-1 block">
            {projectedYieldQuintals} <span className="text-xs text-slate-400 font-normal">Quintals</span>
          </span>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">{estimatedQuintalsPerAcre} Qtl / Acre avg</span>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-emerald-500/40 shadow-inner">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Projected Net ROI</span>
          <span className="text-xl font-black text-emerald-300 mt-1 block flex items-center gap-1">
            +{roiPercentage}% <TrendingUp className="w-4 h-4 text-emerald-400" />
          </span>
          <span className="text-[10px] text-emerald-400 font-bold mt-0.5 block">₹{projectedProfit.toLocaleString()} Net Profit</span>
        </div>
      </div>

      {/* Expense Edit Form or Breakdown */}
      {isEditing ? (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
          <h5 className="font-extrabold text-slate-900">Adjust Plot Expenses (INR ₹)</h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-600 text-[10px] uppercase font-bold mb-1">Seeds &amp; Nursery</label>
              <input
                type="number"
                value={seedsCost}
                onChange={(e) => setSeedsCost(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-bold outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-slate-600 text-[10px] uppercase font-bold mb-1">Fertilizer &amp; Spray</label>
              <input
                type="number"
                value={fertilizerCost}
                onChange={(e) => setFertilizerCost(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-bold outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-slate-600 text-[10px] uppercase font-bold mb-1">Labor &amp; Sowing</label>
              <input
                type="number"
                value={laborCost}
                onChange={(e) => setLaborCost(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-bold outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-slate-600 text-[10px] uppercase font-bold mb-1">Irrigation &amp; Power</label>
              <input
                type="number"
                value={irrigationCost}
                onChange={(e) => setIrrigationCost(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-bold outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 p-3.5 rounded-2xl border border-slate-200 text-xs flex items-center justify-between flex-wrap gap-2 text-slate-700 font-semibold">
          <div>Seeds: <strong className="text-slate-900 font-black">₹{seedsCost.toLocaleString()}</strong></div>
          <div>Fertilizers: <strong className="text-slate-900 font-black">₹{fertilizerCost.toLocaleString()}</strong></div>
          <div>Labor: <strong className="text-slate-900 font-black">₹{laborCost.toLocaleString()}</strong></div>
          <div>Irrigation: <strong className="text-slate-900 font-black">₹{irrigationCost.toLocaleString()}</strong></div>
        </div>
      )}
    </div>
  );
};
