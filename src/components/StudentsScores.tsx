import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Trophy, Clock, Target } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";
import { Assignment, Class, Score, User } from "@/types";
import StudentScoreDetails from "./StudentScoreDetails";

type StudentsScoresProps = {
  allScores: Score[];
  studentClasses: Class[];
  assignments: Assignment[];
  classes: Class[];
  students: User[];
};

const StudentsScores = ({
  allScores,
  assignments,
  classes,
  students,
}: StudentsScoresProps) => {
  const [isScoreOpen, setIsScoreOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const { colorScheme } = useTheme();

  const getStudentScores = (studentId: string) => {
    return allScores.filter((s) => s.studentId === studentId);
  };

  const getClassName = (studentId: string) => {
    const foundClass = classes.find((classItem) =>
      classItem.students.includes(studentId)
    );
    return foundClass?.name || "No Class";
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

  const handleOpenStudentDetails = useCallback(
    (studentId: string) => {
      if (!isScoreOpen) {
        setSelectedStudentId(studentId);
        setIsScoreOpen(true);
      } else {
        console.warn("Score details are already open");
      }
    },
    [isScoreOpen]
  );

  const handleCloseStudentDetails = useCallback(() => {
    setIsScoreOpen(false);
    setSelectedStudentId(null);
  }, []);

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
        <div className="grid gap-3">
          {students.map((student) => {
            const studentScores = getStudentScores(student.userId);
            const avgAccuracy = calculateAverageAccuracy(studentScores);
            const avgWPM = calculateAverageWPM(studentScores);
            return (
              <Card
                key={student.userId}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent bubbling to parent elements
                  handleOpenStudentDetails(student.userId);
                }}
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
              </Card>
            );
          })}
          {selectedStudentId && (
            <StudentScoreDetails
              studentScores={getStudentScores(selectedStudentId)}
              assignments={assignments}
              isOpen={isScoreOpen}
              onClose={handleCloseStudentDetails}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default StudentsScores;
