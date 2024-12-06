import { Handlers } from "$fresh/server.ts";
import { kindeClient } from "../../../utils/kinde.ts";
import { createSessionManager } from "../../../utils/session.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const sessionManager = createSessionManager();
    await kindeClient.handleRedirectToApp(sessionManager, url);
    
    return new Response(null, {
      status: 302,
      headers: { Location: "/dashboard" },
    });
  },
}; 