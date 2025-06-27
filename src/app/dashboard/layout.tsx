"use client";

import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/ThemeProvider";
import Logo from "@/components/Logo";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { colorScheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();

  const isAssignmentPage =
    pathname &&
    pathname.startsWith("/dashboard/student/practice/") &&
    pathname.split("/").length === 5;

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <AuthProvider>
      <SidebarProvider>
        <div
          className={`min-h-screen flex w-full bg-gradient-to-br ${
            colorScheme === "dark"
              ? "from-slate-900 via-slate-800 to-slate-900"
              : "from-slate-50 via-blue-50 to-slate-100"
          }`}
        >
          {!isAssignmentPage && <AppSidebar />}
          <SidebarInset className="flex-1 flex flex-col">
            <nav className="border-b h-16 border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex justify-between items-center h-16 px-4 lg:px-6">
                <div className="flex items-center space-x-4">
                  {!isAssignmentPage && (
                    <SidebarTrigger
                      className={`lg:hidden h-9 w-9 cursor-pointer ${
                        colorScheme === "dark"
                          ? "bg-slate-900/70 hover:bg-black/60"
                          : "bg-slate-200 hover:bg-slate-300"
                      }`}
                    />
                  )}
                  {isAssignmentPage && <Logo />}
                  <div className="flex gap-2 justify-center items-center">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">{user.fullName}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 lg:space-x-4">
                  <div className="hidden sm:flex items-center space-x-2 text-sm"></div>
                  <ThemeToggle />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className={`hidden h-9 sm:flex items-center justify-center cursor-pointer ${
                      colorScheme === "dark"
                        ? "bg-slate-900/70 hover:bg-black/60"
                        : "bg-slate-200 hover:bg-slate-300"
                    }`}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden lg:inline">Logout</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className={`sm:hidden h-9 w-9 flex items-center justify-center cursor-pointer ${
                      colorScheme === "dark"
                        ? "bg-slate-900/70 hover:bg-black/60"
                        : "bg-slate-200 hover:bg-slate-300"
                    }`}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </nav>
            <main className="flex-1 p-2 sm:p-4 lg:p-9 overflow-auto">
              <div className="max-w-7xl mx-auto">{children}</div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
};

export default DashboardLayout;
