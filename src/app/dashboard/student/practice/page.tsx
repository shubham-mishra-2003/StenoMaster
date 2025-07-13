"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileTextIcon } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";

import { useScore } from "@/hooks/useScore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

const PracticePageContent = () => {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);
  const { colorScheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const { assignments, scores } = useScore();

  const handleStartPractice = () => {
    if (selectedAssignmentId) {
      router.push(`/dashboard/student/practice/${selectedAssignmentId}`);
    }
  };

  const mobile = useIsMobile();

  if (mobile) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p
            className={
              colorScheme == "dark" ? "text-dark-muted" : "text-light-muted"
            }
          >
            Tests are assignments can not be performed on mobile phones
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Loading assignments...</p>
        </CardContent>
      </Card>
    );
  }

  const availableAssignments = assignments.filter(
    (assignment) =>
      !scores.some((score) => score.assignmentId === assignment.id)
  );

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
          {availableAssignments.length === 0 ? (
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
                  {availableAssignments.map((assignment) => (
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
