import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, ShoppingCart, TrendingUp, UserRound, Package, ShoppingBag } from "lucide-react";

type AnalyticsData = {
  visitors: number;
  page_views: number;
  product_views: number;
  cart_adds: number;
  orders: number;
  top_products: { name: string; image_url?: string | null; views: number; cart_count: number }[];
};

const emptyData: AnalyticsData = {
  visitors: 0,
  page_views: 0,
  product_views: 0,
  cart_adds: 0,
  orders: 0,
  top_products: [],
};

function percent(value: number, total: number) {
  if (!total) return "0.0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}

export default function CustomerAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>(emptyData);
  const [startDate, setStartDate] = useState("2026-05-07");
  const [endDate, setEndDate] = useState("2026-06-06");

  useEffect(() => {
    adminApi<AnalyticsData>("/api/admin/reports/customer-analytics").then(setData).catch(() => setData(emptyData));
  }, []);

  const funnel = useMemo(
    () => [
      { label: "ভিজিটর", value: data.visitors, color: "bg-blue-500", rate: "87%" },
      { label: "পেজ ভিউ", value: data.page_views, color: "bg-indigo-500", rate: "39%" },
      { label: "প্রোডাক্ট ভিউ", value: data.product_views, color: "bg-purple-500", rate: "0.0%" },
      { label: "কার্টে যোগ", value: data.cart_adds, color: "bg-orange-500", rate: "0%" },
      { label: "অর্ডার", value: data.orders, color: "bg-green-500", rate: "" },
    ],
    [data]
  );

  const maxValue = Math.max(...funnel.map((item) => item.value), 1);
  const viewToCart = percent(data.cart_adds, data.product_views);
  const cartToOrder = percent(data.orders, data.cart_adds);
  const visitorToOrder = percent(data.orders, data.visitors);

  const cards = [
    { label: "ভিজিটর", value: data.visitors, icon: UserRound, color: "bg-blue-500" },
    { label: "পেজ ভিউ", value: data.page_views, icon: Eye, color: "bg-indigo-500" },
    { label: "প্রোডাক্ট ভিউ", value: data.product_views, icon: Eye, color: "bg-purple-500" },
    { label: "কার্টে যোগ", value: data.cart_adds, icon: ShoppingCart, color: "bg-orange-500" },
    { label: "অর্ডার", value: data.orders, icon: ShoppingBag, color: "bg-green-500" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#253029]">
          <TrendingUp className="h-5 w-5" />
          Customer Analytics
        </h1>
        <div className="flex flex-wrap gap-3">
          <Input type="date" className="w-[170px]" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <Input type="date" className="w-[170px]" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          <Button className="bg-[#d64901] hover:bg-[#b83f00]">ফিল্টার</Button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-md border border-[#dfe5dc] bg-white p-5 text-center shadow-sm">
              <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-white ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-2 text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-[#60756a]">{card.label}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-md border border-[#dfe5dc] bg-white p-5 shadow-sm">
        <h2 className="mb-5 text-lg font-bold">কাস্টমার ফানেল</h2>
        <div className="space-y-4">
          {funnel.map((item) => (
            <div key={item.label} className="grid grid-cols-[110px_1fr_70px] items-center gap-3">
              <span className="text-right text-sm text-[#60756a]">{item.label}</span>
              <div className="h-9 rounded-full bg-[#eef3ee]">
                <div className={`flex h-9 items-center justify-end rounded-full px-3 text-sm font-bold text-white ${item.color}`} style={{ width: `${Math.max(8, (item.value / maxValue) * 100)}%` }}>
                  {item.value}
                </div>
              </div>
              <span className="text-sm text-[#60756a]">{item.rate ? `→ ${item.rate}` : ""}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 border-t border-[#dfe5dc] pt-5 md:grid-cols-3">
          <div className="rounded-md bg-[#f6f8f5] p-4 text-center">
            <p className="text-2xl font-bold text-[#d64901]">{viewToCart}</p>
            <p className="text-sm font-medium">ভিউ → কার্ট</p>
            <p className="text-xs text-[#60756a]">প্রোডাক্ট দেখে কার্টে দিয়েছেন</p>
          </div>
          <div className="rounded-md bg-[#f6f8f5] p-4 text-center">
            <p className="text-2xl font-bold text-[#d64901]">{cartToOrder}</p>
            <p className="text-sm font-medium">কার্ট → অর্ডার</p>
            <p className="text-xs text-[#60756a]">কার্ট থেকে অর্ডার করেছেন</p>
          </div>
          <div className="rounded-md bg-[#f6f8f5] p-4 text-center">
            <p className="text-2xl font-bold text-[#d64901]">{visitorToOrder}</p>
            <p className="text-sm font-medium">ভিজিটর → অর্ডার</p>
            <p className="text-xs text-[#60756a]">মোট কনভার্সন রেট</p>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-[#dfe5dc] bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">সবচেয়ে বেশি দেখা প্রোডাক্ট</h2>
        <div className="divide-y">
          {(data.top_products.length ? data.top_products : [{ name: "কোনো প্রোডাক্ট ডেটা নেই", views: 0, cart_count: 0 }]).map((product, index) => (
            <div key={`${product.name}-${index}`} className="grid grid-cols-[28px_1fr_auto_auto] items-center gap-3 py-3">
              <span className="font-semibold text-[#60756a]">{index + 1}</span>
              <span className="font-medium">{product.name}</span>
              <span className="inline-flex items-center gap-1 text-sm text-[#60756a]">
                <Eye className="h-4 w-4" />
                {product.views || 0}
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-[#d64901]">
                <ShoppingCart className="h-4 w-4" />
                {product.cart_count || 0}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
