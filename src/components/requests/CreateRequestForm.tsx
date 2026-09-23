"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRailPlan } from "@/context/RailPlanContext";
import { 
  DepartmentId, 
  RequestPriority, 
  ServiceRequestType, 
  CostBreakdown 
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
import { useRouter } from "next/navigation";

export const CreateRequestForm: React.FC = () => {
  const { user } = useAuth();
  const { createServiceRequest, corridors, departments } = useRailPlan();
  const router = useRouter();

  const [title, setTitle] = useState("25kV OHE Power Block & Catenary Tensioning Support for Track Relay");
  const [targetDepartment, setTargetDepartment] = useState<DepartmentId>("ELEC");
  const [corridorId, setCorridorId] = useState("NDLS-MMCT");
  const [locationKm, setLocationKm] = useState("KM 148.0 - 154.0 (Mathura Section)");
  const [requestType, setRequestType] = useState<ServiceRequestType>("Electrical Support");
  const [priority, setPriority] = useState<RequestPriority>("HIGH");
  const [description, setDescription] = useState(
    "Engineering department is scheduled for heavy 60kg rail renewal and sleeper replacement between KM 148 and KM 154. Urgent 25kV OHE power isolation (block window of 4 hours), neutral section checking, and post-track-lift catenary readjustment is required from the Electrical department to avoid pantograph entanglement."
  );
  const [requiredDate, setRequiredDate] = useState("2026-08-28");
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
      {/* Title & Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 border border-slate-800 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Create Inter-Departmental Service Request</h2>
            <p className="text-xs text-slate-400">
              Submit formal service, resource, or block window request for Central Authority review & sanction
            </p>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-slate-400">Requesting Department</span>
          <span className="text-xs font-bold text-cyan-300 font-mono">
            {user?.departmentName || "Engineering Department"}
          </span>
        </div>
      </div>

      {createdId ? (
        <div className="p-8 rounded-2xl bg-navy-900/90 border border-emerald-500/50 text-center space-y-4 shadow-glow-emerald animate-scale-up">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400 flex items-center justify-center mx-auto shadow-glow-emerald">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Request Successfully Submitted
            </span>
            <h3 className="text-2xl font-extrabold text-slate-100 mt-1 font-mono">Request ID: {createdId}</h3>
            <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
              Your request has entered the <span className="text-amber-400 font-bold">UNDER REVIEW</span> stage. Central Authority has been notified for sanction and assignment to {targetDepartment} Department.
            </p>
          </div>

          <div className="pt-4 flex justify-center space-x-3">
            <button
              onClick={() => router.push("/department/requests")}
              className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
            >
              View in Service Requests
            </button>
            <button
              onClick={() => {
                setCreatedId(null);
                setTitle("");
              }}
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-navy-950 text-xs font-bold shadow-glow-cyan transition"
            >
              Create Another Request
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-navy-900/90 border border-slate-700/80 shadow-2xl space-y-6">
          {/* Section 1: Basic Classification */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2">
              <span>1. Request Parameters & Routing</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Service Request Title / Subject *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                  placeholder="e.g. 25kV OHE Power Block & Catenary Tensioning Support"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Target Department (Service Provider) *
                </label>
                <select
                  value={targetDepartment}
                  onChange={(e) => setTargetDepartment(e.target.value as DepartmentId)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  {departments
                    .filter((d) => d.id !== (user?.departmentId || "ENG"))
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Request Type *
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as ServiceRequestType)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Electrical Support">Electrical Support (OHE / Power)</option>
                  <option value="Signal Support">Signal Support (Interlocking / Kavach)</option>
                  <option value="Track Repair">Track Repair (P-Way Civil)</option>
                  <option value="Workforce Request">Workforce / Crew Request</option>
                  <option value="Equipment Request">Heavy Track Machine / Crane Request</option>
                  <option value="Safety Inspection">Safety Inspection & Certification</option>
                  <option value="Emergency Maintenance">Emergency Maintenance</option>
                  <option value="Budget Request">Special Budget Sanction</option>
                  <option value="Material Request">Rails & Sleepers Material Request</option>
                  <option value="Other">Other Operational Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Corridor Route *
                </label>
                <select
                  value={corridorId}
                  onChange={(e) => setCorridorId(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  {corridors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Location / Section / KM Marker *
                </label>
                <input
                  type="text"
                  value={locationKm}
                  onChange={(e) => setLocationKm(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                  placeholder="e.g. KM 148.0 - 154.0 (Mathura Section)"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Priority Level *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as RequestPriority)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none font-bold text-amber-400"
                >
                  <option value="LOW">LOW - Scheduled non-traffic window</option>
                  <option value="MEDIUM">MEDIUM - Standard maintenance window</option>
                  <option value="HIGH">HIGH - Urgent track safety window</option>
                  <option value="CRITICAL">CRITICAL - Imminent speed restriction risk</option>
                  <option value="EMERGENCY">EMERGENCY - Total corridor block</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Required Execution Date *
                </label>
                <input
                  type="date"
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Detailed Scope & Notes */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2">
              <span>2. Detailed Scope, Methodology & Traffic Block</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Detailed Description & Work Scope *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none leading-relaxed"
                placeholder="Describe operational reasons, technical specifications, and safety precautions..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Traffic Block Notes & Passenger Train Mitigation
              </label>
              <input
                type="text"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                placeholder="e.g. Block slot requested between 01:30 AM to 05:30 AM to avoid Rajdhani Express delay."
              />
            </div>
          </div>

          {/* Section 3: 6-Part Cost Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                3. Cost Estimation Breakdown (₹ INR)
              </span>
              <span className="text-sm font-extrabold text-cyan-300 font-mono">
                Total: {formatFullINR(totalEstimatedCost)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Labour Cost</label>
                <input
                  type="number"
                  value={labourCost}
                  onChange={(e) => setLabourCost(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Equipment Cost</label>
                <input
                  type="number"
                  value={equipmentCost}
                  onChange={(e) => setEquipmentCost(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Material Cost</label>
                <input
                  type="number"
                  value={materialCost}
                  onChange={(e) => setMaterialCost(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Logistics Cost</label>
                <input
                  type="number"
                  value={logisticsCost}
                  onChange={(e) => setLogisticsCost(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Track Block Cost</label>
                <input
                  type="number"
                  value={trackBlockCost}
                  onChange={(e) => setTrackBlockCost(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Contingency</label>
                <input
                  type="number"
                  value={contingencyCost}
                  onChange={(e) => setContingencyCost(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Required Resources */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2">
              <span>4. Machinery & Crew Requirements</span>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newResourceInput}
                onChange={(e) => setNewResourceInput(e.target.value)}
                placeholder="e.g. 1x 25kV OHE Tower Wagon, 2x Linemen Crews..."
                className="flex-1 bg-navy-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddResource}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {resources.map((res, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-navy-950 border border-slate-800 text-xs text-slate-300 flex items-center space-x-2"
                >
                  <span>{res}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveResource(idx)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-bold text-xs shadow-glow-cyan flex items-center space-x-2 transition transform active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
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
