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

import catGheeOil from "@/assets/categories/ghee-oil.jpg";
import catOrganicHoney from "@/assets/categories/organic-honey.jpg";
import catNutsDates from "@/assets/categories/nuts-dates.jpg";
import catOrganicSpices from "@/assets/categories/organic-spices.jpg";
import catOrganicOil from "@/assets/categories/organic-oil.jpg";
import catRicePulse from "@/assets/categories/rice-pulse.jpg";
import catSuperFoods from "@/assets/categories/super-foods.jpg";
import catSweetenersDairy from "@/assets/categories/sweeteners-dairy.jpg";

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  category: string;
  rating: number;
  brand: string;
  code: string;
  description: string;
  inStock: boolean;
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  subCategories?: SubCategory[];
}

export const categories: Category[] = [
  { id: 1, name: "ঘি ও তেল", slug: "ghee-oil", image: catGheeOil, productCount: 12, subCategories: [
    { id: 101, name: "খাঁটি ঘি", slug: "ghee-oil?sub=ghee" },
    { id: 102, name: "সরিষার তেল", slug: "ghee-oil?sub=mustard-oil" },
    { id: 103, name: "নারকেল তেল", slug: "ghee-oil?sub=coconut-oil" },
    { id: 104, name: "তিলের তেল", slug: "ghee-oil?sub=sesame-oil" },
  ]},
  { id: 2, name: "অর্গানিক মধু", slug: "organic-honey", image: catOrganicHoney, productCount: 8, subCategories: [
    { id: 201, name: "সুন্দরবনের মধু", slug: "organic-honey?sub=sundarbans" },
    { id: 202, name: "লিচু ফুলের মধু", slug: "organic-honey?sub=litchi" },
    { id: 203, name: "সরিষা ফুলের মধু", slug: "organic-honey?sub=mustard" },
    { id: 204, name: "খলিসা ফুলের মধু", slug: "organic-honey?sub=khalisa" },
  ]},
  { id: 3, name: "বাদাম ও খেজুর", slug: "nuts-dates", image: catNutsDates, productCount: 15, subCategories: [
    { id: 301, name: "কাজু বাদাম", slug: "nuts-dates?sub=cashew" },
    { id: 302, name: "পেস্তা বাদাম", slug: "nuts-dates?sub=pistachio" },
    { id: 303, name: "আজওয়া খেজুর", slug: "nuts-dates?sub=ajwa" },
    { id: 304, name: "মাবরুম খেজুর", slug: "nuts-dates?sub=mabroom" },
  ]},
  { id: 4, name: "অর্গানিক মশলা", slug: "organic-spices", image: catOrganicSpices, productCount: 20, subCategories: [
    { id: 401, name: "হলুদ গুঁড়া", slug: "organic-spices?sub=turmeric" },
    { id: 402, name: "জিরা গুঁড়া", slug: "organic-spices?sub=cumin" },
    { id: 403, name: "ধনিয়া গুঁড়া", slug: "organic-spices?sub=coriander" },
    { id: 404, name: "মরিচ গুঁড়া", slug: "organic-spices?sub=chili" },
  ]},
  { id: 5, name: "অর্গানিক তেল", slug: "organic-oil", image: catOrganicOil, productCount: 10, subCategories: [
    { id: 501, name: "কালোজিরা তেল", slug: "organic-oil?sub=black-seed" },
    { id: 502, name: "অলিভ অয়েল", slug: "organic-oil?sub=olive" },
    { id: 503, name: "তিসির তেল", slug: "organic-oil?sub=flaxseed" },
    { id: 504, name: "বাদামের তেল", slug: "organic-oil?sub=almond" },
  ]},
  { id: 6, name: "চাল ও ডাল", slug: "rice-pulse", image: catRicePulse, productCount: 14, subCategories: [
    { id: 601, name: "মিনিকেট চাল", slug: "rice-pulse?sub=miniket" },
    { id: 602, name: "চিনিগুঁড়া চাল", slug: "rice-pulse?sub=chinigura" },
    { id: 603, name: "মসুর ডাল", slug: "rice-pulse?sub=masoor" },
    { id: 604, name: "মুগ ডাল", slug: "rice-pulse?sub=moong" },
  ]},
  { id: 7, name: "সুপার ফুডস", slug: "super-foods", image: catSuperFoods, productCount: 9, subCategories: [
    { id: 701, name: "চিয়া সিড", slug: "super-foods?sub=chia" },
    { id: 702, name: "কুইনোয়া", slug: "super-foods?sub=quinoa" },
    { id: 703, name: "ওটস", slug: "super-foods?sub=oats" },
    { id: 704, name: "ফ্ল্যাক্স সিড", slug: "super-foods?sub=flax" },
  ]},
  { id: 8, name: "মিষ্টি ও দুগ্ধ", slug: "sweeteners-dairy", image: catSweetenersDairy, productCount: 11, subCategories: [
    { id: 801, name: "খেজুরের গুড়", slug: "sweeteners-dairy?sub=date-molasses" },
    { id: 802, name: "নলেন গুড়", slug: "sweeteners-dairy?sub=nolen-gur" },
    { id: 803, name: "পাটালি গুড়", slug: "sweeteners-dairy?sub=patali-gur" },
    { id: 804, name: "দই", slug: "sweeteners-dairy?sub=yogurt" },
  ]},
  { id: 9, name: "হার্বাল চা", slug: "herbal-tea", image: catSuperFoods, productCount: 6 },
  { id: 10, name: "ড্রাই ফ্রুটস", slug: "dry-fruits", image: catNutsDates, productCount: 8 },
  { id: 11, name: "বেকারি আইটেম", slug: "bakery-items", image: catSweetenersDairy, productCount: 5 },
  { id: 12, name: "স্কিনকেয়ার", slug: "skincare", image: catOrganicOil, productCount: 7 },
  { id: 13, name: "হেলথ ড্রিংকস", slug: "health-drinks", image: catSuperFoods, productCount: 4 },
  { id: 14, name: "বেবি ফুড", slug: "baby-food", image: catSweetenersDairy, productCount: 5 },
  { id: 15, name: "গিফট প্যাকেজ", slug: "gift-package", image: catOrganicHoney, productCount: 3 },
];

export const products: Product[] = [
  { id: 1, name: "খাঁটি গাওয়া ঘি (৫০০ মিলি)", slug: "pure-ghee-500ml", price: 650, originalPrice: 800, discount: 19, image: ghee500ml, category: "ghee-oil", rating: 4.8, brand: "Organic Shop", code: "GH001", description: "১০০% খাঁটি গাওয়া ঘি, কোনো মিশ্রণ নেই। প্রাকৃতিক উপায়ে তৈরি এই ঘি আপনার রান্নায় এনে দেবে অসাধারণ স্বাদ ও সুগন্ধ।", inStock: true },
  { id: 2, name: "সুন্দরবনের খাঁটি মধু (৫০০ গ্রাম)", slug: "sundarbans-honey-500g", price: 550, originalPrice: 700, discount: 21, image: sundarbansHoney, category: "organic-honey", rating: 4.9, brand: "Organic Shop", code: "HN001", description: "সুন্দরবনের খাঁটি মধু, ল্যাব টেস্টেড।", inStock: true },
  { id: 3, name: "কাজু বাদাম (২৫০ গ্রাম)", slug: "cashew-nuts-250g", price: 450, originalPrice: 550, discount: 18, image: cashewNuts, category: "nuts-dates", rating: 4.7, brand: "Organic Shop", code: "NT001", description: "প্রিমিয়াম কোয়ালিটি কাজু বাদাম।", inStock: true },
  { id: 4, name: "হলুদ গুঁড়া (২০০ গ্রাম)", slug: "turmeric-powder-200g", price: 120, originalPrice: 150, discount: 20, image: turmericPowder, category: "organic-spices", rating: 4.6, brand: "Organic Shop", code: "SP001", description: "বিশুদ্ধ হলুদ গুঁড়া।", inStock: true },
  { id: 5, name: "কালোজিরা তেল (১০০ মিলি)", slug: "black-seed-oil-100ml", price: 350, originalPrice: 450, discount: 22, image: blackSeedOil, category: "organic-oil", rating: 4.8, brand: "Organic Shop", code: "OL001", description: "কোল্ড প্রেসড কালোজিরা তেল।", inStock: true },
  { id: 6, name: "মিনিকেট চাল (৫ কেজি)", slug: "miniket-rice-5kg", price: 380, originalPrice: 450, discount: 16, image: miniketRice, category: "rice-pulse", rating: 4.5, brand: "Organic Shop", code: "RC001", description: "প্রিমিয়াম মিনিকেট চাল।", inStock: true },
  { id: 7, name: "চিয়া সিড (২০০ গ্রাম)", slug: "chia-seeds-200g", price: 280, originalPrice: 350, discount: 20, image: chiaSeeds, category: "super-foods", rating: 4.7, brand: "Organic Shop", code: "SF001", description: "অর্গানিক চিয়া সিড।", inStock: true },
  { id: 8, name: "খেজুরের গুড় (৫০০ গ্রাম)", slug: "date-molasses-500g", price: 220, originalPrice: 280, discount: 21, image: dateMolasses, category: "sweeteners-dairy", rating: 4.6, brand: "Organic Shop", code: "SD001", description: "খাঁটি খেজুরের গুড়।", inStock: true },
  { id: 9, name: "নারকেল তেল (৫০০ মিলি)", slug: "coconut-oil-500ml", price: 320, originalPrice: 400, discount: 20, image: coconutOil, category: "ghee-oil", rating: 4.5, brand: "Organic Shop", code: "GH002", description: "ভার্জিন নারকেল তেল।", inStock: true },
  { id: 10, name: "লিচু ফুলের মধু (১ কেজি)", slug: "litchi-honey-1kg", price: 900, originalPrice: 1100, discount: 18, image: litchiHoney, category: "organic-honey", rating: 4.9, brand: "Organic Shop", code: "HN002", description: "লিচু ফুলের খাঁটি মধু।", inStock: true },
  { id: 11, name: "আজওয়া খেজুর (৫০০ গ্রাম)", slug: "ajwa-dates-500g", price: 1200, originalPrice: 1500, discount: 20, image: ajwaDates, category: "nuts-dates", rating: 4.9, brand: "Organic Shop", code: "NT002", description: "মদিনার আজওয়া খেজুর।", inStock: true },
  { id: 12, name: "জিরা গুঁড়া (১৫০ গ্রাম)", slug: "cumin-powder-150g", price: 100, originalPrice: 130, discount: 23, image: cuminPowder, category: "organic-spices", rating: 4.5, brand: "Organic Shop", code: "SP002", description: "বিশুদ্ধ জিরা গুঁড়া।", inStock: true },
  { id: 13, name: "সরিষার তেল (৫০০ মিলি)", slug: "mustard-oil-500ml", price: 280, originalPrice: 350, discount: 20, image: mustardOil, category: "ghee-oil", rating: 4.6, brand: "Organic Shop", code: "GH003", description: "খাঁটি ঘানি ভাঙা সরিষার তেল।", inStock: true },
  { id: 14, name: "তিলের তেল (২৫০ মিলি)", slug: "sesame-oil-250ml", price: 320, originalPrice: 400, discount: 20, image: sesameOil, category: "ghee-oil", rating: 4.5, brand: "Organic Shop", code: "GH004", description: "কোল্ড প্রেসড তিলের তেল।", inStock: true },
  { id: 15, name: "খলিসা ফুলের মধু (৫০০ গ্রাম)", slug: "khalisa-honey-500g", price: 600, originalPrice: 750, discount: 20, image: khalisaHoney, category: "organic-honey", rating: 4.8, brand: "Organic Shop", code: "HN003", description: "খলিসা ফুলের বিশুদ্ধ মধু।", inStock: true },
  { id: 16, name: "সরিষা ফুলের মধু (১ কেজি)", slug: "mustard-honey-1kg", price: 850, originalPrice: 1050, discount: 19, image: mustardHoney, category: "organic-honey", rating: 4.7, brand: "Organic Shop", code: "HN004", description: "সরিষা ফুলের খাঁটি মধু।", inStock: true },
  { id: 17, name: "পেস্তা বাদাম (২০০ গ্রাম)", slug: "pistachio-200g", price: 650, originalPrice: 800, discount: 19, image: pistachio, category: "nuts-dates", rating: 4.8, brand: "Organic Shop", code: "NT003", description: "প্রিমিয়াম পেস্তা বাদাম।", inStock: true },
  { id: 18, name: "মাবরুম খেজুর (৫০০ গ্রাম)", slug: "mabroom-dates-500g", price: 800, originalPrice: 1000, discount: 20, image: mabroomDates, category: "nuts-dates", rating: 4.7, brand: "Organic Shop", code: "NT004", description: "মদিনার মাবরুম খেজুর।", inStock: true },
  { id: 19, name: "ধনিয়া গুঁড়া (১৫০ গ্রাম)", slug: "coriander-powder-150g", price: 90, originalPrice: 120, discount: 25, image: corianderPowder, category: "organic-spices", rating: 4.4, brand: "Organic Shop", code: "SP003", description: "বিশুদ্ধ ধনিয়া গুঁড়া।", inStock: true },
  { id: 20, name: "মরিচ গুঁড়া (২০০ গ্রাম)", slug: "chili-powder-200g", price: 130, originalPrice: 160, discount: 19, image: chiliPowder, category: "organic-spices", rating: 4.5, brand: "Organic Shop", code: "SP004", description: "দেশি মরিচের গুঁড়া।", inStock: true },
  { id: 21, name: "অলিভ অয়েল (৫০০ মিলি)", slug: "olive-oil-500ml", price: 550, originalPrice: 700, discount: 21, image: oliveOil, category: "organic-oil", rating: 4.7, brand: "Organic Shop", code: "OL002", description: "এক্সট্রা ভার্জিন অলিভ অয়েল।", inStock: true },
  { id: 22, name: "তিসির তেল (১০০ মিলি)", slug: "flaxseed-oil-100ml", price: 300, originalPrice: 380, discount: 21, image: flaxseedOil, category: "organic-oil", rating: 4.6, brand: "Organic Shop", code: "OL003", description: "কোল্ড প্রেসড তিসির তেল।", inStock: true },
  { id: 23, name: "বাদামের তেল (১০০ মিলি)", slug: "almond-oil-100ml", price: 400, originalPrice: 500, discount: 20, image: almondOil, category: "organic-oil", rating: 4.5, brand: "Organic Shop", code: "OL004", description: "খাঁটি বাদামের তেল।", inStock: true },
  { id: 24, name: "চিনিগুঁড়া চাল (৫ কেজি)", slug: "chinigura-rice-5kg", price: 550, originalPrice: 680, discount: 19, image: chiniguraRice, category: "rice-pulse", rating: 4.7, brand: "Organic Shop", code: "RC002", description: "সুগন্ধি চিনিগুঁড়া চাল।", inStock: true },
  { id: 25, name: "মসুর ডাল (১ কেজি)", slug: "masoor-dal-1kg", price: 120, originalPrice: 150, discount: 20, image: masoorDal, category: "rice-pulse", rating: 4.5, brand: "Organic Shop", code: "RC003", description: "দেশি মসুর ডাল।", inStock: true },
  { id: 26, name: "মুগ ডাল (১ কেজি)", slug: "moong-dal-1kg", price: 140, originalPrice: 180, discount: 22, image: moongDal, category: "rice-pulse", rating: 4.4, brand: "Organic Shop", code: "RC004", description: "খোসা ছাড়ানো মুগ ডাল।", inStock: true },
  { id: 27, name: "কুইনোয়া (২০০ গ্রাম)", slug: "quinoa-200g", price: 350, originalPrice: 450, discount: 22, image: quinoa, category: "super-foods", rating: 4.6, brand: "Organic Shop", code: "SF002", description: "অর্গানিক কুইনোয়া।", inStock: true },
  { id: 28, name: "ওটস (৫০০ গ্রাম)", slug: "oats-500g", price: 180, originalPrice: 230, discount: 22, image: oats, category: "super-foods", rating: 4.5, brand: "Organic Shop", code: "SF003", description: "হোল গ্রেইন ওটস।", inStock: true },
  { id: 29, name: "ফ্ল্যাক্স সিড (২০০ গ্রাম)", slug: "flax-seeds-200g", price: 200, originalPrice: 260, discount: 23, image: flaxSeeds, category: "super-foods", rating: 4.6, brand: "Organic Shop", code: "SF004", description: "অর্গানিক ফ্ল্যাক্স সিড।", inStock: true },
  { id: 30, name: "খাঁটি দই (৫০০ গ্রাম)", slug: "pure-yogurt-500g", price: 100, originalPrice: 130, discount: 23, image: yogurt, category: "sweeteners-dairy", rating: 4.5, brand: "Organic Shop", code: "SD002", description: "খাঁটি টকদই।", inStock: true },
  { id: 31, name: "নলেন গুড় (৫০০ গ্রাম)", slug: "nolen-gur-500g", price: 350, originalPrice: 430, discount: 19, image: nolenGur, category: "sweeteners-dairy", rating: 4.8, brand: "Organic Shop", code: "SD003", description: "খাঁটি নলেন গুড়।", inStock: true },
  { id: 32, name: "পাটালি গুড় (১ কেজি)", slug: "patali-gur-1kg", price: 250, originalPrice: 320, discount: 22, image: pataliGur, category: "sweeteners-dairy", rating: 4.6, brand: "Organic Shop", code: "SD004", description: "খাঁটি পাটালি গুড়।", inStock: true },
];
