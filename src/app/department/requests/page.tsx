"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRailPlan, ZONE_CORRIDOR_MAP } from "@/context/RailPlanContext";
import { RequestTable } from "@/components/requests/RequestTable";
import { 
  FileText, 
  PlusCircle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2,
  Filter
} from "lucide-react";
import Link from "next/link";

export default function DepartmentRequestsPage() {
  const { user } = useAuth();
  const { requests, selectedCorridorId, selectedZone } = useRailPlan();

  const [activeTab, setActiveTab] = useState<"ALL" | "OUTGOING" | "INCOMING">("ALL");

  const currentDeptId = user?.departmentId || "ENG";

  const isCorridorFiltered = selectedCorridorId !== "ALL";
  const allowedZoneCorridors = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];

  const scopedRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesCorridor = isCorridorFiltered
        ? r.corridorId === selectedCorridorId
        : allowedZoneCorridors.includes(r.corridorId);
      return matchesCorridor;
    });
  }, [requests, isCorridorFiltered, selectedCorridorId, allowedZoneCorridors]);

  // Outgoing = Requested BY this department
  const outgoingRequests = scopedRequests.filter((r) => r.requestingDepartment === currentDeptId);

  // Incoming = Requested FROM / Assigned TO this department
  const incomingRequests = scopedRequests.filter(
    (r) => r.targetDepartment === currentDeptId || r.assignedToDepartment === currentDeptId
  );

  const displayedRequests = () => {
    switch (activeTab) {
      case "OUTGOING":
        return outgoingRequests;
      case "INCOMING":
        return incomingRequests;
      case "ALL":
      default:
        return scopedRequests.filter(
          (r) =>
            r.requestingDepartment === currentDeptId ||
            r.targetDepartment === currentDeptId ||
            r.assignedToDepartment === currentDeptId
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded uppercase">
              {currentDeptId} Requests Registry
            </span>
            <span className="text-xs text-slate-400 font-mono">Service Orders & Block Requisitions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Service Request Registry
          </h1>
          <p className="text-xs text-slate-400">
            Track outbound support requests to other departments and manage incoming assigned tasks
          </p>
        </div>

        <Link
          href="/department/create-request"
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs shadow-glow-cyan flex items-center space-x-2 transition transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Service Request</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === "ALL"
              ? "bg-cyan-600 text-white shadow-glow-cyan"
              : "bg-navy-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>All Department Requests ({displayedRequests().length})</span>
        </button>

        <button
          onClick={() => setActiveTab("OUTGOING")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === "OUTGOING"
              ? "bg-purple-600 text-white shadow-glow-purple"
              : "bg-navy-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Sent Out by Us ({outgoingRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("INCOMING")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === "INCOMING"
              ? "bg-emerald-600 text-white shadow-glow-emerald"
              : "bg-navy-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5" />
          <span>Assigned to Us ({incomingRequests.length})</span>
        </button>
      </div>

      {/* Request Table */}
      <RequestTable
        requests={displayedRequests()}
        title={`${activeTab === "ALL" ? "Department" : activeTab} Service Requests`}
        subtitle="Click any row to inspect status, timeline, attachments, and progress logs"
      />
    </div>
  );
}
