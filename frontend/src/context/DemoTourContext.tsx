"use client";

import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";

export interface DemoStep {
  stepNumber: number;
  title: string;
  role: string;
  roleEmail: string;
  route: string;
  description: string;
  whatItDoes: string;
  howToDoIt: string[];
  actionPrompt: string;
  targetElementSelector?: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    title: "1. Engineering Department Login & Persona Selection",
    role: "Engineering Department",
    roleEmail: "engineering@railplan.ai",
    route: "/department/dashboard",
    description: "Vikram Singh (Chief Track Infrastructure Engineer) logs into RailPlan AI to inspect track health, asset maintenance schedules, and rail integrity telemetry.",
    whatItDoes: "Switches your active operational persona to the Civil Engineering (Permanent Way / P-Way) Directorate, restricting or tailoring actions to track maintenance, ballast tampers, and rail renewals.",
    howToDoIt: [
      "Click the 'Role' pill in the top header or in the Quick Role Switcher dropdown.",
      "Select 'Vikram Singh (Civil Infrastructure Engineering)'.",
      "Notice your access scope is now focused on Civil Department operations and budget.",
    ],
    actionPrompt: "Verify the active persona is Civil Engineering, then click 'Next Step' or 'Go to View'.",
  },
  {
    stepNumber: 2,
    title: "2. Engineering Department Dashboard & Telemetry",
    role: "Engineering Department",
    roleEmail: "engineering@railplan.ai",
    route: "/department/dashboard",
    description: "The dashboard displays 12 Active Tasks, 3 Pending Requests, ₹12.5L Budget Used, and 2 High-Risk track safety alerts.",
    whatItDoes: "Aggregates real-time department health indicators: active work orders, budget expenditure percentage, workforce deployment roster, and AI predictive maintenance alerts.",
    howToDoIt: [
      "Review the glowing KPI tiles (Active Tasks, Pending Requests, In Progress, Budget Used).",
      "Inspect the 'Corridor View' filter strip to filter metrics by specific national corridors (e.g. BPL-ET or NDLS-MMCT).",
      "Check the AI Recommendation card highlighting urgent track-bed degradation risks.",
    ],
    actionPrompt: "Inspect the department KPI metrics, then proceed to review scheduled tasks.",
  },
  {
    stepNumber: 3,
    title: "3. Identify Track & OHE Cross-Department Dependency",
    role: "Engineering Department",
    roleEmail: "engineering@railplan.ai",
    route: "/department/tasks",
    description: "Track relay scheduled at KM 148-154 requires urgent 25kV OHE traction power isolation and catenary readjustment from Electrical Department.",
    whatItDoes: "Identifies inter-departmental safety dependencies where one department's physical track possession requires power de-energization or signal disconnection from another department.",
    howToDoIt: [
      "Navigate to Scheduled Tasks (/department/tasks).",
      "Locate Task 'MT-101: Track Relay & Ballast Cleaning (KM 148-154)'.",
      "Notice the safety warning badge: 'Requires 25kV OHE Power Block from Electrical Department'.",
      "Click 'Request Support' or proceed to the Service Request wizard.",
    ],
    actionPrompt: "Click 'Next Step' to open the inter-departmental service request creation wizard.",
  },
  {
    stepNumber: 4,
    title: "4. Create Inter-Departmental Service Request Form",
    role: "Engineering Department",
    roleEmail: "engineering@railplan.ai",
    route: "/department/create-request",
    description: "Engineering selects 'Electrical Department' as target, Corridor NDLS-MMCT (KM 148-154), 'Electrical Support', Priority 'HIGH', Cost: ₹4,02,000.",
    whatItDoes: "Generates an official requisition specifying the required track possession window, target corridor, kilometer chainage, heavy machinery, safety precautions, and estimated cost breakdown.",
    howToDoIt: [
      "Select Target Directorate: 'Electrical Department (TRD)'.",
      "Choose Corridor: 'NDLS-MMCT' and specify KM range: '148.0 - 154.0'.",
      "Set Priority: 'HIGH' and Estimated Block Duration: '4 Hours'.",
      "Attach required heavy machinery (Tower Wagon TW-08) and click 'Submit Service Request'.",
    ],
    actionPrompt: "Submit the pre-filled service request form to transmit it to Central Control OCC.",
  },
  {
    stepNumber: 5,
    title: "5. Service Request Submitted & Tracked (SR-1042)",
    role: "Engineering Department",
    roleEmail: "engineering@railplan.ai",
    route: "/department/requests",
    description: "Request SR-1042 is generated with attached documents, 6-part cost breakdown, and status UNDER_REVIEW.",
    whatItDoes: "Places the requisition into the official Indian Railways 9-stage review pipeline under state 'UNDER_REVIEW', timestamped and immutable.",
    howToDoIt: [
      "Go to Service Requests (/department/requests).",
      "Locate the newly generated requisition 'SR-1042'.",
      "View the interactive 9-stage lifecycle tracker showing Stage 2 (Submitted) advancing to Stage 3 (Under Review).",
    ],
    actionPrompt: "Observe the active status badge, then click Next to see Central Admin receive the alert.",
  },
  {
    stepNumber: 6,
    title: "6. Central Authority Receives Live OCC Alert",
    role: "Central Admin",
    roleEmail: "admin@railplan.ai",
    route: "/central",
    description: "Central Authority (Rajesh Verma) receives a high-priority notification regarding SR-1042 on the Delhi-Mumbai Trunk route.",
    whatItDoes: "Alerts the National Operations Command Center (OCC) in real-time across connected devices that an inter-departmental corridor block has been requested.",
    howToDoIt: [
      "Notice the top persona switches to 'Central Admin (Rajesh Verma)'.",
      "Click the red notification bell icon in the top header.",
      "See the high-priority alert: 'SR-1042: Urgent Track & 25kV OHE Block Request on NDLS-MMCT'.",
      "Click the alert to jump directly to the Central Approval Center.",
    ],
    actionPrompt: "Open the Central Approval Center to evaluate the corridor block impact.",
  },
  {
    stepNumber: 7,
    title: "7. Central Approval & Sanctions Center",
    role: "Central Admin",
    roleEmail: "admin@railplan.ai",
    route: "/central/approvals",
    description: "Central Admin opens the Approval Center showing all incoming inter-departmental requests across Indian Railways.",
    whatItDoes: "Centralizes governance across all 10 national trunk corridors, allowing Section Controllers to assess risk scores, train timetable clashes, and financial viability before granting line blocks.",
    howToDoIt: [
      "Filter the request table by corridor or click the 'Pending Approvals' tab.",
      "Click on row 'SR-1042' in the table to slide open the comprehensive Review Drawer.",
      "Review requesting department (Engineering) and requested department (Electrical).",
    ],
    actionPrompt: "Click on request 'SR-1042' to open the AI Risk & Cost Evaluation drawer.",
  },
  {
    stepNumber: 8,
    title: "8. AI Risk, Conflict & Cost Assessment",
    role: "Central Admin",
    roleEmail: "admin@railplan.ai",
    route: "/central/approvals",
    description: "AI provides: Risk Score: 87% | Estimated Cost: ₹4,02,000 | Recommended Priority: HIGH | Rationale: Catenary height mismatch prevention.",
    whatItDoes: "The AI Risk Engine checks train timetable conflicts, calculates delay propagation risk (87%), compares historical cost variances, and validates safety protocols.",
    howToDoIt: [
      "In the review drawer, inspect the glowing AI Risk Score badge (87% High Risk).",
      "Review the AI Rationale explaining potential train derailment risk if catenary is not aligned.",
      "Check the 6-part cost breakdown (Tower wagon fuel, labour, safety gear, contingency).",
    ],
    actionPrompt: "Examine the AI assessment, then prepare to authorize the work order.",
  },
  {
    stepNumber: 9,
    title: "9. Central Admin Sanctions Request (Form T/806 Authority)",
    role: "Central Admin",
    roleEmail: "admin@railplan.ai",
    route: "/central/approvals",
    description: "Central Admin adds comment: 'Approved. Allocate electrical maintenance team within 48 hours.' and clicks Approve.",
    whatItDoes: "Formally approves the inter-departmental block under Indian Railways G&SR authority, digitally signing the order and transitioning status to 'APPROVED / ASSIGNED'.",
    howToDoIt: [
      "In the drawer footer, enter Controller remark: 'Approved for 4-hour night block window'.",
      "Click the prominent green 'Approve & Assign' button.",
      "The system generates digital SHA-256 signature and advances workflow to Stage 5 (Assigned).",
    ],
    actionPrompt: "Click 'Approve & Assign' button to authorize the line possession order.",
  },
  {
    stepNumber: 10,
    title: "10. Work Order Assigned to Electrical Directorate",
    role: "Central Admin",
    roleEmail: "admin@railplan.ai",
    route: "/central/approvals",
    description: "Status updates to 'ASSIGNED' (to Electrical Department). Audit trail automatically logs the central sanction.",
    whatItDoes: "Dispatches the sanctioned work order to the target department's field execution queue with assigned machinery and safety clearances.",
    howToDoIt: [
      "Notice the status badge changes to 'ASSIGNED' with green border.",
      "Audit trail records Section Controller timestamp and unique dispatch authorization memo.",
      "Click 'Next Step' to switch to Chief Electrical Engineer persona.",
    ],
    actionPrompt: "Switch to Electrical Department persona to execute the assigned block.",
  },
  {
    stepNumber: 11,
    title: "11. Electrical Directorate Execution Workspace",
    role: "Electrical Department",
    roleEmail: "electrical@railplan.ai",
    route: "/department/execution",
    description: "K. Ramanathan (Chief Electrical Engineer) views the incoming assigned work order SR-1042 for OHE power block.",
    whatItDoes: "Gives field maintenance crews full visibility into the authorized block boundaries, assigned tower wagon, safety earthing discharges, and milestone progress logging.",
    howToDoIt: [
      "The tour automatically switches user to 'K. Ramanathan (Electrical TRD)'.",
      "Navigate to Work Execution (/department/execution).",
      "Locate active order 'SR-1042: 25kV OHE Catenary Power Isolation'.",
      "Review the safety checklist: Traction Power Disconnected, Discharge Rods Placed.",
    ],
    actionPrompt: "Open the Work Execution panel to start reporting milestone progress.",
  },
  {
    stepNumber: 12,
    title: "12. Live Field Progress Updates (25% ➔ 50% ➔ 75% ➔ 100%)",
    role: "Electrical Department",
    roleEmail: "electrical@railplan.ai",
    route: "/department/execution",
    description: "Electrical crew mobilizes Tower Wagon TW-08, isolates 25kV power, and adjusts catenary droppers across KM 148-154.",
    whatItDoes: "Transmits real-time milestone telemetry from the track-side gang to the Central OCC dashboard, updating time remaining and completion percentages.",
    howToDoIt: [
      "Click the '25%' button: Mobilization & Power Isolation completed.",
      "Click the '50%' button: Catenary Dropper replacement at KM 151 in progress.",
      "Click the '75%' button: Tensioning verified by Tower Wagon crew.",
      "Click the '100%' button: Power restored and track inspected.",
    ],
    actionPrompt: "Click the 25%, 50%, 75%, and 100% progress buttons to log milestones.",
  },
  {
    stepNumber: 13,
    title: "13. Work Marked Completed & Fitness Certified",
    role: "Electrical Department",
    roleEmail: "electrical@railplan.ai",
    route: "/department/execution",
    description: "Electrical Department uploads inspection report, certifies 25kV clearances, and marks work 100% COMPLETED.",
    whatItDoes: "Field crew certifies that the track and overhead wires are safe for commercial traffic, uploading proof photos and submitting the completion memo for Central OCC verification.",
    howToDoIt: [
      "Upload or attach field inspection certificate memo.",
      "Click 'Submit Completion & Request Closure'.",
      "Status updates to 'COMPLETED', awaiting Central Authority sign-off.",
    ],
    actionPrompt: "Notice status update to 'COMPLETED', awaiting Central sign-off.",
  },
  {
    stepNumber: 14,
    title: "14. Central Authority Field Verification",
    role: "Central Admin",
    roleEmail: "admin@railplan.ai",
    route: "/central/approvals",
    description: "Central Admin inspects the submitted completion photos, certificates, and actual cost variance.",
    whatItDoes: "Final quality assurance check by the National OCC. Inspects actual track clearance time, verifies that caution orders (TSR) are cancelled, and checks financial ledger variance.",
    howToDoIt: [
      "As Central Admin, open Central Approvals (/central/approvals).",
      "Click 'Completed' tab and open 'SR-1042'.",
      "Inspect submitted electrical clearance certificates and zero-defect report.",
      "Click the green 'Verify & Close Request' button.",
    ],
    actionPrompt: "Click 'Verify & Close Request' to grant final operational clearance.",
  },
  {
    stepNumber: 15,
    title: "15. Requisition Status: CLOSED (Gazette Audit Logged)",
    role: "Central Admin",
    roleEmail: "admin@railplan.ai",
    route: "/central/approvals",
    description: "Request SR-1042 is officially CLOSED with full immutable audit history.",
    whatItDoes: "Permanently seals the work order into the Indian Railways Gazette Audit Log with complete cryptographic tamper-proof records for ministry reviews.",
    howToDoIt: [
      "Observe the completed 9-stage green timeline.",
      "Review the permanent dispatch record (Dispatched, Approved, Executed, Verified, Closed).",
      "Notice that the track section at KM 148-154 is now marked 'NORMAL / CLEAR' on the live map.",
    ],
    actionPrompt: "View the completed 9-stage green timeline and archived record.",
  },
  {
    stepNumber: 16,
    title: "16. Corridor Dashboards & Financial Budgets Live Updated",
    role: "Central Admin",
    roleEmail: "admin@railplan.ai",
    route: "/central/costs",
    description: "Cost variance, department performance scores, and railway corridor health indices are updated instantly.",
    whatItDoes: "All KPI widgets, budget burn rates, train punctuality indices, and corridor telemetry instantly reflect the completed maintenance without page refresh.",
    howToDoIt: [
      "Visit Budget & Grants (/central/costs) to see updated expenditure.",
      "Visit National OCC (/central) to inspect healthy corridor operational ratings.",
      "Congratulations! You have mastered the entire RailPlan AI operational lifecycle.",
    ],
    actionPrompt: "Congratulations! You have completed the full 16-Step RailPlan AI operations tour.",
  },
];

interface DemoTourContextType {
  isOpen: boolean;
  currentStepIndex: number;
  currentStep: DemoStep;
  totalSteps: number;
  openTour: () => void;
  closeTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
}

const DemoTourContext = createContext<DemoTourContextType | undefined>(undefined);

export const DemoTourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { switchUser } = useAuth();

  const currentStep = DEMO_STEPS[currentStepIndex];

  const goToStep = (index: number) => {
    if (index >= 0 && index < DEMO_STEPS.length) {
      setCurrentStepIndex(index);
      const step = DEMO_STEPS[index];
      // Automatically switch user persona to match demo step
      switchUser(step.roleEmail);
    }
  };

  const nextStep = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      goToStep(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  };

  const openTour = () => {
    setIsOpen(true);
    goToStep(0);
  };

  const closeTour = () => {
    setIsOpen(false);
  };

  return (
    <DemoTourContext.Provider
      value={{
        isOpen,
        currentStepIndex,
        currentStep,
        totalSteps: DEMO_STEPS.length,
        openTour,
        closeTour,
        nextStep,
        prevStep,
        goToStep,
      }}
    >
      {children}
    </DemoTourContext.Provider>
  );
};

export const useDemoTour = () => {
  const context = useContext(DemoTourContext);
  if (!context) {
    throw new Error("useDemoTour must be used within DemoTourProvider");
  }
  return context;
};
