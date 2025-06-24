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
import { useSignIn, useSignUp, useSession } from "@clerk/nextjs";

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
  const {
    signIn,
    isLoaded: isSignInLoaded,
    setActive: setActiveSessionLogin,
  } = useSignIn();
  const {
    signUp,
    isLoaded: isSignUpLoaded,
    setActive: setActiveSessionSignup,
  } = useSignUp();
  const { session } = useSession();

  // Initialize auth state from Clerk session
  useEffect(() => {
    if (session) {
      const clerkUser = session.user;
      const user: User = {
        id: clerkUser.id,
        name:
          clerkUser.fullName ||
          clerkUser.emailAddresses[0]?.emailAddress.split("@")[0] ||
          "User",
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        type:
          clerkUser.publicMetadata.role === "teacher" ? "teacher" : "student",
      };
      setAuthState({ isAuthenticated: true, user });
      console.log("[useAuth] User loaded from Clerk session:", user);
    } else {
      console.log("[useAuth] No active Clerk session found on initialization");
    }
  }, [session]);

  const login = useCallback(
    async (credentials: {
      id?: string;
      email?: string;
      password: string;
      type: "student" | "teacher";
    }) => {
      if (!isSignInLoaded) {
        console.log("[useAuth] SignIn not loaded yet");
        return;
      }

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

      const loginEmail =
        type === "student" ? `${id}@student.stenomaster.com` : email!;

      try {
        const signInAttempt = await signIn.create({
          identifier: loginEmail,
          password,
          strategy: "password",
        });

        if (signInAttempt.status === "complete") {
          await setActiveSessionLogin({
            session: signInAttempt.createdSessionId,
          });
          const user: User = {
            id: loginEmail,
            name: type === "student" ? `Student ${id}` : `Teacher`,
            email: loginEmail,
            type,
          };
          setAuthState({ isAuthenticated: true, user });

          const dashboardPath =
            type === "teacher" ? "/dashboard/teacher" : "/dashboard/student";
          router.push(dashboardPath);
          router.refresh();

          toast({
            title: "Welcome!",
            description: `Logged in as ${user.name}`,
          });
        } else {
          throw new Error("Authentication failed. Please try again.");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        console.log("[useAuth] Login error:", errorMessage);
      }
    },
    [isSignInLoaded, router, setActiveSessionLogin]
  );

  const signup = useCallback(
    async (credentials: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) => {
      if (!isSignUpLoaded) {
        console.log("[useAuth] SignUp not loaded yet");
        return;
      }

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

      try {
        const signUpAttempt = await signUp.create({
          emailAddress: email,
          password,
          firstName: name.split(" ")[0],
          lastName: name.split(" ").slice(1).join(" ") || "",
          unsafeMetadata: { role: "teacher" },
        });

        if (signUpAttempt.status === "complete") {
          await setActiveSessionSignup({
            session: signUpAttempt.createdSessionId,
          });
          const user: User = {
            id: email,
            name,
            email,
            type: "teacher",
          };
          setAuthState({ isAuthenticated: true, user });

          router.push("/dashboard/teacher");
          router.refresh();

          toast({
            title: "Account Created!",
            description: `Welcome to StenoMaster, ${user.name}!`,
          });
        } else {
          throw new Error("Sign-up failed. Please try again.");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        console.log("[useAuth] Signup error:", errorMessage);
      }
    },
    [isSignUpLoaded, router, setActiveSessionSignup]
  );

  return (
    <AuthContext.Provider
      value={{ ...authState, login, signup, user: authState.user }}
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
