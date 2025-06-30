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
import { Class } from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface ClassState {
  classes: Class[];
  loading: boolean;
  error: string | null;
}

interface ClassContextType extends ClassState {
  createClass: (name: string) => Promise<void>;
  getClasses: () => Promise<Class[]>;
  deleteClass: (classId: string) => Promise<void>;
  assignStudentToClass: (classId: string, studentId: string) => Promise<void>;
  removeStudentFromClass: (classId: string, studentId: string) => Promise<void>;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [classState, setClassState] = useState<ClassState>({
    classes: [],
    loading: false,
    error: null,
  });
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Initialize classes on mount, only if authenticated and a teacher
  useEffect(() => {
    const initializeClasses = async () => {
      if (!isAuthenticated || user?.userType !== "teacher") {
        setClassState((prev) => ({ ...prev, classes: [], loading: false }));
        return;
      }

      try {
        const classes = await getClasses();
        setClassState((prev) => ({ ...prev, classes }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        console.error("[useClasses] Error initializing classes:", errorMessage);
        setClassState((prev) => ({ ...prev, error: "Failed to load classes" }));
      }
    };
    initializeClasses();
  }, [isAuthenticated, user]);

  const createClass = useCallback(
    async (name: string) => {
      setClassState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        if (!isAuthenticated || user?.userType !== "teacher") {
          throw new Error("Only teachers can create classes");
        }
        const token = localStorage.getItem("StenoMaster-token");
        if (!token) {
          throw new Error("No authentication token found");
        }
        if (!name.trim()) {
          throw new Error("Class name is required");
        }

        console.log("[useClasses] Creating class:", { name });
        const response = await fetch("/api/classes/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, token }),
        });

        const result = await response.json();
        console.log("[useClasses] POST /api/classes/create response:", result);
        if (response.ok && result.status === "success") {
          const newClass = result.data as Class;
          setClassState((prev) => ({
            ...prev,
            classes: [...prev.classes, newClass],
            loading: false,
          }));
          toast({
            title: "Success",
            description: "Class created successfully",
          });
        } else {
          throw new Error(result.message || "Failed to create class");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        console.error("[useClasses] Create class error:", errorMessage);
        setClassState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [isAuthenticated, user]
  );

  const getClasses = useCallback(async () => {
    setClassState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const token = localStorage.getItem("StenoMaster-token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("[useClasses] Fetching classes");
      const response = await fetch("/api/classes", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      console.log("[useClasses] GET /api/classes response:", result);
      if (response.ok && result.status === "success") {
        const classes = (result.data || []) as Class[];
        setClassState((prev) => ({ ...prev, classes, loading: false }));
        return classes;
      } else {
        throw new Error(result.message || "Failed to fetch classes");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      console.error("[useClasses] Get classes error:", errorMessage);
      setClassState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const deleteClass = useCallback(
    async (classId: string) => {
      setClassState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        if (!isAuthenticated || user?.userType !== "teacher") {
          throw new Error("Only teachers can delete classes");
        }
        const token = localStorage.getItem("StenoMaster-token");
        if (!token) {
          throw new Error("No authentication token found");
        }
        if (!classId) {
          throw new Error("Class ID is required");
        }

        console.log("[useClasses] Deleting class:", { classId });
        const response = await fetch("/api/classes/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classId, token }),
        });

        const result = await response.json();
        console.log("[useClasses] POST /api/classes/delete response:", result);
        if (response.ok && result.status === "success") {
          setClassState((prev) => ({
            ...prev,
            classes: prev.classes.filter((c) => c.id !== classId),
            loading: false,
          }));
          toast({
            title: "Success",
            description: "Class deleted successfully",
          });
        } else {
          throw new Error(result.message || "Failed to delete class");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        console.error("[useClasses] Delete class error:", errorMessage);
        setClassState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [isAuthenticated, user]
  );

  const assignStudentToClass = useCallback(
    async (classId: string, studentId: string) => {
      setClassState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        if (!isAuthenticated || user?.userType !== "teacher") {
          throw new Error("Only teachers can assign students");
        }
        const token = localStorage.getItem("StenoMaster-token");
        if (!token) {
          throw new Error("No authentication token found");
        }
        if (!classId || !studentId) {
          throw new Error("Class ID and student ID are required");
        }

        console.log("[useClasses] Assigning student to class:", {
          classId,
          studentId,
        });
        const response = await fetch("/api/classes/assign-student", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classId, studentId, token }),
        });

        const result = await response.json();
        console.log(
          "[useClasses] POST /api/classes/assign-student response:",
          result
        );
        if (response.ok && result.status === "success") {
          setClassState((prev) => {
            const updatedClasses = prev.classes.map((c) =>
              c.id === classId
                ? { ...c, students: [...c.students, studentId] }
                : c
            );
            console.log("[useClasses] Updated classes state:", updatedClasses);
            return {
              ...prev,
              classes: updatedClasses,
              loading: false,
            };
          });
          toast({
            title: "Success",
            description: "Student assigned to class successfully",
          });
        } else {
          throw new Error(result.message || "Failed to assign student");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        console.error("[useClasses] Assign student error:", errorMessage);
        setClassState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [isAuthenticated, user]
  );

  const removeStudentFromClass = useCallback(
    async (classId: string, studentId: string) => {
      setClassState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        if (!isAuthenticated || user?.userType !== "teacher") {
          throw new Error("Only teachers can remove students");
        }
        const token = localStorage.getItem("StenoMaster-token");
        if (!token) {
          throw new Error("No authentication token found");
        }
        if (!classId || !studentId) {
          throw new Error("Class ID and student ID are required");
        }

        console.log("[useClasses] Removing student from class:", {
          classId,
          studentId,
        });
        const response = await fetch("/api/classes/remove-student", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classId, studentId, token }),
        });

        const result = await response.json();
        console.log(
          "[useClasses] POST /api/classes/remove-student response:",
          result
        );
        if (response.ok && result.status === "success") {
          setClassState((prev) => {
            const updatedClasses = prev.classes.map((c) =>
              c.id === classId
                ? {
                    ...c,
                    students: c.students.filter(
                      (id: string) => id !== studentId
                    ),
                  }
                : c
            );
            console.log("[useClasses] Updated classes state:", updatedClasses);
            return {
              ...prev,
              classes: updatedClasses,
              loading: false,
            };
          });
          toast({
            title: "Success",
            description: "Student removed from class successfully",
          });
        } else {
          throw new Error(result.message || "Failed to remove student");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        console.error("[useClasses] Remove student error:", errorMessage);
        setClassState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [isAuthenticated, user]
  );

  return (
    <ClassContext.Provider
      value={{
        ...classState,
        createClass,
        getClasses,
        deleteClass,
        assignStudentToClass,
        removeStudentFromClass,
      }}
    >
      {children}
    </ClassContext.Provider>
  );
};

export const useClasses = () => {
  const context = useContext(ClassContext);
  if (context === undefined) {
    throw new Error("useClasses must be used within a ClassesProvider");
  }
  return context;
};
