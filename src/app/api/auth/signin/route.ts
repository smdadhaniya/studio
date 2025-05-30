import { Firebase } from "@/lib/firebase-error-handler";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import {
  HabitForgeAuth,
  HabitForgeFirestore,
} from "../../../../../firebase/firebase.config";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          message: "Missing required fields: email and password.",
        }),
        { status: 400 }
      );
    }
    let signinUser;
    try {
      const { user } = await signInWithEmailAndPassword(
        HabitForgeAuth,
        email,
        password
      );
      signinUser = user;
    } catch {
      return new Response(
        JSON.stringify({ message: "User record not found in Firestore." }),
        { status: 404 }
      );
    }
    const userDocRef = doc(HabitForgeFirestore, "users", signinUser.uid);
    const userSnapshot = await getDoc(userDocRef);

    const userData = userSnapshot.data();
    const { subscription, ...userInfo } = userData || {};

    const accessToken = await signinUser.getIdToken();
    const refreshToken = signinUser.refreshToken;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Successfully signed in",
        data: {
          userInfo,
          accessToken,
          refreshToken,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    const formattedError = Firebase.handleFirebaseError(error);
    return new Response(
      JSON.stringify({ message: formattedError || "Internal Server Error" }),
      { status: 500 }
    );
  }
}
