"use client";

import React, { useState, useMemo } from "react";
import { useRailPlan, ZONE_CORRIDOR_MAP } from "@/context/RailPlanContext";
import { KpiCard } from "@/components/common/KpiCard";
import { LiveCorridorMap } from "@/components/map/LiveCorridorMap";
import { TrackOccupancyGantt } from "@/components/timeline/TrackOccupancyGantt";
import { RequestTable } from "@/components/requests/RequestTable";
import { AiInsightsPanel } from "@/components/ai/AiInsightsPanel";
import { CostVarianceChart } from "@/components/charts/CostVarianceChart";
import { DeptWorkloadChart } from "@/components/charts/DeptWorkloadChart";
import { 
  MapTrifold, 
  Stack, 
  CheckSquare, 
  Clock, 
  Sparkle, 
  Train, 
  Package, 
  FileText, 
  ArrowCounterClockwise
} from "@phosphor-icons/react";
import Link from "next/link";

export default function CentralCommandPage() {
  const { 
    requests, 
    maintenanceTasks, 
    corridors, 
    bundles,
    selectedCorridorId,
    setSelectedCorridorId,
    selectedZone,
    setSelectedZone
  } = useRailPlan();

  const [activeViewTab, setActiveViewTab] = useState<"MAP" | "GANTT">("MAP");

  const availableCorridors = useMemo(() => {
    const allowed = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    return corridors.filter((c) => allowed.includes(c.id));
  }, [corridors, selectedZone]);

  // Dynamic Corridor / Zone Filtering
  const isCorridorFiltered = selectedCorridorId !== "ALL";
  const isZoneFiltered = !selectedZone.startsWith("All") && selectedZone !== "ALL";
  const selectedCorridor = corridors.find((c) => c.id === selectedCorridorId) || null;

  const filteredRequests = useMemo(() => {
    if (isCorridorFiltered) {
      return requests.filter((r) => r.corridorId === selectedCorridorId);
    }
    const allowed = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    return requests.filter((r) => allowed.includes(r.corridorId));
  }, [requests, isCorridorFiltered, selectedCorridorId, selectedZone]);

  const filteredTasks = useMemo(() => {
    if (isCorridorFiltered) {
      return maintenanceTasks.filter((t) => t.corridorId === selectedCorridorId);
    }
    const allowed = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    return maintenanceTasks.filter((t) => allowed.includes(t.corridorId));
  }, [maintenanceTasks, isCorridorFiltered, selectedCorridorId, selectedZone]);

  const filteredBundles = useMemo(() => {
    if (isCorridorFiltered) {
      return bundles.filter((b) => b.corridorId === selectedCorridorId);
    }
    const allowed = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    return bundles.filter((b) => allowed.includes(b.corridorId));
  }, [bundles, isCorridorFiltered, selectedCorridorId, selectedZone]);

  const totalTasks = filteredTasks.length;
  const pendingApprovals = filteredRequests.filter(
    (r) => r.status === "UNDER_REVIEW" || r.status === "SUBMITTED"
  ).length;
  const delayedProjects = filteredTasks.filter((t) => t.status === "OVERDUE").length;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Central Header (Tactile Cyber-Brutalist 100% Solid) */}
      <div className="p-6 rounded-2xl bg-[#022642] border-2 border-black shadow-[5px_5px_0_#000000] flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        {/* Solid Indian National Tricolor Ribbon Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF671F] via-[#FFFFFF] to-[#046A38]" />

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono font-black bg-[#00FFD2] text-black border-2 border-black px-2.5 py-0.5 rounded shadow-[2px_2px_0_#000000] uppercase tracking-wider">
              भारतीय रेल • National OCC
            </span>
            <span className="text-xs text-[#CABFFF] font-mono font-bold">
              Zone: {selectedZone || "Railway Board (All-India Network)"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
            Central Railway Operations Command & Maintenance Control
          </h1>
          <p className="text-xs text-[#8595FF] font-medium">
            Real-time multi-department maintenance planning, predictive risk mitigation & authority block sanctions
          </p>
        </div>

        {/* 3 Prominent Solid 3D Hardware Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            href="/central/sanctions"
            className="btn-tactile px-4 py-2.5 rounded-xl bg-[#FB2077] text-white text-xs font-black flex items-center space-x-2 cursor-pointer"
          >
            <FileText size={18} weight="duotone" className="text-white shrink-0" />
            <span>Official Sanctions (Form T/806)</span>
          </Link>

          <Link
            href="/central/bundling"
            className="btn-tactile px-4 py-2.5 rounded-xl bg-[#6367FF] text-white text-xs font-black flex items-center space-x-2 cursor-pointer"
          >
            <Package size={18} weight="duotone" className="text-white shrink-0" />
            <span>Task Bundler ({filteredBundles.length} Mega Blocks)</span>
          </Link>

          <Link
            href="/central/approvals"
            className="btn-tactile px-4 py-2.5 rounded-xl bg-[#00FFD2] text-black text-xs font-black flex items-center space-x-2 cursor-pointer"
          >
            <CheckSquare size={18} weight="duotone" className="text-black shrink-0" />
            <span>Approval Center ({pendingApprovals})</span>
          </Link>
        </div>
      </div>

      {/* Corridor & Zone Filter Console Strip */}
      <div className="p-4 rounded-xl bg-[#022642] border-2 border-black shadow-[4px_4px_0_#000000] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-[#000D18] border-2 border-black shadow-[2px_2px_0_#000000] text-[#00FFD2] shrink-0">
            <Train size={20} weight="duotone" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                {isCorridorFiltered ? "Active Filtered Corridor:" : isZoneFiltered ? "Active Filtered Zone:" : "Select Railway Trunk Corridor:"}
              </span>
              {selectedCorridor ? (
                <span className="text-xs font-mono font-black text-black bg-[#00FFD2] px-2.5 py-0.5 rounded border border-black shadow-[1px_1px_0_#000000]">
                  {selectedCorridor.id}
                </span>
              ) : isZoneFiltered ? (
                <span className="text-xs font-mono font-bold text-white bg-[#02395D] px-2.5 py-0.5 rounded border border-black">
                  {selectedZone.split("(")[0].trim()}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-[#8595FF] font-medium mt-0.5">
              {selectedCorridor
                ? `${selectedCorridor.name} (${selectedCorridor.route}) • Total: ${selectedCorridor.totalLengthKm} KM`
                : isZoneFiltered
                ? `Showing ${availableCorridors.length} corridors in ${selectedZone} (${availableCorridors.map((c) => c.id).join(", ")})`
                : "Showing aggregated telemetry and maintenance data across all 10 Indian Railways trunk corridors"}
            </p>
          </div>
        </div>

        {/* Quick Corridor Selection Rocker Switch Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCorridorId("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black font-mono transition flex items-center space-x-1.5 border-2 border-black ${
              selectedCorridorId === "ALL"
                ? "bg-[#6367FF] text-white shadow-[0_1px_0_#000000] translate-y-0.5"
                : "bg-[#000D18] text-[#CABFFF] shadow-[0_3px_0_#000000] hover:bg-[#02395D]"
            }`}
          >
            <span>{isZoneFiltered ? `All ${selectedZone.split("(")[0].trim()} (${availableCorridors.length})` : `All Corridors (${availableCorridors.length})`}</span>
          </button>

          {availableCorridors.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCorridorId(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black font-mono transition flex items-center space-x-1.5 border-2 border-black ${
                selectedCorridorId === c.id
                  ? "bg-[#6367FF] text-white shadow-[0_1px_0_#000000] translate-y-0.5"
                  : "bg-[#000D18] text-[#CABFFF] shadow-[0_3px_0_#000000] hover:bg-[#02395D]"
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
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-black bg-[#FF1818] text-white border-2 border-black shadow-[0_3px_0_#000000] hover:brightness-110 active:translate-y-0.5 active:shadow-[0_1px_0_#000000] flex items-center space-x-1 transition cursor-pointer"
            >
              <ArrowCounterClockwise size={14} weight="bold" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Section A: KPI Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#CABFFF] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#6367FF] border border-black inline-block" />
            <span>{isCorridorFiltered ? `${selectedCorridor?.name} KPIs & Metrics` : "National Maintenance KPIs & Performance Metrics"}</span>
          </h2>
          <span className="text-xs font-mono text-[#00FFD2] font-black flex items-center gap-2 px-2.5 py-1 rounded bg-[#000D18] border border-black">
            <span className="w-2 h-2 rounded-full bg-[#00FFD2] status-dot-mint animate-pulse" />
            {isCorridorFiltered ? `Corridor ${selectedCorridorId} Telemetry Live` : "All Corridors Live"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <KpiCard
            title={isCorridorFiltered ? "Route Length" : "Total Corridors"}
            value={isCorridorFiltered ? `${selectedCorridor?.totalLengthKm} KM` : corridors.length}
            subtitle={isCorridorFiltered ? selectedCorridor?.zone : "Major Trunk Routes"}
            icon={MapTrifold as any}
            color="blue"
          />
          <KpiCard
            title="Active Tasks"
            value={totalTasks}
            subtitle={isCorridorFiltered ? `On ${selectedCorridorId}` : "Scheduled / On Track"}
            icon={Stack as any}
            color="cyan"
          />
          <KpiCard
            title="Pending Approvals"
            value={pendingApprovals}
            subtitle="Awaiting Sanction"
            icon={CheckSquare as any}
            color="amber"
            badge="Action"
          />
          <KpiCard
            title="Joint Mega Blocks"
            value={`${filteredBundles.length} Active`}
            subtitle="35% Closure Saved"
            icon={Package as any}
            color="emerald"
            badge="AI"
          />
          <KpiCard
            title="Delayed Tasks"
            value={delayedProjects}
            subtitle="Past Target Window"
            icon={Clock as any}
            color="rose"
          />
          <KpiCard
            title="AI Est. Savings"
            value={isCorridorFiltered ? "₹4.2L" : "₹14.8L"}
            subtitle="Track Block Bundling"
            icon={Sparkle as any}
            color="emerald"
            change="+30% Time"
          />
        </div>
      </div>

      {/* View Switcher: Live Map vs 24H Master Gantt Chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 bg-[#000D18] p-1.5 rounded-xl border-2 border-black shadow-[3px_3px_0_#000000]">
            <button
              onClick={() => setActiveViewTab("MAP")}
              className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center space-x-2 border-2 border-black ${
                activeViewTab === "MAP"
                  ? "bg-[#6367FF] text-white shadow-[0_1px_0_#000000] translate-y-0.5"
                  : "bg-[#022642] text-[#CABFFF] shadow-[0_3px_0_#000000] hover:text-white"
              }`}
            >
              <MapTrifold size={18} weight="duotone" />
              <span>National Operations Map</span>
            </button>

            <button
              onClick={() => setActiveViewTab("GANTT")}
              className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center space-x-2 border-2 border-black ${
                activeViewTab === "GANTT"
                  ? "bg-[#00FFD2] text-black shadow-[0_1px_0_#000000] translate-y-0.5"
                  : "bg-[#022642] text-[#CABFFF] shadow-[0_3px_0_#000000] hover:text-white"
              }`}
            >
              <Clock size={18} weight="duotone" />
              <span>24H Track Occupancy Timeline</span>
            </button>
          </div>

          <span className="text-xs text-[#8595FF] font-mono font-bold hidden sm:inline px-3 py-1 rounded bg-[#022642] border border-black">
            {activeViewTab === "MAP" ? "Viewing Live Moving Traffic & Block Zones" : "Viewing 24-Hour Master Section Diagram"}
          </span>
        </div>

        {activeViewTab === "MAP" ? (
          <LiveCorridorMap />
        ) : (
          <TrackOccupancyGantt />
        )}
      </div>

      {/* Section C: AI Optimization Hub */}
      <AiInsightsPanel />

      {/* Section D: Cost Variance & Department Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostVarianceChart />
        <DeptWorkloadChart />
      </div>

      {/* Section E: Service Requests Table (Filtered by Active Corridor) */}
      <RequestTable
        requests={filteredRequests}
        title={
          selectedCorridor
            ? `Service Requests & Approvals: ${selectedCorridor.name}`
            : "Active Service Requests & Authority Approvals"
        }
        subtitle={
          selectedCorridor
            ? `Showing requests specifically on ${selectedCorridor.id} (${selectedCorridor.route})`
            : "Recent inter-departmental requests across Northern, Western, Central & DFC corridors"
        }
      />
    </div>
  );
}
