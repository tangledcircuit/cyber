import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(_req) {
    const logoutUrl = new URL(`https://${Deno.env.get("KINDE_BACKEND_DOMAIN")}/logout`);
    logoutUrl.searchParams.set("redirect", Deno.env.get("KINDE_BACKEND_POST_LOGOUT_REDIRECT_URI")!);

    return new Response(null, {
      status: 302,
      headers: { Location: logoutUrl.toString() },
    });
  },
}; 