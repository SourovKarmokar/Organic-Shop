import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <TopBanner /><Header />
      <main className="container mx-auto px-4 py-10 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">অর্ডার ট্র্যাক করুন</h1>
        <p className="text-muted-foreground mb-6">আপনার অর্ডার আইডি দিয়ে অর্ডারের অবস্থা জানুন</p>
        <div className="space-y-4">
          <Input placeholder="অর্ডার আইডি লিখুন" value={orderId} onChange={(e) => setOrderId(e.target.value)} className="text-center" />
          <Button className="w-full rounded-full" onClick={() => toast.info("ট্র্যাকিং সিস্টেম শীঘ্রই আসছে!")}>ট্র্যাক করুন</Button>
        </div>
      </main>
      <Footer /><WhatsAppButton /><MobileBottomNav />
    </div>
  );
};

export default TrackOrder;
