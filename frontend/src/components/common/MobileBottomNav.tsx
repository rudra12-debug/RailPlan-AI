"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDevice } from "@/context/DeviceContext";
import { useRailPlan } from "@/context/RailPlanContext";
import {
  Broadcast,
  Package,
  ShieldWarning,
  FileText,
  List,
  Robot
} from "@phosphor-icons/react";

interface MobileBottomNavProps {
  activeTab?: "OCC" | "BUNDLER" | "EMERGENCY" | "SANCTIONS";
  onTabChange?: (tab: "OCC" | "BUNDLER" | "EMERGENCY" | "SANCTIONS") => void;
  onOpenCopilot?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenCopilot,
}) => {
  const { isMobile } = useDevice();
  const { setIsMobileMenuOpen, activeHomeTab, setActiveHomeTab } = useRailPlan();
  const pathname = usePathname();
  const router = useRouter();

  // Show only on mobile devices (or in mobile mode preview)
  if (!isMobile) return null;

  const isHomePage = pathname === "/";
  const effectiveTab = activeTab || activeHomeTab;

  const handleNavClick = (tabKey: "OCC" | "BUNDLER" | "EMERGENCY" | "SANCTIONS") => {
    setActiveHomeTab(tabKey);
    if (onTabChange) {
      onTabChange(tabKey);
    }
    if (pathname !== "/") {
      router.push("/");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems = [
    {
      id: "OCC" as const,
      label: "OCC Map",
      icon: Broadcast,
      isActive: isHomePage ? effectiveTab === "OCC" : pathname.includes("/map") || pathname === "/central",
    },
    {
      id: "BUNDLER" as const,
      label: "Bundler",
      icon: Package,
      isActive: isHomePage ? effectiveTab === "BUNDLER" : pathname.includes("/bundling"),
    },
    {
      id: "EMERGENCY" as const,
      label: "Emergency",
      icon: ShieldWarning,
      isActive: isHomePage ? effectiveTab === "EMERGENCY" : pathname.includes("/emergency"),
    },
    {
      id: "SANCTIONS" as const,
      label: "Form T/806",
      icon: FileText,
      isActive: isHomePage ? effectiveTab === "SANCTIONS" : pathname.includes("/sanctions"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#000D18] border-t-2 border-black shadow-[0_-4px_0_#000000] px-2 py-1.5 flex items-center justify-around select-none safe-area-bottom"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition min-w-[56px] border ${
              item.isActive
                ? "bg-[#022642] text-[#00FFD2] border-black shadow-[0_2px_0_#000000] translate-y-[-2px]"
                : "text-[#CABFFF] border-transparent hover:text-white"
            }`}
          >
            <Icon size={20} weight={item.isActive ? "fill" : "duotone"} />
            <span className={`text-[10px] font-bold font-sans mt-0.5 tracking-tight ${item.isActive ? "text-[#00FFD2]" : "text-[#8595FF]"}`}>
              {item.label}
            </span>
          </button>
        );
      })}

      {/* AI Copilot Quick Trigger */}
      {onOpenCopilot && (
        <button
          onClick={onOpenCopilot}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[#CABFFF] hover:text-white transition min-w-[56px] border border-transparent"
        >
          <div className="relative">
            <Robot size={20} weight="duotone" className="text-[#6367FF]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#00FFD2] rounded-full border border-black animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-[#8595FF] mt-0.5 tracking-tight">AI Copilot</span>
        </button>
      )}

      {/* Full Menu Drawer Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[#CABFFF] hover:text-white transition min-w-[56px] border border-transparent"
      >
        <List size={20} weight="bold" className="text-[#FFFF00]" />
        <span className="text-[10px] font-bold text-[#CABFFF] mt-0.5 tracking-tight">All Menu</span>
      </button>
    </nav>
  );
};
