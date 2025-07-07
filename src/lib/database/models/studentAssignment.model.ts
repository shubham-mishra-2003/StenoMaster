// lib/database/models/studentAssignment.model.ts
import {
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { connectToFirebase } from "../firebase";
import { handleError } from "@/lib/utils";
import { IAssignment } from "./assignment.model";

export interface IStudentAssignment {
  id: string;
  assignmentId: string;
  studentId: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface IScore {
  id: string;
  studentId: string;
  assignmentId: string;
  typedText: string;
  accuracy: number;
  wpm: number;
  timeElapsed: number;
  completedAt: string;
  isTypingTest?: boolean;
}

export async function createStudentAssignmentDoc(
  studentAssignmentData: IStudentAssignment
) {
  try {
    const db = await connectToFirebase();
    const studentAssignmentRef = db
      .collection("studentAssignments")
      .doc(studentAssignmentData.id);
    await studentAssignmentRef.set(studentAssignmentData);
    const doc: DocumentSnapshot = await studentAssignmentRef.get();
    if (!doc.exists) {
      throw new Error("Failed to create student assignment");
    }
    return doc.data() as IStudentAssignment;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function createScoreDoc(scoreData: IScore) {
  try {
    const db = await connectToFirebase();
    const scoreRef = db.collection("scores").doc(scoreData.id);
    await scoreRef.set(scoreData);
    const doc: DocumentSnapshot = await scoreRef.get();
    if (!doc.exists) {
      throw new Error("Failed to create score");
    }
    return doc.data() as IScore;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getStudentAssignmentsByStudent(studentId: string) {
  try {
    const db = await connectToFirebase();
    const snapshot = await db
      .collection("studentAssignments")
      .where("studentId", "==", studentId)
      .get();
    return snapshot.docs.map(
      (doc: QueryDocumentSnapshot) => doc.data() as IStudentAssignment
    );
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getScoresByStudent(studentId: string) {
  try {
    const db = await connectToFirebase();
    const snapshot = await db
      .collection("scores")
      .where("studentId", "==", studentId)
      .get();
    return snapshot.docs.map(
      (doc: QueryDocumentSnapshot) => doc.data() as IScore
    );
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getScoresByAssignment(assignmentId: string) {
  try {
    const db = await connectToFirebase();
    const snapshot = await db
      .collection("scores")
      .where("assignmentId", "==", assignmentId)
      .get();
    return snapshot.docs.map(
      (doc: QueryDocumentSnapshot) => doc.data() as IScore
    );
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getAssignmentsForStudent(
  studentId: string,
  classId: string
) {
  try {
    const db = await connectToFirebase();
    const assignmentsSnapshot = await db
      .collection("assignments")
      .where("classId", "==", classId)
      .where("isActive", "==", true)
      .get();

    const assignments: IAssignment[] = assignmentsSnapshot.docs.map(
      (doc: QueryDocumentSnapshot) => doc.data() as IAssignment
    );

    const studentAssignmentsSnapshot = await db
      .collection("studentAssignments")
      .where("studentId", "==", studentId)
      .where(
        "assignmentId",
        "in",
        assignments.map((assignment: IAssignment) => assignment.id)
      )
      .get();

    const studentAssignmentIds = studentAssignmentsSnapshot.docs.map(
      (doc: QueryDocumentSnapshot) => doc.data().assignmentId
    );

    return assignments.filter(
      (assignment: IAssignment) => !studentAssignmentIds.includes(assignment.id)
    );
  } catch (error) {
    handleError(error);
    throw error;
  }
}
