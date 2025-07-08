"use client";

import { useState, useCallback } from "react";
import { Assignment, Score } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isValid } from "date-fns";

interface UseStudentAssignmentsReturn {
  assignments: Assignment[];
  scores: Score[];
  loading: boolean;
  error: string | null;
  fetchAssignments: (classId: string) => Promise<void>;
  getAssignment: (
    assignmentId: string,
    classId: string
  ) => Promise<Assignment | null>;
  createScore: (score: Score) => Promise<void>;
  fetchScores: (studentId: string) => Promise<void>;
}

export const useStudentAssignments = (): UseStudentAssignmentsReturn => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, fetchStudent } = useAuth();

  const fetchAssignments = useCallback(
    async (classId: string) => {
      if (!user || user.userType !== "student") {
        setError("Only students can fetch assignments.");
        toast({
          title: "Error",
          description: "Only students can fetch assignments.",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("StenoMaster-token");
        if (!token || typeof token !== "string" || token.trim() === "") {
          throw new Error("Invalid session. Please log in again.");
        }

        const response = await fetch("/api/assignment/fetch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, classId }),
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch assignments: ${response.statusText}`
          );
        }

        const result = await response.json();
        if (result.status !== "success") {
          throw new Error(result.message || "Failed to fetch assignments");
        }

        const now = new Date();
        const formattedAssignments: Assignment[] = result.data.map(
          (assignment: Assignment) => {
            const deadline = new Date(assignment.deadline);
            if (!isValid(deadline)) {
              console.error(
                `Invalid deadline for assignment ${assignment.id}: ${assignment.deadline}`
              );
              throw new Error(
                `Invalid deadline format for assignment ${assignment.id}`
              );
            }
            return {
              ...assignment,
              createdAt: new Date(assignment.createdAt),
              deadline,
            };
          }
        );

        const activeAssignments = formattedAssignments.filter(
          (a: Assignment) => a.isActive && a.deadline > now.toString()
        );
        setAssignments(activeAssignments);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        console.error("Error in fetchAssignments:", err);
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const getAssignment = useCallback(
    async (assignmentId: string, classId: string) => {
      if (!user || user.userType !== "student") {
        setError("Only students can fetch assignments.");
        toast({
          title: "Error",
          description: "Only students can fetch assignments.",
          variant: "destructive",
        });
        return null;
      }

      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("StenoMaster-token");
        if (!token || typeof token !== "string" || token.trim() === "") {
          throw new Error("Invalid session. Please log in again.");
        }

        const response = await fetch("/api/assignment/fetch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, classId }),
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch assignment: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.status !== "success") {
          throw new Error(result.message || "Assignment not found");
        }

        const assignment = result.data.find(
          (a: Assignment) => a.id === assignmentId
        );
        if (!assignment) {
          throw new Error("Assignment not found");
        }

        const deadline = new Date(assignment.deadline);
        if (!isValid(deadline)) {
          throw new Error(
            `Invalid deadline format for assignment ${assignment.id}`
          );
        }

        return {
          ...assignment,
          createdAt: new Date(assignment.createdAt),
          deadline,
        } as Assignment;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const createScore = useCallback(
    async (score: Score) => {
      if (!user || user.userType !== "student") {
        setError("Only students can submit scores.");
        toast({
          title: "Error",
          description: "Only students can submit scores.",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("StenoMaster-token");
        if (!token || typeof token !== "string" || token.trim() === "") {
          throw new Error("Invalid session. Please log in again.");
        }

        const response = await fetch("/api/score/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...score, token }),
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          throw new Error(`Failed to save score: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.status !== "success") {
          throw new Error(result.message || "Failed to save score");
        }

        setScores((prev) => [
          ...prev,
          {
            ...result.data,
            completedAt: new Date(result.data.completedAt),
          },
        ]);
        toast({
          title: "Success",
          description: "Score saved successfully.",
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const fetchScores = useCallback(
    async (studentId: string) => {
      if (!user) {
        setError("User not authenticated.");
        toast({
          title: "Error",
          description: "User not authenticated.",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("StenoMaster-token");
        if (!token || typeof token !== "string" || token.trim() === "") {
          throw new Error("Invalid session. Please log in again.");
        }

        if (user.userType === "teacher") {
          // Verify the studentId belongs to one of the teacher's students
          const students = await fetchStudent();
          const isValidStudent = students.some(
            (student) => student.userId === studentId
          );
          if (!isValidStudent) {
            throw new Error(
              "Unauthorized: Student not associated with this teacher."
            );
          }
        } else if (user.userType === "student" && user.userId !== studentId) {
          throw new Error(
            "Unauthorized: Students can only fetch their own scores."
          );
        }

        const response = await fetch("/api/score/fetch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, token }),
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch scores: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.status !== "success") {
          throw new Error(result.message || "Failed to fetch scores");
        }

        setScores(
          result.data.map((score: Score) => ({
            ...score,
            completedAt: new Date(score.completedAt),
          }))
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [user, fetchStudent]
  );

  return {
    assignments,
    scores,
    loading,
    error,
    fetchAssignments,
    getAssignment,
    createScore,
    fetchScores,
  };
};
