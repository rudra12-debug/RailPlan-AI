"use client";

import React from "react";
import { Bell, CheckCircle2, AlertTriangle, AlertOctagon, X, ArrowUpRight } from "lucide-react";
import { NotificationItem } from "@/lib/types";
import Link from "next/link";

interface LiveSyncToastProps {
  toast: NotificationItem | null;
  onClose: () => void;
}

export const LiveSyncToast: React.FC<LiveSyncToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case "CRITICAL":
        return <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />;
      case "WARNING":
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case "SUCCESS":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case "INFO":
      default:
        return <Bell className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
  };

  const getBorder = () => {
    switch (toast.type) {
      case "CRITICAL":
        return "border-rose-500/60 bg-gradient-to-r from-rose-950/90 to-navy-950/90 shadow-glow-rose";
      case "WARNING":
        return "border-amber-500/60 bg-gradient-to-r from-amber-950/90 to-navy-950/90 shadow-glow-amber";
      case "SUCCESS":
        return "border-emerald-500/60 bg-gradient-to-r from-emerald-950/90 to-navy-950/90 shadow-glow-emerald";
      case "INFO":
      default:
        return "border-cyan-500/60 bg-gradient-to-r from-cyan-950/90 to-navy-950/90 shadow-glow-cyan";
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-bounce-short">
      <div
        className={`p-4 rounded-2xl border backdrop-blur-md flex items-start space-x-3.5 shadow-2xl transition-all ${getBorder()}`}
      >
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-500/30 uppercase">
                {toast.departmentId === "ALL" ? "Global Alert" : `${toast.departmentId} Order`}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-100 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h4 className="text-xs font-bold text-slate-100">{toast.title}</h4>
          <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">{toast.message}</p>

          {toast.linkHref && (
            <div className="pt-1">
              <Link
                href={toast.linkHref}
                onClick={onClose}
                className="inline-flex items-center text-[11px] font-bold text-amber-300 hover:text-amber-200 space-x-1 underline underline-offset-2"
              >
                <span>View Action in Roster</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
