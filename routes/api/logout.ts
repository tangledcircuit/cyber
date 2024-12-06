import { Handlers } from "$fresh/server.ts";
import { deleteCookie, getCookies } from "$std/http/cookie.ts";
import { getLogoutUrl } from "../../utils/kinde.ts";

// Initialize KV store
const kv = await Deno.openKv();

export const handler: Handlers = {
  async GET(req) {
    const cookies = getCookies(req.headers);
    const sessionId = cookies.session_id;

    if (sessionId) {
      // Delete session from KV store
      await kv.delete(["user_sessions", sessionId]);
    }

    const headers = new Headers({ 
      "Location": getLogoutUrl()
    });
    
    // Clear the session cookie
    deleteCookie(headers, "session_id", { path: "/" });
    
    return new Response(null, {
      status: 302,
      headers,
    });
  },
}; 