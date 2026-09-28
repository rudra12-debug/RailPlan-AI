"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRailPlan } from "@/context/RailPlanContext";
import {
  Users,
  ShieldCheck,
  Clock,
  Calendar,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Phone,
  MapPin,
  PlusCircle,
  Search,
  Filter,
  ArrowUpRight,
  HardHat,
  UserCheck
} from "lucide-react";

interface GangMember {
  id: string;
  name: string;
  role: string;
  departmentId: string;
  gangUnit: string;
  shift: "DAY" | "NIGHT_BLOCK" | "EVENING";
  status: "ON_DUTY" | "STANDBY" | "ON_LEAVE" | "DISPATCHED";
  medicalFitness: "A-1" | "A-2" | "B-1";
  contactNumber: string;
  currentAssignment: string;
  safetyCertValidUntil: string;
}

const MOCK_GANG_ROSTER: GangMember[] = [
  // Civil / P-Way Gangs
  {
    id: "EMP-ENG-101",
    name: "Rajesh Kumar Meena",
    role: "Senior Permanent Way Supervisor (PWI)",
    departmentId: "ENG",
    gangUnit: "Track Maintenance Gang #4 (Bhopal)",
    shift: "NIGHT_BLOCK",
    status: "DISPATCHED",
    medicalFitness: "A-1",
    contactNumber: "+91 98260 11422",
    currentAssignment: "BPL-ET KM 56.4 Vindhyachal Ghat Emergency Curve Tamping",
    safetyCertValidUntil: "2027-03-31",
  },
  {
    id: "EMP-ENG-102",
    name: "Dharmendra Singh Yadav",
    role: "Keyman / Track Patroller",
    departmentId: "ENG",
    gangUnit: "Track Maintenance Gang #4 (Bhopal)",
    shift: "DAY",
    status: "ON_DUTY",
    medicalFitness: "A-1",
    contactNumber: "+91 94251 88301",
    currentAssignment: "Foot Inspection Bhopal Outer to Mandideep (KM 0 - 24)",
    safetyCertValidUntil: "2026-12-15",
  },
  {
    id: "EMP-ENG-103",
    name: "Mukesh Chouhan",
    role: "Flash Butt Welding Operator",
    departmentId: "ENG",
    gangUnit: "Mobile Rail Welding Gang #2",
    shift: "NIGHT_BLOCK",
    status: "STANDBY",
    medicalFitness: "A-1",
    contactNumber: "+91 97555 42109",
    currentAssignment: "Standby for 60kg Rail Thermit Joint Welding",
    safetyCertValidUntil: "2027-01-20",
  },
  {
    id: "EMP-ENG-104",
    name: "Santosh Verma",
    role: "Ballast Regulator Operator",
    departmentId: "ENG",
    gangUnit: "Heavy Mechanized Gang #1",
    shift: "NIGHT_BLOCK",
    status: "ON_DUTY",
    medicalFitness: "A-1",
    contactNumber: "+91 98270 33491",
    currentAssignment: "Track Tamping Block Barkhera Yard",
    safetyCertValidUntil: "2026-11-30",
  },

  // Electrical / OHE Linemen
  {
    id: "EMP-ELEC-201",
    name: "Suresh Chandra Tiwari",
    role: "Chief Traction Foreman (OHE)",
    departmentId: "ELEC",
    gangUnit: "25kV Traction Tower Wagon Unit #2",
    shift: "NIGHT_BLOCK",
    status: "DISPATCHED",
    medicalFitness: "A-1",
    contactNumber: "+91 94244 55902",
    currentAssignment: "OHE Power Block KM 114.2 Contact Wire Tensioning",
    safetyCertValidUntil: "2027-04-15",
  },
  {
    id: "EMP-ELEC-202",
    name: "Arun Kulkarni",
    role: "Senior OHE Lineman",
    departmentId: "ELEC",
    gangUnit: "25kV Traction Tower Wagon Unit #2",
    shift: "NIGHT_BLOCK",
    status: "DISPATCHED",
    medicalFitness: "A-1",
    contactNumber: "+91 98263 77412",
    currentAssignment: "Cantilever Insulator Washing & Drop Wire Adjustment",
    safetyCertValidUntil: "2026-10-31",
  },
  {
    id: "EMP-ELEC-203",
    name: "Praveen Nambiar",
    role: "Traction Substation (TSS) In-charge",
    departmentId: "ELEC",
    gangUnit: "Budni 132/25kV Substation Gang",
    shift: "DAY",
    status: "ON_DUTY",
    medicalFitness: "A-2",
    contactNumber: "+91 94065 11984",
    currentAssignment: "Feeder Circuit Breaker Remote Telemetry Verification",
    safetyCertValidUntil: "2027-06-30",
  },

  // Signal & Telecom
  {
    id: "EMP-SNT-301",
    name: "Kiran R. Patwardhan",
    role: "Section Engineer (Signal & Kavach)",
    departmentId: "SNT",
    gangUnit: "Kavach TCAS Rapid Deployment Squad",
    shift: "DAY",
    status: "ON_DUTY",
    medicalFitness: "A-1",
    contactNumber: "+91 98930 44521",
    currentAssignment: "Barkhera Point Machine #15 Facing Point Lock Calibration",
    safetyCertValidUntil: "2027-02-28",
  },
  {
    id: "EMP-SNT-302",
    name: "Amitabh Banerjee",
    role: "Senior Telecom Inspector (OFC)",
    departmentId: "SNT",
    gangUnit: "OFC & Axle Counter Maintenance Team",
    shift: "DAY",
    status: "ON_DUTY",
    medicalFitness: "A-2",
    contactNumber: "+91 94250 99812",
    currentAssignment: "Dual Axle Counter Head Voltage Alignment (KM 57)",
    safetyCertValidUntil: "2026-11-15",
  },

  // Safety Directorate
  {
    id: "EMP-SFTY-401",
    name: "Devendra Yadav",
    role: "Senior Safety Inspector (CRS Liaison)",
    departmentId: "SFTY",
    gangUnit: "Statutory Safety Audit Directorate",
    shift: "DAY",
    status: "ON_DUTY",
    medicalFitness: "A-1",
    contactNumber: "+91 94250 00192",
    currentAssignment: "G&SR Form T/806 Block Safety Verification Audit",
    safetyCertValidUntil: "2027-08-31",
  },
  {
    id: "EMP-SFTY-402",
    name: "Dr. Vikram Seth",
    role: "Bridge & Geological Safety Assessor",
    departmentId: "SFTY",
    gangUnit: "Substructure & Tunnel Safety Division",
    shift: "DAY",
    status: "ON_DUTY",
    medicalFitness: "A-1",
    contactNumber: "+91 98261 44023",
    currentAssignment: "Narmada Bridge Pier #4 Underwater Acoustic Scour Profiling",
    safetyCertValidUntil: "2027-05-15",
  },
];

export default function DepartmentWorkforcePage() {
  const { user } = useAuth();
  const { departments } = useRailPlan();

  const userDept = user?.departmentId || "ENG";
  const [deptFilter, setDeptFilter] = useState<string>(userDept);
  const [shiftFilter, setShiftFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const filteredMembers = MOCK_GANG_ROSTER.filter((m) => {
    if (deptFilter !== "ALL" && m.departmentId !== deptFilter) return false;
    if (shiftFilter !== "ALL" && m.shift !== shiftFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.gangUnit.toLowerCase().includes(q) ||
        m.currentAssignment.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#000D18] border-2 border-black p-5 shadow-[4px_4px_0_#000000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 text-[11px] font-black tracking-wider uppercase bg-[#00FFD2] text-black border border-black shadow-[1px_1px_0_#000000]">
                WORKFORCE & GANG ROSTER
              </span>
              <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#022642] text-[#2DC7D5] border border-black">
                G&SR SAFETY CODE COMPLIANT
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
              <Users className="w-7 h-7 text-[#00FFD2]" />
              Workforce, Gang Roster & Shift Deployments
            </h1>
            <p className="text-sm text-slate-300 font-mono mt-1">
              Field crew rosters, mechanized maintenance gangs, P-Way keymen, 25kV traction tower wagon linemen, and CRS safety certs.
            </p>
          </div>

          <Link
            href="/department/resources"
            className="bg-[#022642] hover:bg-[#033b66] text-white text-xs font-mono font-bold px-4 py-2.5 border-2 border-black shadow-[2px_2px_0_#000000] flex items-center gap-2 self-start md:self-auto transition-colors"
          >
            <Wrench className="w-4 h-4 text-[#00FFD2]" />
            <span>Heavy Equipment Fleet</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#000D18] border-2 border-black p-4 shadow-[3px_3px_0_#000000]">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase">Total Field Gangs</div>
          <div className="text-2xl font-black text-white font-mono mt-1">12 Gang Units</div>
          <div className="text-[11px] font-mono text-[#00FFD2] mt-1">1,430 Trackmen & Crew</div>
        </div>
        <div className="bg-[#000D18] border-2 border-black p-4 shadow-[3px_3px_0_#000000]">
          <div className="text-xs font-mono font-bold text-[#00FFD2] uppercase">Currently Dispatched</div>
          <div className="text-2xl font-black text-[#00FFD2] font-mono mt-1">3 Active Gangs</div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">On corridor maintenance blocks</div>
        </div>
        <div className="bg-[#000D18] border-2 border-black p-4 shadow-[3px_3px_0_#000000]">
          <div className="text-xs font-mono font-bold text-amber-400 uppercase">Night Mega-Block Shift</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">8 Gangs Roster</div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">Window: 01:30 - 05:30 IST</div>
        </div>
        <div className="bg-[#000D18] border-2 border-black p-4 shadow-[3px_3px_0_#000000]">
          <div className="text-xs font-mono font-bold text-[#2DC7D5] uppercase">Medical A-1 Certified</div>
          <div className="text-2xl font-black text-white font-mono mt-1">100% Fitness</div>
          <div className="text-[11px] font-mono text-[#00FFD2] mt-1">High-speed track ready</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#000D18] border-2 border-black p-4 shadow-[4px_4px_0_#000000] flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gang member, supervisor, role, or assignment..."
            className="w-full bg-[#011526] border-2 border-slate-700 focus:border-[#00FFD2] text-white pl-9 pr-3 py-2 text-xs font-mono outline-none"
          />
        </div>

        {/* Dept filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-mono text-slate-400">Dept:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-[#011526] border-2 border-slate-700 text-white text-xs font-mono px-3 py-2 outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="ENG">Civil (ENG / P-Way)</option>
            <option value="ELEC">Electrical (ELEC / OHE)</option>
            <option value="SNT">Signal & Telecom (SNT)</option>
            <option value="SFTY">Safety Directorate (SFTY)</option>
          </select>
        </div>

        {/* Shift filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-mono text-slate-400">Shift:</span>
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="bg-[#011526] border-2 border-slate-700 text-white text-xs font-mono px-3 py-2 outline-none"
          >
            <option value="ALL">All Shifts</option>
            <option value="DAY">Day Shift (06:00 - 14:00)</option>
            <option value="EVENING">Evening Shift (14:00 - 22:00)</option>
            <option value="NIGHT_BLOCK">Night Mega-Block (22:00 - 06:00)</option>
          </select>
        </div>
      </div>

      {/* Gang Roster List */}
      <div className="space-y-3">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="bg-[#000D18] border-2 border-black p-4 shadow-[4px_4px_0_#000000] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-black text-black bg-[#00FFD2] px-2 py-0.5 border border-black">
                  {member.id}
                </span>
                <span className="font-mono text-xs font-bold text-white bg-[#022642] px-2 py-0.5 border border-black">
                  {member.departmentId}
                </span>
                <span className="font-mono text-xs text-amber-400 bg-black px-2 py-0.5 border border-slate-800">
                  {member.gangUnit}
                </span>
                <span
                  className={`font-mono text-[10px] font-black px-2 py-0.5 border border-black uppercase ${
                    member.status === "DISPATCHED"
                      ? "bg-[#FB2077] text-white animate-pulse"
                      : member.status === "ON_DUTY"
                      ? "bg-[#00FFD2] text-black"
                      : "bg-slate-700 text-white"
                  }`}
                >
                  {member.status}
                </span>
              </div>

              <h3 className="text-base font-black text-white mt-1.5">{member.name}</h3>
              <div className="text-xs font-mono text-slate-300 font-bold">{member.role}</div>

              <div className="mt-2 text-xs font-mono text-slate-400 flex items-center gap-2 flex-wrap">
                <span className="text-white font-bold">Current Deployment:</span>
                <span className="text-slate-200">{member.currentAssignment}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800 text-xs font-mono">
              <div className="space-y-1">
                <div className="text-slate-400">
                  Medical Fitness: <strong className="text-white">{member.medicalFitness}</strong>
                </div>
                <div className="text-slate-400">
                  Safety Cert: <strong className="text-[#00FFD2]">{member.safetyCertValidUntil}</strong>
                </div>
                <div className="text-slate-400 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#2DC7D5]" />
                  <span>{member.contactNumber}</span>
                </div>
              </div>

              <Link
                href={`/department/create-request?title=${encodeURIComponent(
                  `Track Maintenance Block Dispatch for ${member.gangUnit}`
                )}`}
                className="bg-[#00FFD2] hover:bg-[#2bfde0] text-black font-mono font-black text-xs px-3.5 py-2 border border-black shadow-[2px_2px_0_#000000] uppercase flex items-center gap-1 transition-colors self-start sm:self-auto"
              >
                <HardHat className="w-3.5 h-3.5" />
                <span>Deploy to Block</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
