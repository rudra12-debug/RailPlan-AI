"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageCode } from "@/lib/translations";
import { GlobeHemisphereEast, CaretDown, CheckCircle, X, Translate } from "@phosphor-icons/react";

interface LanguageSwitcherProps {
  compact?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false }) => {
  const { language, setLanguage, currentLanguage, supportedLanguages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative shrink-0 select-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Display Language"
        title="Change Display Language (भाषा बदलें)"
        className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-[#022642] border-2 border-black shadow-[2px_2px_0_#000000] hover:bg-[#033358] transition-all text-xs font-bold text-white cursor-pointer active:translate-y-0.5 active:shadow-none shrink-0"
      >
        <GlobeHemisphereEast size={16} weight="duotone" className="text-[#00FFD2] shrink-0" />
        <span className="font-mono font-black text-white uppercase hidden sm:inline">
          {currentLanguage.code.toUpperCase()}
        </span>
        <span className="font-bold text-[#00FFD2] text-[11px] max-w-[65px] truncate">
          {currentLanguage.nativeLabel}
        </span>
        <CaretDown
          size={13}
          weight="bold"
          className={`text-[#CABFFF] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px]"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] rounded-xl bg-[#011526] border-2 border-black shadow-[6px_6px_0_#000000] z-50 overflow-hidden animate-slide-down">
            {/* Header */}
            <div className="p-3 bg-[#000D18] border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Translate size={16} weight="duotone" className="text-[#00FFD2]" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  {t("header.selectLanguage", "Select Language")}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                aria-label="Close"
              >
                <X size={14} weight="bold" />
              </button>
            </div>

            {/* List of Languages */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1.5">
              {supportedLanguages.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between border-2 transition cursor-pointer ${
                      isSelected
                        ? "bg-[#6367FF] text-white border-black shadow-[2px_2px_0_#000000]"
                        : "bg-[#022642] text-[#CABFFF] border-black/50 hover:bg-[#033358] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-xs border border-black shrink-0 ${
                          isSelected
                            ? "bg-[#000D18] text-[#00FFD2]"
                            : "bg-[#000D18] text-white"
                        }`}
                      >
                        {lang.code.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-black text-white leading-tight">
                            {lang.nativeLabel}
                          </p>
                          <span className="text-[11px] text-[#CABFFF] font-medium">
                            ({lang.label})
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8595FF] truncate font-sans">
                          {lang.region}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle size={18} weight="fill" className="text-[#00FFD2] shrink-0 ml-1.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer note */}
            <div className="p-2.5 bg-[#000D18] border-t-2 border-black text-center">
              <p className="text-[10px] text-[#00FFD2] font-mono font-bold">
                Official Indian Railways Multi-Lingual Console
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
