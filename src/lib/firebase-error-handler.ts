import { FirebaseError } from "firebase/app";
import { NextResponse } from "next/server";

export class Firebase {
  public static handleFirebaseError(error: any) {
    let statusCode = 500;
    let errorMessage = "An unexpected error occurred";

    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/user-not-found":
          statusCode = 404;
          errorMessage = "User not found";
          break;
        case "auth/wrong-password":
          statusCode = 401;
          errorMessage = "Invalid password";
          break;
        case "auth/invalid-email":
          statusCode = 400;
          errorMessage = "Invalid email address";
          break;
        case "auth/invalid-credential":
          statusCode = 401;
          errorMessage = "Invalid credentials";
          break;
        case "auth/too-many-requests":
          statusCode = 400;
          errorMessage = "Too many requests, please try again later";
          break;
        case "auth/email-already-in-use":
          statusCode = 400;
          errorMessage = "Email already exists";
          break;
        case "auth/weak-password":
          statusCode = 400;
          errorMessage = "Password is too weak";
          break;
        case "auth/permission-denied":
          statusCode = 403;
          errorMessage = "Permission denied";
          break;
        case "auth/missing-password":
          statusCode = 400;
          errorMessage = "Password is missing";
          break;
        case "auth/user-disabled":
          statusCode = 400;
          errorMessage = "User account is disabled";
          break;

        // Firebase Storage
        case "storage/object-not-found":
          statusCode = 400;
          errorMessage = "Requested object not found in storage";
          break;

        default:
          errorMessage = error.message || "A Firebase error occurred";
          break;
      }
    } else {
      errorMessage = error.message || "Unknown error occurred";
    }

    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
