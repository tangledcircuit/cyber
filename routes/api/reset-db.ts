import { HandlerContext } from "$fresh/server.ts";
import { resetUserData } from "../../utils/kv.ts";

export async function handler(
  req: Request,
  _ctx: HandlerContext
): Promise<Response> {
  // Only allow in development
  if (Deno.env.get("DENO_ENV") === "production") {
    return new Response("Not allowed in production", { status: 403 });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { userId } = await req.json();
    if (!userId) {
      return new Response("Missing userId", { status: 400 });
    }

    await resetUserData(userId);
    return new Response("OK");
  } catch (error) {
    console.error("Failed to reset database:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
} 