import { useState, useRef } from "react";
import type { Order } from "@/data/types";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Printer,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Tag,
  FileText,
  AlertCircle,
  Truck,
} from "lucide-react";

interface OrderPackingSlipProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PrintFormat = "a4" | "thermal";

// Simulated high-contrast vector barcode for courier tracking
function BarcodeSvg({ value }: { value: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center gap-[2.5px] h-10 w-full overflow-hidden">
        {Array.from({ length: 48 }).map((_, i) => {
          const width = i % 4 === 0 ? "w-1.5" : i % 3 === 0 ? "w-1" : "w-0.5";
          const height = i % 5 === 0 ? "h-8" : "h-10";
          return (
            <div
              key={i}
              className={`bg-black ${width} ${height} shrink-0`}
            />
          );
        })}
      </div>
      <span className="font-mono text-[10px] tracking-[0.25em] font-bold text-black mt-1">
        *{value}*
      </span>
    </div>
  );
}

export function OrderPackingSlip({ order, open, onOpenChange }: OrderPackingSlipProps) {
  const [format, setFormat] = useState<PrintFormat>("a4");
  const a4Ref = useRef<HTMLDivElement>(null);
  const thermalRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Isolated Iframe Print Engine: Prevents browser print clipping, Radix dialog overflow lock & body height cuts
  const handlePrint = () => {
    const targetElement = format === "thermal" ? thermalRef.current : a4Ref.current;
    if (!targetElement) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Copy all external CSS styles & Tailwind classes into isolated print window
    const headNodes = Array.from(document.head.children)
      .map((node) => node.outerHTML)
      .join("\n");

    const pageRules =
      format === "thermal"
        ? `
          @page {
            size: 100mm 150mm;
            margin: 3mm;
          }
          body {
            width: 100mm;
            max-width: 100mm;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          }
        `
        : `
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          }
        `;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Zarika Jewelry - ${format === "thermal" ? "Thermal Label (4x6)" : "Invoice"} - ${order.orderId}</title>
          ${headNodes}
          <style>
            * { box-sizing: border-box; }
            ${pageRules}
          </style>
        </head>
        <body>
          ${targetElement.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    // Trigger print once iframe resources are ready
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }, 350);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border-gold/40 bg-card shadow-2xl">
        {/* Top Control Bar with Format Selector */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/95 px-6 py-3.5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-gold/15 text-gold text-xs font-semibold">
              <Printer className="size-3.5" />
            </span>
            <div>
              <DialogTitle className="font-serif text-lg text-foreground">
                Document Dispatch Hub
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground font-mono">
                {order.orderId} • {order.customer.fullName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Format Toggle Pill */}
            <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => setFormat("a4")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                  format === "a4"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="size-3.5" />
                <span>Standard A4</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat("thermal")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                  format === "thermal"
                    ? "bg-background text-foreground shadow-xs font-semibold text-gold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Tag className="size-3.5" />
                <span>Thermal 4"x6" Label</span>
              </button>
            </div>

            {/* Print Action CTA */}
            <Button
              type="button"
              variant="gold"
              size="sm"
              onClick={handlePrint}
              className="text-xs uppercase tracking-wider font-semibold cursor-pointer shadow-sm flex items-center gap-1.5 h-8"
            >
              <Printer className="size-3.5" />
              <span>
                {format === "thermal" ? "Print 4x6 Label" : "Print A4 Invoice"}
              </span>
            </Button>
          </div>
        </div>

        {/* PREVIEW CONTAINER */}
        <div className="p-4 sm:p-8 bg-muted/20 flex justify-center">
          {/* FORMAT 1: STANDARD A4 LUXURY INVOICE */}
          {format === "a4" && (
            <div
              ref={a4Ref}
              className="printable-invoice w-full max-w-[800px] bg-white text-zinc-950 p-8 sm:p-10 shadow-sm border border-zinc-200"
            >
              {/* Header */}
              <div className="border-b-2 border-zinc-900 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
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
                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
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
              <div className="grid grid-cols-2 gap-8 py-5 border-b border-zinc-200 text-xs">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-zinc-500 mb-1">
                    DELIVERY DESTINATION
                  </p>
                  <p className="font-bold text-sm text-zinc-900">{order.customer.fullName}</p>
                  <p className="text-zinc-700 leading-relaxed mt-0.5">
                    {order.customer.address}
                    <br />
                    {order.customer.city}, {order.customer.state} — {order.customer.pincode}
                  </p>
                  <p className="text-zinc-800 font-mono mt-1.5 flex items-center gap-1.5">
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
                  <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-zinc-500 mb-1">
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
              <div className="py-5">
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
                                className="size-10 object-cover rounded border border-zinc-200"
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
              <div className="border-t-2 border-zinc-900 pt-3 flex justify-end">
                <div className="w-64 space-y-1 text-xs">
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
                  <div className="border-t border-zinc-300 pt-1.5 flex justify-between font-bold text-sm text-zinc-950">
                    <span>Total Amount Paid:</span>
                    <span className="font-mono text-base">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Luxury Hallmark Seal & Care Card Note */}
              <div className="mt-6 rounded border border-zinc-300 bg-zinc-50/80 p-3.5 text-xs text-zinc-700 space-y-1.5">
                <div className="flex items-center gap-1.5 text-zinc-900 font-semibold text-[11px] uppercase tracking-wider">
                  <ShieldCheck className="size-4 text-amber-600" />
                  <span>Zarika Artisan Guarantee & Hallmark of Craft</span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Thank you for welcoming Zarika into your heirloom collection. Every piece is handcrafted by Jaipur artisans, dipped in authentic 18K anti-tarnish gold plating, and inspected for flawlessness prior to sealing.
                </p>
                <div className="border-t border-zinc-200 pt-1.5 text-[10px] text-zinc-500 flex flex-wrap justify-between gap-2">
                  <span>Care: Avoid water, perfumes, and sprays. Store in your Zarika suede pouch.</span>
                  <span>Support: concierge@zarikajewelry.com</span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-3 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span>DISPATCH HALLMARK: ZRK-{order.orderId.replace(/[^0-9A-Z]/g, "")}</span>
                <span>CUSTOMER COPY • KEEP FOR JEWELRY WARRANTY</span>
              </div>
            </div>
          )}

          {/* FORMAT 2: THERMAL 4" x 6" (100mm x 150mm) DISPATCH & SHIPPING LABEL */}
          {format === "thermal" && (
            <div
              ref={thermalRef}
              className="thermal-label w-[380px] bg-white text-black p-4 border-2 border-black rounded shadow-md font-sans text-xs select-none"
              style={{ minHeight: "560px" }}
            >
              {/* Courier Brand Banner */}
              <div className="border-b-2 border-black pb-2 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-serif text-2xl font-black uppercase tracking-[0.2em]">
                    ZARIKA
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest border border-black px-1.5 py-0.5">
                    FINE JEWELRY
                  </span>
                </div>
                <p className="text-[9px] uppercase font-bold tracking-wider mt-0.5">
                  PRIORITY AIR COURIER • LUXURY JEWELRY DISPATCH
                </p>
              </div>

              {/* Barcode & Order Reference */}
              <div className="py-2.5 border-b-2 border-black">
                <BarcodeSvg value={order.orderId} />
                <div className="flex items-center justify-between font-mono text-[10px] font-bold mt-1 px-1">
                  <span>DATE: {formattedDate}</span>
                  <span className="uppercase text-black">
                    {order.payment.status === "SUCCESS" || order.status === "PAID"
                      ? "[ PREPAID ONLINE ]"
                      : "[ COD PENDING ]"}
                  </span>
                </div>
              </div>

              {/* Bold Delivery Destination (Main shipping focus) */}
              <div className="py-3 border-b-2 border-black space-y-1">
                <span className="inline-block bg-black text-white text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
                  DELIVERY TO:
                </span>
                <p className="text-base font-black leading-tight uppercase mt-1">
                  {order.customer.fullName}
                </p>
                <p className="text-xs font-semibold leading-snug">
                  {order.customer.address}
                </p>
                <p className="text-sm font-black uppercase tracking-wide pt-0.5">
                  {order.customer.city}, {order.customer.state}
                </p>
                <div className="bg-black text-white p-1 text-center font-mono text-base font-black tracking-widest mt-1">
                  PIN: {order.customer.pincode}
                </div>
                <p className="text-xs font-bold font-mono pt-1 flex items-center justify-between">
                  <span>PHONE: +91 {order.customer.mobileNumber}</span>
                  {order.customer.phoneVerified && (
                    <span className="text-[9px] bg-zinc-200 px-1 py-0.2 rounded font-sans">
                      ✓ WA VERIFIED
                    </span>
                  )}
                </p>
              </div>

              {/* Item Manifest Box */}
              <div className="py-2.5 border-b-2 border-black text-[11px]">
                <div className="flex justify-between font-bold text-[10px] uppercase mb-1">
                  <span>PARCEL MANIFEST</span>
                  <span>QTY</span>
                </div>
                <div className="space-y-1">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs leading-tight">
                      <span className="font-semibold truncate max-w-[280px]">
                        {idx + 1}. {it.name} {it.color ? `(${it.color})` : ""}
                      </span>
                      <span className="font-mono font-bold">x{it.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t border-dashed border-black pt-1.5 mt-2 font-bold text-xs">
                  <span>Total Items: {order.items.reduce((s, i) => s + i.quantity, 0)} Pieces</span>
                  <span>Amount: {formatPrice(order.totalAmount)}</span>
                </div>
              </div>

              {/* Return Origin */}
              <div className="pt-2 text-[10px] space-y-0.5">
                <p className="font-bold uppercase tracking-wide">
                  RETURN IF UNDELIVERED TO:
                </p>
                <p className="leading-tight font-medium">
                  Zarika Fine Jewelry Fulfillment Atelier
                  <br />
                  Johari Bazaar Heritage Lane, Jaipur, RJ — 302003
                </p>
                <p className="text-[9px] font-mono">Support: concierge@zarikajewelry.com</p>
              </div>

              {/* Fragile Banner */}
              <div className="mt-3 border-2 border-black p-1 text-center font-bold text-[9px] uppercase tracking-wider bg-zinc-100">
                ⚠️ FRAGILE: AUTHENTIC 18K GOLD PLATED JEWELRY • DO NOT COMPRESS
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
