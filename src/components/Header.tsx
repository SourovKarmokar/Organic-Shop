import { Search, ShoppingCart, User, MapPin, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import AnimatedSearch from "@/components/AnimatedSearch";
import { publicApi } from "@/lib/publicApi";

interface DbCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
}

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("organic_user_token"));
  }, []);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await publicApi<DbCategory[]>("/api/public/categories");
        setDbCategories(data || []);
      } catch (error) {
        console.error(error);
        setDbCategories([]);
      }
    };
    fetchCats();
  }, []);

  const parentCats = dbCategories.filter(c => !c.parent_id);
  const getSubCats = (parentId: string) => dbCategories.filter(c => c.parent_id === parentId);
  const navCategories = parentCats;
  const isActiveCategory = (slug: string) => location.pathname === `/category/${slug}`;

  const showDropdown = useCallback((catId: string, el: HTMLElement) => {
    clearTimeout(hideTimeout.current);
    const rect = el.getBoundingClientRect();
    setDropdownStyle({ left: rect.left, top: rect.bottom });
    setHoveredCat(catId);
  }, []);

  const scheduleHide = useCallback(() => {
    hideTimeout.current = setTimeout(() => {
      setHoveredCat(null);
    }, 150);
  }, []);

  const cancelHide = useCallback(() => {
    clearTimeout(hideTimeout.current);
  }, []);

  const hoveredSubCats = hoveredCat ? getSubCats(hoveredCat) : [];

  return (
    <>
      <header className="bg-background shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="text-2xl">🌿</span>
              <h1 className="text-xl md:text-2xl font-bold text-primary">Organic Shop</h1>
            </Link>
            <div className="hidden md:flex flex-1 max-w-xl">
              <AnimatedSearch />
            </div>
            <div className="flex items-center gap-1 md:gap-3">
              <Link to="/track-order"><Button variant="ghost" size="sm" className="hidden md:flex items-center gap-1 text-sm"><MapPin className="h-4 w-4" /><span>ট্র্যাক অর্ডার</span></Button></Link>
              <Button variant="ghost" size="icon" onClick={() => navigate(loggedIn ? "/my-account" : "/login")}><User className="h-5 w-5" /></Button>
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">{totalItems}</Badge>}
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:hidden mt-3">
            <AnimatedSearch />
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 overflow-x-auto scrollbar-hide">
            <ul className="hidden md:flex items-center gap-1 py-2 text-sm w-max">
              {navCategories.map((cat) => {
                const subCats = getSubCats(cat.id as string);
                const hasSubCats = subCats.length > 0;
                return (
                  <li
                    key={cat.id}
                    onMouseEnter={(e) => hasSubCats ? showDropdown(cat.id as string, e.currentTarget) : undefined}
                    onMouseLeave={scheduleHide}
                  >
                    <Link
                      to={`/category/${cat.slug}`}
                      className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1 ${
                        isActiveCategory(cat.slug)
                          ? "bg-lime-400/30 text-white font-semibold"
                          : "hover:bg-primary-foreground/10"
                      }`}
                    >
                      {cat.name}
                      {hasSubCats && <ChevronDown className="h-3 w-3" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-background border-t shadow-lg max-h-[70vh] overflow-y-auto">
            <ul className="py-2">
              {navCategories.map((cat) => {
                const subCats = getSubCats(cat.id as string);
                const hasSubCats = subCats.length > 0;
                const isExpanded = expandedMobileCat === (cat.id as string);
                return (
                  <li key={cat.id}>
                    <div className="flex items-center">
                      <Link
                        to={`/category/${cat.slug}`}
                        className={`flex-1 block px-4 py-2.5 transition-colors ${
                          isActiveCategory(cat.slug)
                            ? "bg-primary/10 text-primary font-semibold"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setMenuOpen(false)}
                      >
                        {cat.name}
                      </Link>
                      {hasSubCats && (
                        <button
                          className="px-3 py-2.5"
                          onClick={() => setExpandedMobileCat(isExpanded ? null : (cat.id as string))}
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                    {hasSubCats && isExpanded && (
                      <ul className="bg-muted/30">
                        {subCats.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              to={`/category/${sub.slug}`}
                              className="block px-8 py-2 text-sm hover:bg-muted transition-colors"
                              onClick={() => setMenuOpen(false)}
                            >
                              ↳ {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </header>

      {/* Sub-category dropdown - rendered outside header to avoid overflow clipping */}
      {hoveredCat && hoveredSubCats.length > 0 && (
        <div
          className="fixed z-[100] bg-background text-foreground shadow-lg rounded-b-md border-x border-b py-1 min-w-[180px] animate-scale-in"
          style={dropdownStyle}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        >
          {hoveredSubCats.map((sub) => (
            <Link
              key={sub.id}
              to={`/category/${sub.slug}`}
              className="block px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => setHoveredCat(null)}
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default Header;
