import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import stripe from "../../../../libs/stripe/client";


const handleCreatePaymentIntent = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { amount, currency = "inr", name: customerName } = req.body;

    if (!amount || !customerName) {
      return res.status(400).json({
        error: "Missing required fields: amount and customer name.",
      });
    }

    const customer = await stripe.customers.create({
      name: customerName,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card"],
      description: "Habit Forge Subscription Plan Purchase",
      customer: customer.id,
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error: any) {
    const statusCode = error?.statusCode || 500;
    const message = error?.message || "An unexpected error occurred while processing the payment.";

    return res.status(statusCode).json({ error: message });
  }
};

export default handleCreatePaymentIntent;
