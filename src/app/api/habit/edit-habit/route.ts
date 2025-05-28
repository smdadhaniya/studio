import { NextRequest, NextResponse } from "next/server";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { HabitForgeFirestore } from "../../../../../firebase/firebase.config";

// PUT /api/habit/edit-habit
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, habitId, data } = body;

    // ✅ Validate input
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
