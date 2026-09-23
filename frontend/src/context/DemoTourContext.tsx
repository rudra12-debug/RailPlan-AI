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
  actionPrompt: string;
  targetElementSelector?: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    title: "1. Engineering Department Login",
    role: "Engineering Department",
    roleEmail: "engineering@railplan.ai",
    route: "/department/dashboard",
    description: "Vikram Singh (Chief Track Infrastructure Engineer) logs into RailPlan AI to review track health and infrastructure.",
    actionPrompt: "Notice the role switcher or click Next to view Engineering KPI metrics.",
  },
  {
    stepNumber: 2,
    title: "2. Engineering Department Dashboard",
    role: "Engineering Department",
    roleEmail: "engineering@railplan.ai",
    route: "/department/dashboard",
    description: "Dashboard displays 12 Active Tasks, 3 Pending Requests, ₹12.5L Budget Used, 2 High-Risk Maintenance Activities.",
    actionPrompt: "Inspect the glowing KPI metrics, department budget utilization, and AI recommendations.",
  },
  {
    stepNumber: 3,
    title: "3. Identify Track & OHE Dependency",
    role: "Engineering Department",
    roleEmail: "engineering@railplan.ai",
    route: "/department/tasks",
    description: "Track relay scheduled at KM 148-154 requires urgent 25kV OHE power isolation and catenary readjustment from Electrical Department.",
    actionPrompt: "Click on 'Create Request' or proceed to the Service Request wizard.",
  },
  {
    stepNumber: 4,
    title: "4. Create Service Request Form",
    role: "Engineering Department",
    roleEmail: "engineering@railplan.ai",
    route: "/department/create-request",
    description: "Engineering selects 'Electrical Department' as target, Corridor NDLS-MMCT (KM 148-154), 'Electrical Support', Priority 'HIGH', Cost: ₹4,02,000.",
    actionPrompt: "Review pre-filled data and click 'Submit Service Request'.",
  },
  {
    stepNumber: 5,
    title: "5. Service Request Submitted (SR-1042)",
    role: "Engineering Department",
    roleEmail: "engineering@railplan.ai",
    route: "/department/requests",
    description: "Request SR-1042 is generated with attached documents, 6-part cost breakdown, and status UNDER_REVIEW.",
    actionPrompt: "See the interactive 9-stage workflow timeline for SR-1042.",
  },
  {
    stepNumber: 6,
    title: "6. Central Admin Receives Live Notification",
    role: "Central Admin",
    roleEmail: "admin@railplan.ai",
    route: "/central",
    description: "Central Authority (Rajesh Verma) receives a high-priority notification regarding SR-1042 on the Delhi-Mumbai Trunk route.",
    actionPrompt: "Check the top-right notification bell icon or proceed to the Approval Center.",
  },
  {
    stepNumber: 7,
    title: "7. Central Approval Center",
    role: "Central Admin",
    roleEmail: "admin@railplan.ai",
    route: "/central/approvals",
    description: "Central Admin opens the Approval Center showing all incoming inter-departmental requests across Indian Railways.",
    actionPrompt: "Click on request 'SR-1042' in the table to open the detailed review drawer.",
  },
  {
    stepNumber: 8,
    title: "8. AI Risk & Cost Assessment",
    role: "Central Admin",
    roleEmail: "admin@railplan.ai",
    route: "/central/approvals",
    description: "AI provides: Risk Score: 87% | Estimated Cost: ₹4,02,000 | Recommended Priority: HIGH | Rationale: Catenary height mismatch prevention.",
    actionPrompt: "Review the AI recommendation breakdown and similar historical requests.",
  },
  {
    stepNumber: 9,
    title: "9. Central Admin Approves Request",
    role: "Central Admin",
    roleEmail: "admin@railplan.ai",
    route: "/central/approvals",
    description: "Central Admin adds comment: 'Approved. Allocate electrical maintenance team within 48 hours.' and clicks Approve.",
    actionPrompt: "Click 'Approve & Assign' button to authorize the work order.",
  },
  {
    stepNumber: 10,
    title: "10. Assigned to Electrical Department",
    role: "Central Admin",
    roleEmail: "admin@railplan.ai",
    route: "/central/approvals",
    description: "Status updates to 'ASSIGNED' (to Electrical Department). Audit trail automatically logs the central sanction.",
    actionPrompt: "Switch to Electrical Department persona to see the assignment.",
  },
  {
    stepNumber: 11,
    title: "11. Electrical Department Workspace",
    role: "Electrical Department",
    roleEmail: "electrical@railplan.ai",
    route: "/department/execution",
    description: "K. Ramanathan (Chief Electrical Engineer) views the incoming assigned work order SR-1042 for OHE power block.",
    actionPrompt: "Open the Work Execution panel to start reporting milestone progress.",
  },
  {
    stepNumber: 12,
    title: "12. Progress Updates (25% ➔ 50% ➔ 75% ➔ 100%)",
    role: "Electrical Department",
    roleEmail: "electrical@railplan.ai",
    route: "/department/execution",
    description: "Electrical crew mobilizes Tower Wagon TW-08, isolates 25kV power, and adjusts catenary droppers across KM 148-154.",
    actionPrompt: "Click the 25%, 50%, 75%, and 100% progress buttons to log work milestones.",
  },
  {
    stepNumber: 13,
    title: "13. Work Marked Completed",
    role: "Electrical Department",
    roleEmail: "electrical@railplan.ai",
    route: "/department/execution",
    description: "Electrical Department uploads inspection report, certifies 25kV clearances, and marks work 100% COMPLETED.",
    actionPrompt: "Notice the status updates to 'COMPLETED' awaiting central sign-off.",
  },
  {
    stepNumber: 14,
    title: "14. Central Admin Verification",
    role: "Central Admin",
    roleEmail: "admin@railplan.ai",
    route: "/central/approvals",
    description: "Central Admin inspects the submitted completion photos, certificates, and actual cost variance.",
    actionPrompt: "Click 'Verify & Close Request' to grant the final operational clearance.",
  },
  {
    stepNumber: 15,
    title: "15. Request Status: CLOSED",
    role: "Central Admin",
    roleEmail: "admin@railplan.ai",
    route: "/central/approvals",
    description: "Request SR-1042 is officially CLOSED with full immutable audit history.",
    actionPrompt: "View the completed 9-stage green timeline.",
  },
  {
    stepNumber: 16,
    title: "16. Dashboards & Budgets Live Updated!",
    role: "Central Admin",
    roleEmail: "admin@railplan.ai",
    route: "/central/costs",
    description: "Cost variance, department performance scores, and railway corridor health indices are updated instantly.",
    actionPrompt: "Congratulations! You have completed the full 16-Step RailPlan AI lifecycle tour.",
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
