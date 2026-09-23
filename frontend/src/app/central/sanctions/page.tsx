"use client";

import React, { useState } from "react";
import { useRailPlan } from "@/context/RailPlanContext";
import { OfficialSanctionLetterModal } from "@/components/common/OfficialSanctionLetterModal";
import { ServiceRequest } from "@/lib/types";
import { 
  FileText, 
  Printer, 
  MagnifyingGlass, 
  ShieldCheck, 
  Clock, 
  Stamp,
  CheckCircle
} from "@phosphor-icons/react";

export default function OfficialSanctionsPage() {
  const { requests, bundles } = useRailPlan();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter approved or in-progress requests that have official sanctions
  const sanctionedRequests = requests.filter(
    (r) => r.status === "APPROVED" || r.status === "IN_PROGRESS" || r.status === "COMPLETED" || r.status === "ASSIGNED"
  );

  const filtered = sanctionedRequests.filter((r) => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.corridorId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleOpenSanction = (req: ServiceRequest) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#030914]/90 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Stamp size={32} weight="duotone" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
                Official Sanctions & Gazette Orders Portal
              </h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/80 shadow-[0_0_10px_rgba(16,231,178,0.2)]">
                G&SR FORM T/806
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ministry of Railways / Railway Board certified Block Requisitions, TSR Caution Orders (T/409), and Track Fitness Certificates (T/1518)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-xl bg-[#061526] border border-slate-800 text-xs font-mono text-slate-300 flex items-center space-x-2">
            <ShieldCheck size={18} weight="duotone" className="text-emerald-400" />
            <span>Digital E-Signature: <strong className="text-emerald-300">ACTIVE (SHA-256)</strong></span>
          </div>
        </div>
      </div>

      {/* Control / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#061526]/90 backdrop-blur-md p-4 rounded-xl border border-slate-800/80">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlass size={16} weight="bold" className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sanction order or dispatch no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#030914] border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {["ALL", "FORM T/806 (Block Sanction)", "FORM T/409 (Caution TSR)", "FORM T/1518 (Fitness)"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                filterType === t
                  ? "bg-amber-400 text-[#030914] shadow-[0_0_12px_rgba(245,158,11,0.35)] font-extrabold"
                  : "bg-[#030914] text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Sanctions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((req) => (
          <div
            key={req.id}
            className="p-5 rounded-2xl bg-[#061526]/90 backdrop-blur-md border border-slate-800/80 hover:border-amber-400/60 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[10px] bg-[#030914] border border-amber-500/40 text-amber-300">
                  FORM T/806 • SANCTION
                </span>
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                  <Clock size={12} weight="duotone" className="text-amber-400 shrink-0" />
                  <span className="truncate max-w-[170px]">
                    {req.sanctionTimestamp || (req.history?.slice().reverse().find(h => h.action.toLowerCase().includes("approved") || h.action.toLowerCase().includes("sanction"))?.timestamp ? `${req.submissionDate || "12 Sep 2026"}, ${req.history?.slice().reverse().find(h => h.action.toLowerCase().includes("approved") || h.action.toLowerCase().includes("sanction"))?.timestamp}` : `${req.submissionDate || "12 Sep 2026"}, 09:30 AM IST`)}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition line-clamp-1">
                  {req.title}
                </h3>
                <p className="text-[11px] font-mono text-cyan-400 mt-1">
                  Dispatch Ref: <strong>{req.sanctionOrderNumber || `RB/SANCTION/2026/${req.id.replace("SR-", "")}`}</strong>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#030914]/80 border border-slate-800 text-xs space-y-1.5 font-sans">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Sanctioned Date/Time:</span>
                  <span className="font-mono text-amber-300 font-semibold text-[11px]">
                    {req.sanctionTimestamp || (req.history?.slice().reverse().find(h => h.action.toLowerCase().includes("approved") || h.action.toLowerCase().includes("sanction"))?.timestamp ? `${req.submissionDate || "12 Sep 2026"}, ${req.history?.slice().reverse().find(h => h.action.toLowerCase().includes("approved") || h.action.toLowerCase().includes("sanction"))?.timestamp}` : `${req.submissionDate || "12 Sep 2026"}, 09:30 AM IST`)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Section Line:</span>
                  <span className="font-bold text-slate-200">{req.corridorId} ({req.locationKm})</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Requesting Unit:</span>
                  <span className="font-mono text-cyan-300">{req.requestingDepartment} Department</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Executing Unit:</span>
                  <span className="font-mono text-emerald-300">{req.targetDepartment} Directorate</span>
                </div>
                <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Block Slot:</span>
                  <span className="font-mono font-bold text-amber-300">01:30 - 05:30 hrs (4.0H Night)</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleOpenSanction(req)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-[#030914] font-extrabold text-xs flex items-center justify-center space-x-2 transition shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-[0.98]"
              >
                <Printer size={16} weight="duotone" />
                <span>View & Print Official Sanction</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Official Sanction Modal */}
      <OfficialSanctionLetterModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
