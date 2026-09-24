import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck, ShoppingBag } from "lucide-react";
import { load } from "@cashfreepayments/cashfree-js";
import { useStore } from "@/context/store-context";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { CustomerDetails } from "@/data/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Luxury Checkout — Velora Fine Jewelry" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CheckoutPage,
});

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Chandigarh",
  "Puducherry",
];

const FREE_SHIPPING_THRESHOLD = 2500;

function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useStore();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: "",
    mobileNumber: "",
    email: "",
    address: "",
    city: "",
    state: "Rajasthan",
    pincode: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingFee = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 150;
  const grandTotal = cartTotal + shippingFee;

  const validate = (): boolean => {
    const errs: Partial<Record<keyof CustomerDetails, string>> = {};

    if (!customer.fullName.trim() || customer.fullName.trim().length < 2) {
      errs.fullName = "Please enter your full legal name.";
    }

    const cleanPhone = customer.mobileNumber.replace(/\D/g, "");
    const finalPhone = cleanPhone.length === 12 && cleanPhone.startsWith("91") ? cleanPhone.slice(2) : cleanPhone;
    if (!/^[6-9]\d{9}$/.test(finalPhone)) {
      errs.mobileNumber = "Enter a valid 10-digit Indian mobile number.";
    }

    if (!customer.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      errs.email = "Enter a valid email address for order updates.";
    }

    if (!customer.address.trim() || customer.address.trim().length < 5) {
      errs.address = "Provide your street, apartment, and landmark.";
    }

    if (!customer.city.trim() || customer.city.trim().length < 2) {
      errs.city = "Please enter your city.";
    }

    if (!customer.state) {
      errs.state = "Please select your state.";
    }

    const cleanPincode = customer.pincode.replace(/\D/g, "");
    if (!/^[1-9][0-9]{5}$/.test(cleanPincode)) {
      errs.pincode = "Enter a valid 6-digit postal pincode.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Your shopping bag is empty");
      return;
    }

    if (!validate()) {
      toast.error("Please fill in all delivery details correctly");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit order payload to our authoritative server endpoint
      const payload = {
        customer,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
        })),
      };

      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment order");
      }

      const { orderId, paymentSessionId } = data;

      // 2. Launch Cashfree SDK checkout
      try {
        const cashfree = await load({
          mode: "sandbox", // Set to "production" in live deployment
        });

        if (paymentSessionId.startsWith("session_mock_")) {
          // In local dev sandbox without merchant keys, transition to simulated success
          toast.info("Sandbox Mode: Simulating payment success...", { duration: 2500 });
          clearCart();
          setTimeout(() => {
            navigate({ to: "/order/$orderId", params: { orderId } });
          }, 1000);
          return;
        }

        // Production / Live Cashfree Web Checkout invocation
        cashfree.checkout({
          paymentSessionId,
          redirectTarget: "_self",
        });
      } catch (sdkErr: any) {
        console.warn("Cashfree SDK modal fallback:", sdkErr);
        // Fallback directly to order confirmation polling
        navigate({ to: "/order/$orderId", params: { orderId } });
      }
    } catch (err: any) {
      console.error("Order creation failed:", err);
      toast.error("Checkout failed", {
        description: err.message || "An unexpected error occurred. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-24 text-center">
        <div className="size-16 rounded-full bg-muted/40 mx-auto flex items-center justify-center mb-4 text-muted-foreground">
          <ShoppingBag className="size-7 text-gold" />
        </div>
        <h1 className="font-serif text-3xl text-foreground mb-2">No pieces in your bag</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Add luxury pieces to your shopping bag before proceeding to checkout.
        </p>
        <Button variant="gold" size="brand" asChild>
          <Link to="/shop">Shop Fine Jewelry</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand/30 pb-20">
      {/* Top Security Banner */}
      <div className="bg-ink py-2 text-center text-[0.65rem] tracking-[0.22em] uppercase text-ink-foreground/80 font-medium">
        <div className="mx-auto flex items-center justify-center gap-2 px-4">
          <ShieldCheck className="size-3.5 text-gold" />
          <span>256-Bit Bank-Grade Secure Payment Gateway • Cashfree Verified</span>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-gold transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to Shopping Bag</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: Customer & Shipping Details Form */}
          <div className="lg:col-span-7 space-y-8">
            <form id="checkout-form" onSubmit={handlePay} className="space-y-8">
              
              {/* SECTION 1: Contact Information */}
              <div className="rounded-xs border border-border/80 bg-card p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-accent/20 text-accent font-serif text-xs font-semibold">
                    1
                  </span>
                  <h2 className="font-serif text-xl tracking-wide text-foreground">
                    Customer Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-medium uppercase tracking-wider">
                      Full Legal Name *
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="e.g. Radhika Singhania"
                      value={customer.fullName}
                      onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                      disabled={isSubmitting}
                      className={errors.fullName ? "border-destructive" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-[0.7rem] text-destructive">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="mobileNumber" className="text-xs font-medium uppercase tracking-wider">
                      Mobile Number (for delivery SMS) *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono">
                        +91
                      </span>
                      <Input
                        id="mobileNumber"
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210"
                        className={`pl-11 font-mono text-sm ${errors.mobileNumber ? "border-destructive" : ""}`}
                        value={customer.mobileNumber}
                        onChange={(e) =>
                          setCustomer({
                            ...customer,
                            mobileNumber: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.mobileNumber && (
                      <p className="text-[0.7rem] text-destructive">{errors.mobileNumber}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider">
                      Email Address (for invoice) *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="radhika@example.com"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      disabled={isSubmitting}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-[0.7rem] text-destructive">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: Delivery Destination */}
              <div className="rounded-xs border border-border/80 bg-card p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-accent/20 text-accent font-serif text-xs font-semibold">
                    2
                  </span>
                  <h2 className="font-serif text-xl tracking-wide text-foreground">
                    Delivery Address
                  </h2>
                </div>

                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-xs font-medium uppercase tracking-wider">
                      Street Address, Flat / House No., Landmark *
                    </Label>
                    <Input
                      id="address"
                      placeholder="e.g. 402, Royal Palms, C-Scheme, Near Statue Circle"
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      disabled={isSubmitting}
                      className={errors.address ? "border-destructive" : ""}
                    />
                    {errors.address && (
                      <p className="text-[0.7rem] text-destructive">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-xs font-medium uppercase tracking-wider">
                        City *
                      </Label>
                      <Input
                        id="city"
                        placeholder="Jaipur"
                        value={customer.city}
                        onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                        disabled={isSubmitting}
                        className={errors.city ? "border-destructive" : ""}
                      />
                      {errors.city && (
                        <p className="text-[0.7rem] text-destructive">{errors.city}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="state" className="text-xs font-medium uppercase tracking-wider">
                        State *
                      </Label>
                      <select
                        id="state"
                        value={customer.state}
                        onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                        disabled={isSubmitting}
                        className="w-full h-10 rounded-xs border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="text-[0.7rem] text-destructive">{errors.state}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="pincode" className="text-xs font-medium uppercase tracking-wider">
                        Postal Pincode *
                      </Label>
                      <Input
                        id="pincode"
                        maxLength={6}
                        placeholder="302001"
                        className={`font-mono ${errors.pincode ? "border-destructive" : ""}`}
                        value={customer.pincode}
                        onChange={(e) =>
                          setCustomer({
                            ...customer,
                            pincode: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        disabled={isSubmitting}
                      />
                      {errors.pincode && (
                        <p className="text-[0.7rem] text-destructive">{errors.pincode}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Payment Gateway Selection */}
              <div className="rounded-xs border border-border/80 bg-card p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-accent/20 text-accent font-serif text-xs font-semibold">
                    3
                  </span>
                  <h2 className="font-serif text-xl tracking-wide text-foreground">
                    Payment Method
                  </h2>
                </div>

                <div className="rounded-xs border border-gold/40 bg-gold/5 p-4 flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-gold shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-foreground">
                      Cashfree Secure Online Payment
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Instant verification via Google Pay, PhonePe, Paytm, all Indian UPI Apps, Credit/Debit Cards (Visa, Mastercard, RuPay), NetBanking, and EMI.
                    </p>
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* RIGHT: Order Summary Review */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-xs border border-border/80 bg-card p-6 shadow-xs space-y-6">
              <h2 className="font-serif text-xl tracking-wide text-foreground border-b border-border/60 pb-3">
                Order Review ({cart.length} {cart.length === 1 ? "piece" : "pieces"})
              </h2>

              {/* Items Preview */}
              <div className="max-h-60 overflow-y-auto divide-y divide-border/40 pr-1 space-y-3">
                {cart.map((item) => (
                  <div key={`${item.productId}-${item.color}`} className="pt-3 first:pt-0 flex gap-3">
                    <div className="size-14 shrink-0 overflow-hidden rounded-xs border border-border/60 bg-muted/20">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm text-foreground truncate">{item.name}</p>
                      <p className="text-[0.68rem] text-muted-foreground">
                        Qty: {item.quantity} {item.color ? `• ${item.color}` : ""}
                      </p>
                      <p className="text-xs font-medium text-foreground mt-1">
                        {formatPrice((item.salePrice ?? item.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2 border-t border-border/60 pt-4 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Pieces Subtotal</span>
                  <span className="text-foreground font-medium">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Insured Express Shipping</span>
                  <span className="text-foreground">
                    {shippingFee === 0 ? "Complimentary" : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Luxury Box Packaging</span>
                  <span className="text-emerald-700 dark:text-emerald-400">Included</span>
                </div>

                <div className="border-t border-border/80 pt-3 flex justify-between text-base font-semibold text-foreground">
                  <span className="font-serif">Total Payable</span>
                  <span className="text-gold">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                variant="gold"
                size="brand"
                className="w-full flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-semibold cursor-pointer shadow-md active:scale-[0.99]"
              >
                <Lock className="size-3.5" />
                <span>{isSubmitting ? "Initiating Secure Gateway..." : `Pay ${formatPrice(grandTotal)} Securely`}</span>
              </Button>

              <div className="text-center space-y-1.5 pt-1">
                <p className="text-[0.65rem] text-muted-foreground uppercase tracking-widest">
                  🔒 Encrypted Payment via Cashfree
                </p>
                <p className="text-[0.62rem] text-muted-foreground">
                  By clicking Pay, you agree to Velora Fine Jewelry's care, dispatch, and return policies.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
