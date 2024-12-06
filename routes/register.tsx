import { Head } from "$fresh/runtime.ts";
import { Handlers } from "$fresh/server.ts";
import RegisterButton from "../islands/RegisterButton.tsx";

export const handler: Handlers = {
  GET(_req, ctx) {
    return ctx.render();
  },
};

export default function RegisterPage() {
  return (
    <>
      <Head>
        <title>Register - Cyber Clock</title>
      </Head>
      <div class="min-h-screen hero bg-base-200">
        <div class="hero-content flex-col w-full max-w-md">
          <div class="text-center">
            <h1 class="text-5xl font-bold text-primary">Register</h1>
            <p class="py-6 text-base-content/60">Create your account</p>
          </div>

          <div class="card w-full bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="space-y-6">
                <RegisterButton />

                <div class="divider">OR</div>

                <div class="text-center">
                  <a href="/login" class="link link-primary">
                    Already have an account? Sign in
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