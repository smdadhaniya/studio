import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID!,
  key_secret: process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, name: customerName } = body;

    if (!amount || !customerName) {
      return NextResponse.json(
        {
          message: "Missing required fields: amount and customer name.",
        },
        { status: 400 }
      );
    }

    // 💰 Razorpay accepts amount in paise (i.e., multiply by 100 if not already done)
    const order = await razorpay.orders.create({
      amount: amount, // amount should already be in paisa if INR (e.g., ₹99 => 9900)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        customerName,
      },
    });

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error: any) {
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json(
      {
        message: error?.message || "Failed to create Razorpay order.",
      },
      { status: 500 }
    );
  }
}
