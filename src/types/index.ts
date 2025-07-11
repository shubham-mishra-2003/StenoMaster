// export interface User {
//   id: string;
//   name: string;
//   email?: string;
//   type: "teacher" | "student";
//   classId?: string;
// }

// export interface Class {
//   id: string;
//   name: string;
//   teacherId: string;
//   students: Student[];
//   assignments: Assignment[];
//   createdAt: Date;
// }

// export interface Student {
//   id: string; // Maximum 20 characters
//   name: string;
//   password: string;
//   classId: string;
//   scores: Score[];
//   createdAt: Date;
// }

export interface Assignment {
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

export interface Score {
  id: string;
  studentId: string;
  assignmentId: string;
  typedText: string;
  accuracy: number;
  wpm: number;
  timeElapsed: number;
  completedAt: Date;
}

export interface StudentAssignment {
  id: string;
  assignmentId: string;
  studentId: string;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}


export interface Class {
  id: string;
  name: string;
  teacherId: string;
  students: string[];
  assignments: any[];
  createdAt: string | Date;
}

export interface Student {
  id: string;
  name: string;
  password: string;
  classId: string;
  scores: any[];
}

export interface User {
  _id: string;
  userId: string;
  email: string;
  fullName?: string;
  userType: "student" | "teacher";
  photo?: string;
}

export const STUDENT_ID_MAX_LENGTH = 20;
export const STUDENT_ID_MIN_LENGTH = 3;