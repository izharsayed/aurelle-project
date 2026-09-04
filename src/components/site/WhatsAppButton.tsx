import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/store-context";
import type { Product } from "@/data/types";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  product: Product;
  color?: string | undefined;
  quantity?: number | undefined;
  className?: string | undefined;
  size?: "brand" | "brandSm" | undefined;
  label?: string | undefined;
  variant?: "whatsapp" | "line" | "ink" | undefined;
}

/** Opens a preview of the message that will later be sent through wa.me. */
export function WhatsAppButton({
  product,
  color,
  quantity = 1,
  className,
  size = "brandSm",
  label = "Order on WhatsApp",
  variant = "whatsapp",
}: WhatsAppButtonProps) {
  const { requestOrder } = useStore();
  const disabled = !product.inStock;

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      className={cn("w-full", className)}
      onClick={() => requestOrder({ product, color, quantity })}
    >
      <MessageCircle aria-hidden strokeWidth={1.5} />
      {disabled ? "Out of stock" : label}
    </Button>
  );
}
