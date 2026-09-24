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
  Calendar
} from "@phosphor-icons/react";

interface FaqItem {
  question: string;
  category: string;
  answer: string;
  actionHref?: string;
  actionText?: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: "Role & Access",
    question: "How do I switch between Central Admin and Department personas?",
    answer: "Click the 'Role' pill in the top header or in the Quick Role Switcher section on this page. You can switch instantly between Central Control Authority (Full Network Access) and individual Core Directorates (Civil Engineering, Electrical TRD, S&T, Safety). No password re-entry is required.",
    actionHref: "/central",
    actionText: "Go to Central OCC",
  },
  {
    category: "Map & Navigation",
    question: "How do I use the Interactive Live Corridor Map on a mobile device?",
    answer: "On mobile phones, the map page (/central/map or Central Dashboard) includes a dedicated toggle tab: [🗺️ Interactive Map] and [📋 Stations & Details]. This gives you a 100% full-width view of the Leaflet GPS map with pinch-to-zoom and touch pan, plus a floating quick-peek card when you tap any railway station.",
    actionHref: "/central/map",
    actionText: "Open Live Corridor Map",
  },
  {
    category: "Task Bundler",
    question: "How does the AI Task Bundler save 40% to 60% in train delays?",
    answer: "Traditionally, Civil, Electrical, and Signaling teams take separate line blocks on the same track section on different days, blocking trains multiple times. The AI Task Bundler scans spatial coordinates (KM markers) and dates to merge overlapping works into a single unified Mega Block Window with shared safety staff and machinery.",
    actionHref: "/central/bundling",
    actionText: "Open Task Bundler",
  },
  {
    category: "Sanctions & Forms",
    question: "What is Form T/806 and how does official block sanctioning work?",
    answer: "Under Indian Railways General & Subsidiary Rules (G&SR), Form T/806 is the statutory Authority to Block Line order issued by Central OCC. In RailPlan AI, once a bundle or request is approved, Form T/806 is digitally generated with a SHA-256 e-signature, unique dispatch number, and printable official memo.",
    actionHref: "/central/sanctions",
    actionText: "View Sanctions (Form T/806)",
  },
  {
    category: "Multi-Device Sync",
    question: "Does my work on mobile sync in real time with the desktop command center?",
    answer: "Yes! RailPlan AI features full bi-directional state synchronization. When you approve a request, advance execution progress, or trigger emergency replanning on your smartphone, all connected desktop monitors and OCC stations update immediately without refreshing.",
  },
  {
    category: "Emergency OCC",
    question: "What happens during an Emergency OCC Replanning simulation?",
    answer: "When you trigger an emergency (such as a track rail fracture or 25kV OHE catenary fault), the system immediately revokes active maintenance blocks on that section, issues Form T/409 Caution Orders, reroutes high-priority passenger trains, and recalculates secondary conflict-free windows.",
    actionHref: "/central/emergency",
    actionText: "Test Emergency OCC Hub",
  },
  {
    category: "System State",
    question: "How do I reset all simulated tasks, approvals, and metrics to default?",
    answer: "Click the 'Reset Demo' button in the header or in the Quick Actions section. This instantly restores the system state, re-seeding 10 corridors, 12 active tasks, pending approvals, and default budgets.",
  },
];

export default function SystemGuidePage() {
  const { user, switchUser, isCentralAdmin } = useAuth();
  const { corridors, resetToDemoState } = useRailPlan();
  const { openTour, goToStep } = useDemoTour();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleCategory, setSelectedRoleCategory] = useState<string>("ALL");
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
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-8 select-none">
      {/* 1. Official Indian Railways Header Banner */}
      <div className="p-4 sm:p-6 lg:p-8 rounded-2xl bg-[#022642] border-2 border-black shadow-[6px_6px_0_#000000] relative overflow-hidden">
        {/* Tricolor Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF671F] via-[#FFFFFF] to-[#046A38]" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-xs font-mono font-black bg-[#00FFD2] text-black border-2 border-black px-2.5 py-0.5 rounded shadow-[2px_2px_0_#000000] uppercase tracking-wider shrink-0">
                भारतीय रेल • Ministry of Railways
              </span>
              <span className="text-xs text-[#CABFFF] font-mono font-bold">
                Official User Manual & Feature Guide (IR-RAMS 2026)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-sans leading-tight">
              RailPlan AI • Complete System Operations Guide
            </h1>
            <p className="text-xs sm:text-sm text-[#8595FF] font-medium leading-relaxed">
              Master the Unified Multi-Department Corridor Maintenance & Operations Platform. Explore the interactive 16-step guided walkthrough, role-based workflows, 10 national trunk corridors, AI task bundler, and statutory Form T/806 sanctions.
            </p>
          </div>

          {/* Quick Action Buttons */}
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
          <p className="text-[11px] text-[#8595FF] mt-1 font-medium">RBAC permissions & 1-click switcher</p>
        </a>

        <a
          href="#map-section"
          className="p-3.5 rounded-xl bg-[#022642] hover:bg-[#033358] border-2 border-black shadow-[3px_3px_0_#000000] text-left transition block group"
        >
          <div className="flex items-center space-x-2 text-[#FFFF00]">
            <MapTrifold size={20} weight="duotone" />
            <span className="text-xs font-black uppercase text-white group-hover:text-[#FFFF00]">2. Corridor Map</span>
          </div>
          <p className="text-[11px] text-[#8595FF] mt-1 font-medium">10 trunk routes & mobile mode</p>
        </a>

        <a
          href="#workflow-section"
          className="p-3.5 rounded-xl bg-[#022642] hover:bg-[#033358] border-2 border-black shadow-[3px_3px_0_#000000] text-left transition block group"
        >
          <div className="flex items-center space-x-2 text-[#FB2077]">
            <CheckSquare size={20} weight="duotone" />
            <span className="text-xs font-black uppercase text-white group-hover:text-[#FB2077]">3. 9-Stage Lifecycle</span>
          </div>
          <p className="text-[11px] text-[#8595FF] mt-1 font-medium">From request to Form T/806 closure</p>
        </a>

        <a
          href="#bundler-section"
          className="p-3.5 rounded-xl bg-[#022642] hover:bg-[#033358] border-2 border-black shadow-[3px_3px_0_#000000] text-left transition block group"
        >
          <div className="flex items-center space-x-2 text-[#6367FF]">
            <Package size={20} weight="duotone" />
            <span className="text-xs font-black uppercase text-white group-hover:text-[#6367FF]">4. Mega Bundler</span>
          </div>
          <p className="text-[11px] text-[#8595FF] mt-1 font-medium">Spatio-temporal joint blocks</p>
        </a>
      </div>

      {/* 3. Section: Role Personas Playground */}
      <section id="roles-section" className="p-5 sm:p-6 rounded-2xl bg-[#022642] border-2 border-black shadow-[5px_5px_0_#000000] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck size={24} weight="duotone" className="text-[#00FFD2]" />
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Role-Based Access Control (RBAC) & Active Personas
              </h2>
            </div>
            <p className="text-xs text-[#8595FF] font-medium mt-1">
              Test the platform from different organizational viewpoints by clicking any persona card below.
            </p>
          </div>
          <span className="text-xs font-mono font-black text-white bg-[#000D18] px-3 py-1.5 rounded-lg border border-black shadow-[1px_1px_0_#000000] shrink-0">
            Active: <strong className="text-[#00FFD2]">{user?.name}</strong> ({user?.role === "CENTRAL_ADMIN" ? "Central Admin" : user?.departmentName})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
                    <p className="font-semibold text-white">Core Capabilities:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-[10px] text-[#CABFFF]">
                      {isCentral ? (
                        <>
                          <li>National OCC Command across all 10 corridors</li>
                          <li>Issue statutory Form T/806 Line Block Sanctions</li>
                          <li>Run AI Spatio-Temporal Mega Block Bundler</li>
                          <li>Emergency Line Block Replanning & Simulator</li>
                        </>
                      ) : (
                        <>
                          <li>Submit & track department service requests</li>
                          <li>Manage heavy machinery (tampers, tower wagons)</li>
                          <li>Log milestone progress (25% → 50% → 75% → 100%)</li>
                          <li>Review safety compliance & track fitness</li>
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
                      ? "bg-[#00FFD2] text-black shadow-none cursor-default"
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
      <section id="map-section" className="p-5 sm:p-6 rounded-2xl bg-[#022642] border-2 border-black shadow-[5px_5px_0_#000000] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#000D18] border-2 border-black text-[#FFFF00] shrink-0">
              <MapTrifold size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Interactive Corridor GIS Map & Multi-Corridor Telemetry
              </h2>
              <p className="text-xs text-[#8595FF] font-medium">
                Real-time spatial visualization across 10 high-density Indian Railways trunk routes.
              </p>
            </div>
          </div>

          <Link
            href="/central/map"
            className="btn-tactile px-3.5 py-2 rounded-xl bg-[#FFFF00] text-black font-black text-xs flex items-center space-x-2 border-2 border-black shadow-[2px_2px_0_#000000] shrink-0 self-start sm:self-auto"
          >
            <span>Launch Full Map Console</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#000D18] border-2 border-black shadow-[3px_3px_0_#000000] space-y-2">
            <div className="flex items-center space-x-2 text-[#00FFD2]">
              <Train size={20} weight="duotone" />
              <h3 className="text-xs font-black uppercase text-white">10 National Corridors</h3>
            </div>
            <p className="text-xs text-[#CABFFF] leading-relaxed">
              Covers Bhopal-Itarsi (BPL-ET), Delhi-Mumbai (NDLS-MMCT), Delhi-Howrah (NDLS-HWH), Western & Eastern Dedicated Freight Corridors (WDFC/EDFC), Konkan Railway, and Southern Golden Quad routes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#000D18] border-2 border-black shadow-[3px_3px_0_#000000] space-y-2">
            <div className="flex items-center space-x-2 text-[#FB2077]">
              <DeviceMobile size={20} weight="duotone" />
              <h3 className="text-xs font-black uppercase text-white">Mobile Dedicated Tab Switcher</h3>
            </div>
            <p className="text-xs text-[#CABFFF] leading-relaxed">
              On mobile viewports, the map and the 320px station list split into dedicated tabs: <strong>[🗺️ Interactive Map]</strong> for full-screen pan/zoom and <strong>[📋 Stations & Details]</strong> with auto-focus upon station selection.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#000D18] border-2 border-black shadow-[3px_3px_0_#000000] space-y-2">
            <div className="flex items-center space-x-2 text-[#6367FF]">
              <Pulse size={20} weight="duotone" />
              <h3 className="text-xs font-black uppercase text-white">2D Linear Track Schematic</h3>
            </div>
            <p className="text-xs text-[#CABFFF] leading-relaxed">
              Underneath the Leaflet map is a horizontal linear schematic showing exact kilometer posts, track relay zones, OHE mast adjustments, and station platforms with touch-scrollable navigation.
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
                <p className="text-[9px] text-[#8595FF]">{c.totalLengthKm} KM • {c.zone.split("(")[0]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Section: The 9-Stage Request Lifecycle */}
      <section id="workflow-section" className="p-5 sm:p-6 rounded-2xl bg-[#022642] border-2 border-black shadow-[5px_5px_0_#000000] space-y-4">
        <div className="border-b-2 border-black pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#000D18] border-2 border-black text-[#FB2077] shrink-0">
              <CheckSquare size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                9-Stage Inter-Departmental Request Lifecycle
              </h2>
              <p className="text-xs text-[#8595FF] font-medium">
                Every track block, OHE power cutoff, and signal interlock follows a statutory Indian Railways approval pipeline.
              </p>
            </div>
          </div>
        </div>

        {/* 9 Stage Timeline Flow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2">
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
                <p className="text-[10px] text-[#8595FF] leading-snug mt-0.5">{s.desc}</p>
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
      <section id="bundler-section" className="p-5 sm:p-6 rounded-2xl bg-[#022642] border-2 border-black shadow-[5px_5px_0_#000000] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#000D18] border-2 border-black text-[#6367FF] shrink-0">
              <Package size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                AI Task Bundler & Mega Block Windows
              </h2>
              <p className="text-xs text-[#8595FF] font-medium">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <section className="p-5 sm:p-6 rounded-2xl bg-[#022642] border-2 border-black shadow-[5px_5px_0_#000000] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#000D18] border-2 border-black text-[#FB2077] shrink-0">
              <FileText size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Statutory Form T/806 & G&SR Sanctions Center
              </h2>
              <p className="text-xs text-[#8595FF] font-medium">
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
      <section className="p-5 sm:p-6 rounded-2xl bg-[#022642] border-2 border-black shadow-[5px_5px_0_#000000] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <PlayCircle size={24} weight="fill" className="text-[#00FFD2]" />
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                16-Step End-to-End Walkthrough Reference
              </h2>
            </div>
            <p className="text-xs text-[#8595FF] font-medium mt-1">
              Follow along step-by-step or jump directly to any stage of the live walkthrough.
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {DEMO_STEPS.map((s, idx) => (
            <div
              key={s.stepNumber}
              className="p-3.5 rounded-xl bg-[#000D18] border-2 border-black shadow-[2px_2px_0_#000000] flex flex-col justify-between space-y-2 hover:border-[#00FFD2] transition group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black bg-[#6367FF] text-white px-1.5 py-0.5 rounded border border-black">
                    STEP {s.stepNumber}
                  </span>
                  <span className="text-[9px] font-mono text-[#00FFD2] font-bold">
                    {s.role.split(" ")[0]}
                  </span>
                </div>
                <h4 className="text-xs font-black text-white mt-1.5 line-clamp-1">{s.title.replace(/^\d+\.\s*/, "")}</h4>
                <p className="text-[10px] text-[#CABFFF] leading-relaxed mt-1 line-clamp-2">{s.description}</p>
              </div>

              <button
                onClick={() => {
                  goToStep(idx);
                }}
                className="w-full py-1 px-2 rounded-lg bg-[#022642] hover:bg-[#00FFD2] hover:text-black text-white text-[10px] font-black font-mono transition border border-black cursor-pointer flex items-center justify-center space-x-1"
              >
                <span>Jump to Step {s.stepNumber}</span>
                <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Section: Searchable FAQs & Troubleshooting */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#022642] border-2 border-black shadow-[5px_5px_0_#000000] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#000D18] border-2 border-black text-[#00FFD2] shrink-0">
              <Question size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Frequently Asked Questions & Operations Help
              </h2>
              <p className="text-xs text-[#8595FF] font-medium">
                Instant answers to common operational questions and troubleshooting steps.
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

        {/* FAQ Accordion List */}
        <div className="space-y-2.5">
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
                  <div className="p-4 pt-2 border-t border-black/60 bg-[#011526] space-y-3">
                    <p className="text-xs text-[#CABFFF] leading-relaxed font-sans">
                      {faq.answer}
                    </p>
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
      <div className="p-6 rounded-2xl bg-[#000D18] border-2 border-black shadow-[4px_4px_0_#000000] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-white">Ready to operate Indian Railways Maintenance Command?</h3>
          <p className="text-xs text-[#8595FF] mt-0.5">Explore national OCC, simulate what-if train diversions, or submit field block requests.</p>
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
