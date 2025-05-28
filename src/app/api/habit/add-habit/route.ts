import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { HabitForgeFirestore } from "../../../../../firebase/firebase.config";

// POST /api/habit/preset
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { habits, userId } = body;

    // ✅ Validate userId and habits array
    if (!userId || !Array.isArray(habits) || habits.length === 0) {
      return NextResponse.json(
        { error: "Missing userId or habits array" },
        { status: 400 }
      );
    }

    const habitsCollectionRef = collection(
      HabitForgeFirestore,
      `users/${userId}/habits`
    );

    const createdHabits = [];

    for (const habit of habits) {
      const {
        title,
        description,
        trackingFormat,
        measurableUnit,
        targetCount,
        icon,
      } = habit;

      // ✅ Validate required fields for each habit
      if (!title || !description || !trackingFormat || !icon) {
        return NextResponse.json(
          { error: "One or more habits are missing required fields" },
          { status: 400 }
        );
      }

      const habitDocRef = await addDoc(habitsCollectionRef, {
        title,
        description,
        tracking_format: trackingFormat,
        measurable_unit: measurableUnit || null,
        target_count: targetCount ?? null,
        icon,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });

      createdHabits.push({ habitId: habitDocRef.id, title });
    }

    return NextResponse.json({
      message: "Habits created successfully",
      habits: createdHabits,
    });
  } catch (error) {
    console.error("🔥 Error creating habits:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
