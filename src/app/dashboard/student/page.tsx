"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Target, Zap } from "lucide-react";
import AssignmentList from "@/components/AssignmentList";
import { useTheme } from "@/hooks/ThemeProvider";
import { useScore } from "@/hooks/useScore";

const DashboardContent: React.FC = () => {
  const { colorScheme } = useTheme();
  const { assignments, scores } = useScore();

  const calculateAverageWPM = (): string => {
    if (scores.length === 0) return "0";
    const totalWPM = scores.reduce((sum, score) => sum + score.wpm, 0);
    return Math.round(totalWPM / scores.length).toString();
  };

  const calculateAverageAccuracy = (): string => {
    if (scores.length === 0) return "0";
    const totalAccuracy = scores.reduce(
      (sum, score) => sum + score.accuracy,
      0
    );
    return Math.round(totalAccuracy / scores.length).toString();
  };

  const calculateTotalTime = (): string => {
    if (scores.length === 0) return "0.0";
    const totalSeconds = scores.reduce(
      (sum, score) => sum + (score.timeElapsed || 0),
      0
    );
    return (totalSeconds / 3600).toFixed(1);
  };

  const stats = [
    {
      title: "Assignments Done",
      value: scores.length.toString(),
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Average Speed",
      value: `${calculateAverageWPM()} WPM`,
      icon: Zap,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Accuracy",
      value: `${calculateAverageAccuracy()}%`,
      icon: Target,
      color: "from-green-500 to-green-600",
    },
  ];

  const availableAssignments = assignments.filter(
    (assignment) =>
      !scores.some((score) => score.assignmentId === assignment.id)
  );

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text">
            Student Dashboard
          </h1>
          <p
            className={`text-sm sm:text-base mt-1 ${
              colorScheme === "dark" ? "text-dark" : "text-light"
            }`}
          >
            Track your progress and practice stenography
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="group">
              <div
                className={`absolute group-hover:opacity-10 inset-0 bg-gradient-to-br ${stat.color} opacity-5`}
              ></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle
                  className={`text-xs sm:text-sm font-medium ${
                    colorScheme === "dark" ? "text-dark" : "text-light"
                  }`}
                >
                  {stat.title}
                </CardTitle>
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div
                  className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                    colorScheme === "dark" ? "text-dark" : "text-light"
                  }`}
                >
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AssignmentList assignments={availableAssignments} />
    </div>
  );
};

export default DashboardContent;
