// dashboard/student/practice/[assignmentId]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Clock, Target } from "lucide-react";
import { Assignment, Score } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useStudentAssignments } from "@/hooks/useStudentAssignments";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";

const AssignmentPracticeContent = () => {
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { fetchAssignments, submitScore, error } = useStudentAssignments();
  const router = useRouter();

  useEffect(() => {
    const fetchAssignment = async () => {
      setIsLoading(true);
      try {
        const classId = "class1"; // Replace with actual classId from context or user data
        await fetchAssignments(classId);
        const response = await fetch("/api/assignment/fetch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: localStorage.getItem("StenoMaster-token"),
            classId,
          }),
        });
        const result = await response.json();
        if (result.status === "success") {
          const assignment = result.data.find(
            (a: Assignment) => a.id === assignmentId
          );
          if (assignment) {
            setAssignment({
              ...assignment,
              createdAt: new Date(assignment.createdAt),
            });
          } else {
            throw new Error("Assignment not found");
          }
        } else {
          throw new Error(result.message || "Failed to load assignment");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load assignment",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignment();
  }, [assignmentId, fetchAssignments]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && startTime && !isCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, startTime, isCompleted]);

  const calculateAccuracy = (typed: string, correct: string) => {
    let correctCount = 0;
    for (let i = 0; i < Math.min(typed.length, correct.length); i++) {
      if (typed[i] === correct[i]) {
        correctCount++;
      }
    }
    return Math.round((correctCount / correct.length) * 100);
  };

  const calculateWPM = (typed: string, timeInSeconds: number) => {
    if (timeInSeconds <= 0) return 0;
    const words = typed.trim().split(/\s+/).length;
    const minutes = timeInSeconds / 60;
    return Math.round(words / minutes);
  };

  const handleStart = () => {
    if (!user?.userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to start the assignment.",
        variant: "destructive",
      });
      return;
    }
    setIsStarted(true);
    setStartTime(new Date());
    setTimeElapsed(0);
  };

  const handleSubmit = async () => {
    if (!startTime || !user?.userId || !assignment || isCompleted) {
      toast({
        title: "Error",
        description:
          "Cannot submit assignment. Ensure you are logged in and the assignment has started.",
        variant: "destructive",
      });
      return;
    }

    setIsCompleted(true);
    const accuracy = calculateAccuracy(typedText, assignment.correctText);
    const wpm = calculateWPM(typedText, timeElapsed);

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
      await submitScore(score);
      toast({
        title: "Assignment Completed!",
        description: `Accuracy: ${accuracy}%, WPM: ${wpm}`,
      });
      setTypedText("");
      setIsStarted(false);
      setIsCompleted(false);
      setStartTime(null);
      setTimeElapsed(0);
      router.push("/dashboard/student/practice");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save score",
        variant: "destructive",
      });
    }
  };

  const progress =
    assignment && assignment.correctText.length > 0
      ? Math.min((typedText.length / assignment.correctText.length) * 100, 100)
      : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Card className="max-w-7xl mx-auto w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Loading assignment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Card className="max-w-7xl mx-auto w-full">
          <CardHeader>
            <CardTitle>Assignment Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No assignment found with ID: {assignmentId || "undefined"}</p>
            <Button
              onClick={() => router.push("/dashboard/student/practice")}
              className="mt-4 gradient-button"
            >
              Back to Practice
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="max-w-7xl mx-auto w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {assignment.title}
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/student/practice")}
            className="gradient-button"
          >
            Back to Assignments
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Time: {Math.floor(timeElapsed / 60)}:
              {(timeElapsed % 60).toString().padStart(2, "0")}
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Progress: {Math.round(progress)}%
            </div>
          </div>
          <Progress value={progress} className="w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <div>
              {assignment.imageUrl && (
                <>
                  <h3 className="font-medium mb-2">Assignment Image</h3>
                  <div className="border rounded-lg p-4 bg-muted">
                    <Image
                      height={300}
                      width={300}
                      src={assignment.imageUrl}
                      alt={assignment.title}
                      className="w-full h-auto rounded"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Type the text you see</h3>
                <Textarea
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  placeholder="Start typing here..."
                  className="min-h-[500px]"
                  disabled={!isStarted || isCompleted}
                />
              </div>
              <div className="flex gap-2">
                {!isStarted ? (
                  <Button
                    onClick={handleStart}
                    className="w-full gradient-button"
                    disabled={!user?.userId}
                  >
                    Start Assignment
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="w-full gradient-button"
                    disabled={typedText.trim().length === 0 || isCompleted}
                  >
                    Submit Assignment
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentPracticeContent;
