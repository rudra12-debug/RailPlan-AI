"use client";

import React from "react";
import { useRailPlan } from "@/context/RailPlanContext";
import { HardHat, Lightning, Broadcast, ShieldCheck, Stack } from "@phosphor-icons/react";

export const DeptWorkloadChart: React.FC = () => {
  const { departments } = useRailPlan();

  const getDeptIconAndStyle = (id: string, color?: string) => {
    switch (id) {
      case "ENG":
      case "CIVIL":
      case "TRK":
        return {
          icon: <HardHat size={22} weight="duotone" className="text-black shrink-0" />,
          bg: "bg-[#2DC7D5]",
          text: "text-black",
          scoreBg: "bg-[#2DC7D5] text-black",
        };
      case "ELEC":
        return {
          icon: <Lightning size={22} weight="duotone" className="text-black shrink-0" />,
          bg: "bg-[#00FFD2]",
          text: "text-black",
          scoreBg: "bg-[#00FFD2] text-black",
        };
      case "SNT":
        return {
          icon: <Broadcast size={22} weight="duotone" className="text-white shrink-0" />,
          bg: "bg-[#6367FF]",
          text: "text-white",
          scoreBg: "bg-[#6367FF] text-white",
        };
      case "SFTY":
        return {
          icon: <ShieldCheck size={22} weight="duotone" className="text-white shrink-0" />,
          bg: "bg-[#FB2077]",
          text: "text-white",
          scoreBg: "bg-[#FB2077] text-white",
        };
      default:
        return {
          icon: <Stack size={22} weight="duotone" className="text-black shrink-0" />,
          bg: color ? `bg-[${color}]` : "bg-[#00FFD2]",
          text: "text-black",
          scoreBg: "bg-[#00FFD2] text-black",
        };
    }
  };

  return (
    <div className="rounded-xl border-2 border-black bg-[#022642] p-5 shadow-[4px_4px_0_#000000] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b-2 border-black/40">
        <div>
          <h3 className="font-black text-white text-base">
            Department Workload & Performance Index
          </h3>
          <p className="text-xs text-[#8595FF] font-medium">
            Active maintenance tasks vs resource workforce utilization
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {departments.map((dept) => {
          const workforceUtil = Math.round((dept.workforceActive / dept.workforceTotal) * 100);
          const style = getDeptIconAndStyle(dept.id, dept.color);

          return (
            <div
              key={dept.id}
              className="p-3.5 rounded-xl bg-[#000D18] border-2 border-black flex items-center justify-between gap-3 sm:gap-4 shadow-[2px_2px_0_#000000] hover:translate-x-0.5 transition"
            >
              {/* Left Section: 3D Dedicated Icon + Full Department Name & Metrics */}
              <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                {/* 3D Tactile Icon Module (Never overlaps - proper fixed size) */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border-2 border-black shadow-[2px_2px_0_#000000] ${style.bg}`}
                >
                  {style.icon}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Full Name - 100% visible, no truncate, no dot-dot */}
                  <h4 className="text-xs sm:text-sm font-black text-white leading-tight break-words whitespace-normal">
                    {dept.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#CABFFF] mt-1">
                    <span>
                      Active Tasks:{" "}
                      <b className="text-[#00FFD2] font-mono font-black">{dept.activeTasks}</b>
                    </span>
                    <span>
                      Pending:{" "}
                      <b className="text-[#FFFF00] font-mono font-black">{dept.pendingRequests}</b>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section: Performance Score & Workforce Utilization */}
              <div className="flex items-center space-x-3 sm:space-x-4 shrink-0 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-[#CABFFF] font-bold uppercase tracking-wider">
                    Workforce
                  </p>
                  <p className="text-xs font-mono font-black text-white mt-0.5">
                    {workforceUtil}% Utilized
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#CABFFF] font-bold uppercase tracking-wider">
                    Score
                  </p>
                  <span
                    className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-black border border-black shadow-[1px_1px_0_#000000] mt-0.5 ${style.scoreBg}`}
                  >
                    {dept.performanceScore}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
