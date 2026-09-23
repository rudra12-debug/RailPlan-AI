"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Sliders, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Train, 
  Calendar, 
  Sparkles, 
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  MapPin,
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckSquare,
  FileText,
  Download,
  Zap,
  ArrowRight,
  TrendingDown,
  ChevronRight,
  Flame,
  Info,
  Layers,
  Wrench,
  BarChart3,
  Plus,
  Minus
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { useRailPlan, ZONE_CORRIDOR_MAP } from "@/context/RailPlanContext";
import { DepartmentId, RequestPriority } from "@/lib/types";

interface UnifiedScenarioTask {
  id: string;
  title: string;
  departmentId: DepartmentId;
  targetDepartment?: DepartmentId;
  corridorId: string;
  locationKm: string;
  assetName: string;
  assetType: string;
  baseCost: number;
  baseRisk: number;
  scheduledDate: string;
  durationHours: number;
  priority: RequestPriority | string;
  sourceType: "MAINTENANCE_TASK" | "SERVICE_REQUEST";
  description?: string;
}

export const WhatIfSimulator: React.FC = () => {
  const { 
    maintenanceTasks, 
    requests, 
    corridors, 
    selectedCorridorId, 
    setSelectedCorridorId, 
    selectedZone 
  } = useRailPlan();

  // Combine MaintenanceTasks & ServiceRequests into a unified candidate pool
  const unifiedTasks = useMemo<UnifiedScenarioTask[]>(() => {
    const fromTasks: UnifiedScenarioTask[] = maintenanceTasks.map((t) => ({
      id: t.id,
      title: t.title,
      departmentId: t.departmentId,
      corridorId: t.corridorId || "NDLS-MMCT",
      locationKm: t.locationKm || "KM 148.0 - 156.0 (Mathura Section)",
      assetName: t.assetName || "60kg UIC Rail Track",
      assetType: t.assetType || "Track Infrastructure",
      baseCost: t.estimatedCost || 145000,
      baseRisk: t.riskScore || 35,
      scheduledDate: t.recommendedDate || "2026-08-24",
      durationHours: t.estimatedDurationHours || 4,
      priority: t.riskScore > 75 ? "CRITICAL" : t.riskScore > 50 ? "HIGH" : "MEDIUM",
      sourceType: "MAINTENANCE_TASK",
      description: `Scheduled maintenance on ${t.assetName} at ${t.locationKm}. Requires dedicated block window.`,
    }));

    const fromRequests: UnifiedScenarioTask[] = requests.map((r) => ({
      id: r.id,
      title: r.title,
      departmentId: (r.requestingDepartment || "ENG") as DepartmentId,
      targetDepartment: (r.assignedToDepartment || r.targetDepartment || "ELEC") as DepartmentId,
      corridorId: r.corridorId || "NDLS-MMCT",
      locationKm: r.locationKm || "KM 148.0 - 154.0 (Mathura Section)",
      assetName: r.requestType || "OHE & P-Way Joint Section",
      assetType: r.requestType || "Inter-Departmental Support",
      baseCost: r.estimatedCost || 402000,
      baseRisk: r.aiRiskScore || 45,
      scheduledDate: r.requiredDate || r.submissionDate || "2026-08-28",
      durationHours: 4,
      priority: r.priority || "HIGH",
      sourceType: "SERVICE_REQUEST",
      description: r.description,
    }));

    return [...fromRequests, ...fromTasks];
  }, [maintenanceTasks, requests]);

  // Filters State
  const [taskSearch, setTaskSearch] = useState<string>("");
  const [filterType, setFilterType] = useState<"ALL" | "SERVICE_REQUEST" | "MAINTENANCE_TASK">("ALL");
  const [filterDept, setFilterDept] = useState<string>("ALL");
  const [filterCorridor, setFilterCorridor] = useState<string>(() => selectedCorridorId || "ALL");
  
  // Selected active task (Default to SR-1042 or first available task)
  const [selectedTaskId, setSelectedTaskId] = useState<string>(() => {
    return "SR-1042"; // Default highlighted task for Mathura 148km section
  });

  // Sync with global corridor selection
  useEffect(() => {
    if (selectedCorridorId && selectedCorridorId !== "ALL") {
      setFilterCorridor(selectedCorridorId);
    }
  }, [selectedCorridorId]);

  // Available corridors based on zone
  const availableCorridors = useMemo(() => {
    const allowed = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    return corridors.filter((c) => allowed.includes(c.id));
  }, [corridors, selectedZone]);

  // Filtered Task List
  const filteredTasks = useMemo(() => {
    const allowedZoneCorridors = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];

    return unifiedTasks.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
        item.id.toLowerCase().includes(taskSearch.toLowerCase()) ||
        item.locationKm.toLowerCase().includes(taskSearch.toLowerCase()) ||
        item.assetName.toLowerCase().includes(taskSearch.toLowerCase()) ||
        item.departmentId.toLowerCase().includes(taskSearch.toLowerCase());

      const matchesCorridor =
        filterCorridor === "ALL"
          ? allowedZoneCorridors.includes(item.corridorId)
          : item.corridorId === filterCorridor;

      const matchesDept = filterDept === "ALL" || item.departmentId === filterDept;
      const matchesType = filterType === "ALL" || item.sourceType === filterType;

      return matchesSearch && matchesCorridor && matchesDept && matchesType;
    });
  }, [unifiedTasks, taskSearch, filterCorridor, filterDept, filterType, selectedZone]);

  // Active Target Task
  const activeTask = useMemo<UnifiedScenarioTask>(() => {
    const found = unifiedTasks.find((t) => t.id === selectedTaskId);
    if (found) return found;
    return unifiedTasks[0] || {
      id: "SR-1042",
      title: "25kV OHE Power Block & Catenary Support for Track Relay",
      departmentId: "ENG",
      targetDepartment: "ELEC",
      corridorId: "NDLS-MMCT",
      locationKm: "KM 148.0 - 154.0 (Mathura Section)",
      assetName: "25kV Catenary Wire & 60kg Track",
      assetType: "Joint OHE/Track Block",
      baseCost: 402000,
      baseRisk: 30,
      scheduledDate: "2026-08-28",
      durationHours: 4,
      priority: "HIGH",
      sourceType: "SERVICE_REQUEST",
    };
  }, [selectedTaskId, unifiedTasks]);

  // Simulation Variables State
  const [delayDays, setDelayDays] = useState<number>(14); // Default 14 days delay to show immediate impact
  const [workforcePercent, setWorkforcePercent] = useState<number>(80);
  const [equipmentPercent, setEquipmentPercent] = useState<number>(85);
  const [trafficMgt, setTrafficMgt] = useState<number>(90);
  const [monsoonSeverity, setMonsoonSeverity] = useState<"LOW" | "MEDIUM" | "HIGH" | "EXTREME">("HIGH");
  const [isMitigated, setIsMitigated] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // When task changes, reset mitigation flag and keep sensible delay
  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsMitigated(false);
  };

  // Detailed Dynamic Simulation Engine
  const simulationResults = useMemo(() => {
    const baseCost = activeTask.baseCost;
    const baseRisk = activeTask.baseRisk;

    // Daily escalation rate based on department and asset type
    const dailyEscalationRate = Math.round(baseCost * 0.048); // ~4.8% base cost increase per day of delay

    // Itemized Cost Overrun Breakdown
    const laborOvertimeCost = Math.round(
      delayDays * (baseCost * 0.016) + ((100 - workforcePercent) * (baseCost * 0.003))
    );
    const machineryIdleCost = Math.round(
      delayDays * (baseCost * 0.015) + ((100 - equipmentPercent) * (baseCost * 0.004))
    );
    const speedRestrictionLoss = Math.round(
      delayDays * (baseCost * 0.012) + (trafficMgt * 250)
    );
    const freightDetentionCost = Math.round(
      delayDays * (baseCost * 0.009) + (trafficMgt * 180)
    );

    const totalCostEscalation = laborOvertimeCost + machineryIdleCost + speedRestrictionLoss + freightDetentionCost;
    const projectedTotalCost = baseCost + totalCostEscalation;
    const costEscalationPercentage = ((totalCostEscalation / baseCost) * 100).toFixed(1);

    // Dynamic Failure Probability Calculation
    let calculatedRisk = baseRisk;
    calculatedRisk += delayDays * 3.8; // +3.8% risk per day delayed
    calculatedRisk += (100 - workforcePercent) * 0.35;
    calculatedRisk += (100 - equipmentPercent) * 0.40;
    calculatedRisk += (trafficMgt - 60) * 0.25;

    if (monsoonSeverity === "EXTREME") calculatedRisk += 22;
    else if (monsoonSeverity === "HIGH") calculatedRisk += 14;
    else if (monsoonSeverity === "MEDIUM") calculatedRisk += 6;

    if (isMitigated) {
      calculatedRisk = Math.max(12, baseRisk * 0.5); // AI mitigation brings risk way down
    }

    const failureProbability = Math.min(99.4, Math.max(8.0, calculatedRisk));

    // Punctuality & Passenger Impact
    const isFreightOnly = activeTask.corridorId === "WDFC-01";
    const dailyTrainsImpacted = Math.round(8 + (delayDays * 0.9) + (trafficMgt * 0.08));
    const extraDelayPerTrain = Math.round(5 + (delayDays * 2.2) + ((100 - workforcePercent) * 0.15));
    const totalPassengerDisruption = isFreightOnly 
      ? 0 
      : Math.round(dailyTrainsImpacted * extraDelayPerTrain * 28); // Commuter passenger-minutes

    // Projected Revised Date
    const scheduled = new Date(activeTask.scheduledDate);
    const revisedDateObj = new Date(scheduled);
    revisedDateObj.setDate(scheduled.getDate() + delayDays);
    const revisedDateStr = revisedDateObj.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Asset-specific failure hazard description
    let hazardDescription = "";
    if (activeTask.assetType.toLowerCase().includes("ohe") || activeTask.title.toLowerCase().includes("catenary")) {
      hazardDescription = delayDays > 10 
        ? "Severe Catenary sag (>60mm). Critical risk of pantograph entanglement on 25kV line, risking total corridor power outage."
        : "Moderate contact wire tension loss. Speed restriction of 75 km/h recommended during peak heat.";
    } else if (activeTask.assetType.toLowerCase().includes("signal") || activeTask.title.toLowerCase().includes("point")) {
      hazardDescription = delayDays > 10 
        ? "Turnout point machine tongue out-of-correspondence. Manual clamping required, reducing track junction throughput by 60%."
        : "Axle counter drift observed. Potential phantom red signals on UP line.";
    } else if (activeTask.assetType.toLowerCase().includes("bridge")) {
      hazardDescription = delayDays > 10 
        ? "Micro-fracture propagation in pier girder bearings under heavy 25T axle loads. Severe safety restriction."
        : "Corrosion accumulation on steel girders requiring expedited hydro-jet cleaning.";
    } else {
      hazardDescription = delayDays > 10 
        ? "Continuous Welded Rail (CWR) thermal stress exceeding 320 MPa. High risk of rail fracture & derailment."
        : "Track geometry degradation. Track gauge widening > 4mm under high-speed traffic.";
    }

    return {
      baseCost,
      baseRisk,
      dailyEscalationRate,
      projectedTotalCost: isMitigated ? Math.round(baseCost * 1.05) : projectedTotalCost,
      totalCostEscalation: isMitigated ? Math.round(baseCost * 0.05) : totalCostEscalation,
      costEscalationPercentage: isMitigated ? "5.0" : costEscalationPercentage,
      laborOvertimeCost: isMitigated ? Math.round(laborOvertimeCost * 0.2) : laborOvertimeCost,
      machineryIdleCost: isMitigated ? Math.round(machineryIdleCost * 0.1) : machineryIdleCost,
      speedRestrictionLoss: isMitigated ? Math.round(speedRestrictionLoss * 0.15) : speedRestrictionLoss,
      freightDetentionCost: isMitigated ? Math.round(freightDetentionCost * 0.1) : freightDetentionCost,
      failureProbability: Number(failureProbability.toFixed(1)),
      dailyTrainsImpacted: isMitigated ? 2 : dailyTrainsImpacted,
      extraDelayPerTrain: isMitigated ? 2 : extraDelayPerTrain,
      totalPassengerDisruption: isMitigated ? 400 : totalPassengerDisruption,
      revisedDateStr,
      hazardDescription,
    };
  }, [activeTask, delayDays, workforcePercent, equipmentPercent, trafficMgt, monsoonSeverity, isMitigated]);

  // Chart View Filter Mode
  const [chartViewMode, setChartViewMode] = useState<"BOTH" | "COST" | "RISK">("BOTH");

  // Multi-point Mathematical Trajectory Generator (Day 0 to Day 45)
  const trajectoryData = useMemo(() => {
    const days = [0, 3, 6, 9, 12, 15, 18, 21, 25, 30, 35, 40, 45];
    const baseCost = activeTask.baseCost;
    const baseRisk = activeTask.baseRisk;

    return days.map((d) => {
      // Escalated Cost at day d
      const costMult = 1 + (d * 0.048) + ((100 - workforcePercent) * 0.003) + ((100 - equipmentPercent) * 0.004);
      const estCost = Math.round(baseCost * costMult);
      
      // Risk at day d
      let riskVal = baseRisk + (d * 3.8) + ((100 - workforcePercent) * 0.35) + ((100 - equipmentPercent) * 0.40);
      if (monsoonSeverity === "EXTREME") riskVal += 22;
      else if (monsoonSeverity === "HIGH") riskVal += 14;
      else if (monsoonSeverity === "MEDIUM") riskVal += 6;
      const finalRisk = Math.min(99.4, Math.max(8.0, riskVal));

      // X coordinate in SVG (viewBox 0 0 500 170, left pad 45, width 420)
      const svgX = 45 + (d / 45) * 420;

      // Y coordinate for Risk (0% at y: 140, 100% at y: 25)
      const riskY = 140 - (finalRisk / 100) * 115;

      // Y coordinate for Cost (1.0x at y: 135, 3.2x at y: 25)
      const costRatio = estCost / baseCost;
      const normalizedCostPercent = Math.min(100, Math.max(4, ((costRatio - 0.95) / 2.25) * 100));
      const costY = 140 - (normalizedCostPercent / 100) * 115;

      return {
        day: d,
        cost: estCost,
        risk: Number(finalRisk.toFixed(1)),
        svgX,
        riskY,
        costY,
      };
    });
  }, [activeTask, workforcePercent, equipmentPercent, monsoonSeverity]);

  // Current active cursor position
  const activeCursor = useMemo(() => {
    const svgX = 45 + (delayDays / 45) * 420;
    const riskY = 140 - (simulationResults.failureProbability / 100) * 115;
    const costRatio = simulationResults.projectedTotalCost / activeTask.baseCost;
    const normalizedCostPercent = Math.min(100, Math.max(4, ((costRatio - 0.95) / 2.25) * 100));
    const costY = 140 - (normalizedCostPercent / 100) * 115;

    return { svgX, riskY, costY };
  }, [delayDays, simulationResults, activeTask]);

  // Construct SVG Path Strings
  const { riskPathD, costPathD, riskAreaD, costAreaD } = useMemo(() => {
    if (trajectoryData.length === 0) return { riskPathD: "", costPathD: "", riskAreaD: "", costAreaD: "" };

    const riskPoints = trajectoryData.map((p) => `${p.svgX.toFixed(1)},${p.riskY.toFixed(1)}`).join(" L ");
    const costPoints = trajectoryData.map((p) => `${p.svgX.toFixed(1)},${p.costY.toFixed(1)}`).join(" L ");

    const riskPath = `M ${riskPoints}`;
    const costPath = `M ${costPoints}`;

    const firstX = trajectoryData[0].svgX.toFixed(1);
    const lastX = trajectoryData[trajectoryData.length - 1].svgX.toFixed(1);

    const riskArea = `M ${riskPoints} L ${lastX},140 L ${firstX},140 Z`;
    const costArea = `M ${costPoints} L ${lastX},140 L ${firstX},140 Z`;

    return { riskPathD: riskPath, costPathD: costPath, riskAreaD: riskArea, costAreaD: costArea };
  }, [trajectoryData]);

  // Presets
  const applyPreset = (preset: "ontime" | "delay7" | "delay14" | "delay30" | "monsoon" | "ai_optimal") => {
    setIsMitigated(false);
    switch (preset) {
      case "ontime":
        setDelayDays(0);
        setWorkforcePercent(100);
        setEquipmentPercent(100);
        setTrafficMgt(60);
        setMonsoonSeverity("LOW");
        break;
      case "delay7":
        setDelayDays(7);
        setWorkforcePercent(85);
        setEquipmentPercent(90);
        setTrafficMgt(75);
        setMonsoonSeverity("MEDIUM");
        break;
      case "delay14":
        setDelayDays(14);
        setWorkforcePercent(70);
        setEquipmentPercent(80);
        setTrafficMgt(90);
        setMonsoonSeverity("HIGH");
        break;
      case "delay30":
        setDelayDays(30);
        setWorkforcePercent(45);
        setEquipmentPercent(50);
        setTrafficMgt(110);
        setMonsoonSeverity("EXTREME");
        break;
      case "monsoon":
        setDelayDays(18);
        setWorkforcePercent(60);
        setEquipmentPercent(65);
        setTrafficMgt(95);
        setMonsoonSeverity("EXTREME");
        break;
      case "ai_optimal":
        setIsMitigated(true);
        setDelayDays(0);
        setWorkforcePercent(100);
        setEquipmentPercent(100);
        setTrafficMgt(60);
        setMonsoonSeverity("LOW");
        setNotificationMsg(`AI Optimization Applied: Integrated 01:30-05:30 AM block window reserved for ${activeTask.id}. Cost escalation neutralized to zero!`);
        setTimeout(() => setNotificationMsg(null), 5000);
        break;
    }
  };

  const handleApplyMitigation = () => {
    setIsMitigated(true);
    setDelayDays(0);
    setNotificationMsg(`Mitigation Strategy Active: Dispatched backup crew & bundled OHE/P-Way block window for ${activeTask.id}. Risk reduced to 12%!`);
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  const handleExportScenario = () => {
    const csvHeader = "Scenario_Report,Task_ID,Task_Title,Corridor,Department,Scheduled_Date,Revised_Date,Delay_Days,Base_Cost_INR,Projected_Cost_INR,Cost_Overrun_INR,Overrun_Pct,Failure_Risk_Pct,Trains_Impacted,Avg_Delay_Mins\n";
    const csvRow = `"What-If Simulation","${activeTask.id}","${activeTask.title.replace(/"/g, '""')}","${activeTask.corridorId}","${activeTask.departmentId}","${activeTask.scheduledDate}","${simulationResults.revisedDateStr}",${delayDays},${simulationResults.baseCost},${simulationResults.projectedTotalCost},${simulationResults.totalCostEscalation},${simulationResults.costEscalationPercentage}%,${simulationResults.failureProbability}%,${simulationResults.dailyTrainsImpacted},${simulationResults.extraDelayPerTrain}`;
    
    const blob = new Blob([csvHeader + csvRow], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `WhatIf_Simulation_${activeTask.id}_${delayDays}DaysDelay.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/90 via-navy-900 to-navy-950 border border-purple-500/30 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-glow-purple">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-100">
                Task-Centric What-If & Delay Impact Simulator
              </h2>
              <span className="text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-700 px-2.5 py-0.5 rounded uppercase">
                Dynamic Cost & Risk Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any maintenance request or task below, adjust the delay period slider, and see immediate real-time cost escalation and safety risk impacts.
            </p>
          </div>
        </div>

        {/* Quick Scenario Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-semibold hidden md:inline">Quick Scenarios:</span>
          <button
            onClick={() => applyPreset("ontime")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
              delayDays === 0 && !isMitigated
                ? "bg-emerald-600 text-white border-emerald-400 shadow-glow-emerald"
                : "bg-slate-800 text-emerald-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            0 Days (On-Time)
          </button>
          <button
            onClick={() => applyPreset("delay7")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
              delayDays === 7
                ? "bg-cyan-600 text-white border-cyan-400 shadow-glow-cyan"
                : "bg-slate-800 text-cyan-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            +7 Days Delay
          </button>
          <button
            onClick={() => applyPreset("delay14")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
              delayDays === 14
                ? "bg-amber-600 text-white border-amber-400 shadow-glow-amber"
                : "bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            +14 Days (Critical)
          </button>
          <button
            onClick={() => applyPreset("delay30")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
              delayDays === 30
                ? "bg-rose-600 text-white border-rose-400 shadow-glow-rose"
                : "bg-slate-800 text-rose-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            +30 Days (Failure)
          </button>
          <button
            onClick={() => applyPreset("ai_optimal")}
            title="Auto-solve for zero delay and optimal safety"
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white border border-purple-400/50 shadow-glow-purple flex items-center space-x-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>AI Zero-Loss Solver</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-glow-emerald animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-emerald-400 hover:text-white text-xs ml-2">
            ✕
          </button>
        </div>
      )}

      {/* STEP 1: Interactive Task Selection Console */}
      <div className="p-5 rounded-2xl bg-navy-900/95 border border-slate-700/80 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                <span>Step 1: Select Target Maintenance Work Order or Service Request</span>
                <span className="text-[11px] font-mono text-cyan-400 font-normal">
                  ({filteredTasks.length} Available)
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Click any work order below to simulate its cost escalation curve and operational impacts.
              </p>
            </div>
          </div>

          {/* Quick Category Filters */}
          <div className="flex items-center space-x-1 bg-navy-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                filterType === "ALL" ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All ({unifiedTasks.length})
            </button>
            <button
              onClick={() => setFilterType("SERVICE_REQUEST")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                filterType === "SERVICE_REQUEST" ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Service Requests ({requests.length})
            </button>
            <button
              onClick={() => setFilterType("MAINTENANCE_TASK")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                filterType === "MAINTENANCE_TASK" ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tasks ({maintenanceTasks.length})
            </button>
          </div>
        </div>

        {/* Task Search and Dropdown Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Task ID, Mathura, 148 KM, OHE, Track, Signal..."
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-navy-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          {/* Corridor Dropdown */}
          <div className="sm:col-span-4">
            <select
              value={filterCorridor}
              onChange={(e) => {
                setFilterCorridor(e.target.value);
                setSelectedCorridorId(e.target.value);
              }}
              className="w-full bg-navy-950 border border-slate-700 text-cyan-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 font-mono font-bold"
            >
              <option value="ALL">All Corridors ({corridors.length})</option>
              {availableCorridors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} - {c.name.split("(")[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Department Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Directorates (Civil, Electrical/OHE, Signal & Traffic, Safety)</option>
              <option value="ENG">Civil (Track & P-Way)</option>
              <option value="ELEC">Electrical/OHE (25kV Traction)</option>
              <option value="SNT">Signal & Traffic (Kavach / S&T)</option>
              <option value="SFTY">Safety (CRS Compliance)</option>
            </select>
          </div>
        </div>

        {/* Task Selection Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
          {filteredTasks.map((t) => {
            const isSelected = selectedTaskId === t.id;
            return (
              <div
                key={t.id}
                onClick={() => handleSelectTask(t.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between text-left ${
                  isSelected
                    ? "bg-cyan-950/80 border-cyan-400 shadow-glow-cyan text-cyan-100 ring-2 ring-cyan-500/40"
                    : "bg-navy-950/70 border-slate-800 hover:border-slate-700 hover:bg-navy-950 text-slate-400"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono font-bold text-cyan-400">
                      {t.id}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      t.priority === "CRITICAL" ? "bg-rose-950 text-rose-300 border border-rose-800" :
                      t.priority === "HIGH" ? "bg-amber-950 text-amber-300 border border-amber-800" :
                      "bg-slate-800 text-slate-300"
                    }`}>
                      {t.departmentId} {t.targetDepartment ? `→ ${t.targetDepartment}` : ""}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-200 line-clamp-2 leading-tight">
                    {t.title}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 truncate max-w-[120px]">{t.locationKm}</span>
                  <span className="text-amber-300 font-extrabold">{formatINR(t.baseCost)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Task Highlight Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/90 via-navy-900 to-indigo-950/90 border border-cyan-500/60 flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-glow-cyan shrink-0">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
                  ACTIVE SIMULATION SUBJECT: {activeTask.id}
                </span>
                <span className="text-xs font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                  {activeTask.corridorId}
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-100 mt-1">
                {activeTask.title}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 flex flex-wrap gap-x-3">
                <span>Location: <strong className="text-slate-200">{activeTask.locationKm}</strong></span>
                <span>• Asset: <strong className="text-cyan-300">{activeTask.assetName}</strong></span>
                <span>• Dept: <strong className="text-amber-300">{activeTask.departmentId}</strong></span>
                <span>• Sanctioned Date: <strong className="text-emerald-300">{activeTask.scheduledDate}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-navy-950/80 px-4 py-2.5 rounded-xl border border-slate-700/80">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Sanctioned Baseline Cost</p>
              <p className="text-base font-extrabold text-amber-300 font-mono">
                {formatINR(activeTask.baseCost)}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Baseline Risk</p>
              <p className="text-base font-extrabold text-rose-400 font-mono">
                {activeTask.baseRisk}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 2 & 3: Simulator Sliders + Live Dynamic Impact Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Simulation Sliders (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-navy-900/95 border border-slate-700/80 p-5 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Step 2: Adjust Stress & Delay Sliders
              </span>
            </div>
            <button
              onClick={() => applyPreset("ontime")}
              className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* PRIMARY HERO SLIDER: Maintenance Delay Period */}
          <div className="p-4 rounded-xl bg-navy-950 border border-cyan-500/40 shadow-glow-cyan space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-100 flex items-center space-x-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Maintenance Delay Period</span>
                </span>
                <p className="text-[10px] text-slate-400">
                  Simulate work deferral or block sanction delays
                </p>
              </div>

              {/* Big Delay Counter Badge */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setDelayDays((prev) => Math.max(0, prev - 1))}
                  className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  title="Decrease 1 Day"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className={`text-sm font-mono font-extrabold px-3 py-1 rounded-lg border ${
                  delayDays === 0
                    ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                    : delayDays <= 7
                    ? "bg-amber-950 text-amber-300 border-amber-700"
                    : "bg-rose-950 text-rose-300 border-rose-700 animate-pulse"
                }`}>
                  +{delayDays} Days Delay
                </span>
                <button
                  onClick={() => setDelayDays((prev) => Math.min(45, prev + 1))}
                  className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  title="Increase 1 Day"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={delayDays}
              onChange={(e) => {
                setIsMitigated(false);
                setDelayDays(Number(e.target.value));
              }}
              className="w-full accent-cyan-400 bg-slate-900 h-2.5 rounded-lg cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span className={delayDays === 0 ? "text-emerald-400 font-bold" : ""}>0 Days (On Schedule)</span>
              <span className={delayDays >= 10 && delayDays <= 20 ? "text-amber-400 font-bold" : ""}>15 Days (Critical)</span>
              <span className={delayDays > 25 ? "text-rose-400 font-bold" : ""}>45 Days (Severe Overdue)</span>
            </div>

            {/* Quick Delay Step Buttons */}
            <div className="grid grid-cols-5 gap-1 pt-1">
              {[0, 3, 7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setIsMitigated(false);
                    setDelayDays(d);
                  }}
                  className={`py-1 rounded text-[10px] font-mono font-bold transition ${
                    delayDays === d
                      ? "bg-cyan-500 text-navy-950 font-black shadow-sm"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {d === 0 ? "0d" : `+${d}d`}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Variables */}
          <div className="space-y-4 pt-1">
            {/* Workforce Available */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Available Workforce & Gangs</span>
                <span className="font-mono font-bold text-amber-400">{workforcePercent}% Crew</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={workforcePercent}
                onChange={(e) => setWorkforcePercent(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>20% (Severe Shortage)</span>
                <span>100% (Full Crew)</span>
              </div>
            </div>

            {/* Equipment Availability */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Track Machine & Wagon Uptime</span>
                <span className="font-mono font-bold text-emerald-400">{equipmentPercent}% Uptime</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={equipmentPercent}
                onChange={(e) => setEquipmentPercent(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>20% (Breakdown)</span>
                <span>100% (Full Fleet)</span>
              </div>
            </div>

            {/* Train Traffic Density */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Corridor Traffic Density</span>
                <span className="font-mono font-bold text-purple-400">{trafficMgt} MGT / Day</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                value={trafficMgt}
                onChange={(e) => setTrafficMgt(Number(e.target.value))}
                className="w-full accent-purple-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>20 MGT (Low)</span>
                <span>120 MGT (Rajdhani/Freight Peak)</span>
              </div>
            </div>

            {/* Monsoon Weather */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Monsoon Flooding & Weather Stress</span>
                <span className="font-bold text-rose-400">{monsoonSeverity}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(["LOW", "MEDIUM", "HIGH", "EXTREME"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setMonsoonSeverity(lvl)}
                    className={`py-1.5 rounded text-[10px] font-bold transition ${
                      monsoonSeverity === lvl
                        ? "bg-rose-600 text-white shadow-glow-rose"
                        : "bg-navy-950 text-slate-400 border border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Output Impact Analytics (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-navy-900/95 border border-slate-700/80 p-5 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Step 3: Live Predicted Financial & Operational Impact
              </span>
            </div>
            <span className="text-xs font-mono text-cyan-300 font-semibold">
              Live Calculated Matrix
            </span>
          </div>

          {/* 4 High-Visibility KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Projected Escalated Cost */}
            <div className="p-3.5 rounded-xl bg-navy-950 border border-cyan-500/50 text-center space-y-1 shadow-glow-cyan">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Projected Cost</p>
              <p className="text-lg sm:text-xl font-extrabold text-cyan-300 font-mono">
                {formatINR(simulationResults.projectedTotalCost)}
              </p>
              <div className="flex items-center justify-center space-x-1">
                {simulationResults.totalCostEscalation > 0 ? (
                  <span className="text-[9px] font-bold text-rose-400 font-mono bg-rose-950 px-1.5 py-0.5 rounded">
                    +{formatINR(simulationResults.totalCostEscalation)} (+{simulationResults.costEscalationPercentage}%)
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-emerald-400 font-mono bg-emerald-950 px-1.5 py-0.5 rounded">
                    At Baseline
                  </span>
                )}
              </div>
            </div>

            {/* Failure Probability */}
            <div className={`p-3.5 rounded-xl bg-navy-950 border text-center space-y-1 ${
              simulationResults.failureProbability > 75 
                ? "border-rose-600/60 shadow-glow-rose" 
                : simulationResults.failureProbability > 45 
                ? "border-amber-600/60 shadow-glow-amber" 
                : "border-emerald-600/60 shadow-glow-emerald"
            }`}>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Failure Probability</p>
              <p className={`text-2xl font-extrabold font-mono ${
                simulationResults.failureProbability > 75 
                  ? "text-rose-400" 
                  : simulationResults.failureProbability > 45 
                  ? "text-amber-400" 
                  : "text-emerald-400"
              }`}>
                {simulationResults.failureProbability}%
              </p>
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                simulationResults.failureProbability >= 75 
                  ? "bg-rose-950 text-rose-300" 
                  : simulationResults.failureProbability >= 45 
                  ? "bg-amber-950 text-amber-300" 
                  : "bg-emerald-950 text-emerald-300"
              }`}>
                {simulationResults.failureProbability >= 75 ? "CRITICAL HAZARD" : simulationResults.failureProbability >= 45 ? "ELEVATED RISK" : "CONTROLLED"}
              </span>
            </div>

            {/* Daily Trains Impacted */}
            <div className="p-3.5 rounded-xl bg-navy-950 border border-amber-500/40 text-center space-y-1 shadow-glow-amber">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Trains Slowed</p>
              <p className="text-2xl font-extrabold text-amber-400 font-mono">
                {simulationResults.dailyTrainsImpacted}
              </p>
              <span className="text-[9px] text-slate-400 font-mono">
                Express & Freight / Day
              </span>
            </div>

            {/* Extra Train Delay */}
            <div className="p-3.5 rounded-xl bg-navy-950 border border-purple-500/40 text-center space-y-1 shadow-glow-purple">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Train Delay</p>
              <p className="text-2xl font-extrabold text-purple-400 font-mono">
                +{simulationResults.extraDelayPerTrain}m
              </p>
              <span className="text-[9px] text-slate-400 font-mono">
                Per Section Run
              </span>
            </div>
          </div>

          {/* ITEMIZE COST ESCALATION BREAKDOWN */}
          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                <span>Itemized Cost Escalation Breakdown for {activeTask.id}</span>
              </span>
              <span className="text-xs text-rose-400 font-mono font-bold">
                +{formatINR(simulationResults.totalCostEscalation)} Total Overrun
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-300">Emergency Labor & Shift Overtime</p>
                  <p className="text-[10px] text-slate-400">Night gang emergency mobilization</p>
                </div>
                <span className="font-mono font-bold text-amber-300">
                  +{formatINR(simulationResults.laborOvertimeCost)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-300">Machinery Standby & Siding Charges</p>
                  <p className="text-[10px] text-slate-400">Tower wagon / tamper idle leasing</p>
                </div>
                <span className="font-mono font-bold text-amber-300">
                  +{formatINR(simulationResults.machineryIdleCost)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-300">Speed Restriction (TSR) Energy Loss</p>
                  <p className="text-[10px] text-slate-400">Traction power loss during deceleration</p>
                </div>
                <span className="font-mono font-bold text-amber-300">
                  +{formatINR(simulationResults.speedRestrictionLoss)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-300">Freight Detention & Demurrage</p>
                  <p className="text-[10px] text-slate-400">Cargo rakes held in loop sidings</p>
                </div>
                <span className="font-mono font-bold text-amber-300">
                  +{formatINR(simulationResults.freightDetentionCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Failure Curve & Cost Escalation Trajectory Chart */}
          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cost Escalation & Risk Trajectory (Day 0 → Day 45)</span>
                </span>
                <p className="text-[10px] text-slate-400">
                  Real mathematical projection of financial & safety degradation over time
                </p>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-semibold">
                <button
                  onClick={() => setChartViewMode("BOTH")}
                  className={`px-2 py-0.5 rounded transition ${
                    chartViewMode === "BOTH" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Both Curves
                </button>
                <button
                  onClick={() => setChartViewMode("COST")}
                  className={`px-2 py-0.5 rounded transition ${
                    chartViewMode === "COST" ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Cost (₹)
                </button>
                <button
                  onClick={() => setChartViewMode("RISK")}
                  className={`px-2 py-0.5 rounded transition ${
                    chartViewMode === "RISK" ? "bg-rose-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Risk (%)
                </button>
              </div>
            </div>

            {/* Active Delay Floating Metrics Badge */}
            <div className="flex flex-wrap items-center justify-between text-xs font-mono bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-3">
                <span className="text-slate-300 font-bold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block mr-1" />
                  <span>Simulated Delay: <strong className="text-amber-400">+{delayDays} Days</strong></span>
                </span>
                {(chartViewMode === "BOTH" || chartViewMode === "COST") && (
                  <span className="text-cyan-400">
                    Est. Cost: <strong>{formatINR(simulationResults.projectedTotalCost)}</strong>
                  </span>
                )}
                {(chartViewMode === "BOTH" || chartViewMode === "RISK") && (
                  <span className={simulationResults.failureProbability > 75 ? "text-rose-400" : "text-amber-400"}>
                    Risk: <strong>{simulationResults.failureProbability}%</strong>
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Est. Completion: <strong className="text-slate-200">{simulationResults.revisedDateStr}</strong>
              </span>
            </div>

            {/* Responsive Professional SVG Chart */}
            <div className="relative w-full h-40 bg-navy-950/90 rounded-lg overflow-hidden border border-slate-800/80">
              <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                <defs>
                  {/* Cost Area Gradient */}
                  <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Risk Area Gradient */}
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="45" y1="25" x2="465" y2="25" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="45" y1="55" x2="465" y2="55" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="45" y1="85" x2="465" y2="85" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="45" y1="115" x2="465" y2="115" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="45" y1="140" x2="465" y2="140" stroke="#334155" strokeWidth="1.5" />

                {/* Vertical Milestones Grid lines */}
                {[0, 10, 20, 30, 45].map((d) => {
                  const x = 45 + (d / 45) * 420;
                  return (
                    <line
                      key={d}
                      x1={x}
                      y1="20"
                      x2={x}
                      y2="140"
                      stroke="#1E293B"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  );
                })}

                {/* Safety Threshold Guideline (60% Risk) */}
                <line x1="45" y1="71" x2="465" y2="71" stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
                <text x="50" y="67" fill="#F59E0B" fontSize="8" fontFamily="monospace" opacity="0.8">
                  CRS Safety Limit (60%)
                </text>

                {/* Critical Derailment / Hazard Line (80% Risk) */}
                <line x1="45" y1="48" x2="465" y2="48" stroke="#EF4444" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
                <text x="330" y="44" fill="#EF4444" fontSize="8" fontFamily="monospace" opacity="0.8">
                  Critical Hazard Threshold (80%)
                </text>

                {/* Filled Area Gradients */}
                {(chartViewMode === "BOTH" || chartViewMode === "COST") && (
                  <path d={costAreaD} fill="url(#costGrad)" />
                )}
                {(chartViewMode === "BOTH" || chartViewMode === "RISK") && (
                  <path d={riskAreaD} fill="url(#riskGrad)" />
                )}

                {/* Continuous Cost Trajectory Stroke */}
                {(chartViewMode === "BOTH" || chartViewMode === "COST") && (
                  <path
                    d={costPathD}
                    fill="none"
                    stroke="#06B6D4"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Continuous Risk Trajectory Stroke */}
                {(chartViewMode === "BOTH" || chartViewMode === "RISK") && (
                  <path
                    d={riskPathD}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points on Curve */}
                {trajectoryData.map((p, idx) => (
                  <g key={idx}>
                    {(chartViewMode === "BOTH" || chartViewMode === "COST") && (
                      <circle cx={p.svgX} cy={p.costY} r="2.5" fill="#06B6D4" opacity="0.7" />
                    )}
                    {(chartViewMode === "BOTH" || chartViewMode === "RISK") && (
                      <circle cx={p.svgX} cy={p.riskY} r="2.5" fill="#EF4444" opacity="0.7" />
                    )}
                  </g>
                ))}

                {/* ACTIVE DELAY SCANNING VERTICAL LINE */}
                <line
                  x1={activeCursor.svgX}
                  y1="18"
                  x2={activeCursor.svgX}
                  y2="140"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />

                {/* Active Intersection Nodes */}
                {(chartViewMode === "BOTH" || chartViewMode === "COST") && (
                  <circle
                    cx={activeCursor.svgX}
                    cy={activeCursor.costY}
                    r="5.5"
                    fill="#06B6D4"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                )}
                {(chartViewMode === "BOTH" || chartViewMode === "RISK") && (
                  <circle
                    cx={activeCursor.svgX}
                    cy={activeCursor.riskY}
                    r="5.5"
                    fill="#EF4444"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                )}

                {/* Active Indicator Top Pin */}
                <circle cx={activeCursor.svgX} cy="18" r="3" fill="#F59E0B" />

                {/* Y-Axis Numerical Labels (Left: Cost, Right: Risk) */}
                <text x="6" y="28" fill="#06B6D4" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  {formatINR(activeTask.baseCost * 3)}
                </text>
                <text x="6" y="85" fill="#06B6D4" fontSize="8" fontFamily="monospace">
                  {formatINR(activeTask.baseCost * 1.8)}
                </text>
                <text x="6" y="138" fill="#06B6D4" fontSize="8" fontFamily="monospace">
                  {formatINR(activeTask.baseCost)}
                </text>

                <text x="470" y="28" fill="#EF4444" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  100%
                </text>
                <text x="470" y="73" fill="#F59E0B" fontSize="8" fontFamily="monospace">
                  60%
                </text>
                <text x="470" y="138" fill="#10B981" fontSize="8" fontFamily="monospace">
                  0%
                </text>
              </svg>
            </div>

            {/* X-Axis Milestones and Legend */}
            <div className="space-y-2 pt-1">
              {/* X Axis Labels */}
              <div className="flex justify-between text-[10px] font-mono text-slate-400 px-8">
                <span className={delayDays <= 3 ? "text-emerald-400 font-bold" : ""}>
                  Day 0 (On-Time Baseline)
                </span>
                <span className={delayDays >= 8 && delayDays <= 15 ? "text-cyan-400 font-bold" : ""}>
                  Day 15 (Caution Window)
                </span>
                <span className={delayDays >= 25 && delayDays <= 35 ? "text-amber-400 font-bold" : ""}>
                  Day 30 (Critical Hazard)
                </span>
                <span className={delayDays > 38 ? "text-rose-400 font-bold" : ""}>
                  Day 45 (Catastrophic Overrun)
                </span>
              </div>

              {/* Chart Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium pt-1 border-t border-slate-800/80">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-1 bg-cyan-400 rounded-full" />
                  <span className="text-cyan-300">Projected Cost Escalation Trajectory (₹)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-1 bg-rose-500 rounded-full" />
                  <span className="text-rose-300">Failure Probability & Hazard Curve (%)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-0.5 border-t border-dashed border-amber-400" />
                  <span className="text-amber-400">Active Day {delayDays} Position</span>
                </div>
              </div>
            </div>
          </div>

          {/* Physical Asset Hazard & AI Automated Mitigation Action Bar */}
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-600/40 space-y-3">
            <div className="flex items-center space-x-2 text-purple-300 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Asset Degradation Analysis & AI Mitigation Strategy</span>
            </div>
            
            <p className="text-xs text-rose-300 font-medium">
              ⚠️ <strong>Physical Threat:</strong> {simulationResults.hazardDescription}
            </p>

            <p className="text-xs text-slate-300 leading-relaxed">
              {delayDays > 0
                ? `Simulated delay of +${delayDays} days for ${activeTask.id} causes a ${simulationResults.failureProbability}% failure probability and an extra +${formatINR(simulationResults.totalCostEscalation)} expenditure. AI Recommendation: Authorize combined night block window (01:30-05:30 AM) to clear backlog immediately and save ~${formatINR(simulationResults.totalCostEscalation)}.`
                : `Parameters for ${activeTask.id} are on-schedule at base cost ${formatINR(activeTask.baseCost)}. Safety margins and track geometry are fully compliant.`}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleApplyMitigation}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-glow-purple flex items-center space-x-2 transition"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Apply AI Mitigation Strategy</span>
              </button>

              <button
                onClick={handleExportScenario}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Scenario Sheet (.csv)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
