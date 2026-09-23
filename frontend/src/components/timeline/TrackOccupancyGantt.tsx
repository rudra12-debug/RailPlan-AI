"use client";

import React, { useState } from "react";
import { Clock, Train, ShieldCheck, AlertTriangle, Layers, Calendar, Filter, Sparkles, ChevronRight, MapPin } from "lucide-react";
import { useRailPlan } from "@/context/RailPlanContext";

interface ScheduleSlot {
  id: string;
  type: "PASSENGER_TRAIN" | "FREIGHT_TRAIN" | "MEGA_BLOCK" | "CAUTION_RESTRICTION";
  name: string;
  number?: string;
  track: "UP_MAIN" | "DOWN_MAIN" | "LOOP_LINE" | "DFC_FREIGHT";
  startHour: number; // 0 to 24 (float)
  endHour: number;
  status: "ON_TIME" | "REGULATED" | "SANCTIONED" | "CRITICAL";
  departments?: string[];
  speedRestriction?: string;
}

export const TrackOccupancyGantt: React.FC = () => {
  const { selectedCorridorId, corridors } = useRailPlan();
  const selectedCorridor = corridors.find((c) => c.id === selectedCorridorId) || corridors[1] || corridors[0];

  const [selectedTrack, setSelectedTrack] = useState<string>("ALL");
  const [activeSlot, setActiveSlot] = useState<ScheduleSlot | null>(null);

  const hours = Array.from({ length: 25 }, (_, i) => i); // 00:00 to 24:00

  const scheduleSlots: ScheduleSlot[] = [
    // Mega Block Window (Synchronized Night Maintenance Slot)
    {
      id: "BLK-NIGHT-01",
      type: "MEGA_BLOCK",
      name: "SANCTIONED JOINT MEGA BLOCK (P-Way + OHE + Signal)",
      track: "UP_MAIN",
      startHour: 1.5, // 01:30
      endHour: 5.5,   // 05:30
      status: "SANCTIONED",
      departments: ["ENG", "ELEC", "SNT"],
      speedRestriction: "Track Closed / 25kV Power Isolated",
    },
    {
      id: "BLK-NIGHT-02",
      type: "CAUTION_RESTRICTION",
      name: "Temporary Speed Restriction (30 km/h TSR)",
      track: "DOWN_MAIN",
      startHour: 1.0,
      endHour: 6.0,
      status: "REGULATED",
      departments: ["ENG"],
      speedRestriction: "30 km/h Caution",
    },
    // Passenger Trains along UP MAIN
    {
      id: "TRN-12951",
      type: "PASSENGER_TRAIN",
      name: "Mumbai Tejas Rajdhani",
      number: "12951",
      track: "UP_MAIN",
      startHour: 6.2,
      endHour: 7.0,
      status: "ON_TIME",
    },
    {
      id: "TRN-12009",
      type: "PASSENGER_TRAIN",
      name: "Vande Bharat Express",
      number: "12009",
      track: "UP_MAIN",
      startHour: 8.5,
      endHour: 9.3,
      status: "ON_TIME",
    },
    {
      id: "TRN-12431",
      type: "PASSENGER_TRAIN",
      name: "Trivandrum Rajdhani",
      number: "12431",
      track: "UP_MAIN",
      startHour: 12.0,
      endHour: 12.8,
      status: "ON_TIME",
    },
    {
      id: "TRN-12908",
      type: "PASSENGER_TRAIN",
      name: "Maharashtra Sampark Kranti",
      number: "12908",
      track: "UP_MAIN",
      startHour: 17.0,
      endHour: 17.8,
      status: "ON_TIME",
    },
    {
      id: "TRN-12953",
      type: "PASSENGER_TRAIN",
      name: "August Kranti Rajdhani",
      number: "12953",
      track: "UP_MAIN",
      startHour: 20.2,
      endHour: 21.0,
      status: "ON_TIME",
    },
    // Passenger Trains along DOWN MAIN
    {
      id: "TRN-12952",
      type: "PASSENGER_TRAIN",
      name: "New Delhi Rajdhani (Down)",
      number: "12952",
      track: "DOWN_MAIN",
      startHour: 7.5,
      endHour: 8.3,
      status: "ON_TIME",
    },
    {
      id: "TRN-12010",
      type: "PASSENGER_TRAIN",
      name: "Ahmedabad Vande Bharat",
      number: "12010",
      track: "DOWN_MAIN",
      startHour: 14.2,
      endHour: 15.0,
      status: "ON_TIME",
    },
    {
      id: "TRN-12954",
      type: "PASSENGER_TRAIN",
      name: "August Kranti Express (Down)",
      number: "12954",
      track: "DOWN_MAIN",
      startHour: 22.0,
      endHour: 22.8,
      status: "ON_TIME",
    },
    // Freight & Loop Line operations
    {
      id: "FRT-4091",
      type: "FREIGHT_TRAIN",
      name: "Double-Stack Container Rake (Mundra Port)",
      number: "CONT-4091",
      track: "DFC_FREIGHT",
      startHour: 0.5,
      endHour: 2.5,
      status: "ON_TIME",
    },
    {
      id: "FRT-7721",
      type: "FREIGHT_TRAIN",
      name: "Coal Heavy Haul Rake (BOXN)",
      number: "BOXN-7721",
      track: "DFC_FREIGHT",
      startHour: 6.0,
      endHour: 8.0,
      status: "ON_TIME",
    },
    {
      id: "FRT-9922",
      type: "FREIGHT_TRAIN",
      name: "Petroleum BTPN Tank Rake",
      number: "BTPN-9922",
      track: "LOOP_LINE",
      startHour: 10.0,
      endHour: 12.0,
      status: "REGULATED",
    },
  ];

  const tracks: { id: "UP_MAIN" | "DOWN_MAIN" | "LOOP_LINE" | "DFC_FREIGHT"; label: string; desc: string }[] = [
    { id: "UP_MAIN", label: "Line 1: UP Main Track (160 km/h)", desc: "Primary Northbound Trunk Line" },
    { id: "DOWN_MAIN", label: "Line 2: DOWN Main Track (160 km/h)", desc: "Primary Southbound Trunk Line" },
    { id: "LOOP_LINE", label: "Line 3: Yard Loop / Overtaking Track", desc: "Goods & Precedence Loop" },
    { id: "DFC_FREIGHT", label: "Line 4: DFC Dedicated Freight Corridor", desc: "Double-Stack Heavy Haul Line" },
  ];

  const displayedTracks = selectedTrack === "ALL" 
    ? tracks 
    : tracks.filter(t => t.id === selectedTrack);

  return (
    <div className="rounded-2xl border-2 border-black bg-[#022642] shadow-[5px_5px_0_#000000] overflow-hidden flex flex-col select-none">
      {/* Gantt Header Bar */}
      <div className="p-4 bg-[#011B30] border-b-2 border-black flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-[#022642] text-[#00FFD2] border-2 border-black shadow-[2px_2px_0_#000000]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-white text-sm sm:text-base">
                24-Hour Master Track Occupancy & Block Sanction Timeline
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-[#00FFD2] text-black border border-black shadow-[1px_1px_0_#000000]">
                G&SR SECTION 15.06
              </span>
              {selectedCorridor && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-[#FFFF00] text-black border border-black shadow-[1px_1px_0_#000000]">
                  {selectedCorridor.id}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 font-medium">
              {selectedCorridor 
                ? `Section Diagram for ${selectedCorridor.name} (${selectedCorridor.route})`
                : "Interactive 24-hour section diagram: Passenger train paths vs Synchronized Night Mega Blocks"}
            </p>
          </div>
        </div>

        {/* Track Filter Buttons */}
        <div className="flex items-center bg-[#000D18] p-1 rounded-xl border-2 border-black text-xs">
          {["ALL", "UP_MAIN", "DOWN_MAIN", "LOOP_LINE", "DFC_FREIGHT"].map((trId) => (
            <button
              key={trId}
              onClick={() => setSelectedTrack(trId)}
              className={`px-3 py-1 rounded-lg font-mono font-bold text-[11px] transition cursor-pointer border ${
                selectedTrack === trId
                  ? "bg-[#00FFD2] text-black font-black border-black shadow-[1px_1px_0_#000000]"
                  : "text-slate-300 border-transparent hover:text-white"
              }`}
            >
              {trId.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Gantt Matrix Chart Canvas */}
      <div className="p-4 bg-[#000D18] overflow-x-auto">
        <div className="min-w-[920px] space-y-3">
          {/* Time Axis (00:00 to 24:00) */}
          <div className="grid grid-cols-24 border-b-2 border-black/60 pb-2 text-[10px] font-mono text-slate-400">
            {hours.slice(0, 24).map((h) => (
              <div key={h} className="text-center border-l border-slate-700/50 first:border-l-0">
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Render Each Track Row */}
          {displayedTracks.map((trk) => {
            const rowSlots = scheduleSlots.filter((s) => s.track === trk.id);

            return (
              <div key={trk.id} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white font-mono">{trk.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{trk.desc}</span>
                </div>

                <div className="relative h-14 bg-[#011B30] rounded-xl border-2 border-black overflow-hidden shadow-[2px_2px_0_#000000]">
                  {/* Grid hour vertical guideline markers */}
                  <div className="absolute inset-0 grid grid-cols-24 pointer-events-none opacity-20">
                    {hours.slice(0, 24).map((h) => (
                      <div key={h} className="border-r border-slate-500 h-full" />
                    ))}
                  </div>

                  {/* Scheduled Slots Blocks */}
                  {rowSlots.map((slot) => {
                    const leftPercent = (slot.startHour / 24) * 100;
                    const widthPercent = ((slot.endHour - slot.startHour) / 24) * 100;
                    const isMegaBlock = slot.type === "MEGA_BLOCK";
                    const isCaution = slot.type === "CAUTION_RESTRICTION";
                    const isPassenger = slot.type === "PASSENGER_TRAIN";

                    return (
                      <div
                        key={slot.id}
                        onClick={() => setActiveSlot(slot)}
                        style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                        className={`absolute top-1.5 bottom-1.5 rounded-lg cursor-pointer transition-all duration-150 p-1.5 flex flex-col justify-center border-2 border-black shadow-[2px_2px_0_#000000] ${
                          isMegaBlock
                            ? "bg-[#FB2077] text-white animate-pulse"
                            : isCaution
                            ? "bg-[#FFFF00] text-black"
                            : isPassenger
                            ? "bg-[#00FFD2] text-black hover:brightness-110"
                            : "bg-[#6367FF] text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold truncate">
                          <span className="truncate">{slot.number ? `#${slot.number}` : slot.name}</span>
                          <span className="text-[9px] opacity-90 ml-1 font-bold">
                            {String(Math.floor(slot.startHour)).padStart(2, "0")}:{String(Math.round((slot.startHour % 1) * 60)).padStart(2, "0")} - {String(Math.floor(slot.endHour)).padStart(2, "0")}:{String(Math.round((slot.endHour % 1) * 60)).padStart(2, "0")}
                          </span>
                        </div>
                        <p className="text-[9px] truncate opacity-90 font-bold">
                          {isMegaBlock ? "🚧 4H Synchronized Block" : slot.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Slot Detailed Inspector Strip */}
      {activeSlot && (
        <div className="p-3 bg-[#011B30] border-t-2 border-black flex flex-wrap items-center justify-between gap-3 text-xs animate-slide-up">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg font-bold font-mono text-xs border border-black shadow-[1px_1px_0_#000000] ${
              activeSlot.type === "MEGA_BLOCK" ? "bg-[#FB2077] text-white" : "bg-[#00FFD2] text-black"
            }`}>
              {activeSlot.type.replace("_", " ")}
            </div>
            <div>
              <p className="font-bold text-white">{activeSlot.name} {activeSlot.number && `(#${activeSlot.number})`}</p>
              <p className="text-[11px] text-slate-300">
                Track: <span className="font-mono text-[#00FFD2]">{activeSlot.track}</span> • Window: <strong>{activeSlot.startHour}:00 - {activeSlot.endHour}:00 hrs</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {activeSlot.departments && (
              <span className="text-[11px] text-slate-300">
                Joint Working: <strong>{activeSlot.departments.join(", ")}</strong>
              </span>
            )}
            <button
              onClick={() => setActiveSlot(null)}
              className="px-3 py-1 rounded-lg bg-[#022642] hover:bg-[#03345A] text-white text-xs font-bold transition border border-black cursor-pointer shadow-[1px_1px_0_#000000]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
