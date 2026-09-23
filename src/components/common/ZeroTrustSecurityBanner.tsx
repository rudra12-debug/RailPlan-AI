"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  Key,
  Lock,
  UserCheck,
  ChevronDown,
  Eye,
  EyeOff,
  Check,
  AlertTriangle
} from "lucide-react";

export function ZeroTrustSecurityBanner() {
  const {
    user,
    standardRole,
    jwtToken,
    jwtPayload,
    canApproveT806,
    canConfirmEmergency,
    rbacPersonas,
    switchUser,
  } = useAuth();

  const [showJwtDetails, setShowJwtDetails] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  return (
    <div className="bg-[#050814] border-b border-[#1A274E] px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Zero-Trust Security Status */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#131E3D] border border-[#3DFDCE]/40 text-[#3DFDCE] font-mono text-[10px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3DFDCE]" />
            <span>ZERO-TRUST SECURE</span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-[11px] text-[#B6BFFF] font-mono">
            <span>JWT Claims:</span>
            <span className="text-[#3DFDCE] font-bold">{jwtPayload.role}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">{jwtPayload.division}</span>
          </div>

          <button
            onClick={() => setShowJwtDetails(!showJwtDetails)}
            className="text-[10px] font-mono text-[#00FFE0] hover:underline flex items-center space-x-1"
          >
            <Key className="w-3 h-3" />
            <span>{showJwtDetails ? "Hide JWT" : "Inspect JWT"}</span>
          </button>
        </div>

        {/* Right: Quick RBAC Persona Switcher */}
        <div className="flex items-center space-x-2 relative">
          <span className="text-[#B6BFFF] text-[11px] hidden md:inline">Switch Persona:</span>
          
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="px-3 py-1 rounded-lg bg-[#0C1326] hover:bg-[#131E3D] border border-[#1A274E] text-slate-200 text-xs font-mono font-bold flex items-center space-x-2 transition"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#3DFDCE]" />
              <span>{user?.name} ({jwtPayload.role.replace(/_/g, " ")})</span>
              <ChevronDown className="w-3 h-3 text-[#B6BFFF]" />
            </button>

            {/* Persona Dropdown */}
            {showPersonaMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-72 rounded-xl bg-[#0C1326] border border-[#1A274E] shadow-2xl p-2 z-50 space-y-1 animate-in fade-in">
                <span className="text-[10px] font-mono text-[#B6BFFF] px-2 uppercase tracking-wider block">
                  Select Railway RBAC Persona:
                </span>
                {rbacPersonas.map((p) => {
                  const isCurrent = p.id === user?.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchUser(p.id);
                        setShowPersonaMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition flex items-center justify-between ${
                        isCurrent
                          ? "bg-[#131E3D] border border-[#3DFDCE]/50 text-[#3DFDCE] font-bold"
                          : "hover:bg-[#131E3D] text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-100">{p.name}</div>
                        <div className="text-[10px] text-[#B6BFFF] font-mono">{p.designation}</div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-[#3DFDCE]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Granular Permission Indicators */}
          <div className="hidden lg:flex items-center space-x-1.5 text-[10px] font-mono">
            <span
              className={`px-2 py-0.5 rounded ${
                canApproveT806
                  ? "bg-[#131E3D] text-[#3DFDCE] border border-[#3DFDCE]/40"
                  : "bg-[#050814] text-slate-500 border border-[#1A274E]"
              }`}
            >
              T/806 Authority: {canApproveT806 ? "YES" : "NO"}
            </span>
            <span
              className={`px-2 py-0.5 rounded ${
                canConfirmEmergency
                  ? "bg-[#131E3D] text-[#3DFDCE] border border-[#3DFDCE]/40"
                  : "bg-[#050814] text-slate-500 border border-[#1A274E]"
              }`}
            >
              Emergency Dispatch: {canConfirmEmergency ? "YES" : "NO"}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded JWT Token Drawer */}
      {showJwtDetails && (
        <div className="mt-2 pt-2 border-t border-[#1A274E] text-[11px] font-mono text-slate-300 max-w-7xl mx-auto space-y-2 animate-in fade-in">
          <div className="p-2.5 rounded-lg bg-[#050814] border border-[#1A274E] break-all space-y-1">
            <div className="text-[10px] text-[#3DFDCE] font-bold">SIMULATED JWT TOKEN (Bearer Token):</div>
            <div className="text-slate-400 text-[10px]">{jwtToken}</div>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded bg-[#0C1326] border border-[#1A274E] text-slate-300">
              Subject: <strong className="text-[#00FFE0]">{jwtPayload.sub}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-[#0C1326] border border-[#1A274E] text-slate-300">
              Role: <strong className="text-[#3DFDCE]">{jwtPayload.role}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-[#0C1326] border border-[#1A274E] text-slate-300">
              Division: <strong className="text-[#FFD600]">{jwtPayload.division}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Permissions: <strong className="text-slate-100">{jwtPayload.permissions.join(", ")}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
