"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, RefreshCcw } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";
import StudentsScores from "@/components/StudentsScores";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useScore } from "@/hooks/useScore";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { colorScheme } = useTheme();

  const [fetched, setFetched] = useState({
    data: false,
    assignment: false,
    teacherClass: false,
    studentInClass: false,
    score: false,
  });
  const [isLoading, setIsLoading] = useState({
    dataLoading: false,
    assignmentsLoading: false,
    teacherClass: false,
    studentInClass: false,
    score: false,
  });
  const {
    assignments,
    fetchAssignments,
    fetchClasses,
    setAssignments,
    studentClass,
    fetchScores,
    scores,
    fetchClassesForTeacher,
    classes,
    fetchStudentsInClass,
    studentsInClass,
  } = useScore();

  const load = async () => {
    if (user) {
      if (user.userType == "student") {
        await fetchClasses();
        await fetchScores(user.userId);
      } else if (user.userType == "teacher") {
        setIsLoading((prev) => ({ ...prev, teacherClass: true }));
        console.log("Fetch started");
        await fetchClassesForTeacher().then(() => {
          setIsLoading((prev) => ({ ...prev, teacherClass: false }));
          setFetched((prev) => ({ ...prev, teacherClass: true }));
          console.log("Fetched classes", classes);
        });
        if (fetched.teacherClass && classes.length > 0) {
          setIsLoading((prev) => ({ ...prev, studentInClass: true }));
          classes.map(async (c) => {
            await fetchStudentsInClass(c.id).then(() => {
              setIsLoading((prev) => ({ ...prev, studentInClass: false }));
              setFetched((prev) => ({ ...prev, studentInClass: true }));
            });
          });
          console.log("Fetched students", studentsInClass);
        }
        if (fetched.studentInClass && studentsInClass.length > 0) {
          setIsLoading((prev) => ({ ...prev, score: true }));
          studentsInClass.map(async (s) => {
            await fetchScores(s.userId).then(() => {
              setFetched((prev) => ({ ...prev, score: true }));
              setIsLoading((prev) => ({ ...prev, score: true }));
            });
          });
          console.log("Fetched scores", scores);
        }
      }
      if (user || studentClass.length > 0 || classes) {
        setIsLoading((prev) => ({
          ...prev,
          assignmentsLoading: true,
        }));
        if (!fetched.assignment) {
          if (classes.length > 0 || studentClass.length > 0) {
            await fetchAssignments(
              user.userType == "student" ? studentClass[0].id : ""
            ).then(() => {
              setIsLoading((prev) => ({
                ...prev,
                assignmentsLoading: false,
              }));
              setFetched((prev) => ({
                ...prev,
                assignment: true,
              }));
              console.log("Assignments - ", assignments);
            });
          }
        }
      } else if (!isLoading && studentClass.length === 0 && !classes) {
        setAssignments([]);
      }
    }
  };

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
      value: studentsInClass.length,
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
        <Button
          title="Refresh"
          className={`cursor-pointer mr-10 ${
            colorScheme == "dark" ? "bg-slate-800" : "bg-slate-300"
          }`}
          onClick={load}
          disabled={isLoading.assignmentsLoading && isLoading.dataLoading}
        >
          <RefreshCcw className="h-6 w-6" />
        </Button>
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
        allScores={scores}
        studentClasses={classes}
        assignments={assignments}
        classes={classes}
        students={studentsInClass}
      />
    </div>
  );
};

export default TeacherDashboard;
