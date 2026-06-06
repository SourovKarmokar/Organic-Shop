import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCategoryImage } from "@/lib/categoryImages";
import { publicApi } from "@/lib/publicApi";

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  show_in_navbar?: boolean;
};

const CategoryItem = ({ cat }: { cat: Category }) => (
  <Link to={`/category/${cat.slug}`} className="group flex w-20 shrink-0 flex-col items-center gap-2 md:w-auto">
    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 bg-background shadow-sm transition-colors group-hover:border-primary md:h-20 md:w-20 md:rounded-lg">
      <img src={getCategoryImage(cat.slug, cat.image_url)} alt={cat.name} className="h-full w-full object-cover" loading="lazy" />
    </div>
    <span className="text-center text-xs font-medium leading-tight md:text-sm">{cat.name}</span>
  </Link>
);

const TopCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await publicApi<Category[]>("/api/public/categories");
        setCategories(data.filter((cat: any) => !cat.parent_id));
      } catch (error) {
        console.error(error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  if (!categories.length) return null;

  const desktopCategories = categories.filter((cat) => cat.show_in_navbar).length
    ? categories.filter((cat) => cat.show_in_navbar)
    : categories;

  return (
    <section className="py-8">
      <h2 className="mb-6 text-center text-2xl font-bold">Top Categories</h2>

      <div className="overflow-hidden md:hidden">
        <div className="flex w-max animate-marquee gap-6">
          {categories.map((cat) => <CategoryItem key={`a-${cat.id}`} cat={cat} />)}
          {categories.map((cat) => <CategoryItem key={`b-${cat.id}`} cat={cat} />)}
        </div>
      </div>

      <div className="hidden gap-4 px-1 md:grid md:grid-cols-8">
        {desktopCategories.map((cat) => <CategoryItem key={cat.id} cat={cat} />)}
      </div>
    </section>
  );
};

export default TopCategories;
