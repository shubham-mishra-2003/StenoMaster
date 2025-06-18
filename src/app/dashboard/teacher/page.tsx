"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, TrendingUp } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";

const TeacherDashboard = () => {
  const stats = [
    {
      title: "Total Classes",
      value: "3",
      icon: Users,
      change: "+1 this month",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Active Assignments",
      value: "8",
      icon: BookOpen,
      change: "+2 this week",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Students",
      value: "24",
      icon: Users,
      change: "+4 this month",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Avg. Accuracy",
      value: "87%",
      icon: TrendingUp,
      change: "+5% improvement",
      color: "from-green-500 to-green-600",
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

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
                <p
                  className={`text-xs mt-2 font-semibold ${
                    colorScheme == "dark"
                      ? "text-dark-muted"
                      : "text-light-muted"
                  }`}
                >
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-xl gradient-text font-bold">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex-shrink-0 shadow-sm"></div>
                <p
                  className={`text-xs sm:text-sm font-semibold ${
                    colorScheme == "dark"
                      ? "text-dark-muted"
                      : "text-light-muted"
                  }`}
                >
                  Student John completed Assignment 3
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex-shrink-0 shadow-sm"></div>
                <p
                  className={`text-xs sm:text-sm font-semibold ${
                    colorScheme == "dark"
                      ? "text-dark-muted"
                      : "text-light-muted"
                  }`}
                >
                  New student Sarah added to Class A
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex-shrink-0 shadow-sm"></div>
                <p
                  className={`text-xs sm:text-sm font-semibold ${
                    colorScheme == "dark"
                      ? "text-dark-muted"
                      : "text-light-muted"
                  }`}
                >
                  Assignment 4 uploaded successfully
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg gradient-text">
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span
                  className={`text-xs sm:text-sm font-semibold ${
                    colorScheme == "dark" ? "text-dark" : "text-light"
                  }`}
                >
                  Average Speed
                </span>
                <span className="text-xs sm:text-sm font-semibold gradient-text">
                  45 WPM
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`text-xs sm:text-sm font-semibold ${
                    colorScheme == "dark" ? "text-dark" : "text-light"
                  }`}
                >
                  Completion Rate
                </span>
                <span className="text-xs sm:text-sm font-semibold gradient-text">
                  92%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`text-xs sm:text-sm font-semibold ${
                    colorScheme == "dark" ? "text-dark" : "text-light"
                  }`}
                >
                  Top Performer
                </span>
                <span className="text-xs sm:text-sm font-semibold gradient-text">
                  Sarah K.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
