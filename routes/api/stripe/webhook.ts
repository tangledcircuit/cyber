import Stripe from "npm:stripe";
import { createBroadcastChannel } from "../../../utils/db.ts";
import { updateBalance, calculateBalance } from "../../../utils/balance.ts";
import { Transaction } from "../../../types/transaction.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

export async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const payload = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
    const event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      console.log("Processing completed checkout session");
      const session = event.data.object;
      const { userId, purchaseId } = session.metadata || {};
      const customerEmail = session.customer_details?.email;
      
      if (!userId || !customerEmail) {
        console.error("Missing userId or customer email", { userId, customerEmail });
        return new Response("Missing userId or customer email", { status: 400 });
      }

      // Get the line items to calculate tokens
      console.log("Fetching line items for session", session.id);
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const tokens = (lineItems.data[0]?.quantity || 0) * 3600; // 1 hour = 3600 tokens

      // Get all current transactions
      const kv = await Deno.openKv();
      const allTransactions: Transaction[] = [];
      const txIter = kv.list<Transaction>({ prefix: ["transactions"] });
      for await (const entry of txIter) {
        if (entry.value.userId === userId) {
          allTransactions.push(entry.value);
        }
      }

      // Create new transaction
      const timestamp = Date.now();
      const transactionId = purchaseId || crypto.randomUUID();
      const newTransaction: Omit<Transaction, "balance"> = {
        id: transactionId,
        userId,
        type: "purchase",
        amount: tokens,
        timestamp,
        description: `Purchased ${lineItems.data[0]?.quantity || 0} hours (${tokens} tokens)`,
        stripePaymentId: session.payment_intent as string,
        stripeStatus: "completed"
      };

      const transaction: Transaction = {
        ...newTransaction,
        balance: calculateBalance([...allTransactions, newTransaction as Transaction])
      };

      // Store transaction
      await kv.atomic()
        .set(["transactions", transaction.id], transaction)
        .commit();

      // Update balance
      allTransactions.push(transaction);
      await updateBalance(kv, userId, allTransactions);

      return new Response("OK");
    }

    return new Response("OK");
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Webhook Error: " + (err as Error).message, { status: 400 });
  }
} 