import { useState } from "preact/hooks";
import { AuthConnection } from "../types/connections.ts";
import { handleSocialLogin, handlePasswordlessLogin, getAuthMethods } from "../utils/frontend-auth.ts";
import { Chrome, Facebook, Apple, Twitter, Mail, User, Loader2 } from "lucide/dist/esm/icons";

export default function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const authMethods = getAuthMethods();

  const handleSocialAuth = async (connection: AuthConnection) => {
    try {
      setIsLoading(true);
      const authUrl = await handleSocialLogin(connection);
      globalThis.location.href = authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize login");
      setIsLoading(false);
    }
  };

  const handlePasswordlessAuth = async (e: Event, connection: AuthConnection.EMAIL_CODE | AuthConnection.USERNAME_CODE) => {
    e.preventDefault();
    if (!identifier) {
      setError("Please enter your email or username");
      return;
    }

    try {
      setIsLoading(true);
      const authUrl = await handlePasswordlessLogin(identifier, connection);
      globalThis.location.href = authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize login");
      setIsLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons = {
      Chrome,
      Facebook,
      Apple,
      Twitter,
      Mail,
      User,
    };
    return icons[iconName as keyof typeof icons];
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
              {/* Social Login Buttons */}
              <div class="grid grid-cols-2 gap-4">
                {authMethods
                  .filter(method => 
                    [AuthConnection.GOOGLE, AuthConnection.FACEBOOK, AuthConnection.APPLE, AuthConnection.X]
                    .includes(method.type as AuthConnection)
                  )
                  .map(method => {
                    const Icon = getIconComponent(method.icon);
                    return (
                      <button
                        key={method.id}
                        onClick={() => handleSocialAuth(method.type)}
                        disabled={isLoading}
                        class="btn btn-outline gap-2"
                      >
                        {Icon && <Icon size={20} />}
                        {method.name}
                      </button>
                    );
                  })}
              </div>

              <div class="divider">OR</div>

              {/* Passwordless Login Forms */}
              <div class="space-y-4">
                {/* Email Code Login */}
                <form onSubmit={(e) => handlePasswordlessAuth(e, AuthConnection.EMAIL_CODE)}>
                  <div class="form-control">
                    <label class="input-group">
                      <span><Mail size={20} /></span>
                      <input
                        type="email"
                        placeholder="Email address"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.currentTarget.value)}
                        disabled={isLoading}
                        class="input input-bordered w-full"
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    class="btn btn-primary w-full mt-4"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin mr-2" />
                    ) : (
                      <Mail size={20} className="mr-2" />
                    )}
                    Continue with Email
                  </button>
                </form>

                {/* Username Code Login */}
                <form onSubmit={(e) => handlePasswordlessAuth(e, AuthConnection.USERNAME_CODE)}>
                  <div class="form-control">
                    <label class="input-group">
                      <span><User size={20} /></span>
                      <input
                        type="text"
                        placeholder="Username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.currentTarget.value)}
                        disabled={isLoading}
                        class="input input-bordered w-full"
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    class="btn btn-secondary w-full mt-4"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin mr-2" />
                    ) : (
                      <User size={20} className="mr-2" />
                    )}
                    Continue with Username
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 