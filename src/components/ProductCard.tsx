import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, CreditCard, Star, Flame } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart, type Product } from "@/context/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  showUrgency?: boolean;
}

const ProductCard = ({ product, showUrgency = false }: ProductCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} কার্টে যোগ হয়েছে!`);
  };

  const handleOrderNow = () => {
    addToCart(product);
    navigate("/cart");
  };

  const isOutOfStock = !product.inStock;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow relative flex flex-col">
      {product.discount > 0 && (
        <Badge className="absolute top-2 left-2 z-10 bg-accent text-accent-foreground">
          -{product.discount}%
        </Badge>
      )}
      {isOutOfStock && (
        <Badge className="absolute top-3 right-3 z-10 bg-red-600 text-white hover:bg-red-600 rounded-full w-14 h-14 flex items-center justify-center text-[10px] leading-tight text-center shadow-lg border-2 border-white">
          স্টক শেষ
        </Badge>
      )}
      <Link to={`/product/${product.slug}`}>
        <div className={`aspect-square overflow-hidden bg-muted ${isOutOfStock ? 'opacity-60' : ''}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== "/placeholder.svg") {
                target.src = "/placeholder.svg";
              }
            }}
          />
        </div>
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <Link to={`/product/${product.slug}`} className="flex-1">
          <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors leading-5">
            {product.name}
          </h3>
        </Link>

        {/* Star Rating */}
        <div className="flex items-center gap-1 mt-1.5 mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`} />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({Number(product.rating).toFixed(1)})</span>
        </div>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-primary font-bold text-lg">৳{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="text-muted-foreground line-through text-sm">
              ৳{product.originalPrice}
            </span>
          )}
          {showUrgency && !isOutOfStock && (
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-orange-600">
              <Flame className="h-3 w-3 text-orange-500 animate-pulse" />
              সীমিত স্টক, দ্রুত কিনুন!
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2 mt-3">
          {isOutOfStock ? (
            <Button variant="outline" className="w-full rounded-full text-xs sm:text-sm text-red-500 border-red-300 cursor-not-allowed" size="sm" disabled>
              স্টক শেষ
            </Button>
          ) : (
            <>
              <Button variant="outline" className="w-full gap-2 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs sm:text-sm" size="sm" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4 shrink-0" />
                <span className="truncate">কার্টে যোগ করুন</span>
              </Button>
              <Button className="w-full gap-2 rounded-full text-xs sm:text-sm" size="sm" onClick={handleOrderNow}>
                <CreditCard className="h-4 w-4 shrink-0" />
                <span className="truncate">অর্ডার করুন</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
