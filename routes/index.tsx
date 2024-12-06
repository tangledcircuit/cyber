import { Head } from "$fresh/runtime.ts";
import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(_req, ctx) {
    return ctx.render();
  },
};

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Cyber Clock - Time Management</title>
      </Head>
      <div class="min-h-screen bg-gray-100">
        <div class="flex flex-col items-center justify-center h-full text-center">
          <div class="max-w-md p-8">
            <h1 class="text-5xl font-bold text-blue-600 flex items-center justify-center gap-4">
              <span class="material-icons text-5xl">schedule</span>
              Cyber Clock
            </h1>
            <p class="py-6 text-gray-600">
              Modern time management for the digital age. Track your time, boost productivity, and achieve more.
            </p>
            <a href="/login" class="inline-flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              <span class="material-icons mr-2">login</span>
              Get Started
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
