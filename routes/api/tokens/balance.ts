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
      
      // Get current balance
      const balanceEntry = await kv.get(["balances", userId]);
      const balance = (balanceEntry.value as number) || 0;

      return new Response(JSON.stringify({ balance }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Failed to get balance:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
}; 