import { useEffect, useState } from "react";
import { loadStripe, StripePaymentElementChangeEvent } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import PaymentForm from "../payments/PaymentForm";
import axiosInstance from "@/lib/axios";
// Load Stripe instance (client-side)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormProps {
  amount: number;
}

const CheckoutPage = ({ amount }: CheckoutFormProps) => {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const response = await axiosInstance.post("/api/payments/create-payment-intent", {
          amount,
        });
        setClientSecret(response.data.clientSecret);
      } catch (err) {
        setError("Failed to initialize payment.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientSecret();
  }, [amount]);


  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      {error && (
        <div className="flex justify-center item-center text-red-900">{error}</div>
      )}
      <PaymentForm clientSecret={clientSecret} />
    </Elements>
  );
};

export default CheckoutPage;
