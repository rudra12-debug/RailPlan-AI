import fs from "fs";
import path from "path";
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
  BundledMaintenanceOrder,
  UserProfile,
  DepartmentId,
  RequestPriority,
  RequestStatus,
  ServiceRequestType,
  CostBreakdown,
  EmergencyIncidentRequest,
  EmergencyReplanResult,
} from "./types";
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
} from "./mockData";

export interface ServerState {
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
  stateVersion: number;
  lastUpdated: string;
}

// Global in-memory singleton to persist across Next.js API requests
declare global {
  // eslint-disable-next-line no-var
  var __railplan_server_state__: ServerState | undefined;
}

const DB_FILE_PATH = path.join(process.cwd(), ".railplan_server_db.json");

function getInitialState(): ServerState {
  return {
    requests: JSON.parse(JSON.stringify(MOCK_SERVICE_REQUESTS)),
    maintenanceTasks: JSON.parse(JSON.stringify(MOCK_MAINTENANCE_TASKS)),
    bundles: JSON.parse(JSON.stringify(MOCK_BUNDLES)),
    corridors: JSON.parse(JSON.stringify(MOCK_CORRIDORS)),
    assets: JSON.parse(JSON.stringify(MOCK_ASSETS)),
    departments: JSON.parse(JSON.stringify(MOCK_DEPARTMENTS)),
    resources: JSON.parse(JSON.stringify(MOCK_RESOURCES)),
    aiRecommendations: JSON.parse(JSON.stringify(MOCK_AI_RECOMMENDATIONS)),
    notifications: JSON.parse(JSON.stringify(MOCK_NOTIFICATIONS)),
    auditLogs: JSON.parse(JSON.stringify(MOCK_AUDIT_LOGS)),
    stateVersion: 1,
    lastUpdated: new Date().toISOString(),
  };
}

function loadState(): ServerState {
  if (global.__railplan_server_state__) {
    return global.__railplan_server_state__;
  }

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      global.__railplan_server_state__ = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn("Could not read server db file, using fresh initial state:", err);
  }

  const initial = getInitialState();
  global.__railplan_server_state__ = initial;
  saveState(initial);
  return initial;
}

function saveState(state: ServerState) {
  state.stateVersion += 1;
  state.lastUpdated = new Date().toISOString();
  global.__railplan_server_state__ = state;

  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write server db file:", err);
  }
}

export function getServerState(): ServerState {
  return loadState();
}

export function resetServerState(): ServerState {
  const fresh = getInitialState();
  fresh.stateVersion = (global.__railplan_server_state__?.stateVersion || 1) + 1;
  global.__railplan_server_state__ = fresh;
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(fresh, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not reset server db file:", err);
  }
  return fresh;
}

export function executeServerAction(
  actionType: string,
  payload: any,
  actor?: Partial<UserProfile>
): { success: boolean; state: ServerState; result?: any } {
  const state = loadState();

  const addAuditLog = (
    action: string,
    entityId: string,
    details: string,
    prev?: string,
    next?: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp:
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }) +
        " " +
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
      user: actor?.name || "System Operator",
      department: actor?.departmentName || "Central Authority",
      action,
      entityId,
      previousStatus: prev,
      newStatus: next,
      details,
    };
    state.auditLogs = [newEntry, ...state.auditLogs];
  };

  const addNotification = (
    title: string,
    message: string,
    type: "INFO" | "WARNING" | "CRITICAL" | "SUCCESS",
    deptId: DepartmentId | "ALL" = "ALL",
    linkHref?: string
  ) => {
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      title,
      message,
      type,
      timestamp: "Just now",
      read: false,
      departmentId: deptId,
      linkHref,
    };
    state.notifications = [newNotif, ...state.notifications];
  };

  let actionResult: any = null;

  switch (actionType) {
    // 1. Create Service Request
    case "CREATE_REQUEST": {
      const reqDept = (actor?.departmentId as DepartmentId) || "ENG";
      const newId = `SR-${Math.floor(1000 + Math.random() * 9000)}`;

      const newRequest: ServiceRequest = {
        id: newId,
        title: payload.title,
        requestingDepartment: reqDept,
        targetDepartment: payload.targetDepartment,
        corridorId: payload.corridorId,
        locationKm: payload.locationKm,
        requestType: payload.requestType,
        priority: payload.priority,
        description: payload.description,
        requiredDate: payload.requiredDate,
        submissionDate: new Date().toISOString().split("T")[0],
        completionDeadline: payload.requiredDate,
        status: "UNDER_REVIEW",
        estimatedCost: payload.estimatedCost,
        costBreakdown: payload.costBreakdown,
        resourcesRequired: payload.resourcesRequired,
        attachments: payload.attachments || ["Inspection_Checksheet_V1.pdf"],
        additionalNotes: payload.additionalNotes,
        progress: 0,
        assignedToDepartment: payload.targetDepartment,
        aiRiskScore: Math.floor(75 + Math.random() * 20),
        aiRecommendedPriority: payload.priority,
        aiRationale: `Automated AI risk assessment computed correlation with track section vulnerability. Recommended action: expedite allocation.`,
        progressUpdates: [],
        history: [
          {
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            actor: `${actor?.name || "Department Officer"} (${reqDept})`,
            action: `Submitted Service Request ${newId} requesting ${payload.targetDepartment} support.`,
          },
        ],
      };

      state.requests = [newRequest, ...state.requests];
      state.departments = state.departments.map((d) =>
        d.id === reqDept ? { ...d, pendingRequests: d.pendingRequests + 1 } : d
      );

      addAuditLog(
        "Created Service Request",
        newId,
        `${reqDept} submitted request for ${payload.targetDepartment} on ${payload.corridorId} (${payload.locationKm})`,
        "DRAFT",
        "SUBMITTED"
      );

      addNotification(
        `New Request ${newId} Submitted`,
        `${reqDept} Department submitted: ${payload.title}`,
        "INFO",
        "ALL",
        "/central/approvals"
      );

      actionResult = newId;
      break;
    }

    // 2. Approve Service Request & Book Resources
    case "APPROVE_REQUEST": {
      const { requestId, assignedDept, comments, priorityOverride, deadline } = payload;
      const sanctionNumber = `RB/SANCTION/2026/${requestId.replace("SR-", "")}`;

      let requestingDept: DepartmentId = "ENG";
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      const dateStr = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const fullSanctionTimestamp = `${dateStr}, ${timeStr} IST`;

      const targetReq = state.requests.find((r) => r.id === requestId);
      const reqResources =
        targetReq?.resourcesRequired && targetReq.resourcesRequired.length > 0
          ? targetReq.resourcesRequired
          : ["Specialized Equipment & Crew Squad"];
      const reqDate =
        deadline || targetReq?.requiredDate || targetReq?.completionDeadline || "Scheduled Window";
      const corridor = targetReq?.corridorId || "NDLS-MMCT";
      const locationKm = targetReq?.locationKm || "KM Section";
      const reqTitle = targetReq?.title || "Maintenance Work Order";

      state.requests = state.requests.map((r) => {
        if (r.id === requestId) {
          requestingDept = r.requestingDepartment;
          const updatedPriority = priorityOverride || r.priority;
          const updatedHistory = [
            ...r.history,
            {
              timestamp: `${dateStr} ${timeStr}`,
              actor: `${actor?.name || "Central Admin"} (Executive Director O&M, Railway Board)`,
              action: `Approved Request & Dispatched Official Sanction Order (${sanctionNumber}). Assigned to ${assignedDept}. Priority: ${updatedPriority}. Reserved resources: ${reqResources.join(
                ", "
              )}.`,
              note: comments,
            },
          ];

          return {
            ...r,
            status: "APPROVED" as RequestStatus,
            assignedToDepartment: assignedDept,
            priority: updatedPriority,
            completionDeadline: deadline || r.completionDeadline,
            centralAdminComments: comments,
            sanctionOrderNumber: sanctionNumber,
            sanctionTimestamp: fullSanctionTimestamp,
            formT806Generated: true,
            history: updatedHistory,
          };
        }
        return r;
      });

      // Auto-book resources across fleet
      let matchedCount = 0;
      state.resources = state.resources.map((res) => {
        const matchesName = reqResources.some(
          (name: string) =>
            res.name.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(res.name.toLowerCase())
        );
        const matchesDept = res.departmentId === assignedDept;

        if (matchesName || (matchesDept && res.status === "AVAILABLE" && matchedCount < 2)) {
          matchedCount++;
          return {
            ...res,
            status: "ASSIGNED" as const,
            currentTask: `Sanctioned for Request ${requestId} (${reqTitle}) • Standby by ${reqDate}`,
            assignedCorridor: `${corridor} (${locationKm})`,
            utilizationRate: Math.min(100, Math.max(85, res.utilizationRate + 20)),
          };
        }
        return res;
      });

      addAuditLog(
        "Approved & Booked Resources",
        requestId,
        `Central Authority (Railway Board) sanctioned ${requestId} (Form T/806 Ref: ${sanctionNumber}). Resources [${reqResources.join(
          ", "
        )}] reserved from ${assignedDept} Directorate for ${reqDate}.`,
        "UNDER_REVIEW",
        "APPROVED"
      );

      // Notification 1: To Target Executing Department
      addNotification(
        `📋 Resource Allocation & Booking Order: ${requestId}`,
        `Central Admin approved Request ${requestId} (${reqTitle}). Mandatory resource booking activated for: [${reqResources.join(
          ", "
        )}]. Must be mobilized and available at ${corridor} (${locationKm}) by ${reqDate}.`,
        "WARNING",
        assignedDept,
        "/department/resources"
      );

      // Notification 2: To Requesting Department
      addNotification(
        `📜 Official Sanction Order & Resource Reservation: ${requestId}`,
        `Form T/806 (Ref: ${sanctionNumber}) sanctioned by Central Admin ${
          actor?.name || "Rajesh Verma"
        }. Required resources (${reqResources.join(
          ", "
        )}) booked from ${assignedDept} Directorate. Remarks: "${comments}"`,
        "SUCCESS",
        requestingDept,
        "/central/sanctions"
      );

      // Notification 3: Safety Directorate (SFTY) Statutory Notice
      if (assignedDept !== "SFTY") {
        addNotification(
          `🛡️ Safety & Statutory Compliance Notice: ${requestId}`,
          `Safety Directorate notice: Statutory clearance and safety monitoring required for ${reqTitle} on ${corridor} (${locationKm}) by ${reqDate}.`,
          "INFO",
          "SFTY",
          "/central/sanctions"
        );
      }

      // Notification 4: Central OCC Confirmation
      addNotification(
        `⚡ Resource Reservation Confirmed: ${requestId}`,
        `Inter-department resource booking locked for ${requestId} (${reqTitle}). Resources: [${reqResources.join(
          ", "
        )}] reserved from ${assignedDept} for ${reqDate}.`,
        "SUCCESS",
        "ALL",
        "/central/resources"
      );

      break;
    }

    // 3. Reject Request
    case "REJECT_REQUEST": {
      const { requestId, reason } = payload;
      state.requests = state.requests.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: "REJECTED" as RequestStatus,
            centralAdminComments: `Rejected: ${reason}`,
            history: [
              ...r.history,
              {
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                actor: `${actor?.name || "Central Admin"} (Central Authority)`,
                action: `Rejected request: ${reason}`,
              },
            ],
          };
        }
        return r;
      });

      addAuditLog(
        "Rejected Service Request",
        requestId,
        `Rejected by Central Admin. Reason: ${reason}`,
        "UNDER_REVIEW",
        "REJECTED"
      );
      addNotification(
        `Request ${requestId} Rejected`,
        `Central Admin rejected request: ${reason}`,
        "CRITICAL",
        "ALL"
      );
      break;
    }

    // 4. Request Modification
    case "REQUEST_MODIFICATION": {
      const { requestId, notes } = payload;
      state.requests = state.requests.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: "UNDER_REVIEW" as RequestStatus,
            modificationNotes: notes,
            history: [
              ...r.history,
              {
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                actor: `${actor?.name || "Central Admin"} (Central Authority)`,
                action: `Sent back for modification: ${notes}`,
              },
            ],
          };
        }
        return r;
      });

      addAuditLog(
        "Requested Modification",
        requestId,
        `Sent back for modification: ${notes}`,
        "UNDER_REVIEW",
        "UNDER_REVIEW"
      );
      addNotification(`Request ${requestId} Needs Modification`, notes, "WARNING", "ALL");
      break;
    }

    // 5. Update Priority
    case "UPDATE_PRIORITY": {
      const { requestId, priority } = payload;
      state.requests = state.requests.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            priority,
            history: [
              ...r.history,
              {
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                actor: `${actor?.name || "Central Admin"}`,
                action: `Updated priority to ${priority}`,
              },
            ],
          };
        }
        return r;
      });

      addAuditLog("Priority Elevation", requestId, `Changed priority to ${priority}`);
      break;
    }

    // 6. Update Progress
    case "UPDATE_PROGRESS": {
      const { requestId, percentage, notes, issues, photoUrl } = payload;
      const updatedStatus: RequestStatus = percentage >= 100 ? "COMPLETED" : "IN_PROGRESS";

      state.requests = state.requests.map((r) => {
        if (r.id === requestId) {
          const currentActual = Math.round(r.estimatedCost * (percentage / 100) * 0.96);
          const newUpdate = {
            timestamp:
              new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
              " " +
              new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
            updatedBy: actor?.name || "Assigned Crew Lead",
            department: (r.assignedToDepartment || actor?.departmentId || "ELEC") as DepartmentId,
            percentage,
            notes,
            issues,
            photos: photoUrl ? [photoUrl] : undefined,
          };

          return {
            ...r,
            progress: percentage,
            status: updatedStatus,
            costBreakdown: {
              ...r.costBreakdown,
              actualCost: currentActual,
            },
            progressUpdates: [newUpdate, ...r.progressUpdates],
            history: [
              ...r.history,
              {
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                actor: `${actor?.name || "Team Lead"} (${r.assignedToDepartment || "DEPT"})`,
                action: `Progress updated to ${percentage}%: ${notes}`,
              },
            ],
          };
        }
        return r;
      });

      addAuditLog(
        `Work Progress Updated (${percentage}%)`,
        requestId,
        `Progress updated to ${percentage}%. Notes: ${notes}`,
        "IN_PROGRESS",
        updatedStatus
      );

      if (percentage >= 100) {
        addNotification(
          `Work Completed: ${requestId}`,
          `Assigned department marked ${requestId} 100% complete. Ready for Central Verification.`,
          "SUCCESS",
          "ALL",
          "/central/approvals"
        );
      }
      break;
    }

    // 7. Verify & Close Request
    case "VERIFY_CLOSE": {
      const { requestId, centralNotes } = payload;
      state.requests = state.requests.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: "CLOSED" as RequestStatus,
            progress: 100,
            centralAdminComments: centralNotes,
            history: [
              ...r.history,
              {
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                actor: `${actor?.name || "Central Admin"} (Central Authority)`,
                action: `Inspection verified and request status changed to CLOSED.`,
                note: centralNotes,
              },
            ],
          };
        }
        return r;
      });

      const req = state.requests.find((r) => r.id === requestId);
      if (req && req.assignedToDepartment) {
        state.departments = state.departments.map((d) =>
          d.id === req.assignedToDepartment
            ? {
                ...d,
                usedBudget: d.usedBudget + req.estimatedCost,
                activeTasks: Math.max(0, d.activeTasks - 1),
              }
            : d
        );
      }

      addAuditLog(
        "Verified and Closed",
        requestId,
        `Central verification complete. ${centralNotes}`,
        "COMPLETED",
        "CLOSED"
      );
      addNotification(
        `Request ${requestId} Closed`,
        `Final sign-off completed by Central Admin.`,
        "SUCCESS",
        "ALL"
      );
      break;
    }

    // 8. Accept AI Recommendation
    case "ACCEPT_AI_REC": {
      const { recId } = payload;
      state.aiRecommendations = state.aiRecommendations.map((rec) =>
        rec.id === recId ? { ...rec, status: "ACCEPTED" as const } : rec
      );
      const rec = state.aiRecommendations.find((r) => r.id === recId);
      if (rec) {
        addAuditLog("AI Recommendation Accepted", recId, `Accepted AI Plan: "${rec.title}"`);
        addNotification(
          `AI Recommendation Applied`,
          `Maintenance schedule optimized. Estimated savings: ₹${Math.abs(
            rec.estimatedCostImpact / 1000
          ).toFixed(0)}K, Delay reduction: ${rec.estimatedDelayReductionMinutes} mins.`,
          "SUCCESS"
        );
      }
      break;
    }

    // 9. Dismiss AI Recommendation
    case "DISMISS_AI_REC": {
      const { recId } = payload;
      state.aiRecommendations = state.aiRecommendations.map((rec) =>
        rec.id === recId ? { ...rec, status: "DISMISSED" as const } : rec
      );
      addAuditLog("AI Recommendation Dismissed", recId, `User dismissed recommendation.`);
      break;
    }

    // 10. Trigger Emergency
    case "TRIGGER_EMERGENCY": {
      const incident: EmergencyIncidentRequest = payload;
      const result: EmergencyReplanResult = {
        affectedTrainsCount:
          incident.severity === "DISASTER" ? 24 : incident.severity === "CRITICAL" ? 14 : 6,
        trainsToReroute: [
          "12951 Mumbai - New Delhi Tejas Rajdhani",
          "12953 August Kranti Rajdhani Express",
          "12009 Mumbai - Ahmedabad Shatabdi",
          "Container Special DN-4402 (DFCCIL Freight)",
        ],
        allocatedEmergencyWindow:
          "Next Immediate Slot: 22:30 hrs - 03:00 hrs (4.5h Emergency Power & Traffic Block)",
        mobilizedDepartments: ["ENG", "ELEC", "SNT", "OPS", "SFTY"],
        requiredEquipment: [
          "140T Heavy Breakdown Crane CR-01",
          "25kV OHE Tower Wagon TW-08",
          "Ultrasonic Rail Tester USFD-02",
          "Emergency Track Tie Tamping Machine TM-04",
        ],
        estimatedRestorationTime: `${
          incident.expectedDurationHours || 4
        } Hours (Target Clearance: 04:30 AM)`,
        costImpact: 580000,
        recommendedResponseSteps: [
          "1. Immediate emergency signal aspect red & caution order on adjacent tracks.",
          "2. Isolate 25kV traction power between Substation 4 and Substation 5.",
          "3. Divert high-priority express passenger rakes via Loop Line / Alternative Chord.",
          "4. Dispatch heavy breakdown crane CR-01 & Emergency P-Way Gang Alpha.",
          "5. Central Control safety clearance post joint inspection by CSO.",
        ],
      };

      state.corridors = state.corridors.map((c) =>
        c.id === incident.corridorId
          ? { ...c, status: "CRITICAL", criticalSpotsCount: c.criticalSpotsCount + 1 }
          : c
      );

      addAuditLog(
        "⚡ Emergency Replan Executed",
        `INCIDENT-${Date.now().toString().slice(-4)}`,
        `Emergency plan activated for ${incident.incidentType} on ${incident.corridorId} (${incident.locationKm}). Severity: ${incident.severity}. Mobilized 5 departments.`
      );

      addNotification(
        `🚨 EMERGENCY REPLAN ACTIVATED: ${incident.incidentType}`,
        `Corridor ${incident.corridorId} at ${incident.locationKm}. Emergency block window allocated. 4 express trains rerouted.`,
        "CRITICAL",
        "ALL"
      );

      actionResult = result;
      break;
    }

    // 11. Create Custom Bundle (Supports both MaintenanceTasks & ServiceRequests)
    case "CREATE_BUNDLE": {
      const { taskIds, customTitle } = payload;
      
      // Extract from both maintenance tasks and service requests
      const candidateList: {
        id: string;
        title: string;
        departmentId: DepartmentId;
        estimatedDurationHours: number;
        estimatedCost: number;
        corridorId: string;
        locationKm: string;
        recommendedDate: string;
        isRequest: boolean;
      }[] = [
        ...state.maintenanceTasks.map((t) => ({
          id: t.id,
          title: t.title,
          departmentId: t.departmentId,
          estimatedDurationHours: t.estimatedDurationHours || 4,
          estimatedCost: t.estimatedCost || 150000,
          corridorId: t.corridorId || "NDLS-MMCT",
          locationKm: t.locationKm || "KM 148.0 - 156.0",
          recommendedDate: t.recommendedDate || "2026-08-30",
          isRequest: false,
        })),
        ...state.requests.map((r) => ({
          id: r.id,
          title: r.title,
          departmentId: (r.assignedToDepartment || r.requestingDepartment || "ENG") as DepartmentId,
          estimatedDurationHours: 4,
          estimatedCost: r.estimatedCost || 250000,
          corridorId: r.corridorId || "NDLS-MMCT",
          locationKm: r.locationKm || "KM 148.0 - 154.0",
          recommendedDate: r.requiredDate || r.completionDeadline || "2026-08-30",
          isRequest: true,
        })),
      ];

      const selectedItems = candidateList.filter((item) => taskIds.includes(item.id));
      const newId = `BND-${Math.floor(100 + Math.random() * 900)}`;

      const totalIndividualHours = selectedItems.reduce(
        (acc, t) => acc + t.estimatedDurationHours,
        0
      );
      const bundledHours = Number(
        (Math.max(...selectedItems.map((t) => t.estimatedDurationHours), 3) * 1.15).toFixed(1)
      );
      const timeSaved = Number((totalIndividualHours - bundledHours).toFixed(1));
      const timeReductionPct = totalIndividualHours > 0 ? Math.round((timeSaved / totalIndividualHours) * 100) : 35;
      const participatingDepts = Array.from(new Set(selectedItems.map((t) => t.departmentId)));
      const commonCorridor = selectedItems[0]?.corridorId || "NDLS-MMCT";
      const commonLocation = selectedItems[0]?.locationKm || "KM 148.0 - 156.0 (Mathura Section)";

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
        financialSavingsINR: Math.round(
          selectedItems.reduce((acc, t) => acc + t.estimatedCost, 0) * 0.22
        ),
        participatingDepartments: participatingDepts,
        status: "APPROVED",
        aiBundlingRationale: `AI Spatio-temporal clustering detected overlapping corridor sections (${commonLocation}). Combining ${selectedItems.length} activities from ${participatingDepts.join(
          ", "
        )} yields ${timeReductionPct}% reduction in total track closure.`,
      };

      state.bundles = [newBundle, ...state.bundles];

      // Update any included Service Requests to APPROVED / ASSIGNED
      state.requests = state.requests.map((r) => {
        if (taskIds.includes(r.id)) {
          return {
            ...r,
            status: "APPROVED" as RequestStatus,
            sanctionOrderNumber: `RB/MEGA-BLOCK/2026/${newId}`,
            centralAdminComments: `Sanctioned under Joint Mega Block ${newId} (Form T/806 Window).`,
            history: [
              ...r.history,
              {
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                actor: `${actor?.name || "Central Admin"} (Railway Board)`,
                action: `Included and sanctioned under Joint Mega Block Order ${newId}.`,
              },
            ],
          };
        }
        return r;
      });

      // Update any included Maintenance Tasks
      state.maintenanceTasks = state.maintenanceTasks.map((t) => {
        if (taskIds.includes(t.id)) {
          return {
            ...t,
            status: "SCHEDULED" as const,
          };
        }
        return t;
      });

      addAuditLog(
        "⚡ Joint Task Bundle Created",
        newId,
        `Bundled ${taskIds.length} activities (${taskIds.join(
          ", "
        )}) on ${commonCorridor} (${commonLocation}) into single ${bundledHours}h Mega Block. Saved ${timeSaved}h track closure.`
      );

      // Notify participating departments
      participatingDepts.forEach((dept) => {
        addNotification(
          `⚡ Joint Mega Block Sanctioned: ${newId}`,
          `Your department has been allocated joint block window on ${commonCorridor} (${commonLocation}) from 01:30 AM to 05:30 AM under Mega Block ${newId}.`,
          "SUCCESS",
          dept,
          "/central/bundling"
        );
      });

      // Global Notification
      addNotification(
        `AI Mega Block Created: ${newId}`,
        `Merged ${selectedItems.length} activities (${taskIds.join(
          " + "
        )}) on ${commonLocation}. Saves ${timeReductionPct}% track closure.`,
        "SUCCESS",
        "ALL",
        "/central/bundling"
      );

      actionResult = newBundle;
      break;
    }

    // 12. Approve Bundle
    case "APPROVE_BUNDLE": {
      const { bundleId } = payload;
      state.bundles = state.bundles.map((b) =>
        b.id === bundleId ? { ...b, status: "APPROVED" as const } : b
      );
      addAuditLog("Bundle Approved", bundleId, `Central Authority approved Mega Block window.`);
      addNotification(
        `Joint Mega Block ${bundleId} Approved`,
        `Operations and traction controllers alerted for joint window.`,
        "SUCCESS"
      );
      break;
    }

    // 13. Execute Bundle
    case "EXECUTE_BUNDLE": {
      const { bundleId } = payload;
      state.bundles = state.bundles.map((b) =>
        b.id === bundleId ? { ...b, status: "IN_EXECUTION" as const } : b
      );
      addAuditLog(
        "Bundle Execution Commenced",
        bundleId,
        `Joint mega block window is now active.`
      );
      addNotification(
        `Joint Mega Block ${bundleId} Active`,
        `Traction power isolated and crews mobilized on site.`,
        "INFO"
      );
      break;
    }

    // 14. Allocate Resource
    case "ALLOCATE_RESOURCE": {
      const { resourceId, departmentId, corridorId } = payload;
      state.resources = state.resources.map((res) =>
        res.id === resourceId
          ? {
              ...res,
              departmentId,
              assignedCorridor: corridorId || res.assignedCorridor,
              status: "ASSIGNED" as const,
            }
          : res
      );
      addAuditLog(
        "Resource Reallocated",
        resourceId,
        `Allocated resource to ${departmentId} on ${corridorId || "Active Corridor"}`
      );
      break;
    }

    // 15. Notification Reads
    case "MARK_NOTIF_READ": {
      const { notifId } = payload;
      state.notifications = state.notifications.map((n) =>
        n.id === notifId ? { ...n, read: true } : n
      );
      break;
    }

    case "MARK_ALL_NOTIFS_READ": {
      state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
      break;
    }

    default:
      console.warn("Unknown action type:", actionType);
      break;
  }

  saveState(state);
  return { success: true, state, result: actionResult };
}
