import { Transaction } from "../types/transaction.ts";
import { createBroadcastChannel } from "./db.ts";

export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

export async function updateBalance(kv: Deno.Kv, userId: string, transactions: Transaction[]) {
  const newBalance = calculateBalance(transactions);
  
  // Update KV store
  await kv.atomic()
    .set(["balances", userId], newBalance)
    .commit();

  // Broadcast the update
  const bc = createBroadcastChannel("balance-updates");
  try {
    bc.postMessage({
      type: "balance-update",
      userId,
      balance: newBalance
    });
  } finally {
    bc.close();
  }
}

export async function getBalance(kv: Deno.Kv, userId: string): Promise<number> {
  const result = await kv.get<number>(["balances", userId]);
  if (!result.value) {
    // If no balance exists, calculate from transactions
    const iter = kv.list<Transaction>({ prefix: ["transactions"] });
    const transactions: Transaction[] = [];
    for await (const entry of iter) {
      if (entry.value.userId === userId) {
        transactions.push(entry.value);
      }
    }
    const balance = calculateBalance(transactions);
    // Store the calculated balance
    await updateBalance(kv, userId, transactions);
    return balance;
  }
  return result.value;
} 