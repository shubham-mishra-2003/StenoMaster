
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, BarChart3, TrendingUp } from "lucide-react";
import ClassManagement from "./ClassManagement";
import AssignmentManagement from "./AssignmentManagement";
import StudentScores from "./StudentScores";

interface TeacherDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TeacherDashboard = ({ activeTab, onTabChange }: TeacherDashboardProps) => {
  const stats = [
    {
      title: "Total Classes",
      value: "3",
      icon: Users,
      change: "+1 this month",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Active Assignments", 
      value: "8",
      icon: BookOpen,
      change: "+2 this week",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Students",
      value: "24",
      icon: Users,
      change: "+4 this month",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      title: "Avg. Accuracy",
      value: "87%",
      icon: TrendingUp,
      change: "+5% improvement",
      color: "from-green-500 to-green-600"
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-2 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Teacher Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Manage your classes and track student progress
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-indigo-950/30 rounded-lg">
          <TabsTrigger 
            value="overview" 
            className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-200"
          >
            <BarChart3 className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="classes" 
            className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-200"
          >
            <Users className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Classes</span>
          </TabsTrigger>
          <TabsTrigger 
            value="assignments" 
            className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-200"
          >
            <BookOpen className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Assignments</span>
          </TabsTrigger>
          <TabsTrigger 
            value="scores" 
            className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-200"
          >
            <BarChart3 className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Scores</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={index} 
                  className="relative overflow-hidden bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-800/60 dark:to-gray-700/40 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}>
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            <Card className="bg-gradient-to-br from-white/80 via-blue-50/60 to-purple-50/40 dark:from-gray-900/80 dark:via-blue-950/60 dark:to-purple-950/40 backdrop-blur-xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex-shrink-0 shadow-sm"></div>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Student John completed Assignment 3</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex-shrink-0 shadow-sm"></div>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">New student Sarah added to Class A</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex-shrink-0 shadow-sm"></div>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Assignment 4 uploaded successfully</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white/80 via-purple-50/60 to-indigo-50/40 dark:from-gray-900/80 dark:via-purple-950/60 dark:to-indigo-950/40 backdrop-blur-xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Average Speed</span>
                    <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">45 WPM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Completion Rate</span>
                    <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">92%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Top Performer</span>
                    <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Sarah K.</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="classes">
          <ClassManagement />
        </TabsContent>

        <TabsContent value="assignments">
          <AssignmentManagement />
        </TabsContent>

        <TabsContent value="scores">
          <StudentScores />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherDashboard;
