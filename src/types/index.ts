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
  description: string;
  imageUrl: string;
  correctText: string;
  classId: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Score {
  id: string;
  studentId: string;
  assignmentId: string;
  typedText: string;
  accuracy: number;
  wpm: number;
  completedAt: string | Date;
  timeElapsed?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

// Student ID validation constants
export const STUDENT_ID_MAX_LENGTH = 20;
export const STUDENT_ID_MIN_LENGTH = 3;


export interface Class {
  id: string;
  name: string;
  teacherId: string;
  students: string[]; // Array of userId strings from Firestore
  assignments: any[];
  createdAt: string | Date;
}

export interface Student {
  id: string; // userId from MongoDB
  name: string; // fullName from MongoDB
  password: string;
  classId: string;
  scores: any[];
  createdAt: Date;
}

export interface User {
  _id: string;
  userId: string; // Matches id in Student and Class.students
  email: string;
  fullName?: string;
  userType: "student" | "teacher";
  photo?: string;
}