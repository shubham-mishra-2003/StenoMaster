"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useClass } from "@/hooks/useClasses";
import { Assignment, Score } from "@/types";
import { toast } from "@/hooks/use-toast";

interface UseStudentAssignmentsReturn {
  assignments: Assignment[];
  scores: Score[];
  loading: boolean;
  error: string | null;
  fetchAssignments: (classId: string) => Promise<void>;
  fetchScores: (studentId: string) => Promise<void>;
  submitScore: (score: Score) => Promise<void>;
}

export const useStudentAssignments = (): UseStudentAssignmentsReturn => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { classes, fetchStudentsInClass } = useClass();

  const fetchAssignments = useCallback(
    async (classId: string) => {
      if (!isAuthenticated || !user?.userId) {
        toast({
          title: "Error",
          description: "You must be logged in to fetch assignments.",
          variant: "destructive",
        });
        setError("You must be logged in to fetch assignments.");
        return;
      }

      const token = localStorage.getItem("StenoMaster-token");
      if (!token || typeof token !== "string" || token.trim() === "") {
        console.error("[useStudentAssignments] Invalid token in localStorage");
        toast({
          title: "Error",
          description: "Invalid session. Please log in again.",
          variant: "destructive",
        });
        setError("Invalid session. Please log in again.");
        return;
      }

      // Verify student is enrolled in the class
      const studentsInClass = await fetchStudentsInClass(classId);
      if (
        user.userType === "student" &&
        !studentsInClass.some((s: any) => s.userId === user.userId)
      ) {
        console.error(
          "[useStudentAssignments] Student not enrolled in class:",
          classId
        );
        toast({
          title: "Error",
          description: "You are not enrolled in this class.",
          variant: "destructive",
        });
        setError("You are not enrolled in this class.");
        return;
      }

      setLoading(true);
      try {
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
          setAssignments(
            result.data.map((assignment: Assignment) => ({
              ...assignment,
              createdAt: new Date(assignment.createdAt),
            }))
          );
          setError(null);
        } else {
          console.error(
            "[useStudentAssignments] Fetch assignments error:",
            result.message
          );
          toast({
            title: "Error",
            description: result.message || "Failed to fetch assignments",
            variant: "destructive",
          });
          setError(result.message || "Failed to fetch assignments");
        }
      } catch (error: any) {
        console.error(
          "[useStudentAssignments] Fetch assignments error:",
          error
        );
        toast({
          title: "Error",
          description:
            "An unexpected error occurred while fetching assignments.",
          variant: "destructive",
        });
        setError("An unexpected error occurred while fetching assignments.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, user]
  );

  const fetchScores = useCallback(
    async (studentId: string) => {
      if (!isAuthenticated || !user?.userId) {
        toast({
          title: "Error",
          description: "You must be logged in to fetch scores.",
          variant: "destructive",
        });
        setError("You must be logged in to fetch scores.");
        return;
      }

      const token = localStorage.getItem("StenoMaster-token");
      if (!token || typeof token !== "string" || token.trim() === "") {
        console.error("[useStudentAssignments] Invalid token in localStorage");
        toast({
          title: "Error",
          description: "Invalid session. Please log in again.",
          variant: "destructive",
        });
        setError("Invalid session. Please log in again.");
        return;
      }

      // For teachers, verify the student is associated with them
      if (user.userType === "teacher") {
        const allStudents: any[] = [];
        for (const classItem of classes) {
          const students = await fetchStudentsInClass(classItem.id);
          allStudents.push(...students);
        }
        if (!allStudents.some((s: any) => s.userId === studentId)) {
          console.error(
            "[useStudentAssignments] Student not associated with teacher:",
            studentId
          );
          toast({
            title: "Error",
            description:
              "You are not authorized to view this student's scores.",
            variant: "destructive",
          });
          setError("You are not authorized to view this student's scores.");
          return;
        }
      } else if (user.userType === "student" && user.userId !== studentId) {
        console.error(
          "[useStudentAssignments] Unauthorized score access:",
          studentId
        );
        toast({
          title: "Error",
          description: "You can only view your own scores.",
          variant: "destructive",
        });
        setError("You can only view your own scores.");
        return;
      }

      setLoading(true);
      try {
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
          setError(null);
        } else {
          console.error(
            "[useStudentAssignments] Fetch scores error:",
            result.message
          );
          toast({
            title: "Error",
            description: result.message || "Failed to fetch scores",
            variant: "destructive",
          });
          setError(result.message || "Failed to fetch scores");
        }
      } catch (error: any) {
        console.error("[useStudentAssignments] Fetch scores error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching scores.",
          variant: "destructive",
        });
        setError("An unexpected error occurred while fetching scores.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, user, classes, fetchStudentsInClass]
  );

  const submitScore = useCallback(
    async (score: Score) => {
      if (!isAuthenticated || !user?.userId || user.userType !== "student") {
        toast({
          title: "Error",
          description: "Only authenticated students can submit scores.",
          variant: "destructive",
        });
        setError("Only authenticated students can submit scores.");
        return;
      }

      const token = localStorage.getItem("StenoMaster-token");
      if (!token || typeof token !== "string" || token.trim() === "") {
        console.error("[useStudentAssignments] Invalid token in localStorage");
        toast({
          title: "Error",
          description: "Invalid session. Please log in again.",
          variant: "destructive",
        });
        setError("Invalid session. Please log in again.");
        return;
      }

      // Verify the assignment exists and is accessible
      const classId = assignments.find(
        (a) => a.id === score.assignmentId
      )?.classId;
      if (!classId) {
        console.error(
          "[useStudentAssignments] Assignment not found:",
          score.assignmentId
        );
        toast({
          title: "Error",
          description: "Assignment not found.",
          variant: "destructive",
        });
        setError("Assignment not found.");
        return;
      }

      const studentsInClass = await fetchStudentsInClass(classId);
      if (!studentsInClass.some((s: any) => s.userId === user.userId)) {
        console.error(
          "[useStudentAssignments] Student not enrolled in class:",
          classId
        );
        toast({
          title: "Error",
          description: "You are not enrolled in this class.",
          variant: "destructive",
        });
        setError("You are not enrolled in this class.");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("/api/score/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...score,
            studentId: user.userId,
            token,
            completedAt: score.completedAt.toISOString(),
          }),
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
          setError(null);
        } else {
          console.error(
            "[useStudentAssignments] Submit score error:",
            result.message
          );
          toast({
            title: "Error",
            description: result.message || "Failed to submit score",
            variant: "destructive",
          });
          setError(result.message || "Failed to submit score");
        }
      } catch (error: any) {
        console.error("[useStudentAssignments] Submit score error:", error);
        toast({
          title: "Error",
          description:
            "An unexpected error occurred while submitting the score.",
          variant: "destructive",
        });
        setError("An unexpected error occurred while submitting the score.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, user, assignments, fetchStudentsInClass]
  );

  return {
    assignments,
    scores,
    loading,
    error,
    fetchAssignments,
    fetchScores,
    submitScore,
  };
};
