"use client";

import { createContext, useContext, useState } from "react";
import { Assignment, Class, Score, User } from "@/types";
import { toast } from "./use-toast";

interface studentSideProps {
  assignments: Assignment[];
  studentClass: Class[];
  scores: Score[];
  classes: Class[];
  studentsInClass: User[];
  fetchClasses: () => Promise<Class[]>;
  fetchAssignments: (classId?: string) => Promise<void>;
  submitScore: (score: Score) => Promise<void>;
  setAssignments: (assignment: Assignment[]) => void;
  fetchScores: (studentId: string) => Promise<void>;
  fetchClassesForTeacher: () => Promise<Class[]>;
  fetchStudentsInClass: (classId: string) => Promise<User[]>;
  deleteStudentScores: (studentId: string) => Promise<void>;
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

  const fetchClasses = async (): Promise<Class[]> => {
    const token = getToken();
    if (loading || !token) return [];
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
        : { status: "error", message: "Empty response" };

      if (
        response.ok &&
        result.status === "success" &&
        Array.isArray(result.data)
      ) {
        setStudentClass(result.data);
        return result.data;
      } else {
        setStudentClass([]);
        return [];
      }
    } catch (error) {
      setStudentClass([]);
      return [];
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
        signal: AbortSignal.timeout(15000),
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
      setAssignments([]);
      return;
    }
  };

  const submitScore = async (score: Score) => {
    const token = getToken();

    try {
      const response = await fetch("/api/score/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...score, token }),
        signal: AbortSignal.timeout(15000),
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
      return;
    }
  };

  const fetchScores = async (studentId: string) => {
    const token = getToken();
    if (!token) {
      return;
    }
    try {
      const response = await fetch("/api/score/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, token }),
        signal: AbortSignal.timeout(15000),
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
          const newScores = result.data.filter(
            (newScore: Score) =>
              !prevScores.some((score) => score.id === newScore.id)
          );
          return [...prevScores, ...newScores];
        });
      } else {
        return;
      }
    } catch (error) {
      return;
    }
  };

  const fetchClassesForTeacher = async (): Promise<Class[]> => {
    const token = getToken();
    if (!token) {
      setClasses([]);
      return [];
    }
    try {
      const response = await fetch("/api/classes", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(15000),
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
        return result.data;
      } else {
        setClasses([]);
        return [];
      }
    } catch (error) {
      setClasses([]);
      return [];
    }
  };

  const fetchStudentsInClass = async (classId: string): Promise<User[]> => {
    const token = getToken();
    if (!token) {
      setStudentInClass([]);
      return [];
    }

    try {
      const response = await fetch("/api/classes/fetch-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ classId, token }),
        signal: AbortSignal.timeout(15000),
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
        setStudentInClass((prevScores) => {
          const newStudents = result.data.filter(
            (newStudent: User) =>
              !prevScores.some((std) => std.userId === newStudent.userId)
          );
          return [...prevScores, ...newStudents];
        });
        return result.data;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  };

  const deleteStudentScores = async (studentId: string) => {
    const token = localStorage.getItem("StenoMaster-token");
    if (!token) return;

    try {
      const response = await fetch("/api/score/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ studentId }),
      });

      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Empty response from server" };

      if (response.ok && result.status === "success") {
        console.log(`✅ Scores deleted for student: ${studentId}`);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete scores",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Failed to delete scores:", error);
      toast({
        title: "Error",
        description: "Something went wrong while deleting scores.",
        variant: "destructive",
      });
    }
  };

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
        deleteStudentScores,
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
