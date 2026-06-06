import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, Upload, X } from "lucide-react";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  maxSizeMB?: number;
  aspectHint?: string;
  previewClass?: string;
  required?: boolean;
}

/**
 * Reusable image upload field.
 * - Click the drop zone OR the Upload button to pick a file.
 * - File is converted to Base64 and stored as the value.
 * - Alternatively, a URL can be typed directly.
 * - Clear button removes the current value.
 */
export default function ImageUploadField({
  value,
  onChange,
  label = "ছবি",
  maxSizeMB = 3,
  aspectHint = "PNG, JPG, WebP",
  previewClass = "max-h-36 w-full rounded-lg object-contain px-3",
  required = false,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: `ফাইল সর্বোচ্চ ${maxSizeMB}MB হতে পারবে`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      onChange(base64);
      toast({ title: "ছবি লোড হয়েছে", description: "সেভ করুন বাটন চেপে সংরক্ষণ করুন।" });
    } catch {
      toast({ title: "ছবি লোড ব্যর্থ", variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    // Trigger via FileReader directly
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({ title: `ফাইল সর্বোচ্চ ${maxSizeMB}MB হতে পারবে`, variant: "destructive" });
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => { onChange(reader.result as string); setUploading(false); };
    reader.onerror = () => { toast({ title: "ছবি লোড ব্যর্থ", variant: "destructive" }); setUploading(false); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label}{required && <span className="ml-1 text-red-500">*</span>}
        </Label>
      )}

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`relative flex min-h-[130px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors focus:outline-none ${
          value
            ? "border-[#d64901]/30 bg-[#fff9f6]"
            : "border-[#e3e6de] bg-[#f7f8f6] hover:border-[#d64901]/50 hover:bg-[#fff9f6]"
        }`}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="preview"
              className={previewClass}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <span className="pb-1 text-xs text-[#9eada4]">ক্লিক করে পরিবর্তন করুন</span>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f3ee]">
              {uploading
                ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#d64901] border-t-transparent" />
                : <ImageIcon className="h-6 w-6 text-[#c8d5cc]" />
              }
            </div>
            <p className="text-sm font-medium text-[#627066]">
              {uploading ? "লোড হচ্ছে..." : "ক্লিক করুন বা ড্র্যাগ করুন"}
            </p>
            <p className="text-xs text-[#9eada4]">{aspectHint}</p>
            <p className="text-xs text-[#b0bcb5]">সর্বোচ্চ {maxSizeMB}MB</p>
          </>
        )}

        <div className="absolute bottom-2 right-2 opacity-40">
          <Upload className="h-3.5 w-3.5 text-[#627066]" />
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={handleFile}
        disabled={uploading}
      />

      {/* URL fallback input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="অথবা সরাসরি URL পেস্ট করুন: https://..."
            value={value?.startsWith("data:") ? "" : (value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className="pr-8 text-xs"
          />
          {value && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9eada4] hover:text-red-500"
              aria-label="ছবি সরান"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="shrink-0 gap-1.5 text-xs"
        >
          <Upload className="h-3.5 w-3.5" />
          {uploading ? "লোড..." : "আপলোড"}
        </Button>
      </div>
    </div>
  );
}
