"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";

import { toast } from "@/hooks/use-toast";
import { Assignment, Class } from "@/types";
import { useStudentSide } from "@/hooks/useScore";

const StudentPracticeDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { colorScheme } = useTheme();

  const token = localStorage.getItem("StenoMaster-token");
  const [isLoading, setIsLoading] = useState(true);

  const {
    assignments,
    fetchAssignments,
    fetchClasses,
    scores,
    studentClass,
    submitScore,
  } = useStudentSide();

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        if (user) {
          await fetchClasses();
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(isLoading);
      }
    };

    loadData();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (studentClass.length > 0) {
      fetchAssignments(studentClass[0].id);
    } else if (!isLoading && studentClass.length === 0) {
      if (!studentClass) {
        toast({
          title: "No Classes",
          description: "No classes found for this student.",
          variant: "destructive",
        });
      }
    }
  }, [studentClass, isLoading, user]);

  // if (isLoading || !user) {
  //   return (
  //     <Card>
  //       <CardContent className="flex flex-col items-center justify-center py-12">
  //         <p className="text-muted-foreground">
  //           Loading practice assignments...
  //         </p>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="gradient-text text-2xl font-bold">
          Practice Assignments
        </h2>
        <p
          className={
            colorScheme === "dark" ? "text-dark-muted" : "text-light-muted"
          }
        >
          Practice your assignments to improve your skills
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3
                className={`text-lg font-semibold mb-2 ${
                  colorScheme === "dark"
                    ? "text-dark-muted"
                    : "text-light-muted"
                }`}
              >
                No assignments yet
              </h3>
              <p
                className={
                  colorScheme === "dark"
                    ? "text-dark-muted text-center"
                    : "text-light-muted text-center"
                }
              >
                Check back later for new practice assignments
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assignments
                .filter((assignment) => assignment.isActive)
                .map((assignment) => (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <CardTitle>{assignment.title}</CardTitle>
                      <p
                        className={
                          colorScheme === "dark"
                            ? "text-dark-muted"
                            : "text-light-muted"
                        }
                      >
                        Deadline:{" "}
                        {new Date(assignment.deadline).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <Link
                        href={`/dashboard/student/practice/${assignment.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        Start Practice
                      </Link>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentPracticeDashboard;
