import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const { userId, startTime } = await req.json();
      
      if (!userId || !startTime) {
        return new Response("Missing required fields", { status: 400 });
      }

      const kv = await Deno.openKv();
      
      // Store the start time in KV
      await kv.atomic()
        .set(["timers", userId, "start"], startTime)
        .set(["timers", userId, "status"], "running")
        .commit();

      // Broadcast the timer start event
      await kv.atomic()
        .set(["events", "timer", userId], {
          type: "timer-update",
          status: "started",
          startTime,
          userId,
        })
        .commit();

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Failed to start timer:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
}; 