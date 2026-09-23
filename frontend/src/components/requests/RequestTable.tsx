"use client";

import React, { useState, useMemo } from "react";
import { ServiceRequest, RequestStatus, RequestPriority } from "@/lib/types";
import { StatusBadge, PriorityBadge } from "@/components/common/StatusBadge";
import { formatINR } from "@/lib/formatters";
import { RequestDetailModal } from "./RequestDetailModal";
import { MagnifyingGlass, Funnel, FileText } from "@phosphor-icons/react";

interface RequestTableProps {
  requests: ServiceRequest[];
  title?: string;
  subtitle?: string;
  showActions?: boolean;
}

export const RequestTable: React.FC<RequestTableProps> = ({
  requests,
  title = "Inter-Department Service Requests",
  subtitle = "Real-time track maintenance requisitions and multi-department coordination requests",
  showActions = true,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.corridorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requestingDepartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.targetDepartment.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
      const matchesPriority = priorityFilter === "ALL" || req.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [requests, searchTerm, statusFilter, priorityFilter]);

  const handleRowClick = (req: ServiceRequest) => {
    setSelectedRequestId(req.id);
    setIsModalOpen(true);
  };

  const selectedRequest = requests.find((r) => r.id === selectedRequestId) || null;

  return (
    <>
      <div className="rounded-xl border-2 border-black bg-[#022642] shadow-[4px_4px_0_#000000] overflow-hidden">
        {/* Header and Controls */}
        <div className="p-4 sm:p-5 border-b-2 border-black bg-[#000D18] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-white text-base sm:text-lg flex items-center space-x-2">
              <FileText size={20} weight="duotone" className="text-[#00FFD2]" />
              <span>{title}</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-black bg-[#6367FF] text-white border border-black shadow-[1px_1px_0_#000000]">
                {filtered.length} Requests
              </span>
            </h3>
            {subtitle && <p className="text-xs text-[#8595FF] mt-0.5 font-medium">{subtitle}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <MagnifyingGlass size={16} weight="bold" className="text-[#CABFFF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ID, Corridor, Dept..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-[#011526] border-2 border-black rounded-lg text-xs text-white placeholder:text-[#CABFFF] font-bold focus:outline-none focus:ring-2 focus:ring-[#00FFD2] w-48 sm:w-60 shadow-[2px_2px_0_#000000]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#011526] border-2 border-black text-white text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00FFD2] shadow-[2px_2px_0_#000000]"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CLOSED">Closed</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#011526] border-2 border-black text-white text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00FFD2] shadow-[2px_2px_0_#000000]"
            >
              <option value="ALL">All Priorities</option>
              <option value="EMERGENCY">Emergency</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white">
            <thead className="bg-[#000D18] text-[11px] font-black uppercase tracking-wider text-[#CABFFF] border-b-2 border-black">
              <tr>
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-4">Requesting Dept</th>
                <th className="py-3.5 px-4">Required Service</th>
                <th className="py-3.5 px-4">Corridor & Location</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Est. Cost</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Progress</th>
                {showActions && <th className="py-3.5 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/30 bg-[#022642]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-[#CABFFF] font-bold">
                    No service requests match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => handleRowClick(req)}
                    className="hover:bg-[#033358] transition duration-100 cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-black text-[#FFFF00] whitespace-nowrap">
                      {req.id}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white">
                      <span className="px-2 py-0.5 rounded bg-[#000D18] text-[#00FFD2] border border-black font-mono font-black">
                        {req.requestingDepartment}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-[200px]">
                      <p className="font-bold text-white truncate group-hover:text-[#00FFD2] transition">
                        {req.title}
                      </p>
                      <p className="text-[10px] text-[#CABFFF] truncate">Target: {req.targetDepartment}</p>
                    </td>

                    <td className="py-3.5 px-4 max-w-[180px]">
                      <span className="font-mono text-white font-bold">{req.corridorId}</span>
                      <p className="text-[10px] text-[#8595FF] font-mono truncate">{req.locationKm}</p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={req.priority} />
                    </td>

                    <td className="py-3.5 px-4 font-mono font-black text-white whitespace-nowrap">
                      {formatINR(req.estimatedCost)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="w-20 mx-auto bg-[#000D18] h-2.5 rounded-full overflow-hidden border border-black">
                        <div
                          className="bg-[#00FFD2] h-full rounded-full transition-all"
                          style={{ width: `${req.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#CABFFF] font-mono font-bold mt-0.5 inline-block">
                        {req.progress}%
                      </span>
                    </td>

                    {showActions && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(req);
                          }}
                          className="btn-tactile px-3 py-1.5 rounded-lg bg-[#6367FF] text-white text-[11px] font-black cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Detail Modal */}
      <RequestDetailModal
        request={selectedRequest}
        isOpen={isModalOpen && selectedRequest !== null}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequestId(null);
        }}
      />
    </>
  );
};
