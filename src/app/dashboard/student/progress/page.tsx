"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/ThemeProvider";
import { toast } from "@/hooks/use-toast";
import { useScore } from "@/hooks/useScore";
import { Score } from "@/types";
import { Clock, Target, TrendingUp, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

const StudentProgress = () => {
  const { colorScheme } = useTheme();
  const { assignments, scores } = useScore();

  useEffect(() => {
    if (assignments.length === 0 && scores.length === 0) {
      const timer = setTimeout(() => {
        toast({
          title: "No Data Available",
          description:
            "You have no assignments or scores to display at this time.",
          variant: "default",
        });
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [assignments, scores]);

  const getAssignmentTitle = (assignmentId: string): string => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (assignment) {
      return assignment.title;
    }
    const score = scores.find((s) => s.assignmentId === assignmentId);
    return score ? score.assignmentId : assignmentId;
  };

  // const calculateImprovement = (): number => {
  //   if (scores.length < 2) return 0;
  //   const sortedScores = [...scores].sort(
  //     (a, b) =>
  //       new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  //   );
  //   const firstFive = sortedScores.slice(0, 5);
  //   const lastFive = sortedScores.slice(-5);
  //   const firstAvg =
  //     firstFive.reduce((sum, s) => sum + s.accuracy, 0) / firstFive.length;
  //   const lastAvg =
  //     lastFive.reduce((sum, s) => sum + s.accuracy, 0) / lastFive.length;
  //   return Math.round(lastAvg - firstAvg);
  // };

  const getBestScore = (): Score | null => {
    if (scores.length === 0) return null;
    return scores.reduce((best, current) =>
      current.accuracy > best.accuracy ? current : best
    );
  };

  const calculateTotalTime = (): string => {
    if (scores.length === 0) return "0.0";
    const totalSeconds = scores.reduce(
      (sum, score) => sum + (score.timeElapsed || 0),
      0
    );
    return (totalSeconds / 3600).toFixed(1);
  };

  const bestScore = getBestScore();
  if (scores.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h3
            className={`text-lg font-semibold mb-2 ${
              colorScheme === "dark" ? "text-dark" : "text-light"
            }`}
          >
            No progress data yet
          </h3>
          <p
            className={`text-center mb-2 ${
              colorScheme === "dark" ? "text-dark" : "text-light"
            }`}
          >
            Complete some assignments or typing tests to see your progress here!
          </p>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      title: "Total Completed",
      icon: Trophy,
      value: scores.length,
      description: `Assignment${scores.length > 1 ? "s" : ""} Completed`,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Best Accuracy",
      icon: Target,
      value: bestScore?.accuracy,
      description: `Assignment${scores.length > 1 ? "s" : ""} Completed`,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Total Completed",
      icon: Clock,
      value: `${calculateTotalTime()}h`,
      description: `Assignment${scores.length > 1 ? "s" : ""} Completed`,
      color: "from-green-500 to-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold gradient-text">Your Progress</h2>
        <p className="text-muted-foreground">
          Track your stenography improvement
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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

      <Card>
        <CardHeader>
          <CardTitle>Recent Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scores
              .sort(
                (a, b) =>
                  new Date(b.completedAt).getTime() -
                  new Date(a.completedAt).getTime()
              )
              .slice(0, 10)
              .map((score) => {
                const completedAt = new Date(score.completedAt);
                return (
                  <div
                    key={score.id}
                    className={`flex items-center justify-between p-3 rounded-lg border backdrop-blur-sm ${
                      colorScheme === "dark"
                        ? "bg-gradient-to-r from-gray-800/30 to-blue-950/30 border-gray-500"
                        : "bg-gradient-to-r from-blue-50/10 to-blue-500/10 border-blue-500/60"
                    }`}
                  >
                    <div>
                      <p
                        className={`font-medium ${
                          colorScheme === "dark" ? "text-dark" : "text-light"
                        }`}
                      >
                        {getAssignmentTitle(score.assignmentId)}
                      </p>
                      <p
                        className={`text-sm ${
                          colorScheme === "dark" ? "text-dark" : "text-light"
                        }`}
                      >
                        {completedAt.toLocaleDateString("en-IN", {
                          timeZone: "Asia/Kolkata",
                        })}{" "}
                        at{" "}
                        {completedAt.toLocaleTimeString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <div className="text-center">
                        <div className="flex items-center">
                          <Target className="h-3 w-3 mr-1" />
                          <p
                            className={`font-bold ${
                              colorScheme === "dark"
                                ? "text-dark"
                                : "text-light"
                            }`}
                          >
                            {score.accuracy}%
                          </p>
                        </div>
                        <p
                          className={`text-sm ${
                            colorScheme === "dark"
                              ? "text-dark-muted"
                              : "text-light-muted"
                          }`}
                        >
                          Accuracy
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <p
                            className={`font-bold ${
                              colorScheme === "dark"
                                ? "text-dark"
                                : "text-light"
                            }`}
                          >
                            {score.wpm}
                          </p>
                        </div>
                        <p
                          className={`text-sm ${
                            colorScheme === "dark"
                              ? "text-dark-muted"
                              : "text-light-muted"
                          }`}
                        >
                          WPM
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProgress;
