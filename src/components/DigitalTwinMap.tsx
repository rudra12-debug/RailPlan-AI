"use client";

import React, { useState, useMemo } from "react";
import { useRailPlan } from "@/context/RailPlanContext";
import { CorridorAsset, LiveTrain } from "@/lib/types";
import {
  Train,
  Zap,
  Activity,
  AlertTriangle,
  Layers,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Radio,
  Sliders,
  ArrowRight,
  ShieldAlert,
  Gauge,
  Thermometer,
  Compass,
  Play,
  Pause,
  RotateCw,
  MapPin,
} from "lucide-react";

export interface CorridorFeature {
  name: string;
  badge: string;
  startKm: number;
  endKm: number;
  description: string;
  warningNote: string;
}

export const CORRIDOR_FEATURES: Record<string, CorridorFeature> = {
  "BPL-ET": {
    name: "Vindhyachal Ghat Section",
    badge: "1:100 Incline • TSR 30 km/h",
    startKm: 56,
    endKm: 78,
    description: "Barkhera to Budni catch siding & steep gradient curve",
    warningNote: "Caution TSR 30 KM/H Active • Mid-ghat auxiliary catch siding KM 64",
  },
  "NDLS-MMCT": {
    name: "Ratlam Ghat & Chambal Ravines",
    badge: "Curve R-400 • 130 km/h Mission Raftaar",
    startKm: 640,
    endKm: 730,
    description: "Deep cuttings & high-speed curve transition near Meghnagar",
    warningNote: "Continuous Acoustic Bearing Monitoring active on bridge sections",
  },
  "NDLS-HWH": {
    name: "Grand Chord & Dhanbad Coal Basin",
    badge: "Heavy Freight • 160 km/h Testing Zone",
    startKm: 1140,
    endKm: 1260,
    description: "High axle-load coal rakes & dense electronic interlocking",
    warningNote: "Strict 4-hour night mega-block bundling protocol mandated",
  },
  "WDFC-01": {
    name: "Aravalli Tunnel & Double-Stack Section",
    badge: "7.1m High-Rise OHE • 32.5T Axle Load",
    startKm: 410,
    endKm: 520,
    description: "Electrified tunnel clearance & automated hot-axle wheel detectors",
    warningNote: "Automatic Train Protection (ETCS Level-2) active without TSR",
  },
  "EDFC-01": {
    name: "Sonnagar Heavy-Haul River Viaduct",
    badge: "Heavy Freight • 100 km/h Freight Speed",
    startKm: 810,
    endKm: 920,
    description: "Pre-stressed concrete bridge monitoring & flash-butt welded track",
    warningNote: "Dynamic rail temperature sensors trigger heat patrol when >54°C",
  },
  "CSMT-MAS": {
    name: "Bhor Ghat Mountain Inclines",
    badge: "1:37 Gradient • Banker Engine Section",
    startKm: 110,
    endKm: 155,
    description: "Karjat to Lonavala banker locomotive catch sidings and tunnels",
    warningNote: "Catch sidings armed • Dual 25kV OHE dropper inspection mandated",
  },
  "MAS-SBC": {
    name: "Jolarpettai Junction & Kuppam Incline",
    badge: "Vande Bharat High-Speed • 130 km/h",
    startKm: 210,
    endKm: 255,
    description: "Eastern Ghats plateau climb with tight radius curvatures",
    warningNote: "Continuous Kavach ATP radio tower coverage KM 212 - 250",
  },
  "HWH-MAS": {
    name: "Chilika Coastal High-Wind Corridor",
    badge: "Cyclone Risk • Salt Spray OHE",
    startKm: 520,
    endKm: 590,
    description: "Wind anemometer warning zone along Chilika Lake lagoon",
    warningNote: "Automatic speed restriction triggers when crosswinds exceed 60 km/h",
  },
  "ADI-MMCT": {
    name: "Dahanu Road Coastal Wind & Salt Zone",
    badge: "160 km/h Bullet Train Parallel • WR Quadruple Track",
    startKm: 350,
    endKm: 420,
    description: "Heavy suburban and express mix with high corrosion index",
    warningNote: "Frequent insulator washing & OHE contact wire tension monitoring",
  },
  "KONKAN-01": {
    name: "Panval Nadi Viaduct & Karwar Monsoon Ghat",
    badge: "Deep Cuttings • Monsoon Rockfall Protection",
    startKm: 370,
    endKm: 460,
    description: "Tallest Indian railway viaduct (64m) and long rock-cut tunnels",
    warningNote: "Netting sensors and electronic slope inclinometers online",
  },
};

export function DigitalTwinMap() {
  const {
    assets,
    trains,
    corridors,
    selectedCorridorId,
    setSelectedCorridorId,
    telemetryTickActive,
    setTelemetryTickActive,
    triggerTelemetryTick,
    lastTelemetryTickTime,
    activeCautionOrdersCount,
    openHighRiskAlarmsCount,
    createBlockRequest,
  } = useRailPlan();

  const currentCorridor = useMemo(() => {
    if (selectedCorridorId === "ALL") {
      return {
        id: "ALL",
        name: "All Corridors (Pan-India National Network)",
        route: "Pan-India Multi-Zone Corridors (10 Strategic Routes)",
        totalLengthKm: 11881,
        zone: "Indian Railways National Grid",
        status: "NORMAL" as const,
        criticalSpotsCount: 14,
        stations: corridors[0].stations,
        coordinates: corridors[0].coordinates,
      };
    }
    return corridors.find((c) => c.id === selectedCorridorId) || corridors[0];
  }, [corridors, selectedCorridorId]);

  // Filter & Layer Controls
  const [lineFilter, setLineFilter] = useState<"ALL" | "UP_LINE" | "DOWN_LINE">("ALL");
  const [showTrains, setShowTrains] = useState(true);
  const [showTracks, setShowTracks] = useState(true);
  const [showOHE, setShowOHE] = useState(true);
  const [showSignals, setShowSignals] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<CorridorAsset | null>(null);
  const [selectedTrain, setSelectedTrain] = useState<LiveTrain | null>(null);

  // Corridor assets filtered
  const corridorAssets = useMemo(() => {
    return assets.filter((a) => {
      if (selectedCorridorId !== "ALL" && a.corridorId !== selectedCorridorId) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          a.id.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.locationKm.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [assets, selectedCorridorId, searchQuery]);

  // Corridor trains filtered
  const corridorTrains = useMemo(() => {
    if (!showTrains) return [];
    return trains.filter((t) => {
      if (selectedCorridorId !== "ALL" && t.corridorId && t.corridorId !== selectedCorridorId) return false;
      if (lineFilter === "UP_LINE" && t.direction !== "UP") return false;
      if (lineFilter === "DOWN_LINE" && t.direction !== "DOWN") return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          t.trainNumber.includes(q) ||
          t.trainName.toLowerCase().includes(q) ||
          t.nextBlockSection.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [trains, showTrains, lineFilter, searchQuery, selectedCorridorId]);

  // Stations along the schematic
  const stations = currentCorridor.stations || [];

  return (
    <div className="rounded-2xl bg-[#0C1326]/95 border border-[#1A274E] shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#050814] via-[#0C1326] to-[#131E3D] border-b border-[#1A274E] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-[#131E3D] border border-[#3DFDCE]/30 text-[#3DFDCE]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC]">
                Digital Twin • Live Corridor Telemetry
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#131E3D] text-[#3DFDCE] border border-[#3DFDCE]/40">
                {currentCorridor.id} ({currentCorridor.totalLengthKm} KM)
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono text-[#00FFE0] bg-[#131E3D] border border-[#00FFE0]/40">
                {corridorAssets.length} Assets Online
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono text-[#B6BFFF] bg-[#131E3D] border border-[#6367FF]/40">
                {corridorTrains.length} Live Trains
              </span>
            </div>
            <p className="text-xs text-[#B6BFFF]">
              {currentCorridor.zone} • {currentCorridor.name} • Continuous condition monitoring & live train tracking
            </p>
          </div>
        </div>

        {/* Real-time Telemetry Controls & Corridor Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Direct Corridor Switcher Dropdown */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-[#050814] border border-[#1A274E] text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#3DFDCE] shrink-0" />
            <span className="text-[10px] text-[#B6BFFF] font-semibold uppercase">Corridor:</span>
            <select
              value={selectedCorridorId}
              onChange={(e) => setSelectedCorridorId(e.target.value)}
              aria-label="Select Railway Corridor"
              className="bg-transparent text-[#3DFDCE] font-mono font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-[#0C1326] text-[#3DFDCE] font-bold">
                🌐 All Corridors ({corridors.length})
              </option>
              {corridors.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0C1326] text-slate-200">
                  {c.id} - {c.name.split("(")[0]} ({c.totalLengthKm} KM)
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#050814] border border-[#1A274E] text-xs">
            <span className={`w-2 h-2 rounded-full ${telemetryTickActive ? "bg-[#3DFDCE] animate-ping" : "bg-slate-500"}`} />
            <span className="font-mono text-[#3DFDCE]">
              {telemetryTickActive ? "Live (5s Tick)" : "Paused"}
            </span>
            <button
              onClick={() => setTelemetryTickActive(!telemetryTickActive)}
              className="p-1 rounded hover:bg-[#131E3D] text-[#B6BFFF] hover:text-[#F8FAFC] transition"
              title={telemetryTickActive ? "Pause simulated tick" : "Resume tick"}
            >
              {telemetryTickActive ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-[#3DFDCE]" />}
            </button>
            <button
              onClick={triggerTelemetryTick}
              className="p-1 rounded hover:bg-[#131E3D] text-[#B6BFFF] hover:text-[#F8FAFC] transition"
              title="Manual Telemetry Step"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#00FFE0]" />
            </button>
          </div>

          {/* Quick Line Filter */}
          <div className="flex items-center bg-[#050814] p-1 rounded-xl border border-[#1A274E] text-xs">
            <button
              onClick={() => setLineFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                lineFilter === "ALL" ? "bg-[#131E3D] text-[#00FFE0] border border-[#00FFE0]/50 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Both Lines
            </button>
            <button
              onClick={() => setLineFilter("UP_LINE")}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                lineFilter === "UP_LINE" ? "bg-[#131E3D] text-[#00FFE0] border border-[#00FFE0]/50 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Up Line
            </button>
            <button
              onClick={() => setLineFilter("DOWN_LINE")}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                lineFilter === "DOWN_LINE" ? "bg-[#131E3D] text-[#00FFE0] border border-[#00FFE0]/50 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Down Line
            </button>
          </div>
        </div>
      </div>

      {/* Layer Toggles & Search Bar */}
      <div className="p-3 bg-[#0C1326] border-b border-[#1A274E] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[#B6BFFF] font-semibold uppercase tracking-wider text-[10px]">Layers:</span>
          <button
            onClick={() => setShowTrains(!showTrains)}
            className={`px-2.5 py-1 rounded-lg border font-mono transition flex items-center space-x-1.5 ${
              showTrains ? "bg-[#131E3D] border-[#3DFDCE]/60 text-[#3DFDCE]" : "bg-[#050814] border-[#1A274E] text-slate-400"
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>Trains ({corridorTrains.length})</span>
          </button>
          <button
            onClick={() => setShowTracks(!showTracks)}
            className={`px-2.5 py-1 rounded-lg border font-mono transition flex items-center space-x-1.5 ${
              showTracks ? "bg-[#131E3D] border-[#8494FF]/60 text-[#8494FF]" : "bg-[#050814] border-[#1A274E] text-slate-400"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Track P-Way ({corridorAssets.filter((a) => a.type === "RAIL_JOINT").length})</span>
          </button>
          <button
            onClick={() => setShowOHE(!showOHE)}
            className={`px-2.5 py-1 rounded-lg border font-mono transition flex items-center space-x-1.5 ${
              showOHE ? "bg-[#131E3D] border-[#3DFDCE]/60 text-[#3DFDCE]" : "bg-[#050814] border-[#1A274E] text-slate-400"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>OHE 25kV ({corridorAssets.filter((a) => a.type === "OHE_CATENARY").length})</span>
          </button>
          <button
            onClick={() => setShowSignals(!showSignals)}
            className={`px-2.5 py-1 rounded-lg border font-mono transition flex items-center space-x-1.5 ${
              showSignals ? "bg-[#131E3D] border-[#6367FF]/60 text-[#8494FF]" : "bg-[#050814] border-[#1A274E] text-slate-400"
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Kavach / S&T ({corridorAssets.filter((a) => a.type === "SIGNAL" || a.type === "POINT_MACHINE" || a.type === "TRACK_CIRCUIT").length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#B6BFFF] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search asset ID (TRK-...), train (12002)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050814] border border-[#1A274E] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:border-[#6367FF]"
          />
        </div>
      </div>

      {/* Main Schematic Grid Canvas */}
      {(() => {
        const totalLength = currentCorridor.totalLengthKm || 120;
        const currentFeature = CORRIDOR_FEATURES[currentCorridor.id] || CORRIDOR_FEATURES["BPL-ET"];
        const featStartX = 50 + Math.min(Math.max((currentFeature.startKm / totalLength) * 900, 0), 800);
        const featEndX = 50 + Math.min(Math.max((currentFeature.endKm / totalLength) * 900, 0), 920);
        const featWidth = Math.max(90, featEndX - featStartX);

        return (
          <div className="p-4 sm:p-6 overflow-x-auto relative">
            <div className="min-w-[1000px] relative pb-6">
              {/* Legend Bar */}
              <div className="flex items-center justify-between mb-4 text-[11px] text-slate-400 font-mono">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm" />
                    <span>Normal (&lt;50% Risk)</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm" />
                    <span>Attention (50-79%)</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block animate-pulse" />
                    <span>Critical (&ge;80% Risk)</span>
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-600/40 text-[10px] sm:text-xs">
                    {currentFeature.name}: KM {currentFeature.startKm} to {currentFeature.endKm} ({currentFeature.badge}) • {currentFeature.warningNote}
                  </span>
                </div>
              </div>

              {/* SVG Schematic Canvas */}
              <div className="relative bg-[#070E12] rounded-xl border border-slate-800/80 p-6 shadow-inner">
                <svg viewBox="0 0 1000 280" className="w-full h-auto select-none">
                  <defs>
                    <linearGradient id="ghatGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity="0.05" />
                      <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity="0.05" />
                    </linearGradient>
                    <pattern id="railTies" width="12" height="20" patternUnits="userSpaceOnUse">
                      <line x1="6" y1="0" x2="6" y2="20" stroke="#334155" strokeWidth="2" />
                    </pattern>
                  </defs>

                  {/* Highlight Backdrop for Special Section */}
                  <rect
                    x={featStartX}
                    y="30"
                    width={featWidth}
                    height="190"
                    fill="url(#ghatGlow)"
                    rx="8"
                    stroke="#F59E0B"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.6"
                  />
                  <text x={featStartX + featWidth / 2} y="48" fill="#F59E0B" fontSize="9" fontWeight="bold" textAnchor="middle">
                    {currentFeature.name.toUpperCase()} ({currentFeature.badge})
                  </text>

                  {/* Station Grid Lines & Labels */}
                  {stations.map((stn) => {
                    const x = 50 + Math.min(Math.max((stn.km / totalLength) * 900, 0), 900);
                    return (
                      <g key={stn.code}>
                        {/* Vertical station guideline */}
                        <line x1={x} y1="55" x2={x} y2="210" stroke="#1E293B" strokeWidth="1" strokeDasharray="2 2" />
                        
                        {/* Station Marker */}
                        <circle cx={x} cy="125" r="4" fill="#050814" stroke="#3DFDCE" strokeWidth="2" />
                        
                        {/* Station Code & Name */}
                        <text x={x} y="228" fill="#F8FAFC" fontSize="10" fontWeight="bold" textAnchor="middle">
                          {stn.code}
                        </text>
                        <text x={x} y="242" fill="#94A3B8" fontSize="8" textAnchor="middle">
                          {stn.name.split("(")[0]}
                        </text>
                        <text x={x} y="254" fill="#10B981" fontSize="7" fontFamily="monospace" textAnchor="middle">
                          KM {stn.km}
                        </text>
                      </g>
                    );
                  })}

                  {/* 1. UP LINE TRACK (Top Track: Y=90) */}
                  {(lineFilter === "ALL" || lineFilter === "UP_LINE") && (
                    <g>
                      {/* Ballast / Sleeper line */}
                      <line x1="40" y1="90" x2="960" y2="90" stroke="#1E293B" strokeWidth="12" />
                      {/* Steel Rail Lines */}
                      <line x1="40" y1="87" x2="960" y2="87" stroke="#475569" strokeWidth="2.5" />
                      <line x1="40" y1="93" x2="960" y2="93" stroke="#475569" strokeWidth="2.5" />
                      <text x="35" y="93" fill="#64748B" fontSize="8" fontWeight="bold" textAnchor="end">
                        UP LINE ◄
                      </text>
                    </g>
                  )}

                  {/* 2. DOWN LINE TRACK (Bottom Track: Y=160) */}
                  {(lineFilter === "ALL" || lineFilter === "DOWN_LINE") && (
                    <g>
                      {/* Ballast / Sleeper line */}
                      <line x1="40" y1="160" x2="960" y2="160" stroke="#1E293B" strokeWidth="12" />
                      {/* Steel Rail Lines */}
                      <line x1="40" y1="157" x2="960" y2="157" stroke="#475569" strokeWidth="2.5" />
                      <line x1="40" y1="163" x2="960" y2="163" stroke="#475569" strokeWidth="2.5" />
                      <text x="35" y="163" fill="#64748B" fontSize="8" fontWeight="bold" textAnchor="end">
                        DOWN LINE ►
                      </text>
                    </g>
                  )}

                  {/* Loop Lines / Siding Paths */}
                  <path
                    d={`M ${Math.max(100, featStartX - 50)} 160 Q ${featStartX - 30} 185 ${featStartX - 10} 185 L ${featStartX + 30} 185 Q ${featStartX + 50} 185 ${featStartX + 70} 160`}
                    fill="none"
                    stroke="#334155"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />
                  <path
                    d={`M ${featStartX + 20} 160 Q ${featStartX + 40} 190 ${featStartX + 60} 190 L ${featStartX + 100} 190 Q ${featStartX + 120} 190 ${featStartX + 140} 160`}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />
                  <text x={featStartX + 75} y="202" fill="#F59E0B" fontSize="7" textAnchor="middle">
                    {currentCorridor.id === "BPL-ET" ? "Barkhera Catch Siding" : `${currentCorridor.id} Loop Siding`}
                  </text>

                  {/* Render Assets Points */}
                  {corridorAssets.map((asset) => {
                    const match = asset.locationKm.match(/KM\s*([\d.]+)/i);
                    const km = match ? parseFloat(match[1]) : 50;
                    const x = 50 + Math.min(Math.max((km / totalLength) * 900, 0), 900);
                    
                    // Position vertically based on asset type
                    let y = 125;
                    if (asset.type === "RAIL_JOINT") {
                      if (!showTracks) return null;
                      y = Math.floor(km) % 2 === 0 ? 80 : 170;
                    } else if (asset.type === "OHE_CATENARY") {
                      if (!showOHE) return null;
                      y = Math.floor(km) % 2 === 0 ? 70 : 180;
                    } else if (asset.type === "SIGNAL" || asset.type === "POINT_MACHINE" || asset.type === "TRACK_CIRCUIT") {
                      if (!showSignals) return null;
                      y = 125;
                    }

                    const color =
                      asset.failureRisk >= 80
                        ? "#EF4444"
                        : asset.failureRisk >= 50
                        ? "#F59E0B"
                        : "#10B981";

                    const isSelected = selectedAsset?.id === asset.id;

                    return (
                      <g
                        key={asset.id}
                        onClick={() => {
                          setSelectedAsset(asset);
                          setSelectedTrain(null);
                        }}
                        className="cursor-pointer group"
                      >
                        {isSelected && (
                          <circle cx={x} cy={y} r="10" fill="none" stroke="#F8FAFC" strokeWidth="1.5" className="animate-ping" />
                        )}
                        <circle
                          cx={x}
                          cy={y}
                          r={asset.failureRisk >= 80 ? "5" : "3.5"}
                          fill={color}
                          stroke="#050814"
                          strokeWidth="1.5"
                          className="transition-transform group-hover:scale-150"
                        />
                      </g>
                    );
                  })}

                  {/* Render Moving Trains */}
                  {corridorTrains.map((trn) => {
                    const x = 50 + Math.min(Math.max((trn.currentKm / totalLength) * 900, 0), 900);
                    const y = trn.direction === "UP" ? 90 : 160;
                    const isSelected = selectedTrain?.id === trn.id;

                    const trainColor =
                      trn.priority === 1
                        ? "#38BDF8" // Premium Sky Cyan (Shatabdi/Vande Bharat)
                        : trn.priority === 2
                        ? "#10B981" // Superfast Emerald
                        : trn.priority === 3
                        ? "#F59E0B" // Express Amber
                        : trn.priority === 4
                        ? "#A855F7" // Freight Purple
                        : "#EC4899"; // Work Train Rose

                    return (
                      <g
                        key={trn.id}
                        onClick={() => {
                          setSelectedTrain(trn);
                          setSelectedAsset(null);
                        }}
                        className="cursor-pointer group"
                      >
                        {/* Glowing Aura if selected or priority */}
                        <circle
                          cx={x}
                          cy={y}
                          r={trn.priority === 1 ? "12" : "10"}
                          fill={trainColor}
                          opacity={isSelected ? "0.4" : "0.2"}
                          className="animate-pulse"
                        />

                        {/* Train Icon Polygon (Directional chevron) */}
                        {trn.direction === "DOWN" ? (
                          <polygon
                            points={`${x - 9},${y - 6} ${x + 9},${y} ${x - 9},${y + 6}`}
                            fill={trainColor}
                            stroke="#F8FAFC"
                            strokeWidth="1.5"
                          />
                        ) : (
                          <polygon
                            points={`${x + 9},${y - 6} ${x - 9},${y} ${x + 9},${y + 6}`}
                            fill={trainColor}
                            stroke="#F8FAFC"
                            strokeWidth="1.5"
                          />
                        )}

                        {/* Train Label */}
                        <text
                          x={x}
                          y={trn.direction === "UP" ? y - 14 : y + 20}
                          fill="#F8FAFC"
                          fontSize="8"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {trn.trainNumber} ({trn.currentSpeedKmph}k)
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Selected Asset or Train Telemetry Detail Drawer */}
      {(selectedAsset || selectedTrain) && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#050814] to-[#0C1326] border-t border-[#1A274E] flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
          {selectedAsset && (
            <div className="w-full flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      selectedAsset.failureRisk >= 80
                        ? "bg-rose-950 text-rose-300 border border-rose-600"
                        : selectedAsset.failureRisk >= 50
                        ? "bg-amber-950 text-amber-300 border border-amber-600"
                        : "bg-[#131E3D] text-[#3DFDCE] border border-[#3DFDCE]/40"
                    }`}
                  >
                    Risk: {selectedAsset.failureRisk}% ({selectedAsset.status})
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">{selectedAsset.id}</span>
                  <span className="text-xs text-[#B6BFFF] font-medium">({selectedAsset.type})</span>
                </div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">{selectedAsset.name}</h3>
                <p className="text-xs text-[#B6BFFF] font-mono">Location: {selectedAsset.locationKm}</p>
              </div>

              {/* Sensor Metrics Readout */}
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                {selectedAsset.telemetry.railTemperature !== undefined && (
                  <div className="px-3 py-1.5 rounded-lg bg-[#050814] border border-[#1A274E]">
                    <span className="text-[#B6BFFF] text-[10px] block">Rail Temp</span>
                    <span className={`font-bold ${selectedAsset.telemetry.railTemperature > 52 ? "text-[#FF2A6D] font-black" : "text-[#3DFDCE]"}`}>
                      {selectedAsset.telemetry.railTemperature}°C
                    </span>
                  </div>
                )}
                {selectedAsset.telemetry.vibrationAmplitude !== undefined && (
                  <div className="px-3 py-1.5 rounded-lg bg-[#050814] border border-[#1A274E]">
                    <span className="text-[#B6BFFF] text-[10px] block">Vibration</span>
                    <span className="text-[#00FFE0] font-bold">{selectedAsset.telemetry.vibrationAmplitude} mm/s</span>
                  </div>
                )}
                {selectedAsset.telemetry.oheContactWireTension !== undefined && (
                  <div className="px-3 py-1.5 rounded-lg bg-[#050814] border border-[#1A274E]">
                    <span className="text-[#B6BFFF] text-[10px] block">Wire Tension</span>
                    <span className={`font-bold ${selectedAsset.telemetry.oheContactWireTension < 10.0 ? "text-[#FFD600]" : "text-[#3DFDCE]"}`}>
                      {selectedAsset.telemetry.oheContactWireTension} kN
                    </span>
                  </div>
                )}
                {selectedAsset.telemetry.pantographContactWear !== undefined && (
                  <div className="px-3 py-1.5 rounded-lg bg-[#050814] border border-[#1A274E]">
                    <span className="text-[#B6BFFF] text-[10px] block">Panto Wear</span>
                    <span className="text-slate-200 font-bold">{selectedAsset.telemetry.pantographContactWear} mm</span>
                  </div>
                )}
                {selectedAsset.telemetry.trackGeometryGaugeDeviation !== undefined && (
                  <div className="px-3 py-1.5 rounded-lg bg-[#050814] border border-[#1A274E]">
                    <span className="text-[#B6BFFF] text-[10px] block">Gauge Dev</span>
                    <span className={`font-bold ${Math.abs(selectedAsset.telemetry.trackGeometryGaugeDeviation) > 4 ? "text-[#FF2A6D]" : "text-slate-200"}`}>
                      {selectedAsset.telemetry.trackGeometryGaugeDeviation > 0 ? "+" : ""}{selectedAsset.telemetry.trackGeometryGaugeDeviation} mm
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const match = selectedAsset.locationKm.match(/KM\s*([\d.]+)/i);
                    const km = match ? parseFloat(match[1]) : 56;
                    createBlockRequest({
                      title: `Maintenance on ${selectedAsset.id} (${selectedAsset.name})`,
                      departmentId: selectedAsset.departmentResponsible,
                      corridorId: selectedCorridorId,
                      fromKm: Math.max(0, km - 1.5),
                      toKm: km + 1.5,
                      locationSection: selectedAsset.locationKm,
                      description: `Initiated from Digital Twin inspection: Failure risk ${selectedAsset.failureRisk}%.`,
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#6367FF] to-[#8494FF] text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Request Block</span>
                </button>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="px-3 py-1.5 rounded-lg bg-[#131E3D] hover:bg-[#1A274E] text-slate-300 text-xs transition border border-[#1A274E]"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {selectedTrain && (
            <div className="w-full flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#131E3D] text-[#00FFE0] border border-[#00FFE0]/40">
                    Priority {selectedTrain.priority} • {selectedTrain.trainType}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    #{selectedTrain.trainNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      selectedTrain.status === "RUNNING_ON_TIME"
                        ? "bg-[#131E3D] text-[#3DFDCE] border border-[#3DFDCE]/40"
                        : "bg-amber-950 text-amber-300"
                    }`}
                  >
                    {selectedTrain.status} ({selectedTrain.delayMinutes > 0 ? `+${selectedTrain.delayMinutes}m` : "On Time"})
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">{selectedTrain.trainName}</h3>
                <p className="text-xs text-[#B6BFFF] font-mono">
                  {selectedTrain.origin} ➔ {selectedTrain.destination} • Loco: {selectedTrain.locoNumber}
                </p>
              </div>

              {/* Train Metrics */}
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                <div className="px-3 py-1.5 rounded-lg bg-[#050814] border border-[#1A274E]">
                  <span className="text-[#B6BFFF] text-[10px] block">Current Speed</span>
                  <span className="text-[#3DFDCE] font-bold">{selectedTrain.currentSpeedKmph} km/h</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-[#050814] border border-[#1A274E]">
                  <span className="text-[#B6BFFF] text-[10px] block">Current Position</span>
                  <span className="text-[#00FFE0] font-bold">KM {selectedTrain.currentKm}</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-[#050814] border border-[#1A274E]">
                  <span className="text-[#B6BFFF] text-[10px] block">Approaching Block</span>
                  <span className="text-[#FFD600] font-bold">{selectedTrain.nextBlockSection}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedTrain(null)}
                className="px-3 py-1.5 rounded-lg bg-[#131E3D] hover:bg-[#1A274E] text-slate-300 text-xs transition border border-[#1A274E]"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
