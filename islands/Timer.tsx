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
    
    if (isRunning && timerState?.startTime) {
      interval = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - timerState.startTime) / 1000);
        setTime(elapsedSeconds);
        
        // Animate the timer text
        animate('.timer-text', {
          scale: [1, 1.1, 1],
          duration: 200,
          easing: 'easeInOutQuad'
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timerState?.startTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

        // Animate the start button
        animate('.start-btn', {
          scale: [1, 0.9, 1],
          duration: 300,
          easing: 'spring(1, 80, 10, 0)'
        });
      } catch (error) {
        console.error('Failed to start timer:', error);
      }
    }
  };

  const handleStop = async () => {
    if (isRunning && timerState?.startTime) {
      const stopTimestamp = Date.now();

      try {
        const response = await fetch('/api/timer/stop', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            stopTime: stopTimestamp,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to stop timer');
        }

        setTimerState(prev => ({
          ...prev!,
          stopTime: stopTimestamp,
          status: "stopped"
        }));
        setIsRunning(false);

        // Animate the stop button
        animate('.stop-btn', {
          scale: [1, 0.9, 1],
          duration: 300,
          easing: 'spring(1, 80, 10, 0)'
        });
      } catch (error) {
        console.error('Failed to stop timer:', error);
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

      // Animate the clear button and timer reset
      animate('.clear-btn', {
        scale: [1, 0.9, 1],
        duration: 300,
        easing: 'spring(1, 80, 10, 0)'
      });

      animate('.timer-text', {
        scale: [1, 0.5, 1],
        opacity: [1, 0.5, 1],
        duration: 500,
        easing: 'easeInOutQuad'
      });
    } catch (error) {
      console.error('Failed to clear timer:', error);
    }
  };

  return (
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title flex items-center gap-2">
          <span class="material-icons">timer</span>
          Timer
        </h2>
        <div class="flex flex-col items-center gap-4">
          <div class="timer-text text-4xl font-mono font-bold">
            {formatTime(time)}
          </div>
          <div class="flex gap-2">
            <button
              onClick={handleStart}
              disabled={isRunning}
              class="start-btn btn btn-primary gap-2"
            >
              <span class="material-icons">play_arrow</span>
              Start
            </button>
            <button
              onClick={handleStop}
              disabled={!isRunning}
              class="stop-btn btn btn-warning gap-2"
            >
              <span class="material-icons">stop</span>
              Stop
            </button>
            <button
              onClick={handleClear}
              class="clear-btn btn btn-error gap-2"
            >
              <span class="material-icons">clear</span>
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 