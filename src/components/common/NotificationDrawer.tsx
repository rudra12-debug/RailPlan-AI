"use client";

import React, { useState } from "react";
import { X, Bell, CheckCircle, Warning, WarningOctagon, Info, Check } from "@phosphor-icons/react";
import { useRailPlan } from "@/context/RailPlanContext";
import { NotificationItem } from "@/lib/types";
import Link from "next/link";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useRailPlan();
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "CRITICAL">("ALL");

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.read;
    if (filter === "CRITICAL") return n.type === "CRITICAL" || n.type === "WARNING";
    return true;
  });

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "CRITICAL":
        return <WarningOctagon size={18} weight="duotone" className="text-[#FF2A6D]" />;
      case "WARNING":
        return <Warning size={18} weight="duotone" className="text-[#FFD600]" />;
      case "SUCCESS":
        return <CheckCircle size={18} weight="duotone" className="text-[#3DFDCE]" />;
      case "INFO":
      default:
        return <Info size={18} weight="duotone" className="text-[#00FFE0]" />;
    }
  };

  const getBorderColor = (type: NotificationItem["type"], read: boolean) => {
    if (read) return "border-[#1A274E] bg-[#050814]/60 opacity-70";
    switch (type) {
      case "CRITICAL":
        return "border-[#FF2A6D]/50 bg-[#FF2A6D]/10";
      case "WARNING":
        return "border-[#FFD600]/50 bg-[#FFD600]/10";
      case "SUCCESS":
        return "border-[#3DFDCE]/50 bg-[#3DFDCE]/10";
      case "INFO":
      default:
        return "border-[#00FFE0]/50 bg-[#00FFE0]/10";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-[#0C1326] border-l border-[#1A274E] shadow-2xl flex flex-col z-10 animate-slide-left">
        {/* Header */}
        <div className="p-5 border-b border-[#1A274E] bg-[#050814] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-[#6367FF]/15 text-[#8494FF] border border-[#6367FF]/30">
              <Bell size={20} weight="duotone" />
            </div>
            <div>
              <h3 className="font-bold text-[#F8FAFC] text-lg">Central Notification Feed</h3>
              <p className="text-xs text-[#8494FF]">Live railway operational & maintenance alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Notification Drawer"
            className="p-1.5 rounded-lg text-[#B6BFFF] hover:text-[#F8FAFC] hover:bg-[#131E3D] transition"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Filter bar & Mark all read */}
        <div className="px-5 py-3 border-b border-[#1A274E] bg-[#0C1326] flex items-center justify-between text-xs">
          <div className="flex space-x-1.5 bg-[#050814] p-1 rounded-lg border border-[#1A274E]">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filter === "ALL" ? "bg-[#131E3D] text-[#8494FF] border border-[#6367FF]/50 font-bold" : "text-[#B6BFFF] hover:text-[#F8FAFC]"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("UNREAD")}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filter === "UNREAD" ? "bg-[#131E3D] text-[#8494FF] border border-[#6367FF]/50 font-bold" : "text-[#B6BFFF] hover:text-[#F8FAFC]"
              }`}
            >
              Unread ({notifications.filter((n) => !n.read).length})
            </button>
            <button
              onClick={() => setFilter("CRITICAL")}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filter === "CRITICAL" ? "bg-[#FF2A6D]/20 text-[#FF2A6D] border border-[#FF2A6D]/40 font-bold" : "text-[#B6BFFF] hover:text-[#F8FAFC]"
              }`}
            >
              Alerts
            </button>
          </div>

          <button
            onClick={markAllNotificationsRead}
            className="flex items-center space-x-1 text-[#8494FF] hover:text-[#00FFE0] transition font-medium"
          >
            <Check size={14} weight="bold" />
            <span>Mark read</span>
          </button>
        </div>

        {/* List of notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 text-[#8494FF]">
              <Bell size={40} weight="duotone" className="mx-auto mb-2 opacity-30 text-[#B6BFFF]" />
              <p className="text-sm">No notifications found in this view</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-3.5 rounded-xl border transition duration-200 hover:border-[#6367FF]/50 cursor-pointer ${getBorderColor(
                  notif.type,
                  notif.read
                )}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <h4 className="text-sm font-semibold text-[#F8FAFC] truncate">{notif.title}</h4>
                        {notif.departmentId && notif.departmentId !== "ALL" && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FFD600]/15 text-[#FFD600] border border-[#FFD600]/30 uppercase shrink-0">
                            {notif.departmentId} Order
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#8494FF] whitespace-nowrap font-mono">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-[#B6BFFF] line-clamp-3 leading-relaxed">{notif.message}</p>

                    {notif.linkHref && (
                      <div className="mt-2">
                        <Link
                          href={notif.linkHref}
                          onClick={onClose}
                          className="inline-flex items-center text-xs font-semibold text-[#00FFE0] hover:text-[#3DFDCE] underline underline-offset-2"
                        >
                          View Action Item ➔
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
