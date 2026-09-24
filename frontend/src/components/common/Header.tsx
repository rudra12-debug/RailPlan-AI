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
  Desktop
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
    setIsMobileMenuOpen
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
      <header className="sticky top-0 z-40 w-full bg-[#011526] border-b-2 border-black shadow-[0_4px_0_#000000] select-none">
        {/* Official Indian National Tricolor Ribbon Accent Top Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF671F] via-[#FFFFFF] to-[#046A38]" />

        <div className="px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Hamburger (Mobile) + Official Indian Railways Emblem & Brand */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Mobile Navigation Drawer Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Navigation Drawer"
              className="lg:hidden p-2 rounded-xl bg-[#022642] hover:bg-[#033358] border-2 border-black text-[#00FFD2] shadow-[2px_2px_0_#000000] active:translate-y-0.5 active:shadow-none transition shrink-0 cursor-pointer"
            >
              {isMobileMenuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
            </button>

            <Link 
              href={isCentralAdmin ? "/central" : "/department/dashboard"} 
              className="flex items-center space-x-2 sm:space-x-3 group shrink-0"
            >
              {/* Official Crest Badge */}
              <div className="p-1.5 sm:p-2 rounded-xl bg-[#000D18] border-2 border-black shadow-[2px_2px_0_#000000] shrink-0 transition-transform group-hover:scale-105 text-[#00FFD2]">
                <Train size={20} weight="duotone" className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex items-center space-x-1.5 leading-none">
                  <span className="font-black text-sm sm:text-base lg:text-lg text-white tracking-tight font-sans whitespace-nowrap leading-tight">
                    RAILPLAN AI
                  </span>
                  <span className="font-mono text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-[#00FFD2] text-black font-black border border-black shadow-[1px_1px_0_#000000] shrink-0">
                    IR-RAMS
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-[#CABFFF] font-bold tracking-wide flex items-center space-x-1 mt-0.5 leading-tight whitespace-nowrap">
                  <span className="text-[#FFFF00] font-black">भारतीय रेल</span>
                  <span className="hidden xs:inline">•</span>
                  <span className="hidden xs:inline">Ministry of Railways</span>
                </p>
              </div>
            </Link>

            {/* Zone & Corridor Selectors */}
            <div className="hidden md:flex items-center space-x-2 pl-3 border-l-2 border-black shrink-0">
              <div className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs border-2 border-black shadow-[2px_2px_0_#000000] ${
                !selectedZone.startsWith("All")
                  ? "bg-[#6367FF] text-white"
                  : "bg-[#022642] text-[#CABFFF]"
              }`}>
                <Stack size={16} weight="duotone" className="text-[#00FFD2] shrink-0" />
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  aria-label="Filter Railway Zone"
                  className="bg-transparent text-white text-xs focus:outline-none cursor-pointer font-bold max-w-[150px] lg:max-w-none truncate"
                >
                  {zones.map((z) => (
                    <option key={z} value={z} className="bg-[#022642] text-white">
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs border-2 border-black shadow-[2px_2px_0_#000000] ${
                selectedCorridorId !== "ALL" 
                  ? "bg-[#6367FF] text-white"
                  : "bg-[#022642] text-[#CABFFF]"
              }`}>
                <MapPin size={16} weight="duotone" className="shrink-0 text-[#00FFD2]" />
                <select
                  value={selectedCorridorId}
                  onChange={(e) => setSelectedCorridorId(e.target.value)}
                  aria-label="Filter Railway Corridor"
                  className="bg-transparent text-white text-xs focus:outline-none cursor-pointer font-mono font-bold max-w-[130px] lg:max-w-none truncate"
                >
                  <option value="ALL" className="bg-[#022642] text-white">
                    {selectedZone.startsWith("All") ? `All Corridors (${corridors.length})` : `All ${selectedZone.split("(")[0].trim()} (${availableCorridors.length})`}
                  </option>
                  {availableCorridors.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#022642] text-white">
                      {c.id} - {c.name.split("(")[0]} ({c.totalLengthKm} KM)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right: Actions, Live Clock, Notifications, User */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Live Multi-Device Sync Indicator */}
            <div
              className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0_#000000] text-[11px] font-mono font-black ${
                serverSyncConnected
                  ? "bg-[#00FFD2] text-black"
                  : "bg-[#FF1818] text-white"
              }`}
              title="Real-Time Central Server State Synchronization"
            >
              <Broadcast size={15} weight="duotone" className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{serverSyncConnected ? "Multi-Device Live Sync" : "Sync Reconnecting"}</span>
            </div>

            {/* Device Mode Switcher (Detects device type & allows instant 1-click toggle) */}
            <button
              onClick={toggleDeviceMode}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0_#000000] text-[10px] sm:text-[11px] font-mono font-black transition cursor-pointer ${
                isMobile
                  ? "bg-[#FFFF00] text-black hover:bg-[#FFE600]"
                  : "bg-[#6367FF] text-white hover:bg-[#5256FF]"
              }`}
              title={`Detected Device: ${deviceType.toUpperCase()} • Mode: ${modeOverride.toUpperCase()} (Click to toggle Mobile/Desktop UI)`}
            >
              {isMobile ? (
                <DeviceMobile size={15} weight="bold" className="text-black shrink-0" />
              ) : (
                <Desktop size={15} weight="bold" className="text-white shrink-0" />
              )}
              <span>{isMobile ? "Mobile UI" : "Desktop UI"}</span>
              {modeOverride !== "auto" && (
                <span className="text-[8px] px-1 py-0.2 bg-black text-[#00FFD2] rounded border border-black font-mono">
                  MANUAL
                </span>
              )}
            </button>

            {/* Live IST Clock (Sunken Black LED Readout) */}
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#000D18] border border-[#011526] text-[#00FFD2] text-xs font-mono font-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
              <Clock size={15} weight="duotone" className="text-[#00FFD2] shrink-0" />
              <span>{currentTime || "Live Synchronized"}</span>
            </div>

            {/* Emergency Replan Button */}
            {isCentralAdmin && (
              <button
                onClick={() => setIsEmergencyOpen(true)}
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#FB2077] hover:brightness-110 border-2 border-black text-white text-xs font-black shadow-[2px_2px_0_#000000] active:translate-y-0.5 active:shadow-none transition"
                title="Trigger Emergency Line Block Replanning"
              >
                <Lightning size={15} weight="fill" className="text-white" />
                <span>Emergency OCC</span>
              </button>
            )}

            {/* Quick Role Switcher */}
            <QuickRoleSwitcher />

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              aria-label="View Notifications"
              className="relative p-2 rounded-xl bg-[#022642] hover:bg-[#033358] border-2 border-black shadow-[2px_2px_0_#000000] text-white transition active:translate-y-0.5 active:shadow-none"
            >
              <Bell size={18} weight="duotone" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FB2077] text-white font-black text-[10px] flex items-center justify-center border border-black shadow-[1px_1px_0_#000000]">
                  {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Interactive Tour Guide */}
            <button
              onClick={openTour}
              aria-label="Start System Guide Tour"
              className="hidden sm:flex p-2 rounded-xl bg-[#022642] hover:bg-[#033358] border-2 border-black shadow-[2px_2px_0_#000000] text-white transition active:translate-y-0.5 active:shadow-none cursor-pointer"
              title="System Walkthrough Guide"
            >
              <Question size={18} weight="duotone" />
            </button>

            {/* Reset Demo Data */}
            <button
              onClick={resetToDemoState}
              aria-label="Reset System Data to Default"
              className="hidden sm:flex p-2 rounded-xl bg-[#022642] hover:bg-[#033358] border-2 border-black shadow-[2px_2px_0_#000000] text-white transition active:translate-y-0.5 active:shadow-none cursor-pointer"
              title="Reset System Simulation State"
            >
              <ArrowCounterClockwise size={18} weight="duotone" />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              aria-label="Sign Out"
              className="p-2 rounded-xl bg-[#FF1818] hover:brightness-110 border-2 border-black shadow-[2px_2px_0_#000000] text-white transition active:translate-y-0.5 active:shadow-none"
              title="Sign Out"
            >
              <SignOut size={18} weight="duotone" />
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
