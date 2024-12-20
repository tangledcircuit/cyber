import { HandlerContext } from "$fresh/server.ts";
import { getUserTokens } from "../../../utils/kv.ts";

export const handler = (_req: Request, ctx: HandlerContext): Promise<Response> => {
  try {
    const userId = ctx.params.userId;
    if (!userId) {
      return Promise.resolve(new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }));
    }

    // Set up SSE headers
    const headers = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });

    // Create a readable stream
    const stream = new ReadableStream({
      start: async (controller) => {
        // Send initial token balance
        const tokens = await getUserTokens(userId);
        const data = JSON.stringify({
          type: "token-update",
          balance: tokens
        });
        controller.enqueue(`data: ${data}\n\n`);

        // Keep connection alive with a heartbeat
        const heartbeat = setInterval(() => {
          controller.enqueue(": heartbeat\n\n");
        }, 30000);

        // Clean up on close
        return () => {
          clearInterval(heartbeat);
        };
      }
    });

    return Promise.resolve(new Response(stream, { headers }));
  } catch (error) {
    console.error("Token balance endpoint error:", error);
    return Promise.resolve(new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    }));
  }
}; 