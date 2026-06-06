import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Plus, Save, Trash2, X, Youtube } from "lucide-react";

type Video = {
  id: number;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  sort_order: number;
  is_active: boolean | number;
};

// Extract YouTube video ID from various URL formats
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getYouTubeThumbnail(url: string): string {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : "";
}

const emptyForm = { title: "", video_url: "", sort_order: 0, is_active: true };

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const data = await adminApi<Video[]>("/api/admin/resources/videos");
      setVideos(data);
    } catch (error) {
      toast({
        title: "লোড ব্যর্থ",
        description: error instanceof Error ? error.message : "ভিডিও লোড করা যায়নি।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (video: Video) => {
    setEditing(video);
    setForm({
      title: video.title,
      video_url: video.video_url,
      sort_order: video.sort_order,
      is_active: Boolean(video.is_active),
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
    if (!form.title.trim() || !form.video_url.trim()) {
      toast({ title: "দরকারি তথ্য দিন", description: "শিরোনাম ও ভিডিও URL প্রয়োজন।", variant: "destructive" });
      return;
    }
    const youtubeId = extractYouTubeId(form.video_url);
    const thumbnail_url = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : "";
    const payload = { ...form, thumbnail_url };
    setSaving(true);
    try {
      if (editing) {
        await adminApi(`/api/admin/resources/videos/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast({ title: "আপডেট সফল", description: "ভিডিও আপডেট হয়েছে।" });
      } else {
        await adminApi("/api/admin/resources/videos", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast({ title: "যোগ সফল", description: "নতুন ভিডিও যোগ হয়েছে।" });
      }
      closeForm();
      fetchVideos();
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

  const handleDelete = async (video: Video) => {
    if (!confirm(`"${video.title}" ভিডিওটি মুছতে চান?`)) return;
    try {
      await adminApi(`/api/admin/resources/videos/${video.id}`, { method: "DELETE" });
      toast({ title: "মুছে ফেলা হয়েছে" });
      fetchVideos();
    } catch (error) {
      toast({
        title: "মুছতে ব্যর্থ",
        description: error instanceof Error ? error.message : "মুছতে পারা যায়নি।",
        variant: "destructive",
      });
    }
  };

  const handleToggle = async (video: Video) => {
    try {
      await adminApi(`/api/admin/resources/videos/${video.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !Boolean(video.is_active) }),
      });
      fetchVideos();
    } catch (error) {
      toast({ title: "আপডেট ব্যর্থ", variant: "destructive" });
    }
  };

  const previewThumbnail = form.video_url ? getYouTubeThumbnail(form.video_url) : "";
  const previewId = form.video_url ? extractYouTubeId(form.video_url) : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ভিডিও গ্যালারি</h1>
        <Button onClick={openAdd} className="gap-2 bg-[#d64901] hover:bg-[#b93f00]">
          <Plus className="h-4 w-4" />
          ভিডিও যোগ করুন
        </Button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="rounded-xl border border-[#e3e6de] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">
              {editing ? "ভিডিও সম্পাদনা করুন" : "নতুন ভিডিও যোগ করুন"}
            </h2>
            <button onClick={closeForm} className="text-[#9eada4] hover:text-[#253029]" aria-label="বন্ধ করুন">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="video-title">শিরোনাম *</Label>
                <Input
                  id="video-title"
                  placeholder="ভিডিওর নাম লিখুন"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-1.5">
                <Label htmlFor="video-sort">ক্রম (Sort Order)</Label>
                <Input
                  id="video-sort"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                />
              </div>

              {/* YouTube URL - full width */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="video-url">YouTube ভিডিও URL *</Label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
                  <Input
                    id="video-url"
                    className="pl-9"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={form.video_url}
                    onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
                    required
                  />
                </div>
                {form.video_url && !previewId && (
                  <p className="text-xs text-red-500">সঠিক YouTube URL দিন</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <Label htmlFor="video-status">স্ট্যাটাস</Label>
                <select
                  id="video-status"
                  value={form.is_active ? "true" : "false"}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === "true" }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="true">সক্রিয়</option>
                  <option value="false">নিষ্ক্রিয়</option>
                </select>
              </div>

              {/* Thumbnail Preview */}
              {previewThumbnail && (
                <div className="space-y-1.5">
                  <Label>থাম্বনেইল প্রিভিউ</Label>
                  <img
                    src={previewThumbnail}
                    alt="thumbnail preview"
                    className="h-20 w-36 rounded-md border border-[#e3e6de] object-cover"
                  />
                </div>
              )}
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

      {/* Video List */}
      <div className="rounded-xl border border-[#e3e6de] bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-sm text-[#9eada4]">লোড হচ্ছে...</div>
        ) : videos.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#9eada4]">কোনো ভিডিও নেই। নতুন ভিডিও যোগ করুন।</div>
        ) : (
          <div className="divide-y divide-[#f1f3ee]">
            {videos.map((video) => {
              const thumb = video.thumbnail_url || getYouTubeThumbnail(video.video_url);
              const youtubeId = extractYouTubeId(video.video_url);
              const isActive = Boolean(video.is_active);

              return (
                <div key={video.id} className="flex items-center gap-4 px-4 py-3">
                  {/* Thumbnail */}
                  <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-md bg-[#f1f3ee]">
                    {thumb ? (
                      <img src={thumb} alt={video.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Youtube className="h-7 w-7 text-red-400" />
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-black/40 p-1">
                        <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[#253029]">{video.title}</p>
                    {youtubeId && (
                      <p className="mt-0.5 text-xs text-[#9eada4]">ID: {youtubeId}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-shrink-0 items-center gap-3">
                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(video)}
                      aria-label={isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
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
                      onClick={() => openEdit(video)}
                      aria-label="সম্পাদনা করুন"
                      className="rounded-md p-1.5 text-[#9eada4] transition hover:bg-[#f1f3ee] hover:text-[#253029]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(video)}
                      aria-label="মুছুন"
                      className="rounded-md p-1.5 text-[#9eada4] transition hover:bg-red-50 hover:text-red-500"
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
