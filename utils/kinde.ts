import { createKindeServerClient, GrantType } from "@kinde-oss/kinde-typescript-sdk";

export const kindeClient = createKindeServerClient(
  GrantType.PKCE,
  {
    authDomain: Deno.env.get("KINDE_AUTH_DOMAIN")!,
    clientId: Deno.env.get("KINDE_CLIENT_ID")!,
    redirectURL: Deno.env.get("KINDE_REDIRECT_URL")!,
    logoutRedirectURL: Deno.env.get("KINDE_LOGOUT_REDIRECT_URL")!,
  }
); 