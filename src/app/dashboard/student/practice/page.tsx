"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useAssignments, AssignmentsProvider } from "@/hooks/use-StudentAssignments";

const PracticePageContent = () => {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const { assignments, loading, error } = useAssignments();
  const { colorScheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  const handleStartPractice = () => {
    if (selectedAssignmentId) {
      router.push(`/dashboard/student/practice/${selectedAssignmentId}`);
    }
  };

  if (loading) {
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
        <h4 className="gradient-text font-bold text-2xl">Assignments Assigned to You</h4>
        <p className={colorScheme === "dark" ? "text-dark-muted" : "text-light-muted"}>
          Select and complete your assignments
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Select Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-muted-foreground">
              No assignments available. Please add assignments to continue.
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

const PracticePage = () => (
  <AssignmentsProvider>
    <PracticePageContent />
  </AssignmentsProvider>
);

export default PracticePage;
