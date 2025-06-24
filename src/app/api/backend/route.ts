// import { NextRequest, NextResponse } from "next/server";
// import { MongoClient, ObjectId } from "mongodb";
// import { initializeApp, cert, getApps } from "firebase-admin/app";
// import { getFirestore } from "firebase-admin/firestore";
// import { getStorage } from "firebase-admin/storage";
// import * as bcrypt from "bcrypt";
// import { v2 as cloudinary } from "cloudinary";
// import { config as dotenvConfig } from "dotenv";

// // Load environment variables
// dotenvConfig({ path: ".env" });

// // Validate environment variables
// const MONGODB_URL = process.env.MONGODB_URL;
// if (!MONGODB_URL) {
//   throw new Error("MONGODB_URL is not defined in environment variables");
// }

// const FIREBASE_CONFIG = {
//   projectId: process.env.FIREBASE_PROJECT_ID,
//   privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
//   clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
// };
// if (
//   !FIREBASE_CONFIG.projectId ||
//   !FIREBASE_CONFIG.privateKey ||
//   !FIREBASE_CONFIG.clientEmail
// ) {
//   throw new Error("Firebase configuration is incomplete");
// }

// // Initialize Firebase Admin
// if (!getApps().length) {
//   initializeApp({
//     credential: cert(FIREBASE_CONFIG),
//     storageBucket: `${FIREBASE_CONFIG.projectId}.appspot.com`,
//   });
// }
// const firestore = getFirestore();
// const storage = getStorage();

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
//   api_key: process.env.CLOUDINARY_API_KEY || "",
//   api_secret: process.env.CLOUDINARY_API_SECRET || "",
// });

// // Initialize MongoDB client
// let mongoClient: MongoClient | null = null;
// async function getMongoClient(): Promise<MongoClient> {
//   if (!mongoClient) {
//     if (!MONGODB_URL) {
//       throw new Error("MONGODB_URL is not defined");
//     }
//     mongoClient = new MongoClient(MONGODB_URL);
//     await mongoClient.connect();
//     console.log("MongoDB connected");
//   }
//   return mongoClient;
// }

// const SALT_ROUNDS = 10;

// // Define interfaces
// interface User {
//   _id: ObjectId;
//   type: "teacher" | "student";
//   name: string;
//   email?: string;
//   password: string;
//   classIds: string[];
// }

// interface CloudinaryUploadResponse {
//   secure_url: string;
//   [key: string]: any; // Allow additional properties
// }

// interface Class {
//   _id: ObjectId;
//   name?: string;
//   teacherId?: string;
//   studentIds: string[];
// }

// interface Assignment {
//   _id?: ObjectId;
//   classId?: string;
//   title?: string;
//   imageUrl?: string;
//   correctText?: string;
//   dueDate?: Date;
// }

// interface Submission {
//   studentId?: string;
//   assignmentId?: string;
//   typedText?: string;
//   mistakes: number;
//   speed: number;
//   backspaces: number;
//   timestamp: Date;
// }

// interface TypingTest {
//   studentId?: string;
//   paragraphId?: string;
//   speed: number;
//   mistakes: number;
//   backspaces: number;
//   timestamp: Date;
// }

// // Request body type
// interface RequestBody {
//   action: string;
//   email?: string;
//   password?: string;
//   teacherName?: string;
//   studentName?: string;
//   classId?: string;
//   className?: string;
//   teacherId?: string;
//   title?: string;
//   correctText?: string;
//   dueDate?: string;
//   studentId?: string;
//   assignmentId?: string;
//   typedText?: string;
//   speed?: number;
//   backspaces?: number;
//   paragraphId?: string;
//   mistakes?: number;
// }

// export async function POST(request: NextRequest) {
//   const client = await getMongoClient();
//   const db = client.db("stenomaster");

//   try {
//     const contentType = request.headers.get("content-type");
//     let body: RequestBody | undefined;

//     if (contentType?.includes("multipart/form-data")) {
//       const formData = await request.formData();
//       body = Object.fromEntries(formData) as unknown as RequestBody;
//     } else {
//       body = (await request.json()) as RequestBody;
//     }

//     if (!body || typeof body !== "object") {
//       return NextResponse.json(
//         { error: "Invalid request body" },
//         { status: 400 }
//       );
//     }

//     const {
//       action,
//       email,
//       password,
//       teacherName,
//       studentName,
//       classId,
//       className,
//       teacherId,
//       title,
//       correctText,
//       dueDate,
//       studentId,
//       assignmentId,
//       typedText,
//       speed,
//       backspaces,
//       paragraphId,
//       mistakes,
//     } = body;

//     if (!action) {
//       return NextResponse.json({ error: "Missing action" }, { status: 400 });
//     }

//     switch (action) {
//       case "register":
//         if (!email || !password || !teacherName) {
//           return NextResponse.json(
//             { error: "Missing required fields" },
//             { status: 400 }
//           );
//         }

//         const existingUser = await db
//           .collection<User>("users")
//           .findOne({ email });
//         if (existingUser) {
//           return NextResponse.json(
//             { error: "Email already registered" },
//             { status: 400 }
//           );
//         }

//         const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
//         const newTeacher: User = {
//           _id: new ObjectId(),
//           type: "teacher",
//           name: teacherName,
//           email,
//           password: hashedPassword,
//           classIds: [],
//         };
//         await db.collection<User>("users").insertOne(newTeacher);

//         return NextResponse.json(
//           {
//             id: newTeacher._id.toString(),
//             type: "teacher",
//             name: teacherName,
//             email,
//             classIds: [],
//           },
//           { status: 200 }
//         );

//       case "login":
//         if (!email || !password) {
//           return NextResponse.json(
//             { error: "Missing email or password" },
//             { status: 400 }
//           );
//         }

//         const user = await db.collection<User>("users").findOne({ email });
//         if (!user || !(await bcrypt.compare(password, user.password))) {
//           return NextResponse.json(
//             { error: "Invalid credentials" },
//             { status: 401 }
//           );
//         }

//         return NextResponse.json(
//           {
//             id: user._id.toString(),
//             type: user.type,
//             name: user.name,
//             email: user.email,
//             classIds: user.classIds,
//           },
//           { status: 200 }
//         );

//       case "createStudent":
//         if (!studentName || !classId || !teacherId) {
//           return NextResponse.json(
//             { error: "Missing required fields" },
//             { status: 400 }
//           );
//         }

//         const teacher = await db
//           .collection<User>("users")
//           .findOne({ _id: new ObjectId(teacherId), type: "teacher" });
//         if (!teacher) {
//           return NextResponse.json(
//             { error: "Invalid teacher" },
//             { status: 400 }
//           );
//         }

//         const classDoc = await db
//           .collection<Class>("classes")
//           .findOne({ _id: new ObjectId(classId), teacherId });
//         if (!classDoc) {
//           return NextResponse.json({ error: "Invalid class" }, { status: 400 });
//         }

//         const newStudentId = new ObjectId();
//         const studentPassword = Math.random().toString(36).slice(-8);
//         const hashedStudentPassword = await bcrypt.hash(
//           studentPassword,
//           SALT_ROUNDS
//         );
//         const newStudent: User = {
//           _id: newStudentId,
//           type: "student",
//           name: studentName,
//           classIds: [classId],
//           password: hashedStudentPassword,
//         };
//         await db.collection<User>("users").insertOne(newStudent);
//         await db
//           .collection<Class>("classes")
//           .updateOne(
//             { _id: new ObjectId(classId) },
//             { $push: { studentIds: newStudentId.toString() } }
//           );

//         return NextResponse.json(
//           {
//             id: newStudentId.toString(),
//             name: studentName,
//             password: studentPassword,
//             type: "student",
//             classIds: [classId],
//           },
//           { status: 200 }
//         );

//       case "createClass":
//         if (!className || !teacherId) {
//           return NextResponse.json(
//             { error: "Missing required fields" },
//             { status: 400 }
//           );
//         }

//         const teacherExists = await db
//           .collection<User>("users")
//           .findOne({ _id: new ObjectId(teacherId), type: "teacher" });
//         if (!teacherExists) {
//           return NextResponse.json(
//             { error: "Invalid teacher" },
//             { status: 400 }
//           );
//         }

//         const newClassId = new ObjectId();
//         const newClass: Class = {
//           _id: newClassId,
//           name: className,
//           teacherId,
//           studentIds: [],
//         };
//         await db.collection<Class>("classes").insertOne(newClass);
//         await db
//           .collection<User>("users")
//           .updateOne(
//             { _id: new ObjectId(teacherId) },
//             { $push: { classIds: newClassId.toString() } }
//           );

//         return NextResponse.json(
//           {
//             id: newClassId.toString(),
//             name: className,
//             teacherId,
//             studentIds: [],
//           },
//           { status: 200 }
//         );

//       case "createAssignment":
//         if (!classId || !title || !correctText || !dueDate) {
//           return NextResponse.json(
//             { error: "Missing required fields" },
//             { status: 400 }
//           );
//         }

//         const classExists = await db
//           .collection<Class>("classes")
//           .findOne({ _id: new ObjectId(classId) });
//         if (!classExists) {
//           return NextResponse.json(
//             { error: "Class not found" },
//             { status: 400 }
//           );
//         }

//         let imageUrl = "";
//         if (contentType?.includes("multipart/form-data")) {
//           const formData = await request.formData();
//           const imageFile = formData.get("image");
//           if (imageFile instanceof File) {
//             const buffer = Buffer.from(await imageFile.arrayBuffer());
//             const uploadResult = await new Promise<CloudinaryUploadResponse>(
//               (resolve, reject) => {
//                 cloudinary.uploader
//                   .upload_stream(
//                     { resource_type: "image" },
//                     (error, result) => {
//                       if (error || !result) {
//                         reject(error || new Error("Upload failed"));
//                       } else {
//                         resolve(result);
//                       }
//                     }
//                   )
//                   .end(buffer);
//               }
//             );
//             imageUrl = uploadResult.secure_url;
//           }
//         }

//         const newAssignmentId = new ObjectId();
//         const newAssignment: Assignment = {
//           _id: newAssignmentId,
//           classId,
//           title,
//           imageUrl,
//           correctText,
//           dueDate: new Date(dueDate),
//         };
//         await db.collection<Assignment>("assignments").insertOne(newAssignment);

//         return NextResponse.json(
//           {
//             id: newAssignmentId.toString(),
//             classId,
//             title,
//             imageUrl,
//             correctText,
//             dueDate: newAssignment.dueDate,
//           },
//           { status: 200 }
//         );

//       case "submitAssignment":
//         if (
//           !studentId ||
//           !assignmentId ||
//           !typedText ||
//           speed === undefined ||
//           backspaces === undefined ||
//           mistakes === undefined
//         ) {
//           return NextResponse.json(
//             { error: "Missing required fields" },
//             { status: 400 }
//           );
//         }

//         const assignment = await db
//           .collection<Assignment>("assignments")
//           .findOne({ _id: new ObjectId(assignmentId) });
//         if (!assignment) {
//           return NextResponse.json(
//             { error: "Assignment not found" },
//             { status: 404 }
//           );
//         }

//         const submissionData: Submission = {
//           studentId,
//           assignmentId,
//           typedText,
//           mistakes,
//           speed,
//           backspaces,
//           timestamp: new Date(),
//         };
//         await firestore.collection("submissions").add(submissionData);

//         return NextResponse.json(submissionData, { status: 200 });

//       case "saveTypingTest":
//         if (
//           !studentId ||
//           !paragraphId ||
//           speed === undefined ||
//           mistakes === undefined ||
//           backspaces === undefined
//         ) {
//           return NextResponse.json(
//             { error: "Missing required fields" },
//             { status: 400 }
//           );
//         }

//         const typingTestData: TypingTest = {
//           studentId,
//           paragraphId,
//           speed,
//           mistakes,
//           backspaces,
//           timestamp: new Date(),
//         };
//         await firestore.collection("typing_tests").add(typingTestData);

//         return NextResponse.json(typingTestData, { status: 200 });

//       default:
//         return NextResponse.json({ error: "Invalid action" }, { status: 400 });
//     }
//   } catch (error) {
//     console.error("API Error:", error instanceof Error ? error.message : error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(request: NextRequest) {
//   const client = await getMongoClient();
//   const db = client.db("stenomaster");

//   try {
//     const { searchParams } = new URL(request.url);
//     const action = searchParams.get("action");
//     const teacherId = searchParams.get("teacherId");
//     const classId = searchParams.get("classId");
//     const assignmentId = searchParams.get("assignmentId");
//     const studentId = searchParams.get("studentId");

//     if (!action) {
//       return NextResponse.json({ error: "Missing action" }, { status: 400 });
//     }

//     switch (action) {
//       case "getClasses":
//         if (!teacherId) {
//           return NextResponse.json(
//             { error: "Missing teacherId" },
//             { status: 400 }
//           );
//         }
//         const classes = await db
//           .collection<Class>("classes")
//           .find({ teacherId })
//           .toArray();
//         return NextResponse.json(
//           classes.map((c) => ({
//             id: c._id.toString(),
//             name: c.name,
//             teacherId: c.teacherId,
//             studentIds: c.studentIds,
//           })),
//           { status: 200 }
//         );

//       case "getAssignments":
//         if (!classId) {
//           return NextResponse.json(
//             { error: "Missing classId" },
//             { status: 400 }
//           );
//         }
//         const assignments = await db
//           .collection<Assignment>("assignments")
//           .find({ classId })
//           .toArray();
//         return NextResponse.json(
//           assignments.map((a) => ({
//             id: a._id.toString(),
//             classId: a.classId,
//             title: a.title,
//             imageUrl: a.imageUrl,
//             correctText: a.correctText,
//             dueDate: a.dueDate,
//           })),
//           { status: 200 }
//         );

//       case "getSubmissions":
//         if (!assignmentId) {
//           return NextResponse.json(
//             { error: "Missing assignmentId" },
//             { status: 400 }
//           );
//         }
//         const submissionsSnapshot = await firestore
//           .collection("submissions")
//           .where("assignmentId", "==", assignmentId)
//           .get();
//         const submissions = submissionsSnapshot.docs.map((doc) =>
//           doc.data()
//         ) as Submission[];
//         return NextResponse.json(submissions, { status: 200 });

//       case "getTypingTests":
//         if (!studentId) {
//           return NextResponse.json(
//             { error: "Missing studentId" },
//             { status: 400 }
//           );
//         }
//         const typingTestsSnapshot = await firestore
//           .collection("typing_tests")
//           .where("studentId", "==", studentId)
//           .get();
//         const typingTests = typingTestsSnapshot.docs.map((doc) =>
//           doc.data()
//         ) as TypingTest[];
//         return NextResponse.json(typingTests, { status: 200 });

//       default:
//         return NextResponse.json({ error: "Invalid action" }, { status: 400 });
//     }
//   } catch (error) {
//     console.error("API Error:", error instanceof Error ? error.message : error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
