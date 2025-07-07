// src/hooks/useStudentAssignments.tsx
"use client";

import { useState, useCallback } from "react";
import { Assignment, Score } from "@/types";
import { toast } from "@/hooks/use-toast";
import moment from "moment";

interface UseStudentAssignmentsReturn {
  assignments: Assignment[];
  scores: Score[];
  loading: boolean;
  error: string | null;
  fetchAssignments: (classId: string) => Promise<void>;
  getAssignment: (assignmentId: string) => Promise<Assignment | null>;
  createScore: (score: Score) => Promise<void>;
  fetchScores: (studentId: string) => Promise<void>;
}

export const useStudentAssignments = (): UseStudentAssignmentsReturn => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
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

      const response = await fetch("/api/assignment/fetch", {
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
        const now = new Date();
        const formattedAssignments = result.data.map(
          (assignment: Assignment) => ({
            ...assignment,
            createdAt: new Date(assignment.createdAt),
            deadline: moment(
              assignment.deadline,
              "DD/MM/YYYY, hh:mm A"
            ).toDate(),
          })
        );
        setAssignments(
          formattedAssignments.filter(
            (a: Assignment) => a.isActive && a.deadline > now.toString()
          )
        );
      } else {
        throw new Error(result.message || "Failed to fetch assignments");
      }
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
  }, []);

  const getAssignment = useCallback(async (assignmentId: string) => {
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
        body: JSON.stringify({ token, assignmentId }),
        signal: AbortSignal.timeout(5000),
      });

      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Empty response from server" };

      if (response.ok && result.status === "success") {
        const assignment = result.data[0];
        return {
          ...assignment,
          createdAt: new Date(assignment.createdAt),
          deadline: moment(assignment.deadline, "DD/MM/YYYY, hh:mm A").toDate(),
        } as Assignment;
      } else {
        throw new Error(result.message || "Failed to fetch assignment");
      }
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
  }, []);

  const createScore = useCallback(async (score: Score) => {
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
          description: "Score saved successfully.",
        });
      } else {
        throw new Error(result.message || "Failed to save score");
      }
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
  }, []);

  const fetchScores = useCallback(async (studentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("StenoMaster-token");
      if (!token || typeof token !== "string" || token.trim() === "") {
        throw new Error("Invalid session. Please log in again.");
      }

      const response = await fetch("/api/score/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, token }),
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
  }, []);

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
