"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";
import StudentsScores from "@/components/StudentsScores";
import { useAuth } from "@/hooks/useAuth";
import { useAssignment } from "@/hooks/useAssignments";
import { useClass } from "@/hooks/useClasses";
import { useStudentAssignments } from "@/hooks/useStudentAssignments";
import { Score } from "@/types";

const TeacherDashboard = () => {
  const { user, fetchStudent, students } = useAuth();
  const { assignments, fetchAssignments } = useAssignment();
  const { classes, fetchClasses, fetchStudentsInClass } = useClass();
  const { fetchScores, scores, loading, error } = useStudentAssignments();
  const { colorScheme } = useTheme();
  const [hasFetched, setHasFetched] = useState(false);
  const [studentClasses, setStudentClasses] = useState<Record<string, string>>(
    {}
  );
  const [allScores, setAllScores] = useState<Score[]>([]);

  useEffect(() => {
    if (!user?.userType || user.userType !== "teacher" || hasFetched) {
      return;
    }

    const fetchData = async () => {
      try {
        await fetchClasses();
        await fetchStudent();
        await fetchAssignments();
        const studentClassMap: Record<string, string> = {};
        const aggregatedScores: Score[] = [];

        for (const classItem of classes) {
          const studentsInClass = await fetchStudentsInClass(classItem.id);
          for (const student of studentsInClass) {
            studentClassMap[student.userId] = classItem.id;
            await fetchScores(student.userId);
            aggregatedScores.push(
              ...scores.filter((s) => s.studentId === student.userId)
            );
          }
        }

        setStudentClasses(studentClassMap);
        setAllScores(aggregatedScores);
        setHasFetched(true);
      } catch (err) {
        console.error("[TeacherDashboard] Error fetching data:", err);
      }
    };

    fetchData();
  }, [
    user,
    fetchClasses,
    fetchStudent,
    fetchStudentsInClass,
    fetchScores,
    classes,
    scores,
    hasFetched,
  ]);

  if (!students || !assignments || !classes) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg font-semibold">Loading...</p>
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
      title: "Active Assignments",
      value: assignments.length,
      icon: BookOpen,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Students",
      value: students.length,
      icon: Users,
      color: "from-indigo-500 to-indigo-600",
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
      <StudentsScores />
    </div>
  );
};

export default TeacherDashboard;
