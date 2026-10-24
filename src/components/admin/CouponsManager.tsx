import { useState, useEffect } from "react";
import type { Coupon, DiscountType } from "@/data/types";
import {
  Tag,
  Plus,
  RefreshCw,
  Trash2,
  Edit2,
  CheckCircle2,
  Percent,
  Coins,
  Sparkles,
  Copy,
  Check,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";

export function CouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("1999");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (err) {
      toast.error("Failed to load discount coupons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateDialog = () => {
    setEditingCoupon(null);
    setCode("");
    setDescription("");
    setDiscountType("PERCENTAGE");
    setDiscountValue("10");
    setMinOrderValue("1999");
    setMaxDiscountAmount("1000");
    setUsageLimit("");
    setExpiresAt("");
    setIsActive(true);
    setIsDialogOpen(true);
  };

  const openEditDialog = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDescription(c.description);
    setDiscountType(c.discountType);
    setDiscountValue(String(c.discountValue));
    setMinOrderValue(String(c.minOrderValue));
    setMaxDiscountAmount(c.maxDiscountAmount ? String(c.maxDiscountAmount) : "");
    setUsageLimit(c.usageLimit ? String(c.usageLimit) : "");
    setExpiresAt(c.expiresAt ? c.expiresAt.slice(0, 10) : "");
    setIsActive(c.isActive);
    setIsDialogOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please provide a valid coupon code.");
      return;
    }
    const val = Number(discountValue);
    if (isNaN(val) || val <= 0) {
      toast.error("Discount value must be greater than 0.");
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Coupon> & { code: string } = {
        code: code.trim().toUpperCase(),
        description: description.trim() || `Luxury discount: ${code.trim().toUpperCase()}`,
        discountType,
        discountValue: val,
        minOrderValue: Number(minOrderValue) || 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        isActive,
      };

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(
          editingCoupon
            ? `Updated coupon "${payload.code}"`
            : `Created luxury coupon "${payload.code}"`,
        );
        setIsDialogOpen(false);
        fetchCoupons();
      } else {
        toast.error(json.error || "Failed to save coupon.");
      }
    } catch {
      toast.error("Network error while saving coupon.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (couponCode: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Optimistic update
    setCoupons((prev) =>
      prev.map((c) => (c.code === couponCode ? { ...c, isActive: nextStatus } : c)),
    );

    try {
      const res = await fetch(`/api/admin/coupons/${encodeURIComponent(couponCode)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        nextStatus ? `Coupon "${couponCode}" activated` : `Coupon "${couponCode}" paused`,
      );
    } catch {
      // Revert optimistic update
      setCoupons((prev) =>
        prev.map((c) => (c.code === couponCode ? { ...c, isActive: currentStatus } : c)),
      );
      toast.error("Failed to update coupon status.");
    }
  };

  const handleDeleteCoupon = async (couponCode: string) => {
    try {
      const res = await fetch(`/api/admin/coupons/${encodeURIComponent(couponCode)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.info(`Deleted coupon "${couponCode}"`);
        setCoupons((prev) => prev.filter((c) => c.code !== couponCode));
      }
    } catch {
      toast.error("Failed to delete coupon.");
    }
  };

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    toast.success(`Copied "${couponCode}" to clipboard`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Metrics
  const activeCount = coupons.filter((c) => c.isActive).length;
  const totalRedemptions = coupons.reduce((acc, c) => acc + (c.usageCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Active Coupons
            </CardTitle>
            <Tag className="size-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{activeCount}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Across {coupons.length} total promotional vouchers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Redemptions
            </CardTitle>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{totalRedemptions}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Times customers saved with promo codes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Launch Starter Codes
            </CardTitle>
            <Sparkles className="size-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold flex items-center gap-1.5 text-foreground mt-1">
              <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-xs border border-border">
                ZARIKA10
              </span>
              <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-xs border border-border">
                ROYAL500
              </span>
              <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-xs border border-border">
                WELCOME100
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Ready for customer checkout</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Tag className="size-4 text-gold" />
              Promotional Coupons & Launch Vouchers
            </CardTitle>
            <CardDescription className="text-xs">
              Manage percentage (%) and flat (₹) discount codes with minimum cart thresholds and
              live redemption caps.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCoupons}
              disabled={loading}
              className="text-xs gap-1.5"
            >
              <RefreshCw className={loading ? "size-3.5 animate-spin" : "size-3.5"} />
              <span>Refresh</span>
            </Button>
            <Button
              size="sm"
              onClick={openCreateDialog}
              className="bg-primary text-primary-foreground text-xs gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>New Coupon</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-xs border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-medium">Coupon Code</TableHead>
                  <TableHead className="text-xs font-medium">Discount Value</TableHead>
                  <TableHead className="text-xs font-medium">Min Order Cart</TableHead>
                  <TableHead className="text-xs font-medium">Redemptions</TableHead>
                  <TableHead className="text-xs font-medium">Expiry</TableHead>
                  <TableHead className="text-xs font-medium text-center">Status</TableHead>
                  <TableHead className="text-xs font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      Loading promotional coupons...
                    </TableCell>
                  </TableRow>
                ) : coupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      No coupons created yet. Click "New Coupon" to launch your first promotional code.
                    </TableCell>
                  </TableRow>
                ) : (
                  coupons.map((c) => (
                    <TableRow key={c.code}>
                      {/* Code */}
                      <TableCell className="font-mono text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="bg-gold/10 border border-gold/30 text-gold px-2 py-0.5 rounded text-xs font-mono font-bold tracking-wider">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(c.code)}
                            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Copy Code"
                          >
                            {copiedCode === c.code ? (
                              <Check className="size-3 text-emerald-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-sans font-normal mt-1 max-w-xs truncate">
                          {c.description}
                        </p>
                      </TableCell>

                      {/* Discount Value */}
                      <TableCell className="text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                          {c.discountType === "PERCENTAGE" ? (
                            <>
                              <Percent className="size-3.5 text-accent" />
                              <span>{c.discountValue}% OFF</span>
                              {c.maxDiscountAmount && (
                                <span className="text-[10px] text-muted-foreground">
                                  (Up to {formatPrice(c.maxDiscountAmount)})
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <Coins className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>{formatPrice(c.discountValue)} FLAT OFF</span>
                            </>
                          )}
                        </div>
                      </TableCell>

                      {/* Min Order */}
                      <TableCell className="text-xs text-muted-foreground">
                        {c.minOrderValue > 0 ? (
                          <span>{formatPrice(c.minOrderValue)}</span>
                        ) : (
                          <span className="text-muted-foreground/70">No minimum</span>
                        )}
                      </TableCell>

                      {/* Redemptions */}
                      <TableCell className="text-xs">
                        <span className="font-semibold">{c.usageCount || 0}</span>
                        {c.usageLimit && (
                          <span className="text-muted-foreground text-[11px]"> / {c.usageLimit} max</span>
                        )}
                      </TableCell>

                      {/* Expiry */}
                      <TableCell className="text-xs text-muted-foreground">
                        {c.expiresAt ? (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar className="size-3" />
                            <span>{new Date(c.expiresAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/60">Never expires</span>
                        )}
                      </TableCell>

                      {/* Status Toggle */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={c.isActive}
                            onCheckedChange={() => handleToggleStatus(c.code, c.isActive)}
                          />
                          <span className={`text-[10px] uppercase font-bold tracking-wider ${c.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                            {c.isActive ? "Active" : "Paused"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(c)}
                            className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Edit Coupon"
                          >
                            <Edit2 className="size-3.5" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-destructive cursor-pointer"
                                title="Delete Coupon"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Coupon "{c.code}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to permanently delete this promotional code? Shoppers will no longer be able to apply it at checkout.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDeleteCoupon(c.code)}
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

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSaveCoupon} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl flex items-center gap-2">
                <Tag className="size-4 text-gold" />
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create Luxury Coupon"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure discount rules, cart thresholds, and redemption constraints.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              {/* Code */}
              <div className="space-y-1">
                <Label htmlFor="coupon-code">Coupon Code</Label>
                <Input
                  id="coupon-code"
                  placeholder="e.g. DIWALI15 or ROYAL500"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={Boolean(editingCoupon)}
                  required
                  className="font-mono uppercase font-bold"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label htmlFor="coupon-desc">Customer Description / Note</Label>
                <Input
                  id="coupon-desc"
                  placeholder="e.g. Festive Launch: 15% off on bridal chokers above ₹2,499"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Discount Type</Label>
                  <Select
                    value={discountType}
                    onValueChange={(val: DiscountType) => setDiscountType(val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                      <SelectItem value="FLAT">Flat Rupee (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="coupon-val">
                    {discountType === "PERCENTAGE" ? "Percentage (%)" : "Flat Amount (₹)"}
                  </Label>
                  <Input
                    id="coupon-val"
                    type="number"
                    min="1"
                    placeholder={discountType === "PERCENTAGE" ? "10" : "500"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="coupon-min">Min Order Subtotal (₹)</Label>
                  <Input
                    id="coupon-min"
                    type="number"
                    min="0"
                    placeholder="1999"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="coupon-max">
                    {discountType === "PERCENTAGE" ? "Max Discount Cap (₹)" : "Max Cap (Optional)"}
                  </Label>
                  <Input
                    id="coupon-max"
                    type="number"
                    min="0"
                    placeholder={discountType === "PERCENTAGE" ? "1000" : "None"}
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    disabled={discountType === "FLAT"}
                  />
                </div>
              </div>

              {/* Expiry & Usage Limit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="coupon-limit">Max Redemptions Limit</Label>
                  <Input
                    id="coupon-limit"
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="coupon-expiry">Expiry Date (Optional)</Label>
                  <Input
                    id="coupon-expiry"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="space-y-0.5">
                  <Label>Coupon Active Immediately</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Customers can immediately redeem this code at checkout.
                  </p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="bg-primary text-primary-foreground gap-1.5"
              >
                {saving && <RefreshCw className="size-3.5 animate-spin" />}
                <span>{editingCoupon ? "Save Changes" : "Create Coupon"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
