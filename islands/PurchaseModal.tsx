import { useState } from "preact/hooks";
import { TOKEN_PRODUCT } from "../utils/stripe.ts";

export default function PurchaseModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      
      const { url } = await response.json();
      if (url) globalThis.location.href = url;
    } catch (err) {
      console.error("Purchase error:", err);
      alert("Failed to initiate purchase");
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = (TOKEN_PRODUCT.price * quantity).toFixed(8);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        class="btn btn-primary gap-2"
      >
        <span class="material-icons">shopping_cart</span>
        Buy Tokens
      </button>

      {isOpen && (
        <div class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-bold text-lg">Purchase Tokens</h3>
            <p class="py-4">
              Tokens are {TOKEN_PRODUCT.price.toFixed(8)} {TOKEN_PRODUCT.currency.toUpperCase()} each
            </p>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">How many tokens would you like?</span>
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.currentTarget.value) || 1)}
                class="input input-bordered"
              />
              <label class="label">
                <span class="label-text-alt">Total: {totalPrice} {TOKEN_PRODUCT.currency.toUpperCase()}</span>
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