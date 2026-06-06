import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save, Search } from "lucide-react";
import { getProductImage } from "@/lib/productImages";

type Product = {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  purchase_price?: number | null;
  base_price: number;
  sale_price?: number | null;
  stock_quantity: number;
};

type ProductChanges = {
  purchase_price?: number | null;
  base_price?: number | null;
  sale_price?: number | null;
  stock_quantity?: number | null;
};

export default function PriceEditPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [changes, setChanges] = useState<Record<string, ProductChanges>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchProducts = async () => {
    setProducts(await adminApi<Product[]>("/api/admin/reports/stock"));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((product) => product.name.toLowerCase().includes(keyword));
  }, [products, search]);

  const updateField = (id: string, field: keyof ProductChanges, value: string) => {
    setChanges((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value === "" ? null : Number(value) } }));
  };

  const getValue = (product: Product, field: keyof ProductChanges) => {
    const changed = changes[product.id]?.[field];
    if (changed !== undefined) return changed ?? "";
    return product[field] ?? "";
  };

  const saveAll = async () => {
    const ids = Object.keys(changes);
    if (!ids.length) {
      toast({ title: "No changes found" });
      return;
    }

    setSaving(true);
    try {
      await Promise.all(
        ids.map((id) =>
          adminApi(`/api/admin/resources/products/${id}`, {
            method: "PUT",
            body: JSON.stringify(changes[id]),
          })
        )
      );
      setChanges({});
      await fetchProducts();
      toast({ title: "Price updated" });
    } finally {
      setSaving(false);
    }
  };

  const changedCount = Object.keys(changes).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-[#253029]">প্রাইস এডিট</h1>
        <div className="flex gap-2">
          <label className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#60756a]" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="সার্চ করুন..." className="pl-9" />
          </label>
          {changedCount > 0 && (
            <Button onClick={saveAll} disabled={saving} className="gap-2 bg-[#d64901] hover:bg-[#b83f00]">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : `Save (${changedCount})`}
            </Button>
          )}
        </div>
      </div>

      <section className="overflow-hidden rounded-md border border-[#dfe5dc] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="border-b bg-[#f6f8f5] text-xs text-[#253029]">
              <tr>
                <th className="px-4 py-3 text-left">SL</th>
                <th className="px-4 py-3 text-left">ছবি</th>
                <th className="px-4 py-3 text-left">প্রোডাক্ট</th>
                <th className="px-4 py-3 text-left">ক্রয় মূল্য (৳)</th>
                <th className="px-4 py-3 text-left">রেগুলার মূল্য (৳)</th>
                <th className="px-4 py-3 text-left">সেল মূল্য (৳)</th>
                <th className="px-4 py-3 text-left">স্টক</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, index) => {
                const hasChange = !!changes[product.id];
                return (
                  <tr key={product.id} className={`border-b ${hasChange ? "bg-yellow-50" : "hover:bg-[#fbfcfa]"}`}>
                    <td className="px-4 py-3 text-[#60756a]">{index + 1}</td>
                    <td className="px-4 py-3">
                      <img src={getProductImage(product.slug, product.image_url)} alt={product.name} className="h-10 w-10 rounded object-cover" />
                    </td>
                    <td className="px-4 py-3 font-semibold">{product.name}</td>
                    <td className="px-4 py-3">
                      <Input type="number" value={getValue(product, "purchase_price")} onChange={(event) => updateField(product.id, "purchase_price", event.target.value)} placeholder="-" />
                    </td>
                    <td className="px-4 py-3">
                      <Input type="number" value={getValue(product, "base_price")} onChange={(event) => updateField(product.id, "base_price", event.target.value)} />
                    </td>
                    <td className="px-4 py-3">
                      <Input type="number" value={getValue(product, "sale_price")} onChange={(event) => updateField(product.id, "sale_price", event.target.value)} placeholder="-" />
                    </td>
                    <td className="px-4 py-3">
                      <Input type="number" value={getValue(product, "stock_quantity")} onChange={(event) => updateField(product.id, "stock_quantity", event.target.value)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-sm text-[#60756a]">মোট: {filtered.length}টি প্রোডাক্ট</p>
    </div>
  );
}
