
// import React from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { BookOpen, Target, Zap, BarChart3, Clock } from "lucide-react";
// import { useLocalStorage } from "@/hooks/useLocalStorage";
// import { Assignment, Score } from "@/types";
// import AssignmentList from "./AssignmentList";
// import TypingPractice from "./TypingPractice";
// import TypingTest from "./TypingTest";
// import StudentProgress from "./StudentProgress";

// interface StudentDashboardProps {
//   activeTab: string;
//   onTabChange: (tab: string) => void;
// }

// const StudentDashboard = ({ activeTab, onTabChange }: StudentDashboardProps) => {
//   const [assignments] = useLocalStorage<Assignment[]>("stenolearn-assignments", []);
//   const [scores] = useLocalStorage<Score[]>("stenolearn-scores", []);

//   const stats = [
//     {
//       title: "Assignments Done",
//       value: scores.length.toString(),
//       icon: BookOpen,
//       change: "+3 this week",
//       color: "from-blue-500 to-blue-600"
//     },
//     {
//       title: "Average Speed",
//       value: "45 WPM",
//       icon: Zap,
//       change: "+5 WPM improved",
//       color: "from-purple-500 to-purple-600"
//     },
//     {
//       title: "Accuracy",
//       value: "89%",
//       icon: Target,
//       change: "+3% this month",
//       color: "from-green-500 to-green-600"
//     },
//     {
//       title: "Time Practiced",
//       value: "2.5h",
//       icon: Clock,
//       change: "This week",
//       color: "from-orange-500 to-orange-600"
//     }
//   ];

//   const handleStartPractice = (assignmentId: string) => {
//     console.log("Starting practice for assignment:", assignmentId);
//     onTabChange("practice");
//   };

//   return (
//     <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-2 sm:p-4 lg:p-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
//             Student Dashboard
//           </h1>
//           <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
//             Track your progress and practice stenography
//           </p>
//         </div>
//       </div>

//       <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4 sm:space-y-6">
//         <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-indigo-950/30 rounded-lg">
//           <TabsTrigger 
//             value="assignments" 
//             className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-200"
//           >
//             <BookOpen className="h-4 w-4 sm:mr-1" />
//             <span className="hidden sm:inline">Assignments</span>
//           </TabsTrigger>
//           <TabsTrigger 
//             value="practice" 
//             className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-200"
//           >
//             <Target className="h-4 w-4 sm:mr-1" />
//             <span className="hidden sm:inline">Practice</span>
//           </TabsTrigger>
//           <TabsTrigger 
//             value="typing-test" 
//             className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-200"
//           >
//             <Zap className="h-4 w-4 sm:mr-1" />
//             <span className="hidden sm:inline">Speed Test</span>
//           </TabsTrigger>
//           <TabsTrigger 
//             value="progress" 
//             className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-200"
//           >
//             <BarChart3 className="h-4 w-4 sm:mr-1" />
//             <span className="hidden sm:inline">Progress</span>
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="assignments" className="space-y-4 sm:space-y-6">
//           <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
//             {stats.map((stat, index) => {
//               const Icon = stat.icon;
//               return (
//                 <Card 
//                   key={index} 
//                   className="relative overflow-hidden bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-800/60 dark:to-gray-700/40 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
//                 >
//                   <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
//                     <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
//                       {stat.title}
//                     </CardTitle>
//                     <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}>
//                       <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
//                     </div>
//                   </CardHeader>
//                   <CardContent className="relative z-10">
//                     <div className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
//                       {stat.value}
//                     </div>
//                     <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
//                       {stat.change}
//                     </p>
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>
//           <AssignmentList assignments={assignments} onStartPractice={handleStartPractice} />
//         </TabsContent>

//         <TabsContent value="practice">
//           <TypingPractice assignments={assignments} />
//         </TabsContent>

//         <TabsContent value="typing-test">
//           <TypingTest />
//         </TabsContent>

//         <TabsContent value="progress">
//           <StudentProgress scores={scores} assignments={assignments} />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default StudentDashboard;




import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Target, Zap, BarChart3, Clock } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Assignment, Score } from "@/types";
import AssignmentList from "./AssignmentList";
import TypingPractice from "./TypingPractice";
import TypingTest from "./TypingTest";
import StudentProgress from "./StudentProgress";
import { useTheme } from "@/hooks/ThemeProvider";

interface StudentDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const StudentDashboard = ({ activeTab, onTabChange }: StudentDashboardProps) => {
  const { colorScheme } = useTheme();
  const [assignments] = useLocalStorage<Assignment[]>("stenolearn-assignments", []);
  const [scores] = useLocalStorage<Score[]>("stenolearn-scores", []);

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
      value: "45 WPM",
      icon: Zap,
      change: "+5 WPM improved",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Accuracy",
      value: "89%",
      icon: Target,
      change: "+3% this month",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Time Practiced",
      value: "2.5h",
      icon: Clock,
      change: "This week",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const handleStartPractice = (assignmentId: string) => {
    console.log("Starting practice for assignment:", assignmentId);
    onTabChange("practice");
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-2 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text">
            Student Dashboard
          </h1>
          <p className={`text-sm sm:text-base ${colorScheme === "dark" ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Track your progress and practice stenography
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4 sm:space-y-6">
        <TabsContent value="assignments" className="space-y-4 sm:space-y-6">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={index} 
                  className={`relative overflow-hidden bg-gradient-to-br ${colorScheme === "dark" ? 'from-gray-900/80 via-gray-800/60 to-gray-700/40' : 'from-white/80 via-white/60 to-white/40'} backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className={`text-xs sm:text-sm font-medium ${colorScheme === "dark" ? 'text-gray-300' : 'text-gray-700'}`}>
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}>
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-lg sm:text-xl lg:text-2xl font-bold bg-clip-text text-transparent ${colorScheme === "dark" ? 'text-dark' : 'text-light'}`}>
                      {stat.value}
                    </div>
                    <p className={`text-xs ${colorScheme === "dark" ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <AssignmentList assignments={assignments} onStartPractice={handleStartPractice} />
        </TabsContent>

        <TabsContent value="practice">
          <TypingPractice assignments={assignments} />
        </TabsContent>

        <TabsContent value="typing-test">
          <TypingTest />
        </TabsContent>

        <TabsContent value="progress">
          <StudentProgress scores={scores} assignments={assignments} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;