import Categories from "@/features/home/categories";
import FeaturedProducts from "@/features/home/featured-products";
import HomeHero from "@/features/home/home-hero";
import NewArrivals from "@/features/home/new-arrivals";

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
