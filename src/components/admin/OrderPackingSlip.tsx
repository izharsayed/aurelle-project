import { useRef } from "react";
import type { Order } from "@/data/types";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer, Download, Sparkles, CheckCircle2, ShieldCheck, X } from "lucide-react";

interface OrderPackingSlipProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderPackingSlip({ order, open, onOpenChange }: OrderPackingSlipProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 border-gold/40 bg-card shadow-2xl">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-6 py-3.5 backdrop-blur-md print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-gold/15 text-gold text-xs font-semibold">
              <Printer className="size-3.5" />
            </span>
            <div>
              <DialogTitle className="font-serif text-lg text-foreground">
                Luxury Packing Slip & Invoice
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground font-mono">
                {order.orderId} • {order.customer.fullName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="gold"
              size="sm"
              onClick={handlePrint}
              className="text-xs uppercase tracking-wider font-semibold cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <Printer className="size-3.5" />
              <span>Print / Save as PDF</span>
            </Button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div
          ref={printAreaRef}
          className="printable-invoice p-8 sm:p-10 bg-white text-zinc-900 font-sans print:p-0 print:m-0 print:bg-white print:text-black print:w-full"
        >
          {/* Print Header */}
          <div className="border-b-2 border-zinc-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-3xl tracking-[0.2em] font-semibold text-zinc-950 uppercase">
                  Zarika
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 border-l border-zinc-400 pl-2">
                  Fine Jewelry
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
                Jaipur Heritage Craftsmanship • 18K Anti-Tarnish Plating
              </p>
              <p className="text-xs text-zinc-600 mt-2">
                Atelier: Johari Bazaar Heritage Lane, Jaipur, RJ 302003
                <br />
                Concierge: concierge@zarikajewelry.com • www.zarikajewelry.com
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest bg-zinc-100 text-zinc-900 border border-zinc-300 rounded">
                Official Tax Invoice & Packing Slip
              </span>
              <p className="font-mono text-base font-bold text-zinc-950 mt-1">
                {order.orderId}
              </p>
              <p className="text-xs text-zinc-600">
                Order Date: <span className="font-medium text-zinc-900">{formattedDate}</span>
              </p>
              <p className="text-xs text-zinc-600">
                Payment:{" "}
                <span className="font-semibold text-emerald-700 uppercase">
                  {order.payment.status === "SUCCESS" || order.status === "PAID"
                    ? "PAID (ONLINE)"
                    : order.payment.status}
                </span>{" "}
                {order.payment.gatewayOrderId ? `• Ref: ${order.payment.gatewayOrderId.slice(-8)}` : ""}
              </p>
            </div>
          </div>

          {/* Delivery & Dispatch Addresses */}
          <div className="grid grid-cols-2 gap-8 py-6 border-b border-zinc-200 text-xs">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-zinc-500 mb-1.5">
                DELIVERY DESTINATION
              </p>
              <p className="font-bold text-sm text-zinc-900">{order.customer.fullName}</p>
              <p className="text-zinc-700 leading-relaxed mt-0.5">
                {order.customer.address}
                <br />
                {order.customer.city}, {order.customer.state} — {order.customer.pincode}
              </p>
              <p className="text-zinc-800 font-mono mt-1.5 flex items-center gap-1">
                <span>Phone: +91 {order.customer.mobileNumber}</span>
                {order.customer.phoneVerified && (
                  <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    ✓ WhatsApp Verified
                  </span>
                )}
              </p>
              <p className="text-zinc-600 text-[11px] mt-0.5">{order.customer.email}</p>
            </div>

            <div className="border-l border-zinc-200 pl-6">
              <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-zinc-500 mb-1.5">
                DISPATCHED FROM
              </p>
              <p className="font-bold text-sm text-zinc-900">Zarika Fine Jewelry Fulfillment Atelier</p>
              <p className="text-zinc-700 leading-relaxed mt-0.5">
                Parcel Inspection Hub #4, MI Road
                <br />
                Jaipur, Rajasthan — 302001
              </p>
              <p className="text-zinc-600 mt-1.5 text-[11px]">
                Courier: Express Insured Priority Dispatch
                <br />
                Package: Anti-Tarnish Sealed Luxury Gift Box
              </p>
            </div>
          </div>

          {/* Ordered Pieces Table */}
          <div className="py-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-zinc-900 text-[10px] uppercase tracking-wider text-zinc-600">
                  <th className="py-2.5 font-bold">Piece Description</th>
                  <th className="py-2.5 font-bold text-center">SKU</th>
                  <th className="py-2.5 font-bold text-center">Finish</th>
                  <th className="py-2.5 font-bold text-center">Qty</th>
                  <th className="py-2.5 font-bold text-right">Unit Price</th>
                  <th className="py-2.5 font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {order.items.map((item, index) => (
                  <tr key={index} className="align-middle">
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="size-10 object-cover rounded border border-zinc-200 print:size-8"
                          />
                        )}
                        <div>
                          <p className="font-bold text-zinc-900">{item.name}</p>
                          <p className="text-[10px] text-zinc-500">
                            18K Micro-Plated • Hypoallergenic • Hand-finished
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center font-mono text-[11px] text-zinc-600">
                      {item.sku}
                    </td>
                    <td className="py-3 text-center text-zinc-700">
                      {item.color || "18K Gold"}
                    </td>
                    <td className="py-3 text-center font-bold text-zinc-900">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-right font-mono text-zinc-700">
                      {formatPrice(item.price)}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-zinc-900">
                      {formatPrice(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="border-t-2 border-zinc-900 pt-4 flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Pieces Subtotal:</span>
                <span className="font-mono">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Insured Express Shipping:</span>
                <span className="text-zinc-900 font-medium">
                  {order.shippingAmount === 0 ? "Complimentary" : formatPrice(order.shippingAmount)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Luxury Suede Packaging:</span>
                <span className="text-zinc-900 font-medium">Included</span>
              </div>
              <div className="border-t border-zinc-300 pt-2 flex justify-between font-bold text-sm text-zinc-950">
                <span>Total Amount Paid:</span>
                <span className="font-mono text-base">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Luxury Hallmark Seal & Care Card Note */}
          <div className="mt-8 rounded border border-zinc-300 bg-zinc-50/80 p-4 text-xs text-zinc-700 space-y-2">
            <div className="flex items-center gap-1.5 text-zinc-900 font-semibold text-[11px] uppercase tracking-wider">
              <ShieldCheck className="size-4 text-amber-600" />
              <span>Zarika Artisan Guarantee & Hallmark of Craft</span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              Thank you for welcoming Zarika into your heirloom collection. Every piece is handcrafted by Jaipur artisans, dipped in authentic 18K anti-tarnish gold plating, and inspected for flawlessness prior to sealing.
            </p>
            <div className="border-t border-zinc-200 pt-2 text-[10px] text-zinc-500 flex flex-wrap justify-between gap-2">
              <span>Care: Avoid water, perfumes, and sprays. Store in your Zarika suede pouch.</span>
              <span>Support: concierge@zarikajewelry.com</span>
            </div>
          </div>

          {/* Footer Barcode Simulation */}
          <div className="mt-8 pt-4 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>DISPATCH HALLMARK: ZRK-{order.orderId.replace(/[^0-9A-Z]/g, "")}</span>
            <span>CUSTOMER COPY • KEEP FOR JEWELRY WARRANTY</span>
          </div>
        </div>

        {/* Global Print Stylesheet Embedded */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * {
                visibility: hidden;
              }
              .printable-invoice, .printable-invoice * {
                visibility: visible;
              }
              .printable-invoice {
                position: absolute;
                left: 0;
                top: 0;
                width: 100% !important;
                padding: 1.5cm !important;
                margin: 0 !important;
                background: white !important;
                color: black !important;
              }
              @page {
                size: A4;
                margin: 1cm;
              }
            }
          `
        }} />
      </DialogContent>
    </Dialog>
  );
}
