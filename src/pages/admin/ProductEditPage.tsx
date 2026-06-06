import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/admin/ImageUpload";
import VariantManager from "@/components/admin/VariantManager";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getProductImage } from "@/lib/productImages";

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    slug: "",
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
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    const [productRes, catRes, brandRes] = await Promise.all([
      supabase.from("products").select("*").eq("id", id!).single(),
      supabase.from("categories").select("*").order("name"),
      supabase.from("brands").select("*").order("name"),
    ]);

    const allCats = catRes.data || [];
    const parentCats = allCats.filter((c: any) => !c.parent_id);
    const subCats = allCats.filter((c: any) => c.parent_id);
    setCategories(parentCats);
    setSubCategories(subCats);
    setBrands(brandRes.data || []);

    if (productRes.data) {
      const p = productRes.data;
      let catId = p.category_id || "";
      let subCatId = "";
      // If the product's category_id is a subcategory, resolve parent
      const matchedSub = subCats.find((sc: any) => sc.id === catId);
      if (matchedSub) {
        subCatId = catId;
        catId = matchedSub.parent_id;
      }
      setForm({
        name: p.name || "",
        slug: p.slug || "",
        category_id: catId,
        sub_category_id: subCatId,
        brand_id: p.brand_id || "",
        purchase_price: p.purchase_price ? String(p.purchase_price) : "",
        base_price: String(p.base_price || ""),
        sale_price: p.sale_price ? String(p.sale_price) : "",
        stock_quantity: String(p.stock_quantity || ""),
        sku: p.sku || "",
        image_url: p.image_url || getProductImage(p.slug),
        images: (p.images as string[]) || [],
        weight: p.weight || "",
        unit: p.unit || "",
        description: p.description || "",
        is_active: p.is_active ?? true,
        is_featured: p.is_featured ?? false,
      });
    }
    setLoading(false);
  };

  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "প্রোডাক্টের নাম দিন", variant: "destructive" });
      return;
    }
    setSaving(true);
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
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
    const { error } = await supabase.from("products").update(payload).eq("id", id!);
    setSaving(false);
    if (error) {
      toast({ title: "আপডেট ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "প্রোডাক্ট আপডেট হয়েছে ✅" });
      navigate("/admin/products");
    }
  };

  const childCats = subCategories.filter((sc: any) => sc.parent_id === form.category_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h1 className="text-xl font-bold">Product Edit</h1>
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
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
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

        {/* SubCategories */}
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
            <Input type="number" value={form.sale_price} onChange={(e) => update("sale_price", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>New Price * (৳)</Label>
            <Input type="number" value={form.base_price} onChange={(e) => update("base_price", e.target.value)} />
          </div>
        </div>

        {/* Stock, SKU */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Stock *</Label>
            <Input type="number" value={form.stock_quantity} onChange={(e) => update("stock_quantity", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Product Code</Label>
            <Input value={form.sku} onChange={(e) => update("sku", e.target.value)} />
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
            <Input value={form.weight} onChange={(e) => update("weight", e.target.value)} />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Description *</Label>
          <Textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={5}
            placeholder="প্রোডাক্টের বিবরণ..."
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

        {/* Variants */}
        {id && <VariantManager productId={id} />}

        {/* Submit */}
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
          {saving ? "আপডেট হচ্ছে..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}
