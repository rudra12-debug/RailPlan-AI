"use client";

import React from "react";
import { RequestStatus, RequestPriority, RiskLevel } from "@/lib/types";
import { getStatusBadgeStyle, getPriorityBadgeStyle, getRiskLevelColor } from "@/lib/formatters";

export const StatusBadge: React.FC<{ status: RequestStatus; className?: string }> = ({ status, className = "" }) => {
  const style = getStatusBadgeStyle(status);
  const formattedLabel = status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border} ${style.glow || ''} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {formattedLabel}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: RequestPriority; className?: string }> = ({ priority, className = "" }) => {
  const style = getPriorityBadgeStyle(priority);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full mr-1.5 ${style.dot}`} />
      {priority}
    </span>
  );
};

export const RiskBadge: React.FC<{ risk: RiskLevel | number; className?: string; compact?: boolean }> = ({ risk, className = "", compact = false }) => {
  const { color, label } = getRiskLevelColor(risk);
  const displayLabel = typeof risk === 'number'
    ? (compact ? `${risk}%` : `${risk}% ${label}`)
    : label;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold font-mono uppercase tracking-wider border whitespace-nowrap shrink-0 ${color} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse shrink-0" />
      <span>{displayLabel}</span>
    </span>
  );
};
