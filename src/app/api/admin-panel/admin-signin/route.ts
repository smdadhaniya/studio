import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import {
  HabitForgeAuth,
  HabitForgeFirestore,
} from "../../../../../firebase/firebase.config";
import { NextResponse } from "next/server";

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
    let signinUser: any;
    try {
      const { user } = await signInWithEmailAndPassword(
        HabitForgeAuth,
        email,
        password
      );
      signinUser = user;
    } catch (error) {
      return new Response(
        JSON.stringify({ message: "Invalid email or password." }),
        { status: 401 }
      );
    }
    const userDocRef = doc(HabitForgeFirestore, "users", signinUser?.uid);
    const userSnapshot = await getDoc(userDocRef);
    if (!userSnapshot.exists()) {
      return new Response(
        JSON.stringify({ message: "User record not found in Firestore." }),
        { status: 404 }
      );
    }
    const userData = userSnapshot.data();
    if (userData?.role?.role_type !== "admin") {
      return new Response(
        JSON.stringify({ message: "Access denied. Admins only." }),
        { status: 403 }
      );
    }
    const accessToken = await signinUser.getIdToken();
    const refreshToken = signinUser.refreshToken;
    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin signed in successfully.",
        admin: {
          id: userData?.uid,
          name: userData.name,
          email: userData.email,
        },
        accessToken,
        refreshToken,
      }),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
