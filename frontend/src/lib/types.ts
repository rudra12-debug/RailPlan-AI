export type DepartmentId = 
  | 'ENG'   // Civil (Civil Engineering, Permanent Way, Track & Bridges)
  | 'ELEC'  // Electrical/OHE (25kV Traction, Substations & Catenary)
  | 'SNT'   // Signal & Traffic (Signal & Telecommunication, Kavach TCAS, Interlocking)
  | 'SFTY'  // Safety (Safety Directorate, CRS Compliance & Sanctions)
  | 'CIVIL' // Alias for Civil
  | 'TRK'   // Legacy alias mapped to Civil
  | 'OPS'   // Operations Control
  | 'MECH'  // (Removed directorate)
  | 'FIN'   // (Removed directorate)
  | 'WRK';  // (Removed directorate)

export type UserRole = 'CENTRAL_ADMIN' | 'DEPT_USER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: DepartmentId;
  departmentName?: string;
  designation: string;
  zone: string;
  division: string;
  avatarUrl?: string;
}

export interface DepartmentInfo {
  id: DepartmentId;
  name: string;
  code: string;
  headName: string;
  email: string;
  userCount: number;
  activeTasks: number;
  pendingRequests: number;
  allocatedBudget: number; // in ₹
  usedBudget: number; // in ₹
  workforceTotal: number;
  workforceActive: number;
  equipmentCount: number;
  performanceScore: number; // 0 - 100
  color: string;
  description: string;
}

export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';

export type RequestStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CENTRAL_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'VERIFIED'
  | 'CLOSED';

export type ServiceRequestType = 
  | 'Workforce Request'
  | 'Equipment Request'
  | 'Budget Request'
  | 'Emergency Maintenance'
  | 'Signal Support'
  | 'Electrical Support'
  | 'Track Repair'
  | 'Inspection Request'
  | 'Safety Inspection'
  | 'Material Request'
  | 'Other';

export interface CostBreakdown {
  labour: number;
  equipment: number;
  material: number;
  logistics: number;
  trackBlock: number;
  contingency: number;
  totalEstimated: number;
  actualCost: number;
}

export interface WorkProgressUpdate {
  timestamp: string;
  updatedBy: string;
  department: DepartmentId;
  percentage: number;
  notes: string;
  issues?: string;
  photos?: string[];
  documents?: string[];
}

export interface ServiceRequest {
  id: string;
  title: string;
  requestingDepartment: DepartmentId;
  targetDepartment: DepartmentId;
  corridorId: string;
  locationKm: string;
  requestType: ServiceRequestType;
  priority: RequestPriority;
  description: string;
  requiredDate: string;
  submissionDate: string;
  completionDeadline?: string;
  status: RequestStatus;
  estimatedCost: number;
  costBreakdown: CostBreakdown;
  resourcesRequired: string[];
  attachments?: string[];
  additionalNotes?: string;
  progress: number; // 0 to 100
  assignedToDepartment?: DepartmentId;
  centralAdminComments?: string;
  modificationNotes?: string;
  aiRiskScore: number; // 0 - 100
  aiRecommendedPriority?: RequestPriority;
  aiRationale?: string;
  sanctionOrderNumber?: string; // e.g. "RB/O&M/2026/SANCTION-814"
  sanctionTimestamp?: string; // e.g. "12 Sep 2026, 11:44:05 AM IST"
  formT806Generated?: boolean;
  progressUpdates: WorkProgressUpdate[];
  history: {
    timestamp: string;
    actor: string;
    action: string;
    note?: string;
  }[];
}

export type RiskLevel = 'NORMAL' | 'ATTENTION' | 'MEDIUM_RISK' | 'CRITICAL' | 'PLANNED';

export interface CorridorAsset {
  id: string;
  name: string;
  type: 'SIGNAL' | 'POINT_MACHINE' | 'TRACK_CIRCUIT' | 'OHE_CATENARY' | 'TRANSFORMER' | 'RAIL_JOINT' | 'BRIDGE_PIER';
  corridorId: string;
  locationKm: string;
  status: 'NORMAL' | 'ATTENTION' | 'CRITICAL' | 'UNDER_MAINTENANCE';
  failureRisk: number; // 0 - 100
  lastMaintenanceDate: string;
  nextRecommendedInspection: string;
  telemetry: {
    vibration?: number; // mm/s
    temperature?: number; // °C
    voltage?: number; // V
    stressLevel?: number; // MPa
    cyclesCount?: number;
    tqiScore?: number; // Track Quality Index (< 36 is good)
    catenaryStaggerMm?: number; // ±200mm nominal
    switchOpeningMm?: number; // 115±3mm
    aftcFrequencyHz?: string; // e.g. 1699Hz
    // RailPlan AI Telemetry Specification
    railTemperature?: number; // °C (25 - 68)
    vibrationAmplitude?: number; // mm/s (0.5 - 8.2)
    oheContactWireTension?: number; // kN (8 - 16)
    pantographContactWear?: number; // mm (0.5 - 4.8)
    trackGeometryGaugeDeviation?: number; // mm (-4 to +12)
    dynamicRiskScore?: number; // 0 - 100%
  };
  departmentResponsible: DepartmentId;
}

export interface RailwayCorridor {
  id: string;
  name: string;
  zone: string;
  route: string;
  totalLengthKm: number;
  status: RiskLevel;
  activeMaintenanceCount: number;
  activeTrainsCount: number;
  delayedProjectsCount: number;
  criticalSpotsCount: number;
  stations: {
    name: string;
    code: string;
    km: number;
    hasActiveBlock: boolean;
    status: RiskLevel;
    platformsCount?: number;
    interlockingType?: string;
    lat?: number;
    lng?: number;
  }[];
  coordinates: { x: number; y: number }[];
  geoCoordinates?: [number, number][]; // [lat, lng] for real geographical maps
}

export interface MaintenanceTask {
  id: string;
  title: string;
  assetId: string;
  assetName: string;
  assetType: string;
  corridorId: string;
  locationKm: string;
  departmentId: DepartmentId;
  maintenanceType: 'Preventive' | 'Corrective' | 'Emergency' | 'Periodic Overhaul' | 'USFD Ultrasonic Scan';
  lastInspectionDate: string;
  riskScore: number; // 0 - 100
  recommendedDate: string;
  estimatedDurationHours: number;
  estimatedCost: number;
  status: 'SCHEDULED' | 'PENDING_APPROVAL' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  progress: number;
  assignedTeam: string;
  requiredResources: string[];
}

export interface BundledMaintenanceOrder {
  id: string;
  title: string;
  corridorId: string;
  locationKm: string;
  taskIds: string[];
  tasksSummary: {
    id: string;
    title: string;
    departmentId: DepartmentId;
    durationHours: number;
    cost: number;
  }[];
  scheduledDate: string;
  timeWindow: string;
  individualHoursSum: number;
  bundledBlockHours: number;
  timeSavedHours: number;
  timeReductionPercent: number;
  trainsDelaySavedMinutes: number;
  financialSavingsINR: number;
  participatingDepartments: DepartmentId[];
  status: 'PROPOSED' | 'APPROVED' | 'IN_EXECUTION' | 'COMPLETED';
  aiBundlingRationale: string;
  sanctionGazetteNumber?: string;
}

export interface OfficialSanctionOrder {
  orderNumber: string;
  formType: 'FORM_T806_BLOCK_SANCTION' | 'FORM_T409_CAUTION_TSR' | 'FORM_T1518_FITNESS_CERT';
  title: string;
  date: string;
  issuingAuthority: string;
  issuingDesignation: string;
  zone: string;
  division: string;
  corridorId: string;
  locationKm: string;
  lineAffected: string;
  speedRestrictionKmph?: number;
  tractionPowerCutoff: boolean;
  blockDurationHours: number;
  sanctionedWindow: string;
  associatedRequestId: string;
  participatingDepartments: string[];
  gsrClausesCited: string[];
  qrCodeText: string;
  digitalSignatureHash: string;
  status: 'ISSUED' | 'ACTIVE_ON_TRACK' | 'CANCELLED_LINE_CLEAR';
}

export interface AiRecommendation {
  id: string;
  title: string;
  description: string;
  departmentId: DepartmentId;
  corridorId: string;
  riskScore: number;
  confidenceScore: number; // 0 - 100
  reason: string;
  suggestedAction: string;
  estimatedCostImpact: number; // in ₹
  estimatedDelayReductionMinutes: number;
  status: 'PENDING' | 'ACCEPTED' | 'MODIFIED' | 'DISMISSED';
  createdAt: string;
}

export interface ResourceItem {
  id: string;
  name: string;
  category: 'WORKFORCE' | 'EQUIPMENT';
  type: string;
  departmentId: DepartmentId;
  assignedCorridor?: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'UNAVAILABLE' | 'UNDER_MAINTENANCE';
  currentTask?: string;
  operatorOrLead?: string;
  healthOrSkillLevel: string;
  utilizationRate: number; // 0 - 100
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  timestamp: string;
  read: boolean;
  departmentId?: DepartmentId | 'ALL';
  linkHref?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  department: string;
  action: string;
  entityId: string;
  previousStatus?: string;
  newStatus?: string;
  details: string;
}

export interface WhatIfParameters {
  delayDays: number;
  workforceAvailablePercent: number;
  equipmentUptimePercent: number;
  budgetCapLakhs: number;
  trainTrafficMgt: number; // Million Gross Tonnes
  monsoonWeatherSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
}

export interface WhatIfSimulationResult {
  failureProbabilityPercent: number;
  projectedCost: number; // in ₹
  passengersAffectedThousands: number;
  trainDelayTotalMinutes: number;
  projectedCompletionDate: string;
  trackClosureHours: number;
  safetyIndex: number; // 0 - 100
}

export interface EmergencyIncidentRequest {
  incidentType: 'Rail Fracture' | 'OHE Tripping / Catenary Snap' | 'Signal Interlocking Failure' | 'Track Washaway / Flood' | 'Derailment Hazard' | 'Point Machine Jam';
  corridorId: string;
  locationKm: string;
  severity: 'HIGH' | 'CRITICAL' | 'DISASTER';
  expectedDurationHours: number;
  reportedBy: string;
  notes: string;
}

export interface EmergencyReplanResult {
  affectedTrainsCount: number;
  trainsToReroute: string[];
  allocatedEmergencyWindow: string;
  mobilizedDepartments: DepartmentId[];
  requiredEquipment: string[];
  estimatedRestorationTime: string;
  costImpact: number;
  recommendedResponseSteps: string[];
}

export type StandardRole =
  | 'SECTION_ENGINEER_CIVIL'
  | 'OHE_ENGINEER'
  | 'SNT_ENGINEER'
  | 'OCC_CHIEF_CONTROLLER'
  | 'SAFETY_OFFICER'
  | 'ADMIN';

export interface JwtTokenPayload {
  sub: string;
  name: string;
  role: StandardRole;
  departmentId: DepartmentId;
  departmentName: string;
  designation: string;
  zone: string;
  division: string;
  permissions: string[];
  iat: number;
  exp: number;
  signature: string;
}

export interface LiveTrain {
  id: string;
  trainNumber: string;
  trainName: string;
  corridorId?: string;
  priority: 1 | 2 | 3 | 4 | 5; // 1: Vande Bharat / Shatabdi, 2: Mail/SF, 3: Express, 4: Freight, 5: Work Train
  trainType: 'PREMIUM_SUPERFAST' | 'EXPRESS' | 'FREIGHT_CONTAINER' | 'FREIGHT_HEAVY' | 'WORK_SPECIAL';
  currentKm: number;
  currentSpeedKmph: number;
  maxSpeedKmph: number;
  direction: 'UP' | 'DOWN'; // UP (toward Bhopal/Delhi), DOWN (toward Itarsi/Mumbai)
  trackLine: 'UP_LINE' | 'DOWN_LINE' | 'LOOP_LINE';
  nextBlockSection: string;
  delayMinutes: number;
  origin: string;
  destination: string;
  locoNumber: string;
  status: 'RUNNING_ON_TIME' | 'DELAYED' | 'HALTED_AT_SIGNAL' | 'SLOWED_CAUTION' | 'DIVERTED';
  cautionOrderApplied?: string;
  updatedAt?: string;
}

export interface MaintenanceBlockRequest {
  id: string;
  blockId: string;
  title: string;
  department: 'Civil' | 'Electrical/OHE' | 'Signal & Traffic' | 'Safety';
  departmentId: DepartmentId;
  corridorId: string;
  fromKm: number;
  toKm: number;
  locationSection: string;
  trackLine: 'UP_LINE' | 'DOWN_LINE' | 'BOTH_LINES';
  requestedWindow: string; // e.g. "04:00 - 06:30"
  durationHours: number;
  scheduledDate: string;
  resourceRequirements: string[]; // ["Tower Wagon", "Tamping Machine", "Work Train"]
  cautionSpeedRequiredKmph?: number;
  requiresOHEPowerCut: boolean;
  status: 'Draft' | 'Submitted' | 'Bundled' | 'Sanctioned' | 'Active' | 'Closed';
  riskScore: number;
  description: string;
  t806Id?: string;
  bundleId?: string;
  requestedBy?: string;
}

export interface StatutoryT806Sanction {
  id: string;
  sanctionNumber: string; // e.g., "WCR/BPL-ET/T806/2026/044"
  blockId: string;
  corridorId: string;
  corridorName: string;
  fromKm: number;
  toKm: number;
  trackLine: 'UP_LINE' | 'DOWN_LINE' | 'BOTH_LINES';
  sanctionedWindow: string;
  durationHours: number;
  cautionSpeedKmph: number;
  tractionPowerCutoff: boolean;
  ohePermitToWorkNumber?: string;
  tpcIsolationCertificateNumber?: string;
  associatedRequestId?: string;
  associatedBundleId?: string;
  gsrRulesCited: string[];
  signoffPipeline: {
    step1DeptSubmission: { completed: boolean; by?: string; timestamp?: string };
    step2PowerIsolation: { completed: boolean; by?: string; certificate?: string; timestamp?: string };
    step3TrafficSanction: { completed: boolean; by?: string; timestamp?: string };
    step4T806Issued: { completed: boolean; by?: string; timestamp?: string; qrCodeHash?: string };
  };
  currentStep: 1 | 2 | 3 | 4;
  status: 'DRAFT' | 'ISOLATION_CONFIRMED' | 'SANCTIONED' | 'ACTIVE_BLOCK' | 'CLOSED_CANCELLED';
  issuingOfficer: string;
  issuingDesignation: string;
  participatingDepartments: string[];
  digitalSignatureHash: string;
  previousHash?: string;
  issuedAt: string;
  cautionOrderSummary?: string;
}

