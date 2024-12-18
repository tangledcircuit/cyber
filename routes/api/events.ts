import { HandlerContext } from "$fresh/server.ts";
import { subscribe, type EventData } from "../../utils/kv.ts";

interface HeartbeatData {
  timestamp: number;
  type: "heartbeat";
  status: "ok";
}

function formatSSEMessage(event: string, data: unknown): string {
  return [
    `event: ${event}`,
    `data: ${JSON.stringify(data)}`,
    "",
    ""
  ].join("\n");
}

export function handler(
  req: Request,
  ctx: HandlerContext
): Response {
  const userId = ctx.state.userId;
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      function sendHeartbeat() {
        const heartbeat: HeartbeatData = {
          timestamp: Date.now(),
          type: "heartbeat",
          status: "ok"
        };
        controller.enqueue(formatSSEMessage("heartbeat", heartbeat));
      }

      // Send initial heartbeat
      sendHeartbeat();

      // Subscribe to events
      const unsubscribe = subscribe(userId, (event: EventData) => {
        controller.enqueue(formatSSEMessage(event.type, event.data));
      });

      // Heartbeat interval
      const heartbeatInterval = setInterval(sendHeartbeat, 30000);

      // Cleanup on close
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        unsubscribe();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
} 