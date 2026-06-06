import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, MessageSquare } from "lucide-react";

type SmsConfig = {
  url: string;
  api_key: string;
  sender_id: string;
  status: boolean;
  order_confirm: boolean;
  forgot_password: boolean;
  password_generator: boolean;
};

type SmsIntegration = {
  name?: string;
  type?: string;
  api_key?: string;
  is_active?: boolean | number;
  config?: Record<string, unknown> | string;
};

const defaultConfig: SmsConfig = {
  url: "",
  api_key: "",
  sender_id: "",
  status: false,
  order_confirm: false,
  forgot_password: false,
  password_generator: false,
};

function Toggle({
  label,
  checked,
  onChange,
  id,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      <Label htmlFor={id} className="text-sm text-[#627066]">
        {label}
      </Label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d64901] ${
          checked ? "bg-[#d64901]" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
            checked ? "translate-x-8" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function SmsGatewayPage() {
  const [config, setConfig] = useState<SmsConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const data = await adminApi<SmsIntegration[]>(
          "/api/admin/resources/integrations"
        );
        const sms = data.find((item) => item.type === "sms" || item.name?.toLowerCase().includes("sms"));
        if (sms) {
          const cfg = typeof sms.config === "string" ? JSON.parse(sms.config) : sms.config || {};
          setConfig({
            url: cfg.url || "",
            api_key: sms.api_key || cfg.api_key || "",
            sender_id: cfg.sender_id || "",
            status: Boolean(sms.is_active ?? cfg.status),
            order_confirm: Boolean(cfg.order_confirm),
            forgot_password: Boolean(cfg.forgot_password),
            password_generator: Boolean(cfg.password_generator),
          });
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const set = (key: keyof SmsConfig, value: any) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi("/api/admin/resources/integrations", {
        method: "POST",
        body: JSON.stringify({
          name: "SMS Gateway",
          type: "sms",
          api_key: config.api_key,
          is_active: config.status,
          config: {
            url: config.url,
            sender_id: config.sender_id,
            order_confirm: config.order_confirm,
            forgot_password: config.forgot_password,
            password_generator: config.password_generator,
          },
        }),
      });
      toast({ title: "সেভ সফল", description: "SMS Gateway কনফিগার সেভ হয়েছে।" });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-[#9eada4]">
        লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff1e8]">
          <MessageSquare className="h-5 w-5 text-[#d64901]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#253029]">SMS Gateway</h1>
          <p className="text-sm text-[#9eada4]">SMS সার্ভিস কনফিগার করুন</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-[#e3e6de] bg-white p-6 shadow-sm">
          {/* API Fields */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="sms-url">
                Url <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sms-url"
                placeholder="https://msg.elitbuzz-bd.com/smsapi"
                value={config.url}
                onChange={(e) => set("url", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sms-apikey">
                API Key <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sms-apikey"
                type="password"
                placeholder="API Key"
                value={config.api_key}
                onChange={(e) => set("api_key", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sms-sender">
                Senderid <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sms-sender"
                placeholder="8809XXXXXXXXX"
                value={config.sender_id}
                onChange={(e) => set("sender_id", e.target.value)}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="my-5 border-t border-[#f1f3ee]" />

          {/* Toggle Switches */}
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <Toggle
              id="sms-status"
              label="Status"
              checked={config.status}
              onChange={(v) => set("status", v)}
            />
            <Toggle
              id="sms-order-confirm"
              label="Order confirm"
              checked={config.order_confirm}
              onChange={(v) => set("order_confirm", v)}
            />
            <Toggle
              id="sms-forgot"
              label="Forgot password"
              checked={config.forgot_password}
              onChange={(v) => set("forgot_password", v)}
            />
            <Toggle
              id="sms-passgen"
              label="Password Generator"
              checked={config.password_generator}
              onChange={(v) => set("password_generator", v)}
            />
          </div>

          {/* Submit */}
          <div className="mt-6">
            <Button
              type="submit"
              disabled={saving}
              className="gap-2 bg-[#d64901] px-8 hover:bg-[#b93f00]"
            >
              <Save className="h-4 w-4" />
              {saving ? "সেভ হচ্ছে..." : "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
