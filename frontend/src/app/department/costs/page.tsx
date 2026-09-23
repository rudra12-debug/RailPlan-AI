"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRailPlan } from "@/context/RailPlanContext";
import { formatINR, formatFullINR } from "@/lib/formatters";
import { DollarSign, TrendingUp, TrendingDown, PieChart, ShieldCheck, FileText } from "lucide-react";

export default function DepartmentCostsPage() {
  const { user } = useAuth();
  const { requests, departments } = useRailPlan();

  const currentDeptId = user?.departmentId || "ENG";
  const deptInfo = departments.find((d) => d.id === currentDeptId) || departments[0];

  const deptRequests = requests.filter(
    (r) => r.requestingDepartment === currentDeptId || r.assignedToDepartment === currentDeptId
  );

  const budgetPct = Math.round((deptInfo.usedBudget / deptInfo.allocatedBudget) * 100);
  const remaining = deptInfo.allocatedBudget - deptInfo.usedBudget;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded uppercase">
              {currentDeptId} Financials
            </span>
            <span className="text-xs text-slate-400 font-mono">Departmental Budget Allocation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            {deptInfo.name} Cost Tracking & Variance
          </h1>
          <p className="text-xs text-slate-400">
            Monitoring approved maintenance budget, active work order expenditure, and remaining sanctioned grant
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400 font-semibold">Budget Utilization</p>
          <p className="text-xl font-extrabold text-cyan-300 font-mono">{budgetPct}%</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 space-y-1 shadow-xl">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sanctioned Grant (FY26)</p>
          <p className="text-2xl font-extrabold text-slate-100 font-mono mt-1">
            {formatFullINR(deptInfo.allocatedBudget)}
          </p>
          <p className="text-[11px] text-slate-400">Approved by Railway Board</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/90 border border-cyan-500/40 space-y-1 shadow-glow-cyan">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actual Incurred (MTD)</p>
          <p className="text-2xl font-extrabold text-cyan-300 font-mono mt-1">
            {formatFullINR(deptInfo.usedBudget)}
          </p>
          <p className="text-[11px] text-cyan-400 font-mono">{budgetPct}% of allocated budget</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/90 border border-emerald-500/40 space-y-1 shadow-glow-emerald">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining Uncommitted</p>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            {formatFullINR(remaining)}
          </p>
          <p className="text-[11px] text-emerald-400 font-mono">Available for new requests</p>
        </div>
      </div>

      {/* Work Orders Cost Table */}
      <div className="rounded-2xl border border-slate-800 bg-navy-900/90 p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {deptInfo.name} Work Order Expenditures
          </span>
          <span className="text-xs text-slate-400 font-mono">{deptRequests.length} Work Orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Title</th>
                <th className="p-3">Target Department</th>
                <th className="p-3 font-mono">Estimated Cost</th>
                <th className="p-3 font-mono">Actual Incurred</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {deptRequests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/50">
                  <td className="p-3 font-mono font-bold text-cyan-400">{r.id}</td>
                  <td className="p-3 font-semibold text-slate-200">{r.title}</td>
                  <td className="p-3 font-semibold">{r.targetDepartment}</td>
                  <td className="p-3 font-mono text-slate-300 font-bold">{formatINR(r.estimatedCost)}</td>
                  <td className="p-3 font-mono text-cyan-300 font-bold">
                    {r.costBreakdown.actualCost > 0 ? formatINR(r.costBreakdown.actualCost) : "—"}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
