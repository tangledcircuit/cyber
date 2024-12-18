import { useEffect, useState } from "preact/hooks";
import AnimatedDashboard from "./AnimatedHero.tsx";

interface DashboardProps {
  user: {
    id: string;
    given_name?: string;
    email?: string;
  };
}

interface Transaction {
  id: string;
  userId: string;
  type: "purchase" | "usage";
  amount: number;
  timestamp: number;
  description: string;
  stripePaymentId?: string;
  stripeStatus?: "pending" | "completed" | "failed";
}

const Dashboard = ({ user }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load transactions:", err);
        setLoading(false);
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

  return (
    <div class="container mx-auto p-4">
      {/* Tabs */}
      <div class="tabs tabs-boxed">
        <button 
          class={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <span class="material-icons mr-2">dashboard</span>
          Overview
        </button>
        <button 
          class={`tab ${activeTab === "history" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <span class="material-icons mr-2">history</span>
          History
        </button>
        <button 
          class={`tab ${activeTab === "settings" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <span class="material-icons mr-2">settings</span>
          Settings
        </button>
      </div>

      {/* Tab Content */}
      <div class="mt-4">
        {activeTab === "overview" && (
          <AnimatedDashboard userName={user.given_name || "User"} />
        )}

        {activeTab === "history" && (
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Transaction History</h2>
              {loading ? (
                <div class="flex justify-center p-4">
                  <span class="loading loading-spinner loading-lg"></span>
                </div>
              ) : transactions.length === 0 ? (
                <p class="text-center py-4 text-base-content/60">
                  No transactions yet
                </p>
              ) : (
                <div class="overflow-x-auto">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>{new Date(tx.timestamp).toLocaleString()}</td>
                          <td>
                            <span class={`badge ${
                              tx.type === "purchase" ? "badge-success" : "badge-warning"
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td>{tx.description}</td>
                          <td class={tx.amount > 0 ? "text-success" : "text-warning"}>
                            {tx.amount > 0 ? "+" : ""}{tx.amount}
                          </td>
                          <td>
                            {tx.stripePaymentId && (
                              <span class={`badge ${
                                tx.stripeStatus === "completed" ? "badge-success" :
                                tx.stripeStatus === "failed" ? "badge-error" :
                                "badge-warning"
                              }`}>
                                {tx.stripeStatus || "pending"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Account Settings</h2>
              <p>Your account settings will be available here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 