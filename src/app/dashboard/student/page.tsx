"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Target, Zap, Clock } from "lucide-react";
import { Assignment, Score } from "@/types";
import { useRouter } from "next/navigation";
import AssignmentList from "@/components/AssignmentList";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const StudentDashboard: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { colorScheme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.userId) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view dashboard.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [assignmentsResponse, scoresResponse] = await Promise.all([
          fetch("/api/student/assignments"),
          fetch(`/api/student/scores?studentId=${user.userId}`)
        ]);

        if (!assignmentsResponse.ok || !scoresResponse.ok) {
          throw new Error(
            `Failed to fetch data: Assignments(${assignmentsResponse.status}), Scores(${scoresResponse.status})`
          );
        }

        const assignmentsData: Assignment[] = await assignmentsResponse.json();
        const scoresData: Score[] = await scoresResponse.json();

        const processedScores = scoresData.map((score) => ({
          ...score,
          completedAt: new Date(score.completedAt)
        }));

        setScores(processedScores);
        setAssignments(assignmentsData);
      } catch (error: any) {
        console.error("[StudentDashboard] Error fetching data:", error.message);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

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
      change: "+3 this week",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Average Speed",
      value: `${calculateAverageWPM()} WPM`,
      icon: Zap,
      change: "+5 WPM improved",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Accuracy",
      value: `${calculateAverageAccuracy()}%`,
      icon: Target,
      change: "+3% this month",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Time Practiced",
      value: `${calculateTotalTime()}h`,
      icon: Clock,
      change: "This week",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const handleStartPractice = () => {
    router.push("/dashboard/student/practice");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

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
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className={`relative group overflow-hidden bg-gradient-to-br backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                colorScheme === "dark"
                  ? "from-gray-900/80 via-gray-800/60 to-gray-700/40"
                  : "from-white/80 via-white/60 to-white/40"
              }`}
            >
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
                <p
                  className={`text-xs mt-1 ${
                    colorScheme === "dark" ? "text-dark" : "text-light"
                  }`}
                >
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <AssignmentList
        assignments={assignments}
        onStartPractice={handleStartPractice}
      />
    </div>
  );
};

export default StudentDashboard;
