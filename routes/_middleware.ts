import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
import { getUserSession } from "../utils/kinde.ts";

interface State {
  session: {
    userId: string;
    accessToken: string;
  } | null;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  ctx.state.session = null;
  
  const cookies = getCookies(req.headers);
  const sessionId = cookies.session_id;
  
  // Public routes that don't require authentication
  const publicPaths = ["/", "/login", "/callback", "/api/login"];
  const url = new URL(req.url);
  
  if (!sessionId) {
    if (!publicPaths.includes(url.pathname)) {
      return new Response("", {
        status: 302,
        headers: { Location: "/login" },
      });
    }
    return await ctx.next();
  }

  // Get session from KV store
  const session = await getUserSession(sessionId);
  if (!session || session.expiresAt < Date.now()) {
    if (!publicPaths.includes(url.pathname)) {
      return new Response("", {
        status: 302,
        headers: { Location: "/login" },
      });
    }
    return await ctx.next();
  }

  // Set session in state
  ctx.state.session = {
    userId: session.userId,
    accessToken: session.accessToken,
  };

  return await ctx.next();
} 