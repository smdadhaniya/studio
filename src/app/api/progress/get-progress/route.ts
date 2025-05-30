import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { HabitForgeFirestore } from "../../../../../firebase/firebase.config";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const habitsRef = collection(HabitForgeFirestore, `users/${userId}/habits`);
    const habitSnapshot = await getDocs(habitsRef);

    const result: Record<string, any[]> = {};

    for (const habitDoc of habitSnapshot.docs) {
      const habitId = habitDoc.id;

      const progressRef = collection(
        HabitForgeFirestore,
        `users/${userId}/habits/${habitId}/progress`
      );
      const progressSnapshot = await getDocs(progressRef);

      const progressArray = progressSnapshot.docs.map((doc) => doc.data());

      if (progressArray.length > 0) {
        result[habitId] = progressArray;
      }
    }

    return NextResponse.json({ success: true, allProgress: result });
  } catch (error) {
    console.error("🔥 Error fetching all progress:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
