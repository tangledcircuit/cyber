import { Transaction } from "../types/transaction.ts";

const kv = await Deno.openKv();

export interface StripePayment {
  transactionId: string;
  status: "pending" | "completed" | "failed";
  amount: number;
  userId: string;
}

// KV key prefixes
const KEYS = {
  transactions: "transactions",
  userTokens: "userTokens",
  stripePayments: "stripePayments",
} as const;

// Transaction functions
export async function createTransaction(transaction: Transaction) {
  const atomic = kv.atomic();

  // Update user's token balance
  const currentBalance = await getUserTokens(transaction.userId);
  const newBalance = transaction.type === "purchase" 
    ? currentBalance + transaction.amount 
    : currentBalance - transaction.amount;

  atomic
    .check({ key: ["userTokens", transaction.userId], versionstamp: null })
    .set(["transactions", transaction.id], transaction)
    .set(["userTokens", transaction.userId], newBalance);

  if (transaction.stripePaymentId) {
    atomic.set(["stripePayments", transaction.stripePaymentId], {
      transactionId: transaction.id,
      status: transaction.stripeStatus,
      amount: transaction.amount,
      userId: transaction.userId,
    });
  }

  const result = await atomic.commit();
  return result.ok;
}

export async function updateTransactionStatus(
  transactionId: string,
  stripePaymentId: string,
  status: "completed" | "failed"
) {
  const transaction = await getTransaction(transactionId);
  if (!transaction) return false;

  // If the transaction failed, reverse the token balance
  if (status === "failed" && transaction.type === "purchase") {
    const currentBalance = await getUserTokens(transaction.userId);
    await kv.set(["userTokens", transaction.userId], currentBalance - transaction.amount);
  }

  const result = await kv.atomic()
    .check({ key: ["transactions", transactionId], versionstamp: null })
    .set(["transactions", transactionId, "stripeStatus"], status)
    .set(["stripePayments", stripePaymentId, "status"], status)
    .commit();

  return result.ok;
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const transactions: Transaction[] = [];
  const iter = kv.list<Transaction>({ prefix: ["transactions"] });
  
  for await (const entry of iter) {
    const transaction = entry.value;
    if (transaction.userId === userId) {
      transactions.push(transaction);
    }
  }

  return transactions.sort((a, b) => b.timestamp - a.timestamp);
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  const result = await kv.get<Transaction>(["transactions", id]);
  return result.value;
}

export async function getUserTokens(userId: string): Promise<number> {
  const result = await kv.get<number>(["user_tokens", userId]);
  return result.value ?? 0;
}

export async function getStripePayment(paymentId: string): Promise<StripePayment | null> {
  const result = await kv.get<StripePayment>(["stripePayments", paymentId]);
  return result.value;
}

// Reset user's data (for testing only)
export async function resetUserData(userId: string) {
  if (Deno.env.get("DENO_ENV") === "production") {
    throw new Error("Cannot reset data in production");
  }

  const atomic = kv.atomic();
  
  // Delete user tokens
  atomic.delete(["user_tokens", userId]);
  
  // Delete user transactions
  const transactions = await getUserTransactions(userId);
  for (const tx of transactions) {
    atomic.delete(["transactions", tx.id]);
    if (tx.stripePaymentId) {
      atomic.delete(["stripePayments", tx.stripePaymentId]);
    }
  }

  return atomic.commit();
}

// Broadcast events
export interface EventData {
  type: "token_update" | "transaction_update";
  data: unknown;
}

const channels = new Map<string, Set<(data: EventData) => void>>();

export function subscribe(userId: string, callback: (data: EventData) => void) {
  if (!channels.has(userId)) {
    channels.set(userId, new Set());
  }
  channels.get(userId)?.add(callback);

  return () => {
    channels.get(userId)?.delete(callback);
    if (channels.get(userId)?.size === 0) {
      channels.delete(userId);
    }
  };
}

export function broadcast(userId: string, event: EventData) {
  channels.get(userId)?.forEach(callback => callback(event));
} 