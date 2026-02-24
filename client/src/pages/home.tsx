import Categories from "@/components/home/categories";
import FeaturedProducts from "@/components/home/featured-products";
import HomeHero from "@/components/home/home-hero";
import NewArrivals from "@/components/home/new-arrivals";

export default function Home() {
  return (
    <>
      <HomeHero />
      <FeaturedProducts />
      <Categories />
      <NewArrivals />
    </>
  );
}
