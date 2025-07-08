"use client";

import React, { createContext, useContext, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Target, Clock, Trophy } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useStudentAssignments } from "@/hooks/useStudentAssignments";
import { toast } from "@/hooks/use-toast";
import { Assignment, Score } from "@/types";

// Context for assignments data
const AssignmentsContext = createContext<ReturnType<
  typeof useStudentAssignments
> | null>(null);

// Provider to wrap children with assignments context
const AssignmentsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const assignmentsHook = useStudentAssignments();
  return (
    <AssignmentsContext.Provider value={assignmentsHook}>
      {children}
    </AssignmentsContext.Provider>
  );
};

// Hook to access assignments context
const useAssignments = () => {
  const context = useContext(AssignmentsContext);
  if (!context) {
    throw new Error(
      "useAssignments must be used within an AssignmentsProvider"
    );
  }
  return context;
};

// Main component for rendering student progress
const StudentProgressContent: React.FC<{ classId?: string }> = ({ classId }) => {
  const { colorScheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { scores, assignments, loading, error, fetchAssignments, fetchScores } =
    useAssignments();

  // Handle authentication and data fetching
  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      const timer = setTimeout(() => {
        toast({
          title: "Authentication Required",
          description: "Please log in to view progress.",
          variant: "destructive",
        });
      }, 9000);
      return () => clearTimeout(timer);
    }

    fetchScores(user.userId);

    if (classId) {
      fetchAssignments(classId);
    } else {
      const timer = setTimeout(() => {
        toast({
          title: "Warning",
          description: "No class ID provided. Unable to fetch assignments.",
          variant: "destructive",
        });
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [user, isAuthenticated, classId, fetchAssignments, fetchScores]);

  // Handle error notifications
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  // Get assignment title by ID
  const getAssignmentTitle = (assignmentId: string): string => {
    if (assignmentId === "typing-test") return "Typing Test";
    const assignment = assignments.find((a) => a.id === assignmentId);
    return assignment?.title || "Unknown Assignment";
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
  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Loading progress data...</p>
        </CardContent>
      </Card>
    );
  }

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

// Wrapper component with provider
const StudentProgress: React.FC<{ classId?: string }> = ({ classId }) => (
  <AssignmentsProvider>
    <StudentProgressContent classId={classId} />
  </AssignmentsProvider>
);

export default StudentProgress;