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
  Icon
} from "@phosphor-icons/react";

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
  const { requests, bundles } = useRailPlan();

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
      ]
    }
  ];

  const sections = isCentralAdmin ? centralNavItems : departmentNavItems;

  return (
    <aside className="w-64 bg-[#011526] border-r-2 border-black flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 overflow-y-auto">
      {/* Officer ID Banner */}
      <div className="p-4 border-b-2 border-black bg-[#022642] shrink-0">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2 border-black shadow-[2px_2px_0_#000000] ${
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
            <span className="inline-block mt-0.5 text-[9px] font-mono font-black px-2 py-0.5 rounded bg-[#000D18] text-[#00FFD2] border border-black">
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
    </aside>
  );
};
