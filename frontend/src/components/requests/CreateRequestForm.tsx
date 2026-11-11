"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRailPlan } from "@/context/RailPlanContext";
import { 
  DepartmentId, 
  RequestPriority, 
  ServiceRequestType, 
  CostBreakdown,
  PlanningHorizon 
} from "@/lib/types";
import { formatINR, formatFullINR } from "@/lib/formatters";
import { 
  Send, 
  Plus, 
  Trash2, 
  Paperclip, 
  Sparkles, 
  DollarSign, 
  CheckCircle2, 
  Calendar,
  Building2,
  MapPin,
  HelpCircle,
  FileText
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export const CreateRequestForm: React.FC = () => {
  const { user } = useAuth();
  const { 
    createServiceRequest, 
    corridors, 
    departments,
    selectedCorridorId,
    setSelectedCorridorId 
  } = useRailPlan();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCorridor = searchParams?.get("corridor") || (selectedCorridorId !== "ALL" ? selectedCorridorId : "NDLS-MMCT");
  const initialLocation = searchParams?.get("location") || "KM 148.0 - 154.0 (Mathura Section)";
  const initialTargetDept = (searchParams?.get("targetDept") as DepartmentId) || "ELEC";
  const initialTitle = searchParams?.get("title") || "25kV OHE Power Block & Catenary Tensioning Support for Track Relay";
  const initialPriority = (searchParams?.get("priority") as RequestPriority) || "HIGH";

  const [title, setTitle] = useState(initialTitle);
  const [targetDepartment, setTargetDepartment] = useState<DepartmentId>(initialTargetDept);
  const [corridorId, setCorridorId] = useState(initialCorridor);
  const [locationKm, setLocationKm] = useState(initialLocation);
  const [requestType, setRequestType] = useState<ServiceRequestType>("Electrical Support");
  const [priority, setPriority] = useState<RequestPriority>(initialPriority);
  const [description, setDescription] = useState(
    searchParams?.get("title")
      ? `Condition-based maintenance requested based on IoT sensor anomaly at ${initialLocation}. Urgent traffic block and track isolation requested to perform immediate remediation.`
      : "Engineering department is scheduled for heavy 60kg rail renewal and sleeper replacement between KM 148 and KM 154. Urgent 25kV OHE power isolation (block window of 4 hours), neutral section checking, and post-track-lift catenary readjustment is required from the Electrical department to avoid pantograph entanglement."
  );
  const [requiredDate, setRequiredDate] = useState("2026-08-28");
  const [horizon, setHorizon] = useState<PlanningHorizon>("WEEKLY");
  const [additionalNotes, setAdditionalNotes] = useState(
    "Traffic block requested during 01:30 AM to 05:30 AM low-traffic window to minimize impact on 12952 Mumbai Rajdhani Express."
  );

  // 6-Part Cost Breakdown State
  const [labourCost, setLabourCost] = useState(120000);
  const [equipmentCost, setEquipmentCost] = useState(80000);
  const [materialCost, setMaterialCost] = useState(150000);
  const [logisticsCost, setLogisticsCost] = useState(25000);
  const [trackBlockCost, setTrackBlockCost] = useState(0);
  const [contingencyCost, setContingencyCost] = useState(27000);

  // Resources state
  const [resources, setResources] = useState<string[]>([
    "1x 25kV OHE Tower Wagon",
    "2x Traction Linemen Crews (8 technicians)",
    "1x Portable Earthing Discharge Rod Set",
    "1x High-Accuracy Laser Catenary Height Gauge",
  ]);
  const [newResourceInput, setNewResourceInput] = useState("");

  const [attachments, setAttachments] = useState<string[]>([
    "Track_Geometry_Inspection_Report_KM148.pdf",
    "OHE_Clearance_Drawing_Sec4.dwg",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const totalEstimatedCost =
    labourCost + equipmentCost + materialCost + logisticsCost + trackBlockCost + contingencyCost;

  const handleAddResource = () => {
    if (newResourceInput.trim()) {
      setResources([...resources, newResourceInput.trim()]);
      setNewResourceInput("");
    }
  };

  const handleRemoveResource = (idx: number) => {
    setResources(resources.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const costBreakdown: CostBreakdown = {
      labour: labourCost,
      equipment: equipmentCost,
      material: materialCost,
      logistics: logisticsCost,
      trackBlock: trackBlockCost,
      contingency: contingencyCost,
      totalEstimated: totalEstimatedCost,
      actualCost: 0,
    };

    const newReqId = createServiceRequest({
      title,
      targetDepartment,
      corridorId,
      locationKm,
      requestType,
      priority,
      description,
      requiredDate,
      estimatedCost: totalEstimatedCost,
      costBreakdown,
      resourcesRequired: resources,
      attachments,
      additionalNotes,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setCreatedId(newReqId);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Indian Railways Tricolor Accent Ribbon */}
      <div className="h-1.5 w-full rounded-t-xl bg-gradient-to-r from-[#FF671F] via-[#FFFFFF] to-[#046A38] shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />

      {/* Title & Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#000D18] border-3 border-black shadow-[6px_6px_0_#000000] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-[#1E40AF] text-white border-2 border-black shadow-[2px_2px_0_#000000]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Create Inter-Departmental Service Request</h2>
            <p className="text-xs text-slate-300 font-medium">
              Submit formal service, resource, or block window request for Central Authority review & sanction
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-[#022642] px-3.5 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0_#000000]">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Requesting Dept:</span>
          <span className="text-xs font-mono font-black text-[#38BDF8]">
            {user?.departmentName || "Engineering Department"}
          </span>
        </div>
      </div>

      {createdId ? (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#022642] border-3 border-black shadow-[8px_8px_0_#000000] text-center space-y-4 animate-scale-up">
          <div className="w-16 h-16 rounded-full bg-[#047857] text-white border-2 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0_#000000]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono font-black text-[#34D399] uppercase tracking-widest">
              Request Successfully Submitted
            </span>
            <h3 className="text-2xl font-black text-white mt-1 font-mono">Request ID: {createdId}</h3>
            <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
              Your request has entered the <span className="text-[#FBBF24] font-black">[UNDER REVIEW]</span> stage. Central Authority has been notified for sanction and assignment to {targetDepartment} Department.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => {
                if (selectedCorridorId !== "ALL" && selectedCorridorId !== corridorId) {
                  setSelectedCorridorId("ALL");
                }
                router.push("/department/requests");
              }}
              className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-black border-2 border-black shadow-[3px_3px_0_#000000] transition cursor-pointer"
            >
              View in Service Requests
            </button>
            <button
              onClick={() => {
                setCreatedId(null);
                setTitle("");
              }}
              className="px-5 py-2.5 rounded-xl bg-[#047857] hover:bg-[#065F46] text-white text-xs font-black border-2 border-black shadow-[3px_3px_0_#000000] transition cursor-pointer"
            >
              Create Another Request
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 rounded-2xl bg-[#022642] border-3 border-black shadow-[8px_8px_0_#000000] space-y-6">
          {/* Section 1: Basic Classification */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-[#38BDF8] rounded-sm border border-black inline-block" />
                <span>1. Request Parameters & Routing</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-[#000D18] text-[#38BDF8] border border-black">
                CORE ROUTING
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                  Service Request Title / Subject *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#000D18] border-2 border-black rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:border-[#38BDF8] focus:outline-none shadow-[2px_2px_0_#000000] font-semibold"
                  placeholder="e.g. 25kV OHE Power Block & Catenary Tensioning Support"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                  Target Department (Service Provider) *
                </label>
                <select
                  value={targetDepartment}
                  onChange={(e) => setTargetDepartment(e.target.value as DepartmentId)}
                  className="w-full bg-[#000D18] border-2 border-black rounded-xl p-3 text-xs text-white focus:border-[#38BDF8] focus:outline-none shadow-[2px_2px_0_#000000] font-semibold cursor-pointer"
                >
                  {departments
                    .filter((d) => d.id !== (user?.departmentId || "ENG"))
                    .map((d) => (
                      <option key={d.id} value={d.id} className="bg-[#000D18] text-white">
                        {d.name} ({d.code})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                  Request Type *
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as ServiceRequestType)}
                  className="w-full bg-[#000D18] border-2 border-black rounded-xl p-3 text-xs text-white focus:border-[#38BDF8] focus:outline-none shadow-[2px_2px_0_#000000] font-semibold cursor-pointer"
                >
                  <option value="Electrical Support" className="bg-[#000D18] text-white">Electrical Support (OHE / Power)</option>
                  <option value="Signal Support" className="bg-[#000D18] text-white">Signal Support (Interlocking / Kavach)</option>
                  <option value="Track Repair" className="bg-[#000D18] text-white">Track Repair (P-Way Civil)</option>
                  <option value="Workforce Request" className="bg-[#000D18] text-white">Workforce / Crew Request</option>
                  <option value="Equipment Request" className="bg-[#000D18] text-white">Heavy Track Machine / Crane Request</option>
                  <option value="Safety Inspection" className="bg-[#000D18] text-white">Safety Inspection & Certification</option>
                  <option value="Emergency Maintenance" className="bg-[#000D18] text-white">Emergency Maintenance</option>
                  <option value="Budget Request" className="bg-[#000D18] text-white">Special Budget Sanction</option>
                  <option value="Material Request" className="bg-[#000D18] text-white">Rails & Sleepers Material Request</option>
                  <option value="Other" className="bg-[#000D18] text-white">Other Operational Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                  Corridor Route *
                </label>
                <select
                  value={corridorId}
                  onChange={(e) => setCorridorId(e.target.value)}
                  className="w-full bg-[#000D18] border-2 border-black rounded-xl p-3 text-xs text-white focus:border-[#38BDF8] focus:outline-none shadow-[2px_2px_0_#000000] font-semibold cursor-pointer"
                >
                  {corridors.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#000D18] text-white">
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                  Location / Section / KM Marker *
                </label>
                <input
                  type="text"
                  value={locationKm}
                  onChange={(e) => setLocationKm(e.target.value)}
                  className="w-full bg-[#000D18] border-2 border-black rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:border-[#38BDF8] focus:outline-none shadow-[2px_2px_0_#000000] font-semibold"
                  placeholder="e.g. KM 148.0 - 154.0 (Mathura Section)"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                  Priority Level *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as RequestPriority)}
                  className="w-full bg-[#000D18] border-2 border-black rounded-xl p-3 text-xs font-black text-[#FBBF24] focus:border-[#38BDF8] focus:outline-none shadow-[2px_2px_0_#000000] cursor-pointer"
                >
                  <option value="LOW" className="bg-[#000D18] text-slate-300">LOW - Scheduled non-traffic window</option>
                  <option value="MEDIUM" className="bg-[#000D18] text-[#38BDF8]">MEDIUM - Standard maintenance window</option>
                  <option value="HIGH" className="bg-[#000D18] text-[#FBBF24]">HIGH - Urgent track safety window</option>
                  <option value="CRITICAL" className="bg-[#000D18] text-[#F87171]">CRITICAL - Imminent speed restriction risk</option>
                  <option value="EMERGENCY" className="bg-[#000D18] text-[#EF4444]">EMERGENCY - Total corridor block</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                  Required Execution Date *
                </label>
                <input
                  type="date"
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  className="w-full bg-[#000D18] border-2 border-black rounded-xl p-3 text-xs text-white focus:border-[#38BDF8] focus:outline-none shadow-[2px_2px_0_#000000] font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                  Planning Horizon (Short-Term vs Long-Term) *
                </label>
                <select
                  value={horizon}
                  onChange={(e) => setHorizon(e.target.value as PlanningHorizon)}
                  className="w-full bg-[#000D18] border-2 border-black rounded-xl p-3 text-xs text-white font-black focus:border-[#38BDF8] focus:outline-none shadow-[2px_2px_0_#000000] cursor-pointer"
                >
                  <option value="WEEKLY" className="bg-[#000D18] text-[#34D399]">WEEKLY (Short-Term Tactical Maintenance - 7-Day Window)</option>
                  <option value="MONTHLY" className="bg-[#000D18] text-[#FBBF24]">MONTHLY (Long-Term Strategic Overhaul - 30-Day Master)</option>
                  <option value="DAILY" className="bg-[#000D18] text-[#F87171]">DAILY (Immediate Emergency Execution - 24-Hour Possession)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Detailed Scope & Notes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-[#FBBF24] rounded-sm border border-black inline-block" />
                <span>2. Detailed Scope, Methodology & Traffic Block</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-[#000D18] text-[#FBBF24] border border-black">
                OPERATIONAL SCOPE
              </span>
            </div>

            <div>
              <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                Detailed Description & Work Scope *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#000D18] border-2 border-black rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:border-[#38BDF8] focus:outline-none shadow-[2px_2px_0_#000000] font-medium leading-relaxed"
                placeholder="Describe operational reasons, technical specifications, and safety precautions..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                Traffic Block Notes & Passenger Train Mitigation
              </label>
              <input
                type="text"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full bg-[#000D18] border-2 border-black rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:border-[#38BDF8] focus:outline-none shadow-[2px_2px_0_#000000] font-medium"
                placeholder="e.g. Block slot requested between 01:30 AM to 05:30 AM to avoid Rajdhani Express delay."
              />
            </div>
          </div>

          {/* Section 3: 6-Part Cost Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-[#34D399] rounded-sm border border-black inline-block" />
                <span>3. Cost Estimation Breakdown (₹ INR)</span>
              </span>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-black bg-[#000D18] text-[#34D399] border-2 border-black shadow-[2px_2px_0_#000000]">
                Total: {formatFullINR(totalEstimatedCost)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-bold">Labour Cost</label>
                <input
                  type="number"
                  value={labourCost}
                  onChange={(e) => setLabourCost(Number(e.target.value))}
                  className="w-full bg-[#000D18] border-2 border-black rounded-xl p-2.5 text-xs text-white font-mono font-bold focus:border-[#38BDF8] focus:outline-none shadow-[2px_2px_0_#000000]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-bold">Equipment Cost</label>
                <input
                  type="number"
                  value={equipmentCost}
                  onChange={(e) => setEquipmentCost(Number(e.target.value))}
                  className="w-full bg-[#000D18] border-2 border-black rounded-xl p-2.5 text-xs text-white font-mono font-bold focus:border-[#38BDF8] focus:outline-none shadow-[2px_2px_0_#000000]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-bold">Material Cost</label>
                <input
                  type="number"
                  value={materialCost}
                  onChange={(e) => setMaterialCost(Number(e.target.value))}
                  className="w-full bg-[#000D18] border-2 border-black rounded-xl p-2.5 text-xs text-white font-mono font-bold focus:border-[#38BDF8] focus:outline-none shadow-[2px_2px_0_#000000]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-bold">Logistics Cost</label>
                <input
                  type="number"
                  value={logisticsCost}
                  onChange={(e) => setLogisticsCost(Number(e.target.value))}
                  className="w-full bg-[#000D18] border-2 border-black rounded-xl p-2.5 text-xs text-white font-mono font-bold focus:border-[#38BDF8] focus:outline-none shadow-[2px_2px_0_#000000]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-bold">Track Block Cost</label>
                <input
                  type="number"
                  value={trackBlockCost}
                  onChange={(e) => setTrackBlockCost(Number(e.target.value))}
                  className="w-full bg-[#000D18] border-2 border-black rounded-xl p-2.5 text-xs text-white font-mono font-bold focus:border-[#38BDF8] focus:outline-none shadow-[2px_2px_0_#000000]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-bold">Contingency</label>
                <input
                  type="number"
                  value={contingencyCost}
                  onChange={(e) => setContingencyCost(Number(e.target.value))}
                  className="w-full bg-[#000D18] border-2 border-black rounded-xl p-2.5 text-xs text-white font-mono font-bold focus:border-[#38BDF8] focus:outline-none shadow-[2px_2px_0_#000000]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Required Resources */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-[#38BDF8] rounded-sm border border-black inline-block" />
                <span>4. Machinery & Crew Requirements</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-[#000D18] text-[#38BDF8] border border-black">
                EQUIPMENT FLEET
              </span>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newResourceInput}
                onChange={(e) => setNewResourceInput(e.target.value)}
                placeholder="e.g. 1x 25kV OHE Tower Wagon, 2x Linemen Crews..."
                className="flex-1 bg-[#000D18] border-2 border-black rounded-xl p-2.5 text-xs text-white placeholder-slate-400 focus:border-[#38BDF8] focus:outline-none shadow-[2px_2px_0_#000000] font-semibold"
              />
              <button
                type="button"
                onClick={handleAddResource}
                className="px-4 py-2.5 bg-[#1E40AF] hover:bg-[#172554] text-white border-2 border-black shadow-[2px_2px_0_#000000] rounded-xl text-xs font-black flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {resources.map((res, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-[#000D18] border-2 border-black text-xs font-bold text-white flex items-center space-x-2 shadow-[2px_2px_0_#000000]"
                >
                  <span>{res}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveResource(idx)}
                    className="text-slate-400 hover:text-[#EF4444] transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="pt-4 border-t-2 border-black flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-xs font-black text-slate-300 hover:text-white border-2 border-black rounded-xl bg-[#0F172A] hover:bg-[#1E293B] shadow-[2px_2px_0_#000000] transition text-center cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto justify-center px-8 py-3 rounded-xl bg-[#047857] hover:bg-[#065F46] text-white font-black text-xs border-2 border-black shadow-[4px_4px_0_#000000] hover:shadow-[2px_2px_0_#000000] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Service Request for Sanction</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
