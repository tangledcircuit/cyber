import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const { userId, stopTime, duration } = await req.json();
      
      if (!userId || !stopTime || typeof duration !== 'number') {
        return new Response("Missing required fields", { status: 400 });
      }

      const kv = await Deno.openKv();
      
      // Get the start time
      const startTimeEntry = await kv.get(["timers", userId, "start"]);
      const startTime = startTimeEntry.value as number;

      if (!startTime) {
        return new Response("No active timer found", { status: 400 });
      }

      // Get current balance
      const balanceEntry = await kv.get(["balances", userId]);
      const currentBalance = (balanceEntry.value as number) || 0;

      // Create transaction for token usage
      const transactionId = crypto.randomUUID();
      const transaction = {
        id: transactionId,
        userId,
        amount: -duration, // Negative amount for usage
        timestamp: Date.now(),
        type: "usage",
        description: `Timer usage: ${duration} seconds`,
      };

      // Update timer state and create transaction atomically
      await kv.atomic()
        .check(startTimeEntry)
        .check(balanceEntry)
        .set(["timers", userId, "stop"], stopTime)
        .set(["timers", userId, "duration"], duration)
        .set(["timers", userId, "status"], "stopped")
        .set(["transactions", userId, transactionId], transaction)
        .set(["balances", userId], currentBalance - duration)
        .commit();

      // Broadcast the timer stop and transaction update
      await kv.atomic()
        .set(["events", "timer", userId], {
          type: "timer-update",
          status: "stopped",
          stopTime,
          duration,
          userId,
        })
        .set(["events", "transaction", userId], {
          type: "token-update",
          userId,
          transaction,
        })
        .commit();

      return new Response(JSON.stringify({ 
        success: true,
        duration,
        transaction,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Failed to stop timer:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
}; 