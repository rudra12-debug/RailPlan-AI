"use client";

import React, { useState } from "react";
import { useRailPlan } from "@/context/RailPlanContext";
import { ResourceItem, DepartmentId } from "@/lib/types";
import { 
  Cpu, 
  Users, 
  Wrench, 
  MapPin, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Search, 
  ShieldCheck,
  Plus,
  Truck,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Radio,
  Layers
} from "lucide-react";
import { Modal } from "@/components/common/Modal";
import Link from "next/link";

export default function CentralResourcesPage() {
  const { resources, allocateResource, corridors, departments } = useRailPlan();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "WORKFORCE" | "EQUIPMENT" | "ASSIGNED">("ALL");
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const [targetDept, setTargetDept] = useState<DepartmentId>("ENG");
  const [targetCorridor, setTargetCorridor] = useState<string>("NDLS-MMCT");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtered resources
  const filtered = resources.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase()) ||
      r.departmentId.toLowerCase().includes(search.toLowerCase()) ||
      (r.currentTask && r.currentTask.toLowerCase().includes(search.toLowerCase()));
    
    if (filterType === "ALL") return matchesSearch;
    if (filterType === "ASSIGNED") return matchesSearch && (r.status === "ASSIGNED" || !!r.currentTask);
    return matchesSearch && r.category === filterType;
  });

  const bookedResources = resources.filter((r) => r.status === "ASSIGNED" || !!r.currentTask);
  const availableResources = resources.filter((r) => r.status === "AVAILABLE");
  const totalFleetCount = resources.length;
  const avgUtilization = Math.round(
    resources.reduce((acc, curr) => acc + (curr.utilizationRate || 0), 0) / (resources.length || 1)
  );

  const handleOpenAllocate = (res: ResourceItem) => {
    setSelectedResource(res);
    setTargetDept(res.departmentId);
    setTargetCorridor(res.assignedCorridor || "NDLS-MMCT");
    setIsModalOpen(true);
  };

  const handleConfirmAllocate = () => {
    if (selectedResource) {
      allocateResource(selectedResource.id, targetDept, targetCorridor);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with National Rail Theme */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700 px-2 py-0.5 rounded uppercase">
              Railway Board Logistics Directorate
            </span>
            <span className="text-xs text-slate-400 font-mono">Central Fleet & Inter-Department Machinery Pool</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Central Resource Allocation & Standby Roster
          </h1>
          <p className="text-xs text-slate-400">
            Real-time tracking of Plasser tamping machines, 140T breakdown cranes, USFD rail testing cars, and specialized departmental gangs
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs font-mono font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Auto-Booking: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Fleet KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Fleet & Squads</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-extrabold text-slate-100 font-mono">{totalFleetCount}</p>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">All 4 Railway Directorates</p>
        </div>

        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Bookings & Standby</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-extrabold text-amber-400 font-mono">{bookedResources.length}</p>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-amber-300">Committed to Approved Blocks</p>
        </div>

        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Available on Standby</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-extrabold text-emerald-400 font-mono">{availableResources.length}</p>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">Ready for Immediate Sanction</p>
        </div>

        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fleet Utilization Rate</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-extrabold text-cyan-400 font-mono">{avgUtilization}%</p>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">Optimized Deployment Load</p>
        </div>
      </div>

      {/* Active Resource Bookings & Deployment Standby Schedule */}
      <div className="p-5 rounded-2xl bg-navy-950 border border-amber-500/30 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Active Resource Bookings & Deployment Standby Schedule</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700">
                  {bookedResources.length} Reserved
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Machinery and workforce automatically booked upon Central Admin approval of Service Requests
              </p>
            </div>
          </div>

          <Link
            href="/central/approvals"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
          >
            <span>View Sanction Center</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {bookedResources.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No active resource bookings currently pending mobilization. Resources will auto-reserve when new Service Requests are approved.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {bookedResources.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-xl bg-navy-900 border border-amber-600/30 space-y-3 shadow-md hover:border-amber-500/60 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-slate-800 text-amber-400 border border-slate-700">
                      {res.category === "EQUIPMENT" ? <Cpu className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        {res.id} • {res.departmentId}
                      </span>
                      <h3 className="text-xs font-bold text-slate-100">{res.name}</h3>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700 uppercase">
                    MANDATORY STANDBY
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 space-y-1 text-xs">
                  <div className="text-slate-400 text-[11px]">Sanctioned Allocation & Standby:</div>
                  <p className="text-xs font-mono font-semibold text-amber-300 leading-snug">
                    {res.currentTask || "Sanctioned for scheduled track maintenance"}
                  </p>
                  <div className="flex justify-between items-center pt-1 text-[11px] text-slate-400 border-t border-slate-800/80 mt-1">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{res.assignedCorridor || "NDLS-MMCT"}</span>
                    </span>
                    <span className="font-mono text-cyan-300 font-bold">{res.utilizationRate}% Utilized</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    Lead: <strong className="text-slate-200">{res.operatorOrLead || "Assigned Crew"}</strong>
                  </span>
                  <button
                    onClick={() => handleOpenAllocate(res)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition flex items-center space-x-1"
                  >
                    <Wrench className="w-3 h-3 text-cyan-400" />
                    <span>Reassign</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search and Filters for Complete Fleet */}
      <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Machinery, Crew Gangs, Dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-navy-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500 w-64"
          />
        </div>

        <div className="flex space-x-2 bg-navy-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1 rounded-md font-medium transition ${
              filterType === "ALL" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-400"
            }`}
          >
            All Resources ({resources.length})
          </button>
          <button
            onClick={() => setFilterType("ASSIGNED")}
            className={`px-3 py-1 rounded-md font-medium transition ${
              filterType === "ASSIGNED" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-400"
            }`}
          >
            Booked Standby ({bookedResources.length})
          </button>
          <button
            onClick={() => setFilterType("EQUIPMENT")}
            className={`px-3 py-1 rounded-md font-medium transition ${
              filterType === "EQUIPMENT" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-400"
            }`}
          >
            Heavy Machines
          </button>
          <button
            onClick={() => setFilterType("WORKFORCE")}
            className={`px-3 py-1 rounded-md font-medium transition ${
              filterType === "WORKFORCE" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-400"
            }`}
          >
            Workforce Crews
          </button>
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((res) => {
          const isAvailable = res.status === "AVAILABLE";

          return (
            <div
              key={res.id}
              className="rounded-2xl border border-slate-800 bg-navy-900/90 p-5 space-y-4 shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
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
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                        {res.id} • {res.type}
                      </span>
                      <h3 className="text-sm font-bold text-slate-100 mt-0.5">{res.name}</h3>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono border ${
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
                    <span className="text-slate-400">Department Custody:</span>
                    <span className="font-bold text-amber-300">{res.departmentId} Directorate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Station / Base Depot:</span>
                    <span className="font-mono text-slate-200">{res.assignedCorridor || "Central Logistics Hub"}</span>
                  </div>
                  {res.operatorOrLead && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Crew / Lead Officer:</span>
                      <span className="text-slate-200">{res.operatorOrLead}</span>
                    </div>
                  )}
                  {res.currentTask && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sanctioned Standby:</span>
                      <span className="font-mono text-amber-300">{res.currentTask}</span>
                    </div>
                  )}
                </div>

                {/* Health & Utilization */}
                <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800/80 space-y-1 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold">{res.healthOrSkillLevel}</span>
                    <span className="font-mono text-cyan-400 font-bold">{res.utilizationRate}% Utilized</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${res.utilizationRate}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleOpenAllocate(res)}
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center space-x-1.5 transition"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reallocate / Transfer Resource</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Allocation */}
      {selectedResource && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Reallocate Resource: ${selectedResource.name}`}
          subtitle={`Current Directorate: ${selectedResource.departmentId} | Status: ${selectedResource.status}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Assign to Directorate
              </label>
              <select
                value={targetDept}
                onChange={(e) => setTargetDept(e.target.value as DepartmentId)}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Deploy to Corridor
              </label>
              <select
                value={targetCorridor}
                onChange={(e) => setTargetCorridor(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
              >
                {corridors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-400 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAllocate}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold rounded-lg text-xs transition"
              >
                Sanction Allocation
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
