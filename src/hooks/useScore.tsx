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
      setAssignments([]);
      return;
    }

    const password = newStudent.password || generateRandomPassword();

    try {
      setIsLoadingStudents(true);
      const newUser = await createStudent({
        email: newStudent.email,
        fullName: newStudent.name,
        password,
      });
      await assignStudentToClass(classItem.id, newUser.userId);
      await fetchStudentsInClass(classItem.id);
      await fetchClassesForTeacher();
      toast({
        title: "Success",
        description: `${newStudent.name} added successfully. Email: ${newStudent.email}, Password: ${password}`,
      });
      setNewStudent({ name: "", email: "", password: "" }); // Reset form
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      setIsLoadingStudents(true);
      await removeStudentFromClass(classItem.id, studentId);
      await deleteAccount(studentId);
      await fetchStudentsInClass(classItem.id);
      await fetchClassesForTeacher();
      toast({
        title: "Success",
        description: "Student removed successfully.",
      });
    } catch (error) {
      console.error("[StudentManagement] Error deleting student:", error);
      toast({
        title: "Error",
        description: "Failed to remove student.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleChangeClass = async (studentId: string, newClassId: string) => {
    try {
      setIsLoadingStudents(true);
      await removeStudentFromClass(classItem.id, studentId);
      await assignStudentToClass(newClassId, studentId);
      await fetchStudentsInClass(classItem.id);
      await fetchClassesForTeacher();
      toast({
        title: "Success",
        description: "Student moved to new class successfully.",
      });
    } catch (error) {
      console.error("[StudentManagement] Error changing class:", error);
      toast({
        title: "Error",
        description: "Failed to move student.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStudents(false);
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
        : { status: "error", message: "Failed to submit score" };
      if (response.ok && result.status === "success") {
        console.log("Deleted scores");
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to submit score",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to delete scores:", error);
      toast({
        title: "Error",
        description: "Something went wrong.",
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

export default StudentManagement;
