
export interface User {
  id: string;
  name: string;
  email?: string;
  type: "teacher" | "student";
  classId?: string;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  students: Student[];
  assignments: Assignment[];
  createdAt: Date;
}

export interface Student {
  id: string;
  name: string;
  password: string;
  classId: string;
  scores: Score[];
  createdAt: Date;
}

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
  completedAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}
