import { useEffect, useState, useRef } from "preact/hooks";
import PurchaseModal from "./PurchaseModal.tsx";
import { animate } from "@juliangarnierorg/anime-beta";
import { Transaction } from "../types/transaction.ts";

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const tokenRef = useRef<HTMLDivElement>(null);
  const pollCount = useRef(0);

  // Load transactions and listen for updates
  useEffect(() => {
    // Initial load of transactions
    fetch(`/api/transactions?userId=${user.id}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        } else {
          console.error("Invalid transactions data:", data);
        }
      })
      .catch(err => {
        console.error("Failed to load transactions:", err);
      });

    // Listen for transaction updates
    const bc = new BroadcastChannel("token-updates");
    bc.onmessage = (event) => {
      if (event.data.type === "token-update" && event.data.userId === user.id && event.data.transaction) {
        setTransactions(prev => {
          // Remove any existing transaction with the same ID
          const filtered = prev.filter(t => t.id !== event.data.transaction.id);
          // Add the new transaction and sort by timestamp
          return [event.data.transaction, ...filtered].sort((a, b) => b.timestamp - a.timestamp);
        });
      }
    };

    return () => bc.close();
  }, [user.id]);

  // Calculate current balance from transactions
  const currentTokens = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  // Show loading animation while syncing
  useEffect(() => {
    if (isSyncing && tokenRef.current) {
      animate(tokenRef.current, {
        scale: [1, 1.1],
        translateY: [0, -5],
        opacity: [1, 0.7],
        duration: 700,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine'
      });
    }
  }, [isSyncing]);

  // Check if returning from payment
  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    if (params.get("payment") === "success") {
      setIsSyncing(true);
      
      // Remove URL parameters
      const url = new URL(globalThis.location.href);
      url.searchParams.delete("payment");
      url.searchParams.delete("purchase");
      globalThis.history.replaceState({}, "", url.toString());

      // Start polling for updates
      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/transactions?userId=${user.id}`);
          const data = await res.json();
          
          if (Array.isArray(data.transactions) && data.transactions.length > 0) {
            setTransactions(data.transactions);
            clearInterval(pollInterval);
            setIsSyncing(false);
            
            // Play success animation
            if (tokenRef.current) {
              animate(tokenRef.current, {
                scale: [1, 1.5, 1],
                translateY: [0, -20, 0],
                backgroundColor: ['#ffffff', '#4CAF50', '#ffffff'],
                opacity: 1,
                duration: 1500,
                easing: 'spring(1, 80, 10, 0)'
              });
            }
          }
          
          // Stop polling after 10 attempts
          pollCount.current++;
          if (pollCount.current >= 10) {
            clearInterval(pollInterval);
            setIsSyncing(false);
          }
        } catch (err) {
          console.error("Failed to poll for updates:", err);
        }
      }, 1000); // Poll every second

      // Cleanup
      return () => clearInterval(pollInterval);
    }
  }, []);

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
    <div class="navbar bg-base-100">
      <div class="flex-1">
        <a class="btn btn-ghost text-xl">Cyber</a>
        <div ref={tokenRef} class="ml-4 badge badge-primary badge-lg gap-2">
          <span class="material-icons text-sm">toll</span>
          {isSyncing ? (
            <span class="flex items-center gap-2">
              <span class="loading loading-spinner loading-xs"></span>
              Syncing...
            </span>
          ) : (
            `${currentTokens} tokens`
          )}
        </div>
      </div>
      <div class="flex-none gap-4">
        <OnlineStatus />
        <PurchaseModal />
        <div class="dropdown dropdown-end">
          <div tabIndex={0} role="button" class="btn btn-ghost gap-2">
            <span class="material-icons">account_circle</span>
            {user.given_name || "User"}
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
  );
} 