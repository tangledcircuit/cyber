import { config } from "./config.ts";
import { KindeWeb } from "@kinde-oss/kinde-typescript-sdk";
import { AuthConnection, AUTH_CONNECTIONS } from "../types/connections.ts";

// Initialize Kinde SDK for frontend
export const kindeClient = new KindeWeb({
  domain: config.frontendAuth.domain,
  clientId: config.frontendAuth.clientId,
  redirectUri: config.frontendAuth.redirectUri,
  logoutRedirectUri: config.frontendAuth.postLogoutRedirectUri,
});

export async function handleSocialLogin(connection: AuthConnection) {
  const authUrl = await kindeClient.login({
    connectionId: AUTH_CONNECTIONS[connection].id,
  });
  return authUrl;
}

export async function handlePasswordlessLogin(
  identifier: string,
  connection: AuthConnection.EMAIL_CODE | AuthConnection.USERNAME_CODE,
) {
  const authUrl = await kindeClient.login({
    connectionId: AUTH_CONNECTIONS[connection].id,
    identifier,
  });
  return authUrl;
}

export async function handleFrontendLogout() {
  const logoutUrl = await kindeClient.logout();
  return logoutUrl;
}

export async function handleFrontendCallback(code: string) {
  const tokens = await kindeClient.getToken(code);
  return tokens;
}

export async function getFrontendUserProfile() {
  const user = await kindeClient.getUserDetails();
  return user;
}

// Helper function to get available auth methods
export function getAuthMethods() {
  return Object.values(AUTH_CONNECTIONS);
} 