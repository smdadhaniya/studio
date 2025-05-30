import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { HabitForgeFirestore } from "../../../../firebase/firebase.config";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      subscriptions: {
        currency,
        payment_method,
        amount,
        user_id,
        subscription_id,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      } = {},
    } = body;

    if (
      !user_id ||
      !currency ||
      !payment_method ||
      !amount ||
      !subscription_id ||
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Verify Razorpay Signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // 🔍 Get the user document directly by ID
    const userDocRef = doc(HabitForgeFirestore, "users", user_id);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 📦 Create subscription reference
    const subscriptionRef = doc(
      HabitForgeFirestore,
      "subscriptions",
      subscription_id
    );

    // 🧾 Create new subscription history document
    const historyDocRef = doc(
      collection(HabitForgeFirestore, `users/${user_id}/subscription_history`)
    );

    await setDoc(historyDocRef, {
      currency,
      payment_method,
      amount,
      razorpay_payment_id,
      razorpay_order_id,
      purchase_time: new Date().toLocaleTimeString(),
      purchase_date: Timestamp.now(),
      expire_date: Timestamp.fromDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
      ),
      is_expire: false,
      subscription_ref: subscriptionRef,
      created_at: Timestamp.now(),
    });

    // 🔄 Update user with current subscription info
    await updateDoc(userDocRef, {
      subscription: historyDocRef,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Subscription updated successfully" });
  } catch (error) {
    console.error("🔥 Update User Subscription Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
