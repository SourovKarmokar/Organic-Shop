import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Variant {
  id?: string;
  size_name: string;
  size_value: string;
  price: number | null;
  stock_quantity: number;
  sku: string;
  is_active: boolean;
}

interface VariantManagerProps {
  productId: string;
}

export default function VariantManager({ productId }: VariantManagerProps) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const fetchVariants = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("product_variants")
      .select("*, sizes(name, value)")
      .eq("product_id", productId)
      .order("created_at");

    const mapped = (data || []).map((v: any) => ({
      id: v.id,
      size_name: v.sizes?.name || "",
      size_value: v.sizes?.value || "",
      price: v.price,
      stock_quantity: v.stock_quantity || 0,
      sku: v.sku || "",
      is_active: v.is_active ?? true,
    }));
    setVariants(mapped);
    setLoading(false);
  };

  const addVariant = () => {
    setVariants([...variants, { size_name: "", size_value: "", price: null, stock_quantity: 0, sku: "", is_active: true }]);
  };

  const removeVariant = async (index: number) => {
    const v = variants[index];
    if (v.id) {
      await supabase.from("product_variants").delete().eq("id", v.id);
    }
    setVariants(variants.filter((_, i) => i !== index));
    toast({ title: "ভ্যারিয়েন্ট মুছে ফেলা হয়েছে" });
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const updated = [...variants];
    (updated[index] as any)[field] = value;
    setVariants(updated);
  };

  const saveVariants = async () => {
    try {
      for (const v of variants) {
        if (!v.size_name.trim()) continue;

        // Find or create size
        let sizeId: string;
        const { data: existingSize } = await supabase
          .from("sizes")
          .select("id")
          .eq("name", v.size_name.trim())
          .maybeSingle();

        if (existingSize) {
          sizeId = existingSize.id;
        } else {
          const { data: newSize } = await supabase
            .from("sizes")
            .insert({ name: v.size_name.trim(), value: v.size_value.trim() || null })
            .select("id")
            .single();
          if (!newSize) continue;
          sizeId = newSize.id;
        }

        if (v.id) {
          await supabase.from("product_variants").update({
            size_id: sizeId,
            price: v.price,
            stock_quantity: v.stock_quantity,
            sku: v.sku || null,
            is_active: v.is_active,
          }).eq("id", v.id);
        } else {
          const { data: inserted } = await supabase.from("product_variants").insert({
            product_id: productId,
            size_id: sizeId,
            price: v.price,
            stock_quantity: v.stock_quantity,
            sku: v.sku || null,
            is_active: v.is_active,
          }).select("id").single();
          if (inserted) v.id = inserted.id;
        }
      }
      toast({ title: "ভ্যারিয়েন্ট সেভ হয়েছে ✅" });
    } catch (err: any) {
      toast({ title: "সেভ ব্যর্থ", description: err.message, variant: "destructive" });
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>;

  return (
    <div className="space-y-3 border-t pt-4 mt-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">ভ্যারিয়েন্ট (ওজন/সাইজ)</Label>
        <Button type="button" variant="outline" size="sm" onClick={addVariant}>
          <Plus className="w-4 h-4 mr-1" /> যোগ করুন
        </Button>
      </div>

      {variants.length === 0 && (
        <p className="text-sm text-muted-foreground">কোনো ভ্যারিয়েন্ট নেই। প্রয়োজনে যোগ করুন।</p>
      )}

      {variants.map((v, i) => (
        <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 border rounded-lg bg-muted/30">
          <div className="space-y-1">
            <Label className="text-xs">নাম *</Label>
            <Input
              placeholder="যেমন: ২৫০ গ্রাম"
              value={v.size_name}
              onChange={(e) => updateVariant(i, "size_name", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">ভ্যালু</Label>
            <Input
              placeholder="250g"
              value={v.size_value}
              onChange={(e) => updateVariant(i, "size_value", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">দাম (৳)</Label>
            <Input
              type="number"
              placeholder="আলাদা দাম"
              value={v.price ?? ""}
              onChange={(e) => updateVariant(i, "price", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">স্টক</Label>
            <Input
              type="number"
              value={v.stock_quantity}
              onChange={(e) => updateVariant(i, "stock_quantity", Number(e.target.value))}
            />
          </div>
          <div className="flex items-end">
            <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => removeVariant(i)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}

      {variants.length > 0 && (
        <Button type="button" onClick={saveVariants} size="sm">
          ভ্যারিয়েন্ট সেভ করুন
        </Button>
      )}
    </div>
  );
}
