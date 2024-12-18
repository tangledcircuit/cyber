import { animate, stagger } from "@juliangarnierorg/anime-beta";
import { useEffect } from "preact/hooks";

interface AnimatedDashboardProps {
  userName: string;
}

export default function AnimatedDashboard({ userName }: AnimatedDashboardProps) {
  useEffect(() => {
    // Animate the welcome message
    animate('.welcome-message', {
      translateX: [-50, 0],
      opacity: [0, 1],
      duration: 800,
      ease: 'outExpo'
    });

    // Animate the stats cards
    animate('.stat-card', {
      scale: [0.8, 1],
      opacity: [0, 1],
      duration: 600,
      delay: stagger(100),
      ease: 'spring(1, 80, 10, 0)'
    });

    // Animate the activity indicators
    animate('.activity-dot', {
      scale: [0, 1],
      opacity: [0, 1],
      duration: 400,
      delay: stagger(50, { from: 'center' }),
      ease: 'outElastic(1, .6)'
    });
  }, []);

  return (
    <div class="p-4 space-y-6">
      {/* Welcome Message */}
      <div class="welcome-message opacity-0">
        <h2 class="text-3xl font-bold text-primary">
          Welcome back, {userName}!
        </h2>
        <p class="text-base-content/60">
          Here's your productivity overview
        </p>
      </div>

      {/* Stats Grid */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Time Tracked", value: "23h 45m", icon: "schedule" },
          { title: "Tasks Completed", value: "12", icon: "task_alt" },
          { title: "Focus Score", value: "85%", icon: "psychology" },
        ].map((stat, i) => (
          <div
            key={i}
            class="stat-card opacity-0 card bg-base-100 shadow-xl"
          >
            <div class="card-body flex flex-row items-center">
              <span class="material-icons text-4xl text-primary mr-4">
                {stat.icon}
              </span>
              <div>
                <h3 class="card-title text-base-content/80">{stat.title}</h3>
                <p class="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Timeline */}
      <div class="card bg-base-100 shadow-xl p-6">
        <h3 class="text-xl font-bold mb-4">Recent Activity</h3>
        <div class="flex justify-between items-center">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              class="flex flex-col items-center"
            >
              <div
                class="activity-dot w-3 h-3 rounded-full bg-primary opacity-0"
                style={{ transform: `scale(${Math.random() * 0.5 + 0.5})` }}
              />
              <div class="text-xs text-base-content/60 mt-2">
                {new Date(Date.now() - i * 86400000).toLocaleDateString(undefined, { weekday: 'short' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 