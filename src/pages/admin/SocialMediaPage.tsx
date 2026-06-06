import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Plus, Save, Share2, Trash2, X } from "lucide-react";

const PLATFORMS = ["Facebook", "Instagram", "YouTube", "Twitter", "LinkedIn", "Pinterest", "TikTok", "WhatsApp", "Telegram", "Snapchat"];

type SocialMedia = {
  id: string;
  platform: string;
  url: string;
  icon?: string;
  is_active: boolean | number;
  sort_order: number;
};

const empty = { platform: "Facebook", url: "", icon: "", is_active: true, sort_order: 0 };

export default function SocialMediaPage() {
  const [items, setItems] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SocialMedia | null>(null);
  const [form, setForm] = useState(empty);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try { const d = await adminApi<SocialMedia[]>("/api/admin/resources/social_media"); setItems(d); }
    catch { toast({ title: "লোড ব্যর্থ", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (s: SocialMedia) => {
    setEditing(s);
    setForm({ platform: s.platform, url: s.url, icon: s.icon || "", is_active: Boolean(s.is_active), sort_order: s.sort_order });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(empty); };
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url.trim()) { toast({ title: "URL দিন", variant: "destructive" }); return; }
    setSaving(true);
    try {
      if (editing) {
        await adminApi(`/api/admin/resources/social_media/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
        toast({ title: "আপডেট সফল" });
      } else {
        await adminApi("/api/admin/resources/social_media", { method: "POST", body: JSON.stringify(form) });
        toast({ title: "যোগ সফল" });
      }
      closeForm(); fetchData();
    } catch (err) { toast({ title: "সেভ ব্যর্থ", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (s: SocialMedia) => {
    if (!confirm(`"${s.platform}" মুছতে চান?`)) return;
    try { await adminApi(`/api/admin/resources/social_media/${s.id}`, { method: "DELETE" }); toast({ title: "মুছে ফেলা হয়েছে" }); fetchData(); }
    catch { toast({ title: "মুছতে ব্যর্থ", variant: "destructive" }); }
  };

  // Platform color map
  const platformColor: Record<string, { bg: string; color: string; initial: string }> = {
    Facebook:  { bg: "#EBF3FF", color: "#1877F2", initial: "f" },
    Instagram: { bg: "#FDF2F8", color: "#E1306C", initial: "in" },
    YouTube:   { bg: "#FEF2F2", color: "#FF0000", initial: "yt" },
    Twitter:   { bg: "#F0F9FF", color: "#1DA1F2", initial: "tw" },
    LinkedIn:  { bg: "#EFF6FF", color: "#0A66C2", initial: "li" },
    Pinterest: { bg: "#FEF2F2", color: "#E60023", initial: "p" },
    TikTok:    { bg: "#F3F4F6", color: "#010101", initial: "tt" },
    WhatsApp:  { bg: "#F0FDF4", color: "#25D366", initial: "wa" },
    Telegram:  { bg: "#EFF9FF", color: "#0088CC", initial: "tg" },
    Snapchat:  { bg: "#FFFDE7", color: "#FFFC00", initial: "sc" },
  };

  const getPlatformStyle = (p: string) => platformColor[p] || { bg: "#F3F4F6", color: "#6B7280", initial: p[0] };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Share2 className="h-6 w-6 text-[#d64901]" />
          <h1 className="text-2xl font-bold text-[#253029]">সোশ্যাল মিডিয়া</h1>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-[#d64901] hover:bg-[#b93f00]">
          <Plus className="h-4 w-4" /> নতুন
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-[#e3e6de] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">{editing ? "সম্পাদনা করুন" : "নতুন সোশ্যাল মিডিয়া"}</h2>
            <button onClick={closeForm}><X className="h-5 w-5 text-[#9eada4]" /></button>
          </div>
          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>প্ল্যাটফর্ম</Label>
              <select value={form.platform} onChange={(e) => set("platform", e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input type="number" min={0} value={form.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>URL *</Label>
              <Input placeholder="https://facebook.com/yourpage" value={form.url} onChange={(e) => set("url", e.target.value)} required />
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
              <th className="px-5 py-3">প্ল্যাটফর্ম</th>
              <th className="px-5 py-3">URL</th>
              <th className="px-5 py-3 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="py-12 text-center text-[#9eada4]">লোড হচ্ছে...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={3} className="py-12 text-center text-[#9eada4]">কোনো সোশ্যাল মিডিয়া লিংক নেই।</td></tr>
            ) : items.map((s) => {
              const style = getPlatformStyle(s.platform);
              return (
                <tr key={s.id} className="border-b border-[#f7f8f6] hover:bg-[#fbfcfa]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold uppercase"
                        style={{ backgroundColor: style.bg, color: style.color }}>
                        {style.initial}
                      </div>
                      <span className="font-medium text-[#253029]">{s.platform}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#627066]">
                    <a href={s.url} target="_blank" rel="noreferrer" className="hover:text-[#d64901] hover:underline">{s.url}</a>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(s)} className="rounded-md p-1.5 text-[#9eada4] hover:bg-[#f1f3ee] hover:text-[#253029]"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(s)} className="rounded-md p-1.5 text-[#9eada4] hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
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
