import { useEffect, useState } from "preact/hooks";
import PurchaseModal from "./PurchaseModal.tsx";

interface HeaderProps {
  user: {
    given_name?: string;
    email?: string;
    id?: string;
  };
  tokens: number;
}

export default function Header({ user, tokens: initialTokens }: HeaderProps) {
  const [tokens, setTokens] = useState(initialTokens);

  useEffect(() => {
    if (!user.id) return;

    console.log("Client: Setting up SSE connection");
    
    // Connect to SSE endpoint
    const eventSource = new EventSource(`/api/tokens/watch?userId=${user.id}`);
    
    // Connection status handlers
    eventSource.onopen = () => {
      console.log("Client: SSE connection opened");
    };

    eventSource.onerror = (error) => {
      console.error("Client: SSE connection error:", error);
    };
    
    // Listen for token updates
    eventSource.onmessage = (event) => {
      const newTokens = parseInt(event.data);
      console.log(`Client: Received token update: ${newTokens}`);
      setTokens(newTokens);
    };

    // Clean up on unmount
    return () => {
      console.log("Client: Closing SSE connection");
      eventSource.close();
    };
  }, [user.id]);

  return (
    <div class="navbar bg-base-100">
      <div class="flex-1">
        <a class="btn btn-ghost text-xl">Cyber</a>
        <div class="ml-4 badge badge-primary badge-lg gap-2">
          <span class="material-icons text-sm">toll</span>
          {tokens} tokens
        </div>
      </div>
      <div class="flex-none gap-4">
        <PurchaseModal />
        <div class="dropdown dropdown-end">
          <div tabIndex={0} role="button" class="btn btn-ghost gap-2">
            <span class="material-icons">account_circle</span>
            {user.given_name || "User"}
          </div>
          <ul tabIndex={0} class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
            <li>
              <a href="/api/logout" class="text-error">
                <span class="material-icons">logout</span>
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 