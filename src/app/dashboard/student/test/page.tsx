"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Target,
  RotateCcw,
  ArrowBigLeft,
  Play,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/ThemeProvider";
import { Score } from "@/types";
import { sampleTexts } from "./sample-texts";
import { useRouter } from "next/navigation";
import { useScore } from "@/hooks/useScore";
import { useIsMobile } from "@/hooks/use-mobile";

const TypingTestContent = () => {
  const [currentText, setCurrentText] = useState(
    () => sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
  );
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const { colorScheme } = useTheme();
  const { scores, submitScore, fetchScores } = useScore();

  if (!user) {
    return;
  }

  const handleStart = () => {
    if (!user?.userId) {
      return;
    }
    setIsStarted(true);
    setStartTime(new Date());
    setTimeElapsed(0);
    inputRef.current?.focus();
  };

  const handleComplete = async () => {
    if (!startTime || !user?.userId || isCompleted) {
      return;
    }
    setIsLoading(true);
    setIsCompleted(true);
    const accuracy = calculateAccuracy();
    const wpm = calculateWPM();
    const word = currentText.split(/\s+/);
    const scoreId = word.slice(0, 4).join(" ");

    const result: Score = {
      id: `test-${Date.now()}`,
      studentId: user.userId,
      assignmentId: `typing-test-${scoreId}`,
      typedText,
      accuracy,
      wpm,
      timeElapsed,
      completedAt: new Date(),
    };

    try {
      await submitScore(result);
      toast({
        title: "Typing Test Completed!",
        description: `WPM: ${wpm}, Accuracy: ${accuracy}%, Time: ${timeElapsed}`,
      });
      await fetchScores(user.userId);
      setTypedText("");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save test result",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateWPM = () => {
    if (timeElapsed <= 0) return 0;
    const words = typedText.trim().split(/\s+/).length;
    const minutes = timeElapsed / 60;
    return Math.round(words / minutes);
  };

  const handleReset = () => {
    setTypedText("");
    setIsStarted(false);
    setIsCompleted(false);
    setStartTime(null);
    setTimeElapsed(0);
    setCurrentText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)]);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isStarted || isCompleted) return;
    setTypedText(e.target.value);
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

  const renderText = () => {
    const statusArray = getStatusArray(currentText, typedText);

    return currentText.split("").map((char, index) => {
      let className = "text-lg ";
      if (statusArray[index] === "correct") {
        className +=
          colorScheme === "dark"
            ? "bg-green-800 text-green-200"
            : "bg-green-200 text-green-800";
      } else if (statusArray[index] === "wrong") {
        className +=
          colorScheme === "dark"
            ? "bg-red-800 text-red-200"
            : "bg-red-200 text-red-800";
      } else {
        className += colorScheme === "dark" ? "text-dark" : "text-light";
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  const calculateAccuracy = () => {
    const statusArray = getStatusArray(currentText, typedText);
    const typedPortion = statusArray.filter((s) => s !== "pending");
    const correct = typedPortion.filter((s) => s === "correct").length;

    return typedPortion.length > 0
      ? Math.round((correct / typedPortion.length) * 100)
      : 0;
  };

  const progress = (typedText.length / currentText.length) * 100;
  const currentWPM = timeElapsed > 0 ? calculateWPM() : 0;
  const currentAccuracy = typedText.length > 0 ? calculateAccuracy() : 0;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && startTime && !isCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, startTime, isCompleted]);

  // if (isLoading) {
  //   return (
  //     <Card>
  //       <CardContent className="flex flex-col items-center justify-center py-12">
  //         <p className="text-muted-foreground">Loading typing test...</p>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  const router = useRouter();

  return (
    <div className="space-y-6">
      <Card>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Typing Speed Test
            </CardTitle>
            <div className="flex justify-center items-center gap-2 w-fit">
              <Button
                variant="outline"
                onClick={() => {
                  router.push("/dashboard/student/");
                }}
                className="gradient-button"
                disabled={isLoading}
              >
                <ArrowBigLeft className="h-4 w-4 mr-2" />
                Back to dashboard
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="gradient-button"
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                New Test
              </Button>
              {!isStarted ? (
                <Button
                  onClick={handleStart}
                  className="gradient-button"
                  disabled={!user?.userId || isLoading}
                >
                  <Play />
                  Start Test
                </Button>
              ) : isCompleted ? (
                <Button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl"
                >
                  <ArrowRight />
                  Take Another Test
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 border-red-200 dark:border-red-800 cursor-pointer rounded-2xl"
                >
                  <RefreshCw />
                  Reset Test
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`relative font-bold flex items-center gap-2 p-3 rounded-2xl overflow-hidden bg-gradient-to-br backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                colorScheme === "dark"
                  ? "from-gray-900/80 via-gray-800/60 to-gray-700/40"
                  : "from-white/80 via-white/60 to-white/40"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-5"></div>
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm">Time</p>
                <p className="font-mono text-lg">
                  {Math.floor(timeElapsed / 60)}:
                  {(timeElapsed % 60).toString().padStart(2, "0")}
                </p>
              </div>
            </div>
            <div
              className={`relative font-bold flex items-center gap-2 p-3 rounded-2xl overflow-hidden bg-gradient-to-br backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                colorScheme === "dark"
                  ? "from-gray-900/80 via-gray-800/60 to-gray-700/40"
                  : "from-white/80 via-white/60 to-white/40"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-5"></div>
              <Target className="h-4 w-4" />
              <div>
                <p
                  className={`text-sm ${
                    colorScheme === "dark" ? "text-dark" : "text-light"
                  }`}
                >
                  WPM
                </p>
                <p
                  className={`font-mono text-lg ${
                    colorScheme === "dark" ? "text-dark" : "text-light"
                  }`}
                >
                  {currentWPM}
                </p>
              </div>
            </div>
            <div
              className={`relative flex items-center gap-2 p-3 rounded-2xl overflow-hidden font-bold bg-gradient-to-br backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                colorScheme === "dark"
                  ? "from-gray-900/80 via-gray-800/60 to-gray-700/40"
                  : "from-white/80 via-white/60 to-white/40"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 opacity-5"></div>
              <Target className="h-4 w-4" />
              <div>
                <p
                  className={`text-sm ${
                    colorScheme === "dark" ? "text-dark" : "text-light"
                  }`}
                >
                  Accuracy
                </p>
                <p
                  className={`font-mono text-lg ${
                    colorScheme === "dark" ? "text-dark" : "text-light"
                  }`}
                >
                  {currentAccuracy}%
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className={`flex items-center justify-between font-bold`}>
              <span
                className={`text-xl ${
                  colorScheme === "dark" ? "text-dark" : "text-light"
                }`}
              >
                Progress
              </span>
              <span
                className={`text-xl ${
                  colorScheme === "dark" ? "text-dark" : "text-light"
                }`}
              >
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
          <div className="flex gap-3 justify-between">
            <div
              className={`p-6 border rounded-lg bg-gradient-to-r backdrop-blur-sm flex-1/2 ${
                colorScheme === "dark"
                  ? "from-gray-800/30 to-blue-950/30 border-gray-500"
                  : "border-blue-500/60 from-blue-500/10 to-blue-50/10"
              }`}
            >
              {renderText()}
            </div>
            <textarea
              ref={inputRef}
              value={typedText}
              onChange={handleTextChange}
              autoFocus={isStarted}
              className={`w-full min-h-full p-4 border rounded-lg bg-gradient-to-r backdrop-blur-sm font-mono text-lg flex-1/2 ${
                colorScheme === "dark"
                  ? "from-gray-800/30 to-blue-950/30 border-gray-500"
                  : "border-blue-500/60 from-blue-500/10 to-blue-50/10"
              }`}
              placeholder={
                isStarted ? "Type here..." : "Click Start Test to begin"
              }
              disabled={!isStarted || isCompleted}
            />
          </div>
          <Button
            className="gradient-button w-full"
            disabled={isLoading}
            onClick={handleComplete}
          >
            Submit
          </Button>
        </CardContent>
      </Card>
      {scores.filter((score) => score.assignmentId.startsWith("typing-test"))
        .length > 0 && (
        <Card className="max-h-[70vh] overflow-auto bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-blue-500/5">
          <CardHeader>
            <CardTitle>Recent Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scores
                .filter((score) => score.assignmentId.startsWith("typing-test"))
                .reverse()
                .map((result) => (
                  <div
                    key={result.id}
                    className={`flex items-center justify-between p-3 bg-gradient-to-r rounded-lg backdrop-blur-sm border ${
                      colorScheme === "dark"
                        ? "from-gray-800/30 to-blue-950/30 border-gray-500"
                        : "border-blue-500/60 from-blue-500/10 to-blue-50/10"
                    }`}
                  >
                    <div>
                      <p
                        className={`font-semibold ${
                          colorScheme === "dark" ? "text-dark" : "text-light"
                        }`}
                      >
                        {result.wpm} WPM
                      </p>
                      <p
                        className={`font-semibold text-sm ${
                          colorScheme === "dark" ? "text-dark" : "text-light"
                        }`}
                      >
                        {result.accuracy}% accuracy
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(result.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TypingTestContent;
