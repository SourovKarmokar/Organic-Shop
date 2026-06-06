import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopBanner from "@/components/TopBanner";
import MobileBottomNav from "@/components/MobileBottomNav";
import { blogs } from "@/components/BlogSection";

const BlogDetailPage = () => {
  const { slug } = useParams();
  const blog = blogs.find((b) => b.slug === slug);

  if (!blog) {
    return (
      <div className="min-h-screen bg-background">
        <TopBanner />
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">ব্লগ পাওয়া যায়নি</h1>
          <Link to="/"><Button>হোমে ফিরে যান</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <TopBanner />
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4" /> হোমে ফিরে যান
        </Link>
        <img src={blog.image} alt={blog.title} className="w-full rounded-xl mb-6 aspect-video object-cover" />
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-primary text-primary-foreground text-xs">{blog.category}</Badge>
          <span className="text-sm text-muted-foreground">{blog.date}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">{blog.title}</h1>
        <div className="prose prose-sm max-w-none text-foreground">
          {blog.content.split("\n\n").map((para, i) => (
            <p key={i} className="mb-4 leading-relaxed text-muted-foreground">{para}</p>
          ))}
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default BlogDetailPage;
