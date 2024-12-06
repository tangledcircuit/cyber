import { SessionManager } from "@kinde-oss/kinde-typescript-sdk";
import { crypto } from "$std/crypto/mod.ts";

interface Tokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
}

interface Session {
  userId: string;
  email: string;
  expiresAt: number;
  rememberMe: boolean;
}

const kv = await Deno.openKv();

// Cookie options
export const COOKIE_NAME = "cyber_session";
export const SESSION_LENGTH = 24 * 60 * 60 * 1000; // 24 hours
export const EXTENDED_SESSION = 14 * 24 * 60 * 60 * 1000; // 14 days

export async function createSession(userId: string, email: string, rememberMe = false): Promise<string> {
  const sessionId = crypto.randomUUID();
  const session: Session = {
    userId,
    email,
    expiresAt: Date.now() + (rememberMe ? EXTENDED_SESSION : SESSION_LENGTH),
    rememberMe,
  };

  await kv.set(["sessions", sessionId], session, { 
    expireIn: rememberMe ? EXTENDED_SESSION : SESSION_LENGTH 
  });

  return sessionId;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const result = await kv.get<Session>(["sessions", sessionId]);
  if (!result.value) return null;
  
  // Check if session is expired
  if (result.value.expiresAt < Date.now()) {
    await kv.delete(["sessions", sessionId]);
    return null;
  }

  return result.value;
}

export async function deleteSession(sessionId: string) {
  await kv.delete(["sessions", sessionId]);
}

// Create a session manager that uses KV for persistence
export function createSessionManager(): SessionManager {
  return {
    getAccessToken: async () => {
      const result = await kv.get<Tokens>(["auth_tokens"]);
      return result.value?.accessToken ?? "";
    },
    getRefreshToken: async () => {
      const result = await kv.get<Tokens>(["auth_tokens"]);
      return result.value?.refreshToken ?? "";
    },
    getIdToken: async () => {
      const result = await kv.get<Tokens>(["auth_tokens"]);
      return result.value?.idToken ?? "";
    },
    setTokens: async (newTokens: Tokens) => {
      await kv.atomic()
        .set(["auth_tokens"], newTokens)
        .commit();
    },
    getSessionItem: async (key: string) => {
      const result = await kv.get<string>(["session_items", key]);
      return result.value ?? null;
    },
    setSessionItem: async (key: string, value: string) => {
      await kv.atomic()
        .set(["session_items", key], value, { expireIn: 600000 }) // 10 minutes
        .commit();
    },
    removeSessionItem: async (key: string) => {
      await kv.atomic()
        .delete(["session_items", key])
        .commit();
    },
    destroySession: async () => {
      const atomic = kv.atomic();
      atomic.delete(["auth_tokens"]);
      
      // Get all session items and delete them
      const sessionItems = kv.list({ prefix: ["session_items"] });
      for await (const item of sessionItems) {
        atomic.delete(item.key);
      }
      
      await atomic.commit();
    },
  } as unknown as SessionManager;
} 