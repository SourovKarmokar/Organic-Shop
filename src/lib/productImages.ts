// Shared utility to map mock product slugs to their local images (updated)
import ghee500ml from "@/assets/products/ghee-500ml.jpg";
import sundarbansHoney from "@/assets/products/sundarbans-honey.jpg";
import cashewNuts from "@/assets/products/cashew-nuts.jpg";
import turmericPowder from "@/assets/products/turmeric-powder.jpg";
import blackSeedOil from "@/assets/products/black-seed-oil.jpg";
import miniketRice from "@/assets/products/miniket-rice.jpg";
import chiaSeeds from "@/assets/products/chia-seeds.jpg";
import dateMolasses from "@/assets/products/date-molasses.jpg";
import coconutOil from "@/assets/products/coconut-oil.jpg";
import litchiHoney from "@/assets/products/litchi-honey.jpg";
import ajwaDates from "@/assets/products/ajwa-dates.jpg";
import cuminPowder from "@/assets/products/cumin-powder.jpg";
import mustardOil from "@/assets/products/mustard-oil.jpg";
import sesameOil from "@/assets/products/sesame-oil.jpg";
import khalisaHoney from "@/assets/products/khalisa-honey.jpg";
import mustardHoney from "@/assets/products/mustard-honey.jpg";
import pistachio from "@/assets/products/pistachio.jpg";
import mabroomDates from "@/assets/products/mabroom-dates.jpg";
import corianderPowder from "@/assets/products/coriander-powder.jpg";
import chiliPowder from "@/assets/products/chili-powder.jpg";
import oliveOil from "@/assets/products/olive-oil.jpg";
import flaxseedOil from "@/assets/products/flaxseed-oil.jpg";
import almondOil from "@/assets/products/almond-oil.jpg";
import chiniguraRice from "@/assets/products/chinigura-rice.jpg";
import masoorDal from "@/assets/products/masoor-dal.jpg";
import moongDal from "@/assets/products/moong-dal.jpg";
import quinoa from "@/assets/products/quinoa.jpg";
import oats from "@/assets/products/oats.jpg";
import flaxSeeds from "@/assets/products/flax-seeds.jpg";
import yogurt from "@/assets/products/yogurt.jpg";
import nolenGur from "@/assets/products/nolen-gur.jpg";
import pataliGur from "@/assets/products/patali-gur.jpg";

export const mockImageMap: Record<string, string> = {
  "pure-ghee-500ml": ghee500ml,
  "sundarbans-honey-500g": sundarbansHoney,
  "cashew-nuts-250g": cashewNuts,
  "turmeric-powder-200g": turmericPowder,
  "black-seed-oil-100ml": blackSeedOil,
  "miniket-rice-5kg": miniketRice,
  "chia-seeds-200g": chiaSeeds,
  "date-molasses-500g": dateMolasses,
  "coconut-oil-500ml": coconutOil,
  "litchi-honey-1kg": litchiHoney,
  "ajwa-dates-500g": ajwaDates,
  "cumin-powder-150g": cuminPowder,
  "mustard-oil-500ml": mustardOil,
  "sesame-oil-250ml": sesameOil,
  "khalisa-honey-500g": khalisaHoney,
  "mustard-honey-1kg": mustardHoney,
  "pistachio-200g": pistachio,
  "mabroom-dates-500g": mabroomDates,
  "coriander-powder-150g": corianderPowder,
  "chili-powder-200g": chiliPowder,
  "olive-oil-500ml": oliveOil,
  "flaxseed-oil-100ml": flaxseedOil,
  "almond-oil-100ml": almondOil,
  "chinigura-rice-5kg": chiniguraRice,
  "masoor-dal-1kg": masoorDal,
  "moong-dal-1kg": moongDal,
  "quinoa-200g": quinoa,
  "oats-500g": oats,
  "flax-seeds-200g": flaxSeeds,
  "pure-yogurt-500g": yogurt,
  "nolen-gur-500g": nolenGur,
  "patali-gur-1kg": pataliGur,
};

export const getProductImage = (slug: string, imageUrl?: string | null): string => {
  // ignore local dev-style paths saved in DB (e.g. /src/assets/...), they break in production
  if (imageUrl && !imageUrl.startsWith("/src/")) return imageUrl;
  return mockImageMap[slug] || "/placeholder.svg";
};
