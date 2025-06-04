
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Target, RotateCcw } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet at least once.",
  "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole filled with the ends of worms and an oozy smell.",
  "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness.",
  "To be or not to be, that is the question. Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune.",
  "Call me Ishmael. Some years ago never mind how long precisely having little or no money in my purse."
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
  const [testResults, setTestResults] = useLocalStorage<TypingTestResult[]>("stenolearn-typing-tests", []);

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

    setTestResults(prev => [...prev, result]);
    
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
    return currentText.split('').map((char, index) => {
      let className = "text-lg ";
      
      if (index < typedText.length) {
        if (typedText[index] === char) {
          className += "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200";
        } else {
          className += "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200";
        }
      } else if (index === typedText.length) {
        className += "bg-blue-200 dark:bg-blue-800";
      } else {
        className += "text-muted-foreground";
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Typing Speed Test
            </CardTitle>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              New Test
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-mono text-lg">
                  {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">WPM</p>
                <p className="font-mono text-lg">{currentWPM}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="font-mono text-lg">{currentAccuracy}%</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <div className="p-6 border rounded-lg bg-card">
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
              className="w-full p-4 border rounded-lg bg-background font-mono text-lg"
              placeholder={isStarted ? "Type here..." : "Click Start Test to begin"}
              disabled={!isStarted || isCompleted}
            />
            
            <div className="flex gap-2">
              {!isStarted ? (
                <Button onClick={handleStart} className="w-full">
                  Start Test
                </Button>
              ) : isCompleted ? (
                <Button onClick={handleReset} className="w-full">
                  Take Another Test
                </Button>
              ) : (
                <Button variant="outline" onClick={handleReset} className="w-full">
                  Reset Test
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.slice(-5).reverse().map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{result.wpm} WPM</p>
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
