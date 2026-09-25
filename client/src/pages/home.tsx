import { lazy, Suspense } from "react";

import HomeHero from "@/features/home/home-hero";

const CategoriesSection = lazy(() => import("@/features/home/categories"));
const FeaturedProducts = lazy(
  () => import("@/features/home/featured-products")
);
const PromoBanner = lazy(() => import("@/features/home/promo-banner"));
const BestSellers = lazy(() => import("@/features/home/bestseller"));
const BrandStory = lazy(() => import("@/features/home/brand-story"));
const Newsletter = lazy(() => import("@/features/home/newsletter"));

export default function Home() {
  return (
    <>
      <HomeHero />
      <Suspense fallback={null}>
        <CategoriesSection />
        <FeaturedProducts />
        <PromoBanner />
        <BestSellers />
        <BrandStory />
        <Newsletter />
      </Suspense>
    </>
  );
}
