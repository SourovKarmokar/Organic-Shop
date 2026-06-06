import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, ShoppingCart } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  used_count: number;
  max_uses: number | null;
  is_active: boolean;
  expires_at: string | null;
}

interface AbandonedCart {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  total: number;
  items: any;
  created_at: string;
  recovered: boolean;
}

export default function MarketingSection() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);

  useEffect(() => {
    fetchCoupons();
    fetchAbandonedCarts();
  }, []);

  const fetchCoupons = async () => {
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(5);
    setCoupons((data as any[]) || []);
  };

  const fetchAbandonedCarts = async () => {
    const { data } = await supabase
      .from("abandoned_carts")
      .select("*")
      .eq("recovered", false)
      .order("created_at", { ascending: false })
      .limit(5);
    setAbandonedCarts((data as any[]) || []);
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Coupons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="w-4 h-4" /> সক্রিয় কুপন
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">কোনো সক্রিয় কুপন নেই</p>
          ) : (
            <div className="space-y-3">
              {coupons.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-mono font-semibold text-sm">{c.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.discount_type === "percentage" ? `${c.discount_value}% ছাড়` : `৳${c.discount_value} ছাড়`}
                      {c.expires_at && ` • মেয়াদ: ${new Date(c.expires_at).toLocaleDateString("bn-BD")}`}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {c.used_count}{c.max_uses ? `/${c.max_uses}` : ""} বার
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Abandoned Carts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> পরিত্যক্ত কার্ট ({abandonedCarts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {abandonedCarts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">কোনো পরিত্যক্ত কার্ট নেই</p>
          ) : (
            <div className="space-y-3">
              {abandonedCarts.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{c.customer_name || "অজানা"}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.customer_phone || "ফোন নেই"} • {new Date(c.created_at).toLocaleDateString("bn-BD")}
                    </p>
                  </div>
                  <span className="font-semibold text-sm">৳{Number(c.total).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
