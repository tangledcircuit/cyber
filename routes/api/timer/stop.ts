import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const { userId, stopTime } = await req.json();
      
      if (!userId || !stopTime) {
        return new Response("Missing required fields", { status: 400 });
      }

      const kv = await Deno.openKv();
      
      // Get the start time
      const startTimeEntry = await kv.get(["timers", userId, "start"]);
      const startTime = startTimeEntry.value as number;

      if (!startTime) {
        return new Response("No active timer found", { status: 400 });
      }

      // Calculate duration
      const duration = stopTime - startTime;

      // Store the stop time and duration in KV
      await kv.atomic()
        .set(["timers", userId, "stop"], stopTime)
        .set(["timers", userId, "duration"], duration)
        .set(["timers", userId, "status"], "stopped")
        .commit();

      // Broadcast the timer stop event
      await kv.atomic()
        .set(["events", "timer", userId], {
          type: "timer-update",
          status: "stopped",
          stopTime,
          duration,
          userId,
        })
        .commit();

      return new Response(JSON.stringify({ success: true, duration }), {
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