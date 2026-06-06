import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
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

const CategoryPage = () => {
  const { slug } = useParams();
  const [categoryName, setCategoryName] = useState("");
  const [catProducts, setCatProducts] = useState<Product[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    if (!slug) return;

    setLoading(true);
    try {
      const data = await publicApi<{ category: any; subCategories: any[]; products: any[] }>(`/api/public/categories/${slug}`);
      setCategoryName(data.category.name);
      setSubCategories(data.subCategories || []);
      setCatProducts((data.products || []).map(mapDbProduct));
    } catch (error) {
      console.error(error);
      setCategoryName("");
      setSubCategories([]);
      setCatProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <TopBanner />
      <Header />
      <main className="container mx-auto px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold">{categoryName || "Category"}</h1>

        {subCategories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {subCategories.map((sub) => (
              <Link
                key={sub.id}
                to={`/category/${sub.slug}`}
                className="rounded-full border border-primary/30 bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading products...</div>
        ) : catProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {catProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="mb-4 text-muted-foreground">No MySQL products found in this category.</p>
            <Link to="/">
              <button className="text-primary underline">Return home</button>
            </Link>
          </div>
        )}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default CategoryPage;
