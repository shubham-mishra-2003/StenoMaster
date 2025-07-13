"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Assignment, Class, Score, User } from "@/types";
import { toast } from "./use-toast";

interface studentSideProps {
  assignments: Assignment[];
  studentClass: Class[];
  scores: Score[];
  fetchClasses: () => Promise<void>;
  fetchAssignments: (classId: string) => Promise<void>;
  submitScore: (score: Score) => Promise<void>;
  setAssignments: (assignment: Assignment[]) => void;
  fetchScores: (studentId: string) => Promise<void>;
}

const ScoreContext = createContext<studentSideProps | undefined>(undefined);

export const ScoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentClass, setStudentClass] = useState<Class[]>([]);
  const [scores, setScores] = useState<Score[]>([]);

  const getToken = () => localStorage.getItem("StenoMaster-token");

  const fetchClasses = async () => {
    const token = getToken();

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
    const token = getToken();
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
    const token = getToken();

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

      if (response.ok && result.status === "success") {
        toast({
          title: "Scores Saved",
        });
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
    }
  };

  const fetchScores = async (studentId: string) => {
    const token = getToken();

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
        : { status: "error", message: "Failed to fetch scores" };
      if (response.ok && result.status === "success") {
        setScores(result.data);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch assignments",
          variant: "destructive",
        });
        setScores([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive",
      });
    }
  };

  return (
    <ScoreContext.Provider
      value={{
        fetchAssignments,
        fetchClasses,
        submitScore,
        setAssignments,
        fetchScores,
        assignments,
        scores,
        studentClass,
      }}
    >
      {children}
    </ScoreContext.Provider>
  );
};

export const useScore = () => {
  const context = useContext(ScoreContext);
  if (context === undefined) {
    throw new Error("useClass must be used within a ClassProvider");
  }
  return context;
};
