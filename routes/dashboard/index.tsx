import { Head } from "$fresh/runtime.ts";
import { Handlers } from "$fresh/server.ts";
import { kindeClient } from "../../utils/kinde.ts";
import { createSessionManager } from "../../utils/session.ts";
import { getUserTokens } from "../../utils/stripe.ts";
import Header from "../../islands/Header.tsx";

const kv = await Deno.openKv();

interface User {
  id: string;
  given_name?: string;
  email?: string;
}

interface DashboardData {
  user: User;
  tokens: number;
  paymentStatus?: "success" | "cancelled";
}

export const handler: Handlers<DashboardData> = {
  async GET(req, ctx) {
    const sessionManager = createSessionManager();
    const isAuthenticated = await kindeClient.isAuthenticated(sessionManager);
    
    if (!isAuthenticated) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/login" },
      });
    }

    const user = await kindeClient.getUser(sessionManager);
    if (!user?.id) {
      return new Response("User not found", { status: 404 });
    }

    const tokens = await getUserTokens(kv, user.id);
    const url = new URL(req.url);
    const paymentStatus = url.searchParams.get("payment") as "success" | "cancelled" | undefined;

    return ctx.render({ user, tokens, paymentStatus });
  },
};

export default function DashboardPage({ data }: { data: DashboardData }) {
  const { user, tokens, paymentStatus } = data;
  
  return (
    <>
      <Head>
        <title>Dashboard - Cyber</title>
      </Head>
      <div class="min-h-screen bg-base-200">
        <Header user={user} tokens={tokens} />

        <div class="p-4">
          <div class="text-sm breadcrumbs">
            <ul>
              <li>
                <span class="material-icons">home</span>
                Dashboard
              </li>
            </ul>
          </div>

          {paymentStatus === "success" && (
            <div class="alert alert-success mb-4">
              <span class="material-icons">check_circle</span>
              Payment successful! Your tokens have been added.
            </div>
          )}

          {paymentStatus === "cancelled" && (
            <div class="alert alert-warning mb-4">
              <span class="material-icons">warning</span>
              Payment cancelled. No tokens were purchased.
            </div>
          )}

          <div class="mt-6">
            <h1 class="text-2xl font-bold">Welcome, {user?.given_name || "User"}!</h1>
            
            <div class="stats shadow mt-4">
              <div class="stat">
                <div class="stat-title">Your Tokens</div>
                <div class="stat-value">{tokens}</div>
                <div class="stat-desc">Available to use</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 