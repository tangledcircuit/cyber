import { assertEquals } from "$std/assert/mod.ts";
import { createHandler } from "$fresh/server.ts";
import manifest from "../fresh.gen.ts";
import { setupTestEnv, cleanupTestEnv } from "./test_env.ts";

Deno.test({
  name: "Frontend Pages Tests",
  fn: async (t) => {
    // Set up test environment before tests
    setupTestEnv();

    const handler = await createHandler(manifest);

    await t.step("Home page loads", async () => {
      const req = new Request("http://localhost:8000/");
      const resp = await handler(req);
      assertEquals(resp.status, 200);
    });

    await t.step("Login page loads", async () => {
      const req = new Request("http://localhost:8000/login");
      const resp = await handler(req);
      assertEquals(resp.status, 200);
    });

    await t.step("Register page loads", async () => {
      const req = new Request("http://localhost:8000/register");
      const resp = await handler(req);
      assertEquals(resp.status, 200);
    });

    // Clean up test environment after tests
    cleanupTestEnv();
  },
}); 