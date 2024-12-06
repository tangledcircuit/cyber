import { useState } from "preact/hooks";

export default function LoginButton() {
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
    <>
      {error && (
        <div class="alert alert-error">
          <span>{error}</span>
        </div>
      )}
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
    </>
  );
} 