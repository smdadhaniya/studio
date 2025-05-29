import { NextRequest, NextResponse } from "next/server";
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { HabitForgeFirestore } from "../../../../../firebase/firebase.config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, habitId, progress } = body;

    // Validate required fields
    if (!userId || !habitId || !progress || !progress.date) {
      return NextResponse.json(
        { error: "Missing userId, habitId, or valid progress data" },
        { status: 400 }
      );
    }

    const { date, completed, value } = progress;

    const progressCollectionRef = collection(
      HabitForgeFirestore,
      `users/${userId}/habits/${habitId}/progress`
    );

    const progressQuery = query(
      progressCollectionRef,
      where("date", "==", date)
    );
    const querySnapshot = await getDocs(progressQuery);

    if (typeof value === "boolean") {
      if (completed === true) {
        // Insert or update with value = 1
        const docId = querySnapshot.empty
          ? undefined
          : querySnapshot.docs[0].id;
        const docRef = docId
          ? doc(progressCollectionRef, docId)
          : doc(progressCollectionRef);

        await setDoc(docRef, {
          date,
          value: 1,
          updated_at: Timestamp.now(),
        });

        return NextResponse.json({
          message: querySnapshot.empty ? "Progress added" : "Progress updated",
        });
      } else {
        // completed === false → delete the progress for the date
        if (!querySnapshot.empty) {
          await deleteDoc(querySnapshot.docs[0].ref);
          return NextResponse.json({ message: "Progress deleted" });
        } else {
          return NextResponse.json({ message: "No progress found to delete" });
        }
      }
    } else if (typeof value === "number") {
      // Insert or update numeric value
      const docId = querySnapshot.empty ? undefined : querySnapshot.docs[0].id;
      const docRef = docId
        ? doc(progressCollectionRef, docId)
        : doc(progressCollectionRef);

      await setDoc(docRef, {
        date,
        value,
        updated_at: Timestamp.now(),
      });

      return NextResponse.json({
        message: querySnapshot.empty ? "Progress added" : "Progress updated",
      });
    } else {
      return NextResponse.json(
        {
          error:
            "Invalid progress data. Must have either completed or numeric value.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("🔥 Error updating progress:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
