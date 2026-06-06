import { Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { products } from "@/data/mockData";
import { Link } from "react-router-dom";

const placeholderTexts = [
  "খাঁটি গাওয়া ঘি",
  "সুন্দরবনের মধু",
  "কাজু বাদাম",
  "হলুদ গুঁড়া",
  "কালোজিরা তেল",
  "আজওয়া খেজুর",
  "চিয়া সিড",
  "মিনিকেট চাল",
];

const AnimatedSearch = () => {
  const [placeholder, setPlaceholder] = useState("");
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Typing animation
  useEffect(() => {
    if (query) return; // Don't animate when user is typing
    let textIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    const type = () => {
      const currentText = placeholderTexts[textIdx];
      if (!isDeleting) {
        setPlaceholder(currentText.slice(0, charIdx + 1));
        charIdx++;
        if (charIdx === currentText.length) {
          isDeleting = true;
          timeout = setTimeout(type, 1500);
          return;
        }
        timeout = setTimeout(type, 80);
      } else {
        setPlaceholder(currentText.slice(0, charIdx));
        charIdx--;
        if (charIdx === 0) {
          isDeleting = false;
          textIdx = (textIdx + 1) % placeholderTexts.length;
          timeout = setTimeout(type, 300);
          return;
        }
        timeout = setTimeout(type, 40);
      }
    };
    timeout = setTimeout(type, 500);
    return () => clearTimeout(timeout);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.length > 0
    ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <Input
          placeholder={query ? "পণ্য খুঁজুন..." : placeholder || "পণ্য খুঁজুন..."}
          className="pr-10 rounded-full border-primary/30 focus-visible:ring-primary"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
          onFocus={() => query && setShowResults(true)}
        />
        {query ? (
          <Button size="icon" variant="ghost" className="absolute right-0 top-0 rounded-full h-full" onClick={() => { setQuery(""); setShowResults(false); }}>
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="icon" className="absolute right-0 top-0 rounded-full h-full">
            <Search className="h-4 w-4" />
          </Button>
        )}
      </div>
      {showResults && filtered.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-background border rounded-lg shadow-xl z-[60] max-h-80 overflow-y-auto">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/product/${p.slug}`}
              className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b last:border-0"
              onClick={() => { setQuery(""); setShowResults(false); }}
            >
              <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-primary font-bold">৳{p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
      {showResults && query.length > 0 && filtered.length === 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-background border rounded-lg shadow-xl z-[60] p-4 text-center text-muted-foreground text-sm">
          কোনো পণ্য খুঁজে পাওয়া যায়নি
        </div>
      )}
    </div>
  );
};

export default AnimatedSearch;
