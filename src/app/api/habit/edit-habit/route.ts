import { NextRequest, NextResponse } from "next/server";
import {
  doc,
  updateDoc,
  Timestamp,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { HabitForgeFirestore } from "../../../../../firebase/firebase.config";

// PUT /api/habit/edit-habit
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, habitId, data } = body;

    if (!userId || !habitId || typeof data !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid userId, habitId, or data" },
        { status: 400 }
      );
    }

    const habitDocRef = doc(
      HabitForgeFirestore,
      `users/${userId}/habits/${habitId}`
    );

    const existingHabitSnap = await getDoc(habitDocRef);

    if (!existingHabitSnap.exists()) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const existingHabit = existingHabitSnap.data();
    const oldTrackingFormat = existingHabit.tracking_format;
    const newTrackingFormat = data.tracking_format;

    // If tracking_format changed, delete progress subcollection
    if (newTrackingFormat && newTrackingFormat !== oldTrackingFormat) {
      const progressCollectionRef = collection(
        HabitForgeFirestore,
        `users/${userId}/habits/${habitId}/progress`
      );

      const progressDocs = await getDocs(progressCollectionRef);

      const deletePromises = progressDocs.docs.map((docSnap) =>
        deleteDoc(docSnap.ref)
      );
      await Promise.all(deletePromises);
    }

    await updateDoc(habitDocRef, {
      ...data,
      updated_at: Timestamp.now(),
    });

    return NextResponse.json({
      message: "Habit updated successfully",
      habitId,
    });
  } catch (error) {
    console.error("🔥 Error updating habit:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
