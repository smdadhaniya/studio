"use client";
import React, { useState, FormEvent } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { StripePaymentElementChangeEvent } from "@stripe/stripe-js";

interface PaymentFormProps {
  clientSecret: string;
}

const PaymentForm = ({ clientSecret }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (event: StripePaymentElementChangeEvent) => {
    setIsSubmitEnabled(event.complete);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: "if_required",
    });

    if (error) {
      console.log("Payment Failed!")
    } else {
      console.log("Payment Succesed!");
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto mt-6">
      <div className="mb-6">
        <PaymentElement onChange={handleChange} />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isSubmitEnabled || isProcessing}
          className={`px-6 py-2 text-white rounded-md transition-colors duration-200 ${isSubmitEnabled && !isProcessing
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
