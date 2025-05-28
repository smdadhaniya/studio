import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { HabitForgeFirestore } from "../../../../firebase/firebase.config"; // 🔄 Adjust path as needed

export async function GET(req: NextRequest) {
  try {
    const subscriptionsRef = collection(HabitForgeFirestore, "subscriptions");
    const snapshot = await getDocs(subscriptionsRef);

    const plans = snapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data(),
      })
    );

    return NextResponse.json({ plans }, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to fetch subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plans" },
      { status: 500 }
    );
  }
}
