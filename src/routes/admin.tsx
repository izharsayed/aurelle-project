import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Archive,
  Check,
  Edit2,
  ExternalLink,
  Eye,
  KeyRound,
  Layers,
  Lock,
  MessageCircle,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductEditDialog } from "@/components/admin/ProductEditDialog";
import { AddProductDialog } from "@/components/admin/AddProductDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useStore } from "@/context/store-context";
import { categories } from "@/data/categories";
import { formatPrice } from "@/lib/format";
import type { CategorySlug, Product } from "@/data/types";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Velora — Admin Management Portal" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const PIN_STORAGE_KEY = "aurelle.admin.pin";
const AUTH_SESSION_KEY = "aurelle.admin.authed";
const DEFAULT_PIN = "1234";

function AdminPage() {
  const {
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
  } = useStore();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // Product Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");

  // Dialogs
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Settings State
  const [customWaInput, setCustomWaInput] = useState(whatsappNumber);
  const [currentPinInput, setCurrentPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");

  // Check session storage on mount
  useEffect(() => {
    try {
      const isAuthed = window.sessionStorage.getItem(AUTH_SESSION_KEY) === "true";
      setIsAuthenticated(isAuthed);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setCustomWaInput(whatsappNumber);
  }, [whatsappNumber]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPin = window.localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
    if (pinInput.trim() === storedPin) {
      try {
        window.sessionStorage.setItem(AUTH_SESSION_KEY, "true");
      } catch {
        /* ignore */
      }
      setIsAuthenticated(true);
      setPinError("");
      toast.success("Welcome to Velora Admin");
    } else {
      setPinError("Incorrect PIN. Please try again.");
    }
  };

  const handleLogout = () => {
    try {
      window.sessionStorage.removeItem(AUTH_SESSION_KEY);
    } catch {
      /* ignore */
    }
    setIsAuthenticated(false);
    setPinInput("");
    toast.info("Admin session locked");
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPin = window.localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
    if (currentPinInput.trim() !== storedPin) {
      toast.error("Current PIN is incorrect");
      return;
    }
    if (newPinInput.trim().length < 4) {
      toast.error("New PIN must be at least 4 digits");
      return;
    }
    try {
      window.localStorage.setItem(PIN_STORAGE_KEY, newPinInput.trim());
      toast.success("Admin PIN successfully updated");
      setCurrentPinInput("");
      setNewPinInput("");
    } catch {
      toast.error("Failed to save new PIN");
    }
  };

  const handleSaveWaNumber = (e: React.FormEvent) => {
    e.preventDefault();
    setWhatsappNumber(customWaInput.trim());
    toast.success("WhatsApp concierge number updated");
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = categoryFilter === "all" || p.category === categoryFilter;
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in_stock" && p.inStock) ||
        (stockFilter === "out_of_stock" && !p.inStock);

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  // Statistics
  const totalStockCount = useMemo(() => products.filter((p) => p.inStock).length, [products]);
  const outOfStockCount = products.length - totalStockCount;
  const totalCatalogValue = useMemo(
    () => products.reduce((acc, p) => acc + (p.salePrice ?? p.price), 0),
    [products],
  );

  // 1. PIN Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Lock className="size-5" />
            </div>
            <CardTitle className="font-serif text-3xl font-normal tracking-wide">
              Velora Admin
            </CardTitle>
            <CardDescription className="text-sm">
              Enter your manager passcode to access catalog management and customer orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="pin" className="text-xs font-semibold uppercase tracking-wider">
                  Passcode / PIN
                </Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter 4-digit PIN"
                  maxLength={10}
                  className="text-center font-mono text-lg tracking-widest"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError("");
                  }}
                  autoFocus
                  required
                />
                {pinError && <p className="text-xs font-medium text-destructive">{pinError}</p>}
                <p className="text-xs text-muted-foreground text-center">
                  Default passcode: <span className="font-mono font-medium text-foreground">1234</span>
                </p>
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground">
                Unlock Portal
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. Authenticated Dashboard
  return (
    <div className="min-h-screen pb-16">
      <AdminHeader
        productCount={products.length}
        inquiryCount={inquiries.length}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-serif text-3xl font-light text-foreground sm:text-4xl">
                Store Dashboard
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your jewelry catalog, customer inquiries, and storefront settings.
              </p>
            </div>

            <TabsList className="bg-muted p-1 rounded-md">
              <TabsTrigger value="overview" className="gap-1.5 text-xs">
                <TrendingUp className="size-3.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="catalog" className="gap-1.5 text-xs">
                <Package className="size-3.5" />
                Catalog ({products.length})
              </TabsTrigger>
              <TabsTrigger value="inquiries" className="gap-1.5 text-xs">
                <MessageCircle className="size-3.5" />
                Inquiries ({inquiries.length})
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1.5 text-xs">
                <Settings className="size-3.5" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Total Products
                  </CardTitle>
                  <Package className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">{products.length}</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Across {categories.length} jewelry categories
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    In Stock
                  </CardTitle>
                  <Sparkles className="size-4 text-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-foreground">{totalStockCount}</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {outOfStockCount > 0 ? (
                      <span className="text-destructive font-medium">
                        {outOfStockCount} pieces out of stock
                      </span>
                    ) : (
                      "All pieces currently available"
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    WhatsApp Inquiries
                  </CardTitle>
                  <MessageCircle className="size-4 text-whatsapp" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">{inquiries.length}</div>
                  <p className="mt-1 text-xs text-muted-foreground">Customer order intent leads</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Avg Item Price
                  </CardTitle>
                  <TrendingUp className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">
                    {products.length ? formatPrice(Math.round(totalCatalogValue / products.length)) : "₹0"}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Catalog average value</p>
                </CardContent>
              </Card>
            </div>

            {/* Category distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Category Breakdown</CardTitle>
                <CardDescription className="text-xs">
                  Distribution of pieces across core collections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {categories.map((cat) => {
                    const count = products.filter((p) => p.category === cat.slug).length;
                    return (
                      <div
                        key={cat.slug}
                        className="flex flex-col justify-between rounded-lg border border-border bg-card p-3"
                      >
                        <span className="text-xs font-medium text-muted-foreground capitalize">
                          {cat.name}
                        </span>
                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-2xl font-semibold text-foreground">{count}</span>
                          <span className="text-xs text-muted-foreground">items</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent inquiries preview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Recent Order Inquiries</CardTitle>
                  <CardDescription className="text-xs">
                    Latest customer intent messages generated from the storefront
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {inquiries.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No customer inquiries logged yet. When a visitor clicks "Order on WhatsApp",
                    it will appear here automatically.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inquiries.slice(0, 5).map((inq) => (
                      <div
                        key={inq.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border bg-card p-3 gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {inq.productName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            SKU: {inq.productSku} • Qty: {inq.quantity} • Finish: {inq.finish || "Standard"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 sm:text-right">
                          <span className="text-sm font-semibold text-foreground">
                            {formatPrice(inq.totalPrice)}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(inq.timestamp).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: CATALOG MANAGEMENT */}
          <TabsContent value="catalog" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Product Catalog</CardTitle>
                    <CardDescription className="text-xs">
                      Edit details, update pricing, and toggle live stock availability.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                          <RefreshCw className="size-3.5" />
                          Reset Defaults
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset Catalog to Initial Seed Data?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will revert all custom products, pricing changes, and stock toggles back
                            to the initial Velora catalog.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              resetCatalog();
                              toast.success("Catalog reset to initial data");
                            }}
                          >
                            Reset Catalog
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button
                      size="sm"
                      onClick={() => setIsAddOpen(true)}
                      className="gap-1.5 text-xs bg-primary text-primary-foreground"
                    >
                      <Plus className="size-3.5" />
                      Add Product
                    </Button>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search title, SKU, tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stock Status</SelectItem>
                      <SelectItem value="in_stock">In Stock Only</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-xs font-semibold uppercase tracking-wider">
                        <TableHead className="w-16">Item</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-center">In Stock</TableHead>
                        <TableHead className="text-center">Featured</TableHead>
                        <TableHead className="text-center">New</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                            No products match your current filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProducts.map((prod) => (
                          <TableRow key={prod.id}>
                            <TableCell>
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="size-11 rounded object-cover border border-border bg-muted"
                                loading="lazy"
                              />
                            </TableCell>

                            <TableCell>
                              <div className="min-w-44">
                                <p className="font-medium text-foreground text-sm leading-tight">
                                  {prod.name}
                                </p>
                                <span className="font-mono text-[11px] text-muted-foreground">
                                  {prod.sku}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge variant="outline" className="text-xs font-normal capitalize">
                                {prod.category}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <div>
                                <span className="font-semibold text-sm text-foreground">
                                  {formatPrice(prod.salePrice ?? prod.price)}
                                </span>
                                {prod.salePrice && (
                                  <span className="block text-xs line-through text-muted-foreground">
                                    {formatPrice(prod.price)}
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="text-center">
                              <Switch
                                checked={prod.inStock}
                                onCheckedChange={(val) => {
                                  updateProduct(prod.id, { inStock: val });
                                  toast.success(
                                    `"${prod.name}" marked ${val ? "In Stock" : "Out of Stock"}`,
                                  );
                                }}
                              />
                            </TableCell>

                            <TableCell className="text-center">
                              <Switch
                                checked={prod.featured}
                                onCheckedChange={(val) => {
                                  updateProduct(prod.id, { featured: val });
                                  toast.success(
                                    `"${prod.name}" ${val ? "marked as Featured" : "removed from Featured"}`,
                                  );
                                }}
                              />
                            </TableCell>

                            <TableCell className="text-center">
                              <Switch
                                checked={prod.newArrival}
                                onCheckedChange={(val) => {
                                  updateProduct(prod.id, { newArrival: val });
                                  toast.success(
                                    `"${prod.name}" ${val ? "marked as New Arrival" : "removed from New Arrivals"}`,
                                  );
                                }}
                              />
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => setEditingProduct(prod)}
                                  title="Edit details"
                                >
                                  <Edit2 className="size-3.5" />
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8 text-muted-foreground hover:text-destructive"
                                      title="Delete piece"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to remove "{prod.name}" ({prod.sku}) from the catalog?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={() => {
                                          deleteProduct(prod.id);
                                          toast.info(`Deleted "${prod.name}"`);
                                        }}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: INQUIRIES & LEADS */}
          <TabsContent value="inquiries" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">WhatsApp Order Leads</CardTitle>
                  <CardDescription className="text-xs">
                    Logged when shoppers click "Order on WhatsApp" across product pages.
                  </CardDescription>
                </div>
                {inquiries.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clearInquiries();
                      toast.info("Cleared all inquiry records");
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive gap-1.5"
                  >
                    <Trash2 className="size-3.5" />
                    Clear All
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-xs font-semibold uppercase tracking-wider">
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Product Requested</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Finish</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inquiries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                            No inquiries recorded yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        inquiries.map((inq) => (
                          <TableRow key={inq.id}>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(inq.timestamp).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                            <TableCell className="font-medium text-sm text-foreground">
                              {inq.productName}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {inq.productSku}
                            </TableCell>
                            <TableCell className="text-xs capitalize text-muted-foreground">
                              {inq.finish || "Standard"}
                            </TableCell>
                            <TableCell className="text-xs text-foreground font-medium">
                              {inq.quantity}
                            </TableCell>
                            <TableCell className="font-semibold text-xs text-foreground">
                              {formatPrice(inq.totalPrice)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteInquiry(inq.id)}
                                title="Remove record"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: SETTINGS */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* WhatsApp Concierge Number */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <MessageCircle className="size-4 text-whatsapp" />
                    WhatsApp Concierge Phone
                  </CardTitle>
                  <CardDescription className="text-xs">
                    The business phone number where customer WhatsApp orders will be sent.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveWaNumber} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="waNum" className="text-xs">
                        Phone Number (with Country Code)
                      </Label>
                      <Input
                        id="waNum"
                        placeholder="e.g. 919876543210"
                        value={customWaInput}
                        onChange={(e) => setCustomWaInput(e.target.value)}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Include country code without "+" or spaces (e.g. 91 for India). Leave blank
                        for preview modal only.
                      </p>
                    </div>
                    <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                      Save WhatsApp Number
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Admin Passcode / PIN */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <KeyRound className="size-4 text-accent" />
                    Change Admin PIN
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Update the security passcode required to access this portal.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePin} className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="currPin" className="text-xs">
                        Current PIN
                      </Label>
                      <Input
                        id="currPin"
                        type="password"
                        placeholder="Current PIN (default is 1234)"
                        value={currentPinInput}
                        onChange={(e) => setCurrentPinInput(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="nextPin" className="text-xs">
                        New PIN
                      </Label>
                      <Input
                        id="nextPin"
                        type="password"
                        placeholder="New PIN (min 4 digits)"
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" size="sm" variant="outline">
                      Update Passcode
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Product Modal */}
      <ProductEditDialog
        product={editingProduct}
        open={Boolean(editingProduct)}
        onOpenChange={(open) => !open && setEditingProduct(null)}
        onSave={updateProduct}
      />

      {/* Add Product Modal */}
      <AddProductDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAdd={addProduct}
      />
    </div>
  );
}
