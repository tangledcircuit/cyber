import { useState } from "preact/hooks";

interface DashboardProps {
  user: {
    id: string;
    given_name?: string;
    email?: string;
  };
}

const Dashboard = ({ user }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");

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
          <div class="grid gap-4">
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h2 class="card-title">Welcome back, {user.given_name || "User"}!</h2>
                <p>Your dashboard content will go here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Usage History</h2>
              <p>Your usage history will be displayed here.</p>
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