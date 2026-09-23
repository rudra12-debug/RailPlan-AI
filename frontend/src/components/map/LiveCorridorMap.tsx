"use client";

import React, { useState, useEffect, useMemo } from "react";
import { RailwayCorridor, RiskLevel } from "@/lib/types";
import { useRailPlan, ZONE_CORRIDOR_MAP } from "@/context/RailPlanContext";
import { 
  Train, 
  AlertTriangle, 
  ShieldCheck, 
  MapPin, 
  Layers, 
  Info, 
  Radio, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Maximize2, 
  Zap, 
  Activity, 
  Navigation, 
  Eye, 
  Sliders, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Clock, 
  Gauge,
  Focus,
  Globe,
  Waves,
  Mountain,
  AlertOctagon,
  Filter
} from "lucide-react";
import { 
  Waves as PhosphorWaves, 
  Mountains as PhosphorMountains, 
  Gauge as PhosphorGauge, 
  WarningCircle, 
  Funnel,
  CaretDown,
  CaretUp
} from "@phosphor-icons/react";
import { RiskBadge } from "@/components/common/StatusBadge";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ENGINEERING_CAUTION_ZONES, EngineeringCautionZone, CautionZoneType } from "@/lib/cautionZonesData";

const GeographicalLeafletMap = dynamic(
  () => import("./GeographicalLeafletMap").then((mod) => mod.GeographicalLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[520px] flex flex-col items-center justify-center bg-[#050914] text-slate-400 font-mono text-xs space-y-2">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-200 font-bold">Loading Real Geographical Satellite & GIS Rail Grid...</span>
        <span className="text-[10px] text-slate-500">CartoDB Dark • ESRI High-Res Satellite • OpenRailwayMap Active Lines</span>
      </div>
    ),
  }
);

export interface LiveTrain {
  id: string;
  trainNumber: string;
  name: string;
  type: "Vande Bharat" | "Rajdhani Express" | "Superfast Express" | "DFC Freight Rake" | "Inspection Car";
  corridorId: string;
  speedKmph: number;
  maxSpeedKmph: number;
  currentStation: string;
  nextStation: string;
  delayMinutes: number;
  progressPercent: number; // 0 to 100 along path
  status: "ON_TIME" | "SLIGHT_DELAY" | "CAUTION_RESTRICTED" | "HEAVY_DELAY";
  coordinates: { x: number; y: number };
  kavachActive: boolean;
  direction?: "UP" | "DOWN";
}

export interface MaintenanceBlockZone {
  id: string;
  corridorId: string;
  name: string;
  startKm: number;
  endKm: number;
  speedRestrictionKmph: number;
  blockType: "25kV OHE Power Isolation" | "Civil Track Renewal (CWR)" | "USFD Ultrasonic Scan" | "Deep Screening Ballast";
  responsibleDept: string;
  timeRemaining: string;
}

export const LiveCorridorMap: React.FC<{ onSelectCorridor?: (corridor: RailwayCorridor) => void }> = ({ onSelectCorridor }) => {
  const { corridors, selectedCorridorId, setSelectedCorridorId, selectedZone } = useRailPlan();

  const availableCorridors = useMemo(() => {
    const allowed = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    return corridors.filter((c) => allowed.includes(c.id));
  }, [corridors, selectedZone]);

  const [activeCorridor, setActiveCorridor] = useState<RailwayCorridor>(() => {
    if (selectedCorridorId && selectedCorridorId !== "ALL") {
      return corridors.find((c) => c.id === selectedCorridorId) || corridors[0];
    }
    const allowed = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    return corridors.find((c) => allowed.includes(c.id)) || corridors[0];
  });

  const [selectedStation, setSelectedStation] = useState<any | null>(null);
  const [selectedTrain, setSelectedTrain] = useState<LiveTrain | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<MaintenanceBlockZone | null>(null);
  const [selectedCautionZone, setSelectedCautionZone] = useState<EngineeringCautionZone | null>(null);
  const [cautionFilter, setCautionFilter] = useState<CautionZoneType | "ALL">("ALL");
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);

  // Reset caution filter to ALL when corridor selection changes
  useEffect(() => {
    setCautionFilter("ALL");
  }, [selectedCorridorId]);

  // View mode: "GEO" shows real interactive Leaflet GIS map; "FOCUS" shows clean linear schematic
  const [viewMode, setViewMode] = useState<"GEO" | "FOCUS">("GEO");

  // Layer Toggles
  const [activeLayer, setActiveLayer] = useState<"ALL" | "TRAFFIC" | "MAINTENANCE" | "TRACTION" | "KAVACH">("ALL");
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);

  // Sync activeCorridor whenever selectedCorridorId or selectedZone changes
  useEffect(() => {
    if (selectedCorridorId && selectedCorridorId !== "ALL") {
      const found = corridors.find((c) => c.id === selectedCorridorId);
      if (found) {
        setActiveCorridor(found);
        setSelectedStation(null);
        setSelectedTrain(null);
        setSelectedBlock(null);
      }
    } else if (selectedCorridorId === "ALL") {
      const allowed = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
      if (!activeCorridor || !allowed.includes(activeCorridor.id)) {
        const firstInZone = corridors.find((c) => allowed.includes(c.id)) || corridors[0];
        setActiveCorridor(firstInZone);
        setSelectedStation(null);
        setSelectedTrain(null);
        setSelectedBlock(null);
      }
    }
  }, [selectedCorridorId, selectedZone, corridors, activeCorridor]);

  // Live dynamic trains moving along paths across all corridors (BPL-ET testing data prioritized)
  const [trains, setTrains] = useState<LiveTrain[]>([
    // BPL-ET (Bhopal - Itarsi 120 KM Trunk Corridor Test Trains)
    {
      id: "TRN-BPL-01",
      trainNumber: "20172",
      name: "Rani Kamlapati - Hazrat Nizamuddin Vande Bharat",
      type: "Vande Bharat",
      corridorId: "BPL-ET",
      speedKmph: 130,
      maxSpeedKmph: 160,
      currentStation: "Bhopal Junction (BPL)",
      nextStation: "Rani Kamlapati (RKMP)",
      delayMinutes: 0,
      progressPercent: 12,
      status: "ON_TIME",
      coordinates: { x: 350, y: 260 },
      kavachActive: true,
      direction: "UP",
    },
    {
      id: "TRN-BPL-02",
      trainNumber: "12002",
      name: "New Delhi - Bhopal Shatabdi Express",
      type: "Vande Bharat",
      corridorId: "BPL-ET",
      speedKmph: 115,
      maxSpeedKmph: 130,
      currentStation: "Rani Kamlapati (RKMP)",
      nextStation: "Mandideep (MDDP)",
      delayMinutes: 0,
      progressPercent: 24,
      status: "ON_TIME",
      coordinates: { x: 353, y: 270 },
      kavachActive: true,
      direction: "DOWN",
    },
    {
      id: "TRN-BPL-03",
      trainNumber: "12156",
      name: "Shaan-e-Bhopal Superfast Express",
      type: "Superfast Express",
      corridorId: "BPL-ET",
      speedKmph: 65,
      maxSpeedKmph: 110,
      currentStation: "Barkhera (Ghat Section Entry)",
      nextStation: "Budni (BNI)",
      delayMinutes: 6,
      progressPercent: 52,
      status: "CAUTION_RESTRICTED",
      coordinates: { x: 362, y: 312 },
      kavachActive: true,
      direction: "DOWN",
    },
    {
      id: "TRN-BPL-04",
      trainNumber: "12920",
      name: "Malwa Superfast Express",
      type: "Superfast Express",
      corridorId: "BPL-ET",
      speedKmph: 85,
      maxSpeedKmph: 110,
      currentStation: "Budni (Mid-Ghat Section)",
      nextStation: "Narmadapuram (NDPM)",
      delayMinutes: 0,
      progressPercent: 68,
      status: "ON_TIME",
      coordinates: { x: 365, y: 325 },
      kavachActive: true,
      direction: "DOWN",
    },
    {
      id: "TRN-BPL-05",
      trainNumber: "12138",
      name: "Punjab Mail",
      type: "Superfast Express",
      corridorId: "BPL-ET",
      speedKmph: 90,
      maxSpeedKmph: 110,
      currentStation: "Narmadapuram (NDPM)",
      nextStation: "Itarsi Junction (ET)",
      delayMinutes: 0,
      progressPercent: 82,
      status: "ON_TIME",
      coordinates: { x: 368, y: 338 },
      kavachActive: true,
      direction: "DOWN",
    },
    {
      id: "TRN-BPL-06",
      trainNumber: "TAMP-SP-04",
      name: "Plasser Track Relaying & Tamping Special",
      type: "Inspection Car",
      corridorId: "BPL-ET",
      speedKmph: 25,
      maxSpeedKmph: 40,
      currentStation: "Barkhera Ghat Work Site (KM 56.4)",
      nextStation: "Budni Section",
      delayMinutes: 0,
      progressPercent: 48,
      status: "CAUTION_RESTRICTED",
      coordinates: { x: 362, y: 312 },
      kavachActive: true,
      direction: "DOWN",
    },
    {
      id: "TRN-BPL-07",
      trainNumber: "BCN-E/Sarni",
      name: "Heavy Thermal Coal Freight Special",
      type: "DFC Freight Rake",
      corridorId: "BPL-ET",
      speedKmph: 0,
      maxSpeedKmph: 75,
      currentStation: "Barkhera Loop Line (Regulated)",
      nextStation: "Midha Catch Siding",
      delayMinutes: 25,
      progressPercent: 46,
      status: "CAUTION_RESTRICTED",
      coordinates: { x: 360, y: 308 },
      kavachActive: true,
      direction: "DOWN",
    },
    // NDLS-MMCT
    {
      id: "TRN-01",
      trainNumber: "12009",
      name: "Mumbai - Ahmedabad Vande Bharat",
      type: "Vande Bharat",
      corridorId: "NDLS-MMCT",
      speedKmph: 130,
      maxSpeedKmph: 160,
      currentStation: "Surat (ST)",
      nextStation: "Vadodara Jn (BRC)",
      delayMinutes: 0,
      progressPercent: 42,
      status: "ON_TIME",
      coordinates: { x: 215, y: 315 },
      kavachActive: true,
      direction: "UP",
    },
    {
      id: "TRN-02",
      trainNumber: "12951",
      name: "Mumbai Tejas Rajdhani Express",
      type: "Rajdhani Express",
      corridorId: "NDLS-MMCT",
      speedKmph: 85,
      maxSpeedKmph: 130,
      currentStation: "Mathura Jn (MTJ)",
      nextStation: "Kota Jn (KOTA)",
      delayMinutes: 8,
      progressPercent: 18,
      status: "CAUTION_RESTRICTED",
      coordinates: { x: 335, y: 150 },
      kavachActive: true,
      direction: "DOWN",
    },
    {
      id: "TRN-03",
      trainNumber: "USFD-CAR",
      name: "Ultrasonic Flaw Scanner Car",
      type: "Inspection Car",
      corridorId: "NDLS-MMCT",
      speedKmph: 30,
      maxSpeedKmph: 45,
      currentStation: "Mathura Yard (KM 148)",
      nextStation: "Kota Section",
      delayMinutes: 0,
      progressPercent: 12,
      status: "CAUTION_RESTRICTED",
      coordinates: { x: 335, y: 150 },
      kavachActive: true,
      direction: "DOWN",
    },
    // NDLS-HWH
    {
      id: "TRN-04",
      trainNumber: "12301",
      name: "Howrah Rajdhani Express",
      type: "Rajdhani Express",
      corridorId: "NDLS-HWH",
      speedKmph: 120,
      maxSpeedKmph: 130,
      currentStation: "Kanpur Central (CNB)",
      nextStation: "Prayagraj Jn (PRYJ)",
      delayMinutes: 2,
      progressPercent: 35,
      status: "ON_TIME",
      coordinates: { x: 470, y: 185 },
      kavachActive: true,
      direction: "DOWN",
    },
    {
      id: "TRN-05",
      trainNumber: "12313",
      name: "Sealdah Rajdhani Express",
      type: "Rajdhani Express",
      corridorId: "NDLS-HWH",
      speedKmph: 125,
      maxSpeedKmph: 130,
      currentStation: "Pt. Deen Dayal Upadhyaya",
      nextStation: "Dhanbad Jn",
      delayMinutes: 0,
      progressPercent: 62,
      status: "ON_TIME",
      coordinates: { x: 580, y: 235 },
      kavachActive: true,
      direction: "DOWN",
    },
    // WDFC-01
    {
      id: "TRN-06",
      trainNumber: "DFC-902",
      name: "Mundra Port Double-Stack Container Special",
      type: "DFC Freight Rake",
      corridorId: "WDFC-01",
      speedKmph: 95,
      maxSpeedKmph: 100,
      currentStation: "Palanpur (PNU)",
      nextStation: "Sanand (SAU)",
      delayMinutes: 0,
      progressPercent: 55,
      status: "ON_TIME",
      coordinates: { x: 230, y: 250 },
      kavachActive: true,
      direction: "DOWN",
    },
    // EDFC-01
    {
      id: "TRN-07",
      trainNumber: "DFC-E-401",
      name: "Dhanbad Coal Heavy Haul Special",
      type: "DFC Freight Rake",
      corridorId: "EDFC-01",
      speedKmph: 90,
      maxSpeedKmph: 100,
      currentStation: "Sonnagar (SEB)",
      nextStation: "DDU Yard",
      delayMinutes: 0,
      progressPercent: 70,
      status: "ON_TIME",
      coordinates: { x: 630, y: 245 },
      kavachActive: true,
      direction: "UP",
    },
    // CSMT-MAS
    {
      id: "TRN-08",
      trainNumber: "12621",
      name: "Tamil Nadu Superfast Express",
      type: "Superfast Express",
      corridorId: "CSMT-MAS",
      speedKmph: 105,
      maxSpeedKmph: 110,
      currentStation: "Solapur (SUR)",
      nextStation: "Guntakal Jn (GTL)",
      delayMinutes: 4,
      progressPercent: 48,
      status: "ON_TIME",
      coordinates: { x: 295, y: 420 },
      kavachActive: false,
      direction: "DOWN",
    },
    // MAS-SBC
    {
      id: "TRN-09",
      trainNumber: "20607",
      name: "Chennai - Mysuru Vande Bharat Express",
      type: "Vande Bharat",
      corridorId: "MAS-SBC",
      speedKmph: 130,
      maxSpeedKmph: 160,
      currentStation: "Katpadi Jn (KPD)",
      nextStation: "Jolarpettai Jn (JTJ)",
      delayMinutes: 0,
      progressPercent: 52,
      status: "ON_TIME",
      coordinates: { x: 415, y: 520 },
      kavachActive: true,
      direction: "DOWN",
    },
    // HWH-MAS
    {
      id: "TRN-10",
      trainNumber: "12841",
      name: "Coromandel Express",
      type: "Superfast Express",
      corridorId: "HWH-MAS",
      speedKmph: 110,
      maxSpeedKmph: 130,
      currentStation: "Cuttack (CTC)",
      nextStation: "Bhubaneswar (BBS)",
      delayMinutes: 0,
      progressPercent: 30,
      status: "ON_TIME",
      coordinates: { x: 620, y: 355 },
      kavachActive: true,
      direction: "DOWN",
    },
    // ADI-MMCT
    {
      id: "TRN-11",
      trainNumber: "82902",
      name: "Ahmedabad - Mumbai Tejas Express",
      type: "Vande Bharat",
      corridorId: "ADI-MMCT",
      speedKmph: 125,
      maxSpeedKmph: 130,
      currentStation: "Bharuch (BH)",
      nextStation: "Surat (ST)",
      delayMinutes: 0,
      progressPercent: 45,
      status: "ON_TIME",
      coordinates: { x: 212, y: 330 },
      kavachActive: true,
      direction: "DOWN",
    },
    // KONKAN-01
    {
      id: "TRN-12",
      trainNumber: "22229",
      name: "Mumbai CSMT - Madgaon Vande Bharat",
      type: "Vande Bharat",
      corridorId: "KONKAN-01",
      speedKmph: 110,
      maxSpeedKmph: 120,
      currentStation: "Chiplun (CHI)",
      nextStation: "Ratnagiri (RN)",
      delayMinutes: 0,
      progressPercent: 28,
      status: "ON_TIME",
      coordinates: { x: 220, y: 425 },
      kavachActive: true,
      direction: "DOWN",
    },
    {
      id: "TRN-13",
      trainNumber: "12051",
      name: "Madgaon - Mumbai Jan Shatabdi Express",
      type: "Superfast Express",
      corridorId: "KONKAN-01",
      speedKmph: 95,
      maxSpeedKmph: 110,
      currentStation: "Ratnagiri (RN)",
      nextStation: "Chiplun (CHI)",
      delayMinutes: 3,
      progressPercent: 55,
      status: "ON_TIME",
      coordinates: { x: 225, y: 455 },
      kavachActive: true,
      direction: "UP",
    },
    {
      id: "TRN-14",
      trainNumber: "12617",
      name: "Mangala Lakshadweep Superfast Express",
      type: "Superfast Express",
      corridorId: "KONKAN-01",
      speedKmph: 85,
      maxSpeedKmph: 110,
      currentStation: "Karwar (KAWR)",
      nextStation: "Udupi (UD)",
      delayMinutes: 0,
      progressPercent: 78,
      status: "ON_TIME",
      coordinates: { x: 235, y: 505 },
      kavachActive: false,
      direction: "DOWN",
    },
  ]);

  // Active Maintenance Block Zones mapped to distinct corridors
  const maintenanceBlocks: MaintenanceBlockZone[] = [
    {
      id: "BLK-101",
      corridorId: "NDLS-MMCT",
      name: "Mathura–Bharatpur CWR & 25kV OHE Mega Block",
      startKm: 148,
      endKm: 156,
      speedRestrictionKmph: 30,
      blockType: "25kV OHE Power Isolation",
      responsibleDept: "ELEC + ENG",
      timeRemaining: "02h 45m remaining",
    },
    {
      id: "BLK-102",
      corridorId: "NDLS-HWH",
      name: "Yamuna River Bridge Pier 7 Epoxy & Bearing Block",
      startKm: 441,
      endKm: 443,
      speedRestrictionKmph: 20,
      blockType: "Civil Track Renewal (CWR)",
      responsibleDept: "ENG",
      timeRemaining: "04h 10m remaining",
    },
    {
      id: "BLK-103",
      corridorId: "WDFC-01",
      name: "Rewari–Ateli Ballast Deep Screening (BCM Machine)",
      startKm: 140,
      endKm: 165,
      speedRestrictionKmph: 45,
      blockType: "Deep Screening Ballast",
      responsibleDept: "ENG",
      timeRemaining: "01h 30m remaining",
    },
    {
      id: "BLK-104",
      corridorId: "KONKAN-01",
      name: "Panval Nadi Viaduct Pier Inspection & Monsoon Netting",
      startKm: 145,
      endKm: 160,
      speedRestrictionKmph: 30,
      blockType: "Civil Track Renewal (CWR)",
      responsibleDept: "ENG + SFTY",
      timeRemaining: "03h 20m remaining",
    },
    {
      id: "BLK-105",
      corridorId: "BPL-ET",
      name: "Barkhera–Budni Vindhyachal Ghat Catenary Sag Remediation",
      startKm: 56,
      endKm: 68,
      speedRestrictionKmph: 30,
      blockType: "25kV OHE Power Isolation",
      responsibleDept: "ELEC",
      timeRemaining: "02h 15m remaining",
    },
    {
      id: "BLK-106",
      corridorId: "MAS-SBC",
      name: "Jolarpettai Junction Kavach RFID Transponder Recalibration",
      startKm: 210,
      endKm: 220,
      speedRestrictionKmph: 45,
      blockType: "USFD Ultrasonic Scan",
      responsibleDept: "SNT",
      timeRemaining: "01h 45m remaining",
    },
    {
      id: "BLK-107",
      corridorId: "CSMT-MAS",
      name: "Bhor Ghat Mountain Incline OHE Dropper Replacement",
      startKm: 110,
      endKm: 125,
      speedRestrictionKmph: 25,
      blockType: "25kV OHE Power Isolation",
      responsibleDept: "ELEC + SFTY",
      timeRemaining: "03h 50m remaining",
    },
  ];

  // Dynamic train position simulation tick
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setTrains((prev) =>
        prev.map((t) => {
          let nextProgress = t.progressPercent + (t.direction === "UP" ? -0.4 : 0.4) * simSpeed;
          if (nextProgress > 96) nextProgress = 6;
          if (nextProgress < 4) nextProgress = 94;

          const targetCorridor = corridors.find((c) => c.id === t.corridorId) || activeCorridor;
          const coords = targetCorridor.coordinates;
          const totalSegments = Math.max(1, coords.length - 1);
          const segmentIndex = Math.min(
            Math.floor((nextProgress / 100) * totalSegments),
            totalSegments - 1
          );
          const segmentProgress = ((nextProgress / 100) * totalSegments) - segmentIndex;

          const p1 = coords[segmentIndex] || { x: 150, y: 150 };
          const p2 = coords[segmentIndex + 1] || p1;

          const currentX = p1.x + (p2.x - p1.x) * segmentProgress;
          const currentY = p1.y + (p2.y - p1.y) * segmentProgress;

          return {
            ...t,
            progressPercent: nextProgress,
            coordinates: { x: Math.round(currentX), y: Math.round(currentY) },
          };
        })
      );
    }, 800);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed, corridors, activeCorridor]);

  const getStatusColor = (status: RiskLevel) => {
    switch (status) {
      case "CRITICAL":
        return "#EF4444";
      case "MEDIUM_RISK":
        return "#F97316";
      case "ATTENTION":
        return "#F59E0B";
      case "PLANNED":
        return "#06B6D4";
      case "NORMAL":
      default:
        return "#10B981";
    }
  };

  const handleCorridorClick = (corridor: RailwayCorridor) => {
    setActiveCorridor(corridor);
    setSelectedStation(null);
    setSelectedTrain(null);
    setSelectedBlock(null);
    setSelectedCorridorId(corridor.id);
    if (onSelectCorridor) onSelectCorridor(corridor);
  };

  // Filtered trains and blocks for the active corridor
  const activeCorridorTrains = useMemo(() => {
    return trains.filter((t) => t.corridorId === activeCorridor.id);
  }, [trains, activeCorridor.id]);

  const activeCorridorBlocks = useMemo(() => {
    return maintenanceBlocks.filter((b) => b.corridorId === activeCorridor.id);
  }, [activeCorridor.id]);

  // Engineering caution zones strictly filtered to the active corridor (or all in Pan-India view)
  const activeCorridorHazards = useMemo(() => {
    if (selectedCorridorId === "ALL") {
      return ENGINEERING_CAUTION_ZONES;
    }
    return ENGINEERING_CAUTION_ZONES.filter((z) => z.corridorId === activeCorridor.id);
  }, [selectedCorridorId, activeCorridor.id]);

  const riverHazardsCount = useMemo(() => {
    return activeCorridorHazards.filter((z) => z.type === "RIVER_BRIDGE").length;
  }, [activeCorridorHazards]);

  const slopeHazardsCount = useMemo(() => {
    return activeCorridorHazards.filter((z) => z.type === "GHAT_SLOPE").length;
  }, [activeCorridorHazards]);

  const speedLimitHazardsCount = useMemo(() => {
    return activeCorridorHazards.filter((z) => z.type === "SPEED_LIMIT").length;
  }, [activeCorridorHazards]);

  const criticalHazardsCount = useMemo(() => {
    return activeCorridorHazards.filter((z) => z.type === "CRITICAL_HAZARD").length;
  }, [activeCorridorHazards]);

  // Major terminal hubs for National Overview display
  const MAJOR_TERMINALS = new Set(["NDLS", "MMCT", "CSMT", "HWH", "MAS", "SBC", "BPL", "ADI", "DKAE", "JNPT"]);

  return (
    <div className="rounded-2xl border border-[#1A274E] bg-[#0C1326] overflow-hidden shadow-2xl flex flex-col">
      {/* Control Bar */}
      <div className="p-4 bg-[#050814]/95 border-b border-[#1A274E] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-[#6367FF]/15 text-[#8494FF] border border-[#6367FF]/35 shadow-[0_0_12px_rgba(99,103,255,0.25)]">
            <Radio className="w-5 h-5 animate-pulse text-[#8494FF]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-[#F8FAFC] text-sm sm:text-base font-sans">
                National Dynamic Corridor & Traffic Control Map
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#131E3D] text-[#3DFDCE] border border-[#3DFDCE]/40 shadow-[0_0_8px_rgba(61,253,206,0.2)]">
                {selectedCorridorId === "ALL" 
                  ? "ALL CORRIDORS (NATIONAL GIS GRID)" 
                  : viewMode === "GEO"
                  ? `REAL GIS: ${activeCorridor.id}` 
                  : `TRACK SCHEMATIC: ${activeCorridor.id}`}
              </span>
            </div>
            <p className="text-xs text-[#B6BFFF]">
              {selectedCorridorId === "ALL"
                ? "Pan-India 10-Corridor Network • Real GIS terrain, satellite imagery, and live IR track telemetry"
                : viewMode === "GEO"
                ? `${activeCorridor.name} • Interactive geographical map with real GPS tracks & stations`
                : `${activeCorridor.name} • Clean linear track layout with zero label overlap`}
            </p>
          </div>
        </div>

        {/* View Mode Switcher, Corridor Selector, Layer Toggles & Speed */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Direct Corridor Switcher Dropdown */}
          <div className="flex items-center space-x-1.5 bg-[#0C1326] px-2.5 py-1 rounded-xl border border-[#1A274E] text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#8494FF] shrink-0" />
            <span className="text-[10px] text-[#B6BFFF] font-semibold uppercase">Corridor:</span>
            <select
              value={selectedCorridorId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedCorridorId(val);
                setSelectedStation(null);
                setSelectedTrain(null);
                setSelectedBlock(null);
                if (val !== "ALL") {
                  const found = corridors.find((c) => c.id === val);
                  if (found) {
                    setActiveCorridor(found);
                    if (onSelectCorridor) onSelectCorridor(found);
                  }
                }
              }}
              aria-label="Select Railway Corridor"
              className="bg-transparent text-[#00FFE0] font-mono font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-[#0C1326] text-[#00FFE0] font-bold">
                🌐 All Corridors ({availableCorridors.length})
              </option>
              {availableCorridors.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0C1326] text-[#F8FAFC]">
                  {c.id} - {c.name.split("(")[0]} ({c.totalLengthKm} KM)
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#0C1326] p-1 rounded-xl border border-[#1A274E] text-xs">
            <button
              onClick={() => setViewMode("GEO")}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                viewMode === "GEO"
                  ? "bg-gradient-to-r from-[#6367FF] to-[#8494FF] text-white shadow-[0_0_14px_rgba(99,103,255,0.45)]"
                  : "text-[#B6BFFF] hover:text-white"
              }`}
              title="Real Interactive Geographic Map (Google / Satellite / OSM Tiles & OpenRailwayMap)"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Real GIS Map</span>
            </button>
            <button
              onClick={() => {
                if (selectedCorridorId === "ALL") {
                  setSelectedCorridorId(activeCorridor.id);
                }
                setViewMode("FOCUS");
              }}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                viewMode === "FOCUS"
                  ? "bg-gradient-to-r from-[#6367FF] to-[#8494FF] text-white shadow-[0_0_14px_rgba(99,103,255,0.45)]"
                  : "text-[#B6BFFF] hover:text-white"
              }`}
              title="Clean isolated corridor trackbed view with zero overlap"
            >
              <Focus className="w-3.5 h-3.5" />
              <span>Linear Track Schematic</span>
            </button>
          </div>

          {/* Layer Filter Pills */}
          <div className="hidden sm:flex items-center bg-[#0C1326] p-1 rounded-xl border border-[#1A274E] text-[11px]">
            {[
              { id: "ALL", label: "All Layers" },
              { id: "TRAFFIC", label: "🚆 Live Trains" },
              { id: "MAINTENANCE", label: "🚧 Blocks" },
              { id: "KAVACH", label: "📡 Kavach" },
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id as any)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  activeLayer === layer.id
                    ? "bg-[#131E3D] text-[#3DFDCE] border border-[#3DFDCE]/50 shadow-[0_0_8px_rgba(61,253,206,0.25)]"
                    : "text-[#B6BFFF]/70 hover:text-white hover:bg-[#131E3D]/50"
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>

          {/* Speed & Sim Controls */}
          <div className="flex items-center space-x-1.5 bg-[#0C1326] px-2.5 py-1 rounded-xl border border-[#1A274E] text-xs">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                isSimulating ? "bg-[#3DFDCE]/15 text-[#3DFDCE] border border-[#3DFDCE]/40" : "bg-[#131E3D] text-[#B6BFFF]"
              }`}
            >
              {isSimulating ? "● STREAMING" : "❚❚ PAUSED"}
            </button>
            <button
              onClick={() => setSimSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 4 : 1)}
              className="px-2 py-0.5 rounded bg-[#131E3D] text-[#00FFE0] font-mono font-bold text-[11px] border border-[#1A274E]"
            >
              {simSpeed}x
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full h-[520px] bg-[#050914] bg-grid-pattern overflow-hidden select-none flex">
        {/* Railway Map Engine (GIS Map or Linear Track Schematic) */}
        <div className="flex-1 relative h-full flex items-center justify-center overflow-hidden">
          {viewMode === "GEO" ? (
            <GeographicalLeafletMap
              corridors={corridors}
              activeCorridor={activeCorridor}
              selectedCorridorId={selectedCorridorId}
              trains={trains}
              maintenanceBlocks={maintenanceBlocks}
              cautionZones={ENGINEERING_CAUTION_ZONES}
              selectedCautionZone={selectedCautionZone}
              cautionFilter={cautionFilter}
              activeLayer={activeLayer}
              selectedTrain={selectedTrain}
              selectedBlock={selectedBlock}
              selectedStation={selectedStation}
              onSelectCorridor={(c) => {
                setActiveCorridor(c);
                setSelectedCorridorId(c.id);
                setSelectedStation(null);
                setSelectedTrain(null);
                setSelectedBlock(null);
                setSelectedCautionZone(null);
              }}
              onSelectStation={(stn) => {
                setSelectedStation(stn);
                setSelectedTrain(null);
                setSelectedBlock(null);
                setSelectedCautionZone(null);
              }}
              onSelectTrain={(trn) => {
                setSelectedTrain(trn);
                setSelectedStation(null);
                setSelectedBlock(null);
                setSelectedCautionZone(null);
              }}
              onSelectBlock={(blk) => {
                setSelectedBlock(blk);
                setSelectedStation(null);
                setSelectedTrain(null);
                setSelectedCautionZone(null);
              }}
              onSelectCautionZone={(zone) => {
                setSelectedCautionZone(zone);
                setSelectedStation(null);
                setSelectedTrain(null);
                setSelectedBlock(null);
              }}
            />
          ) : (
            /* ======================================================== */
            /* 1. CLEAN HORIZONTAL LINEAR CORRIDOR TRACK SCHEMATIC      */
            /* ZERO OVERLAP: Stations staggered top/bottom, pure focus  */
            /* ======================================================== */
            <svg className="w-full h-full max-w-4xl p-2" viewBox="0 0 850 460">
              <defs>
                <linearGradient id="focusGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
                </linearGradient>
                <pattern id="sleeperPattern" width="12" height="18" patternUnits="userSpaceOnUse">
                  <line x1="6" y1="0" x2="6" y2="18" stroke="#334155" strokeWidth="2" />
                </pattern>
              </defs>

              {/* Header Title on Canvas */}
              <text x="60" y="42" fill="#F8FAFC" fontSize="16" fontWeight="bold">
                {activeCorridor.name}
              </text>
              <text x="60" y="62" fill="#94A3B8" fontSize="11" fontFamily="monospace">
                Route: {activeCorridor.route} ({activeCorridor.totalLengthKm} KM) • {activeCorridor.zone}
              </text>

              {/* Track Backdrop Shading */}
              <rect x="50" y="160" width="750" height="140" fill="url(#focusGlow)" rx="12" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />

              {/* 1. UP LINE TRACK (Y = 205) */}
              <g>
                {/* Ballast foundation */}
                <line x1="60" y1="205" x2="790" y2="205" stroke="#1E293B" strokeWidth="10" strokeLinecap="round" />
                {/* Dual Steel Rails */}
                <line x1="60" y1="202" x2="790" y2="202" stroke="#475569" strokeWidth="2" />
                <line x1="60" y1="208" x2="790" y2="208" stroke="#475569" strokeWidth="2" />
                {/* Direction Tag */}
                <text x="45" y="209" fill="#06B6D4" fontSize="9" fontWeight="bold" textAnchor="end">
                  UP LINE ◄
                </text>
              </g>

              {/* 2. DOWN LINE TRACK (Y = 255) */}
              <g>
                {/* Ballast foundation */}
                <line x1="60" y1="255" x2="790" y2="255" stroke="#1E293B" strokeWidth="10" strokeLinecap="round" />
                {/* Dual Steel Rails */}
                <line x1="60" y1="252" x2="790" y2="252" stroke="#475569" strokeWidth="2" />
                <line x1="60" y1="258" x2="790" y2="258" stroke="#475569" strokeWidth="2" />
                {/* Direction Tag */}
                <text x="45" y="259" fill="#F59E0B" fontSize="9" fontWeight="bold" textAnchor="end">
                  DOWN LINE ►
                </text>
              </g>

              {/* 3. MAINTENANCE BLOCKS ON THIS CORRIDOR */}
              {(activeLayer === "ALL" || activeLayer === "MAINTENANCE") &&
                activeCorridorBlocks.map((block) => {
                  const totalKm = activeCorridor.totalLengthKm || 100;
                  const startX = 70 + Math.min(Math.max((block.startKm / totalKm) * 710, 0), 710);
                  const endX = 70 + Math.min(Math.max((block.endKm / totalKm) * 710, 0), 710);
                  const blockWidth = Math.max(30, endX - startX);

                  return (
                    <g
                      key={block.id}
                      onClick={() => setSelectedBlock(block)}
                      className="cursor-pointer group"
                    >
                      <rect
                        x={startX}
                        y="195"
                        width={blockWidth}
                        height="70"
                        fill="#EF4444"
                        fillOpacity="0.2"
                        stroke="#EF4444"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        rx="6"
                      />
                      <g transform={`translate(${startX + blockWidth / 2}, 230)`}>
                        <circle r="12" fill="#450A0A" stroke="#EF4444" strokeWidth="2" />
                        <text x="-5" y="4" fill="#F87171" fontSize="10" fontWeight="bold">
                          ⚠️
                        </text>
                      </g>
                      <text
                        x={startX + blockWidth / 2}
                        y="285"
                        fill="#EF4444"
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        TSR {block.speedRestrictionKmph}k ({block.responsibleDept})
                      </text>
                    </g>
                  );
                })}

              {/* 4. STATIONS (Staggered top / bottom so labels never overlap) */}
              {activeCorridor.stations.map((stn, idx) => {
                const totalKm = activeCorridor.totalLengthKm || 100;
                const x = 70 + Math.min(Math.max((stn.km / totalKm) * 710, 0), 710);
                const isEven = idx % 2 === 0;
                const isStnSelected = selectedStation?.code === stn.code;

                return (
                  <g
                    key={stn.code}
                    onClick={() => {
                      setSelectedStation(stn);
                      setSelectedTrain(null);
                      setSelectedBlock(null);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Vertical guideline */}
                    <line
                      x1={x}
                      y1={isEven ? 100 : 255}
                      x2={x}
                      y2={isEven ? 205 : 360}
                      stroke="#334155"
                      strokeWidth="1.2"
                      strokeDasharray="2 2"
                    />

                    {/* Up Line station node */}
                    <circle cx={x} cy="205" r="4.5" fill="#0B132B" stroke="#06B6D4" strokeWidth="2" />
                    {/* Down Line station node */}
                    <circle cx={x} cy="255" r="4.5" fill="#0B132B" stroke="#F59E0B" strokeWidth="2" />

                    {/* Station Box: Staggered Top (even) vs Bottom (odd) */}
                    {isEven ? (
                      <g transform={`translate(${x}, 95)`}>
                        <rect
                          x="-35"
                          y="0"
                          width="70"
                          height="44"
                          rx="6"
                          fill={isStnSelected ? "#06B6D4" : "#090E1A"}
                          stroke={stn.hasActiveBlock ? "#EF4444" : isStnSelected ? "#22D3EE" : "#334155"}
                          strokeWidth={isStnSelected ? "2" : "1"}
                          className="transition-transform group-hover:scale-105"
                        />
                        <text x="0" y="16" fill={isStnSelected ? "#090E1A" : "#FFFFFF"} fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          {stn.code}
                        </text>
                        <text x="0" y="28" fill={isStnSelected ? "#090E1A" : "#94A3B8"} fontSize="7.5" fontWeight="semibold" textAnchor="middle">
                          {stn.name.split("(")[0].slice(0, 11)}
                        </text>
                        <text x="0" y="38" fill={isStnSelected ? "#090E1A" : "#10B981"} fontSize="7" fontFamily="monospace" textAnchor="middle">
                          KM {stn.km}
                        </text>
                      </g>
                    ) : (
                      <g transform={`translate(${x}, 310)`}>
                        <rect
                          x="-35"
                          y="0"
                          width="70"
                          height="44"
                          rx="6"
                          fill={isStnSelected ? "#06B6D4" : "#090E1A"}
                          stroke={stn.hasActiveBlock ? "#EF4444" : isStnSelected ? "#22D3EE" : "#334155"}
                          strokeWidth={isStnSelected ? "2" : "1"}
                          className="transition-transform group-hover:scale-105"
                        />
                        <text x="0" y="16" fill={isStnSelected ? "#090E1A" : "#FFFFFF"} fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          {stn.code}
                        </text>
                        <text x="0" y="28" fill={isStnSelected ? "#090E1A" : "#94A3B8"} fontSize="7.5" fontWeight="semibold" textAnchor="middle">
                          {stn.name.split("(")[0].slice(0, 11)}
                        </text>
                        <text x="0" y="38" fill={isStnSelected ? "#090E1A" : "#10B981"} fontSize="7" fontFamily="monospace" textAnchor="middle">
                          KM {stn.km}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* 5. LIVE TRAINS ON THIS CORRIDOR */}
              {(activeLayer === "ALL" || activeLayer === "TRAFFIC" || activeLayer === "KAVACH") &&
                activeCorridorTrains.map((trn) => {
                  const trainX = 70 + Math.min(Math.max((trn.progressPercent / 100) * 710, 0), 710);
                  const isUp = trn.direction === "UP";
                  const trainY = isUp ? 205 : 255;
                  const isTrainSelected = selectedTrain?.id === trn.id;
                  const trainColor = trn.type === "Vande Bharat" ? "#06B6D4" : trn.type === "Rajdhani Express" ? "#EF4444" : "#F59E0B";

                  return (
                    <g
                      key={trn.id}
                      transform={`translate(${trainX}, ${trainY})`}
                      onClick={() => {
                        setSelectedTrain(trn);
                        setSelectedStation(null);
                        setSelectedBlock(null);
                      }}
                      className="cursor-pointer group"
                    >
                      {/* Pulse */}
                      <circle r={isTrainSelected ? "16" : "10"} fill="none" stroke={trainColor} strokeWidth="1.5" className="animate-ping-slow" />

                      {/* Train Body */}
                      <rect
                        x="-14"
                        y="-7"
                        width="28"
                        height="14"
                        rx="4"
                        fill="#090E1A"
                        stroke={trainColor}
                        strokeWidth="2"
                        className="transition-transform group-hover:scale-125"
                      />

                      {/* Headlight */}
                      <polygon
                        points={isUp ? "-14,-4 -22,-7 -22,7 -14,4" : "14,-4 22,-7 22,7 14,4"}
                        fill={trainColor}
                        fillOpacity="0.6"
                      />

                      {/* Speed */}
                      <text x="0" y="3.5" fill="#FFFFFF" fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                        {trn.speedKmph}k
                      </text>

                      {/* Train Tag Label */}
                      <g transform={`translate(-20, ${isUp ? -18 : 12})`}>
                        <rect x="0" y="0" width="40" height="12" rx="3" fill="#020617" stroke={trainColor} strokeWidth="1" />
                        <text x="20" y="9" fill="#E2E8F0" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          {trn.trainNumber}
                        </text>
                      </g>
                    </g>
                  );
                })}
            </svg>
          )}

          {/* Top-Left: Clean Tactile Status Chip (Never overlaps or crowds basemap controls) */}
          <div className="absolute top-3.5 left-3.5 z-[1000] pointer-events-auto flex items-center space-x-2 bg-[#022642] px-3 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0_#000000] text-xs font-mono select-none">
            <span className="w-2 h-2 rounded-full bg-[#00FFD2] animate-pulse shrink-0" />
            <span className="font-bold text-white text-[11px]">
              {selectedCorridorId === "ALL" ? "Pan-India National Radar" : `${activeCorridor.id} Telemetry`}
            </span>
          </div>

          {/* Right-Side Hazards & Conditions Engineering Side Legend (Foldable/Collapsible) */}
          {viewMode === "GEO" && (
            <div className="absolute top-14 right-3.5 z-[1000] pointer-events-auto flex flex-col bg-[#022642] rounded-xl border-2 border-black shadow-[4px_4px_0_#000000] font-mono text-[11px] w-52 overflow-hidden select-none transition-all duration-300">
              {/* Foldable Legend Header Button */}
              <button
                onClick={() => setIsLegendOpen(!isLegendOpen)}
                className={`w-full px-3 py-2 bg-[#011B30] hover:bg-[#03345A] transition flex items-center justify-between text-left focus:outline-none cursor-pointer ${
                  isLegendOpen ? "border-b-2 border-black" : ""
                }`}
                title={isLegendOpen ? "Click to fold/close hazards menu" : "Click to open/expand hazards menu"}
              >
                <div className="flex items-center space-x-1.5 text-[#00FFD2] font-bold text-xs">
                  <Funnel size={15} weight="duotone" className="text-[#00FFD2]" />
                  <span className="truncate max-w-[110px]">
                    {selectedCorridorId === "ALL" ? "National Hazards" : `${activeCorridor.id} Hazards`}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-black border border-[#00FFD2]/50 text-[#00FFD2]">
                    {activeCorridorHazards.length}
                  </span>
                  {isLegendOpen ? (
                    <CaretUp size={14} weight="bold" className="text-[#00FFD2]" />
                  ) : (
                    <CaretDown size={14} weight="bold" className="text-[#00FFD2] animate-pulse" />
                  )}
                </div>
              </button>

              {/* Foldable Legend Category Items */}
              {isLegendOpen && (
                <div className="p-1.5 space-y-1 bg-[#022642]">
                  {/* 1. All Hazards */}
                  <button
                    onClick={() => setCautionFilter("ALL")}
                    className={`w-full px-2.5 py-1.5 rounded-lg font-bold transition flex items-center justify-between text-left text-xs border border-black ${
                      cautionFilter === "ALL"
                        ? "bg-[#6367FF] text-white shadow-[2px_2px_0_#000000] font-extrabold"
                        : "bg-[#011B30] text-slate-200 hover:bg-[#03345A] hover:text-white"
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${cautionFilter === "ALL" ? "bg-white" : "bg-[#00FFD2]"}`}></span>
                      <span>All Hazards</span>
                    </span>
                    <span className={`text-[10px] font-extrabold font-mono px-1.5 py-0.5 rounded border border-black ${
                      cautionFilter === "ALL" ? "bg-black text-white" : "bg-black text-[#00FFD2]"
                    }`}>
                      {activeCorridorHazards.length}
                    </span>
                  </button>

                  {/* 2. River Bridges */}
                  <button
                    onClick={() => setCautionFilter("RIVER_BRIDGE")}
                    disabled={riverHazardsCount === 0}
                    className={`w-full px-2.5 py-1.5 rounded-lg font-bold transition flex items-center justify-between text-left text-xs border border-black ${
                      cautionFilter === "RIVER_BRIDGE"
                        ? "bg-[#00FFD2] text-black shadow-[2px_2px_0_#000000] font-extrabold"
                        : riverHazardsCount > 0
                        ? "bg-[#011B30] text-[#00FFD2] hover:bg-[#03345A]"
                        : "bg-[#011B30]/50 text-slate-500 opacity-50 cursor-not-allowed"
                    }`}
                    title="Super-Bridges over Rivers with Water & Scour Telemetry"
                  >
                    <span className="flex items-center space-x-2">
                      <PhosphorWaves size={16} weight="duotone" className="shrink-0" />
                      <span>River Bridges</span>
                    </span>
                    <span className={`text-[10px] font-extrabold font-mono px-1.5 py-0.5 rounded border border-black ${
                      cautionFilter === "RIVER_BRIDGE"
                        ? "bg-black text-[#00FFD2]"
                        : riverHazardsCount > 0
                        ? "bg-black text-[#00FFD2]"
                        : "bg-black text-slate-500"
                    }`}>
                      {riverHazardsCount}
                    </span>
                  </button>

                  {/* 3. Mountain Slopes */}
                  <button
                    onClick={() => setCautionFilter("GHAT_SLOPE")}
                    disabled={slopeHazardsCount === 0}
                    className={`w-full px-2.5 py-1.5 rounded-lg font-bold transition flex items-center justify-between text-left text-xs border border-black ${
                      cautionFilter === "GHAT_SLOPE"
                        ? "bg-[#FFFF00] text-black shadow-[2px_2px_0_#000000] font-extrabold"
                        : slopeHazardsCount > 0
                        ? "bg-[#011B30] text-[#FFFF00] hover:bg-[#03345A]"
                        : "bg-[#011B30]/50 text-slate-500 opacity-50 cursor-not-allowed"
                    }`}
                    title="Steep Mountain Slopes & Ghat Inclines with Catch Sidings"
                  >
                    <span className="flex items-center space-x-2">
                      <PhosphorMountains size={16} weight="duotone" className="shrink-0" />
                      <span>Mountain Slopes</span>
                    </span>
                    <span className={`text-[10px] font-extrabold font-mono px-1.5 py-0.5 rounded border border-black ${
                      cautionFilter === "GHAT_SLOPE"
                        ? "bg-black text-[#FFFF00]"
                        : slopeHazardsCount > 0
                        ? "bg-black text-[#FFFF00]"
                        : "bg-black text-slate-500"
                    }`}>
                      {slopeHazardsCount}
                    </span>
                  </button>

                  {/* 4. Speed Limits (TSR) */}
                  <button
                    onClick={() => setCautionFilter("SPEED_LIMIT")}
                    disabled={speedLimitHazardsCount === 0}
                    className={`w-full px-2.5 py-1.5 rounded-lg font-bold transition flex items-center justify-between text-left text-xs border border-black ${
                      cautionFilter === "SPEED_LIMIT"
                        ? "bg-[#FF7A00] text-black shadow-[2px_2px_0_#000000] font-extrabold"
                        : speedLimitHazardsCount > 0
                        ? "bg-[#011B30] text-[#FF7A00] hover:bg-[#03345A]"
                        : "bg-[#011B30]/50 text-slate-500 opacity-50 cursor-not-allowed"
                    }`}
                    title="Temporary Speed Restrictions (TSR)"
                  >
                    <span className="flex items-center space-x-2">
                      <PhosphorGauge size={16} weight="duotone" className="shrink-0" />
                      <span>Speed Limits</span>
                    </span>
                    <span className={`text-[10px] font-extrabold font-mono px-1.5 py-0.5 rounded border border-black ${
                      cautionFilter === "SPEED_LIMIT"
                        ? "bg-black text-[#FF7A00]"
                        : speedLimitHazardsCount > 0
                        ? "bg-black text-[#FF7A00]"
                        : "bg-black text-slate-500"
                    }`}>
                      {speedLimitHazardsCount}
                    </span>
                  </button>

                  {/* 5. Critical Hazards */}
                  <button
                    onClick={() => setCautionFilter("CRITICAL_HAZARD")}
                    disabled={criticalHazardsCount === 0}
                    className={`w-full px-2.5 py-1.5 rounded-lg font-bold transition flex items-center justify-between text-left text-xs border border-black ${
                      cautionFilter === "CRITICAL_HAZARD"
                        ? "bg-[#FF2A6D] text-white shadow-[2px_2px_0_#000000] font-extrabold animate-pulse"
                        : criticalHazardsCount > 0
                        ? "bg-[#011B30] text-[#FF2A6D] hover:bg-[#03345A]"
                        : "bg-[#011B30]/50 text-slate-500 opacity-50 cursor-not-allowed"
                    }`}
                    title="Critical Bottlenecks & Diamond Yard Crossings"
                  >
                    <span className="flex items-center space-x-2">
                      <WarningCircle size={16} weight="duotone" className="shrink-0" />
                      <span>Critical Yards</span>
                    </span>
                    <span className={`text-[10px] font-extrabold font-mono px-1.5 py-0.5 rounded border border-black ${
                      cautionFilter === "CRITICAL_HAZARD"
                        ? "bg-black text-[#FF2A6D]"
                        : criticalHazardsCount > 0
                        ? "bg-black text-[#FF2A6D]"
                        : "bg-black text-slate-500"
                    }`}>
                      {criticalHazardsCount}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Live Train Counters Overlay in Bottom-Left */}
          <div className="absolute bottom-3 left-3 p-2.5 rounded-xl bg-[#022642] border-2 border-black shadow-[3px_3px_0_#000000] text-[11px] font-mono space-y-1 hidden sm:block z-[1000] pointer-events-auto">
            <div className="flex items-center space-x-3 text-white">
              <span className="text-[#00FFD2] font-bold">
                ● {selectedCorridorId === "ALL" ? `${trains.length} Total Trains` : `${activeCorridorTrains.length} Corridor Trains`}
              </span>
              <span className="text-[#FFFF00] font-bold">
                ● {selectedCorridorId === "ALL" ? `${maintenanceBlocks.length} Active Blocks` : `${activeCorridorBlocks.length} Active Blocks`}
              </span>
              <span className="text-[#6367FF] font-bold">
                ● {selectedCorridorId === "ALL" ? "10 Corridors Monitored" : "Kavach 100% Locked"}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Multi-Target Inspector Side Panel */}
        <div className="w-80 border-l-2 border-black bg-[#011B30] p-4 flex flex-col justify-between overflow-y-auto z-10 select-text">
          {/* A: When a Live Train is clicked */}
          {selectedTrain ? (
            <div className="space-y-4 animate-scale-up">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold bg-[#00FFD2] text-black border border-black px-2 py-0.5 rounded shadow-[1px_1px_0_#000000] uppercase">
                    Live Train Telemetry
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-black shadow-[1px_1px_0_#000000] ${
                      selectedTrain.status === "ON_TIME"
                        ? "bg-[#3DFDCE] text-black"
                        : "bg-[#FFFF00] text-black"
                    }`}
                  >
                    {selectedTrain.status.replace("_", " ")}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-1">{selectedTrain.name}</h4>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  Train #{selectedTrain.trainNumber} • {selectedTrain.type}
                </p>
              </div>

              {/* Speedometer & Delay */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-[#022642] border-2 border-black shadow-[2px_2px_0_#000000]">
                  <p className="text-[10px] text-slate-300 font-semibold uppercase">Current Speed</p>
                  <p className="text-2xl font-extrabold text-[#00FFD2] font-mono mt-0.5">
                    {selectedTrain.speedKmph} <span className="text-xs font-normal">km/h</span>
                  </p>
                  <p className="text-[9px] text-slate-400">Max: {selectedTrain.maxSpeedKmph} km/h</p>
                </div>

                <div className="p-3 rounded-xl bg-[#022642] border-2 border-black shadow-[2px_2px_0_#000000]">
                  <p className="text-[10px] text-slate-300 font-semibold uppercase">Schedule Status</p>
                  <p className={`text-2xl font-extrabold font-mono mt-0.5 ${selectedTrain.delayMinutes === 0 ? "text-[#3DFDCE]" : "text-[#FFFF00]"}`}>
                    {selectedTrain.delayMinutes === 0 ? "RT" : `+${selectedTrain.delayMinutes}m`}
                  </p>
                  <p className="text-[9px] text-slate-400">{selectedTrain.delayMinutes === 0 ? "Right Time" : "Minutes Delay"}</p>
                </div>
              </div>

              {/* Route Trajectory Progress */}
              <div className="p-3 rounded-xl bg-[#022642] border-2 border-black shadow-[2px_2px_0_#000000] space-y-2 text-xs">
                <div className="flex justify-between text-white font-medium">
                  <span>Current: <strong className="text-[#6367FF]">{selectedTrain.currentStation}</strong></span>
                  <span>Next: <strong className="text-[#00FFD2]">{selectedTrain.nextStation}</strong></span>
                </div>
                <div className="w-full bg-[#000D18] h-2.5 rounded-full overflow-hidden border border-black">
                  <div className="bg-[#00FFD2] h-full rounded-full" style={{ width: `${selectedTrain.progressPercent}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                  <span>Corridor: {selectedTrain.corridorId}</span>
                  <span>Kavach Radio: {selectedTrain.kavachActive ? "LOCKED" : "OFF"}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedTrain(null)}
                  className="w-full py-2 rounded-xl bg-[#022642] hover:bg-[#03345A] border-2 border-black shadow-[2px_2px_0_#000000] text-xs font-bold text-white transition cursor-pointer"
                >
                  Close Train Telemetry
                </button>
              </div>
            </div>
          ) : selectedBlock ? (
            /* B: When an Active Track Block Zone is clicked */
            <div className="space-y-4 animate-scale-up">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold bg-[#FF2A6D] text-white border border-black shadow-[1px_1px_0_#000000] px-2 py-0.5 rounded uppercase">
                    Active Track Block Zone
                  </span>
                  <span className="text-xs text-[#FFFF00] font-mono font-bold">{selectedBlock.timeRemaining}</span>
                </div>
                <h4 className="text-base font-bold text-white mt-1">{selectedBlock.name}</h4>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  {selectedBlock.corridorId} • KM {selectedBlock.startKm} to KM {selectedBlock.endKm}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#022642] border-2 border-black shadow-[2px_2px_0_#000000] text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Caution Restriction:</span>
                  <span className="text-[#FF2A6D] font-mono font-extrabold text-sm">{selectedBlock.speedRestrictionKmph} km/h Caution</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Activity Type:</span>
                  <span className="text-white font-bold">{selectedBlock.blockType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Responsible Dept:</span>
                  <span className="text-[#00FFD2] font-mono font-bold">{selectedBlock.responsibleDept}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/central/bundling"
                  className="w-full py-2.5 rounded-xl bg-[#6367FF] hover:bg-[#5255e3] text-white text-xs font-bold border-2 border-black shadow-[2px_2px_0_#000000] flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Optimize in Task Bundler</span>
                </Link>

                <button
                  onClick={() => setSelectedBlock(null)}
                  className="w-full py-2 rounded-xl bg-[#022642] hover:bg-[#03345A] text-xs font-bold text-white transition border-2 border-black shadow-[2px_2px_0_#000000] cursor-pointer"
                >
                  Dismiss Block View
                </button>
              </div>
            </div>
          ) : selectedStation ? (
            /* C: When a Station Node is clicked */
            <div className="space-y-4 animate-scale-up">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold bg-[#6367FF] text-white border border-black shadow-[1px_1px_0_#000000] px-2 py-0.5 rounded uppercase">
                    Station Diagnostics
                  </span>
                  <RiskBadge risk={selectedStation.status} />
                </div>
                <h4 className="text-base font-bold text-white mt-1">{selectedStation.name}</h4>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  Station Code: {selectedStation.code} • KM {selectedStation.km}
                </p>
              </div>

              {/* Station Telemetry & Interlocking */}
              <div className="p-3 rounded-xl bg-[#022642] border-2 border-black shadow-[2px_2px_0_#000000] text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Interlocking State:</span>
                  <span className="text-[#3DFDCE] font-mono font-bold">Solid State (SSI) Normal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Active Track Block:</span>
                  <span className={selectedStation.hasActiveBlock ? "text-[#FF2A6D] font-bold" : "text-white"}>
                    {selectedStation.hasActiveBlock ? "YES (Track Closed)" : "No (Normal Clear)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Platform Lines:</span>
                  <span className="font-mono text-white">6 Tracks (Electrified)</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/central/digital-twin"
                  className="w-full py-2.5 rounded-xl bg-[#6367FF] hover:bg-[#5255e3] text-white text-xs font-bold border-2 border-black shadow-[2px_2px_0_#000000] flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Open 3D Digital Twin Sensor View</span>
                </Link>

                <button
                  onClick={() => setSelectedStation(null)}
                  className="w-full py-2 rounded-xl bg-[#022642] hover:bg-[#03345A] text-xs font-bold text-white transition border-2 border-black shadow-[2px_2px_0_#000000] cursor-pointer"
                >
                  Back to Corridor Overview
                </button>
              </div>
            </div>
          ) : selectedCautionZone ? (
            /* D: When a River Bridge, Mountain Slope, or Speed Limit Zone is clicked */
            <div className="space-y-4 animate-scale-up">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border border-black shadow-[1px_1px_0_#000000] ${
                    selectedCautionZone.type === "RIVER_BRIDGE"
                      ? "bg-[#00FFD2] text-black"
                      : selectedCautionZone.type === "GHAT_SLOPE"
                      ? "bg-[#FFFF00] text-black"
                      : selectedCautionZone.type === "SPEED_LIMIT"
                      ? "bg-[#FF7A00] text-black"
                      : "bg-[#FF2A6D] text-white"
                  }`}>
                    {selectedCautionZone.type.replace("_", " ")}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#FF2A6D]">
                    {selectedCautionZone.severity}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-1">{selectedCautionZone.name}</h4>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  {selectedCautionZone.corridorId} • {selectedCautionZone.locationKm}
                </p>
              </div>

              {/* Speed Restriction & Environmental Condition */}
              <div className="p-3 rounded-xl bg-[#022642] border-2 border-black shadow-[2px_2px_0_#000000] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Restricted Speed:</span>
                  <span className="text-[#FF2A6D] font-mono font-extrabold text-sm">
                    {selectedCautionZone.speedLimitKmph} km/h Caution
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-300">Normal Permissible:</span>
                  <span className="text-white font-mono">{selectedCautionZone.normalSpeedKmph} km/h</span>
                </div>
                <div className="border-t border-black/40 pt-2">
                  <p className="text-[10px] font-bold text-[#00FFD2] uppercase tracking-wider">Environmental Condition:</p>
                  <p className="text-xs text-white mt-0.5">{selectedCautionZone.environmentalCondition}</p>
                </div>
              </div>

              {/* Description */}
              <div className="p-3 rounded-xl bg-[#022642] border-2 border-black shadow-[2px_2px_0_#000000] text-xs text-slate-200 leading-relaxed">
                {selectedCautionZone.conditionDescription}
              </div>

              {/* Sensor Telemetry */}
              {selectedCautionZone.sensorTelemetry && selectedCautionZone.sensorTelemetry.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-mono font-bold text-[#00FFD2] uppercase">Live Environmental Sensors</p>
                  <div className="space-y-1">
                    {selectedCautionZone.sensorTelemetry.map((s, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-[#022642] border border-black shadow-[1px_1px_0_#000000] text-[11px] font-mono flex items-center justify-between">
                        <span className="text-slate-300">{s.sensorName}</span>
                        <span className={s.status === "ALERT" ? "text-[#FFFF00] font-bold" : "text-[#3DFDCE] font-bold"}>
                          {s.reading}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compliance & Rules */}
              <div className="p-2.5 rounded-lg bg-[#000D18] border border-black text-[10px] font-mono text-slate-300 space-y-1">
                <div>Dept: <strong className="text-white">{selectedCautionZone.departmentResponsible}</strong></div>
                <div>Rule: <strong className="text-[#FFFF00]">{selectedCautionZone.statutoryRule}</strong></div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedCautionZone(null)}
                  className="w-full py-2 rounded-xl bg-[#022642] hover:bg-[#03345A] text-xs font-bold text-white transition border-2 border-black shadow-[2px_2px_0_#000000] cursor-pointer"
                >
                  Close Hazard Inspector
                </button>
              </div>
            </div>
          ) : selectedCorridorId === "ALL" ? (
            /* D: National Network All Corridors Overview */
            <div className="space-y-4 animate-scale-up">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold bg-[#00FFD2] text-black border border-black px-2 py-0.5 rounded shadow-[1px_1px_0_#000000] uppercase tracking-widest">
                    National Grid Inspector
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#3DFDCE] text-black border border-black shadow-[1px_1px_0_#000000]">
                    ALL 10 ROUTES ACTIVE
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">Pan-India Rail Network</h4>
                <p className="text-xs text-slate-300 font-mono mt-0.5">National OCC • Ministry of Railways</p>
              </div>

              {/* All Corridors Quick Metrics */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-[#022642] border-2 border-black shadow-[2px_2px_0_#000000]">
                  <p className="text-[10px] text-slate-300 font-semibold">Total Network</p>
                  <p className="text-sm font-bold text-white font-mono">11,881 KM</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#022642] border-2 border-black shadow-[2px_2px_0_#000000]">
                  <p className="text-[10px] text-slate-300 font-semibold">Live Trains</p>
                  <p className="text-sm font-bold text-[#00FFD2] font-mono">{trains.length} Active</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#022642] border-2 border-black shadow-[2px_2px_0_#000000]">
                  <p className="text-[10px] text-slate-300 font-semibold">Active Blocks</p>
                  <p className="text-sm font-bold text-[#FFFF00] font-mono">{maintenanceBlocks.length} Zones</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#022642] border-2 border-black shadow-[2px_2px_0_#000000]">
                  <p className="text-[10px] text-slate-300 font-semibold">Corridors</p>
                  <p className="text-sm font-bold text-[#3DFDCE] font-mono">{availableCorridors.length} Tracked</p>
                </div>
              </div>

              {/* National Corridor Roster with click-to-focus */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-[#00FFD2] uppercase tracking-wider">
                    All Corridors Roster
                  </p>
                  <span className="text-[10px] text-[#FFFF00] font-mono">Click to Focus</span>
                </div>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {availableCorridors.map((c) => {
                    const cTrains = trains.filter((t) => t.corridorId === c.id);
                    const cBlocks = maintenanceBlocks.filter((b) => b.corridorId === c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          handleCorridorClick(c);
                          setViewMode("FOCUS");
                        }}
                        className="p-2 rounded-lg text-xs bg-[#022642] border-2 border-black shadow-[2px_2px_0_#000000] text-slate-200 hover:bg-[#03345A] cursor-pointer transition group"
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: getStatusColor(c.status) }} />
                            <span className="font-bold text-white group-hover:text-[#00FFD2] font-mono">{c.id}</span>
                            <span className="text-[9px] text-slate-300 font-mono">({c.zone})</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#3DFDCE] font-bold">{c.totalLengthKm} KM</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-300">
                          <span className="truncate max-w-[160px]">{c.name.split("(")[0]}</span>
                          <span className="text-[#00FFD2] font-mono font-semibold">{cTrains.length} trn • {cBlocks.length} blk</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-black/40">
                <Link
                  href="/central/bundling"
                  className="w-full py-2.5 rounded-xl bg-[#6367FF] hover:bg-[#5255e3] text-white text-xs font-bold border-2 border-black shadow-[2px_2px_0_#000000] flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Cross-Corridor Task Bundler</span>
                </Link>
              </div>
            </div>
          ) : activeCorridor ? (
            /* E: Default Single Corridor Overview */
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold bg-[#6367FF] text-white border border-black px-2 py-0.5 rounded shadow-[1px_1px_0_#000000] uppercase tracking-widest">
                    Corridor Inspector
                  </span>
                  <RiskBadge risk={activeCorridor.status} />
                </div>
                <h4 className="text-base font-bold text-white">{activeCorridor.name}</h4>
                <p className="text-xs text-slate-300 font-mono mt-0.5">{activeCorridor.route}</p>
              </div>

              {/* Corridor Quick Metrics */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-[#022642] border-2 border-black shadow-[2px_2px_0_#000000]">
                  <p className="text-[10px] text-slate-300 font-semibold">Total Length</p>
                  <p className="text-sm font-bold text-white font-mono">{activeCorridor.totalLengthKm} KM</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#022642] border-2 border-black shadow-[2px_2px_0_#000000]">
                  <p className="text-[10px] text-slate-300 font-semibold">Live Trains</p>
                  <p className="text-sm font-bold text-[#00FFD2] font-mono">{activeCorridorTrains.length}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#022642] border-2 border-black shadow-[2px_2px_0_#000000]">
                  <p className="text-[10px] text-slate-300 font-semibold">Active Blocks</p>
                  <p className="text-sm font-bold text-[#FFFF00] font-mono">{activeCorridorBlocks.length}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#022642] border-2 border-black shadow-[2px_2px_0_#000000]">
                  <p className="text-[10px] text-slate-300 font-semibold">Critical Spots</p>
                  <p className="text-sm font-bold text-[#FF2A6D] font-mono">{activeCorridor.criticalSpotsCount}</p>
                </div>
              </div>

              {/* Station Node Quick Selector */}
              <div>
                <p className="text-xs font-bold text-[#00FFD2] uppercase tracking-wider mb-2">
                  Corridor Stations & Yard Points
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {activeCorridor.stations.map((stn) => (
                    <div
                      key={stn.code}
                      onClick={() => setSelectedStation(stn)}
                      className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition border-2 border-black shadow-[1px_1px_0_#000000] ${
                        selectedStation?.code === stn.code
                          ? "bg-[#6367FF] text-white font-bold"
                          : "bg-[#022642] text-slate-200 hover:bg-[#03345A]"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full border border-black ${
                            stn.hasActiveBlock ? "bg-[#FF2A6D] animate-pulse" : "bg-[#3DFDCE]"
                          }`}
                        />
                        <span className="font-semibold">{stn.name}</span>
                        <span className={`text-[10px] font-mono ${selectedStation?.code === stn.code ? "text-white" : "text-[#00FFD2]"}`}>({stn.code})</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-300">KM {stn.km}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-black/40">
                <button
                  onClick={() => setSelectedCorridorId(activeCorridor.id)}
                  className="w-full py-2.5 rounded-xl bg-[#022642] hover:bg-[#03345A] border-2 border-black shadow-[2px_2px_0_#000000] text-xs font-bold text-white flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <span>Filter Platform to {activeCorridor.id}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#00FFD2]" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
