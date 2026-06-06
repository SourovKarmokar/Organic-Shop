import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { Users } from "lucide-react";

const COLORS = ["#d64901", "#9eada4"];

const chartConfig = {
  new: { label: "নতুন", color: COLORS[0] },
  returning: { label: "পুরাতন", color: COLORS[1] },
};

interface Customer {
  name: string;
  phone: string;
  total_spent: number;
  total_orders: number;
}

export default function CustomerInsights() {
  const [newCount, setNewCount] = useState(0);
  const [returningCount, setReturningCount] = useState(0);
  const [topCustomers, setTopCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchInsights(); }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const customers = await adminApi<Customer[]>("/api/admin/resources/customers");
      const newC = customers.filter((c) => (c.total_orders || 0) <= 1).length;
      const retC = customers.filter((c) => (c.total_orders || 0) > 1).length;
      setNewCount(newC);
      setReturningCount(retC);
      setTopCustomers(
        [...customers]
          .filter((c) => Number(c.total_spent || 0) > 0)
          .sort((a, b) => Number(b.total_spent) - Number(a.total_spent))
          .slice(0, 5)
      );
    } catch {
      setNewCount(0); setReturningCount(0); setTopCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: "নতুন", value: newCount || 0 },
    { name: "পুরাতন", value: returningCount || 0 },
  ];

  const total = newCount + returningCount;

  return (
    <Card className="border-[#e3e6de] shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Customer Insight</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="py-4 text-center text-sm text-[#9eada4]">লোড হচ্ছে...</p>
        ) : (
          <>
            <div className="flex items-center gap-6">
              {total > 0 ? (
                <ChartContainer config={chartConfig} className="h-[120px] w-[120px] shrink-0">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={52}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-full border-4 border-[#f1f3ee]">
                  <span className="text-xs text-[#9eada4]">কোনো data নেই</span>
                </div>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[0] }} />
                  <span>New: {newCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[1] }} />
                  <span>Repeat: {returningCount}</span>
                </div>
              </div>
            </div>

            {topCustomers.length > 0 && (
              <div className="border-t border-[#f1f3ee] pt-3">
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#253029]">
                  <Users className="h-4 w-4" /> Top Customers
                </p>
                <div className="space-y-2">
                  {topCustomers.map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-[#253029]">{c.name}</p>
                        <p className="text-xs text-[#9eada4]">{c.phone} · {c.total_orders} অর্ডার</p>
                      </div>
                      <span className="font-semibold text-[#d64901]">
                        ৳{Number(c.total_spent || 0).toLocaleString()}
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
