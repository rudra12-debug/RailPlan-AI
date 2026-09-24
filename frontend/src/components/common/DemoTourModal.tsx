"use client";

import React from "react";
import { useDemoTour } from "@/context/DemoTourContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Compass, 
  CaretRight, 
  CaretLeft, 
  X, 
  CheckCircle, 
  Sparkle, 
  ArrowRight,
  ShieldCheck,
  User,
  Info,
  ListNumbers,
  Target,
  PlayCircle
} from "@phosphor-icons/react";
import Link from "next/link";

export const DemoTourModal: React.FC = () => {
  const { isOpen, currentStepIndex, currentStep, totalSteps, closeTour, nextStep, prevStep } = useDemoTour();
  const { user } = useAuth();

  if (!isOpen) return null;

  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <>
      {/* 100% Solid Cyber-Brutalist Tour Dialog (NO transparency, completely opaque solid background) */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-dialog-title"
        className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 max-w-xl w-[calc(100vw-24px)] sm:w-[540px] bg-[#000D18] border-3 border-black shadow-[8px_8px_0_#000000] rounded-2xl overflow-hidden ring-2 ring-[#00FFD2] animate-slide-up select-none"
        style={{ backgroundColor: "#000D18", opacity: 1 }}
      >
        {/* Official Indian Railways Tricolor Ribbon Accent Top Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF671F] via-[#FFFFFF] to-[#046A38]" />

        {/* Top Header Bar (100% Solid Opaque #022642) */}
        <div className="bg-[#022642] p-3.5 sm:p-4 border-b-2 border-black flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-[#000D18] border-2 border-black text-[#00FFD2] shadow-[2px_2px_0_#000000] shrink-0">
              <Compass size={20} weight="duotone" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-[#00FFD2] text-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0_#000000] shrink-0">
                  Interactive Guided Scenario
                </span>
                <span className="text-xs font-mono font-black text-[#FFFF00] shrink-0">
                  Step {currentStep.stepNumber} of {totalSteps}
                </span>
              </div>
              <h3 id="tour-dialog-title" className="text-sm sm:text-base font-black text-white truncate mt-0.5">
                {currentStep.title}
              </h3>
            </div>
          </div>

          <button
            onClick={closeTour}
            aria-label="Close Walkthrough"
            className="p-1.5 rounded-lg bg-[#000D18] text-[#CABFFF] hover:text-white hover:bg-[#FF1818] border border-black shadow-[1px_1px_0_#000000] transition cursor-pointer shrink-0"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Solid Step Progress Bar */}
        <div className="w-full bg-[#000D18] h-2 border-b-2 border-black">
          <div
            className="bg-gradient-to-r from-[#00FFD2] via-[#6367FF] to-[#FFFF00] h-full transition-all duration-300 border-r border-black"
            style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Dialog Body (100% Solid Opaque #000D18, zero transparency, scrollable if tall) */}
        <div className="p-4 sm:p-5 space-y-3.5 bg-[#000D18] max-h-[70vh] sm:max-h-[75vh] overflow-y-auto">
          {/* Active Role Strip */}
          <div className="flex items-center justify-between text-xs bg-[#011526] p-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0_#000000]">
            <div className="flex items-center space-x-2 min-w-0">
              <ShieldCheck size={18} weight="duotone" className="text-[#00FFD2] shrink-0" />
              <span className="text-[#CABFFF] font-bold shrink-0">Active Persona:</span>
              <span className="font-mono font-black text-[#FFFF00] truncate">{currentStep.role}</span>
            </div>
            <span className="text-[10px] font-mono text-[#00FFD2] bg-[#000D18] px-2 py-0.5 rounded border border-black shrink-0 hidden xs:inline">
              {currentStep.roleEmail}
            </span>
          </div>

          {/* 1. What This Option Does Card (Solid #022642) */}
          <div className="p-3.5 rounded-xl bg-[#022642] border-2 border-black shadow-[3px_3px_0_#000000] space-y-1.5">
            <div className="flex items-center space-x-2 text-[#00FFD2]">
              <Target size={18} weight="duotone" className="shrink-0" />
              <h4 className="text-[11px] font-mono font-black uppercase tracking-wider text-white">
                What This Option Does:
              </h4>
            </div>
            <p className="text-xs text-[#E2E8F0] leading-relaxed font-sans font-medium pl-6">
              {currentStep.whatItDoes || currentStep.description}
            </p>
          </div>

          {/* 2. How To Do It (Step-by-Step Instructions) Card (Solid #011526) */}
          <div className="p-3.5 rounded-xl bg-[#011526] border-2 border-black shadow-[3px_3px_0_#000000] space-y-2">
            <div className="flex items-center space-x-2 text-[#FFFF00]">
              <ListNumbers size={18} weight="bold" className="shrink-0" />
              <h4 className="text-[11px] font-mono font-black uppercase tracking-wider text-white">
                How To Do It (Step-by-Step):
              </h4>
            </div>
            {currentStep.howToDoIt && currentStep.howToDoIt.length > 0 ? (
              <ul className="space-y-1.5 pl-6 text-xs text-[#CABFFF] font-sans">
                {currentStep.howToDoIt.map((stepInstruction, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-[11px] font-mono font-black text-[#00FFD2] bg-[#000D18] px-1.5 py-0.2 rounded border border-black shrink-0">
                      {i + 1}
                    </span>
                    <span className="leading-snug text-white font-medium">{stepInstruction}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-white leading-relaxed pl-6 font-medium">
                {currentStep.actionPrompt}
              </p>
            )}
          </div>

          {/* 3. Action Prompt / Next Trigger (Solid #3D0072 with #00FFD2 highlight) */}
          <div className="p-3 rounded-xl bg-[#3D0072] border-2 border-black shadow-[2px_2px_0_#000000] flex items-center space-x-2.5">
            <Sparkle size={18} weight="fill" className="text-[#FFFF00] shrink-0 animate-pulse" />
            <p className="text-xs font-bold text-[#CABFFF] leading-snug">
              <strong className="text-white">Action: </strong> {currentStep.actionPrompt}
            </p>
          </div>

          {/* Action Navigation Controls (Solid Tactile Cyber Buttons) */}
          <div className="pt-2 flex items-center justify-between border-t-2 border-black gap-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-black border-2 border-black flex items-center space-x-1.5 transition cursor-pointer ${
                  currentStepIndex === 0
                    ? "bg-[#011526] text-[#8595FF] opacity-50 cursor-not-allowed shadow-none"
                    : "bg-[#022642] text-white hover:bg-[#033358] shadow-[2px_2px_0_#000000] active:translate-y-0.5 active:shadow-none"
                }`}
              >
                <CaretLeft size={14} weight="bold" />
                <span>Prev</span>
              </button>

              <Link
                href={currentStep.route}
                className="px-3 py-2 rounded-xl bg-[#6367FF] hover:bg-[#5256FF] text-white font-mono font-black text-xs border-2 border-black shadow-[2px_2px_0_#000000] active:translate-y-0.5 active:shadow-none flex items-center space-x-1.5 transition"
              >
                <span>Go to Screen</span>
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>

            <button
              onClick={isLastStep ? closeTour : nextStep}
              className={`px-4 py-2 rounded-xl font-mono font-black text-xs border-2 border-black shadow-[3px_3px_0_#000000] active:translate-y-0.5 active:shadow-none flex items-center space-x-1.5 transition cursor-pointer ${
                isLastStep
                  ? "bg-[#FB2077] hover:brightness-110 text-white"
                  : "bg-[#00FFD2] hover:bg-[#00E5BD] text-black"
              }`}
            >
              <span>{isLastStep ? "Finish Tour ✓" : "Next Step"}</span>
              <CaretRight size={14} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
