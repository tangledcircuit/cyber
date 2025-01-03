import { Head } from "$fresh/runtime.ts";
import { Handlers } from "$fresh/server.ts";
import { kindeClient } from "../../utils/kinde.ts";
import { createSessionManager } from "../../utils/session.ts";
import { getUserTokens } from "../../utils/stripe.ts";
import Header from "../../islands/Header.tsx";
import Dashboard from "../../islands/Dashboard.tsx";

interface DashboardData {
  user: {
    id: string;
    given_name?: string;
    email?: string;
  };
  tokens: number;
  isDevelopment: boolean;
}

export const handler: Handlers<DashboardData> = {
  async GET(_req, ctx) {
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

    const tokens = await getUserTokens(user.id);
    const isDevelopment = Deno.env.get("DENO_ENV") !== "production";

    return ctx.render({ user, tokens, isDevelopment });
  },
};

export default function DashboardPage({ data }: { data: DashboardData }) {
  return (
    <>
      <Head>
        <title>Dashboard - Cyber</title>
      </Head>
      <div class="min-h-screen bg-base-200">
        <Header user={data.user} tokens={data.tokens} isDevelopment={data.isDevelopment} />
        <Dashboard user={data.user} />
      </div>
    </>
  );
} 