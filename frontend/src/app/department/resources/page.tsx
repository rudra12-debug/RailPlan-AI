"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRailPlan } from "@/context/RailPlanContext";
import { 
  Users, 
  Cpu, 
  Wrench, 
  MapPin, 
  PlusCircle, 
  Search,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  Radio,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

export default function DepartmentResourcesPage() {
  const { user } = useAuth();
  const { resources, requests } = useRailPlan();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "ASSIGNED" | "AVAILABLE" | "EQUIPMENT" | "WORKFORCE">("ALL");

  const currentDeptId = user?.departmentId || "ENG";
  const myResources = resources.filter((r) => r.departmentId === currentDeptId);

  const bookedMyResources = myResources.filter((r) => r.status === "ASSIGNED" || !!r.currentTask);

  const filtered = myResources.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase()) ||
      (r.currentTask && r.currentTask.toLowerCase().includes(search.toLowerCase()));

    if (filterType === "ALL") return matchesSearch;
    if (filterType === "ASSIGNED") return matchesSearch && (r.status === "ASSIGNED" || !!r.currentTask);
    if (filterType === "AVAILABLE") return matchesSearch && r.status === "AVAILABLE";
    return matchesSearch && r.category === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700 px-2 py-0.5 rounded uppercase">
              {currentDeptId} Directorate Roster
            </span>
            <span className="text-xs text-slate-400 font-mono">Machinery, Gangs & Mobile Workstations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Department Fleet & Resource Rosters
          </h1>
          <p className="text-xs text-slate-400">
            Certified engineers, specialized heavy track machines, emergency breakdown cranes, and mobile inspection vehicles
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/department/create-request"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs flex items-center space-x-2 transition shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Requisition Additional Machinery</span>
          </Link>
        </div>
      </div>

      {/* Standby & Active Booking Orders Alert Section */}
      {bookedMyResources.length > 0 && (
        <div className="p-5 rounded-2xl bg-navy-950 border border-amber-500/40 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                  <span>Central Sanction Resource Booking Orders</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700">
                    {bookedMyResources.length} Standby Orders
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Resources committed by Railway Board Central Sanction. Ensure team & equipment are mobilized by the designated time.
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700/60 px-2.5 py-1 rounded-md flex items-center space-x-1.5">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>STANDBY ENGAGED</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {bookedMyResources.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-xl bg-navy-900 border border-amber-500/30 space-y-2.5 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      {res.id} • {res.type}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">{res.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700 uppercase">
                    STANDBY LOCKED
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-400 text-[11px]">Sanction Deployment Order:</div>
                  <p className="text-xs font-mono font-semibold text-amber-300 leading-snug">
                    {res.currentTask || "Reserved for approved service request"}
                  </p>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 mt-1">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{res.assignedCorridor || "Base Corridor"}</span>
                    </span>
                    <span className="font-mono text-cyan-300 font-bold">{res.utilizationRate}% Load</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Machinery, Crews, Operators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-navy-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex space-x-2 bg-navy-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1 rounded-md font-medium transition ${
              filterType === "ALL" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-400"
            }`}
          >
            All ({myResources.length})
          </button>
          <button
            onClick={() => setFilterType("ASSIGNED")}
            className={`px-3 py-1 rounded-md font-medium transition ${
              filterType === "ASSIGNED" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-400"
            }`}
          >
            Standby / Booked ({bookedMyResources.length})
          </button>
          <button
            onClick={() => setFilterType("AVAILABLE")}
            className={`px-3 py-1 rounded-md font-medium transition ${
              filterType === "AVAILABLE" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-400"
            }`}
          >
            Available ({myResources.filter((r) => r.status === "AVAILABLE").length})
          </button>
          <button
            onClick={() => setFilterType("EQUIPMENT")}
            className={`px-3 py-1 rounded-md font-medium transition ${
              filterType === "EQUIPMENT" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-400"
            }`}
          >
            Machinery
          </button>
          <button
            onClick={() => setFilterType("WORKFORCE")}
            className={`px-3 py-1 rounded-md font-medium transition ${
              filterType === "WORKFORCE" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-400"
            }`}
          >
            Crews
          </button>
        </div>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((res) => {
          const isAvailable = res.status === "AVAILABLE";

          return (
            <div
              key={res.id}
              className="rounded-2xl border border-slate-800 bg-navy-900/90 p-5 space-y-4 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        res.category === "EQUIPMENT"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                      }`}
                    >
                      {res.category === "EQUIPMENT" ? <Cpu className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        {res.id} • {res.type}
                      </span>
                      <h3 className="text-sm font-bold text-slate-100 mt-0.5">{res.name}</h3>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                      isAvailable
                        ? "bg-emerald-950 text-emerald-400 border-emerald-700"
                        : "bg-amber-950 text-amber-400 border-amber-700"
                    }`}
                  >
                    {res.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deployed Corridor:</span>
                    <span className="font-mono text-slate-200">{res.assignedCorridor || "Base Depot"}</span>
                  </div>
                  {res.operatorOrLead && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Supervisor / Lead:</span>
                      <span className="text-slate-200">{res.operatorOrLead}</span>
                    </div>
                  )}
                  {res.currentTask && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Task Allocation:</span>
                      <span className="font-mono text-amber-300">{res.currentTask}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Certification / Health:</span>
                    <span className="text-cyan-300 font-semibold">{res.healthOrSkillLevel}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Utilization Rate</span>
                    <span className="font-mono text-cyan-400 font-bold">{res.utilizationRate}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${res.utilizationRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
