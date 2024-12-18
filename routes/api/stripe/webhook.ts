import Stripe from "npm:stripe";
import { createBroadcastChannel } from "../../../utils/db.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const kv = await Deno.openKv();

export async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const payload = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
    const event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      console.log("Processing completed checkout session");
      const session = event.data.object;
      const { userId, purchaseId } = session.metadata || {};
      const customerEmail = session.customer_details?.email;
      
      if (!userId || !customerEmail) {
        console.error("Missing userId or customer email", { userId, customerEmail });
        return new Response("Missing userId or customer email", { status: 400 });
      }

      // Get the line items to calculate tokens
      console.log("Fetching line items for session", session.id);
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const tokens = (lineItems.data[0]?.quantity || 0) * 3600; // 1 hour = 3600 tokens

      // Get current token balance
      console.log("Getting current token balance for user", userId);
      const currentTokens = await kv.get<number>(["user_tokens", userId]);
      const newAmount = (currentTokens.value || 0) + tokens;
      console.log("New token balance:", newAmount);

      // Store transaction in KV
      const timestamp = Date.now();
      const transactionId = purchaseId || crypto.randomUUID();

      // Create the transaction record
      const transaction = {
        id: transactionId,
        userId,
        email: customerEmail,
        type: "purchase",
        amount: tokens,
        timestamp,
        description: `Purchased ${lineItems.data[0]?.quantity || 0} hours (${tokens} tokens)`,
        balance: newAmount,
        stripePaymentId: session.payment_intent as string,
        stripeStatus: "completed"
      };

      console.log("Storing transaction in KV:", transaction);

      // Update KV store atomically
      await kv.atomic()
        .set(["user_tokens", userId], newAmount)
        .set(["transactions", transactionId], transaction)
        .commit();

      // Broadcast update immediately
      console.log("Broadcasting token update");
      const bc = createBroadcastChannel("token-updates");
      try {
        const message = {
          type: "token-update",
          userId,
          tokens: newAmount,
          transaction
        };
        console.log("Broadcasting message:", message);
        bc.postMessage(message);
      } finally {
        bc.close();
      }

      console.log("Webhook processing completed successfully");
    }

    return new Response("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(error instanceof Error ? error.message : "Unknown error", { status: 400 });
  }
} 