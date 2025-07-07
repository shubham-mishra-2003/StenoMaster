// lib/actions/score.actions.ts
"use server";

import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import { validateSessionToken } from "./user.action";
import {
  createScoreDoc,
  getScoresByStudent,
} from "../database/models/score.model";
import { Score } from "@/types";

export async function createScore(scoreData: Score) {
  try {
    await connectToDatabase();
    const user = await validateSessionToken(scoreData.studentId);
    if (user.userType !== "student") {
      throw new Error("Only students can submit scores");
    }
    const newScore = await createScoreDoc({
      ...scoreData,
      completedAt: new Date(scoreData.completedAt),
    });
    return newScore;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getStudentScores(studentId: string, token: string) {
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