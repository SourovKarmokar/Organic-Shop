import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Phone } from "lucide-react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

const ThankYouPage = () => {
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <TopBanner />
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto text-center">
          <CheckCircle className="h-20 w-20 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-3">অর্ডার সফল হয়েছে! 🎉</h1>
          <p className="text-muted-foreground mb-2">আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।</p>
          <p className="text-muted-foreground mb-6">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6">
            <p className="font-semibold mb-2">যেকোনো প্রশ্নে কল করুন</p>
            <a href="tel:09647132995" className="inline-flex items-center gap-2 text-primary font-bold text-lg hover:underline">
              <Phone className="h-5 w-5" /> 09647132995
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button className="rounded-full px-8">আরও শপিং করুন</Button>
            </Link>
            <Link to="/track-order">
              <Button variant="outline" className="rounded-full px-8">অর্ডার ট্র্যাক করুন</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default ThankYouPage;
