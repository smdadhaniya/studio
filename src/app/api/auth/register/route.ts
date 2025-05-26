import { Firebase } from "@/lib/firebase-error-handler";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import { HabitForgeAuth, HabitForgeFirestore } from "../../../../../firebase/firebase.config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Missing required fields: name, email, and password." },
        { status: 400 }
      );
    }
    let user;
    try {
      const userCredential = await createUserWithEmailAndPassword(HabitForgeAuth, email, password);
      user = userCredential.user;
    } catch (authError) {
      console.error("🔥 Firebase Auth Error:", authError);
      throw authError;
    }
    const userData = {
      uid: user.uid,
      name,
      email,
      created_at: new Date().toISOString(),
    };

    await setDoc(doc(HabitForgeFirestore, "users", user.uid), userData);

    const accessToken = await user.getIdToken();
    const refreshToken = user.refreshToken;

    return NextResponse.json(
      {
        success: true,
        message: "Successfully registered",
        data: {
          userInfo: userData,
          accessToken,
          refreshToken,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // return Firebase.handleFirebaseError(error);
  }
}
