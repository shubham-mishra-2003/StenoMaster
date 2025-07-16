"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "@/hooks/use-toast";

interface User {
  _id: string;
  userId: string;
  email: string;
  fullName?: string;
  userType: "student" | "teacher";
  photo?: string;
  teacherId?: string;
  classId?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  students?: User[];
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
  }) => Promise<User>;
  logout: () => Promise<void>;
  deleteAccount: (userId: string) => Promise<void>;
  validate: () => Promise<void>;
  fetchStudent: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
  });
  const router = useRouter();
  const pathname = usePathname();

  const validate = useCallback(async () => {
    const token = localStorage.getItem("StenoMaster-token");
    const protectedRoutes = ["/dashboard/student", "/dashboard/teacher"];
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // console.log("[useAuth] Validating for route:", pathname, "Token:", !!token);

    if (!token || typeof token !== "string" || token.trim() === "") {
      // console.log("[useAuth] No valid token found");
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      }));
      if (isProtectedRoute) {
        // console.log(
        //   "[useAuth] Redirecting to /?showLogin=true from protected route"
        // );
        localStorage.removeItem("StenoMaster-token");
        localStorage.removeItem("StenoMaster-user");
        router.push("/");
      }
      return;
    }

    setAuthState((prev) => ({ ...prev, loading: true }));
    const maxRetries = 3;
    let attempt = 1;

    while (attempt <= maxRetries) {
      try {
        const response = await fetch("/api/auth/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          signal: AbortSignal.timeout(10000),
        });

        const text = await response.text();
        const result = text
          ? JSON.parse(text)
          : { status: "error", message: "Empty response from server" };

        if (response.ok && result.status === "success") {
          setAuthState({
            isAuthenticated: true,
            user: result.data.user,
            token,
            loading: false,
          });
          localStorage.setItem(
            "StenoMaster-user",
            JSON.stringify(result.data.user)
          );
          return;
        } else {
          throw new Error(result.message || "Failed to validate session");
        }
      } catch (error: any) {
        if (attempt === maxRetries) {
          setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
          });
          localStorage.removeItem("StenoMaster-token");
          localStorage.removeItem("StenoMaster-user");
          if (isProtectedRoute) {
            // console.log(
            //   "[useAuth] Validation failed, redirecting to /?showLogin=true"
            // );
            router.push("/");
          }
          return;
        }
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }, [router, pathname]);

  useEffect(() => {
    // console.log("[useAuth] useEffect triggered for pathname:", pathname);
    validate();
  }, [validate, pathname]);

  const login = useCallback(
    async (credentials: {
      email: string;
      password: string;
      userType: "student" | "teacher";
    }) => {
      setAuthState((prev) => ({ ...prev, loading: true }));
      const { email, password, userType } = credentials;

      if (!email?.trim() || !password.trim() || !userType) {
        toast({
          title: "Error",
          description: "Please enter email, password, and user type.",
          variant: "destructive",
        });
        setAuthState((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, userType }),
          signal: AbortSignal.timeout(10000),
        });

        const text = await response.text();
        // console.log("[useAuth] Login response body:", text);
        const result = text
          ? JSON.parse(text)
          : { status: "error", message: "Empty response from server" };

        if (response.ok && result.status === "success") {
          const { user, token } = result.data;
          setAuthState({ isAuthenticated: true, user, token, loading: false });
          localStorage.setItem("StenoMaster-token", token);
          localStorage.setItem("StenoMaster-user", JSON.stringify(user));
          // console.log("[useAuth] Login successful, user:", user);

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
          setAuthState((prev) => ({ ...prev, loading: false }));
        }
      } catch (error) {
        // console.error("[useAuth] Login error:", error);
        setAuthState((prev) => ({ ...prev, loading: false }));
        return;
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
      setAuthState((prev) => ({ ...prev, loading: true }));
      const { email, fullName, password, userType, photo } = credentials;

      if (!email.trim() || !fullName.trim() || !password.trim() || !userType) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setAuthState((prev) => ({ ...prev, loading: false }));
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters long.",
          variant: "destructive",
        });
        setAuthState((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, fullName, password, userType, photo }),
          signal: AbortSignal.timeout(10000),
        });

        const text = await response.text();
        // console.log("[useAuth] Signup response body:", text);
        const result = text
          ? JSON.parse(text)
          : { status: "error", message: "Empty response from server" };

        if (response.ok && result.status === "success") {
          const { user, token } = result.data;
          setAuthState({ isAuthenticated: true, user, token, loading: false });
          localStorage.setItem("StenoMaster-token", token);
          localStorage.setItem("StenoMaster-user", JSON.stringify(user));
          // console.log("[useAuth] Signup successful, user:", user);

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
          // toast({
          //   title: "Error",
          //   description: result.message || "Signup failed",
          //   variant: "destructive",
          // });
          setAuthState((prev) => ({ ...prev, loading: false }));
        }
      } catch (error) {
        // console.error("[useAuth] Signup error:", error);
        setAuthState((prev) => ({ ...prev, loading: false }));
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
      setAuthState((prev) => ({ ...prev, loading: true }));
      if (
        !authState.isAuthenticated ||
        authState.user?.userType !== "teacher"
      ) {
        toast({
          title: "Error",
          description: "Only teachers can create student accounts.",
          variant: "destructive",
        });
        setAuthState((prev) => ({ ...prev, loading: false }));
        throw new Error("Only teachers can create student accounts.");
      }

      const { email, fullName, password, photo } = credentials;

      if (!email.trim() || !fullName.trim() || !password.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setAuthState((prev) => ({ ...prev, loading: false }));
        throw new Error("Please fill in all required fields.");
      }

      if (password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters long.",
          variant: "destructive",
        });
        setAuthState((prev) => ({ ...prev, loading: false }));
        throw new Error("Password must be at least 6 characters long.");
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
            teacherId: authState.user?.userId,
          }),
          signal: AbortSignal.timeout(10000),
        });

        const text = await response.text();
        // console.log("[useAuth] Create student response body:", text);
        const result = text
          ? JSON.parse(text)
          : { status: "error", message: "Empty response from server" };

        if (response.ok && result.status === "success") {
          const { user } = result.data;
          toast({
            title: "Success",
            description: `Student ${fullName} created successfully!`,
          });
          setAuthState((prev) => ({ ...prev, loading: false }));
          return user as User;
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to create student",
            variant: "destructive",
          });
          setAuthState((prev) => ({ ...prev, loading: false }));
          throw new Error(result.message || "Failed to create student");
        }
      } catch (error) {
        // console.error("[useAuth] Create student error:", error);
        toast({
          title: "Error",
          description:
            "An unexpected error occurred while creating the student.",
          variant: "destructive",
        });
        setAuthState((prev) => ({ ...prev, loading: false }));
        throw error;
      }
    },
    [authState]
  );

  const logout = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    if (!authState.isAuthenticated || !authState.user || !authState.token) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      });
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
        signal: AbortSignal.timeout(10000),
      });

      const text = await response.text();
      // console.log("[useAuth] Logout response body:", text);
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Empty response from server" };

      if (response.ok) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
        });
        localStorage.removeItem("StenoMaster-token");
        localStorage.removeItem("StenoMaster-user");
        // console.log("[useAuth] Logout successful");
        router.push("/?showLogin=true");
        router.refresh();

        toast({
          title: "Logged Out",
          description: "You have been logged out successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Logout failed",
          variant: "destructive",
        });
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      // console.error("[useAuth] Logout error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout.",
        variant: "destructive",
      });
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  }, [authState, router]);

  const deleteAccount = useCallback(
    async (userId: string) => {
      setAuthState((prev) => ({ ...prev, loading: true }));
      if (!authState.isAuthenticated || !authState.user || !authState.token) {
        setAuthState((prev) => ({ ...prev, loading: false }));
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
        setAuthState((prev) => ({ ...prev, loading: false }));
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
          signal: AbortSignal.timeout(10000),
        });

        const text = await response.text();
        // console.log("[useAuth] Delete account response body:", text);
        const result = text
          ? JSON.parse(text)
          : { status: "error", message: "Empty response from server" };

        if (response.ok && result.status === "success") {
          if (authState.user.userId === userId) {
            setAuthState({
              isAuthenticated: false,
              user: null,
              token: null,
              loading: false,
            });
            localStorage.removeItem("StenoMaster-token");
            localStorage.removeItem("StenoMaster-user");
            router.push("/");
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
            setAuthState((prev) => ({ ...prev, loading: false }));
          }
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to delete account",
            variant: "destructive",
          });
          setAuthState((prev) => ({ ...prev, loading: false }));
        }
      } catch (error) {
        // console.error("[useAuth] Delete account error:", error);
        // toast({
        //   title: "Error",
        //   description:
        //     "An unexpected error occurred while deleting the account.",
        //   variant: "destructive",
        // });
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    },
    [authState, router]
  );

  const fetchStudent = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    if (!authState.isAuthenticated || authState.user?.userType !== "teacher") {
      toast({
        title: "Error",
        description: "Only teachers can fetch student accounts.",
        variant: "destructive",
      });
      setAuthState((prev) => ({ ...prev, loading: false }));
      throw new Error("Only teachers can fetch student accounts.");
    }

    try {
      const response = await fetch("/api/auth/fetch-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teacherId: authState.user?.userId }),
        signal: AbortSignal.timeout(10000),
      });

      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Empty response from server" };

      if (response.ok && result.status === "success") {
        const students = result.data.students as User[];
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          students,
        }));
        return students;
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch students",
          variant: "destructive",
        });
        setAuthState((prev) => ({ ...prev, loading: false }));
        throw new Error(result.message || "Failed to fetch students");
      }
    } catch (error) {
      setAuthState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  }, [authState]);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        createStudent,
        logout,
        deleteAccount,
        validate,
        fetchStudent,
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
