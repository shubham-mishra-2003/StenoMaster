"use client";

import React, { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/ThemeProvider";
import Logo from "@/components/Logo";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useScore } from "@/hooks/useScore";
import { Card, CardContent } from "@/components/ui/card";
import UserButton from "@/components/UserButton";
import { User, Class } from "@/types";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { colorScheme } = useTheme();
  const { isAuthenticated, user, validate } = useAuth();
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
    fetchAssignments,
    fetchClasses,
    setAssignments,
    fetchScores,
    fetchClassesForTeacher,
    fetchStudentsInClass,
  } = useScore();

  const isAssignmentPage =
    pathname.startsWith("/dashboard/student/practice/") ||
    pathname.startsWith("/dashboard/student/test");

  const loadData = async () => {
    if (!user || !isAuthenticated) return;
    validate();
    setIsLoading((prev) => ({ ...prev, dataLoading: true }));

    try {
      if (user.userType === "student") {
        const studentClasses = await fetchClasses();
        await fetchScores(user.userId);

        if (studentClasses.length > 0) {
          setIsLoading((prev) => ({ ...prev, assignmentsLoading: true }));
          await fetchAssignments(studentClasses[0].id);
          setFetched((prev) => ({ ...prev, assignment: true }));
          setIsLoading((prev) => ({ ...prev, assignmentsLoading: false }));
        } else {
          setAssignments([]);
        }
      }

      if (user.userType === "teacher") {
        setIsLoading((prev) => ({ ...prev, teacherClass: true }));
        const teacherClasses: Class[] = await fetchClassesForTeacher();
        setFetched((prev) => ({ ...prev, teacherClass: true }));
        setIsLoading((prev) => ({ ...prev, teacherClass: false }));

        if (teacherClasses.length > 0) {
          setIsLoading((prev) => ({ ...prev, studentInClass: true }));
          const allStudents: User[] = [];

          for (const c of teacherClasses) {
            const students = await fetchStudentsInClass(c.id);
            allStudents.push(...students);
          }

          setFetched((prev) => ({ ...prev, studentInClass: true }));
          setIsLoading((prev) => ({ ...prev, studentInClass: false }));
          if (allStudents.length > 0) {
            setIsLoading((prev) => ({ ...prev, score: true }));
            for (const student of allStudents) {
              await fetchScores(student.userId);
            }
            setFetched((prev) => ({ ...prev, score: true }));
            setIsLoading((prev) => ({ ...prev, score: false }));
          }
          setIsLoading((prev) => ({ ...prev, assignmentsLoading: true }));
          await fetchAssignments();
          setFetched((prev) => ({ ...prev, assignment: true }));
          setIsLoading((prev) => ({ ...prev, assignmentsLoading: false }));
        }
      }
    } catch (err) {
      console.error("Load Data Error:", err);
    } finally {
      setIsLoading((prev) => ({ ...prev, dataLoading: false }));
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/?showLogin=true");
      return;
    }

    if (
      !fetched.assignment ||
      !fetched.teacherClass ||
      !fetched.studentInClass ||
      !fetched.score
    ) {
      loadData();
    }
  }, []);

  if (!isLoading.refresh) {
    const showLoader =
      user?.userType === "student"
        ? isLoading.assignmentsLoading || isLoading.dataLoading
        : isLoading.teacherClass ||
          isLoading.studentInClass ||
          isLoading.assignmentsLoading;

    if (!isAuthenticated || !user || showLoader) {
      return (
        <div className="flex justify-center items-center h-screen p-20 bg-black">
          <Card className="animate-bounce bg-slate-800">
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
