"use client";

import React from "react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: any;
  color?: "cyan" | "emerald" | "amber" | "rose" | "purple" | "blue" | "orange";
  badge?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  color = "blue",
  badge,
  onClick,
}) => {
  const solidMap = {
    blue: {
      bar: "bg-[#2DC7D5]",
      iconBg: "bg-[#011526] text-[#2DC7D5]",
      valColor: "text-[#2DC7D5]",
      glow: "border-[#2DC7D5]/40",
    },
    cyan: {
      bar: "bg-[#00FFD2]",
      iconBg: "bg-[#011526] text-[#00FFD2]",
      valColor: "text-[#00FFD2]",
      glow: "border-[#00FFD2]/40",
    },
    emerald: {
      bar: "bg-[#00FFD2]",
      iconBg: "bg-[#011526] text-[#00FFD2]",
      valColor: "text-[#00FFD2]",
      glow: "border-[#00FFD2]/40",
    },
    amber: {
      bar: "bg-[#FFFF00]",
      iconBg: "bg-[#011526] text-[#FFFF00]",
      valColor: "text-[#FFFF00]",
      glow: "border-[#FFFF00]/40",
    },
    rose: {
      bar: "bg-[#FB2077]",
      iconBg: "bg-[#011526] text-[#FB2077]",
      valColor: "text-[#FB2077]",
      glow: "border-[#FB2077]/40",
    },
    purple: {
      bar: "bg-[#6367FF]",
      iconBg: "bg-[#011526] text-[#8595FF]",
      valColor: "text-[#8595FF]",
      glow: "border-[#6367FF]/40",
    },
    orange: {
      bar: "bg-[#FF671F]",
      iconBg: "bg-[#011526] text-[#FF671F]",
      valColor: "text-[#FF671F]",
      glow: "border-[#FF671F]/40",
    },
  };

  const scheme = solidMap[color] || solidMap.blue;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl bg-[#022642] border-2 border-black p-3.5 shadow-[4px_4px_0_#000000] flex flex-col justify-between transition-all duration-150 ${
        onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000000] active:translate-y-0.5 active:shadow-[1px_1px_0_#000000]"
          : ""
      }`}
    >
      {/* 100% Solid Top Color Accent Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${scheme.bar}`} />

      {/* Row 1: 3D Tactile Icon Module + Action Badges (Top Row) */}
      <div className="flex items-center justify-between pt-0.5 mb-2.5">
        <div
          className={`p-1.5 sm:p-2 rounded-lg border-2 border-black shadow-[2px_2px_0_#000000] shrink-0 ${scheme.iconBg}`}
        >
          <Icon size={18} weight="duotone" className="shrink-0 w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </div>

        <div className="flex items-center space-x-1.5 shrink-0 ml-2">
          {badge && (
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#FFFF00] text-black border border-black shadow-[1px_1px_0_#000000]">
              {badge}
            </span>
          )}
          {change && (
            <span
              className={`font-bold font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#000D18] border border-black ${
                isPositive ? "text-[#00FFD2]" : "text-[#FB2077]"
              }`}
            >
              {change}
            </span>
          )}
        </div>
      </div>

      {/* Row 2: Full Title - FULL WIDTH, NEVER BREAKS WORDS MID-WORD */}
      <div className="min-w-0 w-full mb-2">
        <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-tight text-[#CABFFF] leading-snug whitespace-normal break-normal [word-break:keep-all] [overflow-wrap:normal]">
          {title}
        </h4>
      </div>

      {/* Row 3: Dedicated Sunken Black LED Readout Bay (Full Width) */}
      <div className="w-full px-3 py-2 rounded-lg bg-[#000D18] border-2 border-black shadow-[inset_0_2px_6px_rgba(0,0,0,0.95)] flex items-center justify-between">
        <span
          className={`text-xl sm:text-2xl font-black font-mono tracking-tight leading-none ${scheme.valColor}`}
        >
          {value}
        </span>
      </div>

      {/* Row 4: Subtitle Footer */}
      {subtitle && (
        <div className="mt-2.5 pt-2 border-t-2 border-black/40">
          <p className="text-[#8595FF] text-[10px] sm:text-[11px] font-medium leading-tight whitespace-normal break-normal [word-break:keep-all]">
            {subtitle}
          </p>
        </div>
      )}
    </div>
  );
};
