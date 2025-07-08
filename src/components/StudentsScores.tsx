"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Trophy, Clock, Target } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";
import { useStudentAssignments } from "@/hooks/useStudentAssignments";
import { useAuth } from "@/hooks/useAuth";
import { Assignment, Score, User } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useClass } from "@/hooks/useClasses";
import { useAssignment } from "@/hooks/useAssignments";

const StudentsScores = () => {
  const { scores, fetchScores, loading, error } = useStudentAssignments();
  const { user, fetchStudent, students } = useAuth();
  const { colorScheme } = useTheme();
  const { classes, fetchClasses } = useClass();
  const { fetchAssignments, assignments } = useAssignment();

  useEffect(() => {
    fetchStudent();
  }, []);

  const getStudentScores = (studentId: string) => {
    return scores.filter((s) => s.studentId === studentId);
  };

  const getAssignmentTitle = (assignmentId: string) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    return assignment?.title || "Unknown Assignment";
  };

  const getClassName = (classId: string) => {
    return classId ? `Class ${classId}` : "Unknown Class"; // Replace with actual class name fetching if available
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

  if (loading || !students || !user) {
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
            const studentScores = getStudentScores(student.userId);
            const avgAccuracy = calculateAverageAccuracy(studentScores);
            const avgWPM = calculateAverageWPM(studentScores);

            return (
              <Card key={student.userId}>
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
                        Class: {getClassName(student.classId || "")} | ID:{" "}
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
                <CardContent>
                  {studentScores.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No assignments completed yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <h4
                        className={`text-xl font-semibold ${
                          colorScheme === "dark" ? "text-dark" : "text-light"
                        }`}
                      >
                        Recent Assignments
                      </h4>
                      <div className="space-y-2">
                        {studentScores
                          .sort(
                            (a, b) =>
                              new Date(b.completedAt).getTime() -
                              new Date(a.completedAt).getTime()
                          )
                          .slice(0, 5)
                          .map((score) => (
                            <div
                              key={score.id}
                              className="flex items-center justify-between p-3 bg-gradient-to-r from-white/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-950/50 rounded-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/20"
                            >
                              <div>
                                <p className="font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-blue-200 dark:to-gray-100 bg-clip-text text-transparent">
                                  {getAssignmentTitle(score.assignmentId)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Completed{" "}
                                  {new Date(
                                    score.completedAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="flex space-x-4 text-sm">
                                  <span className="font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-blue-200 dark:to-gray-100 bg-clip-text text-transparent">
                                    {score.accuracy}%
                                  </span>
                                  <span className="text-muted-foreground">
                                    {score.wpm} WPM
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentsScores;
