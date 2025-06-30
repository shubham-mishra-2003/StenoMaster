import { NextRequest, NextResponse } from "next/server";
import { db } from "../../firebase/FirebaseAdmin";
import { Score } from "@/types";
import { Timestamp } from "firebase-admin/firestore";

type FirestoreScore = Omit<Score, "completedAt"> & {
  completedAt:
    | Timestamp
    | string
    | Date
    | { _seconds: number; _nanoseconds: number };
  timeElapsed?: number;
};

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

const handleError = (error: unknown, message: string) => {
  console.error(message, error);
  return NextResponse.json(
    {
      error: message,
      details: error instanceof Error ? error.message : "Unknown error"
    },
    { status: 500 }
  );
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
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
        hour12: false
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
        timeElapsed
      };
    });

    return NextResponse.json(scores);
  } catch (error) {
    return handleError(error, "Error fetching scores");
  }
}

export async function POST(req: NextRequest) {
  try {
    const score: FirestoreScore = await req.json();

    if (
      !score.id ||
      !score.studentId ||
      !score.assignmentId ||
      !score.typedText ||
      score.accuracy == null ||
      score.wpm == null ||
      score.completedAt == null
    ) {
      return NextResponse.json(
        {
          error: "Missing or invalid required fields",
          missingFields: { score }
        },
        { status: 400 }
      );
    }

    let completedAt: Timestamp;
    if (score.completedAt instanceof Timestamp) {
      completedAt = score.completedAt;
    } else if (typeof score.completedAt === "string") {
      const date = new Date(score.completedAt);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: `Invalid completedAt date string: ${score.completedAt}` },
          { status: 400 }
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
      return NextResponse.json(
        { error: "Invalid completedAt format" },
        { status: 400 }
      );
    }

    // Estimate timeElapsed if missing
    const timeElapsed =
      score.timeElapsed ??
      Math.round(score.typedText.split(" ").length / (score.wpm / 60) || 60);

    // Validate numeric fields
    if (
      typeof score.accuracy !== "number" ||
      score.accuracy < 0 ||
      score.accuracy > 100
    ) {
      return NextResponse.json(
        { error: "Invalid accuracy value" },
        { status: 400 }
      );
    }
    if (typeof score.wpm !== "number" || score.wpm < 0) {
      return NextResponse.json({ error: "Invalid wpm value" }, { status: 400 });
    }

    try {
      await db.collection("scores").doc(score.id).set({
        studentId: score.studentId,
        assignmentId: score.assignmentId,
        typedText: score.typedText,
        accuracy: score.accuracy,
        wpm: score.wpm,
        completedAt,
        timeElapsed
      });
    } catch (firestoreError) {
      throw new Error(
        `Firestore write failed: ${
          firestoreError instanceof Error
            ? firestoreError.message
            : "Unknown Firestore error"
        }`
      );
    }

    return NextResponse.json({
      message: "Score created successfully",
      id: score.id
    });
  } catch (error) {
    return handleError(error, "Error creating score");
  }
}
