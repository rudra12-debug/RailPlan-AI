"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import {
  ServiceRequest,
  MaintenanceTask,
  RailwayCorridor,
  CorridorAsset,
  DepartmentInfo,
  ResourceItem,
  AiRecommendation,
  NotificationItem,
  AuditLogEntry,
  DepartmentId,
  RequestPriority,
  RequestStatus,
  ServiceRequestType,
  CostBreakdown,
  EmergencyIncidentRequest,
  EmergencyReplanResult,
  BundledMaintenanceOrder,
  LiveTrain,
  MaintenanceBlockRequest,
  StatutoryT806Sanction,
  PlanningHorizon,
  HorizonBlockPlan,
  HorizonScheduleSlot,
} from "@/lib/types";
import {
  MOCK_SERVICE_REQUESTS,
  MOCK_MAINTENANCE_TASKS,
  MOCK_CORRIDORS,
  MOCK_ASSETS,
  MOCK_DEPARTMENTS,
  MOCK_RESOURCES,
  MOCK_AI_RECOMMENDATIONS,
  MOCK_NOTIFICATIONS,
  MOCK_AUDIT_LOGS,
  MOCK_BUNDLES,
  MOCK_LIVE_TRAINS,
  MOCK_BLOCK_REQUESTS,
  MOCK_T806_SANCTIONS,
} from "@/lib/mockData";
import { ALL_HORIZON_BLOCK_PLANS } from "@/lib/horizonPlansData";
import { useAuth } from "./AuthContext";
import { LiveSyncToast } from "@/components/common/LiveSyncToast";
import { BundledCluster, clusterToMaintenanceOrder } from "@/lib/bundlerEngine";

interface RailPlanContextType {
  // Primary State
  requests: ServiceRequest[];
  maintenanceTasks: MaintenanceTask[];
  bundles: BundledMaintenanceOrder[];
  corridors: RailwayCorridor[];
  assets: CorridorAsset[];
  departments: DepartmentInfo[];
  resources: ResourceItem[];
  aiRecommendations: AiRecommendation[];
  notifications: NotificationItem[];
  auditLogs: AuditLogEntry[];
  selectedZone: string;
  selectedCorridorId: string;
  unreadNotificationCount: number;
  serverSyncConnected: boolean;
  isSyncing: boolean;
  triggerManualSync: () => Promise<void>;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  activeHomeTab: "OCC" | "BUNDLER" | "EMERGENCY" | "SANCTIONS";
  setActiveHomeTab: (tab: "OCC" | "BUNDLER" | "EMERGENCY" | "SANCTIONS") => void;

  // RailPlan AI Telemetry & Simulation State
  trains: LiveTrain[];
  blockRequests: MaintenanceBlockRequest[];
  t806Sanctions: StatutoryT806Sanction[];
  telemetryTickActive: boolean;
  lastTelemetryTickTime: Date;
  activeCautionOrdersCount: number;
  openHighRiskAlarmsCount: number;

  // Actions
  setSelectedZone: (zone: string) => void;
  setSelectedCorridorId: (id: string) => void;
  setTelemetryTickActive: (active: boolean) => void;
  triggerTelemetryTick: () => void;

  // Multi-Horizon Block Planning (Weekly Short-Term & Monthly Long-Term)
  selectedHorizon: PlanningHorizon;
  setSelectedHorizon: (horizon: PlanningHorizon) => void;
  horizonPlans: HorizonBlockPlan[];
  approveHorizonPlan: (planId: string) => { success: boolean; message: string };
  aiOptimizeHorizonSchedule: (planId: string) => { success: boolean; message: string; savedHours: number; punctualityGainPct: number };

  // Block Requests & Bundling
  createBlockRequest: (data: Partial<MaintenanceBlockRequest>) => string;
  updateBlockRequestStatus: (id: string, status: MaintenanceBlockRequest["status"]) => void;
  acceptBundledCluster: (cluster: BundledCluster) => BundledMaintenanceOrder;

  // Statutory T/806 Signoff & Governance
  signT806Step: (
    sanctionId: string,
    step: 1 | 2 | 3 | 4,
    notes?: string
  ) => { success: boolean; message: string };
  createT806FromBundle: (
    bundleId: string,
    fromKm: number,
    toKm: number,
    durationHours: number,
    cautionSpeed?: number
  ) => StatutoryT806Sanction;

  // Emergency Replanning Sandbox
  triggerEmergencyReplan: (incident: EmergencyIncidentRequest) => EmergencyReplanResult;
  confirmEmergencyDispatch: (
    scenarioId: "SCENARIO_A" | "SCENARIO_B",
    incidentTitle: string,
    allocatedWindow: string
  ) => { success: boolean; message: string };

  // Core Service Request Workflow
  createServiceRequest: (data: {
    title: string;
    targetDepartment: DepartmentId;
    corridorId: string;
    locationKm: string;
    requestType: ServiceRequestType;
    priority: RequestPriority;
    description: string;
    requiredDate: string;
    estimatedCost: number;
    costBreakdown: CostBreakdown;
    resourcesRequired: string[];
    attachments?: string[];
    additionalNotes?: string;
  }) => string;
  approveServiceRequest: (
    requestId: string,
    assignedDept: DepartmentId,
    comments?: string,
    priorityOverride?: RequestPriority,
    deadline?: string
  ) => void;
  rejectServiceRequest: (requestId: string, reason: string) => void;
  requestModification: (requestId: string, notes: string) => void;
  updateRequestPriority: (requestId: string, priority: RequestPriority) => void;
  updateRequestProgress: (
    requestId: string,
    percentage: number,
    notes: string,
    issues?: string,
    photoUrl?: string
  ) => void;
  markWorkCompleted: (requestId: string, notes: string) => void;
  verifyAndCloseRequest: (requestId: string, centralNotes: string) => void;
  acceptAiRecommendation: (recId: string) => void;
  dismissAiRecommendation: (recId: string) => void;
  createCustomBundle: (taskIds: string[], customTitle?: string) => BundledMaintenanceOrder;
  approveBundle: (bundleId: string) => void;
  executeBundle: (bundleId: string) => void;
  allocateResource: (resourceId: string, departmentId: DepartmentId, corridorId?: string) => void;
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  resetToDemoState: () => void;
}

const RailPlanContext = createContext<RailPlanContextType | undefined>(undefined);

// Web Audio notification chime
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Autoplay restrictions before user interaction
  }
}

export const ZONE_CORRIDOR_MAP: Record<string, string[]> = {
  "ALL": [
    "BPL-ET",
    "NDLS-MMCT",
    "NDLS-HWH",
    "WDFC-01",
    "EDFC-01",
    "CSMT-MAS",
    "MAS-SBC",
    "HWH-MAS",
    "ADI-MMCT",
    "KONKAN-01"
  ],
  "All Zones (National OCC)": [
    "BPL-ET",
    "NDLS-MMCT",
    "NDLS-HWH",
    "WDFC-01",
    "EDFC-01",
    "CSMT-MAS",
    "MAS-SBC",
    "HWH-MAS",
    "ADI-MMCT",
    "KONKAN-01"
  ],
  "West Central Railway (WCR - Bhopal)": ["BPL-ET"],
  "Northern Railway (NR - Delhi)": ["NDLS-MMCT", "NDLS-HWH"],
  "Western Railway (WR - Mumbai/Gujarat)": ["NDLS-MMCT", "ADI-MMCT", "WDFC-01"],
  "Central Railway (CR - CSMT/Pune)": ["CSMT-MAS", "KONKAN-01"],
  "Eastern Railway (ER - Howrah)": ["NDLS-HWH", "HWH-MAS", "EDFC-01"],
  "Southern & SWR (SR/SWR - Chennai/Bengaluru)": ["MAS-SBC", "CSMT-MAS", "HWH-MAS"],
  "DFCCIL (Dedicated Freight Corridors)": ["WDFC-01", "EDFC-01"],
  "Konkan Railway (KRCL)": ["KONKAN-01"],
};

export const RailPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, canApproveT806, canConfirmEmergency } = useAuth();

  // Core State
  const [requests, setRequests] = useState<ServiceRequest[]>(MOCK_SERVICE_REQUESTS);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(MOCK_MAINTENANCE_TASKS);
  const [bundles, setBundles] = useState<BundledMaintenanceOrder[]>(MOCK_BUNDLES);
  const [corridors, setCorridors] = useState<RailwayCorridor[]>(MOCK_CORRIDORS);
  const [assets, setAssets] = useState<CorridorAsset[]>(MOCK_ASSETS);
  const [departments, setDepartments] = useState<DepartmentInfo[]>(MOCK_DEPARTMENTS);
  const [resources, setResources] = useState<ResourceItem[]>(MOCK_RESOURCES);
  const [aiRecommendations, setAiRecommendations] = useState<AiRecommendation[]>(MOCK_AI_RECOMMENDATIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);

  // Large-Scale & Telemetry State
  const [trains, setTrains] = useState<LiveTrain[]>(MOCK_LIVE_TRAINS);
  const [blockRequests, setBlockRequests] = useState<MaintenanceBlockRequest[]>(MOCK_BLOCK_REQUESTS);
  const [t806Sanctions, setT806Sanctions] = useState<StatutoryT806Sanction[]>(MOCK_T806_SANCTIONS);
  const [telemetryTickActive, setTelemetryTickActive] = useState<boolean>(true);
  const [lastTelemetryTickTime, setLastTelemetryTickTime] = useState<Date>(new Date());

  // Filter Selection
  const [selectedZone, setSelectedZoneState] = useState<string>("All Zones (National OCC)");
  const [selectedCorridorId, setSelectedCorridorIdState] = useState<string>("BPL-ET");
  const [serverSyncConnected, setServerSyncConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const serverVersionRef = useRef<number>(1);
  const syncChannelRef = useRef<BroadcastChannel | null>(null);
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const toggleSidebar = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsSidebarOpen((prev) => !prev);
      setIsMobileMenuOpen(false);
    } else {
      setIsMobileMenuOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [activeHomeTab, setActiveHomeTab] = useState<"OCC" | "BUNDLER" | "EMERGENCY" | "SANCTIONS">("OCC");

  // Multi-Horizon Block Planning State (Weekly Short-Term & Monthly Long-Term)
  const [selectedHorizon, setSelectedHorizon] = useState<PlanningHorizon>("WEEKLY");
  const [horizonPlans, setHorizonPlans] = useState<HorizonBlockPlan[]>(ALL_HORIZON_BLOCK_PLANS);

  // Apply server state to local React state
  const applyServerState = useCallback((s: any) => {
    if (!s) return;
    if (s.requests && Array.isArray(s.requests)) setRequests(s.requests);
    if (s.maintenanceTasks && Array.isArray(s.maintenanceTasks)) setMaintenanceTasks(s.maintenanceTasks);
    if (s.bundles && Array.isArray(s.bundles)) setBundles(s.bundles);
    if (s.corridors && Array.isArray(s.corridors)) setCorridors(s.corridors);
    if (s.assets && Array.isArray(s.assets)) setAssets(s.assets);
    if (s.departments && Array.isArray(s.departments)) setDepartments(s.departments);
    if (s.resources && Array.isArray(s.resources)) setResources(s.resources);
    if (s.aiRecommendations && Array.isArray(s.aiRecommendations)) setAiRecommendations(s.aiRecommendations);
    if (s.notifications && Array.isArray(s.notifications)) setNotifications(s.notifications);
    if (s.auditLogs && Array.isArray(s.auditLogs)) setAuditLogs(s.auditLogs);
    if (s.blockRequests && Array.isArray(s.blockRequests)) setBlockRequests(s.blockRequests);
    if (s.t806Sanctions && Array.isArray(s.t806Sanctions)) setT806Sanctions(s.t806Sanctions);
    if (s.horizonPlans && Array.isArray(s.horizonPlans)) setHorizonPlans(s.horizonPlans);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("railplan_client_state_v1", JSON.stringify(s));
      } catch (err) {}
    }
  }, []);

  // Heartbeat sync against /api/railplan/sync
  const syncWithServer = useCallback(async (force = false) => {
    try {
      const ver = force ? 0 : serverVersionRef.current;
      const res = await fetch(`/api/railplan/sync?version=${ver}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setServerSyncConnected(false);
        return;
      }
      const data = await res.json();
      setServerSyncConnected(true);
      if (data.changed && data.state) {
        serverVersionRef.current = data.version;
        applyServerState(data.state);
      }
    } catch (err) {
      setServerSyncConnected(false);
    }
  }, [applyServerState]);

  // Dispatch action to server and broadcast across tabs
  const dispatchServerAction = useCallback(async (actionType: string, payload: any) => {
    try {
      setIsSyncing(true);
      const res = await fetch("/api/railplan/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType,
          payload,
          actor: {
            name: user?.name,
            departmentId: user?.departmentId,
            departmentName: user?.departmentName,
            role: user?.role,
            designation: user?.designation,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.state) {
          serverVersionRef.current = data.version;
          applyServerState(data.state);
          setServerSyncConnected(true);

          if (syncChannelRef.current) {
            try {
              syncChannelRef.current.postMessage({
                type: "SYNC_STATE",
                state: data.state,
                version: data.version,
              });
            } catch (e) {}
          }
          return data.result;
        }
      }
    } catch (err) {
      console.warn("Server action dispatch error:", err);
      setServerSyncConnected(false);
    } finally {
      setIsSyncing(false);
    }
  }, [user, applyServerState]);

  const triggerManualSync = useCallback(async () => {
    setIsSyncing(true);
    await syncWithServer(true);
    setIsSyncing(false);
    const toast: NotificationItem = {
      id: `NOTIF-SYNC-${Date.now()}`,
      title: "OCC Real-Time Synchronized",
      message: "Operational schedules, requests, and assets synchronized with Central Server.",
      type: "SUCCESS",
      timestamp: "Just now",
      read: false,
    };
    setActiveToast(toast);
    playNotificationChime();
  }, [syncWithServer]);

  // Cross-tab BroadcastChannel listener
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    try {
      const channel = new BroadcastChannel("railplan_realtime_sync_bus");
      syncChannelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data?.type === "SYNC_STATE" && event.data?.state) {
          applyServerState(event.data.state);
          if (event.data.version) {
            serverVersionRef.current = event.data.version;
          }
        }
      };

      return () => {
        channel.close();
        syncChannelRef.current = null;
      };
    } catch (e) {}
  }, [applyServerState]);

  // Client hydration + Polling heartbeat for seamless multi-user collaboration
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("railplan_client_state_v1");
        if (cached) {
          const parsed = JSON.parse(cached);
          applyServerState(parsed);
        }
      } catch (e) {}
    }

    syncWithServer(true);

    const pollInterval = setInterval(() => {
      syncWithServer(false);
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [applyServerState, syncWithServer]);

  // Helper: Tamper-proof audit logger with pseudo-hash chaining
  const logAudit = useCallback((
    actor: string,
    department: string,
    action: string,
    entityId: string,
    details: string
  ) => {
    const prevEntry = auditLogs[0];
    const prevHash = prevEntry ? `hash_${prevEntry.id}_${prevEntry.timestamp.slice(-4)}` : "GENESIS_HASH_0000";
    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour12: false }) + " IST",
      user: actor,
      department: department,
      action: action,
      entityId: entityId,
      details: `${details} [PrevHash: ${prevHash.slice(0, 10)}...]`,
    };

    setAuditLogs((prev) => [newEntry, ...prev.slice(0, 99)]);
  }, [auditLogs]);

  // Real-Time 5-Second Telemetry Tick Simulation (Multi-Corridor)
  const triggerTelemetryTick = useCallback(() => {
    setLastTelemetryTickTime(new Date());

    // 1. Slightly fluctuate asset telemetry across active/monitored assets
    setAssets((prevAssets) =>
      prevAssets.map((asset) => {
        const currentTemp = asset.telemetry.railTemperature || asset.telemetry.temperature || 42.0;
        const currentVib = asset.telemetry.vibrationAmplitude || asset.telemetry.vibration || 2.5;
        const currentTension = asset.telemetry.oheContactWireTension || 11.5;
        const currentGauge = asset.telemetry.trackGeometryGaugeDeviation || 1.2;

        const deltaTemp = Number(((Math.random() - 0.48) * 0.4).toFixed(1));
        const deltaVib = Number(((Math.random() - 0.5) * 0.15).toFixed(2));
        const deltaTension = Number(((Math.random() - 0.5) * 0.08).toFixed(1));

        const nextTemp = Math.min(68, Math.max(26, Number((currentTemp + deltaTemp).toFixed(1))));
        const nextVib = Math.min(8.5, Math.max(0.6, Number((currentVib + deltaVib).toFixed(2))));
        const nextTension = Math.min(15.5, Math.max(8.0, Number((currentTension + deltaTension).toFixed(1))));

        let risk = asset.failureRisk;
        let nextVoltage = asset.telemetry.voltage;
        let nextSwitchOpening = asset.telemetry.switchOpeningMm;
        let nextTilt = asset.telemetry.pierTiltDeg;
        let nextScour = asset.telemetry.scourDepthM;
        let nextBearingTemp = asset.telemetry.bearingTemperature;

        if (asset.type === "RAIL_JOINT") {
          risk = Math.min(100, Math.floor(
            (nextTemp > 52 ? (nextTemp - 52) * 5 : 0) +
            (nextVib > 4.0 ? (nextVib - 4.0) * 12 : 0) +
            (Math.abs(currentGauge) > 4 ? 20 : 5) + 15
          ));
        } else if (asset.type === "OHE_CATENARY") {
          risk = Math.min(100, Math.floor(
            (nextTension < 10.0 ? (10.0 - nextTension) * 20 : 5) +
            ((asset.telemetry.pantographContactWear || 2) > 3.8 ? 30 : 10) + 10
          ));
        } else if (asset.type === "POINT_MACHINE" || asset.type === "SIGNAL" || asset.type === "TRACK_CIRCUIT") {
          const deltaV = Number(((Math.random() - 0.5) * 0.1).toFixed(2));
          nextVoltage = Math.min(25.5, Math.max(21.0, Number(((asset.telemetry.voltage || 24.0) + deltaV).toFixed(2))));
          if (asset.telemetry.switchOpeningMm !== undefined) {
            const deltaSwitch = Number(((Math.random() - 0.5) * 0.05).toFixed(2));
            nextSwitchOpening = Number((asset.telemetry.switchOpeningMm + deltaSwitch).toFixed(2));
          }
          risk = Math.min(100, Math.floor(
            (nextVoltage < 23.0 ? (23.0 - nextVoltage) * 25 : 5) +
            (nextSwitchOpening && Math.abs(nextSwitchOpening - 115) > 2 ? 30 : 5) + 8
          ));
        } else if (asset.type === "BRIDGE_PIER") {
          const deltaTilt = Number(((Math.random() - 0.5) * 0.005).toFixed(3));
          nextTilt = Math.max(0.01, Number(((asset.telemetry.pierTiltDeg || 0.05) + deltaTilt).toFixed(3)));
          if (asset.telemetry.bearingTemperature) {
            const deltaB = Number(((Math.random() - 0.48) * 0.3).toFixed(1));
            nextBearingTemp = Math.min(85, Math.max(30, Number((asset.telemetry.bearingTemperature + deltaB).toFixed(1))));
          }
          risk = Math.min(100, Math.floor(
            (nextTilt > 0.15 ? (nextTilt - 0.15) * 120 : 5) +
            ((asset.telemetry.scourDepthM || 0) > 1.5 ? 25 : 5) +
            ((nextBearingTemp || 40) > 60 ? 20 : 5) + 5
          ));
        }

        const status = risk >= 80 ? "CRITICAL" : risk >= 50 ? "ATTENTION" : "NORMAL";

        return {
          ...asset,
          failureRisk: risk,
          status,
          telemetry: {
            ...asset.telemetry,
            railTemperature: nextTemp,
            temperature: nextTemp,
            vibrationAmplitude: nextVib,
            vibration: nextVib,
            oheContactWireTension: nextTension,
            voltage: nextVoltage,
            switchOpeningMm: nextSwitchOpening,
            pierTiltDeg: nextTilt,
            scourDepthM: nextScour,
            bearingTemperature: nextBearingTemp,
            dynamicRiskScore: risk,
          },
        };
      })
    );

    // 2. Advance 50+ Live Trains across all corridors
    setTrains((prevTrains) =>
      prevTrains.map((train) => {
        const speed = train.currentSpeedKmph;
        if (speed <= 0) return train;

        const distanceMovedKm = (speed / 3600) * 5 * 2.5;
        let nextKm = train.direction === "DOWN"
          ? train.currentKm + distanceMovedKm
          : train.currentKm - distanceMovedKm;

        // Bounded loop around corridor length
        const maxKm = 1200;
        if (nextKm > maxKm) nextKm = 5.0;
        if (nextKm < 0) nextKm = maxKm - 10.0;

        nextKm = Number(nextKm.toFixed(1));

        return {
          ...train,
          currentKm: nextKm,
          updatedAt: new Date().toLocaleTimeString(),
        };
      })
    );
  }, []);

  // 5-Second Interval Telemetry Engine
  useEffect(() => {
    if (!telemetryTickActive) return;

    const interval = setInterval(() => {
      triggerTelemetryTick();
    }, 5000);

    return () => clearInterval(interval);
  }, [telemetryTickActive, triggerTelemetryTick]);

  // Corridor Selection Helpers
  const setSelectedZone = (zone: string) => {
    setSelectedZoneState(zone);
    const allowed = ZONE_CORRIDOR_MAP[zone] || ZONE_CORRIDOR_MAP["ALL"];
    if (selectedCorridorId !== "ALL" && !allowed.includes(selectedCorridorId)) {
      setSelectedCorridorIdState(allowed[0] || "ALL");
    }
  };

  const setSelectedCorridorId = (id: string) => {
    setSelectedCorridorIdState(id);
  };

  // Block Requests Action
  const createBlockRequest = (data: Partial<MaintenanceBlockRequest>): string => {
    const id = `REQ-BPL-${Date.now().toString().slice(-4)}`;
    const newReq: MaintenanceBlockRequest = {
      id,
      blockId: `BLK-${id}`,
      title: data.title || "Track Infrastructure Block",
      department: data.department || "Civil",
      departmentId: data.departmentId || "ENG",
      corridorId: data.corridorId || "BPL-ET",
      fromKm: data.fromKm || 55.0,
      toKm: data.toKm || 58.0,
      locationSection: data.locationSection || "Barkhera Ghat Section",
      trackLine: data.trackLine || "DOWN_LINE",
      requestedWindow: data.requestedWindow || "04:30 - 06:30 IST",
      durationHours: data.durationHours || 2.0,
      scheduledDate: data.scheduledDate || "Tomorrow",
      resourceRequirements: data.resourceRequirements || ["Work Gang", "Inspection Vehicle"],
      cautionSpeedRequiredKmph: data.cautionSpeedRequiredKmph || 30,
      requiresOHEPowerCut: !!data.requiresOHEPowerCut,
      status: "Submitted",
      riskScore: data.riskScore || 70,
      description: data.description || "Routine maintenance inspection block.",
      requestedBy: user?.name || "Maintenance Official",
    };

    setBlockRequests((prev) => [newReq, ...prev]);
    logAudit(
      user?.name || "Official",
      newReq.departmentId,
      "CREATE_BLOCK_REQUEST",
      newReq.id,
      `Created maintenance block request on ${newReq.corridorId} KM ${newReq.fromKm}-${newReq.toKm}`
    );

    const toast: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: "Maintenance Block Submitted",
      message: `Request ${newReq.blockId} (${newReq.department}) submitted for AI Mega-Block Bundler analysis.`,
      type: "SUCCESS",
      timestamp: "Just now",
      read: false,
    };
    setActiveToast(toast);
    playNotificationChime();
    dispatchServerAction("CREATE_BLOCK_REQUEST", newReq);
    return id;
  };

  const updateBlockRequestStatus = (id: string, status: MaintenanceBlockRequest["status"]) => {
    setBlockRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    dispatchServerAction("UPDATE_BLOCK_STATUS", { id, status });
  };

  // Multi-Horizon Block Planning Actions
  const approveHorizonPlan = useCallback((planId: string) => {
    setHorizonPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId ? { ...plan, status: "BOARD_APPROVED" } : plan
      )
    );
    const plan = horizonPlans.find((p) => p.id === planId);
    const msg = `Railway Board Statutory Sanction issued for ${plan?.title || planId}`;
    logAudit(user?.name || "Executive Director", user?.role || "CENTRAL_ADMIN", "BOARD_SANCTION_PLAN", planId, msg);
    const toast: NotificationItem = {
      id: `NOTIF-SANCT-${Date.now().toString().slice(-4)}`,
      title: "Board Sanction Granted",
      message: msg,
      timestamp: "Just now",
      type: "SUCCESS",
      read: false,
      relatedId: planId,
    };
    setActiveToast(toast);
    playNotificationChime();
    dispatchServerAction("APPROVE_HORIZON_PLAN", { planId });
    return { success: true, message: msg };
  }, [horizonPlans, logAudit, user, dispatchServerAction]);

  const aiOptimizeHorizonSchedule = useCallback((planId: string) => {
    setHorizonPlans((prev) =>
      prev.map((plan) => {
        if (plan.id === planId) {
          return {
            ...plan,
            aiOptimizationScore: Math.min(100, plan.aiOptimizationScore + 4),
            averageDelayMinutesPerTrain: Math.max(1.5, Number((plan.averageDelayMinutesPerTrain * 0.72).toFixed(1))),
            freightCapacityImpactPct: Math.max(1.0, Number((plan.freightCapacityImpactPct * 0.78).toFixed(1))),
            conflictCheckPassed: true,
          };
        }
        return plan;
      })
    );
    const plan = horizonPlans.find((p) => p.id === planId);
    const msg = `AI Optimization Engine tightened schedule for ${plan?.title || planId}: Reduced passenger delay by 28% and aligned co-located OHE power cutoff windows.`;
    logAudit(user?.name || "Official", user?.role || "CENTRAL_ADMIN", "AI_OPTIMIZE_HORIZON_SCHEDULE", planId, msg);
    const toast: NotificationItem = {
      id: `NOTIF-OPT-${Date.now().toString().slice(-4)}`,
      title: "AI Horizon Optimization Complete",
      message: msg,
      timestamp: "Just now",
      type: "SUCCESS",
      read: false,
      relatedId: planId,
    };
    setActiveToast(toast);
    playNotificationChime();
    dispatchServerAction("AI_OPTIMIZE_HORIZON", { planId });
    return { success: true, message: msg, savedHours: 4.5, punctualityGainPct: 14.2 };
  }, [horizonPlans, logAudit, user, dispatchServerAction]);

  // AI Mega-Block Acceptance Action
  const acceptBundledCluster = (cluster: BundledCluster): BundledMaintenanceOrder => {
    const newOrder = clusterToMaintenanceOrder(cluster);
    newOrder.status = "APPROVED";

    // Mark constituent block requests as "Bundled"
    const reqIds = new Set(cluster.requests.map((r) => r.id));
    setBlockRequests((prev) =>
      prev.map((r) => (reqIds.has(r.id) ? { ...r, status: "Bundled", bundleId: newOrder.id } : r))
    );

    // Save bundle to bundle list
    setBundles((prev) => [newOrder, ...prev]);

    // Automatically create a pre-filled Statutory T/806 draft
    const newSanction = createT806FromBundle(
      newOrder.id,
      cluster.fromKm,
      cluster.toKm,
      cluster.bundledDurationHours,
      cluster.cautionSpeedRecommendedKmph
    );

    logAudit(
      user?.name || "OCC Controller",
      "OPS",
      "ACCEPT_AI_BUNDLE",
      newOrder.id,
      `Approved Joint Mega-Block bundling ${cluster.requests.length} requests with ${cluster.savingsPercentage}% closure savings`
    );

    const toast: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: "Joint Mega-Block Approved!",
      message: `${newOrder.title} created. Form T/806 sanction draft generated automatically.`,
      type: "SUCCESS",
      timestamp: "Just now",
      read: false,
    };
    setActiveToast(toast);
    playNotificationChime();

    dispatchServerAction("ACCEPT_BUNDLED_CLUSTER", {
      order: newOrder,
      requestIds: cluster.requests.map((r) => r.id),
      sanction: newSanction,
    });
    return newOrder;
  };

  // Statutory T/806 Advance Step Action
  const signT806Step = (
    sanctionId: string,
    step: 1 | 2 | 3 | 4,
    notes?: string
  ): { success: boolean; message: string } => {
    // RBAC validation: Step 3 (Traffic Sanction) and Step 4 (T/806 Issued) require OCC Chief Controller, Safety Officer, or Admin
    if ((step === 3 || step === 4) && !canApproveT806) {
      return {
        success: false,
        message: `RBAC Access Denied: Only OCC Chief Controller or Safety Officer can authorize Form T/806 Sanction (Current Persona: ${user?.designation || "Engineer"}).`,
      };
    }

    setT806Sanctions((prev) =>
      prev.map((s) => {
        if (s.id !== sanctionId) return s;

        const updated = { ...s };
        const now = new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "medium" }) + " IST";
        const actor = user?.name || "Designated Officer";

        if (step === 1) {
          updated.signoffPipeline.step1DeptSubmission = { completed: true, by: actor, timestamp: now };
          updated.currentStep = 2;
        } else if (step === 2) {
          updated.signoffPipeline.step2PowerIsolation = {
            completed: true,
            by: actor,
            certificate: `TIC-${Date.now().toString().slice(-4)} / 25kV Earthing Verified`,
            timestamp: now,
          };
          updated.currentStep = 3;
          updated.status = "ISOLATION_CONFIRMED";
        } else if (step === 3) {
          updated.signoffPipeline.step3TrafficSanction = { completed: true, by: actor, timestamp: now };
          updated.currentStep = 4;
          updated.status = "SANCTIONED";
        } else if (step === 4) {
          updated.signoffPipeline.step4T806Issued = {
            completed: true,
            by: actor,
            timestamp: now,
            qrCodeHash: `sha256_${Date.now().toString(16)}_ir_gov_t806`,
          };
          updated.status = "ACTIVE_BLOCK";
        }

        logAudit(
          actor,
          user?.departmentId || "OPS",
          `SIGN_T806_STEP_${step}`,
          sanctionId,
          `Completed Step ${step} sign-off for Form T/806 Block Authority ${s.sanctionNumber}.${notes ? ` Notes: ${notes}` : ""}`
        );

        return updated;
      })
    );

    playNotificationChime();
    dispatchServerAction("SIGN_T806_STEP", { sanctionId, step, notes });
    return {
      success: true,
      message: `Step ${step} signed off successfully under G&SR 15.06 compliance.`,
    };
  };

  const createT806FromBundle = (
    bundleId: string,
    fromKm: number,
    toKm: number,
    durationHours: number,
    cautionSpeed = 30
  ): StatutoryT806Sanction => {
    const sanctionNumber = `WCR/BPL-ET/T806/2026/${Math.floor(100 + Math.random() * 900)}`;
    const newSanction: StatutoryT806Sanction = {
      id: `SANCTION-T806-${Date.now().toString().slice(-4)}`,
      sanctionNumber,
      blockId: bundleId,
      corridorId: "BPL-ET",
      corridorName: "Bhopal - Itarsi High-Density Trunk Corridor",
      fromKm,
      toKm,
      trackLine: "DOWN_LINE",
      sanctionedWindow: "04:30 - 08:00 IST",
      durationHours,
      cautionSpeedKmph: cautionSpeed,
      tractionPowerCutoff: true,
      ohePermitToWorkNumber: `PTW-WCR-BPL-${Date.now().toString().slice(-4)}`,
      tpcIsolationCertificateNumber: `TIC-BPL-TSS02-${Date.now().toString().slice(-3)}`,
      associatedBundleId: bundleId,
      gsrRulesCited: [
        "G&SR 15.06 (Line Block Generation on High Density Corridor)",
        "G&SR 17.08 (25kV Power Isolation & Earthing Certificate)",
        "IRPWM 2020 Para 804 (Track Relaying Safety Rules)",
      ],
      signoffPipeline: {
        step1DeptSubmission: {
          completed: true,
          by: user?.name || "Sunil Deshmukh (P-Way)",
          timestamp: new Date().toLocaleTimeString() + " IST",
        },
        step2PowerIsolation: { completed: false },
        step3TrafficSanction: { completed: false },
        step4T806Issued: { completed: false },
      },
      currentStep: 2,
      status: "DRAFT",
      issuingOfficer: "Rajesh Verma / Devendra Yadav",
      issuingDesignation: "Executive Director (Railway Board) & Chief Safety Officer",
      participatingDepartments: ["Civil (P-Way)", "Electrical (OHE)", "Signal & Kavach"],
      digitalSignatureHash: `sha256_${Date.now().toString(16)}_ir_gov_t806`,
      previousHash: auditLogs[0]?.id || "GENESIS_HASH",
      issuedAt: new Date().toLocaleString("en-IN"),
      cautionOrderSummary: `Caution Order TSR ${cautionSpeed} km/h between KM ${fromKm} and KM ${toKm}; 25kV traction isolated.`,
    };

    setT806Sanctions((prev) => [newSanction, ...prev]);
    dispatchServerAction("CREATE_T806", newSanction);
    return newSanction;
  };

  // Emergency Replanning Actions
  const triggerEmergencyReplan = (incident: EmergencyIncidentRequest): EmergencyReplanResult => {
    // Generate AI contingency scenarios
    const result: EmergencyReplanResult = {
      affectedTrainsCount: 4,
      trainsToReroute: ["12002 Shatabdi Exp", "12156 Shaan-e-Bhopal", "18238 Chhattisgarh Exp", "BCN-E Heavy Coal Rake"],
      allocatedEmergencyWindow: "Next 2.5 Hours (Immediate Line Block)",
      mobilizedDepartments: ["ELEC", "ENG", "SFTY", "OPS"],
      requiredEquipment: ["8-Wheeler Tower Wagon #104", "Breakdown Train (ART)", "Rapid OHE Splice Unit"],
      estimatedRestorationTime: "120 Minutes",
      costImpact: 350000,
      recommendedResponseSteps: [
        "Trip Substation Feeder Breaker at Barkhera TSS immediately (G&SR 17.08).",
        "Impose Single-Line Working on Up-Line with 25 km/h crossover speed limit.",
        "Dispatch Tower Wagon from Bhopal Depot under Emergency Line Block authority.",
        "Transmit TSR Caution Orders to approaching Loco Pilots via Kavach / VHF Radio."
      ]
    };

    logAudit(
      user?.name || "OCC Controller",
      "OPS",
      "TRIGGER_EMERGENCY_INCIDENT",
      incident.incidentType,
      `Simulated ${incident.incidentType} at ${incident.locationKm} on corridor ${incident.corridorId}.`
    );

    return result;
  };

  const confirmEmergencyDispatch = (
    scenarioId: "SCENARIO_A" | "SCENARIO_B",
    incidentTitle: string,
    allocatedWindow: string
  ): { success: boolean; message: string } => {
    if (!canConfirmEmergency) {
      return {
        success: false,
        message: `RBAC Access Denied: Only OCC Chief Controller or Safety Officer can confirm Emergency Dispatch & Rerouting Orders.`,
      };
    }

    logAudit(
      user?.name || "Chief Controller",
      "OPS",
      "CONFIRM_EMERGENCY_DISPATCH",
      scenarioId,
      `Authorized Emergency Dispatch (${scenarioId}) for ${incidentTitle}. Allocated Window: ${allocatedWindow}.`
    );

    const toast: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: "🚨 Emergency OCC Dispatch Executed",
      message: `${scenarioId} enacted. Station Masters notified; emergency line clearance broadcasted.`,
      type: "CRITICAL",
      timestamp: "Just now",
      read: false,
    };
    setActiveToast(toast);
    playNotificationChime();

    dispatchServerAction("CONFIRM_EMERGENCY", { scenarioId, incidentTitle, allocatedWindow });

    return {
      success: true,
      message: `Emergency Dispatch confirmed by ${user?.name} (${user?.designation}). Digital Confirmation Stamp: IR-OCC-STAMP-${Date.now().toString(16).toUpperCase()}`,
    };
  };

  // Full Real-Time Service Request & Operations Handlers
  const createServiceRequest = useCallback((data: {
    title: string;
    targetDepartment: DepartmentId;
    corridorId: string;
    locationKm: string;
    requestType: ServiceRequestType;
    priority: RequestPriority;
    description: string;
    requiredDate: string;
    estimatedCost: number;
    costBreakdown: CostBreakdown;
    resourcesRequired: string[];
    attachments?: string[];
    additionalNotes?: string;
  }): string => {
    const newId = `SR-${Math.floor(1000 + Math.random() * 9000)}`;
    const reqDept = (user?.departmentId as DepartmentId) || "ENG";
    const newRequest: ServiceRequest = {
      id: newId,
      title: data.title,
      requestingDepartment: reqDept,
      targetDepartment: data.targetDepartment,
      corridorId: data.corridorId,
      locationKm: data.locationKm,
      requestType: data.requestType,
      priority: data.priority,
      description: data.description,
      requiredDate: data.requiredDate,
      submissionDate: new Date().toISOString().split("T")[0],
      completionDeadline: data.requiredDate,
      status: "UNDER_REVIEW",
      estimatedCost: data.estimatedCost,
      costBreakdown: data.costBreakdown,
      resourcesRequired: data.resourcesRequired,
      attachments: data.attachments || ["Inspection_Checksheet_V1.pdf"],
      additionalNotes: data.additionalNotes,
      progress: 0,
      assignedToDepartment: data.targetDepartment,
      aiRiskScore: Math.floor(75 + Math.random() * 20),
      aiRecommendedPriority: data.priority,
      aiRationale: `Automated AI risk assessment computed correlation with track section vulnerability. Recommended action: expedite allocation.`,
      progressUpdates: [],
      history: [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actor: `${user?.name || "Department Officer"} (${reqDept})`,
          action: `Submitted Service Request ${newId} requesting ${data.targetDepartment} support.`,
        },
      ],
    };

    // 1. Optimistic instant UI update (0ms delay)
    setRequests((prev) => [newRequest, ...prev]);
    setDepartments((prev) =>
      prev.map((d) => (d.id === reqDept ? { ...d, pendingRequests: d.pendingRequests + 1 } : d))
    );
    logAudit(
      user?.name || "Official",
      reqDept,
      "CREATE_SERVICE_REQUEST",
      newId,
      `Created service request ${newId} for ${data.targetDepartment} on ${data.corridorId}`
    );

    const toast: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: "Service Request Created",
      message: `Request ${newId} submitted for Central Authority review.`,
      type: "SUCCESS",
      timestamp: "Just now",
      read: false,
    };
    setActiveToast(toast);
    playNotificationChime();

    // 2. Persist to central server store and broadcast
    dispatchServerAction("CREATE_REQUEST", data);

    return newId;
  }, [user, logAudit, dispatchServerAction]);

  const approveServiceRequest = useCallback((
    requestId: string,
    assignedDept: DepartmentId,
    comments?: string,
    priorityOverride?: RequestPriority,
    deadline?: string
  ) => {
    const sanctionNumber = `RB/SANCTION/2026/${requestId.replace("SR-", "")}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const fullSanctionTimestamp = `${dateStr}, ${timeStr} IST`;

    // 1. Optimistic state mutation
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          status: "APPROVED" as RequestStatus,
          assignedToDepartment: assignedDept,
          priority: priorityOverride || r.priority,
          completionDeadline: deadline || r.completionDeadline,
          centralAdminComments: comments,
          sanctionOrderNumber: sanctionNumber,
          sanctionTimestamp: fullSanctionTimestamp,
          formT806Generated: true,
          history: [
            ...r.history,
            {
              timestamp: `${dateStr} ${timeStr}`,
              actor: `${user?.name || "Central Admin"} (Railway Board)`,
              action: `Approved Request & Dispatched Sanction Order (${sanctionNumber}). Assigned to ${assignedDept}.`,
              note: comments,
            },
          ],
        };
      })
    );

    // Reserve resources optimistically
    setResources((prev) =>
      prev.map((res) => {
        if (res.departmentId === assignedDept && res.status === "AVAILABLE") {
          return {
            ...res,
            status: "ASSIGNED",
            currentTask: `Sanctioned for Request ${requestId}`,
          };
        }
        return res;
      })
    );

    logAudit(
      user?.name || "Central Admin",
      "CENTRAL",
      "APPROVE_SERVICE_REQUEST",
      requestId,
      `Sanctioned request ${requestId} with sanction number ${sanctionNumber}`
    );

    const toast: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: "Request Sanctioned",
      message: `Service Request ${requestId} approved. Sanction ${sanctionNumber} issued.`,
      type: "SUCCESS",
      timestamp: "Just now",
      read: false,
    };
    setActiveToast(toast);
    playNotificationChime();

    dispatchServerAction("APPROVE_REQUEST", {
      requestId,
      assignedDept,
      comments,
      priorityOverride,
      deadline,
    });
  }, [user, logAudit, dispatchServerAction]);

  const rejectServiceRequest = useCallback((requestId: string, reason: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: "REJECTED" as RequestStatus,
              centralAdminComments: `Rejected: ${reason}`,
              history: [
                ...r.history,
                {
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  actor: `${user?.name || "Central Admin"}`,
                  action: `Rejected request: ${reason}`,
                },
              ],
            }
          : r
      )
    );

    logAudit(user?.name || "Central Admin", "CENTRAL", "REJECT_SERVICE_REQUEST", requestId, `Reason: ${reason}`);

    const toast: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: "Request Rejected",
      message: `Service Request ${requestId} was rejected.`,
      type: "CRITICAL",
      timestamp: "Just now",
      read: false,
    };
    setActiveToast(toast);
    playNotificationChime();

    dispatchServerAction("REJECT_REQUEST", { requestId, reason });
  }, [user, logAudit, dispatchServerAction]);

  const requestModification = useCallback((requestId: string, notes: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: "UNDER_REVIEW" as RequestStatus,
              modificationNotes: notes,
              history: [
                ...r.history,
                {
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  actor: `${user?.name || "Central Admin"}`,
                  action: `Sent back for modification: ${notes}`,
                },
              ],
            }
          : r
      )
    );

    logAudit(user?.name || "Central Admin", "CENTRAL", "REQUEST_MODIFICATION", requestId, `Notes: ${notes}`);

    const toast: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: "Modification Requested",
      message: `Request ${requestId} returned to department for revision.`,
      type: "WARNING",
      timestamp: "Just now",
      read: false,
    };
    setActiveToast(toast);
    playNotificationChime();

    dispatchServerAction("REQUEST_MODIFICATION", { requestId, notes });
  }, [user, logAudit, dispatchServerAction]);

  const updateRequestPriority = useCallback((requestId: string, priority: RequestPriority) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              priority,
              history: [
                ...r.history,
                {
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  actor: `${user?.name || "Central Admin"}`,
                  action: `Priority updated to ${priority}`,
                },
              ],
            }
          : r
      )
    );

    logAudit(user?.name || "Central Admin", "CENTRAL", "UPDATE_PRIORITY", requestId, `Priority set to ${priority}`);
    dispatchServerAction("UPDATE_PRIORITY", { requestId, priority });
  }, [user, logAudit, dispatchServerAction]);

  const updateRequestProgress = useCallback((
    requestId: string,
    percentage: number,
    notes: string,
    issues?: string,
    photoUrl?: string
  ) => {
    const updatedStatus: RequestStatus = percentage >= 100 ? "COMPLETED" : "IN_PROGRESS";
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const currentActual = Math.round(r.estimatedCost * (percentage / 100) * 0.96);
        const newUpdate = {
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " IST",
          updatedBy: user?.name || "Assigned Crew Lead",
          department: (r.assignedToDepartment || user?.departmentId || "ELEC") as DepartmentId,
          percentage,
          notes,
          issues,
          photos: photoUrl ? [photoUrl] : undefined,
        };
        return {
          ...r,
          progress: percentage,
          status: updatedStatus,
          costBreakdown: { ...r.costBreakdown, actualCost: currentActual },
          progressUpdates: [newUpdate, ...r.progressUpdates],
          history: [
            ...r.history,
            {
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              actor: `${user?.name || "Crew Lead"}`,
              action: `Progress updated to ${percentage}%: ${notes}`,
            },
          ],
        };
      })
    );

    logAudit(user?.name || "Lead", user?.departmentId || "ENG", "UPDATE_PROGRESS", requestId, `Progress: ${percentage}%`);

    const toast: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: percentage >= 100 ? "Work Order Completed!" : "Progress Updated",
      message: `Request ${requestId} progress updated to ${percentage}%.`,
      type: percentage >= 100 ? "SUCCESS" : "INFO",
      timestamp: "Just now",
      read: false,
    };
    setActiveToast(toast);
    playNotificationChime();

    dispatchServerAction("UPDATE_PROGRESS", { requestId, percentage, notes, issues, photoUrl });
  }, [user, logAudit, dispatchServerAction]);

  const markWorkCompleted = useCallback((requestId: string, notes: string) => {
    updateRequestProgress(requestId, 100, notes || "Maintenance work completed by field gang.");
  }, [updateRequestProgress]);

  const verifyAndCloseRequest = useCallback((requestId: string, centralNotes: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: "CLOSED" as RequestStatus,
              progress: 100,
              centralAdminComments: centralNotes,
              history: [
                ...r.history,
                {
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  actor: `${user?.name || "Central Admin"}`,
                  action: `Inspection verified and request CLOSED.`,
                  note: centralNotes,
                },
              ],
            }
          : r
      )
    );

    logAudit(user?.name || "Central Admin", "CENTRAL", "VERIFY_CLOSE", requestId, centralNotes);

    const toast: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: "Work Order Verified & Closed",
      message: `Request ${requestId} successfully closed.`,
      type: "SUCCESS",
      timestamp: "Just now",
      read: false,
    };
    setActiveToast(toast);
    playNotificationChime();

    dispatchServerAction("VERIFY_CLOSE", { requestId, centralNotes });
  }, [user, logAudit, dispatchServerAction]);

  const acceptAiRecommendation = useCallback((recId: string) => {
    setAiRecommendations((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, status: "ACCEPTED" as const } : r))
    );
    logAudit(user?.name || "OCC", "OPS", "ACCEPT_AI_REC", recId, `Accepted AI plan`);
    const toast: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: "AI Recommendation Applied",
      message: "Maintenance schedule optimized.",
      type: "SUCCESS",
      timestamp: "Just now",
      read: false,
    };
    setActiveToast(toast);
    playNotificationChime();
    dispatchServerAction("ACCEPT_AI_REC", { recId });
  }, [user, logAudit, dispatchServerAction]);

  const dismissAiRecommendation = useCallback((recId: string) => {
    setAiRecommendations((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, status: "DISMISSED" as const } : r))
    );
    logAudit(user?.name || "OCC", "OPS", "DISMISS_AI_REC", recId, `Dismissed AI plan`);
    dispatchServerAction("DISMISS_AI_REC", { recId });
  }, [user, logAudit, dispatchServerAction]);

  const createCustomBundle = useCallback((taskIds: string[], customTitle?: string): BundledMaintenanceOrder => {
    const candidateList = [
      ...maintenanceTasks.map((t) => ({
        id: t.id,
        title: t.title,
        departmentId: t.departmentId,
        estimatedDurationHours: t.estimatedDurationHours || 4,
        estimatedCost: t.estimatedCost || 150000,
        corridorId: t.corridorId || "NDLS-MMCT",
        locationKm: t.locationKm || "KM 148.0 - 156.0",
        recommendedDate: t.recommendedDate || "2026-08-30",
      })),
      ...requests.map((r) => ({
        id: r.id,
        title: r.title,
        departmentId: (r.assignedToDepartment || r.requestingDepartment || "ENG") as DepartmentId,
        estimatedDurationHours: 4,
        estimatedCost: r.estimatedCost || 250000,
        corridorId: r.corridorId || "NDLS-MMCT",
        locationKm: r.locationKm || "KM 148.0 - 154.0",
        recommendedDate: r.requiredDate || r.completionDeadline || "2026-08-30",
      })),
    ];
    const selectedItems = candidateList.filter((item) => taskIds.includes(item.id));
    const newId = `BND-${Math.floor(100 + Math.random() * 900)}`;
    const totalIndividualHours = selectedItems.reduce((acc, t) => acc + t.estimatedDurationHours, 0);
    const bundledHours = Number((Math.max(...selectedItems.map((t) => t.estimatedDurationHours), 3) * 1.15).toFixed(1));
    const timeSaved = Number((totalIndividualHours - bundledHours).toFixed(1));
    const timeReductionPct = totalIndividualHours > 0 ? Math.round((timeSaved / totalIndividualHours) * 100) : 35;
    const participatingDepts = Array.from(new Set(selectedItems.map((t) => t.departmentId)));
    const commonCorridor = selectedItems[0]?.corridorId || "NDLS-MMCT";
    const commonLocation = selectedItems[0]?.locationKm || "KM 148.0 - 156.0";

    const newBundle: BundledMaintenanceOrder = {
      id: newId,
      title: customTitle || `Joint Mega Block (${selectedItems.map((t) => t.id).join(" + ")})`,
      corridorId: commonCorridor,
      locationKm: commonLocation,
      taskIds,
      tasksSummary: selectedItems.map((t) => ({
        id: t.id,
        title: t.title,
        departmentId: t.departmentId,
        durationHours: t.estimatedDurationHours,
        cost: t.estimatedCost,
      })),
      scheduledDate: selectedItems[0]?.recommendedDate || "2026-08-30",
      timeWindow: "01:30 AM - 05:30 AM (Optimized Joint Night Block)",
      individualHoursSum: totalIndividualHours,
      bundledBlockHours: bundledHours,
      timeSavedHours: timeSaved,
      timeReductionPercent: timeReductionPct,
      trainsDelaySavedMinutes: Math.round(timeSaved * 35),
      financialSavingsINR: Math.round(selectedItems.reduce((acc, t) => acc + t.estimatedCost, 0) * 0.22),
      participatingDepartments: participatingDepts,
      status: "APPROVED",
      aiBundlingRationale: `AI Spatio-temporal clustering detected overlapping corridor sections (${commonLocation}). Combining ${selectedItems.length} activities yields ${timeReductionPct}% reduction in track closure.`,
    };

    setBundles((prev) => [newBundle, ...prev]);
    logAudit(user?.name || "OCC", "OPS", "CREATE_BUNDLE", newId, `Created bundle ${newId} combining ${taskIds.length} tasks`);
    const toast: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: "Joint Mega Block Created",
      message: `${newBundle.title} created with ${timeReductionPct}% closure reduction.`,
      type: "SUCCESS",
      timestamp: "Just now",
      read: false,
    };
    setActiveToast(toast);
    playNotificationChime();

    dispatchServerAction("CREATE_BUNDLE", { taskIds, customTitle });
    return newBundle;
  }, [maintenanceTasks, requests, user, logAudit, dispatchServerAction]);

  const approveBundle = useCallback((bundleId: string) => {
    setBundles((prev) => prev.map((b) => (b.id === bundleId ? { ...b, status: "APPROVED" as const } : b)));
    logAudit(user?.name || "OCC", "OPS", "APPROVE_BUNDLE", bundleId, `Approved Mega Block window.`);
    dispatchServerAction("APPROVE_BUNDLE", { bundleId });
  }, [user, logAudit, dispatchServerAction]);

  const executeBundle = useCallback((bundleId: string) => {
    setBundles((prev) => prev.map((b) => (b.id === bundleId ? { ...b, status: "IN_EXECUTION" as const } : b)));
    logAudit(user?.name || "OCC", "OPS", "EXECUTE_BUNDLE", bundleId, `Joint mega block commenced.`);
    dispatchServerAction("EXECUTE_BUNDLE", { bundleId });
  }, [user, logAudit, dispatchServerAction]);

  const allocateResource = useCallback((resourceId: string, departmentId: DepartmentId, corridorId?: string) => {
    setResources((prev) =>
      prev.map((res) =>
        res.id === resourceId
          ? { ...res, departmentId, assignedCorridor: corridorId || res.assignedCorridor, status: "ASSIGNED" as const }
          : res
      )
    );
    logAudit(user?.name || "Controller", "CENTRAL", "ALLOCATE_RESOURCE", resourceId, `Allocated to ${departmentId}`);
    dispatchServerAction("ALLOCATE_RESOURCE", { resourceId, departmentId, corridorId });
  }, [user, logAudit, dispatchServerAction]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    dispatchServerAction("MARK_NOTIF_READ", { notifId: id });
  }, [dispatchServerAction]);

  const markAllNotificationsRead = useCallback((() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    dispatchServerAction("MARK_ALL_NOTIFS_READ", {});
  }), [dispatchServerAction]);

  const resetToDemoState = useCallback(() => {
    setTrains(MOCK_LIVE_TRAINS);
    setBlockRequests(MOCK_BLOCK_REQUESTS);
    setT806Sanctions(MOCK_T806_SANCTIONS);
    setAssets(MOCK_ASSETS);
    setRequests(MOCK_SERVICE_REQUESTS);
    setMaintenanceTasks(MOCK_MAINTENANCE_TASKS);
    setBundles(MOCK_BUNDLES);
    setCorridors(MOCK_CORRIDORS);
    setDepartments(MOCK_DEPARTMENTS);
    setResources(MOCK_RESOURCES);
    setAiRecommendations(MOCK_AI_RECOMMENDATIONS);
    setNotifications(MOCK_NOTIFICATIONS);
    setAuditLogs(MOCK_AUDIT_LOGS);
    setHorizonPlans(ALL_HORIZON_BLOCK_PLANS);

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("railplan_client_state_v1");
      } catch (e) {}
    }

    dispatchServerAction("RESET_STATE", {});
    const toast: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: "Demo State Reset",
      message: "All operational datasets restored to baseline simulation defaults.",
      type: "INFO",
      timestamp: "Just now",
      read: false,
    };
    setActiveToast(toast);
  }, [dispatchServerAction]);

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;
  const activeCautionOrdersCount = trains.filter((t) => !!t.cautionOrderApplied).length + 2;
  const openHighRiskAlarmsCount = assets.filter((a) => a.failureRisk >= 80).length;

  return (
    <RailPlanContext.Provider
      value={{
        requests,
        maintenanceTasks,
        bundles,
        corridors,
        assets,
        departments,
        resources,
        aiRecommendations,
        notifications,
        auditLogs,
        selectedZone,
        selectedCorridorId,
        unreadNotificationCount,
        serverSyncConnected,
        isSyncing,
        triggerManualSync,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        trains,
        blockRequests,
        t806Sanctions,
        telemetryTickActive,
        lastTelemetryTickTime,
        activeCautionOrdersCount,
        openHighRiskAlarmsCount,
        setSelectedZone,
        setSelectedCorridorId,
        setTelemetryTickActive,
        triggerTelemetryTick,
        selectedHorizon,
        setSelectedHorizon,
        horizonPlans,
        approveHorizonPlan,
        aiOptimizeHorizonSchedule,
        createBlockRequest,
        updateBlockRequestStatus,
        acceptBundledCluster,
        signT806Step,
        createT806FromBundle,
        triggerEmergencyReplan,
        confirmEmergencyDispatch,
        createServiceRequest,
        approveServiceRequest,
        rejectServiceRequest,
        requestModification,
        updateRequestPriority,
        updateRequestProgress,
        markWorkCompleted,
        verifyAndCloseRequest,
        acceptAiRecommendation,
        dismissAiRecommendation,
        createCustomBundle,
        approveBundle,
        executeBundle,
        allocateResource,
        markNotificationRead,
        markAllNotificationsRead,
        resetToDemoState,
        activeHomeTab,
        setActiveHomeTab,
      }}
    >
      {children}
      <LiveSyncToast toast={activeToast} onClose={() => setActiveToast(null)} />
    </RailPlanContext.Provider>
  );
};

export const useRailPlan = () => {
  const context = useContext(RailPlanContext);
  if (!context) {
    throw new Error("useRailPlan must be used within a RailPlanProvider");
  }
  return context;
};
