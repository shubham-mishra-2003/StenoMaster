"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/ThemeProvider";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useStudentSide } from "@/hooks/useScore";
import { Score } from "@/types";
import { Clock, Target, TrendingUp, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

const StudentProgress = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { colorScheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const {
    assignments,
    fetchAssignments,
    fetchClasses,
    setAssignments,
    studentClass,
    fetchScores,
    scores,
  } = useStudentSide();

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        if (user) {
          await fetchClasses();
          await fetchScores(user.userId);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(isLoading);
      }
    };

    loadData();
  }, [isAuthenticated, user, fetchScores]);

  useEffect(() => {
    if (studentClass.length > 0) {
      fetchAssignments(studentClass[0].id);
    } else if (!isLoading && studentClass.length === 0) {
      setAssignments([]);
      if (!studentClass) {
        toast({
          title: "No Classes",
          description: "No classes found for this student.",
          variant: "destructive",
        });
      }
    }
  }, [studentClass, isLoading, user]);

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      if (!isLoading) {
        const timer = setTimeout(() => {
          toast({
            title: "Authentication Required",
            description: "Please log in to view dashboard.",
            variant: "destructive",
          });
        }, 900);
        return () => clearTimeout(timer);
      }
      return;
    }

    if (!isLoading && assignments.length === 0 && scores.length === 0) {
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
  }, [isAuthenticated, user, isLoading, assignments, scores]);

  // Get assignment title by ID
  const getAssignmentTitle = (assignmentId: string): string => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) {
      return "No Assignments";
    }
    return assignment?.title || assignment?.id;
  };

  // Calculate accuracy improvement
  const calculateImprovement = (): number => {
    if (scores.length < 2) return 0;
    const sortedScores = [...scores].sort(
      (a, b) =>
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );
    const firstFive = sortedScores.slice(0, 5);
    const lastFive = sortedScores.slice(-5);
    const firstAvg =
      firstFive.reduce((sum, s) => sum + s.accuracy, 0) / firstFive.length;
    const lastAvg =
      lastFive.reduce((sum, s) => sum + s.accuracy, 0) / lastFive.length;
    return Math.round(lastAvg - firstAvg);
  };

  // Get best score
  const getBestScore = (): Score | null => {
    if (scores.length === 0) return null;
    return scores.reduce((best, current) =>
      current.accuracy > best.accuracy ? current : best
    );
  };

  // Calculate total practice time
  const calculateTotalTime = (): string => {
    if (scores.length === 0) return "0.0";
    const totalSeconds = scores.reduce(
      (sum, score) => sum + (score.timeElapsed || 0),
      0
    );
    return (totalSeconds / 3600).toFixed(1);
  };

  const improvement = calculateImprovement();
  const bestScore = getBestScore();

  // Loading state
  // if (loading) {
  //   return (
  //     <Card>
  //       <CardContent className="flex flex-col items-center justify-center py-12">
  //         <p className="text-muted-foreground">Loading progress data...</p>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  // No data state
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold gradient-text">Your Progress</h2>
        <p className="text-muted-foreground">
          Track your stenography improvement
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Completed */}
        <Card className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-500 opacity-5 group-hover:opacity-10 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              className={`text-xl font-bold ${
                colorScheme === "dark" ? "text-dark" : "text-light"
              }`}
            >
              Total Completed
            </CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 shadow-lg">
              <Trophy className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                colorScheme === "dark" ? "text-dark" : "text-light"
              }`}
            >
              {scores.length}
            </div>
            <p className="text-xs font-medium mt-2">
              Assignment{scores.length !== 1 ? "s" : ""} finished
            </p>
          </CardContent>
        </Card>

        {/* Best Accuracy */}
        <Card className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 opacity-5 group-hover:opacity-10 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              className={`text-xl font-bold ${
                colorScheme === "dark" ? "text-dark" : "text-light"
              }`}
            >
              Best Accuracy
            </CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
              <Target className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                colorScheme === "dark" ? "text-dark" : "text-light"
              }`}
            >
              {bestScore?.accuracy || 0}%
            </div>
            <p className="text-xs font-medium mt-2">Personal best score</p>
          </CardContent>
        </Card>

        {/* Time Practiced */}
        <Card className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-500 opacity-5 group-hover:opacity-10 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              className={`text-xl font-bold ${
                colorScheme === "dark" ? "text-dark" : "text-light"
              }`}
            >
              Time Practiced
            </CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                colorScheme === "dark" ? "text-dark" : "text-light"
              }`}
            >
              {calculateTotalTime()}h
            </div>
            <p className="text-xs font-medium mt-2">Total time spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scores */}
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
