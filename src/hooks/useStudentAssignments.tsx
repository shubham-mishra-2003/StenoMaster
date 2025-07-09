"use client";

import { useState, useCallback, useEffect } from "react";
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
  const [hasFetched, setHasFetched] = useState<{
    assignments: Set<string>;
    scores: Set<string>;
    studentsInClass: Set<string>;
  }>({
    assignments: new Set(),
    scores: new Set(),
    studentsInClass: new Set(),
  });
  const { user, isAuthenticated } = useAuth();
  const { classes, fetchStudentsInClass } = useClass();

  const fetchAssignments = useCallback(
    async (classId: string) => {
      if (
        !isAuthenticated ||
        !user?.userId ||
        hasFetched.assignments.has(classId)
      ) {
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

      // Verify student is enrolled in the class (for students only)
      if (
        user.userType === "student" &&
        !hasFetched.studentsInClass.has(classId)
      ) {
        try {
          const studentsInClass = await fetchStudentsInClass(classId);
          setHasFetched((prev) => ({
            ...prev,
            studentsInClass: new Set(prev.studentsInClass).add(classId),
          }));
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
        } catch (err) {
          console.error(
            "[useStudentAssignments] Error fetching students in class:",
            err
          );
          setError("Failed to verify class enrollment.");
          return;
        }
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
          setAssignments((prev) => [
            ...prev.filter((a) => a.classId !== classId),
            ...result.data.map((assignment: Assignment) => ({
              ...assignment,
              classId,
              createdAt: new Date(assignment.createdAt),
            })),
          ]);
          setHasFetched((prev) => ({
            ...prev,
            assignments: new Set(prev.assignments).add(classId),
          }));
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
    [
      isAuthenticated,
      user,
      hasFetched.assignments,
      hasFetched.studentsInClass,
      fetchStudentsInClass,
    ]
  );

  const fetchScores = useCallback(
    async (studentId: string) => {
      if (
        !isAuthenticated ||
        !user?.userId ||
        hasFetched.scores.has(studentId)
      ) {
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
          setScores((prev) => [
            ...prev.filter((s) => s.studentId !== studentId),
            ...result.data.map((score: Score) => ({
              ...score,
              studentId,
              completedAt: new Date(score.completedAt),
            })),
          ]);
          setHasFetched((prev) => ({
            ...prev,
            scores: new Set(prev.scores).add(studentId),
          }));
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
    [isAuthenticated, user, hasFetched.scores]
  );

  const submitScore = useCallback(
    async (score: Score) => {
      if (
        !isAuthenticated ||
        !user?.userId ||
        user.userType !== "student" ||
        score.studentId !== user.userId
      ) {
        toast({
          title: "Error",
          description:
            "Only authenticated students can submit scores for themselves.",
          variant: "destructive",
        });
        setError(
          "Only authenticated students can submit scores for themselves."
        );
        return;
      }

      const token = localStorage.getItem("studentMaster-token");
      if (!token || typeof token !== "string" || token.trim()) {
        console.error("[useStudentAssignments] Invalid token in localStorage");
        toast({
          title: "Error",
          description: "Invalid session. Please log in again.",
          variant: "destructive",
        });
        setError("Invalid session. Please log in again.");
        return;
      }

      // Verify the assignment exists
      const assignment = assignments.find((a) => a.id === score.assignmentId);
      if (!assignment) {
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

      // Verify student enrollment in the class
      const classId = assignment!.classId;
      if (!hasFetched.studentsInClass.has(classId)) {
        try {
          const studentsInClass = await fetchStudentsInClass(classId);
          setHasFetched((prev) => ({
            ...prev,
            studentsInClass: new Set(prev.studentsInClass).add(classId),
          }));
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
        } catch (err) {
          console.error(
            "[useStudentAssignments] Error fetching students in class:",
            err
          );
          setError("Failed to verify class enrollment.");
          return;
        }
      }

      setLoading(true);
      try {
        const response = await fetch("/api/score/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: score.id,
            studentId: user.userId,
            assignmentId: score.assignmentId,
            typedText: score.typedText,
            accuracy: score.accuracy,
            wpm: score.wpm,
            timeElapsed: score.timeElapsed,
            completedAt: score.completedAt.toISOString(),
            token,
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
              studentId: user.userId,
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
    [
      isAuthenticated,
      user,
      assignments,
      fetchStudentsInClass,
      hasFetched.studentsInClass,
    ]
  );

  // Reset hasFetched when user changes
  useEffect(() => {
    setHasFetched({
      assignments: new Set(),
      scores: new Set(),
      studentsInClass: new Set(),
    });
  }, [user]);

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
