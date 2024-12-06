/// <reference lib="deno.unstable" />

import { encodeBase64Url } from "$std/encoding/base64url.ts";
import { config } from "./config.ts";

const kv = await Deno.openKv();

export interface User {
  id: string;
  email: string;
  given_name?: string;
  family_name?: string;
}

export interface Session {
  userId: string;
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number;
}

export interface OAuthSession {
  state: string;
  codeVerifier: string;
  expiresAt: number;
}

export async function generatePKCE() {
  const verifier = crypto.randomUUID() + crypto.randomUUID();
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const challenge = encodeBase64Url(new Uint8Array(digest))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return { verifier, challenge };
}

export async function createOAuthSession(): Promise<OAuthSession> {
  const state = crypto.randomUUID();
  const { verifier } = await generatePKCE();
  
  const session: OAuthSession = {
    state,
    codeVerifier: verifier,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  };
  
  await kv.set(["oauth_sessions", state], session);
  return session;
}

export async function getOAuthSession(state: string): Promise<OAuthSession | null> {
  const result = await kv.get<OAuthSession>(["oauth_sessions", state]);
  if (!result.value) return null;
  
  await kv.delete(["oauth_sessions", state]);
  return result.value;
}

export function getAuthorizationUrl(state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.backendAuth.clientId,
    redirect_uri: config.backendAuth.redirectUri,
    scope: "openid profile email offline_access",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `https://${config.backendAuth.domain}/oauth2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string, codeVerifier: string) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.backendAuth.clientId,
    client_secret: config.backendAuth.clientSecret,
    code,
    redirect_uri: config.backendAuth.redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch(
    `https://${config.backendAuth.domain}/oauth2/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to exchange code for tokens");
  }

  return await response.json();
}

export async function getUserProfile(accessToken: string): Promise<User> {
  const response = await fetch(
    `https://${config.backendAuth.domain}/oauth2/v2/user_profile`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to get user profile");
  }

  return await response.json();
}

export async function createUserSession(
  userId: string,
  tokens: {
    accessToken: string;
    refreshToken: string;
    idToken: string;
    expiresIn: number;
  },
): Promise<Session> {
  const session: Session = {
    userId,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    idToken: tokens.idToken,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
  };
  
  await kv.set(["user_sessions", userId], session);
  return session;
}

export async function getUserSession(sessionId: string): Promise<Session | null> {
  const result = await kv.get<Session>(["user_sessions", sessionId]);
  return result.value;
}

export function getLogoutUrl(): string {
  return `https://${config.backendAuth.domain}/logout?post_logout_redirect_uri=${
    encodeURIComponent(config.backendAuth.postLogoutRedirectUri)
  }`;
} 