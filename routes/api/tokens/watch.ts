import { Handlers } from "$fresh/server.ts";
import { decrementUserTokens, getUserTokens } from "../../../utils/stripe.ts";

export const handler: Handlers = {
  async GET(req, _ctx) {
    console.log("SSE: Connection attempt from client");
    
    // Get user ID from query params
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      console.error("SSE: Missing userId in request");
      return new Response("Missing userId", { status: 400 });
    }

    console.log(`SSE: Setting up connection for user ${userId}`);
    
    // Set up SSE
    const bc = globalThis.BroadcastChannel ? 
      new BroadcastChannel("token-updates") : 
      { postMessage: () => {}, close: () => {}, onmessage: null };
      
    // Create SSE stream
    const stream = new ReadableStream({
      start: async (controller) => {
        console.log("SSE: Stream started");
        
        // Send initial token count
        const tokens = await getUserTokens(userId);
        console.log(`SSE: Initial tokens for user ${userId}: ${tokens}`);
        controller.enqueue(`data: ${tokens}\n\n`);

        // Set up token decrementer
        console.log("SSE: Setting up token decrementer");
        const interval = setInterval(async () => {
          const success = await decrementUserTokens(userId);
          if (!success) {
            console.log("SSE: No more tokens, stopping decrementer");
            clearInterval(interval);
          }
        }, 1000);

        // Listen for token updates
        console.log("SSE: Setting up broadcast listener");
        bc.onmessage = (event) => {
          if (event.data.type === "token-update" && event.data.userId === userId) {
            console.log(`SSE: Broadcasting token update: ${event.data.tokens}`);
            controller.enqueue(`data: ${event.data.tokens}\n\n`);
          }
        };

        // Clean up on close
        console.log("SSE: Setting up cleanup handlers");
        req.signal.addEventListener("abort", () => {
          console.log("SSE: Connection closed, cleaning up");
          clearInterval(interval);
          bc.close();
        });
      }
    });

    console.log("SSE: Sending response to client");
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }
}; 