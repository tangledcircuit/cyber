import { Handlers } from "$fresh/server.ts";
import { handleWebhook, addTokensToUser } from "../../../utils/stripe.ts";

const kv = await Deno.openKv();

export const handler: Handlers = {
  async POST(req) {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("Webhook error: Missing stripe-signature header");
      return new Response("No signature", { status: 400 });
    }

    try {
      const payload = await req.text();
      console.log("Received webhook event:", payload.slice(0, 100) + "...");
      
      const event = await handleWebhook(payload, signature);
      console.log("Webhook event type:", event.type);

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          console.log("Processing checkout session:", session.id);
          
          const userId = session.metadata?.userId;
          const tokenAmount = parseInt(session.metadata?.amount || "0");

          if (!userId || !tokenAmount) {
            console.error("Missing metadata:", { userId, tokenAmount });
            return new Response("Invalid metadata", { status: 400 });
          }

          if (session.metadata?.type === "tokens") {
            await addTokensToUser(kv, userId, tokenAmount);
            console.log(`Added ${tokenAmount} tokens to user ${userId}`);
          }
          break;
        }
        
        case "charge.succeeded":
        case "payment_intent.succeeded":
        case "payment_intent.created":
        case "charge.updated":
          // Log but don't process these events
          console.log(`Acknowledged ${event.type} event:`, event.id);
          break;
          
        default:
          console.warn("Unhandled event type:", event.type);
      }

      return new Response("OK", { status: 200 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Webhook error:", message);
      if (err instanceof Error && err.stack) {
        console.error("Stack trace:", err.stack);
      }
      return new Response(message, { status: 400 });
    }
  },
}; 