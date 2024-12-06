import { Handlers } from "$fresh/server.ts";
import { kindeClient } from "../../../utils/kinde.ts";
import { createSessionManager } from "../../../utils/session.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const rememberMe = url.searchParams.get("remember") === "true";
    const sessionManager = createSessionManager();
    const loginUrl = await kindeClient.login(sessionManager);
    
    // Add remember me parameter to callback URL
    const finalUrl = new URL(loginUrl.toString());
    finalUrl.searchParams.set("remember", rememberMe.toString());
    
    return new Response(null, {
      status: 302,
      headers: { 
        Location: finalUrl.toString(),
        "Cache-Control": "no-store, max-age=0",
      },
    });
  },
}; 