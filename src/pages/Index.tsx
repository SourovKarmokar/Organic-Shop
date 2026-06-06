import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import TopCategories from "@/components/TopCategories";
import ProductCard from "@/components/ProductCard";
import CustomerReviews from "@/components/CustomerReviews";
import BlogSection from "@/components/BlogSection";
import VideoGallery from "@/components/VideoGallery";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";
import MobileBottomNav from "@/components/MobileBottomNav";
import CountdownTimer from "@/components/CountdownTimer";
import SalesNotification from "@/components/SalesNotification";
import { Button } from "@/components/ui/button";
import { getProductImage } from "@/lib/productImages";
import { publicApi } from "@/lib/publicApi";
import type { Product } from "@/context/CartContext";

const mapDbProduct = (p: any): Product => {
  const salePrice = p.sale_price ?? null;
  const basePrice = Number(p.base_price ?? 0);
  const price = Number(salePrice ?? basePrice);
  const originalPrice = Number(salePrice ? basePrice : basePrice);
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price,
    originalPrice,
    discount,
    image: getProductImage(p.slug, p.image_url),
    category: p.category_slug || "",
    rating: 4.8,
    brand: p.brand_name || "Organic Shop",
    code: p.sku || "",
    description: p.description || "",
    inStock: Number(p.stock_quantity ?? 0) > 0 && p.is_active !== false,
  };
};

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<{ id: string; name: string; slug: string; products: Product[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [dbProducts, allCategories] = await Promise.all([
        publicApi<any[]>("/api/public/products"),
        publicApi<any[]>("/api/public/categories"),
      ]);

      const featured = dbProducts.filter((p) => p.is_featured).map(mapDbProduct);
      setFeaturedProducts(featured);

      const subCatMap = new Map<string, string[]>();
      allCategories.forEach((cat) => {
        if (cat.parent_id) {
          const existing = subCatMap.get(cat.parent_id) || [];
          existing.push(cat.id);
          subCatMap.set(cat.parent_id, existing);
        }
      });

      const homeCategories = allCategories.filter((cat) => !cat.parent_id && (cat.show_on_home || allCategories.length));
      const sections = homeCategories
        .map((cat) => {
          const ids = [cat.id, ...(subCatMap.get(cat.id) || [])];
          const products = dbProducts
            .filter((product) => ids.includes(product.category_id))
            .slice(0, 4)
            .map(mapDbProduct);
          return { id: cat.id, name: cat.name, slug: cat.slug, products };
        })
        .filter((section) => section.products.length > 0);

      setCategoryProducts(sections);
    } catch (error) {
      console.error(error);
      setFeaturedProducts([]);
      setCategoryProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <TopBanner />
      <Header />

      <main className="container mx-auto px-4">
        <section className="py-4 md:py-6">
          <HeroSlider />
        </section>

        <TopCategories />

        {featuredProducts.length > 0 && (
          <section className="py-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">Offer Products</h2>
              <CountdownTimer />
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} showUrgency />
              ))}
            </div>
          </section>
        )}

        {categoryProducts.map((cat) => (
          <section key={cat.id} className="py-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{cat.name}</h2>
              <Link to={`/category/${cat.slug}`}>
                <Button variant="outline" size="sm" className="rounded-full">
                  See more
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {cat.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ))}

        {loading && <div className="py-12 text-center text-muted-foreground">Loading products...</div>}
        {!loading && categoryProducts.length === 0 && featuredProducts.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No MySQL products found. Add products from the admin panel.
          </div>
        )}

        <CustomerReviews />
        <BlogSection />
        <VideoGallery />
      </main>

      <Footer />
      <AIChatWidget />
      <SalesNotification />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
