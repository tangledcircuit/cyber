import { Head } from "$fresh/runtime.ts";
import { Handlers } from "$fresh/server.ts";
import { kindeClient } from "../../utils/kinde.ts";
import { createSessionManager } from "../../utils/session.ts";

export const handler: Handlers = {
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
    return ctx.render({ user });
  },
};

export default function DashboardPage({ data }: { data: { user: any } }) {
  const { user } = data;
  
  return (
    <>
      <Head>
        <title>Dashboard - Cyber</title>
      </Head>
      <div class="min-h-screen bg-base-200">
        <div class="navbar bg-base-100">
          <div class="flex-1">
            <a class="btn btn-ghost text-xl">Cyber</a>
          </div>
          <div class="flex-none gap-2">
            <div class="dropdown dropdown-end">
              <div tabIndex={0} role="button" class="btn btn-ghost btn-circle avatar">
                <span class="material-icons">account_circle</span>
              </div>
              <ul tabIndex={0} class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                <li>
                  <a href="/api/logout">
                    <span class="material-icons">logout</span>
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="p-4">
          <div class="text-sm breadcrumbs">
            <ul>
              <li>
                <span class="material-icons">home</span>
                Dashboard
              </li>
            </ul>
          </div>

          <div class="mt-6">
            <h1 class="text-2xl font-bold">Welcome, {user?.given_name || "User"}!</h1>
          </div>
        </div>
      </div>
    </>
  );
} 