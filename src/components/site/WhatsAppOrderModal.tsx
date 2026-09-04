import { Check, Copy, MessageCircle } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/store-context";

/**
 * Frontend-only preview of the WhatsApp order message. When the live number is
 * added, this modal becomes a redirect to `buildWhatsAppUrl(message)`.
 */
export function WhatsAppOrderModal() {
  const { orderPreview, closeOrderPreview } = useStore();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!orderPreview) return;
    try {
      await navigator.clipboard.writeText(orderPreview.message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Dialog
      open={Boolean(orderPreview)}
      onOpenChange={(open) => {
        if (!open) {
          closeOrderPreview();
          setCopied(false);
        }
      }}
    >
      <DialogContent className="max-w-md rounded-none border-border bg-card">
        <DialogHeader>
          <span className="mb-2 flex size-11 items-center justify-center rounded-full bg-whatsapp/10 text-whatsapp">
            <MessageCircle aria-hidden className="size-5" strokeWidth={1.5} />
          </span>
          <DialogTitle className="font-serif text-2xl font-light">Your WhatsApp order</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            This is the message our team will receive. Live WhatsApp ordering is being connected —
            for now you can copy this preview.
          </DialogDescription>
        </DialogHeader>

        <pre className="max-h-56 overflow-y-auto border border-border bg-background p-4 font-sans text-xs leading-relaxed whitespace-pre-wrap text-foreground">
          {orderPreview?.message}
        </pre>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="line" size="brandSm" onClick={copy}>
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            {copied ? "Copied" : "Copy message"}
          </Button>
          {orderPreview?.whatsappNumber ? (
            <Button
              variant="whatsapp"
              size="brandSm"
              asChild
              onClick={() => {
                closeOrderPreview();
              }}
            >
              <a
                href={`https://wa.me/${orderPreview.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(orderPreview.message)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Send on WhatsApp
              </a>
            </Button>
          ) : (
            <Button variant="whatsapp" size="brandSm" onClick={closeOrderPreview}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
