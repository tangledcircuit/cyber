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
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </Head>
      <div class="min-h-screen hero bg-base-200">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-5xl font-bold text-primary flex items-center justify-center gap-4">
              <span class="material-icons text-5xl">schedule</span>
              Cyber Clock
            </h1>
            <p class="py-6 text-base-content/60">
              Modern time management for the digital age. Track your time, boost productivity, and achieve more.
            </p>
            <a href="/login" class="btn btn-primary">
              <span class="material-icons mr-2">login</span>
              Get Started
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
