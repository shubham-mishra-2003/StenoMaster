import { db } from "@/app/api/firebase/FirebaseAdmin";
import { Assignment, Score } from "@/types";
import {
  Timestamp,
  CollectionReference,
  Query,
  DocumentData,
} from "firebase-admin/firestore";

type FirestoreAssignment = Assignment & { [key: string]: any };
type FirestoreScore = Omit<Score, "completedAt"> & {
  completedAt:
    | Timestamp
    | string
    | Date
    | { _seconds: number; _nanoseconds: number };
  timeElapsed?: number;
};

export async function getAssignments(
  id?: string
): Promise<Assignment | Assignment[]> {
  try {
    if (id) {
      const doc = await db.collection("assignments").doc(id).get();
      if (!doc.exists) {
        throw new Error("Assignment not found");
      }
      return { id: doc.id, ...doc.data() } as Assignment;
    }

    const snapshot = await db.collection("assignments").get();
    const assignments: Assignment[] = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Assignment)
    );
    return assignments;
  } catch (error) {
    throw new Error(
      `Error fetching assignments: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function createAssignment(
  assignment: FirestoreAssignment
): Promise<{ id: string }> {
  try {
    if (
      !assignment.id ||
      !assignment.title ||
      !assignment.correctText ||
      !assignment.imageUrl
    ) {
      throw new Error("Missing required assignment fields");
    }
    await db.collection("assignments").doc(assignment.id).set(assignment);
    return { id: assignment.id };
  } catch (error) {
    throw new Error(
      `Error creating assignment: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function updateAssignment(
  assignment: FirestoreAssignment
): Promise<{ id: string }> {
  try {
    if (!assignment.id) {
      throw new Error("Assignment ID is required");
    }
    await db.collection("assignments").doc(assignment.id).update(assignment);
    return { id: assignment.id };
  } catch (error) {
    throw new Error(
      `Error updating assignment: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function deleteAssignment(id: string): Promise<void> {
  try {
    if (!id) {
      throw new Error("Assignment ID is required");
    }
    await db.collection("assignments").doc(id).delete();
  } catch (error) {
    throw new Error(
      `Error deleting assignment: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

function isFirestoreTimestampObject(
  value: Timestamp | string | Date | { _seconds: number; _nanoseconds: number }
): value is { _seconds: number; _nanoseconds: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "_seconds" in value &&
    "_nanoseconds" in value
  );
}

export async function getScores(studentId?: string): Promise<Score[]> {
  try {
    let query: CollectionReference<DocumentData> | Query<DocumentData> =
      db.collection("scores");
    if (studentId) {
      query = query.where("studentId", "==", studentId);
    }

    const snapshot = await query.get();
    const scores: Score[] = snapshot.docs.map((doc) => {
      const data = doc.data() as FirestoreScore;

      let completedAtDate: Date;
      if (data.completedAt instanceof Timestamp) {
        completedAtDate = data.completedAt.toDate();
      } else if (typeof data.completedAt === "string") {
        completedAtDate = new Date(data.completedAt);
        if (isNaN(completedAtDate.getTime())) {
          throw new Error(
            `Invalid completedAt date string: ${data.completedAt}`
          );
        }
      } else if (data.completedAt instanceof Date) {
        completedAtDate = data.completedAt;
      } else if (isFirestoreTimestampObject(data.completedAt)) {
        completedAtDate = new Date(
          data.completedAt._seconds * 1000 + data.completedAt._nanoseconds / 1e6
        );
      } else {
        throw new Error("Invalid completedAt format");
      }

      const completedAt = completedAtDate.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        fractionalSecondDigits: 3,
        hour12: false,
      });

      const [datePart, timePart] = completedAt.split(", ");
      const [day, month, year] = datePart.split("/").map(Number);
      const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}T${timePart}+05:30`;

      const timeElapsed =
        data.timeElapsed ??
        Math.round(data.typedText.split(" ").length / (data.wpm / 60) || 60);

      return {
        id: doc.id,
        studentId: data.studentId,
        assignmentId: data.assignmentId,
        typedText: data.typedText,
        accuracy: data.accuracy,
        wpm: data.wpm,
        completedAt: formattedDate,
        timeElapsed,
      };
    });

    return scores;
  } catch (error) {
    throw new Error(
      `Error fetching scores: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function createScore(
  score: FirestoreScore
): Promise<{ id: string }> {
  try {
    if (
      !score.id ||
      !score.studentId ||
      !score.assignmentId ||
      !score.typedText ||
      score.accuracy == null ||
      score.wpm == null ||
      score.completedAt == null
    ) {
      throw new Error("Missing or invalid required fields");
    }

    let completedAt: Timestamp;
    if (score.completedAt instanceof Timestamp) {
      completedAt = score.completedAt;
    } else if (typeof score.completedAt === "string") {
      const date = new Date(score.completedAt);
      if (isNaN(date.getTime())) {
        throw new Error(
          `Invalid completedAt date string: ${score.completedAt}`
        );
      }
      completedAt = Timestamp.fromDate(date);
    } else if (score.completedAt instanceof Date) {
      completedAt = Timestamp.fromDate(score.completedAt);
    } else if (isFirestoreTimestampObject(score.completedAt)) {
      completedAt = Timestamp.fromMillis(
        score.completedAt._seconds * 1000 + score.completedAt._nanoseconds / 1e6
      );
    } else {
      throw new Error("Invalid completedAt format");
    }

    const timeElapsed =
      score.timeElapsed ??
      Math.round(score.typedText.split(" ").length / (score.wpm / 60) || 60);

    if (
      typeof score.accuracy !== "number" ||
      score.accuracy < 0 ||
      score.accuracy > 100
    ) {
      throw new Error("Invalid accuracy value");
    }
    if (typeof score.wpm !== "number" || score.wpm < 0) {
      throw new Error("Invalid wpm value");
    }

    await db.collection("scores").doc(score.id).set({
      studentId: score.studentId,
      assignmentId: score.assignmentId,
      typedText: score.typedText,
      accuracy: score.accuracy,
      wpm: score.wpm,
      completedAt,
      timeElapsed,
    });

    return { id: score.id };
  } catch (error) {
    throw new Error(
      `Error creating score: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
