import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { BookOpen, Pencil, Plus, Save, Trash2, X } from "lucide-react";

type Blog = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image_url?: string;
  category?: string;
  is_active: boolean | number;
  created_at?: string;
};

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  image_url: "",
  category: "",
  is_active: true,
};

function toSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const months = ["জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await adminApi<Blog[]>("/api/admin/resources/blogs");
      setBlogs(data);
    } catch (error) {
      toast({
        title: "লোড ব্যর্থ",
        description: error instanceof Error ? error.message : "ব্লগ লোড করা যায়নি।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (blog: Blog) => {
    setEditing(blog);
    setForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      image_url: blog.image_url || "",
      category: blog.category || "",
      is_active: Boolean(blog.is_active),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: editing ? f.slug : toSlug(title),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "শিরোনাম দিন", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await adminApi(`/api/admin/resources/blogs/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        toast({ title: "আপডেট সফল", description: "ব্লগ আপডেট হয়েছে।" });
      } else {
        await adminApi("/api/admin/resources/blogs", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast({ title: "যোগ সফল", description: "নতুন ব্লগ যোগ হয়েছে।" });
      }
      closeForm();
      fetchBlogs();
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

  const handleDelete = async (blog: Blog) => {
    if (!confirm(`"${blog.title}" ব্লগটি মুছতে চান?`)) return;
    try {
      await adminApi(`/api/admin/resources/blogs/${blog.id}`, { method: "DELETE" });
      toast({ title: "মুছে ফেলা হয়েছে" });
      fetchBlogs();
    } catch (error) {
      toast({ title: "মুছতে ব্যর্থ", variant: "destructive" });
    }
  };

  const handleToggle = async (blog: Blog) => {
    try {
      await adminApi(`/api/admin/resources/blogs/${blog.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !Boolean(blog.is_active) }),
      });
      fetchBlogs();
    } catch {
      toast({ title: "আপডেট ব্যর্থ", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ব্লগ ম্যানেজমেন্ট</h1>
        <Button onClick={openAdd} className="gap-2 bg-[#d64901] hover:bg-[#b93f00]">
          <Plus className="h-4 w-4" />
          নতুন ব্লগ
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-[#e3e6de] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">
              {editing ? "ব্লগ সম্পাদনা" : "নতুন ব্লগ যোগ করুন"}
            </h2>
            <button onClick={closeForm} className="text-[#9eada4] hover:text-[#253029]" aria-label="বন্ধ">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="blog-title">শিরোনাম *</Label>
                <Input
                  id="blog-title"
                  placeholder="ব্লগের শিরোনাম"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <Label htmlFor="blog-slug">Slug (URL)</Label>
                <Input
                  id="blog-slug"
                  placeholder="blog-url-slug"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="blog-category">ক্যাটাগরি / ট্যাগ</Label>
                <Input
                  id="blog-category"
                  placeholder="যেমন: Health Tips, General"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                />
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <Label htmlFor="blog-image">ছবির URL</Label>
                <Input
                  id="blog-image"
                  placeholder="https://..."
                  value={form.image_url}
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                />
              </div>

              {/* Image preview */}
              {form.image_url && (
                <div className="space-y-1.5">
                  <Label>ছবি প্রিভিউ</Label>
                  <img
                    src={form.image_url}
                    alt="preview"
                    className="h-20 w-32 rounded-md border border-[#e3e6de] object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              )}

              {/* Status */}
              <div className="space-y-1.5">
                <Label htmlFor="blog-status">স্ট্যাটাস</Label>
                <select
                  id="blog-status"
                  value={form.is_active ? "true" : "false"}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === "true" }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </select>
              </div>

              {/* Excerpt */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="blog-excerpt">সংক্ষিপ্ত বিবরণ</Label>
                <Textarea
                  id="blog-excerpt"
                  placeholder="ব্লগের ছোট বিবরণ..."
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* Content */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="blog-content">মূল বিষয়বস্তু</Label>
                <Textarea
                  id="blog-content"
                  placeholder="ব্লগের বিস্তারিত লিখুন..."
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={6}
                />
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

      {/* Blog List */}
      <div className="rounded-xl border border-[#e3e6de] bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-sm text-[#9eada4]">লোড হচ্ছে...</div>
        ) : blogs.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#9eada4]">কোনো ব্লগ নেই।</div>
        ) : (
          <div className="divide-y divide-[#f1f3ee]">
            {blogs.map((blog) => {
              const isActive = Boolean(blog.is_active);
              return (
                <div key={blog.id} className="flex items-center gap-4 px-4 py-3">
                  {/* Thumbnail */}
                  <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-md bg-[#f1f3ee]">
                    {blog.image_url ? (
                      <img
                        src={blog.image_url}
                        alt={blog.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BookOpen className="h-6 w-6 text-[#c8d5cc]" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-[#253029]">{blog.title}</p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {isActive ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#9eada4]">
                      {blog.category && (
                        <span className="mr-2 font-medium uppercase text-[#7a9e8a]">
                          {blog.category}
                        </span>
                      )}
                      {formatDate(blog.created_at) && `• ${formatDate(blog.created_at)}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(blog)}
                      aria-label="স্ট্যাটাস পরিবর্তন"
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        isActive ? "bg-[#d64901]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          isActive ? "translate-x-[18px]" : "translate-x-[3px]"
                        }`}
                      />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => openEdit(blog)}
                      className="rounded-md p-1.5 text-[#9eada4] hover:bg-[#f1f3ee] hover:text-[#253029]"
                      aria-label="সম্পাদনা"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(blog)}
                      className="rounded-md p-1.5 text-[#9eada4] hover:bg-red-50 hover:text-red-500"
                      aria-label="মুছুন"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
