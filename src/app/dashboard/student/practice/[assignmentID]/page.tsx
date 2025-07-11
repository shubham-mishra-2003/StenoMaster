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

const PracticeAssignment = () => {
  const token = localStorage.getItem("StenoMaster-token");
  const { assignmentID } = useParams();
  const router = useRouter();
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignment, setAssignment] = useState<Assignment>();
  const [studentClass, setStudentClass] = useState<Class[]>([]);
  const [scores, setScores] = useState<Score[]>([]);

  const fetchClasses = async () => {
    if (loading || !token) return;
    setLoading(true);
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "getStudentClasses" }),
      });

      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Empty response from server" };

      if (
        response.ok &&
        result.status === "success" &&
        Array.isArray(result.data)
      ) {
        setStudentClass(result.data);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch student classes",
          variant: "destructive",
        });
        setStudentClass([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          "An unexpected error occurred while fetching student classes.",
        variant: "destructive",
      });
      setStudentClass([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (classId: string) => {
    try {
      const response = await fetch("/api/assignment/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, classId }),
        signal: AbortSignal.timeout(5000),
      });
      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Failed to fetch assignment" };

      if (response.ok && result.status === "success") {
        setAssignments(result.data);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch assignments",
          variant: "destructive",
        });
        setAssignments([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive",
      });
      setAssignments([]);
    }
  };

  const submitScore = (score: Score) => {
    try {
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive",
      });
      setScores([]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user]);

  useEffect(() => {
    if (studentClass.length > 0) {
      fetchAssignments(studentClass[0].id);
    } else if (!loading && studentClass.length === 0) {
      setAssignments([]);
      if (user) {
        toast({
          title: "No Classes",
          description: "No classes found for this student.",
          variant: "destructive",
        });
      }
    }
    const foundAssignment = assignments.find((a) => a.id === assignmentID);
    setAssignment(foundAssignment);
  }, [studentClass, loading, user]);

  const handleStart = () => {
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

    // try {
    //   await submitScore(score);
    //   toast({
    //     title: "Success",
    //     description: "Assignment submitted successfully.",
    //   });
    //   router.push("/dashboard/student/practice");
    // } catch (err) {
    //   console.error("[PracticeAssignment] Error submitting score:", err);
    //   toast({
    //     title: "Error",
    //     description: "Failed to submit score. Please try again.",
    //     variant: "destructive",
    //   });
    // }
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
        <p
          className={
            colorScheme === "dark" ? "text-dark-muted" : "text-light-muted"
          }
        >
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
