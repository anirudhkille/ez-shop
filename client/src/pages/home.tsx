import BestSellers from "@/features/home/bestseller";
import BrandStory from "@/features/home/brand-story";
import CategoriesSection from "@/features/home/categories";
import FeaturedProducts from "@/features/home/featured-products";
import HomeHero from "@/features/home/home-hero";
import Newsletter from "@/features/home/newsletter";
import PromoBanner from "@/features/home/promo-banner";

export default function Home() {
  return (
    <>
      <HomeHero />
      <CategoriesSection />
      <FeaturedProducts />
      <PromoBanner />
      <BestSellers />
      <BrandStory />
      <Newsletter />
    </>
  );
}
