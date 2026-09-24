"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";
export type ModeOverride = "auto" | "mobile" | "desktop";

interface DeviceContextType {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  modeOverride: ModeOverride;
  setModeOverride: (mode: ModeOverride) => void;
  toggleDeviceMode: () => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [modeOverride, setModeOverride] = useState<ModeOverride>("auto");

  useEffect(() => {
    const checkDevice = () => {
      if (typeof window === "undefined") return;

      const width = window.innerWidth;
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);

      // Check User Agent as supplementary signal for mobile phones
      const ua = navigator.userAgent || "";
      const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const isTabletUA = /iPad|Tablet/i.test(ua);

      if (width < 768 || (isMobileUA && width < 900)) {
        setDeviceType("mobile");
      } else if (width >= 768 && width < 1024) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    window.addEventListener("orientationchange", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("orientationchange", checkDevice);
    };
  }, []);

  // Compute effective flags based on auto detection or manual user override
  const effectiveType: DeviceType =
    modeOverride === "auto" ? deviceType : modeOverride === "mobile" ? "mobile" : "desktop";

  const isMobile = effectiveType === "mobile";
  const isTablet = effectiveType === "tablet";
  const isDesktop = effectiveType === "desktop";

  const toggleDeviceMode = () => {
    setModeOverride((prev) => {
      if (prev === "auto") {
        return isMobile ? "desktop" : "mobile";
      } else if (prev === "mobile") {
        return "desktop";
      } else {
        return "auto";
      }
    });
  };

  return (
    <DeviceContext.Provider
      value={{
        deviceType: effectiveType,
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        modeOverride,
        setModeOverride,
        toggleDeviceMode,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error("useDevice must be used within a DeviceProvider");
  }
  return context;
};
