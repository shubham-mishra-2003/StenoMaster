"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Assignment, Class, Score } from "@/types";
import { Clock, Target } from "lucide-react";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useStudentSide } from "@/hooks/useScore";

const AssignmentPracticeContent = () => {
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const token = localStorage.getItem("StenoMaster-token");
  const { assignmentID } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  const {
    assignments,
    fetchClasses,
    fetchAssignments,
    setAssignments,
    studentClass,
    submitScore,
  } = useStudentSide();

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
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
        setLoading(loading);
      }
    };

    loadData();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (studentClass.length > 0) {
      fetchAssignments(studentClass[0].id);
      const foundAssignment = assignments.find((a) => a.id == assignmentID);
      if (!foundAssignment) {
        return;
      }
      setAssignment(foundAssignment);
    } else if (!loading && studentClass.length === 0) {
      setAssignments([]);
      if (!studentClass) {
        toast({
          title: "No Classes",
          description: "No classes found for this student.",
          variant: "destructive",
        });
      }
    }
  }, [studentClass, loading, user]);

  // useEffect(() => {
  //   if (studentClass.length > 0) {
  //     fetchAssignments(studentClass[0].id);
  //   } else if (!loading && studentClass.length === 0) {
  //     setAssignments([]);
  //     if (!studentClass) {
  //       toast({
  //         title: "No Classes",
  //         description: "No classes found for this student.",
  //         variant: "destructive",
  //       });
  //     }
  //   }

  //   if (assignments.length > 0 && assignmentID) {
  //     const foundAssignment = assignments.find((a) => a.id === assignmentID);
  //     if (!foundAssignment) {
  //       return;
  //     }
  //     setAssignment(foundAssignment);
  //     if (!foundAssignment) {
  //       toast({
  //         title: "Error",
  //         description: "Assignment not found.",
  //         variant: "destructive",
  //       });
  //     }
  //   }
  // }, [studentClass, loading, user, assignments, assignmentID]);

  const handleStart = () => {
    setIsStarted(true);
    setStartTime(new Date());
  };

  const handleSubmit = async () => {
    if (!startTime || !assignment || !user) {
      toast({
        title: "Error",
        description:
          "Please start the assignment and ensure all data is loaded.",
        variant: "destructive",
      });
      return;
    }

    setIsStarted(false);
    setIsCompleted(true);
    const timeElapsed = (new Date().getTime() - startTime.getTime()) / 1000;
    setTimeElapsed(timeElapsed);
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
      await submitScore(score);
      toast({
        title: "Assignment submitted successfully.",
        description: `WPM: ${score.wpm}, Accuracy: ${score.accuracy}`,
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

  const progress =
    assignment && assignment.correctText.length > 0
      ? Math.min((typedText.length / assignment.correctText.length) * 100, 100)
      : 0;

  if (loading) {
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
      <Card className="max-w-7xl mx-auto w-full">
        <CardHeader>
          <CardTitle>Assignment Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No assignment found with this ID : {assignmentId}</p>
          <Button
            onClick={() => router.push("/dashboard/student/practice")}
            className="mt-4 gradient-button"
          >
            Back to Practice
          </Button>
        </CardContent>
      </Card>
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
