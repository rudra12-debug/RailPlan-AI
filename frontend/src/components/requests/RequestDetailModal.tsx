"use client";

import React, { useState } from "react";
import { ServiceRequest, RequestStatus } from "@/lib/types";
import { useRailPlan } from "@/context/RailPlanContext";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/common/Modal";
import { StatusBadge, PriorityBadge, RiskBadge } from "@/components/common/StatusBadge";
import { formatINR, formatFullINR } from "@/lib/formatters";
import { OfficialSanctionLetterModal } from "@/components/common/OfficialSanctionLetterModal";
import { 
  FileText, 
  Calendar, 
  MapPin, 
  Sparkles, 
  Paperclip, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  Activity,
  History,
  Send,
  Printer,
  ShieldCheck,
  Cpu,
  Truck,
  Users
} from "lucide-react";

interface RequestDetailModalProps {
  request: ServiceRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

const STAGES: { key: RequestStatus; label: string }[] = [
  { key: "DRAFT", label: "Draft" },
  { key: "SUBMITTED", label: "Submitted" },
  { key: "UNDER_REVIEW", label: "Under Review" },
  { key: "APPROVED", label: "Central Approval" },
  { key: "ASSIGNED", label: "Assigned" },
  { key: "IN_PROGRESS", label: "Work in Progress" },
  { key: "COMPLETED", label: "Work Completed" },
  { key: "CLOSED", label: "Closed / Verified" },
];

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({ request, isOpen, onClose }) => {
  const { isCentralAdmin, user } = useAuth();
  const { 
    approveServiceRequest, 
    rejectServiceRequest, 
    requestModification, 
    updateRequestProgress, 
    verifyAndCloseRequest 
  } = useRailPlan();

  const [commentText, setCommentText] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isSanctionLetterOpen, setIsSanctionLetterOpen] = useState(false);

  if (!request) return null;

  const currentStageIndex = () => {
    switch (request.status) {
      case "DRAFT": return 0;
      case "SUBMITTED": return 1;
      case "UNDER_REVIEW": return 2;
      case "APPROVED": return 3;
      case "ASSIGNED": return 4;
      case "IN_PROGRESS": return 5;
      case "COMPLETED": return 6;
      case "VERIFIED":
      case "CLOSED": return 7;
      case "REJECTED": return 3;
      default: return 0;
    }
  };

  const stageIdx = currentStageIndex();

  const handleApprove = () => {
    approveServiceRequest(
      request.id,
      request.targetDepartment,
      commentText || "Approved by Central Control Authority (Railway Board O&M)."
    );
    setCommentText("");
    onClose();
  };

  const handleReject = () => {
    if (!rejectReason) return;
    rejectServiceRequest(request.id, rejectReason);
    setShowRejectInput(false);
    setRejectReason("");
    onClose();
  };

  const handleRequestModification = () => {
    requestModification(request.id, commentText || "Please revise cost estimates.");
    setCommentText("");
    onClose();
  };

  const handleVerify = () => {
    verifyAndCloseRequest(request.id, commentText || "Inspection certificates verified. Work sanctioned and closed.");
    setCommentText("");
    onClose();
  };

  const hasOfficialSanction = 
    request.status === "APPROVED" ||
    request.status === "ASSIGNED" ||
    request.status === "IN_PROGRESS" ||
    request.status === "COMPLETED" ||
    request.status === "CLOSED" ||
    request.status === "VERIFIED";

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Service Request Details: ${request.id}`}
        subtitle={request.title}
        maxWidth="4xl"
        headerBadge={
          <div className="flex items-center space-x-2">
            <PriorityBadge priority={request.priority} />
            <StatusBadge status={request.status} />
          </div>
        }
      >
        <div className="space-y-6">
          {/* Top Sanction Fast-Action Banner if Approved */}
          {hasOfficialSanction && (
            <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/40 flex flex-wrap items-center justify-between gap-3 shadow">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-xs font-bold text-slate-200">
                    Official Block Sanction Order Form T/806 Generated
                  </p>
                  <p className="text-[10px] font-mono text-amber-300">
                    Dispatch Ref: {request.sanctionOrderNumber || `RB/SANCTION/2026/${request.id.replace("SR-", "")}`} • Sanctioned: {request.sanctionTimestamp || (request.history?.slice().reverse().find(h => h.action.toLowerCase().includes("approved") || h.action.toLowerCase().includes("sanction"))?.timestamp ? `${request.submissionDate || "12 Sep 2026"}, ${request.history?.slice().reverse().find(h => h.action.toLowerCase().includes("approved") || h.action.toLowerCase().includes("sanction"))?.timestamp}` : "12 Sep 2026, 09:30 AM IST")} • G&SR Rule 15.06
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSanctionLetterOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-navy-950 text-xs font-bold flex items-center space-x-1.5 transition shadow-glow-amber"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Sanction Order (Form T/806)</span>
              </button>
            </div>
          )}

          {/* 9-Stage Visual Interactive Timeline */}
          <div className="p-3 sm:p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2 overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              <span>9-Stage Operational Lifecycle</span>
              <span className="text-cyan-400 font-mono">Progress: {request.progress}%</span>
            </div>

            <div className="overflow-x-auto pb-2 -mx-1 px-1">
              <div className="relative flex items-center justify-between min-w-[540px] px-2 py-1">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0" />
                <div
                  className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
                  style={{ width: `${(stageIdx / (STAGES.length - 1)) * 100}%` }}
                />

                {STAGES.map((stage, idx) => {
                  const isPast = idx < stageIdx;
                  const isCurrent = idx === stageIdx;
                  const isRejected = request.status === "REJECTED" && stage.key === "APPROVED";

                  return (
                    <div key={stage.key} className="relative z-10 flex flex-col items-center group">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          isRejected
                            ? "bg-rose-600 text-white border-2 border-rose-400"
                            : isCurrent
                            ? "bg-cyan-500 text-navy-950 border-2 border-white shadow-glow-cyan scale-110"
                            : isPast
                            ? "bg-emerald-500 text-navy-950 border-2 border-emerald-400"
                            : "bg-slate-900 text-slate-500 border border-slate-700"
                        }`}
                      >
                        {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[9px] font-semibold mt-1.5 text-center max-w-[65px] leading-tight ${
                          isCurrent ? "text-cyan-300 font-bold" : isPast ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Overview Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Requesting Department</p>
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <p className="text-sm font-bold text-slate-200">{request.requestingDepartment} Department</p>
              </div>
              <p className="text-[11px] text-slate-400">Target: <span className="text-cyan-300 font-semibold">{request.targetDepartment}</span></p>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Corridor & Location</p>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <p className="text-sm font-bold text-slate-200 font-mono">{request.corridorId}</p>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">{request.locationKm}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sanctioned Financial Grant</p>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <p className="text-sm font-bold text-slate-200 font-mono">{formatFullINR(request.estimatedCost)}</p>
              </div>
              <p className="text-[11px] text-slate-400">Type: <span className="text-slate-200">{request.requestType}</span></p>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Work Description & Scope</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{request.description}</p>
          </div>

          {/* Inter-Department Resources Required & Automated Standby Booking */}
          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Inter-Department Machinery & Resource Allocation
                </h4>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                hasOfficialSanction
                  ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                  : "bg-amber-950 text-amber-300 border-amber-700"
              }`}>
                {hasOfficialSanction ? "Auto-Booked & Mobilization Dispatched" : "Pending Central Sanction"}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-400">
                {hasOfficialSanction
                  ? `Upon sanction, the following departmental machinery and specialized crew have been automatically reserved from ${request.assignedToDepartment || request.targetDepartment} / Central Logistics and assigned mandatory standby by ${request.completionDeadline || request.requiredDate}:`
                  : `The following machinery and specialized squads are requested and will be automatically booked upon Central Authority approval:`}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(request.resourcesRequired && request.resourcesRequired.length > 0 ? request.resourcesRequired : ["Standard Heavy Machinery Squad", "Certified Engineering Gang"]).map((resName, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-navy-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Cpu className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-200">{resName}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-cyan-300 bg-navy-950 px-2 py-0.5 rounded border border-slate-800">
                      {hasOfficialSanction ? "STANDBY READY" : "REQUISITIONED"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {hasOfficialSanction && (
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 flex items-center space-x-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Automated notification orders have been transmitted to <strong>{request.assignedToDepartment || request.targetDepartment} Directorate</strong> & <strong>Central Fleet</strong>. Resources are committed for <strong>{request.corridorId} ({request.locationKm})</strong>.
                </span>
              </div>
            )}
          </div>

          {/* 6-Part Cost Breakdown */}
          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">6-Part Maintenance Cost Breakdown</h4>
              <span className="text-xs font-mono font-bold text-emerald-400">Total: {formatFullINR(request.estimatedCost)}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-navy-900 border border-slate-800">
                <p className="text-[10px] text-slate-400">Labour</p>
                <p className="font-bold text-slate-200 font-mono mt-0.5">{formatINR(request.costBreakdown.labour)}</p>
              </div>
              <div className="p-2 rounded-lg bg-navy-900 border border-slate-800">
                <p className="text-[10px] text-slate-400">Equipment</p>
                <p className="font-bold text-slate-200 font-mono mt-0.5">{formatINR(request.costBreakdown.equipment)}</p>
              </div>
              <div className="p-2 rounded-lg bg-navy-900 border border-slate-800">
                <p className="text-[10px] text-slate-400">Materials</p>
                <p className="font-bold text-slate-200 font-mono mt-0.5">{formatINR(request.costBreakdown.material)}</p>
              </div>
              <div className="p-2 rounded-lg bg-navy-900 border border-slate-800">
                <p className="text-[10px] text-slate-400">Logistics</p>
                <p className="font-bold text-slate-200 font-mono mt-0.5">{formatINR(request.costBreakdown.logistics)}</p>
              </div>
              <div className="p-2 rounded-lg bg-navy-900 border border-slate-800">
                <p className="text-[10px] text-slate-400">Track Block</p>
                <p className="font-bold text-slate-200 font-mono mt-0.5">{formatINR(request.costBreakdown.trackBlock)}</p>
              </div>
              <div className="p-2 rounded-lg bg-navy-900 border border-slate-800">
                <p className="text-[10px] text-slate-400">Contingency</p>
                <p className="font-bold text-slate-200 font-mono mt-0.5">{formatINR(request.costBreakdown.contingency)}</p>
              </div>
            </div>
          </div>

          {/* Central Admin Approval & Decision Panel */}
          {isCentralAdmin && (request.status === "UNDER_REVIEW" || request.status === "SUBMITTED") && (
            <div className="p-4 rounded-xl bg-navy-950 border border-cyan-500/40 space-y-3">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Central Control Authority Decision Panel
              </h4>

              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter sanction notes / authority remarks (e.g. 'Approved under G&SR 15.06 night block slot')..."
                className="w-full bg-navy-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />

              {showRejectInput && (
                <div className="space-y-2 p-3 bg-rose-950/40 border border-rose-700/50 rounded-lg">
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Specify reason for rejection or resubmission requirement..."
                    className="w-full bg-navy-900 border border-rose-600 rounded-lg p-2 text-xs text-slate-100 focus:outline-none"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowRejectInput(false)}
                      className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
                <div className="flex space-x-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowRejectInput(true)}
                    className="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-300 text-xs font-semibold transition text-center"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleRequestModification}
                    className="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-700 text-amber-300 text-xs font-semibold transition text-center"
                  >
                    Modify
                  </button>
                </div>

                <button
                  onClick={handleApprove}
                  className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-navy-950 font-bold text-xs shadow-glow-emerald flex items-center space-x-1.5 transition transform active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Sanction Order & Assign</span>
                </button>
              </div>
            </div>
          )}

          {/* Central Verification for Completed work */}
          {isCentralAdmin && request.status === "COMPLETED" && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-3">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Central Verification & Sign-off
              </h4>
              <p className="text-xs text-slate-300">
                Work has been marked 100% complete by {request.assignedToDepartment} Department. Certify compliance to close request.
              </p>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Verification notes / Certification ID..."
                className="w-full bg-navy-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none"
              />
              <button
                onClick={handleVerify}
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs shadow-glow-emerald flex items-center space-x-1.5 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Sanction Closure (Status: CLOSED)</span>
              </button>
            </div>
          )}

          {/* Audit History Log */}
          {request.history?.length > 0 && (
            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>Audit History & Comments</span>
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {request.history.map((h, i) => (
                  <div key={i} className="text-xs p-2 rounded-lg bg-navy-900 border border-slate-800/80 flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-slate-200">{h.actor}: </span>
                      <span className="text-slate-300">{h.action}</span>
                      {h.note && <p className="text-cyan-300 mt-0.5 italic">"{h.note}"</p>}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{h.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Official Sanction Letter View */}
      <OfficialSanctionLetterModal
        request={request}
        isOpen={isSanctionLetterOpen}
        onClose={() => setIsSanctionLetterOpen(false)}
      />
    </>
  );
};
