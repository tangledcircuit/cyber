import { Handlers } from "$fresh/server.ts";
import { getBalance } from "../../../utils/balance.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    try {
      const kv = await Deno.openKv();
      const balance = await getBalance(kv, ctx.params.userId);
      
      return new Response(JSON.stringify({ balance }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Failed to get balance:", error);
      return new Response(JSON.stringify({ error: "Failed to get balance" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
}; 