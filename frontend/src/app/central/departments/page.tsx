"use client";

import React from "react";
import { useRailPlan } from "@/context/RailPlanContext";
import { formatINR } from "@/lib/formatters";
import { ArrowRight, ShieldCheck, Lightning, Broadcast, HardHat } from "@phosphor-icons/react";
import { MultiDirectorateFlowBanner } from "@/components/common/MultiDirectorateFlowBanner";
import Link from "next/link";

export default function DepartmentsPage() {
  const { departments } = useRailPlan();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#030914] via-[#061526] to-[#0A1F36] border border-cyan-500/25 flex flex-wrap items-center justify-between gap-4 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 px-2 py-0.5 rounded uppercase shadow-[0_0_10px_rgba(16,231,178,0.2)]">
              Core Directorate Network
            </span>
            <span className="text-xs text-slate-400 font-mono">4 Interconnected Engineering & Safety Directorates</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Department Performance & Cross-Directorate Allocation Matrix
          </h1>
          <p className="text-xs text-slate-400">
            Real-time synchronization between Civil, Electrical/OHE, Signal & Traffic, and Safety directorates
          </p>
        </div>
      </div>

      {/* Visual Multi-Directorate Flow Banner */}
      <MultiDirectorateFlowBanner />

      {/* Grid of 4 Core Directorates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {departments.map((dept) => {
          const budgetPct = Math.round((dept.usedBudget / dept.allocatedBudget) * 100);
          const workforcePct = Math.round((dept.workforceActive / dept.workforceTotal) * 100);

          return (
            <div
              key={dept.id}
              className="rounded-2xl border border-slate-800/80 bg-[#061526]/90 backdrop-blur-md p-5 space-y-4 shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 border-black shadow-[2px_2px_0_#000000]"
                      style={{
                        backgroundColor: dept.color,
                        color: dept.id === "ENG" || dept.id === "ELEC" ? "#000000" : "#FFFFFF",
                      }}
                    >
                      {dept.id === "ENG" && <HardHat size={22} weight="duotone" />}
                      {dept.id === "ELEC" && <Lightning size={22} weight="duotone" />}
                      {dept.id === "SNT" && <Broadcast size={22} weight="duotone" />}
                      {dept.id === "SFTY" && <ShieldCheck size={22} weight="duotone" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-black text-white leading-tight break-words whitespace-normal">{dept.name}</h3>
                      <p className="text-[11px] text-[#CABFFF] font-medium mt-0.5">Head: {dept.headName}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-xs font-mono font-black bg-[#00FFD2] text-black border border-black shadow-[1px_1px_0_#000000] shrink-0 ml-2">
                    {dept.performanceScore}% Score
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{dept.description}</p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-[#030914]/80 border border-slate-800">
                    <p className="text-[10px] text-slate-400 font-semibold">Active Tasks</p>
                    <p className="text-sm font-bold text-cyan-300 font-mono mt-0.5">{dept.activeTasks}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#030914]/80 border border-slate-800">
                    <p className="text-[10px] text-slate-400 font-semibold">Pending Requests</p>
                    <p className="text-sm font-bold text-amber-400 font-mono mt-0.5">{dept.pendingRequests}</p>
                  </div>
                </div>

                {/* Budget Utilization bar */}
                <div className="p-2.5 rounded-lg bg-[#030914]/80 border border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold">Budget Spend</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {formatINR(dept.usedBudget)} / {formatINR(dept.allocatedBudget)} ({budgetPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#040D1A] h-1.5 rounded-full overflow-hidden border border-slate-800/60">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${budgetPct}%`, backgroundColor: dept.color }}
                    />
                  </div>
                </div>

                {/* Workforce bar */}
                <div className="p-2.5 rounded-lg bg-[#030914]/80 border border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold">Workforce Deployed</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {dept.workforceActive} / {dept.workforceTotal} Staff ({workforcePct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#040D1A] h-1.5 rounded-full overflow-hidden border border-slate-800/60">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{ width: `${workforcePct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <Link
                  href={`/central/costs`}
                  className="w-full py-2 rounded-lg bg-[#030914] hover:bg-[#07192C] border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center space-x-1.5 transition"
                >
                  <span>View Financial & Resource Audit</span>
                  <ArrowRight size={14} weight="bold" className="text-cyan-400" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
