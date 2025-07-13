"use client";

import React, { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/ThemeProvider";
import Logo from "@/components/Logo";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useScore } from "@/hooks/useScore";
import { Card, CardContent } from "@/components/ui/card";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { colorScheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [fetched, setFetched] = useState({
    data: false,
    assignment: false,
  });
  const [isLoading, setIsLoading] = useState({
    dataLoading: false,
    assignmentsLoading: false,
  });
  const {
    assignments,
    fetchAssignments,
    fetchClasses,
    setAssignments,
    studentClass,
    fetchScores,
    scores,
  } = useScore();

  const isAssignmentPage =
    (pathname &&
      pathname.startsWith("/dashboard/student/practice/") &&
      pathname.split("/").length === 5) ||
    pathname.startsWith("/dashboard/student/test");

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/?showLogin=true");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      return;
    }
    const loadData = async () => {
      setIsLoading((prev) => ({
        ...prev,
        dataLoading: true,
      }));
      try {
        if (user) {
          await fetchClasses();
          await fetchScores(user.userId);
        }
      } catch (err) {
        // console.error("Failed to load data:", err);
      } finally {
        setIsLoading((prev) => ({
          ...prev,
          dataLoading: false,
        }));
      }
    };
    if (!fetched.data && user.userType == "student") {
      loadData().then(() => {
        setFetched((prev) => ({
          ...prev,
          data: true,
        }));
      });
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (user?.userType == "student" && studentClass.length > 0) {
      setIsLoading((prev) => ({
        ...prev,
        assignmentsLoading: true,
      }));
      if (!fetched.assignment) {
        fetchAssignments(studentClass[0].id).then(() => {
          setIsLoading((prev) => ({
            ...prev,
            assignmentsLoading: false,
          }));
          setFetched((prev) => ({
            ...prev,
            assignment: true,
          }));
        });
      }
    } else if (
      !isLoading &&
      user?.userType == "student" &&
      studentClass.length === 0
    ) {
      setAssignments([]);
    }
  }, [studentClass, user]);

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      if (!isLoading) {
        const timer = setTimeout(() => {
          toast({
            title: "Authentication Required",
            description: "Please log in to view dashboard.",
            variant: "destructive",
          });
        }, 900);
        return () => clearTimeout(timer);
      }
      return;
    }

    if (!isLoading && assignments.length === 0 && scores.length === 0) {
      const timer = setTimeout(() => {
        toast({
          title: "No Data Available",
          description:
            "You have no assignments or scores to display at this time.",
          variant: "default",
        });
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, assignments, scores]);

  if (!isAuthenticated || !user) {
    return null;
  }

  if (!fetched.assignment && !fetched.data) {
    return (
      <div className="flex justify-center items-center h-screen p-20">
        <Card className="animate-bounce">
          <CardContent className="flex items-center justify-center p-20 h-full">
            <p
              className={`text-lg font-bold ${
                colorScheme == "dark" ? "text-dark-muted" : "text-light-muted"
              }`}
            >
              Loading...
            </p>
          </CardContent>
        </Card>
      </div>
    );
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
