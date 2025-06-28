import { connectToFirebase } from "../firebase";
import { QueryDocumentSnapshot, QuerySnapshot } from "firebase-admin/firestore";

export interface IClass {
  id: string;
  name: string;
  teacherId: string;
  students: string[];
  assignments: any[];
  createdAt: Date;
}

export async function createClassDoc(classData: {
  id: string;
  name: string;
  teacherId: string;
}) {
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
}

export async function getClassDocById(classId: string): Promise<IClass | null> {
  const db = await connectToFirebase();
  const classRef = db.collection("classes").doc(classId);
  const docSnap = await classRef.get();
  if (!docSnap.exists) {
    return null;
  }
  const data = docSnap.data();
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
}

export async function getClassesByTeacher(
  teacherId: string
): Promise<IClass[]> {
  const db = await connectToFirebase();
  const classesCollection = db.collection("classes");
  const querySnapshot: QuerySnapshot = await classesCollection
    .where("teacherId", "==", teacherId)
    .get();
  const classes: IClass[] = [];
  querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
    const data = doc.data();
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
}

export async function deleteClassDoc(classId: string) {
  const db = await connectToFirebase();
  const classRef = db.collection("classes").doc(classId);
  await classRef.delete();
}

export async function assignStudentToClassDoc(
  classId: string,
  studentId: string
) {
  const db = await connectToFirebase();
  const classRef = db.collection("classes").doc(classId);
  const docSnap = await classRef.get();
  if (!docSnap.exists) {
    throw new Error("Class not found");
  }
  const classData = docSnap.data();
  if (!classData.students.includes(studentId)) {
    await classRef.update({
      students: [...classData.students, studentId],
    });
  }
}

export async function removeStudentFromClassDoc(
  classId: string,
  studentId: string
) {
  const db = await connectToFirebase();
  const classRef = db.collection("classes").doc(classId);
  const docSnap = await classRef.get();
  if (!docSnap.exists) {
    throw new Error("Class not found");
  }
  const classData = docSnap.data();
  await classRef.update({
    students: classData.students.filter((id: string) => id !== studentId),
  });
}
