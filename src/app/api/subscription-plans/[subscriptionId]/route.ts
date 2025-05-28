import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { HabitForgeFirestore } from "../../../../../firebase/firebase.config"; // Adjust if needed

export async function GET(
  req: NextRequest,
  { params }: { params: { subscriptionId: string } }
) {
  const { subscriptionId } = params;

  try {
    const docRef = doc(HabitForgeFirestore, "subscriptions", subscriptionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Subscription plan not found" },
        { status: 404 }
      );
    }

    const plan = { id: docSnap.id, ...docSnap.data() };

    return NextResponse.json({ plan }, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to fetch subscription plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plan" },
      { status: 500 }
    );
  }
}
