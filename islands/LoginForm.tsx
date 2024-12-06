import { useState } from "preact/hooks";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/login");
      const { url } = await response.json();
      globalThis.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize login");
      setIsLoading(false);
    }
  };

  return (
    <div class="min-h-screen hero bg-base-200">
      <div class="hero-content flex-col w-full max-w-md">
        <div class="text-center">
          <h1 class="text-5xl font-bold text-primary">Cyber Clock</h1>
          <p class="py-6 text-base-content/60">Choose your login method</p>
        </div>

        <div class="card w-full bg-base-100 shadow-xl">
          <div class="card-body">
            {error && (
              <div class="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            <div class="space-y-6">
              <button
                onClick={handleLogin}
                disabled={isLoading}
                class="btn btn-primary w-full"
              >
                {isLoading ? (
                  <span class="loading loading-spinner loading-md mr-2" />
                ) : (
                  <span class="material-icons mr-2">email</span>
                )}
                Continue with Kinde
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 