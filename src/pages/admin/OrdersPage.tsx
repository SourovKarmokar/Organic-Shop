import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Pencil,
  Printer,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Truck,
  X,
} from "lucide-react";

const ITEMS_PER_PAGE = 20;

type OrderStatus = { id: string; name: string; color: string };

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  customer_address: string;
  delivery_area: string;
  status_id: string;
  status_name: string;
  status_color: string;
  subtotal: number;
  delivery_charge: number;
  discount: number;
  total: number;
  payment_method?: string | null;
  payment_status?: string | null;
  notes?: string | null;
  created_at: string;
};

type OrderItem = {
  id: string;
  product_name: string;
  product_image?: string | null;
  quantity: number;
  price: number;
  variant_info?: string | null;
};

const statusClass: Record<string, string> = {
  Pending: "border-orange-200 bg-orange-100 text-orange-700",
  Confirmed: "border-blue-200 bg-blue-100 text-blue-700",
  Processing: "border-indigo-200 bg-indigo-100 text-indigo-700",
  "In Courier": "border-cyan-200 bg-cyan-100 text-cyan-700",
  Completed: "border-emerald-200 bg-emerald-100 text-emerald-700",
  Cancelled: "border-red-200 bg-red-100 text-red-700",
};

function money(value: number | string) {
  return `৳${Number(value || 0).toLocaleString()}`;
}

function dateValue(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Invoice print helper ───────────────────────────────────────────
function printInvoice(order: Order, items: OrderItem[]) {
  const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<title>Invoice - ${order.order_number}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #222; background: #fff; padding: 32px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #d64901; padding-bottom: 16px; margin-bottom: 20px; }
  .brand { font-size: 22px; font-weight: 700; color: #d64901; }
  .brand small { display: block; font-size: 11px; color: #666; font-weight: 400; margin-top: 2px; }
  .invoice-meta { text-align: right; }
  .invoice-meta h2 { font-size: 18px; color: #d64901; }
  .invoice-meta p { font-size: 11px; color: #555; margin-top: 2px; }
  .section { margin-bottom: 20px; }
  .section h3 { font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: .05em; margin-bottom: 8px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; }
  .info-row { display: flex; gap: 6px; }
  .info-label { color: #666; white-space: nowrap; min-width: 100px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  thead tr { background: #f5f5f5; }
  th { padding: 8px 10px; text-align: left; font-size: 12px; border-bottom: 1px solid #ddd; }
  td { padding: 8px 10px; border-bottom: 1px solid #eee; font-size: 12px; }
  td.right, th.right { text-align: right; }
  td.center, th.center { text-align: center; }
  .totals { margin-left: auto; width: 260px; }
  .totals tr td { padding: 4px 10px; }
  .totals tr.grand td { font-weight: 700; font-size: 14px; border-top: 2px solid #d64901; color: #d64901; }
  .footer { margin-top: 40px; border-top: 1px solid #eee; padding-top: 14px; font-size: 11px; color: #888; text-align: center; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: #fff3ed; color: #d64901; border: 1px solid #f5c9a9; }
  @media print {
    body { padding: 16px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="brand">🌿 Organic Shop<small>অর্গানিক শপ</small></div>
  </div>
  <div class="invoice-meta">
    <h2>INVOICE</h2>
    <p>${order.order_number}</p>
    <p>${new Date(order.created_at).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })}</p>
    <p style="margin-top:6px"><span class="badge">${order.status_name}</span></p>
  </div>
</div>

<div class="section">
  <h3>কাস্টমার তথ্য</h3>
  <div class="info-grid">
    <div class="info-row"><span class="info-label">নাম:</span> <strong>${order.customer_name}</strong></div>
    <div class="info-row"><span class="info-label">ফোন:</span> <strong>${order.customer_phone}</strong></div>
    ${order.customer_email ? `<div class="info-row"><span class="info-label">ইমেইল:</span> ${order.customer_email}</div>` : ""}
    <div class="info-row" style="grid-column:1/-1"><span class="info-label">ঠিকানা:</span> ${order.customer_address}</div>
    <div class="info-row"><span class="info-label">ডেলিভারি এলাকা:</span> ${order.delivery_area}</div>
    <div class="info-row"><span class="info-label">পেমেন্ট:</span> ${order.payment_method || "COD"}</div>
  </div>
</div>

<div class="section">
  <h3>পণ্য তালিকা</h3>
  <table>
    <thead><tr>
      <th>পণ্যের নাম</th>
      <th class="center">পরিমাণ</th>
      <th class="right">একক মূল্য</th>
      <th class="right">মোট</th>
    </tr></thead>
    <tbody>
      ${items.map((item) => `
      <tr>
        <td>${item.product_name}${item.variant_info ? `<br><small style="color:#888">${item.variant_info}</small>` : ""}</td>
        <td class="center">${item.quantity}</td>
        <td class="right">${money(item.price)}</td>
        <td class="right">${money(Number(item.price) * Number(item.quantity))}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <table class="totals">
    <tr><td>সাবটোটাল</td><td class="right">${money(order.subtotal)}</td></tr>
    <tr><td>ডেলিভারি চার্জ</td><td class="right">${money(order.delivery_charge)}</td></tr>
    ${Number(order.discount) > 0 ? `<tr><td>ছাড়</td><td class="right">- ${money(order.discount)}</td></tr>` : ""}
    <tr class="grand"><td>মোট পরিমাণ</td><td class="right">${money(order.total)}</td></tr>
  </table>
</div>

${order.notes ? `<div class="section"><h3>নোট</h3><p>${order.notes}</p></div>` : ""}

<div class="footer">
  ধন্যবাদ আমাদের সাথে কেনাকাটা করার জন্য • Organic Shop
</div>

<script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=800,height=900");
  if (win) { win.document.write(html); win.document.close(); }
}

// ── Edit form type ─────────────────────────────────────────────────
type EditForm = {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  delivery_area: string;
  payment_method: string;
  payment_status: string;
  discount: string;
  notes: string;
};

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "";
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Edit state
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // ── Fetch ────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersData, statusData] = await Promise.all([
        adminApi<Order[]>("/api/admin/orders"),
        adminApi<OrderStatus[]>("/api/admin/order-statuses"),
      ]);
      setOrders(ordersData);
      setStatuses(statusData);
    } catch (error) {
      toast({ title: "Order load failed", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setPage(1); setSelectedIds(new Set()); }, [statusFilter]);

  // ── Filter ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesStatus = statusFilter ? o.status_name === statusFilter : true;
      const matchesSearch = keyword
        ? [o.order_number, o.customer_name, o.customer_phone, o.customer_address]
            .some((v) => String(v || "").toLowerCase().includes(keyword))
        : true;
      const matchesStart = startDate ? dateValue(o.created_at) >= startDate : true;
      const matchesEnd = endDate ? dateValue(o.created_at) <= endDate : true;
      return matchesStatus && matchesSearch && matchesStart && matchesEnd;
    });
  }, [endDate, orders, search, startDate, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedOrders = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const currentStatus = statusFilter || "all";

  // ── Actions ──────────────────────────────────────────────────────
  const selectStatus = (value: string) => {
    const next = new URLSearchParams(searchParams);
    value === "all" ? next.delete("status") : next.set("status", value);
    setSearchParams(next);
  };

  const updateStatus = async (orderId: string, statusId: string) => {
    try {
      await adminApi(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status_id: statusId }),
      });
      const nextStatus = statuses.find((s) => s.id === statusId);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId && nextStatus
            ? { ...o, status_id: statusId, status_name: nextStatus.name, status_color: nextStatus.color }
            : o
        )
      );
      toast({ title: "স্ট্যাটাস আপডেট হয়েছে" });
    } catch (err) {
      toast({ title: "আপডেট ব্যর্থ", variant: "destructive" });
    }
  };

  const deleteOrder = async (order: Order) => {
    if (!confirm(`"${order.order_number}" অর্ডারটি মুছতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।`)) return;
    try {
      await adminApi(`/api/admin/orders/${order.id}`, { method: "DELETE" });
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      toast({ title: "অর্ডার মুছে ফেলা হয়েছে", variant: "destructive" });
    } catch (err) {
      toast({ title: "মুছতে ব্যর্থ", description: err instanceof Error ? err.message : "", variant: "destructive" });
    }
  };

  const viewOrder = async (order: Order) => {
    setSelectedOrder(order);
    try {
      const items = await adminApi<OrderItem[]>(`/api/admin/orders/${order.id}/items`);
      setOrderItems(items);
    } catch { setOrderItems([]); }
  };

  // ── Edit ─────────────────────────────────────────────────────────
  const openEdit = (order: Order) => {
    setEditOrder(order);
    setEditForm({
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email || "",
      customer_address: order.customer_address,
      delivery_area: order.delivery_area,
      payment_method: order.payment_method || "cod",
      payment_status: order.payment_status || "unpaid",
      discount: String(order.discount || 0),
      notes: order.notes || "",
    });
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOrder || !editForm) return;
    setEditSaving(true);
    try {
      await adminApi(`/api/admin/orders/${editOrder.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...editForm,
          discount: Number(editForm.discount) || 0,
        }),
      });
      toast({ title: "অর্ডার আপডেট সফল" });
      setEditOrder(null);
      setEditForm(null);
      fetchData(); // Refresh to get recalculated total
    } catch (err) {
      toast({ title: "সেভ ব্যর্থ", description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally {
      setEditSaving(false);
    }
  };

  // ── Invoice / Print ──────────────────────────────────────────────
  const handleInvoice = async (order: Order) => {
    try {
      const items = await adminApi<OrderItem[]>(`/api/admin/orders/${order.id}/items`);
      printInvoice(order, items);
    } catch (err) {
      toast({ title: "Invoice load ব্যর্থ", variant: "destructive" });
    }
  };

  // ── Select helpers ───────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.size === paginatedOrders.length
        ? new Set()
        : new Set(paginatedOrders.map((o) => o.id))
    );
  };

  const clearFilters = () => {
    setSearch(""); setStartDate(""); setEndDate("");
    setSearchParams({});
  };

  const exportCsv = () => {
    downloadCsv(`orders-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Order", "Date", "Customer", "Phone", "Address", "Total", "Status"],
      ...filtered.map((o) => [
        o.order_number,
        new Date(o.created_at).toLocaleString("en-BD"),
        o.customer_name,
        o.customer_phone,
        o.customer_address,
        String(o.total),
        o.status_name,
      ]),
    ]);
  };

  const setField = (key: keyof EditForm, value: string) =>
    setEditForm((f) => f ? { ...f, [key]: value } : f);

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#253029]">অর্ডার ম্যানেজমেন্ট</h1>
        <p className="mt-1 text-sm text-[#6d7a71]">
          মোট {filtered.length}টি অর্ডার{statusFilter ? ` (${statusFilter})` : ""}
        </p>
      </div>

      {/* Filters */}
      <section className="rounded-md border border-[#dfe5dc] bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_1fr]">
          <label className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64756b]" />
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-10 pl-9" />
          </label>
          <label className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64756b]" />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-10 pl-9" />
          </label>
          <Select value={currentStatus} onValueChange={selectStatus}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="সব স্ট্যাটাস" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s.id} value={s.name}>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64756b]" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="অর্ডার নং, নাম, ফোন..." className="h-10 pl-9" />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-[#eef1ec] pt-4">
          <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" /> ক্লিয়ার
          </Button>
          <Button variant="secondary" size="sm" onClick={exportCsv} className="gap-2 text-[#d64901]">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button size="sm" onClick={fetchData} className="gap-2 bg-[#d64901] hover:bg-[#b83f00]">
            <RefreshCw className="h-4 w-4" /> রিফ্রেশ
          </Button>
        </div>
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-md border border-[#dfe5dc] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead>
              <tr className="border-b border-[#dfe5dc] bg-[#f6f8f5] text-left text-xs font-semibold text-[#60756a]">
                <th className="w-12 px-3 py-3">
                  <Checkbox
                    checked={paginatedOrders.length > 0 && selectedIds.size === paginatedOrders.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="px-3 py-3">SL</th>
                <th className="px-3 py-3">অ্যাকশন</th>
                <th className="px-3 py-3">ইনভয়েস</th>
                <th className="px-3 py-3">তারিখ</th>
                <th className="px-3 py-3">কাস্টমার</th>
                <th className="px-3 py-3">ফোন</th>
                <th className="px-3 py-3">ঠিকানা</th>
                <th className="px-3 py-3 text-right">টাকা</th>
                <th className="px-3 py-3">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="py-12 text-center text-[#6d7a71]">লোড হচ্ছে...</td></tr>
              ) : paginatedOrders.length === 0 ? (
                <tr><td colSpan={10} className="py-12 text-center text-[#6d7a71]">কোনো অর্ডার পাওয়া যায়নি</td></tr>
              ) : paginatedOrders.map((order, index) => (
                <tr key={order.id} className="border-b border-[#dfe5dc] hover:bg-[#fbfcfa]">
                  <td className="px-3 py-3">
                    <Checkbox checked={selectedIds.has(order.id)} onCheckedChange={() => toggleSelect(order.id)} />
                  </td>
                  <td className="px-3 py-3 text-[#60756a]">{(page - 1) * ITEMS_PER_PAGE + index + 1}</td>

                  {/* Action buttons */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      {/* View */}
                      <button
                        onClick={() => viewOrder(order)}
                        className="rounded p-1 text-blue-600 hover:bg-blue-50"
                        title="বিস্তারিত দেখুন"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {/* Invoice / Print */}
                      <button
                        onClick={() => handleInvoice(order)}
                        className="rounded p-1 text-emerald-600 hover:bg-emerald-50"
                        title="Invoice Print / Download"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => openEdit(order)}
                        className="rounded p-1 text-orange-600 hover:bg-orange-50"
                        title="সম্পাদনা করুন"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => deleteOrder(order)}
                        className="rounded p-1 text-red-500 hover:bg-red-50"
                        title="মুছুন"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>

                  {/* Invoice number + download icon */}
                  <td className="px-3 py-3">
                    <button
                      onClick={() => viewOrder(order)}
                      className="max-w-[120px] break-words text-left font-mono text-xs font-bold text-[#d64901] hover:underline"
                    >
                      {order.order_number}
                    </button>
                    <button
                      onClick={() => handleInvoice(order)}
                      className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-600 hover:underline"
                      title="PDF Download"
                    >
                      <FileText className="h-3 w-3" />
                      <span>Invoice</span>
                    </button>
                  </td>

                  <td className="px-3 py-3">
                    <div className="text-xs font-medium">{new Date(order.created_at).toLocaleDateString("bn-BD")}</div>
                    <div className="mt-0.5 text-[11px] text-[#6d7a71]">
                      {new Date(order.created_at).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-semibold text-[#253029]">{order.customer_name || "-"}</td>
                  <td className="px-3 py-3 text-[#60756a]">{order.customer_phone}</td>
                  <td className="max-w-[200px] truncate px-3 py-3 text-xs text-[#60756a]" title={order.customer_address}>
                    {order.customer_address}
                  </td>
                  <td className="px-3 py-3 text-right font-bold">{money(order.total)}</td>
                  <td className="px-3 py-3">
                    <Select value={order.status_id} onValueChange={(v) => updateStatus(order.id, v)}>
                      <SelectTrigger className="h-8 w-[132px] border-0 p-0 shadow-none focus:ring-0">
                        <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", statusClass[order.status_name] || "border-slate-200 bg-slate-100 text-slate-700")}>
                          {order.status_name}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#dfe5dc] px-4 py-3">
          <p className="text-sm text-[#60756a]">
            {filtered.length
              ? `${(page - 1) * ITEMS_PER_PAGE + 1}-${Math.min(page * ITEMS_PER_PAGE, filtered.length)} of ${filtered.length}`
              : "0 of 0"}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-9 w-9" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pn = i + 1;
              return (
                <Button key={pn} variant={page === pn ? "default" : "outline"} size="icon"
                  className={cn("h-9 w-9", page === pn && "bg-[#d64901] hover:bg-[#b83f00]")}
                  onClick={() => setPage(pn)}>{pn}</Button>
              );
            })}
            <Button variant="outline" size="icon" className="h-9 w-9" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── View Dialog ─────────────────────────────────────────── */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-6">
              <span>অর্ডার #{selectedOrder?.order_number}</span>
              {selectedOrder && (
                <button
                  onClick={() => { handleInvoice(selectedOrder); }}
                  className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  <Printer className="h-3.5 w-3.5" /> Invoice Print
                </button>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 rounded-md bg-[#f6f8f5] p-4 sm:grid-cols-2">
                <div><span className="text-[#60756a]">নাম:</span> <strong>{selectedOrder.customer_name}</strong></div>
                <div><span className="text-[#60756a]">ফোন:</span> <strong>{selectedOrder.customer_phone}</strong></div>
                <div className="sm:col-span-2"><span className="text-[#60756a]">ঠিকানা:</span> <strong>{selectedOrder.customer_address}</strong></div>
                <div><span className="text-[#60756a]">ডেলিভারি:</span> <strong>{selectedOrder.delivery_area}</strong></div>
                <div><span className="text-[#60756a]">পেমেন্ট:</span> <strong>{selectedOrder.payment_method || "COD"}</strong></div>
                <div><span className="text-[#60756a]">মোট:</span> <strong className="text-[#d64901]">{money(selectedOrder.total)}</strong></div>
                <div><span className="text-[#60756a]">স্ট্যাটাস:</span>{" "}
                  <span className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", statusClass[selectedOrder.status_name] || "border-slate-200 bg-slate-100")}>
                    {selectedOrder.status_name}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-[#f6f8f5]">
                    <tr>
                      <th className="px-3 py-2 text-left">পণ্য</th>
                      <th className="px-3 py-2 text-center">পরিমাণ</th>
                      <th className="px-3 py-2 text-right">মূল্য</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-3 py-2">{item.product_name}</td>
                        <td className="px-3 py-2 text-center">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{money(Number(item.price) * Number(item.quantity))}</td>
                      </tr>
                    ))}
                    <tr className="border-t bg-[#f6f8f5]">
                      <td colSpan={2} className="px-3 py-2 text-right font-semibold">ডেলিভারি চার্জ</td>
                      <td className="px-3 py-2 text-right">{money(selectedOrder.delivery_charge)}</td>
                    </tr>
                    {Number(selectedOrder.discount) > 0 && (
                      <tr className="border-t">
                        <td colSpan={2} className="px-3 py-2 text-right font-semibold">ছাড়</td>
                        <td className="px-3 py-2 text-right text-green-600">- {money(selectedOrder.discount)}</td>
                      </tr>
                    )}
                    <tr className="border-t bg-[#fff1e8]">
                      <td colSpan={2} className="px-3 py-2 text-right font-bold text-[#d64901]">মোট</td>
                      <td className="px-3 py-2 text-right font-bold text-[#d64901]">{money(selectedOrder.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {selectedOrder.notes && (
                <div className="rounded-md bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
                  <strong>নোট:</strong> {selectedOrder.notes}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ──────────────────────────────────────────── */}
      <Dialog open={!!editOrder} onOpenChange={() => { setEditOrder(null); setEditForm(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>অর্ডার সম্পাদনা — {editOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {editOrder && editForm && (
            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>কাস্টমারের নাম *</Label>
                  <Input value={editForm.customer_name} onChange={(e) => setField("customer_name", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>ফোন নম্বর *</Label>
                  <Input value={editForm.customer_phone} onChange={(e) => setField("customer_phone", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>ইমেইল</Label>
                  <Input type="email" value={editForm.customer_email} onChange={(e) => setField("customer_email", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>ডেলিভারি এলাকা *</Label>
                  <Input value={editForm.delivery_area} onChange={(e) => setField("delivery_area", e.target.value)} required />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>ঠিকানা *</Label>
                  <Textarea rows={2} value={editForm.customer_address} onChange={(e) => setField("customer_address", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>পেমেন্ট পদ্ধতি</Label>
                  <select
                    value={editForm.payment_method}
                    onChange={(e) => setField("payment_method", e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="cod">Cash on Delivery</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>পেমেন্ট স্ট্যাটাস</Label>
                  <select
                    value={editForm.payment_status}
                    onChange={(e) => setField("payment_status", e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>ছাড় (৳)</Label>
                  <Input type="number" min={0} value={editForm.discount} onChange={(e) => setField("discount", e.target.value)} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>নোট</Label>
                  <Textarea rows={2} value={editForm.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="অতিরিক্ত তথ্য..." />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-[#f1f3ee] pt-4">
                <Button type="button" variant="outline" onClick={() => { setEditOrder(null); setEditForm(null); }}>
                  <X className="mr-1 h-4 w-4" /> বাতিল
                </Button>
                <Button type="submit" disabled={editSaving} className="gap-2 bg-[#d64901] hover:bg-[#b93f00]">
                  <Save className="h-4 w-4" />
                  {editSaving ? "সেভ হচ্ছে..." : "সেভ করুন"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
