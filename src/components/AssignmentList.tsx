import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Assignment } from "@/types";
import { BookOpen, Play, Clock, FileText, RefreshCcw } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";
import { useRouter } from "next/navigation";
import { useScore } from "@/hooks/useScore";
import { useAuth } from "@/hooks/useAuth";

interface AssignmentListProps {
  assignments: Assignment[];
}

const AssignmentList = ({ assignments }: AssignmentListProps) => {
  const { colorScheme } = useTheme();
  const router = useRouter();

  const handleStartPractice = (assignmentID: string) => {
    router.push(`/dashboard/student/practice/${assignmentID}`);
  };

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h3
            className={`text-lg font-semibold mb-2 ${
              colorScheme == "dark" ? "text-dark" : "text-light"
            }`}
          >
            No assignments available
          </h3>
          <p
            className={`text-center ${
              colorScheme == "dark" ? "text-dark" : "text-light"
            }`}
          >
            Your teacher hasn't assigned any stenography practice yet. Check
            back later!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between w-full items-center p-1">
        <div>
          <h2
            className={`text-2xl font-bold ${
              colorScheme == "dark" ? "text-dark" : "text-light"
            }`}
          >
            Available Assignments
          </h2>
          <p
            className={`${colorScheme == "dark" ? "text-dark" : "text-light"}`}
          >
            Practice your stenography skills
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{assignment.title}</CardTitle>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{assignment.correctText.length} characters to type</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Created {new Date(assignment.createdAt).toLocaleDateString()}
                </span>
              </div>

              <Button
                onClick={() => handleStartPractice(assignment.id)}
                className="w-full gradient-button"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Practice
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AssignmentList;
