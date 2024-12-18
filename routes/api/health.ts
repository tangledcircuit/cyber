export async function handler(_req: Request): Promise<Response> {
  try {
    const kv = await Deno.openKv();
    // Try a simple operation
    await kv.get(["health_check"]);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Health check failed:", error);
    return new Response("KV connection error", { status: 503 });
  }
} 