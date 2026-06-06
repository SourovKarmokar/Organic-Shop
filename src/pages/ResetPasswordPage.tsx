import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Lock, CheckCircle } from "lucide-react";

const ResetPasswordPage = () => {
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event from the reset link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setValidSession(true);
        setChecking(false);
      }
    });

    // Also check if already in a session (user clicked link and got redirected)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true);
      }
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6) {
      toast({ title: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে", variant: "destructive" });
      return;
    }
    if (newPass !== confirmPass) {
      toast({ title: "পাসওয়ার্ড মিলছে না", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPass });
    setLoading(false);
    if (error) {
      toast({ title: "ব্যর্থ", description: error.message, variant: "destructive" });
      return;
    }
    setSuccess(true);
  };

  if (checking) {
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
      <main className="container mx-auto px-4 py-10 max-w-md">
        <div className="bg-card border rounded-xl p-8 space-y-4">
          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold">পাসওয়ার্ড পরিবর্তন হয়েছে ✅</h2>
              <p className="text-sm text-muted-foreground">আপনার পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে।</p>
              <Button className="w-full rounded-full" onClick={() => navigate("/my-account")}>
                আমার অ্যাকাউন্টে যান
              </Button>
            </div>
          ) : !validSession ? (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">লিংক অবৈধ বা মেয়াদ শেষ ⚠️</h2>
              <p className="text-sm text-muted-foreground">পাসওয়ার্ড রিসেট লিংকটি সঠিক নয় বা মেয়াদ শেষ হয়ে গেছে। আবার চেষ্টা করুন।</p>
              <Button variant="outline" className="w-full rounded-full" onClick={() => navigate("/login")}>
                লগইন পেজে যান
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-center">নতুন পাসওয়ার্ড সেট করুন 🔐</h2>
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <Label>নতুন পাসওয়ার্ড</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" placeholder="••••••••" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>পাসওয়ার্ড নিশ্চিত করুন</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" placeholder="••••••••" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <Button type="submit" className="w-full rounded-full" disabled={loading}>
                  {loading ? "আপডেট হচ্ছে..." : "পাসওয়ার্ড আপডেট করুন"}
                </Button>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer /><MobileBottomNav />
    </div>
  );
};

export default ResetPasswordPage;
