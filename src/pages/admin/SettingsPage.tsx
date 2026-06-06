import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("site_settings").select("*").then(({ data }) => {
      const map: Record<string, string> = {};
      data?.forEach((s: any) => { map[s.key] = s.value || ''; });
      setSettings(map);
    });
  }, []);

  const save = async () => {
    setLoading(true);
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from("site_settings").update({ value }).eq("key", key);
    }
    toast({ title: "সেটিংস সেভ হয়েছে" });
    setLoading(false);
  };

  const fields = [
    { key: "site_name", label: "সাইটের নাম" },
    { key: "site_phone", label: "ফোন নম্বর" },
    { key: "site_email", label: "ইমেইল" },
    { key: "site_address", label: "ঠিকানা" },
    { key: "site_logo", label: "লোগো URL" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">সাধারণ সেটিংস</h1>
      <Card>
        <CardContent className="p-6 space-y-4">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1">
              <Label>{f.label}</Label>
              <Input value={settings[f.key] || ''} onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })} />
            </div>
          ))}
          <Button onClick={save} disabled={loading}>{loading ? "সেভ হচ্ছে..." : "সেভ করুন"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
