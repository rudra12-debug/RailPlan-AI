"use client";

import React from "react";
import { useRailPlan } from "@/context/RailPlanContext";
import { 
  Sparkle, 
  CheckCircle, 
  X, 
  ArrowRight, 
  TrendDown, 
  Clock, 
  ShieldCheck,
  Lightning
} from "@phosphor-icons/react";
import { formatINR } from "@/lib/formatters";
import { RiskBadge } from "@/components/common/StatusBadge";

export const AiInsightsPanel: React.FC = () => {
  const { aiRecommendations, acceptAiRecommendation, dismissAiRecommendation } = useRailPlan();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-[#000D18] text-[#00FFD2] border-2 border-black shadow-[2px_2px_0_#000000]">
            <Sparkle size={22} weight="duotone" />
          </div>
          <div>
            <h3 className="font-black text-white text-base">
              AI Maintenance Optimization Intelligence
            </h3>
            <p className="text-xs text-[#8595FF] font-medium">
              Predictive risk clustering, track block bundling & timetable optimization
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-black bg-[#6367FF] text-white border-2 border-black shadow-[2px_2px_0_#000000] px-3 py-1 rounded-lg">
          {aiRecommendations.filter((r) => r.status === "PENDING").length} Active Proposals
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aiRecommendations.map((rec) => {
          const isAccepted = rec.status === "ACCEPTED";
          const isDismissed = rec.status === "DISMISSED";

          return (
            <div
              key={rec.id}
              className={`rounded-xl border-2 border-black p-5 transition-all duration-150 flex flex-col justify-between space-y-4 ${
                isAccepted
                  ? "bg-[#022642] shadow-[4px_4px_0_#00FFD2] ring-2 ring-[#00FFD2]"
                  : isDismissed
                  ? "bg-[#000D18] opacity-50 shadow-none"
                  : "bg-[#022642] shadow-[4px_4px_0_#000000]"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#6367FF] text-white border border-black shadow-[1px_1px_0_#000000]">
                      {rec.departmentId} | {rec.corridorId}
                    </span>
                    <span className="text-[10px] text-[#CABFFF] font-mono font-bold">
                      Conf: {rec.confidenceScore}%
                    </span>
                  </div>

                  <RiskBadge risk={rec.riskScore} />
                </div>

                <div>
                  <h4 className="text-sm font-black text-white leading-snug">{rec.title}</h4>
                  <p className="text-xs text-[#CABFFF] mt-1.5 leading-relaxed font-medium">{rec.description}</p>
                </div>

                {/* AI Rationale Box */}
                <div className="p-3 rounded-lg bg-[#000D18] border border-black text-[11px] text-[#CABFFF] space-y-1">
                  <span className="font-black text-[#00FFD2]">AI Rationale: </span>
                  <span>{rec.reason}</span>
                </div>

                {/* Impact Metrics */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-[#000D18] border border-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                    <p className="text-[10px] text-[#CABFFF] font-bold uppercase">Cost Impact</p>
                    <p className="font-mono font-black text-[#00FFD2] mt-0.5 text-sm">
                      {rec.estimatedCostImpact < 0 ? `Saves ${formatINR(Math.abs(rec.estimatedCostImpact))}` : formatINR(rec.estimatedCostImpact)}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#000D18] border border-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                    <p className="text-[10px] text-[#CABFFF] font-bold uppercase">Delay Reduction</p>
                    <p className="font-mono font-black text-[#2DC7D5] mt-0.5 text-sm">
                      -{rec.estimatedDelayReductionMinutes} Mins
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t-2 border-black/40 flex items-center justify-between">
                {isAccepted ? (
                  <div className="flex items-center space-x-2 text-[#00FFD2] text-xs font-black font-mono bg-[#000D18] px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0_#000000]">
                    <CheckCircle size={18} weight="fill" className="text-[#00FFD2] shrink-0" />
                    <span>Recommendation Applied & Dispatched</span>
                  </div>
                ) : isDismissed ? (
                  <span className="text-xs text-[#8595FF] font-bold font-mono">Dismissed</span>
                ) : (
                  <>
                    <button
                      onClick={() => dismissAiRecommendation(rec.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#CABFFF] hover:text-[#FB2077] hover:bg-[#000D18] border border-black transition"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => acceptAiRecommendation(rec.id)}
                      className="btn-tactile px-4 py-2 rounded-xl bg-[#00FFD2] text-black font-black text-xs flex items-center space-x-2 cursor-pointer"
                    >
                      <Sparkle size={16} weight="fill" className="text-black" />
                      <span>Accept Recommendation</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
