import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MultiImageUploadProps {
  mainImage: string;
  images: string[];
  onMainChange: (url: string) => void;
  onImagesChange: (urls: string[]) => void;
}

const convertToWebP = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas not supported");
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject("Conversion failed")),
        "image/webp",
        0.85
      );
    };
    img.onerror = () => reject("Image load failed");
    img.src = URL.createObjectURL(file);
  });
};

export default function ImageUpload({ mainImage, images, onMainChange, onImagesChange }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const allImages = [mainImage, ...(images || [])].filter(Boolean);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const imageFiles = files.filter(f => f.type.startsWith("image/"));
    if (!imageFiles.length) {
      toast({ title: "শুধু ইমেজ ফাইল আপলোড করুন", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of imageFiles) {
        const webpBlob = await convertToWebP(file);
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

        const { error } = await supabase.storage
          .from("product-images")
          .upload(fileName, webpBlob, { contentType: "image/webp" });
        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        uploadedUrls.push(urlData.publicUrl);
      }

      // If no main image yet, set first uploaded as main
      if (!mainImage && uploadedUrls.length > 0) {
        onMainChange(uploadedUrls[0]);
        onImagesChange([...(images || []), ...uploadedUrls.slice(1)]);
      } else {
        onImagesChange([...(images || []), ...uploadedUrls]);
      }

      toast({ title: `${uploadedUrls.length}টি ইমেজ আপলোড হয়েছে ✅` });
    } catch (err: any) {
      toast({ title: "আপলোড ব্যর্থ", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = (url: string) => {
    if (url === mainImage) {
      // Promote first gallery image to main
      const remaining = (images || []).filter(i => i !== url);
      onMainChange(remaining[0] || "");
      onImagesChange(remaining.slice(1));
    } else {
      onImagesChange((images || []).filter(i => i !== url));
    }
  };

  const setAsMain = (url: string) => {
    if (url === mainImage) return;
    // Current main goes to gallery, clicked one becomes main
    const newImages = [mainImage, ...(images || [])].filter(i => i && i !== url);
    onMainChange(url);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-3">
      {allImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allImages.map((url, i) => (
            <div key={url + i} className="relative group">
              <div className={`w-24 h-24 rounded-lg overflow-hidden border-2 ${url === mainImage ? 'border-primary' : 'border-border'}`}>
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
              {url === mainImage && (
                <span className="absolute -top-1 -left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  মেইন
                </span>
              )}
              <div className="absolute top-0 right-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {url !== mainImage && (
                  <button
                    type="button"
                    onClick={() => setAsMain(url)}
                    title="মেইন ইমেজ করুন"
                    className="bg-primary text-white rounded-full p-1 hover:bg-primary/80"
                  >
                    <Star className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="bg-destructive text-white rounded-full p-1 hover:bg-destructive/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleUpload}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
        {uploading ? "আপলোড হচ্ছে..." : "ইমেজ আপলোড"}
      </Button>
      <p className="text-xs text-muted-foreground">একাধিক ইমেজ সিলেক্ট করতে পারেন। হোভার করে ⭐ চাপলে মেইন ইমেজ সেট হবে।</p>
    </div>
  );
}
