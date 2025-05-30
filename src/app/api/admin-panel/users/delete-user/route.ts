import { NextRequest, NextResponse } from "next/server";
import { doc, deleteDoc, getDocs, collection } from "firebase/firestore";
import { HabitForgeFirestore } from "../../../../../../firebase/firebase.config";

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
      await deleteDoc(habitDoc.ref);
    }
    await deleteDoc(doc(HabitForgeFirestore, "users", userId));
    return NextResponse.json({
      success: true,
      message: `User with ID ${userId} deleted successfully.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
