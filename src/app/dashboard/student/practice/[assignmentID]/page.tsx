"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useStudentAssignments } from "@/hooks/useStudentAssignments";
import { toast } from "@/hooks/use-toast";
import { Assignment, Score } from "@/types";

const PracticeAssignment = () => {
  const { assignmentID } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { assignments, createScore, loading, error } = useStudentAssignments();
  const { colorScheme } = useTheme();
  const router = useRouter();
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.userId || user.userType !== "student") {
      console.error("[PracticeAssignment] Authentication check failed:", {
        isAuthenticated,
        userId: user?.userId,
        userType: user?.userType,
      });
      toast({
        title: "Error",
        description: "Please log in as a student to access this assignment.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    if (!assignmentID || typeof assignmentID !== "string" || assignmentID.trim() === "") {
      console.error("[PracticeAssignment] Invalid assignmentID:", assignmentID);
      toast({
        title: "Error",
        description: "Invalid assignment ID.",
        variant: "destructive",
      });
      router.push("/dashboard/student/practice");
      return;
    }

    console.log("[PracticeAssignment] Starting fetch for assignmentID:", assignmentID);

    // Try to find the assignment in the already fetched assignments
    const foundAssignment = assignments.find((a) => a.id === assignmentID);
    if (foundAssignment) {
      console.log("[PracticeAssignment] Assignment found in state:", foundAssignment);
      setAssignment(foundAssignment);
    } else {
      console.error("[PracticeAssignment] Assignment not found in state for ID:", assignmentID);
      toast({
        title: "Error",
        description: "Assignment not found.",
        variant: "destructive",
      });
      router.push("/dashboard/student/practice");
    }
  }, [isAuthenticated, user, assignmentID, assignments, router]);

  useEffect(() => {
    if (error) {
      console.error("[PracticeAssignment] Hook error:", error);
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      router.push("/dashboard/student/practice");
    }
  }, [error, router]);

  const handleStart = () => {
    setStartTime(new Date());
  };

  const handleSubmit = async () => {
    if (!startTime || !assignment || !user) {
      toast({
        title: "Error",
        description: "Please start the assignment and ensure all data is loaded.",
        variant: "destructive",
      });
      return;
    }

    const timeElapsed = (new Date().getTime() - startTime.getTime()) / 1000;
    const words = typedText.trim().split(/\s+/).length;
    const wpm = Math.round((words / timeElapsed) * 60);
    const accuracy = calculateAccuracy(typedText, assignment.correctText);

    const score: Score = {
      id: `score-${Date.now()}`,
      studentId: user.userId,
      assignmentId: assignment.id,
      typedText,
      accuracy,
      wpm,
      timeElapsed,
      completedAt: new Date(),
    };

    try {
      await createScore(score);
      toast({
        title: "Success",
        description: "Assignment submitted successfully.",
      });
      router.push("/dashboard/student/practice");
    } catch (err) {
      console.error("[PracticeAssignment] Error submitting score:", err);
      toast({
        title: "Error",
        description: "Failed to submit score. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateAccuracy = (typed: string, correct: string) => {
    const typedChars = typed.split("");
    const correctChars = correct.split("");
    const correctCount = typedChars.reduce(
      (count, char, i) => (char === correctChars[i] ? count + 1 : count),
      0
    );
    return Math.round((correctCount / Math.max(correctChars.length, 1)) * 100);
  };

  if (loading || !assignment) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Loading assignment...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="gradient-text text-2xl font-bold">{assignment.title}</h2>
        <p className={colorScheme === "dark" ? "text-dark-muted" : "text-light-muted"}>
          Practice this assignment to improve your typing skills
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{assignment.correctText}</p>
          <Input
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            placeholder="Type the text above..."
            className="mb-4"
          />
          <div className="flex space-x-4">
            <Button onClick={handleStart} disabled={startTime !== null}>
              Start
            </Button>
            <Button onClick={handleSubmit} disabled={!startTime}>
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticeAssignment;