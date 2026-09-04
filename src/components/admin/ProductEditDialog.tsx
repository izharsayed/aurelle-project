import { useState, useEffect } from "react";
import type { CategorySlug, Product } from "@/data/types";
import { categories } from "@/data/categories";
import { ImagePicker } from "@/components/admin/ImagePicker";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ProductEditDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<Product>) => void;
}

export function ProductEditDialog({
  product,
  open,
  onOpenChange,
  onSave,
}: ProductEditDialogProps) {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [tagsInput, setTagsInput] = useState("");
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price,
        salePrice: product.salePrice,
        inStock: product.inStock,
        featured: product.featured,
        newArrival: product.newArrival,
        bestSeller: product.bestSeller,
        material: product.material,
        care: product.care,
        description: product.description,
        collection: product.collection,
      });
      setTagsInput(product.tags ? product.tags.join(", ") : "");
      setImages(product.images || []);
    }
  }, [product]);

  if (!product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error("Product name is required");
      return;
    }

    const price = Number(formData.price);
    if (isNaN(price) || price < 0) {
      toast.error("Please provide a valid price");
      return;
    }

    const salePrice =
      formData.salePrice === null || formData.salePrice === undefined || formData.salePrice === ("" as any)
        ? null
        : Number(formData.salePrice);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    onSave(product.id, {
      ...formData,
      price,
      salePrice: salePrice && !isNaN(salePrice) ? salePrice : null,
      tags,
      images: images.length > 0 ? images : product.images,
    });

    toast.success(`Updated "${formData.name}"`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Edit Product</DialogTitle>
          <DialogDescription>
            Modify jewelry details, images, pricing, and showcase flags. Changes sync to live storefront immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Images Section */}
          <ImagePicker images={images} onChange={setImages} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Product Title</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU Code</Label>
              <Input
                id="sku"
                value={formData.sku || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, category: val as CategorySlug }))
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price">Regular Price (₹ INR)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="1"
                value={formData.price ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="salePrice">Sale Price (Optional ₹)</Label>
              <Input
                id="salePrice"
                type="number"
                min="0"
                step="1"
                placeholder="Leave blank for regular price"
                value={formData.salePrice ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    salePrice: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="collection">Collection</Label>
              <Input
                id="collection"
                value={formData.collection || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, collection: e.target.value }))}
                placeholder="e.g. The Royal Heritage, Everyday Radiance"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. kundan, gold, bridal, necklace"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="desc">Short Description</Label>
              <Textarea
                id="desc"
                rows={2}
                value={formData.description || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="material">Materials & Finish</Label>
              <Input
                id="material"
                value={formData.material || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, material: e.target.value }))}
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Availability & Showcase Badges
            </h4>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2">
                <Label htmlFor="inStock" className="cursor-pointer text-xs font-medium">
                  In Stock
                </Label>
                <Switch
                  id="inStock"
                  checked={Boolean(formData.inStock)}
                  onCheckedChange={(c) => setFormData((prev) => ({ ...prev, inStock: c }))}
                />
              </div>

              <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2">
                <Label htmlFor="featured" className="cursor-pointer text-xs font-medium">
                  Featured
                </Label>
                <Switch
                  id="featured"
                  checked={Boolean(formData.featured)}
                  onCheckedChange={(c) => setFormData((prev) => ({ ...prev, featured: c }))}
                />
              </div>

              <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2">
                <Label htmlFor="newArrival" className="cursor-pointer text-xs font-medium">
                  New Arrival
                </Label>
                <Switch
                  id="newArrival"
                  checked={Boolean(formData.newArrival)}
                  onCheckedChange={(c) => setFormData((prev) => ({ ...prev, newArrival: c }))}
                />
              </div>

              <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2">
                <Label htmlFor="bestSeller" className="cursor-pointer text-xs font-medium">
                  Best Seller
                </Label>
                <Switch
                  id="bestSeller"
                  checked={Boolean(formData.bestSeller)}
                  onCheckedChange={(c) => setFormData((prev) => ({ ...prev, bestSeller: c }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default" className="bg-primary text-primary-foreground">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
