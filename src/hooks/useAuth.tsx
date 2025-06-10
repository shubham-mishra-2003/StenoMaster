import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "@/types";

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

  useEffect(() => {
    const savedUser = localStorage.getItem("StenoMaster-user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setAuthState({ isAuthenticated: true, user });
    }
  }, []);

  const login = (user: User) => {
    setAuthState({ isAuthenticated: true, user });
    localStorage.setItem("StenoMaster-user", JSON.stringify(user));
  };

  const logout = () => {
    setAuthState({ isAuthenticated: false, user: null });
    localStorage.removeItem("StenoMaster-user");
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
