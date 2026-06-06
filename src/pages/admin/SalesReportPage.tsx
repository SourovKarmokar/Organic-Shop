import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Printer, Search } from "lucide-react";

type SaleRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  product_name: string;
  quantity: number;
  price: number;
  purchase_price?: number | null;
  base_price?: number | null;
  order_created_at: string;
};

function money(value: number | string) {
  return `৳${Number(value || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
}

function exportCsv(rows: SaleRow[]) {
  const csvRows = [
    ["Invoice", "Customer", "Phone", "Product", "Purchase", "Sale", "Quantity", "Total"],
    ...rows.map((row) => [
      row.order_number,
      row.customer_name,
      row.customer_phone,
      row.product_name,
      String(row.purchase_price || 0),
      String(row.price || 0),
      String(row.quantity || 0),
      String(Number(row.price || 0) * Number(row.quantity || 0)),
    ]),
  ];
  const csv = csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sales-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function SalesReportPage() {
  const [rows, setRows] = useState<SaleRow[]>([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi<SaleRow[]>("/api/admin/reports/sales")
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchSearch = keyword
        ? [row.order_number, row.customer_name, row.customer_phone, row.product_name]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(keyword))
        : true;
      const date = new Date(row.order_created_at).toISOString().slice(0, 10);
      const matchStart = startDate ? date >= startDate : true;
      const matchEnd = endDate ? date <= endDate : true;
      return matchSearch && matchStart && matchEnd;
    });
  }, [endDate, rows, search, startDate]);

  const totalPurchase = filtered.reduce((sum, row) => sum + Number(row.purchase_price || 0) * Number(row.quantity || 0), 0);
  const totalSales = filtered.reduce((sum, row) => sum + Number(row.price || 0) * Number(row.quantity || 0), 0);
  const totalExpense = 800;
  const totalProfit = totalSales - totalPurchase - totalExpense;
  const totalQty = filtered.reduce((sum, row) => sum + Number(row.quantity || 0), 0);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-[#253029]">সেলস রিপোর্ট</h1>

      <section className="rounded-md border border-[#dfe5dc] bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap gap-2">
          {["আজ", "এই সপ্তাহ", "এই মাস", "এই বছর"].map((label) => (
            <Button key={label} variant="outline" size="sm">{label}</Button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64756b]" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="সার্চ করুন..." className="pl-9" />
          </label>
          <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-md bg-gradient-to-br from-pink-400 to-pink-600 p-5 text-center text-white shadow-md">
          <p className="text-sm opacity-90">মোট ক্রয়</p>
          <p className="mt-1 text-2xl font-bold">{money(totalPurchase)}</p>
        </div>
        <div className="rounded-md bg-gradient-to-br from-teal-400 to-teal-600 p-5 text-center text-white shadow-md">
          <p className="text-sm opacity-90">মোট বিক্রয়</p>
          <p className="mt-1 text-2xl font-bold">{money(totalSales)}</p>
        </div>
        <div className="rounded-md bg-gradient-to-br from-orange-400 to-orange-600 p-5 text-center text-white shadow-md">
          <p className="text-sm opacity-90">মোট খরচ</p>
          <p className="mt-1 text-2xl font-bold">{money(totalExpense)}</p>
        </div>
        <div className="rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 p-5 text-center text-white shadow-md">
          <p className="text-sm opacity-90">নেট লাভ</p>
          <p className="mt-1 text-2xl font-bold">{money(totalProfit)}</p>
          <p className="text-xs opacity-80">গ্রস লাভ: {money(totalSales - totalPurchase)}</p>
        </div>
      </section>

      <div className="flex justify-end gap-2">
        <Button size="sm" className="gap-2 bg-teal-600 hover:bg-teal-700" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={() => exportCsv(filtered)}>
          <Download className="h-4 w-4" />
          Export Excel
        </Button>
      </div>

      <section className="overflow-hidden rounded-md border border-[#dfe5dc] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="border-b bg-[#f6f8f5] text-xs text-[#253029]">
              <tr>
                <th className="px-4 py-3 text-left">ইনভয়েস</th>
                <th className="px-4 py-3 text-left">কাস্টমার</th>
                <th className="px-4 py-3 text-left">ফোন</th>
                <th className="px-4 py-3 text-left">প্রোডাক্ট</th>
                <th className="px-4 py-3 text-right">ক্রয়</th>
                <th className="px-4 py-3 text-right">বিক্রয়</th>
                <th className="px-4 py-3 text-center">পরিমাণ</th>
                <th className="px-4 py-3 text-right">মোট</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center text-[#60756a]">Loading...</td></tr>
              ) : filtered.length ? (
                <>
                  {filtered.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-[#fbfcfa]">
                      <td className="px-4 py-3 font-semibold text-[#d64901]">{row.order_number}</td>
                      <td className="px-4 py-3">{row.customer_name || "-"}</td>
                      <td className="px-4 py-3 text-[#60756a]">{row.customer_phone || "-"}</td>
                      <td className="px-4 py-3">{row.product_name}</td>
                      <td className="px-4 py-3 text-right">{money(row.purchase_price || 0)}</td>
                      <td className="px-4 py-3 text-right">{money(row.price)}</td>
                      <td className="px-4 py-3 text-center">{row.quantity}</td>
                      <td className="px-4 py-3 text-right font-semibold">{money(Number(row.price) * Number(row.quantity))}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#f6f8f5] font-bold">
                    <td colSpan={4} className="px-4 py-3 text-right">TOTAL</td>
                    <td className="px-4 py-3 text-right">{money(totalPurchase)}</td>
                    <td className="px-4 py-3 text-right">{money(totalSales)}</td>
                    <td className="px-4 py-3 text-center">{totalQty}</td>
                    <td className="px-4 py-3 text-right">{money(totalSales)}</td>
                  </tr>
                </>
              ) : (
                <tr><td colSpan={8} className="py-12 text-center text-[#60756a]">কোনো ডেটা পাওয়া যায়নি</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
