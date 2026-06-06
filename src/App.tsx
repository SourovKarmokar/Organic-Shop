import { useState, useCallback, lazy, Suspense, Component, type ReactNode, type ErrorInfo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import ScrollToTop from "@/components/ScrollToTop";
import LoadingScreen from "@/components/LoadingScreen";

// Retry wrapper for lazy imports to handle chunk load failures
function lazyRetry(factory: () => Promise<{ default: React.ComponentType<any> }>) {
  return lazy(() =>
    factory().catch(() => {
      // Force reload on chunk failure
      window.location.reload();
      return factory();
    })
  );
}

// Lazy load all pages to reduce initial bundle
const Index = lazyRetry(() => import("./pages/Index"));
const NotFound = lazyRetry(() => import("./pages/NotFound"));
const ProductDetail = lazyRetry(() => import("./pages/ProductDetail"));
const CategoryPage = lazyRetry(() => import("./pages/CategoryPage"));
const CategoriesPage = lazyRetry(() => import("./pages/CategoriesPage"));
const CartPage = lazyRetry(() => import("./pages/CartPage"));
const LoginPage = lazyRetry(() => import("./pages/LoginPage"));
const TrackOrder = lazyRetry(() => import("./pages/TrackOrder"));
const ResetPasswordPage = lazyRetry(() => import("./pages/ResetPasswordPage"));
const ThankYouPage = lazyRetry(() => import("./pages/ThankYouPage"));
const BlogDetailPage = lazyRetry(() => import("./pages/BlogDetailPage"));
const MyAccountPage = lazyRetry(() => import("./pages/MyAccountPage"));

// Admin pages
const AdminLogin = lazyRetry(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazyRetry(() => import("./pages/admin/AdminLayout"));
const Dashboard = lazyRetry(() => import("./pages/admin/Dashboard"));
const OrdersPage = lazyRetry(() => import("./pages/admin/OrdersPage"));
const ProductsPage = lazyRetry(() => import("./pages/admin/ProductsPage"));
const ProductCreatePage = lazyRetry(() => import("./pages/admin/ProductCreatePage"));
const ProductEditPage = lazyRetry(() => import("./pages/admin/ProductEditPage"));
const AdminCategoriesPage = lazyRetry(() => import("./pages/admin/CategoriesPage"));
const CustomersPage = lazyRetry(() => import("./pages/admin/CustomersPage"));
const SettingsPage = lazyRetry(() => import("./pages/admin/SettingsPage"));
const ShippingPage = lazyRetry(() => import("./pages/admin/ShippingPage"));
const BannersPage = lazyRetry(() => import("./pages/admin/BannersPage"));
const SimpleCrudPage = lazyRetry(() => import("./pages/admin/SimpleCrudPage"));
const PriceEditPage = lazyRetry(() => import("./pages/admin/PriceEditPage"));
const CustomerAnalyticsPage = lazyRetry(() => import("./pages/admin/CustomerAnalyticsPage"));
const SalesReportPage = lazyRetry(() => import("./pages/admin/SalesReportPage"));
const StockReportPage = lazyRetry(() => import("./pages/admin/StockReportPage"));
const MySqlCrudPage = lazyRetry(() => import("./pages/admin/MySqlCrudPage"));
const ProductOptionPage = lazyRetry(() => import("./pages/admin/ProductOptionPage"));
const VideosPage = lazyRetry(() => import("./pages/admin/VideosPage"));
const BlogsPage = lazyRetry(() => import("./pages/admin/BlogsPage"));
const BannersManagePage = lazyRetry(() => import("./pages/admin/BannersPage2"));
const TrackingPixelsPage = lazyRetry(() => import("./pages/admin/TrackingPixelsPage"));
const FraudCheckerPage = lazyRetry(() => import("./pages/admin/FraudCheckerPage"));
const IntegrationSettingsPage = lazyRetry(() => import("./pages/admin/IntegrationSettingsPage"));
const CouponsPage = lazyRetry(() => import("./pages/admin/CouponsPage"));
const SocialMediaPage = lazyRetry(() => import("./pages/admin/SocialMediaPage"));
const PagesManagePage = lazyRetry(() => import("./pages/admin/PagesManagePage"));
const GeneralSettingsPage = lazyRetry(() => import("./pages/admin/GeneralSettingsPage"));

const queryClient = new QueryClient();

const PageFallback = () => null;

const App = () => {
  const [loading, setLoading] = useState(true);
  const handleLoadingComplete = useCallback(() => setLoading(false), []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          {loading && <LoadingScreen onComplete={handleLoadingComplete} />}
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Frontend */}
                <Route path="/" element={<Index />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/thank-you" element={<ThankYouPage />} />
                <Route path="/blog/:slug" element={<BlogDetailPage />} />
                <Route path="/my-account" element={<MyAccountPage />} />

                {/* Admin */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="products/create" element={
                    <MySqlCrudPage title="Create Product" resource="products"
                      fields={[
                        { key: "name", label: "Name" },
                        { key: "slug", label: "Slug" },
                        { key: "base_price", label: "Base Price", type: "number" },
                        { key: "sale_price", label: "Sale Price", type: "number" },
                        { key: "purchase_price", label: "Purchase Price", type: "number" },
                        { key: "sku", label: "SKU" },
                        { key: "stock_quantity", label: "Stock", type: "number" },
                        { key: "image_url", label: "Image URL" },
                        { key: "description", label: "Description", type: "textarea" },
                        { key: "is_active", label: "Status", type: "boolean" },
                      ]}
                      columns={[{ key: "name", label: "Name" }, { key: "base_price", label: "Price" }, { key: "stock_quantity", label: "Stock" }]}
                    />
                  } />
                  <Route path="products/edit/:id" element={
                    <MySqlCrudPage title="Edit Products" resource="products"
                      fields={[
                        { key: "name", label: "Name" },
                        { key: "slug", label: "Slug" },
                        { key: "base_price", label: "Base Price", type: "number" },
                        { key: "sale_price", label: "Sale Price", type: "number" },
                        { key: "purchase_price", label: "Purchase Price", type: "number" },
                        { key: "stock_quantity", label: "Stock", type: "number" },
                        { key: "is_active", label: "Status", type: "boolean" },
                      ]}
                      columns={[{ key: "name", label: "Name" }, { key: "base_price", label: "Price" }, { key: "sale_price", label: "Sale Price" }, { key: "stock_quantity", label: "Stock" }]}
                    />
                  } />
                  <Route path="products/price-edit" element={<PriceEditPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="brands" element={<ProductOptionPage title="ব্র্যান্ড" resource="brands" />} />
                  <Route path="colors" element={<ProductOptionPage title="কালার" resource="colors" />} />
                  <Route path="sizes" element={<ProductOptionPage title="সাইজ" resource="sizes" />} />
                  <Route path="customers" element={
                    <MySqlCrudPage title="Customers" resource="customers"
                      fields={[
                        { key: "name", label: "Name" },
                        { key: "phone", label: "Phone" },
                        { key: "email", label: "Email" },
                        { key: "address", label: "Address", type: "textarea" },
                        { key: "total_orders", label: "Total Orders", type: "number" },
                        { key: "total_spent", label: "Total Spent", type: "number" },
                      ]}
                      columns={[
                        { key: "name", label: "Name" },
                        { key: "phone", label: "Phone" },
                        { key: "email", label: "Email" },
                        { key: "total_orders", label: "Orders" },
                        { key: "total_spent", label: "Spent" },
                      ]}
                    />
                  } />
                  <Route path="users" element={
                    <MySqlCrudPage title="Admin Users" resource="users" readOnly
                      fields={[
                        { key: "email", label: "Email" },
                        { key: "phone", label: "Phone" },
                        { key: "full_name", label: "Full Name" },
                        { key: "is_active", label: "Status", type: "boolean" },
                      ]}
                      columns={[
                        { key: "email", label: "Email" },
                        { key: "full_name", label: "Full Name" },
                        { key: "phone", label: "Phone" },
                        { key: "is_active", label: "Active" },
                      ]}
                    />
                  } />
                  <Route path="coupons" element={<CouponsPage />} />
                  <Route path="campaigns" element={
                    <MySqlCrudPage title="Campaign Management" resource="campaigns"
                      fields={[
                        { key: "name", label: "Name" },
                        { key: "channel", label: "Channel" },
                        { key: "budget", label: "Budget", type: "number" },
                        { key: "is_active", label: "Status", type: "boolean" },
                      ]}
                      columns={[
                        { key: "name", label: "Name" },
                        { key: "channel", label: "Channel" },
                        { key: "budget", label: "Budget" },
                        { key: "is_active", label: "Active" },
                      ]}
                    />
                  } />
                  <Route path="settings/general" element={<GeneralSettingsPage />} />
                  <Route path="settings/shipping" element={
                    <MySqlCrudPage title="Shipping Charge" resource="shipping_charges"
                      fields={[
                        { key: "area_name", label: "Area Name" },
                        { key: "charge", label: "Charge", type: "number" },
                        { key: "is_active", label: "Status", type: "boolean" },
                      ]}
                      columns={[
                        { key: "area_name", label: "Area" },
                        { key: "charge", label: "Charge" },
                        { key: "is_active", label: "Active" },
                      ]}
                    />
                  } />
                  <Route path="settings/social" element={<SocialMediaPage />} />
                  <Route path="settings/pages" element={<PagesManagePage />} />
                  <Route path="settings/order-status" element={
                    <MySqlCrudPage title="Order Status" resource="order_statuses"
                      fields={[{ key: "name", label: "Name" }, { key: "color", label: "Color" }, { key: "sort_order", label: "Sort Order", type: "number" }]}
                      columns={[{ key: "name", label: "Name" }, { key: "color", label: "Color" }, { key: "sort_order", label: "Sort" }]}
                    />
                  } />
                  <Route path="banners/categories" element={
                    <MySqlCrudPage title="Banner Category" resource="banner_categories"
                      fields={[{ key: "name", label: "Name" }, { key: "slug", label: "Slug" }]}
                      columns={[{ key: "name", label: "Name" }, { key: "slug", label: "Slug" }]}
                    />
                  } />
                  <Route path="banners" element={<BannersManagePage />} />
                  <Route path="reviews" element={
                    <MySqlCrudPage title="Reviews" resource="reviews"
                      fields={[
                        { key: "customer_name", label: "Customer Name" },
                        { key: "rating", label: "Rating", type: "number" },
                        { key: "comment", label: "Comment", type: "textarea" },
                        { key: "is_active", label: "Status", type: "boolean" },
                      ]}
                      columns={[
                        { key: "customer_name", label: "Customer" },
                        { key: "rating", label: "Rating" },
                        { key: "comment", label: "Comment" },
                        { key: "is_active", label: "Active" },
                      ]}
                    />
                  } />
                  <Route path="videos" element={<VideosPage />} />
                  <Route path="blogs" element={<BlogsPage />} />
                  <Route path="integrations/:type" element={<IntegrationSettingsPage />} />
                  <Route path="accounts/summary" element={
                    <MySqlCrudPage title="Accounts Summary" resource="accounts" readOnly
                      fields={[
                        { key: "title", label: "Title" },
                        { key: "type", label: "Type" },
                        { key: "amount", label: "Amount", type: "number" },
                        { key: "note", label: "Note", type: "textarea" },
                      ]}
                      columns={[
                        { key: "title", label: "Title" },
                        { key: "type", label: "Type" },
                        { key: "amount", label: "Amount" },
                        { key: "entry_date", label: "Date" },
                      ]}
                    />
                  } />
                  <Route path="accounts/expense" element={
                    <MySqlCrudPage title="Expense Entry" resource="accounts"
                      fields={[
                        { key: "title", label: "Title" },
                        { key: "type", label: "Type", type: "select", options: ["expense", "income"] },
                        { key: "amount", label: "Amount", type: "number" },
                        { key: "note", label: "Note", type: "textarea" },
                        { key: "entry_date", label: "Date", type: "date" },
                      ]}
                      columns={[
                        { key: "title", label: "Title" },
                        { key: "type", label: "Type" },
                        { key: "amount", label: "Amount" },
                        { key: "entry_date", label: "Date" },
                      ]}
                    />
                  } />
                  <Route path="accounts/office-cost" element={
                    <MySqlCrudPage title="Office Cost" resource="accounts"
                      fields={[
                        { key: "title", label: "Title" },
                        { key: "type", label: "Type", type: "select", options: ["expense", "income"] },
                        { key: "amount", label: "Amount", type: "number" },
                        { key: "note", label: "Note", type: "textarea" },
                        { key: "entry_date", label: "Date", type: "date" },
                      ]}
                      columns={[
                        { key: "title", label: "Title" },
                        { key: "amount", label: "Amount" },
                        { key: "note", label: "Note" },
                        { key: "entry_date", label: "Date" },
                      ]}
                    />
                  } />
                  <Route path="pixels" element={<TrackingPixelsPage />} />
                  <Route path="reports/customer-analytics" element={<CustomerAnalyticsPage />} />
                  <Route path="reports/sales" element={<SalesReportPage />} />
                  <Route path="reports/stock" element={<StockReportPage />} />
                  <Route path="reports/fraud" element={<FraudCheckerPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
