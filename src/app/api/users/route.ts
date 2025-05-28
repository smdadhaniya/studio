import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  doc,
  DocumentReference,
} from "firebase/firestore";
import { HabitForgeFirestore } from "../../../../firebase/firebase.config";

export async function GET(req: NextRequest) {
  try {
    // Step 1: Get all user documents
    const usersSnapshot = await getDocs(
      collection(HabitForgeFirestore, "users")
    );

    const usersWithRefs = await Promise.all(
      usersSnapshot.docs.map(async (userDoc) => {
        const user = userDoc.data();
        const userId = userDoc.id;
        const subscriptionRef = user.subscription || null;
        delete user.subscription;

        // 🔍 Step 2: Fetch latest subscription_history
        let latestHistory: any = null;
        const historyQuery = query(
          collection(
            HabitForgeFirestore,
            `users/${userId}/subscription_history`
          ),
          orderBy("purchase_date", "desc"),
          limit(1)
        );
        const historySnapshot = await getDocs(historyQuery);
        if (!historySnapshot.empty) {
          latestHistory = historySnapshot.docs[0].data();
        }

        return { userId, user, subscriptionRef, latestHistory };
      })
    );

    // Step 3: Fetch all subscription documents
    const subscriptionDocs = await Promise.all(
      usersWithRefs.map(async ({ subscriptionRef }) => {
        if (!subscriptionRef) return null;
        const subSnap = await getDoc(subscriptionRef);
        return subSnap.exists()
          ? { ref: subscriptionRef, data: subSnap.data() }
          : null;
      })
    );

    // Step 4: Fetch all plan documents
    const planDocs = await Promise.all(
      subscriptionDocs.map(async (subDoc: any) => {
        if (!subDoc || !subDoc.data.subscription_ref) return null;
        const planSnap = await getDoc(
          subDoc.data.subscription_ref as DocumentReference
        );
        return planSnap.exists() ? planSnap.data() : null;
      })
    );

    // Step 5: Combine everything
    const usersData = usersWithRefs.map(
      ({ userId, user, latestHistory }, idx) => {
        const subscriptionData = subscriptionDocs[idx];
        const planData = planDocs[idx];

        return {
          id: userId,
          ...user,
          subscription_plan: planData
            ? {
                ...planData,
                purchase_date: latestHistory?.purchase_date?.toDate() || null,
                expire_date: latestHistory?.expire_date?.toDate() || null,
              }
            : null,
        };
      }
    );

    return NextResponse.json({ users: usersData });
  } catch (error) {
    console.error("🔥 Fetch Users with Subscription Info Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
