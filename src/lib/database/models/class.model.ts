import { connectToFirebase } from "../../database/firebase";
import {
  QueryDocumentSnapshot,
  QuerySnapshot,
  DocumentSnapshot,
} from "firebase-admin/firestore";
import { handleError } from "../../utils";

export interface IClass {
  id: string;
  name: string;
  teacherId: string;
  students: string[];
  assignments: string[];
  createdAt: Date;
}

export async function createClassDoc(classData: {
  id: string;
  name: string;
  teacherId: string;
}) {
  try {
    const db = await connectToFirebase();
    const classRef = db.collection("classes").doc(classData.id);
    await classRef.set({
      name: classData.name,
      teacherId: classData.teacherId,
      students: [],
      assignments: [],
      createdAt: new Date(),
    });
    return {
      id: classData.id,
      name: classData.name,
      teacherId: classData.teacherId,
      students: [],
      assignments: [],
      createdAt: new Date(),
    };
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getClassDocById(classId: string): Promise<IClass | null> {
  try {
    const db = await connectToFirebase();
    const classRef = db.collection("classes").doc(classId);
    const docSnap: DocumentSnapshot = await classRef.get();
    if (!docSnap.exists) {
      return null;
    }
    const data = docSnap.data();
    if (!data) {
      throw new Error("Class data is undefined");
    }
    return {
      id: docSnap.id,
      name: data.name,
      teacherId: data.teacherId,
      students: data.students || [],
      assignments: data.assignments || [],
      createdAt:
        data.createdAt instanceof Date
          ? data.createdAt
          : new Date(data.createdAt),
    };
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getClassesByTeacher(
  teacherId: string
): Promise<IClass[]> {
  try {
    const db = await connectToFirebase();
    const classesCollection = db.collection("classes");
    const querySnapshot: QuerySnapshot = await classesCollection
      .where("teacherId", "==", teacherId)
      .get();
    const classes: IClass[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      if (!data) {
        throw new Error("Class data is undefined");
      }
      classes.push({
        id: doc.id,
        name: data.name,
        teacherId: data.teacherId,
        students: data.students || [],
        assignments: data.assignments || [],
        createdAt:
          data.createdAt instanceof Date
            ? data.createdAt
            : new Date(data.createdAt),
      });
    });
    return classes;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function deleteClassDoc(classId: string) {
  try {
    const db = await connectToFirebase();
    const classRef = db.collection("classes").doc(classId);
    await classRef.delete();
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function assignStudentToClassDoc(
  classId: string,
  studentId: string
) {
  try {
    const db = await connectToFirebase();
    const classRef = db.collection("classes").doc(classId);
    const docSnap: DocumentSnapshot = await classRef.get();
    if (!docSnap.exists) {
      throw new Error("Class not found");
    }
    const classData = docSnap.data();
    if (!classData) {
      throw new Error("Class data is undefined");
    }
    if (!classData.students.includes(studentId)) {
      await classRef.update({
        students: [...classData.students, studentId],
      });
    }
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function removeStudentFromClassDoc(
  classId: string,
  studentId: string
) {
  try {
    const db = await connectToFirebase();
    const classRef = db.collection("classes").doc(classId);
    const docSnap: DocumentSnapshot = await classRef.get();
    if (!docSnap.exists) {
      throw new Error("Class not found");
    }
    const classData = docSnap.data();
    if (!classData) {
      throw new Error("Class data is undefined");
    }
    await classRef.update({
      students: classData.students.filter((id: string) => id !== studentId),
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function updateClassDoc(
  classId: string,
  updates: Partial<IClass>
) {
  try {
    const db = await connectToFirebase();
    const classRef = db.collection("classes").doc(classId);
    const docSnap: DocumentSnapshot = await classRef.get();
    if (!docSnap.exists) {
      throw new Error("Class not found");
    }
    await classRef.update(updates);
    const updatedDocSnap: DocumentSnapshot = await classRef.get();
    const updatedData = updatedDocSnap.data();
    if (!updatedData) {
      throw new Error("Updated class data is undefined");
    }
    return {
      id: updatedDocSnap.id,
      name: updatedData.name,
      teacherId: updatedData.teacherId,
      students: updatedData.students || [],
      assignments: updatedData.assignments || [],
      createdAt:
        updatedData.createdAt instanceof Date
          ? updatedData.createdAt
          : new Date(updatedData.createdAt),
    };
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getClassesByStudent(
  studentId: string
): Promise<IClass[]> {
  try {
    const db = await connectToFirebase();
    const classesCollection = db.collection("classes");
    const querySnapshot: QuerySnapshot = await classesCollection
      .where("students", "array-contains", studentId)
      .get();
    const classes: IClass[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      if (!data) {
        throw new Error("Class data is undefined");
      }
      classes.push({
        id: doc.id,
        name: data.name,
        teacherId: data.teacherId,
        students: data.students || [],
        assignments: data.assignments || [],
        createdAt:
          data.createdAt instanceof Date
            ? data.createdAt
            : new Date(data.createdAt),
      });
    });
    return classes;
  } catch (error) {
    handleError(error);
    throw error;
  }
}
