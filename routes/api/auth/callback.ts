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
  async GET(req) {
    const url = new URL(req.url);
    const sessionManager = await kindeClient.createSessionManager();
    await kindeClient.handleRedirectToApp(sessionManager, url);
    
    // Redirect to dashboard after successful auth
    return new Response(null, {
      status: 302,
      headers: { Location: "/dashboard" },
    });
  },
}; 