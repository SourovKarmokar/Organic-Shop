import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";
import banner1 from "@/assets/banners/banner-1.jpg";
import banner2 from "@/assets/banners/banner-2.jpg";
import banner3 from "@/assets/banners/banner-3.jpg";

const slides = [
  { id: 1, title: "১০০% অর্গানিক পণ্য", image: banner1, link: "/categories" },
  { id: 2, title: "খাঁটি মধু সংগ্রহ", image: banner2, link: "/category/organic-honey" },
  { id: 3, title: "ফ্রি ডেলিভারি!", image: banner3, link: "/categories" },
];

const HeroSlider = () => {
  return (
    <Carousel
      opts={{ loop: true, align: "start" }}
      plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
      className="w-full [&_.embla\_\_dots]:hidden"
    >
      <CarouselContent className="-ml-0">
        {slides.map((slide) => (
          <CarouselItem key={slide.id} className="pl-0">
            <Link to={slide.link}>
              <div className="relative rounded-xl overflow-hidden aspect-[16/7] md:aspect-[16/6]">
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover absolute inset-0" />
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 hidden md:flex" />
      <CarouselNext className="right-2 hidden md:flex" />
    </Carousel>
  );
};

export default HeroSlider;
