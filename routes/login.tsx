import { Head } from "$fresh/runtime.ts";
import { Handlers } from "$fresh/server.ts";
import LoginButton from "../islands/LoginButton.tsx";

export const handler: Handlers = {
  GET(_req, ctx) {
    return ctx.render();
  },
};

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login - Cyber Clock</title>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </Head>
      <div class="min-h-screen hero bg-base-200">
        <div class="hero-content flex-col w-full max-w-md">
          <div class="text-center">
            <h1 class="text-5xl font-bold text-primary">Login</h1>
            <p class="py-6 text-base-content/60">Sign in to your account</p>
          </div>

          <div class="card w-full bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-6">
                <LoginButton />

                <div class="divider">OR</div>

                <div class="text-center">
                  <a href="/register" class="link link-primary">
                    Create an account
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 