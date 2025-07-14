"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Assignment, Class, Score, User } from "@/types";
import { toast } from "./use-toast";

interface studentSideProps {
  assignments: Assignment[];
  studentClass: Class[];
  scores: Score[];
  classes: Class[];
  studentsInClass: User[];
  fetchClasses: () => Promise<void>;
  fetchAssignments: (classId?: string) => Promise<void>;
  submitScore: (score: Score) => Promise<void>;
  setAssignments: (assignment: Assignment[]) => void;
  fetchScores: (studentId: string) => Promise<void>;
  fetchClassesForTeacher: () => Promise<void>;
  fetchStudentsInClass: (classId: string) => Promise<void>;
}

const ScoreContext = createContext<studentSideProps | undefined>(undefined);

export const ScoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentClass, setStudentClass] = useState<Class[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [studentsInClass, setStudentInClass] = useState<User[]>([]);

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
      console.error("Error fetching student classes:", error);
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

  const fetchAssignments = async (classId?: string) => {
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
      console.error("Error fetching assignments:", error);
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
        : { status: "error", message: "Failed to submit score" };

      if (response.ok && result.status === "success") {
        toast({
          title: "Scores Saved",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to submit score",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting score:", error);
      toast({
        title: "Error",
        description: "Failed to submit score",
        variant: "destructive",
      });
    }
  };

  const fetchScores = async (studentId: string) => {
    const token = getToken();
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token missing",
        variant: "destructive",
      });
      return;
    }
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
      if (
        response.ok &&
        result.status === "success" &&
        Array.isArray(result.data)
      ) {
        setScores((prevScores) => {
          // Filter out duplicate scores based on score.id
          const newScores = result.data.filter(
            (newScore: Score) =>
              !prevScores.some((score) => score.id === newScore.id)
          );
          // Append new scores to existing ones
          return [...prevScores, ...newScores];
        });
        console.log(`Scores fetched for student ${studentId}:`, result.data);
      } else {
        console.error(
          `Failed to fetch scores for student ${studentId}:`,
          result.message || "Unknown error"
        );
        toast({
          title: "Error",
          description: result.message || "Failed to fetch scores",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error fetching scores for student ${studentId}:`, error);
      toast({
        title: "Error",
        description: "Failed to fetch scores",
        variant: "destructive",
      });
    }
  };

  const fetchClassesForTeacher = async () => {
    const token = getToken();
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token missing",
        variant: "destructive",
      });
      setClasses([]);
      return;
    }
    try {
      const response = await fetch("/api/classes", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(5000),
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
        setClasses(result.data);
        console.log("Classes fetched successfully:", result.data);
      } else {
        console.error(
          "Failed to fetch classes:",
          result.message || "Unknown error"
        );
        toast({
          title: "Error",
          description: result.message || "Failed to fetch classes",
          variant: "destructive",
        });
        setClasses([]);
      }
    } catch (error) {
      console.error("Error fetching classes for teacher:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching classes",
        variant: "destructive",
      });
      setClasses([]);
    }
  };

  const fetchStudentsInClass = async (classId: string) => {
    const token = getToken();
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token missing",
        variant: "destructive",
      });
      setStudentInClass([]);
      return;
    }
    try {
      const response = await fetch("/api/classes/fetch-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ classId, token }),
        signal: AbortSignal.timeout(5000),
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
        setStudentInClass(result.data);
        console.log("Students fetched for class", classId, ":", result.data);
      } else {
        console.error(
          "Failed to fetch students for class",
          classId,
          ":",
          result.message || "Unknown error"
        );
        toast({
          title: "Error",
          description: result.message || "Failed to fetch students",
          variant: "destructive",
        });
        setStudentInClass([]);
      }
    } catch (error) {
      console.error("Error fetching students for class", classId, ":", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching students",
        variant: "destructive",
      });
      setStudentInClass([]);
    }
  };

  useEffect(() => {
    console.log("Classes state updated:", classes);
  }, [classes]);

  useEffect(() => {
    console.log("StudentsInClass state updated:", studentsInClass);
  }, [studentsInClass]);

  useEffect(() => {
    console.log("Scores state updated:", scores);
  }, [scores]);

  return (
    <ScoreContext.Provider
      value={{
        assignments,
        scores,
        studentClass,
        classes,
        studentsInClass,
        fetchAssignments,
        fetchClasses,
        submitScore,
        setAssignments,
        fetchScores,
        fetchClassesForTeacher,
        fetchStudentsInClass,
      }}
    >
      {children}
    </ScoreContext.Provider>
  );
};

export const useScore = () => {
  const context = useContext(ScoreContext);
  if (context === undefined) {
    throw new Error("useScore must be used within a ScoreProvider");
  }
  return context;
};
