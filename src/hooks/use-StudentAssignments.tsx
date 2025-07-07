"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Assignment, Score } from "@/types";

interface AssignmentState {
  assignments: Assignment[];
  scores: Score[];
  loading: boolean;
  error: string | null;
}

interface AssignmentContextType extends AssignmentState {
  getAssignments: (id?: string) => Promise<Assignment | Assignment[]>;
  createAssignment: (assignment: Assignment) => Promise<void>;
  updateAssignment: (assignment: Assignment) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  getScores: (studentId?: string) => Promise<Score[]>;
  createScore: (score: Score) => Promise<void>;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(
  undefined
);

export const AssignmentsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AssignmentState>({
    assignments: [],
    scores: [],
    loading: false,
    error: null,
  });
  const { isAuthenticated, user } = useAuth();

  const getAssignments = useCallback(async (id?: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch(
        id ? `/api/student/assignments?id=${id}` : "/api/student/assignments",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await response.json();
      if (response.ok) {
        if (id) {
          setState((prev) => ({
            ...prev,
            assignments: [result],
            loading: false,
          }));
          return result as Assignment;
        } else {
          setState((prev) => ({
            ...prev,
            assignments: result,
            loading: false,
          }));
          return result as Assignment[];
        }
      } else {
        throw new Error(result.error || "Failed to fetch assignments");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  const createAssignment = useCallback(
    async (assignment: Assignment) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        if (!isAuthenticated || user?.userType !== "teacher") {
          throw new Error("Only teachers can create assignments");
        }
        const response = await fetch("/api/student/assignments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(assignment),
        });
        const result = await response.json();
        if (response.ok) {
          setState((prev) => ({
            ...prev,
            assignments: [
              ...prev.assignments,
              { ...assignment, id: result.id },
            ],
            loading: false,
          }));
          toast({
            title: "Success",
            description: "Assignment created successfully",
          });
        } else {
          throw new Error(result.error || "Failed to create assignment");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    [isAuthenticated, user]
  );

  const updateAssignment = useCallback(
    async (assignment: Assignment) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        if (!isAuthenticated || user?.userType !== "teacher") {
          throw new Error("Only teachers can update assignments");
        }
        const response = await fetch("/api/student/assignments", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(assignment),
        });
        const result = await response.json();
        if (response.ok) {
          setState((prev) => ({
            ...prev,
            assignments: prev.assignments.map((a) =>
              a.id === assignment.id ? assignment : a
            ),
            loading: false,
          }));
          toast({
            title: "Success",
            description: "Assignment updated successfully",
          });
        } else {
          throw new Error(result.error || "Failed to update assignment");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    [isAuthenticated, user]
  );

  const deleteAssignment = useCallback(
    async (id: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        if (!isAuthenticated || user?.userType !== "teacher") {
          throw new Error("Only teachers can delete assignments");
        }
        const response = await fetch(`/api/student/assignments?id=${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();
        if (response.ok) {
          setState((prev) => ({
            ...prev,
            assignments: prev.assignments.filter((a) => a.id !== id),
            loading: false,
          }));
          toast({
            title: "Success",
            description: "Assignment deleted successfully",
          });
        } else {
          throw new Error(result.error || "Failed to delete assignment");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    [isAuthenticated, user]
  );

  const getScores = useCallback(async (studentId?: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch(
        studentId
          ? `/api/student/scores?studentId=${studentId}`
          : "/api/student/scores",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await response.json();
      if (response.ok) {
        const processedScores = result.map((score: Score) => ({
          ...score,
          completedAt: new Date(score.completedAt),
        }));
        setState((prev) => ({
          ...prev,
          scores: processedScores,
          loading: false,
        }));
        return processedScores as Score[];
      } else {
        throw new Error(result.error || "Failed to fetch scores");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  const createScore = useCallback(async (score: Score) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const completedAt =
        score.completedAt instanceof Date
          ? score.completedAt
          : new Date(score.completedAt);
      if (isNaN(completedAt.getTime())) {
        throw new Error("Invalid completedAt date");
      }
      const response = await fetch("/api/student/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...score,
          completedAt: completedAt.toISOString(),
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setState((prev) => ({
          ...prev,
          scores: [...prev.scores, { ...score, id: result.id }],
          loading: false,
        }));
        toast({ title: "Success", description: "Score created successfully" });
      } else {
        throw new Error(result.error || "Failed to create score");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      if (!isAuthenticated || !user?.userId) {
        setState((prev) => ({
          ...prev,
          assignments: [],
          scores: [],
          loading: false,
        }));
        return;
      }
      try {
        await Promise.all([getAssignments(), getScores(user.userId)]);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      }
    };
    initializeData();
  }, [isAuthenticated, user, getAssignments, getScores]);

  return (
    <AssignmentContext.Provider
      value={{
        ...state,
        getAssignments,
        createAssignment,
        updateAssignment,
        deleteAssignment,
        getScores,
        createScore,
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
};

export const useAssignments = () => {
  const context = useContext(AssignmentContext);
  if (context === undefined) {
    throw new Error(
      "useAssignments must be used within an AssignmentsProvider"
    );
  }
  return context;
};
