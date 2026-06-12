import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  BarChart2,
  BarChart3,
  BadgePercent,
  Bike,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Code2,
  DollarSign,
  FileText,
  GalleryHorizontal,
  Gauge,
  Gift,
  Image,
  LayoutGrid,
  Leaf,
  ListOrdered,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  MessageSquare,
  Package,
  Package2,
  Palette,
  Pencil,
  PieChart,
  Plug,
  Receipt,
  Ruler,
  Settings,
  Settings2,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tag,
  TrendingUp,
  Truck,
  UserCheck,
  UserRound,
  Users,
  Video,
  WalletCards,
  X,
} from "lucide-react";

type MenuItem = {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: { label: string; path: string; icon?: React.ReactNode }[];
};

const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: <Gauge className="h-4 w-4" />, path: "/admin" },
  {
    label: "Orders",
    icon: <ShoppingCart className="h-4 w-4" />,
    children: [
      { label: "All Orders", path: "/admin/orders", icon: <ClipboardList className="h-3.5 w-3.5" /> },
      { label: "Manual Order", path: "/admin/orders?type=manual", icon: <Pencil className="h-3.5 w-3.5" /> },
      { label: "Pending", path: "/admin/orders?status=Pending", icon: <ListOrdered className="h-3.5 w-3.5" /> },
      { label: "Confirmed", path: "/admin/orders?status=Confirmed", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
      { label: "Processing", path: "/admin/orders?status=Processing", icon: <Settings2 className="h-3.5 w-3.5" /> },
      { label: "In Courier", path: "/admin/orders?status=In%20Courier", icon: <Bike className="h-3.5 w-3.5" /> },
      { label: "Completed", path: "/admin/orders?status=Completed", icon: <UserCheck className="h-3.5 w-3.5" /> },
      { label: "Cancelled", path: "/admin/orders?status=Cancelled", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    ],
  },
  {
    label: "Products",
    icon: <Package className="h-4 w-4" />,
    children: [
      { label: "Product Manage", path: "/admin/products", icon: <ShoppingBag className="h-3.5 w-3.5" /> },
      { label: "Price Edit", path: "/admin/products/price-edit", icon: <Tag className="h-3.5 w-3.5" /> },
      { label: "Categories", path: "/admin/categories", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
      { label: "Brands", path: "/admin/brands", icon: <BadgePercent className="h-3.5 w-3.5" /> },
      { label: "Colors", path: "/admin/colors", icon: <Palette className="h-3.5 w-3.5" /> },
      { label: "Sizes", path: "/admin/sizes", icon: <Ruler className="h-3.5 w-3.5" /> },
    ],
  },
  {
    label: "Users",
    icon: <Users className="h-4 w-4" />,
    children: [
      { label: "Customers", path: "/admin/customers", icon: <UserRound className="h-3.5 w-3.5" /> },
      { label: "Admin Users", path: "/admin/users", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
    ],
  },
  {
    label: "Marketing",
    icon: <Megaphone className="h-4 w-4" />,
    children: [
      { label: "Coupon Management", path: "/admin/coupons", icon: <Gift className="h-3.5 w-3.5" /> },
      { label: "Campaign Management", path: "/admin/campaigns", icon: <TrendingUp className="h-3.5 w-3.5" /> },
    ],
  },
  {
    label: "Site Settings",
    icon: <Settings className="h-4 w-4" />,
    children: [
      { label: "General", path: "/admin/settings/general", icon: <Settings2 className="h-3.5 w-3.5" /> },
      { label: "Shipping Charge", path: "/admin/settings/shipping", icon: <Truck className="h-3.5 w-3.5" /> },
      { label: "Pages", path: "/admin/settings/pages", icon: <FileText className="h-3.5 w-3.5" /> },
      { label: "Social Media", path: "/admin/settings/social", icon: <Share2 className="h-3.5 w-3.5" /> },
      { label: "Order Status", path: "/admin/settings/order-status", icon: <ListOrdered className="h-3.5 w-3.5" /> },
    ],
  },
  { label: "Reviews", icon: <Star className="h-4 w-4" />, path: "/admin/reviews" },
  { label: "Videos", icon: <Video className="h-4 w-4" />, path: "/admin/videos" },
  { label: "Blogs", icon: <BookOpen className="h-4 w-4" />, path: "/admin/blogs" },
  {
    label: "Banner & Ads",
    icon: <Image className="h-4 w-4" />,
    children: [
      { label: "Banner Category", path: "/admin/banners/categories", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
      { label: "Banners", path: "/admin/banners", icon: <GalleryHorizontal className="h-3.5 w-3.5" /> },
    ],
  },
  {
    label: "API Integration",
    icon: <Plug className="h-4 w-4" />,
    children: [
      { label: "SMS Gateway", path: "/admin/integrations/sms", icon: <MessageSquare className="h-3.5 w-3.5" /> },
      { label: "Email SMTP", path: "/admin/integrations/email", icon: <Mail className="h-3.5 w-3.5" /> },
      { label: "Steadfast Courier", path: "/admin/integrations/steadfast", icon: <Truck className="h-3.5 w-3.5" /> },
      { label: "Pathao Courier", path: "/admin/integrations/pathao", icon: <Bike className="h-3.5 w-3.5" /> },
      { label: "RedX Courier", path: "/admin/integrations/redx", icon: <MapPin className="h-3.5 w-3.5" /> },
      { label: "Fraud Checker API", path: "/admin/integrations/fraud", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    ],
  },
  { label: "Tracking Pixels", icon: <Code2 className="h-4 w-4" />, path: "/admin/pixels" },
  {
    label: "Accounts",
    icon: <WalletCards className="h-4 w-4" />,
    children: [
      { label: "Summary", path: "/admin/accounts/summary", icon: <PieChart className="h-3.5 w-3.5" /> },
      { label: "Expense Entry", path: "/admin/accounts/expense", icon: <Receipt className="h-3.5 w-3.5" /> },
      { label: "Office Cost", path: "/admin/accounts/office-cost", icon: <Building2 className="h-3.5 w-3.5" /> },
    ],
  },
  {
    label: "Reports",
    icon: <BarChart3 className="h-4 w-4" />,
    children: [
      { label: "Customer Analytics", path: "/admin/reports/customer-analytics", icon: <TrendingUp className="h-3.5 w-3.5" /> },
      { label: "Sales Report", path: "/admin/reports/sales", icon: <BarChart2 className="h-3.5 w-3.5" /> },
      { label: "Stock Report", path: "/admin/reports/stock", icon: <Package2 className="h-3.5 w-3.5" /> },
      { label: "Fraud Checker", path: "/admin/reports/fraud", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    ],
  },
];

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Orders: true,
    Products: true,
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/admin/login", { replace: true });
  }, [isAdmin, loading, navigate, user]);

  useEffect(() => {
    const activeParent = menuItems.find((item) =>
      item.children?.some((child) => location.pathname === child.path.split("?")[0])
    );
    if (activeParent) setOpenMenus((prev) => ({ ...prev, [activeParent.label]: true }));
  }, [location.pathname]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f6f7f5]">Loading admin panel...</div>;
  }

  if (!user || !isAdmin) return null;

  const isChildActive = (path: string) => {
    const [pathname, query = ""] = path.split("?");
    if (location.pathname !== pathname) return false;
    const childStatus = new URLSearchParams(query).get("status");
    const currentStatus = new URLSearchParams(location.search).get("status");
    return childStatus ? childStatus === currentStatus : !currentStatus;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f7f8f6] text-[#253029]">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-[#e3e6de] bg-white transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#e3e6de] px-4">
          <div className="flex items-center gap-2 font-semibold text-[#d64901]">
            <Leaf className="h-4 w-4 text-green-600" />
            <span>Admin Panel</span>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {menuItems.map((item) => {
            const isOpen = openMenus[item.label];

            if (item.path && !item.children) {
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end={item.path === "/admin"}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "mb-1 flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                      isActive ? "bg-[#d64901] text-white shadow-sm" : "text-[#627066] hover:bg-[#f1f3ee] hover:text-[#253029]"
                    )
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              );
            }

            return (
              <div key={item.label} className="mb-1">
                <button
                  onClick={() => setOpenMenus((prev) => ({ ...prev, [item.label]: !prev[item.label] }))}
                  className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md px-3 text-sm font-medium transition",
                    isOpen ? "text-[#253029]" : "text-[#627066] hover:bg-[#f1f3ee] hover:text-[#253029]"
                  )}
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    {item.label}
                  </span>
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {isOpen && (
                  <div className="ml-7 mt-1 space-y-1 pb-1">
                    {item.children?.map((child) => (
                      <button
                        key={child.path}
                        onClick={() => {
                          setSidebarOpen(false);
                          navigate(child.path);
                        }}
                        className={cn(
                          "flex h-8 w-full items-center gap-2 rounded-md px-3 text-left text-sm transition",
                          isChildActive(child.path)
                            ? "bg-[#fff1e8] font-medium text-[#d64901]"
                            : "text-[#6d7a71] hover:bg-[#f1f3ee] hover:text-[#253029]"
                        )}
                      >
                        {child.icon && (
                          <span className={cn(
                            isChildActive(child.path) ? "text-[#d64901]" : "text-[#9eada4]"
                          )}>
                            {child.icon}
                          </span>
                        )}
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e3e6de] bg-white px-4 lg:px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 items-center gap-3">
            <span className="font-semibold">Admin Panel</span>
            <a className="hidden text-xs font-medium text-[#c45520] sm:inline" href="/" target="_blank" rel="noreferrer">
              Live site
            </a>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-sm text-[#6d7a71] md:block">{user.email}</div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
