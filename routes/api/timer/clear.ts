import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const { userId } = await req.json();
      
      if (!userId) {
        return new Response("Missing required fields", { status: 400 });
      }

      const kv = await Deno.openKv();
      
      // Clear all timer data for the user
      await kv.atomic()
        .delete(["timers", userId, "start"])
        .delete(["timers", userId, "stop"])
        .delete(["timers", userId, "duration"])
        .delete(["timers", userId, "status"])
        .commit();

      // Broadcast the timer clear event
      await kv.atomic()
        .set(["events", "timer", userId], {
          type: "timer-update",
          status: "cleared",
          userId,
          timestamp: Date.now(),
        })
        .commit();

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Failed to clear timer:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
}; 