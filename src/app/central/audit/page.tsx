"use client";

import React, { useState } from "react";
import { useRailPlan } from "@/context/RailPlanContext";
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  ArrowRight,
  FileText
} from "lucide-react";

export default function AuditLogsPage() {
  const { auditLogs } = useRailPlan();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entityId.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());

    const matchesDept = deptFilter === "ALL" || log.department.toLowerCase().includes(deptFilter.toLowerCase());

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded uppercase">
              Compliance & Security
            </span>
            <span className="text-xs text-slate-400 font-mono">Immutable Railway Audit Trail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            System Activity & Decision Audit Trail
          </h1>
          <p className="text-xs text-slate-400">
            Cryptographically timestamped log of all approvals, status changes, resource allocations, and emergency replans
          </p>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-slate-300">
          {auditLogs.length} Verified Entries
        </span>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Actor, Request ID, Action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-navy-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-60"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="bg-navy-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          <option value="ALL">All Authorities / Departments</option>
          <option value="Central">Central Control Authority</option>
          <option value="Engineering">Engineering</option>
          <option value="Signal">Signal & Telecom</option>
          <option value="Electrical">Electrical</option>
          <option value="Safety">Safety</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-slate-800 bg-navy-900/90 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Log ID</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor / Department</th>
                <th className="p-3.5">Action Executed</th>
                <th className="p-3.5 font-mono">Entity ID</th>
                <th className="p-3.5">State Transition</th>
                <th className="p-3.5">Audit Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-3.5 font-mono text-cyan-400 font-bold">{log.id}</td>
                  <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-200">{log.user}</p>
                    <p className="text-[10px] text-slate-400 truncate">{log.department}</p>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-100">{log.action}</td>
                  <td className="p-3.5 font-mono font-bold text-purple-400">{log.entityId}</td>
                  <td className="p-3.5 whitespace-nowrap">
                    {log.previousStatus && log.newStatus ? (
                      <div className="flex items-center space-x-1.5 text-[10px] font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {log.previousStatus}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                          {log.newStatus}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[10px]">RECORDED</span>
                    )}
                  </td>
                  <td className="p-3.5 text-xs text-slate-300 max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
