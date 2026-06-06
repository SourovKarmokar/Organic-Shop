import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Clock,
  CreditCard,
  Loader2,
  Minus,
  Phone,
  Plus,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/context/CartContext";
import { getProductImage } from "@/lib/productImages";
import { publicApi } from "@/lib/publicApi";

type Variant = {
  id: string;
  price: number | null;
  stock_quantity: number | null;
  size_name: string | null;
  size_value: string | null;
};

const useCountdown = () => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem("countdown_end");
    if (saved) {
      const diff = Number(saved) - Date.now();
      if (diff > 0) return diff;
    }
    const end = Date.now() + 4 * 60 * 60 * 1000;
    localStorage.setItem("countdown_end", String(end));
    return 4 * 60 * 60 * 1000;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const saved = Number(localStorage.getItem("countdown_end"));
      const diff = saved - Date.now();
      if (diff <= 0) {
        const end = Date.now() + 4 * 60 * 60 * 1000;
        localStorage.setItem("countdown_end", String(end));
        setTimeLeft(4 * 60 * 60 * 1000);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    hours: Math.floor(timeLeft / (1000 * 60 * 60)),
    minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((timeLeft % (1000 * 60)) / 1000),
  };
};

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { hours, minutes, seconds } = useCountdown();
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await publicApi<{ product: any; variants: Variant[] }>(`/api/public/products/${slug}`);
        setProduct(data.product);
        setVariants(data.variants || []);
        setSelectedVariant(null);
        setActiveImage("");
      } catch (error) {
        console.error(error);
        setProduct(null);
        setVariants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <TopBanner />
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <TopBanner />
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="mb-4 text-2xl font-bold">Product not found in MySQL</h2>
          <Link to="/">
            <Button>Return home</Button>
          </Link>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  const basePrice = Number(product.base_price || 0);
  const salePrice = product.sale_price ? Number(product.sale_price) : null;
  const currentPrice = Number(selectedVariant?.price ?? salePrice ?? basePrice);
  const originalPrice = salePrice && salePrice < basePrice ? basePrice : currentPrice;
  const discount = originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const productImage = getProductImage(product.slug, product.image_url);
  const images = [productImage, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean);

  const cartProduct = {
    id: selectedVariant ? `${product.id}:${selectedVariant.id}` : product.id,
    name: `${product.name}${selectedVariant ? ` (${selectedVariant.size_name || selectedVariant.size_value || "Variant"})` : ""}`,
    slug: product.slug,
    price: currentPrice,
    originalPrice,
    discount,
    image: productImage,
    category: product.category_slug || "",
    rating: 4.8,
    brand: product.brand_name || "Organic Shop",
    code: product.sku || "",
    description: product.description || "",
    inStock: Number(product.stock_quantity || 0) > 0,
  };

  const ensureVariant = () => {
    if (variants.length > 0 && !selectedVariant) {
      toast.error("Please select a size/variant before ordering.");
      return false;
    }
    return true;
  };

  const handleAdd = () => {
    if (!ensureVariant()) return;
    addToCart(cartProduct, qty);
    toast.success(`${product.name} added to cart.`);
  };

  const handleOrder = () => {
    if (!ensureVariant()) return;
    addToCart(cartProduct, qty);
    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <TopBanner />
      <Header />
      <main className="container mx-auto px-4 py-6">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          {product.category_slug && (
            <>
              {" / "}
              <Link to={`/category/${product.category_slug}`} className="hover:text-primary">{product.category_name}</Link>
            </>
          )}
          {" / "}
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="relative">
            {discount > 0 && <Badge className="absolute right-3 top-3 z-10 bg-accent text-base">-{discount}% off</Badge>}
            <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
              <img src={activeImage || productImage} alt={product.name} className="h-full w-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setActiveImage(image)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${
                      (activeImage || productImage) === image ? "border-primary" : "border-border"
                    }`}
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="mb-3 text-2xl font-bold">{product.name}</h1>
            <div className="mb-3 flex items-center gap-3">
              {discount > 0 && <span className="text-lg text-muted-foreground line-through">৳{originalPrice}</span>}
              <span className="text-3xl font-bold">৳{currentPrice}</span>
            </div>

            {variants.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm font-semibold">Select size/variant *</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`rounded-lg border-2 px-4 py-2 text-sm font-medium ${
                        selectedVariant?.id === variant.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {variant.size_name || variant.size_value || "Variant"}
                      {variant.price ? <span className="ml-1">- ৳{variant.price}</span> : null}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <Clock className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-destructive">Limited Time Offer!</p>
                <div className="mt-1 flex gap-2">
                  <span className="rounded bg-destructive px-2 py-0.5 text-sm font-bold text-white">{String(hours).padStart(2, "0")}h</span>
                  <span className="rounded bg-destructive px-2 py-0.5 text-sm font-bold text-white">{String(minutes).padStart(2, "0")}m</span>
                  <span className="rounded bg-destructive px-2 py-0.5 text-sm font-bold text-white">{String(seconds).padStart(2, "0")}s</span>
                </div>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <div className="flex text-accent">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className={`h-4 w-4 ${index < 4 ? "fill-current" : ""}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">4.8/5</span>
            </div>

            <div className="mb-5 flex items-center gap-3">
              <div className="flex items-center rounded-md border-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none border-r" onClick={() => setQty(Math.max(1, qty - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-lg font-medium">{qty}</span>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none border-l" onClick={() => setQty(qty + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mb-4 flex gap-3">
              <Button className="h-12 flex-1 gap-2 rounded-md text-base" onClick={handleAdd}>
                <ShoppingCart className="h-5 w-5" />
                Add to cart
              </Button>
              <Button className="h-12 flex-1 gap-2 rounded-md bg-foreground text-base text-background hover:bg-foreground/90" onClick={handleOrder}>
                <CreditCard className="h-5 w-5" />
                Order now
              </Button>
            </div>

            <div className="mb-5 flex gap-3">
              <a href="tel:09647132995" className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-primary py-2.5 font-medium text-primary">
                <Phone className="h-4 w-4" />
                09647132995
              </a>
            </div>

            <div className="overflow-hidden rounded-xl border-2 border-primary/30">
              <div className="flex items-center justify-center gap-2 bg-primary/10 p-3 font-semibold">
                <Truck className="h-5 w-5 text-primary" />
                Delivery charge
              </div>
              <div className="divide-y">
                <div className="flex items-center justify-between p-3">
                  <span>Inside Dhaka</span>
                  <span className="font-bold text-primary">৳70</span>
                </div>
                <div className="flex items-center justify-between p-3">
                  <span>Outside Dhaka</span>
                  <span className="font-bold text-primary">৳150</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="description" className="mt-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="policy">Order Policy</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4 rounded-lg border p-4">
            <h3 className="mb-3 text-lg font-bold">Details</h3>
            <p>{product.description || "No description added yet."}</p>
          </TabsContent>
          <TabsContent value="policy" className="mt-4 rounded-lg border p-4">
            <ul className="list-inside list-disc space-y-2 text-sm">
              <li>Delivery within 2-3 days after order confirmation.</li>
              <li>Cash on Delivery available.</li>
              <li>Inside Dhaka ৳70, outside Dhaka ৳150 delivery charge.</li>
            </ul>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomNav />
    </div>
  );
};

export default ProductDetail;
