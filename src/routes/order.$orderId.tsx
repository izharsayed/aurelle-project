import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { useStore } from "@/context/store-context";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/order/$orderId")({
  head: () => ({
    meta: [
      { title: "Order Confirmation — Velora Fine Jewelry" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OrderStatusPage,
});

interface OrderVerificationData {
  orderId: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productId: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    subtotal: number;
    color?: string;
    image?: string;
  }>;
  subtotal: number;
  shippingAmount: number;
  address: {
    fullName: string;
    mobileNumber: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
}

function OrderStatusPage() {
  const { orderId } = useParams({ from: "/order/$orderId" });
  const { clearCart } = useStore();

  const [order, setOrder] = useState<OrderVerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/payments/verify-order?orderId=${encodeURIComponent(orderId)}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Order not found (${res.status})`);
      }
      const data = (await res.json()) as OrderVerificationData;
      setOrder(data);

      if (data.status === "PAID" || data.paymentStatus === "SUCCESS") {
        clearCart();
      }
    } catch (err: any) {
      console.error("Order verification error:", err);
      setError(err.message || "Could not verify order status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [orderId]);

  // Polling for live status confirmation if pending
  useEffect(() => {
    if (!order) return;
    if (order.status === "PAID" || order.paymentStatus === "SUCCESS") return;
    if (order.status === "FAILED" || order.paymentStatus === "FAILED") return;
    if (pollCount >= 10) return; // Stop after 30 seconds

    const timer = setTimeout(() => {
      setPollCount((c) => c + 1);
      fetchStatus();
    }, 3000);

    return () => clearTimeout(timer);
  }, [order, pollCount]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent/15 text-accent mb-4">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
        <h1 className="font-serif text-2xl text-foreground mb-2">Connecting to Secure Gateway</h1>
        <p className="text-xs text-muted-foreground">
          Verifying payment status for Order #{orderId}...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-8" />
        </div>
        <h1 className="font-serif text-3xl text-foreground mb-2">Order Not Found</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {error || "We could not find the details for this order reference."}
        </p>
        <Button variant="outline" size="brand" asChild>
          <Link to="/shop">Return to Collection</Link>
        </Button>
      </div>
    );
  }

  const isPaid = order.status === "PAID" || order.paymentStatus === "SUCCESS";
  const isFailed = order.status === "FAILED" || order.paymentStatus === "FAILED";

  return (
    <div className="min-h-screen bg-sand/30 py-12 sm:py-16">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-xs border border-border/80 bg-card p-6 sm:p-10 shadow-sm space-y-8">
          
          {/* HEADER STATUS */}
          {isPaid ? (
            <div className="text-center space-y-3 border-b border-border/60 pb-8">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="size-8" strokeWidth={1.5} />
              </div>
              <p className="text-xs tracking-widest uppercase font-semibold text-gold">
                Payment Confirmed
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal">
                Thank you for your order, {order.customerName}!
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Your order <strong className="font-mono text-foreground font-medium">{order.orderId}</strong> has been successfully placed and our Jaipur artisans are crafting your heirloom box.
              </p>

              <div className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-4 py-1.5 text-xs text-muted-foreground mt-2">
                <Mail className="size-3.5 text-gold" />
                <span>Confirmation email queued to <strong className="text-foreground">{order.customerEmail}</strong></span>
              </div>
            </div>
          ) : isFailed ? (
            <div className="text-center space-y-3 border-b border-border/60 pb-8">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <AlertCircle className="size-8" strokeWidth={1.5} />
              </div>
              <p className="text-xs tracking-widest uppercase font-semibold text-destructive">
                Payment Incomplete or Failed
              </p>
              <h1 className="font-serif text-3xl text-foreground font-normal">
                Payment Could Not Be Completed
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                No payment was debited. Your order #{order.orderId} has NOT been confirmed.
              </p>

              <div className="pt-3 flex flex-wrap justify-center gap-3">
                <Button variant="gold" size="brand" asChild>
                  <Link to="/checkout">Try Payment Again</Link>
                </Button>
                <Button variant="outline" size="brand" asChild>
                  <Link to="/cart">Return to Bag</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3 border-b border-border/60 pb-8">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                <Clock className="size-8 animate-pulse" strokeWidth={1.5} />
              </div>
              <p className="text-xs tracking-widest uppercase font-semibold text-amber-700 dark:text-amber-400">
                Payment Verification in Progress
              </p>
              <h1 className="font-serif text-3xl text-foreground font-normal">
                Awaiting Bank Confirmation
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We are checking your Cashfree payment status. This page updates automatically.
              </p>
              <button
                type="button"
                onClick={fetchStatus}
                className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline pt-2 cursor-pointer"
              >
                <RefreshCw className="size-3" />
                <span>Refresh status now</span>
              </button>
            </div>
          )}

          {/* ORDER DETAILS SUMMARY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-border/60 pb-8">
            <div className="space-y-1">
              <span className="text-muted-foreground uppercase tracking-wider block">Order Reference</span>
              <p className="font-mono text-sm font-semibold text-foreground">{order.orderId}</p>
            </div>
            <div className="space-y-1 sm:text-right">
              <span className="text-muted-foreground uppercase tracking-wider block">Total Amount</span>
              <p className="text-sm font-semibold text-gold">{formatPrice(order.totalAmount)}</p>
            </div>
          </div>

          {/* ORDER ITEMS LIST */}
          <div className="space-y-4 border-b border-border/60 pb-8">
            <h2 className="font-serif text-lg text-foreground tracking-wide">
              Pieces in this Order
            </h2>
            <div className="divide-y divide-border/40">
              {order.items.map((item) => (
                <div key={item.productId} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <div className="size-12 overflow-hidden rounded-xs border border-border/60 bg-muted/20">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-serif text-sm text-foreground">{item.name}</p>
                      <p className="text-[0.68rem] text-muted-foreground">
                        Qty: {item.quantity} {item.color ? `• ${item.color}` : ""} • SKU: {item.sku}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 pt-3 text-xs border-t border-border/40">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Insured Shipping</span>
                <span>{order.shippingAmount === 0 ? "Complimentary" : formatPrice(order.shippingAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-foreground pt-2">
                <span className="font-serif">Total Paid</span>
                <span className="text-gold">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* DELIVERY DESTINATION */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2 text-foreground font-semibold uppercase tracking-wider">
              <MapPin className="size-4 text-gold" />
              <span>Delivery Address</span>
            </div>
            <div className="rounded-xs bg-muted/30 p-4 leading-relaxed text-muted-foreground space-y-0.5">
              <strong className="text-foreground">{order.address.fullName}</strong>
              <p>{order.address.address}</p>
              <p>
                {order.address.city}, {order.address.state} — {order.address.pincode}
              </p>
              <p>Contact: +91 {order.address.mobileNumber}</p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/shop" className="gap-2">
                <ShoppingBag className="size-3.5" />
                <span>Continue Shopping</span>
              </Link>
            </Button>

            <Link
              to="/contact"
              className="text-xs text-muted-foreground hover:text-gold transition-colors inline-flex items-center gap-1"
            >
              <span>Need help with this order? Speak with Concierge</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
