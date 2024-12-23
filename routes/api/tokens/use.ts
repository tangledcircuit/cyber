import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const { userId, amount } = await req.json();
      
      if (!userId || typeof amount !== 'number') {
        return new Response("Missing required fields", { status: 400 });
      }

      const kv = await Deno.openKv();
      
      // Get current token balance
      const balanceEntry = await kv.get(["balances", userId]);
      const currentBalance = (balanceEntry.value as number) || 0;
      
      // Ensure sufficient balance
      if (currentBalance < amount) {
        return new Response(JSON.stringify({ error: "Insufficient balance" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Update balance and record usage atomically
      const newBalance = currentBalance - amount;
      const usageId = crypto.randomUUID();
      
      await kv.atomic()
        .check(balanceEntry)
        .set(["balances", userId], newBalance)
        .set(["usages", userId, usageId], {
          id: usageId,
          userId,
          amount: -amount,
          timestamp: Date.now(),
          type: "usage",
          description: "Timer usage"
        })
        .commit();

      // Broadcast balance update
      await kv.atomic()
        .set(["events", "balance", userId], {
          type: "balance-update",
          userId,
          balance: newBalance,
          timestamp: Date.now()
        })
        .commit();

      return new Response(JSON.stringify({ 
        success: true,
        balance: newBalance
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Failed to use tokens:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
}; 