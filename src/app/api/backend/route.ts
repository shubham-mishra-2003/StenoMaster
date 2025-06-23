import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import cloudinary from 'cloudinary';
import { clerkClient } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Environment Variables
const MONGODB_URI = process.env.MONGODB_URI!;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID!;
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n');
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL!;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;

// Initialize Firebase
let firebaseApp: App | null = null;
function getFirebaseApp(): App {
  if (!firebaseApp && !getApps().length) {
    firebaseApp = initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        privateKey: FIREBASE_PRIVATE_KEY,
        clientEmail: FIREBASE_CLIENT_EMAIL,
      }),
    });
  }
  return firebaseApp!;
}
const firestore = getFirestore(getFirebaseApp());

// Initialize Cloudinary
cloudinary.v2.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// MongoDB Singleton
let mongoClient: MongoClient | null = null;
function getMongoClient(): MongoClient {
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGODB_URI);
    mongoClient.connect().catch(error => {
      console.error('MongoDB connection error:', error);
      throw error;
    });
  }
  return mongoClient;
}

// Error Class
class AppError extends Error {
  constructor(public message: string, public status: number) {
    super(message);
    this.name = 'AppError';
  }
}

// Interfaces
interface User {
  id: string;
  type: 'teacher' | 'student';
  name: string;
  email?: string;
  classIds?: string[];
}

interface Class {
  id: string;
  name: string;
  teacherId: string;
  studentIds: string[];
}

interface Assignment {
  id: string;
  classId: string;
  title: string;
  imageUrl?: string;
  correctText: string;
  dueDate: Date;
}

interface Submission {
  studentId: string;
  assignmentId: string;
  typedText: string;
  mistakes: number;
  speed: number;
  backspaces: number;
  timestamp: Date;
}

interface TypingTest {
  studentId: string;
  paragraphId: string;
  speed: number;
  mistakes: number;
  backspaces: number;
  timestamp: Date;
}

// Validation Schemas
const schemas = {
  register: z.object({
    action: z.literal('register'),
    email: z.string().email(),
    password: z.string().min(6),
    teacherName: z.string().min(2),
  }),
  login: z.object({
    action: z.literal('login'),
    email: z.string().email(),
    password: z.string().min(6),
  }),
  createStudent: z.object({
    action: z.literal('createStudent'),
    studentName: z.string().min(2),
    classId: z.string(),
    teacherId: z.string(),
  }),
  createClass: z.object({
    action: z.literal('createClass'),
    className: z.string().min(2),
    teacherId: z.string(),
  }),
  getClasses: z.object({
    action: z.literal('getClasses'),
    teacherId: z.string(),
  }),
  createAssignment: z.object({
    action: z.literal('createAssignment'),
    classId: z.string(),
    title: z.string().min(2),
    correctText: z.string(),
    dueDate: z.string().optional(),
  }),
  getAssignments: z.object({
    action: z.literal('getAssignments'),
    classId: z.string(),
  }),
  submitAssignment: z.object({
    action: z.literal('submitAssignment'),
    studentId: z.string(),
    assignmentId: z.string(),
    typedText: z.string(),
    speed: z.number(),
    backspaces: z.number(),
  }),
  getSubmissions: z.object({
    action: z.literal('getSubmissions'),
    assignmentId: z.string(),
  }),
  saveTypingTest: z.object({
    action: z.literal('saveTypingTest'),
    studentId: z.string(),
    paragraphId: z.string(),
    speed: z.number(),
    mistakes: z.number(),
    backspaces: z.number(),
  }),
  getTypingTests: z.object({
    action: z.literal('getTypingTests'),
    studentId: z.string(),
  }),
};

// Auth Provider
class AuthProvider {
  private mongoClient: MongoClient;

  constructor() {
    this.mongoClient = getMongoClient();
  }

  async createTeacher(email: string, password: string, name: string): Promise<User> {
    try {
      const clerk = await clerkClient();
      const user = await clerk.users.createUser({
        emailAddress: [email],
        password,
        firstName: name,
      });
      const db = this.mongoClient.db('stenomaster');
      await db.collection('users').insertOne({
        clerkId: user.id,
        type: 'teacher',
        name,
        email,
        classIds: [],
      });
      return { id: user.id, type: 'teacher', name, email };
    } catch {
      throw new AppError('Failed to create teacher', 400);
    }
  }

  async createStudent(studentName: string, classId: string, teacherId: string): Promise<User & { password: string }> {
    try {
      const userId = uuidv4();
      const password = uuidv4().slice(0, 8);
      const db = this.mongoClient.db('stenomaster');
      await db.collection('users').insertOne({
        clerkId: userId,
        type: 'student',
        name: studentName,
        classIds: [classId],
        password, // Note: Hash in production
      });
      await db.collection('classes').updateOne(
        { _id: new ObjectId(classId), teacherId },
        { $addToSet: { studentIds: userId } }
      );
      return { id: userId, name: studentName, password, type: 'student', classIds: [classId] };
    } catch {
      throw new AppError('Failed to create student', 400);
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const clerk = await clerkClient();
      const userList = await clerk.users.getUserList({ emailAddress: [email] });
      if (!userList.data.length) throw new AppError('User not found', 401);
      const db = this.mongoClient.db('stenomaster');
      const dbUser = await db.collection('users').findOne({ clerkId: userList.data[0].id });
      if (!dbUser || dbUser.type !== 'teacher') throw new AppError('Invalid user type', 401);
      return { id: userList.data[0].id, type: 'teacher', name: dbUser.name, email, classIds: dbUser.classIds };
    } catch (error) {
      if (error instanceof AppError) throw error;
      const db = this.mongoClient.db('stenomaster');
      const student = await db.collection('users').findOne({ email, password, type: 'student' });
      if (!student) throw new AppError('Invalid credentials', 401);
      return { id: student.clerkId, type: 'student', name: student.name, classIds: student.classIds };
    }
  }

  async getUser(userId: string): Promise<User> {
    try {
      const db = this.mongoClient.db('stenomaster');
      const user = await db.collection('users').findOne({ clerkId: userId });
      if (!user) throw new AppError('User not found', 404);
      return { id: user.clerkId, type: user.type, name: user.name, email: user.email, classIds: user.classIds };
    } catch {
      throw new AppError('Failed to fetch user', 500);
    }
  }
}

// Storage Provider
class StorageProvider {
  async uploadImage(file: Buffer): Promise<string> {
    try {
      return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        }).end(file);
      });
    } catch {
      throw new AppError('Failed to upload image', 500);
    }
  }
}

// Database Provider
class DatabaseProvider {
  private mongoClient: MongoClient;
  private firestore: ReturnType<typeof getFirestore>;

  constructor() {
    this.mongoClient = getMongoClient();
    this.firestore = firestore;
  }

  async createClass(className: string, teacherId: string): Promise<Class> {
    try {
      const db = this.mongoClient.db('stenomaster');
      const result = await db.collection('classes').insertOne({
        name: className,
        teacherId,
        studentIds: [],
      });
      await db.collection('users').updateOne(
        { clerkId: teacherId },
        { $addToSet: { classIds: result.insertedId.toString() } }
      );
      return { id: result.insertedId.toString(), name: className, teacherId, studentIds: [] };
    } catch {
      throw new AppError('Failed to create class', 500);
    }
  }

  async getClasses(teacherId: string): Promise<Class[]> {
    try {
      const db = this.mongoClient.db('stenomaster');
      const classes = await db.collection('classes').find({ teacherId }).toArray();
      return classes.map(c => ({
        id: c._id.toString(),
        name: c.name,
        teacherId: c.teacherId,
        studentIds: c.studentIds,
      }));
    } catch {
      throw new AppError('Failed to fetch classes', 500);
    }
  }

  async createAssignment(
    classId: string,
    title: string,
    correctText: string,
    imageFile?: Buffer,
    dueDate?: string
  ): Promise<Assignment> {
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const storageProvider = new StorageProvider();
        imageUrl = await storageProvider.uploadImage(imageFile);
      }
      const db = this.mongoClient.db('stenomaster');
      const result = await db.collection('assignments').insertOne({
        classId,
        title,
        imageUrl,
        correctText,
        dueDate: dueDate ? new Date(dueDate) : new Date(),
      });
      return {
        id: result.insertedId.toString(),
        classId,
        title,
        imageUrl,
        correctText,
        dueDate: dueDate ? new Date(dueDate) : new Date(),
      };
    } catch {
      throw new AppError('Failed to create assignment', 500);
    }
  }

  async getAssignments(classId: string): Promise<Assignment[]> {
    try {
      const db = this.mongoClient.db('stenomaster');
      const assignments = await db.collection('assignments').find({ classId }).toArray();
      return assignments.map(a => ({
        id: a._id.toString(),
        classId: a.classId,
        title: a.title,
        imageUrl: a.imageUrl,
        correctText: a.correctText,
        dueDate: a.dueDate,
      }));
    } catch {
      throw new AppError('Failed to fetch assignments', 500);
    }
  }

  async submitAssignment(
    studentId: string,
    assignmentId: string,
    typedText: string,
    speed: number,
    backspaces: number
  ): Promise<Submission> {
    try {
      const db = this.mongoClient.db('stenomaster');
      const assignment = await db.collection('assignments').findOne({ _id: new ObjectId(assignmentId) });
      if (!assignment) throw new AppError('Assignment not found', 404);
      const mistakes = this.calculateMistakes(typedText, assignment.correctText);
      const submission: Submission = {
        studentId,
        assignmentId,
        typedText,
        mistakes,
        speed,
        backspaces,
        timestamp: new Date(),
      };
      await this.firestore.collection('submissions').add(submission);
      return submission;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to submit assignment', 500);
    }
  }

  async getSubmissions(assignmentId: string): Promise<Submission[]> {
    try {
      const snapshot = await this.firestore.collection('submissions').where('assignmentId', '==', assignmentId).get();
      return snapshot.docs.map(doc => doc.data() as Submission);
    } catch {
      throw new AppError('Failed to fetch submissions', 500);
    }
  }

  async saveTypingTest(
    studentId: string,
    paragraphId: string,
    speed: number,
    mistakes: number,
    backspaces: number
  ): Promise<TypingTest> {
    try {
      const test: TypingTest = {
        studentId,
        paragraphId,
        speed,
        mistakes,
        backspaces,
        timestamp: new Date(),
      };
      await this.firestore.collection('typing_tests').add(test);
      return test;
    } catch {
      throw new AppError('Failed to save typing test', 500);
    }
  }

  async getTypingTests(studentId: string): Promise<TypingTest[]> {
    try {
      const snapshot = await this.firestore.collection('typing_tests').where('studentId', '==', studentId).get();
      return snapshot.docs.map(doc => doc.data() as TypingTest);
    } catch {
      throw new AppError('Failed to fetch typing tests', 500);
    }
  }

  private calculateMistakes(typedText: string, correctText: string): number {
    let mistakes = 0;
    const typedChars = typedText.split('');
    const correctChars = correctText.split('');
    for (let i = 0; i < Math.min(typedChars.length, correctChars.length); i++) {
      if (typedChars[i] !== correctChars[i]) mistakes++;
    }
    mistakes += Math.abs(typedChars.length - correctChars.length);
    return mistakes;
  }
}

// API Config
export const config = {
  api: {
    bodyParser: false,
  },
};

// API Handlers
export async function POST(req: Request) {
  const authProvider = new AuthProvider();
  const dbProvider = new DatabaseProvider();

  try {
    const contentType = req.headers.get('content-type');
    let body: any;

    if (contentType?.includes('multipart/form-data')) {
      const formData = await req.formData();
      const action = formData.get('action')?.toString();
      const classId = formData.get('classId')?.toString();
      const title = formData.get('title')?.toString();
      const correctText = formData.get('correctText')?.toString();
      const dueDate = formData.get('dueDate')?.toString();
      const imageFile = formData.get('image');
      let imageBuffer: Buffer | undefined;
      if (imageFile instanceof File) {
        const arrayBuffer = await imageFile.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      }
      body = { action, classId, title, correctText, dueDate, imageFile: imageBuffer };
    } else {
      body = await req.json();
    }

    switch (body.action) {
      case 'register':
        const registerData = schemas.register.parse(body);
        const teacher = await authProvider.createTeacher(
          registerData.email,
          registerData.password,
          registerData.teacherName
        );
        return NextResponse.json(teacher, {
          headers: {
            'set-cookie': `StenoMaster-user=${JSON.stringify(teacher)};path=/;HttpOnly;Secure;SameSite=Strict;Max-Age=86400`,
          },
        });

      case 'login':
        const loginData = schemas.login.parse(body);
        const user = await authProvider.login(loginData.email, loginData.password);
        return NextResponse.json(user, {
          headers: {
            'set-cookie': `StenoMaster-user=${JSON.stringify(user)};path=/;HttpOnly;Secure;SameSite=Strict;Max-Age=86400`,
          },
        });

      case 'createStudent':
        const studentData = schemas.createStudent.parse(body);
        const student = await authProvider.createStudent(
          studentData.studentName,
          studentData.classId,
          studentData.teacherId
        );
        return NextResponse.json(student);

      case 'createClass':
        const classData = schemas.createClass.parse(body);
        const classResult = await dbProvider.createClass(classData.className, classData.teacherId);
        return NextResponse.json(classResult);

      case 'createAssignment':
        const assignmentData = schemas.createAssignment.parse(body);
        const assignment = await dbProvider.createAssignment(
          assignmentData.classId,
          assignmentData.title,
          assignmentData.correctText,
          body.imageFile,
          assignmentData.dueDate
        );
        return NextResponse.json(assignment);

      case 'submitAssignment':
        const submissionData = schemas.submitAssignment.parse(body);
        const submission = await dbProvider.submitAssignment(
          submissionData.studentId,
          submissionData.assignmentId,
          submissionData.typedText,
          submissionData.speed,
          submissionData.backspaces
        );
        return NextResponse.json(submission);

      case 'saveTypingTest':
        const testData = schemas.saveTypingTest.parse(body);
        const test = await dbProvider.saveTypingTest(
          testData.studentId,
          testData.paragraphId,
          testData.speed,
          testData.mistakes,
          testData.backspaces
        );
        return NextResponse.json(test);

      default:
        throw new AppError('Invalid action', 400);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const dbProvider = new DatabaseProvider();

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const body = Object.fromEntries(searchParams);

    switch (action) {
      case 'getClasses':
        const classesData = schemas.getClasses.parse({ action, ...body });
        const classes = await dbProvider.getClasses(classesData.teacherId);
        return NextResponse.json(classes);

      case 'getAssignments':
        const assignmentsData = schemas.getAssignments.parse({ action, ...body });
        const assignments = await dbProvider.getAssignments(assignmentsData.classId);
        return NextResponse.json(assignments);

      case 'getSubmissions':
        const submissionsData = schemas.getSubmissions.parse({ action, ...body });
        const submissions = await dbProvider.getSubmissions(submissionsData.assignmentId);
        return NextResponse.json(submissions);

      case 'getTypingTests':
        const testsData = schemas.getTypingTests.parse({ action, ...body });
        const tests = await dbProvider.getTypingTests(testsData.studentId);
        return NextResponse.json(tests);

      default:
        throw new AppError('Invalid action', 400);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}