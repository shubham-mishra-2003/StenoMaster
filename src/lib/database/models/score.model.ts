// lib/database/models/score.model.ts
import {
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { connectToFirebase } from "../firebase";
import { handleError } from "@/lib/utils";
import { Score } from "@/types";

export async function createScoreDoc(scoreData: Score) {
  try {
    const db = await connectToFirebase();
    const scoreRef = db.collection("scores").doc(scoreData.id);
    await scoreRef.set({
      ...scoreData,
      completedAt: scoreData.completedAt.toISOString(),
    });
    const doc: DocumentSnapshot = await scoreRef.get();
    if (!doc.exists) {
      throw new Error("Failed to create score");
    }
    return doc.data() as Score;
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
      (doc: QueryDocumentSnapshot) =>
        ({
          ...doc.data(),
          completedAt: new Date(doc.data().completedAt),
        } as Score)
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
      (doc: QueryDocumentSnapshot) =>
        ({
          ...doc.data(),
          completedAt: new Date(doc.data().completedAt),
        } as Score)
    );
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function deleteScoresByStudent(studentId: string) {
  try {
    const db = await connectToFirebase();
    const snapshot = await db
      .collection("scores")
      .where("studentId", "==", studentId)
      .get();

    const batch = db.batch();
    snapshot.forEach((doc: QueryDocumentSnapshot) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    handleError(error);
    throw error;
  }
}
