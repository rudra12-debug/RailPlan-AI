"use client";

import React from "react";
import { LiveCorridorMap } from "@/components/map/LiveCorridorMap";

export default function CentralMapPage() {
  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#050814] via-[#0C1326] to-[#131E3D] border border-[#1A274E] flex items-center justify-between shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-[#131E3D] text-[#3DFDCE] border border-[#3DFDCE]/40 px-2 py-0.5 rounded uppercase">
              Geospatial Operations
            </span>
            <span className="text-xs text-[#B6BFFF] font-mono">National Railway Grid</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#F8FAFC] mt-1">
            Live Railway Corridor Maintenance & Speed Restriction Map
          </h1>
          <p className="text-xs text-[#B6BFFF]">
            Interactive visualization of active maintenance blocks, real-time train positions, and critical risk sectors
          </p>
        </div>
      </div>

      <LiveCorridorMap />
    </div>
  );
}
