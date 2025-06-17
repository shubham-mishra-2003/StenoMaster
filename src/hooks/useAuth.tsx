"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "@/types";
import { useRouter } from "next/navigation";

interface AuthContextType extends AuthState {
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });
  const router = useRouter();

  useEffect(() => {
    // Check for cookie on mount
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const savedUser = getCookie("StenoMaster-user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({ isAuthenticated: true, user });
      } catch {
        // Invalid cookie, clear it
        document.cookie = "StenoMaster-user=; Max-Age=0; path=/";
      }
    }
  }, []);

  const login = (user: User) => {
    setAuthState({ isAuthenticated: true, user });
    // Set cookie with 7-day expiry
    const cookieValue = JSON.stringify(user);
    document.cookie = `StenoMaster-user=${cookieValue}; Max-Age=${
      7 * 24 * 60 * 60
    }; path=/; SameSite=Strict`;
    // Redirect to appropriate dashboard
    const dashboardPath =
      user.type === "teacher" ? "/dashboard/teacher" : "/dashboard/student";
    router.push(dashboardPath);
  };

  const logout = () => {
    setAuthState({ isAuthenticated: false, user: null });
    document.cookie = "StenoMaster-user=; Max-Age=0; path=/";
    router.push("/?showLogin=true");
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
