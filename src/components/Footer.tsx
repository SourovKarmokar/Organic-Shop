import { Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerCategories = [
    { name: "সুপার ফুডস", slug: "super-foods" },
    { name: "অর্গানিক মধু", slug: "organic-honey" },
    { name: "মিষ্টি ও দুগ্ধ", slug: "sweeteners-dairy" },
    { name: "অর্গানিক মশলা", slug: "organic-spices" },
  ];

  return (
    <footer className="mt-12">
      {/* Corporate Banner */}
      <div className="bg-muted border-t border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">১০০+ কোম্পানি আমাদের বিশ্বাস করে</h3>
              <p className="text-sm text-muted-foreground mt-1">কর্পোরেট ডিল, কাস্টম প্রাইসিং এবং নির্ভরযোগ্য ডেলিভারি</p>
            </div>
            <a href="tel:09647132995">
              <button className="border-2 border-primary text-primary font-bold px-6 py-2.5 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors">
                যোগাযোগ করুন ☎
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-background border-t">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <h3 className="text-lg font-bold mb-4">🌿 Organic Shop</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                আমরা সরাসরি কৃষকদের কাছ থেকে ১০০% খাঁটি ও অর্গানিক পণ্য সংগ্রহ করে আপনার দোরগোড়ায় পৌঁছে দিই।
              </p>
              <div className="flex gap-3 mt-4">
                <a href="https://wa.me/8801721132995" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[hsl(142,70%,45%)] text-white flex items-center justify-center hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <a href="https://m.me/organicshop" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[hsl(221,70%,50%)] text-white flex items-center justify-center hover:scale-110 transition-transform">
                  <Mail className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> <span>09647132995</span></div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> <span>01721132995 (Whatsapp)</span></div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> <span>info@organicshop.com</span></div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> <span>ঢাকা, বাংলাদেশ</span></div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-lg font-bold mb-4">ক্যাটাগরি</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {footerCategories.map((cat) => (
                  <li key={cat.slug}>
                    <Link to={`/category/${cat.slug}`} className="hover:text-primary transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">গুরুত্বপূর্ণ লিংক</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/track-order" className="hover:text-primary transition-colors">অর্ডার ট্র্যাক</Link></li>
                <li><Link to="/login" className="hover:text-primary transition-colors">লগইন</Link></li>
                <li><Link to="/cart" className="hover:text-primary transition-colors">কার্ট</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4 text-center text-sm">
          © 2026 Organic Shop. All rights reserved. Developed by{" "}
          <a
            href="https://digitalwebars.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Digital Webars
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
