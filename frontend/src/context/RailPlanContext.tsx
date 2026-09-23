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
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);

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
    return id;
  };

  const updateBlockRequestStatus = (id: string, status: MaintenanceBlockRequest["status"]) => {
    setBlockRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

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
    createT806FromBundle(
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
          `Completed Step ${step} sign-off for Form T/806 Block Authority ${s.sanctionNumber}.`
        );

        return updated;
      })
    );

    playNotificationChime();
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

    return {
      success: true,
      message: `Emergency Dispatch confirmed by ${user?.name} (${user?.designation}). Digital Confirmation Stamp: IR-OCC-STAMP-${Date.now().toString(16).toUpperCase()}`,
    };
  };

  // Legacy Service Request & Department Handlers
  const createServiceRequest = (data: any): string => {
    const id = `REQ-SR-${Date.now().toString().slice(-4)}`;
    return id;
  };
  const approveServiceRequest = () => {};
  const rejectServiceRequest = () => {};
  const requestModification = () => {};
  const updateRequestPriority = () => {};
  const updateRequestProgress = () => {};
  const markWorkCompleted = () => {};
  const verifyAndCloseRequest = () => {};
  const acceptAiRecommendation = () => {};
  const dismissAiRecommendation = () => {};
  const createCustomBundle = (taskIds: string[], customTitle?: string) => bundles[0];
  const approveBundle = () => {};
  const executeBundle = () => {};
  const allocateResource = () => {};
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };
  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  const resetToDemoState = () => {
    setTrains(MOCK_LIVE_TRAINS);
    setBlockRequests(MOCK_BLOCK_REQUESTS);
    setT806Sanctions(MOCK_T806_SANCTIONS);
    setAssets(MOCK_ASSETS);
  };

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
