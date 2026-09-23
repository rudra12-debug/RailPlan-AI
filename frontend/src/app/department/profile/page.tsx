"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRailPlan } from "@/context/RailPlanContext";
import { 
  Building2, 
  Users, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Award, 
  CheckCircle2,
  Calendar
} from "lucide-react";

export default function DepartmentProfilePage() {
  const { user } = useAuth();
  const { departments } = useRailPlan();

  const currentDeptId = user?.departmentId || "ENG";
  const deptInfo = departments.find((d) => d.id === currentDeptId) || departments[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 border border-slate-800 shadow-xl flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg"
            style={{
              backgroundColor: `${deptInfo.color}25`,
              color: deptInfo.color,
              border: `2px solid ${deptInfo.color}60`,
            }}
          >
            {deptInfo.code}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-100">{deptInfo.name}</h2>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-700">
                Active Zone Directorate
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{user?.designation} • {user?.zone}</p>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.division}</p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-navy-900/90 p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
            Departmental Details & Officer Contact
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-slate-400">Chief Officer:</span>
              <span className="font-bold text-slate-200">{user?.name}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-slate-400">Official Email:</span>
              <span className="font-mono text-cyan-300">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-slate-400">Total Enrolled Personnel:</span>
              <span className="font-mono text-slate-200 font-bold">{deptInfo.userCount} Officers</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-slate-400">Security Clearance:</span>
              <span className="text-emerald-400 font-mono font-bold">Level-3 Central Command Clearance</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-navy-900/90 p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
            Safety Certification & Governance
          </h3>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-navy-950 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-200">RDSO Quality Certified</p>
                <p className="text-slate-400 text-[11px]">Compliant with Indian Railways General Rules & Subsidiary Rules (G&SR).</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-navy-950 border border-slate-800">
              <Award className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-200">ISO 9001:2015 Safety Standard</p>
                <p className="text-slate-400 text-[11px]">Standard operating procedure for 25kV traction and high-speed rail safety.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
