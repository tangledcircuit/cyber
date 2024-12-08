import { Handlers } from "$fresh/server.ts";
import { completePurchase } from "../../../utils/stripe.ts";
import Stripe from "npm:stripe";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const kv = await Deno.openKv();

export const handler: Handlers = {
  async POST(req) {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("Webhook: Missing signature");
      return new Response("No signature", { status: 400 });
    }

    try {
      console.log("Webhook: Processing request");
      const payload = await req.text();
      console.log("Webhook: Received payload:", payload.slice(0, 100) + "...");
      
      const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
      const event = await stripe.webhooks.constructEventAsync(
        payload,
        signature,
        webhookSecret
      );
      console.log("Webhook: Event verified:", event.type);

      // Handle successful payments
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        console.log("Webhook: Processing completed checkout:", session.id);
        
        const purchaseId = session.metadata?.purchaseId;
        if (!purchaseId) {
          console.error("Webhook: Missing purchaseId in metadata");
          return new Response("Missing purchaseId", { status: 400 });
        }

        console.log(`Webhook: Completing purchase ${purchaseId}`);
        await completePurchase(kv, purchaseId);
        console.log(`Webhook: Purchase completed`);
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