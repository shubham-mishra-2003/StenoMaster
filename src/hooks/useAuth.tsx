"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { User, AuthState } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

interface AuthContextType extends AuthState {
  login: (credentials: {
    id?: string;
    email?: string;
    password: string;
    type: "student" | "teacher";
  }) => void;
  signup: (credentials: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => void;
  logout: () => void;
  user: User | null;
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

  // Initialize auth state from cookie
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const savedUser = getCookie("StenoMaster-user");
    console.log(
      "[useAuth] Initial cookie check - StenoMaster-user:",
      savedUser
    );
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({ isAuthenticated: true, user });
        console.log("[useAuth] User loaded from cookie:", user);
      } catch (error) {
        console.log(
          "[useAuth] Error parsing cookie, clearing it. Error:",
          error
        );
        document.cookie = "StenoMaster-user=; Max-Age=0; path=/";
      }
    } else {
      console.log(
        "[useAuth] No StenoMaster-user cookie found on initialization"
      );
    }
  }, []);

  const login = useCallback(
    (credentials: {
      id?: string;
      email?: string;
      password: string;
      type: "student" | "teacher";
    }) => {
      const { id, email, password, type } = credentials;

      if (type === "student" && (!id?.trim() || !password.trim())) {
        toast({
          title: "Error",
          description: "Please enter both Student ID and password.",
          variant: "destructive",
        });
        return;
      }

      if (type === "teacher" && (!email?.trim() || !password.trim())) {
        toast({
          title: "Error",
          description: "Please enter both email and password.",
          variant: "destructive",
        });
        return;
      }

      // Mock authentication
      const user: User = {
        id: type === "student" ? id! : email!,
        name: type === "student" ? `Student ${id}` : `Teacher`,
        email: type === "student" ? `${id}@student.StenoMaster.com` : email!,
        type,
      };

      setAuthState({ isAuthenticated: true, user });
      const cookieValue = JSON.stringify(user);
      document.cookie = `StenoMaster-user=${cookieValue}; Max-Age=${
        7 * 24 * 60 * 60
      }; path=/; SameSite=Lax`;
      console.log(
        "[useAuth] Set cookie on login:",
        `StenoMaster-user=${cookieValue}`
      );

      const dashboardPath =
        type === "teacher" ? "/dashboard/teacher" : "/dashboard/student";
      router.push(dashboardPath);
      router.refresh();

      toast({
        title: "Welcome!",
        description: `Logged in as ${user.name}`,
      });
    },
    [router]
  );

  const signup = useCallback(
    (credentials: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) => {
      const { name, email, password, confirmPassword } = credentials;

      if (
        !name.trim() ||
        !email.trim() ||
        !password.trim() ||
        !confirmPassword.trim()
      ) {
        toast({
          title: "Error",
          description: "Please fill in all fields.",
          variant: "destructive",
        });
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match.",
          variant: "destructive",
        });
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters long.",
          variant: "destructive",
        });
        return;
      }

      // Mock signup
      const user: User = {
        id: email,
        name,
        email,
        type: "teacher",
      };

      setAuthState({ isAuthenticated: true, user });
      const cookieValue = JSON.stringify(user);
      document.cookie = `StenoMaster-user=${cookieValue}; Max-Age=${
        7 * 24 * 60 * 60
      }; path=/; SameSite=Lax`;
      console.log(
        "[useAuth] Set cookie on signup:",
        `StenoMaster-user=${cookieValue}`
      );

      router.push("/dashboard/teacher");
      router.refresh();

      toast({
        title: "Account Created!",
        description: `Welcome to StenoMaster, ${user.name}!`,
      });
    },
    [router]
  );

  const logout = useCallback(() => {
    setAuthState({ isAuthenticated: false, user: null });
    document.cookie = "StenoMaster-user=; Max-Age=0; path=/; SameSite=Lax";
    console.log("[useAuth] Cleared cookie on logout");
    router.push("/?showLogin=true");
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ ...authState, login, signup, logout, user: authState.user }}
    >
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
