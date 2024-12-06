import { createKindeServerClient, GrantType } from "@kinde-oss/kinde-typescript-sdk";
import { Handlers } from "$fresh/server.ts";

const kindeClient = createKindeServerClient(
  GrantType.PKCE,
  {
    authDomain: Deno.env.get("KINDE_AUTH_DOMAIN")!,
    clientId: Deno.env.get("KINDE_CLIENT_ID")!,
    redirectURL: Deno.env.get("KINDE_REDIRECT_URL")!,
    logoutRedirectURL: Deno.env.get("KINDE_LOGOUT_REDIRECT_URL")!,
  }
);

export const handler: Handlers = {
  async GET(_req) {
    const sessionManager = await kindeClient.createSessionManager();
    const authUrl = await kindeClient.getAuthorizationURL(sessionManager);
    return new Response(JSON.stringify({ url: authUrl }), {
      headers: { "Content-Type": "application/json" },
    });
  },
}; 