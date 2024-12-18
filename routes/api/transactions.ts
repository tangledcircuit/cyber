import { HandlerContext } from "$fresh/server.ts";
import { getUserTransactions } from "../../utils/kv.ts";
import { syncStripeTransactions } from "../../utils/stripe.ts";
import { kindeClient } from "../../utils/kinde.ts";
import { createSessionManager } from "../../utils/session.ts";

export async function handler(
  req: Request,
  _ctx: HandlerContext
): Promise<Response> {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return new Response(JSON.stringify({ error: "Missing userId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Get user's email from Kinde
    const sessionManager = createSessionManager();
    const user = await kindeClient.getUser(sessionManager);
    if (!user?.email) {
      return new Response(JSON.stringify({ error: "No email found for user" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // First sync with Stripe
    const kv = await Deno.openKv();
    await syncStripeTransactions(kv, userId, user.email);

    // Then get all transactions
    const transactions = await getUserTransactions(userId);
    return new Response(JSON.stringify({ transactions }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to get transactions:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to get transactions",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 