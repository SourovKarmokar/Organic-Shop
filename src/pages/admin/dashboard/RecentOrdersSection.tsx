import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function RecentOrdersSection() {
  const [orders, setOrders] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatuses();
    fetchOrders();
  }, []);

  const fetchStatuses = async () => {
    try {
      const data = await adminApi<any[]>("/api/admin/order-statuses");
      setStatuses(data);
    } catch { setStatuses([]); }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminApi<any[]>("/api/admin/orders");
      setOrders(data.slice(0, 15));
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      o.order_number?.toLowerCase().includes(s) ||
      o.customer_name?.toLowerCase().includes(s) ||
      o.customer_phone?.includes(s)
    );
  });

  const updateStatus = async (orderId: string, statusId: string) => {
    try {
      await adminApi(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status_id: statusId }),
      });
      toast({ title: "স্ট্যাটাস আপডেট হয়েছে" });
      fetchOrders();
    } catch (err) {
      toast({ title: "ত্রুটি", description: err instanceof Error ? err.message : "", variant: "destructive" });
    }
  };

  const viewOrder = async (order: any) => {
    setSelectedOrder(order);
    try {
      const items = await adminApi<any[]>(`/api/admin/orders/${order.id}/items`);
      setOrderItems(items);
    } catch { setOrderItems([]); }
  };

  return (
    <>
      <Card className="border-[#e3e6de] shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">Recent Orders</CardTitle>
          <Button size="sm" variant="outline" onClick={() => navigate("/admin/orders")}>সব দেখুন</Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9eada4]" />
            <Input
              placeholder="অর্ডার নং, নাম বা ফোন দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <p className="py-6 text-center text-sm text-[#9eada4]">লোড হচ্ছে...</p>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#9eada4]">কোনো অর্ডার নেই</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] text-sm">
                <thead>
                  <tr className="border-b border-[#f1f3ee] text-left text-xs text-[#9eada4]">
                    <th className="px-2 py-2 font-medium">অর্ডার</th>
                    <th className="px-2 py-2 font-medium">কাস্টমার</th>
                    <th className="px-2 py-2 font-medium">মোট</th>
                    <th className="px-2 py-2 font-medium">স্ট্যাটাস</th>
                    <th className="px-2 py-2 font-medium">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr key={order.id} className="border-b border-[#f7f8f6] hover:bg-[#fbfcfa]">
                      <td className="px-2 py-2">
                        <p className="font-mono text-xs font-bold text-[#d64901]">{order.order_number}</p>
                        <p className="text-xs text-[#9eada4]">
                          {new Date(order.created_at).toLocaleDateString("bn-BD")}
                        </p>
                      </td>
                      <td className="px-2 py-2">
                        <p className="text-xs font-medium text-[#253029]">{order.customer_name}</p>
                        <p className="text-xs text-[#9eada4]">{order.customer_phone}</p>
                      </td>
                      <td className="px-2 py-2 text-xs font-semibold">৳{Number(order.total).toLocaleString()}</td>
                      <td className="px-2 py-2">
                        <Select value={order.status_id} onValueChange={(val) => updateStatus(order.id, val)}>
                          <SelectTrigger className="h-7 w-[110px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                <span style={{ color: s.color }}>{s.name}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-2">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => viewOrder(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>অর্ডার #{selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-3 text-sm">
              <div className="rounded-md bg-[#f7f8f6] p-3">
                <p className="font-semibold text-[#253029]">{selectedOrder.customer_name}</p>
                <p className="text-[#9eada4]">{selectedOrder.customer_phone}</p>
                <p className="text-[#9eada4]">{selectedOrder.customer_address}</p>
              </div>
              <div className="space-y-2 border-t border-[#f1f3ee] pt-2">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span className="font-medium">৳{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-[#f1f3ee] pt-2 font-semibold">
                <span>মোট</span>
                <span className="text-[#d64901]">৳{Number(selectedOrder.total).toLocaleString()}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
