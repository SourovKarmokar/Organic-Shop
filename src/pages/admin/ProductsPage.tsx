import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { getProductImage } from "@/lib/productImages";

type Product = {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  sku?: string | null;
  category_name?: string | null;
  base_price: number;
  sale_price?: number | null;
  purchase_price?: number | null;
  stock_quantity: number;
  is_active: boolean;
  is_featured?: boolean;
};

type Filter = "all" | "active" | "inactive" | "featured";

function money(value: number | string | null | undefined) {
  return `৳${Number(value || 0).toLocaleString()}`;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchProducts = async () => {
    setProducts(await adminApi<Product[]>("/api/admin/reports/stock"));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = keyword
        ? [product.name, product.sku, product.category_name].filter(Boolean).some((value) => String(value).toLowerCase().includes(keyword))
        : true;
      if (filter === "active") return matchesSearch && product.is_active;
      if (filter === "inactive") return matchesSearch && !product.is_active;
      if (filter === "featured") return matchesSearch && product.is_featured;
      return matchesSearch;
    });
  }, [filter, products, search]);

  const deleteProduct = async (product: Product) => {
    if (!confirm(`Delete ${product.name}?`)) return;
    await adminApi(`/api/admin/resources/products/${product.id}`, { method: "DELETE" });
    toast({ title: "Product deleted" });
    fetchProducts();
  };

  const duplicateProduct = async (product: Product) => {
    await adminApi("/api/admin/resources/products", {
      method: "POST",
      body: JSON.stringify({
        name: `${product.name} Copy`,
        slug: `${product.slug}-copy-${Date.now()}`,
        base_price: product.base_price,
        sale_price: product.sale_price,
        purchase_price: product.purchase_price,
        sku: product.sku ? `${product.sku}-copy` : null,
        stock_quantity: product.stock_quantity,
        image_url: product.image_url,
        is_active: product.is_active,
        is_featured: product.is_featured,
      }),
    });
    toast({ title: "Product duplicated" });
    fetchProducts();
  };

  const filters = [
    { key: "all" as const, label: "সব" },
    { key: "active" as const, label: "✅ Active" },
    { key: "inactive" as const, label: "✖ Inactive" },
    { key: "featured" as const, label: "🔥 অফারে কিনুন" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <Button onClick={() => navigate("/admin/products/create")} className="w-fit gap-2 bg-[#d64901] hover:bg-[#b83f00]">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                filter === item.key ? "bg-[#d64901] text-white shadow" : "bg-[#eef3ee] text-[#60756a] hover:bg-[#e4ebe4]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="relative w-full xl:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#60756a]" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search..." className="pl-9" />
        </label>
      </div>

      <section className="overflow-hidden rounded-md border border-[#dfe5dc] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="border-b bg-[#f6f8f5] text-xs text-[#253029]">
              <tr>
                <th className="px-4 py-3 text-left">SL</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">অফারে কিনুন</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Stock</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, index) => {
                const stockOut = !product.is_active || Number(product.stock_quantity || 0) <= 0;
                return (
                  <tr key={product.id} className="border-b hover:bg-[#fbfcfa]">
                    <td className="px-4 py-3 text-[#60756a]">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => duplicateProduct(product)} className="rounded p-1 text-green-600 hover:bg-green-50" title="Duplicate">
                          <Copy className="h-4 w-4" />
                        </button>
                        <button onClick={() => navigate(`/admin/products/edit/${product.id}`)} className="rounded p-1 text-blue-600 hover:bg-blue-50" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteProduct(product)} className="rounded p-1 text-red-500 hover:bg-red-50" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="max-w-[260px] px-4 py-3 font-semibold text-[#d64901]">{product.name}</td>
                    <td className="px-4 py-3 text-xs text-[#60756a]">{product.category_name || "-"}</td>
                    <td className="px-4 py-3">
                      <img src={getProductImage(product.slug, product.image_url)} alt={product.name} className="h-12 w-12 rounded-full border object-cover" />
                    </td>
                    <td className="px-4 py-3">
                      {product.sale_price ? (
                        <div className="font-semibold text-[#d64901]">
                          <span className="text-xs text-[#60756a] line-through">{money(product.base_price)}</span>
                          <br />
                          {money(product.sale_price)}
                        </div>
                      ) : (
                        <span className="font-semibold">{money(product.base_price)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold">{product.stock_quantity}</td>
                    <td className="px-4 py-3 text-xs">
                      অফারে কিনুন : <span className={product.is_featured ? "font-semibold text-green-600" : "text-[#60756a]"}>{product.is_featured ? "Yes" : "No"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${product.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-2 text-xs font-bold ${stockOut ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {stockOut ? "Stock Out" : "Stock In"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-sm text-[#60756a]">মোট প্রোডাক্ট: {filtered.length}</p>
    </div>
  );
}
