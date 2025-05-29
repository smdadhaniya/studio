import { getAuth as getAdminAuth } from "firebase-admin/auth";
import {
  initializeApp as initializeAdminApp,
  cert,
  getApps as getAdminApps,
} from "firebase-admin/app";
import { doc, getDoc } from "firebase/firestore";
import { HabitForgeFirestore } from "../../../../../firebase/firebase.config";

// Initialize Firebase Admin SDK
if (!getAdminApps().length) {
  initializeAdminApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return new Response(JSON.stringify({ message: "No token provided." }), {
        status: 401,
      });
    }

    // Verify token
    const decodedToken = await getAdminAuth().verifyIdToken(token);

    // Get user role from Firestore (uses your existing client config)
    const userDocRef = doc(HabitForgeFirestore, "users", decodedToken.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      return new Response(JSON.stringify({ message: "User not found." }), {
        status: 404,
      });
    }

    const userData = userSnapshot.data();

    if (userData?.role !== "admin") {
      return new Response(
        JSON.stringify({ message: "Access denied. Admins only." }),
        { status: 403 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Token is valid. Admin access granted.",
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          role: userData.role,
        },
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, message: "Invalid or expired token." }),
      { status: 401 }
    );
  }
}
