import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(req) {
    const url = new URL(req.url);
    const remember = url.searchParams.get("remember") === "true";
    
    return new Response(null, {
      status: 302,
      headers: { Location: `/api/auth/login?remember=${remember}` },
    });
  },
}; 