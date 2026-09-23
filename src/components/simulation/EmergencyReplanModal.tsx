"use client";

import React, { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { useRailPlan } from "@/context/RailPlanContext";
import { useAuth } from "@/context/AuthContext";
import { 
  AlertOctagon, 
  Zap, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  Train, 
  Sparkles,
  ArrowRight,
  TrendingDown
} from "lucide-react";
import { EmergencyIncidentRequest, EmergencyReplanResult } from "@/lib/types";

interface EmergencyReplanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyReplanModal: React.FC<EmergencyReplanModalProps> = ({ isOpen, onClose }) => {
  const { triggerEmergencyReplan, corridors } = useRailPlan();
  const { user } = useAuth();

  const [incidentType, setIncidentType] = useState<EmergencyIncidentRequest["incidentType"]>("Rail Fracture");
  const [corridorId, setCorridorId] = useState<string>("NDLS-MMCT");
  const [locationKm, setLocationKm] = useState<string>("KM 148.4 (Mathura - Bharatpur Section)");
  const [severity, setSeverity] = useState<EmergencyIncidentRequest["severity"]>("CRITICAL");
  const [expectedDuration, setExpectedDuration] = useState<number>(4);
  const [notes, setNotes] = useState<string>("USFD sensor triggered high-frequency acoustic fracture alarm on UP Rajdhani line.");

  const [simulationResult, setSimulationResult] = useState<EmergencyReplanResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const result = triggerEmergencyReplan({
      incidentType,
      corridorId,
      locationKm,
      severity,
      expectedDurationHours: expectedDuration,
      reportedBy: user?.name || "Senior Safety Controller",
      notes,
    });
    setSimulationResult(result);
  };

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setIsDone(true);
    }, 1200);
  };

  const handleReset = () => {
    setSimulationResult(null);
    setIsDone(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="⚡ Emergency Replan & Incident Response Hub"
      subtitle="AI-driven dynamic block window scheduling & train traffic rerouting"
      maxWidth="4xl"
      headerBadge={
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-950 text-rose-300 border border-rose-600/70 animate-pulse">
          EMERGENCY PROTOCOL
        </span>
      }
    >
      <div className="space-y-6">
        {!simulationResult ? (
          <form onSubmit={handleSimulate} className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-600/40 text-xs text-rose-200 flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-0.5">National Railway Emergency Command Protocol</p>
                <p className="text-slate-300">
                  Activating this protocol calculates emergency track isolation, recalculates train conflict graphs, mobilizes heavy machinery, and dispatches rapid response crews.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Incident Type
                </label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value as any)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:border-rose-500 focus:outline-none"
                >
                  <option value="Rail Fracture">Rail Fracture (Ultrasonic Alarm)</option>
                  <option value="OHE Tripping / Catenary Snap">OHE Tripping / Catenary Snap (25kV)</option>
                  <option value="Signal Interlocking Failure">Signal Interlocking Failure / Point Jam</option>
                  <option value="Track Washaway / Flood">Track Washaway / Monsoon Flood</option>
                  <option value="Derailment Hazard">Obstruction / Derailment Hazard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:border-rose-500 focus:outline-none font-bold text-rose-400"
                >
                  <option value="HIGH">HIGH (Speed restriction required)</option>
                  <option value="CRITICAL">CRITICAL (Total line block required)</option>
                  <option value="DISASTER">DISASTER (Multi-track corridor closure)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Affected Corridor
                </label>
                <select
                  value={corridorId}
                  onChange={(e) => setCorridorId(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:border-rose-500 focus:outline-none"
                >
                  {corridors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Location / KM Marker
                </label>
                <input
                  type="text"
                  value={locationKm}
                  onChange={(e) => setLocationKm(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:border-rose-500 focus:outline-none"
                  placeholder="e.g. KM 148.4 (Mathura Section)"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Expected Block Duration (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={expectedDuration}
                  onChange={(e) => setExpectedDuration(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:border-rose-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Incident Remarks
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:border-rose-500 focus:outline-none"
                  placeholder="Additional context or initial observation"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white text-sm font-bold shadow-glow-rose flex items-center space-x-2 transition transform active:scale-95"
              >
                <Zap className="w-4 h-4" />
                <span>Simulate Emergency Replan</span>
              </button>
            </div>
          </form>
        ) : isDone ? (
          <div className="py-8 text-center space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500 flex items-center justify-center mx-auto shadow-glow-emerald">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-100">Emergency Replan Executed & Broadcasted</h4>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                Emergency block window has been sanctioned. Section controllers, OHE teams, and civil track engineers have received automated emergency orders.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-lg bg-cyan-500 text-navy-950 font-bold text-sm shadow-glow-cyan transition"
            >
              Return to Central Command
            </button>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
            {/* AI Generated Emergency Response Card */}
            <div className="p-4 rounded-xl bg-navy-950 border border-cyan-500/40 shadow-glow-cyan space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-cyan-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>AI Optimized Emergency Response Solution</span>
                </div>
                <span className="text-xs bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-700 font-mono">
                  {incidentType} | {severity}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-navy-900 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Affected Trains</p>
                  <p className="text-xl font-extrabold text-rose-400 font-mono">
                    {simulationResult.affectedTrainsCount} Trains
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-navy-900 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Allocated Window</p>
                  <p className="text-sm font-bold text-cyan-300 font-mono mt-1">4.5 Hours</p>
                </div>
                <div className="p-2.5 rounded-lg bg-navy-900 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Mobilized Teams</p>
                  <p className="text-xl font-extrabold text-amber-400 font-mono">
                    {simulationResult.mobilizedDepartments.length} Depts
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-navy-900 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Cost Impact</p>
                  <p className="text-xl font-extrabold text-purple-400 font-mono">₹5.80 L</p>
                </div>
              </div>

              {/* Rerouted Trains */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Automated Passenger Train Rerouting (Chord & Loop Line)
                </p>
                <div className="flex flex-wrap gap-2">
                  {simulationResult.trainsToReroute.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center space-x-1.5"
                    >
                      <Train className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Required Equipment Mobilization */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Dispatched Heavy Machinery & Squads
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {simulationResult.requiredEquipment.map((eq, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-center space-x-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{eq}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Action Checklist */}
              <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Sequential Execution Protocol
                </p>
                <ul className="text-xs text-slate-300 space-y-1">
                  {simulationResult.recommendedResponseSteps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setSimulationResult(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Back to Edit
              </button>

              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-extrabold text-sm shadow-glow-rose flex items-center space-x-2 transition transform active:scale-95"
              >
                {isExecuting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Broadcasting Emergency Orders...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Authorize & Execute Emergency Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
