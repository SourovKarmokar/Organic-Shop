import { useEffect, useRef, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, Save, Upload, X } from "lucide-react";

// All setting keys we manage
const SETTING_KEYS = [
  // গ্রাফিক
  "site_name", "site_logo", "site_favicon",
  // টপ বার
  "topbar_phone", "topbar_email", "topbar_text",
  // যোগাযোগ
  "contact_phone", "contact_phone2", "contact_email", "contact_address", "whatsapp_url", "map_embed",
  // সোশ্যাল
  "social_facebook", "social_instagram", "social_youtube", "social_twitter",
  // কুরিয়ার
  "courier_primary", "courier_note", "courier_cod_enabled",
  // ফুটার
  "footer_copyright", "footer_about",
  // SEO
  "seo_title", "seo_description", "seo_keywords", "og_image",
  // AI চ্যাট
  "ai_chat_enabled", "ai_chat_key",
  // অনান্য
  "maintenance_mode", "currency_symbol", "currency_position", "order_prefix",
];

type SettingRow = { id: string; key: string; value: string | null; group_name: string };
type Settings = Record<string, string>;

// Section config
const SECTIONS = [
  {
    title: "গ্রাফিক",
    fields: [
      { key: "site_name", label: "সাইটের নাম", type: "text", placeholder: "Organic Shop" },
      { key: "site_logo", label: "লোগো URL", type: "text", placeholder: "https://..." },
      { key: "site_favicon", label: "ফেভিকন URL", type: "text", placeholder: "https://..." },
    ],
  },
  {
    title: "টপ বার সেটিং",
    fields: [
      { key: "topbar_phone", label: "ফোন নম্বর", type: "text", placeholder: "01XXXXXXXXX" },
      { key: "topbar_email", label: "ইমেইল", type: "text", placeholder: "info@example.com" },
      { key: "topbar_text", label: "টপ বার টেক্সট", type: "text", placeholder: "বিনামূল্যে ডেলিভারি ৫০০+ টাকার অর্ডারে" },
    ],
  },
  {
    title: "যোগাযোগ তথ্য",
    fields: [
      { key: "contact_phone", label: "ফোন ১", type: "text", placeholder: "+8801XXXXXXXXX" },
      { key: "contact_phone2", label: "ফোন ২", type: "text", placeholder: "+8801XXXXXXXXX" },
      { key: "contact_email", label: "ইমেইল", type: "text", placeholder: "info@example.com" },
      { key: "whatsapp_url", label: "WhatsApp URL", type: "text", placeholder: "https://wa.me/88..." },
      { key: "contact_address", label: "ঠিকানা", type: "textarea", placeholder: "ঢাকা, বাংলাদেশ" },
      { key: "map_embed", label: "Google Map Embed URL", type: "text", placeholder: "https://maps.google.com/..." },
    ],
  },
  {
    title: "সোশ্যাল লিংক",
    fields: [
      { key: "social_facebook", label: "Facebook", type: "text", placeholder: "https://facebook.com/yourpage" },
      { key: "social_instagram", label: "Instagram", type: "text", placeholder: "https://instagram.com/yourpage" },
      { key: "social_youtube", label: "YouTube", type: "text", placeholder: "https://youtube.com/@yourchannel" },
      { key: "social_twitter", label: "Twitter / X", type: "text", placeholder: "https://twitter.com/yourhandle" },
    ],
  },
  {
    title: "কুরিয়ার সেটিং",
    fields: [
      { key: "courier_primary", label: "প্রাইমারি কুরিয়ার", type: "text", placeholder: "Steadfast" },
      { key: "courier_note", label: "কুরিয়ার নোট", type: "textarea", placeholder: "Cash on Delivery পাওয়া যায়..." },
    ],
  },
  {
    title: "ফুটার সেটিং",
    fields: [
      { key: "footer_copyright", label: "কপিরাইট টেক্সট", type: "text", placeholder: "© 2026 Organic Shop. All rights reserved. Developed by Digital Webars." },
      { key: "footer_about", label: "ফুটার পরিচিতি", type: "textarea", placeholder: "আমাদের সম্পর্কে সংক্ষিপ্ত বিবরণ..." },
    ],
  },
  {
    title: "SEO / মেটা তথ্য",
    fields: [
      { key: "seo_title", label: "সাইট টাইটেল", type: "text", placeholder: "Organic Shop - খাঁটি জৈব পণ্য" },
      { key: "seo_description", label: "মেটা বিবরণ", type: "textarea", placeholder: "খাঁটি জৈব পণ্যের বিশ্বস্ত অনলাইন শপ..." },
      { key: "seo_keywords", label: "কীওয়ার্ড", type: "text", placeholder: "organic, honey, nuts, spices" },
      { key: "og_image", label: "OG Image URL", type: "text", placeholder: "https://..." },
    ],
  },
  {
    title: "AI লাইভ চ্যাট",
    fields: [
      { key: "ai_chat_key", label: "AI Chat API Key", type: "text", placeholder: "sk-..." },
    ],
    toggle: { key: "ai_chat_enabled", label: "AI চ্যাট সক্রিয় করুন" },
  },
  {
    title: "অনান্য",
    fields: [
      { key: "currency_symbol", label: "মুদ্রা চিহ্ন", type: "text", placeholder: "৳" },
      { key: "currency_position", label: "মুদ্রা অবস্থান", type: "text", placeholder: "before" },
      { key: "order_prefix", label: "অর্ডার প্রিফিক্স", type: "text", placeholder: "ORD" },
    ],
    toggle: { key: "maintenance_mode", label: "Maintenance Mode" },
  },
];

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [rows, setRows] = useState<SettingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await adminApi<SettingRow[]>("/api/admin/resources/site_settings");
      setRows(data);
      const map: Settings = {};
      for (const row of data) map[row.key] = row.value ?? "";
      setSettings(map);
    } catch {
      toast({ title: "লোড ব্যর্থ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const set = (key: string, value: string) =>
    setSettings((s) => ({ ...s, [key]: value }));

  // Convert file to Base64 data URL
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Handle logo file upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "ফাইল ২MB এর বেশি হতে পারবে না", variant: "destructive" });
      return;
    }
    setUploadingLogo(true);
    try {
      const base64 = await fileToBase64(file);
      set("site_logo", base64);
      toast({ title: "লোগো আপলোড হয়েছে", description: "সেভ করুন বাটন চেপে সংরক্ষণ করুন।" });
    } catch {
      toast({ title: "আপলোড ব্যর্থ", variant: "destructive" });
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  // Handle favicon file upload
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 512 * 1024) {
      toast({ title: "ফেভিকন ৫১২KB এর বেশি হতে পারবে না", variant: "destructive" });
      return;
    }
    setUploadingFavicon(true);
    try {
      const base64 = await fileToBase64(file);
      set("site_favicon", base64);
      toast({ title: "ফেভিকন আপলোড হয়েছে", description: "সেভ করুন বাটন চেপে সংরক্ষণ করুন।" });
    } catch {
      toast({ title: "আপলোড ব্যর্থ", variant: "destructive" });
    } finally {
      setUploadingFavicon(false);
      if (faviconInputRef.current) faviconInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // For each key, upsert (update if exists, create if not)
      const promises = SETTING_KEYS.map(async (key) => {
        const value = settings[key] ?? "";
        const existing = rows.find((r) => r.key === key);
        if (existing) {
          // Update
          await adminApi(`/api/admin/resources/site_settings/${existing.id}`, {
            method: "PUT",
            body: JSON.stringify({ key, value, group_name: existing.group_name || "general" }),
          });
        } else if (value) {
          // Create only if has value
          await adminApi("/api/admin/resources/site_settings", {
            method: "POST",
            body: JSON.stringify({ key, value, group_name: "general" }),
          });
        }
      });
      await Promise.all(promises);
      toast({ title: "সেটিং সেভ সফল", description: "সব পরিবর্তন সংরক্ষিত হয়েছে।" });
      fetchSettings();
    } catch (err) {
      toast({ title: "সেভ ব্যর্থ", description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-sm text-[#9eada4]">লোড হচ্ছে...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#253029]">সাধারণ সেটিং</h1>
        <Button type="submit" disabled={saving} className="gap-2 bg-[#d64901] hover:bg-[#b93f00]">
          <Save className="h-4 w-4" />
          {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
        </Button>
      </div>

      {/* Sections */}
      {SECTIONS.map((section) => (
        <div key={section.title} className="rounded-xl border border-[#e3e6de] bg-white p-6 shadow-sm">
          <h2 className="mb-5 border-b border-[#f1f3ee] pb-3 text-base font-semibold text-[#253029]">
            {section.title}
          </h2>

          {/* Toggle switch if section has one */}
          {section.toggle && (
            <div className="mb-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  set(section.toggle!.key, settings[section.toggle!.key] === "true" ? "false" : "true")
                }
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                  settings[section.toggle.key] === "true" ? "bg-[#d64901]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    settings[section.toggle.key] === "true" ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-[#627066]">{section.toggle.label}</span>
            </div>
          )}

          {/* Special render for গ্রাফিক section */}
          {section.title === "গ্রাফিক" ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Site Name */}
              <div className="space-y-1.5">
                <Label className="text-sm text-[#627066]">সাইটের নাম</Label>
                <Input
                  placeholder="Organic Shop"
                  value={settings["site_name"] ?? ""}
                  onChange={(e) => set("site_name", e.target.value)}
                />
              </div>

              {/* Empty for grid alignment */}
              <div />

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="text-sm text-[#627066]">লোগো</Label>
                <div className="flex items-start gap-3">
                  {/* Preview */}
                  <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-[#e3e6de] bg-[#f7f8f6]">
                    {settings.site_logo ? (
                      <img
                        src={settings.site_logo}
                        alt="logo"
                        className="h-full w-full object-contain p-2"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-[#c8d5cc]" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    {/* File upload button */}
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingLogo}
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {uploadingLogo ? "আপলোড হচ্ছে..." : "ছবি আপলোড করুন"}
                    </Button>
                    {/* OR URL input */}
                    <div className="relative">
                      <Input
                        placeholder="অথবা URL দিন: https://..."
                        value={settings.site_logo?.startsWith("data:") ? "" : (settings.site_logo ?? "")}
                        onChange={(e) => set("site_logo", e.target.value)}
                        className="pr-7 text-xs"
                      />
                      {settings.site_logo && (
                        <button
                          type="button"
                          onClick={() => set("site_logo", "")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9eada4] hover:text-red-400"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-[#9eada4]">PNG, JPG, SVG, WebP — সর্বোচ্চ ২MB</p>
                  </div>
                </div>
              </div>

              {/* Favicon Upload */}
              <div className="space-y-2">
                <Label className="text-sm text-[#627066]">ফেভিকন</Label>
                <div className="flex items-start gap-3">
                  {/* Preview */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-[#e3e6de] bg-[#f7f8f6]">
                    {settings.site_favicon ? (
                      <img
                        src={settings.site_favicon}
                        alt="favicon"
                        className="h-full w-full object-contain p-2"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-[#c8d5cc]" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      ref={faviconInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/x-icon,image/svg+xml,image/webp"
                      className="hidden"
                      onChange={handleFaviconUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingFavicon}
                      onClick={() => faviconInputRef.current?.click()}
                      className="w-full gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {uploadingFavicon ? "আপলোড হচ্ছে..." : "ছবি আপলোড করুন"}
                    </Button>
                    <div className="relative">
                      <Input
                        placeholder="অথবা URL দিন: https://..."
                        value={settings.site_favicon?.startsWith("data:") ? "" : (settings.site_favicon ?? "")}
                        onChange={(e) => set("site_favicon", e.target.value)}
                        className="pr-7 text-xs"
                      />
                      {settings.site_favicon && (
                        <button
                          type="button"
                          onClick={() => set("site_favicon", "")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9eada4] hover:text-red-400"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-[#9eada4]">PNG, ICO, SVG — সর্বোচ্চ ৫১২KB</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {section.fields.map((field) => (
              <div
                key={field.key}
                className={field.type === "textarea" ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}
              >
                <Label htmlFor={`setting-${field.key}`} className="text-sm text-[#627066]">
                  {field.label}
                </Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={`setting-${field.key}`}
                    rows={3}
                    placeholder={field.placeholder}
                    value={settings[field.key] ?? ""}
                    onChange={(e) => set(field.key, e.target.value)}
                  />
                ) : (
                  <Input
                    id={`setting-${field.key}`}
                    type="text"
                    placeholder={field.placeholder}
                    value={settings[field.key] ?? ""}
                    onChange={(e) => set(field.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          )}

          {/* OG image preview */}
          {section.title === "SEO / মেটা তথ্য" && settings.og_image && (
            <div className="mt-3">
              <p className="mb-1 text-xs text-[#9eada4]">OG Image প্রিভিউ</p>
              <img
                src={settings.og_image}
                alt="og"
                className="h-24 w-48 rounded-md border border-[#e3e6de] object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          )}
        </div>
      ))}

      {/* Bottom save button */}
      <div className="flex justify-end pb-4">
        <Button type="submit" disabled={saving} className="gap-2 bg-[#d64901] hover:bg-[#b93f00]">
          <Save className="h-4 w-4" />
          {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
        </Button>
      </div>
    </form>
  );
}
