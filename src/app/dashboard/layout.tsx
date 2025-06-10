"use client";

import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { GraduationCap, LogOut, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/ThemeProvider";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: "teacher" | "student";
  userName: string;
  onLogout: () => void;
}

const DashboardLayout = ({
  children,
  userType,
  userName,
  onLogout,
}: DashboardLayoutProps) => {
  const { colorScheme } = useTheme();
  return (
    <SidebarProvider>
      <div
        className={`min-h-screen flex w-full bg-gradient-to-br ${
          colorScheme == "dark"
            ? "from-slate-900 via-slate-800 to-slate-900"
            : "from-slate-50 via-blue-50 to-slate-100"
        }`}
      >
        <AppSidebar onLogout={onLogout} />
        <SidebarInset className="flex-1 flex flex-col">
          <nav className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex justify-between items-center h-16 px-4 lg:px-6">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="lg:hidden" />
                <div className="hidden sm:block">
                  <h1 className="gradient-text">StenoLearn</h1>
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
                  className="hidden sm:flex"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Logout</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="sm:hidden"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </nav>

          <main className="flex-1 p-4 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>

          <footer className="border-t border-border/50 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-indigo-50/50 dark:from-blue-950/50 dark:via-purple-950/30 dark:to-indigo-950/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    StenoLearn
                  </span>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    © 2024 StenoLearn. Empowering stenography education.
                  </p>
                </div>

                <div className="flex space-x-4 text-sm text-muted-foreground">
                  <a href="#" className="hover:text-primary transition-colors">
                    Help
                  </a>
                  <a href="#" className="hover:text-primary transition-colors">
                    Support
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
