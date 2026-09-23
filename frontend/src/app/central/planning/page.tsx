"use client";

import React, { useState, useMemo } from "react";
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
  Filter, 
  CheckCircle2, 
  Search,
  PlusCircle
} from "lucide-react";
import Link from "next/link";

export default function MaintenancePlanningPage() {
  const { maintenanceTasks, corridors, selectedCorridorId, setSelectedCorridorId, selectedZone } = useRailPlan();

  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const availableCorridors = useMemo(() => {
    const allowed = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    return corridors.filter((c) => allowed.includes(c.id));
  }, [corridors, selectedZone]);

  const isCorridorFiltered = selectedCorridorId !== "ALL";
  const selectedCorridor = corridors.find((c) => c.id === selectedCorridorId) || null;

  const filteredTasks = useMemo(() => {
    const allowed = isCorridorFiltered
      ? [selectedCorridorId]
      : ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];

    return maintenanceTasks.filter((t) => {
      const matchesSearch =
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.assetName.toLowerCase().includes(search.toLowerCase()) ||
        t.locationKm.toLowerCase().includes(search.toLowerCase());

      const matchesDept = selectedDept === "ALL" || t.departmentId === selectedDept;
      const matchesCategory = selectedCategory === "ALL" || t.maintenanceType === selectedCategory;
      const matchesCorridor = allowed.includes(t.corridorId);

      return matchesSearch && matchesDept && matchesCategory && matchesCorridor;
    });
  }, [maintenanceTasks, search, selectedDept, selectedCategory, isCorridorFiltered, selectedCorridorId, selectedZone]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950 via-navy-900 to-navy-950 border border-blue-500/30 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-700 px-2 py-0.5 rounded uppercase">
              Operational Planning
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Master Railway Maintenance Schedule {selectedCorridor ? `• ${selectedCorridor.name}` : `• ${selectedZone.split("(")[0].trim()}`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Master Maintenance Planning Registry
          </h1>
          <p className="text-xs text-slate-400">
            Categorized asset overhauls, ultrasonic flaw scans, catenary sag corrections, and bridge inspections
          </p>
        </div>

        <Link
          href="/department/create-request"
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 text-xs font-bold shadow-glow-cyan flex items-center space-x-1.5 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Work Order</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Asset, Task ID, Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-navy-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Corridor Dropdown */}
          <select
            value={selectedCorridorId}
            onChange={(e) => setSelectedCorridorId(e.target.value)}
            className="bg-navy-950 border border-slate-700 text-cyan-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none font-mono font-bold"
          >
            <option value="ALL">{selectedZone.startsWith("All") ? `All Corridors (${maintenanceTasks.length})` : `All ${selectedZone.split("(")[0].trim()} (${availableCorridors.length})`}</option>
            {availableCorridors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.name.split("(")[0]}
              </option>
            ))}
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-navy-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Directorates</option>
            <option value="ENG">Civil (ENG)</option>
            <option value="ELEC">Electrical/OHE (ELEC)</option>
            <option value="SNT">Signal & Traffic (SNT)</option>
            <option value="SFTY">Safety (SFTY)</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-navy-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Maintenance Types</option>
            <option value="Preventive">Preventive Maintenance</option>
            <option value="Corrective">Corrective Maintenance</option>
            <option value="Periodic Overhaul">Periodic Overhaul</option>
            <option value="USFD Ultrasonic Scan">USFD Ultrasonic Scan</option>
          </select>
        </div>
      </div>

      {/* Maintenance Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="rounded-2xl border border-slate-800 bg-navy-900/90 p-5 space-y-4 hover:border-slate-700 transition flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    {task.id} • {task.departmentId}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 mt-0.5">{task.title}</h3>
                </div>
                <RiskBadge risk={task.riskScore} />
              </div>

              {/* Asset and Location */}
              <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800/80 space-y-1 text-xs text-slate-300">
                <p className="font-semibold text-slate-200 truncate">{task.assetName}</p>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <span className="font-mono">{task.corridorId}</span>
                  <span>•</span>
                  <span className="font-mono">{task.locationKm}</span>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-navy-950 border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-semibold">Recommended Date</p>
                  <p className="font-mono font-bold text-amber-300 mt-0.5">{task.recommendedDate}</p>
                </div>
                <div className="p-2 rounded-lg bg-navy-950 border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-semibold">Estimated Cost</p>
                  <p className="font-mono font-bold text-cyan-300 mt-0.5">{formatINR(task.estimatedCost)}</p>
                </div>
                <div className="p-2 rounded-lg bg-navy-950 border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-semibold">Block Duration</p>
                  <p className="font-mono font-bold text-slate-200 mt-0.5">{task.estimatedDurationHours} Hours</p>
                </div>
                <div className="p-2 rounded-lg bg-navy-950 border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-semibold">Assigned Team</p>
                  <p className="font-semibold text-slate-200 truncate mt-0.5">{task.assignedTeam}</p>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-2 border-t border-slate-800">
              <Link
                href="/department/create-request"
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center space-x-1.5 transition"
              >
                <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sanction Service Request</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
