import { useEffect, useState } from "preact/hooks";
import PurchaseModal from "./PurchaseModal.tsx";
import BalanceDisplay from "./BalanceDisplay.tsx";
import ThemeSwitcher from "./ThemeSwitcher.tsx";

interface HeaderProps {
  user: {
    id: string;
    given_name?: string;
    email?: string;
  };
  isDevelopment: boolean;
}

function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [kvStatus, setKvStatus] = useState<"connected" | "disconnected" | "error">("connected");

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listen for KV status updates
    const bc = new BroadcastChannel("kv-status");
    bc.onmessage = (event) => {
      if (event.data.type === "kv-status") {
        setKvStatus(event.data.status);
      }
    };

    globalThis.addEventListener("online", handleOnline);
    globalThis.addEventListener("offline", handleOffline);

    // Check KV connection
    fetch("/api/health")
      .then(res => res.ok ? setKvStatus("connected") : setKvStatus("error"))
      .catch(() => setKvStatus("error"));

    return () => {
      globalThis.removeEventListener("online", handleOnline);
      globalThis.removeEventListener("offline", handleOffline);
      bc.close();
    };
  }, []);

  let icon: string;
  let color: string;
  let text: string;

  if (!isOnline) {
    icon = "cloud_off";
    color = "text-error";
    text = "Offline";
  } else if (kvStatus === "error") {
    icon = "warning";
    color = "text-error";
    text = "DB Error";
  } else if (kvStatus === "disconnected") {
    icon = "sync_problem";
    color = "text-warning";
    text = "Reconnecting...";
  } else {
    icon = "cloud_done";
    color = "text-success";
    text = "Online";
  }

  return (
    <div class={`flex items-center gap-2 ${color}`}>
      <span class="material-icons text-sm">{icon}</span>
      <span class="text-sm hidden md:inline">{text}</span>
    </div>
  );
}

export default function Header({ user, isDevelopment }: HeaderProps) {
  const [isResetting, setIsResetting] = useState(false);

  const handleResetDB = async () => {
    if (!confirm("Are you sure you want to reset the database? This will clear all transactions.")) {
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch("/api/reset-db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to reset database");
      }

      // Refresh the page to reset all state
      globalThis.location.reload();
    } catch (error) {
      console.error("Failed to reset database:", error);
      alert("Failed to reset database. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div class="navbar bg-base-100 flex-col sm:flex-row gap-2 sm:gap-4 p-2 sm:p-4">
      <div class="flex w-full sm:w-auto justify-between sm:justify-start items-center">
        <a class="btn btn-ghost text-xl px-2 sm:px-4">Cyber</a>
        <div class="flex items-center sm:hidden">
          <ThemeSwitcher />
          <div class="dropdown dropdown-end">
            <div tabIndex={0} role="button" class="btn btn-ghost btn-sm">
              <span class="material-icons">menu</span>
            </div>
            <ul tabIndex={0} class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              {isDevelopment && (
                <li>
                  <button 
                    onClick={handleResetDB} 
                    class="text-warning"
                    disabled={isResetting}
                  >
                    <span class="material-icons">restart_alt</span>
                    {isResetting ? "Resetting..." : "Reset DB (Testing)"}
                  </button>
                </li>
              )}
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

      <div class="flex w-full sm:w-auto justify-between sm:flex-1 items-center gap-2 sm:gap-4">
        <div class="flex items-center gap-2">
          <BalanceDisplay userId={user.id} />
          <OnlineStatus />
        </div>
        
        <div class="flex items-center gap-2">
          <PurchaseModal />
          <div class="hidden sm:flex items-center gap-2">
            <ThemeSwitcher />
            <div class="dropdown dropdown-end">
              <div tabIndex={0} role="button" class="btn btn-ghost gap-2">
                <span class="material-icons">account_circle</span>
                <span class="hidden sm:inline">{user.given_name || "User"}</span>
              </div>
              <ul tabIndex={0} class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                {isDevelopment && (
                  <li>
                    <button 
                      onClick={handleResetDB} 
                      class="text-warning"
                      disabled={isResetting}
                    >
                      <span class="material-icons">restart_alt</span>
                      {isResetting ? "Resetting..." : "Reset DB (Testing)"}
                    </button>
                  </li>
                )}
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
      </div>
    </div>
  );
} 