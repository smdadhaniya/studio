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

    const userDocRef = doc(HabitForgeFirestore, "users", userId);

    const habitsCollectionRef = collection(userDocRef, "habits");
    const habitDocs = await getDocs(habitsCollectionRef);

    for (const habitDoc of habitDocs.docs) {
      const progressCollectionRef = collection(habitDoc.ref, "progress");
      const progressDocs = await getDocs(progressCollectionRef);

      for (const progressDoc of progressDocs.docs) {
        await deleteDoc(progressDoc.ref);
      }

      await deleteDoc(habitDoc.ref);
    }

    const subscriptionHistoryRef = collection(
      userDocRef,
      "subscription_history"
    );
    const subscriptionDocs = await getDocs(subscriptionHistoryRef);

    for (const subDoc of subscriptionDocs.docs) {
      await deleteDoc(subDoc.ref);
    }

    await deleteDoc(userDocRef);

    return NextResponse.json({
      success: true,
      message: `User with ID ${userId} deleted successfully.`,
    });
  } catch (error) {
    console.error("DELETE /user error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
