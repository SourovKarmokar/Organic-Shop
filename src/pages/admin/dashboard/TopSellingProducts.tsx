import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopProduct {
  name: string;
  image_url: string | null;
  sold: number;
  revenue: number;
}

export default function TopSellingProducts() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTop(); }, []);

  const fetchTop = async () => {
    setLoading(true);
    try {
      const data = await adminApi<{ name: string; image_url: string | null; sold: number; revenue: number }[]>(
        "/api/admin/dashboard"
      ).then((d: any) => d.top_products || []);
      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-[#e3e6de] shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-center py-4 text-sm text-[#9eada4]">লোড হচ্ছে...</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-[#9eada4] text-center py-4">এখনো কোনো বিক্রয় নেই</p>
        ) : (
          products.slice(0, 5).map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-4 text-sm font-medium text-[#9eada4]">{i + 1}</span>
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-[#f1f3ee]">
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                  : <div className="flex h-full w-full items-center justify-center text-xs text-[#9eada4]">N/A</div>
                }
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#253029]">{p.name}</p>
                <p className="text-xs text-[#9eada4]">
                  {p.sold} sold · ৳{Number(p.revenue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
