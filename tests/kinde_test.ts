import { assertEquals, assertExists } from "$std/assert/mod.ts";
import { kindeClient } from "../utils/kinde.ts";
import { createSessionManager } from "../utils/session.ts";
import { setupTestEnv, cleanupTestEnv } from "./test_env.ts";

Deno.test({
  name: "Kinde Client Tests",
  fn: async (t) => {
    // Set up test environment before tests
    setupTestEnv();

    await t.step("Kinde client initialization", () => {
      assertExists(kindeClient, "Kinde client should be initialized");
    });

    await t.step("Kinde client has required methods", () => {
      assertEquals(typeof kindeClient.handleRedirectToApp, "function", "Should have handleRedirectToApp method");
      assertEquals(typeof kindeClient.isAuthenticated, "function", "Should have isAuthenticated method");
      assertEquals(typeof kindeClient.getUser, "function", "Should have getUser method");
      assertEquals(typeof kindeClient.getFlag, "function", "Should have getFlag method");
    });

    await t.step("Kinde client auth flow", async () => {
      const sessionManager = createSessionManager();
      assertExists(sessionManager, "Should create session manager");

      // Test unauthenticated state
      const isAuthenticated = await kindeClient.isAuthenticated(sessionManager);
      assertEquals(isAuthenticated, false, "Should not be authenticated initially");

      try {
        // Test user data when not authenticated
        const user = await kindeClient.getUser(sessionManager);
        assertEquals(user, null, "User should be null when not authenticated");
      } catch (err) {
        const error = err as { message: string };
        assertEquals(
          error.message,
          "Cannot get user details, no authentication credential found",
          "Should throw expected error when not authenticated"
        );
      }
    });

    // Clean up test environment after tests
    cleanupTestEnv();
  },
}); 