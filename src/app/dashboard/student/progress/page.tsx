"use client";

import React, { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Target, Clock, Trophy } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useAssignments, AssignmentsProvider } from "@/hooks/use-StudentAssignments";
import { toast } from "@/hooks/use-toast";
import { Score } from "@/types";

const StudentProgressContent: React.FC = () => {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const { scores, assignments, loading, error } = useAssignments();

  useEffect(() => {
    if (!user?.userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view progress.",
        variant: "destructive",
      });
    }
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [user, error]);

  const getAssignmentTitle = (assignmentId: string): string => {
    if (assignmentId === "typing-test") return "Typing Test";
    const assignment = assignments.find((a) => a.id === assignmentId);
    return assignment?.title || "Unknown Assignment";
  };

  const calculateImprovement = (): number => {
    if (scores.length < 2) return 0;
    const sortedScores = [...scores].sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());
    const firstFive = sortedScores.slice(0, 5);
    const lastFive = sortedScores.slice(-5);
    const firstAvg = firstFive.reduce((sum, s) => sum + s.accuracy, 0) / firstFive.length;
    const lastAvg = lastFive.reduce((sum, s) => sum + s.accuracy, 0) / lastFive.length;
    return Math.round(lastAvg - firstAvg);
  };

  const getBestScore = (): Score | null => {
    if (scores.length === 0) return null;
    return scores.reduce((best, current) => (current.accuracy > best.accuracy ? current : best));
  };

  const calculateTotalTime = (): string => {
    if (scores.length === 0) return "0.0";
    const totalSeconds = scores.reduce((sum, score) => sum + (score.timeElapsed || 0), 0);
    return (totalSeconds / 3600).toFixed(1);
  };

  const improvement = calculateImprovement();
  const bestScore = getBestScore();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Loading progress data...</p>
        </CardContent>
      </Card>
    );
  }

  if (scores.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>
            No progress data yet
          </h3>
          <p className={`text-center mb-2 ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>
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
        <p className="text-muted-foreground">Track your stenography improvement</p>
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Completed */}
        <Card className="group">
          <div className="absolute opacity-5 group-hover:opacity-10 inset-0 bg-gradient-to-br from-green-500 to-green-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-xl font-bold ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>Total Completed</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 shadow-lg">
              <Trophy className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>{scores.length}</div>
            <p className="text-xs font-medium mt-2">Assignment{scores.length !== 1 ? "s" : ""} finished</p>
          </CardContent>
        </Card>

        {/* Best Accuracy */}
        <Card className="group">
          <div className="absolute opacity-5 group-hover:opacity-10 inset-0 bg-gradient-to-br from-blue-500 to-purple-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-xl font-bold ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>Best Accuracy</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
              <Target className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>{bestScore?.accuracy || 0}%</div>
            <p className="text-xs font-medium mt-2">Personal best score</p>
          </CardContent>
        </Card>

        {/* Time Practiced */}
        <Card className="group">
          <div className="absolute opacity-5 group-hover:opacity-10 inset-0 bg-gradient-to-br from-orange-500 to-pink-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-xl font-bold ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>Time Practiced</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>{calculateTotalTime()}h</div>
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
              .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
              .slice(0, 10)
              .map((score) => (
                <div
                  key={score.id}
                  className={`flex items-center justify-between p-3 bg-gradient-to-r rounded-lg backdrop-blur-sm border ${
                    colorScheme === "dark"
                      ? "from-gray-800/30 to-blue-950/30 border-gray-500"
                      : "from-blue-500/10 to-blue-50/10 border-blue-500/60"
                  }`}
                >
                  <div>
                    <p className={`font-medium ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>{getAssignmentTitle(score.assignmentId)}</p>
                    <p className={`text-sm ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>
                      {score.completedAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })} at{" "}
                      {score.completedAt.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="text-right flex space-x-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center">
                        <Target className="h-3 w-3 mr-1" />
                        <p className={`font-bold ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>{score.accuracy}%</p>
                      </div>
                      <div className={`text-sm ${colorScheme === "dark" ? "text-dark-muted" : "text-light-muted"}`}>Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <p className={`font-bold ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>{score.wpm}</p>
                      </div>
                      <div className={`text-sm ${colorScheme === "dark" ? "text-dark-muted" : "text-light-muted"}`}>WPM</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StudentProgress: React.FC = () => (
  <AssignmentsProvider>
    <StudentProgressContent />
  </AssignmentsProvider>
);

export default StudentProgress;
