"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { IClass } from "@/lib/database/models/class.model";

interface ClassState {
  classes: IClass[];
  isLoading: boolean;
}

interface ClassContextType extends ClassState {
  createClass: (name: string) => Promise<void>;
  fetchClasses: () => Promise<void>;
  fetchStudentClasses: () => Promise<void>;
  deleteClass: (classId: string) => Promise<void>;
  assignStudentToClass: (classId: string, studentId: string) => Promise<void>;
  removeStudentFromClass: (classId: string, studentId: string) => Promise<void>;
  fetchStudentsInClass: (classId: string) => Promise<any[]>;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [classState, setClassState] = useState<ClassState>({
    classes: [],
    isLoading: false,
  });
  const router = useRouter();

  const getToken = () => localStorage.getItem("StenoMaster-token");

  const createClass = useCallback(
    async (name: string) => {
      if (!name.trim()) {
        toast({
          title: "Error",
          description: "Please enter a class name.",
          variant: "destructive",
        });
        return;
      }

      const token = getToken();
      if (!token) {
        return;
      }
      setClassState((prev) => ({ ...prev, isLoading: true }));
      try {
        const response = await fetch("/api/classes/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, token }),
        });

        const result = await response.json();
        if (response.ok && result.status === "success") {
          setClassState((prev) => ({
            ...prev,
            classes: [...prev.classes, result.data],
          }));
          toast({
            title: "Success",
            description: "Class created successfully.",
          });
          router.refresh();
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to create class",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("[useClass] Create class error:", error);
      } finally {
        setClassState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [router]
  );

  const fetchClasses = useCallback(async () => {
    const token = getToken();
    if (!token) {
      return;
    }

    setClassState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch("/api/classes", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Empty response from server" };

      if (response.ok && result.status === "success") {
        setClassState((prev) => ({
          ...prev,
          classes: result.data,
        }));
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch classes",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[useClass] Fetch classes error:", error);
    } finally {
      setClassState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const fetchStudentClasses = useCallback(async () => {
    const token = getToken();
    if (!token) {
      return;
    }

    setClassState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "getStudentClasses" }),
      });

      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Empty response from server" };
      if (response.ok && result.status === "success") {
        setClassState((prev) => ({
          ...prev,
          classes: result.data,
        }));
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch student classes",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[useClass] Fetch student classes error:", error);
      toast({
        title: "Error",
        description:
          "An unexpected error occurred while fetching student classes.",
        variant: "destructive",
      });
    } finally {
      setClassState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const deleteClass = useCallback(
    async (classId: string) => {
      const token = getToken();
      if (!token) {
        return;
      }

      setClassState((prev) => ({ ...prev, isLoading: true }));
      try {
        const response = await fetch("/api/classes/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ classId, token }),
        });

        const result = await response.json();
        if (response.ok && result.status === "success") {
          setClassState((prev) => ({
            ...prev,
            classes: prev.classes.filter((c) => c.id !== classId),
          }));
          toast({
            title: "Success",
            description: "Class deleted successfully.",
          });
          router.refresh();
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to delete class",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("[useClass] Delete class error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while deleting the class.",
          variant: "destructive",
        });
      } finally {
        setClassState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [router]
  );

  const assignStudentToClass = useCallback(
    async (classId: string, studentId: string) => {
      const token = getToken();
      if (!token) {
        return;
      }

      setClassState((prev) => ({ ...prev, isLoading: true }));
      try {
        const response = await fetch("/api/classes/assign-student", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ classId, studentId, token }),
        });

        const result = await response.json();
        if (response.ok && result.status === "success") {
          toast({
            title: "Success",
            description: "Student assigned to class successfully.",
          });
          router.refresh();
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to assign student",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("[useClass] Assign student error:", error);
        toast({
          title: "Error",
          description:
            "An unexpected error occurred while assigning the student.",
          variant: "destructive",
        });
      } finally {
        setClassState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [router]
  );

  const removeStudentFromClass = useCallback(
    async (classId: string, studentId: string) => {
      const token = getToken();
      if (!token) {
        return;
      }

      setClassState((prev) => ({ ...prev, isLoading: true }));
      try {
        const response = await fetch("/api/classes/remove-student", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ classId, studentId, token }),
        });

        const result = await response.json();
        if (response.ok && result.status === "success") {
          toast({
            title: "Success",
            description: "Student removed from class successfully.",
          });
          router.refresh();
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to remove student",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("[useClass] Remove student error:", error);
        toast({
          title: "Error",
          description:
            "An unexpected error occurred while removing the student.",
          variant: "destructive",
        });
      } finally {
        setClassState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [router]
  );

  const fetchStudentsInClass = useCallback(async (classId: string) => {
    const token = getToken();
    if (!token) {
      return [];
    }

    setClassState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch("/api/classes/fetch-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ classId, token }),
      });

      const result = await response.json();
      if (response.ok && result.status === "success") {
        return result.data;
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch students",
          variant: "destructive",
        });
        return [];
      }
    } catch (error) {
      console.error("[useClass] Fetch students error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching students.",
        variant: "destructive",
      });
      return [];
    } finally {
      setClassState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  return (
    <ClassContext.Provider
      value={{
        ...classState,
        createClass,
        fetchClasses,
        fetchStudentClasses,
        deleteClass,
        assignStudentToClass,
        removeStudentFromClass,
        fetchStudentsInClass,
      }}
    >
      {children}
    </ClassContext.Provider>
  );
};

export const useClass = () => {
  const context = useContext(ClassContext);
  if (context === undefined) {
    throw new Error("useClass must be used within a ClassProvider");
  }
  return context;
};
