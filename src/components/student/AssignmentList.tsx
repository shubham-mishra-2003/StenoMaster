import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Assignment } from "@/types";
import { BookOpen, Play, Clock, FileText } from "lucide-react";

interface AssignmentListProps {
  assignments: Assignment[];
  onStartPractice: (assignmentId: string) => void;
}

const AssignmentList = ({ assignments, onStartPractice }: AssignmentListProps) => {
  if (assignments.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No assignments available</h3>
          <p className="text-muted-foreground text-center">
            Your teacher hasn't assigned any stenography practice yet. Check back later!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Available Assignments</h2>
        <p className="text-muted-foreground">Practice your stenography skills</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="glass-card hover-lift">
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
              <p className="text-sm text-muted-foreground">{assignment.description}</p>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{assignment.correctText.length} characters to type</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Created {new Date(assignment.createdAt).toLocaleDateString()}</span>
              </div>

              <Button onClick={() => onStartPractice(assignment.id)} className="w-full">
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