"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Target, RotateCcw } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/ThemeProvider";

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet at least once.",
  "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole filled with the ends of worms and an oozy smell.",
  "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness.",
  "To be or not to be, that is the question. Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune.",
  "Call me Ishmael. Some years ago never mind how long precisely having little or no money in my purse.",
];

interface TypingTestResult {
  id: string;
  userId: string;
  text: string;
  typedText: string;
  wpm: number;
  accuracy: number;
  completedAt: Date;
  timeElapsed: number;
}

const TypingTest = () => {
  const [currentText, setCurrentText] = useState(sampleTexts[0]);
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [testResults, setTestResults] = useLocalStorage<TypingTestResult[]>(
    "stenolearn-typing-tests",
    []
  );

  const { colorScheme } = useTheme();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && startTime && !isCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, startTime, isCompleted]);

  useEffect(() => {
    if (typedText.length === currentText.length) {
      handleComplete();
    }
  }, [typedText, currentText]);

  const handleStart = () => {
    setIsStarted(true);
    setStartTime(new Date());
    setTimeElapsed(0);
    inputRef.current?.focus();
  };

  const handleComplete = () => {
    if (!startTime || !user || isCompleted) return;

    setIsCompleted(true);
    const accuracy = calculateAccuracy();
    const wpm = calculateWPM();

    const result: TypingTestResult = {
      id: `test-${Date.now()}`,
      userId: user.id,
      text: currentText,
      typedText,
      wpm,
      accuracy,
      completedAt: new Date(),
      timeElapsed,
    };

    setTestResults((prev) => [...prev, result]);

    toast({
      title: "Typing Test Completed!",
      description: `WPM: ${wpm}, Accuracy: ${accuracy}%`,
    });
  };

  const calculateAccuracy = () => {
    let correct = 0;
    for (let i = 0; i < Math.min(typedText.length, currentText.length); i++) {
      if (typedText[i] === currentText[i]) {
        correct++;
      }
    }
    return Math.round((correct / currentText.length) * 100);
  };

  const calculateWPM = () => {
    const words = typedText.trim().split(/\s+/).length;
    const minutes = timeElapsed / 60;
    return Math.round(words / minutes) || 0;
  };

  const handleReset = () => {
    setTypedText("");
    setIsStarted(false);
    setIsCompleted(false);
    setStartTime(null);
    setTimeElapsed(0);
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
    setCurrentText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)]);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isStarted || isCompleted) return;
    setTypedText(e.target.value);
  };

  const renderText = () => {
    return currentText.split("").map((char, index) => {
      let className = "text-lg ";

      if (index < typedText.length) {
        if (typedText[index] === char) {
          className += `${
            colorScheme == "dark"
              ? "bg-green-800 text-green-200"
              : "bg-green-200 text-green-800"
          }`;
        } else {
          className += `${
            colorScheme == "dark"
              ? "bg-red-800 text-red-200"
              : "bg-red-200 text-red-800"
          }`;
        }
      } else if (index === typedText.length) {
        className += `${colorScheme == "dark" ? "bg-blue-800" : "bg-blue-200"}`;
      } else {
        className += `${colorScheme == "dark" ? "text-dark" : "text-light"}`;
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  const progress = (typedText.length / currentText.length) * 100;
  const currentWPM = timeElapsed > 0 ? calculateWPM() : 0;
  const currentAccuracy = typedText.length > 0 ? calculateAccuracy() : 100;

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
            <Button
              variant="outline"
              onClick={handleReset}
              className="gradient-button"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              New Test
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`relative font-bold flex items-center gap-2 p-3 rounded-2xl overflow-hidden bg-gradient-to-br backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                colorScheme == "dark"
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
                colorScheme == "dark"
                  ? "from-gray-900/80 via-gray-800/60 to-gray-700/40"
                  : "from-white/80 via-white/60 to-white/40"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-5"></div>
              <Target className="h-4 w-4" />
              <div>
                <p
                  className={`text-sm ${
                    colorScheme == "dark" ? "text-dark" : "text-light"
                  }`}
                >
                  WPM
                </p>
                <p
                  className={`font-mono text-lg ${
                    colorScheme == "dark" ? "text-dark" : "text-light"
                  }`}
                >
                  {currentWPM}
                </p>
              </div>
            </div>

            <div
              className={`relative flex items-center gap-2 p-3 rounded-2xl overflow-hidden font-bold bg-gradient-to-br backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                colorScheme == "dark"
                  ? "from-gray-900/80 via-gray-800/60 to-gray-700/40"
                  : "from-white/80 via-white/60 to-white/40"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 opacity-5"></div>
              <Target className="h-4 w-4" />
              <div>
                <p
                  className={`text-sm ${
                    colorScheme == "dark" ? "text-dark" : "text-light"
                  }`}
                >
                  Accuracy
                </p>
                <p
                  className={`font-mono text-lg ${
                    colorScheme == "dark" ? "text-dark" : "text-light"
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
                  colorScheme == "dark" ? "text-dark" : "text-light"
                }`}
              >
                Progress
              </span>
              <span
                className={`text-xl ${
                  colorScheme == "dark" ? "text-dark" : "text-light"
                }`}
              >
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <div
            className={`p-6 border rounded-lg bg-gradient-to-r backdrop-blur-sm ${
              colorScheme == "dark"
                ? "from-gray-800/30 to-blue-950/30 border-gray-500"
                : "border-blue-500/60 from-blue-500/10 to-blue-50/10"
            }`}
          >
            <div className="font-mono leading-relaxed select-none">
              {renderText()}
            </div>
          </div>

          <div className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              value={typedText}
              onChange={handleTextChange}
              autoFocus={isStarted}
              className={`w-full p-4 border rounded-lg bg-gradient-to-r backdrop-blur-sm font-mono text-lg ${
                colorScheme == "dark"
                  ? "from-gray-800/30 to-blue-950/30 border-gray-500"
                  : "border-blue-500/60 from-blue-500/10 to-blue-50/10"
              }`}
              placeholder={
                isStarted ? "Type here..." : "Click Start Test to begin"
              }
              disabled={!isStarted || isCompleted}
            />

            <div className="flex gap-2">
              {!isStarted ? (
                <Button
                  onClick={handleStart}
                  className="w-full gradient-button rounded-2xl"
                >
                  Start Test
                </Button>
              ) : isCompleted ? (
                <Button
                  onClick={handleReset}
                  className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl"
                >
                  Take Another Test
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full bg-gradient-to-r from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 border-red-200 dark:border-red-800 cursor-pointer rounded-2xl"
                >
                  Reset Test
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-blue-500/5"></div>
          <CardHeader>
            <CardTitle>Recent Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults
                .slice(-5)
                .reverse()
                .map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-white/50 to-purple-50/50 dark:from-gray-800/50 dark:to-purple-950/50 rounded-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/20"
                  >
                    <div>
                      <p className="font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-blue-200 dark:to-gray-100 bg-clip-text text-transparent">
                        {result.wpm} WPM
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result.accuracy}% accuracy in {result.timeElapsed}s
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

export default TypingTest;
