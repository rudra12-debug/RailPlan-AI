"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  headerBadge?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "2xl",
  headerBadge,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/80 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full ${widthClasses} z-10 bg-[#022642] border-2 border-black rounded-2xl shadow-[6px_6px_0_#000000] overflow-hidden my-auto`}
      >
        {/* IR Tri-color top strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF671F] via-[#FFFFFF] to-[#046A38]" />

        {/* Header */}
        <div className="flex items-start justify-between p-3.5 sm:p-5 border-b-2 border-black bg-[#000D18]">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-xl font-black text-white tracking-tight">{title}</h3>
              {headerBadge}
            </div>
            {subtitle && <p className="text-xs sm:text-sm text-[#CABFFF] font-medium">{subtitle}</p>}
          </div>

          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-lg text-white bg-[#022642] hover:bg-[#6367FF] border-2 border-black shadow-[2px_2px_0_#000000] transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-3.5 sm:p-6 max-h-[82vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
