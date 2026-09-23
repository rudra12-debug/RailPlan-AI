"use client";

import React, { useState, useMemo } from "react";
import { useRailPlan, ZONE_CORRIDOR_MAP } from "@/context/RailPlanContext";
import { formatINR } from "@/lib/formatters";
import { DepartmentId } from "@/lib/types";
import { 
  Package, 
  Sparkle, 
  Clock, 
  TrendDown, 
  CheckCircle, 
  Stack, 
  MapPin, 
  ArrowRight, 
  Lightning, 
  Plus, 
  Sliders, 
  CurrencyInr, 
  ShieldCheck, 
  MagnifyingGlass, 
  Funnel, 
  CheckSquare, 
  Square, 
  Fire, 
  FileText, 
  Truck, 
  Buildings, 
  Calendar 
} from "@phosphor-icons/react";

interface UnifiedActivityItem {
  id: string;
  title: string;
  departmentId: DepartmentId;
  corridorId: string;
  locationKm: string;
  estimatedDurationHours: number;
  estimatedCost: number;
  status: string;
  date: string;
  sourceType: "MAINTENANCE_TASK" | "SERVICE_REQUEST";
}

export default function TaskBundlingPage() {
  const { 
    bundles, 
    maintenanceTasks, 
    requests, 
    corridors, 
    createCustomBundle, 
    approveBundle, 
    executeBundle,
    selectedCorridorId,
    setSelectedCorridorId,
    selectedZone
  } = useRailPlan();

  const availableCorridors = useMemo(() => {
    const allowed = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    return corridors.filter((c) => allowed.includes(c.id));
  }, [corridors, selectedZone]);

  // Combine both standalone Maintenance Tasks and Submitted/Pending/Approved Service Requests into candidate list
  const unifiedActivities = useMemo<UnifiedActivityItem[]>(() => {
    const taskItems: UnifiedActivityItem[] = maintenanceTasks.map((t) => ({
      id: t.id,
      title: t.title,
      departmentId: t.departmentId,
      corridorId: t.corridorId || "NDLS-MMCT",
      locationKm: t.locationKm || "KM 148.0 - 156.0",
      estimatedDurationHours: t.estimatedDurationHours || 4,
      estimatedCost: t.estimatedCost || 150000,
      status: t.status,
      date: t.recommendedDate || "2026-08-30",
      sourceType: "MAINTENANCE_TASK",
    }));

    const requestItems: UnifiedActivityItem[] = requests
      .filter((r) => r.status !== "CLOSED" && r.status !== "REJECTED")
      .map((r) => ({
        id: r.id,
        title: r.title,
        departmentId: (r.assignedToDepartment || r.requestingDepartment || "ENG") as DepartmentId,
        corridorId: r.corridorId || "NDLS-MMCT",
        locationKm: r.locationKm || "KM 148.0 - 154.0",
        estimatedDurationHours: 4,
        estimatedCost: r.estimatedCost || 250000,
        status: r.status,
        date: r.requiredDate || r.submissionDate || "2026-08-30",
        sourceType: "SERVICE_REQUEST",
      }));

    return [...taskItems, ...requestItems];
  }, [maintenanceTasks, requests]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCorridor, setSelectedCorridor] = useState<string>(() => selectedCorridorId || "ALL");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(["MT-101", "MT-102", "SR-1040"]);
  const [customTitle, setCustomTitle] = useState("");
  const [isBundledSuccess, setIsBundledSuccess] = useState(false);

  // Sync with global corridor selection
  React.useEffect(() => {
    if (selectedCorridorId) {
      setSelectedCorridor(selectedCorridorId);
    }
  }, [selectedCorridorId]);

  const handleCorridorFilterChange = (corrId: string) => {
    setSelectedCorridor(corrId);
    setSelectedCorridorId(corrId);
  };

  // Filtered candidate activities
  const filteredActivities = useMemo(() => {
    const allowedZoneCorridors = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];

    return unifiedActivities.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.locationKm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.corridorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.departmentId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCorridor =
        selectedCorridor === "ALL"
          ? allowedZoneCorridors.includes(item.corridorId)
          : item.corridorId === selectedCorridor;

      const matchesDept = selectedDept === "ALL" || item.departmentId === selectedDept;

      return matchesSearch && matchesCorridor && matchesDept;
    });
  }, [unifiedActivities, searchQuery, selectedCorridor, selectedDept, selectedZone]);

  // Auto-Detect AI Spatio-Temporal Bundling Opportunities
  const aiDetectedClusters = useMemo(() => {
    // Group activities that share close proximity or corridor sections (e.g. Mathura, Rewari, Kanpur, Surat)
    const groups: {
      name: string;
      corridorId: string;
      locationKm: string;
      items: UnifiedActivityItem[];
      rationale: string;
    }[] = [
      {
        name: "Mathura Junction Golden Trunk Mega Block (KM 148 - 154)",
        corridorId: "NDLS-MMCT",
        locationKm: "KM 148.0 - 154.0 (Mathura Section)",
        items: unifiedActivities.filter((a) => {
          const loc = a.locationKm.toLowerCase();
          const title = a.title.toLowerCase();
          return (
            (a.corridorId === "NDLS-MMCT" || loc.includes("mathura") || loc.includes("148") || loc.includes("152") || title.includes("mathura")) &&
            (a.id === "MT-101" || a.id === "MT-102" || a.id === "MT-103" || a.id === "SR-1042" || a.id === "SR-1040" || loc.includes("148"))
          );
        }),
        rationale: "Civil Track renewal (ENG), 25kV OHE catenary sag (ELEC), and Kavach Point Machine PM-12 (SNT) all fall within 6km of Mathura Yard. Merging eliminates duplicate traffic blocks.",
      },
      {
        name: "WDFC Rewari-Ateli Freight Heavy Block (KM 140 - 175)",
        corridorId: "WDFC-01",
        locationKm: "KM 140.0 - 175.0 (Rewari Section)",
        items: unifiedActivities.filter((a) => {
          const loc = a.locationKm.toLowerCase();
          return a.corridorId === "WDFC-01" || loc.includes("rewari") || loc.includes("wdfc");
        }),
        rationale: "Tamping machine TM-04 deployment (WRK) and Substation civil rehabilitation (ENG) are scheduled on the same double-stack freight segment.",
      },
    ].filter((g) => g.items.length >= 2);

    return groups;
  }, [unifiedActivities]);

  const toggleTaskSelection = (id: string) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter((item) => item !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  const handleApplyCluster = (clusterItemIds: string[], clusterName: string) => {
    setSelectedTaskIds(clusterItemIds);
    setCustomTitle(clusterName);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  // Real-time dynamic bundling preview
  const selectedItems = unifiedActivities.filter((t) => selectedTaskIds.includes(t.id));
  const totalIndividualHours = selectedItems.reduce((acc, t) => acc + t.estimatedDurationHours, 0);
  const bundledHours =
    selectedItems.length > 0
      ? Number((Math.max(...selectedItems.map((t) => t.estimatedDurationHours), 3) * 1.15).toFixed(1))
      : 0;
  const timeSaved = Number((totalIndividualHours - bundledHours).toFixed(1));
  const timeSavedPct = totalIndividualHours > 0 ? Math.round((timeSaved / totalIndividualHours) * 100) : 0;
  const financialSavings = Math.round(selectedItems.reduce((acc, t) => acc + t.estimatedCost, 0) * 0.22);
  const delayPreventedMins = Math.round(timeSaved * 35);

  const handleCreateBundle = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTaskIds.length < 2) {
      alert("Please select at least 2 candidate activities to merge.");
      return;
    }
    createCustomBundle(selectedTaskIds, customTitle);
    setIsBundledSuccess(true);
    setTimeout(() => setIsBundledSuccess(false), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#030914] via-[#061526] to-[#0A1F36] border border-amber-500/30 flex flex-wrap items-center justify-between gap-4 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/80 px-2 py-0.5 rounded uppercase shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              AI Spatio-Temporal Clustering Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">Multi-Department Joint Corridor Block Optimizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            AI Task Bundling & Block Window System
          </h1>
          <p className="text-xs text-slate-400">
            Merge departmental maintenance activities (Civil, Electrical, Signals, P-Way) on the same track section into a single unified block window to slash train delays by up to 60%
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#030914] border border-amber-500/50 text-amber-300 text-xs font-bold font-mono shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            {bundles.length} Active Mega Blocks
          </span>
        </div>
      </div>

      {/* Macro Impact Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#061526]/90 backdrop-blur-md border border-slate-800/80 text-center space-y-1 shadow-xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Track Block Time Saved</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">42% Avg</p>
          <span className="text-[10px] text-slate-400 font-mono">-14.5 Hours Track Closure</span>
        </div>

        <div className="p-4 rounded-xl bg-[#061526]/90 backdrop-blur-md border border-slate-800/80 text-center space-y-1 shadow-xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Financial Cost Savings</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">₹7.25 L</p>
          <span className="text-[10px] text-slate-400 font-mono">Shared Machinery & Safety</span>
        </div>

        <div className="p-4 rounded-xl bg-[#061526]/90 backdrop-blur-md border border-slate-800/80 text-center space-y-1 shadow-xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Passenger Delays Prevented</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-mono">680 Mins</p>
          <span className="text-[10px] text-slate-400 font-mono">34 Express Trains Saved</span>
        </div>

        <div className="p-4 rounded-xl bg-[#061526]/90 backdrop-blur-md border border-slate-800/80 text-center space-y-1 shadow-xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Merged Activities</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
            {bundles.reduce((acc, b) => acc + (b.taskIds?.length || b.tasksSummary?.length || 0), 0) + selectedItems.length} Activities
          </p>
          <span className="text-[10px] text-slate-400 font-mono">Across 4 Directorates</span>
        </div>
      </div>

      {/* 1. AI-Detected Smart Bundling Opportunities (Auto-Cluster Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkle size={18} weight="duotone" className="text-amber-400 animate-pulse" />
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-300">
              AI-Detected Spatio-Temporal Bundling Opportunities
            </h2>
          </div>
          <span className="text-xs text-amber-300 font-mono font-semibold">
            {aiDetectedClusters.length} Overlapping Clusters Found
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiDetectedClusters.map((cluster, idx) => {
            const indHours = cluster.items.reduce((acc, t) => acc + t.estimatedDurationHours, 0);
            const bunHours = Number((Math.max(...cluster.items.map((t) => t.estimatedDurationHours), 3) * 1.15).toFixed(1));
            const savedH = Number((indHours - bunHours).toFixed(1));
            const savedP = Math.round((savedH / indHours) * 100);
            const depts = Array.from(new Set(cluster.items.map((t) => t.departmentId)));

            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 border border-amber-500/40 shadow-xl space-y-4 hover:border-amber-500/70 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700 px-2 py-0.5 rounded uppercase">
                        {cluster.corridorId}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{cluster.locationKm}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 mt-1">{cluster.name}</h3>
                  </div>

                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                    Saves {savedP}% Time
                  </span>
                </div>

                {/* Merged Items Badges */}
                <div className="space-y-1.5 p-3 rounded-xl bg-navy-950 border border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Detected Candidate Activities ({cluster.items.length} departments):
                  </p>
                  <div className="space-y-1">
                    {cluster.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs p-1.5 rounded bg-navy-900 border border-slate-800/80"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className="font-mono text-amber-400 font-bold text-[11px]">{item.id}</span>
                          <span className="text-slate-200 truncate">{item.title}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0 ml-2">
                          {item.departmentId} • {item.estimatedDurationHours}h
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-navy-950 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Separate Blocks</p>
                    <p className="font-mono font-bold text-rose-400 line-through mt-0.5">{indHours} Hours</p>
                  </div>
                  <div className="p-2 rounded-lg bg-navy-950 border border-amber-500/40">
                    <p className="text-[10px] text-amber-300 font-bold">Joint Mega Block</p>
                    <p className="font-mono font-extrabold text-amber-400 mt-0.5">{bunHours} Hours</p>
                  </div>
                  <div className="p-2 rounded-lg bg-navy-950 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Time Saved</p>
                    <p className="font-mono font-bold text-emerald-400 mt-0.5">-{savedH}h ({savedP}%)</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed italic">
                  "{cluster.rationale}"
                </div>

                <button
                  onClick={() => handleApplyCluster(cluster.items.map((i) => i.id), cluster.name)}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#030914] font-extrabold text-xs flex items-center justify-center space-x-2 transition shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                >
                  <Lightning size={16} weight="fill" />
                  <span>⚡ Select & Configure This Mega Block</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Custom Task Bundler Wizard */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#061526]/90 backdrop-blur-md p-6 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center space-x-2">
              <Package size={22} weight="duotone" className="text-amber-400" />
              <h3 className="text-base font-bold text-slate-100">
                Interactive Multi-Department Activity Selector & Bundler
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select 2 or more standalone maintenance activities or department requests to generate an optimal joint block window
            </p>
          </div>

          {isBundledSuccess && (
            <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 text-xs font-bold font-mono rounded-lg flex items-center space-x-1.5 animate-scale-up">
              <CheckCircle size={16} weight="duotone" />
              <span>Joint Mega Block Order Sanctioned & Dispatched!</span>
            </span>
          )}
        </div>

        {/* Filter and Search Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#030914]/90 border border-slate-800/80">
          <div className="relative">
            <MagnifyingGlass size={15} weight="bold" className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Mathura, 148 km, Signal, OHE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#040D1A] border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <select
              value={selectedCorridor}
              onChange={(e) => handleCorridorFilterChange(e.target.value)}
              aria-label="Filter Corridor"
              className="w-full bg-[#040D1A] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono font-bold"
            >
              <option value="ALL">{selectedZone.startsWith("All") ? `All Corridors (${corridors.length})` : `All ${selectedZone.split("(")[0].trim()} (${availableCorridors.length})`}</option>
              {availableCorridors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} - {c.name.split("(")[0]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              aria-label="Filter Directorate"
              className="w-full bg-[#040D1A] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All Connected Directorates (Civil, Electrical/OHE, Signal & Traffic, Safety)</option>
              <option value="ENG">Civil - Track & Infrastructure</option>
              <option value="ELEC">Electrical/OHE - 25kV Traction</option>
              <option value="SNT">Signal & Traffic - Interlocking & Kavach</option>
              <option value="SFTY">Safety - CRS & Pre-Block Audits</option>
            </select>
          </div>
        </div>

        {/* Task & Request Selection Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Step 1: Select Activities to Merge ({selectedTaskIds.length} Selected of {filteredActivities.length})
            </p>
            <div className="flex space-x-2 text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedTaskIds(filteredActivities.map((a) => a.id))}
                className="text-amber-400 hover:text-amber-300 underline"
              >
                Select All Filtered
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={() => setSelectedTaskIds([])}
                className="text-slate-400 hover:text-slate-200 underline"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredActivities.map((item) => {
              const isSelected = selectedTaskIds.includes(item.id);
              const isRequest = item.sourceType === "SERVICE_REQUEST";

              return (
                <div
                  key={item.id}
                  onClick={() => toggleTaskSelection(item.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-2.5 ${
                    isSelected
                      ? "bg-navy-950 border-amber-500 shadow-md ring-1 ring-amber-500/40"
                      : "bg-navy-950/60 border-slate-800 hover:border-slate-700 hover:bg-navy-950"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                        <span className="text-[10px] font-mono font-bold text-amber-400">{item.id}</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {item.departmentId}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                            isRequest
                              ? "bg-blue-950 text-blue-300 border border-blue-800"
                              : "bg-purple-950 text-purple-300 border border-purple-800"
                          }`}
                        >
                          {isRequest ? "Service Request" : "P-Way Task"}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 mt-1 line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                    </div>

                    <div className="mt-1 shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-amber-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors" />
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono truncate">{item.corridorId} ({item.locationKm.split("(")[0]})</span>
                    <span className="font-mono font-bold text-slate-200 shrink-0 ml-2">{item.estimatedDurationHours}h Block</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Dynamic AI Bundling Optimization Computation Box */}
        {selectedItems.length > 0 && (
          <form onSubmit={handleCreateBundle} className="p-5 rounded-xl bg-[#030914]/90 border border-amber-500/40 space-y-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
                <Sparkle size={16} weight="duotone" className="text-amber-400 animate-pulse" />
                <span>AI Live Bundling Optimization Analysis ({selectedItems.length} Activities Selected)</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(16,231,178,0.2)]">
                {timeSavedPct}% Total Track Closure Reduction
              </span>
            </div>

            {/* Before vs After Block Window Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3.5 rounded-lg bg-[#061526]/90 border border-slate-800/80">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Separate Individual Blocks</p>
                <p className="text-xl font-bold text-rose-400 font-mono mt-0.5 line-through">
                  {totalIndividualHours} Hours
                </p>
                <p className="text-[10px] text-slate-400">Multiple traffic interruptions</p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#061526]/90 border border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <p className="text-[10px] text-amber-300 uppercase font-bold">Joint Mega Block Window</p>
                <p className="text-2xl font-extrabold text-amber-400 font-mono mt-0.5">
                  {bundledHours} Hours Total
                </p>
                <p className="text-[10px] text-emerald-400 font-semibold font-mono">
                  Saves {timeSaved} Hours ({timeSavedPct}%)
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#061526]/90 border border-slate-800/80">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Delay Prevented & Savings</p>
                <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                  {formatINR(financialSavings)}
                </p>
                <p className="text-[10px] text-sky-300 font-mono font-semibold">
                  {delayPreventedMins} Mins Delay Prevented
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Unified Mega Block Order Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Delhi-Mumbai Mathura Section Joint Mega Block"
                  className="w-full bg-[#040D1A] border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Optimal Synchronized Night Window
                </label>
                <div className="p-2.5 rounded-lg bg-[#040D1A] border border-slate-800 text-xs text-amber-300 font-mono flex items-center justify-between">
                  <span>01:30 AM – 05:30 AM (Low-Traffic Window)</span>
                  <span className="text-[10px] text-slate-400 font-mono">G&SR Rule 15.06</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={selectedItems.length < 2}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-[#030914] font-extrabold text-xs flex items-center space-x-2 transition transform active:scale-95 disabled:opacity-50 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              >
                <Lightning size={16} weight="fill" />
                <span>Sanction Unified Joint Mega Block Order (Form T/806 Window)</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 3. Active Bundled Maintenance Orders Registry */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            Active Bundled Mega Block Orders Registry
          </h2>
          <span className="text-xs text-amber-300 font-mono font-semibold">Central Authority Sanctions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bundles.map((bundle) => {
            const isApproved = bundle.status === "APPROVED";
            const isExecuting = bundle.status === "IN_EXECUTION";

            return (
              <div
                key={bundle.id}
                className="rounded-2xl border border-slate-800/80 bg-[#061526]/90 backdrop-blur-md p-5 space-y-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 uppercase">
                          {bundle.id} • {bundle.corridorId}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{bundle.scheduledDate}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-100 mt-1">{bundle.title}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{bundle.locationKm}</p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase border ${
                        isExecuting
                          ? "bg-blue-950 text-blue-400 border-blue-700 animate-pulse"
                          : isApproved
                          ? "bg-emerald-950 text-emerald-400 border-emerald-700"
                          : "bg-amber-950 text-amber-400 border-amber-700"
                      }`}
                    >
                      {bundle.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Bundled Tasks List */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-[#030914]/90 border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Merged Activities ({bundle.tasksSummary.length} departmental tasks):
                    </p>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {bundle.tasksSummary.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between text-xs p-1.5 rounded bg-[#040D1A] border border-slate-800/80"
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span className="font-mono text-amber-400 font-bold text-[11px]">{t.id}</span>
                            <span className="text-slate-200 truncate">{t.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 ml-2 shrink-0">
                            {t.durationHours}h • {t.departmentId}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Savings Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-[#030914]/90 border border-slate-800">
                      <p className="text-[10px] text-slate-400 font-semibold">Block Window</p>
                      <p className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                        {bundle.bundledBlockHours}h ({bundle.timeReductionPercent}% saved)
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-[#030914]/90 border border-slate-800">
                      <p className="text-[10px] text-slate-400 font-semibold">Cost Savings</p>
                      <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                        {formatINR(bundle.financialSavingsINR)}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-[#030914]/90 border border-slate-800">
                      <p className="text-[10px] text-slate-400 font-semibold">Delay Avoided</p>
                      <p className="text-sm font-bold text-sky-300 font-mono mt-0.5">
                        {bundle.trainsDelaySavedMinutes} Mins
                      </p>
                    </div>
                  </div>

                  {/* AI Rationale */}
                  <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-600/30 text-[11px] text-slate-300 space-y-0.5">
                    <span className="font-bold text-amber-300">AI Clustering Rationale: </span>
                    <span>{bundle.aiBundlingRationale}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
                    <Clock size={14} weight="duotone" className="text-amber-400" />
                    <span>{bundle.timeWindow}</span>
                  </div>

                  {isApproved ? (
                    <button
                      onClick={() => executeBundle(bundle.id)}
                      className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 transition"
                    >
                      <Lightning size={14} weight="fill" />
                      <span>Commence Joint Block</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => approveBundle(bundle.id)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition"
                    >
                      <CheckCircle size={14} weight="duotone" />
                      <span>Approve Mega Block</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
