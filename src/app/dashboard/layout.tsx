"use client";

import React, { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { RefreshCcw } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/ThemeProvider";
import Logo from "@/components/Logo";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useScore } from "@/hooks/useScore";
import { Card, CardContent } from "@/components/ui/card";
import UserButton from "@/components/UserButton";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { colorScheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
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
    refresh: false,
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

  const isAssignmentPage =
    (pathname &&
      pathname.startsWith("/dashboard/student/practice/") &&
      pathname.split("/").length === 5) ||
    pathname.startsWith("/dashboard/student/test");

  const loadData = async () => {
    setIsLoading((prev) => ({ ...prev, dataLoading: true }));
    try {
      if (!user) {
        console.log("No user, aborting loadData");
        return;
      }

      if (user.userType === "student") {
        console.log("Fetching data for student:", user.userId);
        await fetchClasses();
        console.log("Student classes fetched:", studentClass);
        await fetchScores(user.userId);
        console.log("Scores fetched for student:", scores);

        if (studentClass.length > 0) {
          setIsLoading((prev) => ({ ...prev, assignmentsLoading: true }));
          await fetchAssignments(studentClass[0].id);
          console.log("Assignments fetched for student:", assignments);
          setFetched((prev) => ({ ...prev, assignment: true }));
          setIsLoading((prev) => ({ ...prev, assignmentsLoading: false }));
        } else {
          console.log("No student classes, setting assignments to empty");
          setAssignments([]);
        }
      } else if (user.userType === "teacher") {
        setIsLoading((prev) => ({ ...prev, teacherClass: true }));
        console.log("Fetching classes for teacher:", user.userId);
        await fetchClassesForTeacher();
        console.log("Teacher classes fetched:", classes);
        setFetched((prev) => ({ ...prev, teacherClass: true }));
        setIsLoading((prev) => ({ ...prev, teacherClass: false }));

        if (classes.length > 0) {
          setIsLoading((prev) => ({ ...prev, studentInClass: true }));
          console.log(
            "Fetching students for classes:",
            classes.map((c) => c.id)
          );
          await Promise.all(
            classes.map(async (c) => {
              await fetchStudentsInClass(c.id);
              console.log(
                `Students fetched for class ${c.id}:`,
                studentsInClass
              );
            })
          );
          setFetched((prev) => ({ ...prev, studentInClass: true }));
          setIsLoading((prev) => ({ ...prev, studentInClass: false }));

          if (studentsInClass.length > 0) {
            setIsLoading((prev) => ({ ...prev, score: true }));
            console.log(
              "Fetching scores for students:",
              studentsInClass.map((s) => s.userId)
            );
            await Promise.all(
              studentsInClass.map(async (s) => {
                await fetchScores(s.userId);
                console.log(`Scores fetched for student ${s.userId}:`, scores);
              })
            );
            setFetched((prev) => ({ ...prev, score: true }));
            setIsLoading((prev) => ({ ...prev, score: false }));
          } else {
            console.log("No students in classes, skipping score fetch");
          }

          setIsLoading((prev) => ({ ...prev, assignmentsLoading: true }));
          console.log("Fetching assignments for teacher");
          await fetchAssignments(""); // Adjust based on teacher assignment logic
          console.log("Assignments fetched for teacher:", assignments);
          setFetched((prev) => ({ ...prev, assignment: true }));
          setIsLoading((prev) => ({ ...prev, assignmentsLoading: false }));
        } else {
          console.log("No teacher classes, setting assignments to empty");
          setAssignments([]);
        }
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, dataLoading: false }));
      setFetched((prev) => ({ ...prev, data: true }));
      console.log("loadData completed, fetched state:", fetched);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log("User not authenticated, redirecting to login");
      router.push("/?showLogin=true");
      return;
    }

    if (!fetched.data) {
      console.log("Initial loadData call");
      loadData();
    }
  }, [isAuthenticated, user, router, fetched.data]);

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      if (!isLoading.dataLoading) {
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
    if (
      !isLoading.dataLoading &&
      assignments.length === 0 &&
      scores.length === 0
    ) {
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
  }, [isAuthenticated, user, assignments, scores, isLoading.dataLoading]);

  if (!isAuthenticated || !user) {
    console.log("Rendering null due to unauthenticated user");
    return null;
  }

  if (user.userType === "student") {
    if (!fetched.assignment && !fetched.data) {
      console.log("Rendering loading state for student");
      return (
        <div className="flex justify-center items-center h-screen p-20">
          <Card className="animate-bounce">
            <CardContent className="flex flex-col gap-2 items-center justify-center p-20 h-full">
              <Logo />
              <p
                className={`text-lg font-bold ${
                  colorScheme === "dark"
                    ? "text-dark-muted"
                    : "text-light-muted"
                }`}
              >
                Loading...
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
  } else if (user.userType === "teacher") {
    if (
      !fetched.assignment &&
      !fetched.studentInClass &&
      !fetched.teacherClass
    ) {
      console.log("Rendering loading state for teacher");
      return (
        <div className="flex justify-center items-center h-screen p-20">
          <Card className="animate-bounce">
            <CardContent className="flex flex-col gap-2 items-center justify-center p-20 h-full">
              <Logo />
              <p
                className={`text-lg font-bold ${
                  colorScheme === "dark"
                    ? "text-dark-muted"
                    : "text-light-muted"
                }`}
              >
                Loading...
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
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
                </div>
                <div className="flex items-center space-x-2 lg:space-x-4">
                  <ThemeToggle />
                  <UserButton
                    fetched={fetched}
                    isLoading={isLoading}
                    onRefresh={loadData}
                    setFetched={setFetched}
                    setIsLoading={setIsLoading}
                  />
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
