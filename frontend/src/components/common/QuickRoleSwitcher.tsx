"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MOCK_USERS } from "@/lib/mockData";
import { ShieldCheck, Users, CaretDown, CheckCircle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export const QuickRoleSwitcher: React.FC = () => {
  const { user, switchUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSelectUser = (email: string, role: string) => {
    switchUser(email);
    setIsOpen(false);
    if (role === "CENTRAL_ADMIN") {
      router.push("/central");
    } else {
      router.push("/department/dashboard");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#022642] border-2 border-black shadow-[2px_2px_0_#000000] hover:bg-[#033358] transition-all text-xs font-bold text-white cursor-pointer active:translate-y-0.5 active:shadow-none"
      >
        <div className="w-2 h-2 rounded-full bg-[#00FFD2] animate-pulse" />
        <span className="text-[#CABFFF] hidden sm:inline">Role:</span>
        <span className="font-mono font-black text-[#00FFD2]">
          {user?.role === "CENTRAL_ADMIN" ? "Central Admin" : user?.departmentName || "Department"}
        </span>
        <CaretDown size={14} weight="bold" className={`text-[#CABFFF] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#011526] border-2 border-black shadow-[5px_5px_0_#000000] z-50 overflow-hidden">
            <div className="p-3 bg-[#000D18] border-b-2 border-black">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Switch Active Persona
                </span>
                <span className="text-[10px] bg-[#6367FF] text-white border border-black px-1.5 py-0.5 rounded font-mono font-black">
                  RBAC Mode
                </span>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto p-2 space-y-1.5">
              {/* Central Admin Option */}
              <button
                onClick={() => handleSelectUser(MOCK_USERS[0].email, MOCK_USERS[0].role)}
                className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between border-2 transition cursor-pointer ${
                  user?.role === "CENTRAL_ADMIN"
                    ? "bg-[#6367FF] text-white border-black shadow-[2px_2px_0_#000000]"
                    : "bg-[#022642] text-[#CABFFF] border-black/50 hover:bg-[#033358] hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-md bg-[#000D18] text-[#00FFD2] border border-black">
                    <ShieldCheck size={18} weight="duotone" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">Central Control Authority</p>
                    <p className="text-[10px] text-[#CABFFF] font-mono">admin@railplan.ai (Full Access)</p>
                  </div>
                </div>
                {user?.role === "CENTRAL_ADMIN" && <CheckCircle size={18} weight="fill" className="text-[#00FFD2]" />}
              </button>

              <div className="pt-2 pb-1 px-2 text-[10px] font-black uppercase tracking-wider text-[#FFFF00]">
                Core Directorates (Civil • Electrical • S&T • Safety)
              </div>

              {/* Department Users */}
              {MOCK_USERS.filter((u) => u.role === "DEPT_USER").map((u) => {
                const isSelected = user?.email === u.email;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u.email, u.role)}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between border-2 transition cursor-pointer ${
                      isSelected
                        ? "bg-[#6367FF] text-white border-black shadow-[2px_2px_0_#000000]"
                        : "bg-[#022642] text-[#CABFFF] border-black/50 hover:bg-[#033358] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div className="p-1.5 rounded-md bg-[#000D18] text-[#00FFD2] border border-black shrink-0">
                        <Users size={16} weight="duotone" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-white whitespace-normal leading-tight">{u.departmentName}</p>
                        <p className="text-[10px] text-[#CABFFF] font-mono truncate">{u.email}</p>
                      </div>
                    </div>
                    {isSelected && <CheckCircle size={16} weight="fill" className="text-[#00FFD2] shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
