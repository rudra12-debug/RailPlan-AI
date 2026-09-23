"use client";

import React, { useState } from "react";
import { useRailPlan } from "@/context/RailPlanContext";
import { EmergencyReplanModal } from "@/components/simulation/EmergencyReplanModal";
import { 
  Zap, 
  AlertOctagon, 
  ShieldAlert, 
  Train, 
  MapPin, 
  Clock, 
  CheckCircle2,
  Cpu,
  History
} from "lucide-react";
import { RiskBadge } from "@/components/common/StatusBadge";

export default function CentralEmergencyPage() {
  const { corridors, auditLogs } = useRailPlan();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const emergencyLogs = auditLogs.filter(
    (l) => l.action.includes("Emergency") || l.action.includes("Hazard")
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950 via-navy-900 to-navy-950 border border-rose-600/50 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-700 px-2 py-0.5 rounded uppercase animate-pulse">
              Level-1 Emergency Command
            </span>
            <span className="text-xs text-slate-400 font-mono">Disaster Management Directorate</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Emergency Replanning & Critical Incident Mitigation
          </h1>
          <p className="text-xs text-slate-400">
            Instant multi-department mobilization, emergency power blocks, passenger train diversions & breakdown crane dispatch
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold text-sm shadow-glow-rose flex items-center space-x-2 transition transform active:scale-95 group"
        >
          <Zap className="w-5 h-5 fill-white group-hover:animate-bounce" />
          <span>⚡ TRIGGER EMERGENCY REPLAN</span>
        </button>
      </div>

      {/* Corridor Vulnerability Matrix */}
      <div className="rounded-2xl border border-slate-800 bg-navy-900/90 p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Corridor Threat & Vulnerability Status
          </span>
          <span className="text-xs text-cyan-400 font-mono">Real-time Emergency Preparedness</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {corridors.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{c.name.split("(")[0]}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{c.id}</p>
                </div>
                <RiskBadge risk={c.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-navy-900 border border-slate-800">
                  <p className="text-[10px] text-slate-400">Critical Spots</p>
                  <p className="text-sm font-bold text-rose-400 font-mono mt-0.5">{c.criticalSpotsCount}</p>
                </div>
                <div className="p-2 rounded-lg bg-navy-900 border border-slate-800">
                  <p className="text-[10px] text-slate-400">Active Blocks</p>
                  <p className="text-sm font-bold text-amber-400 font-mono mt-0.5">{c.activeMaintenanceCount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Event Logs */}
      <div className="rounded-2xl border border-slate-800 bg-navy-900/90 p-5 space-y-3 shadow-xl">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
          <History className="w-4 h-4 text-rose-400" />
          <span>Emergency Incident Action Log</span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-navy-950 border border-slate-800/80 flex items-start justify-between text-xs"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-rose-300 font-mono">{log.action}</span>
                  <span className="text-[10px] text-slate-400">ID: {log.entityId}</span>
                </div>
                <p className="text-slate-300 mt-0.5">{log.details}</p>
                <p className="text-[10px] text-slate-500 mt-1">Authorized by {log.user} ({log.department})</p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-3">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      <EmergencyReplanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
