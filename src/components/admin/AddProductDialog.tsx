import { useState } from "react";
import type { CategorySlug, Product } from "@/data/types";
import { categories } from "@/data/categories";
import { img } from "@/data/images";
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

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (product: Product) => void;
}

export function AddProductDialog({ open, onOpenChange, onAdd }: AddProductDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategorySlug>("earrings");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [sku, setSku] = useState("");
  const [collection, setCollection] = useState("Timeless Elegance");
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState("18K gold-plated brass, anti-tarnish sealed");
  const [tagsInput, setTagsInput] = useState("");
  const [inStock, setInStock] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [newArrival, setNewArrival] = useState(true);

  const resetForm = () => {
    setName("");
    setCategory("earrings");
    setPrice("");
    setSalePrice("");
    setSku("");
    setCollection("Timeless Elegance");
    setImages([]);
    setDescription("");
    setMaterial("18K gold-plated brass, anti-tarnish sealed");
    setTagsInput("");
    setInStock(true);
    setFeatured(false);
    setNewArrival(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const numSale = salePrice.trim() ? Number(salePrice) : null;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const generatedId = `p-custom-${Date.now()}`;
    const generatedSku =
      sku.trim() || `AUR-${category.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    // Default fallback image if none were chosen
    const defaultImage =
      category === "earrings"
        ? img.earrings
        : category === "necklaces"
          ? img.necklaces
          : category === "bracelets"
            ? img.bracelets
            : category === "bangles"
              ? img.bangles
              : category === "rings"
                ? img.rings
                : img.bridalSet;

    const finalImages = images.length > 0 ? images : [defaultImage];

    const newProduct: Product = {
      id: generatedId,
      name: name.trim(),
      slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
      sku: generatedSku,
      category,
      price: numPrice,
      salePrice: numSale,
      description: description.trim() || `${name.trim()} crafted in fine detail.`,
      longDescription: description.trim() || `${name.trim()} crafted in fine detail.`,
      material: material.trim(),
      care: "Wear last, remove first. Keep away from water and perfume. Store in the Aurelle pouch.",
      colors: [
        { name: "Gold", hex: "#C8A96A" },
        { name: "Rose Gold", hex: "#D9A6A0" },
      ],
      images: finalImages,
      rating: 5.0,
      reviewCount: 1,
      featured,
      newArrival,
      bestSeller: false,
      inStock,
      tags: tags.length ? tags : ["jewelry", category],
      occasions: ["everyday", "party"],
      collection: collection.trim() || "Signature",
    };

    onAdd(newProduct);
    toast.success(`Published "${newProduct.name}" to catalog`);
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Add New Jewelry Piece</DialogTitle>
          <DialogDescription>
            Publish a new piece to the Aurelle catalog with your photos, pricing, and showcase flags.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Images Section */}
          <ImagePicker images={images} onChange={setImages} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="new-name">Product Title *</Label>
              <Input
                id="new-name"
                placeholder="e.g. Royal Polki Choker"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-category">Category *</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as CategorySlug)}>
                <SelectTrigger id="new-category">
                  <SelectValue />
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
              <Label htmlFor="new-sku">SKU Code (optional)</Label>
              <Input
                id="new-sku"
                placeholder="Auto-generated if blank"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-price">Price (₹ INR) *</Label>
              <Input
                id="new-price"
                type="number"
                min="1"
                placeholder="e.g. 3500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-sale">Sale Price (₹ Optional)</Label>
              <Input
                id="new-sale"
                type="number"
                min="1"
                placeholder="e.g. 2999"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="new-collection">Collection Name</Label>
              <Input
                id="new-collection"
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="new-tags">Tags (comma-separated)</Label>
              <Input
                id="new-tags"
                placeholder="polki, gold, bridal, necklace"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="new-desc">Description</Label>
              <Textarea
                id="new-desc"
                rows={2}
                placeholder="Hand-crafted bridal choker in 18K yellow gold tone..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Initial Flags
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2">
                <Label htmlFor="new-stock" className="cursor-pointer text-xs font-medium">
                  In Stock
                </Label>
                <Switch id="new-stock" checked={inStock} onCheckedChange={setInStock} />
              </div>

              <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2">
                <Label htmlFor="new-featured" className="cursor-pointer text-xs font-medium">
                  Featured
                </Label>
                <Switch id="new-featured" checked={featured} onCheckedChange={setFeatured} />
              </div>

              <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2">
                <Label htmlFor="new-arrival" className="cursor-pointer text-xs font-medium">
                  New Arrival
                </Label>
                <Switch id="new-arrival" checked={newArrival} onCheckedChange={setNewArrival} />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground">
              Publish Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
