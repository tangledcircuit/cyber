interface PurchaseButtonProps {
  productId: string;
  price: number;
}

export default function PurchaseButton({ productId, price }: PurchaseButtonProps) {
  const handlePurchase = async () => {
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      
      const { url } = await response.json();
      if (url) globalThis.location.href = url;
    } catch (err) {
      console.error("Purchase error:", err);
      alert("Failed to initiate purchase");
    }
  };

  return (
    <button 
      class="btn btn-primary"
      onClick={handlePurchase}
    >
      Buy for ${price}
    </button>
  );
} 