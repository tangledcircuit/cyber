import { load } from "$std/dotenv/mod.ts";
import { BackendAuth, FrontendAuth } from "../types/auth.ts";

// Load .env file in development
if (Deno.env.get("DENO_ENV") !== "production") {
  await load({ export: true });
}

export const backendAuth: BackendAuth = {
  domain: Deno.env.get("KINDE_BACKEND_DOMAIN") || "",
  clientId: Deno.env.get("KINDE_BACKEND_CLIENT_ID") || "",
  clientSecret: Deno.env.get("KINDE_BACKEND_CLIENT_SECRET") || "",
  redirectUri: Deno.env.get("KINDE_BACKEND_REDIRECT_URI") || "",
  postLogoutRedirectUri: Deno.env.get("KINDE_BACKEND_POST_LOGOUT_REDIRECT_URI") || "",
  audience: Deno.env.get("KINDE_BACKEND_AUDIENCE") || "",
};

export const frontendAuth: FrontendAuth = {
  domain: Deno.env.get("KINDE_FRONTEND_DOMAIN") || "",
  clientId: Deno.env.get("KINDE_FRONTEND_CLIENT_ID") || "",
  redirectUri: Deno.env.get("KINDE_FRONTEND_REDIRECT_URI") || "",
  postLogoutRedirectUri: Deno.env.get("KINDE_FRONTEND_POST_LOGOUT_REDIRECT_URI") || "",
};

// Validate required environment variables
const requiredBackendVars = [
  "KINDE_BACKEND_DOMAIN",
  "KINDE_BACKEND_CLIENT_ID",
  "KINDE_BACKEND_CLIENT_SECRET",
  "KINDE_BACKEND_REDIRECT_URI",
];

const requiredFrontendVars = [
  "KINDE_FRONTEND_DOMAIN",
  "KINDE_FRONTEND_CLIENT_ID",
  "KINDE_FRONTEND_REDIRECT_URI",
];

for (const envVar of [...requiredBackendVars, ...requiredFrontendVars]) {
  if (!Deno.env.get(envVar)) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  backendAuth,
  frontendAuth,
  isDevelopment: Deno.env.get("DENO_ENV") === "development",
}; 