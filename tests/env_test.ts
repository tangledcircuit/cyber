import { assertEquals, assertExists } from "std/assert";
import { setupTestEnv, cleanupTestEnv } from "./test_env.ts";

const requiredEnvVars = [
  // Backend Auth Configuration
  "KINDE_BACKEND_DOMAIN",
  "KINDE_BACKEND_CLIENT_ID",
  "KINDE_BACKEND_CLIENT_SECRET",
  "KINDE_BACKEND_REDIRECT_URI",
  "KINDE_BACKEND_POST_LOGOUT_REDIRECT_URI",
  "KINDE_BACKEND_AUDIENCE",
  
  // Frontend Auth Configuration
  "KINDE_FRONTEND_DOMAIN",
  "KINDE_FRONTEND_CLIENT_ID",
  "KINDE_FRONTEND_REDIRECT_URI",
  "KINDE_FRONTEND_POST_LOGOUT_REDIRECT_URI",
  
  // Environment
  "DENO_ENV"
];

Deno.test({
  name: "Environment Variables Tests",
  fn: async (t) => {
    // Set up test environment before tests
    setupTestEnv();

    await t.step("Required environment variables are set", () => {
      for (const envVar of requiredEnvVars) {
        const value = Deno.env.get(envVar);
        assertExists(value, `${envVar} should be set`);
        assertEquals(typeof value, "string", `${envVar} should be a string`);
        assertEquals(value.length > 0, true, `${envVar} should not be empty`);
      }
    });

    await t.step("Auth domains format is valid", () => {
      const backendDomain = Deno.env.get("KINDE_BACKEND_DOMAIN")!;
      const frontendDomain = Deno.env.get("KINDE_FRONTEND_DOMAIN")!;
      
      assertEquals(
        backendDomain.includes(".kinde.com"), 
        true, 
        "Backend auth domain should be a Kinde domain"
      );
      
      assertEquals(
        frontendDomain.includes(".kinde.com"), 
        true, 
        "Frontend auth domain should be a Kinde domain"
      );
    });

    await t.step("Redirect URLs are valid", () => {
      const backendRedirectUrl = Deno.env.get("KINDE_BACKEND_REDIRECT_URI")!;
      const backendLogoutRedirectUrl = Deno.env.get("KINDE_BACKEND_POST_LOGOUT_REDIRECT_URI")!;
      const frontendRedirectUrl = Deno.env.get("KINDE_FRONTEND_REDIRECT_URI")!;
      const frontendLogoutRedirectUrl = Deno.env.get("KINDE_FRONTEND_POST_LOGOUT_REDIRECT_URI")!;

      // Test backend redirect URLs
      assertEquals(
        backendRedirectUrl.startsWith("http"), 
        true, 
        "Backend redirect URL should start with http/https"
      );
      assertEquals(
        backendRedirectUrl.includes("/api/auth/callback"), 
        true, 
        "Backend redirect URL should point to callback endpoint"
      );
      assertEquals(
        backendLogoutRedirectUrl.startsWith("http"), 
        true, 
        "Backend logout redirect URL should start with http/https"
      );

      // Test frontend redirect URLs
      assertEquals(
        frontendRedirectUrl.startsWith("http"), 
        true, 
        "Frontend redirect URL should start with http/https"
      );
      assertEquals(
        frontendRedirectUrl.includes("/auth/callback"), 
        true, 
        "Frontend redirect URL should point to callback endpoint"
      );
      assertEquals(
        frontendLogoutRedirectUrl.startsWith("http"), 
        true, 
        "Frontend logout redirect URL should start with http/https"
      );
    });

    // Clean up test environment after tests
    cleanupTestEnv();
  },
}); 