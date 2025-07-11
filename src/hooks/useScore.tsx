import { useState } from "react";
import { Assignment, Class, Score } from "@/types";
import { toast } from "./use-toast";

interface studentSideProps {
  fetchClasses: () => Promise<void>;
  fetchAssignments: (classId: string) => Promise<void>;
  submitScore: (score: Score) => Promise<void>;
  setAssignments: (assignment: Assignment) => void;
  assignments: Assignment[];
  studentClass: Class[];
  scores: Score[];
}

export const useStudentSide = (): studentSideProps => {
  const token = localStorage.getItem("StenoMaster-token");
  const [loading, setLoading] = useState(false);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentClass, setStudentClass] = useState<Class[]>([]);
  const [scores, setScores] = useState<Score[]>([]);

  const fetchClasses = async () => {
    if (loading || !token) return;
    setLoading(true);
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

      if (
        response.ok &&
        result.status === "success" &&
        Array.isArray(result.data)
      ) {
        setStudentClass(result.data);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch student classes",
          variant: "destructive",
        });
        setStudentClass([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          "An unexpected error occurred while fetching student classes.",
        variant: "destructive",
      });
      setStudentClass([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (classId: string) => {
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
        : { status: "error", message: "Failed to fetch assignment" };

      if (response.ok && result.status === "success") {
        setAssignments(result.data);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch assignments",
          variant: "destructive",
        });
        setAssignments([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive",
      });
      setAssignments([]);
    }
  };

  const submitScore = async (score: Score) => {
    try {
      const response = await fetch("/api/score/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...score, token }),
        signal: AbortSignal.timeout(5000),
      });
      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Failed to fetch assignment" };

      console.log("Scores from API - ", response);
      if (response.ok && result.status === "success") {
        setScores(result.data);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch assignments",
          variant: "destructive",
        });
        setAssignments([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive",
      });
      setScores([]);
    }
  };

  return {
    fetchAssignments,
    fetchClasses,
    submitScore,
    setAssignments,
    assignments,
    scores,
    studentClass,
  };
};
