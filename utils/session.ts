import { SessionManager } from "@kinde-oss/kinde-typescript-sdk";

interface Tokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
}

const kv = await Deno.openKv();

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