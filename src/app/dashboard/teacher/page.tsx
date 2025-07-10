"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";
import StudentsScores from "@/components/StudentsScores";
import { useAuth } from "@/hooks/useAuth";
import { useAssignment } from "@/hooks/useAssignments";
import { useClass } from "@/hooks/useClasses";
import { Score } from "@/types";

const TeacherDashboard = () => {
  const { user, fetchStudent, students } = useAuth();
  const { assignments, fetchAssignments } = useAssignment();
  const { classes, fetchClasses, fetchStudentsInClass } = useClass();
  const { colorScheme } = useTheme();
  const [hasFetched, setHasFetched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentClasses, setStudentClasses] = useState<Record<string, string>>(
    {}
  );
  const [allScores, setAllScores] = useState<Score[]>([]);

  useEffect(() => {
    if (!user?.userType || user.userType !== "teacher" || hasFetched) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchClasses(), fetchStudent(), fetchAssignments()]);

        const studentClassMap: Record<string, string> = {};
        const aggregatedScores: Score[] = [];
        const token = localStorage.getItem("StenoMaster-token");

        const fetchPromises = classes.map(async (classItem) => {
          const studentsInClass = await fetchStudentsInClass(classItem.id);
          const scorePromises = studentsInClass.map(async (student) => {
            studentClassMap[student.userId] = classItem.id;
            const response = await fetch("/api/score/fetch", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ studentId: student.userId, token }),
              signal: AbortSignal.timeout(5000),
            });

            const text = await response.text();
            const result = text
              ? JSON.parse(text)
              : { status: "error", message: "Empty response from server" };

            if (result.status === "success" && Array.isArray(result.data)) {
              aggregatedScores.push(...result.data);
            } else {
              console.warn(`No scores for student ${student.userId}`);
            }
          });
          return Promise.all(scorePromises);
        });

        await Promise.all(fetchPromises);

        setStudentClasses(studentClassMap);
        setAllScores(aggregatedScores);
        setHasFetched(true);
      } catch (err) {
        console.error("[TeacherDashboard] Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, classes, hasFetched]);

  if (loading || !students || !assignments || !classes) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse mt-2 rounded" />
          </div>
        </div>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse h-8 w-8" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Classes",
      value: classes.length,
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Assignments",
      value: assignments.length,
      icon: BookOpen,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Students",
      value: students.length,
      icon: Users,
      color: "from-indigo-500 Otis500 to-indigo-600",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text">
            Teacher Dashboard
          </h1>
          <p
            className={`text-sm sm:text-base font-semibold mt-1 ${
              colorScheme == "dark" ? "text-dark-muted" : "text-light-muted"
            }`}
          >
            Manage your classes and track student progress
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3 lg:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="group">
              <div
                className={`absolute group-hover:opacity-10 inset-0 bg-gradient-to-br ${stat.color} opacity-5`}
              ></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm sm:text-[16px] font-medium">
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
                    colorScheme == "dark" ? "text-dark" : "text-light"
                  }`}
                >
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <StudentsScores
        allScores={allScores}
        studentClasses={studentClasses}
        assignments={assignments}
        classes={classes}
        students={students}
      />
    </div>
  );
};

export default TeacherDashboard;
