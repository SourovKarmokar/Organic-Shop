import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const chartConfig = {
  revenue: { label: "আয় (৳)", color: "#d64901" },
};

type SalesPoint = { date: string; revenue: number; orders: number };

export default function RevenueChart() {
  const [data, setData] = useState<SalesPoint[]>([]);
  const [range, setRange] = useState<7 | 30>(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const orders = await adminApi<{ total: number; created_at: string }[]>("/api/admin/orders");

      // Build date buckets
      const grouped: Record<string, { revenue: number; orders: number }> = {};
      for (let i = range - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        grouped[d.toISOString().slice(0, 10)] = { revenue: 0, orders: 0 };
      }

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - range);

      orders.forEach((o) => {
        const key = new Date(o.created_at).toISOString().slice(0, 10);
        if (grouped[key] !== undefined) {
          grouped[key].revenue += Number(o.total || 0);
          grouped[key].orders += 1;
        }
      });

      setData(
        Object.entries(grouped).map(([date, val]) => ({
          date: new Date(date).toLocaleDateString("en-BD", { day: "numeric", month: "short" }),
          revenue: val.revenue,
          orders: val.orders,
        }))
      );
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-[#e3e6de] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Sales Analytics</CardTitle>
        <div className="flex gap-1">
          <Button
            size="sm"
            className={`h-8 ${range === 7 ? "bg-[#d64901] hover:bg-[#b93f00] text-white" : "bg-white border text-[#627066]"}`}
            onClick={() => setRange(7)}
          >
            7 days
          </Button>
          <Button
            size="sm"
            className={`h-8 ${range === 30 ? "bg-[#d64901] hover:bg-[#b93f00] text-white" : "bg-white border text-[#627066]"}`}
            onClick={() => setRange(30)}
          >
            30 days
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-64 items-center justify-center text-sm text-[#9eada4]">লোড হচ্ছে...</div>
        ) : (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3ee" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9eada4" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9eada4" }} tickFormatter={(v) => `৳${v}`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#d64901"
                strokeWidth={2}
                dot={{ fill: "#d64901", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
