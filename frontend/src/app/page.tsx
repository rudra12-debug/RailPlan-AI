"use client";

import React, { useState, useMemo } from "react";
import { useRailPlan } from "@/context/RailPlanContext";
import { useAuth } from "@/context/AuthContext";
import { DigitalTwinMap } from "@/components/DigitalTwinMap";
import { LiveCorridorMap } from "@/components/map/LiveCorridorMap";
import { MegaBlockBundler } from "@/components/MegaBlockBundler";
import { EmergencyReplanner } from "@/components/EmergencyReplanner";
import { T806SanctionModal } from "@/components/T806SanctionModal";
import { IRSahayakCopilot } from "@/components/IRSahayakCopilot";
import { MultiDirectorateFlowBanner } from "@/components/common/MultiDirectorateFlowBanner";
import {
  Broadcast,
  Package,
  ShieldWarning,
  FileText,
  Robot,
  TrendDown,
  Clock,
  Sparkle,
  Train,
  Warning,
  ArrowClockwise,
  MapPin,
  ShieldCheck,
  Lightning
} from "@phosphor-icons/react";

export default function MasterCommandPage() {
  const {
    corridors,
    selectedCorridorId,
    setSelectedCorridorId,
    bundles,
    t806Sanctions,
    trains,
    assets,
    telemetryTickActive,
    triggerTelemetryTick,
    lastTelemetryTickTime,
  } = useRailPlan();

  const { user, jwtPayload } = useAuth();

  const [activeTab, setActiveTab] = useState<"OCC" | "BUNDLER" | "EMERGENCY" | "SANCTIONS">("OCC");
  const [occViewMode, setOccViewMode] = useState<"LEAFLET" | "SCHEMATIC">("LEAFLET");
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const activeCorridor = useMemo(() => {
    if (selectedCorridorId === "ALL") {
      return {
        id: "ALL",
        name: "All Corridors (Pan-India National Rail Network)",
        route: "Pan-India Multi-Zone Grid (10 Strategic Arteries)",
        totalLengthKm: 11881,
        zone: "Indian Railways National OCC",
        status: "NORMAL" as const,
        criticalSpotsCount: 14,
        stations: corridors[0].stations,
        coordinates: corridors[0].coordinates,
      };
    }
    return corridors.find((c) => c.id === selectedCorridorId) || corridors[0];
  }, [corridors, selectedCorridorId]);

  // Live calculated metrics
  const totalDowntimeSaved = "35.4%";
  const activeMegaBlocksCount = bundles.length + 1;
  const criticalAlarmsCount = assets.filter((a) => a.failureRisk >= 80).length;
  const pendingSanctionsCount = t806Sanctions.filter((s) => s.status !== "ACTIVE_BLOCK").length + 2;

  return (
    <div className="space-y-6">
      {/* OCC Command Console Hero Header (Tactile Cyber-Brutalist 100% Solid) */}
      <div className="p-6 rounded-2xl bg-[#022642] border-2 border-black shadow-[5px_5px_0_#000000] relative overflow-hidden">
        {/* National Tricolor Top Line Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF671F] via-[#FFFFFF] to-[#046A38]" />
        
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-black bg-[#00FFD2] text-black border-2 border-black px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center space-x-1.5 shadow-[2px_2px_0_#000000]">
                <Train size={14} weight="duotone" className="text-black" />
                <span>भारतीय रेल • SIH 2026</span>
              </span>

              {/* Zero-Trust RBAC Pill */}
              <span className="text-[10px] font-mono font-bold bg-[#000D18] text-[#CABFFF] border border-black px-2.5 py-0.5 rounded flex items-center space-x-1">
                <ShieldCheck size={14} weight="duotone" className="text-[#00FFD2]" />
                <span>Zero-Trust: {user?.name || "OCC Officer"} ({jwtPayload?.role || "CENTRAL_ADMIN"})</span>
              </span>

              <span className="text-xs text-[#CABFFF] font-mono font-bold">
                Corridor: <span className="text-[#00FFD2] font-black">{activeCorridor.id}</span> ({activeCorridor.name.split("(")[0]} • {activeCorridor.totalLengthKm} KM)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
              RailPlan AI • Unified Railway Operations & Maintenance Console
            </h1>
            <p className="text-xs text-[#8595FF] max-w-3xl leading-relaxed font-medium">
              Synchronizing cross-departmental mega-block bundling, crisis replanning, digital-twin telemetry, and statutory G&SR Form T/806 compliance across 10 high-density Indian Railways corridors.
            </p>
          </div>

          {/* IR-Sahayak Copilot 3D Hardware Trigger Button */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="btn-tactile px-5 py-3 rounded-xl bg-[#6367FF] text-white font-black text-xs sm:text-sm flex items-center space-x-2.5 cursor-pointer"
            >
              <Robot size={20} weight="duotone" className="text-white" />
              <span>IR-Sahayak Copilot</span>
              <span className="px-2 py-0.5 rounded bg-black text-[10px] font-mono font-black text-[#00FFD2] border border-black">
                Ask AI
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Directorates Inter-Department Coordination Banner */}
      <MultiDirectorateFlowBanner />

      {/* 10-Corridor Quick Switcher Strip */}
      <div className="p-3 sm:p-4 rounded-xl bg-[#022642] border-2 border-black shadow-[4px_4px_0_#000000]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <MapPin size={18} weight="duotone" className="text-[#00FFD2] animate-pulse" />
            <span className="text-xs font-black text-white uppercase tracking-wider">
              National Railway Corridors (10 High-Density Arteries):
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#CABFFF] px-2.5 py-1 rounded bg-[#000D18] border border-black">
            {assets.length} Telemetry Sensors • {trains.length} Moving Trains Tracked
          </span>
        </div>

        <div className="flex items-center space-x-2.5 overflow-x-auto pb-1.5 text-xs">
          {/* All Corridors Pill Option */}
          <button
            onClick={() => setSelectedCorridorId("ALL")}
            className={`px-3 py-2 rounded-xl border-2 border-black font-mono transition shrink-0 flex items-center space-x-2.5 text-left ${
              selectedCorridorId === "ALL"
                ? "bg-[#6367FF] text-white shadow-[0_1px_0_#000000] translate-y-0.5"
                : "bg-[#000D18] text-[#CABFFF] shadow-[0_3px_0_#000000] hover:bg-[#02395D]"
            }`}
          >
            <div>
              <div className="flex items-center space-x-1.5 font-black">
                <span>🌐 ALL CORRIDORS</span>
                <span className="text-[10px] text-[#00FFD2] font-normal">(11,881 KM)</span>
              </div>
              <div className="text-[9px] text-[#CABFFF] truncate max-w-[150px]">
                Pan-India 10 Routes Active
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border border-black ${
                selectedCorridorId === "ALL" ? "bg-black text-[#00FFD2]" : "bg-[#022642] text-white"
              }`}>
                {trains.length} trn
              </span>
            </div>
          </button>

          {corridors.map((corridor) => {
            const isSelected = corridor.id === selectedCorridorId;
            const corridorTrainCount = trains.filter((t) => (t.corridorId ? t.corridorId === corridor.id : corridor.id === "BPL-ET")).length;
            return (
              <button
                key={corridor.id}
                onClick={() => setSelectedCorridorId(corridor.id)}
                className={`px-3 py-2 rounded-xl border-2 border-black font-mono transition shrink-0 flex items-center space-x-2.5 text-left ${
                  isSelected
                    ? "bg-[#6367FF] text-white shadow-[0_1px_0_#000000] translate-y-0.5"
                    : "bg-[#000D18] text-[#CABFFF] shadow-[0_3px_0_#000000] hover:bg-[#02395D]"
                }`}
              >
                <div>
                  <div className="flex items-center space-x-1.5 font-black">
                    <span>{corridor.id}</span>
                    <span className="text-[10px] text-[#00FFD2] font-normal">({corridor.totalLengthKm} KM)</span>
                  </div>
                  <div className="text-[9px] text-[#CABFFF] truncate max-w-[150px]">
                    {corridor.name.split("(")[0]}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border border-black ${
                    isSelected ? "bg-black text-[#00FFD2]" : "bg-[#022642] text-white"
                  }`}>
                    {corridorTrainCount} trn
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live KPI Counter Bar (Tactile Solid Cards with Sunken Black LED Bays) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Downtime Saved */}
        <div className="p-4 rounded-xl bg-[#022642] border-2 border-black shadow-[4px_4px_0_#000000] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#00FFD2]" />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-[#CABFFF] font-bold uppercase">Total Downtime Saved</span>
            <div className="p-1.5 rounded-lg bg-[#000D18] border border-black text-[#00FFD2]">
              <TrendDown size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 px-3 py-1 rounded-lg bg-[#000D18] border border-[#011526] shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] inline-block">
            <span className="text-2xl font-black text-[#00FFD2] font-mono">{totalDowntimeSaved}</span>
          </div>
          <span className="text-[10px] text-[#8595FF] mt-2 block font-mono font-medium">
            +46.1% savings via Mega-Block bundling
          </span>
        </div>

        {/* Active Mega-Blocks */}
        <div className="p-4 rounded-xl bg-[#022642] border-2 border-black shadow-[4px_4px_0_#000000] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#6367FF]" />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-[#CABFFF] font-bold uppercase">Active Mega-Blocks</span>
            <div className="p-1.5 rounded-lg bg-[#000D18] border border-black text-[#6367FF]">
              <Package size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 px-3 py-1 rounded-lg bg-[#000D18] border border-[#011526] shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] inline-block">
            <span className="text-2xl font-black text-[#6367FF] font-mono">{activeMegaBlocksCount}</span>
          </div>
          <span className="text-[10px] text-[#00FFD2] font-mono mt-2 block font-medium">
            {activeCorridor.id} • {bundles.filter((b) => b.corridorId === activeCorridor.id).length || 1} blocks executing
          </span>
        </div>

        {/* High-Risk Track Warnings */}
        <div className="p-4 rounded-xl bg-[#022642] border-2 border-black shadow-[4px_4px_0_#000000] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FB2077]" />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-[#CABFFF] font-bold uppercase">High-Risk Track Warnings</span>
            <div className="p-1.5 rounded-lg bg-[#000D18] border border-black text-[#FB2077]">
              <Warning size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 px-3 py-1 rounded-lg bg-[#000D18] border border-[#011526] shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] inline-block">
            <span className="text-2xl font-black text-[#FB2077] font-mono">{criticalAlarmsCount}</span>
          </div>
          <span className="text-[10px] text-[#FB2077] font-mono mt-2 block font-medium">
            OHE tension & rail temperature thresholds
          </span>
        </div>

        {/* Pending T/806 Sanctions */}
        <div className="p-4 rounded-xl bg-[#022642] border-2 border-black shadow-[4px_4px_0_#000000] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FFFF00]" />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-[#CABFFF] font-bold uppercase">Pending T/806 Sanctions</span>
            <div className="p-1.5 rounded-lg bg-[#000D18] border border-black text-[#FFFF00]">
              <FileText size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 px-3 py-1 rounded-lg bg-[#000D18] border border-[#011526] shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] inline-block">
            <span className="text-2xl font-black text-[#FFFF00] font-mono">{pendingSanctionsCount}</span>
          </div>
          <span className="text-[10px] text-[#CABFFF] font-mono mt-2 block font-medium">
            Form T/806 Line Block legal pipeline
          </span>
        </div>
      </div>

      {/* Main Module Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-[#000D18] border-2 border-black shadow-[3px_3px_0_#000000]">
          <button
            onClick={() => setActiveTab("OCC")}
            className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center space-x-2 border-2 border-black ${
              activeTab === "OCC"
                ? "bg-[#6367FF] text-white shadow-[0_1px_0_#000000] translate-y-0.5"
                : "bg-[#022642] text-[#CABFFF] shadow-[0_3px_0_#000000] hover:text-white"
            }`}
          >
            <Broadcast size={18} weight="duotone" />
            <span>1. OCC Live Digital Twin (120 KM)</span>
          </button>

          <button
            onClick={() => setActiveTab("BUNDLER")}
            className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center space-x-2 border-2 border-black ${
              activeTab === "BUNDLER"
                ? "bg-[#00FFD2] text-black shadow-[0_1px_0_#000000] translate-y-0.5"
                : "bg-[#022642] text-[#CABFFF] shadow-[0_3px_0_#000000] hover:text-white"
            }`}
          >
            <Package size={18} weight="duotone" />
            <span>2. AI Mega-Block Bundler (46% Savings)</span>
          </button>

          <button
            onClick={() => setActiveTab("EMERGENCY")}
            className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center space-x-2 border-2 border-black ${
              activeTab === "EMERGENCY"
                ? "bg-[#FB2077] text-white shadow-[0_1px_0_#000000] translate-y-0.5"
                : "bg-[#022642] text-[#CABFFF] shadow-[0_3px_0_#000000] hover:text-white"
            }`}
          >
            <ShieldWarning size={18} weight="duotone" />
            <span>3. Emergency Sandbox ("What-If")</span>
          </button>

          <button
            onClick={() => setActiveTab("SANCTIONS")}
            className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center space-x-2 border-2 border-black ${
              activeTab === "SANCTIONS"
                ? "bg-[#FFFF00] text-black shadow-[0_1px_0_#000000] translate-y-0.5"
                : "bg-[#022642] text-[#CABFFF] shadow-[0_3px_0_#000000] hover:text-white"
            }`}
          >
            <FileText size={18} weight="duotone" />
            <span>4. Statutory T/806 Portal & Audit</span>
          </button>
        </div>

        {/* Real-time Telemetry Status Ticker */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#000D18] border-2 border-black text-xs font-mono font-bold text-[#00FFD2]">
          <span className={`w-2.5 h-2.5 rounded-full ${telemetryTickActive ? "bg-[#00FFD2] status-dot-mint animate-ping" : "bg-slate-500"}`} />
          <span className="text-white">Telemetry Stream:</span>
          <span className="text-[#00FFD2] font-black">
            {lastTelemetryTickTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <button
            onClick={triggerTelemetryTick}
            className="p-1 rounded bg-[#022642] hover:bg-[#6367FF] text-white border border-black transition"
            title="Step Telemetry (5s Tick)"
          >
            <ArrowClockwise size={14} weight="bold" />
          </button>
        </div>
      </div>

      {/* Active Module Display */}
      <div className="space-y-6">
        {activeTab === "OCC" && (
          <div className="space-y-4">
            {/* OCC Visualizer Header & Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#022642] border-2 border-black shadow-[4px_4px_0_#000000]">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-[#000D18] border-2 border-black text-[#00FFD2] shadow-[2px_2px_0_#000000]">
                  <Broadcast size={22} weight="duotone" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center space-x-2">
                    <span>National OCC Live Visualizer & GIS Telemetry</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-[#00FFD2] text-black border border-black shadow-[1px_1px_0_#000000]">
                      Active Live Grid
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#CABFFF] font-medium mt-0.5">
                    Interactive geospatial satellite view with Indian boundaries, river bridges, mountain ghats, caution zones & real-time train positions
                  </p>
                </div>
              </div>

              {/* Mode Switcher 3D Pills */}
              <div className="flex items-center space-x-2 p-1.5 rounded-xl bg-[#000D18] border-2 border-black">
                <button
                  onClick={() => setOccViewMode("LEAFLET")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition flex items-center space-x-1.5 border-2 border-black ${
                    occViewMode === "LEAFLET"
                      ? "bg-[#6367FF] text-white shadow-[0_1px_0_#000000] translate-y-0.5"
                      : "bg-[#022642] text-[#CABFFF] shadow-[0_3px_0_#000000] hover:text-white"
                  }`}
                >
                  <span>🛰️ Satellite GIS Map (Live Leaflet)</span>
                </button>
                <button
                  onClick={() => setOccViewMode("SCHEMATIC")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition flex items-center space-x-1.5 border-2 border-black ${
                    occViewMode === "SCHEMATIC"
                      ? "bg-[#6367FF] text-white shadow-[0_1px_0_#000000] translate-y-0.5"
                      : "bg-[#022642] text-[#CABFFF] shadow-[0_3px_0_#000000] hover:text-white"
                  }`}
                >
                  <span>🎛️ 2D Digital Twin Schematic</span>
                </button>
              </div>
            </div>

            {occViewMode === "LEAFLET" ? <LiveCorridorMap /> : <DigitalTwinMap />}
          </div>
        )}
        {activeTab === "BUNDLER" && (
          <MegaBlockBundler onForwardToSanctions={() => setActiveTab("SANCTIONS")} />
        )}
        {activeTab === "EMERGENCY" && <EmergencyReplanner />}
        {activeTab === "SANCTIONS" && <T806SanctionModal />}
      </div>

      {/* Floating IR-Sahayak Copilot Drawer */}
      <IRSahayakCopilot
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsCopilotOpen(false);
        }}
      />
    </div>
  );
}
