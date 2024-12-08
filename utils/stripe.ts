import Stripe from "npm:stripe";

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
  hours: number;
  tokens: number;
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt: number;
  completedAt?: number;
}

// Store purchase in KV and return checkout URL
export async function createPurchase(
  kv: Deno.Kv,
  userId: string,
  hours: number,
  successUrl: string,
  cancelUrl: string,
): Promise<string> {
  // Create purchase record
  const purchaseId = crypto.randomUUID();
  const tokens = hours * TOKEN_PRODUCT.tokensPerHour;
  const amount = hours * TOKEN_PRODUCT.price;
  
  const purchase: PurchaseRecord = {
    userId,
    hours,
    tokens,
    amount,
    status: "pending",
    createdAt: Date.now(),
  };

  // Store in KV
  await kv.atomic()
    .set(["purchases", purchaseId], purchase)
    .commit();

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
    metadata: { purchaseId },
  });

  return session.url;
}

// Complete purchase and update tokens
export async function completePurchase(
  kv: Deno.Kv,
  purchaseId: string,
): Promise<void> {
  // Get purchase record
  const purchase = await kv.get<PurchaseRecord>(["purchases", purchaseId]);
  if (!purchase.value) throw new Error("Purchase not found");
  if (purchase.value.status === "completed") return;

  // Get current token balance
  const currentTokens = await kv.get<number>(["user_tokens", purchase.value.userId]);
  const newAmount = (currentTokens.value || 0) + purchase.value.tokens;

  // Update purchase and tokens atomically
  await kv.atomic()
    .set(["purchases", purchaseId], {
      ...purchase.value,
      status: "completed",
      completedAt: Date.now(),
    })
    .set(["user_tokens", purchase.value.userId], newAmount)
    .commit();

  // Broadcast update to all connected clients
  const bc = new BroadcastChannel("token-updates");
  try {
    bc.postMessage({
      type: "token-update",
      userId: purchase.value.userId,
      tokens: newAmount,
    });
  } finally {
    bc.close();
  }
}

// Get user's token balance
export async function getUserTokens(
  kv: Deno.Kv,
  userId: string,
): Promise<number> {
  const result = await kv.get<number>(["user_tokens", userId]);
  return result.value || 0;
}

// Decrement user's tokens
export async function decrementUserTokens(
  kv: Deno.Kv,
  userId: string,
  amount = 1,
): Promise<boolean> {
  const currentTokens = await kv.get<number>(["user_tokens", userId]);
  if (!currentTokens.value || currentTokens.value < amount) {
    return false;
  }

  const newAmount = currentTokens.value - amount;
  
  await kv.atomic()
    .set(["user_tokens", userId], newAmount)
    .commit();

  // Broadcast update
  const bc = new BroadcastChannel("token-updates");
  try {
    bc.postMessage({
      type: "token-update",
      userId,
      tokens: newAmount,
    });
  } finally {
    bc.close();
  }

  return true;
} 