import { Phone } from "lucide-react";

const TopBanner = () => {
  return (
    <div className="bg-primary text-primary-foreground py-2 text-sm">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 shrink-0">
          <Phone className="h-3.5 w-3.5" />
          <a href="tel:09647132995" className="font-medium hover:underline">09647132995</a>
        </div>
        <div className="hidden md:block overflow-hidden flex-1 mx-8">
          <p className="animate-marquee whitespace-nowrap text-center font-medium tracking-wide">
            ১০০% খাঁটি ও অর্গানিক পণ্য &nbsp;|&nbsp; ঢাকায় ৭০ টাকায় ডেলিভারি &nbsp;|&nbsp; Cash on Delivery সুবিধা &nbsp;|&nbsp; ১০০০+ সন্তুষ্ট গ্রাহক &nbsp;|&nbsp; অর্ডার করুন 09647132995 &nbsp;|&nbsp; ল্যাব টেস্টেড প্রোডাক্ট
          </p>
        </div>
        <div className="text-xs font-medium shrink-0">
          ফ্রি ডেলিভারি
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
