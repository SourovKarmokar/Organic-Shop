import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { getCategoryImage } from "@/lib/categoryImages";
import { publicApi } from "@/lib/publicApi";

const CategoriesPage = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const [cats, products] = await Promise.all([
          publicApi<any[]>("/api/public/categories"),
          publicApi<any[]>("/api/public/products"),
        ]);

        const parents = cats.filter((cat) => !cat.parent_id);
        const subs = cats.filter((cat) => cat.parent_id);
        const enriched = parents.map((cat) => {
          const childIds = subs.filter((sub) => sub.parent_id === cat.id).map((sub) => sub.id);
          const allIds = [cat.id, ...childIds];
          return {
            ...cat,
            productCount: products.filter((product) => allIds.includes(product.category_id)).length,
            subCategories: subs.filter((sub) => sub.parent_id === cat.id),
          };
        });

        setCategories(enriched);
      } catch (error) {
        console.error(error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <TopBanner />
      <Header />
      <main className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">All Categories</h1>
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading categories...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((cat) => (
              <div key={cat.id} className="group rounded-xl border transition-all hover:border-primary hover:shadow-md">
                <Link to={`/category/${cat.slug}`} className="flex flex-col items-center gap-3 p-6">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-secondary transition-colors group-hover:bg-primary/10">
                    <img src={getCategoryImage(cat.slug, cat.image_url)} alt={cat.name} className="h-full w-full object-cover" />
                  </div>
                  <span className="text-center font-medium">{cat.name}</span>
                  <span className="text-sm text-muted-foreground">{cat.productCount} products</span>
                </Link>
                {cat.subCategories?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 border-t px-4 py-3">
                    {cat.subCategories.map((sub: any) => (
                      <Link
                        key={sub.id}
                        to={`/category/${sub.slug}`}
                        className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default CategoriesPage;
