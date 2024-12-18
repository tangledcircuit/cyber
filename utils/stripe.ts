import Stripe from "npm:stripe";
import { createBroadcastChannel } from "./db.ts";

// Single token product configuration (shared between client and server)
export const TOKEN_PRODUCT = {
  name: "Cyber Time",
  description: "Computer time by the hour",
  price: 0.05, // 5 cents per hour
  tokensPerHour: 3600, // 1 token per second
  minHours: 10, // Minimum 10 hours ($0.50)
  currency: "cad",
} as const;

// Initialize Stripe only on server
const stripe = typeof Deno !== "undefined" ? new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
}) : null;

interface PurchaseRecord {
  userId: string;
  email: string;
  hours: number;
  tokens: number;
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt: number;
  completedAt?: number;
  stripeSessionId?: string;
  stripePaymentId?: string;
}

// Sync Stripe transactions with KV store
export async function syncStripeTransactions(kv: Deno.Kv, userId: string, email: string): Promise<void> {
  if (!stripe) throw new Error("Stripe is not initialized");

  if (!email) {
    console.log("No email provided for user", userId);
    return;
  }

  // Get all successful payments for the email
  const payments = await stripe.paymentIntents.list({
    limit: 100,
    expand: ['data.customer'],
  });

  // Filter payments by status and customer email
  const userPayments = payments.data.filter(payment => 
    payment.status === "succeeded" && 
    payment.customer?.email === email
  );

  // Get existing transactions from KV
  const existingTransactions = new Set<string>();
  const iter = kv.list<PurchaseRecord>({ prefix: ["transactions"] });
  for await (const entry of iter) {
    if (entry.value.stripePaymentId) {
      existingTransactions.add(entry.value.stripePaymentId);
    }
  }

  // Process new payments
  for (const payment of userPayments) {
    if (!existingTransactions.has(payment.id)) {
      const amount = payment.amount;
      const tokens = Math.floor((amount / 50) * 3600); // $0.50 = 3600 tokens
      const timestamp = payment.created * 1000; // Convert to milliseconds
      const purchaseId = crypto.randomUUID();

      // Get current token balance
      const currentTokens = await kv.get<number>(["user_tokens", userId]);
      const newAmount = (currentTokens.value || 0) + tokens;

      // Update KV store
      await kv.atomic()
        .set(["user_tokens", userId], newAmount)
        .set(["transactions", purchaseId], {
          id: purchaseId,
          userId,
          email,
          type: "purchase",
          amount: tokens,
          timestamp,
          description: `Purchased ${Math.floor(tokens / 3600)} hours (${tokens} tokens)`,
          balance: newAmount,
          stripePaymentId: payment.id,
          stripeStatus: "completed"
        })
        .commit();

      // Broadcast update
      const bc = createBroadcastChannel("token-updates");
      try {
        bc.postMessage({
          type: "token-update",
          userId,
          tokens: newAmount,
          transaction: {
            id: purchaseId,
            userId,
            type: "purchase",
            amount: tokens,
            timestamp,
            description: `Purchased ${Math.floor(tokens / 3600)} hours (${tokens} tokens)`,
            balance: newAmount,
            stripePaymentId: payment.id,
            stripeStatus: "completed"
          }
        });
      } finally {
        bc.close();
      }
    }
  }

  // Also check checkout sessions
  const sessions = await stripe.checkout.sessions.list({
    limit: 100,
    expand: ['data.customer_details'],
  });

  // Process any completed sessions that don't have corresponding payment intents
  for (const session of sessions.data) {
    if (session.payment_status === 'paid' && 
        session.payment_intent && 
        session.customer_details?.email === email) {
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
      if (paymentIntent.status === 'succeeded' && !existingTransactions.has(paymentIntent.id)) {
        const amount = paymentIntent.amount;
        const tokens = Math.floor((amount / 50) * 3600); // $0.50 = 3600 tokens
        const timestamp = paymentIntent.created * 1000; // Convert to milliseconds
        const purchaseId = crypto.randomUUID();

        // Get current token balance
        const currentTokens = await kv.get<number>(["user_tokens", userId]);
        const newAmount = (currentTokens.value || 0) + tokens;

        // Update KV store
        await kv.atomic()
          .set(["user_tokens", userId], newAmount)
          .set(["transactions", purchaseId], {
            id: purchaseId,
            userId,
            email,
            type: "purchase",
            amount: tokens,
            timestamp,
            description: `Purchased ${Math.floor(tokens / 3600)} hours (${tokens} tokens)`,
            balance: newAmount,
            stripePaymentId: paymentIntent.id,
            stripeStatus: "completed"
          })
          .commit();

        // Broadcast update
        const bc = createBroadcastChannel("token-updates");
        try {
          bc.postMessage({
            type: "token-update",
            userId,
            tokens: newAmount,
            transaction: {
              id: purchaseId,
              amount: tokens,
              timestamp,
              balance: newAmount
            }
          });
        } finally {
          bc.close();
        }
      }
    }
  }
}

// Store purchase in KV and return checkout URL
export async function createPurchase(
  kv: Deno.Kv,
  userId: string,
  email: string,
  hours: number,
  successUrl: string,
  cancelUrl: string,
): Promise<string> {
  if (!email) {
    throw new Error("No email provided for user");
  }

  // Create purchase record
  const purchaseId = crypto.randomUUID();
  const tokens = hours * TOKEN_PRODUCT.tokensPerHour;
  const amount = hours * TOKEN_PRODUCT.price;
  
  const purchase: PurchaseRecord = {
    userId,
    email,
    hours,
    tokens,
    amount,
    status: "pending",
    createdAt: Date.now(),
  };

  // Create Stripe checkout
  if (!stripe) throw new Error("Stripe is not initialized");
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{
      price: Deno.env.get("STRIPE_1_TOKENS_PRICE_ID")!,
      quantity: hours,
    }],
    success_url: `${successUrl}?purchase=${purchaseId}`,
    cancel_url: `${cancelUrl}?purchase=${purchaseId}`,
    metadata: { purchaseId, userId, email },
    customer_email: email,
  });

  // Store in KV with Stripe session ID
  purchase.stripeSessionId = session.id;
  await kv.atomic()
    .set(["purchases", purchaseId], purchase)
    .commit();

  return session.url!;
}

// Verify and complete purchase
export async function verifyAndCompletePurchase(
  kv: Deno.Kv,
  purchaseId: string,
): Promise<boolean> {
  const purchase = await kv.get<PurchaseRecord>(["purchases", purchaseId]);
  if (!purchase.value || purchase.value.status !== "pending" || !purchase.value.stripeSessionId) {
    return false;
  }

  // Verify with Stripe
  if (!stripe) throw new Error("Stripe is not initialized");
  const session = await stripe.checkout.sessions.retrieve(purchase.value.stripeSessionId);
  
  if (session.payment_status !== "paid") {
    return false;
  }

  // Complete the purchase
  await completePurchase(kv, purchaseId);
  return true;
}

// Complete purchase and update tokens
export async function completePurchase(
  kv: Deno.Kv,
  purchaseId: string,
): Promise<void> {
  // Get purchase record
  const purchase = await kv.get<PurchaseRecord>(["purchases", purchaseId]);
  if (!purchase.value || purchase.value.status === "completed") return;

  // Get current token balance
  const currentTokens = await kv.get<number>(["user_tokens", purchase.value.userId]);
  const newAmount = (currentTokens.value || 0) + purchase.value.tokens;

  const timestamp = Date.now();

  // Update purchase, tokens, and record transaction atomically
  await kv.atomic()
    .set(["purchases", purchaseId], {
      ...purchase.value,
      status: "completed",
      completedAt: timestamp,
    })
    .set(["user_tokens", purchase.value.userId], newAmount)
    .set(["transactions", purchaseId], {
      id: purchaseId,
      userId: purchase.value.userId,
      email: purchase.value.email,
      type: "purchase",
      amount: purchase.value.tokens,
      timestamp,
      description: `Purchased ${purchase.value.hours} hours (${purchase.value.tokens} tokens)`,
      balance: newAmount,
      stripeSessionId: purchase.value.stripeSessionId,
      stripeStatus: "completed"
    })
    .commit();

  // Broadcast update
  const bc = createBroadcastChannel("token-updates");
  try {
    bc.postMessage({
      type: "token-update",
      userId: purchase.value.userId,
      tokens: newAmount,
      transaction: {
        id: purchaseId,
        userId: purchase.value.userId,
        type: "purchase",
        amount: purchase.value.tokens,
        timestamp,
        description: `Purchased ${purchase.value.hours} hours (${purchase.value.tokens} tokens)`,
        balance: newAmount,
        stripeSessionId: purchase.value.stripeSessionId,
        stripeStatus: "completed"
      }
    });
  } finally {
    bc.close();
  }
}

// Get user's token balance
export async function getUserTokens(
  userId: string,
): Promise<number> {
  const kv = await Deno.openKv();
  const result = await kv.get<number>(["user_tokens", userId]);
  return result.value ?? 0;
}

// Decrement user's tokens
export async function decrementUserTokens(
  userId: string,
  amount = 1,
): Promise<boolean> {
  const kv = await Deno.openKv();
  const currentTokens = await kv.get<number>(["user_tokens", userId]);
  if (!currentTokens.value || currentTokens.value < amount) {
    return false;
  }

  const newAmount = currentTokens.value - amount;
  const timestamp = Date.now();
  const transactionId = crypto.randomUUID();
  
  // Update tokens and record transaction atomically
  await kv.atomic()
    .set(["user_tokens", userId], newAmount)
    .set(["transactions", transactionId], {
      id: transactionId,
      userId,
      type: "usage",
      amount: -amount,
      timestamp,
      description: `Used ${amount} tokens`,
      balance: newAmount,
    })
    .commit();

  // Broadcast update
  const bc = createBroadcastChannel("token-updates");
  try {
    bc.postMessage({
      type: "token-update",
      userId,
      tokens: newAmount,
      transaction: {
        id: transactionId,
        userId,
        type: "usage",
        amount: -amount,
        timestamp,
        description: `Used ${amount} tokens`,
        balance: newAmount
      }
    });
  } finally {
    bc.close();
  }

  return true;
} 