"use client";

import React from "react";
import { useRailPlan } from "@/context/RailPlanContext";
import { useAuth } from "@/context/AuthContext";
import { HardHat, Lightning, Broadcast, ShieldCheck } from "@phosphor-icons/react";

export function MultiDirectorateFlowBanner({
  interactive = true,
  onSelectDept,
}: {
  interactive?: boolean;
  onSelectDept?: (deptId: string) => void;
}) {
  const { blockRequests } = useRailPlan();
  const { user, switchUser } = useAuth();

  const directorates = [
    {
      id: "ENG",
      name: "Civil",
      role: "P-Way & Bridges",
      subtitle: "Track Geometry & Structures",
      solidColor: "#2DC7D5",
      textColor: "text-black",
      icon: <HardHat size={28} weight="duotone" className="text-black" />,
      userEmail: "civil@railplan.ai",
    },
    {
      id: "ELEC",
      name: "Electrical",
      role: "25kV Traction & OHE",
      subtitle: "Substations & Catenary",
      solidColor: "#00FFD2",
      textColor: "text-black",
      icon: <Lightning size={28} weight="duotone" className="text-black" />,
      userEmail: "electrical@railplan.ai",
    },
    {
      id: "SNT",
      name: "Signal & Telecom",
      role: "Kavach & Interlocking",
      subtitle: "TCAS Collision Avoidance",
      solidColor: "#6367FF",
      textColor: "text-white",
      icon: <Broadcast size={28} weight="duotone" className="text-white" />,
      userEmail: "signal@railplan.ai",
    },
    {
      id: "SFTY",
      name: "Safety Directorate",
      role: "Statutory Sanctions",
      subtitle: "CRS Compliance & Form T/806",
      solidColor: "#FB2077",
      textColor: "text-white",
      icon: <ShieldCheck size={28} weight="duotone" className="text-white" />,
      userEmail: "safety@railplan.ai",
    },
  ];

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#022642] border-2 border-black shadow-[5px_5px_0_#000000] relative overflow-hidden">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-black/50">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FFFF00] font-mono px-2 py-0.5 rounded bg-[#000D18] border border-black inline-block">
            CRITICAL INTER-DEPARTMENT COORDINATION
          </span>
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-1">
            4 Core Indian Railways Directorates (Joint Synchronization)
          </h3>
        </div>
        <p className="text-xs text-[#CABFFF] font-medium max-w-md hidden md:block text-right">
          Click any directorate to switch operational persona and filter live departmental assets
        </p>
      </div>

      {/* 4 Solid Tactile Directorate Cards Matching Preview Image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {directorates.map((dept) => {
          const isCurrentActiveUser = user?.departmentId === dept.id;
          const deptRequestsCount = blockRequests.filter(
            (r) => r.departmentId === dept.id || r.department.toLowerCase().includes(dept.name.toLowerCase().split("/")[0])
          ).length;

          return (
            <div
              key={dept.id}
              onClick={() => {
                if (interactive) {
                  if (onSelectDept) {
                    onSelectDept(dept.id);
                  } else {
                    switchUser(dept.userEmail);
                  }
                }
              }}
              style={{ backgroundColor: dept.solidColor }}
              className={`p-4 rounded-xl border-2 border-black transition-all cursor-pointer select-none relative ${
                isCurrentActiveUser
                  ? "shadow-[0_1px_0_#000000] translate-y-1 ring-4 ring-[#FFFF00]"
                  : "shadow-[4px_4px_0_#000000] hover:-translate-y-1 hover:shadow-[6px_6px_0_#000000]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className={`text-base font-black tracking-tight leading-tight ${dept.textColor}`}>
                    {dept.name}
                  </h4>
                  <p className={`text-[11px] font-bold opacity-90 mt-0.5 ${dept.textColor}`}>
                    {dept.role}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-black/20 border border-black/40 shrink-0">
                  {dept.icon}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-black/20 flex items-center justify-between text-xs">
                <span className={`text-[10px] font-medium whitespace-normal break-words leading-tight flex-1 mr-1 ${dept.textColor}`}>
                  {dept.subtitle}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-black text-white font-mono shrink-0">
                  {deptRequestsCount} Req
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
