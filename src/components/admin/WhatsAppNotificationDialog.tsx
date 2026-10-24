import { useState, useEffect } from "react";
import type { Order, ShippingDetails } from "@/data/types";
import {
  generateOrderConfirmedMessage,
  generateOrderShippedMessage,
  generateOrderDeliveredMessage,
  getWhatsAppDirectUrl,
} from "@/lib/whatsapp-templates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  Truck,
  CheckCircle2,
  Package,
  Send,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export type NotificationStage = "CONFIRMED" | "SHIPPED" | "DELIVERED";

interface WhatsAppNotificationDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated?: () => void;
}

export function WhatsAppNotificationDialog({
  order,
  open,
  onOpenChange,
  onOrderUpdated,
}: WhatsAppNotificationDialogProps) {
  if (!order) return null;

  const [stage, setStage] = useState<NotificationStage>(
    order.status === "DELIVERED"
      ? "DELIVERED"
      : order.status === "SHIPPED"
        ? "SHIPPED"
        : "CONFIRMED",
  );

  // Shipping inputs for SHIPPED stage
  const [courierName, setCourierName] = useState(order.shippingDetails?.courierName || "Delhivery");
  const [trackingNumber, setTrackingNumber] = useState(
    order.shippingDetails?.trackingNumber || "",
  );
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order.shippingDetails?.estimatedDelivery || "",
  );

  // Message content
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [sendingApi, setSendingApi] = useState(false);

  // Regenerate message whenever stage or shipping details change
  useEffect(() => {
    if (stage === "CONFIRMED") {
      setMessage(generateOrderConfirmedMessage(order));
    } else if (stage === "SHIPPED") {
      const dummyShipping: ShippingDetails = {
        courierName: courierName.trim() || "Insured Luxury Courier",
        trackingNumber: trackingNumber.trim() || "AWB-PENDING",
        estimatedDelivery: estimatedDelivery.trim() || undefined,
      };
      setMessage(generateOrderShippedMessage(order, dummyShipping));
    } else if (stage === "DELIVERED") {
      setMessage(generateOrderDeliveredMessage(order));
    }
  }, [stage, courierName, trackingNumber, estimatedDelivery, order]);

  const handle1ClickWhatsApp = () => {
    const url = getWhatsAppDirectUrl(order.customer.mobileNumber, message);
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Opening WhatsApp Concierge...", {
      description: `Target: +91 ${order.customer.mobileNumber}`,
    });
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success("Message copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveTrackingAndStatus = async () => {
    if (!trackingNumber.trim()) {
      toast.error("Please enter an AWB / Tracking number first.");
      return;
    }

    try {
      const shippingPayload: ShippingDetails = {
        courierName: courierName.trim(),
        trackingNumber: trackingNumber.trim(),
        estimatedDelivery: estimatedDelivery.trim() || undefined,
        dispatchedAt: new Date().toISOString(),
      };

      const res = await fetch("/api/admin/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderId,
          status: "SHIPPED",
          shippingDetails: shippingPayload,
        }),
      });

      if (res.ok) {
        toast.success(`Order marked as SHIPPED with tracking ${trackingNumber}!`);
        onOrderUpdated?.();
      } else {
        toast.error("Failed to update tracking information.");
      }
    } catch {
      toast.error("Network error updating status.");
    }
  };

  const handleSendCloudApi = async () => {
    setSendingApi(true);
    try {
      const res = await fetch("/api/admin/orders/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderId,
          stage,
          customMessage: message,
          shippingDetails: {
            courierName,
            trackingNumber,
            estimatedDelivery,
          },
        }),
      });

      const data = await res.json();
      if (data.mode === "cloud_api") {
        toast.success("Automated WhatsApp Alert sent via Meta Cloud API!");
      } else {
        toast.info("1-Click Concierge Dispatch link prepared", {
          description: "Click 'Open WhatsApp Web/App' below to send for free.",
        });
      }
    } catch {
      toast.error("Failed to trigger automated API alert.");
    } finally {
      setSendingApi(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div>
              <DialogTitle className="font-serif text-xl flex items-center gap-2">
                <MessageCircle className="size-5 text-emerald-500" />
                WhatsApp Customer Notification Hub
              </DialogTitle>
              <DialogDescription className="text-xs">
                Dispatch personalized Jaipur heritage notifications directly to the customer's
                WhatsApp.
              </DialogDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              +91 {order.customer.mobileNumber}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1 text-xs">
          {/* Stage Selector Pills */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Notification Lifecycle Stage
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStage("CONFIRMED")}
                className={`p-2.5 rounded-xs border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  stage === "CONFIRMED"
                    ? "border-gold bg-gold/10 text-foreground font-semibold"
                    : "border-border bg-card hover:bg-muted/30 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-gold" />
                  <span className="text-xs">1. Confirmed</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Payment receipt & piece summary
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStage("SHIPPED")}
                className={`p-2.5 rounded-xs border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  stage === "SHIPPED"
                    ? "border-gold bg-gold/10 text-foreground font-semibold"
                    : "border-border bg-card hover:bg-muted/30 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Truck className="size-3.5 text-gold" />
                  <span className="text-xs">2. Dispatched</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Courier tracking & AWB
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStage("DELIVERED")}
                className={`p-2.5 rounded-xs border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  stage === "DELIVERED"
                    ? "border-gold bg-gold/10 text-foreground font-semibold"
                    : "border-border bg-card hover:bg-muted/30 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Package className="size-3.5 text-gold" />
                  <span className="text-xs">3. Delivered</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Care card & review request
                </span>
              </button>
            </div>
          </div>

          {/* If SHIPPED: Courier & AWB Inputs */}
          {stage === "SHIPPED" && (
            <div className="rounded-xs border border-gold/40 bg-gold/5 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                  <Truck className="size-3.5 text-gold" />
                  Courier Tracking Details
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleSaveTrackingAndStatus}
                  className="h-6 text-[11px] border-gold/40 text-gold hover:bg-gold/10 cursor-pointer"
                >
                  Save to Order & Mark Shipped
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <Label htmlFor="courier" className="text-[10px]">
                    Courier Partner
                  </Label>
                  <Select value={courierName} onValueChange={setCourierName}>
                    <SelectTrigger id="courier" className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Delhivery">Delhivery</SelectItem>
                      <SelectItem value="BlueDart">BlueDart</SelectItem>
                      <SelectItem value="DTDC">DTDC</SelectItem>
                      <SelectItem value="Shiprocket">Shiprocket</SelectItem>
                      <SelectItem value="India Post Speed Post">India Post</SelectItem>
                      <SelectItem value="Ecom Express">Ecom Express</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="awb" className="text-[10px]">
                    AWB / Tracking Number *
                  </Label>
                  <Input
                    id="awb"
                    placeholder="e.g. DL123456789IN"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                    className="h-8 text-xs font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="eta" className="text-[10px]">
                    Expected Delivery (Optional)
                  </Label>
                  <Input
                    id="eta"
                    placeholder="e.g. 2-3 business days"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Live Message Preview & Customization */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="size-3 text-gold" />
                Live Message Preview (Editable)
              </Label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                <span>{copied ? "Copied" : "Copy Text"}</span>
              </button>
            </div>

            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={9}
              className="font-mono text-xs leading-relaxed border-border bg-muted/20 resize-y"
            />
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border/60 flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSendCloudApi}
            disabled={sendingApi}
            className="text-xs gap-1.5 cursor-pointer order-2 sm:order-1"
          >
            {sendingApi ? <RefreshCw className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
            <span>Auto Send via Cloud API</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handle1ClickWhatsApp}
            className="bg-[#25D366] hover:bg-[#20ba59] text-white text-xs gap-1.5 cursor-pointer shadow-sm order-1 sm:order-2 font-medium"
          >
            <MessageCircle className="size-4" />
            <span>Send via WhatsApp (1-Click Free)</span>
            <ExternalLink className="size-3 ml-0.5 opacity-80" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
