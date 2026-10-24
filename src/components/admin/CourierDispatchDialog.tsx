import { useState } from "react";
import type { Order, ShippingDetails } from "@/data/types";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Truck,
  ExternalLink,
  Package,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Zap,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getCourierTrackingUrl } from "@/lib/whatsapp-templates";

interface CourierDispatchDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDispatched?: () => void;
}

export function CourierDispatchDialog({
  order,
  open,
  onOpenChange,
  onDispatched,
}: CourierDispatchDialogProps) {
  if (!order) return null;

  // Automated Shiprocket / Sandbox Tab State
  const [courierPartner, setCourierPartner] = useState<
    "Delhivery" | "BlueDart" | "DTDC" | "Shiprocket" | "India Post"
  >("Delhivery");
  const [isSandbox, setIsSandbox] = useState(true);
  const [weightKg, setWeightKg] = useState("0.25");
  const [length, setLength] = useState("15");
  const [breadth, setBreadth] = useState("12");
  const [height, setHeight] = useState("6");
  const [sendWhatsAppAuto, setSendWhatsAppAuto] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual Courier Tab State
  const [manualCourier, setManualCourier] = useState(
    order.shippingDetails?.courierName || "Delhivery",
  );
  const [manualAwb, setManualAwb] = useState(order.shippingDetails?.trackingNumber || "");
  const [manualEta, setManualEta] = useState(
    order.shippingDetails?.estimatedDelivery || "2-3 business days",
  );
  const [sendWhatsAppManual, setSendWhatsAppManual] = useState(true);
  const [isSavingManual, setIsSavingManual] = useState(false);

  const [copiedAwb, setCopiedAwb] = useState(false);

  const handleCopyAwb = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setCopiedAwb(true);
    toast.success(`Copied AWB "${awb}"`);
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  const handleGenerateAwb = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/admin/shipping/generate-awb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderId,
          courierPartner,
          weightKg: Number(weightKg) || 0.25,
          dimensions: {
            length: Number(length) || 15,
            breadth: Number(breadth) || 12,
            height: Number(height) || 6,
          },
          isSandbox,
          sendWhatsAppAlert: sendWhatsAppAuto,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Generated AWB ${data.trackingNumber} (${data.courierName})!`, {
          description: data.mode === "sandbox_simulated"
            ? "Simulated AWB created & Order status set to SHIPPED."
            : "Live Shiprocket manifest created & Order marked SHIPPED.",
        });
        onDispatched?.();
        onOpenChange(false);
      } else {
        toast.error(data.error || "Failed to generate AWB.");
      }
    } catch {
      toast.error("Network error while generating shipping AWB.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAwb.trim()) {
      toast.error("Please enter a valid tracking AWB number.");
      return;
    }

    setIsSavingManual(true);
    try {
      const res = await fetch("/api/admin/shipping/manual-dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderId,
          shippingDetails: {
            courierName: manualCourier.trim(),
            trackingNumber: manualAwb.trim().toUpperCase(),
            estimatedDelivery: manualEta.trim() || undefined,
          },
          sendWhatsApp: sendWhatsAppManual,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Order ${order.orderId} marked as SHIPPED!`, {
          description: `Dispatched via ${manualCourier} (AWB: ${manualAwb.trim().toUpperCase()})`,
        });
        onDispatched?.();
        onOpenChange(false);
      } else {
        toast.error(data.error || "Failed to update tracking details.");
      }
    } catch {
      toast.error("Network error saving courier tracking.");
    } finally {
      setIsSavingManual(false);
    }
  };

  const existingTrackingUrl = order.shippingDetails
    ? order.shippingDetails.trackingUrl ||
      getCourierTrackingUrl(order.shippingDetails.courierName, order.shippingDetails.trackingNumber)
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div>
              <DialogTitle className="font-serif text-xl flex items-center gap-2">
                <Truck className="size-5 text-gold" />
                Courier Logistics & AWB Generation
              </DialogTitle>
              <DialogDescription className="text-xs">
                Dispatch order <strong className="font-mono text-foreground">{order.orderId}</strong> via
                Shiprocket automated AWB or manual courier entry.
              </DialogDescription>
            </div>
            <Badge
              variant={order.status === "SHIPPED" ? "default" : "secondary"}
              className="text-[10px] tracking-wider uppercase"
            >
              Status: {order.status}
            </Badge>
          </div>
        </DialogHeader>

        {/* Existing Dispatch Summary (If already shipped) */}
        {order.shippingDetails && (
          <div className="rounded-xs border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                Active Dispatch Assignment
              </span>
              <a
                href={existingTrackingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-gold hover:underline font-medium"
              >
                <span>Track on {order.shippingDetails.courierName}</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-muted-foreground pt-1">
              <div>
                <span>Courier: </span>
                <strong className="text-foreground">{order.shippingDetails.courierName}</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span>AWB: </span>
                <strong className="font-mono text-foreground font-bold">
                  {order.shippingDetails.trackingNumber}
                </strong>
                <button
                  type="button"
                  onClick={() => handleCopyAwb(order.shippingDetails!.trackingNumber)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Copy AWB"
                >
                  {copiedAwb ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </button>
              </div>
              <div>
                <span>Dispatched: </span>
                <span className="text-foreground">
                  {order.shippingDetails.dispatchedAt
                    ? new Date(order.shippingDetails.dispatchedAt).toLocaleDateString("en-IN")
                    : "Logged"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Destination Glance */}
        <div className="rounded-xs bg-muted/30 p-3 flex items-start gap-2.5 text-xs">
          <MapPin className="size-4 text-gold shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-medium text-foreground">
              {order.customer.fullName} • +91 {order.customer.mobileNumber}
            </p>
            <p className="text-muted-foreground">
              {order.customer.address}, {order.customer.city}, {order.customer.state} —{" "}
              <strong className="text-foreground">{order.customer.pincode}</strong>
            </p>
          </div>
        </div>

        {/* Dual Mode Tabs */}
        <Tabs defaultValue="automated" className="space-y-4 pt-1 text-xs">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="automated" className="gap-1.5 text-xs">
              <Zap className="size-3.5 text-gold" />
              1-Click Shiprocket / Sandbox AWB
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-1.5 text-xs">
              <Truck className="size-3.5 text-accent" />
              Manual Courier Tracking
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: AUTOMATED SHIPROCKET / SANDBOX AWB */}
          <TabsContent value="automated" className="space-y-4">
            <div className="rounded-xs border border-gold/40 bg-gold/5 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-gold" />
                  Automated Logistics Dispatch
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {isSandbox ? "[ Sandbox Simulator Mode ]" : "[ Live Shiprocket API ]"}
                  </span>
                  <Switch checked={isSandbox} onCheckedChange={setIsSandbox} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px]">Preferred Courier Partner</Label>
                  <Select
                    value={courierPartner}
                    onValueChange={(val: any) => setCourierPartner(val)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Delhivery">Delhivery (Air Priority)</SelectItem>
                      <SelectItem value="BlueDart">BlueDart Express</SelectItem>
                      <SelectItem value="DTDC">DTDC Air Premium</SelectItem>
                      <SelectItem value="Shiprocket">Shiprocket Best Rate</SelectItem>
                      <SelectItem value="India Post">India Post Speed Post</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">Parcel Dead Weight (kg)</Label>
                  <Input
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="0.25"
                    className="h-8 text-xs font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">Standard Zarika Box ~ 250 grams</p>
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="space-y-1">
                  <Label className="text-[10px]">Length (cm)</Label>
                  <Input
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="h-7 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Breadth (cm)</Label>
                  <Input
                    value={breadth}
                    onChange={(e) => setBreadth(e.target.value)}
                    className="h-7 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Height (cm)</Label>
                  <Input
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="h-7 text-xs font-mono"
                  />
                </div>
              </div>

              {/* WhatsApp Notification Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-gold/20">
                <div className="space-y-0.5">
                  <Label className="text-xs flex items-center gap-1.5">
                    <MessageCircle className="size-3.5 text-emerald-500" />
                    Send WhatsApp Dispatch Alert
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Automatically sends the courier name and tracking AWB to the customer's phone.
                  </p>
                </div>
                <Switch checked={sendWhatsAppAuto} onCheckedChange={setSendWhatsAppAuto} />
              </div>

              <Button
                type="button"
                onClick={handleGenerateAwb}
                disabled={isGenerating}
                className="w-full bg-primary text-primary-foreground text-xs gap-1.5 h-9 cursor-pointer"
              >
                {isGenerating ? (
                  <RefreshCw className="size-3.5 animate-spin" />
                ) : (
                  <Zap className="size-3.5" />
                )}
                <span>
                  {isGenerating
                    ? "Generating AWB & Booking Courier..."
                    : `Generate ${courierPartner} AWB & Mark Shipped`}
                </span>
              </Button>
            </div>
          </TabsContent>

          {/* TAB 2: MANUAL COURIER TRACKING */}
          <TabsContent value="manual">
            <form onSubmit={handleManualDispatch} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px]">Courier Company</Label>
                  <Select value={manualCourier} onValueChange={setManualCourier}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Delhivery">Delhivery</SelectItem>
                      <SelectItem value="BlueDart">BlueDart</SelectItem>
                      <SelectItem value="DTDC">DTDC</SelectItem>
                      <SelectItem value="Shiprocket">Shiprocket</SelectItem>
                      <SelectItem value="India Post Speed Post">India Post Speed Post</SelectItem>
                      <SelectItem value="Ecom Express">Ecom Express</SelectItem>
                      <SelectItem value="Shadowfax">Shadowfax</SelectItem>
                      <SelectItem value="Local Jaipur Hand Delivery">Jaipur Local Hand Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">AWB / Consignment Tracking Number *</Label>
                  <Input
                    placeholder="e.g. DL9876543210IN"
                    value={manualAwb}
                    onChange={(e) => setManualAwb(e.target.value.toUpperCase())}
                    required
                    className="h-8 text-xs font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px]">Estimated Delivery Window</Label>
                <Input
                  placeholder="e.g. 2-3 business days"
                  value={manualEta}
                  onChange={(e) => setManualEta(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* WhatsApp Notification Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="space-y-0.5">
                  <Label className="text-xs flex items-center gap-1.5">
                    <MessageCircle className="size-3.5 text-emerald-500" />
                    Send WhatsApp Dispatch Alert
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Directs customer to live tracking link for {manualCourier}.
                  </p>
                </div>
                <Switch checked={sendWhatsAppManual} onCheckedChange={setSendWhatsAppManual} />
              </div>

              <Button
                type="submit"
                disabled={isSavingManual}
                className="w-full bg-primary text-primary-foreground text-xs gap-1.5 h-9 cursor-pointer"
              >
                {isSavingManual && <RefreshCw className="size-3.5 animate-spin" />}
                <span>Save Courier Tracking & Mark Order Shipped</span>
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
