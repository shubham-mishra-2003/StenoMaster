import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../firebase/FirebaseAdmin';
import { Assignment } from '@/types';

type FirestoreAssignment = Assignment & { [key: string]: any };

const handleError = (error: any, message: string) => {
  console.error(message, error);
  return NextResponse.json({ error: message }, { status: 500 });
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const doc = await db.collection('assignments').doc(id).get();
      if (!doc.exists) {
        return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
      }
      return NextResponse.json({ id: doc.id, ...doc.data() });
    }

    const snapshot = await db.collection('assignments').get();
    const assignments: Assignment[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Assignment));
    return NextResponse.json(assignments);
  } catch (error) {
    return handleError(error, 'Error fetching assignments');
  }
}

// POST: Create a new assignment
export async function POST(req: NextRequest) {
  try {
    const assignment: FirestoreAssignment = await req.json();
    if (!assignment.id) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }
    await db.collection('assignments').doc(assignment.id).set(assignment);
    return NextResponse.json({ message: 'Assignment created successfully', id: assignment.id });
  } catch (error) {
    return handleError(error, 'Error creating assignment');
  }
}

// PUT: Update an existing assignment
export async function PUT(req: NextRequest) {
  try {
    const assignment: FirestoreAssignment = await req.json();
    if (!assignment.id) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }
    await db.collection('assignments').doc(assignment.id).update(assignment);
    return NextResponse.json({ message: 'Assignment updated successfully', id: assignment.id });
  } catch (error) {
    return handleError(error, 'Error updating assignment');
  }
}

// DELETE: Delete an assignment by ID
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }
    await db.collection('assignments').doc(id).delete();
    return NextResponse.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    return handleError(error, 'Error deleting assignment');
  }
}