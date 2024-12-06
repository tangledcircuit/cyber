import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(_req) {
    const authUrl = new URL(`https://${Deno.env.get("KINDE_BACKEND_DOMAIN")}/oauth2/auth`);
    authUrl.searchParams.set("client_id", Deno.env.get("KINDE_BACKEND_CLIENT_ID")!);
    authUrl.searchParams.set("redirect_uri", Deno.env.get("KINDE_BACKEND_REDIRECT_URI")!);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid profile email");

    return new Response(JSON.stringify({ url: authUrl.toString() }), {
      headers: { "Content-Type": "application/json" },
    });
  },
}; 