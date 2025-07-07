// lib/actions/studentAssignment.actions.ts
"use server";

import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import { validateSessionToken } from "./user.action";
import {
  createStudentAssignmentDoc,
  createScoreDoc,
  getStudentAssignmentsByStudent,
  getScoresByStudent,
  getScoresByAssignment,
  getAssignmentsForStudent,
  IStudentAssignment,
  IScore,
} from "../database/models/studentAssignment.model";
import { getClassDocById } from "../database/models/class.model";
import { getAssignmentDocById } from "../database/models/assignment.model";

export async function getAvailableAssignments(token: string, classId: string) {
  try {
    await connectToDatabase();
    const user = await validateSessionToken(token);
    if (user.userType !== "student") {
      throw new Error("Only students can fetch available assignments");
    }

    const classData = await getClassDocById(classId);
    if (!classData || !classData.students.includes(user.userId)) {
      throw new Error("Student not enrolled in this class");
    }

    const assignments = await getAssignmentsForStudent(user.userId, classId);
    return assignments;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function submitAssignmentScore(scoreData: {
  studentId: string;
  assignmentId: string;
  typedText: string;
  accuracy: number;
  wpm: number;
  timeElapsed: number;
  token: string;
  isTypingTest?: boolean;
}) {
  try {
    await connectToDatabase();
    const user = await validateSessionToken(scoreData.token);
    if (user.userType !== "student") {
      throw new Error("Only students can submit assignment scores");
    }

    const assignment = await getAssignmentDocById(scoreData.assignmentId);
    if (!assignment || !assignment.isActive) {
      throw new Error("Assignment not found or is inactive");
    }

    const classData = await getClassDocById(assignment.classId);
    if (!classData || !classData.students.includes(user.userId)) {
      throw new Error("Student not enrolled in this class");
    }

    const scoreId = `score-${Date.now()}`;
    const newScore = await createScoreDoc({
      id: scoreId,
      studentId: scoreData.studentId,
      assignmentId: scoreData.assignmentId,
      typedText: scoreData.typedText,
      accuracy: scoreData.accuracy,
      wpm: scoreData.wpm,
      timeElapsed: scoreData.timeElapsed,
      completedAt: new Date().toISOString(),
      isTypingTest: scoreData.isTypingTest || false,
    });

    const studentAssignmentId = `studentAssignment-${Date.now()}`;
    await createStudentAssignmentDoc({
      id: studentAssignmentId,
      assignmentId: scoreData.assignmentId,
      studentId: scoreData.studentId,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    });

    return newScore;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getStudentScores(token: string, studentId: string) {
  try {
    await connectToDatabase();
    const user = await validateSessionToken(token);
    if (user.userType !== "teacher" && user.userId !== studentId) {
      throw new Error("Unauthorized to fetch scores");
    }

    return await getScoresByStudent(studentId);
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getScoresForAssignment(
  token: string,
  assignmentId: string
) {
  try {
    await connectToDatabase();
    const user = await validateSessionToken(token);
    if (user.userType !== "teacher") {
      throw new Error("Only teachers can fetch assignment scores");
    }

    const assignment = await getAssignmentDocById(assignmentId);
    if (!assignment || assignment.teacherId !== user.userId) {
      throw new Error("Assignment not found or unauthorized");
    }

    return await getScoresByAssignment(assignmentId);
  } catch (error) {
    handleError(error);
    throw error;
  }
}
