// import React from "react";
// import { Button } from "@/components/ui/button";
// import { ThemeToggle } from "./ThemeToggle";
// import {
//   SidebarProvider,
//   SidebarInset,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";
// import AppSidebar from "./AppSidebar";
// import { LogOut, User } from "lucide-react";
// import { useTheme } from "@/hooks/ThemeProvider";

// interface DashboardLayoutProps {
//   children: React.ReactNode;
//   userType: "teacher" | "student";
//   userName: string;
//   onLogout: () => void;
//   activeTab: string;
//   onTabChange: (tab: string) => void;
// }

// const DashboardLayout = ({
//   children,
//   userType,
//   userName,
//   onLogout,
//   activeTab,
//   onTabChange,
// }: DashboardLayoutProps) => {
//   const { colorScheme } = useTheme();

//   return (
//     <SidebarProvider>
//       <div
//         className={`min-h-screen flex w-full bg-gradient-to-br ${
//           colorScheme === "dark"
//             ? "from-slate-900 via-slate-800 to-slate-900"
//             : "from-slate-50 via-blue-50 to-slate-100"
//         }`}
//       >
//         <AppSidebar activeTab={activeTab} onTabChange={onTabChange} />
//         <SidebarInset className="flex-1">
//           <nav className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
//             <div className="flex justify-between items-center h-16 px-4 lg:px-6">
//               <div className="flex items-center space-x-4">
//                 <SidebarTrigger className="lg:hidden" />
//                 <div className="hidden sm:block">
//                   <h1 className={`text-xl lg:text-2xl font-bold gradient-text`}>
//                     StenoLearn
//                   </h1>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-2 lg:space-x-4">
//                 <div className="hidden sm:flex items-center space-x-2 text-sm">
//                   <User className="h-4 w-4" />
//                   <span className="hidden md:inline">{userName}</span>
//                 </div>
//                 <ThemeToggle />
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={onLogout}
//                   className={`flex cursor-pointer ${
//                     colorScheme == "dark"
//                       ? "bg-slate-900/70 hover:bg-black/60"
//                       : "bg-slate-200 hover:bg-slate-300"
//                   }`}
//                 >
//                   <LogOut className="h-4 w-4 mr-2" />
//                   <span className="lg:inline hidden sm:flex">Logout</span>
//                 </Button>
//               </div>
//             </div>
//           </nav>
//           <main className="p-4 lg:p-8 overflow-auto">{children}</main>
//         </SidebarInset>
//       </div>
//     </SidebarProvider>
//   );
// };

// export default DashboardLayout;

import React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import { LogOut, User } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: "teacher" | "student";
  userName: string;
  onLogout: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardLayout = ({
  children,
  userType,
  userName,
  onLogout,
  activeTab,
  onTabChange,
}: DashboardLayoutProps) => {
  const { colorScheme } = useTheme();

  return (
    <SidebarProvider>
      <div
        className={`min-h-screen flex w-full bg-gradient-to-br ${
          colorScheme === "dark"
            ? "from-slate-900 via-slate-800 to-slate-900"
            : "from-slate-50 via-blue-50 to-slate-100"
        }`}
      >
        <AppSidebar activeTab={activeTab} onTabChange={onTabChange} />
        <SidebarInset className="flex-1">
          <nav className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex justify-between items-center h-16 px-4 lg:px-6">
              <div className="flex items-center space-x-4">
                <SidebarTrigger
                  className={`lg:hidden cursor-pointer ${
                    colorScheme == "dark" ? "bg-slate-800" : "bg-slate-200"
                  }`}
                />
                <div className="hidden sm:block">
                  <h1 className="text-xl lg:text-2xl font-bold gradient-text">
                    StenoLearn
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-4">
                <div className="hidden sm:flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{userName}</span>
                </div>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className={`gradient-button flex cursor-pointer ${
                    colorScheme === "dark"
                      ? "dark-gradient-button"
                      : "light-gradient-button"
                  }`}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline lg:inline">Logout</span>
                </Button>
              </div>
            </div>
          </nav>
          <main className="p-4 lg:p-8 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
