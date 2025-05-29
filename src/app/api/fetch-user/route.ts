import { NextRequest, NextResponse } from "next/server";
import {
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  collection,
  DocumentReference,
} from "firebase/firestore";
import { HabitForgeFirestore } from "../../../../firebase/firebase.config";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId in query parameters." },
        { status: 400 }
      );
    }

    const userRef = doc(HabitForgeFirestore, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userData = userSnap.data();
    const subscriptionRef = userData.subscription || null;
    delete userData.subscription;

    // Step 1: Get latest subscription_history
    let latestHistory: any = null;
    const historyQuery = query(
      collection(HabitForgeFirestore, `users/${userId}/subscription_history`),
      orderBy("purchase_date", "desc"),
      limit(1)
    );
    const historySnapshot = await getDocs(historyQuery);
    if (!historySnapshot.empty) {
      latestHistory = historySnapshot.docs[0].data();
    }

    // Step 2: Get subscription data
    let subscriptionData: any = null;
    if (subscriptionRef) {
      const subscriptionSnap = await getDoc(subscriptionRef);
      if (subscriptionSnap.exists()) {
        subscriptionData = subscriptionSnap.data();
      }
    }

    // Step 3: Get plan data
    let planData: any = null;
    if (subscriptionData?.subscription_ref) {
      const planSnap = await getDoc(
        subscriptionData.subscription_ref as DocumentReference
      );
      if (planSnap.exists()) {
        planData = planSnap.data();
      }
    }

    const response = {
      id: userId,
      ...userData,
      subscription_plan: planData
        ? {
            ...planData,
            purchase_date: latestHistory?.purchase_date?.toDate() || null,
            expire_date: latestHistory?.expire_date?.toDate() || null,
          }
        : null,
    };

    return NextResponse.json({ userInfo: response }, { status: 200 });
  } catch (error) {
    console.error("🔥 Fetch User Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
