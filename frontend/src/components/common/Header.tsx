"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRailPlan, ZONE_CORRIDOR_MAP } from "@/context/RailPlanContext";
import { useDemoTour } from "@/context/DemoTourContext";
import { 
  Train, 
  Bell, 
  Clock, 
  Lightning, 
  Stack, 
  MapPin, 
  Question, 
  ArrowCounterClockwise, 
  SignOut, 
  Broadcast,
  List,
  X,
  DeviceMobile,
  Desktop,
  BookOpen
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QuickRoleSwitcher } from "./QuickRoleSwitcher";
import { NotificationDrawer } from "./NotificationDrawer";
import { EmergencyReplanModal } from "@/components/simulation/EmergencyReplanModal";
import { useDevice } from "@/context/DeviceContext";

export const Header: React.FC = () => {
  const { user, logout, isCentralAdmin } = useAuth();
  const { 
    selectedZone, 
    setSelectedZone, 
    selectedCorridorId, 
    setSelectedCorridorId, 
    corridors,
    unreadNotificationCount,
    resetToDemoState,
    serverSyncConnected,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    toggleSidebar
  } = useRailPlan();
  const { isMobile, deviceType, modeOverride, toggleDeviceMode } = useDevice();
  const { openTour } = useDemoTour();
  const router = useRouter();

  const [currentTime, setCurrentTime] = useState<string>("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  // Available Corridors filtered by the selected Zone
  const availableCorridors = useMemo(() => {
    const allowed = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    return corridors.filter((c) => allowed.includes(c.id));
  }, [corridors, selectedZone]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
          " | " +
          now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }) +
          " IST"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

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

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#011526] border-b-2 border-black shadow-[0_4px_0_#000000] select-none">
        {/* Official Indian National Tricolor Ribbon Accent Top Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF671F] via-[#FFFFFF] to-[#046A38]" />

        <div className="px-2 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-1.5 sm:gap-2.5 w-full">
          {/* Left: Always-Visible Hamburger Menu Button + Official Indian Railways Emblem & Brand */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0 min-w-0">
            {/* Unified Hamburger Menu Button (Accessible across Mobile, Tablet & Desktop) */}
            <button
              onClick={toggleSidebar}
              aria-label="Toggle Navigation Menu"
              className="p-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-[#022642] hover:bg-[#033358] border-2 border-black text-[#00FFD2] shadow-[2px_2px_0_#000000] active:translate-y-0.5 active:shadow-none transition shrink-0 cursor-pointer flex items-center gap-1.5"
              title={isMobileMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu (Hamburger)"}
            >
              {isMobileMenuOpen ? (
                <X size={19} weight="bold" className="text-[#FB2077]" />
              ) : (
                <List size={19} weight="bold" className="text-[#00FFD2]" />
              )}
              <span className="hidden sm:inline font-mono text-[11px] font-black uppercase text-white tracking-wider">
                {isMobileMenuOpen ? "Close" : "Menu"}
              </span>
            </button>

            {/* Official Brand Logo */}
            <Link 
              href={isCentralAdmin ? "/central" : "/department/dashboard"} 
              className="flex items-center space-x-1.5 sm:space-x-2.5 group shrink-0"
              title="RailPlan AI - National Command OCC"
            >
              {/* Crest Badge */}
              <div className="p-1 sm:p-1.5 rounded-xl bg-[#000D18] border-2 border-black shadow-[2px_2px_0_#000000] shrink-0 transition-transform group-hover:scale-105 text-[#00FFD2]">
                <Train size={18} weight="duotone" className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" />
              </div>

              <div className="flex flex-col justify-center min-w-0">
                <div className="flex items-center space-x-1 leading-none">
                  <span className="font-black text-xs sm:text-sm lg:text-base text-white tracking-tight font-sans whitespace-nowrap leading-tight">
                    RAILPLAN AI
                  </span>
                  <span className="font-mono text-[8px] sm:text-[9px] px-1 py-0.2 rounded bg-[#00FFD2] text-black font-black border border-black shadow-[1px_1px_0_#000000] shrink-0">
                    IR-RAMS
                  </span>
                </div>
                <p className="text-[8px] sm:text-[9px] text-[#CABFFF] font-bold tracking-wide hidden xs:flex items-center space-x-1 mt-0.5 leading-tight whitespace-nowrap">
                  <span className="text-[#FFFF00] font-black">भारतीय रेल</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">Ministry of Railways</span>
                </p>
              </div>
            </Link>

            {/* Zone & Corridor Selectors (Only on wide screens to prevent header blowout) */}
            <div className="hidden 2xl:flex items-center space-x-2 pl-3 border-l-2 border-black shrink-0">
              <div className={`flex items-center space-x-1.5 rounded-lg px-2 py-1 text-xs border-2 border-black shadow-[1px_1px_0_#000000] ${
                !selectedZone.startsWith("All")
                  ? "bg-[#6367FF] text-white"
                  : "bg-[#022642] text-[#CABFFF]"
              }`}>
                <Stack size={14} weight="duotone" className="text-[#00FFD2] shrink-0" />
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  aria-label="Filter Railway Zone"
                  className="bg-transparent text-white text-xs focus:outline-none cursor-pointer font-bold max-w-[130px] truncate"
                >
                  {zones.map((z) => (
                    <option key={z} value={z} className="bg-[#022642] text-white">
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`flex items-center space-x-1.5 rounded-lg px-2 py-1 text-xs border-2 border-black shadow-[1px_1px_0_#000000] ${
                selectedCorridorId !== "ALL" 
                  ? "bg-[#6367FF] text-white"
                  : "bg-[#022642] text-[#CABFFF]"
              }`}>
                <MapPin size={14} weight="duotone" className="shrink-0 text-[#00FFD2]" />
                <select
                  value={selectedCorridorId}
                  onChange={(e) => setSelectedCorridorId(e.target.value)}
                  aria-label="Filter Railway Corridor"
                  className="bg-transparent text-white text-xs focus:outline-none cursor-pointer font-mono font-bold max-w-[120px] truncate"
                >
                  <option value="ALL" className="bg-[#022642] text-white">
                    {selectedZone.startsWith("All") ? `All Corridors (${corridors.length})` : `Corridors (${availableCorridors.length})`}
                  </option>
                  {availableCorridors.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#022642] text-white">
                      {c.id} ({c.totalLengthKm} KM)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right: Actions, Device Toggle, Role, Notifications, Logout */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0 justify-end min-w-0">
            {/* Live Multi-Device Sync Indicator (Icon on small screens, label on large) */}
            <div
              className={`flex items-center space-x-1 p-1.5 sm:px-2 sm:py-1 rounded-lg border-2 border-black shadow-[1px_1px_0_#000000] text-[10px] font-mono font-black shrink-0 ${
                serverSyncConnected
                  ? "bg-[#00FFD2] text-black"
                  : "bg-[#FF1818] text-white"
              }`}
              title="Real-Time Central Server State Synchronization"
            >
              <Broadcast size={14} weight="duotone" className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">{serverSyncConnected ? "Live Sync" : "Syncing"}</span>
            </div>

            {/* Device Mode Switcher (Icon on mobile, text on sm+) */}
            <button
              onClick={toggleDeviceMode}
              className={`flex items-center space-x-1 p-1.5 sm:px-2 sm:py-1 rounded-lg border-2 border-black shadow-[1px_1px_0_#000000] text-[10px] sm:text-[11px] font-mono font-black transition cursor-pointer shrink-0 ${
                isMobile
                  ? "bg-[#FFFF00] text-black hover:bg-[#FFE600]"
                  : "bg-[#6367FF] text-white hover:bg-[#5256FF]"
              }`}
              title={`Mode: ${modeOverride.toUpperCase()} (Click to toggle Mobile/Desktop UI)`}
            >
              {isMobile ? (
                <DeviceMobile size={14} weight="bold" className="text-black shrink-0" />
              ) : (
                <Desktop size={14} weight="bold" className="text-white shrink-0" />
              )}
              <span className="hidden sm:inline">{isMobile ? "Mobile UI" : "Desktop UI"}</span>
            </button>

            {/* Quick Role Switcher */}
            <QuickRoleSwitcher />

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              aria-label="View Notifications"
              className="relative p-1.5 sm:p-2 rounded-xl bg-[#022642] hover:bg-[#033358] border-2 border-black shadow-[1px_1px_0_#000000] text-white transition active:translate-y-0.5 active:shadow-none shrink-0 cursor-pointer"
              title="Notifications"
            >
              <Bell size={16} weight="duotone" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FB2077] text-white font-black text-[9px] flex items-center justify-center border border-black shadow-[1px_1px_0_#000000]">
                  {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                </span>
              )}
            </button>

            {/* System Guide Webpage */}
            <Link
              href="/guide"
              aria-label="System Operations Guide & Manual"
              className="flex items-center space-x-1 p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-[#022642] hover:bg-[#033358] border-2 border-black shadow-[1px_1px_0_#000000] text-[#00FFD2] transition active:translate-y-0.5 active:shadow-none cursor-pointer shrink-0"
              title="System Operations Guide & Manual"
            >
              <BookOpen size={16} weight="duotone" className="shrink-0 text-[#00FFD2]" />
              <span className="text-[10px] font-mono font-black hidden md:inline">Guide</span>
            </Link>

            {/* Reset Demo Data */}
            <button
              onClick={resetToDemoState}
              aria-label="Reset System Data to Default"
              className="hidden md:flex p-1.5 sm:p-2 rounded-xl bg-[#022642] hover:bg-[#033358] border-2 border-black shadow-[1px_1px_0_#000000] text-white transition active:translate-y-0.5 active:shadow-none cursor-pointer shrink-0"
              title="Reset System Simulation State"
            >
              <ArrowCounterClockwise size={16} weight="duotone" />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              aria-label="Sign Out"
              className="p-1.5 sm:p-2 rounded-xl bg-[#FF1818] hover:brightness-110 border-2 border-black shadow-[1px_1px_0_#000000] text-white transition active:translate-y-0.5 active:shadow-none shrink-0 cursor-pointer"
              title="Sign Out"
            >
              <SignOut size={16} weight="duotone" />
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      {/* Emergency Simulation Modal */}
      <EmergencyReplanModal isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} />
    </>
  );
};
