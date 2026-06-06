import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Clock,
  FileText,
  Package,
  Plus,
  ShoppingCart,
  Truck,
  Users,
  XCircle,
  DollarSign,
  Boxes,
} from "lucide-react";

type DashboardData = {
  total_orders: number;
  total_revenue: number;
  total_products: number;
  total_customers: number;
  pending_orders: number;
  completed_orders: number;
  in_courier_orders: number;
  cancelled_orders: number;
  top_products: { name: string; image_url?: string | null; sold: number; revenue: number }[];
  inventory_alerts: { id: string; name: string; image_url?: string | null; stock_quantity: number }[];
  recent_orders: {
    id: string;
    order_number: string;
    customer_name: string;
    total: number;
    status_name: string;
    status_color: string;
  }[];
};

const emptyData: DashboardData = {
  total_orders: 0,
  total_revenue: 0,
  total_products: 0,
  total_customers: 0,
  pending_orders: 0,
  completed_orders: 0,
  in_courier_orders: 0,
  cancelled_orders: 0,
  top_products: [],
  inventory_alerts: [],
  recent_orders: [],
};

function money(value: number) {
  return `৳${Number(value || 0).toLocaleString()}`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi<DashboardData>("/api/admin/dashboard")
      .then(setData)
      .catch(() => setData(emptyData))
      .finally(() => setLoading(false));
  }, []);

  const statCards = useMemo(
    () => [
      { label: "Total Orders", value: data.total_orders, icon: ShoppingCart, color: "text-blue-600 bg-blue-50", path: "/admin/orders" },
      { label: "Total Sales", value: money(data.total_revenue), icon: DollarSign, color: "text-green-600 bg-green-50", path: "/admin/reports/sales" },
      { label: "Total Products", value: data.total_products, icon: Package, color: "text-purple-600 bg-purple-50", path: "/admin/products" },
      { label: "Total Customers", value: data.total_customers, icon: Users, color: "text-orange-600 bg-orange-50", path: "/admin/customers" },
      { label: "Pending", value: data.pending_orders, icon: Clock, color: "text-yellow-600 bg-yellow-50", path: "/admin/orders?status=Pending" },
      { label: "Completed", value: data.completed_orders, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50", path: "/admin/orders?status=Completed" },
      { label: "In Courier", value: data.in_courier_orders, icon: Truck, color: "text-cyan-600 bg-cyan-50", path: "/admin/orders?status=In%20Courier" },
      { label: "Cancelled", value: data.cancelled_orders, icon: XCircle, color: "text-red-600 bg-red-50", path: "/admin/orders?status=Cancelled" },
    ],
    [data]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/admin/products/create")}>
            <Plus className="h-4 w-4" />
            New Product
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/admin/orders?type=manual")}>
            <FileText className="h-4 w-4" />
            Create Invoice
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/admin/categories")}>
            <Boxes className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="rounded-md border border-[#e3e6de] bg-white p-4 text-left shadow-sm transition hover:border-[#d64901]/40 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-md ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold leading-tight">{loading ? "..." : item.value}</div>
                  <div className="text-xs text-[#6d7a71]">{item.label}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="border-[#e3e6de] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Sales Analytics</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" className="h-8 bg-[#d64901] hover:bg-[#b93f00]">7 days</Button>
              <Button size="sm" variant="outline" className="h-8">30 days</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative h-64 overflow-hidden rounded-md border border-[#eef0ea] bg-white">
              <div className="absolute inset-x-8 bottom-10 top-8 grid grid-rows-4 border-b border-l border-[#eef0ea]">
                <span className="border-t border-[#f0f1ed]" />
                <span className="border-t border-[#f0f1ed]" />
                <span className="border-t border-[#f0f1ed]" />
                <span className="border-t border-[#f0f1ed]" />
              </div>
              <div className="absolute bottom-10 left-8 right-8 h-0.5 bg-[#d64901]" />
              <div className="absolute bottom-3 left-8 right-8 flex justify-between text-[11px] text-[#8a948c]">
                <span>Sat</span>
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#e3e6de] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data.top_products.length ? data.top_products : Array.from({ length: 5 })).map((product: any, index) => (
              <div key={product?.name || index} className="flex items-center gap-3">
                <span className="w-4 text-sm font-medium text-[#6d7a71]">{index + 1}</span>
                <div className="h-10 w-10 rounded-md bg-[#eef0ea]">
                  {product?.image_url && <img src={product.image_url} alt="" className="h-full w-full rounded-md object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{product?.name || "No product yet"}</div>
                  <div className="text-xs text-[#6d7a71]">
                    {product ? `${product.sold || 0} sold - ${money(product.revenue || 0)}` : "Add orders to see ranking"}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-[#e3e6de] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.inventory_alerts.length ? (
              data.inventory_alerts.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-md border border-[#eef0ea] p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-[#eef0ea]">
                      {product.image_url && <img src={product.image_url} alt="" className="h-full w-full rounded-md object-cover" />}
                    </div>
                    <span className="truncate text-sm font-medium">{product.name}</span>
                  </div>
                  <span className="rounded-full border border-yellow-300 px-2 py-0.5 text-xs text-yellow-700">{product.stock_quantity}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#6d7a71]">No low stock products found.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#e3e6de] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Customer Insight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="h-32 w-32 rounded-full bg-[conic-gradient(#d64901_0_75%,#60756a_75%_100%)] p-5">
                <div className="h-full w-full rounded-full bg-white" />
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#d64901]" />
                  <span>New: {Math.max(data.total_customers - data.completed_orders, 0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#60756a]" />
                  <span>Repeat: {Math.min(data.total_customers, data.completed_orders)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#e3e6de] shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b text-left text-[#6d7a71]">
                  <th className="py-2 font-medium">Order</th>
                  <th className="py-2 font-medium">Customer</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_orders.length ? (
                  data.recent_orders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{order.order_number}</td>
                      <td className="py-3">{order.customer_name}</td>
                      <td className="py-3">
                        <span className="rounded-full px-2 py-1 text-xs" style={{ backgroundColor: `${order.status_color}20`, color: order.status_color }}>
                          {order.status_name}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium">{money(order.total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#6d7a71]">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
