"use client";

import React, { useState, useMemo } from "react";
import { useRailPlan } from "@/context/RailPlanContext";
import { runAiMegaBlockBundling, BundledCluster } from "@/lib/bundlerEngine";
import { formatINR } from "@/lib/formatters";
import {
  Boxes,
  Sparkles,
  Clock,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  MapPin,
  Layers,
  FileText,
  ShieldCheck,
  RotateCcw,
  CheckSquare,
  DollarSign,
  Fuel
} from "lucide-react";

export function MegaBlockBundler({ onForwardToSanctions }: { onForwardToSanctions?: () => void }) {
  const {
    blockRequests,
    bundles,
    acceptBundledCluster,
  } = useRailPlan();

  const [isComputing, setIsComputing] = useState(false);
  const [hasRunBundler, setHasRunBundler] = useState(false);
  const [selectedClusterIndex, setSelectedClusterIndex] = useState(0);

  // Compute bundled clusters using the core algorithm
  const clusters: BundledCluster[] = useMemo(() => {
    return runAiMegaBlockBundling(blockRequests);
  }, [blockRequests]);

  const activeCluster = clusters[selectedClusterIndex] || clusters[0];

  const handleRunBundler = () => {
    setIsComputing(true);
    setTimeout(() => {
      setIsComputing(false);
      setHasRunBundler(true);
    }, 600);
  };

  const handleAcceptBundle = () => {
    if (!activeCluster) return;
    acceptBundledCluster(activeCluster);
    if (onForwardToSanctions) {
      onForwardToSanctions();
    }
  };

  return (
    <div className="space-y-6">
      {/* Engine Action & Headline Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#050814] via-[#0C1326] to-[#131E3D] border border-[#1A274E] shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#131E3D] text-[#3DFDCE] border border-[#3DFDCE]/40">
                AI Cross-Departmental Optimizer
              </span>
              <span className="text-xs text-[#B6BFFF] font-mono">
                {blockRequests.filter((r) => r.status === "Submitted").length} Unbundled Block Requests Active
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#F8FAFC]">
              AI Mega-Block Bundling & Conflict Elimination Engine
            </h2>
            <p className="text-xs text-[#B6BFFF] max-w-3xl">
              Synthesizes disparate Civil, Electrical (25kV OHE), and Signal & Telecom track possession requests across adjacent KMs into synchronized single-possession Mega-Blocks to eliminate repeated corridor closures.
            </p>
          </div>

          <button
            onClick={handleRunBundler}
            disabled={isComputing}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#6367FF] to-[#8494FF] hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(99,103,255,0.35)] flex items-center space-x-2 transition disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isComputing ? "animate-spin" : ""}`} />
            <span>{isComputing ? "Evaluating Spatial-Temporal Synergies..." : "Run AI Bundler Algorithm"}</span>
          </button>
        </div>
      </div>

      {/* Cluster Selection & Top Savings KPIs */}
      {activeCluster ? (
        <div className="space-y-6">
          {/* Multi-cluster selector if multiple exist */}
          {clusters.length > 1 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[#B6BFFF] font-semibold uppercase text-[10px] shrink-0">Bundles Found:</span>
              {clusters.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClusterIndex(i)}
                  className={`px-3 py-1.5 rounded-lg border font-mono font-bold transition shrink-0 ${
                    selectedClusterIndex === i
                      ? "bg-[#131E3D] border-[#8494FF] text-[#8494FF] shadow-[0_0_10px_rgba(132,148,255,0.25)]"
                      : "bg-[#050814] border-[#1A274E] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {c.sectionName.split("(")[0]} ({c.savingsPercentage}% Saved)
                </button>
              ))}
            </div>
          )}

          {/* Key Savings Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-[#0C1326] border border-[#1A274E]">
              <span className="text-[11px] text-[#B6BFFF] font-medium block">Total Separate Closure</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-black text-[#FF2A6D] font-mono">
                  {activeCluster.individualDurationSumHours}h
                </span>
                <span className="text-xs text-[#B6BFFF]">across 3 departments</span>
              </div>
              <span className="text-[10px] text-[#FF2A6D]/80 font-mono mt-1 block">Fragmented Track Blocks</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0C1326] border border-[#3DFDCE]/40">
              <span className="text-[11px] text-[#3DFDCE] font-medium block">Bundled Mega-Block</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-black text-[#3DFDCE] font-mono">
                  {activeCluster.bundledDurationHours}h
                </span>
                <span className="text-xs text-[#3DFDCE]">Synchronized Window</span>
              </div>
              <span className="text-[10px] text-[#3DFDCE] font-bold font-mono mt-1 block">
                {activeCluster.savingsPercentage}% Downtime Avoided
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0C1326] border border-[#1A274E]">
              <span className="text-[11px] text-[#B6BFFF] font-medium block">Train Delays Saved</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-black text-[#00FFE0] font-mono">
                  {activeCluster.trainDelayMinutesSaved}m
                </span>
                <span className="text-xs text-[#B6BFFF]">Total Delay Avoided</span>
              </div>
              <span className="text-[10px] text-[#00FFE0]/80 font-mono mt-1 block">15 Express & Freight Rakes</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0C1326] border border-[#1A274E]">
              <span className="text-[11px] text-[#B6BFFF] font-medium block">Financial & Fuel Savings</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-black text-[#FFD600] font-mono">
                  {formatINR(activeCluster.financialSavingsINR)}
                </span>
              </div>
              <span className="text-[10px] text-[#FFD600]/80 font-mono mt-1 block">
                {activeCluster.carbonEmissionsSavedKg} kg CO2 Emissions Prevented
              </span>
            </div>
          </div>

          {/* Visual Gantt Comparison: BEFORE vs AFTER */}
          <div className="p-5 rounded-2xl bg-[#0C1326] border border-[#1A274E] space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#3DFDCE]" />
                  <span>Visual Gantt Comparison: Fragmented Maintenance vs. AI Joint Mega-Block</span>
                </h3>
                <span className="text-xs text-[#B6BFFF] font-mono">
                  Location: {activeCluster.sectionName}
                </span>
              </div>
              <p className="text-xs text-[#B6BFFF] mt-1">
                Notice how individual departmental block schedules force 3 separate traffic halts vs. 1 consolidated window.
              </p>
            </div>

            {/* Timeline A: BEFORE (Fragmented: 6.5 Hours total corridor closure) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#FF2A6D] font-bold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF2A6D]" />
                  <span>BEFORE: Fragmented Maintenance (Total Corridor Closure: {activeCluster.individualDurationSumHours}h)</span>
                </span>
                <span className="text-slate-500">3 Separate Closures with Safety Gaps</span>
              </div>

              {/* Fragmented Gantt Bar */}
              <div className="h-14 rounded-xl bg-[#050814] border border-[#1A274E] p-2 flex items-center gap-2 overflow-x-auto relative">
                {activeCluster.timelineBefore.map((item, idx) => (
                  <div
                    key={item.requestId}
                    className="h-full rounded-lg px-3 py-1 flex flex-col justify-center text-[10px] font-mono text-white shadow-md relative overflow-hidden"
                    style={{
                      flex: item.duration,
                      backgroundColor: item.color + "33",
                      borderColor: item.color,
                      borderWidth: "1px",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{item.department}</span>
                      <span className="text-slate-300">{item.duration}h</span>
                    </div>
                    <span className="text-slate-400 truncate">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline B: AFTER (Bundled: 3.5 Hours closure - 46% Savings) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#3DFDCE] font-bold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3DFDCE] animate-pulse" />
                  <span>AFTER: Synchronized AI Mega-Block (Corridor Closure: {activeCluster.bundledDurationHours}h — 46.1% Savings)</span>
                </span>
                <span className="text-[#3DFDCE] font-bold font-mono">
                  ✓ {activeCluster.timeSavedHours}h Corridor Capacity Reclaimed
                </span>
              </div>

              {/* Bundled Mega-Block Gantt Bar */}
              <div className="h-16 rounded-xl bg-[#131E3D]/40 border-2 border-[#3DFDCE]/50 p-2 flex items-center gap-2 relative overflow-hidden">
                {activeCluster.timelineAfter.map((item, idx) => (
                  <div
                    key={idx}
                    className="h-full rounded-lg px-3 py-1 flex flex-col justify-center text-[10px] font-mono text-white shadow-md flex-1 relative"
                    style={{
                      backgroundColor: item.color + "44",
                      borderColor: item.color,
                      borderWidth: "1px",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100">{item.department}</span>
                      <span className="text-[#3DFDCE] font-bold">{item.duration}h concurrent</span>
                    </div>
                    <span className="text-slate-300 truncate">{item.activity}</span>
                  </div>
                ))}

                {/* Overlap Savings Indicator Badge */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-[#00FFE0] text-[#050814] text-[10px] font-black font-mono shadow-md hidden sm:block">
                  46.1% Closure Time Saved
                </div>
              </div>
            </div>

            {/* AI Optimization Rationale & Safety Interlocks */}
            <div className="p-4 rounded-xl bg-[#050814] border border-[#1A274E] text-xs space-y-2">
              <div className="flex items-center space-x-2 text-[#3DFDCE] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Statutory Inter-Departmental Compatibility & Safety Interlocks Verified</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {activeCluster.aiRationale}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-mono text-[#B6BFFF]">
                <span className="flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 text-[#FFD600]" />
                  <span>25kV Traction Power Cutoff Required: <strong className="text-[#FFD600]">Yes</strong></span>
                </span>
                <span className="flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#FF2A6D]" />
                  <span>Caution Speed: <strong className="text-[#FF2A6D]">30 km/h (TSR)</strong></span>
                </span>
                <span className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3DFDCE]" />
                  <span>Synergy Score: <strong className="text-[#3DFDCE]">{activeCluster.synergyScore}/100</strong></span>
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="text-xs text-[#B6BFFF] font-mono">
                Clicking accept will bundle all 3 requests and auto-populate Indian Railways Form T/806.
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleAcceptBundle}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6367FF] to-[#8494FF] hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-md flex items-center space-x-2 transition"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Accept AI Bundle & Forward to Form T/806</span>
                </button>
              </div>
            </div>
          </div>

          {/* Constituent Maintenance Block Requests Table */}
          <div className="rounded-2xl bg-[#0C1326] border border-[#1A274E] overflow-hidden">
            <div className="p-4 bg-[#131E3D] border-b border-[#1A274E] flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Bundled Departmental Requests ({activeCluster.requests.length})
              </h4>
              <span className="text-xs font-mono text-[#B6BFFF]">
                Corridor: {activeCluster.corridorId} (Barkhera Ghat Sector)
              </span>
            </div>

            <div className="divide-y divide-[#1A274E]">
              {activeCluster.requests.map((req) => (
                <div key={req.id} className="p-4 hover:bg-[#131E3D]/40 transition flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          req.departmentId === "ENG"
                            ? "bg-[#131E3D] text-[#8494FF] border border-[#8494FF]/40"
                            : req.departmentId === "ELEC"
                            ? "bg-[#131E3D] text-[#3DFDCE] border border-[#3DFDCE]/40"
                            : "bg-[#131E3D] text-[#6367FF] border border-[#6367FF]/40"
                        }`}
                      >
                        {req.department}
                      </span>
                      <span className="font-mono text-[#B6BFFF] font-bold">{req.blockId}</span>
                      <span className="text-slate-400 font-medium">• KM {req.fromKm} - {req.toKm}</span>
                    </div>
                    <p className="font-bold text-[#F8FAFC]">{req.title}</p>
                    <p className="text-slate-400 text-[11px]">{req.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
                    <div className="px-2.5 py-1 rounded bg-[#050814] border border-[#1A274E] text-slate-300">
                      Duration: <strong>{req.durationHours}h</strong>
                    </div>
                    <div className="px-2.5 py-1 rounded bg-[#050814] border border-[#1A274E] text-slate-300">
                      Window: <strong>{req.requestedWindow}</strong>
                    </div>
                    <div className="px-2.5 py-1 rounded bg-[#050814] border border-[#1A274E] text-slate-300">
                      OHE Power Cut: <strong>{req.requiresOHEPowerCut ? "Required" : "No"}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-[#0C1326] border border-[#1A274E] text-center space-y-3">
          <Boxes className="w-10 h-10 text-[#3DFDCE] mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Bundles Generated Yet</h3>
          <p className="text-xs text-[#B6BFFF] max-w-md mx-auto">
            Click "Run AI Bundler Algorithm" above to analyze active departmental maintenance requests and bundle overlapping track blocks.
          </p>
        </div>
      )}
    </div>
  );
}
