import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("customers").select("*").order("created_at", { ascending: false }).then(({ data }) => setCustomers(data || []));
  }, []);

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">কাস্টমার</h1>
        <div className="relative w-72">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input placeholder="নাম বা ফোন..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left py-3 px-4">নাম</th>
              <th className="text-left py-3 px-4">ফোন</th>
              <th className="text-left py-3 px-4">ঠিকানা</th>
              <th className="text-left py-3 px-4">মোট অর্ডার</th>
              <th className="text-left py-3 px-4">মোট খরচ</th>
            </tr></thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b hover:bg-muted/30">
                  <td className="py-2 px-4 font-medium">{c.name}</td>
                  <td className="py-2 px-4">{c.phone}</td>
                  <td className="py-2 px-4 text-muted-foreground">{c.address || '-'}</td>
                  <td className="py-2 px-4">{c.total_orders}</td>
                  <td className="py-2 px-4 font-semibold">৳{Number(c.total_spent || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
