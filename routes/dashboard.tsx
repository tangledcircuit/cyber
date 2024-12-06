import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { kindeClient } from "../utils/kinde.ts";

interface DashboardProps {
  user: {
    id: string;
    given_name?: string;
    family_name?: string;
    email: string;
  };
}

export const handler: Handlers<DashboardProps> = {
  async GET(_req, ctx) {
    try {
      const user = await kindeClient.getUser();
      return ctx.render({ user });
    } catch (error) {
      console.error("Failed to get user profile:", error);
      return new Response(null, {
        status: 302,
        headers: { Location: "/login" },
      });
    }
  },
};

export default function Dashboard({ data }: PageProps<DashboardProps>) {
  const { user } = data;
  const displayName = user.given_name || user.email.split("@")[0];

  return (
    <>
      <Head>
        <title>Dashboard - Cyber Clock</title>
      </Head>
      <div class="min-h-screen bg-gray-900 text-white">
        <nav class="bg-gray-800 p-4">
          <div class="container mx-auto flex justify-between items-center">
            <h1 class="text-2xl font-bold">Cyber Clock</h1>
            <div class="flex items-center space-x-4">
              <span class="text-gray-300">Welcome, {displayName}</span>
              <a href="/api/logout" class="text-indigo-400 hover:text-indigo-300">Logout</a>
            </div>
          </div>
        </nav>

        <main class="container mx-auto px-4 py-8">
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div class="bg-gray-800 p-6 rounded-lg">
              <h2 class="text-xl font-bold mb-4">Current Session</h2>
              <div class="text-3xl font-bold text-indigo-400">00:00:00</div>
              <p class="text-gray-300 mt-2">Active Time Today</p>
            </div>

            <div class="bg-gray-800 p-6 rounded-lg">
              <h2 class="text-xl font-bold mb-4">Earnings</h2>
              <div class="text-3xl font-bold text-green-400">$0.00</div>
              <p class="text-gray-300 mt-2">Today's Earnings</p>
            </div>

            <div class="bg-gray-800 p-6 rounded-lg">
              <h2 class="text-xl font-bold mb-4">Team Status</h2>
              <div class="text-3xl font-bold text-blue-400">0</div>
              <p class="text-gray-300 mt-2">Team Members Online</p>
            </div>
          </div>

          <div class="mt-8 grid gap-6 md:grid-cols-2">
            <div class="bg-gray-800 p-6 rounded-lg">
              <h2 class="text-xl font-bold mb-4">Account Details</h2>
              <div class="space-y-2">
                <p class="text-gray-300">
                  <span class="font-semibold">Email:</span> {user.email}
                </p>
                <p class="text-gray-300">
                  <span class="font-semibold">User ID:</span> {user.id}
                </p>
                {user.given_name && (
                  <p class="text-gray-300">
                    <span class="font-semibold">Name:</span> {user.given_name} {user.family_name}
                  </p>
                )}
              </div>
            </div>

            <div class="bg-gray-800 p-6 rounded-lg">
              <h2 class="text-xl font-bold mb-4">Recent Activity</h2>
              <p class="text-gray-300">No recent activity to display.</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
} 