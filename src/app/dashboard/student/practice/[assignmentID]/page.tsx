"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Score } from "@/types";
import { Clock, Target } from "lucide-react";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useScore } from "@/hooks/useScore";
import { useIsMobile } from "@/hooks/use-mobile";

const AssignmentPracticeContent = () => {
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const { user } = useAuth();
  const { assignmentID } = useParams();
  const router = useRouter();
  const { assignments, submitScore } = useScore();
  const { colorScheme } = useTheme();
  const assignment = assignments.find((a) => a.id == assignmentID);
  const mobile = useIsMobile();
  const { fetchScores } = useScore();
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
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
      await fetchScores(user.userId);
      router.push("/dashboard/student/practice");
    } catch (err) {
      console.error("[PracticeAssignment] Error submitting score:", err);
      toast({
        title: "Error",
        description: "Failed to submit score. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  function getStatusArray(
    original: string,
    typed: string,
    lookahead = 4
  ): ("correct" | "wrong" | "pending")[] {
    const oChars = original.split("");
    const tChars = typed.split("");

    let oIndex = 0;
    let tIndex = 0;

    const statusArray: ("correct" | "wrong" | "pending")[] = new Array(
      oChars.length
    ).fill("pending");

    while (oIndex < oChars.length) {
      if (tIndex < tChars.length) {
        if (oChars[oIndex] === tChars[tIndex]) {
          statusArray[oIndex] = "correct";
          oIndex++;
          tIndex++;
        } else {
          let found = false;

          for (let la = 1; la <= lookahead; la++) {
            // Insertion
            if (
              tIndex + la < tChars.length &&
              tChars[tIndex + la] === oChars[oIndex]
            ) {
              for (let k = 0; k < la && oIndex + k < oChars.length; k++) {
                statusArray[oIndex + k] = "wrong";
              }
              tIndex += la;
              found = true;
              break;
            }

            // Deletion
            if (
              oIndex + la < oChars.length &&
              oChars[oIndex + la] === tChars[tIndex]
            ) {
              for (let k = 0; k < la && oIndex + k < oChars.length; k++) {
                statusArray[oIndex + k] = "wrong";
              }
              oIndex += la;
              found = true;
              break;
            }
          }

          if (!found) {
            statusArray[oIndex] = "wrong";
            oIndex++;
            tIndex++;
          }
        }
      } else {
        statusArray[oIndex] = "pending";
        oIndex++;
      }
    }

    return statusArray;
  }

  const calculateAccuracy = (typed: string, correct: string) => {
    const statusArray = getStatusArray(correct, typed);
    const typedPortion = statusArray.filter((s) => s !== "pending");
    const correctCount = typedPortion.filter((s) => s === "correct").length;

    return typedPortion.length > 0
      ? Math.round((correctCount / typedPortion.length) * 100)
      : 0;
  };

  const progress =
    assignment && assignment.correctText.length > 0
      ? Math.min((typedText.length / assignment.correctText.length) * 100, 100)
      : 0;

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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/student/practice")}
              className="gradient-button"
            >
              Back to Assignments
            </Button>
            {!isStarted ? (
              <Button
                onClick={handleStart}
                className="gradient-button"
                disabled={!user?.userId}
              >
                Start Assignment
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="gradient-button"
                disabled={typedText.trim().length === 0 || isCompleted}
              >
                Submit Assignment
              </Button>
            )}
          </div>
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
          <div
            className={`flex gap-6 h-full ${
              assignment.imageUrl ? "min-h-full" : "min-h-[500px]"
            }`}
          >
            {assignment.imageUrl && (
              <div className="flex flex-col gap-2 flex-1">
                <h3 className="font-medium">Assignment Image</h3>
                <div
                  className={`border-2 rounded-xl p-4 ${
                    colorScheme == "dark"
                      ? "border-slate-600 shadow-slate-950"
                      : "border-slate-300 shadow-slate-400"
                  }`}
                >
                  <Image
                    height={300}
                    width={300}
                    src={assignment.imageUrl}
                    alt={assignment.title}
                    className="w-full h-auto rounded"
                  />
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2 flex-1">
              <h3 className="font-medium">Type the text you see</h3>
              <Textarea
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder="Start typing here..."
                className="h-full"
                disabled={!isStarted || isCompleted}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentPracticeContent;
