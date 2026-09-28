"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRailPlan, ZONE_CORRIDOR_MAP } from "@/context/RailPlanContext";
import { DepartmentId, CorridorAsset } from "@/lib/types";
import {
  Activity,
  Radio,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Wrench,
  ShieldAlert,
  Gauge,
  Thermometer,
  Zap,
  TrendingUp,
  Compass,
  Waves,
  Layers,
  Filter,
  Search,
  ArrowUpRight,
  Download,
  Info,
  SlidersHorizontal,
  X,
  Clock,
  Eye,
  Building2,
  FileText
} from "lucide-react";

export default function DepartmentTelemetryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    assets,
    corridors,
    selectedCorridorId,
    setSelectedCorridorId,
    telemetryTickActive,
    setTelemetryTickActive,
    triggerTelemetryTick,
    lastTelemetryTickTime,
  } = useRailPlan();

  // Active filters
  const userDept = user?.departmentId || "ENG";
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CRITICAL" | "ATTENTION" | "NORMAL">("ALL");
  const [corridorFilter, setCorridorFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAssetModal, setSelectedAssetModal] = useState<CorridorAsset | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Department counts
  const deptCounts = useMemo(() => {
    const counts: Record<string, { total: number; critical: number; attention: number }> = {
      ALL: { total: assets.length, critical: 0, attention: 0 },
      ENG: { total: 0, critical: 0, attention: 0 },
      ELEC: { total: 0, critical: 0, attention: 0 },
      SNT: { total: 0, critical: 0, attention: 0 },
      SFTY: { total: 0, critical: 0, attention: 0 },
    };

    assets.forEach((a) => {
      const dept = a.departmentResponsible;
      if (counts[dept]) {
        counts[dept].total += 1;
        if (a.status === "CRITICAL") counts[dept].critical += 1;
        if (a.status === "ATTENTION") counts[dept].attention += 1;
      }
      if (a.status === "CRITICAL") counts.ALL.critical += 1;
      if (a.status === "ATTENTION") counts.ALL.attention += 1;
    });

    return counts;
  }, [assets]);

  // Filtered assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Department filter
      if (selectedDeptFilter !== "ALL" && asset.departmentResponsible !== selectedDeptFilter) {
        return false;
      }

      // Corridor filter
      if (corridorFilter !== "ALL" && asset.corridorId !== corridorFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "ALL" && asset.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = asset.id.toLowerCase().includes(q);
        const matchesName = asset.name.toLowerCase().includes(q);
        const matchesKm = asset.locationKm.toLowerCase().includes(q);
        const matchesCorr = asset.corridorId.toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesKm && !matchesCorr) {
          return false;
        }
      }

      return true;
    });
  }, [assets, selectedDeptFilter, corridorFilter, statusFilter, searchQuery]);

  // Key KPI totals across filtered dataset
  const kpiData = useMemo(() => {
    const total = filteredAssets.length;
    const critical = filteredAssets.filter((a) => a.status === "CRITICAL").length;
    const attention = filteredAssets.filter((a) => a.status === "ATTENTION").length;
    const normal = filteredAssets.filter((a) => a.status === "NORMAL").length;
    const avgRisk = total > 0 ? Math.round(filteredAssets.reduce((acc, a) => acc + a.failureRisk, 0) / total) : 0;
    const safetyIndex = Math.max(0, 100 - avgRisk);

    return { total, critical, attention, normal, avgRisk, safetyIndex };
  }, [filteredAssets]);

  // Handle Export
  const handleExportCSV = () => {
    const headers = "Asset ID,Name,Department,Corridor,Location KM,Status,Failure Risk %,Primary Telemetry,Next Inspection\n";
    const rows = filteredAssets.map((a) => {
      let reading = "";
      if (a.departmentResponsible === "ENG") {
        reading = `Rail Temp: ${a.telemetry.railTemperature || a.telemetry.temperature || "N/A"}C | Vib: ${a.telemetry.vibrationAmplitude || a.telemetry.vibration || "N/A"}mm/s`;
      } else if (a.departmentResponsible === "ELEC") {
        reading = `OHE Tension: ${a.telemetry.oheContactWireTension || "N/A"}kN | Wear: ${a.telemetry.pantographContactWear || "N/A"}mm`;
      } else if (a.departmentResponsible === "SNT") {
        reading = `Point Gap: ${a.telemetry.switchOpeningMm || "N/A"}mm | Volt: ${a.telemetry.voltage || "N/A"}V`;
      } else {
        reading = `Pier Tilt: ${a.telemetry.pierTiltDeg || 0.05}deg | Scour: ${a.telemetry.scourDepthM || 0}m`;
      }
      return `"${a.id}","${a.name}","${a.departmentResponsible}","${a.corridorId}","${a.locationKm}","${a.status}",${a.failureRisk},"${reading}","${a.nextRecommendedInspection}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `RailPlan_IoT_Telemetry_${selectedDeptFilter}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice("RDSO Statutory Telemetry Log Exported Successfully (CSV format).");
    setTimeout(() => setExportNotice(null), 4000);
  };

  // Helper badge color
  const getDeptColor = (dept: string) => {
    switch (dept) {
      case "ENG":
        return {
          bg: "bg-[#022642]",
          border: "border-[#2DC7D5]",
          text: "text-[#2DC7D5]",
          badge: "bg-[#2DC7D5] text-black",
          name: "Civil Engineering (P-Way)",
        };
      case "ELEC":
        return {
          bg: "bg-[#002620]",
          border: "border-[#00FFD2]",
          text: "text-[#00FFD2]",
          badge: "bg-[#00FFD2] text-black",
          name: "Electrical / 25kV Traction",
        };
      case "SNT":
        return {
          bg: "bg-[#161233]",
          border: "border-[#6367FF]",
          text: "text-[#A2A5FF]",
          badge: "bg-[#6367FF] text-white",
          name: "Signal & Telecom (Kavach)",
        };
      case "SFTY":
        return {
          bg: "bg-[#2b0816]",
          border: "border-[#FB2077]",
          text: "text-[#FB2077]",
          badge: "bg-[#FB2077] text-white",
          name: "Safety Directorate",
        };
      default:
        return {
          bg: "bg-[#022642]",
          border: "border-slate-600",
          text: "text-slate-300",
          badge: "bg-slate-700 text-white",
          name: "Indian Railways Directorate",
        };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Cyber Brutalist Breadcrumb */}
      <div className="bg-[#000D18] border-2 border-black p-5 shadow-[4px_4px_0_#000000]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 text-[11px] font-black tracking-wider uppercase bg-[#00FFD2] text-black border border-black shadow-[1px_1px_0_#000000]">
                IoT TELEMETRY HUB
              </span>
              <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#022642] text-[#2DC7D5] border border-black">
                RDSO / IRPWM 2020 SPEC
              </span>
              {user?.departmentId && (
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#011526] text-amber-400 border border-black">
                  ACTIVE DEPT: {user.departmentId}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
              <Activity className="w-7 h-7 text-[#00FFD2]" />
              IoT Sensor Monitoring & Diagnostics
            </h1>
            <p className="text-sm text-slate-300 font-mono mt-1">
              Real-time condition-based asset telemetry across Civil Track (P-Way), 25kV OHE Catenary, Signal & Kavach TCAS, and Safety Directorate.
            </p>
          </div>

          {/* Telemetry Stream Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-[#011526] border-2 border-black px-3.5 py-2 flex items-center gap-3 shadow-[2px_2px_0_#000000]">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    telemetryTickActive
                      ? "bg-[#00FFD2] animate-ping"
                      : "bg-amber-400"
                  }`}
                />
                <span className="text-xs font-mono font-black text-white uppercase">
                  {telemetryTickActive ? "MQTT Stream (5s)" : "Stream Paused"}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 border-l border-slate-700 pl-3">
                {lastTelemetryTickTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>

            <button
              onClick={() => setTelemetryTickActive(!telemetryTickActive)}
              className="bg-[#022642] hover:bg-[#033b66] text-white text-xs font-mono font-bold px-3 py-2 border-2 border-black shadow-[2px_2px_0_#000000] flex items-center gap-1.5 transition-colors"
              title={telemetryTickActive ? "Pause simulated telemetry stream" : "Resume simulated stream"}
            >
              {telemetryTickActive ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#00FFD2]" />
                  <span>Resume</span>
                </>
              )}
            </button>

            <button
              onClick={triggerTelemetryTick}
              className="bg-[#00FFD2] hover:bg-[#2bfde0] text-black text-xs font-mono font-black px-3.5 py-2 border-2 border-black shadow-[2px_2px_0_#000000] flex items-center gap-1.5 transition-colors"
              title="Poll latest sensor values immediately"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Poll Now</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="bg-[#FFFF00] hover:bg-[#ffff4d] text-black text-xs font-mono font-black px-3.5 py-2 border-2 border-black shadow-[2px_2px_0_#000000] flex items-center gap-1.5 transition-colors"
              title="Export sensor log CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {exportNotice && (
          <div className="mt-3 bg-[#00FFD2] text-black font-mono font-bold text-xs p-2 border border-black flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{exportNotice}</span>
          </div>
        )}
      </div>

      {/* Department Selector Tabs (All Departments Supported) */}
      <div className="bg-[#000D18] border-2 border-black p-3 shadow-[4px_4px_0_#000000]">
        <div className="text-xs font-mono font-bold text-slate-400 mb-2 uppercase flex items-center justify-between">
          <span>Filter by Railway Directorate / Department:</span>
          <span className="text-[#00FFD2]">Showing {filteredAssets.length} of {assets.length} IoT Nodes</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {/* ALL */}
          <button
            onClick={() => setSelectedDeptFilter("ALL")}
            className={`p-3 text-left border-2 transition-all ${
              selectedDeptFilter === "ALL"
                ? "bg-[#022642] border-[#00FFD2] shadow-[2px_2px_0_#00FFD2]"
                : "bg-[#011526] border-slate-700 hover:border-slate-500"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-white">All Departments</span>
              <span className="text-xs font-mono font-bold px-1.5 py-0.2 bg-black text-[#00FFD2] border border-slate-700">
                {deptCounts.ALL.total}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-2">
              <span className="text-[#FB2077] font-bold">{deptCounts.ALL.critical} Crit</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{deptCounts.ALL.attention} Warn</span>
            </div>
          </button>

          {/* ENG / Civil */}
          <button
            onClick={() => setSelectedDeptFilter("ENG")}
            className={`p-3 text-left border-2 transition-all relative ${
              selectedDeptFilter === "ENG"
                ? "bg-[#022642] border-[#2DC7D5] shadow-[2px_2px_0_#2DC7D5]"
                : "bg-[#011526] border-slate-700 hover:border-slate-500"
            }`}
          >
            {userDept === "ENG" && (
              <span className="absolute -top-2 right-2 text-[9px] font-mono font-black bg-[#2DC7D5] text-black px-1.5 py-0.2 border border-black uppercase">
                YOUR DEPT
              </span>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#2DC7D5]">Civil (P-Way)</span>
              <span className="text-xs font-mono font-bold px-1.5 py-0.2 bg-black text-[#2DC7D5] border border-slate-700">
                {deptCounts.ENG.total}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-2">
              <span className="text-[#FB2077] font-bold">{deptCounts.ENG.critical} Crit</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{deptCounts.ENG.attention} Warn</span>
            </div>
          </button>

          {/* ELEC / Electrical */}
          <button
            onClick={() => setSelectedDeptFilter("ELEC")}
            className={`p-3 text-left border-2 transition-all relative ${
              selectedDeptFilter === "ELEC"
                ? "bg-[#002620] border-[#00FFD2] shadow-[2px_2px_0_#00FFD2]"
                : "bg-[#011526] border-slate-700 hover:border-slate-500"
            }`}
          >
            {userDept === "ELEC" && (
              <span className="absolute -top-2 right-2 text-[9px] font-mono font-black bg-[#00FFD2] text-black px-1.5 py-0.2 border border-black uppercase">
                YOUR DEPT
              </span>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#00FFD2]">Electrical (OHE)</span>
              <span className="text-xs font-mono font-bold px-1.5 py-0.2 bg-black text-[#00FFD2] border border-slate-700">
                {deptCounts.ELEC.total}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-2">
              <span className="text-[#FB2077] font-bold">{deptCounts.ELEC.critical} Crit</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{deptCounts.ELEC.attention} Warn</span>
            </div>
          </button>

          {/* SNT / Signal & Telecom */}
          <button
            onClick={() => setSelectedDeptFilter("SNT")}
            className={`p-3 text-left border-2 transition-all relative ${
              selectedDeptFilter === "SNT"
                ? "bg-[#161233] border-[#6367FF] shadow-[2px_2px_0_#6367FF]"
                : "bg-[#011526] border-slate-700 hover:border-slate-500"
            }`}
          >
            {userDept === "SNT" && (
              <span className="absolute -top-2 right-2 text-[9px] font-mono font-black bg-[#6367FF] text-white px-1.5 py-0.2 border border-black uppercase">
                YOUR DEPT
              </span>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#A2A5FF]">Signal (Kavach)</span>
              <span className="text-xs font-mono font-bold px-1.5 py-0.2 bg-black text-[#A2A5FF] border border-slate-700">
                {deptCounts.SNT.total}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-2">
              <span className="text-[#FB2077] font-bold">{deptCounts.SNT.critical} Crit</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{deptCounts.SNT.attention} Warn</span>
            </div>
          </button>

          {/* SFTY / Safety Directorate */}
          <button
            onClick={() => setSelectedDeptFilter("SFTY")}
            className={`p-3 text-left border-2 transition-all relative ${
              selectedDeptFilter === "SFTY"
                ? "bg-[#2b0816] border-[#FB2077] shadow-[2px_2px_0_#FB2077]"
                : "bg-[#011526] border-slate-700 hover:border-slate-500"
            }`}
          >
            {userDept === "SFTY" && (
              <span className="absolute -top-2 right-2 text-[9px] font-mono font-black bg-[#FB2077] text-white px-1.5 py-0.2 border border-black uppercase">
                YOUR DEPT
              </span>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#FB2077]">Safety Directorate</span>
              <span className="text-xs font-mono font-bold px-1.5 py-0.2 bg-black text-[#FB2077] border border-slate-700">
                {deptCounts.SFTY.total}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-2">
              <span className="text-[#FB2077] font-bold">{deptCounts.SFTY.critical} Crit</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{deptCounts.SFTY.attention} Warn</span>
            </div>
          </button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-[#000D18] border-2 border-black p-4 shadow-[3px_3px_0_#000000]">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase">Monitored Nodes</div>
          <div className="text-2xl lg:text-3xl font-black text-white font-mono mt-1 flex items-baseline justify-between">
            <span>{kpiData.total}</span>
            <span className="text-[11px] font-mono text-[#00FFD2] font-normal">100% Online</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-2 flex items-center gap-1">
            <Radio className="w-3 h-3 text-[#00FFD2]" />
            <span>Active IoT Telemetry</span>
          </div>
        </div>

        <div className="bg-[#000D18] border-2 border-black p-4 shadow-[3px_3px_0_#000000]">
          <div className="text-xs font-mono font-bold text-[#FB2077] uppercase flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Critical Alarms</span>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-[#FB2077] font-mono mt-1 flex items-baseline justify-between">
            <span>{kpiData.critical}</span>
            <span className="text-[11px] font-mono text-[#FB2077] font-bold">Action Needed</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-2">
            Threshold exceeded (Risk ≥ 80%)
          </div>
        </div>

        <div className="bg-[#000D18] border-2 border-black p-4 shadow-[3px_3px_0_#000000]">
          <div className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Attention / Warning</span>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-amber-400 font-mono mt-1 flex items-baseline justify-between">
            <span>{kpiData.attention}</span>
            <span className="text-[11px] font-mono text-amber-400 font-bold">Watchlist</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-2">
            Degrading trend (Risk 50-79%)
          </div>
        </div>

        <div className="bg-[#000D18] border-2 border-black p-4 shadow-[3px_3px_0_#000000]">
          <div className="text-xs font-mono font-bold text-[#00FFD2] uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Nominal Sensors</span>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-[#00FFD2] font-mono mt-1 flex items-baseline justify-between">
            <span>{kpiData.normal}</span>
            <span className="text-[11px] font-mono text-slate-400 font-normal">Safe Range</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-2">
            Normal parameters (Risk &lt; 50%)
          </div>
        </div>

        <div className="bg-[#000D18] border-2 border-black p-4 shadow-[3px_3px_0_#000000] col-span-2 lg:col-span-1">
          <div className="text-xs font-mono font-bold text-[#2DC7D5] uppercase flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Safety Health Index</span>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white font-mono mt-1 flex items-baseline justify-between">
            <span>{kpiData.safetyIndex}%</span>
            <span className="text-[11px] font-mono text-[#00FFD2] font-bold">RDSO Compliant</span>
          </div>
          <div className="w-full bg-slate-800 h-2 mt-2 border border-black overflow-hidden">
            <div
              className={`h-full ${
                kpiData.safetyIndex > 80
                  ? "bg-[#00FFD2]"
                  : kpiData.safetyIndex > 60
                  ? "bg-amber-400"
                  : "bg-[#FB2077]"
              }`}
              style={{ width: `${kpiData.safetyIndex}%` }}
            />
          </div>
        </div>
      </div>

      {/* Critical Alarm Alert Banner if Any Critical Sensors Exist */}
      {kpiData.critical > 0 && (
        <div className="bg-[#2b0816] border-2 border-[#FB2077] p-3.5 shadow-[4px_4px_0_#000000] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#FB2077] animate-ping flex-shrink-0" />
            <div>
              <div className="text-xs font-mono font-black text-[#FB2077] uppercase tracking-wide">
                STATUTORY SAFETY ALERT: {kpiData.critical} CRITICAL TELEMETRY EXCURSIONS DETECTED
              </div>
              <div className="text-xs text-slate-300 font-mono mt-0.5">
                Immediate maintenance block sanction recommended to prevent service disruption or rail/OHE failure.
              </div>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter("CRITICAL")}
            className="bg-[#FB2077] hover:bg-[#ff3b88] text-white text-xs font-mono font-black px-3 py-1.5 border border-black shadow-[2px_2px_0_#000000] uppercase transition-colors self-start md:self-auto"
          >
            Filter Critical Only
          </button>
        </div>
      )}

      {/* Department Statutory Parameter Guidelines Spotlight */}
      <div className="bg-[#000D18] border-2 border-black p-4 shadow-[4px_4px_0_#000000]">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="text-xs font-mono font-black text-white uppercase tracking-wider flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#00FFD2]" />
            <span>RDSO / Statutory Engineering Safety Thresholds Matrix</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Source: Indian Railways Permanent Way Manual (IRPWM) & ACTM Vol II
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-xs font-mono">
          {/* Civil Spec */}
          <div className="bg-[#011526] border border-[#2DC7D5]/40 p-3">
            <div className="font-black text-[#2DC7D5] uppercase mb-1.5 flex items-center justify-between">
              <span>Civil Track (ENG)</span>
              <span className="text-[10px] bg-[#2DC7D5]/20 px-1 text-[#2DC7D5]">IRPWM 804</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• Rail Temp: Safe &lt;50°C | Buckling &gt;60°C</li>
              <li>• Vibration RMS: Safe &lt;2.5 mm/s | Alert &gt;4.0 mm/s</li>
              <li>• Gauge Deviation: Nominal -4 to +12 mm</li>
              <li>• Track Quality Index (TQI): Target &lt;36.0</li>
            </ul>
          </div>

          {/* Electrical Spec */}
          <div className="bg-[#011526] border border-[#00FFD2]/40 p-3">
            <div className="font-black text-[#00FFD2] uppercase mb-1.5 flex items-center justify-between">
              <span>25kV Traction (ELEC)</span>
              <span className="text-[10px] bg-[#00FFD2]/20 px-1 text-[#00FFD2]">ACTM Vol-II</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• Contact Wire Tension: 10.0 - 14.0 kN</li>
              <li>• Pantograph Wear: Safe &lt;3.5mm | Snap &gt;4.5mm</li>
              <li>• Catenary Stagger: ±200 mm nominal</li>
              <li>• Feeder Voltage: 25.0 kV ± 10% tolerance</li>
            </ul>
          </div>

          {/* S&T Spec */}
          <div className="bg-[#011526] border border-[#6367FF]/40 p-3">
            <div className="font-black text-[#A2A5FF] uppercase mb-1.5 flex items-center justify-between">
              <span>Signal & Telecom (SNT)</span>
              <span className="text-[10px] bg-[#6367FF]/20 px-1 text-[#A2A5FF]">SEM Part-II</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• Point Throw Time: &lt;5.0 sec (143mm stroke)</li>
              <li>• Switch Rail Opening: 115 ± 3 mm</li>
              <li>• Kavach Balise RSSI: &gt; -75 dBm nominal</li>
              <li>• Dual Axle Counter: 24.0 V DC (±1.5V)</li>
            </ul>
          </div>

          {/* Safety Spec */}
          <div className="bg-[#011526] border border-[#FB2077]/40 p-3">
            <div className="font-black text-[#FB2077] uppercase mb-1.5 flex items-center justify-between">
              <span>Safety Directorate (SFTY)</span>
              <span className="text-[10px] bg-[#FB2077]/20 px-1 text-[#FB2077]">CRS Directive</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• Bridge Pier Tilt: Safe &lt;0.15° | Red &gt;0.25°</li>
              <li>• Riverbed Scour Depth: Safe &lt;1.5m</li>
              <li>• Rockfall Tripwire: Continuous 24/7 Loop</li>
              <li>• Axle Box Bearing Temp: &lt;60°C nominal</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#000D18] border-2 border-black p-4 shadow-[4px_4px_0_#000000]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sensor ID (e.g. TRK-BPL-124), name, KM location, or corridor..."
              className="w-full bg-[#011526] border-2 border-slate-700 focus:border-[#00FFD2] text-white pl-9 pr-3 py-2 text-xs font-mono placeholder:text-slate-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Corridor Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 whitespace-nowrap">Corridor:</span>
            <select
              value={corridorFilter}
              onChange={(e) => setCorridorFilter(e.target.value)}
              className="bg-[#011526] border-2 border-slate-700 text-white text-xs font-mono px-3 py-2 outline-none focus:border-[#00FFD2]"
            >
              <option value="ALL">All 10 National Corridors</option>
              {corridors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} - {c.name.split("(")[0].trim()}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 whitespace-nowrap">Status:</span>
            <div className="flex items-center border-2 border-slate-700 bg-[#011526] p-0.5">
              {(["ALL", "CRITICAL", "ATTENTION", "NORMAL"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-[11px] font-mono font-bold uppercase transition-colors ${
                    statusFilter === st
                      ? st === "CRITICAL"
                        ? "bg-[#FB2077] text-white"
                        : st === "ATTENTION"
                        ? "bg-amber-400 text-black"
                        : st === "NORMAL"
                        ? "bg-[#00FFD2] text-black"
                        : "bg-[#022642] text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Sensor Matrix Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <span>Active Sensor Telemetry Feeds ({filteredAssets.length} displayed)</span>
          <span>Click any card for waveform diagnosis or to raise a maintenance block</span>
        </div>

        {filteredAssets.length === 0 ? (
          <div className="bg-[#000D18] border-2 border-black p-12 text-center shadow-[4px_4px_0_#000000]">
            <Info className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <div className="text-base font-bold text-white font-mono uppercase">
              No IoT Telemetry Nodes Found
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">
              No sensors match the selected filters ({selectedDeptFilter}, {statusFilter}, {corridorFilter}).
            </div>
            <button
              onClick={() => {
                setSelectedDeptFilter("ALL");
                setStatusFilter("ALL");
                setCorridorFilter("ALL");
                setSearchQuery("");
              }}
              className="mt-4 bg-[#00FFD2] text-black font-mono font-bold text-xs px-4 py-2 border border-black shadow-[2px_2px_0_#000000]"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => {
              const deptStyle = getDeptColor(asset.departmentResponsible);
              const isCrit = asset.status === "CRITICAL";
              const isAttn = asset.status === "ATTENTION";

              // Extract primary sensor readings
              const railTemp = asset.telemetry.railTemperature || asset.telemetry.temperature;
              const vibration = asset.telemetry.vibrationAmplitude || asset.telemetry.vibration;
              const oheTension = asset.telemetry.oheContactWireTension;
              const pantWear = asset.telemetry.pantographContactWear;
              const gaugeDev = asset.telemetry.trackGeometryGaugeDeviation;
              const switchOpen = asset.telemetry.switchOpeningMm;
              const voltage = asset.telemetry.voltage;
              const pierTilt = asset.telemetry.pierTiltDeg;
              const scourDepth = asset.telemetry.scourDepthM;

              return (
                <div
                  key={asset.id}
                  className={`border-2 border-black p-4 transition-all shadow-[4px_4px_0_#000000] flex flex-col justify-between ${
                    isCrit
                      ? "bg-[#18040d] border-l-4 border-l-[#FB2077]"
                      : isAttn
                      ? "bg-[#191505] border-l-4 border-l-amber-400"
                      : "bg-[#000D18] hover:bg-[#011526]"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-black text-white px-2 py-0.5 bg-black border border-slate-700">
                            {asset.id}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 border border-black ${deptStyle.badge}`}
                          >
                            {asset.departmentResponsible}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-[#011526] px-1.5 py-0.5 border border-slate-800">
                            {asset.corridorId}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-white mt-1 line-clamp-1">
                          {asset.name}
                        </h3>
                        <div className="text-[11px] font-mono text-slate-400">
                          {asset.locationKm}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-mono font-black px-2 py-0.5 border border-black uppercase flex-shrink-0 ${
                          isCrit
                            ? "bg-[#FB2077] text-white animate-pulse"
                            : isAttn
                            ? "bg-amber-400 text-black"
                            : "bg-[#00FFD2] text-black"
                        }`}
                      >
                        {asset.status}
                      </span>
                    </div>

                    {/* Telemetry Sensor Gauges Matrix */}
                    <div className="bg-[#011526] border border-slate-800 p-2.5 my-3 space-y-2">
                      {/* Civil Track Metrics */}
                      {asset.departmentResponsible === "ENG" && (
                        <>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Thermometer className="w-3 h-3 text-[#2DC7D5]" />
                              Rail Temperature:
                            </span>
                            <span
                              className={`font-black ${
                                (railTemp || 0) > 52
                                  ? "text-[#FB2077] font-black"
                                  : (railTemp || 0) > 46
                                  ? "text-amber-400 font-bold"
                                  : "text-[#2DC7D5]"
                              }`}
                            >
                              {railTemp !== undefined ? `${railTemp}°C` : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Activity className="w-3 h-3 text-[#2DC7D5]" />
                              Vibration Amplitude:
                            </span>
                            <span
                              className={`font-black ${
                                (vibration || 0) > 4.0
                                  ? "text-[#FB2077]"
                                  : "text-slate-200"
                              }`}
                            >
                              {vibration !== undefined ? `${vibration} mm/s` : "N/A"}
                            </span>
                          </div>
                          {gaugeDev !== undefined && (
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-slate-400">Gauge Deviation:</span>
                              <span
                                className={`font-black ${
                                  Math.abs(gaugeDev) > 4 ? "text-amber-400" : "text-slate-300"
                                }`}
                              >
                                {gaugeDev > 0 ? `+${gaugeDev}` : gaugeDev} mm
                              </span>
                            </div>
                          )}
                        </>
                      )}

                      {/* Electrical OHE Metrics */}
                      {asset.departmentResponsible === "ELEC" && (
                        <>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Zap className="w-3 h-3 text-[#00FFD2]" />
                              Catenary Tension:
                            </span>
                            <span
                              className={`font-black ${
                                (oheTension || 12) < 10.0
                                  ? "text-[#FB2077]"
                                  : "text-[#00FFD2]"
                              }`}
                            >
                              {oheTension !== undefined ? `${oheTension} kN` : "11.8 kN"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400">Pantograph Strip Wear:</span>
                            <span
                              className={`font-black ${
                                (pantWear || 2) > 3.8 ? "text-[#FB2077]" : "text-slate-200"
                              }`}
                            >
                              {pantWear !== undefined ? `${pantWear} mm` : "1.8 mm"}
                            </span>
                          </div>
                          {asset.telemetry.catenaryStaggerMm !== undefined && (
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-slate-400">Catenary Stagger:</span>
                              <span className="text-slate-300">
                                {asset.telemetry.catenaryStaggerMm} mm
                              </span>
                            </div>
                          )}
                        </>
                      )}

                      {/* Signal & Telecom Metrics */}
                      {asset.departmentResponsible === "SNT" && (
                        <>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Radio className="w-3 h-3 text-[#A2A5FF]" />
                              Point Switch Clearance:
                            </span>
                            <span
                              className={`font-black ${
                                switchOpen && Math.abs(switchOpen - 115) > 2.0
                                  ? "text-[#FB2077]"
                                  : "text-[#A2A5FF]"
                              }`}
                            >
                              {switchOpen !== undefined ? `${switchOpen} mm` : "115.0 mm"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400">Operating Voltage:</span>
                            <span className="text-slate-200">
                              {voltage !== undefined ? `${voltage} V DC` : "24.0 V"}
                            </span>
                          </div>
                          {asset.telemetry.aftcFrequencyHz && (
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-slate-400">AFTC Carrier Freq:</span>
                              <span className="text-slate-300">
                                {asset.telemetry.aftcFrequencyHz}
                              </span>
                            </div>
                          )}
                        </>
                      )}

                      {/* Safety Directorate Metrics */}
                      {asset.departmentResponsible === "SFTY" && (
                        <>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Compass className="w-3 h-3 text-[#FB2077]" />
                              Substructure Tilt:
                            </span>
                            <span
                              className={`font-black ${
                                (pierTilt || 0.05) > 0.15
                                  ? "text-[#FB2077]"
                                  : "text-slate-200"
                              }`}
                            >
                              {pierTilt !== undefined ? `${pierTilt}°` : "0.04°"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400">Riverbed Scour Depth:</span>
                            <span
                              className={`font-black ${
                                (scourDepth || 0) > 1.5 ? "text-amber-400" : "text-slate-300"
                              }`}
                            >
                              {scourDepth !== undefined ? `${scourDepth} m` : "0.4 m"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400">Tripwire Perimeter:</span>
                            <span className="text-[#00FFD2] font-bold">
                              INTACT (Active)
                            </span>
                          </div>
                        </>
                      )}

                      {/* Risk Progress Bar */}
                      <div className="pt-1.5 border-t border-slate-800">
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                          <span className="text-slate-400">Dynamic Risk Score:</span>
                          <span
                            className={`font-black ${
                              isCrit
                                ? "text-[#FB2077]"
                                : isAttn
                                ? "text-amber-400"
                                : "text-[#00FFD2]"
                            }`}
                          >
                            {asset.failureRisk}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 border border-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${
                              isCrit
                                ? "bg-[#FB2077]"
                                : isAttn
                                ? "bg-amber-400"
                                : "bg-[#00FFD2]"
                            }`}
                            style={{ width: `${asset.failureRisk}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedAssetModal(asset)}
                      className="bg-[#022642] hover:bg-[#033c66] text-white text-[11px] font-mono font-bold px-2.5 py-1.5 border border-black shadow-[1px_1px_0_#000000] flex items-center gap-1 transition-colors"
                      title="Inspect live sensor waveform and diagnostic details"
                    >
                      <Eye className="w-3 h-3 text-[#00FFD2]" />
                      <span>Diagnostics</span>
                    </button>

                    <Link
                      href={`/department/create-request?corridor=${encodeURIComponent(
                        asset.corridorId
                      )}&location=${encodeURIComponent(
                        asset.locationKm
                      )}&targetDept=${asset.departmentResponsible}&title=${encodeURIComponent(
                        `URGENT Maintenance Block for ${asset.id} (${asset.name})`
                      )}`}
                      className={`text-[11px] font-mono font-black px-2.5 py-1.5 border border-black shadow-[1px_1px_0_#000000] flex items-center gap-1 transition-colors ${
                        isCrit
                          ? "bg-[#FB2077] hover:bg-[#ff3b88] text-white"
                          : "bg-[#00FFD2] hover:bg-[#2bfde0] text-black"
                      }`}
                      title="Pre-populate service request for track maintenance block"
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Raise Block</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deep-Dive Diagnostics Modal */}
      {selectedAssetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#000D18] border-2 border-black w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 shadow-[8px_8px_0_#000000] text-white">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b-2 border-black pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-black px-2 py-0.5 bg-[#00FFD2] border border-black">
                    {selectedAssetModal.id}
                  </span>
                  <span className="font-mono text-xs font-bold text-white px-2 py-0.5 bg-[#022642] border border-black">
                    {selectedAssetModal.departmentResponsible}
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    {selectedAssetModal.corridorId}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white mt-1">
                  {selectedAssetModal.name}
                </h2>
                <div className="text-xs font-mono text-slate-300">
                  Location: {selectedAssetModal.locationKm}
                </div>
              </div>

              <button
                onClick={() => setSelectedAssetModal(null)}
                className="bg-[#011526] hover:bg-slate-800 text-white p-1.5 border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Live Waveform Sensor Trace */}
            <div className="bg-[#011526] border-2 border-black p-4 mb-4">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-[#00FFD2] font-black uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Live 24-Hour Telemetry Waveform (Sampling: 100Hz)
                </span>
                <span className="text-slate-400">
                  Current Status:{" "}
                  <strong
                    className={
                      selectedAssetModal.status === "CRITICAL"
                        ? "text-[#FB2077]"
                        : selectedAssetModal.status === "ATTENTION"
                        ? "text-amber-400"
                        : "text-[#00FFD2]"
                    }
                  >
                    {selectedAssetModal.status}
                  </strong>
                </span>
              </div>

              {/* Sparkline Waveform */}
              <div className="h-28 w-full bg-[#000D18] border border-slate-800 p-2 relative flex items-end">
                <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                  {/* Threshold Guide Lines */}
                  <line x1="0" y1="20" x2="400" y2="20" stroke="#FB2077" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="40" x2="400" y2="40" stroke="#FBBF24" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="65" x2="400" y2="65" stroke="#00FFD2" strokeWidth="0.5" />

                  {/* Synthetic Waveform Path based on failure risk */}
                  <path
                    d={`M 0,${65 - (selectedAssetModal.failureRisk / 100) * 45} 
                       Q 50,${55 - (selectedAssetModal.failureRisk / 100) * 35} 100,${60 - (selectedAssetModal.failureRisk / 100) * 40} 
                       T 200,${50 - (selectedAssetModal.failureRisk / 100) * 42} 
                       T 300,${45 - (selectedAssetModal.failureRisk / 100) * 50} 
                       T 400,${35 - (selectedAssetModal.failureRisk / 100) * 55}`}
                    fill="none"
                    stroke={selectedAssetModal.status === "CRITICAL" ? "#FB2077" : selectedAssetModal.status === "ATTENTION" ? "#FBBF24" : "#00FFD2"}
                    strokeWidth="2.5"
                  />
                </svg>

                <div className="absolute top-1 right-2 text-[10px] font-mono text-[#FB2077] font-bold">
                  RDSO Critical Limit
                </div>
                <div className="absolute top-7 right-2 text-[10px] font-mono text-amber-400">
                  Advisory Threshold
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1.5 flex justify-between">
                <span>T-24 Hours</span>
                <span>T-12 Hours</span>
                <span>T-6 Hours</span>
                <span className="text-[#00FFD2] font-bold">Real-time Stream</span>
              </div>
            </div>

            {/* Sensor Diagnostic Specs Table */}
            <div className="bg-[#011526] border border-black p-3 mb-4 text-xs font-mono">
              <div className="font-bold text-white mb-2 uppercase border-b border-slate-800 pb-1 flex items-center justify-between">
                <span>Hardware Sensor Specifications & RDSO Limits</span>
                <span className="text-[#2DC7D5]">Field Transducer: Piezo-resistive / Optical FBG</span>
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-slate-300">
                <div>• Asset Type: <span className="text-white font-bold">{selectedAssetModal.type}</span></div>
                <div>• Gateway Protocol: <span className="text-white font-bold">MQTT v5 / CoAP over IR-LTE</span></div>
                <div>• Dynamic Risk Index: <span className="text-[#FB2077] font-black">{selectedAssetModal.failureRisk}%</span></div>
                <div>• Last Serviced: <span className="text-white">{selectedAssetModal.lastMaintenanceDate}</span></div>
                <div>• Next Statutory Audit: <span className="text-amber-400 font-bold">{selectedAssetModal.nextRecommendedInspection}</span></div>
                <div>• AI Predicted MTBF: <span className="text-[#00FFD2] font-bold">{Math.max(14, 180 - selectedAssetModal.failureRisk * 2)} Hours</span></div>
              </div>
            </div>

            {/* Diagnostic Remedial Recommendation */}
            <div className="bg-[#022642] border-2 border-black p-3.5 mb-5">
              <div className="text-xs font-mono font-black text-[#00FFD2] uppercase mb-1 flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                <span>AI Prescriptive Maintenance Recommendation</span>
              </div>
              <p className="text-xs font-mono text-slate-200 leading-relaxed">
                {selectedAssetModal.status === "CRITICAL"
                  ? `CRITICAL HAZARD DETECTED: Asset exhibits severe parameters exceeding Indian Railways RDSO safety threshold. Imposition of Emergency TSR (Temporary Speed Restriction) or a 3.5-hour corridor mega-block is strongly recommended under G&SR 15.06.`
                  : selectedAssetModal.status === "ATTENTION"
                  ? `PREVENTIVE ADVISORY: Telemetry drift indicates wear progression. Bundle this asset inspection into the upcoming weekly maintenance block to avoid unscheduled failure.`
                  : `NOMINAL OPERATION: All sensor parameters are well within standard tolerance. Continue standard 5-second digital twin telemetry heartbeat.`}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
              <button
                onClick={() => setSelectedAssetModal(null)}
                className="bg-[#011526] hover:bg-slate-800 text-white text-xs font-mono px-4 py-2 border border-slate-700 font-bold"
              >
                Close Inspector
              </button>

              <Link
                href={`/department/create-request?corridor=${encodeURIComponent(
                  selectedAssetModal.corridorId
                )}&location=${encodeURIComponent(
                  selectedAssetModal.locationKm
                )}&targetDept=${selectedAssetModal.departmentResponsible}&title=${encodeURIComponent(
                  `URGENT Track Block Sanction for ${selectedAssetModal.id} (${selectedAssetModal.name})`
                )}`}
                className="bg-[#00FFD2] hover:bg-[#2bfde0] text-black text-xs font-mono font-black px-4 py-2 border border-black shadow-[2px_2px_0_#000000] flex items-center gap-1.5 uppercase"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Draft Maintenance Block Request</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
