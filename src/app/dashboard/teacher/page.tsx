"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";
import StudentsScores from "@/components/StudentsScores";

const TeacherDashboard = () => {
  const stats = [
    {
      title: "Total Classes",
      value: "3",
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Active Assignments",
      value: "8",
      icon: BookOpen,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Students",
      value: "24",
      icon: Users,
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  const { colorScheme } = useTheme();

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
