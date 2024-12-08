import { Handlers } from "$fresh/server.ts";
import { createPurchase } from "../../../utils/stripe.ts";
import { kindeClient } from "../../../utils/kinde.ts";
import { createSessionManager } from "../../../utils/session.ts";

const kv = await Deno.openKv();

export const handler: Handlers = {
  async POST(req) {
    // Verify user is authenticated
    const sessionManager = createSessionManager();
    const isAuthenticated = await kindeClient.isAuthenticated(sessionManager);
    
    if (!isAuthenticated) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const { hours } = await req.json();
      
      if (!hours || hours < 1) {
        return new Response("Invalid hours", { status: 400 });
      }

      const user = await kindeClient.getUser(sessionManager);
      if (!user?.id) {
        return new Response("User not found", { status: 404 });
      }

      const url = await createPurchase(
        kv,
        user.id,
        hours,
        `${new URL(req.url).origin}/dashboard?payment=success`,
        `${new URL(req.url).origin}/dashboard?payment=cancelled`,
      );

      return new Response(JSON.stringify({ url }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Checkout error:", message);
      return new Response(message, { status: 400 });
    }
  },
}; 