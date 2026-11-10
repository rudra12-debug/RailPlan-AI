"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { Sun, Moon } from "@phosphor-icons/react";

interface ThemeSwitcherProps {
  compact?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ compact = false }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Day Mode" : "Switch to Night Mode"}
      title={isDark ? "Switch to Day Mode (Light Theme)" : "Switch to Night Mode (Dark OCC Theme)"}
      className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#022642] hover:bg-[#033358] border-2 border-black text-[#00FFD2] shadow-[2px_2px_0_#000000] active:translate-y-0.5 active:shadow-none transition shrink-0 cursor-pointer flex items-center space-x-1.5 select-none"
    >
      {isDark ? (
        <Sun size={17} weight="fill" className="text-[#FFFF00] animate-spin-slow shrink-0" />
      ) : (
        <Moon size={17} weight="fill" className="text-[#6367FF] shrink-0" />
      )}
      {!compact && (
        <span className="font-mono text-[11px] font-black uppercase text-white tracking-wider hidden sm:inline">
          {isDark ? t("header.dayMode", "Day") : t("header.nightMode", "Night")}
        </span>
      )}
    </button>
  );
};
