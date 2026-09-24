"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRailPlan } from "@/context/RailPlanContext";
import { useDemoTour, DEMO_STEPS } from "@/context/DemoTourContext";
import { MOCK_USERS } from "@/lib/mockData";
import {
  BookOpen,
  PlayCircle,
  ArrowCounterClockwise,
  MapTrifold,
  Package,
  FileText,
  Lightning,
  ShieldCheck,
  Users,
  CheckCircle,
  CaretDown,
  CaretRight,
  MagnifyingGlass,
  Broadcast,
  DeviceMobile,
  Desktop,
  Train,
  Clock,
  Sparkle,
  Stack,
  CheckSquare,
  Wrench,
  Pulse,
  Warning,
  Info,
  ArrowRight,
  Sliders,
  Question,
  CurrencyInr,
  Calendar,
  Target,
  ListNumbers
} from "@phosphor-icons/react";

interface FaqItem {
  question: string;
  category: string;
  whatItDoes: string;
  howToDoIt: string[];
  actionHref?: string;
  actionText?: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: "Role & Access",
    question: "How do I switch between Central Admin and Department personas?",
    whatItDoes: "Switches your RBAC access token, revealing either network-wide OCC central commands (sanctions, bundling, approvals) or department-specific field tasks (machinery, crew, execution).",
    howToDoIt: [
      "Click the 'Role' pill in the top header or in the Quick Role Switcher section below.",
      "Select 'Central Control Authority' for full access, or pick 'Civil Engineering', 'Electrical TRD', 'S&T', or 'Operating/Safety'.",
      "Notice your dashboard and sidebar instantly adapt to that directorate.",
    ],
    actionHref: "/central",
    actionText: "Go to Central OCC",
  },
  {
    category: "Map & Navigation",
    question: "How do I use the Interactive Live Corridor Map on a mobile device?",
    whatItDoes: "Provides 100% full-screen GPS interactive map navigation with pinch-zoom, station tap popups, and real-time line block visualization.",
    howToDoIt: [
      "Open '/central/map' or click 'Live Corridor Map' in the menu.",
      "On mobile, tap the top tab switcher: choose '[🗺️ Interactive Map]' for full-screen map or '[📋 Stations & Details]' for the station inspector list.",
      "Tap any station marker on the map to open the floating quick-peek details card.",
    ],
    actionHref: "/central/map",
    actionText: "Open Live Corridor Map",
  },
  {
    category: "Task Bundler",
    question: "How does the AI Task Bundler merge tasks and save 42% track closure hours?",
    whatItDoes: "Identifies spatially overlapping maintenance activities (Civil + Electrical + Signaling) on the same track kilometer chainage and merges them into a single unified Mega Block.",
    howToDoIt: [
      "Navigate to '/central/bundling' in Central Authority mode.",
      "Review the 'AI-Detected Overlapping Clusters' card recommendations.",
      "Select 2 or more candidate activities on the same kilometer section.",
      "Review the dynamic savings calculator (-14.5 hours saved, ₹7.25L cost saved).",
      "Click 'Merge into Unified Mega Block' to issue Form T/806.",
    ],
    actionHref: "/central/bundling",
    actionText: "Open Task Bundler",
  },
  {
    category: "Sanctions & Forms",
    question: "What is Form T/806 and how do I generate an official sanction memo?",
    whatItDoes: "Form T/806 is the statutory Authority to Block Line order under Indian Railways G&SR rules. It grants legal possession of track to engineering gangs.",
    howToDoIt: [
      "Approve any service request or mega bundle in the Central Approval Center.",
      "Navigate to '/central/sanctions' to inspect the digitally generated Form T/806 memo.",
      "Verify the cryptographic SHA-256 digital signature and Section Controller dispatch number.",
      "Click 'Print / Export Official Memo' to download the printable order.",
    ],
    actionHref: "/central/sanctions",
    actionText: "View Sanctions (Form T/806)",
  },
  {
    category: "Multi-Device Sync",
    question: "How does real-time multi-device synchronization work?",
    whatItDoes: "Maintains a live bi-directional WebSocket and state replication tunnel between phones, field tablets, and desktop OCC stations.",
    howToDoIt: [
      "Open RailPlan AI on your mobile browser and on your desktop monitor simultaneously.",
      "Perform any action on your phone (e.g. advance milestone progress or approve a request).",
      "Notice the desktop dashboard updates within milliseconds without any page reload.",
    ],
  },
  {
    category: "Emergency OCC",
    question: "What happens during an Emergency OCC Replanning simulation?",
    whatItDoes: "Instantly revokes existing track block sanctions on affected sections, issues Form T/409 caution orders, reroutes passenger trains, and prevents collisions.",
    howToDoIt: [
      "Click 'Emergency OCC' in the top header or navigate to '/central/emergency'.",
      "Select an emergency incident (e.g. 'Rail Fracture at KM 152' or '25kV OHE Catenary Snap').",
      "Click 'Trigger Emergency Replanning'.",
      "Inspect the automated diversion route and recalculated track availability windows.",
    ],
    actionHref: "/central/emergency",
    actionText: "Test Emergency OCC Hub",
  },
  {
    category: "Simulation Reset",
    question: "How do I reset all simulated tasks, approvals, and metrics to default?",
    whatItDoes: "Restores the simulation database to default factory baseline (10 corridors, 12 tasks, default budgets, fresh approvals).",
    howToDoIt: [
      "Click the 'Reset Demo' button in the top header, sidebar drawer, or the banner on this guide page.",
      "All mutated states are re-seeded cleanly in memory.",
    ],
  },
];

export default function SystemGuidePage() {
  const { user, switchUser, isCentralAdmin } = useAuth();
  const { corridors, resetToDemoState } = useRailPlan();
  const { openTour, goToStep } = useDemoTour();

  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [resetMessage, setResetMessage] = useState(false);

  const handleResetDemo = () => {
    resetToDemoState();
    setResetMessage(true);
    setTimeout(() => setResetMessage(false), 3500);
  };

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_ITEMS;
    const q = searchQuery.toLowerCase();
    return FAQ_ITEMS.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.whatItDoes.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.howToDoIt.some((s) => s.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="space-y-8 select-none">
      {/* 1. Official Indian Railways Header Banner (100% Solid Opaque #022642) */}
      <div className="p-4 sm:p-6 lg:p-8 rounded-2xl bg-[#022642] border-3 border-black shadow-[6px_6px_0_#000000] relative overflow-hidden">
        {/* Tricolor Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF671F] via-[#FFFFFF] to-[#046A38]" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-xs font-mono font-black bg-[#00FFD2] text-black border-2 border-black px-2.5 py-0.5 rounded shadow-[2px_2px_0_#000000] uppercase tracking-wider shrink-0">
                भारतीय रेल • Ministry of Railways
              </span>
              <span className="text-xs text-[#FFFF00] font-mono font-black bg-[#000D18] px-2 py-0.5 rounded border border-black">
                IR-RAMS 2026 Manual
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-sans leading-tight">
              RailPlan AI • Comprehensive System Guide & Operations Manual
            </h1>
            <p className="text-xs sm:text-sm text-[#CABFFF] font-medium leading-relaxed">
              Every tool and workflow explained in detail: what each option does and exactly how to use it step-by-step. Launch the live interactive tour or browse through the visual guides below.
            </p>
          </div>

          {/* Quick Action Buttons (Solid Opaque Tactile Buttons) */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
            <button
              onClick={openTour}
              className="btn-tactile px-4 py-3 rounded-xl bg-[#00FFD2] hover:bg-[#00E5BD] text-black font-black text-xs sm:text-sm border-2 border-black shadow-[3px_3px_0_#000000] flex items-center justify-center space-x-2 cursor-pointer w-full"
            >
              <PlayCircle size={20} weight="fill" className="text-black" />
              <span>Launch 16-Step Live Tour</span>
            </button>

            <button
              onClick={handleResetDemo}
              className="btn-tactile px-4 py-2.5 rounded-xl bg-[#000D18] hover:bg-[#02395D] text-[#FFFF00] font-black text-xs border-2 border-black shadow-[3px_3px_0_#000000] flex items-center justify-center space-x-2 cursor-pointer w-full"
            >
              <ArrowCounterClockwise size={16} weight="bold" />
              <span>Reset Simulation State</span>
            </button>

            {resetMessage && (
              <div className="p-2 rounded-lg bg-[#00FFD2] text-black text-center text-xs font-mono font-black border border-black animate-bounce">
                ✓ State Reset to Default Demo Baseline!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Quick Navigation Shortcuts Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <a
          href="#roles-section"
          className="p-3.5 rounded-xl bg-[#022642] hover:bg-[#033358] border-2 border-black shadow-[3px_3px_0_#000000] text-left transition block group"
        >
          <div className="flex items-center space-x-2 text-[#00FFD2]">
            <ShieldCheck size={20} weight="duotone" />
            <span className="text-xs font-black uppercase text-white group-hover:text-[#00FFD2]">1. Role Personas</span>
          </div>
          <p className="text-[11px] text-[#CABFFF] mt-1 font-medium">RBAC permissions & 1-click switcher</p>
        </a>

        <a
          href="#map-section"
          className="p-3.5 rounded-xl bg-[#022642] hover:bg-[#033358] border-2 border-black shadow-[3px_3px_0_#000000] text-left transition block group"
        >
          <div className="flex items-center space-x-2 text-[#FFFF00]">
            <MapTrifold size={20} weight="duotone" />
            <span className="text-xs font-black uppercase text-white group-hover:text-[#FFFF00]">2. Corridor Map</span>
          </div>
          <p className="text-[11px] text-[#CABFFF] mt-1 font-medium">10 trunk routes & mobile mode</p>
        </a>

        <a
          href="#workflow-section"
          className="p-3.5 rounded-xl bg-[#022642] hover:bg-[#033358] border-2 border-black shadow-[3px_3px_0_#000000] text-left transition block group"
        >
          <div className="flex items-center space-x-2 text-[#FB2077]">
            <CheckSquare size={20} weight="duotone" />
            <span className="text-xs font-black uppercase text-white group-hover:text-[#FB2077]">3. 9-Stage Lifecycle</span>
          </div>
          <p className="text-[11px] text-[#CABFFF] mt-1 font-medium">From request to Form T/806 closure</p>
        </a>

        <a
          href="#bundler-section"
          className="p-3.5 rounded-xl bg-[#022642] hover:bg-[#033358] border-2 border-black shadow-[3px_3px_0_#000000] text-left transition block group"
        >
          <div className="flex items-center space-x-2 text-[#6367FF]">
            <Package size={20} weight="duotone" />
            <span className="text-xs font-black uppercase text-white group-hover:text-[#6367FF]">4. Mega Bundler</span>
          </div>
          <p className="text-[11px] text-[#CABFFF] mt-1 font-medium">Spatio-temporal joint blocks</p>
        </a>
      </div>

      {/* 3. Section: Role Personas Playground */}
      <section id="roles-section" className="p-5 sm:p-6 rounded-2xl bg-[#022642] border-3 border-black shadow-[5px_5px_0_#000000] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck size={24} weight="duotone" className="text-[#00FFD2]" />
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                1. Role-Based Access Control (RBAC) & Active Personas
              </h2>
            </div>
            <p className="text-xs text-[#CABFFF] font-medium mt-1">
              Indian Railways operations require strict separation of concerns between Section Controllers and Field Directorates.
            </p>
          </div>
          <span className="text-xs font-mono font-black text-white bg-[#000D18] px-3 py-1.5 rounded-lg border border-black shadow-[1px_1px_0_#000000] shrink-0">
            Active: <strong className="text-[#00FFD2]">{user?.name}</strong> ({user?.role === "CENTRAL_ADMIN" ? "Central Admin" : user?.departmentName})
          </span>
        </div>

        {/* What this does & How to do it Explanations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-3.5 rounded-xl bg-[#011526] border-2 border-black shadow-[2px_2px_0_#000000] space-y-1.5">
            <div className="flex items-center space-x-2 text-[#00FFD2]">
              <Target size={18} weight="duotone" />
              <h3 className="text-xs font-mono font-black uppercase text-white">What This Option Does:</h3>
            </div>
            <p className="text-xs text-[#E2E8F0] leading-relaxed pl-6">
              Allows you to simulate any railway officer role in 1 click without needing separate login credentials. Central Admin commands the national network and sanctions blocks; Department Engineers manage crews, submit requisitions, and report progress.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#000D18] border-2 border-black shadow-[2px_2px_0_#000000] space-y-1.5">
            <div className="flex items-center space-x-2 text-[#FFFF00]">
              <ListNumbers size={18} weight="bold" />
              <h3 className="text-xs font-mono font-black uppercase text-white">How To Do It:</h3>
            </div>
            <ol className="space-y-1 pl-6 text-xs text-[#CABFFF] list-decimal list-inside font-medium">
              <li>Click the 'Role' pill in the top header or click any persona card below.</li>
              <li>Select your target role (e.g. Civil Engineering or Electrical TRD).</li>
              <li>Observe the UI immediately adapt to show your directorate's tasks and budgets.</li>
            </ol>
          </div>
        </div>

        {/* Persona Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {MOCK_USERS.map((u) => {
            const isCurrent = user?.email === u.email;
            const isCentral = u.role === "CENTRAL_ADMIN";
            return (
              <div
                key={u.id}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between space-y-3 ${
                  isCurrent
                    ? "bg-[#011526] border-[#00FFD2] shadow-[4px_4px_0_#00FFD2]"
                    : "bg-[#000D18] border-black shadow-[3px_3px_0_#000000] hover:bg-[#02395D]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border border-black ${
                      isCentral ? "bg-[#6367FF] text-white" : "bg-[#FFFF00] text-black"
                    }`}>
                      {isCentral ? "CENTRAL AUTHORITY" : `${u.departmentId} DIRECTORATE`}
                    </span>
                    {isCurrent && (
                      <span className="flex items-center space-x-1 text-[11px] font-mono font-black text-[#00FFD2]">
                        <CheckCircle size={14} weight="fill" />
                        <span>ACTIVE</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-black text-white mt-2">{u.name}</h3>
                  <p className="text-[11px] text-[#CABFFF] font-bold">{u.designation}</p>
                  <p className="text-[10px] font-mono text-[#8595FF] mt-0.5">{u.email} • {u.division}</p>

                  <div className="mt-2.5 pt-2 border-t border-black/50 text-[11px] text-[#8595FF] space-y-1">
                    <p className="font-semibold text-white">Authority & Scope:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-[10px] text-[#CABFFF]">
                      {isCentral ? (
                        <>
                          <li>National OCC Command across all 10 trunk corridors</li>
                          <li>Issues statutory Form T/806 Line Block Sanctions</li>
                          <li>Mega Block Task Bundler & What-If Simulator</li>
                          <li>Emergency Line Block Revocation & Replanning</li>
                        </>
                      ) : (
                        <>
                          <li>Submit & manage inter-departmental service requests</li>
                          <li>Manage specialized machinery (tampers, tower wagons)</li>
                          <li>Report real-time milestone progress (25% → 100%)</li>
                          <li>Upload completion certificates & track fitness</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => switchUser(u.email)}
                  disabled={isCurrent}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-black font-mono transition flex items-center justify-center space-x-1.5 border border-black cursor-pointer ${
                    isCurrent
                      ? "bg-[#00FFD2] text-black shadow-none cursor-default font-black"
                      : "bg-[#022642] text-white hover:bg-[#6367FF] shadow-[2px_2px_0_#000000] active:translate-y-0.5 active:shadow-none"
                  }`}
                >
                  {isCurrent ? (
                    <span>Current Persona Active</span>
                  ) : (
                    <>
                      <span>Switch to {u.name.split(" ")[0]}</span>
                      <ArrowRight size={14} weight="bold" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Section: Live Corridor Map & 10 National Trunk Corridors */}
      <section id="map-section" className="p-5 sm:p-6 rounded-2xl bg-[#022642] border-3 border-black shadow-[5px_5px_0_#000000] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#000D18] border-2 border-black text-[#FFFF00] shrink-0">
              <MapTrifold size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                2. Interactive Corridor GIS Map & Telemetry Console
              </h2>
              <p className="text-xs text-[#CABFFF] font-medium">
                Real-time spatial visualization across 10 high-density Indian Railways trunk routes.
              </p>
            </div>
          </div>

          <Link
            href="/central/map"
            className="btn-tactile px-3.5 py-2 rounded-xl bg-[#FFFF00] text-black font-black text-xs flex items-center space-x-2 border-2 border-black shadow-[2px_2px_0_#000000] shrink-0 self-start sm:self-auto"
          >
            <span>Launch Live Map Console</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        {/* What this does & How to do it */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-3.5 rounded-xl bg-[#011526] border-2 border-black shadow-[2px_2px_0_#000000] space-y-1.5">
            <div className="flex items-center space-x-2 text-[#00FFD2]">
              <Target size={18} weight="duotone" />
              <h3 className="text-xs font-mono font-black uppercase text-white">What This Option Does:</h3>
            </div>
            <p className="text-xs text-[#E2E8F0] leading-relaxed pl-6">
              Renders Leaflet GIS map with GPS railway station coordinates, active line blocks, speed restriction zones (TSR), and a synchronized 2D linear track schematic showing kilometer posts.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#000D18] border-2 border-black shadow-[2px_2px_0_#000000] space-y-1.5">
            <div className="flex items-center space-x-2 text-[#FFFF00]">
              <ListNumbers size={18} weight="bold" />
              <h3 className="text-xs font-mono font-black uppercase text-white">How To Do It:</h3>
            </div>
            <ol className="space-y-1 pl-6 text-xs text-[#CABFFF] list-decimal list-inside font-medium">
              <li>Click corridor pills (e.g. BPL-ET, NDLS-MMCT) to jump the map to that trunk section.</li>
              <li>On mobile, use the top switcher to toggle between '[🗺️ Interactive Map]' and '[📋 Stations & Details]'.</li>
              <li>Tap any station pin to view platform lines, loop lines, and active maintenance blocks.</li>
            </ol>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#000D18] border-2 border-black shadow-[3px_3px_0_#000000] space-y-2">
            <div className="flex items-center space-x-2 text-[#00FFD2]">
              <Train size={20} weight="duotone" />
              <h3 className="text-xs font-black uppercase text-white">10 National Corridors</h3>
            </div>
            <p className="text-xs text-[#CABFFF] leading-relaxed">
              Covers Bhopal-Itarsi (BPL-ET), Delhi-Mumbai (NDLS-MMCT), Delhi-Howrah (NDLS-HWH), Dedicated Freight Corridors (WDFC/EDFC), Konkan Railway, and Southern routes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#000D18] border-2 border-black shadow-[3px_3px_0_#000000] space-y-2">
            <div className="flex items-center space-x-2 text-[#FB2077]">
              <DeviceMobile size={20} weight="duotone" />
              <h3 className="text-xs font-black uppercase text-white">Mobile Dedicated Tab Switcher</h3>
            </div>
            <p className="text-xs text-[#CABFFF] leading-relaxed">
              Separates the GIS map from the 320px station list on mobile so you can pan and zoom freely with 100% full-width view and zero squishing.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#000D18] border-2 border-black shadow-[3px_3px_0_#000000] space-y-2">
            <div className="flex items-center space-x-2 text-[#6367FF]">
              <Pulse size={20} weight="duotone" />
              <h3 className="text-xs font-black uppercase text-white">2D Linear Track Schematic</h3>
            </div>
            <p className="text-xs text-[#CABFFF] leading-relaxed">
              A touch-scrollable horizontal track diagram showing exact kilometer chainage, ballast renewal zones, and OHE mast alignments.
            </p>
          </div>
        </div>

        {/* Corridor Directory Table Preview */}
        <div className="mt-4 pt-4 border-t border-black">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#FFFF00] mb-2.5">
            Supported Indian Railways Trunk Corridors Directory:
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
            {corridors.map((c) => (
              <div key={c.id} className="p-2 rounded-lg bg-[#011526] border border-black shadow-[1px_1px_0_#000000]">
                <p className="font-black text-[#00FFD2]">{c.id}</p>
                <p className="text-[10px] text-white truncate font-sans">{c.name.split("(")[0]}</p>
                <p className="text-[9px] text-[#CABFFF]">{c.totalLengthKm} KM • {c.zone.split("(")[0]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Section: The 9-Stage Request Lifecycle */}
      <section id="workflow-section" className="p-5 sm:p-6 rounded-2xl bg-[#022642] border-3 border-black shadow-[5px_5px_0_#000000] space-y-4">
        <div className="border-b-2 border-black pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#000D18] border-2 border-black text-[#FB2077] shrink-0">
              <CheckSquare size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                3. The 9-Stage Inter-Departmental Request Lifecycle
              </h2>
              <p className="text-xs text-[#CABFFF] font-medium">
                Every track block, OHE power cutoff, and signal interlock follows a statutory Indian Railways approval pipeline.
              </p>
            </div>
          </div>
        </div>

        {/* What this does & How to do it */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-3.5 rounded-xl bg-[#011526] border-2 border-black shadow-[2px_2px_0_#000000] space-y-1.5">
            <div className="flex items-center space-x-2 text-[#00FFD2]">
              <Target size={18} weight="duotone" />
              <h3 className="text-xs font-mono font-black uppercase text-white">What This Option Does:</h3>
            </div>
            <p className="text-xs text-[#E2E8F0] leading-relaxed pl-6">
              Guarantees full accountability from initial requisition to Form T/806 sanction, live execution milestones (25%, 50%, 75%, 100%), and final verification before track is certified fit for commercial train movement.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#000D18] border-2 border-black shadow-[2px_2px_0_#000000] space-y-1.5">
            <div className="flex items-center space-x-2 text-[#FFFF00]">
              <ListNumbers size={18} weight="bold" />
              <h3 className="text-xs font-mono font-black uppercase text-white">How To Do It:</h3>
            </div>
            <ol className="space-y-1 pl-6 text-xs text-[#CABFFF] list-decimal list-inside font-medium">
              <li>Go to '/department/create-request' and fill in KM chainage, hours, and machinery.</li>
              <li>Switch to Central Admin and approve the requisition in '/central/approvals'.</li>
              <li>Switch to executing department, open '/department/execution', and click milestone buttons (25% → 100%).</li>
              <li>Central Admin inspects proof photos and clicks 'Verify & Close Request'.</li>
            </ol>
          </div>
        </div>

        {/* 9 Stage Timeline Flow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2 pt-2">
          {[
            { stage: 1, name: "Draft", desc: "Dept fills form with KM markers, hours, and machinery", color: "bg-[#02395D] text-white" },
            { stage: 2, name: "Submitted", desc: "Validated and queued for Central OCC evaluation", color: "bg-[#02395D] text-white" },
            { stage: 3, name: "Under Review", desc: "AI calculates risk score and financial cost breakdown", color: "bg-[#6367FF] text-white" },
            { stage: 4, name: "Form T/806", desc: "Central Admin grants official line block sanction", color: "bg-[#FB2077] text-white" },
            { stage: 5, name: "Assigned", desc: "Forwarded to target executing directorate crew", color: "bg-[#00FFD2] text-black" },
            { stage: 6, name: "Execution", desc: "Live milestones: 25% → 50% → 75% → 100% on site", color: "bg-[#FFFF00] text-black" },
            { stage: 7, name: "Completed", desc: "Field engineer uploads inspection report & fitness", color: "bg-[#02395D] text-white" },
            { stage: 8, name: "Verification", desc: "Central OCC inspects photo proof and actual variance", color: "bg-[#02395D] text-white" },
            { stage: 9, name: "Closed", desc: "Audit logged to Indian Railways Gazette record", color: "bg-[#00FFD2] text-black" },
          ].map((s) => (
            <div
              key={s.stage}
              className="p-2.5 rounded-xl bg-[#000D18] border-2 border-black shadow-[2px_2px_0_#000000] flex flex-col justify-between space-y-1.5"
            >
              <div>
                <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded border border-black inline-block ${s.color}`}>
                  STAGE {s.stage}
                </span>
                <p className="text-xs font-black text-white mt-1">{s.name}</p>
                <p className="text-[10px] text-[#CABFFF] leading-snug mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black bg-[#000D18] p-3 rounded-xl">
          <div className="flex items-center space-x-2 text-xs text-[#CABFFF]">
            <Info size={18} weight="duotone" className="text-[#00FFD2] shrink-0" />
            <span>Try creating a request in Engineering role, then approve it as Central Admin to witness the full 9 stages live!</span>
          </div>
          <Link
            href="/department/create-request"
            className="px-3 py-1.5 rounded-lg bg-[#00FFD2] text-black text-xs font-black border border-black shadow-[1px_1px_0_#000000] hover:bg-[#00E5BD] cursor-pointer"
          >
            Create Test Request
          </Link>
        </div>
      </section>

      {/* 6. Section: AI Spatio-Temporal Mega Block Bundler */}
      <section id="bundler-section" className="p-5 sm:p-6 rounded-2xl bg-[#022642] border-3 border-black shadow-[5px_5px_0_#000000] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#000D18] border-2 border-black text-[#6367FF] shrink-0">
              <Package size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                4. AI Task Bundler & Mega Block Windows
              </h2>
              <p className="text-xs text-[#CABFFF] font-medium">
                Eliminate uncoordinated corridor closures by clustering multiple department tasks into unified work windows.
              </p>
            </div>
          </div>

          <Link
            href="/central/bundling"
            className="btn-tactile px-3.5 py-2 rounded-xl bg-[#6367FF] text-white font-black text-xs flex items-center space-x-2 border-2 border-black shadow-[2px_2px_0_#000000] shrink-0 self-start sm:self-auto"
          >
            <span>Open Bundler Console</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        {/* What this does & How to do it */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-3.5 rounded-xl bg-[#011526] border-2 border-black shadow-[2px_2px_0_#000000] space-y-1.5">
            <div className="flex items-center space-x-2 text-[#00FFD2]">
              <Target size={18} weight="duotone" />
              <h3 className="text-xs font-mono font-black uppercase text-white">What This Option Does:</h3>
            </div>
            <p className="text-xs text-[#E2E8F0] leading-relaxed pl-6">
              Scans all pending and scheduled activities across Civil, Electrical, and S&T directorates to identify spatial co-location on the same track kilometer chainage. It bundles them into a single track block, returning up to 14.5 hours of open track to passenger operations.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#000D18] border-2 border-black shadow-[2px_2px_0_#000000] space-y-1.5">
            <div className="flex items-center space-x-2 text-[#FFFF00]">
              <ListNumbers size={18} weight="bold" />
              <h3 className="text-xs font-mono font-black uppercase text-white">How To Do It:</h3>
            </div>
            <ol className="space-y-1 pl-6 text-xs text-[#CABFFF] list-decimal list-inside font-medium">
              <li>Open '/central/bundling' in Central Authority mode.</li>
              <li>Inspect 'AI-Detected Smart Bundling Opportunities' cards for ready-made recommendations.</li>
              <li>Or select candidate activities in the candidate list by checking their checkboxes.</li>
              <li>Click 'Merge Selected Activities into Mega Block' to create the unified block order.</li>
            </ol>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#000D18] border-2 border-black shadow-[3px_3px_0_#000000] space-y-2">
            <h3 className="text-xs font-black uppercase text-[#FFFF00]">1. Spatial Co-Location</h3>
            <p className="text-xs text-[#CABFFF] leading-relaxed">
              The AI engine checks track chainage (e.g. KM 148 to KM 156 on Delhi-Mumbai). If Civil needs rail grinding and Electrical needs catenary height alignment on the same KM stretch, they are grouped automatically.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#000D18] border-2 border-black shadow-[3px_3px_0_#000000] space-y-2">
            <h3 className="text-xs font-black uppercase text-[#00FFD2]">2. 42% Average Track Time Saved</h3>
            <p className="text-xs text-[#CABFFF] leading-relaxed">
              Instead of 3 separate 4-hour closures (12 total hours of track block), a single 5.5-hour Mega Block is sanctioned. This returns 6.5 hours of open track back to passenger and freight operations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#000D18] border-2 border-black shadow-[3px_3px_0_#000000] space-y-2">
            <h3 className="text-xs font-black uppercase text-[#FB2077]">3. Shared Safety Staff & Machinery</h3>
            <p className="text-xs text-[#CABFFF] leading-relaxed">
              Flagmen, detonators, engineering caution speed boards (TSR), and power block staff are mobilized once rather than thrice, slashing overhead operational expenses by ₹7.25 Lakhs per corridor.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Section: Official Sanctions & Form T/806 */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#022642] border-3 border-black shadow-[5px_5px_0_#000000] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#000D18] border-2 border-black text-[#FB2077] shrink-0">
              <FileText size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                5. Statutory Form T/806 & G&SR Sanctions Center
              </h2>
              <p className="text-xs text-[#CABFFF] font-medium">
                Official dispatch memorandums compliant with Indian Railways General and Subsidiary Rules.
              </p>
            </div>
          </div>

          <Link
            href="/central/sanctions"
            className="btn-tactile px-3.5 py-2 rounded-xl bg-[#FB2077] text-white font-black text-xs flex items-center space-x-2 border-2 border-black shadow-[2px_2px_0_#000000] shrink-0 self-start sm:self-auto"
          >
            <span>Open Sanctions Center</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        {/* What this does & How to do it */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-3.5 rounded-xl bg-[#011526] border-2 border-black shadow-[2px_2px_0_#000000] space-y-1.5">
            <div className="flex items-center space-x-2 text-[#00FFD2]">
              <Target size={18} weight="duotone" />
              <h3 className="text-xs font-mono font-black uppercase text-white">What This Option Does:</h3>
            </div>
            <p className="text-xs text-[#E2E8F0] leading-relaxed pl-6">
              Issues the official statutory order under G&SR Rule 15.06 authorizing track possession. Every issued Form T/806 carries an immutable SHA-256 digital signature, caution speed restriction (TSR), and power block memo.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#000D18] border-2 border-black shadow-[2px_2px_0_#000000] space-y-1.5">
            <div className="flex items-center space-x-2 text-[#FFFF00]">
              <ListNumbers size={18} weight="bold" />
              <h3 className="text-xs font-mono font-black uppercase text-white">How To Do It:</h3>
            </div>
            <ol className="space-y-1 pl-6 text-xs text-[#CABFFF] list-decimal list-inside font-medium">
              <li>Open '/central/sanctions' to view all issued line block sanction orders.</li>
              <li>Filter by Form T/806 (Block Sanction), Form T/409 (Caution Order), or Form T/1518 (Fitness).</li>
              <li>Click on any order card to inspect the Section Controller remarks and digital certificate.</li>
            </ol>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#000D18] border-2 border-black shadow-[3px_3px_0_#000000] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-black bg-[#FB2077] text-white px-2 py-0.5 rounded border border-black">
                FORM T/806
              </span>
              <span className="text-xs font-mono text-[#00FFD2] font-black">
                Authority to Block Line & Issue Track Possession
              </span>
            </div>
            <p className="text-xs text-[#CABFFF] leading-relaxed">
              Includes Section Controller authorization, SHA-256 digital cryptographic hash, authorized line block hours, kilometer chainage, traction power isolation confirmation, and emergency cancellation dispatch numbers.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#022642] border border-black text-center shrink-0">
            <p className="text-[10px] text-[#CABFFF] font-mono">Digital Signature</p>
            <p className="text-xs font-mono font-black text-[#00FFD2]">SHA-256 VERIFIED</p>
          </div>
        </div>
      </section>

      {/* 8. Section: 16-Step Guided Tour Checklist */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#022642] border-3 border-black shadow-[5px_5px_0_#000000] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <PlayCircle size={24} weight="fill" className="text-[#00FFD2]" />
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                6. 16-Step End-to-End Walkthrough Reference
              </h2>
            </div>
            <p className="text-xs text-[#CABFFF] font-medium mt-1">
              Click 'Jump to Step' on any stage to open the solid, color-coded walkthrough card with step-by-step instructions.
            </p>
          </div>

          <button
            onClick={openTour}
            className="btn-tactile px-4 py-2 rounded-xl bg-[#00FFD2] text-black font-black text-xs border-2 border-black shadow-[2px_2px_0_#000000] flex items-center space-x-2 shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <PlayCircle size={16} weight="fill" />
            <span>Start Interactive Tour</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {DEMO_STEPS.map((s, idx) => (
            <div
              key={s.stepNumber}
              className="p-3.5 rounded-xl bg-[#000D18] border-2 border-black shadow-[3px_3px_0_#000000] flex flex-col justify-between space-y-2 hover:border-[#00FFD2] transition group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black bg-[#6367FF] text-white px-1.5 py-0.5 rounded border border-black">
                    STEP {s.stepNumber}
                  </span>
                  <span className="text-[9px] font-mono text-[#00FFD2] font-black">
                    {s.role.split(" ")[0]}
                  </span>
                </div>
                <h4 className="text-xs font-black text-white mt-1.5 line-clamp-1">{s.title.replace(/^\d+\.\s*/, "")}</h4>
                <p className="text-[10px] text-[#CABFFF] leading-relaxed mt-1 line-clamp-2">{s.whatItDoes || s.description}</p>
              </div>

              <button
                onClick={() => {
                  goToStep(idx);
                }}
                className="w-full py-1.5 px-2 rounded-lg bg-[#022642] hover:bg-[#00FFD2] hover:text-black text-white text-[10px] font-black font-mono transition border border-black cursor-pointer flex items-center justify-center space-x-1 shadow-[1px_1px_0_#000000]"
              >
                <span>Jump to Step {s.stepNumber}</span>
                <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Section: Searchable FAQs & Troubleshooting */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#022642] border-3 border-black shadow-[5px_5px_0_#000000] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#000D18] border-2 border-black text-[#00FFD2] shrink-0">
              <Question size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                7. Frequently Asked Questions & Operational Help
              </h2>
              <p className="text-xs text-[#CABFFF] font-medium">
                Instant answers to common operational questions: what each option does and how to do it.
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8595FF]" />
            <input
              type="text"
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#000D18] border-2 border-black rounded-xl text-xs font-mono text-white placeholder-[#8595FF] focus:outline-none focus:border-[#00FFD2]"
            />
          </div>
        </div>

        {/* FAQ Accordion List (100% Solid Opaque Cards) */}
        <div className="space-y-3 pt-2">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border-2 border-black bg-[#000D18] shadow-[3px_3px_0_#000000] overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-[#02395D] transition"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-[10px] font-mono font-black bg-[#6367FF] text-white px-2 py-0.5 rounded border border-black shrink-0">
                      {faq.category}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-white truncate">
                      {faq.question}
                    </span>
                  </div>
                  <CaretDown
                    size={16}
                    weight="bold"
                    className={`text-[#00FFD2] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="p-4 pt-3 border-t-2 border-black bg-[#011526] space-y-3.5">
                    {/* What this does */}
                    <div className="p-3 rounded-lg bg-[#022642] border border-black space-y-1">
                      <div className="flex items-center space-x-1.5 text-[#00FFD2] text-[11px] font-mono font-black">
                        <Target size={16} weight="duotone" />
                        <span>WHAT THIS OPTION DOES:</span>
                      </div>
                      <p className="text-xs text-[#E2E8F0] leading-relaxed pl-5 font-sans font-medium">
                        {faq.whatItDoes}
                      </p>
                    </div>

                    {/* How to do it */}
                    <div className="p-3 rounded-lg bg-[#000D18] border border-black space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-[#FFFF00] text-[11px] font-mono font-black">
                        <ListNumbers size={16} weight="bold" />
                        <span>HOW TO DO IT (STEP-BY-STEP):</span>
                      </div>
                      <ol className="space-y-1 pl-5 text-xs text-[#CABFFF] list-decimal list-inside font-medium font-sans">
                        {faq.howToDoIt.map((st, sIdx) => (
                          <li key={sIdx}>{st}</li>
                        ))}
                      </ol>
                    </div>

                    {faq.actionHref && (
                      <Link
                        href={faq.actionHref}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#00FFD2] text-black font-black text-xs border border-black shadow-[1px_1px_0_#000000] hover:bg-[#00E5BD]"
                      >
                        <span>{faq.actionText || "Explore Feature"}</span>
                        <ArrowRight size={12} weight="bold" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. Bottom Action Bar */}
      <div className="p-6 rounded-2xl bg-[#000D18] border-3 border-black shadow-[5px_5px_0_#000000] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-white">Ready to operate Indian Railways Maintenance Command?</h3>
          <p className="text-xs text-[#CABFFF] mt-0.5">Explore national OCC, simulate what-if train diversions, or submit field block requests.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/central"
            className="btn-tactile flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#00FFD2] text-black font-black text-xs border-2 border-black shadow-[2px_2px_0_#000000] text-center"
          >
            Go to Central OCC
          </Link>
          <Link
            href="/department/dashboard"
            className="btn-tactile flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#6367FF] text-white font-black text-xs border-2 border-black shadow-[2px_2px_0_#000000] text-center"
          >
            Go to Department View
          </Link>
        </div>
      </div>
    </div>
  );
}
