"use client";

import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useRailPlan } from "@/context/RailPlanContext";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSidebarOpen } = useRailPlan();

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full bg-[#050814]">
      {/* 1. 100% Fixed Always-Visible Top OCC Control Header (70px height) */}
      <Header />

      {/* 2. Main Layout Area with Fixed Header Offset & Responsive Sidebar Padding */}
      <div
        className={`flex flex-1 min-w-0 w-full max-w-full pt-[70px] transition-all duration-200 ${
          isSidebarOpen ? "lg:pl-72" : "lg:pl-0"
        }`}
      >
        {/* Fixed Desktop Sidebar & Sliding Mobile Drawer */}
        <Sidebar />

        {/* Dynamic Content Area that adjusts automatically when sidebar toggles */}
        <main className="flex-1 p-2.5 sm:p-4 lg:p-6 pb-24 lg:pb-8 max-w-7xl mx-auto w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
