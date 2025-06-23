import { MongoClient, ObjectId } from 'mongodb';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const MONGODB_URI = process.env.MONGODB_URI!;
const FIREBASE_CONFIG = JSON.parse(process.env.FIREBASE_CONFIG!);

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

let firebaseApp: App | null = null;
function getFirebaseApp(): App {
  if (!firebaseApp && !getApps().length) {
    firebaseApp = initializeApp({
      credential: cert(FIREBASE_CONFIG),
    });
  }
  return firebaseApp!;
}

async function seedData() {
  const mongoClient = getMongoClient();
  const firestore = getFirestore(getFirebaseApp());
  const db = mongoClient.db('stenomaster');

  try {
    // Clear existing data
    await db.collection('users').deleteMany({});
    await db.collection('classes').deleteMany({});
    await db.collection('assignments').deleteMany({});
    await firestore.collection('submissions').get().then(snapshot => {
      snapshot.forEach(doc => doc.ref.delete());
    });
    await firestore.collection('typing_tests').get().then(snapshot => {
      snapshot.forEach(doc => doc.ref.delete());
    });

    // Mock Teachers
    const teacher1 = {
      clerkId: 'teacher_1',
      type: 'teacher',
      name: 'John Doe',
      email: 'john.doe@example.com',
      classIds: [],
    };
    await db.collection('users').insertOne(teacher1);

    // Mock Classes
    const class1 = {
      _id: new ObjectId(),
      name: 'Stenography 101',
      teacherId: teacher1.clerkId,
      studentIds: [],
    };
    await db.collection('classes').insertOne(class1);
    await db.collection('users').updateOne(
      { clerkId: teacher1.clerkId },
      { $set: { classIds: [class1._id.toString()] } }
    );

    // Mock Students
    const student1 = {
      clerkId: 'student_1',
      type: 'student',
      name: 'Alice Smith',
      classIds: [class1._id.toString()],
      password: 'student123', // Note: Hash in production
    };
    const student2 = {
      clerkId: 'student_2',
      type: 'student',
      name: 'Bob Johnson',
      classIds: [class1._id.toString()],
      password: 'student456',
    };
    await db.collection('users').insertMany([student1, student2]);
    await db.collection('classes').updateOne(
      { _id: class1._id },
      { $set: { studentIds: [student1.clerkId, student2.clerkId] } }
    );

    // Mock Assignments
    const assignment1 = {
      _id: new ObjectId(),
      classId: class1._id.toString(),
      title: 'Practice Shorthand 1',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      correctText: 'The quick brown fox jumps over the lazy dog.',
      dueDate: new Date('2025-07-01'),
    };
    await db.collection('assignments').insertOne(assignment1);

    // Mock Submissions
    await firestore.collection('submissions').add({
      studentId: student1.clerkId,
      assignmentId: assignment1._id,
      typedText: 'The quick brown fox jumps over the lazy dog.',
      mistakes: 0,
      speed: 60,
      backspaces: 2,
      timestamp: new Date(),
    });
    await firestore.collection('submissions').add({
      studentId: student2.clerkId,
      assignmentId: assignment1._id,
      typedText: 'The quick brown fox jumps over the lazy do.',
      mistakes: 2,
      speed: 55,
      backspaces: 5,
      timestamp: new Date(),
    });

    // Mock Typing Tests
    await firestore.collection('typing_tests').add({
      studentId: student1.clerkId,
      paragraphId: 'para_1',
      speed: 65,
      mistakes: 1,
      backspaces: 3,
      timestamp: new Date(),
    });
    await firestore.collection('typing_tests').add({
      studentId: student2.clerkId,
      paragraphId: 'para_1',
      speed: 50,
      mistakes: 4,
      backspaces: 7,
      timestamp: new Date(),
    });

    console.log('Mock data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    // Note: Do not close mongoClient in production
  }
}

seedData().catch(console.error);