"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { UserProfile, DepartmentId, UserRole, StandardRole, JwtTokenPayload } from "@/lib/types";
import { MOCK_USERS, MOCK_RBAC_PERSONAS } from "@/lib/mockData";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isCentralAdmin: boolean;
  isDepartmentUser: boolean;
  departmentId: DepartmentId | undefined;
  standardRole: StandardRole;
  jwtToken: string;
  jwtPayload: JwtTokenPayload;
  canApproveT806: boolean;
  canConfirmEmergency: boolean;
  hasPermission: (perm: string) => boolean;
  login: (email: string, departmentId?: DepartmentId) => boolean;
  switchUser: (emailOrId: string) => void;
  logout: () => void;
  allUsers: UserProfile[];
  rbacPersonas: typeof MOCK_RBAC_PERSONAS;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "railplan_auth_user_v2";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // If stored was the old Bhopal persona or generic OCC, migrate to Central Authority (Railway Board)
        if (parsed.role === "CENTRAL_ADMIN" || parsed.id === "USR-OCC-01" || parsed.division?.includes("Bhopal")) {
          const updated: UserProfile = {
            ...MOCK_USERS[0],
            name: "Rajesh Verma",
            role: "CENTRAL_ADMIN",
            designation: "Executive Director (Railway Board)",
            zone: "Railway Board (Central Authority)",
            division: "Central Authority (Railway Board)",
          };
          setUser(updated);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
        } else {
          setUser(parsed);
        }
      } else {
        setUser(MOCK_USERS[0]);
      }
    } catch (e) {
      setUser(MOCK_USERS[0]);
    }
    setIsLoaded(true);
  }, []);

  const persistUser = (u: UserProfile | null) => {
    setUser(u);
    try {
      if (u) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const login = (email: string, departmentId?: DepartmentId): boolean => {
    const found = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (found) {
      persistUser(found);
      return true;
    }
    return false;
  };

  const switchUser = (emailOrId: string) => {
    const found = MOCK_USERS.find(
      (u) =>
        u.email.toLowerCase() === emailOrId.toLowerCase() ||
        u.id.toLowerCase() === emailOrId.toLowerCase() ||
        u.departmentId?.toLowerCase() === emailOrId.toLowerCase()
    );
    if (found) {
      persistUser(found);
    }
  };

  const logout = () => {
    persistUser(null);
  };

  // Derive standard role from user profile
  const standardRole: StandardRole = useMemo(() => {
    if (!user) return "SECTION_ENGINEER_CIVIL";
    if (user.id === "USR-CIV-01" || user.departmentId === "ENG") {
      return "SECTION_ENGINEER_CIVIL";
    }
    if (user.id === "USR-OHE-01" || user.departmentId === "ELEC") {
      return "OHE_ENGINEER";
    }
    if (user.id === "USR-SNT-01" || user.departmentId === "SNT") {
      return "SNT_ENGINEER";
    }
    if (user.id === "USR-OCC-01" || user.departmentId === "OPS") {
      return "OCC_CHIEF_CONTROLLER";
    }
    if (user.id === "USR-SFTY-01" || user.departmentId === "SFTY") {
      return "SAFETY_OFFICER";
    }
    if (user.role === "CENTRAL_ADMIN") {
      return "ADMIN";
    }
    return "SECTION_ENGINEER_CIVIL";
  }, [user]);

  // Find permissions from RBAC personas definition
  const persona = useMemo(() => {
    return MOCK_RBAC_PERSONAS.find((p) => p.id === user?.id) || {
      permissions: user?.role === "CENTRAL_ADMIN" ? ["ALL_PERMISSIONS"] : ["CREATE_BLOCK_REQUEST"]
    };
  }, [user]);

  const hasPermission = (perm: string): boolean => {
    if (!user) return false;
    if (persona.permissions.includes("ALL_PERMISSIONS")) return true;
    return persona.permissions.includes(perm);
  };

  // RBAC Granular Permissions:
  // Only OCC Chief Controller or Safety Officer or Central Admin can approve T/806 sanctions and confirm Emergency rerouting
  const canApproveT806 = useMemo(() => {
    return (
      standardRole === "OCC_CHIEF_CONTROLLER" ||
      standardRole === "SAFETY_OFFICER" ||
      standardRole === "ADMIN"
    );
  }, [standardRole]);

  const canConfirmEmergency = useMemo(() => {
    return (
      standardRole === "OCC_CHIEF_CONTROLLER" ||
      standardRole === "SAFETY_OFFICER" ||
      standardRole === "ADMIN"
    );
  }, [standardRole]);

  // Zero-Trust simulated JWT Token & Claims
  const jwtPayload: JwtTokenPayload = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return {
      sub: user?.id || "ANONYMOUS",
      name: user?.name || "Guest Officer",
      role: standardRole,
      departmentId: user?.departmentId || "OPS",
      departmentName: user?.departmentName || "Operations Control Center",
      designation: user?.designation || "Controller",
      zone: user?.zone || "Railway Board (Central Authority)",
      division: user?.division || "Central Authority (Railway Board)",
      permissions: persona.permissions,
      iat: now - 120,
      exp: now + 3480, // valid for 1 hour
      signature: `sha256_${user?.id || "guest"}_${now.toString(16)}`,
    };
  }, [user, standardRole, persona]);

  const jwtToken = useMemo(() => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify(jwtPayload));
    const sig = "sih2026_wcr_railplan_sec_sig_hash9f4c";
    return `${header}.${payload}.${sig}`;
  }, [jwtPayload]);

  const isCentralAdmin = user?.role === "CENTRAL_ADMIN";
  const isDepartmentUser = user?.role === "DEPT_USER";
  const departmentId = user?.departmentId;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#050814] flex items-center justify-center text-[#8494FF] font-mono text-sm">
        Initializing RailPlan AI Zero-Trust Command Security...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isCentralAdmin,
        isDepartmentUser,
        departmentId,
        standardRole,
        jwtToken,
        jwtPayload,
        canApproveT806,
        canConfirmEmergency,
        hasPermission,
        login,
        switchUser,
        logout,
        allUsers: MOCK_USERS,
        rbacPersonas: MOCK_RBAC_PERSONAS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
