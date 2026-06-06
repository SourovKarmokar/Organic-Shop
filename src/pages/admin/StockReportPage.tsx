import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { getProductImage } from "@/lib/productImages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Download, Package, PackageCheck, PackageX, Search } from "lucide-react";

type StockRow = {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  sku?: string | null;
  stock_quantity: number;
  base_price: number;
  sale_price?: number | null;
  purchase_price?: number | null;
  is_active: boolean;
  category_name?: string | null;
};

type Filter = "all" | "in" | "out" | "low";

function money(value: number | string) {
  return `৳${Number(value || 0).toLocaleString()}`;
}

function statusOf(product: StockRow) {
  if (!product.is_active || Number(product.stock_quantity || 0) <= 0) return "Stock Out";
  if (Number(product.stock_quantity || 0) <= 10) return "Low Stock";
  return "Stock In";
}

export default function StockReportPage() {
  const [products, setProducts] = useState<StockRow[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    adminApi<StockRow[]>("/api/admin/reports/stock").then(setProducts);
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = keyword
        ? [product.name, product.sku, product.category_name].filter(Boolean).some((value) => String(value).toLowerCase().includes(keyword))
        : true;
      const status = statusOf(product);
      if (filter === "in") return matchesSearch && status === "Stock In";
      if (filter === "out") return matchesSearch && status === "Stock Out";
      if (filter === "low") return matchesSearch && status === "Low Stock";
      return matchesSearch;
    });
  }, [filter, products, search]);

  const inStock = products.filter((product) => statusOf(product) === "Stock In").length;
  const outStock = products.filter((product) => statusOf(product) === "Stock Out").length;
  const lowStock = products.filter((product) => statusOf(product) === "Low Stock").length;
  const stockValue = products.reduce((sum, product) => sum + Number(product.purchase_price || product.base_price || 0) * Number(product.stock_quantity || 0), 0);

  const chips = [
    { key: "all" as const, label: `সব (${products.length})`, icon: Package },
    { key: "in" as const, label: `Stock In (${inStock})`, icon: PackageCheck },
    { key: "out" as const, label: `Stock Out (${outStock})`, icon: PackageX },
    { key: "low" as const, label: `Low Stock (${lowStock})`, icon: AlertTriangle },
  ];

  const exportCsv = () => {
    const rows = [
      ["Name", "SKU", "Category", "Purchase", "Sale", "Stock", "Stock Value", "Status"],
      ...filtered.map((product) => {
        const purchase = Number(product.purchase_price || product.base_price || 0);
        const sale = Number(product.sale_price || product.base_price || 0);
        const stock = Number(product.stock_quantity || 0);
        return [product.name, product.sku || "", product.category_name || "", String(purchase), String(sale), String(stock), String(purchase * stock), statusOf(product)];
      }),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stock-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-[#253029]">স্টক রিপোর্ট</h1>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-md bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-center text-white shadow-md">
          <p className="text-sm opacity-90">মোট প্রোডাক্ট</p>
          <p className="text-3xl font-bold">{products.length}</p>
        </div>
        <div className="rounded-md bg-gradient-to-br from-green-500 to-green-600 p-5 text-center text-white shadow-md">
          <p className="text-sm opacity-90">Stock In</p>
          <p className="text-3xl font-bold">{inStock}</p>
        </div>
        <div className="rounded-md bg-gradient-to-br from-red-500 to-red-600 p-5 text-center text-white shadow-md">
          <p className="text-sm opacity-90">Stock Out</p>
          <p className="text-3xl font-bold">{outStock}</p>
        </div>
        <div className="rounded-md bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-center text-white shadow-md">
          <p className="text-sm opacity-90">মোট স্টক মূল্য</p>
          <p className="text-3xl font-bold">{money(stockValue)}</p>
        </div>
      </section>

      <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => {
            const Icon = chip.icon;
            return (
              <button
                key={chip.key}
                onClick={() => setFilter(chip.key)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
                  filter === chip.key ? "bg-[#d64901] text-white shadow-md" : "bg-[#eef3ee] text-[#60756a] hover:bg-[#e4ebe4]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {chip.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <label className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64756b]" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="সার্চ..." className="pl-9" />
          </label>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-[#dfe5dc] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead className="border-b bg-[#f6f8f5] text-xs text-[#253029]">
              <tr>
                <th className="px-3 py-3 text-left">SL</th>
                <th className="px-3 py-3 text-left">ছবি</th>
                <th className="px-3 py-3 text-left">প্রোডাক্ট</th>
                <th className="px-3 py-3 text-left">SKU</th>
                <th className="px-3 py-3 text-left">ক্যাটাগরি</th>
                <th className="px-3 py-3 text-right">ক্রয় মূল্য</th>
                <th className="px-3 py-3 text-right">বিক্রয় মূল্য</th>
                <th className="px-3 py-3 text-center">স্টক</th>
                <th className="px-3 py-3 text-right">স্টক মূল্য</th>
                <th className="px-3 py-3 text-center">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, index) => {
                const status = statusOf(product);
                const purchase = Number(product.purchase_price || product.base_price || 0);
                const sale = Number(product.sale_price || product.base_price || 0);
                const stock = Number(product.stock_quantity || 0);
                return (
                  <tr
                    key={product.id}
                    className={`border-b ${status === "Stock Out" ? "bg-red-50" : status === "Low Stock" ? "bg-amber-50" : "hover:bg-[#fbfcfa]"}`}
                  >
                    <td className="px-3 py-3 text-[#60756a]">{index + 1}</td>
                    <td className="px-3 py-3">
                      <img src={getProductImage(product.slug, product.image_url)} alt={product.name} className="h-10 w-10 rounded object-cover" />
                    </td>
                    <td className="px-3 py-3 font-semibold">{product.name}</td>
                    <td className="px-3 py-3 text-[#60756a]">{product.sku || "-"}</td>
                    <td className="px-3 py-3 text-xs text-[#60756a]">{product.category_name || "-"}</td>
                    <td className="px-3 py-3 text-right">{money(purchase)}</td>
                    <td className="px-3 py-3 text-right">{money(sale)}</td>
                    <td className="px-3 py-3 text-center font-bold">{stock}</td>
                    <td className="px-3 py-3 text-right">{money(purchase * stock)}</td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          status === "Stock Out" ? "bg-red-100 text-red-700" : status === "Low Stock" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {status}
                      </span>
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
