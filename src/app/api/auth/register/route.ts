import { NextRequest, NextResponse } from "next/server";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  HabitForgeAuth,
  HabitForgeFirestore,
} from "../../../../../firebase/firebase.config";

type Habit = {
  id: string;
  [key: string]: any;
};

type HabitProgress = Record<
  string,
  { date: string; completed: boolean; value?: number }[]
>;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      name,
      allHabits,
      allProgress,
    }: {
      email: string;
      password: string;
      name: string;
      allHabits: Habit[];
      allProgress: HabitProgress;
    } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
    }

    const usersCollection = collection(HabitForgeFirestore, "users");
    const q = query(usersCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return NextResponse.json(
        { message: "User already exists with this email." },
        { status: 409 }
      );
    }

    const { user }: { user: any } = await createUserWithEmailAndPassword(
      HabitForgeAuth,
      email,
      password
    );
    console.log("user id", user?.uid);

    const accessToken = await user.getIdToken();
    const refreshToken = user?.refreshToken;
    const userProfile = {
      id: user?.uid,
      email: user?.email,
      name,
    };

    const userDocRef = doc(HabitForgeFirestore, "users", user?.uid);
    await setDoc(userDocRef, {
      email,
      name,
      created_at: new Date().toISOString(),
    });

    if (Array.isArray(allHabits) && allHabits.length > 0) {
      const batch = writeBatch(HabitForgeFirestore);

      for (const habit of allHabits) {
        const { id, ...habitData } = habit;
        const habitRef = doc(
          HabitForgeFirestore,
          `users/${user?.uid}/habits/${id}`
        );
        batch.set(habitRef, habitData);

        const progressList = allProgress[id] || [];
        for (const progress of progressList) {
          const progressRef = doc(
            collection(
              HabitForgeFirestore,
              `users/${user?.uid}/habits/${id}/progress`
            )
          );
          batch.set(progressRef, progress);
        }
      }

      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: "User registered and synced successfully.",
      accessToken,
      refreshToken,
      userProfile,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
