// src/hooks/useStudentAssignments.tsx
"use client";

import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Assignment, Score, StudentAssignment } from "@/types";

interface UseStudentAssignmentsReturn {
  assignments: Assignment[];
  scores: Score[];
  studentAssignments: StudentAssignment[];
  loading: boolean;
  error: string | null;
  fetchAssignments: (classId: string) => Promise<void>;
  submitScore: (score: Score) => Promise<void>;
  fetchScores: (studentId: string) => Promise<void>;
  fetchStudentAssignments: (studentId: string) => Promise<void>;
}

export const useStudentAssignments = (): UseStudentAssignmentsReturn => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [studentAssignments, setStudentAssignments] = useState<
    StudentAssignment[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async (classId: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("StenoMaster-token");
      if (!token || typeof token !== "string" || token.trim() === "") {
        throw new Error("Invalid session. Please log in again.");
      }

      const response = await fetch("/api/student/assignment/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, classId }),
        signal: AbortSignal.timeout(5000),
      });

      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Empty response from server" };

      if (response.ok && result.status === "success") {
        setAssignments(
          result.data.map((assignment: Assignment) => ({
            ...assignment,
            createdAt: new Date(assignment.createdAt),
          }))
        );
      } else {
        throw new Error(result.message || "Failed to fetch assignments");
      }
    } catch (error: any) {
      console.error("[useStudentAssignments] Fetch assignments error:", error);
      setError(
        error.message ||
          "An unexpected error occurred while fetching assignments."
      );
      toast({
        title: "Error",
        description: error.message || "Failed to fetch assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const submitScore = useCallback(async (score: Score) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("StenoMaster-token");
      if (!token || typeof token !== "string" || token.trim() === "") {
        throw new Error("Invalid session. Please log in again.");
      }

      const response = await fetch("/api/student/assignment/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...score, token }),
        signal: AbortSignal.timeout(5000),
      });

      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Empty response from server" };

      if (response.ok && result.status === "success") {
        setScores((prev) => [
          ...prev,
          {
            ...result.data,
            completedAt: new Date(result.data.completedAt),
          },
        ]);
        toast({
          title: "Success",
          description: "Score submitted successfully.",
        });
      } else {
        throw new Error(result.message || "Failed to submit score");
      }
    } catch (error: any) {
      console.error("[useStudentAssignments] Submit score error:", error);
      setError(
        error.message || "An unexpected error occurred while submitting score."
      );
      toast({
        title: "Error",
        description: error.message || "Failed to submit score",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchScores = useCallback(async (studentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("StenoMaster-token");
      if (!token || typeof token !== "string" || token.trim() === "") {
        throw new Error("Invalid session. Please log in again.");
      }

      const response = await fetch("/api/student/scores/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, studentId }),
        signal: AbortSignal.timeout(5000),
      });

      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Empty response from server" };

      if (response.ok && result.status === "success") {
        setScores(
          result.data.map((score: Score) => ({
            ...score,
            completedAt: new Date(score.completedAt),
          }))
        );
      } else {
        throw new Error(result.message || "Failed to fetch scores");
      }
    } catch (error: any) {
      console.error("[useStudentAssignments] Fetch scores error:", error);
      setError(
        error.message || "An unexpected error occurred while fetching scores."
      );
      toast({
        title: "Error",
        description: error.message || "Failed to fetch scores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudentAssignments = useCallback(async (studentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("StenoMaster-token");
      if (!token || typeof token !== "string" || token.trim() === "") {
        throw new Error("Invalid session. Please log in again.");
      }

      const response = await fetch("/api/student/assignment/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, studentId }),
        signal: AbortSignal.timeout(5000),
      });

      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Empty response from server" };

      if (response.ok && result.status === "success") {
        setStudentAssignments(
          result.data.map((studentAssignment: StudentAssignment) => ({
            ...studentAssignment,
            completedAt: studentAssignment.completedAt
              ? new Date(studentAssignment.completedAt)
              : undefined,
          }))
        );
      } else {
        throw new Error(
          result.message || "Failed to fetch student assignments"
        );
      }
    } catch (error: any) {
      console.error(
        "[useStudentAssignments] Fetch student assignments error:",
        error
      );
      setError(
        error.message ||
          "An unexpected error occurred while fetching student assignments."
      );
      toast({
        title: "Error",
        description: error.message || "Failed to fetch student assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    assignments,
    scores,
    studentAssignments,
    loading,
    error,
    fetchAssignments,
    submitScore,
    fetchScores,
    fetchStudentAssignments,
  };
};
