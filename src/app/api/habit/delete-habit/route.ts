import { NextRequest, NextResponse } from "next/server";
import { doc, deleteDoc } from "firebase/firestore";
import { HabitForgeFirestore } from "../../../../../firebase/firebase.config";

// DELETE /api/habit/delete-habit?userId=xxx&habitId=yyy
export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const habitId = searchParams.get("habitId");

    // ✅ Validate query parameters
    if (!userId || !habitId) {
      return NextResponse.json(
        { error: "Missing userId or habitId" },
        { status: 400 }
      );
    }

    const habitDocRef = doc(
      HabitForgeFirestore,
      `users/${userId}/habits/${habitId}`
    );

    // 🔥 Delete the document
    await deleteDoc(habitDocRef);

    return NextResponse.json({
      success: true,
      message: "Habit deleted successfully",
      habitId,
    });
  } catch (error) {
    console.error("🔥 Error deleting habit:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
