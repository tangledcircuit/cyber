import { useEffect, useState } from "preact/hooks";
import { Transaction } from "../types/transaction.ts";
import { animate } from "@juliangarnierorg/anime-beta";

interface BalanceDisplayProps {
  userId: string;
}

export default function BalanceDisplay({ userId }: BalanceDisplayProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial transactions fetch
    fetch(`/api/transactions?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
          // Calculate initial balance
          const initialBalance = data.transactions.reduce((sum, tx) => sum + tx.amount, 0);
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
      if (event.data.type === "token-update" && event.data.userId === userId) {
        setTransactions(prev => {
          // Remove any existing transaction with the same ID
          const filtered = prev.filter(t => t.id !== event.data.transaction.id);
          // Add the new transaction and sort by timestamp
          const updated = [event.data.transaction, ...filtered].sort((a, b) => b.timestamp - a.timestamp);
          // Calculate new balance
          const newBalance = updated.reduce((sum, tx) => sum + tx.amount, 0);
          setBalance(newBalance);
          return updated;
        });
      }
    };

    // Listen for credit deductions
    const creditChannel = new BroadcastChannel("credit-updates");
    creditChannel.onmessage = (event) => {
      if (event.data.type === "credit-update" && event.data.userId === userId) {
        setBalance(prev => {
          if (prev === null) return prev;
          return prev - event.data.amount;
        });
      }
    };

    return () => {
      txChannel.close();
      creditChannel.close();
    };
  }, [userId]);

  if (isLoading || balance === null) {
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
      {balance} tokens
    </div>
  );
} 