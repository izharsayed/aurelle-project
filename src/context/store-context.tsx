import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem, InquiryRecord, Product } from "@/data/types";
import { products as defaultProducts } from "@/data/products";
import { buildOrderMessage, buildWhatsAppUrl, type OrderIntent } from "@/lib/whatsapp";
import { toast } from "sonner";

const WISHLIST_KEY = "aurelle.wishlist";
const CART_KEY = "aurelle.cart";
const CATALOG_KEY = "aurelle.catalog.v1";
const INQUIRIES_KEY = "aurelle.inquiries";
const WHATSAPP_KEY = "aurelle.whatsapp_number";
const THEME_KEY = "aurelle.theme";

interface StoreValue {
  // Shopping Cart & Bag
  cart: CartItem[];
  addToCart: (product: Product, color?: string, quantity?: number) => void;
  updateCartQuantity: (productId: string, color: string | undefined, quantity: number) => void;
  removeFromCart: (productId: string, color?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;

  // Wishlist
  wishlist: string[];
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;

  // Search & Modals
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  quickView: Product | null;
  setQuickView: (product: Product | null) => void;
  orderPreview: { message: string; product: Product; whatsappNumber?: string | undefined } | null;
  requestOrder: (intent: OrderIntent) => void;
  closeOrderPreview: () => void;

  // Catalog Management (Admin)
  products: Product[];
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  resetCatalog: () => void;

  // Inquiries & Leads (Admin)
  inquiries: InquiryRecord[];
  deleteInquiry: (id: string) => void;
  clearInquiries: () => void;

  // Store Settings (Admin)
  whatsappNumber: string;
  setWhatsappNumber: (num: string) => void;

  // Theme (Dark / Light)
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [orderPreview, setOrderPreview] = useState<StoreValue["orderPreview"]>(null);

  // Dynamic Catalog state
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [whatsappNumber, setWhatsappNumberState] = useState<string>("");

  // Theme state
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  // Read client localStorage on mount to maintain stable SSR hydration
  useEffect(() => {
    try {
      const savedWishlist = window.localStorage.getItem(WISHLIST_KEY);
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist) as string[]);

      const savedCart = window.localStorage.getItem(CART_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart) as CartItem[];
        if (Array.isArray(parsed)) setCart(parsed);
      }

      const savedCatalog = window.localStorage.getItem(CATALOG_KEY);
      if (savedCatalog) {
        const parsed = JSON.parse(savedCatalog) as Product[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        }
      }

      const savedInquiries = window.localStorage.getItem(INQUIRIES_KEY);
      if (savedInquiries) {
        setInquiries(JSON.parse(savedInquiries) as InquiryRecord[]);
      }

      const savedWa = window.localStorage.getItem(WHATSAPP_KEY);
      if (savedWa) {
        setWhatsappNumberState(savedWa);
      }

      const savedTheme = window.localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
      if (savedTheme) {
        setThemeState(savedTheme);
        if (savedTheme === "dark") document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      } else if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setThemeState("dark");
        document.documentElement.classList.add("dark");
      }
    } catch {
      /* ignore storage access errors */
    }
  }, []);

  // Sync wishlist
  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      /* ignore */
    }
  }, [wishlist]);

  // Sync cart
  useEffect(() => {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  // Cart totals & metrics
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + (item.salePrice ?? item.price) * item.quantity, 0),
    [cart],
  );

  // Cart actions
  const addToCart = useCallback((product: Product, color?: string, quantity: number = 1) => {
    const chosenColor = color || product.colors[0]?.name || "Standard";
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === product.id && i.color === chosenColor,
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex]!;
        const newQty = Math.min(10, existing.quantity + quantity);
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
        };
        return updated;
      }

      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        salePrice: product.salePrice,
        image: product.images[0] || "",
        color: chosenColor,
        quantity: Math.min(10, Math.max(1, quantity)),
      };
      return [newItem, ...prev];
    });

    toast.success("Added to shopping bag", {
      description: `${product.name}${chosenColor ? ` • ${chosenColor}` : ""}`,
    });
    setCartOpen(true);
  }, []);

  const updateCartQuantity = useCallback(
    (productId: string, color: string | undefined, quantity: number) => {
      setCart((prev) => {
        if (quantity <= 0) {
          return prev.filter((i) => !(i.productId === productId && i.color === color));
        }
        return prev.map((i) =>
          i.productId === productId && i.color === color
            ? { ...i, quantity: Math.min(10, Math.max(1, quantity)) }
            : i,
        );
      });
    },
    [],
  );

  const removeFromCart = useCallback((productId: string, color?: string) => {
    setCart((prev) => {
      const match = prev.find((i) => i.productId === productId && i.color === color);
      if (match) {
        toast.info("Piece removed from shopping bag", { description: match.name });
      }
      return prev.filter((i) => !(i.productId === productId && i.color === color));
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    try {
      window.localStorage.removeItem(CART_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  // Sync catalog
  const saveCatalog = useCallback((next: Product[]) => {
    setProducts(next);
    try {
      window.localStorage.setItem(CATALOG_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  // Sync inquiries
  const saveInquiries = useCallback((next: InquiryRecord[]) => {
    setInquiries(next);
    try {
      window.localStorage.setItem(INQUIRIES_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  // Wishlist actions
  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prev) =>
      prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id],
    );
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    setWishlist((prev) => prev.filter((item) => item !== id));
  }, []);

  const clearWishlist = useCallback(() => setWishlist([]), []);

  // Catalog actions
  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      setProducts((prev) => {
        const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
        try {
          window.localStorage.setItem(CATALOG_KEY, JSON.stringify(updated));
        } catch {
          /* ignore */
        }
        return updated;
      });
    },
    [],
  );

  const addProduct = useCallback(
    (newProd: Product) => {
      setProducts((prev) => {
        const updated = [newProd, ...prev];
        try {
          window.localStorage.setItem(CATALOG_KEY, JSON.stringify(updated));
        } catch {
          /* ignore */
        }
        return updated;
      });
    },
    [],
  );

  const deleteProduct = useCallback(
    (id: string) => {
      setProducts((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        try {
          window.localStorage.setItem(CATALOG_KEY, JSON.stringify(updated));
        } catch {
          /* ignore */
        }
        return updated;
      });
    },
    [],
  );

  const resetCatalog = useCallback(() => {
    setProducts(defaultProducts);
    try {
      window.localStorage.removeItem(CATALOG_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  // Order & Inquiry actions
  const requestOrder = useCallback(
    (intent: OrderIntent) => {
      const msg = buildOrderMessage(intent);
      const url = buildWhatsAppUrl(msg, whatsappNumber);

      // Log inquiry record for Admin
      const record: InquiryRecord = {
        id: `inq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        productName: intent.product.name,
        productSku: intent.product.sku,
        category: intent.product.category,
        finish: intent.color,
        quantity: intent.quantity ?? 1,
        totalPrice: (intent.product.salePrice ?? intent.product.price) * (intent.quantity ?? 1),
        message: msg,
      };

      setInquiries((prev) => {
        const updated = [record, ...prev];
        try {
          window.localStorage.setItem(INQUIRIES_KEY, JSON.stringify(updated));
        } catch {
          /* ignore */
        }
        return updated;
      });

      // Automatically open WhatsApp with product details
      if (typeof window !== "undefined") {
        toast.success("Opening WhatsApp...", {
          description: `${intent.product.name}${intent.color ? ` • ${intent.color}` : ""}`,
        });

        const newWindow = window.open(url, "_blank", "noopener,noreferrer");

        // If pop-up blocker intervened, provide modal fallback
        if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
          setOrderPreview({
            message: msg,
            product: intent.product,
            whatsappNumber: whatsappNumber || undefined,
          });
        }
      }
    },
    [whatsappNumber],
  );

  const deleteInquiry = useCallback((id: string) => {
    setInquiries((prev) => {
      const updated = prev.filter((inq) => inq.id !== id);
      try {
        window.localStorage.setItem(INQUIRIES_KEY, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      return updated;
    });
  }, []);

  const clearInquiries = useCallback(() => {
    saveInquiries([]);
  }, [saveInquiries]);

  const setWhatsappNumber = useCallback((num: string) => {
    setWhatsappNumberState(num);
    try {
      window.localStorage.setItem(WHATSAPP_KEY, num);
    } catch {
      /* ignore */
    }
  }, []);

  const setTheme = useCallback((nextTheme: "light" | "dark") => {
    setThemeState(nextTheme);
    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      /* ignore */
    }
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch {
        /* ignore */
      }
      if (next === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      // Cart
      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      cartCount,
      cartOpen,
      setCartOpen,

      // Wishlist
      wishlist,
      isWishlisted: (id) => wishlist.includes(id),
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
      searchOpen,
      setSearchOpen,
      quickView,
      setQuickView,
      orderPreview,
      requestOrder,
      closeOrderPreview: () => setOrderPreview(null),
      products,
      updateProduct,
      addProduct,
      deleteProduct,
      resetCatalog,
      inquiries,
      deleteInquiry,
      clearInquiries,
      whatsappNumber,
      setWhatsappNumber,
      theme,
      toggleTheme,
      setTheme,
    }),
    [
      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      cartCount,
      cartOpen,
      setCartOpen,
      wishlist,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
      searchOpen,
      quickView,
      orderPreview,
      requestOrder,
      products,
      updateProduct,
      addProduct,
      deleteProduct,
      resetCatalog,
      inquiries,
      deleteInquiry,
      clearInquiries,
      whatsappNumber,
      setWhatsappNumber,
      theme,
      toggleTheme,
      setTheme,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function useTheme() {
  const { theme, toggleTheme, setTheme } = useStore();
  return { theme, toggleTheme, setTheme };
}


