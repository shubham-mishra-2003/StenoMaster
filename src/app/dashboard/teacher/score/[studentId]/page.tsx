"use client";

import StudentScoreDetails from "@/components/StudentScoreDetails";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/hooks/ThemeProvider";
import { useScore } from "@/hooks/useScore";
import { Score } from "@/types";
import { BookOpen, Users } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";

const page = () => {
  const params = useParams();
  const studentID = params.studentId as string;
  const { colorScheme } = useTheme();
  const { scores, assignments, studentsInClass } = useScore();

  const [selectedScore, setSelectedScore] = useState<Score | null>(null);

  const getStudentScores = (studentId: string) => {
    return scores.filter((s) => s.studentId === studentId);
  };

  const studentScores = getStudentScores(studentID);

  const getAssignmentTitle = (assignmentId: string): string => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (assignment) {
      return assignment.title;
    }
    const score = studentScores.find((s) => s.assignmentId === assignmentId);
    return score ? score.assignmentId : assignmentId;
  };

  if (!studentsInClass.find((s) => s.userId === studentID)) {
    return <div>Student not found</div>;
  }

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

  const stats = [
    {
      title: "Total Assignments Completed",
      value: assignments.length,
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Average Accuracy",
      value: `${calculateAverageAccuracy(studentScores)}%`,
      icon: BookOpen,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Average WPM",
      value: `${calculateAverageWPM(studentScores)} WPM`,
      icon: Users,
      color: "from-indigo-500 Otis500 to-indigo-600",
    },
  ];

  return (
    <div className="flex flex-col gap-2 sm:gap-4 lg:gap-6 size-full overflow-hidden">
      <div className="flex items-center gap-4 justify-between w-full">
        <div>
          <p
            className={`text-xl sm:text-base font-bold mt-1 ${
              colorScheme == "dark" ? "text-dark-muted" : "text-light-muted"
            }`}
          >
            Student's Submissions
          </p>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text">
            {studentsInClass.find((s) => s.userId === studentID)?.fullName}
          </h1>
        </div>
        <div className="flex gap-4 w-full sm:w-auto lg:w-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex font-bold flex-col items-center justify-center"
            >
              {stat.title}
              <p className="gradient-text font-bold text-sm sm:text-lg md:text-xl lg:text-2xl">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {studentScores.length === 0 ? (
        <Card className="flex h-48 w-full items-center justify-center p-0">
          <p
            className={`font-bold text-center${
              colorScheme === "dark" ? "text-dark-muted" : "text-light-muted"
            }`}
          >
            No Assignments completed yet
          </p>
        </Card>
      ) : (
        <Card className="flex h-full overflow-auto">
          <CardContent className="flex flex-col gap-4 size-full p-4 overflow-auto">
            {studentScores
              .sort(
                (a, b) =>
                  new Date(b.completedAt).getTime() -
                  new Date(a.completedAt).getTime()
              )
              .map((score, index) => (
                <div
                  key={index}
                  className={`flex gap-4 mb-2 last:mb-0 border-2 p-4 rounded-xl items-center justify-between cursor-pointer hover:shadow-sm transition-all duration-200 ease-in-out ${
                    colorScheme == "dark"
                      ? "from-gray-900/80 via-gray-800/60 to-gray-700/40 border-slate-700 hover:bg-slate-800"
                      : "from-white/80 via-white/60 to-white/40 border-slate-200 hover:bg-slate-100"
                  }`}
                  onClick={() => setSelectedScore(score)}
                >
                  <h1 className="font-bold flex items-center truncate text-sm sm:text-xl lg:text-2xl w-full">
                    {index + 1}. {getAssignmentTitle(score.assignmentId)}
                  </h1>
                  <div
                    className={`flex font-bold gap-2 items-center justify-end text-[12px] sm:text-sm w-full lg:text-base ${
                      colorScheme === "dark"
                        ? "text-dark-muted"
                        : "text-light-muted"
                    }`}
                  >
                    <p>
                      Completed at -{" "}
                      {new Date(score.completedAt).toLocaleDateString()}
                    </p>
                    |<p>Accuracy - {score.accuracy}%</p>|
                    <p>WPM - {score.wpm} WPM</p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
      {selectedScore && (
        <StudentScoreDetails
          assignments={assignments}
          score={selectedScore}
          isOpen={!!selectedScore}
          onClose={() => setSelectedScore(null)}
        />
      )}
    </div>
  );
};

export default page;
