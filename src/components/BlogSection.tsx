import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import blog1 from "@/assets/blog/blog-1.jpg";
import blog2 from "@/assets/blog/blog-2.jpg";
import blog3 from "@/assets/blog/blog-3.jpg";

export const blogs = [
  {
    title: "সকালের নাস্তা বা ইফতারে কোন খেজুর বেশি উপযোগী?",
    slug: "best-dates-for-breakfast-iftar",
    excerpt: "খেজুর বহুদিন ধরে সকালের নাস্তা ও ইফতারের একটি গুরুত্বপূর্ণ অংশ। এটি দ্রুত শক্তি...",
    content: `খেজুর বহুদিন ধরে সকালের নাস্তা ও ইফতারের একটি গুরুত্বপূর্ণ অংশ। এটি দ্রুত শক্তি জোগায় এবং শরীরকে পুষ্টি প্রদান করে।

আজওয়া খেজুর সবচেয়ে পুষ্টিকর খেজুরগুলোর মধ্যে একটি। এতে রয়েছে প্রচুর পরিমাণে ফাইবার, পটাসিয়াম এবং প্রাকৃতিক শর্করা। সকালে খালি পেটে আজওয়া খেজুর খেলে শরীরে শক্তি জোগায় এবং হজম শক্তি বাড়ায়।

মাবরুম খেজুর তুলনামূলক নরম এবং মিষ্টি। এটি ইফতারের জন্য বিশেষভাবে উপযোগী কারণ এটি দ্রুত রক্তে শর্করার মাত্রা বাড়িয়ে ক্লান্তি দূর করে।

খেজুর কেনার সময় খেয়াল রাখুন যেন তা খাঁটি এবং রাসায়নিক মুক্ত হয়। Organic Shop-এ আমরা সবসময় ল্যাব টেস্টেড, ১০০% খাঁটি খেজুর সরবরাহ করি।`,
    category: "HEALTH TIPS",
    date: "26 ফেব্রু",
    image: blog1,
  },
  {
    title: "সরিষা ফুলের মধু কেন আপনার দৈনন্দিন খাদ্যাভ্যাসে রাখা উচিত?",
    slug: "mustard-flower-honey-benefits",
    excerpt: "দৈনন্দিন খাদ্যাভ্যাসে আমরা সাধারণত এমন উপাদান খুঁজি, যা শরীরকে প্রাকৃতিকভাবে শক্তি...",
    content: `দৈনন্দিন খাদ্যাভ্যাসে আমরা সাধারণত এমন উপাদান খুঁজি, যা শরীরকে প্রাকৃতিকভাবে শক্তি জোগায়। সরিষা ফুলের মধু এমনই একটি প্রাকৃতিক উপাদান।

সরিষা ফুলের মধুর বিশেষত্ব হলো এটি সম্পূর্ণ প্রাকৃতিক এবং কোনো কৃত্রিম উপাদান ছাড়াই উৎপাদিত হয়। এতে রয়েছে অ্যান্টিঅক্সিডেন্ট, ভিটামিন এবং খনিজ পদার্থ।

প্রতিদিন সকালে এক চামচ সরিষা ফুলের মধু গরম পানিতে মিশিয়ে খেলে রোগ প্রতিরোধ ক্ষমতা বাড়ে, হজম উন্নত হয় এবং ত্বক সুন্দর থাকে।`,
    category: "HEALTH TIPS",
    image: blog2,
    date: "21 ফেব্রু",
  },
  {
    title: "কালিমি খেজুর: প্রাকৃতিক শক্তি ও পুষ্টির নির্ভরযোগ্য উৎস",
    slug: "kalmi-dates-natural-energy",
    excerpt: "খেজুর দীর্ঘদিন ধরে প্রাকৃতিক শক্তির অন্যতম উৎস হিসেবে পরিচিত। তবে সব খেজুর একরকম...",
    content: `খেজুর দীর্ঘদিন ধরে প্রাকৃতিক শক্তির অন্যতম উৎস হিসেবে পরিচিত। তবে সব খেজুর একরকম নয়। কালিমি খেজুর এর মধ্যে বিশেষ একটি জাত।

কালিমি খেজুরে রয়েছে উচ্চমাত্রায় আয়রন, পটাসিয়াম এবং ম্যাগনেসিয়াম। এটি রক্তস্বল্পতা দূর করতে এবং হাড় মজবুত রাখতে সাহায্য করে।

খেলোয়াড় ও ব্যায়ামপ্রেমীদের জন্য কালিমি খেজুর একটি আদর্শ স্ন্যাক্স। ব্যায়ামের আগে ও পরে কালিমি খেজুর খেলে শরীরে দ্রুত শক্তি ফিরে আসে।`,
    category: "GENERAL TIPS",
    image: blog3,
    date: "14 ফেব্রু",
  },
];

const BlogSection = () => {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-center mb-6">নতুন ব্লগ পড়ুন</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogs.map((blog, i) => (
          <Link to={`/blog/${blog.slug}`} key={i}>
            <div className="bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow group cursor-pointer h-full">
              <div className="aspect-video overflow-hidden">
                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary text-primary-foreground text-[10px]">{blog.category}</Badge>
                  <span className="text-xs text-muted-foreground">{blog.date}</span>
                </div>
                <h3 className="font-bold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">{blog.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{blog.excerpt}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default BlogSection;
