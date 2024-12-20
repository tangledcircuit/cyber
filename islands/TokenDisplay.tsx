import { useEffect, useState, useRef } from "preact/hooks";
import { animate } from "@juliangarnierorg/anime-beta";
import { Transaction } from "../types/transaction.ts";

// Add type for anime.js instance
type AnimeInstance = ReturnType<typeof animate>;

interface TokenDisplayProps {
  userId: string;
}

export default function TokenDisplay({ userId }: TokenDisplayProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const tokenRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimeInstance | null>(null);

  // Load transactions and listen for updates
  useEffect(() => {
    setIsInitialLoading(true);

    // Start loading animation
    if (dotsRef.current) {
      const dots = dotsRef.current.children;
      animationRef.current = animate(dots, {
        translateY: [-3, 3],
        duration: 600,
        loop: true,
        direction: 'alternate',
        delay: (_el, i) => i * 100,
        easing: 'easeInOutSine'
      });
    }

    // Load transactions
    fetch(`/api/transactions?userId=${userId}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
          
          // Stop loading animation
          if (animationRef.current) {
            animationRef.current.pause();
          }

          // Play success animation
          if (tokenRef.current) {
            animate(tokenRef.current, {
              scale: [1, 1.2, 1],
              duration: 800,
              easing: 'spring(1, 80, 10, 0)'
            });
          }
        } else {
          console.error("Invalid transactions data:", data);
        }
        setIsInitialLoading(false);
      })
      .catch(err => {
        console.error("Failed to load transactions:", err);
        setIsInitialLoading(false);
      });

    // Listen for transaction updates
    const bc = new BroadcastChannel("token-updates");
    bc.onmessage = (event) => {
      if (event.data.type === "token-update" && event.data.userId === userId && event.data.transaction) {
        setTransactions(prev => {
          // Remove any existing transaction with the same ID
          const filtered = prev.filter(t => t.id !== event.data.transaction.id);
          // Add the new transaction and sort by timestamp
          return [event.data.transaction, ...filtered].sort((a, b) => b.timestamp - a.timestamp);
        });

        // Play update animation
        if (tokenRef.current) {
          animate(tokenRef.current, {
            scale: [1, 1.2, 1],
            translateY: [0, -10, 0],
            duration: 800,
            easing: 'spring(1, 80, 10, 0)'
          });
        }
      }
    };

    return () => {
      bc.close();
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
  }, [userId]);

  // Calculate current balance from transactions
  const currentTokens = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  // Check if returning from payment
  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    if (params.get("payment") === "success") {
      // Remove URL parameters
      const url = new URL(globalThis.location.href);
      url.searchParams.delete("payment");
      url.searchParams.delete("purchase");
      globalThis.history.replaceState({}, "", url.toString());

      // Start polling for updates
      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/transactions?userId=${userId}`);
          const data = await res.json();
          
          if (Array.isArray(data.transactions) && data.transactions.length > 0) {
            setTransactions(data.transactions);
            
            // Play success animation
            if (tokenRef.current) {
              animate(tokenRef.current, {
                scale: [1, 1.2, 1],
                translateY: [0, -10, 0],
                duration: 800,
                easing: 'spring(1, 80, 10, 0)'
              });
            }
          }
        } catch (err) {
          console.error("Failed to poll for updates:", err);
        }
      }, 1000);

      return () => clearInterval(pollInterval);
    }
  }, []);

  return (
    <div ref={tokenRef} class="ml-4 badge badge-primary badge-lg gap-2">
      <span class="material-icons text-sm">toll</span>
      {isInitialLoading ? (
        <div ref={dotsRef} class="flex gap-[2px] items-center font-mono">
          <span class="inline-block">•</span>
          <span class="inline-block">•</span>
          <span class="inline-block">•</span>
        </div>
      ) : (
        `${currentTokens} tokens`
      )}
    </div>
  );
} 