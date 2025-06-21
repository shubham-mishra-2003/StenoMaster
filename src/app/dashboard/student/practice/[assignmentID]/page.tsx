"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Clock, Target } from "lucide-react";
import { Assignment, Score } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";

// Force client-side rendering to ensure localStorage is available
export const dynamic = "force-dynamic";

const AssignmentPractice = () => {
  const params = useParams();
  const assignmentID = params.assignmentID;
  const [assignments] = useLocalStorage<Assignment[]>(
    "stenolearn-assignments",
    []
  );
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const { user } = useAuth();
  const [scores, setScores] = useLocalStorage<Score[]>("stenolearn-scores", []);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Normalize assignmentID to prevent comparison issues
  const normalizedAssignmentID =
    typeof assignmentID === "string" ? assignmentID.trim() : "";

  useEffect(() => {
    setIsLoading(true);
    console.log("Assignment Page - Raw useParams:", params);
    console.log(
      "Assignment Page - Assignment ID from URL:",
      normalizedAssignmentID
    );
    console.log("Assignment Page - Type of assignmentID:", typeof assignmentID);
    console.log("Assignment Page - Assignments loaded:", assignments);
    console.log("Assignment Page - Assignments length:", assignments.length);
    assignments.forEach((assignment, index) =>
      console.log(
        `Assignment Page - Assignment ${index + 1}: ID=${
          assignment.id
        }, Title=${assignment.title}, ID Type=${typeof assignment.id}`
      )
    );
    const foundAssignment = assignments.find(
      (a) => a.id === normalizedAssignmentID
    );
    console.log("Assignment Page - Found assignment:", foundAssignment);
    setIsLoading(false);
  }, [normalizedAssignmentID, assignments]);

  const selectedAssignment = assignments.find(
    (a) => a.id === normalizedAssignmentID
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && startTime) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, startTime]);

  const calculateAccuracy = (typed: string, correct: string) => {
    const typedWords = typed.trim().split(/\s+/);
    const correctWords = correct.trim().split(/\s+/);
    let correctCount = 0;

    typedWords.forEach((word, index) => {
      if (correctWords[index] && word === correctWords[index]) {
        correctCount++;
      }
    });

    return Math.round((correctCount / correctWords.length) * 100);
  };

  const calculateWPM = (typed: string, timeInSeconds: number) => {
    const words = typed.trim().split(/\s+/).length;
    return Math.round((words / timeInSeconds) * 60);
  };

  const handleStart = () => {
    setIsStarted(true);
    setStartTime(new Date());
    setTimeElapsed(0);
  };

  const handleSubmit = () => {
    if (!startTime || !user || !selectedAssignment) return;

    const accuracy = calculateAccuracy(
      typedText,
      selectedAssignment.correctText
    );
    const wpm = calculateWPM(typedText, timeElapsed);

    const score: Score = {
      id: `score-${Date.now()}`,
      studentId: user.id,
      assignmentId: selectedAssignment.id,
      typedText,
      accuracy,
      wpm,
      completedAt: new Date(),
    };

    const updatedScores = [...scores, score];
    setScores(updatedScores);

    toast({
      title: "Assignment Completed!",
      description: `Accuracy: ${accuracy}%, WPM: ${wpm}`,
    });

    // Reset form and navigate back to practice page
    setTypedText("");
    setIsStarted(false);
    setStartTime(null);
    setTimeElapsed(0);
    router.push("/dashboard/student/practice");
  };

  const progress =
    selectedAssignment && selectedAssignment.correctText.length > 0
      ? Math.min(
          (typedText.length / selectedAssignment.correctText.length) * 100,
          100
        )
      : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Card className="max-w-7xl mx-auto w-full">
          <CardHeader>
            <CardTitle>Loading Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading assignment details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedAssignment) {
    return (
      <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Card className="max-w-7xl mx-auto w-full">
          <CardHeader>
            <CardTitle>Assignment Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              No assignment found with ID:{" "}
              {normalizedAssignmentID || "undefined"}
            </p>
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
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Card className="max-w-7xl mx-auto w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {selectedAssignment.title}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Assignment Image</h3>
                <div className="border rounded-lg p-4 bg-muted">
                  <Image
                    height={300}
                    width={300}
                    src={selectedAssignment.imageUrl}
                    alt={selectedAssignment.title}
                    className="w-full h-auto rounded"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Type the text you see</h3>
                  <Textarea
                    value={typedText}
                    onChange={(e) => setTypedText(e.target.value)}
                    placeholder="Start typing here..."
                    className="min-h-[500px]"
                    disabled={!isStarted}
                  />
                </div>

                <div className="flex gap-2">
                  {!isStarted ? (
                    <Button
                      onClick={handleStart}
                      className="w-full gradient-button"
                    >
                      Start Assignment
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      className="w-full"
                      disabled={typedText.trim().length === 0}
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
    </div>
  );
};

export default AssignmentPractice;
