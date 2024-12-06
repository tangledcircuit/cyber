import { assertEquals } from "$std/assert/mod.ts";
import { type FreshContext } from "$fresh/server.ts";
import { setupTestEnv, cleanupTestEnv, testEnv } from "./test_env.ts";

// Mock the handler context
const createContext = () => ({
  state: {},
  render: (data: unknown) => new Response(JSON.stringify(data)),
  next: () => Promise.resolve(new Response()),
  remoteAddr: { hostname: "127.0.0.1", port: 8000, transport: "tcp" as const },
  url: new URL("http://localhost:8000"),
  basePath: "",
  route: "/",
  pattern: "/",
  params: {},
  data: {},
  renderNotFound: () => Promise.resolve(new Response("Not Found", { status: 404 })),
  renderError: () => Promise.resolve(new Response("Error", { status: 500 })),
}) as unknown as FreshContext;

Deno.test({
  name: "Auth Routes Tests",
  fn: async (t) => {
    // Set up test environment before tests
    setupTestEnv();

    await t.step("Backend login route redirects to Kinde auth", async () => {
      const { handler } = await import("../routes/api/auth/login.ts");
      const req = new Request("http://localhost:8000/api/auth/login");
      const ctx = createContext();

      const response = await handler!.GET!(req, ctx);
      assertEquals(response.status, 200);

      const data = await response.json();
      assertEquals(typeof data.url, "string");
      assertEquals(data.url.startsWith("https://"), true);
      assertEquals(data.url.includes(testEnv.KINDE_BACKEND_DOMAIN), true);
    });

    await t.step("Backend callback route handles auth redirect", async () => {
      const { handler } = await import("../routes/api/auth/callback.ts");
      const req = new Request(
        "http://localhost:8000/api/auth/callback?code=test-code&state=test-state"
      );
      const ctx = createContext();

      try {
        await handler!.GET!(req, ctx);
      } catch (err) {
        const error = err as { message: string };
        assertEquals(
          error.message,
          "Stored state not found",
          "Should throw expected error when state is missing"
        );
      }
    });

    await t.step("Backend logout route redirects to Kinde logout", async () => {
      const { handler } = await import("../routes/api/logout.ts");
      const req = new Request("http://localhost:8000/api/logout");
      const ctx = createContext();

      const response = await handler!.GET!(req, ctx);
      assertEquals(response.status, 302);
      const location = response.headers.get("Location");
      assertEquals(location?.startsWith("https://"), true);
      assertEquals(location?.includes(testEnv.KINDE_BACKEND_DOMAIN), true);
      assertEquals(location?.includes("/logout"), true);
    });

    // Clean up test environment after tests
    cleanupTestEnv();
  },
}); 