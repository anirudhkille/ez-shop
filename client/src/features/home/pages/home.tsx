import BestSellers from "../components/bestseller";
import BrandStory from "../components/brand-story";
import CategoriesSection from "../components/categories";
import FeaturedProducts from "../components/featured-products";
import HomeHero from "../components/home-hero";
import Newsletter from "../components/newsletter";
import PromoBanner from "../components/promo-banner";

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
