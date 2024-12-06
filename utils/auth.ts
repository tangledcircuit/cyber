import { getCookies } from "$std/http/cookie.ts";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

// This would be replaced with actual DB validation in production
const MOCK_USER: User = {
  id: "1",
  email: "test@example.com",
  name: "Test User",
};

export function authenticate(email: string, password: string): Promise<User | null> {
  return Promise.resolve(
    email === MOCK_USER.email && password === "password" ? MOCK_USER : null
  );
}

export function createAuthToken(user: User): string {
  // TODO: Replace with proper JWT implementation
  return btoa(JSON.stringify(user));
}

export function validateAuthToken(token: string): User | null {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
}

export function getAuthFromRequest(req: Request): User | null {
  const cookies = getCookies(req.headers);
  const token = cookies.authToken;
  if (!token) return null;
  return validateAuthToken(token);
} 