import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, ExternalLink, Save, Search } from "lucide-react";

const COURIERS = [
  { name: "Pathao", color: "#E91B8B", bg: "#FDF2F8", status: "কনফিগার করুন" },
  { name: "Steadfast", color: "#0077B6", bg: "#EFF6FF", status: "কনফিগার করুন" },
  { name: "RedX", color: "#E63946", bg: "#FEF2F2", status: "কনফিগার করুন" },
  { name: "Paperfly", color: "#7C3AED", bg: "#F5F3FF", status: "কনফিগার করুন" },
];

export default function FraudCheckerPage() {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await adminApi<any[]>("/api/admin/resources/integrations");
        const fraud = data.find((d: any) => d.type === "fraud" || d.name?.toLowerCase().includes("fraud"));
        if (fraud) {
          setApiKey(fraud.api_key || "");
          setStatus(Boolean(fraud.is_active));
        }
      } catch { /* use defaults */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi("/api/admin/resources/integrations", {
        method: "POST",
        body: JSON.stringify({
          name: "FraudBD API",
          type: "fraud",
          api_key: apiKey,
          is_active: status,
        }),
      });
      toast({ title: "সেভ সফল", description: "Fraud Checker API কনফিগার সেভ হয়েছে।" });
    } catch (err) {
      toast({ title: "সেভ ব্যর্থ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#253029]">Fraud Checker API</h1>
        <p className="mt-0.5 text-sm text-[#9eada4]">
          FraudBD.com API কনফিগারেশন — কাস্টমারের কুরিয়ার হিস্ট্রি চেক করতে
        </p>
      </div>

      {/* FraudBD Card */}
      <div className="rounded-xl border border-[#e3e6de] bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
            <Search className="h-5 w-5 text-orange-500" />
          </div>
          <h2 className="text-base font-semibold text-[#253029]">🔍 FraudBD API</h2>
        </div>

        {/* Steps */}
        <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="mb-2 text-sm font-medium text-blue-700">বিস্তারিত পদ্ধতি:</p>
          <ol className="space-y-1 text-sm text-blue-600">
            <li>
              1.{" "}
              <a href="https://fraudbd.com" target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-0.5">
                fraudbd.com <ExternalLink className="h-3 w-3" />
              </a>{" "}
              এ গিয়ে একটি অ্যাকাউন্ট তৈরি করুন
            </li>
            <li>2. Dashboard → Settings এ যান</li>
            <li>3. API Key কপি করে এখানে পেস্ট করুন</li>
          </ol>
          <p className="mt-2 flex items-center gap-1 text-xs font-medium text-amber-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            API Key না থাকলে Sandbox (ডেমো) মোডে কাজ করবে।
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="space-y-1.5">
              <Label htmlFor="fraud-api-key">API Key</Label>
              <Input
                id="fraud-api-key"
                type="password"
                placeholder="আপনার FraudBD API Key পেস্ট করুন"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <div className="flex h-10 items-center">
                <button
                  type="button"
                  onClick={() => setStatus((s) => !s)}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${status ? "bg-[#d64901]" : "bg-gray-300"}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${status ? "translate-x-8" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving} className="gap-2 bg-[#d64901] hover:bg-[#b93f00]">
              <Save className="h-4 w-4" />
              {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </Button>
            <a
              href="https://fraudbd.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-[#e3e6de] px-4 py-2 text-sm text-[#627066] hover:bg-[#f7f8f6]"
            >
              <Search className="h-4 w-4" />
              Fraud Checker ব্যবহার করুন →
            </a>
          </div>
        </form>
      </div>

      {/* Supported Couriers */}
      <div className="rounded-xl border border-[#e3e6de] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-[#253029]">সাপোর্টেড কুরিয়ার</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {COURIERS.map((c) => (
            <div
              key={c.name}
              className="flex flex-col items-center justify-center rounded-xl border py-5 text-center"
              style={{ borderColor: c.color + "30", backgroundColor: c.bg }}
            >
              <span className="text-lg font-bold" style={{ color: c.color }}>
                {c.name}
              </span>
              <span className="mt-1.5 text-xs text-[#9eada4]">{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
