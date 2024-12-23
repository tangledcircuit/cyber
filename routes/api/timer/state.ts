import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(req) {
    try {
      const url = new URL(req.url);
      const userId = url.searchParams.get("userId");
      
      if (!userId) {
        return new Response("Missing userId parameter", { status: 400 });
      }

      const kv = await Deno.openKv();
      
      // Get all timer state entries
      const [startEntry, stopEntry, statusEntry] = await Promise.all([
        kv.get(["timers", userId, "start"]),
        kv.get(["timers", userId, "stop"]),
        kv.get(["timers", userId, "status"]),
      ]);

      const state = {
        startTime: startEntry.value as number | null,
        stopTime: stopEntry.value as number | null,
        status: (statusEntry.value as string || "cleared") as "running" | "stopped" | "cleared"
      };

      return new Response(JSON.stringify(state), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Failed to get timer state:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
}; 