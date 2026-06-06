import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, ExternalLink, Mail, MessageSquare, Save, Truck } from "lucide-react";

type Field = {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "password" | "number" | "textarea";
  required?: boolean;
};

type IntegrationDefinition = {
  title: string;
  type: string;
  icon: typeof Truck;
  description: string;
  docsUrl?: string;
  apiKeyLabel?: string;
  apiSecretLabel?: string;
  fields: Field[];
  defaults: Record<string, any>;
};

type IntegrationRow = {
  id: string;
  name: string;
  type: string;
  api_key?: string | null;
  api_secret?: string | null;
  config?: Record<string, any> | string | null;
  is_active?: boolean | number;
};

const definitions: Record<string, IntegrationDefinition> = {
  sms: {
    title: "SMS Gateway",
    type: "sms",
    icon: MessageSquare,
    description: "Order confirmation and account SMS settings.",
    apiKeyLabel: "API Key",
    fields: [
      { key: "url", label: "Gateway URL", placeholder: "https://msg.elitbuzz-bd.com/smsapi", required: true },
      { key: "sender_id", label: "Sender ID", placeholder: "8809XXXXXXXXX", required: true },
      { key: "order_confirm", label: "Order confirm SMS", type: "text", placeholder: "true / false" },
      { key: "forgot_password", label: "Forgot password SMS", type: "text", placeholder: "true / false" },
      { key: "password_generator", label: "Password generator SMS", type: "text", placeholder: "true / false" },
    ],
    defaults: { order_confirm: "true", forgot_password: "false", password_generator: "false" },
  },
  email: {
    title: "Email SMTP",
    type: "email",
    icon: Mail,
    description: "SMTP credentials for transactional email sending.",
    apiKeyLabel: "SMTP Username",
    apiSecretLabel: "SMTP Password",
    fields: [
      { key: "host", label: "SMTP Host", placeholder: "smtp.gmail.com", required: true },
      { key: "port", label: "SMTP Port", type: "number", placeholder: "587", required: true },
      { key: "secure", label: "Secure", placeholder: "true for 465, false for 587" },
      { key: "from_email", label: "From Email", placeholder: "shop@example.com" },
      { key: "from_name", label: "From Name", placeholder: "Organic Shop" },
    ],
    defaults: { port: 587, secure: "false" },
  },
  steadfast: {
    title: "Steadfast Courier",
    type: "steadfast",
    icon: Truck,
    description: "Steadfast parcel creation uses Api-Key and Secret-Key headers.",
    docsUrl: "https://steadfast.com.bd/user/api",
    apiKeyLabel: "API Key",
    apiSecretLabel: "Secret Key",
    fields: [
      { key: "base_url", label: "Base URL", placeholder: "https://portal.steadfast.com.bd/api/v1", required: true },
      { key: "pickup_address", label: "Pickup Address", type: "textarea", placeholder: "Your pickup address" },
      { key: "default_note", label: "Default Note", placeholder: "Handle with care" },
    ],
    defaults: { base_url: "https://portal.steadfast.com.bd/api/v1" },
  },
  pathao: {
    title: "Pathao Courier",
    type: "pathao",
    icon: Truck,
    description: "Pathao merchant API needs client credentials, merchant login, and store ID.",
    docsUrl: "https://help.pathao.com/category/merchant-help-center/order-process/",
    apiKeyLabel: "Client ID",
    apiSecretLabel: "Client Secret",
    fields: [
      { key: "base_url", label: "Base URL", placeholder: "https://api-hermes.pathao.com", required: true },
      { key: "username", label: "Merchant Username", placeholder: "merchant@example.com", required: true },
      { key: "password", label: "Merchant Password", type: "password", placeholder: "Password", required: true },
      { key: "store_id", label: "Store ID", placeholder: "12345", required: true },
      { key: "city_id", label: "Default City ID", placeholder: "1" },
      { key: "zone_id", label: "Default Zone ID", placeholder: "1" },
      { key: "area_id", label: "Default Area ID", placeholder: "1" },
    ],
    defaults: { base_url: "https://api-hermes.pathao.com" },
  },
  redx: {
    title: "RedX Courier",
    type: "redx",
    icon: Truck,
    description: "RedX OpenAPI uses API-ACCESS-TOKEN with a Bearer token.",
    docsUrl: "https://redx.com.bd/developer-api/",
    apiKeyLabel: "Access Token",
    fields: [
      { key: "base_url", label: "Base URL", placeholder: "https://openapi.redx.com.bd/v1.0.0-beta", required: true },
      { key: "pickup_store_id", label: "Pickup Store ID", placeholder: "12345", required: true },
      { key: "default_area_id", label: "Default Delivery Area ID", placeholder: "12" },
      { key: "parcel_weight", label: "Default Parcel Weight (gram)", type: "number", placeholder: "500" },
    ],
    defaults: { base_url: "https://openapi.redx.com.bd/v1.0.0-beta", parcel_weight: 500 },
  },
  fraud: {
    title: "Fraud Checker API",
    type: "fraud",
    icon: AlertTriangle,
    description: "FraudBD API key for checking customer courier history.",
    docsUrl: "https://fraudbd.com",
    apiKeyLabel: "API Key",
    fields: [{ key: "provider_url", label: "Provider URL", placeholder: "https://fraudbd.com" }],
    defaults: { provider_url: "https://fraudbd.com" },
  },
};

const truthy = (value: any) => value === true || value === 1 || value === "true";

function parseConfig(value: IntegrationRow["config"]) {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return value;
}

export default function IntegrationSettingsPage() {
  const { type = "sms" } = useParams();
  const definition = definitions[type] || definitions.sms;
  const [rowId, setRowId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [config, setConfig] = useState<Record<string, any>>(definition.defaults);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const Icon = definition.icon;

  const allFields = useMemo(() => definition.fields, [definition]);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      setRowId(null);
      setApiKey("");
      setApiSecret("");
      setConfig(definition.defaults);
      setIsActive(true);

      try {
        const data = await adminApi<IntegrationRow[]>(`/api/admin/resources/integrations`);
        const existing = data.find((item) => item.type === definition.type);
        if (existing) {
          const savedConfig = parseConfig(existing.config);
          setRowId(existing.id);
          setApiKey(existing.api_key || "");
          setApiSecret(existing.api_secret || "");
          setConfig({ ...definition.defaults, ...savedConfig });
          setIsActive(truthy(existing.is_active));
        }
      } catch {
        toast({ title: "Configuration load failed", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [definition, toast]);

  const setValue = (key: string, value: any) => {
    setConfig((current) => ({ ...current, [key]: value }));
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      name: definition.title,
      type: definition.type,
      api_key: apiKey,
      api_secret: apiSecret,
      config,
      is_active: isActive,
    };

    try {
      const saved = await adminApi<{ id: string }>(`/api/admin/integrations/${definition.type}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setRowId(saved.id);
      toast({ title: "Saved", description: `${definition.title} configuration updated.` });
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Could not save integration.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-sm text-[#9eada4]">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff1e8]">
          <Icon className="h-5 w-5 text-[#d64901]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#253029]">{definition.title}</h1>
          <p className="text-sm text-[#6d7a71]">{definition.description}</p>
          {definition.docsUrl && (
            <a href={definition.docsUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#d64901] underline">
              Provider docs <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      <form onSubmit={save} className="rounded-xl border border-[#e3e6de] bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          {definition.apiKeyLabel && (
            <div className="space-y-1.5">
              <Label>{definition.apiKeyLabel}</Label>
              <Input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} required />
            </div>
          )}

          {definition.apiSecretLabel && (
            <div className="space-y-1.5">
              <Label>{definition.apiSecretLabel}</Label>
              <Input type="password" value={apiSecret} onChange={(event) => setApiSecret(event.target.value)} required />
            </div>
          )}

          {allFields.map((field) => (
            <div key={field.key} className={field.type === "textarea" ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
              <Label>{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea
                  value={config[field.key] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(event) => setValue(field.key, event.target.value)}
                  required={field.required}
                />
              ) : (
                <Input
                  type={field.type || "text"}
                  value={config[field.key] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(event) => setValue(field.key, field.type === "number" ? Number(event.target.value) : event.target.value)}
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3 border-t border-[#f1f3ee] pt-5">
          <button
            type="button"
            onClick={() => setIsActive((current) => !current)}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${isActive ? "bg-[#d64901]" : "bg-gray-300"}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-8" : "translate-x-1"}`} />
          </button>
          <span className="text-sm font-medium text-[#627066]">{isActive ? "Active" : "Inactive"}</span>
          {rowId && <span className="ml-auto text-xs text-[#9eada4]">Saved config ID: {rowId}</span>}
        </div>

        <Button type="submit" disabled={saving} className="mt-6 gap-2 bg-[#d64901] hover:bg-[#b93f00]">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Integration"}
        </Button>
      </form>
    </div>
  );
}
