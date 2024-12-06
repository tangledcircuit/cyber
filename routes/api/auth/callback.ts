import { Handlers } from "$fresh/server.ts";
import { kindeClient } from "../../../utils/kinde.ts";
import { createSessionManager, createSession, COOKIE_NAME, SESSION_LENGTH, EXTENDED_SESSION } from "../../../utils/session.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const sessionManager = createSessionManager();
    const rememberMe = url.searchParams.get("remember") === "true";
    
    await kindeClient.handleRedirectToApp(sessionManager, url);
    const user = await kindeClient.getUser(sessionManager);
    
    if (!user?.id || !user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Create session and set cookie
    const sessionId = await createSession(user.id, user.email, rememberMe);
    const cookieOptions = [
      `${COOKIE_NAME}=${sessionId}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      rememberMe ? `Max-Age=${EXTENDED_SESSION / 1000}` : `Max-Age=${SESSION_LENGTH / 1000}`,
    ];

    return new Response(null, {
      status: 302,
      headers: { 
        Location: "/dashboard",
        "Set-Cookie": cookieOptions.join("; "),
      },
    });
  },
}; 