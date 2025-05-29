import { Firebase } from "@/lib/firebase-error-handler";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
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

    // Step 1: Sign in using Firebase Auth
    let signinUser;
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

    // Step 2: Fetch user document
    const userDocRef = doc(HabitForgeFirestore, "users", signinUser.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      return new Response(
        JSON.stringify({ message: "User record not found in Firestore." }),
        { status: 404 }
      );
    }

    const userData = userSnapshot.data();

    // Step 3: Check for admin role
    if (userData?.role !== "admin") {
      return new Response(
        JSON.stringify({ message: "Access denied. Admins only." }),
        { status: 403 }
      );
    }

    // Step 4: Generate tokens
    const accessToken = await signinUser.getIdToken();
    const refreshToken = signinUser.refreshToken;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin signed in successfully.",
        data: {
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
