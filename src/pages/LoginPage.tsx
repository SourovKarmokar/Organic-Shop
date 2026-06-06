import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, User, Phone, CheckCircle } from "lucide-react";

const LoginPage = () => {
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotInput, setForgotInput] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate("/my-account", { replace: true });
      setCheckingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) navigate("/my-account", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const isPhone = (val: string) => /^01[3-9]\d{8}$/.test(val.trim());

  const resolveEmail = async (identifier: string): Promise<string | null> => {
    const trimmed = identifier.trim();
    if (!isPhone(trimmed)) return trimmed; // assume email
    const { data } = await supabase.rpc("get_email_by_phone", { _phone: trimmed });
    if (!data) {
      toast({ title: "এই ফোন নম্বর দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি", variant: "destructive" });
      return null;
    }
    return data as string;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPass) {
      toast({ title: "ইমেইল/ফোন ও পাসওয়ার্ড দিন", variant: "destructive" });
      return;
    }
    setLoading(true);
    const email = await resolveEmail(loginIdentifier);
    if (!email) { setLoading(false); return; }

    const { error } = await supabase.auth.signInWithPassword({ email, password: loginPass });
    setLoading(false);
    if (error) {
      const msg = error.message.includes("Email not confirmed")
        ? "আপনার ইমেইল ভেরিফাই করা হয়নি। ইমেইলে পাঠানো লিংকে ক্লিক করুন।"
        : error.message.includes("Invalid login")
          ? "ইমেইল/ফোন বা পাসওয়ার্ড ভুল।"
          : error.message;
      toast({ title: "লগইন ব্যর্থ", description: msg, variant: "destructive" });
      return;
    }
    toast({ title: "সফল!", description: "সফলভাবে লগইন হয়েছে" });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput || !forgotInput.includes("@")) {
      toast({ title: "সঠিক ইমেইল দিন", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotInput.trim(), {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);
    if (error) {
      toast({ title: "ব্যর্থ", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "ইমেইল পাঠানো হয়েছে ✉️", description: `${forgotInput} এ পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে` });
    setShowForgot(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPass) {
      toast({ title: "সব তথ্য পূরণ করুন", variant: "destructive" });
      return;
    }
    if (signupPass.length < 6) {
      toast({ title: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPass,
      options: {
        data: { full_name: signupName, phone: signupPhone },
        emailRedirectTo: window.location.origin + "/my-account",
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "রেজিস্ট্রেশন ব্যর্থ", description: error.message, variant: "destructive" });
      return;
    }
    setRegisteredEmail(signupEmail);
    setSignupSuccess(true);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <TopBanner /><Header />
        <main className="container mx-auto px-4 py-20 text-center text-muted-foreground">লোড হচ্ছে...</main>
        <Footer /><MobileBottomNav />
      </div>
    );
  }

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <TopBanner /><Header />
        <main className="container mx-auto px-4 py-10 max-w-md">
          <div className="bg-card border rounded-xl p-8 text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold">ইমেইল ভেরিফাই করুন ✉️</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              <span className="font-semibold text-foreground">{registeredEmail}</span> এ একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে।
            </p>
            <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
              {["আপনার ইমেইল ইনবক্স চেক করুন", "ভেরিফিকেশন লিংকে ক্লিক করুন", "স্বয়ংক্রিয়ভাবে অ্যাকাউন্টে লগইন হয়ে যাবে"].map((t, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">ইমেইল পাননি? স্প্যাম ফোল্ডার চেক করুন।</p>
            <Button variant="outline" className="w-full rounded-full" onClick={() => { setSignupSuccess(false); setSignupName(""); setSignupPhone(""); setSignupEmail(""); setSignupPass(""); }}>
              লগইন পেজে ফিরে যান
            </Button>
          </div>
        </main>
        <Footer /><WhatsAppButton /><MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <TopBanner /><Header />
      <main className="container mx-auto px-4 py-10 max-w-md">
        {showForgot ? (
          <div className="bg-card border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-center">পাসওয়ার্ড রিসেট করুন 🔑</h2>
            <p className="text-sm text-muted-foreground text-center">আপনার রেজিস্টার্ড ইমেইল দিন, আমরা পাসওয়ার্ড রিসেট লিংক পাঠাবো।</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label>ইমেইল</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="email" placeholder="your@email.com" value={forgotInput} onChange={(e) => setForgotInput(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={loading}>
                {loading ? "পাঠানো হচ্ছে..." : "রিসেট লিংক পাঠান"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgot(false)}>
                ← লগইনে ফিরে যান
              </Button>
            </form>
          </div>
        ) : (
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">লগইন</TabsTrigger>
              <TabsTrigger value="signup">রেজিস্ট্রেশন</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>ইমেইল বা ফোন নম্বর</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="your@email.com বা 01XXXXXXXXX" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>পাসওয়ার্ড</Label>
                    <button type="button" className="text-xs text-primary hover:underline" onClick={() => setShowForgot(true)}>
                      পাসওয়ার্ড ভুলে গেছেন?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" autoComplete="current-password" placeholder="••••••••" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <Button type="submit" className="w-full rounded-full" disabled={loading}>
                  {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label>আপনার নাম *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="আপনার পুরো নাম" value={signupName} onChange={(e) => setSignupName(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ইমেইল *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="email" autoComplete="email" placeholder="your@email.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ফোন নম্বর</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="tel" placeholder="01XXXXXXXXX" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>পাসওয়ার্ড * (কমপক্ষে ৬ অক্ষর)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" autoComplete="new-password" placeholder="••••••••" value={signupPass} onChange={(e) => setSignupPass(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <Button type="submit" className="w-full rounded-full" disabled={loading}>
                  {loading ? "রেজিস্ট্রেশন হচ্ছে..." : "রেজিস্ট্রেশন করুন"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  রেজিস্ট্রেশনের পর আপনার ইমেইলে একটি ভেরিফিকেশন লিংক পাঠানো হবে
                </p>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </main>
      <Footer /><WhatsAppButton /><MobileBottomNav />
    </div>
  );
};

export default LoginPage;
