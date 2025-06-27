"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

interface User {
  _id: string;
  userId: string;
  email: string;
  fullName?: string;
  userType: "student" | "teacher";
  photo?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: {
    email: string;
    password: string;
    userType: "student" | "teacher";
  }) => Promise<void>;
  signup: (credentials: {
    email: string;
    fullName: string;
    password: string;
    userType: "teacher" | "student";
    photo?: string;
  }) => Promise<void>;
  createStudent: (credentials: {
    email: string;
    fullName: string;
    password: string;
    photo?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("StenoMaster-token");
      const user = localStorage.getItem("StenoMaster-user");
      console.log(
        "[useAuth] Initial localStorage check - token:",
        token,
        "user:",
        user
      );

      if (token && user) {
        try {
          const userData = JSON.parse(user);
          const response = await fetch("/api/auth/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          const result = await response.json();
          if (response.ok && result.status === "success") {
            setAuthState({
              isAuthenticated: true,
              user: result.data.user,
              token,
            });
            console.log("[useAuth] Session validated, user:", result.data.user);
          } else {
            localStorage.removeItem("StenoMaster-token");
            localStorage.removeItem("StenoMaster-user");
            setAuthState({ isAuthenticated: false, user: null, token: null });
            console.log("[useAuth] Invalid session, cleared localStorage");
          }
        } catch (error) {
          console.error("[useAuth] Error validating session:", error);
          localStorage.removeItem("StenoMaster-token");
          localStorage.removeItem("StenoMaster-user");
          setAuthState({ isAuthenticated: false, user: null, token: null });
        }
      } else {
        console.log("[useAuth] No token or user found in localStorage");
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    async (credentials: {
      email: string;
      password: string;
      userType: "student" | "teacher";
    }) => {
      const { email, password, userType } = credentials;

      if (!email?.trim() || !password.trim() || !userType) {
        toast({
          title: "Error",
          description: "Please enter email, password, and user type.",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, userType }),
        });

        const result = await response.json();
        if (response.ok && result.status === "success") {
          const { user, token } = result.data;
          setAuthState({ isAuthenticated: true, user, token });
          localStorage.setItem("StenoMaster-token", token);
          localStorage.setItem("StenoMaster-user", JSON.stringify(user));
          console.log("[useAuth] Login successful, user:", user);

          const dashboardPath =
            userType === "teacher"
              ? "/dashboard/teacher"
              : "/dashboard/student";
          router.push(dashboardPath);
          router.refresh();
          toast({
            title: "Welcome!",
            description: `Logged in as ${user.fullName || user.email}`,
          });
        } else {
          toast({
            title: "Error",
            description: result.message || "Login failed",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("[useAuth] Login error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred during login.",
          variant: "destructive",
        });
      }
    },
    [router]
  );

  const signup = useCallback(
    async (credentials: {
      email: string;
      fullName: string;
      password: string;
      userType: "teacher" | "student";
      photo?: string;
    }) => {
      const { email, fullName, password, userType, photo } = credentials;

      if (!email.trim() || !fullName.trim() || !password.trim() || !userType) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
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

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, fullName, password, userType, photo }),
        });

        const result = await response.json();
        if (response.ok && result.status === "success") {
          const { user, token } = result.data;
          setAuthState({ isAuthenticated: true, user, token });
          localStorage.setItem("StenoMaster-token", token);
          localStorage.setItem("StenoMaster-user", JSON.stringify(user));
          console.log("[useAuth] Signup successful, user:", user);

          const dashboardPath =
            userType === "teacher"
              ? "/dashboard/teacher"
              : "/dashboard/student";
          router.push(dashboardPath);
          router.refresh();

          toast({
            title: "Account Created!",
            description: `Welcome to StenoMaster, ${user.fullName}!`,
          });
        } else {
          toast({
            title: "Error",
            description: result.message || "Signup failed",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("[useAuth] Signup error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred during signup.",
          variant: "destructive",
        });
      }
    },
    [router]
  );

  const createStudent = useCallback(
    async (credentials: {
      email: string;
      fullName: string;
      password: string;
      photo?: string;
    }) => {
      if (
        !authState.isAuthenticated ||
        authState.user?.userType !== "teacher"
      ) {
        toast({
          title: "Error",
          description: "Only teachers can create student accounts.",
          variant: "destructive",
        });
        return;
      }

      const { email, fullName, password, photo } = credentials;

      if (!email.trim() || !fullName.trim() || !password.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
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

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authState.token}`,
          },
          body: JSON.stringify({
            email,
            fullName,
            password,
            userType: "student",
            photo,
          }),
        });

        const result = await response.json();
        if (response.ok && result.status === "success") {
          toast({
            title: "Success",
            description: `Student ${fullName} created successfully!`,
          });
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to create student",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("[useAuth] Create student error:", error);
        toast({
          title: "Error",
          description:
            "An unexpected error occurred while creating the student.",
          variant: "destructive",
        });
      }
    },
    [authState]
  );

  const logout = useCallback(async () => {
    if (!authState.isAuthenticated || !authState.user || !authState.token) {
      setAuthState({ isAuthenticated: false, user: null, token: null });
      localStorage.removeItem("StenoMaster-token");
      localStorage.removeItem("StenoMaster-user");
      router.push("/?showLogin=true");
      router.refresh();
      return;
    }

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authState.user.userId,
          token: authState.token,
        }),
      });

      if (response.ok) {
        setAuthState({ isAuthenticated: false, user: null, token: null });
        localStorage.removeItem("StenoMaster-token");
        localStorage.removeItem("StenoMaster-user");
        console.log("[useAuth] Logout successful");
        router.push("/?showLogin=true");
        router.refresh();

        toast({
          title: "Logged Out",
          description: "You have been logged out successfully.",
        });
      } else {
        const result = await response.json();
        toast({
          title: "Error",
          description: result.message || "Logout failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[useAuth] Logout error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout.",
        variant: "destructive",
      });
    }
  }, [authState, router]);

  const deleteAccount = useCallback(
    async (userId: string) => {
      if (!authState.isAuthenticated || !authState.user || !authState.token) {
        toast({
          title: "Error",
          description: "You must be logged in to delete an account.",
          variant: "destructive",
        });
        return;
      }

      if (
        authState.user.userType !== "teacher" &&
        authState.user.userId !== userId
      ) {
        toast({
          title: "Error",
          description:
            "You can only delete your own account or student accounts as a teacher.",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await fetch("/api/auth/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authState.token}`,
          },
          body: JSON.stringify({ userId, token: authState.token }),
        });

        const result = await response.json();
        if (response.ok && result.status === "success") {
          if (authState.user.userId === userId) {
            setAuthState({ isAuthenticated: false, user: null, token: null });
            localStorage.removeItem("StenoMaster-token");
            localStorage.removeItem("StenoMaster-user");
            router.push("/?showLogin=true");
            router.refresh();
            toast({
              title: "Account Deleted",
              description: "Your account has been deleted successfully.",
            });
          } else {
            toast({
              title: "Success",
              description: "Student account deleted successfully.",
            });
          }
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to delete account",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("[useAuth] Delete account error:", error);
        toast({
          title: "Error",
          description:
            "An unexpected error occurred while deleting the account.",
          variant: "destructive",
        });
      }
    },
    [authState, router]
  );

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        createStudent,
        logout,
        deleteAccount,
      }}
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
