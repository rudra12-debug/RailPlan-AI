"use client";

import React, { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRailPlan, ZONE_CORRIDOR_MAP } from "@/context/RailPlanContext";
import { KpiCard } from "@/components/common/KpiCard";
import { RequestTable } from "@/components/requests/RequestTable";
import { formatINR } from "@/lib/formatters";
import { 
  Building2, 
  Calendar, 
  Clock, 
  Layers, 
  CheckCircle2, 
  DollarSign, 
  Users, 
  Cpu, 
  Sparkles, 
  PlusCircle, 
  ArrowRight, 
  Wrench, 
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import Link from "next/link";

export default function DepartmentDashboardPage() {
  const { user } = useAuth();
  const { 
    requests, 
    maintenanceTasks, 
    departments, 
    aiRecommendations, 
    resources,
    selectedCorridorId,
    setSelectedCorridorId,
    selectedZone,
    setSelectedZone,
    corridors
  } = useRailPlan();

  const currentDeptId = user?.departmentId || "ENG";
  const deptInfo = departments.find((d) => d.id === currentDeptId) || departments[0];

  const availableCorridors = useMemo(() => {
    const allowed = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    return corridors.filter((c) => allowed.includes(c.id));
  }, [corridors, selectedZone]);

  const isCorridorFiltered = selectedCorridorId !== "ALL";
  const isZoneFiltered = !selectedZone.startsWith("All") && selectedZone !== "ALL";
  const selectedCorridor = corridors.find((c) => c.id === selectedCorridorId) || null;

  // Isolated data filtering for this department and selected corridor / zone
  const deptTasks = useMemo(() => {
    const allowed = isCorridorFiltered
      ? [selectedCorridorId]
      : ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    return maintenanceTasks.filter(
      (t) => t.departmentId === currentDeptId && allowed.includes(t.corridorId)
    );
  }, [maintenanceTasks, currentDeptId, isCorridorFiltered, selectedCorridorId, selectedZone]);

  const deptRequests = useMemo(() => {
    const allowed = isCorridorFiltered
      ? [selectedCorridorId]
      : ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    return requests.filter(
      (r) =>
        (r.requestingDepartment === currentDeptId ||
         r.targetDepartment === currentDeptId ||
         r.assignedToDepartment === currentDeptId) &&
        allowed.includes(r.corridorId)
    );
  }, [requests, currentDeptId, isCorridorFiltered, selectedCorridorId, selectedZone]);

  const pendingApprovals = deptRequests.filter((r) => r.status === "UNDER_REVIEW" || r.status === "SUBMITTED").length;
  const approvedRequests = deptRequests.filter((r) => r.status === "APPROVED" || r.status === "ASSIGNED").length;
  const inProgressRequests = deptRequests.filter((r) => r.status === "IN_PROGRESS").length;
  const completedRequests = deptRequests.filter((r) => r.status === "COMPLETED" || r.status === "CLOSED").length;

  const deptResources = resources.filter((r) => r.departmentId === currentDeptId);
  const deptAiRecs = aiRecommendations.filter((r) => r.departmentId === currentDeptId);

  const budgetPct = Math.round((deptInfo.usedBudget / deptInfo.allocatedBudget) * 100);
  const workforcePct = Math.round((deptInfo.workforceActive / deptInfo.workforceTotal) * 100);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-950 via-[#0B1E3B] to-navy-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-gov-card relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF671F] via-[#FFFFFF] to-[#046A38] opacity-80" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center space-x-2">
            <span
              className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase tracking-wider bg-slate-900 text-amber-300 border border-amber-600/70"
            >
              {deptInfo.code} Directorate
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Zone: {selectedZone.split("(")[0].trim()} • Division: {user?.division}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            {deptInfo.name} Command Center
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            {deptInfo.description}
          </p>
        </div>

        <div className="flex items-center space-x-3 relative z-10 w-full sm:w-auto">
          <Link
            href="/department/create-request"
            className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-gov flex items-center space-x-2 transition transform active:scale-95 border border-amber-400/40"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Service Request</span>
          </Link>
        </div>
      </div>

      {/* Corridor & Zone Filter Quick Bar */}
      <div className="p-4 rounded-2xl bg-navy-900/90 border border-slate-700/80 shadow-gov flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {isCorridorFiltered ? "Department Corridor View:" : isZoneFiltered ? "Department Zone View:" : "Department Filter (All Corridors):"}
              </span>
              {selectedCorridor ? (
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                  {selectedCorridor.id}
                </span>
              ) : isZoneFiltered ? (
                <span className="text-xs font-mono font-bold text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                  {selectedZone.split("(")[0].trim()}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {selectedCorridor
                ? `${selectedCorridor.name} • ${deptTasks.length} tasks and ${deptRequests.length} requests on this corridor`
                : isZoneFiltered
                ? `Showing ${deptTasks.length} tasks and ${deptRequests.length} requests across ${availableCorridors.length} corridors in ${selectedZone}`
                : `Showing all ${deptInfo.name} activities across all national routes (${deptTasks.length} tasks, ${deptRequests.length} requests)`}
            </p>
          </div>
        </div>

        {/* Quick Corridor Selection Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCorridorId("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition flex items-center space-x-1.5 ${
              selectedCorridorId === "ALL"
                ? "bg-amber-500 text-navy-950 shadow-sm font-black"
                : "bg-navy-950 border border-slate-700 text-slate-300 hover:border-slate-500"
            }`}
          >
            <span>{isZoneFiltered ? `All ${selectedZone.split("(")[0].trim()} (${availableCorridors.length})` : "All Corridors"}</span>
          </button>

          {availableCorridors.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCorridorId(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition flex items-center space-x-1.5 ${
                selectedCorridorId === c.id
                  ? "bg-amber-500 text-navy-950 shadow-sm font-black"
                  : "bg-navy-950 border border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
            >
              <span>{c.id}</span>
            </button>
          ))}

          {(isCorridorFiltered || isZoneFiltered) && (
            <button
              onClick={() => {
                setSelectedZone("All Zones (National OCC)");
                setSelectedCorridorId("ALL");
              }}
              title="Reset All Filters"
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 flex items-center space-x-1 transition"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metrics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            {deptInfo.code} {isCorridorFiltered ? `Metrics on ${selectedCorridorId}` : "Operational Metrics & Utilization"}
          </h2>
          <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {isCorridorFiltered ? `Corridor ${selectedCorridorId} Filtered` : "Strict Data Isolation Active"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <KpiCard
            title="Active Tasks"
            value={deptTasks.length}
            subtitle={isCorridorFiltered ? `On ${selectedCorridorId}` : "Scheduled Works"}
            icon={Layers}
            color="blue"
          />
          <KpiCard
            title="Pending Requests"
            value={pendingApprovals}
            subtitle="Awaiting Sanction"
            icon={Clock}
            color="amber"
          />
          <KpiCard
            title="In Progress"
            value={inProgressRequests}
            subtitle="Execution Active"
            icon={Wrench}
            color="orange"
          />
          <KpiCard
            title="Completed (MTD)"
            value={completedRequests}
            subtitle="Closed Orders"
            icon={CheckCircle2}
            color="emerald"
          />
          <KpiCard
            title="Budget Used"
            value={formatINR(deptInfo.usedBudget)}
            subtitle={`${budgetPct}% of ${formatINR(deptInfo.allocatedBudget)}`}
            icon={DollarSign}
            color="amber"
          />
          <KpiCard
            title="Workforce Deployed"
            value={`${deptInfo.workforceActive}`}
            subtitle={`${workforcePct}% of ${deptInfo.workforceTotal} Active`}
            icon={Users}
            color="blue"
          />
        </div>
      </div>

      {/* Department AI Recommendations Banner */}
      {deptAiRecs.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#0E1C38] border border-blue-700/50 shadow-gov-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>AI Predictive Recommendation for {deptInfo.name}</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-300 bg-blue-950/80 px-2.5 py-0.5 rounded border border-blue-700/60">
              Confidence Score: {deptAiRecs[0].confidenceScore}%
            </span>
          </div>

          <div className="bg-navy-950/90 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <h4 className="text-sm font-bold text-slate-100">{deptAiRecs[0].title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{deptAiRecs[0].description}</p>
              <p className="text-[11px] text-amber-400 font-mono mt-1">
                Suggested Action: {deptAiRecs[0].suggestedAction}
              </p>
            </div>

            <Link
              href="/department/create-request"
              className="px-4 py-2 rounded-lg bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs shadow-gov flex items-center space-x-1.5 transition shrink-0 border border-blue-500/40"
            >
              <span>Act on Recommendation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Two Column Grid: Budget Breakdown & Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Department Budget Variance */}
        <div className="rounded-2xl border border-slate-800 bg-navy-900/90 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {deptInfo.name} Budget Utilization
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">{budgetPct}% Spent</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Allocated Grant</p>
              <p className="text-base font-extrabold text-slate-100 font-mono mt-1">
                {formatINR(deptInfo.allocatedBudget)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Actual Incurred</p>
              <p className="text-base font-extrabold text-cyan-300 font-mono mt-1">
                {formatINR(deptInfo.usedBudget)}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${budgetPct}%`, backgroundColor: deptInfo.color }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>₹0</span>
              <span>Remaining: {formatINR(deptInfo.allocatedBudget - deptInfo.usedBudget)}</span>
            </div>
          </div>
        </div>

        {/* Right: Department Machinery & Gangs */}
        <div className="rounded-2xl border border-slate-800 bg-navy-900/90 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Assigned Machinery & Squads
            </span>
            <Link href="/department/resources" className="text-xs text-cyan-400 hover:underline">
              View All ➔
            </Link>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {deptResources.map((res) => (
              <div
                key={res.id}
                className="p-2.5 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-slate-200 truncate">{res.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{res.type}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                  {res.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Requests Table */}
      <RequestTable
        requests={deptRequests}
        title={`${deptInfo.name} Service Requests`}
        subtitle="Tracking internal requests and assigned work orders for this department"
      />
    </div>
  );
}
