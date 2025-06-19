"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Assignment, Student, Score, Class } from "@/types";
import { BarChart3, Trophy, Clock, Target } from "lucide-react";

const ScoresPage = () => {
  const [students] = useLocalStorage<Student[]>("stenolearn-students", []);
  const [assignments] = useLocalStorage<Assignment[]>(
    "stenolearn-assignments",
    []
  );
  const [classes] = useLocalStorage<Class[]>("stenolearn-classes", []);
  const [scores] = useLocalStorage<Score[]>("stenolearn-scores", []);

  const getStudentScores = (studentId: string) => {
    return scores.filter((s) => s.studentId === studentId);
  };

  const getAssignmentTitle = (assignmentId: string) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    return assignment?.title || "Unknown Assignment";
  };

  const getClassName = (classId: string) => {
    const classItem = classes.find((c) => c.id === classId);
    return classItem?.name || "Unknown Class";
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-blue-200 dark:to-gray-100 bg-clip-text text-transparent">
          Student Scores
        </h2>
        <p className="text-muted-foreground">
          Track student progress and performance
        </p>
      </div>

      {students.length === 0 ? (
        <Card>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-blue-200 dark:to-gray-100 bg-clip-text text-transparent">
              No students yet
            </h3>
            <p className="text-muted-foreground text-center">
              Add students to your classes to track their progress
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {students.map((student) => {
            const studentScores = getStudentScores(student.id);
            const avgAccuracy = calculateAverageAccuracy(studentScores);
            const avgWPM = calculateAverageWPM(studentScores);

            return (
              <Card key={student.id}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{student.name}</CardTitle>
                      <p className="text-muted-foreground">
                        Class: {getClassName(student.classId)} | ID:{" "}
                        {student.id}
                      </p>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4" />
                          <span className="font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-blue-200 dark:to-gray-100 bg-clip-text text-transparent">
                            {avgAccuracy}%
                          </span>
                        </div>
                        <p className="text-muted-foreground">Avg Accuracy</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span className="font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-blue-200 dark:to-gray-100 bg-clip-text text-transparent">
                            {avgWPM}
                          </span>
                        </div>
                        <p className="text-muted-foreground">Avg WPM</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <Trophy className="h-4 w-4" />
                          <span className="font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-blue-200 dark:to-gray-100 bg-clip-text text-transparent">
                            {studentScores.length}
                          </span>
                        </div>
                        <p className="text-muted-foreground">Completed</p>
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
                      <h4 className="font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-blue-200 dark:to-gray-100 bg-clip-text text-transparent">
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

export default ScoresPage;
