"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Train, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Building2
} from "lucide-react";
import { MOCK_USERS, MOCK_DEPARTMENTS } from "@/lib/mockData";
import { DepartmentId } from "@/lib/types";

export default function LoginPage() {
  const { login, switchUser } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("admin@railplan.ai");
  const [password, setPassword] = useState("••••••••");
  const [selectedDept, setSelectedDept] = useState<DepartmentId>("ENG");
  const [error, setError] = useState("");

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const success = login(email, selectedDept);
    if (success) {
      if (email.toLowerCase().includes("admin")) {
        router.push("/central");
      } else {
        router.push("/department/dashboard");
      }
    } else {
      setError("Invalid credentials. Use one of the demo logins below.");
    }
  };

  const handleQuickLogin = (userEmail: string, role: string) => {
    switchUser(userEmail);
    if (role === "CENTRAL_ADMIN") {
      router.push("/central");
    } else {
      router.push("/department/dashboard");
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-6 px-4">
      {/* Background Cyber Grid */}
      <div className="max-w-4xl w-full space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-glow-cyan mb-2">
            <Train className="w-8 h-8 text-navy-950" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">RAILPLAN</h1>
            <span className="font-mono text-sm px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
              AI
            </span>
          </div>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            AI-Powered Railway Maintenance Planning, Monitoring & Approval System
          </p>
          <div className="flex items-center justify-center space-x-1.5 pt-1">
            <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">
              Government of India • Ministry of Railways
            </span>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Traditional Login Form (5 Cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-navy-900/90 border border-slate-700/80 p-4 sm:p-6 shadow-2xl space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Secure Authority Portal</h3>
              <p className="text-xs text-slate-400">Enter your credentials or select a persona</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-600/60 text-xs text-rose-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Official Email ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-navy-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
                    placeholder="e.g. engineering@railplan.ai"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-navy-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Department (if Department User)
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value as DepartmentId)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  {MOCK_DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-bold text-xs shadow-glow-cyan flex items-center justify-center space-x-2 transition transform active:scale-95"
              >
                <span>Authenticate & Enter Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center text-[10px] text-slate-500 font-mono">
              Protected by 256-Bit Encrypted Indian Railways RBAC Protocol
            </div>
          </div>

          {/* Right: 1-Click Persona Login Hub (7 Cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-navy-900/90 border border-slate-700/80 p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">1-Click Demo Personas</h3>
                <p className="text-xs text-slate-400">Select any role to test isolated permissions & workflows</p>
              </div>
              <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-mono font-bold">
                5 Personas (Admin + 4 Core Directorates)
              </span>
            </div>

            {/* Central Admin Hero Card */}
            <div
              onClick={() => handleQuickLogin(MOCK_USERS[0].email, MOCK_USERS[0].role)}
              className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/80 via-navy-900 to-slate-900 border border-purple-500/50 hover:border-purple-400 cursor-pointer transition-all shadow-glow-purple group flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-500 text-navy-950 font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-100">Central Control Authority (Admin)</h4>
                    <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-700 px-1.5 py-0.2 rounded font-mono font-bold">
                      Full Access
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">{MOCK_USERS[0].email}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition" />
            </div>

            {/* 4 Core Directorate Personas Grid */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Core Directorates (Civil • Electrical/OHE • Signal & Traffic • Safety)
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {MOCK_USERS.filter((u) => u.role === "DEPT_USER").map((userPersona) => (
                  <div
                    key={userPersona.id}
                    onClick={() => handleQuickLogin(userPersona.email, userPersona.role)}
                    className="p-2.5 rounded-lg bg-navy-950/80 border border-slate-800 hover:border-cyan-500/60 hover:bg-navy-950 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition">
                        {userPersona.departmentName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{userPersona.email}</p>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      {userPersona.departmentId}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
