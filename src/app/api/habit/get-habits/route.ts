import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { HabitForgeFirestore } from "../../../../../firebase/firebase.config";

// GET /api/habit/get-habits/:userId
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId in URL parameters" },
        { status: 400 }
      );
    }

    const habitsRef = collection(HabitForgeFirestore, `users/${userId}/habits`);
    const habitsSnap = await getDocs(habitsRef);

    const habits = habitsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ habits });
  } catch (error) {
    console.error("🔥 Error fetching habits:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
