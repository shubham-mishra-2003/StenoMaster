"use client";

import { useState, useCallback } from "react";
import { Assignment, Score } from "@/types";
import { toast } from "@/hooks/use-toast";
import { parse, isValid } from "date-fns";

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
  const [loading, setLoading] = useState<boolean>(false);
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
        signal: AbortSignal.timeout(10000), // Increased timeout
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch assignments: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("API response:", result);
      if (result.status !== "success") {
        throw new Error(result.message || "Failed to fetch assignments");
      }

      const now = new Date();
      const formattedAssignments: Assignment[] = result.data.map(
        (assignment: Assignment) => {
          const deadline = parse(
            assignment.deadline,
            "dd/MM/yyyy, hh:mm a",
            new Date()
          );
          if (!isValid(deadline)) {
            console.error(`Invalid deadline for assignment ${assignment.id}: ${assignment.deadline}`);
            throw new Error(`Invalid deadline format for assignment ${assignment.id}`);
          }
          return {
            ...assignment,
            createdAt: new Date(assignment.createdAt),
            deadline,
          };
        }
      );

      console.log("Formatted assignments:", formattedAssignments);
      const activeAssignments = formattedAssignments.filter(
        (a: Assignment) => a.isActive && a.deadline > now.toString()
      );
      console.log("Active assignments:", activeAssignments);
      setAssignments(activeAssignments);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error(" error in fetchAssignments:", err);
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

  // Rest of the hook remains unchanged
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
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch assignment: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.status !== "success" || !result.data[0]) {
        throw new Error(result.message || "Assignment not found");
      }

      const assignment = result.data[0];
      const deadline = parse(
        assignment.deadline,
        "dd/MM/yyyy, hh:mm a",
        new Date()
      );
      if (!isValid(deadline)) {
        throw new Error(`Invalid deadline format for assignment ${assignment.id}`);
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