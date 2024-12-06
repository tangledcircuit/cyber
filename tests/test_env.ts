// Test environment configuration
export const testEnv = {
  // Backend Auth Configuration
  KINDE_BACKEND_DOMAIN: "test-backend.kinde.com",
  KINDE_BACKEND_CLIENT_ID: "test-backend-client-id",
  KINDE_BACKEND_CLIENT_SECRET: "test-backend-client-secret",
  KINDE_BACKEND_REDIRECT_URI: "http://localhost:8000/api/auth/callback",
  KINDE_BACKEND_POST_LOGOUT_REDIRECT_URI: "http://localhost:8000",
  KINDE_BACKEND_AUDIENCE: "https://test-backend.kinde.com/api",
  
  // Frontend Auth Configuration
  KINDE_FRONTEND_DOMAIN: "test-frontend.kinde.com",
  KINDE_FRONTEND_CLIENT_ID: "test-frontend-client-id",
  KINDE_FRONTEND_REDIRECT_URI: "http://localhost:8000/auth/callback",
  KINDE_FRONTEND_POST_LOGOUT_REDIRECT_URI: "http://localhost:8000",
  
  // Environment
  DENO_ENV: "test"
};

// Set up test environment
export function setupTestEnv() {
  for (const [key, value] of Object.entries(testEnv)) {
    Deno.env.set(key, value);
  }
}

// Clean up test environment
export function cleanupTestEnv() {
  for (const key of Object.keys(testEnv)) {
    Deno.env.delete(key);
  }
} 