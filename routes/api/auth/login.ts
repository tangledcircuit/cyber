import { Handlers } from "$fresh/server.ts";
import { kindeClient } from "../../../utils/kinde.ts";
import { createSessionManager } from "../../../utils/session.ts";

export const handler: Handlers = {
  async GET(_req) {
    const sessionManager = createSessionManager();
    const loginUrl = await kindeClient.login(sessionManager);
    
    return new Response(null, {
      status: 302,
      headers: { 
        Location: loginUrl.toString(),
        "Cache-Control": "no-store, max-age=0",
      },
    });
  },
}; 