"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRailPlan, ZONE_CORRIDOR_MAP } from "@/context/RailPlanContext";
import { formatINR } from "@/lib/formatters";
import { RiskBadge } from "@/components/common/StatusBadge";
import { 
  Calendar, 
  Wrench, 
  MapPin, 
  Clock, 
  DollarSign, 
  Sparkles, 
  PlusCircle, 
  Search, 
  CheckCircle2 
} from "lucide-react";
import Link from "next/link";

export default function DepartmentTasksPage() {
  const { user } = useAuth();
  const { maintenanceTasks, selectedCorridorId, selectedZone } = useRailPlan();
  const [search, setSearch] = useState("");

  const currentDeptId = user?.departmentId || "ENG";

  const isCorridorFiltered = selectedCorridorId !== "ALL";
  const allowedZoneCorridors = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];

  const filteredTasks = useMemo(() => {
    return maintenanceTasks.filter((t) => {
      if (t.departmentId !== currentDeptId) return false;

      const matchesCorridor = isCorridorFiltered
        ? t.corridorId === selectedCorridorId
        : allowedZoneCorridors.includes(t.corridorId);

      if (!matchesCorridor) return false;

      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.assetName.toLowerCase().includes(search.toLowerCase()) ||
        t.locationKm.toLowerCase().includes(search.toLowerCase());

      return matchesSearch;
    });
  }, [maintenanceTasks, currentDeptId, isCorridorFiltered, selectedCorridorId, allowedZoneCorridors, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded uppercase">
              {currentDeptId} Schedule
            </span>
            <span className="text-xs text-slate-400 font-mono">Assigned Maintenance Tasks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            My Maintenance Tasks & Overhauls
          </h1>
          <p className="text-xs text-slate-400">
            Work orders assigned to {user?.departmentName || "your department"} across designated corridors
          </p>
        </div>

        <Link
          href="/department/create-request"
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs shadow-glow-cyan flex items-center space-x-2 transition transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Service Request</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Task ID, Asset, Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-navy-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 rounded-2xl bg-navy-900/40 border border-slate-800">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No scheduled maintenance tasks found for {currentDeptId}.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="rounded-2xl border border-slate-800 bg-navy-900/90 p-5 space-y-4 shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                      {task.id} • {task.maintenanceType}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 mt-0.5">{task.title}</h3>
                  </div>
                  <RiskBadge risk={task.riskScore} />
                </div>

                <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-slate-200 truncate">{task.assetName}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{task.corridorId} • {task.locationKm}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-navy-950 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Target Date</p>
                    <p className="font-mono font-bold text-amber-300 mt-0.5">{task.recommendedDate}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-navy-950 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Est. Cost</p>
                    <p className="font-mono font-bold text-cyan-300 mt-0.5">{formatINR(task.estimatedCost)}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <Link
                  href="/department/execution"
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-1 transition"
                >
                  <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Update Work Execution & Milestones</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
