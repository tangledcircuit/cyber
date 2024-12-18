export interface Transaction {
  id: string;
  userId: string;
  type: "purchase" | "usage";
  amount: number;
  timestamp: number;
  description: string;
  balance: number;
  stripePaymentId?: string;
  stripeStatus?: "pending" | "completed" | "failed";
  stripePriceId?: string;
} 