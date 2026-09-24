"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRailPlan } from "@/context/RailPlanContext";
import {
  SquaresFour,
  MapTrifold,
  CheckSquare,
  Calendar,
  Stack,
  Sliders,
  Lightning,
  Buildings,
  Cpu,
  CurrencyInr,
  Sparkle,
  FileText,
  ClockCounterClockwise,
  PlusCircle,
  Clock,
  Wrench,
  Users,
  ShieldCheck,
  Package,
  Pulse,
  Icon,
  Train,
  X,
  Question,
  ArrowCounterClockwise,
  BookOpen
} from "@phosphor-icons/react";
import { useDemoTour } from "@/context/DemoTourContext";
import { ZONE_CORRIDOR_MAP } from "@/context/RailPlanContext";

interface NavItem {
  label: string;
  href: string;
  icon: Icon;
  badge?: number | string;
  badgeColor?: string;
  isNew?: boolean;
  isEmergency?: boolean;
  isHighlight?: boolean;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, isCentralAdmin } = useAuth();
  const { 
    requests, 
    bundles, 
    isMobileMenuOpen, 
    setIsMobileMenuOpen,
    selectedZone,
    setSelectedZone,
    selectedCorridorId,
    setSelectedCorridorId,
    corridors,
    resetToDemoState
  } = useRailPlan();
  const { openTour } = useDemoTour();

  const pendingApprovalsCount = requests.filter(
    (r) => r.status === "UNDER_REVIEW" || r.status === "SUBMITTED"
  ).length;

  const centralNavItems: { category: string; items: NavItem[] }[] = [
    {
      category: "Command & Control",
      items: [
        { label: "National Command OCC", href: "/central", icon: SquaresFour },
        { label: "Live Corridor Map", href: "/central/map", icon: MapTrifold },
        {
          label: "Approval Center",
          href: "/central/approvals",
          icon: CheckSquare,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          badgeColor: "bg-[#FFFF00] text-black font-black border border-black shadow-[1px_1px_0_#000000]",
        },
        {
          label: "Task Bundler & Mega Block",
          href: "/central/bundling",
          icon: Package,
          badge: bundles.length > 0 ? `${bundles.length} Blocks` : undefined,
          badgeColor: "bg-[#00FFD2] text-black font-black border border-black shadow-[1px_1px_0_#000000]",
          isNew: true,
        },
        {
          label: "Official Sanctions (Form T/806)",
          href: "/central/sanctions",
          icon: FileText,
          badge: "G&SR",
          badgeColor: "bg-[#FB2077] text-white font-black border border-black shadow-[1px_1px_0_#000000]",
          isHighlight: true,
        },
      ]
    },
    {
      category: "Planning & Simulations",
      items: [
        { label: "Block Schedule & Planning", href: "/central/planning", icon: Calendar },
        { label: "Digital Twin & Telemetry", href: "/central/digital-twin", icon: Stack },
        { label: "What-If Scenario Simulator", href: "/central/what-if", icon: Sliders },
        { label: "Emergency Replanning Hub", href: "/central/emergency", icon: Lightning, isEmergency: true },
      ]
    },
    {
      category: "Resources & Audit",
      items: [
        { label: "Directorates Matrix", href: "/central/departments", icon: Buildings },
        { label: "Heavy Equipment Fleet", href: "/central/resources", icon: Cpu },
        { label: "Budget & Financial Grants", href: "/central/costs", icon: CurrencyInr },
        { label: "Intelligence & Risk Hub", href: "/central/ai-insights", icon: Sparkle },
        { label: "Reports & Gazette Audit", href: "/central/reports", icon: FileText },
        { label: "Station Inspection Logs", href: "/central/audit", icon: ClockCounterClockwise },
        {
          label: "System Guide & Manual",
          href: "/guide",
          icon: BookOpen,
          badge: "DOCS",
          badgeColor: "bg-[#00FFD2] text-black font-black border border-black shadow-[1px_1px_0_#000000]",
        },
      ]
    }
  ];

  const departmentNavItems: { category: string; items: NavItem[] }[] = [
    {
      category: "Department Operations",
      items: [
        { label: "Department Dashboard", href: "/department/dashboard", icon: SquaresFour },
        { label: "Scheduled Maintenance", href: "/department/tasks", icon: Calendar },
        {
          label: "Inter-Dept Service Requests",
          href: "/department/requests",
          icon: FileText,
        },
        { label: "Submit New Maintenance", href: "/department/create-request", icon: PlusCircle },
      ]
    },
    {
      category: "Asset Health & Telemetry",
      items: [
        { label: "Field Machinery & Crew", href: "/department/resources", icon: Wrench },
        { label: "IoT Sensor Monitoring", href: "/department/telemetry", icon: Pulse },
        { label: "Workforce & Gang Roster", href: "/department/workforce", icon: Users },
        { label: "Department Profile & SLA", href: "/department/profile", icon: Buildings },
        {
          label: "System Guide & Manual",
          href: "/guide",
          icon: BookOpen,
          badge: "DOCS",
          badgeColor: "bg-[#00FFD2] text-black font-black border border-black shadow-[1px_1px_0_#000000]",
        },
      ]
    }
  ];

  const sections = isCentralAdmin ? centralNavItems : departmentNavItems;

  const zones = [
    "All Zones (National OCC)",
    "West Central Railway (WCR - Bhopal)",
    "Northern Railway (NR - Delhi)",
    "Western Railway (WR - Mumbai/Gujarat)",
    "Central Railway (CR - CSMT/Pune)",
    "Eastern Railway (ER - Howrah)",
    "Southern & SWR (SR/SWR - Chennai/Bengaluru)",
    "DFCCIL (Dedicated Freight Corridors)",
    "Konkan Railway (KRCL)",
  ];

  const availableCorridors = React.useMemo(() => {
    const allowed = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    return corridors.filter((c) => allowed.includes(c.id));
  }, [corridors, selectedZone]);

  const renderContent = (onLinkClick?: () => void) => (
    <>
      {/* Officer ID Banner */}
      <div className="p-4 border-b-2 border-black bg-[#022642] shrink-0">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2 border-black shadow-[2px_2px_0_#000000] shrink-0 ${
              isCentralAdmin
                ? "bg-[#6367FF] text-white"
                : "bg-[#00FFD2] text-black"
            }`}
          >
            {isCentralAdmin ? (
              <ShieldCheck size={22} weight="duotone" />
            ) : (
              <span className="font-mono">{user?.departmentId || "DEPT"}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black text-white truncate">{user?.name}</h4>
            <p className="text-[10px] text-[#CABFFF] truncate font-medium">
              {isCentralAdmin ? "Executive Director (Railway Board)" : user?.designation || user?.departmentName}
            </p>
            <span className="inline-block mt-0.5 text-[9px] font-mono font-black px-2 py-0.5 rounded bg-[#000D18] text-[#00FFD2] border border-black truncate max-w-full">
              {isCentralAdmin ? "Central Authority (Railway Board)" : user?.division || "HQ New Delhi"}
            </span>
          </div>
        </div>
      </div>

      {/* Categorized Navigation Links */}
      <nav className="flex-1 p-3 space-y-4">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h5 className="px-3 text-[10px] font-black uppercase tracking-wider text-[#8595FF] font-sans flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6367FF]" />
              <span>{section.category}</span>
            </h5>

            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onLinkClick}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all duration-100 group border-2 ${
                      isActive
                        ? "bg-[#6367FF] text-white border-black shadow-[2px_2px_0_#000000] translate-y-0.5"
                        : item.isEmergency
                        ? "bg-[#022642] text-[#FB2077] border-black hover:bg-[#FB2077] hover:text-white shadow-[1px_1px_0_#000000]"
                        : "bg-transparent text-[#CABFFF] border-transparent hover:bg-[#022642] hover:text-white hover:border-black"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <IconComponent
                        size={18}
                        weight={isActive ? "fill" : "duotone"}
                        className={`shrink-0 ${
                          isActive
                            ? "text-white"
                            : item.isEmergency
                            ? "text-[#FB2077] group-hover:text-white"
                            : "text-[#00FFD2]"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-black rounded shrink-0 ml-1.5 ${
                          item.badgeColor || "bg-[#000D18] text-[#CABFFF] border border-black"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Authority Seal */}
      <div className="p-3 border-t-2 border-black bg-[#000D18] text-center shrink-0">
        <p className="text-[10px] text-[#00FFD2] font-mono font-black">
          CRIS / RailTel National Mesh
        </p>
        <p className="text-[9px] text-[#8595FF] font-mono">
          G&SR Standard 15.06 Compliant
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Solid Permanent Sidebar (Visible only on lg and above) */}
      <aside className="hidden lg:flex w-64 bg-[#011526] border-r-2 border-black flex-col h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 overflow-y-auto">
        {renderContent()}
      </aside>

      {/* 2. Mobile Responsive Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 3. Mobile Responsive Drawer Panel (Slides out on mobile/tablet) */}
      <aside
        className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-[#011526] border-r-2 border-black flex flex-col h-full z-50 select-none overflow-y-auto shadow-[6px_0_24px_rgba(0,0,0,0.9)] lg:hidden transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Drawer Top Bar with Close Button */}
        <div className="p-4 border-b-2 border-black bg-[#000D18] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-[#022642] border border-black text-[#00FFD2]">
              <Train size={18} weight="duotone" />
            </div>
            <div>
              <span className="font-black text-sm text-white tracking-tight">RAILPLAN AI</span>
              <span className="ml-1.5 text-[9px] font-mono font-bold bg-[#00FFD2] text-black px-1.5 py-0.5 rounded border border-black">
                IR-RAMS
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close Navigation Drawer"
            className="p-1.5 rounded-lg bg-[#FB2077] text-white border border-black shadow-[1px_1px_0_#000000] active:translate-y-0.5 cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Mobile Corridor & Zone Switcher */}
        <div className="p-3 bg-[#022642] border-b-2 border-black space-y-2 shrink-0">
          <label className="text-[10px] font-black uppercase text-[#8595FF] tracking-wider block">
            Railway Zone
          </label>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="w-full bg-[#000D18] text-white text-xs font-bold rounded-lg p-2 border border-black focus:outline-none focus:ring-1 focus:ring-[#00FFD2] cursor-pointer"
          >
            {zones.map((z) => (
              <option key={z} value={z} className="bg-[#000D18] text-white">
                {z}
              </option>
            ))}
          </select>

          <label className="text-[10px] font-black uppercase text-[#8595FF] tracking-wider block pt-1">
            Active Corridor
          </label>
          <select
            value={selectedCorridorId}
            onChange={(e) => setSelectedCorridorId(e.target.value)}
            className="w-full bg-[#000D18] text-white text-xs font-mono font-bold rounded-lg p-2 border border-black focus:outline-none focus:ring-1 focus:ring-[#00FFD2] cursor-pointer"
          >
            <option value="ALL" className="bg-[#000D18] text-white">
              {selectedZone.startsWith("All") ? `All Corridors (${corridors.length})` : `All ${selectedZone.split("(")[0].trim()} (${availableCorridors.length})`}
            </option>
            {availableCorridors.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#000D18] text-white">
                {c.id} - {c.name.split("(")[0]} ({c.totalLengthKm} KM)
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Quick Action Buttons: Guide Webpage & Reset */}
        <div className="p-3 bg-[#011526] border-b-2 border-black flex items-center gap-2 shrink-0">
          <Link
            href="/guide"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex-1 py-1.5 px-2 rounded-lg bg-[#022642] hover:bg-[#033358] border border-black text-[#00FFD2] text-[11px] font-bold flex items-center justify-center space-x-1.5 shadow-[1px_1px_0_#000000] cursor-pointer"
          >
            <BookOpen size={15} weight="duotone" />
            <span>System Guide</span>
          </Link>
          <button
            onClick={() => {
              resetToDemoState();
              setIsMobileMenuOpen(false);
            }}
            className="flex-1 py-1.5 px-2 rounded-lg bg-[#022642] hover:bg-[#033358] border border-black text-[#FFFF00] text-[11px] font-bold flex items-center justify-center space-x-1.5 shadow-[1px_1px_0_#000000] cursor-pointer"
          >
            <ArrowCounterClockwise size={15} weight="duotone" />
            <span>Reset Demo</span>
          </button>
        </div>

        {/* Navigation Content (auto-closes drawer on mobile link click) */}
        {renderContent(() => setIsMobileMenuOpen(false))}
      </aside>
    </>
  );
};
