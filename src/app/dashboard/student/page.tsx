"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Target, Zap, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import AssignmentList from "@/components/AssignmentList";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { Assignment, Class, Score } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useStudentAssignments } from "@/hooks/useStudentAssignments";

const DashboardContent: React.FC = () => {
  const token = localStorage.getItem("StenoMaster-token");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { colorScheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { scores, loading: scoresLoading, error, fetchScores } = useStudentAssignments();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentClass, setStudentClass] = useState<Class[]>([]);
  const router = useRouter();

  const fetchClasses = async () => {
    if (loading || !token) return;
    setLoading(true);
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "getStudentClasses" }),
      });

      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Empty response from server" };

      if (
        response.ok &&
        result.status === "success" &&
        Array.isArray(result.data)
      ) {
        setStudentClass(result.data);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch student classes",
          variant: "destructive",
        });
        setStudentClass([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          "An unexpected error occurred while fetching student classes.",
        variant: "destructive",
      });
      setStudentClass([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (classId: string) => {
    try {
      const response = await fetch("/api/assignment/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, classId }),
        signal: AbortSignal.timeout(5000),
      });
      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Failed to fetch assignment" };

      if (response.ok && result.status === "success") {
        setAssignments(result.data);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch assignments",
          variant: "destructive",
        });
        setAssignments([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive",
      });
      setAssignments([]);
    }
  };

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
        setIsLoading(scoresLoading || loading);
      }
    };

    loadData();
  }, [isAuthenticated, user, fetchScores]);

  useEffect(() => {
    if (studentClass.length > 0) {
      fetchAssignments(studentClass[0].id);
    } else if (!loading && studentClass.length === 0) {
      setAssignments([]);
      if (user) {
        toast({
          title: "No Classes",
          description: "No classes found for this student.",
          variant: "destructive",
        });
      }
    }
  }, [studentClass, loading, user]);

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      if (!scoresLoading && !loading) {
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

    if (error) {
      const timer = setTimeout(() => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      }, 900);
      return () => clearTimeout(timer);
    }

    if (!scoresLoading && !loading && assignments.length === 0 && scores.length === 0) {
      const timer = setTimeout(() => {
        toast({
          title: "No Data Available",
          description: "You have no assignments or scores to display at this time.",
          variant: "default",
        });
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, scoresLoading, loading, error, assignments, scores]);

  const calculateAverageWPM = (): string => {
    if (scores.length === 0) return "0";
    const totalWPM = scores.reduce((sum, score) => sum + score.wpm, 0);
    return Math.round(totalWPM / scores.length).toString();
  };

  const calculateAverageAccuracy = (): string => {
    if (scores.length === 0) return "0";
    const totalAccuracy = scores.reduce((sum, score) => sum + score.accuracy, 0);
    return Math.round(totalAccuracy / scores.length).toString();
  };

  const calculateTotalTime = (): string => {
    if (scores.length === 0) return "0.0";
    const totalSeconds = scores.reduce((sum, score) => sum + (score.timeElapsed || 0), 0);
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
    {
      title: "Time Practiced",
      value: `${calculateTotalTime()}h`,
      icon: Clock,
      color: "from-orange-500 to-orange-600",
    },
  ];

  if (isLoading && !isAuthenticated && !user) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">
        <p>Please log in to view your dashboard.</p>
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AssignmentList assignments={assignments}/>

      {assignments.length === 0 && scores.length === 0 && !scoresLoading && !loading && (
        <p
          className={`text-sm sm:text-base mt-4 ${
            colorScheme === "dark" ? "text-dark" : "text-light"
          }`}
        >
          No assignments or scores available at this time.
        </p>
      )}
    </div>
  );
};

export default DashboardContent;