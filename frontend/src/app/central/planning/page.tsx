"use client";

import React, { useState, useMemo } from "react";
import { useRailPlan, ZONE_CORRIDOR_MAP } from "@/context/RailPlanContext";
import { formatINR, formatFullINR } from "@/lib/formatters";
import { PlanningHorizon, HorizonBlockPlan, HorizonScheduleSlot, DepartmentId } from "@/lib/types";
import { getHorizonPlans, getHorizonKpis } from "@/lib/horizonPlansData";
import { 
  Calendar, 
  Clock, 
  Wrench, 
  MapPin, 
  Sparkles, 
  Filter, 
  CheckCircle2, 
  Search,
  PlusCircle,
  ShieldCheck,
  AlertTriangle,
  Train,
  Layers,
  ArrowRight,
  Download,
  Printer,
  ChevronRight,
  Activity,
  FileText,
  Zap,
  Check,
  X,
  Target,
  BarChart3,
  CalendarDays
} from "lucide-react";
import Link from "next/link";

export default function MaintenancePlanningPage() {
  const { 
    maintenanceTasks, 
    corridors, 
    selectedCorridorId, 
    setSelectedCorridorId, 
    selectedZone,
    selectedHorizon,
    setSelectedHorizon,
    horizonPlans,
    approveHorizonPlan,
    aiOptimizeHorizonSchedule,
  } = useRailPlan();

  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"TIMELINE" | "REGISTRY" | "STRATEGY">("TIMELINE");
  const [activeSlot, setActiveSlot] = useState<HorizonScheduleSlot | null>(null);
  const [showCircularModal, setShowCircularModal] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<{
    message: string;
    savedHours: number;
    punctualityGainPct: number;
  } | null>(null);

  const availableCorridors = useMemo(() => {
    const allowed = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    return corridors.filter((c) => allowed.includes(c.id));
  }, [corridors, selectedZone]);

  const selectedCorridor = corridors.find((c) => c.id === selectedCorridorId) || null;

  // Active Horizon Plans filtered by Corridor
  const activePlans = useMemo(() => {
    return horizonPlans.filter((plan) => {
      const matchesHorizon = plan.horizon === selectedHorizon;
      const matchesCorridor = selectedCorridorId === "ALL" || plan.corridorId === selectedCorridorId;
      return matchesHorizon && matchesCorridor;
    });
  }, [horizonPlans, selectedHorizon, selectedCorridorId]);

  // Aggregate all slots across active plans
  const allHorizonSlots = useMemo(() => {
    let slots: HorizonScheduleSlot[] = [];
    activePlans.forEach((p) => {
      slots = slots.concat(p.slots);
    });

    return slots.filter((slot) => {
      const matchesSearch =
        slot.workType.toLowerCase().includes(search.toLowerCase()) ||
        slot.locationSection.toLowerCase().includes(search.toLowerCase()) ||
        slot.machinery.some((m) => m.toLowerCase().includes(search.toLowerCase())) ||
        slot.passengerTrainsRegulated.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesDept = selectedDept === "ALL" || slot.departmentId === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [activePlans, search, selectedDept]);

  // Dynamic Horizon KPIs
  const horizonKpis = useMemo(() => {
    const totalHours = activePlans.reduce((acc, p) => acc + p.totalBlockHours, 0);
    const totalSlots = activePlans.reduce((acc, p) => acc + p.totalSlots, 0);
    const totalTrackKm = activePlans.reduce((acc, p) => acc + p.trackKmTargeted, 0);
    const completedKm = activePlans.reduce((acc, p) => acc + (p.trackKmCompleted || 0), 0);
    const totalBudget = activePlans.reduce((acc, p) => acc + p.totalBudgetEstimated, 0);
    const avgDelay = activePlans.length > 0 
      ? (activePlans.reduce((acc, p) => acc + p.averageDelayMinutesPerTrain, 0) / activePlans.length).toFixed(1) 
      : "0.0";
    const avgScore = activePlans.length > 0
      ? Math.round(activePlans.reduce((acc, p) => acc + p.aiOptimizationScore, 0) / activePlans.length)
      : 96;

    return {
      totalHours: Number(totalHours.toFixed(1)),
      totalSlots,
      totalTrackKm: Number(totalTrackKm.toFixed(1)),
      completedKm: Number(completedKm.toFixed(1)),
      completionPct: totalTrackKm > 0 ? Math.round((completedKm / totalTrackKm) * 100) : 0,
      totalBudget,
      avgDelay: Number(avgDelay),
      avgScore,
      plansCount: activePlans.length,
    };
  }, [activePlans]);

  // Handler for AI Optimization
  const handleTriggerAiOptimization = () => {
    if (activePlans.length === 0) return;
    setIsOptimizing(true);
    setTimeout(() => {
      const primaryPlan = activePlans[0];
      const result = aiOptimizeHorizonSchedule(primaryPlan.id);
      setIsOptimizing(false);
      setOptimizationResult({
        message: result.message,
        savedHours: result.savedHours,
        punctualityGainPct: result.punctualityGainPct,
      });
    }, 800);
  };

  // Group slots by Day (for Weekly view)
  const weeklyDays = [
    "Monday (28 Sep)",
    "Tuesday (29 Sep)",
    "Wednesday (30 Sep)",
    "Thursday (01 Oct)",
    "Friday (02 Oct)",
    "Saturday (03 Oct)",
    "Sunday (04 Oct)",
  ];

  // Group slots by Week (for Monthly view)
  const monthlyWeeks = [
    { id: "Week 1 (01 - 07 Oct)", label: "Week 1: Track Renewal & Bridge Structural Possession", dateRange: "01 Oct - 07 Oct 2026" },
    { id: "Week 2 (08 - 14 Oct)", label: "Week 2: 25kV OHE Catenary Overhaul & Tunnel ROCS Clearing", dateRange: "08 Oct - 14 Oct 2026" },
    { id: "Week 3 (15 - 21 Oct)", label: "Week 3: Electronic Interlocking (EI) Cutover & Yard Signal Modernization", dateRange: "15 Oct - 21 Oct 2026" },
    { id: "Week 4 (22 - 28 Oct)", label: "Week 4: Rail Grinding Train (RGM) & CRS 160 km/h Oscillation Trials", dateRange: "22 Oct - 31 Oct 2026" },
  ];

  return (
    <div className="space-y-6">
      {/* Indian Railways Tricolor Accent Ribbon */}
      <div className="h-1.5 w-full rounded-t-xl bg-gradient-to-r from-[#FF671F] via-[#FFFFFF] to-[#046A38] shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />

      {/* Header Banner */}
      <div 
        style={{ backgroundColor: "#000D18", opacity: 1 }}
        className="p-6 rounded-2xl border-3 border-black shadow-[8px_8px_0_#000000] flex flex-wrap items-center justify-between gap-4"
      >
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-black bg-[#00FFD2] text-black border border-black px-2.5 py-0.5 rounded shadow-[1px_1px_0_#000000] uppercase tracking-wider">
              MULTI-HORIZON DECISION ENGINE
            </span>
            <span className="text-[10px] font-mono font-black bg-[#FFFF00] text-black border border-black px-2.5 py-0.5 rounded shadow-[1px_1px_0_#000000]">
              G&SR CHAPTER XV COMPLIANT
            </span>
            <span className="text-xs text-slate-300 font-mono font-bold">
              Master Maintenance Planning & Possession Program {selectedCorridor ? `• ${selectedCorridor.name}` : `• ${selectedZone.split("(")[0].trim()}`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Multi-Horizon Railway Block Planning & Schedule Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Continuous multi-horizon operational decision support: Synchronize <strong>Short-Term Weekly Block Plans (7-Day Tactical Window)</strong> with <strong>Long-Term Monthly Corridor Overhauls (30-Day Strategic Master)</strong> to protect punctuality and maximize infrastructure uptime.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleTriggerAiOptimization}
            disabled={isOptimizing}
            className="px-3.5 py-2 rounded-xl bg-[#6367FF] hover:bg-[#787CFF] text-white text-xs font-black border-2 border-black shadow-[3px_3px_0_#000000] hover:shadow-[1px_1px_0_#000000] hover:translate-x-0.5 hover:translate-y-0.5 transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 text-[#FFFF00] ${isOptimizing ? "animate-spin" : ""}`} />
            <span>{isOptimizing ? "Optimizing Schedule..." : "AI Optimize Horizon"}</span>
          </button>

          <button
            onClick={() => setShowCircularModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#022642] hover:bg-[#03345A] text-white text-xs font-black border-2 border-black shadow-[3px_3px_0_#000000] hover:shadow-[1px_1px_0_#000000] hover:translate-x-0.5 hover:translate-y-0.5 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#00FFD2]" />
            <span>Official Circular</span>
          </button>

          <Link
            href="/department/create-request"
            className="px-3.5 py-2 rounded-xl bg-[#00FFD2] hover:bg-[#33FFDC] text-black text-xs font-black border-2 border-black shadow-[3px_3px_0_#000000] hover:shadow-[1px_1px_0_#000000] hover:translate-x-0.5 hover:translate-y-0.5 transition flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4 text-black" />
            <span>New Work Order</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIME HORIZON SELECTOR BAR (WEEKLY vs MONTHLY vs DAILY)                     */}
      {/* ========================================================================= */}
      <div 
        style={{ backgroundColor: "#022642", opacity: 1 }}
        className="p-3.5 rounded-2xl border-3 border-black shadow-[6px_6px_0_#000000] space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-black uppercase text-[#00FFD2] tracking-wider">
              OPERATIONAL HORIZON SWITCHER
            </span>
            <h2 className="text-base sm:text-lg font-black text-white">
              Select Maintenance Planning Time Horizon
            </h2>
          </div>

          <div className="flex flex-wrap items-center bg-[#000D18] p-1.5 rounded-xl border-2 border-black gap-1.5">
            <button
              onClick={() => setSelectedHorizon("WEEKLY")}
              className={`px-3.5 py-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center space-x-2 border-2 ${
                selectedHorizon === "WEEKLY"
                  ? "bg-[#00FFD2] text-black border-black shadow-[3px_3px_0_#000000]"
                  : "bg-transparent text-slate-300 border-transparent hover:text-white hover:bg-[#011B30]"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>WEEKLY (Short-Term • 7 Days)</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-black text-[#00FFD2]">
                TACTICAL
              </span>
            </button>

            <button
              onClick={() => setSelectedHorizon("MONTHLY")}
              className={`px-3.5 py-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center space-x-2 border-2 ${
                selectedHorizon === "MONTHLY"
                  ? "bg-[#FFFF00] text-black border-black shadow-[3px_3px_0_#000000]"
                  : "bg-transparent text-slate-300 border-transparent hover:text-white hover:bg-[#011B30]"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>MONTHLY (Long-Term • 30 Days)</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-black text-[#FFFF00]">
                STRATEGIC
              </span>
            </button>

            <button
              onClick={() => setSelectedHorizon("DAILY")}
              className={`px-3.5 py-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center space-x-2 border-2 ${
                selectedHorizon === "DAILY"
                  ? "bg-[#FB2077] text-white border-black shadow-[3px_3px_0_#000000]"
                  : "bg-transparent text-slate-300 border-transparent hover:text-white hover:bg-[#011B30]"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>DAILY (24-Hour Section)</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-black text-white">
                IMMEDIATE
              </span>
            </button>
          </div>
        </div>

        {/* Horizon Context Guidance */}
        <div 
          style={{ backgroundColor: "#011526", opacity: 1 }}
          className="p-3 rounded-xl border-2 border-black flex items-center justify-between text-xs text-slate-300"
        >
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-[#000D18] text-[#00FFD2] border border-black font-mono font-bold text-[10px]">
              HORIZON SCOPE
            </span>
            {selectedHorizon === "WEEKLY" && (
              <p>
                <strong>Short-Term Maintenance:</strong> 7-day rolling window for Divisional OCC controllers and Field Engineers. Manages night mega-block slots (01:00-05:00), machine tamping, temporary speed restrictions (TSR), and passenger express regulation.
              </p>
            )}
            {selectedHorizon === "MONTHLY" && (
              <p>
                <strong>Long-Term Maintenance:</strong> 30-day macro master program for Railway Board and Principal Chief Engineers. Coordinates heavy Track Renewal (TRR/TSR in track-km), BCM deep screening, bridge girder rehabilitation, 25kV OHE catenary replacement, and capital budget drawdowns.
              </p>
            )}
            {selectedHorizon === "DAILY" && (
              <p>
                <strong>Immediate Execution:</strong> 24-hour section diagram showing active train traffic against live corridor possession slots and caution orders.
              </p>
            )}
          </div>
          <span className="hidden md:inline font-mono font-bold text-[11px] text-[#00FFD2]">
            {activePlans.length} Master Plan(s) Active
          </span>
        </div>
      </div>

      {/* AI Optimization Alert Banner (if triggered) */}
      {optimizationResult && (
        <div 
          style={{ backgroundColor: "#000D18", opacity: 1 }}
          className="p-4 rounded-xl border-3 border-black shadow-[5px_5px_0_#000000] flex items-center justify-between text-xs gap-3 border-l-8 border-l-[#00FFD2] animate-slide-up"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#00FFD2] text-black font-black border border-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-white text-sm">{optimizationResult.message}</p>
              <p className="text-slate-300 text-[11px]">
                Achieved <strong>+{optimizationResult.punctualityGainPct}% punctuality protection</strong> and saved <strong>{optimizationResult.savedHours} hours</strong> of track idle time via co-located multi-department shadow windows.
              </p>
            </div>
          </div>
          <button
            onClick={() => setOptimizationResult(null)}
            className="p-1 rounded bg-[#022642] text-slate-300 hover:text-white border border-black cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DYNAMIC HORIZON OPERATIONAL KPIS RIBBON                                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Planned Block Hours */}
        <div 
          style={{ backgroundColor: "#022642", opacity: 1 }}
          className="p-3.5 rounded-xl border-2 border-black shadow-[4px_4px_0_#000000] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[10px] font-mono font-black text-slate-400">
            <span>PLANNED BLOCKS</span>
            <Clock className="w-3.5 h-3.5 text-[#00FFD2]" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-1 font-mono">
            {horizonKpis.totalHours} <span className="text-xs text-[#00FFD2]">Hrs</span>
          </p>
          <p className="text-[10px] text-slate-300 font-bold mt-0.5">
            {horizonKpis.totalSlots} Possession Slots
          </p>
        </div>

        {/* Metric 2: Track-KM Targeted */}
        <div 
          style={{ backgroundColor: "#022642", opacity: 1 }}
          className="p-3.5 rounded-xl border-2 border-black shadow-[4px_4px_0_#000000] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[10px] font-mono font-black text-slate-400">
            <span>TRACK RENEWAL</span>
            <Wrench className="w-3.5 h-3.5 text-[#FFFF00]" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-1 font-mono">
            {horizonKpis.totalTrackKm} <span className="text-xs text-[#FFFF00]">Km</span>
          </p>
          <div className="w-full bg-[#000D18] h-2 rounded border border-black overflow-hidden mt-1">
            <div 
              className="bg-[#FFFF00] h-full" 
              style={{ width: `${horizonKpis.completionPct}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-300 font-bold mt-0.5">
            {horizonKpis.completedKm} Km ({horizonKpis.completionPct}%) Completed
          </p>
        </div>

        {/* Metric 3: Passenger Delay Index */}
        <div 
          style={{ backgroundColor: "#022642", opacity: 1 }}
          className="p-3.5 rounded-xl border-2 border-black shadow-[4px_4px_0_#000000] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[10px] font-mono font-black text-slate-400">
            <span>TRAIN REGULATION</span>
            <Train className="w-3.5 h-3.5 text-[#FB2077]" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-1 font-mono">
            {horizonKpis.avgDelay} <span className="text-xs text-[#FB2077]">Min/Train</span>
          </p>
          <p className="text-[10px] text-emerald-400 font-bold mt-0.5">
            Zero Train Cancellations
          </p>
        </div>

        {/* Metric 4: AI Punctuality & Safety Score */}
        <div 
          style={{ backgroundColor: "#022642", opacity: 1 }}
          className="p-3.5 rounded-xl border-2 border-black shadow-[4px_4px_0_#000000] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[10px] font-mono font-black text-slate-400">
            <span>AI CONFLICT-FREE</span>
            <Sparkles className="w-3.5 h-3.5 text-[#00FFD2]" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#00FFD2] mt-1 font-mono">
            {horizonKpis.avgScore}%
          </p>
          <p className="text-[10px] text-slate-300 font-bold mt-0.5">
            G&SR 15.06 Validated
          </p>
        </div>

        {/* Metric 5: Committed Budget */}
        <div 
          style={{ backgroundColor: "#022642", opacity: 1 }}
          className="p-3.5 rounded-xl border-2 border-black shadow-[4px_4px_0_#000000] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[10px] font-mono font-black text-slate-400">
            <span>BUDGET ALLOCATED</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-lg sm:text-xl font-black text-cyan-300 mt-1 font-mono truncate">
            {formatINR(horizonKpis.totalBudget)}
          </p>
          <p className="text-[10px] text-slate-300 font-bold mt-0.5">
            {selectedHorizon === "WEEKLY" ? "7-Day OPEX" : "30-Day CAPEX/OPEX"}
          </p>
        </div>

        {/* Metric 6: Directorate Involvement */}
        <div 
          style={{ backgroundColor: "#022642", opacity: 1 }}
          className="p-3.5 rounded-xl border-2 border-black shadow-[4px_4px_0_#000000] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[10px] font-mono font-black text-slate-400">
            <span>JOINT DEPARTMENTS</span>
            <Layers className="w-3.5 h-3.5 text-[#6367FF]" />
          </div>
          <div className="flex items-center space-x-1 mt-1 font-mono font-bold text-xs">
            <span className="px-1.5 py-0.5 rounded bg-[#00FFD2] text-black">ENG</span>
            <span className="px-1.5 py-0.5 rounded bg-[#FFFF00] text-black">ELEC</span>
            <span className="px-1.5 py-0.5 rounded bg-[#6367FF] text-white">SNT</span>
          </div>
          <p className="text-[10px] text-slate-300 font-bold mt-0.5">
            Multi-Disciplinary Synergy
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER CONTROLS & VIEW SWITCHER                                           */}
      {/* ========================================================================= */}
      <div 
        style={{ backgroundColor: "#000D18", opacity: 1 }}
        className="p-4 rounded-xl border-2 border-black shadow-[4px_4px_0_#000000] flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Machine, Work Type, Train..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#022642] border-2 border-black rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00FFD2] w-64 font-medium"
            />
          </div>

          {/* Corridor Dropdown */}
          <select
            value={selectedCorridorId}
            onChange={(e) => setSelectedCorridorId(e.target.value)}
            className="bg-[#022642] border-2 border-black text-[#00FFD2] text-xs font-mono font-bold rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="ALL">
              {selectedZone.startsWith("All") ? `All Corridors (${corridors.length})` : `All ${selectedZone.split("(")[0].trim()} (${availableCorridors.length})`}
            </option>
            {availableCorridors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.name.split("(")[0]}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-[#022642] border-2 border-black text-slate-200 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Directorates</option>
            <option value="ENG">Civil (ENG / P-Way)</option>
            <option value="ELEC">Electrical (ELEC / OHE)</option>
            <option value="SNT">Signal & Telecom (SNT)</option>
            <option value="SFTY">Safety Directorate (SFTY)</option>
          </select>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center bg-[#011B30] p-1 rounded-xl border-2 border-black text-xs">
          <button
            onClick={() => setViewMode("TIMELINE")}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer border ${
              viewMode === "TIMELINE"
                ? "bg-[#00FFD2] text-black font-black border-black shadow-[1px_1px_0_#000000]"
                : "text-slate-300 border-transparent hover:text-white"
            }`}
          >
            Visual Horizon Matrix
          </button>
          <button
            onClick={() => setViewMode("REGISTRY")}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer border ${
              viewMode === "REGISTRY"
                ? "bg-[#00FFD2] text-black font-black border-black shadow-[1px_1px_0_#000000]"
                : "text-slate-300 border-transparent hover:text-white"
            }`}
          >
            Block Slot Registry ({allHorizonSlots.length})
          </button>
          <button
            onClick={() => setViewMode("STRATEGY")}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer border ${
              viewMode === "STRATEGY"
                ? "bg-[#00FFD2] text-black font-black border-black shadow-[1px_1px_0_#000000]"
                : "text-slate-300 border-transparent hover:text-white"
            }`}
          >
            Strategic Objectives
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN VIEW CONTENT (TIMELINE vs REGISTRY vs STRATEGY)                       */}
      {/* ========================================================================= */}

      {viewMode === "TIMELINE" && (
        <div className="space-y-4">
          {/* ===================================================================== */}
          {/* WEEKLY TIMELINE (SHORT-TERM TACTICAL 7-DAY HORIZON)                   */}
          {/* ===================================================================== */}
          {selectedHorizon === "WEEKLY" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono font-bold text-[#00FFD2]">
                  7-Day Tactical Rolling Block Schedule (Monday to Sunday)
                </span>
                <span className="font-mono text-slate-400">
                  Showing all sanctioned night and daylight track possessions
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {weeklyDays.map((dayLabel) => {
                  const daySlots = allHorizonSlots.filter((s) => s.dayOrPeriod === dayLabel);

                  return (
                    <div
                      key={dayLabel}
                      style={{ backgroundColor: "#022642", opacity: 1 }}
                      className="rounded-2xl border-3 border-black shadow-[6px_6px_0_#000000] p-4 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Day Column Header */}
                        <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                          <span className="font-black text-white text-sm font-mono">{dayLabel}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-[#000D18] text-[#00FFD2] border border-black">
                            {daySlots.length} Block{daySlots.length === 1 ? "" : "s"}
                          </span>
                        </div>

                        {/* Slots on this day */}
                        {daySlots.length === 0 ? (
                          <div 
                            style={{ backgroundColor: "#011526", opacity: 1 }}
                            className="p-6 rounded-xl border-2 border-black text-center text-xs text-slate-400 italic"
                          >
                            No scheduled block slots. Regular train traffic operational.
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {daySlots.map((slot) => {
                              const isNightSlot = slot.timeWindow.startsWith("0") || slot.timeWindow.startsWith("00") || slot.timeWindow.startsWith("01") || slot.timeWindow.startsWith("02");
                              const isEng = slot.departmentId === "ENG";
                              const isElec = slot.departmentId === "ELEC";
                              const isSnt = slot.departmentId === "SNT";

                              return (
                                <div
                                  key={slot.id}
                                  onClick={() => setActiveSlot(slot)}
                                  style={{ backgroundColor: "#000D18", opacity: 1 }}
                                  className="p-3 rounded-xl border-2 border-black shadow-[3px_3px_0_#000000] hover:border-[#00FFD2] transition cursor-pointer space-y-2 hover:translate-x-0.5 hover:translate-y-0.5"
                                >
                                  {/* Slot Time & Track */}
                                  <div className="flex items-center justify-between text-[10px] font-mono">
                                    <span className={`px-2 py-0.5 rounded font-black border border-black ${
                                      isNightSlot ? "bg-[#3D0072] text-[#00FFD2]" : "bg-[#022642] text-white"
                                    }`}>
                                      ⏱ {slot.timeWindow} ({slot.durationHours}h)
                                    </span>
                                    <span className="font-bold text-slate-300">
                                      {slot.trackLine.replace("_", " ")}
                                    </span>
                                  </div>

                                  {/* Department & Work Type */}
                                  <div>
                                    <div className="flex items-center space-x-1.5 mb-1">
                                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-black border border-black ${
                                        isEng ? "bg-[#00FFD2] text-black" : isElec ? "bg-[#FFFF00] text-black" : isSnt ? "bg-[#6367FF] text-white" : "bg-[#FB2077] text-white"
                                      }`}>
                                        {slot.departmentId}
                                      </span>
                                      <span className="text-[10px] font-mono font-bold text-slate-400 truncate">
                                        {slot.corridorId} • KM {slot.fromKm}-{slot.toKm}
                                      </span>
                                    </div>
                                    <h4 className="text-xs font-black text-white line-clamp-2">
                                      {slot.workType}
                                    </h4>
                                  </div>

                                  {/* Machinery Fleet */}
                                  <div className="text-[10px] text-slate-300 font-medium">
                                    <span className="text-slate-400">Machines: </span>
                                    {slot.machinery.slice(0, 2).join(", ")}
                                  </div>

                                  {/* Train Regulation Warning */}
                                  {slot.passengerTrainsRegulated.length > 0 && (
                                    <div className="p-1.5 rounded bg-[#2D0014] border border-[#FB2077]/60 text-[10px] text-[#FF85B3] font-bold">
                                      ⚠️ {slot.passengerTrainsRegulated[0]}
                                    </div>
                                  )}

                                  {/* Status Indicator */}
                                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                                    <span className={`font-mono font-bold ${
                                      slot.status === "COMPLETED" ? "text-emerald-400" :
                                      slot.status === "IN_PROGRESS" ? "text-amber-400 animate-pulse" :
                                      slot.status === "T806_SANCTIONED" ? "text-[#00FFD2]" : "text-slate-300"
                                    }`}>
                                      ● {slot.status.replace("_", " ")}
                                    </span>
                                    <span className="text-[#00FFD2] font-mono font-bold">Inspect →</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* MONTHLY TIMELINE (LONG-TERM STRATEGIC 30-DAY / 4-WEEK MASTER HORIZON) */}
          {/* ===================================================================== */}
          {selectedHorizon === "MONTHLY" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono font-bold text-[#FFFF00]">
                  30-Day Master Strategic Corridor Overhaul Schedule (Weeks 1 to 4)
                </span>
                <span className="font-mono text-slate-400">
                  Major Track Renewals, 25kV OHE Catenary Wire Programs, Bridge Overhauls, and Electronic Interlocking Cutovers
                </span>
              </div>

              <div className="space-y-4">
                {monthlyWeeks.map((week) => {
                  const weekSlots = allHorizonSlots.filter((s) => s.dayOrPeriod.startsWith(week.id.split("(")[0].trim()));

                  return (
                    <div
                      key={week.id}
                      style={{ backgroundColor: "#022642", opacity: 1 }}
                      className="rounded-2xl border-3 border-black shadow-[6px_6px_0_#000000] p-5 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-black">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black bg-[#FFFF00] text-black border border-black shadow-[1px_1px_0_#000000]">
                              {week.id.split("(")[0].trim()}
                            </span>
                            <span className="text-xs font-mono text-[#00FFD2] font-bold">
                              {week.dateRange}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-white mt-1">
                            {week.label}
                          </h3>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-slate-300 bg-[#000D18] px-3 py-1 rounded-lg border border-black">
                            {weekSlots.length} Major Possession{weekSlots.length === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>

                      {/* Week Major Projects Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {weekSlots.map((slot) => (
                          <div
                            key={slot.id}
                            onClick={() => setActiveSlot(slot)}
                            style={{ backgroundColor: "#000D18", opacity: 1 }}
                            className="p-4 rounded-xl border-2 border-black shadow-[3px_3px_0_#000000] hover:border-[#FFFF00] transition cursor-pointer space-y-2.5 flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[10px] font-mono">
                                <span className="px-2 py-0.5 rounded font-black bg-[#022642] text-[#FFFF00] border border-black">
                                  {slot.timeWindow}
                                </span>
                                <span className="font-bold text-cyan-300">
                                  {slot.durationHours} Hours Total
                                </span>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#00FFD2] text-black border border-black">
                                    {slot.departmentId}
                                  </span>
                                  <span className="text-xs font-mono font-bold text-slate-300">
                                    {slot.locationSection}
                                  </span>
                                </div>
                                <h4 className="text-xs font-black text-white">
                                  {slot.workType}
                                </h4>
                              </div>

                              {/* Heavy Plant Mobilized */}
                              <div className="p-2 rounded-lg bg-[#011526] border border-slate-800 text-[10px] text-slate-300 space-y-1">
                                <p className="font-bold text-slate-200">Heavy Plant Mobilized:</p>
                                <p className="font-mono text-cyan-300">{slot.machinery.join(" • ")}</p>
                              </div>

                              {/* Speed Restriction / Caution Order */}
                              {slot.speedRestriction && (
                                <p className="text-[10px] text-amber-300 font-mono font-bold">
                                  ⚡ {slot.speedRestriction}
                                </p>
                              )}
                            </div>

                            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                              <span className="px-2 py-0.5 rounded font-mono font-bold bg-[#022642] text-slate-200 border border-black">
                                Status: {slot.status}
                              </span>
                              <span className="text-[#FFFF00] font-mono font-bold">
                                Inspect Full Plan →
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* DAILY TIMELINE (24-HOUR SECTION VIEW)                                 */}
          {/* ===================================================================== */}
          {selectedHorizon === "DAILY" && (
            <div 
              style={{ backgroundColor: "#022642", opacity: 1 }}
              className="p-5 rounded-2xl border-3 border-black shadow-[6px_6px_0_#000000] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <div>
                  <h3 className="text-base font-black text-white">
                    24-Hour Section Diagram & Track Occupancy
                  </h3>
                  <p className="text-xs text-slate-300">
                    Hourly breakdown of active block windows vs high-speed passenger train paths
                  </p>
                </div>
                <Link
                  href="/central"
                  className="px-3 py-1.5 rounded-lg bg-[#00FFD2] text-black font-black text-xs border border-black shadow-[2px_2px_0_#000000]"
                >
                  Open OCC Gantt View →
                </Link>
              </div>

              <div 
                style={{ backgroundColor: "#000D18", opacity: 1 }}
                className="p-6 rounded-xl border-2 border-black space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#022642] border border-black">
                    <p className="text-[10px] text-slate-400 font-bold">Line 1: UP Main Track</p>
                    <p className="font-mono font-black text-[#00FFD2] mt-0.5">01:30 - 05:30 (4H Mega Block)</p>
                    <p className="text-[10px] text-slate-300 mt-1">Joint P-Way Tamping + 25kV OHE Isolation</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#022642] border border-black">
                    <p className="text-[10px] text-slate-400 font-bold">Line 2: DOWN Main Track</p>
                    <p className="font-mono font-black text-[#FFFF00] mt-0.5">11:00 - 13:30 (2.5H Interval)</p>
                    <p className="text-[10px] text-slate-300 mt-1">Kavach RFID Tag Calibration</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#022642] border border-black">
                    <p className="text-[10px] text-slate-400 font-bold">Line 4: DFC Dedicated Freight</p>
                    <p className="font-mono font-black text-white mt-0.5">Continuous 100 km/h Operations</p>
                    <p className="text-[10px] text-slate-300 mt-1">Double Stack Container Precedence</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* REGISTRY VIEW (DETAILED SLOTS TABLE)                                      */}
      {/* ========================================================================= */}
      {viewMode === "REGISTRY" && (
        <div 
          style={{ backgroundColor: "#022642", opacity: 1 }}
          className="rounded-2xl border-3 border-black shadow-[6px_6px_0_#000000] overflow-hidden"
        >
          <div className="p-4 bg-[#011B30] border-b-2 border-black flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-white text-base">
                Master Possession Registry • {selectedHorizon} Horizon
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Detailed work specifications, heavy equipment manifests, and statutory safety clearings
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg font-mono font-black text-xs bg-[#00FFD2] text-black border border-black">
              {allHorizonSlots.length} Work Slots
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#000D18] text-slate-300 font-mono text-[10px] uppercase border-b-2 border-black">
                <tr>
                  <th className="p-3">Period / Date</th>
                  <th className="p-3">Window</th>
                  <th className="p-3">Line & Corridor</th>
                  <th className="p-3">Directorate</th>
                  <th className="p-3">Work Specification</th>
                  <th className="p-3">Machinery</th>
                  <th className="p-3">Train Regulation</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/60 bg-[#011526]">
                {allHorizonSlots.map((slot) => (
                  <tr 
                    key={slot.id}
                    className="hover:bg-[#022642] transition cursor-pointer"
                    onClick={() => setActiveSlot(slot)}
                  >
                    <td className="p-3 font-mono font-bold text-white whitespace-nowrap">
                      {slot.dayOrPeriod}
                    </td>
                    <td className="p-3 font-mono text-[#00FFD2] whitespace-nowrap font-bold">
                      {slot.timeWindow} ({slot.durationHours}h)
                    </td>
                    <td className="p-3 font-mono text-slate-300 whitespace-nowrap">
                      <span className="font-bold text-white">{slot.trackLine}</span>
                      <br />
                      <span className="text-[10px] text-slate-400">{slot.corridorId} KM {slot.fromKm}-{slot.toKm}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black border border-black bg-[#022642] text-[#00FFD2]">
                        {slot.departmentId}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-white max-w-xs">
                      <p className="font-bold truncate">{slot.workType}</p>
                      <p className="text-[10px] text-slate-400 truncate">{slot.locationSection}</p>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-cyan-300 max-w-xs truncate">
                      {slot.machinery.join(", ")}
                    </td>
                    <td className="p-3 text-[10px] text-slate-300">
                      {slot.passengerTrainsRegulated.length > 0 ? (
                        <span className="text-amber-300 font-bold">{slot.passengerTrainsRegulated[0]}</span>
                      ) : (
                        <span className="text-emerald-400">Zero Passenger Impact</span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black border border-black bg-[#000D18] text-[#00FFD2]">
                        {slot.status}
                      </span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSlot(slot);
                        }}
                        className="px-2.5 py-1 rounded bg-[#022642] hover:bg-[#03345A] text-[#00FFD2] font-mono font-bold text-[10px] border border-black shadow-[1px_1px_0_#000000]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STRATEGY & RISK MITIGATION VIEW                                           */}
      {/* ========================================================================= */}
      {viewMode === "STRATEGY" && (
        <div className="space-y-4">
          <div 
            style={{ backgroundColor: "#022642", opacity: 1 }}
            className="p-6 rounded-2xl border-3 border-black shadow-[6px_6px_0_#000000] space-y-4"
          >
            <div className="flex items-center space-x-3 pb-3 border-b-2 border-black">
              <div className="p-2.5 rounded-xl bg-[#00FFD2] text-black border-2 border-black">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  Multi-Horizon Synergy: Short-Term Weekly vs Long-Term Monthly
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  How 7-day tactical block windows aggregate into 30-day macro corridor overhaul goals
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                style={{ backgroundColor: "#000D18", opacity: 1 }}
                className="p-4 rounded-xl border-2 border-black space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-[#00FFD2]">
                    SHORT-TERM WEEKLY HORIZON
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#022642] text-white border border-black">
                    7-Day Rolling
                  </span>
                </div>
                <h4 className="text-sm font-black text-white">Tactical Daily Execution Objectives</h4>
                <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                  <li><strong>Night Mega-Blocks (01:00 - 05:00):</strong> Concentrate 85% of physical possessions into low-density passenger windows.</li>
                  <li><strong>Joint Working Synchronization:</strong> Co-locate Civil track tamping with Electrical 25kV OHE isolation to eliminate redundant line blocks.</li>
                  <li><strong>Zero Passenger Cancellation:</strong> Use dynamic shadow-pathing behind express rakes so Rajdhanis and Vande Bharats run uninterrupted.</li>
                  <li><strong>Speed Restriction (TSR) Relaxation:</strong> Rapidly relax post-work caution speeds from 30 km/h to normal 130 km/h within 24 hours.</li>
                </ul>
              </div>

              <div 
                style={{ backgroundColor: "#000D18", opacity: 1 }}
                className="p-4 rounded-xl border-2 border-black space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-[#FFFF00]">
                    LONG-TERM MONTHLY HORIZON
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#022642] text-white border border-black">
                    30-Day Master
                  </span>
                </div>
                <h4 className="text-sm font-black text-white">Strategic Corridor Overhaul Objectives</h4>
                <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                  <li><strong>Track Renewal Programs (TRR/TSR):</strong> Achieve cumulative monthly target of 148.5 track-km to maintain track quality index (TQI &lt; 32).</li>
                  <li><strong>BCM Deep Screening:</strong> Restore ballast resilience and drainage cushion before winter temperature drops.</li>
                  <li><strong>Capital Interlocking Cutover:</strong> Modernize yards to Electronic Interlocking (EI) with Kavach automatic train protection.</li>
                  <li><strong>CRS 160 km/h Certification:</strong> Execute monthly high-speed oscillation trials supporting Mission Raftaar speed upgrades.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLOT DETAIL INSPECTOR MODAL                                               */}
      {/* ========================================================================= */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in backdrop-blur-xs">
          <div 
            style={{ backgroundColor: "#000D18", opacity: 1 }}
            className="w-full max-w-2xl rounded-2xl border-3 border-black shadow-[10px_10px_0_#000000] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-4 bg-[#022642] border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-[#00FFD2] text-black font-black border border-black">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.2 rounded text-[10px] font-mono font-black bg-black text-[#00FFD2]">
                      {activeSlot.horizon} HORIZON
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {activeSlot.dayOrPeriod} • {activeSlot.timeWindow}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white">{activeSlot.workType}</h3>
                </div>
              </div>

              <button
                onClick={() => setActiveSlot(null)}
                className="p-1.5 rounded-lg bg-[#000D18] hover:bg-slate-900 text-slate-300 hover:text-white border border-black cursor-pointer shadow-[1px_1px_0_#000000]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
              {/* Location & Track Coordinates */}
              <div 
                style={{ backgroundColor: "#011526", opacity: 1 }}
                className="p-3.5 rounded-xl border-2 border-black space-y-2"
              >
                <span className="text-[10px] font-mono font-black text-[#00FFD2] uppercase">
                  SECTION LOCATION & TRACK DETAILS
                </span>
                <p className="font-bold text-white text-sm">{activeSlot.locationSection}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono mt-1">
                  <div>
                    <span className="text-slate-400">Corridor:</span> <strong className="text-white">{activeSlot.corridorId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Track Line:</span> <strong className="text-white">{activeSlot.trackLine}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">KM Post:</span> <strong className="text-white">{activeSlot.fromKm} - {activeSlot.toKm}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Duration:</span> <strong className="text-white">{activeSlot.durationHours} Hours</strong>
                  </div>
                </div>
              </div>

              {/* Machinery & Directorate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div 
                  style={{ backgroundColor: "#011526", opacity: 1 }}
                  className="p-3 rounded-xl border-2 border-black space-y-1.5"
                >
                  <span className="text-[10px] font-mono font-black text-[#FFFF00] uppercase">
                    DIRECTORATE & WORKFORCE
                  </span>
                  <p className="font-bold text-white">{activeSlot.departmentName} ({activeSlot.departmentId})</p>
                  <p className="text-[11px] text-slate-300">
                    Chief Section Engineer Roster Verified • G&SR Section 15.06 Rules Enforced
                  </p>
                </div>

                <div 
                  style={{ backgroundColor: "#011526", opacity: 1 }}
                  className="p-3 rounded-xl border-2 border-black space-y-1.5"
                >
                  <span className="text-[10px] font-mono font-black text-[#6367FF] uppercase">
                    HEAVY MACHINERY ALLOCATED
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeSlot.machinery.map((m) => (
                      <span key={m} className="px-2 py-0.5 rounded bg-[#022642] text-cyan-300 border border-black font-mono text-[10px] font-bold">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Train Regulation & Freight Holds */}
              <div 
                style={{ backgroundColor: "#011526", opacity: 1 }}
                className="p-3.5 rounded-xl border-2 border-black space-y-2"
              >
                <span className="text-[10px] font-mono font-black text-[#FB2077] uppercase">
                  TRAIN REGULATION & TRAFFIC IMPACT
                </span>
                <div className="space-y-1 text-[11px]">
                  <p>
                    <span className="text-slate-400">Passenger Express Trains Regulated: </span>
                    {activeSlot.passengerTrainsRegulated.length > 0 ? (
                      <strong className="text-amber-300">{activeSlot.passengerTrainsRegulated.join("; ")}</strong>
                    ) : (
                      <strong className="text-emerald-400">None (Zero Passenger Delay)</strong>
                    )}
                  </p>
                  <p>
                    <span className="text-slate-400">Freight Traffic Advisory: </span>
                    <strong className="text-white">{activeSlot.freightImpact}</strong>
                  </p>
                  {activeSlot.speedRestriction && (
                    <p>
                      <span className="text-slate-400">Caution Order (TSR): </span>
                      <strong className="text-amber-300 font-mono">{activeSlot.speedRestriction}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#022642] border-t-2 border-black flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono font-bold text-slate-300">
                Safety Clearance: <strong className="text-[#00FFD2]">100% G&SR Compliant</strong>
              </span>

              <div className="flex items-center space-x-2">
                <Link
                  href="/central/sanctions"
                  className="px-3.5 py-1.5 rounded-lg bg-[#00FFD2] hover:bg-[#33FFDC] text-black font-black text-xs border border-black shadow-[2px_2px_0_#000000] flex items-center space-x-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Form T/806</span>
                </Link>

                <button
                  onClick={() => setActiveSlot(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#000D18] hover:bg-slate-900 text-white font-black text-xs border border-black shadow-[2px_2px_0_#000000] cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OFFICIAL RAILWAY BOARD CIRCULAR EXPORT MODAL                              */}
      {/* ========================================================================= */}
      {showCircularModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in backdrop-blur-xs">
          <div 
            style={{ backgroundColor: "#000D18", opacity: 1 }}
            className="w-full max-w-3xl rounded-2xl border-3 border-black shadow-[10px_10px_0_#000000] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-4 bg-[#022642] border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Printer className="w-5 h-5 text-[#00FFD2]" />
                <div>
                  <h3 className="text-base font-black text-white">
                    Official Railway Board Circular: {selectedHorizon} Maintenance Program
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    Government of India • Ministry of Railways • Railway Board Circular #RB/O&M/2026/HP-84
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCircularModal(false)}
                className="p-1.5 rounded-lg bg-[#000D18] text-slate-300 hover:text-white border border-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Circular Printable Canvas */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs bg-slate-950 text-slate-200 font-mono">
              <div className="text-center space-y-1 pb-4 border-b border-slate-700">
                <p className="font-bold text-sm tracking-widest text-[#00FFD2]">GOVERNMENT OF INDIA (BHARAT SARKAR)</p>
                <p className="font-bold text-xs">MINISTRY OF RAILWAYS (RAIL MANTRALAYA)</p>
                <p className="text-[11px] text-slate-400">RAILWAY BOARD • NEW DELHI</p>
                <p className="text-[10px] text-amber-300 font-bold mt-2">
                  CIRCULAR NO: RB/O&M/2026/{selectedHorizon}-PROGRAM-0927 • DATED: 27-SEP-2026
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <p><strong>To:</strong> General Managers, All Indian Railways & DFCCIL</p>
                <p><strong>Sub:</strong> Sanction of {selectedHorizon === "WEEKLY" ? "Weekly Rolling Short-Term Block Program" : "Monthly Strategic Corridor Overhaul Horizon"} for {selectedCorridor ? selectedCorridor.name : "National High-Density Corridors"}.</p>
                <p className="text-slate-300 leading-relaxed font-sans">
                  The Railway Board hereby approves the coordinated possession program over the {selectedHorizon} horizon as generated by RailPlan AI. All concerned Zonal Railways shall ensure strict compliance with G&SR Chapter XV, G&SR Rule 15.06, and provide mandatory 25kV traction power isolation certificates prior to ground possession.
                </p>
              </div>

              {/* Summary Metrics */}
              <div className="p-3 rounded bg-slate-900 border border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400">Total Hours:</span> <strong>{horizonKpis.totalHours} Hrs</strong>
                </div>
                <div>
                  <span className="text-slate-400">Target Track-KM:</span> <strong>{horizonKpis.totalTrackKm} Km</strong>
                </div>
                <div>
                  <span className="text-slate-400">Avg Train Delay:</span> <strong>{horizonKpis.avgDelay} Mins</strong>
                </div>
                <div>
                  <span className="text-slate-400">Conflict Score:</span> <strong className="text-emerald-400">{horizonKpis.avgScore}%</strong>
                </div>
              </div>

              {/* Slot Summary Table */}
              <div className="space-y-1">
                <p className="font-bold text-slate-300">Sanctioned Possession Slots:</p>
                <div className="border border-slate-700 rounded overflow-hidden">
                  <table className="w-full text-left text-[10px]">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-700">
                      <tr>
                        <th className="p-2">Period</th>
                        <th className="p-2">Time</th>
                        <th className="p-2">Line</th>
                        <th className="p-2">Dept</th>
                        <th className="p-2">Work</th>
                        <th className="p-2">TSR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {allHorizonSlots.slice(0, 8).map((s) => (
                        <tr key={s.id}>
                          <td className="p-2 whitespace-nowrap">{s.dayOrPeriod}</td>
                          <td className="p-2 whitespace-nowrap text-[#00FFD2]">{s.timeWindow}</td>
                          <td className="p-2 whitespace-nowrap">{s.trackLine}</td>
                          <td className="p-2">{s.departmentId}</td>
                          <td className="p-2 truncate max-w-xs">{s.workType}</td>
                          <td className="p-2 whitespace-nowrap text-amber-300">{s.speedRestriction || "None"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700 flex justify-between items-end text-[10px] text-slate-400">
                <div>
                  <p>Certified by: RailPlan AI Telemetry Engine</p>
                  <p>Digital Cryptographic Token: 0x9f4a...81bc26</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-200">Executive Director (Traffic & Maintenance)</p>
                  <p>Railway Board, New Delhi</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#022642] border-t-2 border-black flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#00FFD2] hover:bg-[#33FFDC] text-black font-black text-xs border border-black shadow-[2px_2px_0_#000000] flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Circular</span>
              </button>

              <button
                onClick={() => setShowCircularModal(false)}
                className="px-4 py-2 rounded-xl bg-[#000D18] hover:bg-slate-900 text-white font-black text-xs border border-black shadow-[2px_2px_0_#000000] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
