import { useEffect, useState } from "preact/hooks";
import { animate } from "@juliangarnierorg/anime-beta";

interface TimerProps {
  userId: string;
}

interface TimerState {
  startTime: number | null;
  stopTime: number | null;
  status: "running" | "stopped" | "cleared";
}

export default function Timer({ userId }: TimerProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load initial timer state from KV
  useEffect(() => {
    const loadTimerState = async () => {
      try {
        const response = await fetch(`/api/timer/state?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to load timer state');
        
        const state = await response.json();
        setTimerState(state);
        
        if (state.status === "running") {
          setIsRunning(true);
          const elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
          setTime(elapsedSeconds);
        } else if (state.status === "stopped" && state.startTime && state.stopTime) {
          const elapsedSeconds = Math.floor((state.stopTime - state.startTime) / 1000);
          setTime(elapsedSeconds);
        }
      } catch (error) {
        console.error('Failed to load timer state:', error);
        setError('Failed to load timer state');
      }
    };

    loadTimerState();

    // Listen for timer updates
    const bc = new BroadcastChannel("timer-updates");
    bc.onmessage = (event) => {
      if (event.data.userId === userId && event.data.type === "timer-update") {
        const { status, startTime, stopTime } = event.data;
        setTimerState({ status, startTime, stopTime });
        
        if (status === "running") {
          setIsRunning(true);
          const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
          setTime(elapsedSeconds);
        } else if (status === "stopped" && startTime && stopTime) {
          setIsRunning(false);
          const elapsedSeconds = Math.floor((stopTime - startTime) / 1000);
          setTime(elapsedSeconds);
        } else if (status === "cleared") {
          setIsRunning(false);
          setTime(0);
        }
      }
    };

    return () => bc.close();
  }, [userId]);
  
  // Update timer when running
  useEffect(() => {
    let interval: number;
    
    const startTime = timerState?.startTime;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        setTime(elapsedSeconds);

        // Broadcast token usage for BalanceDisplay
        const bc = new BroadcastChannel("token-updates");
        bc.postMessage({
          type: "token-usage",
          userId,
          amount: 1
        });
        bc.close();
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timerState?.startTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ];
  };

  const handleStart = async () => {
    if (!isRunning) {
      const startTimestamp = Date.now();

      try {
        const response = await fetch('/api/timer/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            startTime: startTimestamp,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to start timer');
        }

        setTimerState({
          startTime: startTimestamp,
          stopTime: null,
          status: "running"
        });
        setIsRunning(true);
        setError(null);

        // Subtle highlight animation
        animate('.time-display', {
          backgroundColor: ['rgba(0,255,255,0.1)', 'rgba(0,255,255,0)'],
          duration: 1000,
          easing: 'easeOutExpo'
        });
      } catch (error) {
        console.error('Failed to start timer:', error);
        setError('Failed to start timer');
      }
    }
  };

  const handleStop = async () => {
    if (isRunning && timerState?.startTime) {
      const stopTimestamp = Date.now();
      const duration = Math.floor((stopTimestamp - timerState.startTime) / 1000);

      try {
        const response = await fetch('/api/timer/stop', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            stopTime: stopTimestamp,
            duration,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to stop timer');
        }

        const { transaction } = await response.json();

        setTimerState(prev => ({
          ...prev!,
          stopTime: stopTimestamp,
          status: "stopped"
        }));
        setIsRunning(false);
        setError(null);

        // Broadcast the transaction update
        const bc = new BroadcastChannel("token-updates");
        bc.postMessage({
          type: "token-update",
          userId,
          transaction
        });
        bc.close();

        // Subtle fade animation
        animate('.time-display', {
          backgroundColor: ['rgba(255,171,0,0.1)', 'rgba(255,171,0,0)'],
          duration: 1000,
          easing: 'easeOutExpo'
        });
      } catch (error) {
        console.error('Failed to stop timer:', error);
        setError('Failed to stop timer');
      }
    }
  };

  const handleClear = async () => {
    try {
      const response = await fetch('/api/timer/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to clear timer');
      }

      setTimerState({
        startTime: null,
        stopTime: null,
        status: "cleared"
      });
      setIsRunning(false);
      setTime(0);
      setError(null);

      // Subtle reset animation
      animate('.time-display', {
        backgroundColor: ['rgba(255,0,0,0.1)', 'rgba(255,0,0,0)'],
        duration: 800,
        easing: 'easeOutExpo'
      });
    } catch (error) {
      console.error('Failed to clear timer:', error);
      setError('Failed to clear timer');
    }
  };

  const [hours, minutes, seconds] = formatTime(time);

  return (
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body p-8">
        {/* Main timer display */}
        <div class="time-display flex justify-center items-baseline gap-4 py-12 px-8 rounded-xl bg-base-200/50 transition-colors">
          <div class="flex flex-col items-center">
            <div class="text-8xl font-mono font-bold text-primary" style="text-shadow: 0 0 20px rgba(0,255,255,0.3);">
              {hours}
            </div>
            <div class="text-sm text-base-content/60 uppercase tracking-wider mt-2">Hours</div>
          </div>
          <div class="text-6xl font-bold text-primary/40 -translate-y-4">:</div>
          <div class="flex flex-col items-center">
            <div class="text-8xl font-mono font-bold text-primary" style="text-shadow: 0 0 20px rgba(0,255,255,0.3);">
              {minutes}
            </div>
            <div class="text-sm text-base-content/60 uppercase tracking-wider mt-2">Minutes</div>
          </div>
          <div class="text-6xl font-bold text-primary/40 -translate-y-4">:</div>
          <div class="flex flex-col items-center">
            <div class="text-8xl font-mono font-bold text-primary" style="text-shadow: 0 0 20px rgba(0,255,255,0.3);">
              {seconds}
            </div>
            <div class="text-sm text-base-content/60 uppercase tracking-wider mt-2">Seconds</div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div class="text-sm text-error text-center mt-4">
            {error}
          </div>
        )}

        {/* Controls */}
        <div class="flex justify-center gap-6 mt-8">
          <button
            onClick={handleStart}
            disabled={isRunning}
            class="btn btn-primary btn-lg gap-3 min-w-[140px] text-lg"
          >
            <span class="material-icons text-2xl">play_arrow</span>
            Start
          </button>
          <button
            onClick={handleStop}
            disabled={!isRunning}
            class="btn btn-warning btn-lg gap-3 min-w-[140px] text-lg"
          >
            <span class="material-icons text-2xl">stop</span>
            Stop
          </button>
          <button
            onClick={handleClear}
            class="btn btn-error btn-lg gap-3 min-w-[140px] text-lg"
          >
            <span class="material-icons text-2xl">clear</span>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
} 