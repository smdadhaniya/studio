import { NextRequest, NextResponse } from "next/server";
import { doc, deleteDoc, getDocs, collection } from "firebase/firestore";
import { getAuth } from "firebase-admin/auth"; // Only works if using Firebase Admin SDK
import { HabitForgeFirestore } from "../../../../../../firebase/firebase.config";

// DELETE /api/user/delete-user
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "Missing userId in query." },
        { status: 400 }
      );
    }

    // Delete all progress from all habits
    const habitsCollectionRef = collection(
      HabitForgeFirestore,
      `users/${userId}/habits`
    );
    const habitDocs = await getDocs(habitsCollectionRef);

    for (const habitDoc of habitDocs.docs) {
      const progressCollectionRef = collection(
        HabitForgeFirestore,
        `users/${userId}/habits/${habitDoc.id}/progress`
      );
      const progressDocs = await getDocs(progressCollectionRef);

      for (const progressDoc of progressDocs.docs) {
        await deleteDoc(progressDoc.ref);
      }

      await deleteDoc(habitDoc.ref); // delete the habit itself
    }

    // Delete user document
    await deleteDoc(doc(HabitForgeFirestore, "users", userId));

    // Optional: Delete user from Firebase Auth (requires Firebase Admin SDK setup)
    try {
      const auth = getAuth();
      await auth.deleteUser(userId);
    } catch (adminErr) {
      console.warn(
        "⚠️ User deleted from Firestore but not Firebase Auth:",
        adminErr
      );
    }

    return NextResponse.json({
      success: true,
      message: `User with ID ${userId} deleted successfully.`,
    });
  } catch (error) {
    console.error("🔥 Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
