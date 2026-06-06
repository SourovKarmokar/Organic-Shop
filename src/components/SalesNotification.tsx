import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ShoppingBag } from "lucide-react";

const buyers = [
  { name: "রাহেলা খাতুন", location: "ঢাকা, মিরপুর" },
  { name: "মো. কামরুল হাসান", location: "চট্টগ্রাম, পাহাড়তলী" },
  { name: "ফাতেমা বেগম", location: "রাজশাহী, বোয়ালিয়া" },
  { name: "আব্দুল করিম", location: "খুলনা, সোনাডাঙ্গা" },
  { name: "নাসরিন আক্তার", location: "সিলেট, জিন্দাবাজার" },
  { name: "মোস্তফা কামাল", location: "বরিশাল, নথুল্লাবাদ" },
  { name: "সুমাইয়া ইসলাম", location: "কুমিল্লা, কান্দিরপাড়" },
  { name: "তানভীর আহমেদ", location: "গাজীপুর, টঙ্গী" },
  { name: "রুবিনা পারভীন", location: "নারায়ণগঞ্জ, সিদ্ধিরগঞ্জ" },
  { name: "জাহিদ হোসেন", location: "ময়মনসিংহ, গঙ্গানগর" },
  { name: "শামীমা সুলতানা", location: "রংপুর, শাপলা চত্বর" },
  { name: "আরিফুল ইসলাম", location: "দিনাজপুর, বালুবাড়ী" },
  { name: "মারিয়া আক্তার", location: "ঢাকা, উত্তরা" },
  { name: "হাসান মাহমুদ", location: "ঢাকা, ধানমন্ডি" },
  { name: "তাসলিমা নাসরিন", location: "যশোর, চুড়ামণকাঠি" },
  { name: "সাইফুল ইসলাম", location: "ফরিদপুর, গোয়ালচামট" },
  { name: "নুসরাত জাহান", location: "পাবনা, শালগাড়িয়া" },
  { name: "রাশেদুল ইসলাম", location: "টাঙ্গাইল, করটিয়া" },
  { name: "আফরোজা বেগম", location: "নোয়াখালী, মাইজদী" },
  { name: "ইমরান হোসেন", location: "কক্সবাজার, কলাতলী" },
];

const productSlugs = [
  { slug: "pure-ghee-500ml", name: "খাঁটি গাওয়া ঘি" },
  { slug: "sundarbans-honey-500g", name: "সুন্দরবনের খাঁটি মধু" },
  { slug: "cashew-nuts-250g", name: "কাজু বাদাম" },
  { slug: "black-seed-oil-100ml", name: "কালোজিরা তেল" },
  { slug: "ajwa-dates-500g", name: "আজওয়া খেজুর" },
  { slug: "litchi-honey-1kg", name: "লিচু ফুলের মধু" },
  { slug: "chia-seeds-200g", name: "চিয়া সিড" },
  { slug: "patali-gur-1kg", name: "পাটালি গুড়" },
  { slug: "turmeric-powder-200g", name: "হলুদ গুঁড়া" },
  { slug: "coconut-oil-500ml", name: "নারকেল তেল" },
  { slug: "miniket-rice-5kg", name: "মিনিকেট চাল" },
  { slug: "nolen-gur-500g", name: "নলেন গুড়" },
];

const timeAgoOptions = ["২ মিনিট আগে", "৫ মিনিট আগে", "৮ মিনিট আগে", "১২ মিনিট আগে", "১৫ মিনিট আগে", "২০ মিনিট আগে", "৩০ মিনিট আগে"];

export default function SalesNotification() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState({ buyer: buyers[0], product: productSlugs[0], timeAgo: timeAgoOptions[0] });

  useEffect(() => {
    const showNext = () => {
      const buyer = buyers[Math.floor(Math.random() * buyers.length)];
      const product = productSlugs[Math.floor(Math.random() * productSlugs.length)];
      const timeAgo = timeAgoOptions[Math.floor(Math.random() * timeAgoOptions.length)];
      setCurrent({ buyer, product, timeAgo });
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    };

    // First show after 8 seconds
    const initialTimer = setTimeout(showNext, 8000);
    // Then every 15-25 seconds
    const interval = setInterval(showNext, 15000 + Math.random() * 10000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  if (!visible) return null;

  return (
    <Link
      to={`/product/${current.product.slug}`}
      className="fixed bottom-20 left-4 z-50 max-w-xs animate-in slide-in-from-left-full duration-500"
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl p-3 pr-8 flex items-start gap-3 hover:shadow-primary/10 transition-shadow cursor-pointer">
        <div className="bg-primary/10 rounded-full p-2 shrink-0 mt-0.5">
          <ShoppingBag className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground leading-snug">
            <span className="text-primary font-bold">{current.buyer.name}</span>
            {" "}কিনেছেন
          </p>
          <p className="text-sm text-primary font-semibold truncate">
            {current.product.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            📍 {current.buyer.location} • {current.timeAgo}
          </p>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setVisible(false); }}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </Link>
  );
}
