import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertAmountToStripe = (amount: number) => {
  if (typeof amount !== "number" || isNaN(amount)) {
    throw new Error("Invalid input: amount must be a number");
  }
  // TODO: `amount` is provided in base units and needs to be converted to smallest currency units
  return amount * 100;
};

type ExchangeRatesType = {
  [key: string]: number;
};

export const ExchangeRates: ExchangeRatesType = {
  inr: 83.12, // Example exchange rate: 1 USD = 83.12 INR
};

export const formatAmountBasedOnCurrency = (
  currencyCode: string,
  amount: number
): number => {
  if (ExchangeRates[currencyCode] === undefined) {
    throw new Error(`Unsupported currency code: ${currencyCode}`);
  }

  const exchangeRate = ExchangeRates[currencyCode];
  const convertedAmount = amount * exchangeRate;
  const formattedAmount = parseFloat(convertedAmount.toFixed(2));

  return formattedAmount;
};
