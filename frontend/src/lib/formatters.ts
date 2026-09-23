import { RequestStatus, RequestPriority, RiskLevel } from "./types";

export function formatINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)} K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatFullINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIST(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) + ' IST';
  } catch {
    return dateStr;
  }
}

export function getStatusBadgeStyle(status: RequestStatus): { bg: string; text: string; border: string; glow?: string } {
  switch (status) {
    case 'DRAFT':
      return { bg: 'bg-[#02395D]', text: 'text-white font-black', border: 'border-black shadow-[1px_1px_0_#000000]' };
    case 'SUBMITTED':
      return { bg: 'bg-[#2DC7D5]', text: 'text-black font-black', border: 'border-black shadow-[1px_1px_0_#000000]' };
    case 'UNDER_REVIEW':
      return { bg: 'bg-[#FFFF00]', text: 'text-black font-black', border: 'border-black shadow-[1px_1px_0_#000000]' };
    case 'CENTRAL_APPROVAL':
      return { bg: 'bg-[#6367FF]', text: 'text-white font-black', border: 'border-black shadow-[1px_1px_0_#000000]' };
    case 'APPROVED':
      return { bg: 'bg-[#00FFD2]', text: 'text-black font-black', border: 'border-black shadow-[1px_1px_0_#000000]' };
    case 'REJECTED':
      return { bg: 'bg-[#FF1818]', text: 'text-white font-black', border: 'border-black shadow-[1px_1px_0_#000000]' };
    case 'ASSIGNED':
      return { bg: 'bg-[#2DC7D5]', text: 'text-black font-black', border: 'border-black shadow-[1px_1px_0_#000000]' };
    case 'IN_PROGRESS':
      return { bg: 'bg-[#FFFF00]', text: 'text-black font-black', border: 'border-black shadow-[1px_1px_0_#000000]' };
    case 'COMPLETED':
      return { bg: 'bg-[#00FFD2]', text: 'text-black font-black', border: 'border-black shadow-[1px_1px_0_#000000]' };
    case 'VERIFIED':
      return { bg: 'bg-[#00FFD2]', text: 'text-black font-black', border: 'border-black shadow-[1px_1px_0_#000000]' };
    case 'CLOSED':
      return { bg: 'bg-[#02395D]', text: 'text-white font-black', border: 'border-black shadow-[1px_1px_0_#000000]' };
    default:
      return { bg: 'bg-[#022642]', text: 'text-white font-black', border: 'border-black shadow-[1px_1px_0_#000000]' };
  }
}

export function getPriorityBadgeStyle(priority: RequestPriority): { bg: string; text: string; border: string; dot: string } {
  switch (priority) {
    case 'LOW':
      return { bg: 'bg-[#02395D]', text: 'text-white font-black', border: 'border-black shadow-[1px_1px_0_#000000]', dot: 'bg-white' };
    case 'MEDIUM':
      return { bg: 'bg-[#2DC7D5]', text: 'text-black font-black', border: 'border-black shadow-[1px_1px_0_#000000]', dot: 'bg-black' };
    case 'HIGH':
      return { bg: 'bg-[#FFFF00]', text: 'text-black font-black', border: 'border-black shadow-[1px_1px_0_#000000]', dot: 'bg-black' };
    case 'CRITICAL':
      return { bg: 'bg-[#FF1818]', text: 'text-white font-black', border: 'border-black shadow-[1px_1px_0_#000000]', dot: 'bg-white animate-pulse' };
    case 'EMERGENCY':
      return { bg: 'bg-[#FB2077]', text: 'text-white font-black', border: 'border-black shadow-[1px_1px_0_#000000]', dot: 'bg-[#FFFF00] animate-ping' };
    default:
      return { bg: 'bg-[#022642]', text: 'text-white font-black', border: 'border-black shadow-[1px_1px_0_#000000]', dot: 'bg-white' };
  }
}

export function getRiskLevelColor(risk: RiskLevel | number): { color: string; label: string; hex: string } {
  if (typeof risk === 'number') {
    if (risk >= 80) return { color: 'text-white bg-[#FF1818] border-2 border-black shadow-[1px_1px_0_#000000]', label: 'CRITICAL', hex: '#FF1818' };
    if (risk >= 60) return { color: 'text-black bg-[#FB2077] border-2 border-black shadow-[1px_1px_0_#000000]', label: 'MED RISK', hex: '#FB2077' };
    if (risk >= 35) return { color: 'text-black bg-[#FFFF00] border-2 border-black shadow-[1px_1px_0_#000000]', label: 'ATTENTION', hex: '#FFFF00' };
    return { color: 'text-black bg-[#00FFD2] border-2 border-black shadow-[1px_1px_0_#000000]', label: 'NORMAL', hex: '#00FFD2' };
  }

  switch (risk) {
    case 'CRITICAL':
      return { color: 'text-white bg-[#FF1818] border-2 border-black shadow-[1px_1px_0_#000000]', label: 'CRITICAL', hex: '#FF1818' };
    case 'MEDIUM_RISK':
      return { color: 'text-black bg-[#FB2077] border-2 border-black shadow-[1px_1px_0_#000000]', label: 'MED RISK', hex: '#FB2077' };
    case 'ATTENTION':
      return { color: 'text-black bg-[#FFFF00] border-2 border-black shadow-[1px_1px_0_#000000]', label: 'ATTENTION', hex: '#FFFF00' };
    case 'PLANNED':
      return { color: 'text-black bg-[#2DC7D5] border-2 border-black shadow-[1px_1px_0_#000000]', label: 'PLANNED', hex: '#2DC7D5' };
    case 'NORMAL':
    default:
      return { color: 'text-black bg-[#00FFD2] border-2 border-black shadow-[1px_1px_0_#000000]', label: 'NORMAL', hex: '#00FFD2' };
  }
}
