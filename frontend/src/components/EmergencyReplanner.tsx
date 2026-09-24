"use client";

import React, { useState } from "react";
import { useRailPlan } from "@/context/RailPlanContext";
import { useAuth } from "@/context/AuthContext";
import { formatINR } from "@/lib/formatters";
import {
  AlertTriangle,
  Zap,
  Flame,
  ShieldAlert,
  ArrowRight,
  Clock,
  Compass,
  Train,
  CheckCircle,
  Truck,
  RotateCcw,
  Sparkles,
  Lock,
  Stamp,
  Users
} from "lucide-react";

export function EmergencyReplanner() {
  const {
    trains,
    triggerEmergencyReplan,
    confirmEmergencyDispatch,
  } = useRailPlan();

  const { user, standardRole, canConfirmEmergency } = useAuth();

  const [activeIncident, setActiveIncident] = useState<{
    id: string;
    title: string;
    locationKm: string;
    trackLine: string;
    severity: string;
    description: string;
    icon: any;
  }>({
    id: "INC-OHE-114",
    title: "OHE Catenary Wire Snap & Substation Feeder Trip",
    locationKm: "KM 114/2 (Barkhera - Budni Ghat Section)",
    trackLine: "Down Line (25kV Dropper Broken)",
    severity: "CRITICAL",
    description: "Substation CB tripped at Barkhera TSS-02. Catenary wire snapped and entangled across Down Line. 4 approaching passenger and freight trains halted.",
    icon: Zap,
  });

  const [selectedScenario, setSelectedScenario] = useState<"SCENARIO_A" | "SCENARIO_B">("SCENARIO_A");
  const [isDispatched, setIsDispatched] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{ success: boolean; message: string } | null>(null);

  // Preset Incidents across major corridors
  const PRESET_INCIDENTS = [
    {
      id: "INC-OHE-114",
      title: "OHE Wire Snap at KM 114/2 (BPL-ET Barkhera Ghat)",
      locationKm: "KM 114/2 (Bhopal–Itarsi Ghat Section)",
      trackLine: "Down Line (25kV Dropper Broken)",
      severity: "CRITICAL",
      description: "Substation CB tripped at Barkhera TSS-02. Catenary wire snapped across Down Line. Immediate traction power cutoff required.",
      icon: Zap,
    },
    {
      id: "INC-RAIL-48",
      title: "Rail Fracture on Down Line at KM 48.4 (BPL-ET Mandideep)",
      locationKm: "KM 48.4 (Bhopal–Itarsi South Curve)",
      trackLine: "Down Line (Continuous Welded Rail Gap 22mm)",
      severity: "CRITICAL",
      description: "AFTC track circuit showing permanent red occupancy. Track gang reports 22mm fracture in rail head. Emergency jogged fishplate clamping needed.",
      icon: Flame,
    },
    {
      id: "INC-SIG-119",
      title: "Electronic Interlocking Failure at Itarsi North Cabin (BPL-ET)",
      locationKm: "KM 119.2 (Itarsi Junction Approach)",
      trackLine: "Both Lines (Route Relay Interlocking Stall)",
      severity: "HIGH",
      description: "Standby VDU communication lost on Point Machine PM-14. Signals defaulting to Danger under fail-safe protocol.",
      icon: AlertTriangle,
    },
    {
      id: "INC-MMCT-680",
      title: "Rail Track Thermal Buckling at KM 682.0 (NDLS-MMCT Ratlam)",
      locationKm: "KM 682.0 (Delhi–Mumbai Ratlam Cuttings)",
      trackLine: "Up Main Line (Rail Temp 63.8°C Spike)",
      severity: "CRITICAL",
      description: "High ambient heat induced severe lateral track distortion (34mm gauge deviation). Approaching 12952 Rajdhani halted at preceding automatic signal.",
      icon: Flame,
    },
    {
      id: "INC-WDFC-445",
      title: "Hot Axle Bearing Detector (HABD) Alarm (WDFC-01 Rewari)",
      locationKm: "KM 445.6 (Western Dedicated Freight Corridor)",
      trackLine: "Down Freight Line (32.5T Heavy Haul)",
      severity: "CRITICAL",
      description: "Automated wayside sensor detected axle temperature >98°C on BLCA container wagon #42089. Automated emergency braking applied by ETCS-2.",
      icon: Zap,
    },
    {
      id: "INC-KRCL-410",
      title: "Monsoon Boulder Net Disruption at KM 412 (KONKAN-01 Karwar)",
      locationKm: "KM 412.0 (Konkan Railway Panval Viaduct Approach)",
      trackLine: "Single Line (Slope Inclinometer Trip)",
      severity: "HIGH",
      description: "Heavy rain triggered rockfall fence trip wire at KM 412. Electronic trip alerted Karwar OCC. Immediate track patrol required before train passage.",
      icon: AlertTriangle,
    },
  ];

  const handleSelectIncident = (inc: typeof PRESET_INCIDENTS[0]) => {
    setActiveIncident(inc);
    setIsDispatched(false);
    setDispatchResult(null);
  };

  const handleConfirmDispatch = () => {
    const result = confirmEmergencyDispatch(
      selectedScenario,
      activeIncident.title,
      selectedScenario === "SCENARIO_A" ? "Single-Line Working (2.5h)" : "Chord Line Diversion (3.0h)"
    );
    setDispatchResult(result);
    if (result.success) {
      setIsDispatched(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#050814] via-[#0C1326] to-[#131E3D] border border-[#FF2A6D]/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#131E3D] text-[#FF2A6D] border border-[#FF2A6D]/50 flex items-center space-x-1">
                <ShieldAlert className="w-3 h-3 text-[#FF2A6D]" />
                <span>OCC Emergency Replanning Sandbox ("What-If" Simulator)</span>
              </span>
              <span className="text-xs text-[#B6BFFF] font-mono">Multi-Corridor National OCC Emergency Sandbox</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#F8FAFC]">
              Dynamic Crisis Rescheduling & Contingency Dispatch
            </h2>
            <p className="text-xs text-[#B6BFFF] max-w-3xl">
              Simulate unforeseen corridor disruptions (catenary snaps, rail fractures, interlocking failures) and generate optimized multi-train rerouting contingency scenarios with granular delay and demurrage modeling.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-[#B6BFFF]">Current RBAC Persona:</span>
            <span className="px-2.5 py-1 rounded bg-[#050814] border border-[#1A274E] text-xs font-bold text-[#3DFDCE]">
              {user?.designation || standardRole}
            </span>
          </div>
        </div>
      </div>

      {/* Preset Incident Selector Chips */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#B6BFFF]">
          Select or Simulate Crisis Incident:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_INCIDENTS.map((inc) => {
            const isCurrent = activeIncident.id === inc.id;
            const Icon = inc.icon;
            return (
              <button
                key={inc.id}
                onClick={() => handleSelectIncident(inc)}
                className={`p-4 rounded-xl border text-left transition flex items-start space-x-3 ${
                  isCurrent
                    ? "bg-[#131E3D] border-[#FF2A6D] shadow-md shadow-[#FF2A6D]/30"
                    : "bg-[#0C1326] border-[#1A274E] hover:border-[#6367FF]/60"
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${isCurrent ? "bg-[#FF2A6D] text-white" : "bg-[#050814] text-slate-400"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#F8FAFC]">{inc.title}</h4>
                  <p className="text-[11px] text-[#B6BFFF] font-mono mt-0.5">{inc.locationKm}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Incident Details Card */}
      <div className="p-5 rounded-2xl bg-[#0C1326] border border-[#FF2A6D]/50 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF2A6D] animate-ping" />
            <span className="text-xs font-mono font-bold text-[#FF2A6D] uppercase">
              Active Simulation: {activeIncident.severity}
            </span>
          </div>
          <span className="text-xs font-mono text-[#B6BFFF]">{activeIncident.locationKm}</span>
        </div>
        <h3 className="text-base font-bold text-[#F8FAFC]">{activeIncident.title}</h3>
        <p className="text-xs text-slate-300 leading-relaxed">{activeIncident.description}</p>
      </div>

      {/* AI Plan Generator: Scenario A vs Scenario B */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>AI Contingency Replanning Scenarios (Side-by-Side Comparison)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Evaluated against 15 active trains & G&SR 15.17 rules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SCENARIO A */}
          <div
            onClick={() => setSelectedScenario("SCENARIO_A")}
            className={`p-5 rounded-2xl border cursor-pointer transition space-y-4 ${
              selectedScenario === "SCENARIO_A"
                ? "bg-[#131E3D]/60 border-[#3DFDCE] shadow-xl shadow-[#3DFDCE]/20"
                : "bg-[#0C1326] border-[#1A274E] hover:border-[#6367FF]/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#131E3D] text-[#3DFDCE] border border-[#3DFDCE]/50">
                SCENARIO A (Recommended)
              </span>
              <span className="text-xs font-mono font-bold text-[#3DFDCE]">
                Single-Line Working on Up Line
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#F8FAFC]">
                Bi-Directional Pilot Working via Crossover
              </h4>
              <p className="text-xs text-[#B6BFFF] mt-1">
                Convert Up-Line to bi-directional temporary block under G&SR 15.17. Pilot clearance for high-priority trains (*12002 Shatabdi*, *22470 Vande Bharat*).
              </p>
            </div>

            {/* Impact Metric Chips */}
            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              <div className="p-2 rounded-lg bg-[#050814] border border-[#1A274E]">
                <span className="text-[10px] text-[#B6BFFF] block">Avg Pax Delay</span>
                <span className="text-sm font-bold text-[#3DFDCE]">18 Mins</span>
              </div>
              <div className="p-2 rounded-lg bg-[#050814] border border-[#1A274E]">
                <span className="text-[10px] text-[#B6BFFF] block">Freight Penalty</span>
                <span className="text-sm font-bold text-[#FFD600]">{formatINR(185000)}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#050814] border border-[#1A274E]">
                <span className="text-[10px] text-[#B6BFFF] block">Crew ETA</span>
                <span className="text-sm font-bold text-[#00FFE0]">22 Mins</span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex items-center space-x-1.5 text-[#3DFDCE]">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>50% corridor capacity preserved</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[#B6BFFF]">
                <span>• Caution order: TSR 25 km/h over Barkhera facing crossover</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[#B6BFFF]">
                <span>• Freight coal rake regulated in Barkhera loop for 35 mins</span>
              </div>
            </div>
          </div>

          {/* SCENARIO B */}
          <div
            onClick={() => setSelectedScenario("SCENARIO_B")}
            className={`p-5 rounded-2xl border cursor-pointer transition space-y-4 ${
              selectedScenario === "SCENARIO_B"
                ? "bg-[#131E3D]/60 border-[#00FFE0] shadow-xl shadow-[#00FFE0]/20"
                : "bg-[#0C1326] border-[#1A274E] hover:border-[#6367FF]/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#131E3D] text-[#00FFE0] border border-[#00FFE0]/50">
                SCENARIO B (Alternative)
              </span>
              <span className="text-xs font-mono font-bold text-[#00FFE0]">
                Strategic Chord Line Diversion
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#F8FAFC]">
                Total Diversion & Isolated Work Corridor
              </h4>
              <p className="text-xs text-[#B6BFFF] mt-1">
                Divert incoming passenger express traffic via Chord Loop line and hold freight at Mandideep Yard. Guarantees 100% unimpeded possession for emergency Tower Wagon.
              </p>
            </div>

            {/* Impact Metric Chips */}
            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              <div className="p-2 rounded-lg bg-[#050814] border border-[#1A274E]">
                <span className="text-[10px] text-[#B6BFFF] block">Avg Pax Delay</span>
                <span className="text-sm font-bold text-[#FFD600]">32 Mins</span>
              </div>
              <div className="p-2 rounded-lg bg-[#050814] border border-[#1A274E]">
                <span className="text-[10px] text-[#B6BFFF] block">Freight Penalty</span>
                <span className="text-sm font-bold text-[#FF2A6D]">{formatINR(340000)}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#050814] border border-[#1A274E]">
                <span className="text-[10px] text-[#B6BFFF] block">Crew ETA</span>
                <span className="text-sm font-bold text-[#3DFDCE]">14 Mins</span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex items-center space-x-1.5 text-[#00FFE0]">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Zero interference with emergency breakdown gang</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[#B6BFFF]">
                <span>• Full track possession issued instantly to OHE Tower Wagon</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[#B6BFFF]">
                <span>• Passenger routes extended by 14 track kilometers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation & OCC Dispatch Execution Bar */}
      <div className="p-5 rounded-2xl bg-[#0C1326] border border-[#1A274E] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">
              Role-Based Access Enforcement (RBAC Security)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {canConfirmEmergency ? (
              <span className="text-emerald-400 font-medium">
                ✓ Authorized: Current persona ({user?.designation}) possesses statutory authority to dispatch emergency orders under G&SR 15.06.
              </span>
            ) : (
              <span className="text-rose-400 font-medium">
                ⚠️ Restricted: Only OCC Chief Controller or Safety Officer can authorize emergency dispatch orders. Switch role to authorize.
              </span>
            )}
          </p>
        </div>

        <button
          onClick={handleConfirmDispatch}
          disabled={isDispatched}
          className={`w-full sm:w-auto min-h-[44px] justify-center px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-xl flex items-center space-x-2 transition ${
            isDispatched
              ? "bg-slate-800 text-slate-400 cursor-not-allowed"
              : canConfirmEmergency
              ? "bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-950/60"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          <Stamp className="w-4 h-4" />
          <span>
            {isDispatched
              ? "Emergency Plan Enacted"
              : `Execute OCC Dispatch Order (${selectedScenario === "SCENARIO_A" ? "Scenario A" : "Scenario B"})`}
          </span>
        </button>
      </div>

      {/* Dispatch Result Feedback Box */}
      {dispatchResult && (
        <div
          className={`p-4 rounded-xl border text-xs font-mono animate-in fade-in ${
            dispatchResult.success
              ? "bg-emerald-950/40 border-emerald-500 text-emerald-300"
              : "bg-rose-950/40 border-rose-500 text-rose-300"
          }`}
        >
          <div className="flex items-center space-x-2 font-bold mb-1">
            {dispatchResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{dispatchResult.success ? "OCC Dispatch Executed" : "Authorization Denied"}</span>
          </div>
          <p>{dispatchResult.message}</p>
        </div>
      )}
    </div>
  );
}
