import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
  image_url: string | null;
}

export default function InventoryAlerts() {
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [outOfStock, setOutOfStock] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await adminApi<Product[]>("/api/admin/dashboard")
        .then((d: any) => d.inventory_alerts || []);
      setOutOfStock(data.filter((p) => (p.stock_quantity || 0) === 0));
      setLowStock(data.filter((p) => (p.stock_quantity || 0) > 0));
    } catch {
      setLowStock([]); setOutOfStock([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-[#e3e6de] shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Inventory Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="py-4 text-center text-sm text-[#9eada4]">লোড হচ্ছে...</p>
        ) : outOfStock.length === 0 && lowStock.length === 0 ? (
          <p className="py-4 text-center text-sm text-[#9eada4]">সব প্রোডাক্টের স্টক ঠিক আছে ✅</p>
        ) : (
          <>
            {outOfStock.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold text-red-500">স্টক আউট ({outOfStock.length})</span>
                </div>
                <div className="space-y-2">
                  {outOfStock.slice(0, 5).map((p) => (
                    <div key={p.id} onClick={() => navigate("/admin/products")}
                      className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 hover:bg-[#f7f8f6]">
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-[#f1f3ee]">
                        {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <span className="flex-1 truncate text-sm">{p.name}</span>
                      <Badge variant="destructive" className="text-xs">০</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {lowStock.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-semibold text-yellow-600">লো স্টক ({lowStock.length})</span>
                </div>
                <div className="space-y-2">
                  {lowStock.slice(0, 5).map((p) => (
                    <div key={p.id} onClick={() => navigate("/admin/products")}
                      className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 hover:bg-[#f7f8f6]">
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-[#f1f3ee]">
                        {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <span className="flex-1 truncate text-sm">{p.name}</span>
                      <span className="rounded-full border border-yellow-400 px-2 py-0.5 text-xs text-yellow-600">
                        {p.stock_quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
