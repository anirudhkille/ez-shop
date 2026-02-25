import { useProducts } from "@/hooks/useProduct";

import ProductsSlider from "../shared/product-slider";

export default function FeaturedProducts() {
  const { data } = useProducts({ isFeatured: true });

  return <ProductsSlider heading="Featured" products={data?.data} />;
}
