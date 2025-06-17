"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Clock, Target } from "lucide-react";
import { Assignment, Score } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

const TypingPractice = ({}: // assignments
{
  // assignments: Assignment[];
}) => {
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const { user } = useAuth();
  const [scores, setScores] = useLocalStorage<Score[]>("stenolearn-scores", []);

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

    // Reset form
    setTypedText("");
    setIsStarted(false);
    setStartTime(null);
    setTimeElapsed(0);
  };

  const progress =
    selectedAssignment && selectedAssignment.correctText.length > 0
      ? Math.min(
          (typedText.length / selectedAssignment.correctText.length) * 100,
          100
        )
      : 0;

  if (!selectedAssignment) {
    const assignments: Assignment[] = [
      {
        id: "1",
        description: "ABCD",
        title: "XYZ",
        correctText: "1234",
        createdAt: new Date(),
        classId: "12",
        imageUrl: "",
        isActive: true,
      },
      {
        id: "2",
        description: "ABCD",
        title: "XYZ",
        correctText: "1234",
        createdAt: new Date(),
        classId: "12",
        imageUrl: "",
        isActive: true,
      },
    ];
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            onValueChange={(value) => {
              const assignment = assignments.find((a) => a.id === value);
              if (assignment) setSelectedAssignment(assignment);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose an assignment to practice" />
            </SelectTrigger>
            <SelectContent>
              {assignments.map((assignment) => (
                <SelectItem key={assignment.id} value={assignment.id}>
                  {assignment.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedAssignment.title}
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => setSelectedAssignment(null)}
            >
              Change Assignment
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
                    className="min-h-[200px]"
                    disabled={!isStarted}
                  />
                </div>

                <div className="flex gap-2">
                  {!isStarted ? (
                    <Button onClick={handleStart} className="w-full">
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

export default TypingPractice;
