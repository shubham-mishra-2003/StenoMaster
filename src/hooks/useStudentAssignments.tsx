"use client";

import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { parse, isValid } from "date-fns";
import { Assignment, Score } from "@/types";

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
    if (!classId || typeof classId !== "string" || classId.trim() === "") {
      setError("Invalid class ID");
      toast({
        title: "Error",
        description: "Invalid class ID",
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

      console.log(
        `[useStudentAssignments] Fetching assignments for classId: ${classId}`
      );
      const response = await fetch("/api/assignment/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, classId }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch assignments: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(
        `[useStudentAssignments] API response for classId ${classId}:`,
        result
      );

      if (result.status !== "success") {
        throw new Error(result.message || "Failed to fetch assignments");
      }

      if (!Array.isArray(result.data)) {
        console.warn(
          `[useStudentAssignments] No assignments found for classId ${classId}`
        );
        setAssignments([]);
        return;
      }

      const now = new Date();
      console.log(
        `[useStudentAssignments] Current time for comparison: ${now.toISOString()}`
      );

      const formattedAssignments: Assignment[] = result.data.map(
        (assignment: Assignment) => {
          const deadline = parse(
            assignment.deadline,
            "dd/MM/yyyy, hh:mm a",
            new Date()
          );
          if (!isValid(deadline)) {
            console.error(
              `[useStudentAssignments] Invalid deadline for assignment ${assignment.id}: ${assignment.deadline}`
            );
            throw new Error(
              `Invalid deadline format for assignment ${assignment.id}`
            );
          }
          console.log(
            `[useStudentAssignments] Parsed deadline for assignment ${
              assignment.id
            }: ${deadline.toISOString()}`
          );
          return {
            ...assignment,
            createdAt: new Date(assignment.createdAt),
            deadline,
          };
        }
      );

      console.log(
        `[useStudentAssignments] Formatted assignments for classId ${classId}:`,
        formattedAssignments
      );

      const activeAssignments = formattedAssignments.filter((a: Assignment) => {
        const deadlineDate = new Date(a.deadline);
        const isActive = a.isActive && deadlineDate > now;
        console.log(
          `[useStudentAssignments] Assignment ${a.id} - isActive: ${
            a.isActive
          }, deadline: ${deadlineDate.toISOString()}, isFuture: ${
            deadlineDate > now
          }, included: ${isActive}`
        );
        return isActive;
      });

      console.log(
        `[useStudentAssignments] Active assignments for classId ${classId}:`,
        activeAssignments
      );

      setAssignments((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const newAssignments = activeAssignments.filter(
          (a) => !existingIds.has(a.id)
        );
        const updatedAssignments = [...prev, ...newAssignments];
        console.log(
          `[useStudentAssignments] Updated assignments state:`,
          updatedAssignments
        );
        return updatedAssignments;
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error(
        `[useStudentAssignments] Error in fetchAssignments for classId ${classId}:`,
        err
      );
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
    if (!assignmentId || typeof assignmentId !== "string" || assignmentId.trim() === "") {
      console.error("[useStudentAssignments] Invalid assignmentId:", assignmentId);
      setError("Invalid assignment ID");
      toast({
        title: "Error",
        description: "Invalid assignment ID",
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

      console.log(
        `[useStudentAssignments] Fetching assignment with id: ${assignmentId}`
      );
      // Try fetching with the existing endpoint
      const response = await fetch("/api/assignment/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: assignmentId }), // Use 'id' instead of 'assignmentId'
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        // Fallback to a GET request if POST fails
        console.warn(
          `[useStudentAssignments] POST request failed, trying GET for assignmentId: ${assignmentId}`
        );
        const fallbackResponse = await fetch(`/api/assignment/${assignmentId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: AbortSignal.timeout(10000),
        });

        if (!fallbackResponse.ok) {
          throw new Error(`Failed to fetch assignment: ${fallbackResponse.statusText}`);
        }

        const fallbackResult = await fallbackResponse.json();
        console.log(
          `[useStudentAssignments] Fallback GET response for assignmentId ${assignmentId}:`,
          fallbackResult
        );

        if (fallbackResult.status !== "success" || !fallbackResult.data) {
          throw new Error(fallbackResult.message || "Assignment not found");
        }

        const assignment = fallbackResult.data; // Assume single object for GET
        const deadline = parse(
          assignment.deadline,
          "dd/MM/yyyy, hh:mm a",
          new Date()
        );
        if (!isValid(deadline)) {
          throw new Error(
            `Invalid deadline format for assignment ${assignment.id}`
          );
        }

        const formattedAssignment = {
          ...assignment,
          createdAt: new Date(assignment.createdAt),
          deadline,
        } as Assignment;
        console.log(
          `[useStudentAssignments] Formatted assignment:`,
          formattedAssignment
        );
        return formattedAssignment;
      }

      const result = await response.json();
      console.log(
        `[useStudentAssignments] API response for assignmentId ${assignmentId}:`,
        result
      );

      if (result.status !== "success" || !result.data || !Array.isArray(result.data) || result.data.length === 0) {
        throw new Error(result.message || "Assignment not found");
      }

      const assignment = result.data[0];
      const deadline = parse(
        assignment.deadline,
        "dd/MM/yyyy, hh:mm a",
        new Date()
      );
      if (!isValid(deadline)) {
        throw new Error(
          `Invalid deadline format for assignment ${assignment.id}`
        );
      }

      const formattedAssignment = {
        ...assignment,
        createdAt: new Date(assignment.createdAt),
        deadline,
      } as Assignment;
      console.log(
        `[useStudentAssignments] Formatted assignment:`,
        formattedAssignment
      );
      return formattedAssignment;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error(
        `[useStudentAssignments] Error fetching assignment ${assignmentId}:`,
        err
      );
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

      console.log("[useStudentAssignments] Creating score:", score);
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
      console.log("[useStudentAssignments] Score creation response:", result);

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
      console.error("[useStudentAssignments] Error creating score:", err);
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

      console.log(
        `[useStudentAssignments] Fetching scores for studentId: ${studentId}`
      );
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
      console.log("[useStudentAssignments] Scores fetch response:", result);

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
      console.error("[useStudentAssignments] Error fetching scores:", err);
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