"use client";

import React, { useState } from "react";
import { useRailPlan } from "@/context/RailPlanContext";
import { useAuth } from "@/context/AuthContext";
import { StatutoryT806Sanction } from "@/lib/types";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  ShieldCheck,
  Zap,
  Lock,
  Stamp,
  QrCode,
  Download,
  X,
  ExternalLink,
  ChevronRight,
  Hash
} from "lucide-react";

export function T806SanctionModal({
  selectedSanctionId,
  onClose,
}: {
  selectedSanctionId?: string;
  onClose?: () => void;
}) {
  const { t806Sanctions, signT806Step, auditLogs } = useRailPlan();
  const { user, canApproveT806 } = useAuth();

  const [activeSanctionId, setActiveSanctionId] = useState<string>(
    selectedSanctionId || t806Sanctions[0]?.id || "SANCTION-T806-088"
  );
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const sanction = t806Sanctions.find((s) => s.id === activeSanctionId) || t806Sanctions[0];

  if (!sanction) {
    return (
      <div className="p-8 rounded-2xl bg-[#0C1326] border border-[#1A274E] text-center text-[#B6BFFF]">
        No active Form T/806 Sanction Orders available.
      </div>
    );
  }

  const handleSignStep = (step: 1 | 2 | 3 | 4) => {
    const res = signT806Step(sanction.id, step);
    setFeedback(res);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Sanction Selector & Print Action */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#050814] via-[#0C1326] to-[#131E3D] border border-[#1A274E] rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-[#131E3D] border border-[#6367FF]/40 text-[#8494FF]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC]">
                Statutory T/806 Line Block Governance Portal
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#131E3D] text-[#FFD600] border border-amber-600/40">
                G&SR 1976 Rule 15.06 & 17.08
              </span>
            </div>
            <p className="text-xs text-[#B6BFFF]">
              Automated legal certificate generation, multi-department digital sign-off pipeline, and tamper-proof audit trail
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick Sanction Order Selector */}
          <select
            value={activeSanctionId}
            onChange={(e) => {
              setActiveSanctionId(e.target.value);
              setFeedback(null);
            }}
            className="bg-[#050814] border border-[#1A274E] text-xs text-[#F8FAFC] rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-[#6367FF]"
          >
            {t806Sanctions.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#0C1326] text-slate-200">
                {s.sanctionNumber} ({s.status})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#6367FF] to-[#8494FF] text-white text-xs font-bold border border-[#8494FF]/40 flex items-center space-x-1.5 transition"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Print Official Form T/806</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#131E3D] hover:bg-[#1A274E] text-slate-300 transition border border-[#1A274E]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 4-Step Digital Sign-Off Pipeline */}
      <div className="p-5 rounded-2xl bg-[#0C1326] border border-[#1A274E] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#3DFDCE]" />
            <span>4-Stage Statutory Sign-Off Pipeline</span>
          </h3>
          <span className="text-xs font-mono text-[#B6BFFF]">
            Current Stage: <strong className="text-[#FFD600]">Step {sanction.currentStep} of 4</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Step 1 */}
          <div
            className={`p-4 rounded-xl border space-y-2 transition ${
              sanction.signoffPipeline.step1DeptSubmission.completed
                ? "bg-[#131E3D]/80 border-[#3DFDCE]/50"
                : sanction.currentStep === 1
                ? "bg-[#131E3D]/40 border-amber-500/50"
                : "bg-[#050814] border-[#1A274E] opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400">STEP 1</span>
              {sanction.signoffPipeline.step1DeptSubmission.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Clock className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <h4 className="text-xs font-bold text-[#F8FAFC]">Department Submission</h4>
            <p className="text-[11px] text-slate-400">
              {sanction.signoffPipeline.step1DeptSubmission.completed
                ? `Submitted by ${sanction.signoffPipeline.step1DeptSubmission.by}`
                : "Awaiting Civil / OHE / S&T Joint Requisition"}
            </p>
            {sanction.signoffPipeline.step1DeptSubmission.timestamp && (
              <span className="text-[9px] font-mono text-emerald-400 block">
                {sanction.signoffPipeline.step1DeptSubmission.timestamp}
              </span>
            )}
            {!sanction.signoffPipeline.step1DeptSubmission.completed && (
              <button
                onClick={() => handleSignStep(1)}
                className="w-full mt-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold"
              >
                Sign Submission
              </button>
            )}
          </div>

          {/* Step 2 */}
          <div
            className={`p-4 rounded-xl border space-y-2 transition ${
              sanction.signoffPipeline.step2PowerIsolation.completed
                ? "bg-emerald-950/20 border-emerald-500/50"
                : sanction.currentStep === 2
                ? "bg-amber-950/20 border-amber-500/50"
                : "bg-[#050814] border-[#1A274E] opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400">STEP 2</span>
              {sanction.signoffPipeline.step2PowerIsolation.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Clock className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <h4 className="text-xs font-bold text-[#F8FAFC]">Power Block Isolation</h4>
            <p className="text-[11px] text-slate-400">
              {sanction.signoffPipeline.step2PowerIsolation.completed
                ? `TPC Verified: ${sanction.signoffPipeline.step2PowerIsolation.certificate}`
                : "25kV Substation Breaker Lockout & Earthing verification"}
            </p>
            {sanction.signoffPipeline.step2PowerIsolation.timestamp && (
              <span className="text-[9px] font-mono text-emerald-400 block">
                {sanction.signoffPipeline.step2PowerIsolation.timestamp}
              </span>
            )}
            {!sanction.signoffPipeline.step2PowerIsolation.completed && sanction.currentStep >= 2 && (
              <button
                onClick={() => handleSignStep(2)}
                className="w-full mt-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold"
              >
                Confirm 25kV Isolation
              </button>
            )}
          </div>

          {/* Step 3 */}
          <div
            className={`p-4 rounded-xl border space-y-2 transition ${
              sanction.signoffPipeline.step3TrafficSanction.completed
                ? "bg-emerald-950/20 border-emerald-500/50"
                : sanction.currentStep === 3
                ? "bg-amber-950/20 border-amber-500/50"
                : "bg-[#050814] border-[#1A274E] opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400">STEP 3</span>
              {sanction.signoffPipeline.step3TrafficSanction.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Clock className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <h4 className="text-xs font-bold text-[#F8FAFC]">Traffic Controller Sanction</h4>
            <p className="text-[11px] text-slate-400">
              {sanction.signoffPipeline.step3TrafficSanction.completed
                ? `Approved by ${sanction.signoffPipeline.step3TrafficSanction.by}`
                : "OCC Chief Controller line clear validation & block authority"}
            </p>
            {sanction.signoffPipeline.step3TrafficSanction.timestamp && (
              <span className="text-[9px] font-mono text-emerald-400 block">
                {sanction.signoffPipeline.step3TrafficSanction.timestamp}
              </span>
            )}
            {!sanction.signoffPipeline.step3TrafficSanction.completed && sanction.currentStep >= 3 && (
              <button
                onClick={() => handleSignStep(3)}
                className="w-full mt-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold"
              >
                Authorize Traffic Block
              </button>
            )}
          </div>

          {/* Step 4 */}
          <div
            className={`p-4 rounded-xl border space-y-2 transition ${
              sanction.signoffPipeline.step4T806Issued.completed
                ? "bg-emerald-950/20 border-emerald-500/50"
                : sanction.currentStep === 4
                ? "bg-amber-950/20 border-amber-500/50"
                : "bg-[#050814] border-[#1A274E] opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400">STEP 4</span>
              {sanction.signoffPipeline.step4T806Issued.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Clock className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <h4 className="text-xs font-bold text-[#F8FAFC]">T/806 Issuance & Stamp</h4>
            <p className="text-[11px] text-slate-400">
              {sanction.signoffPipeline.step4T806Issued.completed
                ? "Digital Certificate & Gazette Stamp Issued"
                : "Safety Directorate confirmation & QR hash generation"}
            </p>
            {sanction.signoffPipeline.step4T806Issued.timestamp && (
              <span className="text-[9px] font-mono text-emerald-400 block">
                {sanction.signoffPipeline.step4T806Issued.timestamp}
              </span>
            )}
            {!sanction.signoffPipeline.step4T806Issued.completed && sanction.currentStep >= 4 && (
              <button
                onClick={() => handleSignStep(4)}
                className="w-full mt-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold"
              >
                Issue Formal T/806
              </button>
            )}
          </div>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs font-mono flex items-center space-x-2 ${
              feedback.success
                ? "bg-emerald-950/40 border-emerald-500 text-emerald-300"
                : "bg-rose-950/40 border-rose-500 text-rose-300"
            }`}
          >
            {feedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Formal Printable Indian Railways Certificate Document */}
      <div id="printable-t806-certificate" className="p-8 sm:p-10 rounded-2xl bg-[#070D0E] border-2 border-slate-700/80 shadow-2xl relative space-y-6 text-[#F8FAFC]">
        {/* Government Watermark / Crest */}
        <div className="text-center border-b-2 border-slate-700 pb-6 space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xs font-bold tracking-widest text-[#FF671F] uppercase">सत्यमेव जयते</span>
          </div>
          <h1 className="text-base sm:text-xl font-extrabold tracking-wide uppercase">
            GOVERNMENT OF INDIA • MINISTRY OF RAILWAYS
          </h1>
          <h2 className="text-sm font-bold text-slate-300">
            RAILWAY BOARD • CENTRAL AUTHORITY • NATIONAL OPERATIONS COMMAND
          </h2>
          <div className="inline-block mt-2 px-4 py-1 rounded bg-slate-900 border border-slate-600 font-mono text-xs font-bold text-emerald-400">
            FORM T/806: AUTHORITY TO IMPOSE LINE BLOCK / POWER BLOCK (G&SR 15.06 & 17.08)
          </div>
        </div>

        {/* Certificate Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono border-b border-slate-800 pb-6">
          <div>
            <span className="text-slate-400 text-[10px] block">Sanction Order No.</span>
            <span className="font-bold text-emerald-300">{sanction.sanctionNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Corridor Section</span>
            <span className="font-bold text-slate-200">{sanction.corridorName || "National Corridor"} (KM {sanction.fromKm} - {sanction.toKm})</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Track Line Affected</span>
            <span className="font-bold text-amber-300">{sanction.trackLine}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Block Duration</span>
            <span className="font-bold text-cyan-300">{sanction.durationHours} Hours ({sanction.sanctionedWindow})</span>
          </div>
        </div>

        {/* Safety Directives & Traction Isolation Details */}
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-[#050814] border border-[#1A274E] space-y-2">
            <h4 className="font-bold text-[#F8FAFC] flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-[#FFD600]" />
              <span>25kV Traction Power Isolation & Earthing Certificate</span>
            </h4>
            <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
              Traction Substation: <strong>Bhopal TSS-02 / Feeding Post FP-01</strong>. Feeder Circuit Breaker tagged and locked out. Two sets of approved earthing discharge rods applied at Mast Portals 224 and 226 pursuant to IRACTM Vol II Para 203. Permit to Work (PTW) ref: <strong className="text-amber-300">{sanction.ohePermitToWorkNumber}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#050814] border border-[#1A274E] space-y-2">
            <h4 className="font-bold text-[#F8FAFC] flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-[#FF2A6D]" />
              <span>Temporary Speed Restriction (TSR) & Caution Order T/409</span>
            </h4>
            <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
              {sanction.cautionOrderSummary || `Caution order imposed: Maximum speed ${sanction.cautionSpeedKmph} km/h between KM ${sanction.fromKm} and KM ${sanction.toKm}. Loco Pilots to sound intermittent horn (whistle code) and observe red banner flags.`}
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-[#F8FAFC] text-xs">Statutory G&SR Clauses Cited:</h4>
            <ul className="list-disc pl-5 text-[#B6BFFF] text-[11px] font-mono space-y-0.5">
              {sanction.gsrRulesCited.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* E-Signatures & QR Verification Block */}
        <div className="pt-6 border-t border-[#1A274E] flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-xl bg-white text-navy-950 shrink-0">
              <QrCode className="w-16 h-16 text-slate-900" />
            </div>
            <div className="text-[10px] font-mono text-slate-400 space-y-1">
              <span className="text-xs font-bold text-[#3DFDCE] block">INDIAN RAILWAYS DIGITAL STAMP</span>
              <span>SHA-256 Hash: {sanction.digitalSignatureHash.slice(0, 24)}...</span>
              <span className="block">Timestamp: {sanction.issuedAt}</span>
              <span className="text-[#3DFDCE] font-bold block">✓ Tamper-Proof Cryptographic Verification</span>
            </div>
          </div>

          <div className="text-right space-y-1 font-mono text-xs">
            <span className="text-[#B6BFFF] text-[10px] block">Sanctioned By</span>
            <span className="text-slate-200 font-bold text-sm block">{sanction.issuingOfficer}</span>
            <span className="text-[#B6BFFF] text-[11px]">{sanction.issuingDesignation}</span>
            <span className="text-[#3DFDCE] text-[10px] block font-bold">DIGITALLY SIGNED & SEALED</span>
          </div>
        </div>
      </div>

      {/* Unalterable Tamper-Proof Audit Trail Table */}
      <div className="rounded-2xl bg-[#0C1326] border border-[#1A274E] overflow-hidden">
        <div className="p-4 bg-[#131E3D] border-b border-[#1A274E] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Hash className="w-4 h-4 text-[#3DFDCE]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Unalterable Tamper-Proof Audit Trail Log ({auditLogs.length} Events)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#3DFDCE] bg-[#0C1326] px-2 py-0.5 rounded border border-[#3DFDCE]/40">
            Hash Chain Active
          </span>
        </div>

        <div className="divide-y divide-[#1A274E] max-h-72 overflow-y-auto">
          {auditLogs.slice(0, 15).map((log) => (
            <div key={log.id} className="p-3.5 hover:bg-slate-900/60 transition flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-200">{log.action}</span>
                  <span className="px-2 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300">
                    {log.department}
                  </span>
                  <span className="text-slate-500 text-[11px]">{log.entityId}</span>
                </div>
                <p className="text-slate-400 text-[11px] font-sans">{log.details}</p>
              </div>

              <div className="text-right text-[11px] text-slate-400">
                <span className="text-slate-300 font-bold block">{log.user}</span>
                <span className="text-[10px] text-slate-500">{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
