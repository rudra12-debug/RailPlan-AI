"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CorridorAsset } from "@/lib/types";
import { useRailPlan, ZONE_CORRIDOR_MAP } from "@/context/RailPlanContext";
import { 
  Layers, 
  Activity, 
  Zap, 
  Radio, 
  Thermometer, 
  Gauge, 
  Cpu, 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Wrench
} from "lucide-react";
import { RiskBadge } from "@/components/common/StatusBadge";
import Link from "next/link";

export const DigitalTwinView: React.FC = () => {
  const { assets, corridors, selectedCorridorId, setSelectedCorridorId, selectedZone } = useRailPlan();

  const availableCorridors = useMemo(() => {
    const allowed = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    return corridors.filter((c) => allowed.includes(c.id));
  }, [corridors, selectedZone]);

  const [selectedCorridorFilter, setSelectedCorridorFilter] = useState<string>(() => {
    return selectedCorridorId || "NDLS-MMCT";
  });

  // Sync when global corridor selection changes
  useEffect(() => {
    if (selectedCorridorId) {
      setSelectedCorridorFilter(selectedCorridorId);
    }
  }, [selectedCorridorId]);

  const filteredAssets = useMemo(() => {
    const allowedZoneCorridors = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    if (selectedCorridorFilter === "ALL") {
      return assets.filter((a) => allowedZoneCorridors.includes(a.corridorId));
    }
    return assets.filter((a) => a.corridorId === selectedCorridorFilter);
  }, [assets, selectedCorridorFilter, selectedZone]);

  const [selectedAsset, setSelectedAsset] = useState<CorridorAsset>(filteredAssets[0] || assets[0]);

  // Update selected asset if current asset is no longer in filtered list
  useEffect(() => {
    if (filteredAssets.length > 0 && !filteredAssets.some((a) => a.id === selectedAsset.id)) {
      setSelectedAsset(filteredAssets[0]);
    }
  }, [filteredAssets, selectedAsset.id]);

  const getAssetIcon = (type: CorridorAsset["type"]) => {
    switch (type) {
      case "SIGNAL":
        return <Radio className="w-5 h-5 text-purple-400" />;
      case "POINT_MACHINE":
        return <Gauge className="w-5 h-5 text-amber-400" />;
      case "OHE_CATENARY":
      case "TRANSFORMER":
        return <Zap className="w-5 h-5 text-cyan-400" />;
      case "RAIL_JOINT":
      case "BRIDGE_PIER":
      default:
        return <Cpu className="w-5 h-5 text-blue-400" />;
    }
  };

  const handleCorridorChange = (newCorridor: string) => {
    setSelectedCorridorFilter(newCorridor);
    setSelectedCorridorId(newCorridor);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-navy-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100">Corridor Digital Twin & Asset Telemetry</h3>
            <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded">
              IoT Sensor Mesh Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time cyber-physical representation of signals, OHE catenary, tracks, and power substations {selectedZone && !selectedZone.startsWith("All") ? `• ${selectedZone.split("(")[0].trim()}` : ""}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400">Corridor:</span>
          <select
            value={selectedCorridorFilter}
            onChange={(e) => handleCorridorChange(e.target.value)}
            className="bg-navy-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-mono font-bold"
          >
            <option value="ALL">{selectedZone.startsWith("All") ? "All Corridors" : `All ${selectedZone.split("(")[0].trim()} (${availableCorridors.length})`}</option>
            {availableCorridors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Digital Twin Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive 2D/3D Track Schematic Grid */}
        <div className="lg:col-span-7 rounded-2xl bg-navy-900/90 border border-slate-700/80 p-5 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Asset Topology & Field Sensors ({filteredAssets.length} Monitored Nodes)
            </span>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sensors Streaming 50Hz</span>
            </span>
          </div>

          {/* Interactive Asset Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredAssets.map((asset) => {
              const isSelected = selectedAsset.id === asset.id;

              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                    isSelected
                      ? "bg-gradient-to-br from-blue-950/90 via-navy-900 to-navy-950 border-amber-500/80 shadow-gov-card"
                      : "bg-navy-950/60 border-slate-800 hover:border-slate-600 hover:bg-navy-950"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div
                        className={`p-2 rounded-lg border shrink-0 ${
                          isSelected
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {getAssetIcon(asset.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block truncate">
                          {asset.type.replace("_", " ")}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200 truncate" title={asset.name}>
                          {asset.name}
                        </h4>
                      </div>
                    </div>

                    <RiskBadge risk={asset.failureRisk} className="shrink-0" />
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono truncate mr-2">{asset.locationKm.split("(")[0]}</span>
                    <span className="text-amber-400 font-semibold shrink-0">{asset.departmentResponsible}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time Track Cross-Section Diagram */}
          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Schematic Track Section View (Delhi - Mumbai Central)
            </p>
            <div className="relative h-20 bg-slate-950/90 rounded-lg border border-slate-800 flex items-center justify-around px-4 overflow-hidden">
              {/* Rail Tracks */}
              <div className="absolute top-7 left-0 right-0 h-1 bg-slate-600 shadow-sm" />
              <div className="absolute top-12 left-0 right-0 h-1 bg-slate-600 shadow-sm" />
              
              {/* Sleepers */}
              <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-30">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="w-1 h-full bg-slate-500" />
                ))}
              </div>

              {/* Dynamic Asset Pins */}
              <div className="relative z-10 flex items-center justify-between w-full">
                <div className="flex flex-col items-center group cursor-pointer" onClick={() => setSelectedAsset(assets[0])}>
                  <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse border-2 border-slate-900" />
                  <span className="text-[9px] font-mono text-purple-300 mt-1 font-bold">S-204</span>
                </div>

                <div className="flex flex-col items-center group cursor-pointer" onClick={() => setSelectedAsset(assets[1])}>
                  <div className="w-3 h-3 rounded-full bg-amber-400 border-2 border-slate-900" />
                  <span className="text-[9px] font-mono text-amber-300 mt-1 font-bold">PM-12</span>
                </div>

                <div className="flex flex-col items-center group cursor-pointer" onClick={() => setSelectedAsset(assets[2])}>
                  <div className="w-3 h-3 rounded-full bg-sky-400 border-2 border-slate-900" />
                  <span className="text-[9px] font-mono text-sky-300 mt-1 font-bold">OHE-88</span>
                </div>

                <div className="flex flex-col items-center group cursor-pointer" onClick={() => setSelectedAsset(assets[3])}>
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse border-2 border-slate-900" />
                  <span className="text-[9px] font-mono text-rose-300 mt-1 font-bold">CWR-102</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Asset Deep Telemetry Inspector */}
        <div className="lg:col-span-5 rounded-2xl bg-navy-900/90 border border-slate-700/80 p-5 space-y-5 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                    Digital Twin Node
                  </span>
                  <span className="text-xs font-mono text-slate-400">ID: {selectedAsset.id}</span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-100 mt-0.5 break-words">{selectedAsset.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedAsset.locationKm}</p>
              </div>

              <RiskBadge risk={selectedAsset.failureRisk} className="shrink-0 self-start mt-0.5" />
            </div>

            {/* Live Telemetry Sensors */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Live Sensor Telemetry
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {selectedAsset.telemetry.temperature !== undefined && (
                  <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30">
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold">Core Temp</p>
                      <p className="text-sm font-bold text-slate-100 font-mono">
                        {selectedAsset.telemetry.temperature} °C
                      </p>
                    </div>
                  </div>
                )}

                {selectedAsset.telemetry.vibration !== undefined && (
                  <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold">Vibration Index</p>
                      <p className="text-sm font-bold text-slate-100 font-mono">
                        {selectedAsset.telemetry.vibration} mm/s
                      </p>
                    </div>
                  </div>
                )}

                {selectedAsset.telemetry.voltage !== undefined && (
                  <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold">Supply Voltage</p>
                      <p className="text-sm font-bold text-cyan-300 font-mono">
                        {selectedAsset.telemetry.voltage >= 1000 ? `${selectedAsset.telemetry.voltage / 1000} kV` : `${selectedAsset.telemetry.voltage} V`}
                      </p>
                    </div>
                  </div>
                )}

                {selectedAsset.telemetry.stressLevel !== undefined && (
                  <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      <Gauge className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold">Tensile Stress</p>
                      <p className="text-sm font-bold text-rose-300 font-mono">
                        {selectedAsset.telemetry.stressLevel} MPa
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Inspection Timeline */}
            <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Last Overhaul:</span>
                <span className="font-mono text-slate-200 font-semibold">{selectedAsset.lastMaintenanceDate}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Next Recommended:</span>
                <span className="font-mono text-amber-400 font-semibold">{selectedAsset.nextRecommendedInspection}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Responsible Dept:</span>
                <span className="text-cyan-400 font-bold">{selectedAsset.departmentResponsible}</span>
              </div>
            </div>

            {/* AI Failure Risk Breakdown */}
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-600/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300">AI Degradation Prediction</span>
                <span className="text-xs font-mono font-extrabold text-purple-200">{selectedAsset.failureRisk}% Risk</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    selectedAsset.failureRisk >= 80
                      ? "bg-rose-500"
                      : selectedAsset.failureRisk >= 50
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${selectedAsset.failureRisk}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {selectedAsset.failureRisk >= 75
                  ? "Degradation trend indicates potential failure within 14 days under current traffic load. Maintenance recommended before weekend."
                  : "Operational metrics within normal safety thresholds. Routine scheduled inspection sufficient."}
              </p>
            </div>
          </div>

          {/* Action Link */}
          <div className="pt-3 border-t border-slate-800">
            <Link
              href={`/department/create-request`}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-bold text-xs shadow-glow-cyan flex items-center justify-center space-x-2 transition transform active:scale-95"
            >
              <Wrench className="w-4 h-4" />
              <span>Issue Service Request for {selectedAsset.id}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
