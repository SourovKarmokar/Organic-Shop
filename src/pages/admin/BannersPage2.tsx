import { useEffect, useRef, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, Pencil, Plus, Save, Trash2, Upload, X } from "lucide-react";

type BannerCategory = {
  id: string;
  name: string;
  slug: string;
};

type Banner = {
  id: string;
  title?: string;
  image_url: string;
  redirect_url?: string;
  category_id?: string;
  category_name?: string;
  is_active: boolean | number;
  sort_order: number;
  created_at?: string;
};

const emptyForm = {
  title: "",
  image_url: "",
  redirect_url: "",
  category_id: "",
  is_active: true,
  sort_order: 0,
};

// ── Reusable Image Upload Field ──────────────────────────────────
function ImageUploadField({
  value,
  onChange,
  label = "ছবি *",
  maxSizeMB = 3,
  aspectHint = "Banner: 1200×400px বা যেকোনো wide image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  maxSizeMB?: number;
  aspectHint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({ title: `ফাইল ${maxSizeMB}MB এর বেশি হতে পারবে না`, variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      onChange(base64);
      toast({ title: "ছবি লোড হয়েছে", description: "সেভ করুন বাটন চেপে সংরক্ষণ করুন।" });
    } catch {
      toast({ title: "আপলোড ব্যর্থ", variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* Drop / click area */}
      <div
        onClick={() => inputRef.current?.click()}
        className={`relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors ${
          value
            ? "border-[#d64901]/30 bg-[#fff9f6]"
            : "border-[#e3e6de] bg-[#f7f8f6] hover:border-[#d64901]/50 hover:bg-[#fff9f6]"
        }`}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="preview"
              className="max-h-32 w-full rounded-lg object-contain px-3"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <span className="text-xs text-[#9eada4]">ক্লিক করে পরিবর্তন করুন</span>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f3ee]">
              <ImageIcon className="h-6 w-6 text-[#c8d5cc]" />
            </div>
            <p className="text-sm font-medium text-[#627066]">
              {uploading ? "লোড হচ্ছে..." : "ক্লিক করে ছবি বাছুন"}
            </p>
            <p className="text-xs text-[#9eada4]">{aspectHint}</p>
            <p className="text-xs text-[#9eada4]">PNG, JPG, WebP — সর্বোচ্চ {maxSizeMB}MB</p>
          </>
        )}

        {/* Upload icon overlay */}
        {!value && (
          <div className="absolute bottom-3 right-3">
            <Upload className="h-4 w-4 text-[#c8d5cc]" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
        disabled={uploading}
      />

      {/* URL input as alternative */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="অথবা সরাসরি URL দিন: https://..."
            value={value?.startsWith("data:") ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            className="text-xs"
          />
          {value && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9eada4] hover:text-red-400"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="shrink-0 gap-1.5"
        >
          <Upload className="h-3.5 w-3.5" />
          {uploading ? "লোড..." : "আপলোড"}
        </Button>
      </div>
    </div>
  );
}

export default function BannersManagePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<BannerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bannersData, catData] = await Promise.all([
        adminApi<Banner[]>("/api/admin/resources/banners"),
        adminApi<BannerCategory[]>("/api/admin/resources/banner_categories"),
      ]);
      setBanners(bannersData);
      setCategories(catData);
    } catch (error) {
      toast({
        title: "লোড ব্যর্থ",
        description: error instanceof Error ? error.message : "ব্যানার লোড করা যায়নি।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (banner: Banner) => {
    setEditing(banner);
    setForm({
      title: banner.title || "",
      image_url: banner.image_url,
      redirect_url: banner.redirect_url || "",
      category_id: banner.category_id || "",
      is_active: Boolean(banner.is_active),
      sort_order: banner.sort_order,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url.trim()) {
      toast({ title: "ছবি দিন (আপলোড করুন বা URL দিন)", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await adminApi(`/api/admin/resources/banners/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        toast({ title: "আপডেট সফল", description: "ব্যানার আপডেট হয়েছে।" });
      } else {
        await adminApi("/api/admin/resources/banners", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast({ title: "যোগ সফল", description: "নতুন ব্যানার যোগ হয়েছে।" });
      }
      closeForm();
      fetchData();
    } catch (error) {
      toast({
        title: "সেভ ব্যর্থ",
        description: error instanceof Error ? error.message : "সেভ করা যায়নি।",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (banner: Banner) => {
    if (!confirm(`"${banner.title || "এই ব্যানার"}" মুছতে চান?`)) return;
    try {
      await adminApi(`/api/admin/resources/banners/${banner.id}`, { method: "DELETE" });
      toast({ title: "মুছে ফেলা হয়েছে" });
      fetchData();
    } catch (error) {
      toast({ title: "মুছতে ব্যর্থ", variant: "destructive" });
    }
  };

  const handleToggle = async (banner: Banner) => {
    try {
      await adminApi(`/api/admin/resources/banners/${banner.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !Boolean(banner.is_active) }),
      });
      fetchData();
    } catch {
      toast({ title: "আপডেট ব্যর্থ", variant: "destructive" });
    }
  };

  const getCategoryName = (id?: string) => {
    if (!id) return null;
    return categories.find((c) => c.id === id)?.name || null;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ব্যানার ম্যানেজমেন্ট</h1>
        <Button onClick={openAdd} className="gap-2 bg-[#d64901] hover:bg-[#b93f00]">
          <Plus className="h-4 w-4" />
          নতুন ব্যানার
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-[#e3e6de] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">
              {editing ? "ব্যানার সম্পাদনা" : "নতুন ব্যানার যোগ করুন"}
            </h2>
            <button onClick={closeForm} className="text-[#9eada4] hover:text-[#253029]" aria-label="বন্ধ">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="banner-title">শিরোনাম</Label>
                <Input
                  id="banner-title"
                  placeholder="ব্যানারের নাম / শিরোনাম"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-1.5">
                <Label htmlFor="banner-sort">ক্রম</Label>
                <Input
                  id="banner-sort"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-1.5 md:col-span-2">
                <ImageUploadField
                  label="ব্যানার ছবি *"
                  value={form.image_url}
                  onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
                  maxSizeMB={3}
                  aspectHint="Banner: 1200×400px বা wide image (PNG, JPG, WebP)"
                />
              </div>

              {/* Redirect URL */}
              <div className="space-y-1.5">
                <Label htmlFor="banner-link">লিংক (Redirect URL)</Label>
                <Input
                  id="banner-link"
                  placeholder="/categories বা https://..."
                  value={form.redirect_url}
                  onChange={(e) => setForm((f) => ({ ...f, redirect_url: e.target.value }))}
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="banner-cat">ব্যানার ক্যাটাগরি</Label>
                <select
                  id="banner-cat"
                  value={form.category_id}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">-- ক্যাটাগরি বাছুন --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <Label htmlFor="banner-status">স্ট্যাটাস</Label>
                <select
                  id="banner-status"
                  value={form.is_active ? "true" : "false"}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === "true" }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={saving} className="gap-2 bg-[#d64901] hover:bg-[#b93f00]">
                <Save className="h-4 w-4" />
                {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>
                <X className="h-4 w-4 mr-1" />
                বাতিল
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Banner List */}
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-xl border border-[#e3e6de] bg-white py-16 text-center text-sm text-[#9eada4]">
            লোড হচ্ছে...
          </div>
        ) : banners.length === 0 ? (
          <div className="rounded-xl border border-[#e3e6de] bg-white py-16 text-center text-sm text-[#9eada4]">
            কোনো ব্যানার নেই। নতুন ব্যানার যোগ করুন।
          </div>
        ) : (
          banners.map((banner) => {
            const isActive = Boolean(banner.is_active);
            const catName = getCategoryName(banner.category_id);

            return (
              <div key={banner.id} className="overflow-hidden rounded-xl border border-[#e3e6de] bg-white shadow-sm">
                {/* Banner Image - large */}
                <div className="relative h-44 w-full bg-[#f1f3ee] sm:h-52">
                  {banner.image_url ? (
                    <img
                      src={banner.image_url}
                      alt={banner.title || "banner"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-[#c8d5cc]" />
                    </div>
                  )}
                  {/* Active badge overlay */}
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isActive ? "bg-green-500 text-white" : "bg-gray-400 text-white"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Info & Actions */}
                <div className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    {banner.title && (
                      <p className="truncate font-semibold text-[#253029]">{banner.title}</p>
                    )}
                    {banner.redirect_url && (
                      <p className="mt-0.5 truncate text-sm text-[#9eada4]">
                        লিংক: {banner.redirect_url}
                      </p>
                    )}
                    {catName && (
                      <p className="mt-0.5 text-xs text-[#7a9e8a]">ক্যাটাগরি: {catName}</p>
                    )}
                    <p className="mt-0.5 text-xs text-[#b0bcb5]">ক্রম: {banner.sort_order}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex shrink-0 items-center gap-2">
                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(banner)}
                      aria-label="স্ট্যাটাস পরিবর্তন"
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isActive ? "bg-[#d64901]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          isActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => openEdit(banner)}
                      className="flex items-center gap-1 rounded-md border border-[#e3e6de] px-3 py-1.5 text-sm text-[#627066] transition hover:bg-[#f1f3ee]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      এডিট
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(banner)}
                      className="flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-500 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      ডিলিট
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
