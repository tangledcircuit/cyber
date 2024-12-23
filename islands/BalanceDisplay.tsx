import { useEffect, useState } from "preact/hooks";
import { Transaction } from "../types/transaction.ts";
import { animate } from "@juliangarnierorg/anime-beta";

interface BalanceDisplayProps {
  userId: string;
}

export default function BalanceDisplay({ userId }: BalanceDisplayProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [_transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingUsage, setPendingUsage] = useState(0);

  useEffect(() => {
    // Initial transactions fetch
    fetch(`/api/transactions?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
          // Calculate initial balance
          const initialBalance = data.transactions.reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
          setBalance(initialBalance);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to load transactions:", error);
        setIsLoading(false);
      });

    // Listen for transaction updates
    const txChannel = new BroadcastChannel("token-updates");
    txChannel.onmessage = (event) => {
      if (event.data.userId === userId) {
        if (event.data.type === "token-update" && event.data.transaction) {
          setTransactions(prev => {
            // Remove any existing transaction with the same ID
            const filtered = prev.filter(t => t.id !== event.data.transaction.id);
            // Add the new transaction and sort by timestamp
            const updated = [event.data.transaction, ...filtered].sort((a, b) => b.timestamp - a.timestamp);
            // Calculate new balance
            const newBalance = updated.reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
            setBalance(newBalance);
            // Reset pending usage when we get a new transaction
            setPendingUsage(0);
            return updated;
          });
        } else if (event.data.type === "token-usage") {
          // Increment pending usage
          setPendingUsage(prev => prev + event.data.amount);
          // Animate balance decrease
          animate('.balance-amount', {
            opacity: [1, 0.5, 1],
            color: ['#current', '#ff0000', '#current'],
            duration: 500,
            easing: 'easeInOutSine'
          });
        }
      }
    };

    return () => {
      txChannel.close();
    };
  }, [userId]);

  // Calculate effective balance
  const effectiveBalance = balance === null ? null : Math.max(0, balance - pendingUsage);

  if (isLoading || effectiveBalance === null) {
    return (
      <div class="badge badge-primary badge-lg gap-2">
        <span class="material-icons text-sm">toll</span>
        <span class="loading loading-dots loading-sm"></span>
      </div>
    );
  }

  return (
    <div class="badge badge-primary badge-lg gap-2">
      <span class="material-icons text-sm">toll</span>
      <span class="balance-amount">{effectiveBalance}</span> tokens
    </div>
  );
} 