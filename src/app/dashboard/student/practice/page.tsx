"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useStudentAssignments } from "@/hooks/useStudentAssignments";
import { useClass } from "@/hooks/useClasses";
import { toast } from "@/hooks/use-toast";
import { Assignment } from "@/types";

const StudentPracticeDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { classes, fetchStudentClasses, isLoading: classLoading } = useClass();
  const { assignments, fetchAssignments, loading: assignmentsLoading, error } = useStudentAssignments();
  const { colorScheme } = useTheme();
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.userId || user.userType !== "student" || hasFetched) {
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch the student's enrolled classes
        await fetchStudentClasses();

        // Fetch assignments for each enrolled class
        const token = localStorage.getItem("StenoMaster-token");
        if (!token) {
          throw new Error("Invalid session. Please log in again.");
        }
        for (const classItem of classes) {
          await fetchAssignments(classItem.id);
        }
        setHasFetched(true);
      } catch (err) {
        console.error("[StudentPracticeDashboard] Error fetching data:", err);
        toast({
          title: "Error",
          description: "Failed to load classes or assignments.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [isAuthenticated, user, fetchStudentClasses, fetchAssignments, classes, hasFetched]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  if (classLoading || assignmentsLoading || !user) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Loading practice assignments...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="gradient-text text-2xl font-bold">Practice Assignments</h2>
        <p className={colorScheme === "dark" ? "text-dark-muted" : "text-light-muted"}>
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
              <h3 className={`text-lg font-semibold mb-2 ${colorScheme === "dark" ? "text-dark-muted" : "text-light-muted"}`}>
                No assignments yet
              </h3>
              <p className={colorScheme === "dark" ? "text-dark-muted text-center" : "text-light-muted text-center"}>
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
                      <p className={colorScheme === "dark" ? "text-dark-muted" : "text-light-muted"}>
                        Deadline: {new Date(assignment.deadline).toLocaleDateString()}
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