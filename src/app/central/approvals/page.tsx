"use client";

import React, { useState, useMemo } from "react";
import { useRailPlan, ZONE_CORRIDOR_MAP } from "@/context/RailPlanContext";
import { RequestTable } from "@/components/requests/RequestTable";
import { KpiCard } from "@/components/common/KpiCard";
import { 
  CheckSquare, 
  Clock, 
  CheckCircle, 
  Stack, 
  Sparkle,
  ShieldCheck,
  Funnel
} from "@phosphor-icons/react";

export default function ApprovalCenterPage() {
  const { requests, selectedCorridorId, setSelectedCorridorId, selectedZone, corridors } = useRailPlan();
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "ACTIVE" | "COMPLETED" | "CLOSED">("PENDING");

  const availableCorridors = useMemo(() => {
    const allowed = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    return corridors.filter((c) => allowed.includes(c.id));
  }, [corridors, selectedZone]);

  const isCorridorFiltered = selectedCorridorId !== "ALL";
  const selectedCorridor = corridors.find((c) => c.id === selectedCorridorId) || null;

  const filteredRequests = useMemo(() => {
    if (isCorridorFiltered) {
      return requests.filter((r) => r.corridorId === selectedCorridorId);
    }
    const allowed = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    return requests.filter((r) => allowed.includes(r.corridorId));
  }, [requests, isCorridorFiltered, selectedCorridorId, selectedZone]);

  const pendingRequests = filteredRequests.filter(
    (r) => r.status === "UNDER_REVIEW" || r.status === "SUBMITTED"
  );
  const activeRequests = filteredRequests.filter(
    (r) => r.status === "APPROVED" || r.status === "ASSIGNED" || r.status === "IN_PROGRESS"
  );
  const completedRequests = filteredRequests.filter((r) => r.status === "COMPLETED");
  const closedRequests = filteredRequests.filter((r) => r.status === "CLOSED" || r.status === "VERIFIED");

  const displayedRequests = () => {
    switch (activeTab) {
      case "PENDING":
        return pendingRequests;
      case "ACTIVE":
        return activeRequests;
      case "COMPLETED":
        return completedRequests;
      case "CLOSED":
        return closedRequests;
      case "ALL":
      default:
        return filteredRequests;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#030914] via-[#061526] to-[#0A1F36] border border-cyan-500/25 flex flex-wrap items-center justify-between gap-4 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-600/60 px-2 py-0.5 rounded uppercase shadow-[0_0_10px_rgba(0,242,254,0.2)]">
              Central Authority
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Sanctions Directorate {selectedCorridor ? `• ${selectedCorridor.name}` : `• ${selectedZone.split("(")[0].trim()}`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Central Approval & Sanctions Center
          </h1>
          <p className="text-xs text-slate-400">
            Review inter-departmental service requests, verify AI risk scores, and sanction maintenance blocks
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#030914] border border-cyan-500/50 text-cyan-300 text-xs font-bold font-mono shadow-[0_0_12px_rgba(0,242,254,0.2)]">
            {pendingRequests.length} Pending Actions {isCorridorFiltered && `(${selectedCorridorId})`}
          </span>
        </div>
      </div>

      {/* Quick Corridor Selection Bar */}
      <div className="p-4 rounded-xl bg-[#061526]/90 backdrop-blur-md border border-slate-800/80 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {isCorridorFiltered ? "Approvals Corridor Filter:" : "Filter Approvals by Corridor:"}
          </span>
          {selectedCorridor && (
            <span className="text-xs font-mono font-bold text-cyan-300 bg-[#030914] px-2 py-0.5 rounded border border-cyan-700/60">
              {selectedCorridor.id}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCorridorId("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition ${
              selectedCorridorId === "ALL"
                ? "bg-cyan-500 text-[#030914] shadow-[0_0_12px_rgba(0,242,254,0.35)] font-black"
                : "bg-[#030914] border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
            }`}
          >
            All Corridors ({filteredRequests.length})
          </button>

          {availableCorridors.map((c) => {
            const count = requests.filter((r) => r.corridorId === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCorridorId(c.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition ${
                  selectedCorridorId === c.id
                    ? "bg-cyan-500 text-[#030914] shadow-[0_0_12px_rgba(0,242,254,0.35)] font-black"
                    : "bg-[#030914] border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                }`}
              >
                {c.id} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <KpiCard
          title="Pending Approvals"
          value={pendingRequests.length}
          subtitle="Action Required"
          icon={Clock}
          color="cyan"
          onClick={() => setActiveTab("PENDING")}
        />
        <KpiCard
          title="In Execution"
          value={activeRequests.length}
          subtitle="Work In Progress"
          icon={Stack}
          color="blue"
          onClick={() => setActiveTab("ACTIVE")}
        />
        <KpiCard
          title="Needs Verification"
          value={completedRequests.length}
          subtitle="100% Completed"
          icon={CheckCircle}
          color="amber"
          onClick={() => setActiveTab("COMPLETED")}
        />
        <KpiCard
          title="Closed & Sanctioned"
          value={closedRequests.length}
          subtitle="Audit Verified"
          icon={ShieldCheck}
          color="emerald"
          onClick={() => setActiveTab("CLOSED")}
        />
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === "PENDING"
              ? "bg-cyan-500 text-[#030914] shadow-glow-cyan-laser font-extrabold"
              : "bg-[#061526] text-slate-300 hover:text-white border border-slate-800"
          }`}
        >
          <Clock size={16} weight="duotone" />
          <span>Pending Approvals ({pendingRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === "ACTIVE"
              ? "bg-sky-500 text-[#030914] shadow-[0_0_12px_rgba(56,189,248,0.35)] font-extrabold"
              : "bg-[#061526] text-slate-300 hover:text-white border border-slate-800"
          }`}
        >
          <Stack size={16} weight="duotone" />
          <span>Assigned / In Progress ({activeRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === "COMPLETED"
              ? "bg-amber-400 text-[#030914] shadow-glow-amber font-extrabold"
              : "bg-[#061526] text-slate-300 hover:text-white border border-slate-800"
          }`}
        >
          <CheckCircle size={16} weight="duotone" />
          <span>Completed (Needs Sign-Off) ({completedRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("CLOSED")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === "CLOSED"
              ? "bg-emerald-400 text-[#030914] shadow-glow-emerald font-extrabold"
              : "bg-[#061526] text-slate-300 hover:text-white border border-slate-800"
          }`}
        >
          <CheckSquare size={16} weight="duotone" />
          <span>Closed / Archival ({closedRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === "ALL"
              ? "bg-slate-200 text-slate-900 font-extrabold"
              : "bg-[#061526] text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <span>All ({requests.length})</span>
        </button>
      </div>

      {/* Requests Data Table */}
      <RequestTable
        requests={displayedRequests()}
        title={`${activeTab.replace("_", " ")} Service Requests`}
        subtitle="Click any row to open the Central Admin sanction, rejection, or reassignment panel"
      />
    </div>
  );
}
