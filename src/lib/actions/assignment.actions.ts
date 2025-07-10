"use server";

import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import { validateSessionToken } from "./user.action";
import {
  createAssignmentDoc,
  getAssignmentDocById,
  getAssignmentsByClass,
  getAssignmentsByTeacher,
  updateAssignmentDoc,
  deleteAssignmentDoc,
  IAssignment,
} from "../database/models/assignment.model";
import {
  getClassDocById,
  updateClassDoc,
} from "../database/models/class.model";
import { Assignment } from "@/types";

export async function createAssignment(assignmentData: {
  title: string;
  deadline: string;
  imageUrl: string;
  correctText: string;
  classId: string;
  token: string;
}) {
  try {
    await connectToDatabase();
    const user = await validateSessionToken(assignmentData.token);
    if (user.userType !== "teacher") {
      throw new Error("Only teachers can create assignments");
    }
    const classData = await getClassDocById(assignmentData.classId);
    if (!classData || classData.teacherId !== user.userId) {
      throw new Error("Class not found or unauthorized");
    }
    const assignmentId = `assignment-${Date.now()}`;
    const newAssignment = await createAssignmentDoc({
      id: assignmentId,
      title: assignmentData.title,
      deadline: assignmentData.deadline,
      imageUrl: assignmentData.imageUrl,
      correctText: assignmentData.correctText,
      classId: assignmentData.classId,
      teacherId: user.userId,
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    await updateClassDoc(assignmentData.classId, {
      assignments: [...(classData.assignments || []), assignmentId],
    });

    return newAssignment;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getAssignments(token: string, classId?: string) {
  try {
    await connectToDatabase();
    const user = await validateSessionToken(token);
    if (user.userType === "teacher") {
      if (classId) {
        const classData = await getClassDocById(classId);
        if (!classData || classData.teacherId !== user.userId) {
          throw new Error("Class not found or unauthorized");
        }
        return await getAssignmentsByClass(classId);
      }
      return await getAssignmentsByTeacher(user.userId);
    } else if (user.userType === "student") {
      if (!classId) {
        throw new Error("classId is required for students");
      }
      const classData = await getClassDocById(classId);
      if (!classData || !classData.students.includes(user.userId)) {
        throw new Error("Student not enrolled in this class");
      }
      const assignments = await getAssignmentsByClass(classId);
      return assignments
    }
    throw new Error("Invalid user type");
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function updateAssignment(
  assignmentId: string,
  updates: {
    title?: string;
    deadline?: string;
    imageUrl?: string;
    correctText?: string;
    classId?: string;
  },
  token: string
) {
  try {
    await connectToDatabase();
    const user = await validateSessionToken(token);
    if (user.userType !== "teacher") {
      throw new Error("Only teachers can update assignments");
    }
    const assignment = await getAssignmentDocById(assignmentId);
    if (!assignment || assignment.teacherId !== user.userId) {
      throw new Error("Assignment not found or unauthorized");
    }
    if (updates.classId) {
      const classData = await getClassDocById(updates.classId);
      if (!classData || classData.teacherId !== user.userId) {
        throw new Error("Target class not found or unauthorized");
      }
    }
    const updatedAssignment = await updateAssignmentDoc(assignmentId, updates);
    return updatedAssignment;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function toggleAssignmentStatus(
  assignmentId: string,
  token: string
) {
  try {
    await connectToDatabase();
    const user = await validateSessionToken(token);
    if (user.userType !== "teacher") {
      throw new Error("Only teachers can toggle assignment status");
    }
    const assignment = await getAssignmentDocById(assignmentId);
    if (!assignment || assignment.teacherId !== user.userId) {
      throw new Error("Assignment not found or unauthorized");
    }
    const updatedAssignment = await updateAssignmentDoc(assignmentId, {
      isActive: !assignment.isActive,
    });
    return updatedAssignment;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function deleteAssignment(assignmentId: string, token: string) {
  try {
    await connectToDatabase();
    const user = await validateSessionToken(token);
    if (user.userType !== "teacher") {
      throw new Error("Only teachers can delete assignments");
    }
    const assignment = await getAssignmentDocById(assignmentId);
    if (!assignment || assignment.teacherId !== user.userId) {
      throw new Error("Assignment not found or unauthorized");
    }
    const classData = await getClassDocById(assignment.classId);
    if (classData) {
      await updateClassDoc(assignment.classId, {
        assignments: classData.assignments.filter(
          (id: string) => id !== assignmentId
        ),
      });
    }
    await deleteAssignmentDoc(assignmentId);
    return { success: true };
  } catch (error) {
    handleError(error);
    throw error;
  }
}
