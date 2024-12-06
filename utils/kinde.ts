import { createKindeServerClient, GrantType } from "@kinde-oss/kinde-typescript-sdk";

export const kindeClient = createKindeServerClient(
  GrantType.AUTHORIZATION_CODE,
  {
    authDomain: `https://${Deno.env.get("KINDE_BACKEND_DOMAIN")}`,
    clientId: Deno.env.get("KINDE_BACKEND_CLIENT_ID")!,
    clientSecret: Deno.env.get("KINDE_BACKEND_CLIENT_SECRET")!,
    redirectURL: Deno.env.get("KINDE_BACKEND_REDIRECT_URI")!,
    logoutRedirectURL: Deno.env.get("KINDE_BACKEND_POST_LOGOUT_REDIRECT_URI")!,
  }
); 