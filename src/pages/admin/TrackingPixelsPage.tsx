import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, ExternalLink, Plus, Save, Trash2, Pencil } from "lucide-react";

// ── Tab definitions ────────────────────────────────────────────────
const TABS = [
  {
    key: "gtm",
    label: "Google Tag Manager",
    emoji: "🏷️",
    type: "gtm",
    idLabel: "Container ID",
    idPlaceholder: "GTM-XXXXXXX",
    helpText: "Google Tag Manager Console থেকে Container ID কপি করুন",
    description:
      "Google Tag Manager দিয়ে সব ট্র্যাকিং ট্যাগ এক জায়গায় ম্যানেজ করুন।",
    learnUrl: "https://tagmanager.google.com",
    steps: [
      "tagmanager.google.com এ একটি অ্যাকাউন্ট তৈরি করুন",
      "Dashboard → Settings এ যান",
      "Container ID কপি করে এখানে পেস্ট করুন",
    ],
  },
  {
    key: "ga",
    label: "Google Analytics",
    emoji: "📊",
    type: "google_analytics",
    idLabel: "Measurement ID",
    idPlaceholder: "G-XXXXXXXXXX",
    helpText: "Google Analytics 4 → Admin → Data Streams থেকে Measurement ID নিন",
    description: "Google Analytics দিয়ে ওয়েবসাইটের ট্র্যাফিক ও ব্যবহারকারী বিশ্লেষণ করুন।",
    learnUrl: "https://analytics.google.com",
    steps: [
      "analytics.google.com এ একটি Property তৈরি করুন",
      "Admin → Data Streams → Web এ যান",
      "Measurement ID (G-XXXXXXXX) কপি করুন",
    ],
  },
  {
    key: "fb",
    label: "Facebook Pixel",
    emoji: "📘",
    type: "facebook",
    idLabel: "Pixel ID",
    idPlaceholder: "123456789012345",
    helpText: "Facebook Business Manager → Events Manager থেকে Pixel ID নিন",
    description: "Facebook Pixel দিয়ে বিজ্ঞাপনের কার্যকারিতা ট্র্যাক করুন এবং রিটার্গেটিং করুন।",
    learnUrl: "https://business.facebook.com/events_manager",
    steps: [
      "business.facebook.com এ যান",
      "Events Manager → Connect Data Sources → Web",
      "Pixel তৈরি করুন এবং Pixel ID কপি করুন",
    ],
  },
];

type Pixel = {
  id: string;
  name: string;
  type: string;
  pixel_id: string;
  is_active: boolean | number;
};

type CardForm = {
  name: string;
  pixel_id: string;
  is_active: boolean;
};

function emptyCard(tab: (typeof TABS)[number]): CardForm {
  return { name: tab.label, pixel_id: "", is_active: true };
}

export default function TrackingPixelsPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState<CardForm>(emptyCard(TABS[0]));
  const { toast } = useToast();

  const tab = TABS.find((t) => t.key === activeTab)!;
  const tabPixels = pixels.filter((p) => p.type === tab.type);

  const fetchPixels = async () => {
    setLoading(true);
    try {
      const data = await adminApi<Pixel[]>("/api/admin/resources/tracking_pixels");
      setPixels(data);
    } catch {
      toast({ title: "লোড ব্যর্থ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPixels(); }, []);

  // When switching tabs, reset form
  const switchTab = (key: string) => {
    setActiveTab(key);
    setShowAddForm(false);
    setEditingId(null);
    const t = TABS.find((x) => x.key === key)!;
    setCardForm(emptyCard(t));
  };

  const openAdd = () => {
    setEditingId(null);
    setCardForm(emptyCard(tab));
    setShowAddForm(true);
  };

  const openEdit = (px: Pixel) => {
    setEditingId(px.id);
    setCardForm({ name: px.name, pixel_id: px.pixel_id, is_active: Boolean(px.is_active) });
    setShowAddForm(false);
  };

  const handleSave = async (targetId?: string) => {
    const form = cardForm;
    if (!form.pixel_id.trim()) {
      toast({ title: `${tab.idLabel} দিন`, variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (targetId) {
        await adminApi(`/api/admin/resources/tracking_pixels/${targetId}`, {
          method: "PUT",
          body: JSON.stringify({ ...form, type: tab.type }),
        });
        toast({ title: "আপডেট সফল" });
        setEditingId(null);
      } else {
        await adminApi("/api/admin/resources/tracking_pixels", {
          method: "POST",
          body: JSON.stringify({ ...form, type: tab.type }),
        });
        toast({ title: "যোগ সফল" });
        setShowAddForm(false);
      }
      fetchPixels();
    } catch (err) {
      toast({ title: "সেভ ব্যর্থ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (px: Pixel) => {
    if (!confirm(`"${px.name}" মুছতে চান?`)) return;
    try {
      await adminApi(`/api/admin/resources/tracking_pixels/${px.id}`, { method: "DELETE" });
      toast({ title: "মুছে ফেলা হয়েছে" });
      fetchPixels();
    } catch {
      toast({ title: "মুছতে ব্যর্থ", variant: "destructive" });
    }
  };

  const handleToggle = async (px: Pixel) => {
    try {
      await adminApi(`/api/admin/resources/tracking_pixels/${px.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !Boolean(px.is_active) }),
      });
      fetchPixels();
    } catch {
      toast({ title: "আপডেট ব্যর্থ", variant: "destructive" });
    }
  };

  // Pixel card (existing entry)
  const PixelCard = ({ px }: { px: Pixel }) => {
    const isEditing = editingId === px.id;
    const isActive = Boolean(px.is_active);

    if (isEditing) {
      return (
        <div className="rounded-xl border-2 border-[#d64901] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-semibold text-[#253029]">{px.name}</span>
            <span className="rounded-full bg-[#fff1e8] px-2.5 py-0.5 text-xs font-medium text-[#d64901]">সম্পাদনা</span>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor={`name-${px.id}`}>নাম</Label>
              <Input
                id={`name-${px.id}`}
                value={cardForm.name}
                onChange={(e) => setCardForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`pid-${px.id}`}>
                {tab.idLabel} <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`pid-${px.id}`}
                placeholder={tab.idPlaceholder}
                value={cardForm.pixel_id}
                onChange={(e) => setCardForm((f) => ({ ...f, pixel_id: e.target.value }))}
              />
              <p className="text-xs text-[#9eada4]">{tab.helpText}</p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCardForm((f) => ({ ...f, is_active: !f.is_active }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    cardForm.is_active ? "bg-[#d64901]" : "bg-gray-300"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${cardForm.is_active ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className="text-sm text-[#627066]">Status: {cardForm.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { handleDelete(px); }} className="flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5" /> মুছুন
                </button>
                <button onClick={() => { handleSave(px.id); }} disabled={saving} className="flex items-center gap-1 rounded-md bg-[#d64901] px-3 py-1.5 text-sm text-white hover:bg-[#b93f00]">
                  <Save className="h-3.5 w-3.5" /> সেভ
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-[#e3e6de] bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-semibold text-[#253029]">{px.name}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
          </span>
        </div>
        <div className="mb-1 space-y-1">
          <Label className="text-xs text-[#9eada4]">{tab.idLabel}</Label>
          <Input value={px.pixel_id} readOnly className="bg-[#f7f8f6] font-mono text-sm" />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggle(px)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? "bg-[#d64901]" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className="text-sm text-[#627066]">Status: {isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { handleDelete(px); }} className="rounded-md p-1.5 text-[#9eada4] hover:bg-red-50 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => openEdit(px)}
              className="flex items-center gap-1 rounded-md border border-[#e3e6de] px-3 py-1.5 text-sm text-[#627066] hover:bg-[#f1f3ee]"
            >
              <Pencil className="h-3.5 w-3.5" /> সম্পাদনা
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#253029]">ট্র্যাকিং পিক্সেল</h1>
        <p className="mt-0.5 text-sm text-[#9eada4]">
          Google Tag Manager, Google Analytics ও Facebook Pixel সেটআপ করুন
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-[#e3e6de] bg-[#f7f8f6] p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              activeTab === t.key
                ? "bg-white shadow-sm text-[#253029]"
                : "text-[#627066] hover:text-[#253029]"
            }`}
          >
            <span>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Info banner */}
      <div className="flex gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
        <div className="text-sm text-orange-700">
          <p className="font-medium">{tab.description}</p>
          <a href={tab.learnUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs underline">
            {tab.label} Console খুলুন <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Existing pixels for this tab */}
      {loading ? (
        <div className="py-8 text-center text-sm text-[#9eada4]">লোড হচ্ছে...</div>
      ) : (
        <div className="space-y-4">
          {tabPixels.map((px) => (
            <PixelCard key={px.id} px={px} />
          ))}
        </div>
      )}

      {/* Add new form */}
      {showAddForm && (
        <div className="rounded-xl border-2 border-dashed border-[#d64901] bg-[#fff9f6] p-5">
          <p className="mb-4 font-semibold text-[#253029]">নতুন {tab.label} যোগ করুন</p>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>নাম</Label>
              <Input
                placeholder={tab.label}
                value={cardForm.name}
                onChange={(e) => setCardForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>{tab.idLabel} <span className="text-red-500">*</span></Label>
              <Input
                placeholder={tab.idPlaceholder}
                value={cardForm.pixel_id}
                onChange={(e) => setCardForm((f) => ({ ...f, pixel_id: e.target.value }))}
              />
              <p className="text-xs text-[#9eada4]">{tab.helpText}</p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCardForm((f) => ({ ...f, is_active: !f.is_active }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${cardForm.is_active ? "bg-[#d64901]" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${cardForm.is_active ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className="text-sm text-[#627066]">{cardForm.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</span>
            </div>
            <div className="flex gap-2 pt-1">
              <Button disabled={saving} onClick={() => handleSave()} className="gap-2 bg-[#d64901] hover:bg-[#b93f00]">
                <Save className="h-4 w-4" /> সেভ করুন
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>বাতিল</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add button */}
      {!showAddForm && (
        <button
          onClick={openAdd}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#e3e6de] py-4 text-sm font-medium text-[#9eada4] transition hover:border-[#d64901] hover:text-[#d64901]"
        >
          <Plus className="h-4 w-4" />
          আরেকটি {tab.label} যোগ করুন
        </button>
      )}
    </div>
  );
}
