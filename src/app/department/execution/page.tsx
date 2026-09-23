"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRailPlan } from "@/context/RailPlanContext";
import { ServiceRequest } from "@/lib/types";
import { StatusBadge, PriorityBadge } from "@/components/common/StatusBadge";
import { formatINR } from "@/lib/formatters";
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  Camera, 
  AlertTriangle, 
  UploadCloud, 
  Send,
  Building2,
  Wrench,
  Sparkles,
  Layers
} from "lucide-react";

export default function WorkExecutionPage() {
  const { user } = useAuth();
  const { requests, updateRequestProgress, markWorkCompleted } = useRailPlan();

  const currentDeptId = user?.departmentId || "ELEC";

  // Requests assigned to this department or created by this department
  const activeExecutionRequests = requests.filter(
    (r) =>
      (r.assignedToDepartment === currentDeptId || r.targetDepartment === currentDeptId || r.requestingDepartment === currentDeptId) &&
      r.status !== "DRAFT"
  );

  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    activeExecutionRequests[0]?.id || "SR-1042"
  );
  const [updatePercentage, setUpdatePercentage] = useState<number>(50);
  const [notes, setNotes] = useState<string>(
    "25kV power block successfully established. Catenary tension droppers adjusted by 15mm across KM 148-154."
  );
  const [issues, setIssues] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string>(
    "Catenary_Height_Inspection_KM148_Verified.jpg"
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const selectedRequest = requests.find((r) => r.id === selectedRequestId);

  const handleUpdate = (percentage: number) => {
    setUpdatePercentage(percentage);
    updateRequestProgress(
      selectedRequestId,
      percentage,
      notes || `Work milestone reached: ${percentage}% completed.`,
      issues,
      photoUrl
    );
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleMarkComplete = () => {
    markWorkCompleted(
      selectedRequestId,
      notes || "All track and electrical work executed, tested and certified 100% complete."
    );
    setUpdatePercentage(100);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-950 via-navy-900 to-navy-950 border border-orange-500/30 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-orange-950 text-orange-300 border border-orange-700 px-2 py-0.5 rounded uppercase">
              Field Operations
            </span>
            <span className="text-xs text-slate-400 font-mono">{currentDeptId} Execution Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Work Execution & Milestone Progress Tracker
          </h1>
          <p className="text-xs text-slate-400">
            Log live progress percentage (0% to 100%), submit completion evidence, and report field issues
          </p>
        </div>

        {isSaved && (
          <div className="px-4 py-2 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-bold font-mono flex items-center space-x-1.5 animate-scale-up shadow-glow-emerald">
            <CheckCircle2 className="w-4 h-4" />
            <span>Progress Broadcasted to Central Command!</span>
          </div>
        )}
      </div>

      {/* Main Grid: Request Selector + Execution Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Work Orders List (4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-navy-900/90 border border-slate-700/80 p-4 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Assigned Work Orders ({activeExecutionRequests.length})
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">Select to Update</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {activeExecutionRequests.map((req) => {
              const isSelected = req.id === selectedRequestId;
              return (
                <div
                  key={req.id}
                  onClick={() => {
                    setSelectedRequestId(req.id);
                    setUpdatePercentage(req.progress);
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-orange-950/70 via-navy-900 to-navy-950 border-orange-500 shadow-glow-amber"
                      : "bg-navy-950/60 border-slate-800 hover:border-slate-700 hover:bg-navy-950"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-cyan-400">
                        {req.id} • {req.targetDepartment}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200 mt-0.5 line-clamp-1">{req.title}</h4>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">{req.locationKm.split("(")[0]}</span>
                    <span className="font-mono font-bold text-cyan-300">{req.progress}% Complete</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Interactive Milestone & Progress Logger (8 Cols) */}
        {selectedRequest ? (
          <div className="lg:col-span-8 rounded-2xl bg-navy-900/90 border border-slate-700/80 p-6 space-y-6 shadow-2xl">
            {/* Header of selected request */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded">
                    {selectedRequest.id}
                  </span>
                  <PriorityBadge priority={selectedRequest.priority} />
                </div>
                <h3 className="text-lg font-bold text-slate-100 mt-1">{selectedRequest.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedRequest.corridorId} • {selectedRequest.locationKm}</p>
              </div>

              <StatusBadge status={selectedRequest.status} />
            </div>

            {/* Visual Progress Bar & Milestone Quick Buttons */}
            <div className="space-y-3 p-4 rounded-xl bg-navy-950 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider">
                  Progress Milestones ({selectedRequest.progress}%)
                </span>
                <span className="text-cyan-400 font-mono font-bold">
                  Status: {selectedRequest.progress >= 100 ? "COMPLETED" : "IN_PROGRESS"}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${selectedRequest.progress}%` }}
                />
              </div>

              {/* 5 Milestone Buttons */}
              <div className="grid grid-cols-5 gap-2 pt-2">
                {[
                  { pct: 0, label: "0% Not Started" },
                  { pct: 25, label: "25% Mobilized" },
                  { pct: 50, label: "50% Halfway" },
                  { pct: 75, label: "75% Testing" },
                  { pct: 100, label: "100% Complete" },
                ].map((m) => (
                  <button
                    key={m.pct}
                    type="button"
                    onClick={() => handleUpdate(m.pct)}
                    className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center space-y-0.5 ${
                      selectedRequest.progress === m.pct
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-navy-950 shadow-glow-amber scale-105"
                        : "bg-navy-900 border border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                    }`}
                  >
                    <span className="font-mono text-sm">{m.pct}%</span>
                    <span className="text-[9px] text-slate-400 hidden sm:inline">{m.label.split(" ")[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Field Notes & Issues Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Daily Work Execution Notes & Milestones
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none leading-relaxed"
                  placeholder="Record work completed during this shift, staff deployed, and technical measurements..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Issues Encountered / Delay Warnings (Optional)
                </label>
                <input
                  type="text"
                  value={issues}
                  onChange={(e) => setIssues(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-rose-500 focus:outline-none"
                  placeholder="e.g. Unforeseen ballast fouling encountered; extra tamping cycle required."
                />
              </div>

              {/* Photo Upload Simulation */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Inspection Proof & Site Photographs
                </label>
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-navy-950 border border-slate-800 text-xs">
                  <Camera className="w-5 h-5 text-cyan-400 shrink-0" />
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="flex-1 bg-navy-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200 focus:outline-none font-mono"
                    placeholder="Inspection_Photo_KM148.jpg"
                  />
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">Attached</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleUpdate(updatePercentage)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center space-x-2 transition"
              >
                <Send className="w-4 h-4" />
                <span>Save Work Update</span>
              </button>

              <button
                type="button"
                onClick={handleMarkComplete}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-navy-950 font-extrabold text-xs shadow-glow-emerald flex items-center space-x-2 transition transform active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Work 100% Completed</span>
              </button>
            </div>

            {/* Updates History */}
            {selectedRequest.progressUpdates?.length > 0 && (
              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Field Progress Log
                </span>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {selectedRequest.progressUpdates.map((update, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-navy-900 border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-300 font-mono">{update.percentage}% Milestone</span>
                        <span className="text-[10px] text-slate-400 font-mono">{update.timestamp}</span>
                      </div>
                      <p className="text-slate-300 mt-1">{update.notes}</p>
                      {update.issues && <p className="text-rose-400 mt-0.5">Issue: {update.issues}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center text-slate-500 rounded-2xl bg-navy-900/40 border border-slate-800">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Select a service request to start logging progress.</p>
          </div>
        )}
      </div>
    </div>
  );
}
