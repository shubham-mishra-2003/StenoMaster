"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Trophy, Clock, Target } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";
import { useStudentAssignments } from "@/hooks/useStudentAssignments";
import { useAuth } from "@/hooks/useAuth";
import { useClass } from "@/hooks/useClasses";
import { useAssignment } from "@/hooks/useAssignments";
import { toast } from "@/hooks/use-toast";
import { Score } from "@/types";
import StudentScoreDetails from "./StudentScoreDetails";

const StudentsScores = () => {
  const [allScores, setAllScores] = useState<Score[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [hasFetchedClasses, setHasFetchedClasses] = useState(false);
  const [studentClasses, setStudentClasses] = useState<Record<string, string>>(
    {}
  );
  const { user, fetchStudent, students } = useAuth();
  const { colorScheme } = useTheme();
  const { classes, fetchClasses, fetchStudentsInClass } = useClass();
  const { fetchAssignments, assignments } = useAssignment();
  const [isScoreOpen, setIsScoreOpen] = useState(false);
  const [apiScore, setAPIScore] = useState<Score[]>([]);

  useEffect(() => {
    if (!user?.userType || user.userType !== "teacher" || hasFetchedClasses) {
      console.log(
        "[StudentsScores] Skipping fetch: Not a teacher or already fetched"
      );
      return;
    }

    const fetchInitialData = async () => {
      try {
        await fetchClasses();
        await fetchStudent();
        setHasFetchedClasses(true);
      } catch (err) {
        console.error("[StudentsScores] Error fetching initial data:", err);
        toast({
          title: "Error",
          description: "Failed to load classes or students.",
          variant: "destructive",
        });
      }
    };

    fetchInitialData();
  }, [user, fetchClasses, fetchStudent, hasFetchedClasses]);

  useEffect(() => {
    if (
      !user?.userType ||
      user.userType !== "teacher" ||
      hasFetched ||
      classes.length === 0 ||
      !students
    ) {
      return;
    }

    const token = localStorage.getItem("StenoMaster-token");

    const fetchAllData = async () => {
      try {
        const studentClassMap: Record<string, string> = {};
        const aggregatedScores: Score[] = [];

        for (const classItem of classes) {
          await fetchAssignments(classItem.id);
          const studentsInClass = await fetchStudentsInClass(classItem.id);
          console.log("In class students - ", studentsInClass);

          for (const student of studentsInClass) {
            studentClassMap[student.userId] = classItem.id;
            console.log(`Student - ${student.userId}`);

            const response = await fetch("/api/score/fetch", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ studentId: student.userId, token }),
              signal: AbortSignal.timeout(5000),
            });

            const text = await response.text();
            const result = text
              ? JSON.parse(text)
              : { status: "error", message: "Empty response from server" };

            if (result.status === "success" && Array.isArray(result.data)) {
              aggregatedScores.push(...result.data);
              console.log("response from fetch API - ", result.data);
            } else {
              console.warn(`No scores for student ${student.userId}`);
            }
          }
        }

        setStudentClasses(studentClassMap);
        setAPIScore(aggregatedScores); // Set all scores at once
        setHasFetched(true);
      } catch (err) {
        console.error("[StudentsScores] Error fetching data:", err);
        toast({
          title: "Error",
          description: "Failed to load student scores or assignments.",
          variant: "destructive",
        });
      }
    };

    fetchAllData();
  }, [
    user,
    classes,
    students,
    hasFetched,
    fetchAssignments,
    fetchStudentsInClass,
  ]);

  const getStudentScores = (studentId: string) => {
    return apiScore.filter((s) => s.studentId === studentId);
  };

  const getAssignmentTitle = (assignmentId: string) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    return assignment?.title || "Unknown Assignment";
  };

  const getClassName = (studentId: string) => {
    const classId = studentClasses[studentId];
    if (!classId) return "Unknown Class";
    const classItem = classes.find((c) => c.id === classId);
    return classItem?.name || `Class ${classId}`;
  };

  const calculateAverageAccuracy = (studentScores: Score[]) => {
    if (studentScores.length === 0) return 0;
    const total = studentScores.reduce((sum, score) => sum + score.accuracy, 0);
    return Math.round(total / studentScores.length);
  };

  const calculateAverageWPM = (studentScores: Score[]) => {
    if (studentScores.length === 0) return 0;
    const total = studentScores.reduce((sum, score) => sum + score.wpm, 0);
    return Math.round(total / studentScores.length);
  };

  if (!students || !user) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Loading scores...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="gradient-text text-2xl font-bold">Student Scores</h2>
        <p
          className={
            colorScheme === "dark" ? "text-dark-muted" : "text-light-muted"
          }
        >
          Track student progress and performance
        </p>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3
              className={`text-lg font-semibold mb-2 ${
                colorScheme === "dark" ? "text-dark-muted" : "text-light-muted"
              }`}
            >
              No students yet
            </h3>
            <p
              className={
                colorScheme === "dark"
                  ? "text-dark-muted text-center"
                  : "text-light-muted text-center"
              }
            >
              Add students to your classes to track their progress
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {students.map((student) => {
            const studentScores = apiScore;
            const avgAccuracy = calculateAverageAccuracy(studentScores);
            const avgWPM = calculateAverageWPM(studentScores);

            return (
              <Card
                key={student.userId}
                onClick={() => setIsScoreOpen(true)}
                className="cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {student.fullName}
                      </CardTitle>
                      <p
                        className={
                          colorScheme === "dark"
                            ? "text-dark-muted"
                            : "text-light-muted"
                        }
                      >
                        Class: {getClassName(student.userId)} | ID:{" "}
                        {student.userId}
                      </p>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4" />
                          <span
                            className={`text-xl font-semibold ${
                              colorScheme === "dark"
                                ? "text-dark"
                                : "text-light"
                            }`}
                          >
                            {avgAccuracy}%
                          </span>
                        </div>
                        <p
                          className={
                            colorScheme === "dark"
                              ? "text-dark-muted"
                              : "text-light-muted"
                          }
                        >
                          Avg Accuracy
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span
                            className={`text-xl font-semibold ${
                              colorScheme === "dark"
                                ? "text-dark"
                                : "text-light"
                            }`}
                          >
                            {avgWPM}
                          </span>
                        </div>
                        <p
                          className={
                            colorScheme === "dark"
                              ? "text-dark-muted"
                              : "text-light-muted"
                          }
                        >
                          Avg WPM
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <Trophy className="h-4 w-4" />
                          <span
                            className={`text-xl font-semibold ${
                              colorScheme === "dark"
                                ? "text-dark"
                                : "text-light"
                            }`}
                          >
                            {studentScores.length}
                          </span>
                        </div>
                        <p
                          className={
                            colorScheme === "dark"
                              ? "text-dark-muted"
                              : "text-light-muted"
                          }
                        >
                          Completed
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <StudentScoreDetails
                  studentScores={studentScores}
                  assignments={assignments}
                  isOpen={isScoreOpen}
                  onClose={() => setIsScoreOpen(false)}
                />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentsScores;
