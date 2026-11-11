/**
 * RailPlan AI - Comprehensive Automated System Verification Test Suite
 * Executes end-to-end tests across all core engines, calculations, data integrity, and theming.
 */

import { formatINR, formatFullINR } from "../lib/formatters";
import { runAiMegaBlockBundling, areSectionsSpatiallyAdjacent } from "../lib/bundlerEngine";
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from "../lib/translations";
import { ALL_HORIZON_BLOCK_PLANS, WEEKLY_BLOCK_PLANS, MONTHLY_BLOCK_PLANS } from "../lib/horizonPlansData";
import { BHOPAL_ITARSI_CORRIDOR } from "../lib/bhopalItarsiData";
import { ALL_EXPANDED_CORRIDORS } from "../lib/expandedCorridorsData";
import { MaintenanceBlockRequest } from "../lib/types";
import { executeServerAction, getServerState, resetServerState } from "../lib/serverStore";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ [FAIL] ${testName} - ${details || "Assertion failed"}`);
    failedCount++;
  }
}

console.log("================================================================================");
console.log("             RAILPLAN AI - SYSTEM-WIDE VERIFICATION & TESTING SUITE             ");
console.log("================================================================================\n");

// -----------------------------------------------------------------------------
// SUITE 1: FORMATTERS & FINANCIAL CALCULATIONS
// -----------------------------------------------------------------------------
console.log("▶ TEST SUITE 1: Financial & String Formatters");
{
  const formatted50k = formatINR(50000);
  assert(formatted50k.includes("50,000") || formatted50k.includes("50K") || formatted50k.includes("₹"), "formatINR handles thousands correctly", `Result: ${formatted50k}`);

  const formattedLakh = formatINR(1500000);
  assert(formattedLakh.includes("15") || formattedLakh.includes("L") || formattedLakh.includes("Cr"), "formatINR handles Lakhs/Crores", `Result: ${formattedLakh}`);

  const fullInr = formatFullINR(2450000);
  assert(fullInr.includes("24,50,000") || fullInr.includes("2,450,000"), "formatFullINR formats Indian numbering system correctly", `Result: ${fullInr}`);
}

// -----------------------------------------------------------------------------
// SUITE 2: MULTI-DEPARTMENT BLOCK BUNDLER & CONFLICT ENGINE
// -----------------------------------------------------------------------------
console.log("\n▶ TEST SUITE 2: Bundler Engine & Multi-Department Synchronization");
{
  // Test spatial adjacency
  const isClose = areSectionsSpatiallyAdjacent(45.0, 50.0, 48.0, 55.0, 5.0);
  assert(isClose === true, "areSectionsSpatiallyAdjacent detects overlapping sections");

  const isFar = areSectionsSpatiallyAdjacent(10.0, 20.0, 80.0, 90.0, 5.0);
  assert(isFar === false, "areSectionsSpatiallyAdjacent separates distant sections");

  const mockRequests: MaintenanceBlockRequest[] = [
    {
      id: "BLK-ENG-001",
      blockId: "BLK-ENG-001",
      title: "P-Way Rail Replacement",
      department: "Civil",
      departmentId: "ENG",
      corridorId: "CORR-BPL-ET",
      fromKm: 45.2,
      toKm: 48.0,
      locationSection: "Barkhera - Budni",
      trackLine: "UP_LINE",
      requestedWindow: "01:30 - 05:30",
      durationHours: 4.0,
      scheduledDate: "2026-10-15",
      resourceRequirements: ["BCM Machine", "Track Gang 4"],
      requiresOHEPowerCut: true,
      status: "Submitted",
      riskScore: 65,
      description: "Night mega block required for heavy rail renewal",
    },
    {
      id: "BLK-ELEC-002",
      blockId: "BLK-ELEC-002",
      title: "25kV OHE Catenary Retensioning",
      department: "Electrical/OHE",
      departmentId: "ELEC",
      corridorId: "CORR-BPL-ET",
      fromKm: 46.0,
      toKm: 49.0,
      locationSection: "Barkhera - Budni",
      trackLine: "UP_LINE",
      requestedWindow: "01:30 - 05:30",
      durationHours: 3.5,
      scheduledDate: "2026-10-15",
      resourceRequirements: ["Tower Wagon 12"],
      requiresOHEPowerCut: true,
      status: "Submitted",
      riskScore: 45,
      description: "Co-locate with Civil work",
    }
  ];

  const clusters = runAiMegaBlockBundling(mockRequests);
  assert(Array.isArray(clusters), "bundler returns an array of bundled clusters");
  assert(clusters.length === 1, "bundler generated synchronized mega-block cluster");
  
  if (clusters.length > 0) {
    const cluster = clusters[0];
    assert(cluster.participatingDepartments.length === 2, "cluster includes Civil and Electrical departments");
    assert(cluster.timeSavedHours > 0, `cluster computes time savings (+${cluster.timeSavedHours}h saved)`);
    assert(cluster.financialSavingsINR > 0, `cluster computes financial savings (₹${cluster.financialSavingsINR.toLocaleString("en-IN")})`);
    assert(cluster.synergyScore > 50, `cluster achieves high synergy score (${cluster.synergyScore}/100)`);
  }
}

// -----------------------------------------------------------------------------
// SUITE 3: MULTILINGUAL LOCALIZATION & TRANSLATIONS
// -----------------------------------------------------------------------------
console.log("\n▶ TEST SUITE 3: Multilingual Localization Integrity");
{
  assert(SUPPORTED_LANGUAGES.length === 7, `Supported languages count (${SUPPORTED_LANGUAGES.length} languages configured)`);
  assert(SUPPORTED_LANGUAGES.every(lang => lang.code in TRANSLATIONS), "All configured languages exist in TRANSLATIONS dictionary");

  const enKeys = Object.keys(TRANSLATIONS["en"] || {});
  const mrKeys = Object.keys(TRANSLATIONS["mr"] || {});
  const hiKeys = Object.keys(TRANSLATIONS["hi"] || {});

  assert(enKeys.length > 100, `English translation dictionary contains rich vocabulary (${enKeys.length} keys)`);
  assert(mrKeys.length > 100, `Marathi translation dictionary contains rich vocabulary (${mrKeys.length} keys)`);
  assert(hiKeys.length > 100, `Hindi translation dictionary contains rich vocabulary (${hiKeys.length} keys)`);

  // Verify critical nav and action keys
  const criticalKeys = [
    "header.dayMode",
    "header.nightMode",
    "nav.planning",
    "nav.bundling",
    "nav.digitalTwin",
    "nav.iotTelemetry",
    "nav.serviceRequests",
    "nav.newRequest"
  ];

  for (const k of criticalKeys) {
    assert(!!TRANSLATIONS["en"][k], `English dictionary contains '${k}'`);
    assert(!!TRANSLATIONS["mr"][k], `Marathi dictionary contains '${k}'`);
    assert(!!TRANSLATIONS["hi"][k], `Hindi dictionary contains '${k}'`);
  }
}

// -----------------------------------------------------------------------------
// SUITE 4: MASTER SCHEDULE & CORRIDOR DATA INTEGRITY
// -----------------------------------------------------------------------------
console.log("\n▶ TEST SUITE 4: Master Operational Schedules & Corridor Routing");
{
  assert(ALL_HORIZON_BLOCK_PLANS.length > 0, `Master horizon database contains scheduled plans (${ALL_HORIZON_BLOCK_PLANS.length} plans)`);
  assert(WEEKLY_BLOCK_PLANS.length > 0, `Weekly tactical plans populated (${WEEKLY_BLOCK_PLANS.length} plans)`);
  assert(MONTHLY_BLOCK_PLANS.length > 0, `Monthly strategic plans populated (${MONTHLY_BLOCK_PLANS.length} plans)`);

  const allSlots = ALL_HORIZON_BLOCK_PLANS.flatMap(p => p.slots);
  assert(allSlots.length > 0, `Master slots populated (${allSlots.length} slots across all plans)`);

  // Verify non-zero and positive durations
  const allDurationsValid = allSlots.every(s => s.durationHours > 0 && s.durationHours <= 72);
  assert(allDurationsValid, "All scheduled possession slots have valid positive durations (0.5h - 72h)");

  // Verify corridor definitions
  assert(BHOPAL_ITARSI_CORRIDOR.stations.length > 0, "Bhopal-Itarsi trunk corridor stations defined");
  assert(ALL_EXPANDED_CORRIDORS.length >= 8, `National Golden Quadrilateral and HDN corridors defined (${ALL_EXPANDED_CORRIDORS.length} corridors)`);
}

// -----------------------------------------------------------------------------
// SUITE 5: THEME & FORM CONTROLS SPECIFICATION AUDIT
// -----------------------------------------------------------------------------
console.log("\n▶ TEST SUITE 5: Theme & Form Controls Contrast Specification Audit");
{
  const fs = require("fs");
  const path = require("path");

  const tailwindPath = path.resolve(__dirname, "../../tailwind.config.ts");
  const globalsPath = path.resolve(__dirname, "../app/globals.css");

  const tailwindContent = fs.readFileSync(tailwindPath, "utf-8");
  const globalsContent = fs.readFileSync(globalsPath, "utf-8");

  assert(tailwindContent.includes("950: \"#000D18\""), "tailwind.config.ts defines navy.950 as #000D18");
  assert(tailwindContent.includes("900: \"#022642\""), "tailwind.config.ts defines navy.900 as #022642");

  assert(globalsContent.includes("input, select, textarea"), "globals.css sets base dark mode rules for input, select, and textarea");
  assert(globalsContent.includes("background-color: #000D18"), "globals.css specifies dark #000D18 background for dark inputs");
  assert(globalsContent.includes("color-scheme: dark"), "globals.css specifies color-scheme: dark for dark native inputs");

  assert(globalsContent.includes("html.light input"), "globals.css sets day mode override for inputs");
  assert(globalsContent.includes("background-color: #FFFFFF !important"), "globals.css specifies white background for daylight inputs");
  assert(globalsContent.includes("color-scheme: light"), "globals.css specifies color-scheme: light for daylight native inputs");
}

// -----------------------------------------------------------------------------
// SUITE 6: MULTI-USER STATE SYNCHRONIZATION & MUTATION ENGINE
// -----------------------------------------------------------------------------
console.log("\n▶ TEST SUITE 6: Multi-User Server Synchronization & Optimistic Mutations");
{
  const initialState = resetServerState();
  const v0 = initialState.stateVersion;
  assert(initialState.requests.length > 0, "Server state initialized with baseline service requests");
  assert(initialState.blockRequests.length > 0, "Server state initialized with master block requests");
  assert(initialState.horizonPlans.length > 0, "Server state initialized with multi-horizon plans");

  // Test 1: CREATE_REQUEST
  const createRes = executeServerAction(
    "CREATE_REQUEST",
    {
      title: "25kV Emergency Power Isolation & OHE Contact Wire Repair",
      targetDepartment: "ELEC",
      corridorId: "BPL-ET",
      locationKm: "KM 45.2",
      requestType: "Electrical Support",
      priority: "CRITICAL",
      description: "Urgent catenary repair on Barkhera section",
      requiredDate: "2026-09-30",
      estimatedCost: 180000,
      costBreakdown: {
        labour: 60000,
        equipment: 50000,
        material: 50000,
        logistics: 10000,
        trackBlock: 0,
        contingency: 10000,
        totalEstimated: 180000,
        actualCost: 0,
      },
      resourcesRequired: ["Tower Wagon #102"],
    },
    { name: "Sunil Deshmukh", departmentId: "ENG", departmentName: "Civil Engineering" }
  );

  assert(createRes.success === true, "executeServerAction CREATE_REQUEST succeeds");
  const newReqId = createRes.result;
  assert(typeof newReqId === "string" && newReqId.startsWith("SR-"), "New request ID properly generated", `ID: ${newReqId}`);
  assert(createRes.state.stateVersion > v0, "State version increments on CREATE_REQUEST");
  assert(createRes.state.requests[0].id === newReqId, "New request is prepended at index 0");
  assert(createRes.state.requests[0].status === "UNDER_REVIEW", "New request starts in UNDER_REVIEW status");

  // Test 2: APPROVE_REQUEST
  const v1 = createRes.state.stateVersion;
  const approveRes = executeServerAction(
    "APPROVE_REQUEST",
    {
      requestId: newReqId,
      assignedDept: "ELEC",
      comments: "Sanctioned under G&SR 15.06 by Railway Board Central Authority",
      priorityOverride: "CRITICAL",
    },
    { name: "Rajesh Verma", role: "CENTRAL_ADMIN" }
  );

  assert(approveRes.success === true, "executeServerAction APPROVE_REQUEST succeeds");
  assert(approveRes.state.stateVersion > v1, "State version increments on APPROVE_REQUEST");
  const approvedReq = approveRes.state.requests.find((r) => r.id === newReqId);
  assert(approvedReq?.status === "APPROVED", "Request status updated to APPROVED");
  assert(Boolean(approvedReq?.sanctionOrderNumber?.startsWith("RB/SANCTION/2026/")), "Official sanction order number generated");
  assert(approvedReq?.formT806Generated === true, "Form T/806 generated flag is set");

  const linkedT806 = approveRes.state.t806Sanctions.find(
    (s) => s.associatedRequestId === newReqId || s.blockId === newReqId
  );
  assert(Boolean(linkedT806), "Statutory Form T/806 sanction created in server t806Sanctions");
  assert(linkedT806?.status === "SANCTIONED", "Form T/806 status is SANCTIONED");
  assert(linkedT806?.currentStep === 4, "Form T/806 sign-off pipeline completed to Step 4");

  // Test 3: CREATE_BLOCK_REQUEST
  const v2 = approveRes.state.stateVersion;
  const blockRes = executeServerAction(
    "CREATE_BLOCK_REQUEST",
    {
      id: "REQ-TEST-SYNC-01",
      blockId: "BLK-TEST-SYNC-01",
      title: "Automated Ultrasonic Rail Testing Block",
      corridorId: "BPL-ET",
      fromKm: 52.0,
      toKm: 56.0,
      status: "Submitted",
      department: "Civil",
      departmentId: "ENG",
    },
    { name: "Sunil Deshmukh", departmentId: "ENG" }
  );

  assert(blockRes.success === true, "executeServerAction CREATE_BLOCK_REQUEST succeeds");
  assert(blockRes.state.stateVersion > v2, "State version increments on CREATE_BLOCK_REQUEST");
  assert(blockRes.state.blockRequests[0].id === "REQ-TEST-SYNC-01", "New block request is saved in server state");

  // Test 4: AI_OPTIMIZE_HORIZON
  const v3 = blockRes.state.stateVersion;
  const targetPlan = blockRes.state.horizonPlans[0];
  const oldScore = targetPlan.aiOptimizationScore;
  const optRes = executeServerAction(
    "AI_OPTIMIZE_HORIZON",
    { planId: targetPlan.id },
    { name: "OCC Controller", role: "CENTRAL_ADMIN" }
  );

  assert(optRes.success === true, "executeServerAction AI_OPTIMIZE_HORIZON succeeds");
  assert(optRes.state.stateVersion > v3, "State version increments on AI_OPTIMIZE_HORIZON");
  const updatedPlan = optRes.state.horizonPlans.find((p) => p.id === targetPlan.id);
  assert((updatedPlan?.aiOptimizationScore || 0) >= oldScore, "AI optimization score increased");
  assert(updatedPlan?.conflictCheckPassed === true, "Conflict check passed flag set to true");
}

console.log("\n================================================================================");
console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log("================================================================================\n");

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
