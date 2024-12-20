import { useEffect, useState } from "preact/hooks";
import { Transaction } from "../types/transaction.ts";

interface TokenBalanceProps {
  userId: string;
  transactions: Transaction[];
}

export default function TokenBalance({ userId: _userId, transactions }: TokenBalanceProps) {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate balance from transactions
  useEffect(() => {
    const newBalance = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    setBalance(newBalance);
  }, [transactions]);

  useEffect(() => {
    // Check if returning from Stripe purchase
    const params = new URLSearchParams(globalThis.location.search);
    if (params.get("payment") === "success") {
      setIsLoading(true);
      // Remove URL parameters
      const url = new URL(globalThis.location.href);
      url.searchParams.delete("payment");
      url.searchParams.delete("purchase");
      globalThis.history.replaceState({}, "", url.toString());
    }
  }, []);

  return (
    <div class="badge badge-primary badge-lg gap-2">
      <span class="material-icons text-sm">toll</span>
      {isLoading ? (
        <span class="loading loading-dots loading-sm"></span>
      ) : (
        `${balance} tokens`
      )}
    </div>
  );
} 