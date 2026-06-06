import { Star } from "lucide-react";
import "@/styles/reviews-marquee.css";

const reviews = [
  {
    name: "রহিমা আক্তার",
    rating: 5,
    text: "পণ্যের কোয়ালিটি অনেক ভালো এবং প্যাকেজিং ছিল চমৎকার। ধন্যবাদ Organic Shop!",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    name: "আব্দুল মালেক",
    rating: 5,
    text: "এতো সুন্দর একটি মধু পেয়ে খুশি হয়েছি। ধন্যবাদ Organic Shop কে।",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "তানভীর হাসান",
    rating: 5,
    text: "২৪ ঘন্টার মধ্যে ডেলিভারি পেয়েছি। Best quality & Product is also authentic.",
    avatar: "https://i.pravatar.cc/150?img=15",
  },
  {
    name: "ফাতেমা বেগম",
    rating: 5,
    text: "অনেক দিন ধরে খাঁটি ঘি খুঁজছিলাম, অবশেষে পেলাম! দারুণ টেস্ট।",
    avatar: "https://i.pravatar.cc/150?img=49",
  },
  {
    name: "করিম উদ্দিন",
    rating: 5,
    text: "কালোজিরা তেল অসাধারণ কোয়ালিটি। আবার অর্ডার করবো ইনশাআল্লাহ।",
    avatar: "https://i.pravatar.cc/150?img=57",
  },
  {
    name: "সাবিনা ইয়াসমিন",
    rating: 5,
    text: "বাচ্চাদের জন্য অর্গানিক খাবার পেয়ে অনেক খুশি। Thanks Organic Shop!",
    avatar: "https://i.pravatar.cc/150?img=44",
  },
  {
    name: "মোঃ রাসেল মিয়া",
    rating: 5,
    text: "সুন্দরবনের মধু সত্যিই অসাধারণ। পরিবারের সবাই পছন্দ করেছে।",
    avatar: "https://i.pravatar.cc/150?img=59",
  },
  {
    name: "নাসরিন সুলতানা",
    rating: 5,
    text: "অর্গানিক স্পাইসগুলো রান্নায় দারুণ স্বাদ আনে। বারবার কিনব।",
    avatar: "https://i.pravatar.cc/150?img=45",
  },
];

const ReviewCard = ({ review }: { review: typeof reviews[0] }) => (
  <div className="flex-shrink-0 w-[280px] md:w-[320px]">
    <div className="bg-card border rounded-xl p-6 text-center hover:shadow-md transition-shadow h-full">
      <div className="flex justify-center mb-3">
        <img
          src={review.avatar}
          alt={review.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
        />
      </div>
      <div className="flex justify-center gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, j) => (
          <Star key={j} className={`h-4 w-4 ${j < review.rating ? "fill-accent text-accent" : "text-muted"}`} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{review.text}</p>
      <p className="font-semibold text-sm">{review.name}</p>
    </div>
  </div>
);

const CustomerReviews = () => {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-center mb-2">আমাদের গ্রাহকদের অভিজ্ঞতা</h2>
      <p className="text-center text-muted-foreground mb-6">CUSTOMER REVIEWS</p>
      <div className="overflow-hidden">
        <div className="reviews-marquee">
          {reviews.map((review, i) => (
            <ReviewCard key={`a-${i}`} review={review} />
          ))}
          {reviews.map((review, i) => (
            <ReviewCard key={`b-${i}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
