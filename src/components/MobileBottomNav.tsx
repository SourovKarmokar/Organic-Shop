import { Home, ShoppingCart, User, Grid3X3, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Grid3X3, label: "ক্যাটাগরি", path: "/categories" },
  { icon: MessageCircle, label: "WhatsApp", path: "https://wa.me/8801721132995", external: true },
  { icon: Home, label: "হোম", path: "/" },
  { icon: ShoppingCart, label: "কার্ট", path: "/cart" },
  { icon: User, label: "লগইন", path: "/login" },
];

const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.external) {
            return (
              <a
                key={item.label}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-0.5 text-muted-foreground text-xs"
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </a>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 text-xs ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
