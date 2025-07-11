"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileTextIcon } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";

import { toast } from "@/hooks/use-toast";
import { useStudentSide } from "@/hooks/useScore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const PracticePageContent = () => {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);
  const { colorScheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const { assignments, fetchAssignments, fetchClasses, studentClass } =
    useStudentSide();

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

  const handleStartPractice = () => {
    if (selectedAssignmentId) {
      router.push(`/dashboard/student/practice/${selectedAssignmentId}`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Loading assignments...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="gradient-text font-bold text-2xl">
          Assignments Assigned to You
        </h4>
        <p
          className={
            colorScheme === "dark" ? "text-dark-muted" : "text-light-muted"
          }
        >
          Select and complete your assignments
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon
              className={`h-5 w-5 ${
                colorScheme === "dark" ? "text-white" : "text-black"
              }`}
            />
            Select Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p
              className={
                colorScheme === "dark" ? "text-dark-muted" : "text-light-muted"
              }
            >
              No assignments available.
            </p>
          ) : (
            <div className="space-y-4">
              <Select onValueChange={(value) => setSelectedAssignmentId(value)}>
                <SelectTrigger
                  className={`cursor-pointer border-2 h-12 rounded-xl ${
                    colorScheme === "dark"
                      ? "bg-slate-800 border-slate-700"
                      : "bg-slate-200 border-slate-300"
                  }`}
                >
                  <SelectValue placeholder="Choose an assignment to practice" />
                </SelectTrigger>
                <SelectContent
                  className={`scroll-smooth max-h-[50vh] border-2 rounded-xl ${
                    colorScheme === "dark"
                      ? "bg-slate-800 border-slate-700"
                      : "bg-slate-200 border-slate-300"
                  }`}
                >
                  {assignments.map((assignment) => (
                    <SelectItem
                      key={assignment.id}
                      value={assignment.id}
                      className={`cursor-pointer mb-2 border-2 h-12 rounded-xl ${
                        colorScheme === "dark"
                          ? "bg-slate-700 border-slate-600"
                          : "bg-slate-200 border-slate-300"
                      }`}
                    >
                      {assignment.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleStartPractice}
                className="w-full gradient-button"
                disabled={!selectedAssignmentId}
              >
                Start Practice
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticePageContent;
