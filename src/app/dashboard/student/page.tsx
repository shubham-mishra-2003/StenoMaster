"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Target, Zap, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import AssignmentList from "@/components/AssignmentList";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useClass } from "@/hooks/useClasses";
import { Assignment, Class } from "@/types";
import { useAssignment } from "@/hooks/useAssignments";
import { toast } from "@/hooks/use-toast";

const DashboardContent: React.FC = () => {
  const token = localStorage.getItem("StenoMaster-token");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentClass, setStudentClass] = useState<Class>();

  if (!user) {
    return;
  }

  const fetchClasses = async () => {
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
      if (response.ok && result.status === "success") {
        setStudentClass(result.data);
        console.log("class fetch - ", studentClass);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch student classes",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          "An unexpected error occurred while fetching student classes.",
        variant: "destructive",
      });
    }
  };

  const fetchAssignments = async (classId?: string) => {
    try {
      if (!studentClass?.id) {
        return;
      }
      console.log("Class tested - ", studentClass.id);
      const response = await fetch("/api/assignment/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, classId: classId }),
        signal: AbortSignal.timeout(5000),
      });

      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Failed to fetch assignment" };
      console.log("Ass fetch - ", result.data);
      setAssignments(result.data);
      console.log(result);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch assignment",
        variant: "destructive",
      });
    }
  };

  const scores = [
    {
      id: "score-1625738400003",
      studentId: "O5YDWjGHcCTSE3ZFd3F73",
      typedText: "The quick brown fox jumps over the lazy dog.",
      accuracy: 90,
      wpm: 40,
      timeElapsed: 10,
      completedAt: "2025-07-08T22:00:00.000Z",
      assignmentId: "assignment-1752089345210",
    },
    {
      id: "score-1625738400008",
      studentId: "O5YDWjGHcCTSE3ZFd3F72",
      assignmentId: "assignment-1752000240970",
      typedText: "The quick brown fox jumps over the lazy dog.",
      accuracy: 20,
      wpm: 60,
      timeElapsed: 5,
      completedAt: "2025-07-08T22:00:00.000Z",
    },
  ];

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

  function getAssignmentsForStudent() {
    const studentAssignments = studentClass?.assignments || [];
    setAssignments(studentAssignments);
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text"
            onClick={async () => {
              await fetchClasses().then(() => {
                fetchAssignments(studentClass?.id);
              });
            }}
          >
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
      {/* <AssignmentList  /> */}
    </div>
  );
};

export default DashboardContent;
