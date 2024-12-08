import { useState, useEffect } from "preact/hooks";
import { TOKEN_PRODUCT } from "../utils/stripe.ts";

export default function PurchaseModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState<number>(TOKEN_PRODUCT.minHours);
  const [isLoading, setIsLoading] = useState(false);
  const [totalTokens, setTotalTokens] = useState(TOKEN_PRODUCT.tokensPerHour * TOKEN_PRODUCT.minHours);
  const [totalPrice, setTotalPrice] = useState(TOKEN_PRODUCT.price * TOKEN_PRODUCT.minHours);

  // Update totals when hours change
  useEffect(() => {
    setTotalTokens(TOKEN_PRODUCT.tokensPerHour * hours);
    setTotalPrice(TOKEN_PRODUCT.price * hours);
  }, [hours]);

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      const { url } = await response.json();
      if (url) globalThis.location.href = url;
    } catch (err) {
      console.error("Purchase error:", err);
      alert(err instanceof Error ? err.message : "Failed to initiate purchase");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        class="btn btn-primary gap-2"
      >
        <span class="material-icons">shopping_cart</span>
        Buy Time
      </button>

      {isOpen && (
        <div class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-bold text-lg">Purchase Computer Time</h3>
            <p class="py-4">
              {TOKEN_PRODUCT.price.toFixed(2)} {TOKEN_PRODUCT.currency.toUpperCase()} per hour
              <br />
              <span class="text-sm opacity-75">Minimum purchase: {TOKEN_PRODUCT.minHours} hours</span>
            </p>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">How many hours would you like?</span>
              </label>
              <input
                type="number"
                min={TOKEN_PRODUCT.minHours}
                value={hours}
                onChange={(e) => {
                  const value = parseInt(e.currentTarget.value) || TOKEN_PRODUCT.minHours;
                  setHours(Math.max(value, TOKEN_PRODUCT.minHours));
                }}
                class="input input-bordered"
              />
              <label class="label">
                <span class="label-text-alt">
                  {totalTokens.toLocaleString()} tokens
                </span>
                <span class="label-text-alt font-bold">
                  Total: {totalPrice.toFixed(2)} {TOKEN_PRODUCT.currency.toUpperCase()}
                </span>
              </label>
            </div>

            <div class="modal-action">
              <button 
                class="btn btn-ghost"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                class="btn btn-primary"
                onClick={handlePurchase}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span class="loading loading-spinner loading-md" />
                ) : (
                  "Purchase"
                )}
              </button>
            </div>
          </div>
          <div class="modal-backdrop" onClick={() => !isLoading && setIsOpen(false)} />
        </div>
      )}
    </>
  );
} 