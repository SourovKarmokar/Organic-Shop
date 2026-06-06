import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Copy, FileText, Pencil, Plus, Save, Trash2, X } from "lucide-react";

type Page = {
  id: string;
  title: string;
  slug: string;
  content?: string;
  is_active: boolean | number;
};

const empty = { title: "", slug: "", content: "", is_active: true };

function toSlug(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export default function PagesManagePage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Page | null>(null);
  const [form, setForm] = useState(empty);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try { const d = await adminApi<Page[]>("/api/admin/resources/pages"); setPages(d); }
    catch { toast({ title: "লোড ব্যর্থ", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (p: Page) => {
    setEditing(p);
    setForm({ title: p.title, slug: p.slug, content: p.content || "", is_active: Boolean(p.is_active) });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(empty); };
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: editing ? f.slug : toSlug(title) }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast({ title: "শিরোনাম দিন", variant: "destructive" }); return; }
    setSaving(true);
    try {
      if (editing) {
        await adminApi(`/api/admin/resources/pages/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
        toast({ title: "আপডেট সফল" });
      } else {
        await adminApi("/api/admin/resources/pages", { method: "POST", body: JSON.stringify(form) });
        toast({ title: "পেজ যোগ সফল" });
      }
      closeForm(); fetchData();
    } catch { toast({ title: "সেভ ব্যর্থ", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (p: Page) => {
    if (!confirm(`"${p.title}" মুছতে চান?`)) return;
    try { await adminApi(`/api/admin/resources/pages/${p.id}`, { method: "DELETE" }); toast({ title: "মুছে ফেলা হয়েছে" }); fetchData(); }
    catch { toast({ title: "মুছতে ব্যর্থ", variant: "destructive" }); }
  };

  const copySlug = (slug: string) => {
    navigator.clipboard.writeText(`/${slug}`).then(() => toast({ title: "URL কপি হয়েছে" }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-[#d64901]" />
          <h1 className="text-2xl font-bold text-[#253029]">Page Manage</h1>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-[#d64901] hover:bg-[#b93f00]">
          <Plus className="h-4 w-4" /> নতুন পেজ
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-[#e3e6de] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">{editing ? "পেজ সম্পাদনা" : "নতুন পেজ যোগ করুন"}</h2>
            <button onClick={closeForm}><X className="h-5 w-5 text-[#9eada4]" /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>শিরোনাম (Title) *</Label>
                <Input placeholder="Privacy Policy" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Slug (URL)</Label>
                <Input placeholder="privacy-policy" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>বিষয়বস্তু (Content)</Label>
              <Textarea rows={8} placeholder="পেজের বিষয়বস্তু লিখুন..." value={form.content} onChange={(e) => set("content", e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => set("is_active", !form.is_active)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? "bg-[#d64901]" : "bg-gray-300"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className="text-sm text-[#627066]">{form.is_active ? "Active" : "Inactive"}</span>
            </div>
            <div className="flex gap-2">
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
              <th className="w-12 px-5 py-3">SL</th>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center text-[#9eada4]">লোড হচ্ছে...</td></tr>
            ) : pages.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-[#9eada4]">কোনো পেজ নেই।</td></tr>
            ) : pages.map((p, i) => {
              const isActive = Boolean(p.is_active);
              return (
                <tr key={p.id} className="border-b border-[#f7f8f6] hover:bg-[#fbfcfa]">
                  <td className="px-5 py-3 text-[#9eada4]">{i + 1}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => openEdit(p)} className="font-medium text-[#d64901] hover:underline">{p.title}</button>
                  </td>
                  <td className="px-5 py-3 text-[#627066]">{p.title}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => copySlug(p.slug)} title="URL কপি করুন" className="rounded-md p-1.5 text-[#9eada4] hover:bg-[#f1f3ee] hover:text-[#253029]"><Copy className="h-4 w-4" /></button>
                      <button onClick={() => openEdit(p)} className="rounded-md p-1.5 text-[#9eada4] hover:bg-blue-50 hover:text-blue-500"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(p)} className="rounded-md p-1.5 text-[#9eada4] hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
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
