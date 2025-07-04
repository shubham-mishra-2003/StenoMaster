import {
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { connectToFirebase } from "../firebase";
import { handleError } from "@/lib/utils";

export interface IAssignment {
  id: string;
  title: string;
  deadline: string;
  imageUrl: string;
  correctText: string;
  classId: string;
  teacherId: string;
  createdAt: string;
  isActive: boolean;
}

export async function createAssignmentDoc(assignmentData: IAssignment) {
  try {
    const db = await connectToFirebase();
    const assignmentRef = db.collection("assignments").doc(assignmentData.id);
    await assignmentRef.set(assignmentData);
    const doc: DocumentSnapshot = await assignmentRef.get();
    if (!doc.exists) {
      throw new Error("Failed to create assignment");
    }
    return doc.data() as IAssignment;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getAssignmentDocById(assignmentId: string) {
  try {
    const db = await connectToFirebase();
    const assignmentRef = db.collection("assignments").doc(assignmentId);
    const doc: DocumentSnapshot = await assignmentRef.get();
    if (!doc.exists) {
      throw new Error("Assignment not found");
    }
    return doc.data() as IAssignment;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getAssignmentsByClass(classId: string) {
  try {
    const db = await connectToFirebase();
    const snapshot = await db
      .collection("assignments")
      .where("classId", "==", classId)
      .get();
    return snapshot.docs.map(
      (doc: QueryDocumentSnapshot) => doc.data() as IAssignment
    );
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getAssignmentsByTeacher(teacherId: string) {
  try {
    const db = await connectToFirebase();
    const snapshot = await db
      .collection("assignments")
      .where("teacherId", "==", teacherId)
      .get();
    return snapshot.docs.map(
      (doc: QueryDocumentSnapshot) => doc.data() as IAssignment
    );
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function updateAssignmentDoc(
  assignmentId: string,
  updates: Partial<IAssignment>
) {
  try {
    const db = await connectToFirebase();
    const assignmentRef = db.collection("assignments").doc(assignmentId);
    await assignmentRef.update(updates);
    const doc: DocumentSnapshot = await assignmentRef.get();
    if (!doc.exists) {
      throw new Error("Assignment not found");
    }
    return doc.data() as IAssignment;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function deleteAssignmentDoc(assignmentId: string) {
  try {
    const db = await connectToFirebase();
    await db.collection("assignments").doc(assignmentId).delete();
    return { success: true };
  } catch (error) {
    handleError(error);
    throw error;
  }
}
