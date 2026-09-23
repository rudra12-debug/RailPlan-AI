"use client";

import React, { useState, useMemo } from "react";
import { useRailPlan, ZONE_CORRIDOR_MAP } from "@/context/RailPlanContext";
import { formatINR } from "@/lib/formatters";
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  Filter, 
  Calendar, 
  Building2, 
  MapPin, 
  Sparkles, 
  Layers, 
  FileSpreadsheet 
} from "lucide-react";

export default function ReportsPage() {
  const { requests, departments, corridors, maintenanceTasks, selectedCorridorId, setSelectedCorridorId, selectedZone } = useRailPlan();

  const [reportType, setReportType] = useState("Department Performance");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedCorridor, setSelectedCorridor] = useState(() => selectedCorridorId || "ALL");
  const [dateRange, setDateRange] = useState("Current Month (August 2026)");
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const availableCorridors = useMemo(() => {
    const allowed = ZONE_CORRIDOR_MAP[selectedZone] || ZONE_CORRIDOR_MAP["ALL"];
    return corridors.filter((c) => allowed.includes(c.id));
  }, [corridors, selectedZone]);

  React.useEffect(() => {
    if (selectedCorridorId) {
      setSelectedCorridor(selectedCorridorId);
    }
  }, [selectedCorridorId]);

  const handleExport = (format: string) => {
    setIsExporting(format);
    setTimeout(() => {
      setIsExporting(null);
      // Simulate download
      if (format === "Excel") {
        const csvContent = "data:text/csv;charset=utf-8," +
          ["ID,Title,Department,Corridor,Cost,Status",
           ...requests.map(r => `${r.id},"${r.title}",${r.targetDepartment},${r.corridorId},${r.estimatedCost},${r.status}`)
          ].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `RailPlan_Report_${reportType.replace(/\s+/g, "_")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === "Print") {
        window.print();
      } else {
        alert(`PDF Report generated and ready for official dispatch.`);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950 via-navy-900 to-navy-950 border border-blue-500/30 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-700 px-2 py-0.5 rounded uppercase">
              Analytics & Auditing
            </span>
            <span className="text-xs text-slate-400 font-mono">Ministry of Railways Reporting Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Reports, Sanction Analytics & Export Center
          </h1>
          <p className="text-xs text-slate-400">
            Generate formal executive briefs, department performance audits, cost variances, and track safety logs
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport("PDF")}
            disabled={!!isExporting}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-glow-purple flex items-center space-x-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting === "PDF" ? "Generating..." : "Export PDF"}</span>
          </button>
          <button
            onClick={() => handleExport("Excel")}
            disabled={!!isExporting}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald flex items-center space-x-1.5 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{isExporting === "Excel" ? "Exporting CSV..." : "Export Excel"}</span>
          </button>
          <button
            onClick={() => handleExport("Print")}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center space-x-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Filter and Configuration Controls */}
      <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-700/80 shadow-2xl space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2">
          <Filter className="w-4 h-4" />
          <span>Report Parameters & Filtration</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            >
              <option value="Department Performance">Department Performance & Efficiency</option>
              <option value="Maintenance Completion">Maintenance Completion & Tasks</option>
              <option value="Cost Analysis">Cost Analysis & Budget Variance</option>
              <option value="Corridor Performance">Corridor Performance & Risk</option>
              <option value="Delayed Projects">Delayed Projects & Speed Restrictions</option>
              <option value="Resource Utilization">Resource & Machine Utilization</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Filter by Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Filter by Corridor</label>
            <select
              value={selectedCorridor}
              onChange={(e) => setSelectedCorridor(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            >
              <option value="ALL">{selectedZone.startsWith("All") ? "All Corridors" : `All ${selectedZone.split("(")[0].trim()} (${availableCorridors.length})`}</option>
              {availableCorridors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Time Horizon</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
            >
              <option value="Current Month (August 2026)">Current Month (August 2026)</option>
              <option value="Last 90 Days (Q2 FY26)">Last 90 Days (Q2 FY26)</option>
              <option value="Financial Year 2026-27">Financial Year 2026-27</option>
            </select>
          </div>
        </div>
      </div>

      {/* Generated Report Preview Sheet */}
      <div className="rounded-2xl border border-slate-700/80 bg-navy-900/95 p-6 shadow-2xl space-y-6">
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Executive Briefing Document
            </span>
            <h2 className="text-xl font-extrabold text-slate-100 mt-1">{reportType} Official Audit</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Period: {dateRange} • Generated by: Indian Railways RailPlan AI
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 border border-emerald-700 bg-emerald-950/80 px-2.5 py-1 rounded-lg">
            VALIDATED AUDIT
          </span>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Work Orders</p>
            <p className="text-lg font-extrabold text-slate-100 font-mono mt-0.5">{requests.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Budget Sanctioned</p>
            <p className="text-lg font-extrabold text-cyan-300 font-mono mt-0.5">
              {formatINR(departments.reduce((acc, d) => acc + d.allocatedBudget, 0))}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Workforce Deployed</p>
            <p className="text-lg font-extrabold text-amber-300 font-mono mt-0.5">
              {departments.reduce((acc, d) => acc + d.workforceActive, 0)} Staff
            </p>
          </div>
          <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Avg Safety Score</p>
            <p className="text-lg font-extrabold text-emerald-400 font-mono mt-0.5">93.4%</p>
          </div>
        </div>

        {/* Dynamic Table based on departments */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Department</th>
                <th className="p-3 font-mono">Budget Sanctioned</th>
                <th className="p-3 font-mono">Actual Utilized</th>
                <th className="p-3 text-center">Active Tasks</th>
                <th className="p-3 text-center">Workforce Utilization</th>
                <th className="p-3 text-right">Performance Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {departments.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/50">
                  <td className="p-3 font-semibold text-slate-200">
                    <span className="font-bold text-cyan-300 mr-2">{d.code}</span>
                    {d.name}
                  </td>
                  <td className="p-3 font-mono text-slate-300">{formatINR(d.allocatedBudget)}</td>
                  <td className="p-3 font-mono text-cyan-300 font-bold">{formatINR(d.usedBudget)}</td>
                  <td className="p-3 font-mono text-center">{d.activeTasks}</td>
                  <td className="p-3 font-mono text-center">
                    {Math.round((d.workforceActive / d.workforceTotal) * 100)}%
                  </td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-700">
                      {d.performanceScore}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
