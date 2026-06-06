import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Plus, Save, Tag, Trash2, X } from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean | number;
  expires_at: string | null;
};

type CouponForm = {
  code: string;
  discount_type: Coupon["discount_type"];
  discount_value: number;
  min_order_amount: number;
  max_uses: number | "";
  is_active: boolean;
  expires_at: string;
};

const empty: CouponForm = {
  code: "",
  discount_type: "percentage",
  discount_value: 0,
  min_order_amount: 0,
  max_uses: "",
  is_active: true,
  expires_at: "",
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(empty);
  const { toast } = useToast();

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await adminApi<Coupon[]>("/api/admin/resources/coupons");
      setCoupons(data);
    } catch { toast({ title: "লোড ব্যর্থ", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code, discount_type: c.discount_type,
      discount_value: c.discount_value, min_order_amount: c.min_order_amount,
      max_uses: c.max_uses ?? "", is_active: Boolean(c.is_active),
      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : "",
    });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(empty); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) { toast({ title: "কোড দিন", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const payload = { ...form, max_uses: form.max_uses === "" ? null : Number(form.max_uses) };
      if (editing) {
        await adminApi(`/api/admin/resources/coupons/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast({ title: "আপডেট সফল" });
      } else {
        await adminApi("/api/admin/resources/coupons", { method: "POST", body: JSON.stringify(payload) });
        toast({ title: "কুপন যোগ সফল" });
      }
      closeForm(); fetch();
    } catch (err) { toast({ title: "সেভ ব্যর্থ", description: err instanceof Error ? err.message : "", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c: Coupon) => {
    if (!confirm(`"${c.code}" কুপন মুছতে চান?`)) return;
    try { await adminApi(`/api/admin/resources/coupons/${c.id}`, { method: "DELETE" }); toast({ title: "মুছে ফেলা হয়েছে" }); fetch(); }
    catch { toast({ title: "মুছতে ব্যর্থ", variant: "destructive" }); }
  };

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="h-6 w-6 text-[#d64901]" />
          <h1 className="text-2xl font-bold text-[#253029]">কুপন ম্যানেজমেন্ট</h1>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-[#d64901] hover:bg-[#b93f00]">
          <Plus className="h-4 w-4" /> নতুন কুপন
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-[#e3e6de] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">{editing ? "কুপন সম্পাদনা" : "নতুন কুপন যোগ করুন"}</h2>
            <button onClick={closeForm}><X className="h-5 w-5 text-[#9eada4]" /></button>
          </div>
          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>কোড *</Label>
              <Input placeholder="SAVE20" value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} required />
            </div>
            <div className="space-y-1.5">
              <Label>ছাড়ের ধরন</Label>
              <select value={form.discount_type} onChange={(e) => set("discount_type", e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="percentage">শতাংশ (%)</option>
                <option value="fixed">নির্দিষ্ট টাকা (৳)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>ছাড়ের পরিমাণ</Label>
              <Input type="number" min={0} placeholder={form.discount_type === "percentage" ? "10" : "100"} value={form.discount_value} onChange={(e) => set("discount_value", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>মিনিমাম অর্ডার (৳)</Label>
              <Input type="number" min={0} placeholder="500" value={form.min_order_amount} onChange={(e) => set("min_order_amount", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>সর্বোচ্চ ব্যবহার</Label>
              <Input type="number" min={1} placeholder="ফাঁকা রাখলে সীমাহীন" value={form.max_uses} onChange={(e) => set("max_uses", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>মেয়াদ শেষের তারিখ</Label>
              <Input type="date" value={form.expires_at} onChange={(e) => set("expires_at", e.target.value)} />
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <button type="button" onClick={() => set("is_active", !form.is_active)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? "bg-[#d64901]" : "bg-gray-300"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className="text-sm text-[#627066]">{form.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</span>
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={saving} className="gap-2 bg-[#d64901] hover:bg-[#b93f00]">
                <Save className="h-4 w-4" />{saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>বাতিল</Button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#e3e6de] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#f1f3ee] bg-[#f7f8f6] text-left text-xs font-semibold text-[#9eada4]">
              <th className="px-5 py-3">কোড</th>
              <th className="px-5 py-3">ছাড়</th>
              <th className="px-5 py-3">মিনিমাম অর্ডার</th>
              <th className="px-5 py-3">ব্যবহার</th>
              <th className="px-5 py-3">মেয়াদ</th>
              <th className="px-5 py-3">স্ট্যাটাস</th>
              <th className="px-5 py-3 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-[#9eada4]">লোড হচ্ছে...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-[#9eada4]">কোনো কুপন নেই।</td></tr>
            ) : coupons.map((c) => {
              const isActive = Boolean(c.is_active);
              const discount = c.discount_type === "percentage" ? `${c.discount_value}%` : `৳${c.discount_value}`;
              const usage = c.max_uses ? `${c.used_count}/${c.max_uses}` : String(c.used_count);
              const expiry = c.expires_at ? new Date(c.expires_at).toLocaleDateString("bn-BD") : "—";
              return (
                <tr key={c.id} className="border-b border-[#f7f8f6] hover:bg-[#fbfcfa]">
                  <td className="px-5 py-4 font-mono font-bold text-[#d64901]">{c.code}</td>
                  <td className="px-5 py-4 font-medium">{discount}</td>
                  <td className="px-5 py-4">৳{c.min_order_amount}</td>
                  <td className="px-5 py-4">{usage}</td>
                  <td className="px-5 py-4 text-[#9eada4]">{expiry}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive ? "bg-[#d64901] text-white" : "bg-gray-100 text-gray-500"}`}>
                      {isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="rounded-md p-1.5 text-[#9eada4] hover:bg-[#f1f3ee] hover:text-[#253029]"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(c)} className="rounded-md p-1.5 text-[#9eada4] hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
