import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { publicApi } from "@/lib/publicApi";

const defaultShipping = [
  { area_name: "Inside Dhaka", charge: 70 },
  { area_name: "Outside Dhaka", charge: 150 },
];

const uniqueShipping = (charges: typeof defaultShipping) =>
  Array.from(new Map(charges.map((charge) => [charge.area_name, charge])).values());

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [area, setArea] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [shippingCharges, setShippingCharges] = useState(defaultShipping);

  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const data = await publicApi<typeof defaultShipping>("/api/public/shipping");
        setShippingCharges(data.length ? uniqueShipping(data) : defaultShipping);
      } catch {
        setShippingCharges(defaultShipping);
      }
    };

    fetchShipping();
  }, []);

  const selectedShipping = shippingCharges.find((charge) => charge.area_name === area);
  const deliveryCharge = Number(selectedShipping?.charge || 0);

  const handleOrder = async () => {
    if (!name || !phone || !address || !area) {
      toast.error("Please fill all required information.");
      return;
    }

    setLoading(true);
    try {
      const order = await publicApi<{ order_number: string }>("/api/public/orders", {
        method: "POST",
        body: JSON.stringify({
          customer: { name, phone, address },
          area,
          payment_method: paymentMethod,
          subtotal: totalPrice,
          delivery_charge: deliveryCharge,
          items: items.map((item) => ({
            product_id: String(item.product.id).includes(":") ? String(item.product.id).split(":")[0] : item.product.id,
            product_name: item.product.name,
            product_image: item.product.image || null,
            price: item.product.price,
            quantity: item.quantity,
          })),
        }),
      });

      clearCart();
      navigate("/thank-you", { state: { orderNumber: order.order_number } });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <TopBanner />
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="mb-2 text-2xl font-bold">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">Add some products first.</p>
          <Link to="/">
            <Button className="rounded-full">Continue shopping</Button>
          </Link>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <TopBanner />
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 rounded-lg border border-accent bg-accent/10 p-3 text-center text-sm">
          Fill your delivery information and click order. Need help? Call{" "}
          <a href="tel:09647132995" className="font-bold text-primary hover:underline">09647132995</a>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="font-semibold">Name *</Label>
                <Input className="mt-1" value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div>
                <Label className="font-semibold">Phone *</Label>
                <Input className="mt-1" value={phone} onChange={(event) => setPhone(event.target.value)} />
              </div>
              <div>
                <Label className="font-semibold">Address *</Label>
                <Input className="mt-1" value={address} onChange={(event) => setAddress(event.target.value)} />
              </div>
              <div>
                <Label className="font-semibold">Delivery Area *</Label>
                <RadioGroup value={area} onValueChange={setArea} className="mt-2 space-y-2">
                  {shippingCharges.map((charge) => (
                    <label
                      key={charge.area_name}
                      htmlFor={`area-${charge.area_name}`}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-colors ${
                        area === charge.area_name ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={charge.area_name} id={`area-${charge.area_name}`} />
                      <span className="flex-1 font-medium">{charge.area_name}</span>
                      <span className="font-bold text-primary">৳{charge.charge}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <Label className="font-semibold">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-2 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod">Cash On Delivery</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="bkash" id="bkash" />
                    <Label htmlFor="bkash">Bkash</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nagad" id="nagad" />
                    <Label htmlFor="nagad">Nagad</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button className="h-12 w-full rounded-md text-base" onClick={handleOrder} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ordering...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </div>
          </div>

          <div>
            <h2 className="rounded-t-lg bg-primary p-3 text-xl font-bold text-primary-foreground">Order Summary</h2>
            <div className="overflow-hidden rounded-b-lg border">
              <div className="grid grid-cols-[44px_1fr_auto_auto] gap-2 border-b bg-muted p-3 text-sm font-semibold">
                <span>Del</span>
                <span>Product</span>
                <span>Qty</span>
                <span className="text-right">Price</span>
              </div>
              {items.map((item) => (
                <div key={item.product.id} className="grid grid-cols-[44px_1fr_auto_auto] items-center gap-2 border-b p-3 text-sm">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex min-w-0 items-center gap-2">
                    <img src={item.product.image} alt={item.product.name} className="h-10 w-10 rounded bg-muted object-cover" />
                    <span className="line-clamp-1">{item.product.name}</span>
                  </div>
                  <div className="flex items-center rounded border">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="text-right font-medium">৳{item.product.price * item.quantity}</span>
                </div>
              ))}
              <div className="space-y-2 p-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">৳{totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span className="font-medium">৳{deliveryCharge}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">৳{totalPrice + deliveryCharge}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomNav />
    </div>
  );
};

export default CartPage;
