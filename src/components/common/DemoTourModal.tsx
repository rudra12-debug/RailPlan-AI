"use client";

import React from "react";
import { useDemoTour } from "@/context/DemoTourContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Compass, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  UserCheck
} from "lucide-react";
import Link from "next/link";

export const DemoTourModal: React.FC = () => {
  const { isOpen, currentStepIndex, currentStep, totalSteps, closeTour, nextStep, prevStep, goToStep } = useDemoTour();
  const { user } = useAuth();

  if (!isOpen) return null;

  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-lg w-full bg-navy-900 border-2 border-cyan-500/80 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.35)] overflow-hidden animate-slide-up">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-950 via-navy-900 to-purple-950 p-4 border-b border-cyan-500/30 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500 text-navy-950 font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
                Interactive Guided Scenario
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Step {currentStep.stepNumber} of {totalSteps}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-100">{currentStep.title}</h4>
          </div>
        </div>

        <button
          onClick={closeTour}
          className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-1.5">
        <div
          className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full transition-all duration-300"
          style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Body */}
      <div className="p-5 space-y-4 bg-navy-900/95">
        {/* Active Persona tag */}
        <div className="flex items-center justify-between text-xs bg-navy-950/80 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Current Role:</span>
            <span className="font-semibold text-slate-200">{currentStep.role}</span>
          </div>
          <span className="text-[11px] text-cyan-400 font-mono">{currentStep.roleEmail}</span>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">{currentStep.description}</p>

        {/* Action Prompt */}
        <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-start space-x-2.5">
          <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <p className="text-xs font-medium text-cyan-200">{currentStep.actionPrompt}</p>
        </div>

        {/* Action Nav Links & Controls */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <div className="flex space-x-2">
            <button
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition ${
                currentStepIndex === 0
                  ? "border-slate-800 text-slate-600 cursor-not-allowed"
                  : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>

            <Link
              href={currentStep.route}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center space-x-1.5 transition"
            >
              <span>Go to View</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </Link>
          </div>

          <button
            onClick={isLastStep ? closeTour : nextStep}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-bold text-xs shadow-glow-cyan flex items-center space-x-1.5 transition transform active:scale-95"
          >
            <span>{isLastStep ? "Finish Tour" : "Next Step"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
