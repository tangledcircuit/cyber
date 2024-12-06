import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { kindeClient } from "../utils/kinde.ts";

interface State {
  session: {
    isAuthenticated: boolean;
  };
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  // Public routes that don't require authentication
  const publicPaths = ["/", "/login", "/api/auth/login", "/api/auth/callback"];
  const url = new URL(req.url);
  
  if (publicPaths.includes(url.pathname)) {
    return await ctx.next();
  }

  // Check authentication
  const isAuthenticated = await kindeClient.isAuthenticated();

  if (!isAuthenticated) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/login" },
    });
  }

  ctx.state.session = { isAuthenticated };
  return await ctx.next();
} 