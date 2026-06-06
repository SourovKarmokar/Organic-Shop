import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/admin/ImageUpload";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface LocalVariant {
  size_name: string;
  size_value: string;
  price: string;
  stock_quantity: string;
}

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [variants, setVariants] = useState<LocalVariant[]>([]);

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    sub_category_id: "",
    brand_id: "",
    purchase_price: "",
    base_price: "",
    sale_price: "",
    stock_quantity: "",
    sku: "",
    image_url: "",
    images: [] as string[],
    weight: "",
    unit: "",
    description: "",
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [c, b] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("brands").select("*").order("name"),
    ]);
    const allCats = c.data || [];
    setCategories(allCats.filter((cat: any) => !cat.parent_id));
    setSubCategories(allCats.filter((cat: any) => cat.parent_id));
    setBrands(b.data || []);
  };

  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const addVariant = () => {
    setVariants([...variants, { size_name: "", size_value: "", price: "", stock_quantity: "0" }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof LocalVariant, value: string) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "প্রোডাক্টের নাম দিন", variant: "destructive" });
      return;
    }
    setSaving(true);
    const slug = form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") + "-" + Date.now();
    const payload = {
      name: form.name,
      slug,
      category_id: form.sub_category_id || form.category_id || null,
      brand_id: form.brand_id || null,
      purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
      base_price: Number(form.base_price) || 0,
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      stock_quantity: Number(form.stock_quantity) || 0,
      sku: form.sku || null,
      image_url: form.image_url || null,
      images: form.images,
      weight: form.weight || null,
      unit: form.unit || null,
      description: form.description || null,
      is_active: form.is_active,
      is_featured: form.is_featured,
    };
    const { error, data } = await supabase.from("products").insert(payload).select("id").single();
    if (error) {
      setSaving(false);
      toast({ title: "সেভ ব্যর্থ", description: error.message, variant: "destructive" });
      return;
    }

    // Save variants if any
    for (const v of variants) {
      if (!v.size_name.trim()) continue;
      let sizeId: string;
      const { data: existingSize } = await supabase
        .from("sizes").select("id").eq("name", v.size_name.trim()).maybeSingle();
      if (existingSize) {
        sizeId = existingSize.id;
      } else {
        const { data: newSize } = await supabase
          .from("sizes").insert({ name: v.size_name.trim(), value: v.size_value.trim() || null }).select("id").single();
        if (!newSize) continue;
        sizeId = newSize.id;
      }
      await supabase.from("product_variants").insert({
        product_id: data.id,
        size_id: sizeId,
        price: v.price ? Number(v.price) : null,
        stock_quantity: Number(v.stock_quantity) || 0,
        is_active: true,
      });
    }

    setSaving(false);
    toast({ title: "প্রোডাক্ট যোগ হয়েছে ✅" });
    navigate(`/admin/products/edit/${data.id}`);
  };

  const childCats = subCategories.filter((sc: any) => sc.parent_id === form.category_id);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h1 className="text-xl font-bold">Product Create</h1>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/products")}>
          Manage
        </Button>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Product Name *</Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="প্রোডাক্টের নাম লিখুন" />
          </div>
          <div className="space-y-2">
            <Label>Categories *</Label>
            <Select value={form.category_id} onValueChange={(val) => { update("category_id", val); update("sub_category_id", ""); }}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2 - SubCategories */}
        {childCats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>সাব-ক্যাটাগরি</Label>
              <Select value={form.sub_category_id} onValueChange={(val) => update("sub_category_id", val)}>
                <SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger>
                <SelectContent>
                  {childCats.map((sc: any) => <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Brand, Prices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Brands</Label>
            <Select value={form.brand_id} onValueChange={(val) => update("brand_id", val)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>ক্রয় মূল্য (৳)</Label>
            <Input type="number" value={form.purchase_price} onChange={(e) => update("purchase_price", e.target.value)} placeholder="ঐচ্ছিক" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Old Price (৳)</Label>
            <Input type="number" value={form.sale_price} onChange={(e) => update("sale_price", e.target.value)} placeholder="পুরোনো দাম" />
          </div>
          <div className="space-y-2">
            <Label>New Price * (৳)</Label>
            <Input type="number" value={form.base_price} onChange={(e) => update("base_price", e.target.value)} placeholder="বর্তমান দাম" />
          </div>
        </div>

        {/* Row 4 - Stock, SKU */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Stock *</Label>
            <Input type="number" value={form.stock_quantity} onChange={(e) => update("stock_quantity", e.target.value)} placeholder="স্টক পরিমাণ" />
          </div>
          <div className="space-y-2">
            <Label>Product Code (Optional)</Label>
            <Input value={form.sku} onChange={(e) => update("sku", e.target.value)} placeholder="Leave empty for auto-generate" />
          </div>
          <div className="space-y-2">
            <Label>Product Unit (Optional)</Label>
            <Input value={form.unit} onChange={(e) => update("unit", e.target.value)} placeholder="kg, ml, pcs" />
          </div>
        </div>

        {/* Product Images */}
        <div className="space-y-3">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium">
            Product Images
          </div>
          <ImageUpload
            mainImage={form.image_url}
            images={form.images}
            onMainChange={(url) => update("image_url", url)}
            onImagesChange={(urls) => update("images", urls)}
          />
        </div>

        {/* Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Weight (Optional)</Label>
            <Input value={form.weight} onChange={(e) => update("weight", e.target.value)} placeholder="ওজন" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Description *</Label>
          <Textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={5}
            placeholder="প্রোডাক্টের বিবরণ লিখুন..."
          />
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Label>Status</Label>
            <Switch checked={form.is_active} onCheckedChange={(v) => update("is_active", v)} />
          </div>
          <div className="flex items-center gap-2">
            <Label>অফারে কিনুন</Label>
            <Switch checked={form.is_featured} onCheckedChange={(v) => update("is_featured", v)} />
          </div>
        </div>

        {/* Inline Variant Manager */}
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
                <Input placeholder="যেমন: ২৫০ গ্রাম" value={v.size_name} onChange={(e) => updateVariant(i, "size_name", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">ভ্যালু</Label>
                <Input placeholder="250g" value={v.size_value} onChange={(e) => updateVariant(i, "size_value", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">দাম (৳)</Label>
                <Input type="number" placeholder="আলাদা দাম" value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">স্টক</Label>
                <Input type="number" value={v.stock_quantity} onChange={(e) => updateVariant(i, "stock_quantity", e.target.value)} />
              </div>
              <div className="flex items-end">
                <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => removeVariant(i)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
          {saving ? "সেভ হচ্ছে..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}
