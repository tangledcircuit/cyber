import { assertEquals } from "std/assert";
import { type FreshContext } from "$fresh/server.ts";
import { setupTestEnv, cleanupTestEnv } from "./test_env.ts";

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
  name: "Frontend Pages Tests",
  fn: async (t) => {
    // Set up test environment before tests
    setupTestEnv();

    await t.step("Home page loads with styling", async () => {
      const { handler } = await import("../routes/index.tsx");
      const req = new Request("http://localhost:8000/");
      const ctx = createContext();

      const response = await handler!.GET!(req, ctx);
      assertEquals(response.status, 200);

      const text = await response.text();
      // Check for DaisyUI and Tailwind classes
      assertEquals(text.includes("hero"), true, "Should include DaisyUI hero class");
      assertEquals(text.includes("bg-base-200"), true, "Should include Tailwind background class");
    });

    await t.step("Login page loads with styling", async () => {
      const { handler } = await import("../routes/login.tsx");
      const req = new Request("http://localhost:8000/login");
      const ctx = createContext();

      const response = await handler!.GET!(req, ctx);
      assertEquals(response.status, 200);

      const text = await response.text();
      // Check for DaisyUI and Tailwind classes
      assertEquals(text.includes("card"), true, "Should include DaisyUI card class");
      assertEquals(text.includes("btn-primary"), true, "Should include DaisyUI button class");
    });

    await t.step("Register page loads with styling", async () => {
      const { handler } = await import("../routes/register.tsx");
      const req = new Request("http://localhost:8000/register");
      const ctx = createContext();

      const response = await handler!.GET!(req, ctx);
      assertEquals(response.status, 200);

      const text = await response.text();
      // Check for DaisyUI and Tailwind classes
      assertEquals(text.includes("card"), true, "Should include DaisyUI card class");
      assertEquals(text.includes("btn-primary"), true, "Should include DaisyUI button class");
    });

    // Clean up test environment after tests
    cleanupTestEnv();
  },
}); 