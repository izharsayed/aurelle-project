import { useState, useRef } from "react";
import { ImagePlus, Link as LinkIcon, Trash2, Upload, Star, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { img } from "@/data/images";
import { toast } from "sonner";
import { compressImage, formatBytes, dataUrlToBlob } from "@/lib/image-compressor";

interface ImagePickerProps {
  images: string[];
  onChange: (images: string[]) => void;
}

// Preset images from Zarika's curated library
const PRESET_GALLERY = [
  { label: "Pearl Studs", src: img.pearlStuds },
  { label: "Gold Hoops", src: img.hoops },
  { label: "Kundan Choker", src: img.choker },
  { label: "Layered Necklace", src: img.layered },
  { label: "Gold Cuff", src: img.cuff },
  { label: "Kundan Bangles", src: img.kundanBangles },
  { label: "Statement Ring", src: img.statementRing },
  { label: "Bridal Suite", src: img.bridalSet },
  { label: "Earrings Showcase", src: img.earrings },
  { label: "Necklace Showcase", src: img.necklaces },
  { label: "Bracelets Showcase", src: img.bracelets },
  { label: "Rings Showcase", src: img.rings },
];

export function ImagePicker({ images, onChange }: ImagePickerProps) {
  const [urlInput, setUrlInput] = useState("");
  const [showPresets, setShowPresets] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Handle File Upload with Auto-Compression (Web-ready JPEG under 100 KB)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      try {
        // Automatically resize and compress image to web-ready JPEG (max 1200px, 82% quality)
        // Keeps file size around 50–90 KB, perfectly safe for Firestore's 1 MB document limit.
        const compressed = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.82,
        });

        // Try cloud upload if backend storage is configured
        let cloudUrl: string | null = null;
        try {
          const compressedBlob = dataUrlToBlob(compressed.dataUrl);
          const formData = new FormData();
          formData.append("file", compressedBlob, file.name.replace(/\.[^.]+$/, ".jpg"));

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = (await res.json()) as { url?: string };
            // If the server returned an external cloud URL (not the base64 fallback)
            if (data.url && !data.url.startsWith("data:")) {
              cloudUrl = data.url;
            }
          }
        } catch {
          // Cloud storage endpoint unavailable; continue with local compressed base64
        }

        const finalUrl = cloudUrl || compressed.dataUrl;
        uploadedUrls.push(finalUrl);

        console.log(
          `📸 [Image Compressed] ${file.name}: ${formatBytes(compressed.originalBytes)} → ${formatBytes(compressed.compressedBytes)}`,
        );
      } catch (err) {
        console.warn("⚠️ Compression error, trying raw file fallback:", err);
        // Fallback: Read client-side if canvas compression failed
        try {
          const readerPromise = new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.onerror = () => resolve("");
            reader.readAsDataURL(file);
          });
          const fallbackUrl = await readerPromise;
          if (fallbackUrl) uploadedUrls.push(fallbackUrl);
        } catch (e) {
          console.error("Failed to read file", e);
        }
      }
    }

    if (uploadedUrls.length > 0) {
      onChange([...images, ...uploadedUrls]);
      toast.success(
        `Optimized & added ${uploadedUrls.length} photo${uploadedUrls.length > 1 ? "s" : ""} to gallery`,
      );
    } else {
      toast.error("Failed to process image(s)");
    }

    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 2. Add via URL (with auto-compression if a raw data URL is pasted)
  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (
      !trimmed.startsWith("http://") &&
      !trimmed.startsWith("https://") &&
      !trimmed.startsWith("data:")
    ) {
      toast.error("Please enter a valid web URL (e.g. https://...)");
      return;
    }

    let finalUrl = trimmed;
    if (trimmed.startsWith("data:image/")) {
      try {
        const compressed = await compressImage(trimmed, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.82,
        });
        finalUrl = compressed.dataUrl;
      } catch (err) {
        console.warn("Could not compress pasted base64", err);
      }
    }

    onChange([...images, finalUrl]);
    setUrlInput("");
    toast.success("Image added to gallery");
  };

  // 3. Remove image
  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  // 4. Set as primary
  const handleSetPrimary = (index: number) => {
    if (index === 0 || !images[index]) return;
    const selected = images[index]!;
    const rest = images.filter((_, i) => i !== index);
    onChange([selected, ...rest]);
    toast.success("Primary image updated");
  };

  // 5. Select from Preset library
  const handleSelectPreset = (src: string) => {
    if (images.includes(src)) {
      toast.info("This image is already in your gallery");
      return;
    }
    onChange([...images, src]);
    toast.success("Added photo from library");
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card/60 p-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">
          Product Images ({images.length})
        </Label>
        <span className="text-[11px] text-muted-foreground">
          {images.length === 0 ? "At least 1 image recommended" : "First image is the card cover"}
        </span>
      </div>

      {/* Image Thumbnails Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((imgSrc, idx) => (
            <div
              key={`${imgSrc.slice(0, 30)}-${idx}`}
              className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
            >
              <img
                src={imgSrc}
                alt={`Preview ${idx + 1}`}
                className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
              />

              {/* Primary badge */}
              {idx === 0 ? (
                <Badge
                  variant="default"
                  className="absolute top-1.5 left-1.5 bg-ink text-ink-foreground text-[10px] px-1.5 py-0 h-5"
                >
                  Primary
                </Badge>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-1.5 left-1.5 size-6 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 hover:bg-background"
                  onClick={() => handleSetPrimary(idx)}
                  title="Make Primary Image"
                >
                  <Star className="size-3 text-gold" />
                </Button>
              )}

              {/* Delete button */}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1.5 right-1.5 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(idx)}
                title="Remove image"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Controls */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* File Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-medium"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-3.5 text-accent" />
            {isProcessing ? "Optimizing & uploading..." : "Upload from Computer"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-medium"
            onClick={() => setShowPresets(!showPresets)}
          >
            <Library className="size-3.5 text-gold" />
            {showPresets ? "Hide Library" : "Choose from Library"}
          </Button>
        </div>

        {/* Paste URL row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Or paste an image web URL (https://...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="pl-8 text-xs h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddUrl(e);
                }
              }}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="text-xs h-9"
            onClick={handleAddUrl}
          >
            <ImagePlus className="size-3.5 mr-1" />
            Add URL
          </Button>
        </div>

        {/* Curated Library Drawer */}
        {showPresets && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2 mt-2">
            <p className="text-[11px] font-medium text-muted-foreground">
              Click any high-resolution jewelry asset to add it to this product:
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 max-h-48 overflow-y-auto pr-1">
              {PRESET_GALLERY.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectPreset(preset.src)}
                  className="group relative flex flex-col items-center rounded border border-border bg-card p-1 text-left hover:border-accent transition-colors"
                >
                  <img
                    src={preset.src}
                    alt={preset.label}
                    className="size-16 w-full rounded object-cover"
                  />
                  <span className="mt-1 text-[10px] text-muted-foreground truncate w-full text-center group-hover:text-foreground">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
