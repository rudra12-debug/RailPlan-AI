"use client";

import React from "react";
import { formatINR } from "@/lib/formatters";
import { useRailPlan } from "@/context/RailPlanContext";

export const CostVarianceChart: React.FC = () => {
  const { departments } = useRailPlan();

  const totalAllocated = departments.reduce((acc, d) => acc + d.allocatedBudget, 0);
  const totalUsed = departments.reduce((acc, d) => acc + d.usedBudget, 0);
  const remaining = totalAllocated - totalUsed;
  const usedPercent = Math.round((totalUsed / totalAllocated) * 100);

  return (
    <div className="rounded-xl border-2 border-black bg-[#022642] p-5 shadow-[4px_4px_0_#000000] space-y-5">
      <div className="flex items-center justify-between pb-3 border-b-2 border-black/40">
        <div>
          <h3 className="font-black text-white text-base">
            National Railway Budget & Expenditure Variance
          </h3>
          <p className="text-xs text-[#8595FF] font-medium">
            FY 2026-27 Capex & Opex Maintenance Utilization
          </p>
        </div>
        <span className="text-xs font-mono font-black text-black bg-[#00FFD2] px-2.5 py-1 rounded border border-black shadow-[1px_1px_0_#000000]">
          {usedPercent}% Utilized
        </span>
      </div>

      {/* High-level summary sunken LED badges */}
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="p-3 rounded-lg bg-[#000D18] border border-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)]">
          <p className="text-[10px] text-[#CABFFF] uppercase font-bold">Total Sanctioned</p>
          <p className="text-sm sm:text-base font-black text-white font-mono mt-0.5">
            {formatINR(totalAllocated)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-[#000D18] border border-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)]">
          <p className="text-[10px] text-[#CABFFF] uppercase font-bold">Actual Utilized</p>
          <p className="text-sm sm:text-base font-black text-[#00FFD2] font-mono mt-0.5">
            {formatINR(totalUsed)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-[#000D18] border border-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)]">
          <p className="text-[10px] text-[#CABFFF] uppercase font-bold">Remaining Funds</p>
          <p className="text-sm sm:text-base font-black text-[#2DC7D5] font-mono mt-0.5">
            {formatINR(remaining)}
          </p>
        </div>
      </div>

      {/* Solid Progress Bar */}
      <div className="space-y-1">
        <div className="w-full bg-[#000D18] h-3.5 rounded-lg overflow-hidden border-2 border-black">
          <div
            className="bg-[#6367FF] h-full transition-all duration-500"
            style={{ width: `${usedPercent}%` }}
          />
        </div>
      </div>

      {/* Department-wise Cost Bars */}
      <div className="space-y-2.5">
        <p className="text-xs font-black text-[#CABFFF] uppercase tracking-wider">
          Department-Wise Spend Comparison
        </p>

        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {departments.map((dept) => {
            const deptPct = Math.round((dept.usedBudget / dept.allocatedBudget) * 100);
            return (
              <div key={dept.id} className="p-3 rounded-lg bg-[#000D18] border border-black space-y-1.5 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-white">{dept.name}</span>
                  <span className="text-[#CABFFF] font-mono">
                    {formatINR(dept.usedBudget)} / {formatINR(dept.allocatedBudget)} ({deptPct}%)
                  </span>
                </div>
                <div className="w-full bg-[#022642] h-2 rounded-full overflow-hidden border border-black">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${deptPct}%`, backgroundColor: dept.color || "#00FFD2" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
