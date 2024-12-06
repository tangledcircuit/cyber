import { SessionManager } from "@kinde-oss/kinde-typescript-sdk";

interface Tokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
}

// Create a simple session manager that stores tokens in memory
export function createSessionManager(): SessionManager {
  let tokens: Tokens = {
    accessToken: "",
    refreshToken: "",
    idToken: "",
  };

  const sessionItems = new Map<string, string>();

  return {
    getAccessToken: () => Promise.resolve(tokens.accessToken),
    getRefreshToken: () => Promise.resolve(tokens.refreshToken),
    getIdToken: () => Promise.resolve(tokens.idToken),
    setTokens: (newTokens: Tokens) => {
      tokens = newTokens;
      return Promise.resolve();
    },
    getSessionItem: (key: string) => Promise.resolve(sessionItems.get(key) ?? null),
    setSessionItem: (key: string, value: string) => {
      sessionItems.set(key, value);
      return Promise.resolve();
    },
    removeSessionItem: (key: string) => {
      sessionItems.delete(key);
      return Promise.resolve();
    },
    destroySession: () => {
      tokens = { accessToken: "", refreshToken: "", idToken: "" };
      sessionItems.clear();
      return Promise.resolve();
    },
  } as unknown as SessionManager;
} 