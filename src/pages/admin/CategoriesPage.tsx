import { useEffect, useMemo, useRef, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getCategoryImage } from "@/lib/categoryImages";
import { ImageIcon, Pencil, Plus, Save, Trash2, X } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  parent_id?: string | null;
  sort_order?: number | null;
  is_active?: boolean | number;
  show_in_navbar?: boolean | number;
  show_on_home?: boolean | number;
};

type EditForm = {
  id?: string;
  name: string;
  slug: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  show_in_navbar: boolean;
  show_on_home: boolean;
};

const emptyForm: EditForm = {
  name: "", slug: "", image_url: "",
  sort_order: 0, is_active: true,
  show_in_navbar: true, show_on_home: false,
};

function slugify(v: string) {
  return v.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

function bool(v: Category[keyof Category]) {
  return v === true || v === 1;
}

// Debounce helper
function useDebounce<T>(value: T, delay = 600): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const { toast } = useToast();

  // Track pending sort order saves
  const sortTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const rows = await adminApi<Category[]>("/api/admin/resources/categories");
      setCategories(rows.sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)));
    } catch {
      toast({ title: "লোড ব্যর্থ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const stats = useMemo(() => ({
    navbar: categories.filter((c) => bool(c.show_in_navbar)).length,
    home: categories.filter((c) => bool(c.show_on_home)).length,
  }), [categories]);

  // ── Open Add/Edit ─────────────────────────────────────────────
  const openAdd = () => {
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setForm({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image_url: cat.image_url || "",
      sort_order: Number(cat.sort_order || 0),
      is_active: bool(cat.is_active),
      show_in_navbar: bool(cat.show_in_navbar),
      show_on_home: bool(cat.show_on_home),
    });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setForm(emptyForm); };

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: f.id ? f.slug : slugify(name) }));
  };

  // ── Save (Add/Edit) ───────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast({ title: "নাম দিন", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        image_url: form.image_url || null,
        sort_order: Number(form.sort_order || 0),
        is_active: form.is_active,
        show_in_navbar: form.show_in_navbar,
        show_on_home: form.show_on_home,
      };
      if (form.id) {
        await adminApi(`/api/admin/resources/categories/${form.id}`, {
          method: "PUT", body: JSON.stringify(payload),
        });
        toast({ title: "ক্যাটাগরি আপডেট সফল" });
      } else {
        await adminApi("/api/admin/resources/categories", {
          method: "POST", body: JSON.stringify(payload),
        });
        toast({ title: "নতুন ক্যাটাগরি যোগ সফল" });
      }
      closeForm();
      fetchCategories();
    } catch (err) {
      toast({ title: "সেভ ব্যর্থ", description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Inline toggle update ──────────────────────────────────────
  const patchCategory = async (cat: Category, patch: Partial<Category>) => {
    // Optimistic update
    setCategories((prev) => prev.map((c) => c.id === cat.id ? { ...c, ...patch } : c));
    try {
      await adminApi(`/api/admin/resources/categories/${cat.id}`, {
        method: "PUT", body: JSON.stringify(patch),
      });
    } catch {
      // Revert on failure
      setCategories((prev) => prev.map((c) => c.id === cat.id ? cat : c));
      toast({ title: "আপডেট ব্যর্থ", variant: "destructive" });
    }
  };

  // ── Inline sort order with debounce ───────────────────────────
  const handleSortChange = (cat: Category, value: string) => {
    const num = Number(value) || 0;
    setCategories((prev) => prev.map((c) => c.id === cat.id ? { ...c, sort_order: num } : c));
    // Debounce API call
    if (sortTimers.current[cat.id]) clearTimeout(sortTimers.current[cat.id]);
    sortTimers.current[cat.id] = setTimeout(async () => {
      try {
        await adminApi(`/api/admin/resources/categories/${cat.id}`, {
          method: "PUT", body: JSON.stringify({ sort_order: num }),
        });
      } catch {
        toast({ title: "Sort order সেভ ব্যর্থ", variant: "destructive" });
      }
    }, 800);
  };

  // ── Delete ────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await adminApi(`/api/admin/resources/categories/${deleteConfirm.id}`, { method: "DELETE" });
      toast({ title: "ক্যাটাগরি মুছে ফেলা হয়েছে" });
      setDeleteConfirm(null);
      fetchCategories();
    } catch (err) {
      toast({ title: "মুছতে ব্যর্থ", description: err instanceof Error ? err.message : "", variant: "destructive" });
    }
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#253029]">ক্যাটাগরি ম্যানেজমেন্ট</h1>
          <p className="mt-1 text-sm text-[#60756a]">
            নেভবার: {stats.navbar}টি | হোম পেজ: {stats.home}টি
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-[#d64901] hover:bg-[#b83f00]">
          <Plus className="h-4 w-4" /> নতুন
        </Button>
      </div>

      {/* Table */}
      <section className="overflow-hidden rounded-xl border border-[#dfe5dc] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-[#eef1ec] bg-[#f6f8f5]">
              <tr className="text-xs font-semibold text-[#60756a]">
                <th className="px-4 py-3 text-left">ইমেজ</th>
                <th className="px-4 py-3 text-left">নাম</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-center">সিরিয়াল</th>
                <th className="px-4 py-3 text-center">হোম এ দেখাবো</th>
                <th className="px-4 py-3 text-center">নেভবার</th>
                <th className="px-4 py-3 text-center">মেনু</th>
                <th className="px-4 py-3 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center text-sm text-[#9eada4]">লোড হচ্ছে...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-sm text-[#9eada4]">কোনো ক্যাটাগরি নেই।</td></tr>
              ) : categories.map((cat) => {
                const img = getCategoryImage(cat.slug, cat.image_url);
                return (
                  <tr key={cat.id} className="border-b border-[#f7f8f6] hover:bg-[#fbfcfa]">
                    {/* Image */}
                    <td className="px-4 py-3">
                      {img ? (
                        <img src={img} alt={cat.name} className="h-11 w-11 rounded-full border border-[#e3e6de] object-cover" />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1f3ee]">
                          <ImageIcon className="h-5 w-5 text-[#c8d5cc]" />
                        </div>
                      )}
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <span className="font-semibold text-[#253029]">
                        {cat.parent_id ? <span className="mr-1 text-[#9eada4]">↳</span> : null}
                        {cat.name}
                      </span>
                    </td>

                    {/* Slug */}
                    <td className="px-4 py-3 font-mono text-xs text-[#60756a]">{cat.slug}</td>

                    {/* Sort order */}
                    <td className="px-4 py-3 text-center">
                      {!cat.parent_id && (
                        <Input
                          type="number"
                          className="mx-auto h-8 w-20 text-center"
                          value={cat.sort_order ?? 0}
                          onChange={(e) => handleSortChange(cat, e.target.value)}
                        />
                      )}
                    </td>

                    {/* Show on home */}
                    <td className="px-4 py-3 text-center">
                      {!cat.parent_id && (
                        <Switch
                          className="data-[state=checked]:bg-[#d64901]"
                          checked={bool(cat.show_on_home)}
                          onCheckedChange={(v) => patchCategory(cat, { show_on_home: v })}
                        />
                      )}
                    </td>

                    {/* Show in navbar */}
                    <td className="px-4 py-3 text-center">
                      <Switch
                        className="data-[state=checked]:bg-[#d64901]"
                        checked={bool(cat.show_in_navbar)}
                        onCheckedChange={(v) => patchCategory(cat, { show_in_navbar: v })}
                      />
                    </td>

                    {/* is_active (menu) */}
                    <td className="px-4 py-3 text-center">
                      <Switch
                        className="data-[state=checked]:bg-[#d64901]"
                        checked={bool(cat.is_active)}
                        onCheckedChange={(v) => patchCategory(cat, { is_active: v })}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(cat)}
                          className="rounded-md p-1.5 text-[#9eada4] hover:bg-[#f1f3ee] hover:text-[#253029]"
                          title="সম্পাদনা"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(cat)}
                          className="rounded-md p-1.5 text-[#9eada4] hover:bg-red-50 hover:text-red-500"
                          title="মুছুন"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Add / Edit Dialog ──────────────────────────────────── */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) closeForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "ক্যাটাগরি সম্পাদনা" : "নতুন ক্যাটাগরি"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">নাম *</Label>
              <Input
                id="cat-name"
                placeholder="Organic Honey"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug (URL)</Label>
              <Input
                id="cat-slug"
                placeholder="organic-honey"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
              />
              <p className="text-xs text-[#9eada4]">URL: /category/{form.slug || "slug"}</p>
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-img">ছবির URL</Label>
              <Input
                id="cat-img"
                placeholder="https://example.com/image.jpg"
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              />
              {/* Preview */}
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="preview"
                  className="mt-1 h-14 w-14 rounded-full border border-[#e3e6de] object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
            </div>

            {/* Sort order */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-sort">সিরিয়াল নম্বর</Label>
              <Input
                id="cat-sort"
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-3 gap-3 rounded-lg border border-[#e3e6de] bg-[#f7f8f6] p-3">
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-[#627066]">সক্রিয়</span>
                <Switch
                  className="data-[state=checked]:bg-[#d64901]"
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
                />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-[#627066]">নেভবার</span>
                <Switch
                  className="data-[state=checked]:bg-[#d64901]"
                  checked={form.show_in_navbar}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, show_in_navbar: v }))}
                />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-[#627066]">হোম পেজ</span>
                <Switch
                  className="data-[state=checked]:bg-[#d64901]"
                  checked={form.show_on_home}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, show_on_home: v }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#f1f3ee] pt-3">
              <Button type="button" variant="outline" onClick={closeForm}>
                <X className="mr-1 h-4 w-4" /> বাতিল
              </Button>
              <Button type="submit" disabled={saving} className="gap-2 bg-[#d64901] hover:bg-[#b93f00]">
                <Save className="h-4 w-4" />
                {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ──────────────────────────────── */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>ক্যাটাগরি মুছুন</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#627066]">
            <strong>"{deleteConfirm?.name}"</strong> ক্যাটাগরিটি মুছতে চান? এই ক্যাটাগরির সাথে যুক্ত পণ্যগুলো category ছাড়া থাকবে।
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>বাতিল</Button>
            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={confirmDelete}
            >
              <Trash2 className="mr-1 h-4 w-4" /> মুছুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
