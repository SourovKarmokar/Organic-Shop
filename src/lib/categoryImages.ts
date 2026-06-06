import catGheeOil from "@/assets/categories/ghee-oil.jpg";
import catOrganicHoney from "@/assets/categories/organic-honey.jpg";
import catNutsDates from "@/assets/categories/nuts-dates.jpg";
import catOrganicSpices from "@/assets/categories/organic-spices.jpg";
import catOrganicOil from "@/assets/categories/organic-oil.jpg";
import catRicePulse from "@/assets/categories/rice-pulse.jpg";
import catSuperFoods from "@/assets/categories/super-foods.jpg";
import catSweetenersDairy from "@/assets/categories/sweeteners-dairy.jpg";
import catHerbalTea from "@/assets/categories/herbal-tea.jpg";
import catDryFruits from "@/assets/categories/dry-fruits.jpg";
import catBakeryItems from "@/assets/categories/bakery-items.jpg";
import catSkincare from "@/assets/categories/skincare.jpg";
import catHealthDrinks from "@/assets/categories/health-drinks.jpg";
import catBabyFood from "@/assets/categories/baby-food.jpg";
import catGiftPackage from "@/assets/categories/gift-package.jpg";

export const categoryImageMap: Record<string, string> = {
  "ghee-oil": catGheeOil,
  "organic-honey": catOrganicHoney,
  "nuts-dates": catNutsDates,
  "organic-spices": catOrganicSpices,
  "organic-oil": catOrganicOil,
  "rice-pulse": catRicePulse,
  "super-foods": catSuperFoods,
  "sweeteners-dairy": catSweetenersDairy,
  "herbal-tea": catHerbalTea,
  "dry-fruits": catDryFruits,
  "bakery-items": catBakeryItems,
  "skincare": catSkincare,
  "health-drinks": catHealthDrinks,
  "baby-food": catBabyFood,
  "gift-package": catGiftPackage,
};

export const getCategoryImage = (slug: string, imageUrl?: string | null): string => {
  if (imageUrl && !imageUrl.startsWith("/src/")) return imageUrl;
  return categoryImageMap[slug] || "";
};
