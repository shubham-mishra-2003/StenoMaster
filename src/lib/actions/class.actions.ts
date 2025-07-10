"use server";

import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import { validateSessionToken } from "./user.action";
import User from "../database/models/user.model";
import {
  createClassDoc,
  getClassDocById,
  getClassesByTeacher,
  getClassesByStudent,
  deleteClassDoc,
  assignStudentToClassDoc,
  removeStudentFromClassDoc,
  IClass,
} from "../database/models/class.model";

export async function createClass(classData: { name: string; token: string }) {
  try {
    await connectToDatabase();
    const user = await validateSessionToken(classData.token);
    if (user.userType !== "teacher") {
      throw new Error("Only teachers can create classes");
    }
    const classId = `class-${Date.now()}`;
    const newClass = await createClassDoc({
      id: classId,
      name: classData.name,
      teacherId: user.userId,
    });
    return newClass;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getClasses(token: string) {
  try {
    await connectToDatabase();
    const user = await validateSessionToken(token);
    if (user.userType !== "teacher") {
      throw new Error("Only teachers can view classes");
    }
    const classes = await getClassesByTeacher(user.userId);
    return classes;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getStudentClasses(token: string) {
  try {
    await connectToDatabase();
    const user = await validateSessionToken(token);
    if (user.userType !== "student") {
      throw new Error("Only students can view their enrolled classes");
    }
    const classes = await getClassesByStudent(user.userId);
    return classes;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function deleteClass(classId: string, token: string) {
  try {
    await connectToDatabase();
    const user = await validateSessionToken(token);
    if (user.userType !== "teacher") {
      throw new Error("Only teachers can delete classes");
    }
    const classData = await getClassDocById(classId);
    if (!classData || classData.teacherId !== user.userId) {
      throw new Error("Class not found or unauthorized");
    }
    await deleteClassDoc(classId);
    return { success: true };
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function assignStudentToClass(
  classId: string,
  studentId: string,
  token: string
) {
  try {
    await connectToDatabase();
    const user = await validateSessionToken(token);
    if (user.userType !== "teacher") {
      throw new Error("Only teachers can assign students");
    }
    const classData = await getClassDocById(classId);
    if (!classData || classData.teacherId !== user.userId) {
      throw new Error("Class not found or unauthorized");
    }
    const student = await User.findOne({
      userId: studentId,
      userType: "student",
    });
    if (!student) {
      throw new Error("Student not found");
    }
    await assignStudentToClassDoc(classId, studentId);
    return { success: true };
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function removeStudentFromClass(
  classId: string,
  studentId: string,
  token: string
) {
  try {
    await connectToDatabase();
    const user = await validateSessionToken(token);
    if (user.userType !== "teacher") {
      throw new Error("Only teachers can remove students");
    }
    const classData = await getClassDocById(classId);
    if (!classData || classData.teacherId !== user.userId) {
      throw new Error("Class not found or unauthorized");
    }
    const student = await User.findOne({
      userId: studentId,
      userType: "student",
    });
    if (!student) {
      throw new Error("Student not found");
    }
    await removeStudentFromClassDoc(classId, studentId);
    return { success: true };
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getStudentsInClass(classId: string, token: string) {
  try {
    await connectToDatabase();
    const user = await validateSessionToken(token);
    if (user.userType !== "teacher") {
      throw new Error("Only teachers can view students in a class");
    }
    const classData = await getClassDocById(classId);
    if (!classData || classData.teacherId !== user.userId) {
      throw new Error("Class not found or unauthorized");
    }
    const students = await User.find({
      userId: { $in: classData.students },
      userType: "student",
    }).lean();
    return students.map((student) => ({
      _id: student._id,
      userId: student.userId,
      email: student.email,
      fullName: student.fullName,
      userType: student.userType,
      photo: student.photo,
      createdAt: student.createdAt,
    }));
  } catch (error) {
    handleError(error);
    throw error;
  }
}
