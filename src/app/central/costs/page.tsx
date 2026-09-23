"use client";

import React, { useState } from "react";
import { useRailPlan } from "@/context/RailPlanContext";
import { CostVarianceChart } from "@/components/charts/CostVarianceChart";
import { formatINR, formatFullINR } from "@/lib/formatters";
import { 
  CurrencyInr, 
  TrendUp, 
  TrendDown, 
  CreditCard, 
  ChartPie, 
  Sparkle, 
  FileText,
  ShieldCheck,
  Check
} from "@phosphor-icons/react";

export default function CentralCostsPage() {
  const { requests, departments } = useRailPlan();

  const totalSanctioned = departments.reduce((acc, d) => acc + d.allocatedBudget, 0);
  const totalActual = departments.reduce((acc, d) => acc + d.usedBudget, 0);
  const totalVariance = totalSanctioned - totalActual;

  // Aggregate 6-Part Costs from active requests
  const aggregateLabour = requests.reduce((acc, r) => acc + r.costBreakdown.labour, 0);
  const aggregateEquipment = requests.reduce((acc, r) => acc + r.costBreakdown.equipment, 0);
  const aggregateMaterial = requests.reduce((acc, r) => acc + r.costBreakdown.material, 0);
  const aggregateLogistics = requests.reduce((acc, r) => acc + r.costBreakdown.logistics, 0);
  const aggregateContingency = requests.reduce((acc, r) => acc + r.costBreakdown.contingency, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#030914] via-[#061526] to-[#0A1F36] border border-emerald-500/25 flex flex-wrap items-center justify-between gap-4 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 px-2 py-0.5 rounded uppercase shadow-[0_0_10px_rgba(16,231,178,0.2)]">
              Central Budget & Accounts
            </span>
            <span className="text-xs text-slate-400 font-mono">Capex & Opex Sanction Authority</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Cost Management & Budget Variance
          </h1>
          <p className="text-xs text-slate-400">
            6-Part expenditure breakdown, variance analysis, contractor billing, and AI predictive cost optimization
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-lg bg-[#030914] border border-emerald-600/60 text-emerald-300 text-xs font-bold font-mono shadow-[0_0_10px_rgba(16,231,178,0.2)]">
            Audited by CAO (Finance)
          </span>
        </div>
      </div>

      {/* 6-Part Macro Cost Breakdown */}
      <div className="p-5 rounded-2xl bg-[#061526]/90 backdrop-blur-md border border-slate-800/80 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            6-Part National Railway Cost Aggregation
          </span>
          <span className="text-xs text-cyan-400 font-mono">Live Work Order Aggregates</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center text-xs">
          <div className="p-3 rounded-xl bg-[#030914]/80 border border-slate-800">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Labour Cost</p>
            <p className="text-base font-extrabold text-slate-100 font-mono mt-1">{formatINR(aggregateLabour)}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#030914]/80 border border-slate-800">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Equipment & Plant</p>
            <p className="text-base font-extrabold text-cyan-300 font-mono mt-1">{formatINR(aggregateEquipment)}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#030914]/80 border border-slate-800">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Material & Rails</p>
            <p className="text-base font-extrabold text-amber-300 font-mono mt-1">{formatINR(aggregateMaterial)}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#030914]/80 border border-slate-800">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Logistics & Haulage</p>
            <p className="text-base font-extrabold text-sky-300 font-mono mt-1">{formatINR(aggregateLogistics)}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#030914]/80 border border-slate-800">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Contingency Fund</p>
            <p className="text-base font-extrabold text-emerald-300 font-mono mt-1">{formatINR(aggregateContingency)}</p>
          </div>
        </div>
      </div>

      {/* Variance Chart */}
      <CostVarianceChart />

      {/* High Cost Projects Table */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#061526]/90 backdrop-blur-md p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            High Cost Maintenance Work Orders & Sanctions
          </span>
          <span className="text-xs text-slate-400 font-mono">Ranked by Expenditure</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-[#030914]/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-300 border-b border-slate-800">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Work Scope</th>
                <th className="p-3">Department</th>
                <th className="p-3">Corridor</th>
                <th className="p-3 font-mono">Estimated Cost</th>
                <th className="p-3 font-mono">Actual Incurred</th>
                <th className="p-3">Variance</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {requests.map((r) => {
                const diff = r.estimatedCost - r.costBreakdown.actualCost;
                return (
                  <tr key={r.id} className="hover:bg-slate-800/50 transition duration-150">
                    <td className="p-3 font-mono font-bold text-cyan-400">{r.id}</td>
                    <td className="p-3 font-semibold text-slate-200">{r.title}</td>
                    <td className="p-3 font-semibold text-slate-300">{r.targetDepartment}</td>
                    <td className="p-3 font-mono text-slate-400">{r.corridorId}</td>
                    <td className="p-3 font-mono font-bold text-slate-200">{formatINR(r.estimatedCost)}</td>
                    <td className="p-3 font-mono font-bold text-cyan-300">
                      {r.costBreakdown.actualCost > 0 ? formatINR(r.costBreakdown.actualCost) : "—"}
                    </td>
                    <td className="p-3 font-mono text-emerald-400 font-semibold">
                      {r.costBreakdown.actualCost > 0 ? formatINR(diff) : "—"}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#030914] text-slate-300 border border-slate-700">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
