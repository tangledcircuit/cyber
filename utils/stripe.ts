import Stripe from "npm:stripe";

// Initialize Stripe with the secret key (server-side only)
const stripe = typeof Deno !== "undefined" ? new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
}) : null;

export interface Product {
  name: string;
  description: string;
  priceId: string;
  price: number;
  currency: string;
}

// Single token product configuration
export const TOKEN_PRODUCT = {
  name: "10 Hours of Cyber Time",
  description: "36,000 tokens (1 token = 1 second)",
  priceId: typeof Deno !== "undefined" ? Deno.env.get("STRIPE_1_TOKENS_PRICE_ID")! : "",
  price: 0.50,
  tokensPerPurchase: 36000,
  currency: "cad",
} as const;

// Create a checkout session with quantity
export async function createCheckoutSession(
  userId: string,
  quantity: number,
  successUrl: string,
  cancelUrl: string,
) {
  if (!TOKEN_PRODUCT.priceId) {
    throw new Error("STRIPE_1_TOKENS_PRICE_ID environment variable is not set");
  }

  return await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{
      price: TOKEN_PRODUCT.priceId,
      quantity,
    }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId,
    metadata: {
      userId,
      type: "tokens",
      amount: (quantity * TOKEN_PRODUCT.tokensPerPurchase).toString()
    }
  });
}

// Verify and process a webhook
export function handleWebhook(
  payload: string,
  signature: string,
) {
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
  
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
    
    return event;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unknown error occurred";
    console.error("Webhook signature verification failed:", message);
    throw err;
  }
}

// Store tokens in KV
export async function addTokensToUser(
  kv: Deno.Kv,
  userId: string,
  amount: number
) {
  const key = ["user_tokens", userId];
  
  // Use atomic transaction to safely update tokens
  const atomic = kv.atomic();
  
  const currentTokens = await kv.get<number>(key);
  const newAmount = (currentTokens.value || 0) + amount;
  
  await atomic
    .set(key, newAmount)
    .commit();
    
  return newAmount;
}

// Get user's token balance
export async function getUserTokens(
  kv: Deno.Kv,
  userId: string
): Promise<number> {
  const result = await kv.get<number>(["user_tokens", userId]);
  return result.value || 0;
} 