import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, MapPin, LogOut, ShoppingBag, Edit2, Save } from "lucide-react";

const MyAccountPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ full_name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/login", { replace: true });
        return;
      }
      setUser(session.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        setEditData({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
        });
      }

      // Fetch user orders
      const { data: orderData } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setOrders(orderData || []);
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate("/login", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(editData)
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: "সেভ ব্যর্থ", description: error.message, variant: "destructive" });
      return;
    }
    setProfile({ ...profile, ...editData });
    setEditing(false);
    toast({ title: "প্রোফাইল আপডেট হয়েছে ✅" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "লগআউট হয়েছে" });
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <TopBanner /><Header />
        <main className="container mx-auto px-4 py-20 text-center text-muted-foreground">লোড হচ্ছে...</main>
        <Footer /><MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <TopBanner /><Header />
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">আমার অ্যাকাউন্ট</h1>

        {/* Profile Card */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg">{profile?.full_name || user?.user_metadata?.full_name || "নাম নেই"}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            {!editing ? (
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                <Edit2 className="w-4 h-4 mr-1" /> এডিট
              </Button>
            ) : (
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-1" /> {saving ? "সেভ হচ্ছে..." : "সেভ"}
              </Button>
            )}
          </div>

          {editing ? (
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <Label>নাম</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input value={editData.full_name} onChange={(e) => setEditData({ ...editData, full_name: e.target.value })} className="pl-10" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>ফোন</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className="pl-10" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>ঠিকানা</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input value={editData.address} onChange={(e) => setEditData({ ...editData, address: e.target.value })} className="pl-10" />
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>বাতিল</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{profile?.phone || user?.user_metadata?.phone || "যোগ করা হয়নি"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm sm:col-span-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{profile?.address || "যোগ করা হয়নি"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Orders */}
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">আমার অর্ডার</h2>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>কোনো অর্ডার নেই</p>
              <Link to="/">
                <Button variant="outline" size="sm" className="mt-3 rounded-full">শপিং শুরু করুন</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">#{order.order_number}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("bn-BD")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {order.order_items?.length || 0}টি আইটেম
                    </span>
                    <span className="font-bold text-primary">৳{order.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <Button variant="outline" className="w-full rounded-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> লগআউট
        </Button>
      </main>
      <Footer /><WhatsAppButton /><MobileBottomNav />
    </div>
  );
};

export default MyAccountPage;
